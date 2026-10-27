import { Token } from './tokens';
import { box, gradient, paint, recolor, row, text } from './core/ui';

/** The Gutchek mark: a G whose bar becomes a check that breaks out of the letter. Gut feeling, then proof. */
const LETTER = '<path d="M36 13.5A15.5 15.5 0 1 0 39.5 24H32" stroke="#000" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
const CHECK = '<path d="M15.5 23L21.5 29L41 9.5" stroke="#000" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
const svg = (paths: string) => '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">' + paths + '</svg>';

/**
 * The glyph is two-colour by default: the letter in the given token, the check in Action Amber.
 * Mono uses (one colour for print, tertiary marks) pass the same token for both.
 */
export function glyph(size = 48, token: Token = 'brand/fg', accent?: Token): FrameNode {
  const n = figma.createNodeFromSvg(svg(LETTER + CHECK));
  n.name = 'Gutchek glyph';
  n.fills = [];
  n.clipsContent = false;
  const [letter, check] = n.children as SceneNode[];
  const checkToken: Token = accent || (token === 'brand/fg' || token === 'text/on-solid' ? 'action/solid' : token);
  if (letter && check) {
    letter.name = 'Letter';
    check.name = 'Check';
    recolorNode(letter, token);
    recolorNode(check, checkToken);
  } else {
    recolor(n, token);
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

export function wordmark(size = 40, token: Token = 'text/primary'): TextNode {
  return text('gutchek', { family: 'display', weight: 800, size, tracking: -3 }, token, { name: 'Wordmark' });
}

export function lockup(height = 40, glyphToken: Token = 'brand/fg', wordToken: Token = 'text/primary', accent?: Token): FrameNode {
  return row({ name: 'Gutchek lockup', gap: Math.round(height * 0.2), cross: 'center' }, [glyph(height, glyphToken, accent), wordmark(Math.round(height * 0.86), wordToken)]);
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
      fill: [gradient([['#7556E3', 0], ['#3B278C', 1]], 135)],
      clip: true,
    },
    [glyph(Math.round(size * 0.66), 'text/on-solid')],
  );
}
