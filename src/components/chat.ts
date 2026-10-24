import { Token } from '../tokens';
import { Tone, abs, add, avatar, box, col, icon, paint, rect, row, text, toneTokens } from '../core/ui';

export type Speaker = 'them' | 'you';
export type Flag = 'caution' | 'positive' | null;

/** Chat bubble sized to its text, like a messaging app. Flagged bubbles get a tinted ring and a label. */
export function bubble(str: string, who: Speaker, o: { flag?: Flag; tag?: string; time?: string; max?: number } = {}): FrameNode {
  const max = o.max || 264;
  const est = Math.round(str.length * 7.4) + 28;
  const w = Math.max(56, Math.min(max, est));
  const them = who === 'them';
  const flagTone = o.flag ? toneTokens[o.flag] : null;
  const fillToken: Token = flagTone ? flagTone.bg : them ? 'bg/subtle' : 'brand/solid';
  const textToken: Token = flagTone ? 'text/primary' : them ? 'text/primary' : 'text/on-solid';
  const b = box(
    {
      name: them ? 'Bubble · Them' : 'Bubble · You',
      dir: 'v',
      w,
      pad: [9, 14],
      radius: them ? [18, 18, 18, 6] : [18, 18, 6, 18],
      fill: fillToken,
      stroke: flagTone ? flagTone.fg : undefined,
      strokeW: 1.5,
    },
    [text(str, 'body', textToken, { w: 'fill', name: 'message' })],
  );
  const meta: SceneNode[] = [];
  if (o.flag && o.tag) meta.push(row({ name: 'Tag', gap: 4 }, [icon(o.flag === 'caution' ? 'alert-triangle' : 'check-circle', 12, flagTone!.fg), text(o.tag, 'label', flagTone!.fg)]));
  if (o.time) meta.push(text(o.time, 'caption', 'text/tertiary'));
  return col({ name: 'Message', w: 'fill', gap: 4, cross: them ? 'start' : 'end' }, [b, meta.length ? row({ name: 'Meta', gap: 8 }, meta) : null]);
}

export function dateChip(label: string): FrameNode {
  return row({ name: 'Date', w: 'fill', main: 'center' }, [row({ name: 'Chip', pad: [4, 10], radius: 999, fill: 'bg/subtle' }, [text(label, 'caption', 'text/secondary')])]);
}

/** Placeholder for an uploaded chat screenshot: a tiny phone with message bars. */
export function shotThumb(n: number, w = 104, warn = false): FrameNode {
  const h = Math.round(w * 1.6);
  const f = box({ name: 'Screenshot ' + n, dir: 'none', w, h, radius: 14, fill: 'bg/raised', stroke: warn ? 'warning/fg' : 'border/default', strokeW: warn ? 2 : 1, clip: true });
  const bars: Array<[boolean, number]> = [
    [true, 0.6],
    [false, 0.5],
    [true, 0.72],
    [true, 0.4],
    [false, 0.62],
    [true, 0.55],
    [false, 0.35],
  ];
  let y = 16;
  for (const [left, frac] of bars) {
    const bw = Math.round((w - 20) * frac);
    const r = rect(bw, 10, left ? 'bg/muted' : 'brand/border', 5, 'Bar');
    add(f, abs(r, left ? 8 : w - 8 - bw, y));
    y += 18;
    if (y > h - 30) break;
  }
  add(f, abs(box({ name: 'Index', dir: 'h', w: 22, h: 22, radius: 11, fill: warn ? 'warning/fg' : 'bg/inverse', main: 'center', cross: 'center' }, [text(String(n), { family: 'ui', weight: 700, size: 11, line: 13 }, 'text/inverse')]), 6, h - 28));
  if (warn) add(f, abs(box({ name: 'Warn', dir: 'h', w: 22, h: 22, radius: 11, fill: 'warning/subtle', main: 'center', cross: 'center' }, [icon('alert-triangle', 13, 'warning/fg')]), w - 28, 6));
  else add(f, abs(box({ name: 'Remove', dir: 'h', w: 22, h: 22, radius: 11, fill: 'bg/inverse', main: 'center', cross: 'center' }, [icon('x', 12, 'text/inverse')]), w - 28, 6));
  return f;
}

/** Semicircle conversation health meter. value 0..100. */
export function healthGauge(value: number, label: string, tone: Tone, size = 200): FrameNode {
  const h = Math.round(size / 2) + 8;
  const f = box({ name: 'Health meter', dir: 'none', w: size, h: h + 56 });
  const track = figma.createEllipse();
  track.name = 'Track';
  track.resize(size, size);
  track.arcData = { startingAngle: Math.PI, endingAngle: Math.PI * 2, innerRadius: 0.82 };
  track.fills = [paint('bg/muted')];
  add(f, abs(track, 0, 0));
  const val = figma.createEllipse();
  val.name = 'Value';
  val.resize(size, size);
  val.arcData = { startingAngle: Math.PI, endingAngle: Math.PI + Math.PI * Math.max(0.02, Math.min(1, value / 100)), innerRadius: 0.82 };
  val.fills = [paint(toneTokens[tone].solid)];
  add(f, abs(val, 0, 0));
  const readout = col({ name: 'Readout', w: size, gap: 0, cross: 'center' }, [
    text(String(value), { family: 'display', weight: 800, size: 40, line: 44, tracking: -2 }, 'text/primary', { name: 'health-value' }),
    text(label, 'smallStrong', toneTokens[tone].fg, { name: 'health-label' }),
  ]);
  add(f, abs(readout, 0, Math.round(size / 2) - 40));
  return f;
}

/** Tone over time: one bar per day, warm / neutral / hostile. */
export function toneTimeline(days: Array<'warm' | 'neutral' | 'hostile' | 'none'>, labels: [string, string], w = 321): FrameNode {
  const bw = Math.floor((w - (days.length - 1) * 4) / days.length);
  const bars = days.map((d, i) => {
    const hgt = d === 'warm' ? 44 : d === 'neutral' ? 26 : d === 'hostile' ? 56 : 6;
    const tok: Token = d === 'warm' ? 'positive/fg' : d === 'neutral' ? 'border/strong' : d === 'hostile' ? 'caution/fg' : 'bg/muted';
    return rect(bw, hgt, tok, 3, 'Day ' + (i + 1));
  });
  const legend = (tok: Token, l: string) => row({ name: l, gap: 6 }, [rect(10, 10, tok, 3, 'Swatch'), text(l, 'caption', 'text/secondary')]);
  return col({ name: 'Tone timeline', w: 'fill', gap: 10 }, [
    row({ name: 'Bars', w, h: 60, gap: 4, cross: 'end' }, bars),
    row({ name: 'Axis', w, main: 'between' }, [text(labels[0], 'caption', 'text/tertiary'), text(labels[1], 'caption', 'text/tertiary')]),
    row({ name: 'Legend', gap: 16 }, [legend('positive/fg', 'Warm'), legend('border/strong', 'Neutral'), legend('caution/fg', 'Hostile'), legend('bg/muted', 'No messages')]),
  ]);
}

export const REACTIONS: Array<[string, string]> = [
  ['heart', 'Support'],
  ['users', 'Same'],
  ['sparkle', 'Wow'],
  ['hand-heart', 'Care'],
];

export function reactionBar(counts: number[], mine = -1): FrameNode {
  return row(
    { name: 'Reactions', gap: 6, wrap: false },
    REACTIONS.map(([i, l], idx) =>
      row({ name: l, gap: 4, pad: [5, 9], radius: 999, fill: idx === mine ? 'brand/subtle' : 'bg/subtle', stroke: idx === mine ? 'brand/border' : undefined }, [
        icon(i, 14, idx === mine ? 'brand/fg' : 'text/secondary'),
        text(String(counts[idx] || 0), 'label', idx === mine ? 'brand/on-subtle' : 'text/secondary'),
      ]),
    ),
  );
}

export function nickAvatar(nick: string, tone: Tone, size = 36): FrameNode {
  return avatar(nick.slice(0, 2).toUpperCase(), size, tone);
}
