import { Token } from '../tokens';
import { applyThemeMode, ctx } from '../core/ctx';
import { Kid, abs, add, box, circle, col, gradient, icon, row, text } from '../core/ui';
import { appIcon, glyph, lockup } from '../brand';
import { use } from '../components/library';
import { doodleLayer } from '../components/doodles';
import { blob, illoChat, illoMeter, illoNotes, illoRooms } from '../components/illustrations';
import { phone } from '../web/kit';
import { Fields, Item, Theme } from './brief';
import { screenFor } from './system';

export interface Env {
  screens: Map<string, FrameNode>;
  notes: string[];
  /** Screen names a brief asked for that are not on the Screens · Light page. */
  missing: string[];
}

interface Look {
  bg: Paint[] | Token;
  fg: Token;
  sub: Token;
  subOpacity: number;
}

const DEFAULT_VISUALS = ['meter', 'chat', 'notes', 'phone: Home', 'rooms'];

function look(theme: Theme): Look {
  if (theme === 'brand') return { bg: [gradient([['#7556E3', 0], ['#4A30B0', 0.55], ['#2C1E66', 1]], 135)], fg: 'text/on-solid', sub: 'text/on-solid', subOpacity: 0.82 };
  return { bg: 'bg/canvas', fg: 'text/primary', sub: 'text/secondary', subOpacity: 1 };
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function headlineText(str: string, size: number, l: Look, w: number, align: 'left' | 'center' = 'left', lines = 4): TextNode {
  return text(str, { family: 'display', weight: 800, size: Math.round(size), line: Math.round(size * 1.08), tracking: size > 40 ? -2.5 : -1.5 }, l.fg, { w: Math.round(w), align, maxLines: lines });
}

function bodyText(str: string, size: number, l: Look, w: number, align: 'left' | 'center' = 'left', lines = 3): TextNode {
  return text(str, { family: 'ui', weight: 500, size: Math.round(size), line: Math.round(size * 1.4), tracking: -0.5 }, l.sub, { w: Math.round(w), align, maxLines: lines, opacity: l.subOpacity });
}

function ctaPill(label: string, size: number): FrameNode {
  const s = Math.round(size);
  return row({ name: 'CTA', pad: [Math.round(s * 0.62), Math.round(s * 1.25)], gap: Math.round(s * 0.45), radius: 999, fill: 'action/solid', cross: 'center' }, [
    text(label, { family: 'ui', weight: 700, size: s, line: Math.round(s * 1.2), tracking: -0.5 }, 'action/on'),
    icon('arrow-right', Math.round(s * 1.1), 'action/on'),
  ]);
}

function eyebrowPill(label: string, size: number, theme: Theme): FrameNode {
  const s = Math.round(size);
  return row({ name: 'Eyebrow', pad: [Math.round(s * 0.45), Math.round(s * 0.9)], gap: Math.round(s * 0.4), radius: 999, fill: theme === 'brand' ? 'action/solid' : 'brand/subtle' }, [
    icon('sparkle', Math.round(s * 1.1), theme === 'brand' ? 'action/on' : 'brand/fg'),
    text(label.toUpperCase(), { family: 'ui', weight: 700, size: s, line: Math.round(s * 1.2), tracking: 6 }, theme === 'brand' ? 'action/on' : 'brand/fg'),
  ]);
}

function logoFor(theme: Theme, height: number): FrameNode {
  return theme === 'brand' ? lockup(Math.round(height), 'text/on-solid', 'text/on-solid') : lockup(Math.round(height));
}

/** The doodle grid is drawn at phone scale and enlarged, so large frames keep the same density with far fewer layers. */
function doodles(w: number, h: number, token: Token, opacity: number, seed: number): FrameNode {
  const k = Math.max(1, Math.min(w, h) / 360);
  const layer = doodleLayer(Math.ceil(w / k), Math.ceil(h / k), token, opacity, seed);
  if (k > 1) layer.rescale(k);
  return layer;
}

function decorate(f: FrameNode, w: number, h: number, theme: Theme, seed: number) {
  const m = Math.max(w, h);
  if (theme === 'brand') {
    const c1 = circle(Math.round(m * 0.7), 'text/on-solid', 'Glow');
    c1.opacity = 0.07;
    add(f, abs(c1, Math.round(w * 0.55), Math.round(-m * 0.25)));
    const c2 = circle(Math.round(m * 0.5), 'action/solid', 'Glow');
    c2.opacity = 0.12;
    c2.effects = [{ type: 'LAYER_BLUR', blurType: 'NORMAL', radius: Math.round(m * 0.12), visible: true } as Effect];
    add(f, abs(c2, Math.round(-m * 0.15), Math.round(h - m * 0.3)));
    add(f, abs(doodles(w, h, 'text/on-solid', 0.06, seed), 0, 0));
  } else {
    add(f, abs(blob(Math.round(m * 0.7), 'brand/border', theme === 'dark' ? 0.35 : 0.7), Math.round(-m * 0.2), Math.round(-m * 0.25)));
    add(f, abs(blob(Math.round(m * 0.5), 'positive/subtle', theme === 'dark' ? 0.4 : 0.9), Math.round(w - m * 0.3), Math.round(h - m * 0.35)));
    add(f, abs(doodles(w, h, 'brand/fg', 0.045, seed), 0, 0));
  }
}

// ---------------------------------------------------------------- visuals

function card(kids: Kid[]): FrameNode {
  return col({ name: 'Card', pad: [28, 28, 24, 28], gap: 14, radius: 32, fill: 'bg/raised', stroke: 'border/default', shadow: 'e3', cross: 'center' }, kids);
}

function buildVisual(spec: string, env: Env, theme: Theme): SceneNode | null {
  const s = spec.trim();
  const low = s.toLowerCase();
  const arg = s.indexOf(':') >= 0 ? s.slice(s.indexOf(':') + 1).trim() : '';
  if (/^none\b/.test(low)) return null;
  if (/^meter\b/.test(low)) return illoMeter();
  if (/^chat\b/.test(low)) return illoChat();
  if (/^notes?\b/.test(low)) return illoNotes();
  if (/^rooms?\b|^gists?\b/.test(low)) return illoRooms();
  if (/^logo\b/.test(low)) {
    const tile = appIcon(260);
    tile.effects = [{ type: 'DROP_SHADOW', color: { r: 0.05, g: 0.03, b: 0.2, a: theme === 'brand' ? 0.45 : 0.25 }, offset: { x: 0, y: 30 }, radius: 70, spread: 0, visible: true, blendMode: 'NORMAL' }];
    return tile;
  }
  if (/^gauge\b|^dial\b/.test(low)) {
    return card([
      text('Mostly positive, minor concerns', { family: 'display', weight: 700, size: 22, line: 28, tracking: -1 }, 'text/primary'),
      use('GutMeter', { Tilt: 'Positive' }),
      use('ConfidenceBadge', { Level: 'High' }),
    ]);
  }
  if (/^icon\b/.test(low)) {
    const name = (arg || 'flag').toLowerCase();
    const caution = name === 'flag' || name === 'alert-triangle';
    const positive = name === 'check-circle';
    const tone: Token = caution ? 'caution/fg' : positive ? 'positive/fg' : 'brand/fg';
    return col({ name: 'Icon · ' + name, w: 300, h: 300, radius: 80, fill: 'bg/raised', shadow: 'e3', main: 'center', cross: 'center', gap: 18 }, [
      icon(name, 132, tone),
      caution || positive ? text(caution ? 'Red flag' : 'Green flag', { family: 'ui', weight: 700, size: 30, line: 36 }, tone) : null,
    ]);
  }
  if (/^poll\b/.test(low)) {
    const options = (arg || 'Yes, Maybe, No').split(/\s*[,/]\s*/).filter(Boolean);
    return col({ name: 'Poll sticker', w: 760, pad: 36, gap: 18, radius: 44, fill: 'bg/raised', shadow: 'e3' }, options.map((o) =>
      box({ name: 'Option · ' + o, dir: 'h', w: 'fill', h: 104, radius: 52, fill: 'bg/subtle', main: 'center', cross: 'center' }, [text(o, { family: 'display', weight: 700, size: 40, line: 48, tracking: -1 }, 'brand/fg')]),
    ));
  }
  if (/^ask\b/.test(low)) {
    return col({ name: 'Question box', w: 760, pad: [36, 36, 40, 36], gap: 22, radius: 44, fill: 'bg/raised', shadow: 'e3', cross: 'center' }, [
      text(arg || 'Ask us anything', { family: 'display', weight: 700, size: 38, line: 48, tracking: -1 }, 'text/primary', { w: 'fill', align: 'center' }),
      box({ name: 'Answer', dir: 'h', w: 'fill', h: 104, radius: 28, fill: 'bg/subtle', main: 'center', cross: 'center' }, [text('Tap to answer', { family: 'ui', weight: 500, size: 32, line: 40 }, 'text/tertiary')]),
    ]);
  }
  if (/^quote\b/.test(low)) {
    return col({ name: 'Quote', w: 760, pad: 48, gap: 20, radius: 40, fill: 'bg/raised', shadow: 'e3' }, [
      icon('quote', 48, 'brand/fg'),
      text(arg || 'It showed me the posts, and the good stuff too. I went on the date feeling calm.', { family: 'display', weight: 700, size: 40, line: 50, tracking: -1.5 }, 'text/primary', { w: 'fill' }),
    ]);
  }
  if (/^phones\b/.test(low)) {
    const names = arg.split(',').map((x) => x.trim()).filter(Boolean);
    const frames = names.map((n) => screenFor(env.screens, n)).filter((f): f is FrameNode => !!f);
    if (frames.length < 2) {
      for (const n of names) if (!screenFor(env.screens, n)) env.missing.push(n);
      return illoMeter();
    }
    const g = box({ name: 'Phones', dir: 'none', w: 417 * 2 - 120, h: 876 + 80 });
    add(g, abs(phone(frames[0], 1, 'Phone · ' + names[0]), 0, 80));
    add(g, abs(phone(frames[1], 1, 'Phone · ' + names[1]), 417 - 120, 0));
    return g;
  }
  if (/^(phone|screen)\b/.test(low)) {
    const f = screenFor(env.screens, arg || 'Home');
    if (!f) {
      env.missing.push(arg || 'Home');
      return illoMeter();
    }
    return phone(f, 1, 'Phone · ' + (arg || 'Home'));
  }
  env.notes.push('Visual "' + s + '" is not one of meter, chat, notes, rooms, gauge, logo, quote, icon, poll, ask, phone or phones; the Gut Meter illustration was used.');
  return illoMeter();
}

function fit(node: SceneNode, maxW: number, maxH: number, maxScale = 3): SceneNode {
  const n = node as FrameNode;
  const s = Math.min(maxW / n.width, maxH / n.height, maxScale);
  if (s > 0 && Math.abs(s - 1) > 0.001) n.rescale(s);
  return n;
}

// ---------------------------------------------------------------- layouts

interface Copy {
  headline: string;
  body?: string;
  cta?: string;
  link?: string;
  eyebrow?: string;
  visual?: string;
  theme: Theme;
}

const off = (v?: string) => (v && /^(none|no|off|-)$/i.test(v.trim()) ? '' : v);

function resolve(item: Item, d: Fields, index: number): Copy {
  const f = item.format;
  const visual = item.visual || d.visual || DEFAULT_VISUALS[index % DEFAULT_VISUALS.length];
  return {
    headline: item.headline || d.headline || 'Trust your gut. Then check it.',
    body: f.body === false ? undefined : off(item.body !== undefined ? item.body : f.slides ? undefined : d.body) || undefined,
    cta: f.cta === false ? undefined : (item.cta !== undefined ? off(item.cta) : off(d.cta) === undefined ? 'Join the waitlist' : off(d.cta)) || undefined,
    link: item.link || d.link,
    eyebrow: off(item.eyebrow !== undefined ? item.eyebrow : d.eyebrow) || undefined,
    visual,
    theme: item.theme || d.theme || 'brand',
  };
}

function stacked(f: FrameNode, w: number, h: number, c: Copy, item: Item, env: Env) {
  const l = look(c.theme);
  const narrow = w / h < 0.4;
  const small = Math.min(w, h) < 400;
  const pad = Math.round(clamp(Math.min(w, h) * 0.075, 12, 110));
  const safe = item.format.safe || [0, 0];
  const aw = w - pad * 2;
  const store = item.format.group === 'App stores';
  const center = store || w / h < 0.75;
  let y = pad + safe[0];
  const logoH = clamp(w * (narrow ? 0.1 : 0.052), 14, 64);
  const logo = logoFor(c.theme, logoH);
  add(f, abs(logo, center ? Math.round((w - logo.width) / 2) : pad, y));
  y += logo.height + Math.round(clamp(h * 0.035, 8, 72));
  if (c.eyebrow && !small) {
    const e = eyebrowPill(c.eyebrow, clamp(w * 0.022, 10, 30), c.theme);
    add(f, abs(e, center ? Math.round((w - e.width) / 2) : pad, y));
    y += e.height + Math.round(clamp(h * 0.02, 6, 40));
  }
  const hs = store ? w * 0.082 : narrow ? w * 0.135 : small ? w * 0.085 : w / h < 0.75 ? w * 0.088 : w * 0.078;
  const head = headlineText(c.headline, hs, l, aw, center ? 'center' : 'left', store ? 3 : 4);
  add(f, abs(head, pad, y));
  y += head.height + Math.round(clamp(h * 0.018, 6, 40));
  if (c.body && !narrow) {
    const b = bodyText(c.body, clamp(hs * 0.4, 11, 44), l, aw, center ? 'center' : 'left', small ? 2 : 3);
    add(f, abs(b, pad, y));
    y += b.height;
  }
  y += Math.round(clamp(h * 0.035, 8, 80));

  let bottom = h - pad - safe[1];
  if (c.cta) {
    const pill = ctaPill(c.cta, clamp(w * (narrow ? 0.075 : 0.032), 11, 40));
    const px = center ? Math.round((w - pill.width) / 2) : pad;
    add(f, abs(pill, px, Math.round(bottom - pill.height)));
    if (c.link && !small && !center) {
      const t = text(c.link, { family: 'ui', weight: 600, size: Math.round(clamp(w * 0.022, 11, 30)), line: Math.round(clamp(w * 0.022, 11, 30) * 1.3) }, l.sub, { opacity: l.subOpacity });
      add(f, abs(t, px + pill.width + Math.round(pad * 0.4), Math.round(bottom - pill.height / 2 - t.height / 2)));
    }
    bottom -= pill.height + Math.round(clamp(h * 0.035, 8, 64));
  }
  const vis = c.visual ? buildVisual(c.visual, env, c.theme) : null;
  if (!vis) return;
  if (store) {
    fit(vis, w * 0.8, 99999);
    add(f, abs(vis, Math.round((w - vis.width) / 2), Math.round(y)));
    return;
  }
  const vh = bottom - y;
  if (vh < 40) {
    vis.remove();
    return;
  }
  fit(vis, aw, vh);
  add(f, abs(vis, Math.round((w - vis.width) / 2), Math.round(y + (vh - vis.height) / 2)));
}

function sideBySide(f: FrameNode, w: number, h: number, c: Copy, item: Item, env: Env) {
  const l = look(c.theme);
  const pad = Math.round(clamp(h * 0.1, 16, 96));
  const split = c.visual && !/^none/i.test(c.visual) ? 0.56 : 1;
  const tw = Math.round(w * split - pad * 1.5);
  const logo = logoFor(c.theme, clamp(h * 0.075, 16, 56));
  add(f, abs(logo, pad, pad));
  const block = col({ name: 'Copy', w: tw, gap: Math.round(clamp(h * 0.035, 6, 32)) }, [
    c.eyebrow ? eyebrowPill(c.eyebrow, clamp(h * 0.03, 10, 24), c.theme) : null,
    headlineText(c.headline, clamp(h * (c.body ? 0.115 : 0.15), 18, 120), l, tw, 'left', 3),
    c.body ? bodyText(c.body, clamp(h * 0.044, 11, 34), l, tw, 'left', 3) : null,
  ]);
  const ctaNode = c.cta ? ctaPill(c.cta, clamp(h * 0.04, 11, 30)) : c.link ? text(c.link, { family: 'ui', weight: 700, size: Math.round(clamp(h * 0.042, 11, 30)), line: Math.round(clamp(h * 0.042, 11, 30) * 1.3) }, l.fg) : null;
  const top = pad + logo.height;
  const ctaH = ctaNode ? ctaNode.height + Math.round(h * 0.06) : 0;
  const by = Math.round(top + (h - top - pad - ctaH - block.height) / 2);
  add(f, abs(block, pad, Math.max(top + 8, by)));
  if (ctaNode) add(f, abs(ctaNode, pad, Math.round(Math.max(top + 8, by) + block.height + h * 0.06)));
  if (split < 1 && c.visual) {
    const vis = buildVisual(c.visual, env, c.theme);
    if (!vis) return;
    const vw = w * (1 - split) - pad * 0.5;
    const vh = h - pad * 2;
    fit(vis, vw, vh);
    add(f, abs(vis, Math.round(w * split + (vw - vis.width) / 2), Math.round((h - vis.height) / 2)));
  }
}

function strip(f: FrameNode, w: number, h: number, c: Copy) {
  const l = look(c.theme);
  const tiny = h <= 60;
  const pad = Math.round(clamp(h * 0.2, 8, 48));
  const hs = tiny ? 15 : h <= 100 ? 20 : clamp(h * 0.17, 20, 48);
  const brand = tiny ? glyph(Math.round(h * 0.56), c.theme === 'brand' ? 'text/on-solid' : 'brand/fg') : logoFor(c.theme, clamp(h * 0.26, 16, 40));
  const bs = clamp(hs * 0.45, 12, 22);
  const copy = col({ name: 'Copy', w: 'fill', gap: Math.round(hs * 0.25) }, [
    text(c.headline, { family: 'display', weight: 800, size: Math.round(hs), line: Math.round(hs * 1.1), tracking: -1.5 }, l.fg, { w: 'fill', maxLines: 2 }),
    c.body && h > 200 ? text(c.body, { family: 'ui', weight: 500, size: Math.round(bs), line: Math.round(bs * 1.4) }, l.sub, { w: 'fill', maxLines: 2, opacity: l.subOpacity }) : null,
  ]);
  const r = row({ name: 'Strip', w, h, pad: [0, pad], gap: Math.round(clamp(h * 0.25, 10, 40)), cross: 'center' }, [brand, copy, c.cta ? ctaPill(c.cta, tiny ? 11 : clamp(h * 0.12, 12, 24)) : null]);
  add(f, abs(r, 0, 0));
}

export function compose(item: Item, defaults: Fields, index: number, env: Env): FrameNode {
  const { w, h } = item.format;
  const c = resolve(item, defaults, index);
  const before = ctx.theme;
  ctx.theme = c.theme === 'dark' ? 'dark' : 'light';
  const f = box({ name: item.label + ' \u00b7 ' + w + '\u00d7' + h, dir: 'none', w, h, fill: look(c.theme).bg, clip: true });
  if (c.theme === 'dark') applyThemeMode(f, 'dark');
  decorate(f, w, h, c.theme, 7 + index * 13);
  const r = w / h;
  if (r >= 3) strip(f, w, h, c);
  else if (r >= 1.5) sideBySide(f, w, h, c, item, env);
  else stacked(f, w, h, c, item, env);
  f.exportSettings = [{ format: 'PNG', suffix: '', constraint: { type: 'SCALE', value: 1 } }];
  ctx.theme = before;
  return f;
}
