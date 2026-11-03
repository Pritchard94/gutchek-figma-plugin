import { Kid, box, col, row, text } from '../core/ui';

export function board(eyebrow: string, title: string, intro: string, kids: Kid[], w = 1440, name?: string): FrameNode {
  return col({ name: name || title, w, pad: [72, 80, 80, 80], gap: 56, fill: 'bg/surface', radius: 40 }, [
    col({ name: 'Header', gap: 12, w: 'fill' }, [
      text(eyebrow, 'overline', 'brand/fg'),
      text(title, { family: 'display', weight: 800, size: 56, line: 64, tracking: -2.5 }, 'text/primary', { name: 'Title' }),
      text(intro, { family: 'ui', weight: 400, size: 20, line: 32, tracking: -0.5 }, 'text/secondary', { name: 'Intro', w: Math.min(w - 160, 880) }),
    ]),
    ...kids,
  ]);
}

export function section(title: string, note: string | null, kids: Kid[], gap = 24): FrameNode {
  return col({ name: title, gap, w: 'fill' }, [
    col({ name: 'Section header', gap: 6, w: 'fill' }, [
      text(title, 'h2', 'text/primary'),
      note ? text(note, 'body', 'text/secondary', { w: 'fill' }) : null,
    ]),
    ...kids,
  ]);
}

export function layoutHorizontally(nodes: SceneNode[], gap = 160, y = 0, x = 0) {
  let cx = x;
  for (const n of nodes) {
    n.x = cx;
    n.y = y;
    cx += n.width + gap;
  }
}

export function layoutVertically(nodes: SceneNode[], gap = 160, x = 0, y = 0) {
  let cy = y;
  for (const n of nodes) {
    n.x = x;
    n.y = cy;
    cy += n.height + gap;
  }
}

export function kv(label: string, value: string, w: number | 'fill' = 'fill'): FrameNode {
  return row({ name: label, gap: 12, w, cross: 'start' }, [
    text(label, 'small', 'text/tertiary', { w: 140 }),
    text(value, 'smallStrong', 'text/primary', { w: 'fill' }),
  ]);
}

export function bullet(str: string, token: 'text/primary' | 'text/secondary' = 'text/secondary'): FrameNode {
  return row({ name: 'Bullet', gap: 12, w: 'fill', cross: 'start' }, [
    box({ name: 'Dot', w: 6, h: 6, radius: 3, fill: 'brand/fg', dir: 'h' }),
    text(str, 'body', token, { w: 'fill' }),
  ]);
}
