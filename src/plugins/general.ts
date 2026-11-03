import { ctx, hasTokens, missingTokenCount, syncStyles, syncVariables, warn } from '../core/ctx';
import { collectFrames, ensurePage, findPage, putAll, putSection } from '../core/sections';
import { Item, startPlugin } from '../core/panel';
import { addMissingComponents, attachLibrary, buildLibrary, ensureWallpaperHolder, rebuildLibrary } from '../components/library';
import { buildFoundations } from '../pages/foundations';
import { buildCover, buildGuidelines } from '../pages/guidelines';
import { SCREEN_PAGES, screenKeys } from '../screens';
import { WEBAPP_PAGE, webAppKeys } from '../webapp';
import { COMPONENTS_PAGE, loaded, plural } from './shared';

const PAGES = { foundations: 'Foundations', guidelines: 'Brand Guidelines', cover: 'Cover' };
/** Pages the old all-in-one generator left behind. They only ever held its progress and logs. */
const LEFTOVER = /^(Gutchek|Libra) · (generating|Generator log)$/;

async function pageStatus(name: string): Promise<{ status: string; needed: boolean }> {
  const page = await loaded(name);
  const there = !!page && page.children.length > 0;
  return { status: there ? 'In file' : 'Missing', needed: !there };
}

async function componentsReady(): Promise<PageNode | null> {
  const page = findPage(COMPONENTS_PAGE);
  const lib = await attachLibrary(page);
  if (!page || !lib.exists) return null;
  ensureWallpaperHolder(page);
  return page;
}

startPlugin({
  name: 'Gutchek General',
  intro: 'The design system and brand: variables and styles, the component library, foundations, brand guidelines and the cover. Run this first. Only the parts you tick are touched.',

  async survey() {
    const tokens = await hasTokens();
    const missing = tokens ? await missingTokenCount() : 0;
    const lib = await attachLibrary(await loaded(COMPONENTS_PAGE));
    const toAdd = lib.missingComponents + lib.missingIcons;
    const system: Item[] = [
      {
        id: 'tokens',
        label: 'Variables and styles',
        status: !tokens ? 'Missing' : missing ? missing + ' missing' : 'In file',
        needed: !tokens || missing > 0,
        hint: 'Adds anything missing and rewrites values from the code. Existing variables and styles keep their ids, so nothing comes unbound.',
      },
      {
        id: 'components',
        label: 'Component library',
        status: !lib.exists ? 'Missing' : toAdd ? toAdd + ' to add' : 'In file',
        needed: !lib.exists || toAdd > 0,
        hint: lib.exists ? 'Adds components, variants and icons that are new in the code. Existing ones are not changed.' : 'Builds every component and icon on the Components page.',
      },
    ];
    if (lib.exists) {
      system.push({
        id: 'rebuild',
        label: 'Rebuild every component from code',
        status: 'Optional',
        needed: false,
        hint: 'Use after changing component designs in code. Every instance in the file is switched to the new version, keeping its overrides.',
      });
    }
    return [
      { title: 'Design system', note: 'Mobile, Web App and Website & Waitlist all build from these.', items: system },
      {
        title: 'Brand pages',
        items: [
          Object.assign({ id: 'foundations', label: PAGES.foundations, hint: 'Colour, type, spacing, radius and elevation boards.' }, await pageStatus(PAGES.foundations)),
          Object.assign({ id: 'guidelines', label: PAGES.guidelines, hint: 'Nine brand guideline boards.' }, await pageStatus(PAGES.guidelines)),
          Object.assign({ id: 'cover', label: PAGES.cover, hint: 'Uses the Home and Report screens and the web app report if they are in the file. Also sets the file thumbnail.' }, await pageStatus(PAGES.cover)),
        ],
      },
    ];
  },

  async run(ids, step) {
    const want = (id: string) => ids.indexOf(id) !== -1;
    const done: string[] = [];

    for (const p of figma.root.children.slice()) if (LEFTOVER.test(p.name) && figma.root.children.length > 1 && p !== figma.currentPage) p.remove();

    await step('Variables and styles');
    const vars = await syncVariables(want('tokens'));
    const styles = await syncStyles(want('tokens'));
    const created = vars.created + styles.created;
    const updated = vars.updated + styles.updated;
    if (want('tokens')) done.push([created ? 'created ' + plural(created, 'token') : '', updated ? 'updated ' + plural(updated, 'token') : ''].filter(Boolean).join(' and ') || 'tokens are up to date');
    else if (created) warn(plural(created, 'missing variable or style') + ' added so the pages stay bound.');

    let library: PageNode | null = null;
    if (want('rebuild') && (await componentsReady())) {
      await step('Rebuilding components');
      library = await ensurePage(COMPONENTS_PAGE);
      const res = await rebuildLibrary(library);
      ensureWallpaperHolder(library);
      done.push('rebuilt the component library (' + plural(res.swapped, 'instance') + ' updated)');
      if (res.failed) warn(plural(res.failed, 'instance') + ' could not be switched to the new components and still use the old ones.');
    } else if (want('components') || want('rebuild')) {
      await step('Component library');
      library = await ensurePage(COMPONENTS_PAGE);
      const lib = await attachLibrary(library);
      if (!lib.exists) {
        putAll(library, buildLibrary(library, ctx.modes), { flow: 'right', gap: 200 });
        ensureWallpaperHolder(library);
        done.push('built the component library');
      } else {
        ensureWallpaperHolder(library);
        const n = addMissingComponents(library);
        done.push(n ? 'added ' + plural(n, 'component or icon') : 'the component library was already complete');
      }
    } else {
      library = await componentsReady();
    }
    if (!library && want('guidelines')) warn('There is no component library yet, so the brand guidelines use plain drawings instead of instances. Tick "Component library" too.');

    if (want('foundations')) {
      await step('Foundations');
      const page = await ensurePage(PAGES.foundations);
      putAll(page, buildFoundations(page), { flow: 'right', gap: 160 });
      done.push('foundations');
    }
    if (want('guidelines')) {
      await step('Brand guidelines');
      const page = await ensurePage(PAGES.guidelines);
      putAll(page, buildGuidelines(page), { flow: 'right', gap: 160 });
      done.push('brand guidelines');
    }
    if (want('cover')) {
      await step('Cover');
      const screens = await collectFrames(await loaded(SCREEN_PAGES.light), screenKeys('light'));
      const web = await collectFrames(await loaded(WEBAPP_PAGE), webAppKeys('light'));
      const page = await ensurePage(PAGES.cover);
      const cover = buildCover([screens.home, screens.report].filter(Boolean), page, web.wReport || web.wHome);
      putSection(page, cover, 'Cover', { flow: 'down', gap: 200 });
      figma.viewport.scrollAndZoomIntoView([cover]);
      try {
        await figma.setFileThumbnailNodeAsync(cover);
      } catch (_) {
        /* thumbnail is optional */
      }
      if (!screens.home) warn('The cover has no phone screens because Screens · Light is missing. Run Gutchek Mobile, then rebuild the cover.');
      done.push('the cover');
    }
    if (!done.length) return 'Nothing to do';
    const text = done.join(', ');
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
});
