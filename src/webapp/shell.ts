import { Token } from '../tokens';
import { Kid, Tone, abs, add, avatar, box, col, divider, fill, icon, pill, rect, row, text, toneTokens } from '../core/ui';
import { lockup } from '../brand';
import { use } from '../components/library';
import { user } from '../screens/data';

export const APP_W = 1440;
export const APP_H = 1024;
export const SIDEBAR_W = 248;

// ---------------------------------------------------------------- links

export const appLinks: Array<[SceneNode, string]> = [];

export function alink<T extends SceneNode>(node: T, target: string): T {
  appLinks.push([node, target]);
  return node;
}

// ---------------------------------------------------------------- chrome

const NAV: Array<[string, string, string, string?]> = [
  ['home', 'Home', 'wHome'],
  ['bookmark', 'Saved', 'wSaved'],
  ['message', 'Analyse a chat', 'wAnalyse'],
  ['messages', 'Rooms', 'wRooms', '15'],
  ['shield', 'Safety', 'wSafety'],
  ['settings', 'Settings', 'wSettings'],
];

export function sidebar(active: string): FrameNode {
  const item = ([iconName, label, id, badge]: (typeof NAV)[number]) => {
    const on = id === active;
    return alink(
      row({ name: label, w: 'fill', gap: 12, pad: [10, 12], radius: 10, fill: on ? 'brand/subtle' : null }, [
        icon(iconName, 20, on ? 'brand/fg' : 'text/secondary'),
        text(label, on ? 'smallStrong' : 'small', on ? 'brand/on-subtle' : 'text/secondary', { w: 'fill' }),
        badge ? box({ name: 'Badge', dir: 'h', h: 20, pad: [0, 7], radius: 10, fill: 'brand/solid', cross: 'center' }, [text(badge, { family: 'ui', weight: 700, size: 11, line: 14 }, 'text/on-solid')]) : null,
      ]),
      id,
    );
  };
  return col({ name: 'Sidebar', w: SIDEBAR_W, h: APP_H, pad: [24, 16, 20, 16], gap: 20, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Brand', pad: [0, 8] }, [alink(lockup(28), 'wHome')]),
    alink(fill(use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'New Libra' }, { show: ['icon'], icons: { icon: 'plus' } })), 'wSearch'),
    col({ name: 'Nav', w: 'fill', gap: 2 }, NAV.map(item)),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    alink(
      col({ name: 'Plan', w: 'fill', gap: 8, pad: 14, radius: 12, fill: 'bg/subtle' }, [
        row({ name: 'Head', gap: 6, w: 'fill' }, [icon('star', 16, 'brand/fg'), text('Libra Plus', 'smallStrong', 'text/primary', { w: 'fill' }), text('Manage', 'label', 'brand/fg')]),
        box({ name: 'Track', dir: 'h', w: 'fill', h: 6, radius: 3, fill: 'bg/muted' }, [rect(80, 6, 'brand/solid', 3, 'Bar')]),
        text('3 of 5 reports left · 1 free chat analysis', 'caption', 'text/tertiary'),
      ]),
      'wBilling',
    ),
    alink(
      row({ name: 'Me', w: 'fill', gap: 10, pad: [6, 6] }, [
        avatar(user.initials, 36, 'brand'),
        col({ name: 'Text', gap: 0, w: 'fill' }, [text(user.name, 'smallStrong', 'text/primary'), text('Verified · Lagos', 'caption', 'text/tertiary')]),
        icon('chevron-down', 16, 'text/tertiary'),
      ]),
      'wSettings',
    ),
  ]);
}

export function topbar(title: string, crumb?: string, actions: Kid[] = []): FrameNode {
  const bell = box({ name: 'Notifications', dir: 'none', w: 40, h: 40 });
  add(bell, abs(box({ name: 'Button', dir: 'h', w: 40, h: 40, radius: 20, fill: 'bg/surface', stroke: 'border/default', main: 'center', cross: 'center' }, [icon('bell', 18, 'text/primary')]), 0, 0));
  add(bell, abs(box({ name: 'Dot', dir: 'h', w: 10, h: 10, radius: 5, fill: 'caution/solid', stroke: 'bg/surface', strokeW: 2, strokeAlign: 'OUTSIDE' }), 27, 4));
  return row({ name: 'Top bar', w: 'fill', h: 76, pad: [0, 32], gap: 16, cross: 'center', fill: 'bg/canvas' }, [
    col({ name: 'Title', gap: 2, w: 'fill' }, [crumb ? text(crumb, 'caption', 'text/tertiary') : null, text(title, 'h3', 'text/primary')]),
    ...actions,
    box({ name: 'Search', dir: 'h', w: 300, h: 40, pad: [0, 14], gap: 8, radius: 10, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
      icon('search', 18, 'text/tertiary'),
      text('Search people, reports, rooms', 'small', 'text/tertiary', { w: 'fill' }),
      box({ name: 'Key', dir: 'h', pad: [1, 6], radius: 4, stroke: 'border/strong' }, [text('⌘K', 'caption', 'text/tertiary')]),
    ]),
    alink(bell, 'wNotifications'),
  ]);
}

export interface AppSpec {
  name: string;
  active: string;
  title?: string;
  crumb?: string;
  actions?: Kid[];
  rail?: Kid[];
  railW?: number;
  tall?: boolean;
  bleed?: boolean;
  gap?: number;
}

/** Web app frame: sidebar, top bar, content and an optional right rail. */
export function appFrame(spec: AppSpec, content: Kid[]): FrameNode {
  const main = spec.bleed
    ? row({ name: 'Workspace', w: 'fill', h: APP_H, cross: 'start', clip: true }, content)
    : col({ name: 'Main', w: 'fill', gap: 0, clip: true }, [
        topbar(spec.title || '', spec.crumb, spec.actions || []),
        row({ name: 'Body', w: 'fill', pad: [8, 32, 40, 32], gap: 24, cross: 'start' }, [
          col({ name: 'Content', w: 'fill', gap: spec.gap === undefined ? 24 : spec.gap }, content),
          spec.rail ? col({ name: 'Rail', w: spec.railW || 360, gap: 20 }, spec.rail) : null,
        ]),
      ]);
  const side = sidebar(spec.active);
  const f = row({ name: spec.name, w: APP_W, fill: 'bg/canvas', clip: true, cross: 'start' }, [side, main]);
  const tallH = Math.max(APP_H, Math.round(main.height));
  if (spec.bleed || !spec.tall || main.height <= APP_H) {
    f.layoutSizingVertical = 'FIXED';
    f.resize(APP_W, APP_H);
    if (!spec.bleed) (main as FrameNode).layoutSizingVertical = 'FILL';
  } else {
    side.resize(SIDEBAR_W, tallH);
  }
  f.setPluginData('webapp', '1');
  return f;
}

/** Full page without the app sidebar: auth and onboarding. */
export function plainFrame(name: string, kids: Kid[]): FrameNode {
  const f = row({ name, w: APP_W, h: APP_H, fill: 'bg/canvas', clip: true }, kids);
  f.setPluginData('webapp', '1');
  return f;
}

export function modal(base: FrameNode, dialog: FrameNode, name: string): FrameNode {
  base.name = name;
  add(base, abs(rect(APP_W, base.height, 'bg/scrim', 0, 'Scrim'), 0, 0));
  add(base, abs(dialog, Math.round((APP_W - dialog.width) / 2), Math.round((base.height - dialog.height) / 2)));
  return base;
}

// ---------------------------------------------------------------- blocks

export function card(title: string | null, kids: Kid[], o: { w?: number | 'fill'; action?: string; actionTo?: string; pad?: number; gap?: number; fill?: Token } = {}): FrameNode {
  const action = o.action ? text(o.action, 'smallStrong', 'brand/fg') : null;
  if (action && o.actionTo) alink(action, o.actionTo);
  return col({ name: title || 'Card', w: o.w || 'fill', gap: o.gap === undefined ? 16 : o.gap, pad: o.pad === undefined ? 24 : o.pad, radius: 20, fill: o.fill || 'bg/surface', stroke: 'border/default' }, [
    title ? row({ name: 'Head', gap: 8, w: 'fill' }, [text(title, 'title', 'text/primary', { w: 'fill' }), action]) : null,
    ...kids,
  ]);
}

export interface Col {
  label: string;
  w: number | 'fill';
}

export function table(cols: Col[], rows: Kid[][], o: { selected?: number; links?: Array<string | undefined> } = {}): FrameNode {
  const cell = (k: Kid, c: Col) => box({ name: 'Cell', dir: 'h', w: c.w, cross: 'center' }, [k]);
  const head = row({ name: 'Head', w: 'fill', pad: [12, 20], gap: 16, fill: 'bg/subtle' }, cols.map((c) => cell(text(c.label, 'overline', 'text/tertiary'), c)));
  const body: SceneNode[] = [];
  rows.forEach((r, i) => {
    if (i > 0) body.push(divider());
    const rr = row({ name: 'Row ' + (i + 1), w: 'fill', pad: [14, 20], gap: 16, fill: i === o.selected ? 'brand/subtle' : null }, r.map((k, ci) => cell(k, cols[ci])));
    const to = o.links && o.links[i];
    body.push(to ? alink(rr, to) : rr);
  });
  return col({ name: 'Table', w: 'fill', radius: 16, fill: 'bg/surface', stroke: 'border/default', clip: true }, [head, ...body]);
}

export function tabs(items: string[], active: number, links: Array<string | undefined> = []): FrameNode {
  return col({ name: 'Tabs', w: 'fill', gap: 0 }, [
    row(
      { name: 'Items', gap: 28, w: 'fill' },
      items.map((t, i) => {
        const on = i === active;
        const n = col({ name: t, gap: 10 }, [text(t, on ? 'bodyStrong' : 'body', on ? 'text/primary' : 'text/secondary'), rect('fill', 2, on ? 'brand/solid' : 'bg/canvas', 1, 'Underline')]);
        const to = links[i];
        return to ? alink(n, to) : n;
      }),
    ),
    divider(),
  ]);
}

export function btn(label: string, variant = 'Primary', size = 'Medium', iconName?: string, to?: string): SceneNode {
  const b = use('Button', { Variant: variant, Size: size }, { label }, iconName ? { show: ['icon'], icons: { icon: iconName } } : {});
  return to ? alink(b, to) : b;
}

export function field(label: string, value: string, state = 'Filled', o: { prefix?: string; leading?: string; trailing?: string; helper?: string; hideLabel?: boolean } = {}): SceneNode {
  const show: string[] = [];
  const hide: string[] = [];
  const icons: Record<string, string> = {};
  const texts: Record<string, string> = { label, value };
  if (o.prefix) {
    show.push('prefix');
    texts.prefix = o.prefix;
  }
  if (o.leading) {
    show.push('leading');
    icons.leading = o.leading;
  }
  if (o.trailing) {
    show.push('trailing');
    icons.trailing = o.trailing;
  }
  if (o.helper) {
    show.push('helper');
    texts.helper = o.helper;
  }
  if (o.hideLabel) hide.push('label');
  return fill(use('TextField', { State: state }, texts, { show, hide, icons }));
}

export function iconTileW(iconName: string, tone: Tone = 'brand', size = 40): FrameNode {
  const t = toneTokens[tone];
  return box({ name: 'Icon tile', dir: 'h', w: size, h: size, radius: Math.round(size * 0.28), fill: t.bg, main: 'center', cross: 'center' }, [icon(iconName, Math.round(size * 0.5), t.fg)]);
}

export function kv(k: string, v: string, vt: Token = 'text/primary'): FrameNode {
  return row({ name: k, w: 'fill', gap: 12, pad: [6, 0] }, [text(k, 'small', 'text/secondary', { w: 'fill' }), text(v, 'smallStrong', vt)]);
}

export { pill, avatar, divider };
