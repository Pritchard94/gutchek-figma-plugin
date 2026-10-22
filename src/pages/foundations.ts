import { Theme, Token, contrast, elevation, primitives, radius, resolveRef, semantic, spacing, typeScale, TypeKey, luminance } from '../tokens';
import { ctx, applyThemeMode, flush } from '../core/ctx';
import { box, col, hexPaint, row, text, rect } from '../core/ui';
import { board, layoutHorizontally, section } from './common';

export function withTheme<T>(theme: Theme, fn: () => T): T {
  const prev = ctx.theme;
  ctx.theme = theme;
  try {
    return fn();
  } finally {
    ctx.theme = prev;
  }
}

export function themedPanel(theme: Theme, name: string, kids: () => SceneNode[], w: number | 'fill' = 'fill', pad = 32): FrameNode {
  return withTheme(theme, () => {
    const f = col({ name, w, pad, gap: 16, fill: 'bg/canvas', radius: 24, stroke: 'border/default' }, kids());
    applyThemeMode(f, theme);
    return f;
  });
}

export function swatchChip(hex: string, label: string, sub: string, size = 88): FrameNode {
  const onDark = luminance(hex) < 0.35;
  const ink = onDark ? '#FFFFFF' : '#101828';
  const f = col({ name: label, w: size, h: size + 20, gap: 0, radius: 14, clip: true, stroke: 'border/default' }, []);
  const top = box({ name: 'Swatch', dir: 'v', w: size, h: size, pad: 10, main: 'end', fill: [hexPaint(hex)] }, []);
  const t1 = text(label, 'label', 'text/primary');
  t1.fills = [hexPaint(ink)];
  top.appendChild(t1);
  f.appendChild(top);
  const bottom = box({ name: 'Hex', dir: 'h', w: size, h: 20, pad: [0, 10], cross: 'center', fill: 'bg/surface' }, [text(sub, 'caption', 'text/secondary')]);
  f.appendChild(bottom);
  return f;
}

export function rampRow(ramp: string): FrameNode {
  const steps = Object.keys(primitives[ramp]);
  return col({ name: 'Ramp ' + ramp, gap: 12, w: 'fill' }, [
    text(ramp.charAt(0).toUpperCase() + ramp.slice(1), 'title', 'text/primary'),
    row({ name: 'Steps', gap: 8 }, steps.map((s) => swatchChip(primitives[ramp][s], s, primitives[ramp][s].replace('#', ''), 100))),
  ]);
}

function tokenRow(token: Token, theme: Theme): FrameNode {
  const ref = semantic[token][theme];
  const r = resolveRef(ref);
  const bgHex = resolveRef(semantic['bg/surface'][theme]).hex;
  const ratio = contrast(r.hex, bgHex);
  return row({ name: token, gap: 16, w: 'fill', pad: [10, 0] }, [
    box({ name: 'Swatch', w: 36, h: 36, radius: 10, fill: token, stroke: 'border/default' }),
    text(token, 'smallStrong', 'text/primary', { w: 170 }),
    text(token.replace('/', '-'), 'small', 'brand/fg', { w: 150 }),
    text(ref.indexOf('@') > -1 ? ref.replace('@', ' at ') : ref, 'small', 'text/secondary', { w: 'fill' }),
    text(semantic[token].group === 'bg' || semantic[token].group === 'border' ? '' : ratio.toFixed(1) + ':1', 'caption', 'text/tertiary', { w: 48, align: 'right' }),
  ]);
}

function tokenTable(theme: Theme): FrameNode {
  return themedPanel(theme, theme === 'dark' ? 'Dark mode' : 'Light mode', () => [
    row({ name: 'Head', gap: 12, w: 'fill' }, [
      text(theme === 'dark' ? 'Dark' : 'Light', 'h3', 'text/primary', { w: 'fill' }),
      text('Contrast on surface', 'caption', 'text/tertiary'),
    ]),
    col(
      { name: 'Rows', gap: 0, w: 'fill' },
      Object.keys(semantic).map((t) => tokenRow(t as Token, theme)),
    ),
  ]);
}

function typeRow(key: TypeKey): FrameNode {
  const t = typeScale[key] as (typeof typeScale)[TypeKey];
  const f = ctx.fonts[t.family][t.weight];
  return row({ name: t.name, gap: 32, w: 'fill', pad: [18, 0], cross: 'center' }, [
    col({ name: 'Spec', gap: 4, w: 300 }, [
      text(t.name, 'smallStrong', 'text/primary'),
      text(f.family + ' ' + f.style + ' · ' + t.size + '/' + t.line + ' · ' + (t.tracking > 0 ? '+' : '') + t.tracking + '%', 'caption', 'text/tertiary'),
      text(t.usage, 'caption', 'text/secondary'),
    ]),
    text(key === 'display' ? '8 / 10' : key === 'overline' ? 'Top signals' : 'Know the person behind the DMs', key, 'text/primary', { w: 'fill' }),
  ]);
}

export function buildFoundations(page: PageNode): PageNode {
  ctx.theme = 'light';

  const tokens = board(
    'Libra · Foundations',
    'Colour tokens',
    'Every screen is built from semantic tokens, bound to Figma variables. Light and Dark are modes of the same collection, so switching a frame\'s mode re-themes it. The class column is the NativeWind name used in code.',
    [row({ name: 'Tables', gap: 32, w: 'fill', cross: 'start' }, [tokenTable('light'), tokenTable('dark')])],
    1600,
  );

  const prims = board(
    'Libra · Foundations',
    'Primitive palette',
    'Raw colour ramps. Never use these directly in UI; reference a semantic token instead so dark mode and future rebrands stay a token change.',
    Object.keys(primitives).map((r) => rampRow(r)),
    1600,
  );

  const type = board(
    'Libra · Foundations',
    'Type styles',
    'Plus Jakarta Sans carries headlines and score numerals; Inter carries everything users read at length. Sizes follow iOS Dynamic Type defaults so the scale grows with user settings.',
    [col({ name: 'Styles', gap: 0, w: 'fill' }, (Object.keys(typeScale) as TypeKey[]).map(typeRow))],
    1440,
  );

  const space = board(
    'Libra · Foundations',
    'Spacing, radius and elevation',
    'A 4pt grid. Screen margins are 20, cards pad 16 to 20, sections separate by 32. Corners get rounder as surfaces get larger.',
    [
      section('Spacing', 'Bound to the Dimensions variable collection.', [
        row({ name: 'Scale', gap: 24, cross: 'end' }, spacing.map((s) => col({ name: 'space/' + s, gap: 8, cross: 'center' }, [rect(s, s, 'brand/solid', 2), text(String(s), 'caption', 'text/secondary')]))),
      ]),
      section('Radius', null, [
        row(
          { name: 'Radii', gap: 24 },
          (Object.keys(radius) as Array<keyof typeof radius>).map((k) =>
            col({ name: 'radius/' + k, gap: 8, cross: 'center' }, [
              box({ name: 'Sample', w: 96, h: 96, radius: Math.min(radius[k], 48), fill: 'brand/subtle', stroke: 'brand/border' }),
              text(k + ' · ' + (k === 'full' ? 'pill' : radius[k]), 'caption', 'text/secondary'),
            ]),
          ),
        ),
      ]),
      section('Elevation', 'Use sparingly. In dark mode, elevation reads through lighter surfaces (raised) rather than shadow.', [
        row(
          { name: 'Levels', gap: 40, pad: 32, fill: 'bg/canvas', radius: 24 },
          (Object.keys(elevation) as Array<keyof typeof elevation>).map((k) =>
            col({ name: elevation[k].name, w: 240, h: 140, pad: 20, gap: 4, radius: 16, fill: 'bg/surface', shadow: k, main: 'end' }, [
              text(elevation[k].name.replace('Elevation/', 'Level '), 'title', 'text/primary'),
              text(elevation[k].usage, 'small', 'text/secondary', { w: 'fill' }),
            ]),
          ),
        ),
      ]),
    ],
    1440,
  );

  for (const b of [tokens, prims, type, space]) page.appendChild(b);
  layoutHorizontally([tokens, prims, type, space], 160);
  return page;
}

export async function finishPage() {
  await flush();
}
