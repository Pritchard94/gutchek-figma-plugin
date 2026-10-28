import { Token } from '../tokens';
import { box, icon, placeRotated } from '../core/ui';

/** Line-art motifs for chat wallpaper: dating, care and the check. No surveillance imagery. */
const MOTIFS = ['check-circle', 'heart', 'message', 'coffee', 'star', 'sparkle', 'map-pin', 'calendar', 'moon', 'sun', 'music', 'flower', 'gift', 'hand-heart', 'smile', 'mail', 'shield-check', 'quote', 'messages', 'wind'];

/**
 * WhatsApp-style tiled doodle wallpaper. Positions and rotations come from a seeded
 * generator so every run, and light and dark, produce the same pattern.
 */
export function doodleLayer(w: number, h: number, token: Token = 'brand/fg', opacity = 0.09, seed = 11): FrameNode {
  const f = box({ name: 'Chat wallpaper', dir: 'none', w, h, clip: true });
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const cell = 54;
  let rowIndex = 0;
  for (let y = 10; y < h + cell; y += cell, rowIndex++) {
    const offset = rowIndex % 2 ? cell / 2 : 0;
    for (let x = 6 + offset; x < w + cell; x += cell) {
      const name = MOTIFS[Math.floor(rnd() * MOTIFS.length)];
      const size = 18 + Math.round(rnd() * 8);
      const node = icon(name, size, token) as InstanceNode;
      node.opacity = opacity;
      f.appendChild(node);
      placeRotated(node, x + (rnd() - 0.5) * 14, y + (rnd() - 0.5) * 14, Math.round((rnd() - 0.5) * 50));
    }
  }
  f.locked = true;
  return f;
}

/** Put the wallpaper behind a screen's content, starting below its header. */
export function addWallpaper(root: FrameNode, top: number, opacity = 0.09) {
  const layer = doodleLayer(root.width, Math.max(1, root.height - top), 'brand/fg', opacity);
  root.insertChild(0, layer);
  layer.layoutPositioning = 'ABSOLUTE';
  layer.x = 0;
  layer.y = top;
}
