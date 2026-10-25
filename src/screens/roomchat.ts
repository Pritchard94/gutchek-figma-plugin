import { box, col, divider, fill, icon, row, text } from '../core/ui';
import { REACTIONS, RoomMsg, composerBar, roomMessage, streamDivider, systemLine } from '../components/chat';
import { addWallpaper } from '../components/doodles';
import { btn, center, group, iconTile, link, radioGroup, screen, use, withSheet } from './kit';

const ROOM = 'Talking Stage Diaries';

interface HeaderOpts {
  title: string;
  sub: string;
  muted?: boolean;
  backTo: string;
  bellTo?: string;
  moreTo?: string;
  tile?: boolean;
}

function roomHeader(o: HeaderOpts): FrameNode {
  const btnBox = (iconName: string, name: string, target?: string, token: 'text/primary' | 'text/tertiary' = 'text/primary') => {
    const b = box({ name, dir: 'h', w: 40, h: 40, radius: 20, main: 'center', cross: 'center' }, [icon(iconName, 22, token)]);
    return target ? link(b, target) : b;
  };
  return row({ name: 'Room header', w: 'fill', pad: [4, 8, 8, 4], gap: 8, fill: 'bg/surface' }, [
    btnBox('chevron-left', 'Back', o.backTo),
    o.tile === false ? null : iconTile('message', 'brand', 36),
    col({ name: 'Title', gap: 0, w: 'fill' }, [
      row({ name: 'Name', gap: 6, w: 'fill' }, [text(o.title, 'title', 'text/primary', { maxLines: 1 }), o.muted ? icon('bell-off', 14, 'text/tertiary') : null]),
      text(o.sub, 'caption', 'text/tertiary', { w: 'fill', maxLines: 1 }),
    ]),
    btnBox(o.muted ? 'bell-off' : 'bell', 'Mute', o.bellTo, o.muted ? 'text/tertiary' : 'text/primary'),
    btnBox('more', 'More', o.moreTo),
  ]);
}

function pinnedBar(str: string): FrameNode {
  return row({ name: 'Pinned', w: 'fill', pad: [8, 16], gap: 8, fill: 'bg/surface' }, [
    icon('pin', 14, 'brand/fg'),
    text(str, 'caption', 'text/secondary', { w: 'fill', maxLines: 1 }),
    icon('chevron-right', 14, 'text/tertiary'),
  ]);
}

function chrome(header: FrameNode, pinned?: FrameNode): FrameNode {
  return col({ name: 'Chrome', w: 'fill' }, [header, divider(), pinned || null, pinned ? divider() : null]);
}

function stream(kids: SceneNode[]): FrameNode {
  return col({ name: 'Stream', w: 'fill', pad: [10, 16, 16, 12], gap: 12 }, kids);
}

const FEED: RoomMsg[] = [
  { nick: 'NaijaBelle', tone: 'warning', type: 'Question', time: 'Today 19:40', body: 'Someone I met last week keeps asking to move to WhatsApp on day one. Is that normal or a red flag for you all?', reactions: [[1, 9], [0, 3]], mine: 1, thread: { count: '8 replies', last: 'Mod_Kemi · 10m', people: [['Tayo', 'neutral'], ['Mod', 'brand'], ['Ronke', 'positive']] } },
  { nick: 'Tayo_Writes', tone: 'neutral', time: 'Today 19:46', body: 'Day one is too fast for me. Anyone who sulks when you say no is showing you who they are.', replyTo: { nick: 'NaijaBelle', tone: 'warning', text: 'Is that normal or a red flag for you all?' }, reactions: [[0, 14]] },
  { nick: 'Tayo_Writes', tone: 'neutral', body: 'Keep it on the app until you have met somewhere public.', cont: true },
];

const FEED_NEW: RoomMsg[] = [
  { nick: 'QuietStorm_24', tone: 'brand', type: 'Win', time: 'Today 19:58', body: 'He said "no pressure" and actually meant it. Waited two weeks for me to feel ready, then picked somewhere public without me asking.', reactions: [[0, 24], [3, 11], [2, 3]], mine: 0, thread: { count: '14 replies', last: 'NaijaBelle · 2m', people: [['NaijaBelle', 'warning'], ['Tayo', 'neutral'], ['Mod', 'brand']] } },
  { nick: 'Mod_Kemi', tone: 'brand', role: 'mod', time: 'Today 20:40', body: 'Lovely to see wins shared here. Reminder: keep details that could identify anyone out of posts and replies.', reactions: [[0, 12]] },
];

function feed(o: { blocked?: boolean; name?: string } = {}): FrameNode {
  const header = chrome(
    roomHeader({ title: ROOM, sub: '1.2k members · 48 online', backTo: 'roomsList', bellTo: 'muteSheet', moreTo: 'roomAbout' }),
    pinnedBar('Pinned · Share your own experience. Never name or identify anyone.'),
  );
  const kids: SceneNode[] = [
    streamDivider('Today'),
    systemLine('clock', 'Slow mode is on. One message every 5 minutes.'),
    ...FEED.map((m) => roomMessage(m)),
    streamDivider('New', 'new'),
    ...FEED_NEW.map((m, i) => (i === 0 ? link(roomMessage(m), 'thread') : roomMessage(m))),
  ];
  if (o.blocked) {
    kids.push(
      roomMessage({
        nick: 'Libra Bot',
        tone: 'brand',
        role: 'bot',
        time: 'Now',
        body: 'Your message includes a name with a workplace and a phone number, so it was not posted. Warning others is welcome without identifying anyone.',
        ephemeral: true,
      }),
    );
  }
  const typeChips = row({ name: 'Post type', gap: 6 }, ['Story', 'Question', 'Advice', 'Win'].map((t, i) =>
    row({ name: t, pad: [4, 10], radius: 999, fill: i === (o.blocked ? 0 : 1) ? 'brand/subtle' : 'bg/subtle', stroke: i === (o.blocked ? 0 : 1) ? 'brand/border' : undefined }, [text(t, 'label', i === (o.blocked ? 0 : 1) ? 'brand/on-subtle' : 'text/secondary')]),
  ));
  const root = screen(
    {
      name: o.name || 'Room feed',
      top: header,
      main: 'end',
      pad: [0, 0, 0, 0],
      gap: 0,
      footerDivider: true,
      footer: [
        row({ name: 'Composer meta', w: 'fill', gap: 8 }, [typeChips, box({ name: 'Spacer', w: 'fill', h: 1 }), row({ name: 'Slow', gap: 4 }, [icon('clock', 12, 'text/tertiary'), text('5m', 'caption', 'text/tertiary')])]),
        o.blocked
          ? composerBar('', 'Be careful with Kunle from Access Bank Lekki, his number is 0803 555 0199', true)
          : link(composerBar('Message ' + ROOM), 'composer'),
      ],
    },
    [stream(kids)],
  );
  addWallpaper(root, 54 + Math.round(header.height));
  return root;
}

export const roomFeed = () => feed();
export const roomFeedBlocked = () => feed({ blocked: true, name: 'Room feed · Blocked by Libra Bot' });

export function thread(): FrameNode {
  const header = chrome(roomHeader({ title: 'Thread', sub: 'in ' + ROOM + ' · 14 replies', backTo: 'roomFeed', bellTo: 'muteSheet', moreTo: 'reportPost', tile: false }));
  const replies: RoomMsg[] = [
    { nick: 'NaijaBelle', tone: 'warning', time: '19:59', body: 'This is the energy we deserve. Happy for you!', reactions: [[0, 9]] },
    { nick: 'Tayo_Writes', tone: 'neutral', time: '20:03', body: 'Picking a public place without being asked is such a green flag.', reactions: [[0, 6], [1, 2]] },
    { nick: 'SoftLife_Ada', tone: 'positive', time: '20:15', body: 'Saving this for the days I need hope.', replyTo: { nick: 'QuietStorm_24', tone: 'brand', text: 'He said "no pressure" and actually meant it.' }, reactions: [[3, 4]] },
    { nick: 'Mod_Kemi', tone: 'brand', role: 'mod', time: '20:40', body: 'Lovely to see this. Keep details about him out of replies so it stays a story, not a profile.', reactions: [[0, 12]] },
  ];
  const root = screen(
    {
      name: 'Thread',
      top: header,
      pad: [0, 0, 0, 0],
      gap: 0,
      footerDivider: true,
      footer: [composerBar('Reply in thread')],
    },
    [
      stream([
        roomMessage({ nick: 'QuietStorm_24', tone: 'brand', type: 'Win', time: 'Today 19:58', body: 'He said "no pressure" and actually meant it. Waited two weeks for me to feel ready, then picked somewhere public without me asking.', reactions: [[0, 24], [3, 11], [2, 3]], mine: 0 }),
        streamDivider('14 replies'),
        ...replies.map((m) => roomMessage(m)),
      ]),
    ],
  );
  addWallpaper(root, 54 + Math.round(header.height));
  return root;
}

export function messageActions(): FrameNode {
  const quick = row(
    { name: 'Quick reactions', w: 'fill', gap: 10 },
    REACTIONS.map(([i, l]) =>
      col({ name: l, w: 'fill', gap: 6, cross: 'center', pad: [10, 0], radius: 16, fill: 'bg/subtle' }, [icon(i, 24, 'brand/fg'), text(l, 'label', 'text/secondary')]),
    ),
  );
  const action = (iconName: string, label: string, sub: string | null, danger = false, target?: string) => {
    const r = row({ name: label, w: 'fill', gap: 14, pad: [12, 16] }, [
      icon(iconName, 22, danger ? 'caution/fg' : 'text/primary'),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text(label, 'body', danger ? 'caution/fg' : 'text/primary'), sub ? text(sub, 'caption', 'text/tertiary', { w: 'fill' }) : null]),
    ]);
    return target ? link(r, target) : r;
  };
  return withSheet(
    roomFeed(),
    'QuietStorm_24',
    [
      text('"He said no pressure and actually meant it…"', 'small', 'text/secondary', { w: 'fill', maxLines: 1 }),
      quick,
      group(
        [
          action('reply', 'Reply', null),
          action('messages', 'Open thread', '14 replies', false, 'thread'),
          action('file', 'Copy text', null),
          action('bell-off', 'Mute QuietStorm_24', 'Hide their messages in this room. They are not told.'),
          action('flag', 'Report message', null, true, 'reportPost'),
        ],
        'Actions',
        52,
      ),
    ],
    'Room feed · Message actions',
  );
}

export function muteSheet(): FrameNode {
  return withSheet(
    roomFeed(),
    'Mute ' + ROOM,
    [
      radioGroup([
        { label: 'For 1 hour' },
        { label: 'For 8 hours', on: true },
        { label: 'For 24 hours' },
        { label: 'For a week' },
        { label: 'Until I turn it back on' },
      ]),
      fill(use('ListRow', { Trailing: 'SwitchOn' }, { title: 'Still notify me about', subtitle: 'Replies to me and moderator notices' }, { icons: { icon: 'bell' } })),
      center('Muted rooms stay in your list, greyed out, with no badges.', 'caption', 'text/tertiary'),
      link(btn('Mute room', 'Primary', 'Large', 'bell-off'), 'roomsList'),
    ],
    'Room feed · Mute room',
  );
}

