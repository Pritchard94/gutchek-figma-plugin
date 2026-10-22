import { Token, TypeKey, device } from '../tokens';
import { ctx } from '../core/ctx';
import { Kid, Tone, abs, add, box, col, divider, fill, icon, rect, row, text, toneTokens, platformBadge } from '../core/ui';
import { use, named } from '../components/library';

// ---------------------------------------------------------------- prototype links

export const links: Array<[SceneNode, string]> = [];

export function link<T extends SceneNode>(node: T, target: string): T {
  links.push([node, target]);
  return node;
}

// ---------------------------------------------------------------- shell

export type Tab = 'Home' | 'Saved' | 'Safety' | 'Settings';

export interface NavSpec {
  type?: 'Inline' | 'Large';
  title: string;
  action?: string | null;
  back?: boolean;
  backTo?: string;
}

export interface ScreenSpec {
  name: string;
  tab?: Tab;
  nav?: NavSpec;
  bg?: Token;
  pad?: [number, number, number, number];
  gap?: number;
  cross?: 'start' | 'center';
  footer?: Kid[];
  footerDivider?: boolean;
  tall?: boolean;
}

export function navBar(n: NavSpec): SceneNode {
  const type = n.type || 'Inline';
  const hide: string[] = [];
  if (n.action === null) hide.push(type === 'Large' ? 'action' : 'action-icon');
  if (type === 'Inline' && n.back === false) hide.push('back-icon');
  const icons: Record<string, string> = {};
  if (n.action) icons['action-icon'] = n.action;
  const bar = use('NavBar', { Type: type }, { title: n.title }, { hide, icons });
  if (n.backTo) {
    const back = (bar as FrameNode).findOne((c) => c.name === 'back');
    if (back) link(back, n.backTo);
  }
  return fill(bar);
}

export function screen(spec: ScreenSpec, body: Kid[]): FrameNode {
  const bodyFrame = col(
    { name: 'Content', w: 'fill', pad: spec.pad || [8, device.margin, 24, device.margin], gap: spec.gap === undefined ? 20 : spec.gap, cross: spec.cross || 'start', clip: true },
    body,
  );
  const footer = spec.footer
    ? col({ name: 'Footer', w: 'fill', pad: [12, device.margin, spec.tab ? 12 : 4, device.margin], gap: 12, fill: spec.bg || 'bg/canvas', cross: 'center' }, spec.footer)
    : null;
  const kids: Kid[] = [fill(use('StatusBar')), spec.nav ? navBar(spec.nav) : null, bodyFrame];
  if (footer) {
    if (spec.footerDivider) kids.push(divider());
    kids.push(footer);
  }
  kids.push(fill(spec.tab ? use('TabBar', { Active: spec.tab }) : use('HomeIndicator')));
  const root = col({ name: spec.name, w: device.width, fill: spec.bg || 'bg/canvas', clip: true }, kids);
  if (!spec.tall || root.height < device.height) {
    root.layoutSizingVertical = 'FIXED';
    root.resize(device.width, device.height);
    bodyFrame.layoutGrow = 1;
  }
  root.setPluginData('screen', '1');
  return root;
}

/** Bottom sheet over a screen; the screen must be fixed at device height. */
export function withSheet(base: FrameNode, title: string, content: Kid[], name?: string): FrameNode {
  if (name) base.name = name;
  const scrim = rect(device.width, base.height, 'bg/scrim', 0, 'Scrim');
  add(base, abs(scrim, 0, 0));
  const sheet = col({ name: 'Sheet', w: device.width, fill: 'bg/raised', radius: [28, 28, 0, 0], shadow: 'e3' }, [
    fill(use('SheetHeader', {}, { title })),
    col({ name: 'Sheet content', w: 'fill', pad: [8, device.margin, 16, device.margin], gap: 12 }, content),
    fill(use('HomeIndicator')),
  ]);
  add(base, abs(sheet, 0, base.height - sheet.height));
  return base;
}

export function withDialog(base: FrameNode, dialog: FrameNode, name?: string): FrameNode {
  if (name) base.name = name;
  add(base, abs(rect(device.width, base.height, 'bg/scrim', 0, 'Scrim'), 0, 0));
  add(base, abs(dialog, Math.round((device.width - dialog.width) / 2), Math.round((base.height - dialog.height) / 2)));
  return base;
}

// ---------------------------------------------------------------- atoms

export function btn(label: string, variant = 'Primary', size = 'Large', iconName?: string, full = true): SceneNode {
  const b = use('Button', { Variant: variant, Size: size }, { label }, iconName ? { show: ['icon'], icons: { icon: iconName } } : {});
  return full ? fill(b) : b;
}

export interface FieldOpts {
  state?: 'Default' | 'Focused' | 'Filled' | 'Error';
  prefix?: string;
  leading?: string;
  trailing?: string;
  helper?: string;
  hideLabel?: boolean;
}

export function field(label: string, value: string, o: FieldOpts = {}): SceneNode {
  const texts: Record<string, string> = { label, value };
  const show: string[] = [];
  const hide: string[] = [];
  const icons: Record<string, string> = {};
  if (o.prefix) {
    texts.prefix = o.prefix;
    show.push('prefix');
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
    texts.helper = o.helper;
    show.push('helper');
  }
  if (o.hideLabel) hide.push('label');
  return fill(use('TextField', { State: o.state || 'Filled' }, texts, { show, hide, icons }));
}

export function chip(label: string, on = false): SceneNode {
  return use('Chip', { Selected: on ? 'On' : 'Off' }, { label });
}

export function listRow(title: string, subtitle: string | null, iconName: string, trailing = 'Chevron', value?: string): SceneNode {
  const texts: Record<string, string> = { title };
  if (subtitle) texts.subtitle = subtitle;
  if (value) texts.value = value;
  return fill(use('ListRow', { Trailing: trailing }, texts, { hide: subtitle ? [] : ['subtitle'], icons: { icon: iconName } }));
}

export function group(rows: SceneNode[], name = 'Group'): FrameNode {
  const kids: Kid[] = [];
  rows.forEach((r, i) => {
    if (i > 0) kids.push(box({ name: 'Inset divider', dir: 'h', w: 'fill', pad: [0, 0, 0, 64] }, [divider()]));
    kids.push(fill(r));
  });
  return col({ name, w: 'fill', radius: 16, fill: 'bg/surface', stroke: 'border/default', clip: true }, kids);
}

export function groupTitle(label: string): TextNode {
  return text(label, 'overline', 'text/tertiary', { name: 'Group title' });
}

export function sectionHead(title: string, action?: string, target?: string): FrameNode {
  const a = action ? text(action, 'smallStrong', 'brand/fg', { name: 'Section action' }) : null;
  if (a && target) link(a, target);
  return row({ name: 'Section ' + title, w: 'fill', gap: 12 }, [text(title, 'h3', 'text/primary', { w: 'fill' }), a]);
}

export function surface(kids: Kid[], name = 'Card', pad: number | [number, number, number, number] = 16, gap = 12, tok: Token = 'bg/surface'): FrameNode {
  return col({ name, w: 'fill', pad, gap, radius: 16, fill: tok, stroke: 'border/default' }, kids);
}

export function note(iconName: string, body: string, tone: Tone = 'brand', title?: string): FrameNode {
  const t = toneTokens[tone];
  return row({ name: 'Note', w: 'fill', pad: 14, gap: 12, radius: 14, fill: t.bg, cross: 'start' }, [
    icon(iconName, 20, t.fg),
    col({ name: 'Text', gap: 2, w: 'fill' }, [title ? text(title, 'smallStrong', 'text/primary', { w: 'fill' }) : null, text(body, 'small', tone === 'neutral' ? 'text/secondary' : 'text/primary', { w: 'fill' })]),
  ]);
}

export function iconTile(iconName: string, tone: Tone = 'brand', size = 36): FrameNode {
  const t = toneTokens[tone];
  return box({ name: 'Icon tile', dir: 'h', w: size, h: size, radius: Math.round(size * 0.28), fill: t.bg, main: 'center', cross: 'center' }, [icon(iconName, Math.round(size * 0.55), t.fg)]);
}

export function scorePair(caution: string, positive: string): FrameNode {
  return row({ name: 'Scores', gap: 6 }, [
    use('ScoreBadge', { Side: 'Caution' }, { label: caution }),
    use('ScoreBadge', { Side: 'Positive' }, { label: positive }),
  ]);
}

export function platformLine(code: string, label: string, ok = true): FrameNode {
  return row({ name: 'Coverage ' + code, w: 'fill', gap: 12 }, [
    platformBadge(code, 24),
    text(label, 'small', ok ? 'text/primary' : 'text/tertiary', { w: 'fill' }),
    icon(ok ? 'check-circle' : 'ban', 18, ok ? 'positive/fg' : 'text/tertiary'),
  ]);
}

export function center(str: string, style: TypeKey, token: Token = 'text/primary'): TextNode {
  return text(str, style, token, { align: 'center', w: 'fill' });
}

export function progressDots(count: number, active: number): FrameNode {
  const dots: SceneNode[] = [];
  for (let i = 0; i < count; i++) dots.push(rect(i === active ? 20 : 6, 6, i <= active ? 'brand/fg' : 'bg/muted', 3, 'Dot ' + (i + 1)));
  return row({ name: 'Progress', gap: 6 }, dots);
}

export { use, named, ctx };
