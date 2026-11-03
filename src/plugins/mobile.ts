import { Theme } from '../tokens';
import { flush } from '../core/ctx';
import { Relinker, collectFrames, ensurePage, putSection, setStarts } from '../core/sections';
import { Group, startPlugin } from '../core/panel';
import { GROUPS, SCREEN_BACKGROUND, SCREEN_PAGES, SCREEN_SECTION_GAP, buildScreenGroup, resolveScreenLinks, screenKeys } from '../screens';
import { links } from '../screens/kit';
import { buildFlow } from '../pages/flow';
import { attachSystem, loaded, picked, plural, sectionStatus } from './shared';

const FLOW_PAGE = 'User Flow';
const FLOW_KEY = 'User flow';
const THEMES: Theme[] = ['light', 'dark'];

async function buildTheme(theme: Theme, indexes: number[], step: (label: string) => Promise<void>): Promise<number> {
  const page = await ensurePage(SCREEN_PAGES[theme], SCREEN_BACKGROUND[theme]);
  const existing = await collectFrames(page, screenKeys(theme));
  const fresh: Record<string, FrameNode> = {};
  const relinker = new Relinker();
  links.length = 0;
  let count = 0;
  for (const i of indexes) {
    const g = GROUPS[i];
    if (!g) continue;
    await step(SCREEN_PAGES[theme] + ' · ' + g.title);
    const { section, frames } = buildScreenGroup(theme, g, page);
    putSection(page, section, g.title, { flow: 'down', gap: SCREEN_SECTION_GAP }, relinker);
    Object.assign(fresh, frames);
    relinker.learn(Object.keys(frames).map((k) => frames[k]));
    count += Object.keys(frames).length;
  }
  const all: Record<string, FrameNode> = {};
  for (const k of Object.keys(existing)) if (!existing[k].removed) all[k] = existing[k];
  Object.assign(all, fresh);
  resolveScreenLinks(all);
  await flush();
  await relinker.apply(page);
  setStarts(page, [{ name: theme === 'dark' ? 'Main flow · Dark' : 'Main flow', node: all.welcome }]);
  return count;
}

startPlugin({
  name: 'Gutchek Mobile',
  intro: 'The iOS app screens in light and dark, and the user flow map. Only the flow groups you tick are rebuilt, in place; everything else on these pages stays as it is.',

  async survey() {
    const out: Group[] = [];
    for (const theme of THEMES) {
      const page = await loaded(SCREEN_PAGES[theme]);
      out.push({
        title: SCREEN_PAGES[theme],
        note: theme === 'dark' ? 'The same screens with the Dark variable mode.' : undefined,
        items: GROUPS.map((g, i) => Object.assign({ id: theme + ':' + i, label: g.title, hint: plural(g.screens.length, 'screen') }, sectionStatus(page, g.title))),
      });
    }
    const flow = await loaded(FLOW_PAGE);
    out.push({
      title: FLOW_PAGE,
      items: [Object.assign({ id: 'flow', label: 'User flow map', hint: 'Lanes of light screens from sign-in to report, rooms and notes. Rebuild it after changing light screens.' }, sectionStatus(flow, FLOW_KEY))],
    });
    return out;
  },

  async run(ids, step) {
    await step('Connecting to the design system');
    await attachSystem();
    const done: string[] = [];
    for (const theme of THEMES) {
      const indexes = picked(ids, theme);
      if (!indexes.length) continue;
      const n = await buildTheme(theme, indexes, step);
      done.push(plural(n, (theme === 'dark' ? 'dark' : 'light') + ' screen'));
    }
    if (ids.indexOf('flow') !== -1) {
      await step('User flow');
      const light = await collectFrames(await loaded(SCREEN_PAGES.light), screenKeys('light'));
      const page = await ensurePage(FLOW_PAGE);
      putSection(page, buildFlow(light, page), FLOW_KEY, { flow: 'down', gap: 200 });
      done.push('the user flow');
    }
    return done.length ? 'Rebuilt ' + done.join(', ') : 'Nothing to do';
  },
});
