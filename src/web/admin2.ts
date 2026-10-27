import { Token } from '../tokens';
import { Tone, avatar, box, col, divider, fill, icon, paint, pill, rect, row, text, toneTokens } from '../core/ui';
import { use } from '../components/library';
import { bubble, nameToken, nickAvatar } from '../components/chat';
import { radioGroup, textArea } from '../screens/kit';
import { wlink } from './kit';
import { btnRow, card, kpi, shell, sla, small, table, who } from './admin';

function tile(iconName: string, tone: Tone, size = 40): FrameNode {
  const t = toneTokens[tone];
  return box({ name: 'Tile', dir: 'h', w: size, h: size, radius: Math.round(size * 0.28), fill: t.bg, main: 'center', cross: 'center' }, [icon(iconName, Math.round(size * 0.5), t.fg)]);
}

function tf(label: string, value: string, state = 'Filled', o: { leading?: string; trailing?: string; helper?: string } = {}): SceneNode {
  const show: string[] = [];
  const icons: Record<string, string> = {};
  const texts: Record<string, string> = { label, value };
  if (o.leading) {
    show.push('leading');
    icons.leading = o.leading;
  }
  if (o.trailing) {
    show.push('trailing');
    icons.trailing = o.trailing;
  }
  if (o.helper) {
    show.push('helper');
    texts.helper = o.helper;
  }
  return fill(use('TextField', { State: state }, texts, { show, icons }));
}

function chip(label: string, on = false): SceneNode {
  return use('Chip', { Selected: on ? 'On' : 'Off' }, { label });
}

function toggleRow(title: string, sub: string, on: boolean, locked = false): FrameNode {
  return row({ name: title, w: 'fill', gap: 12, pad: [8, 0] }, [
    col({ name: 'Text', gap: 0, w: 'fill' }, [row({ name: 'Title', gap: 6 }, [text(title, 'smallStrong', 'text/primary'), locked ? icon('lock', 12, 'text/tertiary') : null]), text(sub, 'caption', 'text/tertiary', { w: 'fill' })]),
    use('Switch', { State: on ? 'On' : 'Off' }),
  ]);
}

function check(ok: boolean | 'warn', label: string): FrameNode {
  const iconName = ok === true ? 'check-circle' : ok === 'warn' ? 'alert-triangle' : 'circle';
  const tok: Token = ok === true ? 'positive/fg' : ok === 'warn' ? 'warning/fg' : 'text/tertiary';
  return row({ name: label, w: 'fill', gap: 10 }, [icon(iconName, 18, tok), text(label, 'small', 'text/primary', { w: 'fill' })]);
}

// ---------------------------------------------------------------- rooms

interface RoomRow {
  iconName: string;
  tone: Tone;
  name: string;
  desc: string;
  mode: string;
  members: string;
  mods: string[];
  health: [string, Tone];
  status: [string, Tone];
}

const ROOMS: RoomRow[] = [
  { iconName: 'message', tone: 'brand', name: 'Talking Stage Diaries', desc: 'Early days of getting to know someone', mode: 'Approval required', members: '1,204', mods: ['Mod_Kemi', 'Mod_Tunde'], health: ['Healthy', 'positive'], status: ['Live', 'positive'] },
  { iconName: 'map-pin', tone: 'warning', name: 'Lagos Dating Life', desc: 'Places, culture and safety in the city', mode: 'Open with bot', members: '2,418', mods: ['Mod_Tunde', 'Mod_Ife'], health: ['Watch · 3 holds/hr', 'warning'], status: ['Live', 'positive'] },
  { iconName: 'calendar', tone: 'positive', name: 'First Date Stories', desc: 'The good, the awkward, the lessons', mode: 'Open with bot', members: '861', mods: ['Mod_Kemi', 'Mod_Ife'], health: ['Healthy', 'positive'], status: ['Live', 'positive'] },
  { iconName: 'heart', tone: 'caution', name: 'Healing After Heartbreak', desc: 'Endings and starting again', mode: 'Approval required', members: '540', mods: ['Mod_Ada', 'Mod_Kemi'], health: ['Healthy', 'positive'], status: ['Live', 'positive'] },
  { iconName: 'shield-check', tone: 'neutral', name: 'Safety First', desc: 'Scam warnings and safety habits', mode: 'Invite only', members: '310', mods: ['Mod_Tunde', 'Mod_Ada'], health: ['Healthy', 'positive'], status: ['Live', 'positive'] },
  { iconName: 'globe', tone: 'brand', name: 'Long Distance', desc: 'Making it work across cities', mode: 'Open with bot', members: '—', mods: ['Mod_Ife'], health: ['Not live', 'neutral'], status: ['Draft', 'neutral'] },
];

function modsCell(mods: string[]): FrameNode {
  return row({ name: 'Mods', gap: 6 }, [
    row({ name: 'Faces', gap: -6 }, mods.map((m) => {
      const a = nickAvatar(m, undefined, 26);
      a.strokes = [paint('bg/surface')];
      a.strokeWeight = 2;
      a.strokeAlign = 'OUTSIDE';
      return a;
    })),
    small(mods.length + (mods.length === 1 ? ' moderator' : ' moderators'), 'text/secondary', 110),
  ]);
}

export function adminRooms(): FrameNode {
  return shell(
    'Admin · Rooms',
    'adminRooms',
    'Rooms',
    'Only admins create, close or archive rooms. Members can suggest a room from the app.',
    [
      row({ name: 'KPIs', w: 'fill', gap: 16 }, [kpi('Live rooms', '5', '1 draft', 'positive'), kpi('Members across rooms', '5,333', '+214 this week', 'positive'), kpi('Join requests waiting', '9', 'Oldest 6h', 'warning'), kpi('Room suggestions', '12', 'From members this month', 'neutral')]),
      row({ name: 'Filters', gap: 8 }, [chip('All', true), chip('Live'), chip('Draft'), chip('Archived'), chip('Needs attention')]),
      table(
        [
          { label: 'Room', w: 'fill' },
          { label: 'Join mode', w: 160 },
          { label: 'Members', w: 90 },
          { label: 'Moderators', w: 170 },
          { label: 'Health', w: 170 },
          { label: 'Status', w: 80 },
        ],
        ROOMS.map((r) => [
          wlink(row({ name: r.name, gap: 12 }, [tile(r.iconName, r.tone, 36), col({ name: 'Text', gap: 0 }, [text(r.name, 'smallStrong', 'text/primary'), text(r.desc, 'caption', 'text/tertiary')])]), 'adminRoom'),
          pill(r.mode, r.mode === 'Open with bot' ? 'positive' : r.mode === 'Invite only' ? 'neutral' : 'brand'),
          small(r.members, 'text/primary'),
          modsCell(r.mods),
          pill(r.health[0], r.health[1]),
          pill(r.status[0], r.status[1]),
        ]),
      ),
    ],
    [wlink(use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Create room' }, { show: ['icon'], icons: { icon: 'plus' } }), 'adminRoomCreate')],
  );
}

export function adminRoomCreate(): FrameNode {
  const iconPick = ['message', 'globe', 'heart', 'map-pin', 'calendar', 'coffee', 'sparkle', 'shield-check'].map((i, n) =>
    box({ name: i, dir: 'h', w: 40, h: 40, radius: 12, fill: n === 1 ? 'brand/subtle' : 'bg/subtle', stroke: n === 1 ? 'border/focus' : undefined, strokeW: 2, main: 'center', cross: 'center' }, [icon(i, 20, n === 1 ? 'brand/fg' : 'text/secondary')]),
  );
  const tones: Tone[] = ['brand', 'positive', 'warning', 'caution', 'neutral'];
  const tonePick = tones.map((t, n) => box({ name: t, dir: 'h', w: 28, h: 28, radius: 14, fill: toneTokens[t].bg, stroke: n === 0 ? 'border/focus' : 'border/default', strokeW: n === 0 ? 2 : 1, main: 'center', cross: 'center' }, [box({ name: 'Dot', w: 12, h: 12, radius: 6, fill: toneTokens[t].fg, dir: 'h' })]));
  const mod = (nick: string) => row({ name: nick, w: 'fill', gap: 10, pad: [6, 0] }, [nickAvatar(nick, undefined, 28), text(nick, 'smallStrong', nameToken(nick), { w: 'fill' }), small('Moderator', 'text/tertiary', 90), icon('x', 16, 'text/tertiary')]);
  const form = row({ name: 'Form', w: 'fill', gap: 16, cross: 'start' }, [
    col({ name: 'Left', w: 'fill', gap: 16 }, [
      card('Basics', [
        tf('Room name', 'Long Distance'),
        textArea('Description shown to members', 'Making it work across cities and countries: visits, time zones and trust.', false, 64),
        col({ name: 'Icon', gap: 8, w: 'fill' }, [text('Icon and colour', 'label', 'text/secondary'), row({ name: 'Icons', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, iconPick), row({ name: 'Tones', gap: 8 }, tonePick)]),
        col({ name: 'Region', gap: 8, w: 'fill' }, [text('Who can find it', 'label', 'text/secondary'), row({ name: 'Chips', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [chip('All of Nigeria', true), chip('Lagos'), chip('Abuja'), chip('Ghana')])]),
      ]),
      card('Rules', [
        row({ name: 'Template', gap: 8, w: 'fill' }, [icon('file', 16, 'brand/fg'), text('Starts from Gutchek standard rules (7). Add room-specific rules below.', 'small', 'text/secondary', { w: 'fill' })]),
        textArea('Extra rule for this room', '8. Do not share travel plans or exact dates of visits.', false, 56),
      ]),
      card('Moderators', [mod('Mod_Ife'), mod('Mod_Ada'), tf('Add a moderator', 'Search staff', 'Default', { leading: 'search' }), row({ name: 'Rule', gap: 8, w: 'fill' }, [icon('info', 14, 'text/tertiary'), small('Every room needs at least two moderators before it can go live.', 'text/tertiary')])]),
    ]),
    col({ name: 'Right', w: 'fill', gap: 16 }, [
        card('Joining', [
          radioGroup([{ label: 'Open with bot', detail: 'Low-risk requests are approved automatically.', on: true }, { label: 'Approval required', detail: 'An admin reviews every request.' }, { label: 'Invite only' }]),
          toggleRow('18+ and phone-verified', 'Required for every room', true, true),
          toggleRow('Account older than 24 hours', 'Slows down throwaway accounts', true),
          toggleRow('ID-verified members only', 'Stricter, smaller room', false),
        ]),
        card('Posting', [
          row({ name: 'Two', w: 'fill', gap: 12 }, [tf('Slow mode', '5 minutes', 'Filled', { trailing: 'chevron-down' }), tf('Posts leave the feed after', '30 days', 'Filled', { trailing: 'chevron-down' })]),
          toggleRow('Images after 7 days without strikes', 'Scanned for nudity, faces and personal details', true),
          row({ name: 'Types', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [chip('Story', true), chip('Question', true), chip('Advice', true), chip('Win', true)]),
        ]),
    ]),
  ]);
  const preview = col({ name: 'Preview', w: 360, gap: 16 }, [
    card('How members will see it', [
      col({ name: 'Discover card', w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'bg/canvas', stroke: 'border/default' }, [
        row({ name: 'Head', gap: 10, w: 'fill' }, [tile('globe', 'brand', 44), col({ name: 'Text', gap: 0, w: 'fill' }, [text('Long Distance', 'bodyStrong', 'text/primary'), text('New · Open with bot', 'caption', 'text/tertiary')])]),
        text('Making it work across cities and countries: visits, time zones and trust.', 'small', 'text/secondary', { w: 'fill' }),
        use('Button', { Variant: 'Secondary', Size: 'Small' }, { label: 'Join' }),
      ]),
      text('Shown in Discover for members in Nigeria. The room appears empty until the first approved post.', 'caption', 'text/tertiary', { w: 'fill' }),
    ]),
    card('Ready to publish', [check(true, 'Name and description'), check(true, 'Rules: 7 standard + 1 custom'), check(true, 'Two moderators assigned'), check(false, 'Keyword list (optional)'), check('warn', 'New topic: legal review recommended'), divider(), row({ name: 'Approvals', gap: 8, w: 'fill' }, [icon('users', 16, 'text/tertiary'), small('Publishing needs a second admin to approve.', 'text/tertiary')])]),
  ]);
  return shell(
    'Admin · Create room',
    'adminRooms',
    'Create a room',
    'Rooms / Create · new rooms start as drafts until published',
    [row({ name: 'Layout', w: 'fill', gap: 20, cross: 'start' }, [form, preview])],
    [use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Save draft' }), wlink(use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Request publish' }, { show: ['icon'], icons: { icon: 'arrow-right' } }), 'adminRooms')],
  );
}

// ---------------------------------------------------------------- report disputes and opt-outs

export function adminDisputes(): FrameNode {
  const rows: Array<[string, [string, Tone], string, [string, Tone], [string, Tone]]> = [
    ['GCK-2026-04821', ['Dispute', 'brand'], 'T. A***** · @tobiadeyemi', ['ID verified', 'positive'], ['4 days left', 'positive']],
    ['GCK-2026-04817', ['Wrong person', 'warning'], 'K. O** · @kemi.ola', ['ID verified', 'positive'], ['2 days left', 'warning']],
    ['GCK-2026-04810', ['Opt-out', 'neutral'], 'D. O***** · 3 handles', ['Awaiting ID', 'warning'], ['5 days left', 'positive']],
    ['GCK-2026-04802', ['Dispute', 'brand'], 'S. B***** · @seunbakes', ['ID verified', 'positive'], ['Due today', 'caution']],
  ];
  const detail = col({ name: 'Detail', w: 480, gap: 16 }, [
    card('GCK-2026-04821 · Dispute', [
      row({ name: 'Meta', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [pill('ID and selfie verified', 'positive', 'shield-check'), pill('Subject of the report', 'neutral'), pill('Received 22 Oct', 'neutral')]),
      col({ name: 'Finding', w: 'fill', gap: 6, pad: 14, radius: 12, fill: 'bg/subtle' }, [
        row({ name: 'Head', gap: 8 }, [icon('alert-triangle', 16, 'caution/fg'), text('Hostile replies during a football argument', 'smallStrong', 'text/primary')]),
        small('"Nobody asked for your opinion. Log off and touch grass, clown." · X reply · 3 Aug 2024', 'text/secondary'),
      ]),
      col({ name: 'Statement', w: 'fill', gap: 4 }, [text('Their statement', 'label', 'text/secondary'), small('This was a film quote in a thread about the film, not aimed at anyone. The full thread shows it.', 'text/primary')]),
    ]),
    card('Decision', [
      radioGroup([
        { label: 'Correct the finding', detail: 'Re-label as quote or context and re-score.', on: true },
        { label: 'Remove the finding', detail: 'Delete it from every report that includes it.' },
        { label: 'Remove the account from reports', detail: 'Wrong person or opted out.' },
        { label: 'Keep it, with an explanation' },
      ]),
      textArea('Message to the requester', 'Thanks. The thread confirms this was a quote, so we have corrected the finding.', false, 64),
      btnRow([
        ['Send decision', 'Primary'],
        ['Ask for more', 'Secondary'],
      ]),
      small('The requester never learns who ran a report. Overturned findings are added to model training.', 'text/tertiary'),
    ]),
  ]);
  return shell('Admin · Report disputes', 'adminDisputes', 'Report disputes and opt-outs', 'From the public opt-out page · target under 7 days', [
    row({ name: 'Filters', gap: 8 }, [chip('All 7', true), chip('Disputes 4'), chip('Opt-outs 3'), chip('Wrong person 1'), chip('Due soon')]),
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'Reference', w: 140 },
          { label: 'Type', w: 120 },
          { label: 'Person', w: 'fill' },
          { label: 'Identity', w: 120 },
          { label: 'Due', w: 110 },
        ],
        rows.map(([ref, type, person, idv, due]) => [small(ref, 'text/primary'), pill(type[0], type[1]), small(person, 'text/primary'), pill(idv[0], idv[1]), sla(due[0], due[1])]),
        0,
      ),
      detail,
    ]),
  ]);
}

// ---------------------------------------------------------------- chat safety

export function adminChatSafety(): FrameNode {
  const masked = (s: string) => bubble(s, 'them', { flag: 'caution', tag: 'Sextortion threat', max: 380 });
  const detail = col({ name: 'Detail', w: 480, gap: 16 }, [
    row({ name: 'Privacy', w: 'fill', gap: 10, pad: 14, radius: 12, fill: 'brand/subtle', cross: 'start' }, [icon('eye-off', 18, 'brand/fg'), small('You see redacted excerpts only. Raw uploads are deleted within 24 hours and the user is never identified to the other person.', 'text/primary')]),
    card('CS-0412 · Sextortion threats', [
      row({ name: 'Meta', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [pill('Threat to share images · 0.94', 'caution'), pill('Money demand · 0.91', 'caution'), pill('Safety card shown', 'positive', 'check')]),
      col({ name: 'Excerpt', w: 'fill', gap: 8, pad: 12, radius: 12, fill: 'bg/canvas' }, [masked('Send ₦●●●,●●● by tonight or I post the pictures to your ●●●●●●'), masked('I have your sister\'s number too')]),
      col({ name: 'User', w: 'fill', gap: 6 }, [text('What the user saw', 'label', 'text/secondary'), small('Safety card first: save evidence, do not pay, block and report, support lines. They opened "Talk to someone".', 'text/primary')]),
    ]),
    card('Next steps', [
      btnRow([
        ['Send support follow-up', 'Primary'],
        ['Prepare authority referral', 'Secondary'],
        ['Mark false positive', 'Tertiary'],
      ]),
      small('Referrals follow the law-enforcement request policy and need Trust and safety lead sign-off.', 'text/tertiary'),
    ]),
  ]);
  return shell('Admin · Chat safety', 'adminChatSafety', 'Chat safety cases', 'Automatic safety stops from chat check', [
    row({ name: 'KPIs', w: 'fill', gap: 16 }, [kpi('Open cases', '2', 'Both under 1 hour old', 'warning'), kpi('Suspected minors this month', '3', 'Analysis stopped each time', 'caution'), kpi('Threats and sextortion', '5', 'Safety card shown first', 'caution'), kpi('Median first response', '18 min', 'Target under 1 hour', 'positive')]),
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'Case', w: 90 },
          { label: 'Signal', w: 'fill' },
          { label: 'System action', w: 170 },
          { label: 'Status', w: 120 },
        ],
        [
          [small('CS-0412', 'text/primary'), pill('Sextortion threats', 'caution'), small('Safety card shown'), pill('Needs review', 'warning')],
          [small('CS-0411', 'text/primary'), pill('Suspected minor', 'caution'), small('Analysis stopped'), pill('Needs review', 'warning')],
          [small('CS-0405', 'text/primary'), pill('Illegal content', 'caution'), small('Upload rejected'), pill('Escalated', 'brand')],
          [small('CS-0398', 'text/primary'), pill('Self-harm language', 'warning'), small('Support resources shown'), pill('Closed', 'neutral')],
        ],
        0,
      ),
      detail,
    ]),
  ]);
}

// ---------------------------------------------------------------- users and billing

export function adminUsers(): FrameNode {
  const detail = col({ name: 'Detail', w: 460, gap: 16 }, [
    card('Ada Okonkwo', [
      row({ name: 'Head', gap: 12, w: 'fill' }, [avatar('AO', 48, 'brand'), col({ name: 'Text', gap: 2, w: 'fill' }, [small('a**@okonkwo.com · +234 *** *** 0142', 'text/secondary'), row({ name: 'Badges', gap: 6 }, [pill('ID verified', 'positive'), pill('18+', 'neutral'), pill('Since Feb 2026', 'neutral')])])]),
      row({ name: 'Privacy', w: 'fill', gap: 8, pad: 12, radius: 12, fill: 'bg/subtle', cross: 'start' }, [icon('lock', 16, 'text/tertiary'), small('Staff cannot see who a user searched, their reports or their notes. Only counts are shown.', 'text/secondary')]),
    ]),
    card('Plan and usage', [
      row({ name: 'Plan', gap: 10, w: 'fill' }, [pill('Gutchek Plus', 'brand', 'star'), small('Renews 1 Nov · Paystack card 4242', 'text/secondary')]),
      row({ name: 'Usage', gap: 16, w: 'fill' }, [col({ name: 'R', gap: 0, w: 'fill' }, [text('2 of 5', 'h3', 'text/primary'), small('Reports used')]), col({ name: 'C', gap: 0, w: 'fill' }, [text('1 of 1', 'h3', 'text/primary'), small('Free chat checks')]), col({ name: 'S', gap: 0, w: 'fill' }, [text('3', 'h3', 'text/primary'), small('Searches blocked')])]),
      divider(),
      small('1 Oct · Gutchek Plus $7.99 · paid      14 Sep · One report $2.99 · paid', 'text/secondary'),
    ]),
    card('Actions', [
      btnRow([
        ['Grant 1 report', 'Secondary', 'plus'],
        ['Refund last payment', 'Secondary', 'refresh'],
        ['Reset sign-in', 'Secondary', 'lock'],
        ['Suspend account', 'Destructive'],
      ]),
      small('Refunds over $10 and suspensions need a reason and are written to the audit log.', 'text/tertiary'),
    ]),
  ]);
  return shell('Admin · Users and billing', 'adminUsers', 'Users and billing', 'Support for accounts, plans, payments and access', [
    row({ name: 'Search', w: 'fill', gap: 12 }, [
      box({ name: 'Search', dir: 'h', w: 'fill', h: 44, pad: [0, 14], gap: 8, radius: 12, fill: 'bg/surface', stroke: 'border/strong', cross: 'center' }, [icon('search', 18, 'text/tertiary'), small('Search by email, phone or user ID', 'text/tertiary')]),
      chip('Plus', true),
      chip('Pro'),
      chip('Flagged'),
      chip('Refund requests'),
    ]),
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'User', w: 'fill' },
          { label: 'Plan', w: 100 },
          { label: 'Verified', w: 90 },
          { label: 'Flags', w: 140 },
        ],
        [
          [who('Ada Okonkwo', 'a**@okonkwo.com'), pill('Plus', 'brand'), icon('check-circle', 18, 'positive/fg'), small('—')],
          [who('Ngozi Kalu', 'n**@gmail.com', 'positive'), pill('Free', 'neutral'), icon('check-circle', 18, 'positive/fg'), small('—')],
          [who('Chidi Eze', 'c**@yahoo.com', 'warning'), pill('Pro', 'brand'), icon('circle', 18, 'text/tertiary'), pill('Rate-limited', 'warning')],
          [who('Femi Ade', 'f**@outlook.com', 'neutral'), pill('Plus', 'brand'), icon('check-circle', 18, 'positive/fg'), pill('Refund request', 'neutral')],
          [who('Bola Ige', 'b**@gmail.com', 'caution'), pill('Free', 'neutral'), icon('circle', 18, 'text/tertiary'), pill('Repeat lookups', 'caution')],
        ],
        0,
      ),
      detail,
    ]),
  ]);
}

// ---------------------------------------------------------------- bot rules

export function adminBotRules(): FrameNode {
  const slider = (label: string, value: number, note: string) =>
    col({ name: label, w: 'fill', gap: 6 }, [
      row({ name: 'Head', w: 'fill', gap: 8 }, [text(label, 'smallStrong', 'text/primary', { w: 'fill' }), text(value.toFixed(2), 'smallStrong', 'brand/fg')]),
      box({ name: 'Track', dir: 'none', w: 400, h: 20 }, []),
      small(note, 'text/tertiary'),
    ]);
  const s1 = slider('Block when confidence is above', 0.9, 'Below this, posts go to the human queue instead of being blocked.');
  const track = s1.findOne((n) => n.name === 'Track') as FrameNode;
  if (track) {
    const base = rect(400, 6, 'bg/muted', 3, 'Rail');
    track.appendChild(base);
    base.y = 7;
    const filled = rect(360, 6, 'brand/solid', 3, 'Fill');
    track.appendChild(filled);
    filled.y = 7;
    const knob = box({ name: 'Knob', dir: 'h', w: 20, h: 20, radius: 10, fill: 'bg/surface', stroke: 'brand/fg', strokeW: 2, shadow: 'e1' });
    track.appendChild(knob);
    knob.x = 350;
  }
  const editor = col({ name: 'Editor', w: 520, gap: 16 }, [
    card('Personal identifiers', [
      row({ name: 'Meta', gap: 8 }, [pill('Rules and regex', 'neutral'), pill('v7 · live', 'positive'), pill('Overturned 3%', 'neutral')]),
      col({ name: 'Detects', gap: 8, w: 'fill' }, [text('Detects', 'label', 'text/secondary'), row({ name: 'Chips', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [chip('Phone numbers', true), chip('Emails', true), chip('Street addresses', true), chip('Tagged handles', true), chip('Name + workplace', true), chip('Bank details', true)])]),
      s1,
      tf('Action', 'Block and ask the author to edit', 'Filled', { trailing: 'chevron-down' }),
    ]),
    card('Test console', [
      textArea('Try a post', 'Be careful with him, call me on 0803 555 0199 if you want details', false, 56),
      row({ name: 'Result', w: 'fill', gap: 10, pad: 12, radius: 12, fill: 'caution/subtle', cross: 'start' }, [icon('ban', 18, 'caution/fg'), col({ name: 'Text', gap: 2, w: 'fill' }, [text('Blocked · phone number (0.99)', 'smallStrong', 'text/primary'), small('Author sees: "Remove phone numbers to post."', 'text/secondary')])]),
    ]),
    row({ name: 'Publish', w: 'fill', gap: 10 }, [use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Save as v8 draft' }), use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Request review' }), small('Rule changes need a second admin and are versioned.', 'text/tertiary')]),
  ]);
  return shell('Admin · Bot rules', 'adminBotRules', 'Gist Bot rules', 'What the bot detects in rooms and what it does', [
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'Rule', w: 'fill' },
          { label: 'Engine', w: 110 },
          { label: 'Action', w: 130 },
          { label: 'Overturned', w: 90 },
          { label: 'On', w: 60 },
        ],
        [
          [small('Personal identifiers', 'text/primary'), small('Regex'), pill('Block', 'caution'), small('3%'), use('Switch', { State: 'On' })],
          [small('Crime accusation about a named person', 'text/primary'), small('LLM'), pill('Hold', 'warning'), small('9%'), use('Switch', { State: 'On' })],
          [small('Threats and sexual violence', 'text/primary'), small('Classifier'), pill('Block + strike', 'caution'), small('4%'), use('Switch', { State: 'On' })],
          [small('Harassment and hate', 'text/primary'), small('Classifier'), pill('Warn and hide', 'warning'), small('31%'), use('Switch', { State: 'On' })],
          [small('Scams and money requests', 'text/primary'), small('Rules + LLM'), pill('Block', 'caution'), small('6%'), use('Switch', { State: 'On' })],
          [small('Minors', 'text/primary'), small('Classifier'), pill('Block + ban', 'caution'), small('0%'), use('Switch', { State: 'On' })],
          [small('Self-harm language', 'text/primary'), small('Classifier'), pill('Support only', 'positive'), small('—'), use('Switch', { State: 'On' })],
        ],
        0,
      ),
      editor,
    ]),
  ]);
}

// ---------------------------------------------------------------- staff and roles

export function adminRoles(): FrameNode {
  const roles = ['Admin', 'Trust and safety', 'Moderator', 'Support'];
  const perms: Array<[string, boolean[]]> = [
    ['Create, publish and close rooms', [true, false, false, false]],
    ['Approve join requests', [true, true, true, false]],
    ['Remove posts and issue strikes', [true, true, true, false]],
    ['Review appeals', [true, true, true, false]],
    ['Reveal a member\'s real account (logged)', [true, true, false, false]],
    ['Resolve report disputes and opt-outs', [true, true, false, false]],
    ['View chat safety cases', [true, true, false, false]],
    ['Refunds and plan changes', [true, false, false, true]],
    ['Edit bot rules', [true, false, false, false]],
    ['Manage staff and roles', [true, false, false, false]],
  ];
  const matrix = col({ name: 'Matrix', w: 'fill', radius: 16, fill: 'bg/surface', stroke: 'border/default', clip: true }, [
    row({ name: 'Head', w: 'fill', pad: [12, 20], fill: 'bg/subtle' }, [text('Permission', 'overline', 'text/tertiary', { w: 'fill' }), ...roles.map((r) => box({ name: r, dir: 'h', w: 130, main: 'center' }, [text(r, 'overline', 'text/tertiary')]))]),
    ...perms.map(([p, vals], i) =>
      row({ name: p, w: 'fill', pad: [12, 20], fill: i % 2 ? 'bg/canvas' : null }, [small(p, 'text/primary'), ...vals.map((v, j) => box({ name: roles[j], dir: 'h', w: 130, main: 'center' }, [v ? icon('check', 18, 'positive/fg') : text('—', 'small', 'text/tertiary')]))]),
    ),
  ]);
  return shell(
    'Admin · Staff and roles',
    'adminRoles',
    'Staff and roles',
    'Who can do what. MFA is required for every role.',
    [
      table(
        [
          { label: 'Staff', w: 'fill' },
          { label: 'Role', w: 160 },
          { label: 'Rooms', w: 160 },
          { label: 'MFA', w: 90 },
          { label: 'Last active', w: 120 },
        ],
        [
          [who('Admin_Pritchard', 'Founder', 'warning'), pill('Admin', 'brand'), small('All'), pill('On', 'positive'), small('Now')],
          [who('Mod_Kemi', 'Lagos'), pill('Moderator', 'neutral'), small('3 rooms'), pill('On', 'positive'), small('2m ago')],
          [who('Mod_Tunde', 'Abuja', 'positive'), pill('Trust and safety', 'warning'), small('3 rooms'), pill('On', 'positive'), small('1h ago')],
          [who('Mod_Ife', 'Lagos', 'neutral'), pill('Moderator', 'neutral'), small('2 rooms'), pill('On', 'positive'), small('Yesterday')],
          [who('Support_Bayo', 'Remote', 'neutral'), pill('Support', 'neutral'), small('—'), pill('Setup needed', 'warning'), small('3 days ago')],
        ],
      ),
      matrix,
    ],
    [use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Invite staff' }, { show: ['icon'], icons: { icon: 'plus' } })],
  );
}

// ---------------------------------------------------------------- published targets

export function adminTargets(): FrameNode {
  const target = (label: string, value: string, goal: string, ok: boolean) =>
    col({ name: label, w: 'fill', gap: 8, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
      row({ name: 'Head', w: 'fill', gap: 8 }, [small(label, 'text/secondary'), icon(ok ? 'check-circle' : 'alert-triangle', 18, ok ? 'positive/fg' : 'warning/fg')]),
      text(value, { family: 'display', weight: 800, size: 30, line: 36, tracking: -1.5 }, 'text/primary'),
      small('Target ' + goal, 'text/tertiary'),
    ]);
  const months = [5.8, 5.1, 4.6, 4.9, 4.2, 4.2];
  const chart = row({ name: 'Chart', w: 'fill', h: 160, gap: 20, cross: 'end' }, months.map((m, i) =>
    col({ name: 'M' + i, w: 'fill', gap: 6, cross: 'center' }, [rect(40, Math.round(m * 22), m < 7 ? 'brand/solid' : 'caution/solid', 6, 'Bar'), text(['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][i], 'caption', 'text/tertiary')]),
  ));
  return shell('Admin · Targets', 'adminTargets', 'Published targets', 'The commitments on the Trust and safety page, tracked live', [
    row({ name: 'Quarter', gap: 8 }, [chip('Q4 2026', true), chip('Q3 2026'), chip('Q2 2026')]),
    row({ name: 'Row 1', w: 'fill', gap: 16 }, [target('Dispute and opt-out resolution', '4.2 days', 'under 7 days', true), target('High-severity precision', '92%', 'over 90%', true), target('Reports with a mismatched account', '1.6%', 'under 2%', true)]),
    row({ name: 'Row 2', w: 'fill', gap: 16 }, [target('Severe report to action', '1h 12m', 'under 2 hours', true), target('Appeal overturn rate', '14%', 'under 25%', true), target('Raw chat uploads deleted on time', '100%', '100% within 24h', true)]),
    row({ name: 'Bottom', w: 'fill', gap: 16, cross: 'start' }, [
      card('Median dispute resolution, days', [chart]),
      card('Transparency report', [small('Last published 1 Oct 2026 for Q3. The Q4 report publishes on 5 Jan 2027.', 'text/secondary'), btnRow([['Preview report', 'Secondary', 'eye'], ['Publish to Trust and safety page', 'Primary']])], 420),
    ]),
  ]);
}

export const ADMIN_EXTRA: Array<[string, string, () => FrameNode]> = [
  ['adminRooms', 'Admin · Rooms', adminRooms],
  ['adminRoomCreate', 'Admin · Create room', adminRoomCreate],
  ['adminDisputes', 'Admin · Report disputes', adminDisputes],
  ['adminChatSafety', 'Admin · Chat safety', adminChatSafety],
  ['adminUsers', 'Admin · Users and billing', adminUsers],
  ['adminBotRules', 'Admin · Bot rules', adminBotRules],
  ['adminRoles', 'Admin · Staff and roles', adminRoles],
  ['adminTargets', 'Admin · Targets', adminTargets],
];
