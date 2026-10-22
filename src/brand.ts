import { Token } from './tokens';
import { box, gradient, recolor, row, text } from './core/ui';

const GLYPH_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">' +
  '<path d="M24 14V38" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>' +
  '<path d="M15 39.5H33" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>' +
  '<path d="M7 14H41" stroke="#000" stroke-width="3.5" stroke-linecap="round"/>' +
  '<path d="M8 14L2.5 27M8 14L13.5 27" stroke="#000" stroke-width="1.75" stroke-linecap="round"/>' +
  '<path d="M40 14L34.5 27M40 14L45.5 27" stroke="#000" stroke-width="1.75" stroke-linecap="round"/>' +
  '<path d="M2 27H14A6 6 0 0 1 2 27Z" fill="#000"/>' +
  '<path d="M34 27H46A6 6 0 0 1 34 27Z" fill="#000"/>' +
  '<circle cx="24" cy="12" r="3.5" fill="#000"/>' +
  '</svg>';

export function glyph(size = 48, token: Token = 'brand/fg'): FrameNode {
  const n = figma.createNodeFromSvg(GLYPH_SVG);
  n.name = 'Libra glyph';
  n.fills = [];
  n.clipsContent = false;
  recolor(n, token);
  if (size !== 48) n.rescale(size / 48);
  return n;
}

export function wordmark(size = 40, token: Token = 'text/primary'): TextNode {
  return text('libra', { family: 'display', weight: 800, size, tracking: -3 }, token, { name: 'Wordmark' });
}

export function lockup(height = 40, glyphToken: Token = 'brand/fg', wordToken: Token = 'text/primary'): FrameNode {
  return row({ name: 'Libra lockup', gap: Math.round(height * 0.22), cross: 'center' }, [glyph(height, glyphToken), wordmark(Math.round(height * 0.92), wordToken)]);
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
      fill: [gradient([['#7556E3', 0], ['#4A30B0', 1]], 135)],
      clip: true,
    },
    [glyph(Math.round(size * 0.58), 'text/on-solid')],
  );
}
