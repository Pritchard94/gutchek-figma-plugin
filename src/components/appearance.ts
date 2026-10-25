import { primitives } from '../tokens';
import { abs, add, box, col, hexPaint, icon, rect, row, text } from '../core/ui';

export type Mode = 'system' | 'light' | 'dark';

const LIGHT = { bg: primitives.neutral['50'], surface: primitives.neutral['0'], muted: primitives.neutral['200'], ink: primitives.neutral['900'], accent: primitives.indigo['600'] };
const DARK = { bg: primitives.night['950'], surface: primitives.night['900'], muted: primitives.night['800'], ink: primitives.night['50'], accent: primitives.indigo['500'] };

function raw(w: number, h: number, hex: string, r: number, name: string, opacity = 1): RectangleNode {
  const n = rect(w, h, null, r, name);
  n.fills = [hexPaint(hex, opacity)];
  return n;
}

/** Miniature UI in fixed light or dark colours, so previews read correctly inside either theme. */
function miniUI(p: typeof LIGHT, w: number, h: number, device: 'phone' | 'desktop'): FrameNode {
  const f = box({ name: 'Mini UI', dir: 'none', w, h, clip: true });
  f.fills = [hexPaint(p.bg)];
  if (device === 'desktop') {
    add(f, abs(raw(Math.round(w * 0.22), h, p.surface, 0, 'Sidebar'), 0, 0));
    add(f, abs(raw(Math.round(w * 0.14), 6, p.accent, 3, 'Nav active'), 8, 14));
    add(f, abs(raw(Math.round(w * 0.12), 4, p.muted, 2, 'Nav'), 8, 26));
    add(f, abs(raw(Math.round(w * 0.12), 4, p.muted, 2, 'Nav'), 8, 34));
    const x = Math.round(w * 0.22) + 10;
    add(f, abs(raw(Math.round(w * 0.3), 6, p.ink, 3, 'Title', 0.85), x, 14));
    add(f, abs(raw(Math.round(w * 0.32), Math.round(h * 0.32), p.accent, 6, 'Card'), x, 28));
    add(f, abs(raw(Math.round(w * 0.32), Math.round(h * 0.32), p.surface, 6, 'Card'), x + Math.round(w * 0.34), 28));
    add(f, abs(raw(w - x - 10, Math.round(h * 0.26), p.surface, 6, 'Table'), x, 28 + Math.round(h * 0.32) + 8));
  } else {
    add(f, abs(raw(Math.round(w * 0.5), 6, p.ink, 3, 'Title', 0.85), 10, 14));
    add(f, abs(raw(w - 20, Math.round(h * 0.26), p.accent, 8, 'Card'), 10, 28));
    add(f, abs(raw(w - 20, Math.round(h * 0.16), p.surface, 8, 'Row'), 10, 32 + Math.round(h * 0.26)));
    add(f, abs(raw(w - 20, Math.round(h * 0.16), p.surface, 8, 'Row'), 10, 36 + Math.round(h * 0.42)));
    add(f, abs(raw(w - 20, 14, p.surface, 7, 'Tab bar'), 10, h - 22));
  }
  return f;
}

export function themePreview(mode: Mode, w: number, h: number, device: 'phone' | 'desktop' = 'phone'): FrameNode {
  const f = box({ name: 'Preview · ' + mode, dir: 'none', w, h, radius: device === 'phone' ? 14 : 10, clip: true, stroke: 'border/strong' });
  if (mode === 'system') {
    add(f, abs(miniUI(LIGHT, w, h, device), 0, 0));
    const darkHalf = box({ name: 'Dark half', dir: 'none', w: Math.round(w / 2), h, clip: true });
    add(darkHalf, abs(miniUI(DARK, w, h, device), -Math.round(w / 2), 0));
    add(f, abs(darkHalf, Math.round(w / 2), 0));
  } else {
    add(f, abs(miniUI(mode === 'dark' ? DARK : LIGHT, w, h, device), 0, 0));
  }
  return f;
}

const LABELS: Record<Mode, [string, string, string]> = {
  system: ['System', 'Match your device', 'smartphone'],
  light: ['Light', 'Always light', 'sun'],
  dark: ['Dark', 'Always dark', 'moon'],
};

/** Selectable option: preview, radio and label. */
export function modeOption(mode: Mode, selected: boolean, w: number, previewH: number, device: 'phone' | 'desktop' = 'phone'): FrameNode {
  const [label, sub, iconName] = LABELS[mode];
  return col({ name: label, w, gap: 10, pad: 10, radius: 16, fill: selected ? 'brand/subtle' : 'bg/surface', stroke: selected ? 'border/focus' : 'border/default', strokeW: selected ? 2 : 1, cross: 'center' }, [
    themePreview(mode, w - 20, previewH, device),
    row({ name: 'Label', gap: 8, w: 'fill' }, [
      box({ name: 'Radio', dir: 'h', w: 20, h: 20, radius: 10, stroke: selected ? 'brand/fg' : 'border/strong', strokeW: selected ? 6 : 1.5, fill: 'bg/surface' }, []),
      icon(iconName, 16, selected ? 'brand/fg' : 'text/secondary'),
      text(label, 'smallStrong', selected ? 'brand/on-subtle' : 'text/primary'),
    ]),
    text(sub, 'caption', 'text/tertiary', { w: 'fill' }),
  ]);
}

/** Compact three-way icon switch for menus and sidebars. */
export function modeSwitch(active: Mode): FrameNode {
  const seg = (m: Mode) => {
    const on = m === active;
    const iconName = m === 'system' ? 'monitor' : m === 'light' ? 'sun' : 'moon';
    return box({ name: LABELS[m][0], dir: 'h', w: 'fill', h: 28, radius: 8, fill: on ? 'bg/raised' : null, shadow: on ? 'e1' : undefined, main: 'center', cross: 'center' }, [icon(iconName, 16, on ? 'text/primary' : 'text/tertiary')]);
  };
  return row({ name: 'Appearance switch', w: 'fill', h: 36, pad: 4, gap: 2, radius: 10, fill: 'bg/subtle' }, [seg('system'), seg('light'), seg('dark')]);
}
