import { Token, tokenHex } from '../tokens';
import { ctx } from '../core/ctx';
import { Kid, abs, add, box, circle, col, gradient, icon, rect, row, text } from '../core/ui';
import { nickAvatar } from './chat';

/**
 * Notes: a private journal. Moods use the member identity hues, never red or green, so a feeling
 * never reads as a Red Flag or Green Flag. Notes are never scored.
 */
export type Mood = 'Calm' | 'Happy' | 'Uneasy' | 'Anxious' | 'Confused';

export const MOODS: Array<{ key: Mood; icon: string; hue: string }> = [
  { key: 'Calm', icon: 'leaf', hue: 'sky' },
  { key: 'Happy', icon: 'smile', hue: 'magenta' },
  { key: 'Uneasy', icon: 'frown', hue: 'brown' },
  { key: 'Anxious', icon: 'zap', hue: 'purple' },
  { key: 'Confused', icon: 'meh', hue: 'slate' },
];

const moodOf = (m: Mood) => MOODS.filter((x) => x.key === m)[0];
export const moodFg = (m: Mood) => ('name/' + moodOf(m).hue) as Token;
export const moodTint = (m: Mood) => ('name/' + moodOf(m).hue + '-tint') as Token;
export const moodIcon = (m: Mood) => moodOf(m).icon;

export function moodPill(m: Mood, small = false): FrameNode {
  return row({ name: 'Mood · ' + m, gap: 4, pad: small ? [2, 8, 2, 6] : [4, 10, 4, 8], radius: 999, fill: moodTint(m) }, [icon(moodIcon(m), small ? 12 : 14, moodFg(m)), text(m, 'label', moodFg(m))]);
}

export function moodDot(m: Mood | null, size = 32, today = false): FrameNode {
  if (!m) return box({ name: 'No note', dir: 'h', w: size, h: size, radius: size / 2, stroke: 'border/strong', dash: [3, 3], main: 'center', cross: 'center' }, [today ? icon('plus', Math.round(size * 0.45), 'brand/fg') : null]);
  return box({ name: 'Mood ' + m, dir: 'h', w: size, h: size, radius: size / 2, fill: moodTint(m), stroke: today ? 'brand/fg' : undefined, strokeW: 2, main: 'center', cross: 'center' }, [icon(moodIcon(m), Math.round(size * 0.5), moodFg(m))]);
}

/** Five large mood tiles. The selected one gets its hue as a ring and a filled label. */
export function moodPicker(selected: Mood | null, w: number | 'fill' = 'fill'): FrameNode {
  return row(
    { name: 'Mood picker', w, gap: 8 },
    MOODS.map((m) => {
      const on = m.key === selected;
      return col({ name: m.key, w: 'fill', gap: 6, pad: [10, 0, 8, 0], radius: 16, cross: 'center', fill: on ? moodTint(m.key) : 'bg/surface', stroke: on ? moodFg(m.key) : 'border/default', strokeW: on ? 2 : 1 }, [
        icon(m.icon, 24, on ? moodFg(m.key) : 'text/secondary'),
        text(m.key, on ? 'smallStrong' : 'label', on ? moodFg(m.key) : 'text/secondary'),
      ]);
    }),
  );
}

export type Stage = 'Just matched' | 'Talking' | 'Dating';

export function personChip(nick: string, stage?: Stage, selected = false): FrameNode {
  return row({ name: 'Person · ' + nick, gap: 8, pad: [4, 12, 4, 4], radius: 999, fill: selected ? 'brand/subtle' : 'bg/surface', stroke: selected ? 'brand/border' : 'border/default' }, [
    nickAvatar(nick, undefined, 26),
    text(nick, 'smallStrong', 'text/primary'),
    stage ? text('· ' + stage, 'caption', 'text/tertiary') : null,
  ]);
}

export function tagChip(label: string): FrameNode {
  return row({ name: 'Tag ' + label, gap: 4, pad: [3, 8], radius: 8, fill: 'bg/subtle' }, [text('#' + label, 'caption', 'text/secondary')]);
}

export interface NoteSpec {
  time: string;
  mood: Mood;
  body: string;
  person?: string;
  tags?: string[];
  pinned?: boolean;
  linked?: string;
  evidence?: boolean;
  lines?: number;
}

/** A journal entry. A soft mood-coloured spine on the left makes a scroll of notes read as a mood history. */
export function noteCard(n: NoteSpec, w: number | 'fill' = 'fill'): FrameNode {
  const meta: Kid[] = [
    n.person ? row({ name: 'About', gap: 6 }, [nickAvatar(n.person, undefined, 20), text(n.person, 'smallStrong', 'text/primary')]) : row({ name: 'General', gap: 6 }, [icon('notebook-pen', 14, 'text/tertiary'), text('General', 'smallStrong', 'text/secondary')]),
    text('· ' + n.time, 'caption', 'text/tertiary'),
    box({ name: 'Spacer', w: 'fill', h: 1 }),
    n.pinned ? icon('pin', 14, 'brand/fg') : null,
    n.evidence ? row({ name: 'Evidence', gap: 4, pad: [2, 8], radius: 999, fill: 'bg/subtle' }, [icon('lock', 12, 'text/secondary'), text('Evidence', 'label', 'text/secondary')]) : null,
    moodPill(n.mood, true),
  ];
  const body = col({ name: 'Body', w: 'fill', gap: 10, pad: [14, 16, 14, 14] }, [
    row({ name: 'Meta', w: 'fill', gap: 6 }, meta),
    text(n.body, 'body', 'text/primary', { w: 'fill', maxLines: n.lines === undefined ? 3 : n.lines }),
    n.linked
      ? row({ name: 'Linked', gap: 6, pad: [6, 10], radius: 10, fill: 'bg/subtle' }, [icon(n.linked.indexOf('Chat') >= 0 ? 'message' : 'gauge', 14, 'brand/fg'), text(n.linked, 'caption', 'text/secondary')])
      : null,
    n.tags && n.tags.length ? row({ name: 'Tags', gap: 6 }, n.tags.map(tagChip)) : null,
  ]);
  return row({ name: 'Note · ' + n.time, w, gap: 0, radius: 18, fill: 'bg/surface', stroke: 'border/default', clip: true, cross: 'start' }, [box({ name: 'Mood spine', w: 4, h: 'fill', fill: moodFg(n.mood) }), body]);
}

/** Seven days of mood dots with the day letters underneath. Empty days are dashed; today carries a plus. */
export function weekStrip(days: Array<[string, Mood | null]>, today: number, w: number | 'fill' = 'fill', dot = 34): FrameNode {
  return row(
    { name: 'Week', w, gap: 0, main: 'between' },
    days.map(([d, m], i) =>
      col({ name: d, gap: 6, cross: 'center' }, [moodDot(m, dot, i === today), text(d, i === today ? 'label' : 'caption', i === today ? 'brand/fg' : 'text/tertiary')]),
    ),
  );
}

export const WEEK: Array<[string, Mood | null]> = [
  ['M', 'Calm'],
  ['T', 'Happy'],
  ['W', null],
  ['T', 'Uneasy'],
  ['F', 'Anxious'],
  ['S', 'Calm'],
  ['S', 'Happy'],
];

/** Log my gut: a slider from uneasy to comfortable. value runs 0 to 1. */
export function gutSlider(value: number, w = 353, label = 'Fairly comfortable'): FrameNode {
  const f = box({ name: 'Gut slider', dir: 'none', w, h: 118 });
  const from = tokenHex('name/brown' as Token, ctx.theme);
  const mid = tokenHex('name/slate' as Token, ctx.theme);
  const to = tokenHex('name/sky' as Token, ctx.theme);
  const track = rect(w, 14, [gradient([[from, 0], [mid, 0.5], [to, 1]], 90)], 7, 'Track');
  track.opacity = 0.9;
  add(f, abs(track, 0, 56));
  for (let i = 1; i < 10; i++) add(f, abs(rect(2, 6, 'bg/canvas', 1, 'Tick'), Math.round((w * i) / 10) - 1, 60));
  const tx = Math.round(value * (w - 40));
  add(f, abs(box({ name: 'Thumb', dir: 'h', w: 40, h: 40, radius: 20, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2', main: 'center', cross: 'center' }, [icon('leaf', 20, 'name/sky' as Token)]), tx, 43));
  const bubble = row({ name: 'Value', gap: 6, pad: [6, 12], radius: 999, fill: 'bg/inverse' }, [text(label, 'smallStrong', 'text/inverse')]);
  add(f, abs(bubble, Math.max(0, Math.min(w - bubble.width, tx + 20 - Math.round(bubble.width / 2))), 0));
  add(f, abs(row({ name: 'Ends', w, gap: 0, main: 'between' }, [
    row({ name: 'Uneasy', gap: 4 }, [icon('frown', 16, 'name/brown' as Token), text('Uneasy', 'label', 'text/secondary')]),
    row({ name: 'Comfortable', gap: 4 }, [text('Comfortable', 'label', 'text/secondary'), icon('smile', 16, 'name/sky' as Token)]),
  ]), 0, 96));
  return f;
}

export type TimelineKind = 'note' | 'report' | 'chat' | 'gut';

/** One step on a person's timeline: a dot on a spine, then the entry. last hides the spine below the dot. */
export function timelineItem(kind: TimelineKind, date: string, content: SceneNode, last = false, dotToken?: Token): FrameNode {
  const iconFor: Record<TimelineKind, string> = { note: 'notebook-pen', report: 'gauge', chat: 'message', gut: 'sparkle' };
  const spine = col({ name: 'Spine', w: 28, h: 'fill', gap: 0, cross: 'center' }, [
    box({ name: 'Dot', dir: 'h', w: 28, h: 28, radius: 14, fill: dotToken ? dotToken : 'brand/subtle', main: 'center', cross: 'center' }, [icon(iconFor[kind], 14, 'brand/fg')]),
    last ? null : box({ name: 'Line', w: 2, h: 'fill', fill: 'border/default' }),
  ]);
  return row({ name: 'Timeline · ' + date, w: 'fill', gap: 12, cross: 'start' }, [
    spine,
    col({ name: 'Entry', w: 'fill', gap: 6, pad: [4, 0, last ? 0 : 18, 0] }, [text(date, 'caption', 'text/tertiary'), content]),
  ]);
}

/** Mood after each chat, as dots on a gentle line: the pattern a reflection would describe. */
export function moodRibbon(moods: Mood[], w = 321, h = 72): FrameNode {
  const level: Record<Mood, number> = { Happy: 0.1, Calm: 0.3, Confused: 0.55, Uneasy: 0.75, Anxious: 0.9 };
  const f = box({ name: 'Mood ribbon', dir: 'none', w, h });
  add(f, abs(rect(w, 1, 'border/default', 0, 'Base'), 0, h - 1));
  const step = moods.length > 1 ? (w - 28) / (moods.length - 1) : 0;
  moods.forEach((m, i) => {
    const x = Math.round(14 + i * step);
    const y = Math.round(10 + level[m] * (h - 34));
    add(f, abs(rect(2, h - y - 14, 'border/default', 1, 'Stem'), x - 1, y + 14));
    const c = circle(28, moodTint(m), 'Mood ' + m);
    add(f, abs(c, x - 14, y - 4));
    add(f, abs(icon(moodIcon(m), 14, moodFg(m)), x - 7, y + 3));
  });
  return f;
}
