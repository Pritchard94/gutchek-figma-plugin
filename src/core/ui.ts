import { Token, TypeKey, Family, Weight, typeScale, tokenRgba, hexToRgba } from '../tokens';
import { ctx, colorVar, font, later } from './ctx';

export type Kid = SceneNode | null | undefined | false;
type Size = number | 'fill' | 'hug';
type Pad = number | [number, number] | [number, number, number, number];

interface Pending {
  w?: 'fill';
  h?: 'fill';
  abs?: { x: number; y: number };
  grow?: boolean;
  lines?: number;
}

function applyTruncation(t: TextNode, lines: number) {
  try {
    t.textTruncation = 'ENDING';
    t.maxLines = lines;
  } catch (_) {
    /* older API */
  }
}
const pending = new WeakMap<SceneNode, Pending>();

function setPending(node: SceneNode, p: Pending) {
  pending.set(node, Object.assign(pending.get(node) || {}, p));
}

// ---------------------------------------------------------------- paints

export function paint(token: Token, opacity = 1): SolidPaint {
  const c = tokenRgba(token, ctx.theme);
  let p: SolidPaint = { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity: c.a * opacity };
  if (c.a < 1) return p;
  const v = colorVar(token);
  if (v) {
    try {
      p = figma.variables.setBoundVariableForPaint(p, 'color', v);
    } catch (_) {
      /* raw colour stays */
    }
  }
  return p;
}

export function hexPaint(hex: string, opacity = 1): SolidPaint {
  const c = hexToRgba(hex);
  return { type: 'SOLID', color: { r: c.r, g: c.g, b: c.b }, opacity };
}

/** Linear gradient; angle 0 = left to right, 90 = top to bottom. */
export function gradient(stops: Array<[string, number, number?]>, angle = 135): GradientPaint {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tx = 0.5 - 0.5 * cos - 0.5 * sin;
  const ty = 0.5 + 0.5 * sin - 0.5 * cos;
  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [
      [cos, sin, tx],
      [-sin, cos, ty],
    ],
    gradientStops: stops.map(([hex, position, a]) => {
      const c = hexToRgba(hex, a === undefined ? 1 : a);
      return { position, color: c };
    }),
  };
}

export type FillSpec = Token | Paint[] | null | undefined;

function fills(spec: FillSpec, opacity?: number): Paint[] {
  if (!spec) return [];
  if (Array.isArray(spec)) return spec;
  return [paint(spec as Token, opacity === undefined ? 1 : opacity)];
}

// ---------------------------------------------------------------- variable binding

function bindSpacing(f: FrameNode, field: VariableBindableNodeField, value: number) {
  const v = ctx.dimensionVars.get(value);
  if (!v) return;
  try {
    f.setBoundVariable(field, v);
  } catch (_) {
    /* ignore */
  }
}

function bindRadius(f: FrameNode | RectangleNode, value: number) {
  const v = ctx.radiusVars.get(value);
  if (!v) return;
  try {
    for (const k of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'] as const) {
      f.setBoundVariable(k, v);
    }
  } catch (_) {
    /* ignore */
  }
}

// ---------------------------------------------------------------- children

export function add(parent: BaseNode & ChildrenMixin, kid: Kid) {
  if (!kid) return;
  parent.appendChild(kid);
  const p = pending.get(kid);
  const auto = 'layoutMode' in parent && (parent as FrameNode).layoutMode !== 'NONE';
  if (!p) return;
  if (p.abs) {
    if (auto) (kid as FrameNode).layoutPositioning = 'ABSOLUTE';
    kid.x = p.abs.x;
    kid.y = p.abs.y;
    return;
  }
  if (!auto) return;
  const k = kid as FrameNode;
  if (p.w === 'fill') {
    k.layoutSizingHorizontal = 'FILL';
    if (kid.type === 'TEXT') {
      kid.textAutoResize = 'HEIGHT';
      if (p.lines) applyTruncation(kid, p.lines);
    }
  }
  if (p.h === 'fill') k.layoutSizingVertical = 'FILL';
  if (p.grow) k.layoutGrow = 1;
}

export function fill<T extends SceneNode>(node: T, axis: 'w' | 'h' | 'both' = 'w'): T {
  if (axis === 'w' || axis === 'both') setPending(node, { w: 'fill' });
  if (axis === 'h' || axis === 'both') setPending(node, { h: 'fill' });
  return node;
}

export function grow<T extends SceneNode>(node: T): T {
  setPending(node, { grow: true });
  return node;
}

export function abs<T extends SceneNode>(node: T, x: number, y: number): T {
  setPending(node, { abs: { x, y } });
  return node;
}

// ---------------------------------------------------------------- frames

export interface BoxProps {
  name?: string;
  dir?: 'h' | 'v' | 'none';
  gap?: number | 'auto';
  pad?: Pad;
  fill?: FillSpec;
  fillOpacity?: number;
  stroke?: Token;
  strokeW?: number;
  strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
  dash?: number[];
  radius?: number | [number, number, number, number];
  w?: Size;
  h?: Size;
  main?: 'start' | 'center' | 'end' | 'between';
  cross?: 'start' | 'center' | 'end' | 'baseline';
  shadow?: 'e1' | 'e2' | 'e3' | 'glass';
  clip?: boolean;
  wrap?: boolean;
  wrapGap?: number;
  opacity?: number;
  minH?: number;
}

const ALIGN: Record<string, 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN' | 'BASELINE'> = {
  start: 'MIN',
  center: 'CENTER',
  end: 'MAX',
  between: 'SPACE_BETWEEN',
  baseline: 'BASELINE',
};

export function box(p: BoxProps = {}, kids: Kid[] = []): FrameNode {
  const f = figma.createFrame();
  return styleFrame(f, p, kids);
}

export function styleFrame<T extends FrameNode | ComponentNode>(f: T, p: BoxProps, kids: Kid[]): T {
  f.name = p.name || 'Frame';
  f.fills = fills(p.fill, p.fillOpacity);
  f.clipsContent = !!p.clip;
  const dir = p.dir || 'v';
  if (dir !== 'none') {
    f.layoutMode = dir === 'h' ? 'HORIZONTAL' : 'VERTICAL';
    if (p.gap === 'auto' || p.main === 'between') {
      f.primaryAxisAlignItems = 'SPACE_BETWEEN';
    } else {
      f.itemSpacing = p.gap || 0;
      if (p.gap) bindSpacing(f as FrameNode, 'itemSpacing', p.gap);
      if (p.main) f.primaryAxisAlignItems = ALIGN[p.main] as 'MIN' | 'CENTER' | 'MAX';
    }
    if (p.cross) f.counterAxisAlignItems = ALIGN[p.cross] as 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    if (p.wrap && dir === 'h') {
      f.layoutWrap = 'WRAP';
      f.counterAxisSpacing = p.wrapGap === undefined ? (typeof p.gap === 'number' ? p.gap : 0) : p.wrapGap;
    }
    if (p.pad !== undefined) {
      const pad = p.pad;
      let t: number, r: number, b: number, l: number;
      if (typeof pad === 'number') t = r = b = l = pad;
      else if (pad.length === 2) {
        t = b = pad[0];
        r = l = pad[1];
      } else [t, r, b, l] = pad;
      f.paddingTop = t;
      f.paddingRight = r;
      f.paddingBottom = b;
      f.paddingLeft = l;
      bindSpacing(f as FrameNode, 'paddingTop', t);
      bindSpacing(f as FrameNode, 'paddingRight', r);
      bindSpacing(f as FrameNode, 'paddingBottom', b);
      bindSpacing(f as FrameNode, 'paddingLeft', l);
    }
  }
  if (p.radius !== undefined) {
    if (typeof p.radius === 'number') {
      f.cornerRadius = p.radius;
      bindRadius(f as FrameNode, p.radius);
    } else {
      f.topLeftRadius = p.radius[0];
      f.topRightRadius = p.radius[1];
      f.bottomRightRadius = p.radius[2];
      f.bottomLeftRadius = p.radius[3];
    }
  }
  if (p.stroke) {
    f.strokes = [paint(p.stroke)];
    f.strokeWeight = p.strokeW || 1;
    f.strokeAlign = p.strokeAlign || 'INSIDE';
    if (p.dash) f.dashPattern = p.dash;
  }
  if (p.shadow) shadow(f, p.shadow);
  if (p.opacity !== undefined) f.opacity = p.opacity;

  for (const k of kids) add(f, k);

  const w = p.w;
  const h = p.h;
  if (dir === 'none') {
    f.resize(typeof w === 'number' ? w : 100, typeof h === 'number' ? h : 100);
  } else {
    if (typeof w === 'number' || typeof h === 'number') {
      f.resize(typeof w === 'number' ? Math.max(w, 0.01) : Math.max(f.width, 0.01), typeof h === 'number' ? Math.max(h, 0.01) : Math.max(f.height, 0.01));
    }
    if (typeof w !== 'number' && !(p.wrap && w === 'fill')) f.layoutSizingHorizontal = 'HUG';
    if (typeof h !== 'number') f.layoutSizingVertical = 'HUG';
    if (w === 'fill') setPending(f, { w: 'fill' });
    if (h === 'fill') setPending(f, { h: 'fill' });
  }
  if (p.minH) f.minHeight = p.minH;
  return f;
}

export function shadow(node: FrameNode | ComponentNode | RectangleNode | EllipseNode, key: 'e1' | 'e2' | 'e3' | 'glass') {
  const s = ctx.effectStyles.get(key);
  if (s) {
    node.effects = s.effects;
    node.setPluginData(STYLE_KEYS.effect, s.id);
    later(() => node.setEffectStyleIdAsync(s.id), node);
  }
}

export const row = (p: BoxProps, kids: Kid[]) => box(Object.assign({ dir: 'h', cross: 'center' } as BoxProps, p), kids);
export const col = (p: BoxProps, kids: Kid[]) => box(Object.assign({ dir: 'v' } as BoxProps, p), kids);

// ---------------------------------------------------------------- text

export interface CustomType {
  family: Family;
  weight: Weight;
  size: number;
  line?: number;
  tracking?: number;
  upper?: boolean;
}

export interface TextOpts {
  name?: string;
  w?: 'fill' | number;
  align?: 'left' | 'center' | 'right';
  maxLines?: number;
  opacity?: number;
}

export function text(str: string, style: TypeKey | CustomType, color: Token = 'text/primary', o: TextOpts = {}): TextNode {
  const t = figma.createText();
  const spec: CustomType = typeof style === 'string' ? (typeScale[style] as CustomType) : style;
  t.fontName = font(spec.family, spec.weight);
  t.fontSize = spec.size;
  t.lineHeight = spec.line ? { unit: 'PIXELS', value: spec.line } : { unit: 'AUTO' };
  t.letterSpacing = { unit: 'PERCENT', value: spec.tracking || 0 };
  if (spec.upper) t.textCase = 'UPPER';
  t.characters = str;
  t.fills = [paint(color, o.opacity === undefined ? 1 : o.opacity)];
  t.name = o.name || (str.length > 40 ? str.slice(0, 40) + '...' : str);
  if (o.align) t.textAlignHorizontal = o.align === 'left' ? 'LEFT' : o.align === 'center' ? 'CENTER' : 'RIGHT';
  if (typeof style === 'string') {
    const s = ctx.textStyles.get(style);
    if (s) {
      t.setPluginData(STYLE_KEYS.text, s.id);
      later(() => t.setTextStyleIdAsync(s.id), t);
    }
  }
  if (o.w === 'fill') setPending(t, { w: 'fill' });
  else if (typeof o.w === 'number') {
    t.resize(o.w, t.height);
    t.textAutoResize = 'HEIGHT';
  }
  if (o.maxLines) {
    applyTruncation(t, o.maxLines);
    if (o.w === 'fill') setPending(t, { lines: o.maxLines });
  }
  return t;
}

// ---------------------------------------------------------------- shapes

export function rect(w: number | 'fill', h: number, fillToken: FillSpec, r = 0, name = 'Rectangle'): RectangleNode {
  const n = figma.createRectangle();
  n.name = name;
  n.resize(typeof w === 'number' ? w : 10, h);
  n.fills = fills(fillToken);
  if (r) {
    n.cornerRadius = r;
    bindRadius(n, r);
  }
  if (w === 'fill') setPending(n, { w: 'fill' });
  return n;
}

export function circle(size: number, fillToken: FillSpec, name = 'Ellipse'): EllipseNode {
  const n = figma.createEllipse();
  n.name = name;
  n.resize(size, size);
  n.fills = fills(fillToken);
  return n;
}

export function divider(token: Token = 'border/default'): RectangleNode {
  return rect('fill', 1, token, 0, 'Divider');
}

export function lineBetween(x1: number, y1: number, x2: number, y2: number, token: Token, weight = 2, name = 'Line'): LineNode {
  const l = figma.createLine();
  l.name = name;
  const len = Math.max(Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.01);
  l.resize(len, 0);
  const a = Math.atan2(y2 - y1, x2 - x1);
  l.relativeTransform = [
    [Math.cos(a), -Math.sin(a), x1],
    [Math.sin(a), Math.cos(a), y1],
  ];
  l.strokes = [paint(token)];
  l.strokeWeight = weight;
  l.strokeCap = 'ROUND';
  return l;
}

/** Place a node of size (w,h) centred at (cx,cy), rotated clockwise by deg. */
export function placeRotated(node: SceneNode & LayoutMixin, cx: number, cy: number, deg: number) {
  const a = (deg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const w = node.width;
  const h = node.height;
  const x = cx - (cos * w) / 2 + (sin * h) / 2;
  const y = cy - (sin * w) / 2 - (cos * h) / 2;
  node.relativeTransform = [
    [cos, -sin, x],
    [sin, cos, y],
  ];
}

export const STYLE_KEYS = { text: 'textStyle', effect: 'effectStyle' };

/**
 * createComponentFromNode replaces the converted node, so style links queued
 * against it are lost. Re-queue them on the new component and its descendants.
 */
export function relinkStyles(root: ComponentNode, rootEffect: string) {
  if (rootEffect) later(() => root.setEffectStyleIdAsync(rootEffect), root);
  for (const n of root.findAll((c) => !!c.getPluginData(STYLE_KEYS.text) || !!c.getPluginData(STYLE_KEYS.effect))) {
    const ts = n.getPluginData(STYLE_KEYS.text);
    const fx = n.getPluginData(STYLE_KEYS.effect);
    if (ts && n.type === 'TEXT') later(() => n.setTextStyleIdAsync(ts), n);
    if (fx && 'setEffectStyleIdAsync' in n) later(() => (n as FrameNode).setEffectStyleIdAsync(fx), n);
  }
}

// ---------------------------------------------------------------- icons

export const iconComps = new Map<string, ComponentNode>();

export function recolor(node: SceneNode, token: Token) {
  const p = paint(token);
  const visit = (n: SceneNode) => {
    if ('children' in n && n.type !== 'BOOLEAN_OPERATION') {
      for (const c of (n as ChildrenMixin).children) visit(c as SceneNode);
      return;
    }
    const g = n as GeometryMixin;
    if (Array.isArray(g.strokes) && g.strokes.length) g.strokes = [p];
    if (Array.isArray(g.fills) && (g.fills as Paint[]).length) g.fills = [p];
  };
  if ('children' in node) for (const c of (node as ChildrenMixin).children) visit(c as SceneNode);
}

export function icon(name: string, size = 24, token: Token = 'text/primary'): SceneNode {
  const c = iconComps.get(name);
  if (!c) {
    const ph = circle(size, token, 'icon/' + name);
    ph.opacity = 0.3;
    return ph;
  }
  const i = c.createInstance();
  if (size !== 24) i.resize(size, size);
  recolor(i, token);
  i.name = name;
  return i;
}

// ---------------------------------------------------------------- small atoms

export type Tone = 'brand' | 'positive' | 'caution' | 'warning' | 'neutral';

export const toneTokens: Record<Tone, { bg: Token; fg: Token; border: Token; solid: Token }> = {
  brand: { bg: 'brand/subtle', fg: 'brand/on-subtle', border: 'brand/border', solid: 'brand/solid' },
  positive: { bg: 'positive/subtle', fg: 'positive/fg', border: 'positive/border', solid: 'positive/solid' },
  caution: { bg: 'caution/subtle', fg: 'caution/fg', border: 'caution/border', solid: 'caution/solid' },
  warning: { bg: 'warning/subtle', fg: 'warning/fg', border: 'warning/border', solid: 'warning/fg' },
  neutral: { bg: 'bg/subtle', fg: 'text/secondary', border: 'border/default', solid: 'text/secondary' },
};

export function pill(label: string, tone: Tone = 'neutral', iconName?: string, name = 'Pill'): FrameNode {
  const t = toneTokens[tone];
  return row({ name, gap: 4, pad: [4, iconName ? 8 : 10, 4, 10], fill: t.bg, radius: 999 }, [
    iconName ? icon(iconName, 14, t.fg) : null,
    text(label, 'label', t.fg, { name: 'label' }),
  ]);
}

export function avatar(initials: string, size = 40, tone: Tone = 'brand'): FrameNode {
  const t = toneTokens[tone];
  const weight: Weight = 600;
  return box(
    { name: 'Avatar', dir: 'h', main: 'center', cross: 'center', w: size, h: size, radius: size / 2, fill: t.bg },
    [text(initials, { family: 'display', weight, size: Math.round(size * 0.36), tracking: -1 }, t.fg, { name: 'initials' })],
  );
}

export const PLATFORMS: Array<{ code: string; name: string }> = [
  { code: 'IG', name: 'Instagram' },
  { code: 'X', name: 'X' },
  { code: 'TT', name: 'TikTok' },
  { code: 'FB', name: 'Facebook' },
  { code: 'SC', name: 'Snapchat' },
  { code: 'IN', name: 'LinkedIn' },
  { code: 'RD', name: 'Reddit' },
  { code: 'YT', name: 'YouTube' },
];

export function platformBadge(code: string, size = 20): FrameNode {
  return box(
    { name: 'Platform/' + code, dir: 'h', main: 'center', cross: 'center', w: size, h: size, radius: Math.round(size * 0.28), fill: 'bg/muted' },
    [text(code, { family: 'ui', weight: 700, size: Math.max(8, Math.round(size * 0.42)) }, 'text/secondary', { name: 'code' })],
  );
}

/** Clones a frame to use as a picture. Its prototype links are cleared: they would point at frames on another page. */
export function snapshot(frame: FrameNode): FrameNode {
  const c = frame.clone();
  const linked: SceneNode[] = c.findAll((n) => 'reactions' in n && (n as ReactionMixin).reactions.length > 0);
  if (c.reactions.length) linked.push(c);
  for (const n of linked) later(() => (n as ReactionMixin).setReactionsAsync([]), n);
  return c;
}

/** Find a descendant by layer name, searching instances too. */
export function findByName(node: SceneNode, name: string): SceneNode | null {
  if (!('findOne' in node)) return null;
  return (node as FrameNode).findOne((n) => n.name === name);
}

export function setText(node: SceneNode, layer: string, value: string) {
  const t = findByName(node, layer);
  if (t && t.type === 'TEXT') t.characters = value;
}
