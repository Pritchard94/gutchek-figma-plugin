import { Token } from '../tokens';
import { Tone, Kid, avatar, box, col, divider, fill, icon, pill, rect, row, text, toneTokens } from '../core/ui';
import { lockup } from '../brand';
import { use } from '../components/library';
import { radioGroup, textArea } from '../screens/kit';
import { wlink } from './kit';

const W = 1440;
const H = 1024;

type NavItem = [string, string, string, string?];

const NAV_GROUPS: Array<[string, NavItem[]]> = [
  [
    'Analytics',
    [
      ['trending-up', 'Growth', 'adminGrowth'],
      ['users', 'Engagement', 'adminEngagement'],
      ['card', 'Revenue', 'adminRevenue'],
    ],
  ],
  [
    'Rooms',
    [
      ['home', 'Moderation', 'adminOverview'],
      ['messages', 'Rooms', 'adminRooms'],
      ['flag', 'Flagged posts', 'adminFlagged', '24'],
      ['users', 'Join requests', 'adminJoins', '9'],
      ['refresh', 'Appeals', 'adminAppeals', '5'],
      ['trash', 'Removal requests', 'adminRemovals', '3'],
      ['user', 'Members', 'adminMember'],
    ],
  ],
  [
    'Trust and safety',
    [
      ['scale', 'Report disputes', 'adminDisputes', '7'],
      ['shield', 'Chat safety', 'adminChatSafety', '2'],
    ],
  ],
  [
    'Platform',
    [
      ['user', 'Users and billing', 'adminUsers'],
      ['sliders', 'Bot rules', 'adminBotRules'],
      ['lock', 'Staff and roles', 'adminRoles'],
      ['check-circle', 'Targets', 'adminTargets'],
      ['file', 'Audit log', 'adminAudit'],
    ],
  ],
];

function sidebar(active: string): FrameNode {
  const item = ([iconName, label, id, count]: NavItem) => {
    const on = id === active;
    return wlink(
      row({ name: label, w: 'fill', gap: 10, pad: [6, 10], radius: 9, fill: on ? 'brand/subtle' : null }, [
        icon(iconName, 18, on ? 'brand/fg' : 'text/secondary'),
        text(label, on ? 'smallStrong' : 'small', on ? 'brand/on-subtle' : 'text/secondary', { w: 'fill' }),
        count ? pill(count, on ? 'brand' : 'neutral') : null,
      ]),
      id,
    );
  };
  return col({ name: 'Sidebar', w: 256, h: H, pad: [20, 14], gap: 12, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Brand', gap: 10, pad: [0, 8, 4, 8] }, [lockup(24), pill('Admin', 'brand')]),
    ...NAV_GROUPS.map(([title, items]) => col({ name: title, w: 'fill', gap: 0 }, [box({ name: 'Group title', dir: 'h', pad: [0, 10, 4, 10] }, [text(title, 'overline', 'text/tertiary')]), ...items.map(item)])),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    row({ name: 'Me', w: 'fill', gap: 10, pad: [8, 8], radius: 12, fill: 'bg/subtle' }, [avatar('AP', 32, 'warning'), col({ name: 'Text', gap: 0, w: 'fill' }, [text('Admin_Pritchard', 'smallStrong', 'text/primary'), text('Admin · MFA on', 'caption', 'text/tertiary')])]),
  ]);
}

function crumbFor(active: string): string {
  for (const [group, items] of NAV_GROUPS) {
    const hit = items.find((i) => i[2] === active);
    if (hit) return 'Admin  /  ' + group + '  /  ' + hit[1];
  }
  return 'Admin';
}

/** Slim global bar: where you are, which environment, search and alerts. Page actions live in the page header. */
function topbar(active: string): FrameNode {
  return row({ name: 'Top bar', w: 'fill', h: 60, pad: [0, 32], gap: 12, cross: 'center', fill: 'bg/surface' }, [
    text(crumbFor(active), 'small', 'text/tertiary', { w: 'fill' }),
    row({ name: 'Exposure', gap: 6, pad: [5, 10], radius: 999, fill: 'warning/subtle' }, [icon('clock', 14, 'warning/fg'), text('Exposure 1h 20m of 2h · images blurred', 'label', 'warning/fg')]),
    pill('Production', 'positive'),
    box({ name: 'Search', dir: 'h', w: 300, h: 36, pad: [0, 12], gap: 8, radius: 10, fill: 'bg/subtle', cross: 'center' }, [
      icon('search', 16, 'text/tertiary'),
      text('Search members, posts, rooms, users', 'small', 'text/tertiary', { w: 'fill' }),
      box({ name: 'Key', dir: 'h', pad: [1, 6], radius: 4, stroke: 'border/strong' }, [text('⌘K', 'caption', 'text/tertiary')]),
    ]),
    box({ name: 'Bell', dir: 'h', w: 36, h: 36, radius: 18, main: 'center', cross: 'center' }, [icon('bell', 18, 'text/primary')]),
    avatar('AP', 32, 'warning'),
  ]);
}

/** Page frame. Pages grow to fit their content (minimum 1024) so nothing is clipped. */
export function shell(name: string, active: string, title: string, sub: string, content: Kid[], actions: Kid[] = []): FrameNode {
  const header = row({ name: 'Page header', w: 'fill', gap: 12, cross: 'end' }, [
    col({ name: 'Title', gap: 4, w: 'fill' }, [text(title, 'h2', 'text/primary'), text(sub, 'small', 'text/secondary', { w: 'fill' })]),
    ...actions,
  ]);
  const main = col({ name: 'Main', w: 'fill', gap: 0, fill: 'bg/canvas' }, [topbar(active), divider(), col({ name: 'Content', w: 'fill', pad: [28, 32, 48, 32], gap: 20 }, [header, ...content])]);
  const side = sidebar(active);
  const f = row({ name, w: W, fill: 'bg/canvas', clip: true, cross: 'start' }, [side, main]);
  const h = Math.max(H, Math.round(main.height));
  side.resize(side.width, h);
  f.layoutSizingVertical = 'FIXED';
  f.resize(W, h);
  if (h === H) main.layoutSizingVertical = 'FILL';
  f.setPluginData('webpage', '1');
  return f;
}

/** Give every card in a row the height of the tallest one. */
export function equalize<T extends FrameNode>(r: T): T {
  const kids = r.children.filter((c) => c.type === 'FRAME' || c.type === 'INSTANCE') as FrameNode[];
  const tallest = kids.reduce((m, c) => Math.max(m, c.height), 0);
  for (const c of kids) {
    c.layoutSizingVertical = 'FIXED';
    c.resize(c.width, tallest);
  }
  return r;
}

export function card(title: string | null, kids: Kid[], w: number | 'fill' = 'fill', action?: string): FrameNode {
  return col({ name: title || 'Card', w, gap: 16, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    title ? row({ name: 'Head', gap: 8, w: 'fill' }, [text(title, 'title', 'text/primary', { w: 'fill' }), action ? text(action, 'smallStrong', 'brand/fg') : null]) : null,
    ...kids,
  ]);
}

export interface Col {
  label: string;
  w: number | 'fill';
}

export function table(cols: Col[], rows: Kid[][], selected = -1): FrameNode {
  const cell = (k: Kid, c: Col) => box({ name: 'Cell', dir: 'h', w: c.w, cross: 'center' }, [k]);
  const head = row({ name: 'Head', w: 'fill', pad: [12, 16], gap: 16, fill: 'bg/subtle' }, cols.map((c) => cell(text(c.label, 'overline', 'text/tertiary'), c)));
  const body: SceneNode[] = [];
  rows.forEach((r, i) => {
    if (i > 0) body.push(divider());
    body.push(row({ name: 'Row ' + (i + 1), w: 'fill', pad: [14, 16], gap: 16, fill: i === selected ? 'brand/subtle' : null }, r.map((k, ci) => cell(k, cols[ci]))));
  });
  return col({ name: 'Table', w: 'fill', radius: 16, fill: 'bg/surface', stroke: 'border/default', clip: true }, [head, ...body]);
}

export function sev(level: 'High' | 'Medium' | 'Low' | 'Severe'): FrameNode {
  const t: Tone = level === 'Severe' || level === 'High' ? 'caution' : level === 'Medium' ? 'warning' : 'neutral';
  return pill(level, t);
}

export function sla(label: string, tone: Tone): FrameNode {
  return pill(label, tone, 'clock');
}

export function kpi(label: string, value: string, note: string, tone: Tone = 'neutral'): FrameNode {
  return col({ name: label, w: 'fill', gap: 6, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    text(label, 'small', 'text/secondary'),
    text(value, { family: 'display', weight: 800, size: 32, line: 38, tracking: -1.5 }, 'text/primary'),
    row({ name: 'Note', gap: 6 }, [box({ name: 'Dot', w: 8, h: 8, radius: 4, fill: toneTokens[tone].fg, dir: 'h' }), text(note, 'caption', 'text/tertiary')]),
  ]);
}

export function btnRow(items: Array<[string, string, string?]>): FrameNode {
  return row(
    { name: 'Actions', gap: 10, wrap: true, wrapGap: 10 },
    items.map(([label, variant, iconName]) => use('Button', { Variant: variant, Size: 'Medium' }, { label }, iconName ? { show: ['icon'], icons: { icon: iconName } } : {})),
  );
}

export function who(nick: string, sub: string, tone: Tone = 'brand'): FrameNode {
  return row({ name: nick, gap: 10 }, [avatar(nick.slice(0, 2).toUpperCase(), 32, tone), col({ name: 'Text', gap: 0 }, [text(nick, 'smallStrong', 'text/primary'), text(sub, 'caption', 'text/tertiary')])]);
}

export function small(t: string, token: Token = 'text/secondary', w: number | 'fill' = 'fill', maxLines?: number): TextNode {
  return text(t, 'small', token, { w, maxLines });
}

// ---------------------------------------------------------------- pages

export function adminOverview(): FrameNode {
  const days = [12, 18, 9, 22, 15, 11, 26, 14, 19, 8, 16, 21, 13, 17];
  const chart = row(
    { name: 'Chart', w: 'fill', h: 180, gap: 10, cross: 'end' },
    days.map((d, i) => col({ name: 'Day ' + (i + 1), w: 'fill', gap: 2, cross: 'center' }, [rect(22, Math.round(d * 4), 'brand/border', 4, 'Held'), rect(22, Math.round(d * 1.8), 'brand/solid', 4, 'Removed')])),
  );
  const queue = (iconName: string, label: string, count: string, sub: string, tone: Tone, target: string) =>
    wlink(row({ name: label, w: 'fill', gap: 12, pad: [12, 0] }, [box({ name: 'Icon', dir: 'h', w: 36, h: 36, radius: 10, fill: toneTokens[tone].bg, main: 'center', cross: 'center' }, [icon(iconName, 18, toneTokens[tone].fg)]), col({ name: 'Text', gap: 0, w: 'fill' }, [text(label, 'smallStrong', 'text/primary'), text(sub, 'caption', 'text/tertiary')]), text(count, 'h3', 'text/primary')]), target);
  return shell('Admin · Moderation', 'adminOverview', 'Moderation', 'All rooms · last 14 days', [
    row({ name: 'KPIs', w: 'fill', gap: 16 }, [
      kpi('Posts held by bot', '186', '4.1% of posts', 'warning'),
      kpi('Open reports', '24', 'Oldest 1h 40m', 'caution'),
      kpi('Severe report to action', '1h 12m', 'Target under 2h', 'positive'),
      kpi('Appeals in SLA', '5 of 5', 'Target 72h', 'positive'),
      kpi('Overturn rate', '14%', 'Target under 25%', 'positive'),
    ]),
    equalize(row({ name: 'Middle', w: 'fill', gap: 16, cross: 'start' }, [
      card('Held and removed posts', [chart, row({ name: 'Legend', gap: 16 }, [row({ name: 'Held', gap: 6 }, [rect(10, 10, 'brand/border', 3, 'Swatch'), text('Held by bot', 'caption', 'text/secondary')]), row({ name: 'Removed', gap: 6 }, [rect(10, 10, 'brand/solid', 3, 'Swatch'), text('Removed', 'caption', 'text/secondary')])])]),
      card('Queues', [
        queue('flag', 'Flagged posts', '24', '3 severe · oldest 1h 40m', 'caution', 'adminFlagged'),
        divider(),
        queue('users', 'Join requests', '9', '2 high risk', 'warning', 'adminJoins'),
        divider(),
        queue('refresh', 'Appeals', '5', 'Next due in 18h', 'brand', 'adminAppeals'),
        divider(),
        queue('trash', 'Removal requests', '3', 'From people mentioned in posts', 'neutral', 'adminRemovals'),
      ], 400),
    ])),
    equalize(row({ name: 'Bottom', w: 'fill', gap: 16, cross: 'start' }, [
      card('Bot rule performance', [
        table(
          [
            { label: 'Rule', w: 'fill' },
            { label: 'Holds 7d', w: 90 },
            { label: 'Overturned', w: 100 },
            { label: 'Status', w: 110 },
          ],
          [
            [small('Personal identifiers', 'text/primary'), small('64'), small('3%'), pill('Healthy', 'positive')],
            [small('Named crime accusation', 'text/primary'), small('21'), small('9%'), pill('Healthy', 'positive')],
            [small('Harassment classifier', 'text/primary'), small('48'), small('31%'), pill('Retune', 'warning', 'alert-triangle')],
            [small('Scam and money requests', 'text/primary'), small('17'), small('6%'), pill('Healthy', 'positive')],
          ],
        ),
      ]),
      card('Moderators on shift', [
        who('Mod_Kemi', '12 actions · 1h 20m exposure'),
        who('Mod_Tunde', '18 actions · 1h 55m exposure', 'positive'),
        who('Admin_Pritchard', 'Final say on permanent bans', 'warning'),
        small('Rotation every 2 hours. Images are blurred by default.', 'text/tertiary'),
      ], 400),
    ])),
  ]);
}

export function adminFlagged(): FrameNode {
  const rows: Kid[][] = [
    [sev('Severe'), small('Talking Stage Diaries'), small('"…his number is 0803 *** **99 and he works at…"', 'text/primary', 'fill', 2), small('Bot · identifiers'), sla('1h 40m', 'caution')],
    [sev('High'), small('Lagos Dating Life'), small('"[Name] is a scammer, everyone avoid…"', 'text/primary', 'fill', 2), small('Bot · accusation'), sla('52m', 'warning')],
    [sev('Medium'), small('First Date Stories'), small('"Some of you are so dramatic, honestly…"', 'text/primary', 'fill', 2), small('3 user reports'), sla('34m', 'neutral')],
    [sev('Low'), small('Talking Stage Diaries'), small('"DM me for the dating course link…"', 'text/primary', 'fill', 2), small('Bot · spam'), sla('12m', 'neutral')],
  ];
  const detail = col({ name: 'Detail', w: 440, gap: 16 }, [
    card('Post', [
      who('NaijaBelle', 'Talking Stage Diaries · 2h ago', 'warning'),
      small('Be careful with K***** from **** Lekki, his number is 0803 *** **99. He did the same thing to my friend and she lost 200k.', 'text/primary'),
      row({ name: 'Detected', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [pill('Phone number', 'caution'), pill('Name and workplace', 'caution'), pill('Accusation', 'warning')]),
    ]),
    card('Libra Bot reasoning', [
      small('Rules: phone number pattern matched (0.99). Classifier: low toxicity (0.18). LLM context: warning others with identifying details, not a personal story only (0.81).', 'text/primary'),
      small('Action taken: blocked before publishing; author asked to remove details.', 'text/tertiary'),
    ]),
    card('Member', [row({ name: 'Stats', w: 'fill', gap: 16 }, [small('Account 3 months'), small('Strikes 1'), small('Reports 0')])]),
    col({ name: 'Decide', w: 'fill', gap: 12 }, [
      fill(use('TextField', { State: 'Filled' }, { label: 'Rule', value: 'No identifying information about others' }, { show: ['trailing'], icons: { trailing: 'chevron-down' } })),
      btnRow([
        ['Approve', 'Secondary'],
        ['Remove', 'Secondary'],
        ['Remove and strike', 'Destructive'],
        ['Escalate', 'Tertiary'],
      ]),
      small('Every action is logged with the rule, the post and your name.', 'text/tertiary'),
    ]),
  ]);
  return shell('Admin · Flagged posts', 'adminFlagged', 'Flagged posts', '24 open · bot holds and member reports', [
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All 24' }), use('Chip', { Selected: 'Off' }, { label: 'Severe 3' }), use('Chip', { Selected: 'Off' }, { label: 'Bot holds 17' }), use('Chip', { Selected: 'Off' }, { label: 'Member reports 7' })]),
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'Severity', w: 80 },
          { label: 'Room', w: 140 },
          { label: 'Excerpt', w: 'fill' },
          { label: 'Source', w: 110 },
          { label: 'Waiting', w: 90 },
        ],
        rows,
        0,
      ),
      detail,
    ]),
  ]);
}

export function adminJoins(): FrameNode {
  const risk = (v: number, label: string, tone: Tone) =>
    col({ name: 'Risk', gap: 4, w: 'fill' }, [box({ name: 'Track', dir: 'h', w: 120, h: 6, radius: 3, fill: 'bg/muted' }, [rect(Math.round(120 * v), 6, toneTokens[tone].fg, 3, 'Bar')]), text(label, 'caption', toneTokens[tone].fg)]);
  const actions = () => row({ name: 'Actions', gap: 8 }, [use('Button', { Variant: 'Secondary', Size: 'Small' }, { label: 'Approve' }), use('Button', { Variant: 'Tertiary', Size: 'Small' }, { label: 'Reject' })]);
  return shell('Admin · Join requests', 'adminJoins', 'Join requests', '9 waiting · approval-required rooms', [
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All rooms' }), use('Chip', { Selected: 'Off' }, { label: 'Healing After Heartbreak 6' }), use('Chip', { Selected: 'Off' }, { label: 'Talking Stage Diaries 3' })]),
    table(
      [
        { label: 'Member', w: 'fill' },
        { label: 'Room', w: 200 },
        { label: 'Bot risk', w: 150 },
        { label: 'Signals', w: 280 },
        { label: 'Account', w: 100 },
        { label: '', w: 170 },
      ],
      [
        [who('QuietStorm_24', 'Phone verified · ID verified'), small('Healing After Heartbreak'), risk(0.12, 'Low', 'positive'), row({ name: 'Signals', gap: 6 }, [pill('Clean history', 'positive')]), small('8 months'), actions()],
        [who('Ade_new', 'Phone verified', 'warning'), small('Healing After Heartbreak'), risk(0.58, 'Medium', 'warning'), row({ name: 'Signals', gap: 6 }, [pill('New device', 'warning'), pill('2 days old', 'warning')]), small('2 days'), actions()],
        [who('BigBoyz_', 'Phone verified', 'neutral'), small('Talking Stage Diaries'), risk(0.91, 'High', 'caution'), row({ name: 'Signals', gap: 6 }, [pill('3 accounts on device', 'caution'), pill('Banned phone match', 'caution')]), small('1 day'), actions()],
        [who('Ronke.writes', 'Phone verified · ID verified', 'positive'), small('Talking Stage Diaries'), risk(0.08, 'Low', 'positive'), row({ name: 'Signals', gap: 6 }, [pill('Trusted reporter', 'brand')]), small('1 year'), actions()],
      ],
    ),
    row({ name: 'Note', gap: 8 }, [icon('info', 16, 'text/tertiary'), small('Rejections send the member a reason. High-risk requests with a banned phone match are flagged as possible ban evasion.', 'text/tertiary')]),
  ]);
}

export function adminAppeals(): FrameNode {
  const review = col({ name: 'Review', w: 520, gap: 16 }, [
    row({ name: 'Independence', w: 'fill', gap: 10, pad: 14, radius: 12, fill: 'brand/subtle' }, [icon('shield-check', 18, 'brand/fg'), small('Assigned to you because you did not issue this ban. Issued by Mod_Tunde.', 'text/primary')]),
    card('Original decision', [
      row({ name: 'Head', gap: 8 }, [pill('7-day room ban', 'caution'), pill('Strike 2', 'warning')]),
      small('Rule: no identifying information about others.', 'text/primary'),
      small('"…his name is K***** and he works at ****…"', 'text/secondary'),
    ]),
    card('Appeal from QuietStorm_24', [small('K is a nickname, not his real name, and the workplace was a general area, not his employer. I was warning people, not trying to expose him.', 'text/primary'), small('Submitted 24 Oct, 15:12 · 186 characters', 'text/tertiary')]),
    card('Decision', [
      radioGroup([
        { label: 'Overturn', detail: 'Restore access and remove the strike.' },
        { label: 'Reduce', detail: 'Shorter ban or lower strike.', on: true },
        { label: 'Uphold', detail: 'Keep the decision.' },
      ]),
      textArea('Explanation sent to the member', 'Thanks for explaining. We have reduced this to a 3-day ban. Please avoid partial names and workplaces.', false, 90),
      use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Submit decision' }),
    ]),
  ]);
  return shell('Admin · Appeals', 'adminAppeals', 'Appeals', '5 open · target response 72 hours', [
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'Member', w: 'fill' },
          { label: 'Decision', w: 140 },
          { label: 'Issued by', w: 110 },
          { label: 'Time left', w: 100 },
        ],
        [
          [who('QuietStorm_24', 'Talking Stage Diaries'), pill('7-day ban', 'caution'), small('Mod_Tunde'), sla('54h', 'positive')],
          [who('NaijaBelle', 'Lagos Dating Life', 'warning'), pill('Strike 1', 'warning'), small('Libra Bot'), sla('31h', 'positive')],
          [who('Tayo_Writes', 'First Date Stories', 'neutral'), pill('24h mute', 'warning'), small('Libra Bot'), sla('18h', 'warning')],
          [who('SoftLife_Ada', 'Talking Stage Diaries'), pill('Permanent', 'caution'), small('Admin review'), sla('6h', 'caution')],
        ],
        0,
      ),
      review,
    ]),
  ]);
}

export function adminMember(): FrameNode {
  const stat = (k: string, v: string) => col({ name: k, w: 'fill', gap: 2 }, [text(v, 'h3', 'text/primary'), text(k, 'caption', 'text/tertiary')]);
  return shell('Admin · Member', 'adminMember', 'QuietStorm_24', 'Member since Feb 2026 · 2 rooms', [
    card(null, [
      row({ name: 'Head', w: 'fill', gap: 16 }, [
        avatar('QS', 56, 'brand'),
        col({ name: 'Who', gap: 4, w: 'fill' }, [text('QuietStorm_24', 'h3', 'text/primary'), row({ name: 'Real', gap: 8 }, [icon('lock', 14, 'text/tertiary'), small('Real account hidden', 'text/tertiary', 160)])]),
        use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Reveal account (logged)' }, { show: ['icon'], icons: { icon: 'eye' } }),
        use('Button', { Variant: 'Destructive', Size: 'Medium' }, { label: 'Ban from all rooms' }),
      ]),
      divider(),
      row({ name: 'Stats', w: 'fill', gap: 24 }, [stat('Account age', '8 months'), stat('Posts', '42'), stat('Reports received', '2'), stat('Reports made', '6 · 83% upheld'), stat('Active strikes', '1')]),
    ]),
    row({ name: 'Columns', w: 'fill', gap: 16, cross: 'start' }, [
      card('Strikes and bans', [
        table(
          [
            { label: 'Date', w: 90 },
            { label: 'Action', w: 140 },
            { label: 'Rule', w: 'fill' },
            { label: 'By', w: 100 },
            { label: 'Status', w: 100 },
          ],
          [
            [small('24 Oct'), pill('7-day ban', 'caution'), small('Identifying information', 'text/primary'), small('Mod_Tunde'), pill('Appealed', 'brand')],
            [small('2 Jul'), pill('Strike 1', 'warning'), small('Selling', 'text/primary'), small('Libra Bot'), pill('Expired', 'neutral')],
            [small('18 Jun'), pill('Warning', 'neutral'), small('Rude tone', 'text/primary'), small('Libra Bot'), pill('Expired', 'neutral')],
          ],
        ),
      ]),
      card('Device and phone signals', [
        row({ name: 'Phone', gap: 8, w: 'fill' }, [icon('phone', 16, 'text/secondary'), small('+234 *** *** 0142 · verified', 'text/primary')]),
        row({ name: 'Devices', gap: 8, w: 'fill' }, [icon('smartphone', 16, 'text/secondary'), small('1 device · iPhone · Lagos', 'text/primary')]),
        row({ name: 'Linked', gap: 8, w: 'fill' }, [icon('users', 16, 'text/secondary'), small('No other accounts on this device', 'text/primary')]),
        row({ name: 'Evasion', gap: 8, w: 'fill' }, [icon('shield-check', 16, 'positive/fg'), small('Ban evasion check passed', 'positive/fg')]),
      ], 420),
    ]),
  ]);
}

export function adminRoom(): FrameNode {
  return shell('Admin · Room settings', 'adminRooms', 'Talking Stage Diaries', 'Rooms / Room settings · 1.2k members', [
    row({ name: 'Columns', w: 'fill', gap: 16, cross: 'start' }, [
      card('About', [
        fill(use('TextField', { State: 'Filled' }, { label: 'Room name', value: 'Talking Stage Diaries' })),
        textArea('Description', 'Stories and advice from the early days of getting to know someone.', false, 70),
        textArea('Rules shown to members', '1. Share your own experience.\n2. No names, handles, photos or workplaces.\n3. No threats, sexual violence or revenge.\n4. No hate, harassment, selling or money requests.\n5. Nothing involving anyone under 18.\n6. No screenshots outside Libra.', false, 170),
      ]),
      col({ name: 'Right', w: 'fill', gap: 16 }, [
        card('Joining', [radioGroup([{ label: 'Open with bot', detail: 'Low-risk requests are approved automatically.' }, { label: 'Approval required', detail: 'An admin reviews every request.', on: true }, { label: 'Invite only' }])]),
        card('Posting', [
          fill(use('ListRow', { Trailing: 'Value' }, { title: 'Slow mode', value: '5 minutes' }, { hide: ['subtitle'], icons: { icon: 'clock' } })),
          fill(use('ListRow', { Trailing: 'SwitchOn' }, { title: 'Images', subtitle: 'After 7 days without strikes' }, { icons: { icon: 'image' } })),
          fill(use('ListRow', { Trailing: 'Value' }, { title: 'Posts expire after', value: '30 days' }, { hide: ['subtitle'], icons: { icon: 'calendar' } })),
        ]),
        card('Keyword lists', [row({ name: 'Keywords', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [pill('leaked video', 'caution'), pill('send money', 'caution'), pill('his number is', 'caution'), pill('crypto', 'warning'), pill('promo', 'warning'), pill('+ Add', 'brand')])]),
      ]),
    ]),
  ], [use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Save changes' })]);
}

export function adminAudit(): FrameNode {
  const actor = (n: string, bot = false) => row({ name: n, gap: 8 }, [icon(bot ? 'shield' : 'user', 16, bot ? 'brand/fg' : 'text/secondary'), small(n, 'text/primary', 130)]);
  return shell('Admin · Audit log', 'adminAudit', 'Audit log', 'Every moderation action, immutable', [
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All actions' }), use('Chip', { Selected: 'Off' }, { label: 'Bot' }), use('Chip', { Selected: 'Off' }, { label: 'Moderators' }), use('Chip', { Selected: 'Off' }, { label: 'Account reveals' })]),
    table(
      [
        { label: 'Time', w: 120 },
        { label: 'Actor', w: 170 },
        { label: 'Action', w: 170 },
        { label: 'Target', w: 180 },
        { label: 'Rule', w: 'fill' },
      ],
      [
        [small('15:42:10'), actor('Libra Bot', true), pill('Blocked post', 'caution'), small('NaijaBelle · post 8821'), small('Personal identifiers')],
        [small('15:31:02'), actor('Mod_Kemi'), pill('Reduced ban', 'brand'), small('QuietStorm_24 · appeal 112'), small('Identifying information')],
        [small('15:20:44'), actor('Mod_Kemi'), pill('Revealed account', 'warning'), small('BigBoyz_'), small('Ban evasion check')],
        [small('15:02:19'), actor('Libra Bot', true), pill('Held for review', 'warning'), small('Tayo_Writes · post 8817'), small('Named crime accusation')],
        [small('14:48:55'), actor('Mod_Tunde'), pill('Removed and strike', 'caution'), small('Ade_new · post 8809'), small('Harassment')],
        [small('14:30:12'), actor('Admin_Pritchard'), pill('Changed room rules', 'neutral'), small('Talking Stage Diaries'), small('Rules text v4')],
      ],
    ),
    row({ name: 'Note', gap: 8 }, [icon('lock', 16, 'text/tertiary'), small('Entries cannot be edited or deleted. Exports are signed and include the moderator, rule and decision source.', 'text/tertiary')]),
  ], [use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Export CSV' }, { show: ['icon'], icons: { icon: 'download' } })]);
}

export function adminRemovals(): FrameNode {
  const detail = col({ name: 'Detail', w: 460, gap: 16 }, [
    card('Request LBR-RM-0193', [
      small('"Posts in Lagos Dating Life describe me with my workplace and first initial. Please remove them."', 'text/primary'),
      small('From k****@gmail.com · identity verified · 23 Oct', 'text/tertiary'),
    ]),
    card('Linked posts (2)', [
      small('"…K from **** in Lekki, avoid him…" · Lagos Dating Life · 20 Oct', 'text/secondary'),
      divider(),
      small('"Same K? He did this to me too…" · reply · 21 Oct', 'text/secondary'),
    ]),
    btnRow([
      ['Remove posts', 'Primary'],
      ['Ask for verification', 'Secondary'],
      ['Decline with reason', 'Tertiary'],
    ]),
    small('The requester is told the outcome. Authors are notified that a post was removed after a request, without the requester\'s details.', 'text/tertiary'),
  ]);
  return shell('Admin · Removal requests', 'adminRemovals', 'Removal requests', 'From people mentioned in room posts', [
    row({ name: 'Split', w: 'fill', gap: 20, cross: 'start' }, [
      table(
        [
          { label: 'Request', w: 'fill' },
          { label: 'Posts', w: 70 },
          { label: 'Room', w: 160 },
          { label: 'Status', w: 120 },
        ],
        [
          [small('LBR-RM-0193 · k****@gmail.com', 'text/primary'), small('2'), small('Lagos Dating Life'), pill('Verified', 'positive')],
          [small('LBR-RM-0192 · t****@yahoo.com', 'text/primary'), small('1'), small('First Date Stories'), pill('Awaiting ID', 'warning')],
          [small('LBR-RM-0190 · +234 ***4410', 'text/primary'), small('4'), small('Talking Stage Diaries'), pill('Removed', 'neutral')],
        ],
        0,
      ),
      detail,
    ]),
  ]);
}

export const ADMIN_PAGES: Array<[string, string, () => FrameNode]> = [
  ['adminOverview', 'Admin · Overview', adminOverview],
  ['adminFlagged', 'Admin · Flagged posts', adminFlagged],
  ['adminJoins', 'Admin · Join requests', adminJoins],
  ['adminAppeals', 'Admin · Appeals', adminAppeals],
  ['adminMember', 'Admin · Member profile', adminMember],
  ['adminRoom', 'Admin · Room settings', adminRoom],
  ['adminAudit', 'Admin · Audit log', adminAudit],
  ['adminRemovals', 'Admin · Removal requests', adminRemovals],
];