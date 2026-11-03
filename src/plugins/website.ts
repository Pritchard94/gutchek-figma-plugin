import { flush, warn } from '../core/ctx';
import { Relinker, collectFrames, ensurePage, putSection, setStarts } from '../core/sections';
import { startPlugin } from '../core/panel';
import { SECTION_SPACING, WEBSITE_SECTIONS, buildWebsiteSection, resolveWebsiteLinks, websiteKeys, websiteStarts } from '../web';
import { webLinks } from '../web/kit';
import { WAITLIST_SECTIONS, buildWaitlistSection, resolveWaitlistLinks, waitlistKeys, waitlistLinks, waitlistStarts } from '../web/waitlist';
import { SCREEN_PAGES, screenKeys } from '../screens';
import { attachSystem, loaded, picked, plural, sectionStatus } from './shared';

const WEBSITE_PAGE = 'Website';
const WAITLIST_PAGE = 'Waitlist';

interface Section {
  title: string;
}

/** Rebuilds the chosen sections of one page in place and keeps links between new and untouched pages working. */
async function rebuild<S extends Section>(
  pageName: string,
  sections: S[],
  indexes: number[],
  keys: Array<[string, string]>,
  build: (page: PageNode, s: S) => { section: SceneNode; frames: Record<string, FrameNode> },
  resolve: (frames: Record<string, FrameNode>) => void,
  starts: (frames: Record<string, FrameNode>) => Array<{ name: string; node?: FrameNode }>,
  step: (label: string) => Promise<void>,
): Promise<number> {
  const page = await ensurePage(pageName, '#E9EBF0');
  const existing = await collectFrames(page, keys);
  const fresh: Record<string, FrameNode> = {};
  const relinker = new Relinker();
  let count = 0;
  for (const i of indexes) {
    const s = sections[i];
    if (!s) continue;
    await step(s.title);
    const { section, frames } = build(page, s);
    putSection(page, section, s.title, { flow: 'down', gap: SECTION_SPACING }, relinker);
    Object.assign(fresh, frames);
    relinker.learn(Object.keys(frames).map((k) => frames[k]));
    count += Object.keys(frames).length;
  }
  const all: Record<string, FrameNode> = {};
  for (const k of Object.keys(existing)) if (!existing[k].removed) all[k] = existing[k];
  Object.assign(all, fresh);
  resolve(all);
  await flush();
  await relinker.apply(page);
  setStarts(page, starts(all));
  return count;
}

startPlugin({
  name: 'Gutchek Website & Waitlist',
  intro: 'The marketing website (desktop, mobile and the staff admin dashboard) and the waitlist page. Only the sections you tick are rebuilt, in place.',

  async survey() {
    const website = await loaded(WEBSITE_PAGE);
    const waitlist = await loaded(WAITLIST_PAGE);
    return [
      {
        title: WEBSITE_PAGE,
        note: 'Phone mockups use the app screens on Screens · Light, so run Gutchek Mobile first.',
        items: WEBSITE_SECTIONS.map((s, i) => Object.assign({ id: 'web:' + i, label: s.title, hint: plural(s.pages.length, 'page') }, sectionStatus(website, s.title))),
      },
      {
        title: WAITLIST_PAGE,
        items: WAITLIST_SECTIONS.map((s, i) => Object.assign({ id: 'wait:' + i, label: s.title, hint: plural(s.pages.length, 'page') }, sectionStatus(waitlist, s.title))),
      },
    ];
  },

  async run(ids, step) {
    await step('Connecting to the design system');
    await attachSystem();
    const done: string[] = [];
    const web = picked(ids, 'web');
    if (web.length) {
      const screens = await collectFrames(await loaded(SCREEN_PAGES.light), screenKeys('light'));
      if (!Object.keys(screens).length) warn('No app screens were found on "Screens · Light", so phone mockups on the website are empty. Run Gutchek Mobile, then rebuild the website sections.');
      webLinks.length = 0;
      const n = await rebuild(WEBSITE_PAGE, WEBSITE_SECTIONS, web, websiteKeys(), (page, s) => buildWebsiteSection(page, s, screens), resolveWebsiteLinks, websiteStarts, step);
      done.push(plural(n, 'website page'));
    }
    const wait = picked(ids, 'wait');
    if (wait.length) {
      waitlistLinks.length = 0;
      const n = await rebuild(WAITLIST_PAGE, WAITLIST_SECTIONS, wait, waitlistKeys(), buildWaitlistSection, resolveWaitlistLinks, waitlistStarts, step);
      done.push(plural(n, 'waitlist page'));
    }
    return done.length ? 'Rebuilt ' + done.join(' and ') : 'Nothing to do';
  },
});
