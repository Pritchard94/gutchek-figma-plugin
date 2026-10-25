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

// ---------------------------------------------------------------- room messages (Discord-style stream)

export type PostType = 'Story' | 'Question' | 'Advice' | 'Win';
const TYPE_TONE: Record<PostType, Tone> = { Story: 'brand', Question: 'warning', Advice: 'neutral', Win: 'positive' };

export interface RoomMsg {
  nick: string;
  tone: Tone;
  time?: string;
  body: string;
  role?: 'mod' | 'bot';
  type?: PostType;
  replyTo?: { nick: string; tone: Tone; text: string };
  reactions?: Array<[number, number]>;
  mine?: number;
  thread?: { count: string; last: string; people: Array<[string, Tone]> };
  cont?: boolean;
  ephemeral?: boolean;
  edited?: boolean;
  /** Post actions bar: like, react, reply, quote, save, share. */
  actions?: { likes: number; liked?: boolean; replies?: number; quotes?: number; saved?: boolean };
  /** Quoted post embedded below the body. */
  quote?: { nick: string; tone: Tone; type?: PostType; text: string; room?: string };
}

/** Outline icon with its shapes filled, for active states like a liked heart or a saved bookmark. */
export function filledIcon(name: string, size: number, token: Token): SceneNode {
  const n = icon(name, size, token);
  const p = paint(token);
  if ('findAll' in n) {
    for (const v of (n as InstanceNode).findAll((c) => c.type === 'VECTOR' || c.type === 'ELLIPSE' || c.type === 'RECTANGLE')) (v as VectorNode).fills = [p];
  }
  return n;
}

function actionItem(iconName: string, label: string | null, token: Token, filled = false, name?: string): FrameNode {
  return row({ name: name || iconName, gap: 5, pad: [4, 2] }, [
    filled ? filledIcon(iconName, 18, token) : icon(iconName, 18, token),
    label !== null ? text(label, 'label', token) : null,
  ]);
}

export function postActions(a: NonNullable<RoomMsg['actions']>): FrameNode {
  return row({ name: 'Post actions', w: 'fill', gap: 0, main: 'between', pad: [2, 0, 0, 0] }, [
    actionItem('heart', String(a.likes), a.liked ? 'caution/fg' : 'text/secondary', !!a.liked, 'like'),
    actionItem('smile', null, 'text/secondary', false, 'react'),
    actionItem('message', a.replies !== undefined ? String(a.replies) : null, 'text/secondary', false, 'reply'),
    actionItem('quote', a.quotes !== undefined ? String(a.quotes) : null, 'text/secondary', false, 'quote'),
    actionItem('bookmark', null, a.saved ? 'brand/fg' : 'text/secondary', !!a.saved, 'save'),
    actionItem('share', null, 'text/secondary', false, 'share'),
  ]);
}

export function quoteEmbed(q: NonNullable<RoomMsg['quote']>): FrameNode {
  return col({ name: 'Quoted post', w: 'fill', gap: 6, pad: 12, radius: 12, fill: 'bg/surface', stroke: 'border/strong' }, [
    row({ name: 'Head', gap: 6, w: 'fill' }, [
      nickAvatar(q.nick, q.tone, 18),
      text(q.nick, 'smallStrong', 'text/primary'),
      q.type ? typeTag(q.type) : null,
      q.room ? text('in ' + q.room, 'caption', 'text/tertiary', { w: 'fill', maxLines: 1 }) : null,
    ]),
    text(q.text, 'small', 'text/secondary', { w: 'fill', maxLines: 3 }),
  ]);
}

function roleBadge(label: string): FrameNode {
  return box({ name: 'Role', dir: 'h', pad: [1, 5], radius: 4, fill: 'brand/solid', cross: 'center' }, [text(label, { family: 'ui', weight: 700, size: 10, line: 14, tracking: 4 }, 'text/on-solid')]);
}

function typeTag(t: PostType): FrameNode {
  const tt = toneTokens[TYPE_TONE[t]];
  return box({ name: 'Type', dir: 'h', pad: [1, 6], radius: 4, fill: tt.bg, cross: 'center' }, [text(t, { family: 'ui', weight: 600, size: 11, line: 14 }, tt.fg)]);
}

function reactionChips(list: Array<[number, number]>, mine?: number): FrameNode {
  const chips = list.map(([idx, count]) => {
    const on = idx === mine;
    const [iconName, label] = REACTIONS[idx];
    return row({ name: label, gap: 4, pad: [3, 8], radius: 8, fill: on ? 'brand/subtle' : 'bg/subtle', stroke: on ? 'brand/border' : undefined }, [
      icon(iconName, 14, on ? 'brand/fg' : 'text/secondary'),
      text(String(count), 'label', on ? 'brand/on-subtle' : 'text/secondary'),
    ]);
  });
  chips.push(row({ name: 'Add reaction', pad: [3, 8], radius: 8, fill: 'bg/subtle' }, [icon('smile', 14, 'text/tertiary')]));
  return row({ name: 'Reactions', gap: 6, wrap: true, wrapGap: 6, w: 'fill' }, chips);
}

function threadChip(t: NonNullable<RoomMsg['thread']>): FrameNode {
  const faces = row({ name: 'Faces', gap: -6 }, t.people.map(([n, tone]) => {
    const a = nickAvatar(n, tone, 18);
    a.strokes = [paint('bg/surface')];
    a.strokeWeight = 1.5;
    a.strokeAlign = 'OUTSIDE';
    return a;
  }));
  return row({ name: 'Thread', gap: 8, pad: [7, 10], radius: 10, fill: 'bg/surface', stroke: 'border/default' }, [
    icon('messages', 16, 'brand/fg'),
    text(t.count, 'smallStrong', 'brand/fg'),
    faces,
    text(t.last, 'caption', 'text/tertiary'),
    icon('chevron-right', 14, 'text/tertiary'),
  ]);
}

function replyRef(r: NonNullable<RoomMsg['replyTo']>): FrameNode {
  const elbow = box({ name: 'Elbow', dir: 'h', w: 24, h: 10, stroke: 'border/strong', strokeW: 2, radius: [6, 0, 0, 0] });
  elbow.strokeRightWeight = 0;
  elbow.strokeBottomWeight = 0;
  elbow.strokeTopWeight = 2;
  elbow.strokeLeftWeight = 2;
  return row({ name: 'Replying to', gap: 6, w: 'fill', pad: [0, 0, 0, 18], cross: 'end' }, [
    elbow,
    nickAvatar(r.nick, r.tone, 16),
    text(r.nick, 'label', 'text/secondary'),
    text(r.text, 'caption', 'text/tertiary', { w: 'fill', maxLines: 1 }),
  ]);
}

/** One message in a room stream. Continuations drop the avatar and header, like Discord. */
export function roomMessage(m: RoomMsg): FrameNode {
  const nameToken: Token = m.role ? 'brand/fg' : 'text/primary';
  const header = m.cont
    ? null
    : row({ name: 'Header', gap: 6, w: 'fill' }, [
        text(m.nick, 'bodyStrong', nameToken, { name: 'nickname' }),
        m.role ? roleBadge(m.role === 'mod' ? 'MOD' : 'BOT') : null,
        m.type ? typeTag(m.type) : null,
        m.time ? text(m.time, 'caption', 'text/tertiary', { name: 'time' }) : null,
      ]);
  const left = m.cont
    ? box({ name: 'Gutter', dir: 'h', w: 40, h: 1 })
    : m.role === 'bot'
      ? box({ name: 'Bot avatar', dir: 'h', w: 40, h: 40, radius: 20, fill: 'brand/solid', main: 'center', cross: 'center' }, [icon('shield-check', 20, 'text/on-solid')])
      : nickAvatar(m.nick, m.tone, 40);
  const content = col({ name: 'Content', gap: 4, w: 'fill' }, [
    header,
    row({ name: 'Body row', gap: 6, w: 'fill', cross: 'end' }, [
      text(m.body, 'body', 'text/primary', { name: 'body', w: 'fill' }),
    ]),
    m.edited ? text('(edited)', 'caption', 'text/tertiary') : null,
    m.quote ? quoteEmbed(m.quote) : null,
    m.reactions && m.reactions.length ? reactionChips(m.reactions, m.mine) : null,
    m.thread ? threadChip(m.thread) : null,
    m.actions ? postActions(m.actions) : null,
    m.ephemeral
      ? row({ name: 'Ephemeral', gap: 6 }, [icon('eye-off', 13, 'text/tertiary'), text('Only you can see this ·', 'caption', 'text/tertiary'), text('Dismiss', 'caption', 'brand/fg')])
      : null,
  ]);
  return col(
    { name: 'Message · ' + m.nick, w: 'fill', gap: 4, pad: m.ephemeral ? [10, 10] : [m.cont ? 0 : 6, 0, 0, 0], radius: m.ephemeral ? 12 : 0, fill: m.ephemeral ? 'brand/subtle' : null, stroke: m.ephemeral ? 'brand/border' : undefined },
    [m.replyTo ? replyRef(m.replyTo) : null, row({ name: 'Row', gap: 12, w: 'fill', cross: 'start' }, [left, content])],
  );
}

export function streamDivider(label: string, tone: 'neutral' | 'new' = 'neutral'): FrameNode {
  const lineTok: Token = tone === 'new' ? 'caution/fg' : 'border/default';
  return row({ name: 'Divider · ' + label, w: 'fill', gap: 10, pad: [4, 0] }, [
    box({ name: 'Line', dir: 'h', w: 'fill', h: 1, fill: lineTok }),
    tone === 'new'
      ? box({ name: 'New', dir: 'h', pad: [1, 6], radius: 4, fill: 'caution/solid' }, [text(label, { family: 'ui', weight: 700, size: 10, line: 14, tracking: 4 }, 'text/on-solid')])
      : text(label, 'label', 'text/tertiary'),
    tone === 'new' ? null : box({ name: 'Line', dir: 'h', w: 'fill', h: 1, fill: lineTok }),
  ]);
}

export function systemLine(iconName: string, str: string): FrameNode {
  return row({ name: 'System', w: 'fill', gap: 10, pad: [2, 0, 2, 12] }, [icon(iconName, 16, 'text/tertiary'), text(str, 'small', 'text/secondary', { w: 'fill' })]);
}

/** Bottom composer, like Discord: attach, message field, emoji, send. */
export function composerBar(placeholder: string, value?: string, blocked = false): FrameNode {
  return row({ name: 'Composer', w: 'fill', gap: 10, cross: 'center' }, [
    box({ name: 'Attach', dir: 'h', w: 40, h: 40, radius: 20, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('plus', 20, 'text/secondary')]),
    row({ name: 'Field', w: 'fill', h: value ? undefined : 44, pad: [10, 14], gap: 8, radius: 22, fill: 'bg/subtle', stroke: blocked ? 'caution/fg' : undefined, strokeW: 1.5, cross: value ? 'end' : 'center' }, [
      text(value || placeholder, 'body', value ? 'text/primary' : 'text/tertiary', { w: 'fill', name: 'value' }),
      icon('smile', 22, 'text/tertiary'),
    ]),
    box({ name: 'Send', dir: 'h', w: 40, h: 40, radius: 20, fill: value ? (blocked ? 'bg/muted' : 'brand/solid') : 'bg/subtle', main: 'center', cross: 'center' }, [icon('arrow-right', 20, value && !blocked ? 'text/on-solid' : 'text/tertiary')]),
  ]);
}
