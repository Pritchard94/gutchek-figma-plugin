import { Token } from '../tokens';
import { avatar, box, col, divider, fill, icon, paint, pill, rect, row, text } from '../core/ui';
import { glyph } from '../brand';
import { nickAvatar } from '../components/chat';
import { illoNotes } from '../components/illustrations';
import { Mood, NoteSpec, WEEK, gutSlider, moodDot, moodPicker, moodPill, moodRibbon, noteCard, personChip, tagChip, timelineItem, weekStrip } from '../components/notes';
import { btn, center, chip, field, group, groupTitle, heroIcon, iconTile, link, listRow, note, radioGroup, scorePair, screen, sectionHead, surface, textArea, use, viewport, withSheet } from './kit';
import { tobi } from './data';

// ---------------------------------------------------------------- content

export const N_TOBI_CALL: NoteSpec = {
  time: 'Today, 21:40',
  mood: 'Happy',
  person: 'Tobi',
  body: 'Long call tonight. He remembered the thing about my sister\u2019s wedding without me bringing it up. Felt really seen.',
  tags: ['talking', 'call'],
};
export const N_MORNING: NoteSpec = { time: 'Today, 08:15', mood: 'Calm', body: 'Slept properly for once. Not checking my phone before work. Gym at 6.' };
export const N_KUNLE: NoteSpec = {
  time: 'Yesterday, 23:02',
  mood: 'Uneasy',
  person: 'Kunle',
  body: 'Asked for my WhatsApp again after I said maybe later this week. Third time. Something feels pushy.',
  tags: ['hinge'],
  linked: 'Chat report · 2 pressure moments',
  evidence: true,
};
export const N_PINNED: NoteSpec = {
  time: 'Pinned',
  mood: 'Confused',
  person: 'Tobi',
  body: 'Before Saturday: does he actually live in Yaba? Why did the football page go quiet in 2023?',
  pinned: true,
};
export const N_QUIET: NoteSpec = {
  time: 'Thu 22 Oct, 22:10',
  mood: 'Anxious',
  person: 'Tobi',
  body: 'He went quiet for two days after I asked about the football page. Back today like nothing happened.',
};

const ver = (label: string) => box({ name: 'Version ' + label, dir: 'h', pad: [2, 8], radius: 999, fill: 'bg/subtle' }, [text(label, 'label', 'text/secondary')]);

function dayHead(label: string): TextNode {
  return text(label, 'overline', 'text/tertiary', { name: 'Day · ' + label });
}

// ---------------------------------------------------------------- Notes home

export function notesHome(): FrameNode {
  const prompt = col({ name: 'Tonight\u2019s prompt', w: 'fill', pad: [16, 18], gap: 10, radius: 22, fill: 'brand/subtle', clip: true }, [
    row({ name: 'Head', gap: 6 }, [icon('sparkle', 14, 'brand/fg'), text('TONIGHT\u2019S PROMPT', 'overline', 'brand/fg')]),
    text('How did today\u2019s call with Tobi make you feel?', 'h3', 'text/primary', { w: 'fill' }),
    row({ name: 'Actions', gap: 8 }, [
      link(row({ name: 'Write about it', gap: 6, pad: [8, 14], radius: 999, fill: 'brand/solid' }, [icon('pencil', 14, 'text/on-solid'), text('Write about it', 'smallStrong', 'text/on-solid')]), 'writeNote'),
      row({ name: 'Not tonight', pad: [8, 12], radius: 999 }, [text('Not tonight', 'smallStrong', 'brand/fg')]),
    ]),
  ]);
  const week = surface(
    [
      row({ name: 'Head', w: 'fill', gap: 8 }, [text('This week', 'bodyStrong', 'text/primary', { w: 'fill' }), text('Mostly calm', 'caption', 'text/tertiary')]),
      weekStrip(WEEK, 6),
    ],
    'This week',
    [14, 16, 14, 16],
    12,
  );
  const person = (nick: string, stage: string, to?: string) => {
    const p = col({ name: nick, gap: 4, cross: 'center', w: 72 }, [nickAvatar(nick, undefined, 52), text(nick, 'smallStrong', 'text/primary'), text(stage, 'caption', 'text/tertiary')]);
    return to ? link(p, to) : p;
  };
  const addP = link(
    col({ name: 'Add a person', gap: 4, cross: 'center', w: 72 }, [
      box({ name: 'Add', dir: 'h', w: 52, h: 52, radius: 26, stroke: 'border/strong', dash: [4, 4], main: 'center', cross: 'center' }, [icon('user-plus', 20, 'text/secondary')]),
      text('Add', 'smallStrong', 'text/secondary'),
      text('a person', 'caption', 'text/tertiary'),
    ]),
    'addPerson',
  );
  return screen(
    {
      name: 'Notes',
      tab: 'Notes',
      nav: { type: 'Large', title: 'Notes', action: 'search', actionTo: 'notesSearch' },
      gap: 16,
      tall: true,
      footer: [link(btn('Write a note', 'Primary', 'Large', 'pencil'), 'writeGeneral')],
    },
    [
      row({ name: 'Sync', gap: 6, w: 'fill' }, [icon('cloud', 14, 'text/tertiary'), text('Synced to your account · just now', 'caption', 'text/tertiary', { w: 'fill' }), icon('lock', 14, 'text/tertiary'), text('Only you', 'caption', 'text/tertiary')]),
      prompt,
      week,
      col({ name: 'People', gap: 10, w: 'fill' }, [
        sectionHead('People', 'See all', 'personTimeline'),
        row({ name: 'Person cards', gap: 4, w: 'fill', main: 'between' }, [person('Tobi', 'Talking', 'personTimeline'), person('Kunle', 'Just matched'), person('Seun', 'Dating'), addP]),
      ]),
      row({ name: 'Filters', gap: 8 }, [chip('All', true), chip('General'), chip('Pinned'), chip('Evidence')]),
      dayHead('Today'),
      link(noteCard(N_TOBI_CALL), 'personTimeline'),
      link(noteCard(N_MORNING), 'writeGeneral'),
      dayHead('Yesterday'),
      link(noteCard(N_KUNLE), 'noteDetail'),
    ],
  );
}

export function notesEmpty(): FrameNode {
  const promise = (iconName: string, title: string, body: string) =>
    row({ name: title, w: 'fill', gap: 12, cross: 'start' }, [iconTile(iconName, 'brand', 36), col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'smallStrong', 'text/primary'), text(body, 'small', 'text/secondary', { w: 'fill' })])]);
  return screen(
    {
      name: 'Notes · First time',
      tab: 'Notes',
      nav: { type: 'Large', title: 'Notes', action: null },
      gap: 18,
      footer: [link(btn('Write your first note', 'Primary', 'Large', 'pencil'), 'writeGeneral')],
    },
    [
      illoNotes(),
      col({ name: 'Copy', gap: 6, w: 'fill' }, [text('Your private journal', 'h2', 'text/primary', { w: 'fill' }), text('Write how you feel, in general or about someone. Over time you\u2019ll see how each chat really left you.', 'body', 'text/secondary', { w: 'fill' })]),
      promise('lock', 'Private by default', 'Never in Gist Rooms, shared reports or links.'),
      promise('cloud', 'On every device', 'Encrypted and synced to your account.'),
    ],
  );
}

// ---------------------------------------------------------------- writing

export const N_GENERAL_DRAFT = 'Too many chats at once this week. Taking a break from the apps until Friday and going to bed before midnight. I feel lighter already.';

function noteEditor(general: boolean): FrameNode {
  const editor = col({ name: 'Editor', w: 'fill', gap: 14, pad: [16, 18, 12, 18], radius: 22, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Date', gap: 6, w: 'fill' }, [icon('calendar', 14, 'text/tertiary'), text('Thursday 29 October · 21:40', 'caption', 'text/tertiary', { w: 'fill' }), icon('lock', 14, 'text/tertiary')]),
    text(
      general ? N_GENERAL_DRAFT : 'Long call tonight. He remembered the thing about my sister\u2019s wedding without me bringing it up. Felt really seen. Still want to ask about the football page\u2026',
      'body',
      'text/primary',
      { w: 'fill' },
    ),
    divider(),
    row({ name: 'Toolbar', w: 'fill', gap: 18 }, [
      icon('tag', 20, 'text/secondary'),
      icon('link', 20, 'text/secondary'),
      icon('pin', 20, 'text/secondary'),
      box({ name: 'Spacer', w: 'fill', h: 1 }),
      row({ name: 'Voice', gap: 4, opacity: 0.5 }, [icon('mic', 18, 'text/tertiary'), text('Voice · soon', 'caption', 'text/tertiary')]),
    ]),
  ]);
  const privacy = general ? 'Only you can see this. It isn\u2019t linked to anyone.' : 'Only you can see this. Tobi is never notified.';
  return screen(
    {
      name: general ? 'Write a note · General' : 'Write a note',
      nav: { title: 'New note', action: null, backTo: 'notesHome' },
      gap: 16,
      footer: [link(btn('Save note'), general ? 'notesHome' : 'personTimeline'), row({ name: 'Privacy', gap: 6 }, [icon('lock', 14, 'text/tertiary'), text(privacy, 'caption', 'text/tertiary')])],
      footerDivider: true,
    },
    [
      link(fill(use('Segmented', { Active: general ? 'First' : 'Second' }, { first: 'General', second: 'About someone' })), general ? 'pickPerson' : 'writeGeneral'),
      general
        ? row({ name: 'General', gap: 8, w: 'fill' }, [icon('notebook-pen', 16, 'text/tertiary'), text('Just for you. Link it to a person later if you want.', 'caption', 'text/tertiary', { w: 'fill' })])
        : link(row({ name: 'Person', gap: 8, w: 'fill' }, [personChip('Tobi', 'Talking', true), box({ name: 'Spacer', w: 'fill', h: 1 }), text('Change', 'smallStrong', 'brand/fg')]), 'pickPerson'),
      editor,
      col({ name: 'Mood', gap: 8, w: 'fill' }, [text('How do you feel?', 'label', 'text/secondary'), moodPicker(general ? 'Calm' : 'Happy')]),
      row({ name: 'Tags', gap: 6, w: 'fill' }, [
        ...(general ? [tagChip('me time'), tagChip('sleep')] : [tagChip('talking'), tagChip('call')]),
        row({ name: 'Add tag', gap: 4, pad: [3, 8], radius: 8, stroke: 'border/strong', dash: [3, 3] }, [icon('plus', 12, 'text/secondary'), text('Tag', 'caption', 'text/secondary')]),
      ]),
    ],
  );
}

export function writeNote(): FrameNode {
  return noteEditor(false);
}

export function writeGeneral(): FrameNode {
  return noteEditor(true);
}

export function pickPerson(): FrameNode {
  const personRow = (nick: string, stage: string, detail: string, on: boolean) =>
    row({ name: nick, w: 'fill', gap: 12, pad: [10, 0] }, [
      nickAvatar(nick, undefined, 40),
      col({ name: 'Text', gap: 1, w: 'fill' }, [text(nick, 'bodyStrong', 'text/primary'), text(stage + ' · ' + detail, 'caption', 'text/tertiary', { w: 'fill' })]),
      box({ name: 'Radio', dir: 'h', w: 22, h: 22, radius: 11, stroke: on ? 'brand/fg' : 'border/strong', strokeW: on ? 6 : 1.5, fill: 'bg/surface' }, []),
    ]);
  return withSheet(
    viewport(writeNote()),
    'Who is this about?',
    [
      field('Search', 'Search people', { state: 'Default', leading: 'search', hideLabel: true }),
      col({ name: 'People', w: 'fill', gap: 0 }, [
        personRow('Tobi', 'Talking', '9 notes · report linked', true),
        divider(),
        personRow('Kunle', 'Just matched', '3 notes · chat report linked', false),
        divider(),
        personRow('Seun', 'Dating', '14 notes', false),
      ]),
      link(row({ name: 'Add a person', w: 'fill', gap: 12, pad: [10, 0] }, [box({ name: 'Add', dir: 'h', w: 40, h: 40, radius: 20, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('user-plus', 18, 'brand/fg')]), text('Add a person', 'bodyStrong', 'brand/fg', { w: 'fill' })]), 'addPerson'),
      text('Use a nickname. People in your notes are never notified and can\u2019t see them.', 'caption', 'text/tertiary', { w: 'fill' }),
    ],
    'Write a note · Who is this about',
  );
}

export function addPerson(): FrameNode {
  const stageCard = (iconName: string, label: string, on: boolean) =>
    col({ name: label, w: 'fill', gap: 6, pad: [14, 8], radius: 16, cross: 'center', fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'brand/fg' : 'border/default', strokeW: on ? 2 : 1 }, [
      icon(iconName, 22, on ? 'brand/fg' : 'text/secondary'),
      text(label, on ? 'smallStrong' : 'small', on ? 'brand/on-subtle' : 'text/secondary'),
    ]);
  return screen(
    {
      name: 'Add a person',
      nav: { title: 'Add a person', action: null, backTo: 'pickPerson' },
      gap: 18,
      footer: [link(btn('Add a person'), 'personTimeline')],
      footerDivider: true,
    },
    [
      row({ name: 'Preview', w: 'fill', gap: 14 }, [
        nickAvatar('Kunle', undefined, 64),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('Kunle', 'h2', 'text/primary'), text('Their colour is picked from the nickname, so they\u2019re easy to spot on your timeline.', 'caption', 'text/tertiary', { w: 'fill' })]),
      ]),
      field('Nickname', 'Kunle', { state: 'Focused', helper: 'No real name needed. A nickname works best.' }),
      col({ name: 'Stage', gap: 8, w: 'fill' }, [text('Where are you with them?', 'label', 'text/secondary'), row({ name: 'Stages', gap: 8, w: 'fill' }, [stageCard('sparkle', 'Just matched', true), stageCard('message', 'Talking', false), stageCard('heart', 'Dating', false)])]),
      col({ name: 'Link', gap: 8, w: 'fill' }, [
        text('Link a report (optional)', 'label', 'text/secondary'),
        group([listRow('Chat report', 'Kunle from Hinge · 28 Oct', 'message', 'Value', 'Linked'), listRow('Gutchek report', 'Pick from saved reports', 'gauge')]),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- person and timeline

export function personTimeline(): FrameNode {
  const reportEntry = link(
    row({ name: 'Report', w: 'fill', gap: 12, pad: 14, radius: 18, fill: 'bg/surface', stroke: 'border/default' }, [
      avatar(tobi.initials, 40, tobi.tone),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text('Gutchek report', 'smallStrong', 'text/primary'), text(tobi.verdict, 'caption', 'text/secondary', { w: 'fill' })]),
      scorePair(String(tobi.caution), String(tobi.positive)),
    ]),
    'report',
  );
  const gutEntry = link(
    col({ name: 'Gut log', w: 'fill', gap: 8, pad: 14, radius: 18, fill: 'bg/surface', stroke: 'border/default' }, [
      row({ name: 'Head', gap: 6, w: 'fill' }, [text('Your gut vs the Gut Meter', 'smallStrong', 'text/primary', { w: 'fill' }), pill('They agree', 'brand', 'check')]),
      row({ name: 'Pair', gap: 8, w: 'fill' }, [
        row({ name: 'Gut', gap: 6, w: 'fill', pad: [8, 10], radius: 12, fill: 'name/sky-tint' as Token }, [icon('leaf', 14, 'name/sky' as Token), text('Fairly comfortable', 'caption', 'name/sky' as Token)]),
        row({ name: 'Meter', gap: 6, w: 'fill', pad: [8, 10], radius: 12, fill: 'positive/subtle' }, [icon('gauge', 14, 'positive/fg'), text('Mostly positive', 'caption', 'positive/fg')]),
      ]),
    ]),
    'gutResult',
  );
  const added = row({ name: 'Added', gap: 8 }, [personChip('Tobi', 'Just matched'), text('Added from Hinge', 'caption', 'text/tertiary')]);
  return screen(
    {
      name: 'Person · Tobi',
      nav: { title: '', action: 'more', backTo: 'notesHome' },
      gap: 16,
      tall: true,
      footer: [link(btn('Write about Tobi', 'Primary', 'Large', 'pencil'), 'writeNote')],
      footerDivider: true,
    },
    [
      row({ name: 'Header', w: 'fill', gap: 14 }, [
        nickAvatar('Tobi', undefined, 64),
        col({ name: 'Text', gap: 4, w: 'fill' }, [
          text('Tobi', 'h1', 'text/primary'),
          row({ name: 'Meta', gap: 8 }, [pill('Talking', 'brand', 'message'), text('Since 12 Oct · 9 notes', 'caption', 'text/tertiary')]),
        ]),
      ]),
      col({ name: 'How you felt', w: 'fill', gap: 10, pad: [16, 16, 14, 16], radius: 22, fill: 'bg/surface', stroke: 'border/default' }, [
        row({ name: 'Head', w: 'fill', gap: 8 }, [text('How you felt after each chat', 'smallStrong', 'text/primary', { w: 'fill' }), text('8 chats', 'caption', 'text/tertiary')]),
        moodRibbon(['Calm', 'Happy', 'Happy', 'Anxious', 'Confused', 'Calm', 'Happy', 'Happy'], 321, 76),
        row({ name: 'Reflect', w: 'fill', gap: 8 }, [
          text('Mostly happy and calm, with one anxious stretch.', 'caption', 'text/secondary', { w: 'fill' }),
          link(row({ name: 'Reflect on this', gap: 4 }, [icon('sparkle', 14, 'brand/fg'), text('Reflect on this', 'smallStrong', 'brand/fg')]), 'reflectConsent'),
        ]),
      ]),
      row({ name: 'Filters', gap: 8 }, [chip('All', true), chip('Notes'), chip('Reports'), chip('Gut logs')]),
      col({ name: 'Timeline', w: 'fill', gap: 0 }, [
        timelineItem('note', 'Today, 21:40', noteCard(Object.assign({}, N_TOBI_CALL, { person: undefined, time: 'Note' }) as NoteSpec), false, 'name/magenta-tint' as Token),
        timelineItem('gut', 'Sat 24 Oct', gutEntry),
        timelineItem('note', 'Thu 22 Oct, 22:10', noteCard(Object.assign({}, N_QUIET, { person: undefined, time: 'Note' }) as NoteSpec), false, 'name/purple-tint' as Token),
        timelineItem('report', 'Mon 12 Oct', reportEntry),
        timelineItem('note', 'Mon 12 Oct', added, true),
      ]),
    ],
  );
}

export function notesSearch(): FrameNode {
  const hit = (n: NoteSpec, term: string) => {
    const c = noteCard(n);
    const t = c.findOne((x) => x.type === 'TEXT' && (x as TextNode).characters === n.body) as TextNode | null;
    const at = t ? t.characters.toLowerCase().indexOf(term) : -1;
    if (t && at >= 0) t.setRangeFills(at, at + term.length, [paint('brand/fg')]);
    return c;
  };
  return screen(
    { name: 'Notes · Search', nav: { title: 'Search notes', action: null, backTo: 'notesHome' }, gap: 14 },
    [
      field('Search', 'football', { state: 'Focused', leading: 'search', trailing: 'x', hideLabel: true }),
      col({ name: 'Person', gap: 8, w: 'fill' }, [text('Person', 'label', 'text/secondary'), row({ name: 'People', gap: 8 }, [personChip('Tobi', undefined, true), personChip('Kunle'), personChip('Seun')])]),
      col({ name: 'Mood', gap: 8, w: 'fill' }, [text('Mood', 'label', 'text/secondary'), row({ name: 'Moods', gap: 6, wrap: true, wrapGap: 6, w: 'fill' }, [moodPill('Anxious'), moodPill('Confused'), moodPill('Uneasy'), moodPill('Calm'), moodPill('Happy')])]),
      row({ name: 'Date', gap: 8 }, [chip('Any time', true), chip('This week'), chip('This month'), chip('Custom')]),
      row({ name: 'Results head', w: 'fill', gap: 8 }, [text('2 notes', 'smallStrong', 'text/primary', { w: 'fill' }), text('Newest first', 'caption', 'text/tertiary')]),
      hit(N_PINNED, 'football'),
      link(hit(N_QUIET, 'football'), 'personTimeline'),
    ],
  );
}

export function noteDetail(): FrameNode {
  const version = (v: string, when: string, what: string, current = false) =>
    row({ name: v, w: 'fill', gap: 12, pad: [12, 16], cross: 'start' }, [
      ver(v),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(when, 'smallStrong', current ? 'text/primary' : 'text/secondary'), text(what, 'caption', 'text/tertiary', { w: 'fill' })]),
      current ? pill('Current', 'brand') : icon('chevron-right', 16, 'text/tertiary'),
    ]);
  return screen(
    {
      name: 'Note · Evidence',
      nav: { title: '', action: 'more', backTo: 'notesHome' },
      gap: 16,
      footer: [link(btn('Export as PDF', 'Secondary', 'Large', 'download'), 'evidenceExport')],
      footerDivider: true,
    },
    [
      row({ name: 'Meta', gap: 8, w: 'fill' }, [personChip('Kunle', 'Just matched'), box({ name: 'Spacer', w: 'fill', h: 1 }), moodPill('Uneasy')]),
      text('Wednesday 28 October, 23:02', 'h3', 'text/primary', { w: 'fill' }),
      text('Asked for my WhatsApp again after I said maybe later this week. Third time. Something feels pushy. He called twice after I didn\u2019t reply, then sent \u201cwhy are you forming?\u201d', 'body', 'text/primary', { w: 'fill' }),
      row({ name: 'Evidence', w: 'fill', gap: 12, pad: 14, radius: 16, fill: 'bg/inverse', cross: 'start' }, [
        icon('lock', 20, 'text/inverse'),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('Saved as evidence', 'smallStrong', 'text/inverse'), text('Timestamps are locked and every edit is kept. Export it for a platform, employer or police report.', 'caption', 'text/inverse', { w: 'fill', opacity: 0.8 })]),
      ]),
      link(
        row({ name: 'Linked chat report', w: 'fill', gap: 12, pad: 14, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
          iconTile('message', 'brand', 36),
          col({ name: 'Text', gap: 2, w: 'fill' }, [text('Chat report · Kunle from Hinge', 'smallStrong', 'text/primary'), text('2 pressure moments, quoted', 'caption', 'text/secondary')]),
          icon('chevron-right', 16, 'text/tertiary'),
        ]),
        'chatReport',
      ),
      groupTitle('Edit history'),
      group([version('v3', 'Today, 08:30', 'Added: called twice, then \u201cwhy are you forming?\u201d', true), version('v2', 'Wed 28 Oct, 23:40', 'Marked as evidence'), version('v1', 'Wed 28 Oct, 23:02', 'Original note')], 'History', 16),
    ],
  );
}

// ---------------------------------------------------------------- gut log (v1.1)

export function logGut(): FrameNode {
  return screen(
    {
      name: 'Log my gut',
      nav: { title: 'Log my gut', action: 'x', backTo: 'search' },
      gap: 18,
      footer: [link(btn('Save and run the check'), 'match'), link(btn('Skip', 'Tertiary'), 'match')],
    },
    [
      row({ name: 'Eyebrow', gap: 8 }, [text('BEFORE YOU CHECK', 'overline', 'brand/fg'), ver('v1.1')]),
      text('How does Tobi feel to you right now?', 'h1', 'text/primary', { w: 'fill' }),
      text('Your gut is data too. We\u2019ll show it beside the Gut Meter result. It never changes the score.', 'body', 'text/secondary', { w: 'fill' }),
      box({ name: 'Slider pad', dir: 'v', w: 'fill', pad: [12, 0, 4, 0] }, [gutSlider(0.72, 353)]),
      row({ name: 'Words', gap: 6, wrap: true, wrapGap: 6, w: 'fill' }, [chip('Genuine', true), chip('Too smooth', true), chip('Rushing'), chip('Kind'), chip('Not sure')]),
      textArea('A few words', 'He feels genuine. A bit too smooth on text, maybe.', false, 88),
    ],
  );
}

export function gutResult(): FrameNode {
  const side = (title: string, iconName: string, tok: Token, bg: Token, big: string, sub: string) =>
    col({ name: title, w: 'fill', gap: 6, pad: 14, radius: 18, fill: bg }, [
      row({ name: 'Head', gap: 6 }, [icon(iconName, 14, tok), text(title, 'label', tok)]),
      text(big, 'title', 'text/primary', { w: 'fill' }),
      text(sub, 'caption', 'text/secondary', { w: 'fill' }),
    ]);
  return screen(
    {
      name: 'Report · Gut log',
      nav: { title: 'Tobi Adeyemi', action: 'share', backTo: 'report' },
      gap: 16,
      footer: [link(btn('Write a note about this', 'Primary', 'Large', 'pencil'), 'writeNote'), link(btn('Back to the report', 'Tertiary'), 'report')],
    },
    [
      row({ name: 'Eyebrow', gap: 8 }, [text('YOUR GUT VS THE GUT METER', 'overline', 'brand/fg'), ver('v1.1')]),
      text('Your gut and the evidence mostly agree', 'h2', 'text/primary', { w: 'fill' }),
      fill(use('GutMeter', { Tilt: 'Positive' })),
      row({ name: 'Compare', w: 'fill', gap: 10, cross: 'start' }, [
        side('Your gut · Sat', 'leaf', 'name/sky' as Token, 'name/sky-tint' as Token, 'Fairly comfortable', '\u201cGenuine. A bit too smooth on text.\u201d'),
        side('Gut Meter', 'gauge', 'positive/fg', 'positive/subtle', 'Mostly positive', 'Red Flag 2 · Green Flag 8'),
      ]),
      note('sparkle', 'You sensed he was \u201ca bit too smooth on text\u201d. The report found one heated football thread from 2023. Worth a gentle question, not an alarm.', 'brand', 'Where they differ'),
    ],
  );
}

// ---------------------------------------------------------------- reflections (v1.5)

export function reflectConsent(): FrameNode {
  const promise = (iconName: string, t: string) => row({ name: t, w: 'fill', gap: 12 }, [iconTile(iconName, 'brand', 32), text(t, 'small', 'text/primary', { w: 'fill' })]);
  return screen(
    {
      name: 'Reflections · Consent',
      nav: { title: '', action: null, backTo: 'personTimeline' },
      gap: 16,
      footer: [link(btn('Turn on reflections'), 'reflection'), link(btn('Not now', 'Tertiary'), 'personTimeline')],
    },
    [
      row({ name: 'Hero', w: 'fill', gap: 12 }, [heroIcon('sparkle', 'brand', 64), col({ name: 'Badges', gap: 6 }, [pill('Plus and Pro', 'brand', 'star'), ver('Opt-in · v1.5')])]),
      text('Reflect on your notes', 'h1', 'text/primary', { w: 'fill' }),
      text('We summarise patterns in your own words. It never labels Tobi, never changes a score and never tells you what to do.', 'body', 'text/secondary', { w: 'fill' }),
      col({ name: 'Promises', gap: 10, w: 'fill' }, [
        promise('file-text', 'Only the notes you choose are sent to the AI model.'),
        promise('ban', 'They\u2019re not used to train it and not kept by the provider.'),
        promise('trash', 'Turn it off and delete reflections any time.'),
      ]),
      radioGroup([{ label: 'Notes about Tobi', detail: 'Last 30 days · 6 notes', on: true }, { label: 'All my notes', detail: 'Last 30 days · 21 notes' }]),
    ],
  );
}

export function reflection(): FrameNode {
  const quote = (t: string, when: string, m: Mood) =>
    row({ name: when, w: 'fill', gap: 10, cross: 'start' }, [moodDot(m, 28), col({ name: 'Text', gap: 2, w: 'fill' }, [text('\u201c' + t + '\u201d', 'small', 'text/primary', { w: 'fill' }), text(when, 'caption', 'text/tertiary')])]);
  const question = (t: string) =>
    link(row({ name: t, w: 'fill', gap: 10, pad: [12, 14], radius: 14, fill: 'bg/surface', stroke: 'border/default' }, [icon('help', 18, 'brand/fg'), text(t, 'small', 'text/primary', { w: 'fill' }), icon('pencil', 16, 'text/tertiary')]), 'writeNote');
  return screen(
    {
      name: 'Reflection · Tobi',
      nav: { title: 'Reflection', action: 'trash', backTo: 'personTimeline' },
      gap: 16,
      footer: [link(btn('Write a note', 'Primary', 'Large', 'pencil'), 'writeNote')],
    },
    [
      col({ name: 'Summary', w: 'fill', gap: 12, pad: [18, 18, 14, 18], radius: 24, fill: 'brand/subtle' }, [
        row({ name: 'Head', gap: 6 }, [icon('sparkle', 14, 'brand/fg'), text('LAST 30 DAYS · NOTES ABOUT TOBI', 'overline', 'brand/fg')]),
        text('You felt anxious after 2 of your last 8 chats, both times after he went quiet.', 'h3', 'text/primary', { w: 'fill' }),
        moodRibbon(['Calm', 'Happy', 'Happy', 'Anxious', 'Confused', 'Calm', 'Happy', 'Happy'], 317, 64),
      ]),
      col({ name: 'In your words', gap: 10, w: 'fill' }, [
        text('In your words', 'label', 'text/secondary'),
        quote('He went quiet for two days after I asked about the football page.', 'Thu 22 Oct', 'Anxious'),
        quote('He remembered my sister\u2019s wedding without me bringing it up.', 'Today', 'Happy'),
      ]),
      col({ name: 'Gentle questions', gap: 8, w: 'fill' }, [text('Gentle questions', 'label', 'text/secondary'), question('What helps you feel calm when he goes quiet?'), question('Is there something you\u2019d like to ask him directly?')]),
      text('A reflection mirrors your notes. It isn\u2019t a diagnosis or advice, and never changes a Gut Meter.', 'caption', 'text/tertiary', { w: 'fill' }),
    ],
  );
}

export function notesSupport(): FrameNode {
  return withSheet(
    viewport(notesHome()),
    'You don\u2019t have to carry this alone',
    [
      text('Something you wrote sounds heavy. These people can help, any time. Your note is saved and stays private.', 'small', 'text/secondary', { w: 'fill' }),
      group([
        listRow('Emergency services', 'If you are in danger now', 'phone', 'Value', '112'),
        listRow('Domestic violence helpline', 'Confidential, 24 hours', 'life-buoy'),
        listRow('Talk to someone', 'Free, confidential support line', 'message'),
      ]),
      link(btn('See all support', 'Secondary'), 'resources'),
      link(btn('Back to my notes', 'Tertiary'), 'notesHome'),
      text('We won\u2019t turn this note into insights or reflections.', 'caption', 'text/tertiary', { w: 'fill' }),
    ],
    'Notes · Support',
  );
}

// ---------------------------------------------------------------- evidence and settings

export function evidenceExport(): FrameNode {
  const entry = (iconName: string, title: string, when: string, on: boolean) =>
    row({ name: title, w: 'fill', gap: 12, pad: [12, 14] }, [
      box({ name: 'Checkbox', dir: 'h', w: 22, h: 22, radius: 6, fill: on ? 'brand/solid' : null, stroke: on ? undefined : 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, [on ? icon('check', 14, 'text/on-solid') : null]),
      icon(iconName, 18, 'text/secondary'),
      col({ name: 'Text', gap: 1, w: 'fill' }, [text(title, 'smallStrong', 'text/primary', { w: 'fill', maxLines: 1 }), row({ name: 'When', gap: 4 }, [icon('lock', 11, 'text/tertiary'), text(when, 'caption', 'text/tertiary')])]),
    ]);
  const line = (w: number) => rect(w, 5, 'bg/muted', 3, 'Line');
  const pdf = col({ name: 'PDF preview', w: 132, h: 176, pad: 12, gap: 6, radius: 10, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    row({ name: 'Head', gap: 4 }, [glyph(12), text('Evidence pack', { family: 'ui', weight: 700, size: 8, line: 10 }, 'text/primary')]),
    rect(108, 1, 'border/default', 0, 'Rule'),
    line(100),
    line(84),
    line(96),
    rect(108, 30, 'brand/subtle', 4, 'Chat excerpt'),
    line(90),
    line(70),
  ]);
  return screen(
    {
      name: 'Evidence export',
      nav: { title: 'Export evidence', action: null, backTo: 'noteDetail' },
      gap: 16,
      footer: [link(btn('Export PDF', 'Primary', 'Large', 'download'), 'notesHome'), center('For a platform, employer or police report. Only you decide who sees it.', 'caption', 'text/tertiary')],
      footerDivider: true,
    },
    [
      row({ name: 'Eyebrow', gap: 8 }, [text('EVIDENCE MODE', 'overline', 'brand/fg'), ver('v1.5')]),
      row({ name: 'Preview row', w: 'fill', gap: 16 }, [
        pdf,
        col({ name: 'Summary', gap: 8, w: 'fill' }, [text('Kunle · 4 entries', 'title', 'text/primary', { w: 'fill' }), text('26 to 29 October', 'small', 'text/secondary'), pill('Timestamps locked', 'brand', 'lock'), pill('Numbers masked', 'neutral', 'eye-off')]),
      ]),
      group(
        [
          entry('notebook-pen', 'Asked for my WhatsApp again, third time', '28 Oct, 23:02', true),
          entry('message', 'Chat report · 2 pressure moments', '28 Oct, 22:40', true),
          entry('notebook-pen', 'Called twice after I didn\u2019t reply', '29 Oct, 08:30', true),
          entry('notebook-pen', 'First message on Hinge felt nice', '26 Oct, 19:12', false),
        ],
        'Entries',
        16,
      ),
      group([listRow('Include edit history', null, 'history', 'SwitchOn'), listRow('Mask phone numbers', null, 'eye-off', 'SwitchOn')]),
    ],
  );
}

export function notesSettings(): FrameNode {
  const del = listRow('Delete my journal', 'Every note, person card and gut log', 'trash');
  return screen(
    { name: 'Notes settings', nav: { title: 'Notes settings', action: null, backTo: 'settings' }, gap: 14 },
    [
      row({ name: 'Sync', w: 'fill', gap: 12, pad: 14, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        iconTile('cloud', 'brand', 40),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('Synced to your account', 'smallStrong', 'text/primary'), text('iPhone and MacBook · just now', 'caption', 'text/tertiary')]),
        icon('check-circle', 20, 'brand/fg'),
      ]),
      groupTitle('Privacy'),
      group([
        link(listRow('Lock Notes', 'Face ID each time you open Notes', 'face-id', 'SwitchOn'), 'notesLocked'),
        listRow('Auto-delete', null, 'clock', 'Value', 'After 1 year'),
        link(listRow('AI reflections', 'Opt-in · Plus and Pro', 'sparkle', 'SwitchOff'), 'reflectConsent'),
      ]),
      groupTitle('Reminders'),
      group([listRow('Daily prompt', 'A gentle question each evening', 'bell', 'SwitchOn'), listRow('Reminder time', null, 'clock', 'Value', '21:00')]),
      groupTitle('Your data'),
      group([link(listRow('Export my notes', 'PDF or file', 'download'), 'evidenceExport'), del]),
      note('lock', 'Note text is encrypted with a key just for your account. Staff can\u2019t read notes without logged, approved access.', 'neutral'),
    ],
  );
}

export function notesLocked(): FrameNode {
  return screen(
    {
      name: 'Notes · Locked',
      tab: 'Notes',
      cross: 'center',
      gap: 20,
      pad: [150, 20, 24, 20],
      footer: [link(btn('Unlock with Face ID', 'Primary', 'Large', 'face-id'), 'notesHome'), btn('Use passcode', 'Tertiary')],
    },
    [
      box({ name: 'Lock tile', dir: 'h', w: 96, h: 96, radius: 30, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('notebook-pen', 44, 'brand/fg')]),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [center('Notes are locked', 'h2'), center('Your journal stays private, even if someone else has your phone.', 'body', 'text/secondary')]),
    ],
  );
}

export const NOTES_SCREENS: Array<[string, string, () => FrameNode]> = [
  ['notesHome', 'Notes', notesHome],
  ['notesEmpty', 'Notes · First time', notesEmpty],
  ['writeGeneral', 'Write a note · General', writeGeneral],
  ['writeNote', 'Write a note · About someone', writeNote],
  ['pickPerson', 'Write a note · Who is this about', pickPerson],
  ['addPerson', 'Add a person', addPerson],
  ['personTimeline', 'Person card and timeline', personTimeline],
  ['notesSearch', 'Search notes', notesSearch],
  ['noteDetail', 'Note · Evidence and history', noteDetail],
  ['logGut', 'Log my gut · v1.1', logGut],
  ['gutResult', 'Your gut vs the Gut Meter · v1.1', gutResult],
  ['reflectConsent', 'Reflections consent · v1.5', reflectConsent],
  ['reflection', 'Reflection · v1.5', reflection],
  ['notesSupport', 'Supportive card', notesSupport],
  ['evidenceExport', 'Evidence export · v1.5', evidenceExport],
  ['notesSettings', 'Notes settings', notesSettings],
  ['notesLocked', 'Notes locked', notesLocked],
];

