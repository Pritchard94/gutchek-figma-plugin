import { Token } from './tokens';
import { box, hexPaint, paint, recolor, row } from './core/ui';
import { MARK_INK, MARK_LILAC, WORD, WORD_W } from './brand-paths';

/**
 * The Gutchek mark: two halves curling into each other, your gut and the evidence meeting in the middle.
 * Paths come from the master artwork brand/gutchek-logo.svg via tools/import-logo.js.
 */
const svg = (w: number, h: number, paths: string) => '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '" fill="none">' + paths + '</svg>';
const shape = (d: string) => '<path d="' + d + '" fill="#000" fill-rule="evenodd"/>';

/**
 * Two-colour by default: the ink half in the given token and the lilac half in logo/lilac. brand/fg maps to the
 * logo ink, which turns white in dark mode; text/on-solid gives the reversed mark for brand colour fills.
 * Mono uses (print, tertiary marks) pass the same token for both.
 */
export function glyph(size = 48, token: Token = 'brand/fg', accent?: Token): FrameNode {
  const n = figma.createNodeFromSvg(svg(48, 48, shape(MARK_INK) + shape(MARK_LILAC)));
  n.name = 'Gutchek glyph';
  n.fills = [];
  n.clipsContent = false;
  const [ink, lilac] = n.children as SceneNode[];
  const inkToken: Token = token === 'brand/fg' ? 'logo/ink' : token;
  const lilacToken: Token = accent || (token === 'brand/fg' || token === 'text/on-solid' || token === 'text/inverse' || token === 'logo/ink' || token === 'logo/ink-static' ? 'logo/lilac' : token);
  if (ink && lilac) {
    ink.name = 'Ink';
    lilac.name = 'Lilac';
    recolorNode(ink, inkToken);
    recolorNode(lilac, lilacToken);
  } else {
    recolor(n, inkToken);
  }
  if (size !== 48) n.rescale(size / 48);
  return n;
}

function recolorNode(n: SceneNode, token: Token) {
  if ('children' in n) return recolor(n, token);
  const g = n as GeometryMixin;
  if (Array.isArray(g.strokes) && g.strokes.length) g.strokes = [paint(token)];
  if (Array.isArray(g.fills) && (g.fills as Paint[]).length) g.fills = [paint(token)];
}

/** The GutChek wordmark as vector letters from the master artwork. size is the old type size; letters are 0.72 of it tall. */
export function wordmark(size = 40, token: Token = 'logo/ink'): FrameNode {
  const n = figma.createNodeFromSvg(svg(Math.ceil(WORD_W), 48, WORD.map(shape).join('')));
  n.name = 'Wordmark';
  n.fills = [];
  n.clipsContent = false;
  recolor(n, token);
  n.rescale((size * 0.72) / 48);
  return n;
}

export function lockup(height = 40, glyphToken: Token = 'brand/fg', wordToken: Token = 'logo/ink', accent?: Token): FrameNode {
  return row({ name: 'Gutchek lockup', gap: Math.round(height * 0.24), cross: 'center' }, [glyph(height, glyphToken, accent), wordmark(Math.round(height * 0.78), wordToken)]);
}

export function appIcon(size = 120): FrameNode {
  return box(
    {
      name: 'App icon',
      dir: 'h',
      main: 'center',
      cross: 'center',
      w: size,
      h: size,
      radius: Math.round(size * 0.225),
      fill: [hexPaint('#FFFFFF')],
      stroke: 'border/default',
      clip: true,
    },
    [glyph(Math.round(size * 0.68), 'logo/ink-static')],
  );
}
