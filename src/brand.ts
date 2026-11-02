import { Token } from './tokens';
import { box, hexPaint, paint, recolor, row, text } from './core/ui';

/**
 * The Gutchek mark: two halves curling into each other, your gut and the evidence meeting in the middle.
 * Traced from the master artwork in brand/gutchek-mark.png with tools/trace-logo.js.
 */
const INK = 'M25.25 2.05C26.12 1.95 25.98 1.98 26.47 2.05C26.95 2.11 27.67 2.22 28.15 2.45C28.64 2.69 29.05 3.03 29.37 3.47C29.69 3.9 29.94 4.49 30.05 5.09C30.15 5.68 30.07 6.49 29.98 7.05C29.89 7.6 29.79 7.84 29.51 8.4C29.22 8.95 28.8 9.69 28.29 10.36C27.78 11.02 27.78 11.27 26.47 12.38C25.15 13.5 22.02 15.68 20.39 17.04C18.75 18.4 17.52 19.6 16.67 20.56C15.83 21.51 15.62 22.14 15.32 22.78C15.02 23.43 14.91 23.85 14.85 24.41C14.78 24.96 14.78 25.52 14.91 26.09C15.05 26.67 15.29 27.29 15.66 27.85C16.03 28.41 16.49 28.86 17.14 29.47C17.8 30.08 18.99 30.88 19.58 31.5C20.16 32.12 20.45 32.61 20.66 33.19C20.86 33.76 20.87 34.39 20.79 34.94C20.71 35.49 20.43 36.09 20.18 36.5C19.94 36.9 19.65 37.13 19.31 37.37C18.96 37.62 18.75 37.88 18.09 37.98C17.43 38.08 16.14 38.09 15.32 37.98C14.5 37.87 13.97 37.62 13.16 37.31C12.35 36.99 11.62 36.78 10.46 36.09C9.3 35.4 7.32 34.11 6.2 33.19C5.09 32.26 4.48 31.53 3.77 30.55C3.06 29.57 2.41 28.49 1.95 27.31C1.48 26.13 1.14 24.7 1 23.46C0.86 22.22 0.91 21.1 1.14 19.88C1.36 18.66 1.82 17.34 2.35 16.16C2.88 14.99 3.52 13.92 4.31 12.85C5.1 11.79 6.21 10.59 7.08 9.75C7.95 8.9 8.62 8.42 9.51 7.79C10.4 7.16 11.09 6.64 12.42 5.96C13.74 5.29 16.01 4.29 17.48 3.74C18.96 3.18 19.97 2.94 21.26 2.65C22.56 2.37 24.38 2.15 25.25 2.05Z';
const LILAC = 'M32.34 11.3C33.09 11.18 33.5 11.3 34.1 11.44C34.7 11.57 35.19 11.81 35.92 12.11C36.65 12.42 37.71 12.84 38.49 13.26C39.27 13.68 39.68 13.87 40.58 14.61C41.48 15.35 43.15 16.91 43.89 17.72C44.64 18.53 44.66 18.78 45.04 19.47C45.42 20.17 45.87 20.98 46.19 21.91C46.5 22.83 46.8 24.03 46.93 25.01C47.07 25.99 47.03 26.95 47 27.78C46.97 28.62 46.9 29.23 46.73 30.01C46.56 30.79 46.34 31.54 45.99 32.44C45.64 33.34 45.23 34.42 44.64 35.42C44.04 36.41 43.24 37.48 42.41 38.39C41.57 39.3 40.52 40.2 39.64 40.89C38.76 41.57 38.14 41.96 37.14 42.51C36.14 43.06 34.82 43.72 33.63 44.2C32.43 44.67 31.21 45.05 29.98 45.35C28.75 45.64 27.23 45.86 26.26 45.95C25.29 46.04 24.86 46.04 24.17 45.89C23.48 45.73 22.66 45.4 22.14 45.01C21.62 44.61 21.29 44.1 21.06 43.52C20.84 42.95 20.77 42.13 20.79 41.56C20.81 41 21.03 40.56 21.2 40.14C21.37 39.73 21.47 39.51 21.8 39.06C22.14 38.61 22.31 38.21 23.22 37.44C24.14 36.68 26.15 35.4 27.28 34.47C28.4 33.54 29.29 32.68 29.98 31.84C30.66 30.99 31.1 30.05 31.4 29.4C31.69 28.76 31.68 28.44 31.73 27.99C31.79 27.53 31.79 27.13 31.73 26.7C31.68 26.27 31.59 25.88 31.4 25.42C31.21 24.96 31.22 24.71 30.59 23.93C29.96 23.16 28.24 21.58 27.61 20.76C26.98 19.94 26.96 19.56 26.8 19C26.65 18.44 26.68 17.83 26.67 17.38C26.66 16.93 26.49 16.94 26.74 16.3C26.98 15.66 27.67 14.22 28.15 13.53C28.64 12.84 28.94 12.55 29.64 12.18C30.34 11.81 31.6 11.42 32.34 11.3Z';
const svg = (paths: string) => '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">' + paths + '</svg>';
const shape = (d: string) => '<path d="' + d + '" fill="#000"/>';

/**
 * Two-colour by default: the ink half in the given token and the lilac half in logo/lilac. brand/fg maps to the
 * logo ink, which turns white in dark mode; text/on-solid gives the reversed mark for brand colour fills.
 * Mono uses (print, tertiary marks) pass the same token for both.
 */
export function glyph(size = 48, token: Token = 'brand/fg', accent?: Token): FrameNode {
  const n = figma.createNodeFromSvg(svg(shape(INK) + shape(LILAC)));
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

export function wordmark(size = 40, token: Token = 'text/primary'): TextNode {
  return text('gutchek', { family: 'display', weight: 800, size, tracking: -3 }, token, { name: 'Wordmark' });
}

export function lockup(height = 40, glyphToken: Token = 'brand/fg', wordToken: Token = 'logo/ink', accent?: Token): FrameNode {
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
      fill: [hexPaint('#FFFFFF')],
      stroke: 'border/default',
      clip: true,
    },
    [glyph(Math.round(size * 0.68), 'logo/ink-static')],
  );
}
