import { box, col, divider, fill, gradient, hexPaint, icon, row, text } from '../core/ui';
import { glyph } from '../brand';
import { REACTIONS, RoomMsg, composerBar, filledIcon, nameToken, nickAvatar, quoteEmbed, roomMessage, streamDivider, systemLine } from '../components/chat';
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
  /** Show a save (bookmark) action instead of the mute bell. */
  save?: { saved: boolean; to?: string };
  plain?: boolean;
  /** Tapping the title opens room info. */
  infoTo?: string;
}

function roomHeader(o: HeaderOpts): FrameNode {
  const btnBox = (iconName: string, name: string, target?: string, token: 'text/primary' | 'text/tertiary' = 'text/primary') => {
    const b = box({ name, dir: 'h', w: 40, h: 40, radius: 20, main: 'center', cross: 'center' }, [icon(iconName, 22, token)]);
    return target ? link(b, target) : b;
  };
  return row({ name: 'Room header', w: 'fill', pad: [4, 8, 8, 4], gap: 8, fill: 'bg/surface' }, [
    btnBox('chevron-left', 'Back', o.backTo),
    o.tile === false ? null : iconTile('message', 'brand', 36),
    (() => {
      const t = col({ name: 'Title', gap: 0, w: 'fill' }, [
        row({ name: 'Name', gap: 4, w: 'fill' }, [text(o.title, 'title', 'text/primary', { maxLines: 1 }), o.muted ? icon('bell-off', 14, 'text/tertiary') : null, o.infoTo ? icon('chevron-right', 14, 'text/tertiary') : null]),
        text(o.sub, 'caption', 'text/tertiary', { w: 'fill', maxLines: 1 }),
      ]);
      return o.infoTo ? link(t, o.infoTo) : t;
    })(),
    o.plain
      ? null
      : o.save
      ? (() => {
          const b = box({ name: 'Save thread', dir: 'h', w: 40, h: 40, radius: 20, main: 'center', cross: 'center' }, [o.save.saved ? filledIcon('bookmark', 22, 'brand/fg') : icon('bookmark', 22, 'text/primary')]);
          return o.save.to ? link(b, o.save.to) : b;
        })()
      : btnBox(o.muted ? 'bell-off' : 'bell', 'Mute', o.bellTo, o.muted ? 'text/tertiary' : 'text/primary'),
    o.plain ? null : btnBox('more', 'More', o.moreTo),
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

const WIN_TEXT = 'He said "no pressure" and actually meant it. Waited two weeks for me to feel ready, then picked somewhere public without me asking.';

const FEED: RoomMsg[] = [
  { nick: 'NaijaBelle', tone: 'warning', type: 'Question', time: 'Today 19:40', body: 'Someone I met last week keeps asking to move to WhatsApp on day one. Is that normal or a red flag for you all?', reactions: [[1, 9]], mine: 1, thread: { count: '8 replies', last: 'Mod_Kemi · 10m', people: [['Tayo', 'neutral'], ['Mod', 'brand'], ['Ronke', 'positive']] }, actions: { likes: 31, replies: 8, quotes: 2 } },
  { nick: 'Tayo_Writes', tone: 'neutral', time: 'Today 19:46', body: 'Day one is too fast for me. Anyone who sulks when you say no is showing you who they are.', replyTo: { nick: 'NaijaBelle', tone: 'warning', text: 'Is that normal or a red flag for you all?' }, reactions: [[0, 14]] },
];

const FEED_NEW: RoomMsg[] = [
  { nick: 'QuietStorm_24', tone: 'brand', me: true, type: 'Win', time: 'Today 19:58', body: WIN_TEXT, reactions: [[0, 24], [3, 11]], mine: 0, thread: { count: '14 replies', last: 'NaijaBelle · 2m', people: [['NaijaBelle', 'warning'], ['Tayo', 'neutral'], ['Mod', 'brand']] }, actions: { likes: 86, liked: true, replies: 14, quotes: 5, saved: true } },
  { nick: 'Ronke.writes', tone: 'positive', isNew: true, mention: true, type: 'Story', time: 'Today 20:21', body: '@QuietStorm_24 needed this today. The ones who respect your pace are the keepers.', quote: { nick: 'QuietStorm_24', tone: 'brand', type: 'Win', text: WIN_TEXT }, actions: { likes: 19, replies: 2, quotes: 0 } },
];

function feed(o: { blocked?: boolean; name?: string } = {}): FrameNode {
  const header = chrome(
    roomHeader({ title: ROOM, sub: '1.2k members · 48 online · tap for info', backTo: 'roomsList', bellTo: 'muteSheet', moreTo: 'roomInfo', infoTo: 'roomInfo' }),
    pinnedBar('Pinned · Share your own experience. Never name or identify anyone.'),
  );
  const kids: SceneNode[] = [
    streamDivider('Today'),
    systemLine('clock', 'Slow mode is on. One message every 5 minutes.'),
    ...FEED.map((m) => roomMessage(m)),
    streamDivider('New', 'new'),
    ...FEED_NEW.map((m, i) => {
      const msg = roomMessage(m);
      if (i === 0) {
        const threadChip = msg.findOne((n) => n.name === 'Thread');
        if (threadChip) link(threadChip, 'thread');
        for (const [layer, target] of [
          ['quote', 'quoteComposer'],
          ['share', 'shareSheet'],
          ['save', 'threadSaved'],
          ['react', 'messageActions'],
        ] as Array<[string, string]>) {
          const n = msg.findOne((c) => c.name === layer);
          if (n) link(n, target);
        }
      }
      return msg;
    }),
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

function threadView(saved: boolean, toast: boolean): FrameNode {
  const header = chrome(roomHeader({ title: 'Thread', sub: 'in ' + ROOM + ' · 14 replies', backTo: 'roomFeed', moreTo: 'reportPost', tile: false, save: { saved, to: saved ? 'savedThreads' : 'threadSaved' } }));
  const replies: RoomMsg[] = [
    { nick: 'NaijaBelle', tone: 'warning', time: '19:59', body: 'This is the energy we deserve. Happy for you!', reactions: [[0, 9]] },
    { nick: 'Tayo_Writes', tone: 'neutral', time: '20:03', body: 'Picking a public place without being asked is such a green flag.', reactions: [[0, 6], [1, 2]] },
    { nick: 'SoftLife_Ada', tone: 'positive', time: '20:15', body: 'Saving this for the days I need hope.', replyTo: { nick: 'QuietStorm_24', tone: 'brand', text: 'He said "no pressure" and actually meant it.' }, reactions: [[3, 4]] },
    { nick: 'QuietStorm_24', tone: 'brand', op: true, me: true, time: '20:31', body: 'Thank you all. Taking it slow and loving it.', reactions: [[0, 18]] },
    { nick: 'Mod_Kemi', tone: 'brand', role: 'mod', time: '20:40', body: 'Lovely to see this. Keep details about him out of replies so it stays a story, not a profile.', reactions: [[0, 12]] },
  ];
  const original = roomMessage({ nick: 'QuietStorm_24', tone: 'brand', me: true, type: 'Win', time: 'Today 19:58', body: WIN_TEXT, reactions: [[0, 24], [3, 11], [2, 3]], mine: 0, actions: { likes: 86, liked: true, replies: 14, quotes: 5, saved } });
  for (const [layer, target] of [
    ['quote', 'quoteComposer'],
    ['share', 'shareSheet'],
    ['save', saved ? 'savedThreads' : 'threadSaved'],
  ] as Array<[string, string]>) {
    const n = original.findOne((c) => c.name === layer);
    if (n) link(n, target);
  }
  const root = screen(
    {
      name: saved && toast ? 'Thread · Saved' : 'Thread',
      top: header,
      pad: [0, 0, 0, 0],
      gap: 0,
      footerDivider: true,
      footer: [composerBar('Reply in thread')],
    },
    [stream([original, streamDivider('14 replies'), ...replies.map((m) => roomMessage(m))])],
  );
  addWallpaper(root, 54 + Math.round(header.height));
  if (toast) {
    const t = use('Toast', { Tone: 'Positive' }, { message: 'Thread saved. Find it in Saved, Threads.' });
    root.appendChild(t);
    (t as FrameNode).layoutPositioning = 'ABSOLUTE';
    t.x = 20;
    t.y = root.height - 160;
    link(t, 'savedThreads');
  }
  return root;
}

export const thread = () => threadView(false, false);
export const threadSaved = () => threadView(true, true);

// ---------------------------------------------------------------- share (Substack-inspired)

function shareCard(): FrameNode {
  return col({ name: 'Share card', w: 'fill', pad: 24, gap: 16, radius: 24, fill: [gradient([['#7556E3', 0], ['#2C1E66', 1]], 135)], clip: true }, [
    row({ name: 'Brand', gap: 8, w: 'fill' }, [glyph(22, 'text/on-solid'), text('Libra Rooms', 'smallStrong', 'text/on-solid', { w: 'fill' }), box({ name: 'Tag', dir: 'h', pad: [2, 8], radius: 6, fill: [hexPaint('#FFFFFF', 0.16)] }, [text('Win', 'label', 'text/on-solid')])]),
    icon('quote', 28, 'text/on-solid'),
    text(WIN_TEXT, { family: 'display', weight: 700, size: 20, line: 28, tracking: -0.5 }, 'text/on-solid', { w: 'fill' }),
    row({ name: 'Footer', gap: 8, w: 'fill' }, [
      text('A member of ' + ROOM, 'caption', 'text/on-solid', { w: 'fill', opacity: 0.8 }),
      text('libra.app/r/tsd-8821', 'caption', 'text/on-solid', { opacity: 0.8 }),
    ]),
  ]);
}

export function shareSheet(): FrameNode {
  const target = (iconName: string, label: string, tok: 'brand' | 'neutral' = 'neutral') =>
    col({ name: label, w: 'fill', gap: 6, cross: 'center' }, [
      box({ name: 'Circle', dir: 'h', w: 52, h: 52, radius: 26, fill: tok === 'brand' ? 'brand/solid' : 'bg/subtle', main: 'center', cross: 'center' }, [icon(iconName, 22, tok === 'brand' ? 'text/on-solid' : 'text/primary')]),
      text(label, 'caption', 'text/secondary', { align: 'center' }),
    ]);
  const inside = (iconName: string, title: string, sub: string, to?: string) => {
    const r = row({ name: title, w: 'fill', gap: 14, pad: [12, 16] }, [
      icon(iconName, 22, 'text/primary'),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text(title, 'body', 'text/primary'), text(sub, 'caption', 'text/tertiary', { w: 'fill' })]),
      icon('chevron-right', 18, 'text/tertiary'),
    ]);
    return to ? link(r, to) : r;
  };
  return withSheet(
    feed(),
    'Share post',
    [
      shareCard(),
      row({ name: 'Targets', w: 'fill', gap: 4 }, [target('link', 'Copy link', 'brand'), target('message', 'WhatsApp'), target('image', 'Story'), target('at-sign', 'X'), target('messages', 'Messages'), target('more', 'More')]),
      group([inside('quote', 'Quote in a room', 'Add your take, like a restack', 'quoteComposer'), inside('users', 'Send to a trusted contact', 'Only they can open it')], 'Inside Libra', 52),
      row({ name: 'Privacy', gap: 8, w: 'fill' }, [icon('eye-off', 14, 'text/tertiary'), text('Shared as an anonymous card: no nickname, no replies. Only room members can open the full thread.', 'caption', 'text/tertiary', { w: 'fill' })]),
    ],
    'Room feed · Share post',
  );
}

export function quoteComposer(): FrameNode {
  const header = chrome(roomHeader({ title: 'Quote post', sub: 'Posting as QuietStorm_24 in ' + ROOM, backTo: 'roomFeed', tile: false, plain: true }));
  return screen(
    {
      name: 'Quote post',
      top: header,
      gap: 14,
      pad: [16, 16, 16, 16],
      footerDivider: true,
      footer: [
        row({ name: 'Composer meta', w: 'fill', gap: 8 }, [
          row({ name: 'Type', gap: 6 }, ['Story', 'Question', 'Advice', 'Win'].map((t, i) =>
            row({ name: t, pad: [4, 10], radius: 999, fill: i === 0 ? 'brand/subtle' : 'bg/subtle', stroke: i === 0 ? 'brand/border' : undefined }, [text(t, 'label', i === 0 ? 'brand/on-subtle' : 'text/secondary')]),
          )),
          box({ name: 'Spacer', w: 'fill', h: 1 }),
          text('84 / 2,000', 'caption', 'text/tertiary'),
        ]),
        link(btn('Post quote', 'Primary', 'Large', 'quote'), 'roomFeed'),
      ],
    },
    [
      row({ name: 'Author', gap: 10, w: 'fill' }, [nickAvatar('QuietStorm', 'brand', 36), text('QuietStorm_24', 'bodyStrong', 'text/primary')]),
      text('Coming back to this one. Patience is a green flag and I will not settle for less again.', { family: 'ui', weight: 400, size: 18, line: 28, tracking: -0.5 }, 'text/primary', { w: 'fill' }),
      quoteEmbed({ nick: 'NaijaBelle', tone: 'warning', type: 'Question', text: 'Someone I met last week keeps asking to move to WhatsApp on day one. Is that normal or a red flag for you all?', room: ROOM }),
      fill(use('ListRow', { Trailing: 'SwitchOn' }, { title: 'Allow sharing outside Libra', subtitle: 'As an anonymous card, without your nickname' }, { icons: { icon: 'share' } })),
      row({ name: 'Rule', gap: 8, w: 'fill' }, [icon('shield-check', 14, 'text/tertiary'), text('Libra Bot checks quotes like any post. Quoting never reveals the original author outside the room.', 'caption', 'text/tertiary', { w: 'fill' })]),
    ],
  );
}

// ---------------------------------------------------------------- saved threads

export function savedThreads(): FrameNode {
  const item = (room: string, nick: string, tone: 'brand' | 'warning' | 'positive', type: string, snippet: string, meta: string, fresh?: string, to?: string) => {
    const r = col({ name: snippet.slice(0, 24), w: 'fill', gap: 8, pad: [14, 16] }, [
      row({ name: 'Head', gap: 8, w: 'fill' }, [
        icon('message', 14, 'brand/fg'),
        text(room, 'caption', 'brand/fg', { w: 'fill', maxLines: 1 }),
        fresh ? box({ name: 'New', dir: 'h', pad: [1, 7], radius: 999, fill: 'brand/solid' }, [text(fresh, { family: 'ui', weight: 700, size: 11, line: 14 }, 'text/on-solid')]) : null,
        filledIcon('bookmark', 16, 'brand/fg'),
      ]),
      row({ name: 'Post', gap: 10, w: 'fill', cross: 'start' }, [
        nickAvatar(nick, tone, 32),
        col({ name: 'Text', gap: 2, w: 'fill' }, [
          row({ name: 'Who', gap: 6 }, [text(nick, 'smallStrong', 'text/primary'), text('· ' + type, 'caption', 'text/tertiary')]),
          text(snippet, 'small', 'text/primary', { w: 'fill', maxLines: 2 }),
        ]),
      ]),
      row({ name: 'Meta', gap: 6, pad: [0, 0, 0, 42] }, [icon('messages', 14, 'text/tertiary'), text(meta, 'caption', 'text/tertiary')]),
    ]);
    return to ? link(r, to) : r;
  };
  return screen(
    { name: 'Saved · Threads', tab: 'Saved', nav: { type: 'Large', title: 'Saved', action: 'columns', actionTo: 'comparePicker' }, gap: 12 },
    [
      link(fill(use('Segmented', { Active: 'Second' }, { first: 'People', second: 'Threads' })), 'saved'),
      text('Saved threads keep the full gist in one place, with new replies marked.', 'caption', 'text/tertiary', { w: 'fill' }),
      group(
        [
          item(ROOM, 'QuietStorm_24', 'brand', 'Win', WIN_TEXT, '14 replies · last 2m ago', '3 new', 'thread'),
          item('Lagos Dating Life', 'NaijaBelle', 'warning', 'Question', 'Where are the best public spots for a first date on the Island?', '41 replies · last 1h ago', '12 new'),
          item('Safety First', 'Mod_Tunde', 'positive', 'Advice', 'New scam pattern: fake courier fees before a first meeting. Here is how it works.', '22 replies · yesterday'),
        ],
        'Saved threads',
        16,
      ),
    ],
  );
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

/** Room details: reached only by tapping the room header. */
export function roomInfo(): FrameNode {
  const action = (iconName: string, label: string, to?: string) => {
    const c = col({ name: label, w: 'fill', gap: 6, cross: 'center', pad: [12, 0], radius: 14, fill: 'bg/surface', stroke: 'border/default' }, [icon(iconName, 22, 'brand/fg'), text(label, 'label', 'text/secondary')]);
    return to ? link(c, to) : c;
  };
  const member = (nick: string, role?: string, sub?: string) =>
    row({ name: nick, w: 'fill', gap: 12, pad: [10, 16] }, [
      nickAvatar(nick, undefined, 36),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text(nick, 'bodyStrong', nameToken(nick)), sub ? text(sub, 'caption', 'text/tertiary') : null]),
      role ? box({ name: 'Role', dir: 'h', pad: [1, 5], radius: 4, fill: 'brand/solid' }, [text(role, { family: 'ui', weight: 700, size: 10, line: 14, tracking: 4 }, 'text/on-solid')]) : null,
    ]);
  const rules = ['Share your own experience only', 'Never identify anyone', 'No threats, hate or selling', 'Nothing involving anyone under 18', 'Share posts only with the Share button'];
  return screen(
    { name: 'Room info', nav: { title: '', action: 'share', backTo: 'roomFeed' }, tall: true, gap: 16 },
    [
      col({ name: 'Head', w: 'fill', gap: 8, cross: 'center' }, [
        iconTile('message', 'brand', 72),
        center(ROOM, 'h2'),
        center('1.2k members · 48 online · Approval required', 'small', 'text/secondary'),
      ]),
      row({ name: 'Actions', w: 'fill', gap: 10 }, [action('bell-off', 'Mute', 'muteSheet'), action('search', 'Search'), action('pin', 'Pinned'), action('bookmark', 'Saved', 'savedThreads')]),
      col({ name: 'About', w: 'fill', gap: 8, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        text('About', 'title', 'text/primary'),
        text('Stories and advice from the early days of getting to know someone. Posts leave the feed after 30 days and are never searchable.', 'small', 'text/secondary', { w: 'fill' }),
      ]),
      col({ name: 'Rules', w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        text('Rules', 'title', 'text/primary'),
        ...rules.map((r, i) =>
          row({ name: r, w: 'fill', gap: 10 }, [box({ name: 'N', dir: 'h', w: 22, h: 22, radius: 11, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(String(i + 1), 'label', 'brand/on-subtle')]), text(r, 'small', 'text/primary', { w: 'fill' })]),
        ),
      ]),
      text('Moderators', 'overline', 'text/tertiary'),
      group([member('Mod_Kemi', 'MOD', 'Online'), member('Mod_Tunde', 'MOD', 'Away')], 'Moderators', 64),
      text('Online now · 48', 'overline', 'text/tertiary'),
      group([member('NaijaBelle'), member('Tayo_Writes'), member('Ronke.writes', undefined, 'New this week'), member('SoftLife_Ada')], 'Online', 64),
      group([
        fill(use('ListRow', { Trailing: 'Value' }, { title: 'Your nickname', value: 'QuietStorm_24' }, { hide: ['subtitle'], icons: { icon: 'user' } })),
        link(fill(use('ListRow', { Trailing: 'Value' }, { title: 'Your standing', value: 'Good' }, { hide: ['subtitle'], icons: { icon: 'shield-check' } })), 'myStanding'),
      ]),
      link(btn('Leave room', 'Tertiary', 'Large', 'log-out'), 'roomsList'),
    ],
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

