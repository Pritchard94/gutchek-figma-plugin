import { PLUGIN_KEY, createStyles, createVariables, ctx, flush, loadFonts, removePrevious } from './core/ctx';
import { buildLibrary } from './components/library';
import { buildFoundations } from './pages/foundations';
import { buildCover, buildGuidelines } from './pages/guidelines';
import { buildFlow } from './pages/flow';
import { layoutHorizontally, newPage } from './pages/common';
import { buildScreens } from './screens';
import { buildWebsite } from './web';
import { buildWebApp } from './webapp';

const WORK_PAGE = 'Gutchek · generating';
const LOG_PAGE = 'Gutchek · Generator log';
let stage = 'Starting';

async function onPage<T>(name: string, label: string, fn: (page: PageNode) => T): Promise<T> {
  stage = label;
  figma.notify('Gutchek · ' + label, { timeout: 1500 });
  const page = newPage(name);
  await figma.setCurrentPageAsync(page);
  const out = fn(page);
  await flush();
  return out;
}

async function cleanUp(work: PageNode) {
  for (const p of figma.root.children.slice()) {
    if (p === work) continue;
    if (p.getPluginData(PLUGIN_KEY) === '1' || p.name === WORK_PAGE || p.name === LOG_PAGE || /^Libra · (generating|Generator log)$/.test(p.name)) {
      p.remove();
      continue;
    }
    await p.loadAsync();
    if (p.children.length === 0) p.remove();
  }
  await removePrevious();
}

async function run() {
  stage = 'Loading fonts';
  await loadFonts();

  const work = figma.createPage();
  work.name = WORK_PAGE;
  work.setPluginData(PLUGIN_KEY, '1');
  await figma.setCurrentPageAsync(work);

  stage = 'Removing the previous run';
  await cleanUp(work);

  stage = 'Creating variables and styles';
  await createVariables();
  createStyles();

  const components = await onPage('Components', 'Building components', (page) => {
    const roots = buildLibrary(page, ctx.modes);
    layoutHorizontally(roots, 200);
    return page;
  });
  const foundations = await onPage('Foundations', 'Building foundations', buildFoundations);
  const guidelines = await onPage('Brand Guidelines', 'Writing brand guidelines', buildGuidelines);
  const light = await onPage('Screens · Light', 'Designing light screens', (page) => buildScreens('light', page));
  const dark = await onPage('Screens · Dark', 'Designing dark screens', (page) => buildScreens('dark', page));
  const flow = await onPage('User Flow', 'Mapping the user flow', (page) => buildFlow(light.frames, page));
  const website = await onPage('Website', 'Designing the website', (page) => {
    buildWebsite(page, light.frames);
    return page;
  });
  const webapp = await onPage('Web App', 'Designing the web app', (page) => {
    buildWebApp(page);
    return page;
  });
  const cover = await onPage('Cover', 'Making the cover', (page) =>
    buildCover([light.frames.home, light.frames.report, light.frames.match].filter(Boolean), page),
  );

  stage = 'Arranging pages';
  const order = [cover, guidelines, foundations, components, light.page, dark.page, webapp, flow, website];
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

  if (ctx.warnings.length) {
    await writeLog('Generated with notes', ctx.warnings);
    await figma.setCurrentPageAsync(cover);
  }
  const modeNote = ctx.modes ? 'Light and Dark modes in one variable collection.' : 'Dark tokens in a separate collection (plan limit).';
  const notes = ctx.warnings.length ? ' ' + ctx.warnings.length + ' note(s) on the "' + LOG_PAGE + '" page.' : '';
  figma.closePlugin('Gutchek design file ready. ' + modeNote + notes);
}

/** Writes a plain text log into the file so problems can be diagnosed from a share link. */
async function writeLog(title: string, lines: string[]) {
  try {
    const page = figma.createPage();
    page.name = LOG_PAGE;
    page.setPluginData(PLUGIN_KEY, '1');
    await figma.setCurrentPageAsync(page);
    const inter = { family: 'Inter', style: 'Regular' };
    await figma.loadFontAsync(inter);
    const t = figma.createText();
    t.fontName = inter;
    t.fontSize = 16;
    t.characters = [title, 'Stage: ' + stage, ''].concat(lines).join('\n');
    t.resize(1200, t.height);
    t.textAutoResize = 'HEIGHT';
    page.appendChild(t);
  } catch (_) {
    /* logging must never mask the original problem */
  }
}

run().catch(async (e) => {
  const message = e && e.message ? e.message : String(e);
  console.error('[Gutchek] generation failed at "' + stage + '"', e);
  await writeLog('Gutchek generator failed', ['Error: ' + message, '', String((e && e.stack) || '')].concat(ctx.warnings));
  figma.closePlugin('Gutchek generator failed at "' + stage + '": ' + message);
});
