import { Tone, abs, add, box, col, divider, fill, gradient, hexPaint, icon, pill, row, text } from '../core/ui';
import { glyph } from '../brand';
import { use } from '../components/library';
import { RoomMsg, composerBar, filledIcon, nameToken, nickAvatar, roomMessage, streamDivider, systemLine } from '../components/chat';
import { addWallpaper } from '../components/doodles';
import { APP_H, APP_W, RAIL_W, alink, appFrame, btn, iconTileW, modal } from './shell';

const LIST_W = 300;
const PANEL_W = 360;
const ROOM = 'Talking Stage Diaries';
const WIN = 'He said "no pressure" and actually meant it. Waited two weeks for me to feel ready, then picked somewhere public without me asking.';

function roomsColumn(): FrameNode {
  const item = (name: string, preview: string, iconName: string, tone: Tone, o: { unread?: string; muted?: boolean; active?: boolean } = {}) =>
    alink(
      row({ name, w: 'fill', gap: 10, pad: [10, 10], radius: 12, fill: o.active ? 'brand/subtle' : null }, [
        box({ name: 'Tile', dir: 'h', w: 36, h: 36, radius: 10, fill: tone === 'brand' ? 'brand/subtle' : tone === 'positive' ? 'positive/subtle' : tone === 'warning' ? 'warning/subtle' : 'bg/subtle', main: 'center', cross: 'center', opacity: o.muted ? 0.55 : 1 }, [icon(iconName, 18, tone === 'brand' ? 'brand/fg' : tone === 'positive' ? 'positive/fg' : tone === 'warning' ? 'warning/fg' : 'text/secondary')]),
        col({ name: 'Text', gap: 0, w: 'fill' }, [
          text(name, o.unread ? 'smallStrong' : 'small', o.muted ? 'text/tertiary' : 'text/primary', { w: 'fill', maxLines: 1 }),
          text(preview, 'caption', 'text/tertiary', { w: 'fill', maxLines: 1 }),
        ]),
        o.unread ? box({ name: 'Badge', dir: 'h', h: 20, pad: [0, 7], radius: 10, fill: 'brand/solid', cross: 'center' }, [text(o.unread, { family: 'ui', weight: 700, size: 11, line: 14 }, 'text/on-solid')]) : o.muted ? icon('bell-off', 14, 'text/tertiary') : null,
      ]),
      'wRooms',
    );
  return col({ name: 'Rooms list', w: LIST_W, h: APP_H, pad: [20, 12], gap: 12, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', gap: 8, pad: [0, 8] }, [text('Gists', 'h3', 'text/primary', { w: 'fill' }), alink(icon('shield', 20, 'text/secondary'), 'wRooms')]),
    box({ name: 'Search', dir: 'h', w: 'fill', h: 36, pad: [0, 12], gap: 8, radius: 10, fill: 'bg/subtle', cross: 'center' }, [icon('search', 16, 'text/tertiary'), text('Find a room', 'small', 'text/tertiary')]),
    text('Your rooms', 'overline', 'text/tertiary'),
    col({ name: 'Joined', w: 'fill', gap: 2 }, [
      item(ROOM, 'NaijaBelle: Is that normal or a red flag…', 'message', 'brand', { unread: '12', active: true }),
      item('Safety First', 'Mod_Tunde: New scam pattern, fake courier fees', 'shield-check', 'positive', { unread: '3' }),
      item('First Date Stories', 'Tayo_Writes: Update on the cinema date…', 'calendar', 'warning', { muted: true }),
    ]),
    text('Discover', 'overline', 'text/tertiary'),
    alink(row({ name: 'Discover', w: 'fill', gap: 10, pad: [10, 10], radius: 12 }, [box({ name: 'Tile', dir: 'h', w: 36, h: 36, radius: 10, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('globe', 18, 'text/secondary')]), text('Discover rooms', 'small', 'text/primary', { w: 'fill' }), icon('chevron-right', 16, 'text/tertiary')]), 'wDiscover'),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    row({ name: 'Me', w: 'fill', gap: 10, pad: 10, radius: 12, fill: 'bg/subtle' }, [nickAvatar('QuietStorm', 'brand', 32), col({ name: 'Text', gap: 0, w: 'fill' }, [text('QuietStorm_24', 'smallStrong', 'text/primary'), text('Your room nickname', 'caption', 'text/tertiary')]), icon('settings', 16, 'text/tertiary')]),
  ]);
}

const STREAM: RoomMsg[] = [
  { nick: 'NaijaBelle', tone: 'warning', type: 'Question', time: 'Today 19:40', body: 'Someone I met last week keeps asking to move to WhatsApp on day one. Is that normal or a red flag for you all?', reactions: [[1, 9]], mine: 1, thread: { count: '8 replies', last: 'Mod_Kemi · 10m', people: [['Tayo', 'neutral'], ['Mod', 'brand']] }, actions: { likes: 31, replies: 8, quotes: 2 } },
  { nick: 'Tayo_Writes', tone: 'neutral', time: 'Today 19:46', body: 'Day one is too fast for me. Anyone who sulks when you say no is showing you who they are.', replyTo: { nick: 'NaijaBelle', tone: 'warning', text: 'Is that normal or a red flag for you all?' }, reactions: [[0, 14]] },
];

const STREAM_NEW: RoomMsg[] = [
  { nick: 'QuietStorm_24', tone: 'brand', me: true, type: 'Win', time: 'Today 19:58', body: WIN, reactions: [[0, 24], [3, 11]], mine: 0, thread: { count: '14 replies', last: 'NaijaBelle · 2m', people: [['NaijaBelle', 'warning'], ['Tayo', 'neutral'], ['Mod', 'brand']] }, actions: { likes: 86, liked: true, replies: 14, quotes: 5, saved: true } },
  { nick: 'Ronke.writes', tone: 'positive', isNew: true, mention: true, type: 'Story', time: 'Today 20:21', body: '@QuietStorm_24 needed this today. The ones who respect your pace are the keepers.', quote: { nick: 'QuietStorm_24', tone: 'brand', type: 'Win', text: WIN }, actions: { likes: 19, replies: 2, quotes: 0 } },
];

function streamColumn(width: number): FrameNode {
  const headBtn = (iconName: string, name: string, to?: string) => {
    const b = box({ name, dir: 'h', w: 36, h: 36, radius: 18, main: 'center', cross: 'center' }, [icon(iconName, 20, 'text/secondary')]);
    return to ? alink(b, to) : b;
  };
  const header = col({ name: 'Header', w: 'fill', fill: 'bg/surface' }, [
    row({ name: 'Bar', w: 'fill', h: 64, pad: [0, 20], gap: 10, cross: 'center' }, [
      alink(
        row({ name: 'Room title', gap: 10, w: 'fill' }, [
          iconTileW('message', 'brand', 36),
          col({ name: 'Title', gap: 0, w: 'fill' }, [row({ name: 'Name', gap: 4 }, [text(ROOM, 'title', 'text/primary'), icon('chevron-down', 16, 'text/tertiary')]), text('1.2k members · 48 online · slow mode 5m · click for room info', 'caption', 'text/tertiary')]),
        ]),
        'wRoomsAbout',
      ),
      headBtn('bell', 'Mute', 'wRoomsMute'),
      headBtn('pin', 'Pinned'),
      headBtn('users', 'Members', 'wRoomsAbout'),
      headBtn('more', 'More'),
    ]),
    divider(),
    row({ name: 'Pinned', w: 'fill', pad: [8, 20], gap: 8 }, [icon('pin', 14, 'brand/fg'), text('Pinned · Share your own experience. Never name or identify anyone.', 'caption', 'text/secondary', { w: 'fill' })]),
    divider(),
  ]);
  const msgs = STREAM_NEW.map((m, i) => {
    const node = roomMessage(m);
    if (i === 0) {
      for (const [layer, to] of [
        ['Thread', 'wRoomsThread'],
        ['share', 'wRoomsShare'],
        ['save', 'wSavedThreads'],
      ] as Array<[string, string]>) {
        const n = node.findOne((c) => c.name === layer);
        if (n) alink(n, to);
      }
    }
    return node;
  });
  const streamBody = col({ name: 'Stream', w: 'fill', h: 'fill', pad: [16, 24, 16, 20], gap: 14, main: 'end', clip: true }, [
    streamDivider('Today'),
    systemLine('clock', 'Slow mode is on. One message every 5 minutes.'),
    ...STREAM.map((m) => roomMessage(m)),
    streamDivider('New', 'new'),
    ...msgs,
  ]);
  const composer = col({ name: 'Composer area', w: 'fill', pad: [12, 20, 16, 20], gap: 8, fill: 'bg/canvas' }, [
    row({ name: 'Meta', gap: 6, w: 'fill' }, [
      ...['Story', 'Question', 'Advice', 'Win'].map((t, i) =>
        row({ name: t, pad: [4, 10], radius: 999, fill: i === 0 ? 'brand/subtle' : 'bg/subtle', stroke: i === 0 ? 'brand/border' : undefined }, [text(t, 'label', i === 0 ? 'brand/on-subtle' : 'text/secondary')]),
      ),
      box({ name: 'Spacer', w: 'fill', h: 1 }),
      text('Posting as QuietStorm_24 · Gist Bot checks every post', 'caption', 'text/tertiary'),
    ]),
    composerBar('Message ' + ROOM),
  ]);
  const c = col({ name: 'Room', w: width, h: APP_H }, [header, streamBody, divider(), composer]);
  addWallpaper(c, 0, 0.08);
  return c;
}

function infoPanel(): FrameNode {
  const member = (nick: string, tone: Tone, role?: string) =>
    row({ name: nick, w: 'fill', gap: 10 }, [nickAvatar(nick, tone, 28), text(nick, 'smallStrong', nameToken(nick), { w: 'fill' }), role ? pill(role, 'brand') : null]);
  const rules = ['Share your own experience only', 'Never identify anyone', 'No threats, hate or selling', 'Nothing involving minors', 'Share only with the Share button'];
  return col({ name: 'Room info', w: PANEL_W, h: APP_H, pad: [20, 20], gap: 20, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', gap: 8 }, [text('About this room', 'title', 'text/primary', { w: 'fill' }), alink(box({ name: 'Close', dir: 'h', w: 32, h: 32, radius: 16, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('x', 16, 'text/secondary')]), 'wRooms')]),
    text('Stories and advice from the early days of getting to know someone. Approval required to join. Posts leave the feed after 30 days.', 'small', 'text/secondary', { w: 'fill' }),
    col({ name: 'Rules', w: 'fill', gap: 10 }, [text('Rules', 'overline', 'text/tertiary'), ...rules.map((r, i) => row({ name: r, gap: 10, w: 'fill' }, [box({ name: 'N', dir: 'h', w: 22, h: 22, radius: 11, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(String(i + 1), 'label', 'brand/on-subtle')]), text(r, 'small', 'text/primary', { w: 'fill' })]))]),
    divider(),
    col({ name: 'Online', w: 'fill', gap: 10 }, [text('Moderators', 'overline', 'text/tertiary'), member('Mod_Kemi', 'brand', 'MOD'), member('Mod_Tunde', 'positive', 'MOD'), text('Online · 48', 'overline', 'text/tertiary'), member('NaijaBelle', 'warning'), member('Tayo_Writes', 'neutral'), member('Ronke.writes', 'positive'), member('SoftLife_Ada', 'brand')]),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    alink(row({ name: 'Standing', w: 'fill', gap: 10, pad: 12, radius: 12, fill: 'bg/subtle' }, [icon('shield-check', 18, 'positive/fg'), text('Your standing: good', 'smallStrong', 'text/primary', { w: 'fill' }), icon('chevron-right', 16, 'text/tertiary')]), 'wRooms'),
  ]);
}

function threadPanel(): FrameNode {
  const replies: RoomMsg[] = [
    { nick: 'NaijaBelle', tone: 'warning', time: '19:59', body: 'This is the energy we deserve. Happy for you!', reactions: [[0, 9]] },
    { nick: 'Tayo_Writes', tone: 'neutral', time: '20:03', body: 'Picking a public place without being asked is such a green flag.', reactions: [[0, 6]] },
    { nick: 'SoftLife_Ada', tone: 'positive', time: '20:15', body: 'Saving this for the days I need hope.', replyTo: { nick: 'QuietStorm_24', tone: 'brand', text: 'He said "no pressure" and actually meant it.' } },
    { nick: 'QuietStorm_24', tone: 'brand', op: true, me: true, time: '20:31', body: 'Thank you all. Taking it slow and loving it.', reactions: [[0, 18]] },
    { nick: 'Mod_Kemi', tone: 'brand', role: 'mod', time: '20:40', body: 'Lovely to see this. Keep details about him out of replies so it stays a story, not a profile.' },
  ];
  return col({ name: 'Thread panel', w: PANEL_W + 40, h: APP_H, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', h: 64, pad: [0, 16, 0, 20], gap: 8, cross: 'center' }, [
      icon('messages', 20, 'brand/fg'),
      col({ name: 'Title', gap: 0, w: 'fill' }, [text('Thread', 'title', 'text/primary'), text('14 replies · in ' + ROOM, 'caption', 'text/tertiary')]),
      alink(box({ name: 'Save', dir: 'h', w: 36, h: 36, radius: 18, main: 'center', cross: 'center' }, [filledIcon('bookmark', 20, 'brand/fg')]), 'wSavedThreads'),
      alink(box({ name: 'Close', dir: 'h', w: 36, h: 36, radius: 18, main: 'center', cross: 'center' }, [icon('x', 20, 'text/secondary')]), 'wRooms'),
    ]),
    divider(),
    col({ name: 'Thread body', w: 'fill', h: 'fill', pad: [16, 20], gap: 14, clip: true }, [
      roomMessage({ nick: 'QuietStorm_24', tone: 'brand', me: true, type: 'Win', time: 'Today 19:58', body: WIN, reactions: [[0, 24], [3, 11]], mine: 0, actions: { likes: 86, liked: true, replies: 14, quotes: 5, saved: true } }),
      streamDivider('14 replies'),
      ...replies.map((m) => roomMessage(m)),
    ]),
    divider(),
    col({ name: 'Reply', w: 'fill', pad: [12, 16, 16, 16] }, [composerBar('Reply in thread')]),
  ]);
}

function workspace(panel: 'none' | 'info' | 'thread'): SceneNode[] {
  const right = panel === 'thread' ? threadPanel() : panel === 'info' ? infoPanel() : null;
  const streamW = APP_W - RAIL_W - LIST_W - (right ? right.width : 0);
  return right ? [roomsColumn(), streamColumn(streamW), right] : [roomsColumn(), streamColumn(streamW)];
}

export function wRooms(): FrameNode {
  return appFrame({ name: 'Rooms', active: 'wRooms', bleed: true, collapsed: true }, workspace('none'));
}

export function wRoomsAbout(): FrameNode {
  return appFrame({ name: 'Rooms · room info', active: 'wRooms', bleed: true, collapsed: true }, workspace('info'));
}

export function wRoomsThread(): FrameNode {
  return appFrame({ name: 'Rooms · Thread', active: 'wRooms', bleed: true, collapsed: true }, workspace('thread'));
}

export function wRoomsMute(): FrameNode {
  const base = appFrame({ name: 'Rooms · Mute', active: 'wRooms', bleed: true, collapsed: true }, workspace('none'));
  const opt = (label: string, on = false) =>
    row({ name: label, w: 'fill', gap: 10, pad: [10, 12], radius: 10, fill: on ? 'brand/subtle' : null }, [text(label, 'small', on ? 'brand/on-subtle' : 'text/primary', { w: 'fill' }), on ? icon('check', 16, 'brand/fg') : null]);
  const menu = col({ name: 'Mute menu', w: 280, gap: 2, pad: 8, radius: 16, fill: 'bg/raised', stroke: 'border/default', shadow: 'e3' }, [
    row({ name: 'Head', gap: 8, pad: [8, 12] }, [icon('bell-off', 16, 'text/secondary'), text('Mute ' + ROOM, 'smallStrong', 'text/primary')]),
    opt('For 1 hour'),
    opt('For 8 hours', true),
    opt('For 24 hours'),
    opt('For a week'),
    opt('Until I turn it back on'),
    divider(),
    row({ name: 'Mentions', w: 'fill', gap: 10, pad: [10, 12] }, [text('Still notify me about replies', 'small', 'text/primary', { w: 'fill' }), use('Switch', { State: 'On' })]),
  ]);
  const streamX = RAIL_W + LIST_W;
  const streamW = APP_W - RAIL_W - LIST_W;
  add(base, abs(menu, streamX + streamW - 280 - 120, 60));
  return base;
}

export function wRoomsShare(): FrameNode {
  const base = appFrame({ name: 'Rooms · Share', active: 'wRooms', bleed: true, collapsed: true }, workspace('none'));
  const target = (iconName: string, label: string, primary = false) =>
    col({ name: label, w: 'fill', gap: 6, cross: 'center' }, [
      box({ name: 'Circle', dir: 'h', w: 52, h: 52, radius: 26, fill: primary ? 'brand/solid' : 'bg/subtle', main: 'center', cross: 'center' }, [icon(iconName, 22, primary ? 'text/on-solid' : 'text/primary')]),
      text(label, 'caption', 'text/secondary', { align: 'center' }),
    ]);
  const cardNode = col({ name: 'Share card', w: 'fill', pad: 28, gap: 16, radius: 24, fill: [gradient([['#7556E3', 0], ['#2C1E66', 1]], 135)] }, [
    row({ name: 'Brand', gap: 8, w: 'fill' }, [glyph(22, 'text/on-solid'), text('Gist Rooms', 'smallStrong', 'text/on-solid', { w: 'fill' }), box({ name: 'Tag', dir: 'h', pad: [2, 8], radius: 6, fill: [hexPaint('#FFFFFF', 0.16)] }, [text('Win', 'label', 'text/on-solid')])]),
    icon('quote', 28, 'text/on-solid'),
    text(WIN, { family: 'display', weight: 700, size: 22, line: 30, tracking: -0.5 }, 'text/on-solid', { w: 'fill' }),
    row({ name: 'Footer', gap: 8, w: 'fill' }, [text('A member of ' + ROOM, 'caption', 'text/on-solid', { w: 'fill', opacity: 0.8 }), text('gutchek.app/r/tsd-8821', 'caption', 'text/on-solid', { opacity: 0.8 })]),
  ]);
  const dialog = col({ name: 'Share dialog', w: 560, gap: 20, pad: 28, radius: 28, fill: 'bg/raised', shadow: 'e3' }, [
    row({ name: 'Head', w: 'fill', gap: 8 }, [text('Share post', 'h2', 'text/primary', { w: 'fill' }), alink(box({ name: 'Close', dir: 'h', w: 36, h: 36, radius: 18, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('x', 18, 'text/secondary')]), 'wRooms')]),
    cardNode,
    row({ name: 'Targets', w: 'fill', gap: 8 }, [target('link', 'Copy link', true), target('message', 'WhatsApp'), target('image', 'Story'), target('at-sign', 'X'), target('mail', 'Email'), target('more', 'More')]),
    row({ name: 'Inside', w: 'fill', gap: 12 }, [fill(use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Quote in a room' }, { show: ['icon'], icons: { icon: 'quote' } })), fill(use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Send to a trusted contact' }, { show: ['icon'], icons: { icon: 'users' } }))]),
    row({ name: 'Privacy', gap: 8, w: 'fill' }, [icon('eye-off', 14, 'text/tertiary'), text('Shared as an anonymous card: no nickname, no replies. Only room members can open the full thread.', 'caption', 'text/tertiary', { w: 'fill' })]),
  ]);
  return modal(base, dialog, 'Rooms · Share');
}

export function wDiscover(): FrameNode {
  const roomCard = (iconName: string, tone: Tone, name: string, desc: string, members: string, mode: string, state: 'join' | 'pending' | 'invite') =>
    col({ name, w: 'fill', gap: 12, pad: 24, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
      row({ name: 'Head', gap: 12, w: 'fill' }, [iconTileW(iconName, tone, 48), col({ name: 'Title', gap: 2, w: 'fill' }, [text(name, 'title', 'text/primary', { w: 'fill' }), text(members + ' · ' + mode, 'caption', 'text/tertiary')])]),
      text(desc, 'small', 'text/secondary', { w: 'fill' }),
      state === 'join' ? btn('Join the Gist', 'Secondary', 'Medium') : state === 'pending' ? pill('Request pending', 'warning', 'clock') : pill('Invite only', 'neutral', 'lock'),
    ]);
  return appFrame({ name: 'Discover rooms', active: 'wRooms', title: 'Discover rooms', crumb: 'Gists / Discover', collapsed: true }, [
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All' }), use('Chip', { Selected: 'Off' }, { label: 'Open with bot' }), use('Chip', { Selected: 'Off' }, { label: 'Approval required' }), use('Chip', { Selected: 'Off' }, { label: 'Lagos' }), use('Chip', { Selected: 'Off' }, { label: 'Abuja' })]),
    row({ name: 'Row 1', w: 'fill', gap: 20, cross: 'start' }, [
      roomCard('map-pin', 'warning', 'Lagos Dating Life', 'Dating in the city: places, culture and safety tips.', '2.4k members', 'Open with bot', 'join'),
      roomCard('heart', 'caution', 'Healing After Heartbreak', 'A gentle space to talk about endings and starting again.', '540 members', 'Approval required', 'pending'),
      roomCard('card', 'positive', 'Money and Dating', 'Who pays, splitting bills and spotting money red flags.', '930 members', 'Approval required', 'join'),
    ]),
    row({ name: 'Row 2', w: 'fill', gap: 20, cross: 'start' }, [
      roomCard('globe', 'brand', 'Long Distance', 'Making it work across cities and countries.', '410 members', 'Open with bot', 'join'),
      roomCard('sparkle', 'brand', 'First Date Ideas', 'Public, fun and safe places to meet for the first time.', '1.6k members', 'Open with bot', 'join'),
      roomCard('shield-check', 'neutral', 'Safety First', 'Scam warnings, safety habits and support.', '310 members', 'Invite only', 'invite'),
    ]),
    row({ name: 'Note', gap: 8 }, [icon('info', 16, 'text/tertiary'), text('Rooms are created by the Gutchek team. Requests need 18+, phone verification and an account older than 24 hours.', 'small', 'text/tertiary')]),
  ]);
}
