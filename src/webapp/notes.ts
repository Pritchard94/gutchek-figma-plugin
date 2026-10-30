import { Token } from '../tokens';
import { Kid, box, col, divider, fill, icon, paint, pill, rect, row, text } from '../core/ui';
import { glyph } from '../brand';
import { use } from '../components/library';
import { nickAvatar } from '../components/chat';
import { MOODS, Mood, NoteSpec, WEEK, moodDot, moodPicker, moodRibbon, noteCard, personChip, tagChip, timelineItem, weekStrip } from '../components/notes';
import { N_KUNLE, N_MORNING, N_QUIET, N_TOBI_CALL } from '../screens/notes';
import { tobi } from '../screens/data';
import { APP_H, alink, appFrame, btn, modal } from './shell';

const LIST_W = 280;
const FEED_W = 608;
const PANEL_W = 480;

function notesColumn(active: string): FrameNode {
  const item = (iconName: string, label: string, count: string, to = 'wNotes') => {
    const on = label === active;
    return alink(
      row({ name: label, w: 'fill', gap: 10, pad: [8, 10], radius: 10, fill: on ? 'brand/subtle' : null }, [
        icon(iconName, 18, on ? 'brand/fg' : 'text/secondary'),
        text(label, on ? 'smallStrong' : 'small', on ? 'brand/on-subtle' : 'text/primary', { w: 'fill' }),
        text(count, 'caption', 'text/tertiary'),
      ]),
      to,
    );
  };
  const person = (nick: string, stage: string, count: string, to?: string) => {
    const on = nick === active;
    const r = row({ name: nick, w: 'fill', gap: 10, pad: [6, 10], radius: 10, fill: on ? 'brand/subtle' : null }, [
      nickAvatar(nick, undefined, 30),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text(nick, 'smallStrong', 'text/primary'), text(stage, 'caption', 'text/tertiary')]),
      text(count, 'caption', 'text/tertiary'),
    ]);
    return to ? alink(r, to) : r;
  };
  return col({ name: 'Notes list', w: LIST_W, h: APP_H, pad: [20, 12], gap: 12, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', gap: 8, pad: [0, 8] }, [text('Notes', 'h3', 'text/primary', { w: 'fill' }), icon('lock', 18, 'text/tertiary')]),
    alink(fill(use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Write a note' }, { show: ['icon'], icons: { icon: 'pencil' } })), 'wNotes'),
    box({ name: 'Search', dir: 'h', w: 'fill', h: 36, pad: [0, 12], gap: 8, radius: 10, fill: 'bg/subtle', cross: 'center' }, [icon('search', 16, 'text/tertiary'), text('Search notes', 'small', 'text/tertiary', { w: 'fill' }), text('⌘F', 'caption', 'text/tertiary')]),
    col({ name: 'Library', w: 'fill', gap: 2 }, [item('notebook-pen', 'All notes', '21'), item('file-text', 'General', '8'), item('pin', 'Pinned', '2'), item('lock', 'Evidence', '4', 'wNotesEvidence')]),
    divider(),
    row({ name: 'People head', w: 'fill', pad: [0, 8] }, [text('People', 'overline', 'text/tertiary', { w: 'fill' }), icon('user-plus', 16, 'text/secondary')]),
    col({ name: 'People', w: 'fill', gap: 2 }, [person('Tobi', 'Talking', '9', 'wNotesPerson'), person('Kunle', 'Just matched', '3'), person('Seun', 'Dating', '14')]),
    divider(),
    text('Moods', 'overline', 'text/tertiary'),
    row({ name: 'Moods', w: 'fill', gap: 0, main: 'between', pad: [0, 8] }, MOODS.map((m) => moodDot(m.key, 34))),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    alink(
      row({ name: 'Sync', w: 'fill', gap: 10, pad: 12, radius: 12, fill: 'bg/subtle' }, [
        icon('cloud', 18, 'brand/fg'),
        col({ name: 'Text', gap: 0, w: 'fill' }, [text('Synced · just now', 'smallStrong', 'text/primary'), text('iPhone and this browser', 'caption', 'text/tertiary')]),
        icon('settings', 16, 'text/tertiary'),
      ]),
      'wSettings',
    ),
  ]);
}

function feedColumn(): FrameNode {
  const prompt = col({ name: 'Prompt', w: 'fill', h: 'fill', pad: [16, 18], gap: 8, radius: 20, fill: 'brand/subtle' }, [
    row({ name: 'Head', gap: 6 }, [icon('sparkle', 14, 'brand/fg'), text('TONIGHT\u2019S PROMPT', 'overline', 'brand/fg')]),
    text('How did today\u2019s call with Tobi make you feel?', 'title', 'text/primary', { w: 'fill' }),
    text('Write about it', 'smallStrong', 'brand/fg'),
  ]);
  const week = col({ name: 'Week', w: 'fill', pad: [16, 18], gap: 12, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill' }, [text('This week', 'smallStrong', 'text/primary', { w: 'fill' }), text('Mostly calm', 'caption', 'text/tertiary')]),
    weekStrip(WEEK, 6, 'fill', 30),
  ]);
  const selected = noteCard(N_TOBI_CALL);
  selected.strokes = [paint('brand/fg')];
  selected.strokeWeight = 2;
  return col({ name: 'Feed', w: FEED_W, h: APP_H, pad: [24, 28], gap: 14, clip: true }, [
    row({ name: 'Header', w: 'fill', gap: 12 }, [
      col({ name: 'Title', gap: 2, w: 'fill' }, [text('All notes', 'h2', 'text/primary'), text('21 notes · only you can see them', 'caption', 'text/tertiary')]),
      row({ name: 'Sort', gap: 6, pad: [8, 12], radius: 10, stroke: 'border/default' }, [icon('filter', 14, 'text/secondary'), text('Newest', 'smallStrong', 'text/secondary')]),
    ]),
    row({ name: 'Cards', w: 'fill', gap: 14, cross: 'start' }, [prompt, week]),
    text('TODAY', 'overline', 'text/tertiary'),
    alink(selected, 'wNotesPerson'),
    noteCard(N_MORNING),
    text('YESTERDAY', 'overline', 'text/tertiary'),
    alink(noteCard(N_KUNLE), 'wNotesEvidence'),
    text('THURSDAY 22 OCTOBER', 'overline', 'text/tertiary'),
    noteCard(N_QUIET),
  ]);
}

function editorPanel(): FrameNode {
  return col({ name: 'Editor', w: PANEL_W, h: APP_H, pad: [20, 24], gap: 18, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', gap: 8 }, [
      text('Note', 'title', 'text/primary', { w: 'fill' }),
      row({ name: 'Saved', gap: 4 }, [icon('check', 14, 'text/tertiary'), text('Saved · 21:41', 'caption', 'text/tertiary')]),
      box({ name: 'More', dir: 'h', w: 32, h: 32, radius: 16, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('more', 16, 'text/secondary')]),
    ]),
    fill(use('Segmented', { Active: 'Second' }, { first: 'General', second: 'About someone' })),
    row({ name: 'Person', w: 'fill', gap: 8 }, [personChip('Tobi', 'Talking', true), box({ name: 'Spacer', w: 'fill', h: 1 }), text('Change', 'smallStrong', 'brand/fg')]),
    text('Thursday 29 October · 21:40', 'caption', 'text/tertiary'),
    text('Long call tonight. He remembered the thing about my sister\u2019s wedding without me bringing it up. Felt really seen.\n\nStill want to ask about the football page before Saturday.', { family: 'ui', weight: 400, size: 17, line: 28 }, 'text/primary', { w: 'fill' }),
    col({ name: 'Mood', gap: 8, w: 'fill' }, [text('How do you feel?', 'label', 'text/secondary'), moodPicker('Happy')]),
    row({ name: 'Tags', gap: 6, w: 'fill' }, [tagChip('talking'), tagChip('call'), row({ name: 'Add tag', gap: 4, pad: [3, 8], radius: 8, stroke: 'border/strong', dash: [3, 3] }, [icon('plus', 12, 'text/secondary'), text('Tag', 'caption', 'text/secondary')])]),
    alink(
      row({ name: 'Linked report', w: 'fill', gap: 10, pad: 12, radius: 14, fill: 'bg/subtle' }, [icon('gauge', 18, 'brand/fg'), text('Linked: Gutchek report · ' + tobi.verdict, 'small', 'text/primary', { w: 'fill' }), icon('chevron-right', 16, 'text/tertiary')]),
      'wReport',
    ),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    row({ name: 'Actions', w: 'fill', gap: 10 }, [fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Save note' })), btn('Save as evidence', 'Secondary', 'Large', 'lock', 'wNotesEvidence')]),
    row({ name: 'Privacy', gap: 6 }, [icon('lock', 14, 'text/tertiary'), text('Encrypted and synced to your account. Tobi is never notified.', 'caption', 'text/tertiary')]),
  ]);
}

export function wNotes(): FrameNode {
  return appFrame({ name: 'Notes', active: 'wNotes', bleed: true, collapsed: true }, [notesColumn('All notes'), feedColumn(), editorPanel()]);
}

function timelineColumn(): FrameNode {
  const strip = (n: NoteSpec) => noteCard(Object.assign({}, n, { person: undefined, time: 'Note' }) as NoteSpec);
  const report = alink(
    row({ name: 'Report', w: 'fill', gap: 12, pad: 14, radius: 18, fill: 'bg/surface', stroke: 'border/default' }, [
      box({ name: 'Dial', dir: 'h', w: 40, h: 40, radius: 12, fill: 'positive/subtle', main: 'center', cross: 'center' }, [icon('gauge', 20, 'positive/fg')]),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text('Gutchek report', 'smallStrong', 'text/primary'), text(tobi.verdict + ' · Red Flag 2 · Green Flag 8', 'caption', 'text/secondary', { w: 'fill' })]),
      icon('chevron-right', 16, 'text/tertiary'),
    ]),
    'wReport',
  );
  const gut = row({ name: 'Gut log', w: 'fill', gap: 10, pad: 14, radius: 18, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Gut', gap: 6, w: 'fill', pad: [8, 10], radius: 12, fill: 'name/sky-tint' as Token }, [icon('leaf', 14, 'name/sky' as Token), text('Your gut: fairly comfortable', 'caption', 'name/sky' as Token)]),
    row({ name: 'Meter', gap: 6, w: 'fill', pad: [8, 10], radius: 12, fill: 'positive/subtle' }, [icon('gauge', 14, 'positive/fg'), text('Gut Meter: mostly positive', 'caption', 'positive/fg')]),
  ]);
  return col({ name: 'Timeline', w: FEED_W, h: APP_H, pad: [24, 28], gap: 16, clip: true }, [
    row({ name: 'Header', w: 'fill', gap: 14 }, [
      nickAvatar('Tobi', undefined, 56),
      col({ name: 'Text', gap: 4, w: 'fill' }, [text('Tobi', 'h2', 'text/primary'), row({ name: 'Meta', gap: 8 }, [pill('Talking', 'brand', 'message'), text('Since 12 Oct · 9 notes · 1 report', 'caption', 'text/tertiary')])]),
      btn('Write about Tobi', 'Primary', 'Medium', 'pencil', 'wNotes'),
    ]),
    col({ name: 'How you felt', w: 'fill', gap: 10, pad: [16, 20], radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
      row({ name: 'Head', w: 'fill' }, [text('How you felt after each chat', 'smallStrong', 'text/primary', { w: 'fill' }), text('Last 8 chats', 'caption', 'text/tertiary')]),
      moodRibbon(['Calm', 'Happy', 'Happy', 'Anxious', 'Confused', 'Calm', 'Happy', 'Happy'], FEED_W - 56 - 40, 80),
    ]),
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All' }), use('Chip', { Selected: 'Off' }, { label: 'Notes' }), use('Chip', { Selected: 'Off' }, { label: 'Reports' }), use('Chip', { Selected: 'Off' }, { label: 'Gut logs' })]),
    col({ name: 'Entries', w: 'fill', gap: 0 }, [
      timelineItem('note', 'Today, 21:40', strip(N_TOBI_CALL), false, 'name/magenta-tint' as Token),
      timelineItem('gut', 'Sat 24 Oct · Log my gut', gut),
      timelineItem('note', 'Thu 22 Oct, 22:10', strip(N_QUIET), false, 'name/purple-tint' as Token),
      timelineItem('report', 'Mon 12 Oct', report, true),
    ]),
  ]);
}

function reflectionPanel(): FrameNode {
  const quote = (t: string, when: string, m: Mood) =>
    row({ name: when, w: 'fill', gap: 10, cross: 'start' }, [moodDot(m, 28), col({ name: 'Text', gap: 2, w: 'fill' }, [text('\u201c' + t + '\u201d', 'small', 'text/primary', { w: 'fill' }), text(when, 'caption', 'text/tertiary')])]);
  const question = (t: string) =>
    alink(row({ name: t, w: 'fill', gap: 10, pad: [12, 14], radius: 14, fill: 'bg/canvas', stroke: 'border/default' }, [icon('help', 18, 'brand/fg'), text(t, 'small', 'text/primary', { w: 'fill' }), icon('pencil', 16, 'text/tertiary')]), 'wNotes');
  return col({ name: 'Reflection', w: PANEL_W, h: APP_H, pad: [20, 24], gap: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', gap: 8 }, [icon('sparkle', 18, 'brand/fg'), text('Reflection', 'title', 'text/primary', { w: 'fill' }), pill('Opt-in · v1.5', 'neutral'), icon('x', 18, 'text/secondary')]),
    col({ name: 'Summary', w: 'fill', gap: 10, pad: [18, 18], radius: 20, fill: 'brand/subtle' }, [
      text('LAST 30 DAYS · NOTES ABOUT TOBI', 'overline', 'brand/fg'),
      text('You felt anxious after 2 of your last 8 chats, both times after he went quiet.', 'h3', 'text/primary', { w: 'fill' }),
    ]),
    col({ name: 'In your words', gap: 10, w: 'fill' }, [
      text('In your words', 'label', 'text/secondary'),
      quote('He went quiet for two days after I asked about the football page.', 'Thu 22 Oct', 'Anxious'),
      quote('He remembered my sister\u2019s wedding without me bringing it up.', 'Today', 'Happy'),
    ]),
    col({ name: 'Questions', gap: 8, w: 'fill' }, [text('Gentle questions', 'label', 'text/secondary'), question('What helps you feel calm when he goes quiet?'), question('Is there something you\u2019d like to ask him directly?')]),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    text('A reflection mirrors your notes. It isn\u2019t a diagnosis or advice, never labels Tobi and never changes a Gut Meter. Notes were sent to the model for this summary only and are not kept.', 'caption', 'text/tertiary', { w: 'fill' }),
    row({ name: 'Actions', w: 'fill', gap: 10 }, [btn('Delete reflection', 'Tertiary', 'Medium', 'trash'), box({ name: 'Spacer', w: 'fill', h: 1 }), btn('Turn off reflections', 'Secondary', 'Medium')]),
  ]);
}

export function wNotesPerson(): FrameNode {
  return appFrame({ name: 'Notes · Tobi', active: 'wNotes', bleed: true, collapsed: true }, [notesColumn('Tobi'), timelineColumn(), reflectionPanel()]);
}

export function wNotesEvidence(): FrameNode {
  const entry = (iconName: string, title: string, when: string, on: boolean) =>
    row({ name: title, w: 'fill', gap: 12, pad: [12, 16] }, [
      box({ name: 'Checkbox', dir: 'h', w: 22, h: 22, radius: 6, fill: on ? 'brand/solid' : null, stroke: on ? undefined : 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, [on ? icon('check', 14, 'text/on-solid') : null]),
      icon(iconName, 18, 'text/secondary'),
      text(title, 'small', 'text/primary', { w: 'fill' }),
      row({ name: 'When', gap: 4 }, [icon('lock', 12, 'text/tertiary'), text(when, 'caption', 'text/tertiary')]),
    ]);
  const lines = (ws: number[]) => ws.map((w) => rect(w, 6, 'bg/muted', 3, 'Line'));
  const page = col({ name: 'PDF preview', w: 220, h: 300, pad: 18, gap: 8, radius: 12, fill: 'bg/canvas', stroke: 'border/default', shadow: 'e2' }, [
    row({ name: 'Head', gap: 6 }, [glyph(16), text('Evidence pack · Kunle', { family: 'ui', weight: 700, size: 10, line: 12 }, 'text/primary')]),
    rect(184, 1, 'border/default', 0, 'Rule'),
    ...lines([170, 140, 160]),
    rect(184, 48, 'brand/subtle', 6, 'Chat excerpt'),
    ...lines([150, 120, 170, 90]),
  ]);
  const kids: Kid[] = [
    row({ name: 'Head', w: 'fill', gap: 10 }, [text('Export evidence', 'h2', 'text/primary', { w: 'fill' }), pill('Evidence mode · v1.5', 'neutral', 'lock')]),
    text('Timestamps are locked and edit history is kept. Use it for a platform, employer or police report. Only you decide who sees it.', 'small', 'text/secondary', { w: 'fill' }),
    row({ name: 'Body', w: 'fill', gap: 24, cross: 'start' }, [
      col({ name: 'Entries', w: 'fill', gap: 0, radius: 16, stroke: 'border/default', clip: true }, [
        entry('notebook-pen', 'Asked for my WhatsApp again, third time', '28 Oct, 23:02', true),
        divider(),
        entry('message', 'Chat report · 2 pressure moments', '28 Oct, 22:40', true),
        divider(),
        entry('notebook-pen', 'Called twice after I didn\u2019t reply', '29 Oct, 08:30', true),
        divider(),
        entry('notebook-pen', 'First message on Hinge felt nice', '26 Oct, 19:12', false),
      ]),
      page,
    ]),
    row({ name: 'Options', gap: 20, w: 'fill' }, [
      row({ name: 'History', gap: 8 }, [use('Switch', { State: 'On' }), text('Include edit history', 'small', 'text/primary')]),
      row({ name: 'Mask', gap: 8 }, [use('Switch', { State: 'On' }), text('Mask phone numbers', 'small', 'text/primary')]),
      box({ name: 'Spacer', w: 'fill', h: 1 }),
      btn('Cancel', 'Tertiary', 'Large', undefined, 'wNotes'),
      btn('Export PDF', 'Primary', 'Large', 'download', 'wNotes'),
    ]),
  ];
  const dialog = col({ name: 'Dialog', w: 880, gap: 18, pad: 32, radius: 28, fill: 'bg/raised', shadow: 'e3' }, kids);
  return modal(wNotes(), dialog, 'Notes · Export evidence');
}

