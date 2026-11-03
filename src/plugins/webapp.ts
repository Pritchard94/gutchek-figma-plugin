import { Theme } from '../tokens';
import { flush } from '../core/ctx';
import { Relinker, collectFrames, ensurePage, findSection, putSection, setStarts } from '../core/sections';
import { startPlugin } from '../core/panel';
import { WEBAPP_COLUMN_GAP, WEBAPP_GROUPS, WEBAPP_PAGE, WEBAPP_SECTION_GAP, buildWebAppGroup, resolveWebAppLinks, webAppKeys, webAppStarts, webAppTitle } from '../webapp';
import { appLinks } from '../webapp/shell';
import { attachSystem, loaded, picked, plural, sectionStatus } from './shared';

const THEMES: Theme[] = ['light', 'dark'];

/** Frames of one theme keyed by builder id, without the ':dark' suffix dark frames are tagged with. */
async function framesOf(page: PageNode, theme: Theme): Promise<Record<string, FrameNode>> {
  const found = await collectFrames(page, webAppKeys(theme));
  const out: Record<string, FrameNode> = {};
  for (const k of Object.keys(found)) if (!found[k].removed) out[k.replace(/:dark$/, '')] = found[k];
  return out;
}

/** Light sections run down the left; dark ones sit in a column to their right, aligned with any already there. */
function darkColumnX(page: PageNode, fresh: SceneNode): number {
  const dark = WEBAPP_GROUPS.map((g) => findSection(page, webAppTitle(g, 'dark'), fresh)).filter((s): s is SceneNode => !!s);
  if (dark.length) return Math.min(...dark.map((s) => s.x));
  const light = WEBAPP_GROUPS.map((g) => findSection(page, webAppTitle(g, 'light'), fresh)).filter((s): s is SceneNode => !!s);
  const right = light.length ? Math.max(...light.map((s) => s.x + s.width)) : fresh.width;
  return right + WEBAPP_COLUMN_GAP;
}

startPlugin({
  name: 'Gutchek Web App',
  intro: 'The signed-in web app at desktop and mobile web sizes, in light and dark. Only the groups you tick are rebuilt, in place; everything else on the page stays as it is.',

  async survey() {
    const page = await loaded(WEBAPP_PAGE);
    return THEMES.map((theme) => ({
      title: 'Web App · ' + (theme === 'dark' ? 'Dark' : 'Light'),
      items: WEBAPP_GROUPS.map((g, i) =>
        Object.assign({ id: theme + ':' + i, label: g.title.replace(/^Web app · /, ''), hint: plural(g.pages.length, 'page') }, sectionStatus(page, webAppTitle(g, theme))),
      ),
    }));
  },

  async run(ids, step) {
    await step('Connecting to the design system');
    await attachSystem();
    const page = await ensurePage(WEBAPP_PAGE, '#E9EBF0');
    const relinker = new Relinker();
    const all: Record<Theme, Record<string, FrameNode>> = { light: await framesOf(page, 'light'), dark: await framesOf(page, 'dark') };
    const done: string[] = [];
    for (const theme of THEMES) {
      const indexes = picked(ids, theme);
      if (!indexes.length) continue;
      appLinks.length = 0;
      const fresh: Record<string, FrameNode> = {};
      for (const i of indexes) {
        const g = WEBAPP_GROUPS[i];
        if (!g) continue;
        await step(webAppTitle(g, theme));
        const { section, frames } = buildWebAppGroup(page, g, theme);
        const x = theme === 'dark' ? darkColumnX(page, section) : 0;
        putSection(page, section, webAppTitle(g, theme), { flow: 'down', gap: WEBAPP_SECTION_GAP, x }, relinker);
        Object.assign(fresh, frames);
        relinker.learn(Object.keys(frames).map((k) => frames[k]));
      }
      Object.assign(all[theme], fresh);
      resolveWebAppLinks(all[theme]);
      done.push(plural(Object.keys(fresh).length, theme + ' page'));
    }
    await flush();
    await relinker.apply(page);
    setStarts(page, webAppStarts(all.light, all.dark));
    return done.length ? 'Rebuilt ' + done.join(' and ') : 'Nothing to do';
  },
});
