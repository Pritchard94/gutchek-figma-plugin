import { Token } from '../tokens';
import { ctx, tag, tagOf } from '../core/ctx';
import { box, icon, placeRotated } from '../core/ui';

/** Line-art motifs for chat wallpaper: dating, care and the check. No surveillance imagery. */
const MOTIFS = ['check-circle', 'heart', 'message', 'coffee', 'star', 'sparkle', 'map-pin', 'calendar', 'moon', 'sun', 'music', 'flower', 'gift', 'hand-heart', 'smile', 'mail', 'shield-check', 'quote', 'messages', 'wind'];

/**
 * WhatsApp-style tiled doodle wallpaper. Positions and rotations come from a seeded
 * generator so every run, and light and dark, produce the same pattern.
 */
let holder: (FrameNode | SectionNode) | null = null;
const cache = new Map<string, ComponentNode>();

/**
 * Where wallpaper components live. Once set, each distinct pattern is drawn once as a component and reused as a
 * single instance, so a frame carries one layer instead of hundreds. Colours are tokens, so light and dark share it.
 */
export function setWallpaperHolder(node: FrameNode | SectionNode | null) {
  holder = node;
  cache.clear();
  if (!node) return;
  for (const c of node.children) {
    const key = c.type === 'COMPONENT' ? tagOf(c, 'wallpaper') : '';
    if (key && !cache.has(key)) cache.set(key, c as ComponentNode);
  }
}

export function doodleLayer(w: number, h: number, token: Token = 'brand/fg', opacity = 0.09, seed = 11): FrameNode | InstanceNode {
  if (holder && !holder.removed) {
    const key = Math.round(w) + 'x' + Math.round(h) + '|' + token + '|' + opacity + '|' + seed + (ctx.modes ? '' : '|' + ctx.theme);
    let comp = cache.get(key);
    if (!comp || comp.removed) {
      comp = figma.createComponentFromNode(drawDoodles(w, h, token, opacity, seed));
      comp.name = 'Wallpaper/' + Math.round(w) + '\u00d7' + Math.round(h) + ' \u00b7 ' + token + ' \u00b7 ' + Math.round(opacity * 100) + '%';
      comp.description = 'Doodle wallpaper, generated. Reused as an instance wherever this size and colour appear.';
      tag(comp, 'wallpaper', key);
      holder.appendChild(comp);
      const kids = holder.children.length;
      comp.x = ((kids - 1) % 6) * 1600;
      comp.y = Math.floor((kids - 1) / 6) * 1200;
      cache.set(key, comp);
    }
    const inst = comp.createInstance();
    inst.name = 'Chat wallpaper';
    inst.locked = true;
    return inst;
  }
  return drawDoodles(w, h, token, opacity, seed);
}

function drawDoodles(w: number, h: number, token: Token, opacity: number, seed: number): FrameNode {
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
