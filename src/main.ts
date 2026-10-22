import { PLUGIN_KEY, createStyles, createVariables, ctx, flush, loadFonts, removePrevious } from './core/ctx';
import { buildLibrary } from './components/library';
import { buildFoundations } from './pages/foundations';
import { buildCover, buildGuidelines } from './pages/guidelines';
import { buildFlow } from './pages/flow';
import { layoutHorizontally, newPage } from './pages/common';
import { buildScreens } from './screens';

async function step<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
  figma.notify('Libra · ' + label, { timeout: 1500 });
  const out = await fn();
  await flush();
  return out;
}

async function run() {
  await loadFonts();

  const work = figma.createPage();
  work.name = 'Libra · generating';
  await figma.setCurrentPageAsync(work);

  for (const p of figma.root.children.slice()) {
    if (p === work) continue;
    if (p.getPluginData(PLUGIN_KEY) === '1') {
      p.remove();
      continue;
    }
    await p.loadAsync();
    if (p.children.length === 0) p.remove();
  }
  await removePrevious();

  await step('Creating variables and styles', async () => {
    await createVariables();
    createStyles();
  });

  const components = await step('Building components', () => {
    const page = newPage('Components');
    const roots = buildLibrary(page, ctx.modes);
    layoutHorizontally(roots, 200);
    return page;
  });
  const foundations = await step('Building foundations', buildFoundations);
  const guidelines = await step('Writing brand guidelines', buildGuidelines);
  const light = await step('Designing light screens', () => buildScreens('light'));
  const dark = await step('Designing dark screens', () => buildScreens('dark'));
  const flow = await step('Mapping the user flow', () => buildFlow(light.frames));
  const cover = await step('Making the cover', () => buildCover([light.frames.home, light.frames.report, light.frames.match].filter(Boolean)));

  const order = [cover, guidelines, foundations, components, light.page, dark.page, flow];
  order.forEach((p, i) => figma.root.insertChild(i, p));

  await figma.setCurrentPageAsync(cover);
  work.remove();
  const coverFrame = cover.children[0];
  if (coverFrame) {
    figma.viewport.scrollAndZoomIntoView([coverFrame]);
    try {
      await figma.setFileThumbnailNodeAsync(coverFrame as FrameNode);
    } catch (_) {
      /* thumbnail is optional */
    }
  }

  const modeNote = ctx.modes ? 'Light and Dark modes in one variable collection.' : 'Dark tokens in a separate collection (plan limit).';
  const warnings = ctx.warnings.length ? ' Notes: ' + ctx.warnings.join(' ') : '';
  console.log('[Libra] warnings', ctx.warnings);
  figma.closePlugin('Libra design file ready. ' + modeNote + warnings);
}

run().catch((e) => {
  console.error('[Libra] generation failed', e);
  figma.closePlugin('Libra generator failed: ' + (e && e.message ? e.message : String(e)));
});
