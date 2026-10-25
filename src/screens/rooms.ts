import { Tone, box, col, fill, icon, pill, row, text, divider } from '../core/ui';
import { nickAvatar, reactionBar } from '../components/chat';
import { roomFeed } from './roomchat';
import { btn, center, chip, group, groupTitle, heroIcon, iconTile, link, note, radioGroup, screen, surface, textArea, use, withSheet } from './kit';

interface Room {
  name: string;
  desc: string;
  members: string;
  mode: 'Approval required' | 'Open with bot' | 'Invite only';
  iconName: string;
  tone: Tone;
  state: 'joined' | 'open' | 'pending' | 'invite';
}

const ROOMS: Room[] = [
  { name: 'Talking Stage Diaries', desc: 'Stories and advice from the early days of getting to know someone.', members: '1.2k members', mode: 'Approval required', iconName: 'message', tone: 'brand', state: 'joined' },
  { name: 'First Date Stories', desc: 'The good, the awkward and the lessons learnt.', members: '860 members', mode: 'Open with bot', iconName: 'calendar', tone: 'positive', state: 'joined' },
  { name: 'Lagos Dating Life', desc: 'Dating in the city: places, culture and safety tips.', members: '2.4k members', mode: 'Open with bot', iconName: 'map-pin', tone: 'warning', state: 'open' },
  { name: 'Healing After Heartbreak', desc: 'A gentle space to talk about endings and starting again.', members: '540 members', mode: 'Approval required', iconName: 'heart', tone: 'caution', state: 'pending' },
  { name: 'Safety First', desc: 'Scam warnings, safety habits and support. Invited members only.', members: '310 members', mode: 'Invite only', iconName: 'shield-check', tone: 'neutral', state: 'invite' },
];

function modeTone(m: Room['mode']): Tone {
  return m === 'Approval required' ? 'brand' : m === 'Open with bot' ? 'positive' : 'neutral';
}

// ---------------------------------------------------------------- browse and join

function unreadBadge(n: string): FrameNode {
  return box({ name: 'Unread', dir: 'h', h: 20, pad: [0, 7], radius: 10, fill: 'brand/solid', main: 'center', cross: 'center' }, [text(n, { family: 'ui', weight: 700, size: 11, line: 14 }, 'text/on-solid')]);
}

function joinedRow(r: Room, preview: string, time: string, o: { unread?: string; muted?: boolean } = {}, target?: string): SceneNode {
  const tile = iconTile(r.iconName, r.tone, 44);
  if (o.muted) tile.opacity = 0.55;
  const c = row({ name: r.name, w: 'fill', gap: 12, pad: [12, 14] }, [
    tile,
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      row({ name: 'Top', gap: 8, w: 'fill' }, [
        text(r.name, o.unread ? 'bodyStrong' : 'body', o.muted ? 'text/secondary' : 'text/primary', { w: 'fill', maxLines: 1 }),
        text(time, 'caption', o.unread ? 'brand/fg' : 'text/tertiary'),
      ]),
      row({ name: 'Bottom', gap: 8, w: 'fill' }, [
        text(preview, 'small', 'text/secondary', { w: 'fill', maxLines: 1 }),
        o.unread ? unreadBadge(o.unread) : o.muted ? icon('bell-off', 16, 'text/tertiary') : null,
      ]),
    ]),
  ]);
  return target ? link(c, target) : c;
}

function discoverRow(r: Room, target?: string): SceneNode {
  const trailing =
    r.state === 'pending'
      ? pill('Pending', 'warning', 'clock')
      : r.state === 'invite'
        ? row({ name: 'Invite', gap: 4 }, [icon('lock', 14, 'text/tertiary'), text('Invite', 'label', 'text/tertiary')])
        : use('Button', { Variant: 'Secondary', Size: 'Small' }, { label: 'Join' });
  const c = row({ name: r.name, w: 'fill', gap: 12, pad: [12, 14] }, [
    iconTile(r.iconName, r.tone, 40),
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      text(r.name, 'bodyStrong', 'text/primary', { w: 'fill', maxLines: 1 }),
      row({ name: 'Meta', gap: 6 }, [icon('users', 12, 'text/tertiary'), text(r.members.replace(' members', ''), 'caption', 'text/tertiary'), text('·', 'caption', 'text/tertiary'), text(r.mode, 'caption', 'text/tertiary')]),
    ]),
    trailing,
  ]);
  return target ? link(c, target) : c;
}

export function roomsList(): FrameNode {
  const safety: Room = { ...ROOMS[4], state: 'joined' };
  return screen(
    { name: 'Rooms', tab: 'Rooms', nav: { type: 'Large', title: 'Rooms', action: 'shield', actionTo: 'myStanding' }, gap: 10 },
    [
      fill(use('TextField', { State: 'Default' }, { value: 'Search rooms' }, { hide: ['label'], show: ['leading'], icons: { leading: 'search' } })),
      row({ name: 'Rule', gap: 8, w: 'fill', pad: [2, 4] }, [icon('users', 14, 'brand/fg'), text('Share your own experience. Never identify anyone.', 'caption', 'text/secondary', { w: 'fill' })]),
      groupTitle('Your rooms'),
      group(
        [
          joinedRow(ROOMS[0], 'NaijaBelle: Is that normal or a red flag for you all?', '2m', { unread: '12' }, 'roomFeed'),
          joinedRow(safety, 'Mod_Tunde: New scam pattern, fake courier fees', '1h', { unread: '3' }, 'roomFeed'),
          joinedRow(ROOMS[1], 'Tayo_Writes: Update on the cinema date…', 'Mon', { muted: true }, 'roomFeed'),
        ],
        'Your rooms',
        70,
      ),
      groupTitle('Discover'),
      group([discoverRow(ROOMS[2], 'roomAbout'), discoverRow(ROOMS[3], 'joinPending'), discoverRow({ ...ROOMS[2], name: 'Money and Dating', iconName: 'card', tone: 'positive', members: '930 members', mode: 'Approval required' }, 'roomAbout')], 'Discover', 66),
    ],
  );
}

export function roomAbout(): FrameNode {
  const rules = [
    'Share your own experience. "This happened to me" is fine; accusing a named person is not.',
    'No names, handles, photos, workplaces or anything that identifies someone.',
    'No threats, sexual violence content or revenge.',
    'No hate, harassment, selling or money requests.',
    'Nothing involving anyone under 18.',
    'Share posts only with the Share button, as anonymous cards. No screenshots.',
  ];
  return screen(
    {
      name: 'Room details',
      nav: { title: '', action: 'more', backTo: 'roomsList' },
      gap: 16,
      footer: [link(btn('Request to join'), 'joinPending'), center('18+, phone-verified and on Libra for at least 24 hours.', 'caption', 'text/tertiary')],
    },
    [
      row({ name: 'Head', w: 'fill', gap: 14 }, [
        iconTile('map-pin', 'warning', 64),
        col({ name: 'Text', gap: 6, w: 'fill' }, [text('Lagos Dating Life', 'h2', 'text/primary', { w: 'fill' }), row({ name: 'Meta', gap: 8 }, [pill('Open with bot', 'positive', 'shield-check'), text('2.4k members', 'caption', 'text/tertiary')])]),
      ]),
      text('Dating in the city: places, culture and safety tips. Posts disappear from the feed after 30 days and are never searchable.', 'body', 'text/secondary', { w: 'fill' }),
      col({ name: 'Rules', w: 'fill', gap: 12, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        text('Room rules', 'title', 'text/primary'),
        ...rules.map((r, i) =>
          row({ name: 'Rule ' + (i + 1), w: 'fill', gap: 12, cross: 'start' }, [
            box({ name: 'Number', dir: 'h', w: 24, h: 24, radius: 12, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(String(i + 1), 'label', 'brand/on-subtle')]),
            text(r, 'small', 'text/primary', { w: 'fill' }),
          ]),
        ),
      ]),
      row({ name: 'Nickname note', gap: 8, w: 'fill' }, [icon('eye-off', 16, 'text/tertiary'), text('Members see your room nickname, never your real name.', 'caption', 'text/tertiary', { w: 'fill' })]),
    ],
  );
}

export function joinPending(): FrameNode {
  const step = (state: string, label: string, detail: string) => fill(use('ProgressStep', { State: state }, { label, detail }));
  return screen(
    {
      name: 'Join request pending',
      nav: { title: '', action: 'x', back: false },
      gap: 18,
      cross: 'center',
      pad: [40, 20, 24, 20],
      footer: [link(btn('Back to Rooms', 'Secondary'), 'roomsList')],
    },
    [
      heroIcon('clock', 'warning', 96),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [center('Request sent', 'h2'), center('An admin reviews requests for Healing After Heartbreak, usually within a day. We will notify you.', 'body', 'text/secondary')]),
      col({ name: 'Steps', w: 'fill', gap: 16, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        step('Done', 'Rules acknowledged', 'Just now'),
        step('Done', 'Libra Bot check', 'Account and device checks passed'),
        step('Active', 'Admin review', 'Approval required for this room'),
      ]),
    ],
  );
}

export function roomWelcome(): FrameNode {
  const check = (title: string, body: string) => fill(use('CheckRow', { Checked: 'On' }, { title, body }));
  return screen(
    {
      name: 'Room rules and nickname',
      nav: { title: '', action: 'x', back: false },
      gap: 12,
      footer: [link(btn('Accept and enter room'), 'roomFeed')],
    },
    [
      text("You're in: Talking Stage Diaries", 'h2', 'text/primary', { w: 'fill' }),
      text('Read and accept the rules before your first post.', 'small', 'text/secondary', { w: 'fill' }),
      check('I share my own experience only', 'No accusations against named people.'),
      check("I won't identify anyone", 'No names, handles, photos, workplaces or numbers.'),
      check('I keep the room private', 'No screenshots of room content outside Libra.'),
      fill(use('TextField', { State: 'Focused' }, { label: 'Your room nickname', value: 'QuietStorm_24', helper: 'Pick something that does not identify you. Staff can see your real account; members cannot.' }, { show: ['helper'] })),
    ],
  );
}

// ---------------------------------------------------------------- posting

export function composer(blocked = false): FrameNode {
  const body = blocked
    ? 'Be careful with Kunle from Access Bank Lekki, his number is 0803 555 0199. He did the same thing to my friend.'
    : 'Three weeks in and he still has not asked to meet. Lovely chats every night though. Do I bring it up or wait?';
  return screen(
    {
      name: blocked ? 'New post · blocked by bot' : 'New post',
      nav: { title: 'New post', action: 'x', back: false },
      gap: 14,
      footer: blocked
        ? [btn('Edit post'), link(btn('Why was this blocked?', 'Tertiary'), 'myStanding')]
        : [link(btn('Post'), 'postHeld'), center('Libra Bot checks every post before it is published.', 'caption', 'text/tertiary')],
    },
    [
      row({ name: 'Posting as', gap: 10 }, [nickAvatar('QuietStorm', 'brand', 32), text('Posting as QuietStorm_24 in Talking Stage Diaries', 'small', 'text/secondary')]),
      row({ name: 'Type', gap: 8 }, [chip('Story', blocked), chip('Question', !blocked), chip('Advice'), chip('Win')]),
      textArea('Your post', body, false, 180),
      blocked
        ? col({ name: 'Bot block', w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'caution/subtle', stroke: 'caution/border' }, [
            row({ name: 'Head', gap: 8 }, [icon('shield', 18, 'caution/fg'), text('Libra Bot: remove personal details', 'bodyStrong', 'text/primary')]),
            text('Your post includes a name with a workplace and a phone number. Remove them to post. Warning others is welcome without identifying anyone.', 'small', 'text/primary', { w: 'fill' }),
            row({ name: 'Found', gap: 8 }, [pill('Name and workplace', 'caution'), pill('Phone number', 'caution')]),
          ])
        : note('users', "Share your own experience. Don't include names, handles, photos or anything that could identify someone.", 'brand'),
    ],
  );
}


export function postHeld(): FrameNode {
  return screen(
    {
      name: 'Post held for review',
      nav: { title: '', action: 'x', back: false },
      gap: 18,
      cross: 'center',
      pad: [40, 20, 24, 20],
      footer: [link(btn('Back to room', 'Secondary'), 'roomFeed')],
    },
    [
      heroIcon('clock', 'brand', 96),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [center('Your post is being reviewed', 'h2'), center('It describes a serious experience, so a moderator checks it before it goes live. This usually takes under 2 hours.', 'body', 'text/secondary')]),
      col({ name: 'Preview', w: 'fill', gap: 8, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default', opacity: 0.85 }, [
        row({ name: 'Head', gap: 8, w: 'fill' }, [text('Your post', 'smallStrong', 'text/primary', { w: 'fill' }), pill('Held', 'warning', 'clock')]),
        text('Three weeks in and he still has not asked to meet. Lovely chats every night though. Do I bring it up or wait?', 'small', 'text/secondary', { w: 'fill' }),
      ]),
    ],
  );
}

export function reportPost(): FrameNode {
  return withSheet(
    roomFeed(),
    'Report this post',
    [
      radioGroup([
        { label: 'Names or personal details', on: true },
        { label: 'Harassment or pile-on' },
        { label: 'Threats or sexual violence' },
        { label: 'Hate speech' },
        { label: 'Spam, scam or selling' },
        { label: 'Something else' },
      ]),
      note('eye-off', 'Reports are anonymous. A moderator reviews within 24 hours, faster for threats.', 'neutral'),
      link(btn('Send report'), 'roomFeed'),
    ],
    'Room feed · Report post',
  );
}

// ---------------------------------------------------------------- moderation

export function banNotice(): FrameNode {
  const kv = (k: string, v: string) => row({ name: k, w: 'fill', gap: 12, pad: [10, 0] }, [text(k, 'small', 'text/secondary', { w: 120 }), text(v, 'smallStrong', 'text/primary', { w: 'fill' })]);
  return screen(
    {
      name: 'Ban notice',
      nav: { title: '', action: 'x', back: false },
      gap: 16,
      footer: [link(btn('Appeal this decision'), 'appeal'), link(btn('Read the rules', 'Secondary'), 'roomAbout')],
    },
    [
      heroIcon('ban', 'caution', 72),
      text("You can't post in Talking Stage Diaries for 7 days", 'h2', 'text/primary', { w: 'fill' }),
      col({ name: 'Details', w: 'fill', pad: [6, 16], radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        kv('Rule', 'No identifying information about others'),
        divider(),
        kv('Your post', '"...his name is K***** and he works at ****..."'),
        divider(),
        kv('Decision', 'Strike 2 of 3 · Moderator'),
        divider(),
        kv('Ban ends', 'Fri 31 Oct, 14:05'),
      ]),
      text('Strikes expire after 90 days without another breach. You can still read the room and your other rooms.', 'small', 'text/secondary', { w: 'fill' }),
    ],
  );
}

export function appeal(): FrameNode {
  return screen(
    {
      name: 'Appeal',
      nav: { title: 'Appeal', action: null, backTo: 'banNotice' },
      gap: 14,
      footer: [link(btn('Submit appeal'), 'myStanding'), center('One appeal per ban, within 7 days.', 'caption', 'text/tertiary')],
    },
    [
      row({ name: 'Ban', w: 'fill', gap: 12, pad: 14, radius: 14, fill: 'caution/subtle', cross: 'start' }, [
        icon('ban', 18, 'caution/fg'),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('7-day ban · Talking Stage Diaries', 'smallStrong', 'text/primary'), text('Rule: no identifying information about others', 'small', 'text/secondary', { w: 'fill' })]),
      ]),
      textArea('Why should we reconsider?', 'K is a nickname, not his real name, and the workplace was a general area not his employer. I was warning people, not trying to expose him.', false, 150),
      row({ name: 'Count', w: 'fill', main: 'end' }, [text('186 / 1,000', 'caption', 'text/tertiary')]),
      fill(use('TextField', { State: 'Default' }, { label: 'Anything else we should know? (optional)', value: 'Add context' })),
      note('users', 'A different moderator from the one who banned you reviews your appeal, usually within 72 hours.', 'brand'),
    ],
  );
}

export function myStanding(): FrameNode {
  const item = (iconName: string, tone: Tone, title: string, body: string, status: string, statusTone: Tone) =>
    row({ name: title, w: 'fill', gap: 12, pad: [14, 16], cross: 'start' }, [
      iconTile(iconName, tone, 36),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary', { w: 'fill' }), text(body, 'small', 'text/secondary', { w: 'fill' })]),
      pill(status, statusTone),
    ]);
  return screen(
    { name: 'Your standing', nav: { title: 'Your standing', action: null, backTo: 'roomsList' }, gap: 14 },
    [
      surface([
        row({ name: 'Head', gap: 10 }, [icon('shield', 22, 'warning/fg'), text('Strike 2 of 3', 'h3', 'text/primary')]),
        text('Keep posting within the rules and it expires on 21 Jan 2027. A third strike within 90 days means a 30-day break from all rooms.', 'small', 'text/secondary', { w: 'fill' }),
        box({ name: 'Ladder', dir: 'h', w: 'fill', gap: 6 }, [1, 2, 3].map((n) => box({ name: 'Step ' + n, dir: 'h', w: 'fill', h: 8, radius: 4, fill: n <= 2 ? 'warning/fg' : 'bg/muted' }))),
        row({ name: 'Ladder labels', w: 'fill', main: 'between' }, [text('24h mute', 'caption', 'text/tertiary'), text('7-day ban', 'caption', 'text/tertiary'), text('30 days, all rooms', 'caption', 'text/tertiary')]),
      ]),
      groupTitle('Appeals'),
      group([item('check-circle', 'positive', 'Appeal reviewed', '7-day ban reduced to 3 days. "Thanks for explaining; please avoid partial names."', 'Reduced', 'positive')], 'Appeals', 64),
      groupTitle('History'),
      group(
        [
          item('ban', 'caution', 'Strike 2 · Talking Stage Diaries', 'Identifying information · 24 Oct', 'Active', 'warning'),
          item('alert-triangle', 'warning', 'Strike 1 · First Date Stories', 'Off-topic selling · 2 Jul', 'Expired', 'neutral'),
          item('info', 'neutral', 'Warning · First Date Stories', 'Rude tone · 18 Jun', 'Expired', 'neutral'),
        ],
        'History',
        64,
      ),
    ],
  );
}
