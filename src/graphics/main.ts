import { ctx, flush } from '../core/ctx';
import { col, hexPaint, iconComps, text } from '../core/ui';
import { Brief, SAMPLE_BRIEF, parseBrief } from './brief';
import { GROUP_ORDER } from './formats';
import { Env, compose } from './compose';
import { attachDesignSystem, findScreens } from './system';
import { setWallpaperHolder } from '../components/doodles';

const PAGE = 'Graphic Design';
const KEY = 'gutchek-graphics';
const GAP = 120;
const PAD = 120;

async function targetPage(): Promise<PageNode> {
  let page = figma.root.children.filter((p) => p.name === PAGE)[0];
  if (!page) {
    page = figma.createPage();
    page.name = PAGE;
  }
  page.setPluginData(KEY, '1');
  await figma.setCurrentPageAsync(page);
  for (const c of page.children.slice()) c.remove();
  page.backgrounds = [hexPaint('#E9EBF0')];
  return page;
}

function section(page: PageNode, title: string, frames: FrameNode[], y: number): number {
  const tallest = frames.reduce((m, f) => Math.max(m, f.height), 0);
  const width = frames.reduce((w, f) => w + f.width, 0) + GAP * Math.max(0, frames.length - 1) + PAD * 2;
  const s = figma.createSection();
  s.name = title;
  s.resizeWithoutConstraints(width, tallest + PAD * 2 + 60);
  s.fills = [hexPaint('#FFFFFF')];
  page.appendChild(s);
  s.x = 0;
  s.y = y;
  let x = PAD;
  for (const f of frames) {
    const label = text(f.name, 'smallStrong', 'text/secondary');
    s.appendChild(label);
    label.x = x;
    label.y = PAD - 8;
    s.appendChild(f);
    f.x = x;
    f.y = PAD + 32;
    x += f.width + GAP;
  }
  return y + s.height + 160;
}

function summary(brief: Brief, count: number, notes: string[]): FrameNode {
  ctx.theme = 'light';
  const line = (k: string, v?: string) => (v ? text(k + ': ' + v, 'body', 'text/secondary', { w: 'fill' }) : null);
  return col({ name: 'Brief summary', w: 1080, pad: 48, gap: 14, radius: 32, fill: 'bg/surface', stroke: 'border/default' }, [
    text('Graphic Design \u00b7 ' + brief.campaign, { family: 'display', weight: 800, size: 40, line: 48, tracking: -2 }, 'text/primary', { w: 'fill' }),
    text(count + ' graphics generated from your brief. Edit the brief and run the plugin again to regenerate this page. Every frame has a PNG export setting.', 'body', 'text/secondary', { w: 'fill' }),
    line('Headline', brief.defaults.headline),
    line('Body', brief.defaults.body),
    line('CTA', brief.defaults.cta),
    line('Link', brief.defaults.link),
    line('Theme', brief.defaults.theme),
    ...notes.map((n) => text('\u2022 ' + n, 'small', 'warning/fg', { w: 'fill' })),
  ]);
}

async function generate(source: string) {
  const brief = parseBrief(source);
  const page = await targetPage();
  for (const [k, c] of Array.from(iconComps.entries())) if (c.removed) iconComps.delete(k);
  let holder: FrameNode | null = null;
  const sysNotes = await attachDesignSystem(() => {
    holder = figma.createFrame();
    holder.name = 'Icons used by the graphics';
    holder.fills = [];
    holder.visible = false;
    page.appendChild(holder);
    return holder;
  });
  const wallpapers = figma.createFrame();
  wallpapers.name = 'Wallpaper components used by the graphics';
  wallpapers.fills = [];
  wallpapers.clipsContent = false;
  page.appendChild(wallpapers);
  wallpapers.x = -12000;
  wallpapers.y = 0;
  setWallpaperHolder(wallpapers);
  const env: Env = { screens: await findScreens(), notes: [], missing: [] };
  const groups = new Map<string, FrameNode[]>();
  brief.items.forEach((item, i) => {
    try {
      const f = compose(item, brief.defaults, i, env);
      const list = groups.get(item.format.group) || [];
      list.push(f);
      groups.set(item.format.group, list);
    } catch (e) {
      env.notes.push(item.label + ' failed: ' + String(e && (e as Error).message ? (e as Error).message : e));
    }
  });
  await flush();
  if (env.missing.length) {
    const names = env.missing.filter((n, i) => env.missing.indexOf(n) === i);
    env.notes.push(
      (env.screens.size ? 'These screens were not found on Screens · Light, so illustrations were used: ' : 'Phone mockups use the Screens · Light page from Gutchek Mobile, which is not in this file, so illustrations were used for: ') + names.join(', ') + '.',
    );
  }
  const notes = brief.notes.concat(sysNotes, env.notes, ctx.warnings.splice(0));
  const unique = notes.filter((n, i) => notes.indexOf(n) === i);
  const count = Array.from(groups.values()).reduce((a, l) => a + l.length, 0);
  const head = summary(brief, count, unique);
  page.appendChild(head);
  head.x = 0;
  head.y = 0;
  let y = head.height + 160;
  for (const g of GROUP_ORDER) {
    const frames = groups.get(g);
    if (frames && frames.length) y = section(page, g, frames, y);
  }
  if (holder) {
    (holder as FrameNode).x = -2000;
    (holder as FrameNode).y = 0;
  }
  await flush();
  figma.viewport.scrollAndZoomIntoView(page.children.filter((n) => n.visible));
  return { count, notes: unique, campaign: brief.campaign };
}

figma.skipInvisibleInstanceChildren = true;
figma.showUI(__html__, { width: 460, height: 640, themeColors: true });
figma.ui.postMessage({ type: 'sample', text: SAMPLE_BRIEF });
figma.ui.onmessage = async (msg: { type: string; text?: string }) => {
  if (msg.type === 'close') {
    figma.closePlugin();
    return;
  }
  if (msg.type !== 'generate') return;
  try {
    figma.ui.postMessage({ type: 'status', text: 'Designing graphics…' });
    const res = await generate(msg.text || '');
    figma.notify('Gutchek · ' + res.count + ' graphics on the "' + PAGE + '" page');
    figma.ui.postMessage({ type: 'done', count: res.count, notes: res.notes, campaign: res.campaign });
  } catch (e) {
    const message = e && (e as Error).message ? (e as Error).message : String(e);
    figma.ui.postMessage({ type: 'error', text: message });
  }
};
