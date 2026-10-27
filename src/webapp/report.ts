import { Token } from '../tokens';
import { Tone, avatar, box, col, divider, fill, icon, pill, platformBadge, rect, row, text } from '../core/ui';
import { use } from '../components/library';
import { filledIcon, nickAvatar } from '../components/chat';
import { Person, daniel, people, seun, tobi } from '../screens/data';
import { alink, appFrame, btn, card, iconTileW, kv, modal, tabs, table } from './shell';
import { reportsTable } from './core';

const REPORT_TABS = ['Overview', 'Signals · 9', 'Personality', 'Evidence · 214', 'Chat signals'];
const TAB_LINKS = ['wReport', 'wSignals', 'wPersonality', 'wSignals', 'wChatReport'];

interface ReportCfg {
  p: Person;
  tilt: string;
  caution: string;
  positive: string;
  level: string;
  basis: string;
  summary: string;
  signals: Array<['caution' | 'positive', string, string]>;
  platforms: Array<[string, string, boolean]>;
}

const TOBI: ReportCfg = {
  p: tobi,
  tilt: 'Positive',
  caution: '2',
  positive: '8',
  level: 'High',
  basis: '214 public items · 3 platforms · 2019 to 2026',
  summary: "Tobi's public posts are mostly supportive and upbeat, with steady community involvement. A few heated replies in football threads and one older post about an ex are the only concerns.",
  signals: [
    ['positive', 'Supportive comments to women in tech', '23 comments · 2022 to 2026'],
    ['positive', 'Volunteering with a Lagos food bank', '6 posts · 2023 to 2026'],
    ['caution', 'Hostile replies during a football argument', '5 replies · Aug 2024 · Medium'],
    ['caution', 'Dismissive language about an ex', '1 thread · Feb 2021 · Low'],
  ],
  platforms: [
    ['IG', 'Instagram · 88 posts and captions', true],
    ['X', 'X · 104 posts and replies', true],
    ['TT', 'TikTok · 22 video captions', true],
    ['FB', 'Facebook · private, not checked', false],
  ],
};

const DANIEL: ReportCfg = {
  p: daniel,
  tilt: 'Caution',
  caution: '8',
  positive: '3',
  level: 'Medium',
  basis: '96 public items · 2 platforms · 2021 to 2026',
  summary: 'Findings are hidden until you choose to see them.',
  signals: [],
  platforms: [
    ['X', 'X · 81 posts and replies', true],
    ['IG', 'Instagram · 15 posts', true],
  ],
};

function signalRow(tone: 'caution' | 'positive', label: string, meta: string): FrameNode {
  return alink(
    row({ name: label, w: 'fill', gap: 12, pad: [12, 16] }, [
      iconTileW(tone === 'caution' ? 'alert-triangle' : 'check-circle', tone, 32),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(label, 'smallStrong', 'text/primary', { w: 'fill' }), text(meta, 'caption', 'text/secondary', { w: 'fill' })]),
      icon('chevron-right', 18, 'text/tertiary'),
    ]),
    'wSignals',
  );
}

function group(rows: SceneNode[], name = 'Group'): FrameNode {
  const kids: SceneNode[] = [];
  rows.forEach((r, i) => {
    if (i) kids.push(divider());
    kids.push(fill(r));
  });
  return col({ name, w: 'fill', radius: 16, fill: 'bg/surface', stroke: 'border/default', clip: true }, kids);
}

function reportHead(p: Person, meta: string): FrameNode {
  return row({ name: 'Person', w: 'fill', gap: 16 }, [
    avatar(p.initials, 64, p.tone),
    col({ name: 'Text', gap: 4, w: 'fill' }, [text(p.name, 'h1', 'text/primary'), text(p.handle + ' · ' + meta, 'small', 'text/secondary')]),
  ]);
}

function reportActions(): SceneNode[] {
  return [btn('Keep this', 'Secondary', 'Medium', 'bookmark'), btn('Side by side', 'Secondary', 'Medium', 'columns', 'wCompare'), btn('Share', 'Primary', 'Medium', 'share')];
}

function overview(cfg: ReportCfg, name: string): FrameNode {
  const dial = row({ name: 'Gut Meter', w: 'fill', gap: 24, pad: 28, radius: 24, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
    use('GutMeter', { Tilt: cfg.tilt }, { 'caution-score': cfg.caution, 'positive-score': cfg.positive }),
    col({ name: 'Verdict', gap: 10, w: 'fill' }, [
      text('Verdict', 'overline', 'brand/fg'),
      text(cfg.p.verdict, 'h2', 'text/primary', { w: 'fill' }),
      use('ConfidenceBadge', { Level: cfg.level }),
      text(cfg.basis, 'caption', 'text/tertiary', { w: 'fill' }),
    ]),
  ]);
  const content: SceneNode[] = [
    reportHead(cfg.p, cfg.p.updated),
    tabs(REPORT_TABS, 0, TAB_LINKS),
    dial,
    card('Summary', [text(cfg.summary, 'body', 'text/secondary', { w: 'fill' })]),
  ];
  if (cfg.signals.length) {
    content.push(col({ name: 'Top signals', w: 'fill', gap: 12 }, [row({ name: 'Head', gap: 8, w: 'fill' }, [text('Top signals', 'h3', 'text/primary', { w: 'fill' }), alink(text('See all 9', 'smallStrong', 'brand/fg'), 'wSignals')]), group(cfg.signals.map(([t, l, m]) => signalRow(t, l, m)), 'Signals')]));
  }
  content.push(
    card('What we checked', cfg.platforms.map(([code, label, ok]) => row({ name: label, w: 'fill', gap: 12 }, [platformBadge(code, 28), text(label, 'small', ok ? 'text/primary' : 'text/tertiary', { w: 'fill' }), icon(ok ? 'check-circle' : 'ban', 18, ok ? 'positive/fg' : 'text/tertiary')]))),
  );
  const rail: SceneNode[] = [
    card('Private note', [
      row({ name: 'Note', w: 'fill', gap: 8, pad: 12, radius: 12, fill: 'bg/subtle', cross: 'start' }, [icon('pencil', 16, 'text/tertiary'), text(cfg.p.note || 'Add a note only you can see.', 'small', 'text/secondary', { w: 'fill' })]),
      row({ name: 'Lock', gap: 6 }, [icon('lock', 12, 'text/tertiary'), text('Encrypted · only you can see notes', 'caption', 'text/tertiary')]),
    ], { action: 'Edit' }),
    card('Confidence', [kv('Public items', cfg.basis.split(' · ')[0].replace(' public items', '')), kv('Platforms', String(cfg.platforms.filter((x) => x[2]).length) + ' of ' + cfg.platforms.length), kv('Time span', cfg.basis.split(' · ')[2] || '2019 to 2026'), kv('Accounts', 'Confirmed by you', 'positive/fg')]),
    alink(
      card('Chat signals', [text('Link a conversation to see chat signals beside public ones. They are never mixed into these scores.', 'small', 'text/secondary', { w: 'fill' }), row({ name: 'CTA', gap: 6 }, [icon('message', 16, 'brand/fg'), text('Check a Chat', 'smallStrong', 'brand/fg')])]),
      'wAnalyse',
    ),
    row({ name: 'Footnote', w: 'fill', gap: 8, pad: 16, radius: 16, fill: 'bg/subtle', cross: 'start' }, [icon('info', 16, 'text/tertiary'), text('Based on public content only. People are more than their posts.', 'small', 'text/secondary', { w: 'fill' })]),
  ];
  return appFrame({ name, active: 'wSaved', title: 'Report', crumb: 'Saved / ' + cfg.p.name, actions: reportActions(), rail }, content);
}

export const wReport = () => overview(TOBI, 'Report · Overview');

export function wSevere(): FrameNode {
  const dialog = col({ name: 'Take a breath', w: 560, gap: 16, pad: 36, radius: 28, fill: 'bg/raised', shadow: 'e3' }, [
    iconTileW('wind', 'brand', 56),
    text('Take a breath', 'h1', 'text/primary'),
    text("This report about Daniel Okafor includes content some people find upsetting. You're in control: read the findings when you're ready, or talk to someone first.", 'body', 'text/secondary', { w: 'fill' }),
    row({ name: 'Actions', gap: 12, w: 'fill' }, [alink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Show findings' })), 'wSignals'), alink(use('Button', { Variant: 'Secondary', Size: 'Large' }, { label: 'Talk to someone first' }, { show: ['icon'], icons: { icon: 'life-buoy' } }), 'wSafety')]),
  ]);
  return modal(overview(DANIEL, 'Report · Serious concerns'), dialog, 'Report · Serious concerns');
}

// ---------------------------------------------------------------- signals

export function wSignals(): FrameNode {
  const sc = (category: string, meta: string, severity: string, code: string, source: string, snippet: string, side = 'Caution') =>
    fill(use('SignalCard', { Side: side }, { category, meta, severity, source, snippet, code }));
  const check = (ok: boolean, label: string) => row({ name: label, gap: 10, w: 'fill', cross: 'start' }, [icon(ok ? 'check-circle' : 'info', 18, ok ? 'positive/fg' : 'warning/fg'), text(label, 'small', 'text/primary', { w: 'fill' })]);
  const weight = (label: string, value: string, pct: number, token: Token) =>
    col({ name: label, gap: 6, w: 'fill' }, [row({ name: 'Head', gap: 8, w: 'fill' }, [text(label, 'small', 'text/secondary', { w: 'fill' }), text(value, 'smallStrong', 'text/primary')]), box({ name: 'Track', dir: 'h', w: 'fill', h: 6, radius: 3, fill: 'bg/muted' }, [rect(Math.round(240 * pct), 6, token, 3, 'Bar')])]);
  const list = col({ name: 'List', w: 480, gap: 12 }, [
    fill(use('Segmented', { Active: 'First' }, { first: 'Caution · 3', second: 'Positive · 6' })),
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All' }), use('Chip', { Selected: 'Off' }, { label: 'Recent' }), use('Chip', { Selected: 'Off' }, { label: 'Strongest' })]),
    sc('Hostile replies during a football argument', '5 replies in one thread · Aug 2024', 'Medium', 'X', 'X · reply · 3 Aug 2024', '"Nobody asked for your opinion. Log off and touch grass, clown."'),
    sc('Dismissive language about an ex', '1 thread · Feb 2021', 'Low', 'IG', 'Instagram · caption · 14 Feb 2021', '"Some people only love you when it\'s convenient. Lesson learnt."'),
    sc('Content flagged as objectifying', '1 comment · Jun 2020', 'Low', 'IG', 'Instagram · comment · 2 Jun 2020', '"Rate her out of 10 lol"'),
  ]);
  const detail = col({ name: 'Evidence detail', w: 'fill', gap: 16 }, [
    card(null, [
      row({ name: 'Finding', gap: 12, w: 'fill' }, [iconTileW('alert-triangle', 'caution', 44), col({ name: 'Text', gap: 2, w: 'fill' }, [text('Hostile replies during a football argument', 'h3', 'text/primary', { w: 'fill' }), text('Caution · Medium severity · 1 of 5 items', 'small', 'text/secondary')])]),
      col({ name: 'Post', w: 'fill', gap: 10, pad: 16, radius: 14, fill: 'bg/subtle' }, [
        row({ name: 'Author', gap: 10 }, [platformBadge('X', 28), col({ name: 'Who', gap: 0 }, [text('@tobiadeyemi', 'smallStrong', 'text/primary'), text('Reply to @lagosfootyfan · 3 Aug 2024, 21:14', 'caption', 'text/tertiary')])]),
        text('"Nobody asked for your opinion. Log off and touch grass, clown."', 'body', 'text/primary', { w: 'fill' }),
        btn('View on X', 'Secondary', 'Small', 'external-link'),
      ]),
      row({ name: 'Two', w: 'fill', gap: 16, cross: 'start' }, [
        col({ name: 'Why', w: 'fill', gap: 10 }, [text('Why this was flagged', 'title', 'text/primary'), text('Insulting language aimed at another person, repeated across 5 replies in one thread.', 'small', 'text/secondary', { w: 'fill' }), text('Context checks', 'title', 'text/primary'), check(true, 'Written by Tobi, not a reshare'), check(true, 'Not a quote, lyric or satire'), check(false, 'Heated sports thread, so it counts for less')]),
        col({ name: 'Weights', w: 'fill', gap: 12 }, [text('How much this counts', 'title', 'text/primary'), weight('Severity', 'Medium · 0.45', 0.45, 'caution/fg'), weight('Recency', '2024 · 80%', 0.8, 'brand/fg'), weight('Authorship', 'Own reply · 100%', 1, 'brand/fg'), weight('Account confidence', 'Confirmed · 100%', 1, 'positive/fg')]),
      ]),
      divider(),
      row({ name: 'Actions', gap: 12 }, [btn("Doesn't apply", 'Secondary', 'Medium', 'eye-off'), btn('Add a note', 'Secondary', 'Medium', 'pencil'), btn('Report an issue', 'Tertiary', 'Medium', 'flag')]),
    ]),
  ]);
  return appFrame({ name: 'Report · Signals', active: 'wSaved', title: 'Report', crumb: 'Saved / Tobi Adeyemi', actions: reportActions() }, [
    reportHead(tobi, tobi.updated),
    tabs(REPORT_TABS, 1, TAB_LINKS),
    row({ name: 'Master detail', w: 'fill', gap: 24, cross: 'start' }, [list, detail]),
  ]);
}

// ---------------------------------------------------------------- personality

export function wPersonality(): FrameNode {
  const traits: Array<[string, string, string, string]> = [
    ['Tone', 'Warm', '4', 'High confidence · 214 posts'],
    ['Humour', 'Playful, some sarcasm', '3', 'High confidence · 96 posts'],
    ['Empathy cues', 'Frequent', '4', 'Medium confidence · 41 posts'],
    ['Conflict style', 'Calm, curt in sport debates', '3', 'Medium confidence · 18 threads'],
    ['How he talks about women and exes', 'Respectful', '4', 'Medium confidence · 12 posts'],
    ['Openness', 'Open to other views', '4', 'Medium confidence · 30 posts'],
  ];
  const bar = ([label, value, level, note]: (typeof traits)[number]) => fill(use('TraitBar', { Level: level }, { label, value, note }));
  const prompt = (s: string) => row({ name: 'Prompt', gap: 10, w: 'fill', cross: 'start' }, [icon('message', 18, 'brand/fg'), text(s, 'body', 'text/primary', { w: 'fill' })]);
  return appFrame({ name: 'Report · Personality', active: 'wSaved', title: 'Report', crumb: 'Saved / Tobi Adeyemi', actions: reportActions() }, [
    reportHead(tobi, tobi.updated),
    tabs(REPORT_TABS, 2, TAB_LINKS),
    row({ name: 'Top', w: 'fill', gap: 24, cross: 'start' }, [
      card('How Tobi communicates online', [
        text('Tobi comes across as warm and playful, with quick humour that sometimes turns sarcastic in sports debates. He is consistently respectful about women and former partners, apologises when he gets things wrong, and returns often to community and craft.', 'body', 'text/secondary', { w: 'fill' }),
        row({ name: 'Themes', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, ['Design', 'Football', 'Cooking', 'Volunteering', 'Tech meetups'].map((t) => use('Chip', { Selected: 'Off' }, { label: t }))),
      ]),
      card('What this might mean in a relationship', [prompt('Playful sarcasm can be fun. Notice how it lands when you push back.'), prompt('He talks a lot about community. Ask what he is involved in right now.'), prompt('Sports debates get heated. Worth seeing how disagreement feels in person.')], { w: 460 }),
    ]),
    card('Communication traits', [row({ name: 'Grid', w: 'fill', gap: 32, cross: 'start' }, [col({ name: 'Left', w: 'fill', gap: 20 }, traits.slice(0, 3).map(bar)), col({ name: 'Right', w: 'fill', gap: 20 }, traits.slice(3).map(bar))])]),
    row({ name: 'Disclaimer', w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'bg/subtle' }, [icon('info', 18, 'text/tertiary'), text('An observation of public online behaviour, not a diagnosis. Based on limited public content; people are more than their posts.', 'small', 'text/secondary', { w: 'fill' })]),
  ]);
}

// ---------------------------------------------------------------- compare

export function wCompare(): FrameNode {
  const head = (p: Person) =>
    row({ name: p.first, w: 'fill', gap: 16, pad: 24, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
      avatar(p.initials, 56, p.tone),
      col({ name: 'Text', gap: 4, w: 'fill' }, [text(p.name, 'h3', 'text/primary'), text(p.verdict, 'small', 'text/secondary'), use('ConfidenceBadge', { Level: p.confidence })]),
      row({ name: 'Scores', gap: 20 }, [
        col({ name: 'C', gap: 0, cross: 'center' }, [text(String(p.caution), { family: 'display', weight: 800, size: 36, line: 40 }, 'caution/fg'), text('Caution', 'caption', 'text/secondary')]),
        col({ name: 'P', gap: 0, cross: 'center' }, [text(String(p.positive), { family: 'display', weight: 800, size: 36, line: 40 }, 'positive/fg'), text('Positive', 'caption', 'text/secondary')]),
      ]),
    ]);
  const bar = (v: number, token: Token) => row({ name: 'Bar', gap: 10, w: 'fill' }, [box({ name: 'Track', dir: 'h', w: 280, h: 8, radius: 4, fill: 'bg/muted' }, [rect(Math.max(6, 28 * v), 8, token, 4, 'Fill')]), text(String(v), 'smallStrong', 'text/primary')]);
  const cats: Array<[string, 'caution' | 'positive', number, number]> = [
    ['Respect toward women', 'positive', 8, 6],
    ['Community involvement', 'positive', 7, 4],
    ['Consistency across platforms', 'positive', 9, 6],
    ['Harassment and hostility', 'caution', 3, 4],
    ['Deception signals', 'caution', 1, 3],
  ];
  return appFrame({ name: 'Compare', active: 'wSaved', title: 'Compare', crumb: 'Saved / Compare', actions: [btn('Share', 'Secondary', 'Medium', 'share')] }, [
    row({ name: 'Pickers', w: 'fill', gap: 16 }, [
      fill(use('TextField', { State: 'Filled' }, { label: 'First person', value: 'Tobi Adeyemi' }, { show: ['trailing'], icons: { trailing: 'chevron-down' } })),
      fill(use('TextField', { State: 'Filled' }, { label: 'Second person', value: 'Seun Bakare' }, { show: ['trailing'], icons: { trailing: 'chevron-down' } })),
    ]),
    row({ name: 'Heads', w: 'fill', gap: 16 }, [head(tobi), head(seun)]),
    table(
      [
        { label: 'Category', w: 'fill' },
        { label: 'Tobi', w: 340 },
        { label: 'Seun', w: 340 },
      ],
      cats.map(([c, side, a, b]) => {
        const tok: Token = side === 'caution' ? 'caution/fg' : 'positive/fg';
        return [row({ name: c, gap: 10 }, [icon(side === 'caution' ? 'alert-triangle' : 'check-circle', 18, tok), text(c, 'bodyStrong', 'text/primary')]), bar(a, tok), bar(b, tok)];
      }),
    ),
    row({ name: 'Note', gap: 8 }, [icon('info', 16, 'text/tertiary'), text('Both reports use scoring version 1.3. Seun has less public data, so differences are less certain.', 'small', 'text/tertiary')]),
  ]);
}

// ---------------------------------------------------------------- saved

export function wSaved(): FrameNode {
  return appFrame({ name: 'Saved · People', active: 'wSaved', title: 'Saved', actions: [btn('Side by side', 'Secondary', 'Medium', 'columns', 'wCompare')] }, [
    tabs(['People · 4', 'Threads · 3'], 0, ['wSaved', 'wSavedThreads']),
    row({ name: 'Filters', w: 'fill', gap: 8 }, [
      box({ name: 'Search', dir: 'h', w: 320, h: 40, pad: [0, 14], gap: 8, radius: 10, fill: 'bg/surface', stroke: 'border/strong', cross: 'center' }, [icon('search', 18, 'text/tertiary'), text('Search saved people', 'small', 'text/tertiary')]),
      use('Chip', { Selected: 'On' }, { label: 'All' }),
      use('Chip', { Selected: 'Off' }, { label: 'Mostly positive' }),
      use('Chip', { Selected: 'Off' }, { label: 'Caution' }),
      use('Chip', { Selected: 'Off' }, { label: 'Low data' }),
    ]),
    reportsTable(people, 'notes'),
  ]);
}

export function wSavedThreads(): FrameNode {
  const t = (room: string, nick: string, tone: Tone, type: string, snippet: string, meta: string, fresh?: string) =>
    alink(
      row({ name: snippet.slice(0, 20), w: 'fill', gap: 16, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default', cross: 'start' }, [
        nickAvatar(nick, tone, 40),
        col({ name: 'Text', gap: 6, w: 'fill' }, [
          row({ name: 'Head', gap: 8, w: 'fill' }, [text(nick, 'bodyStrong', 'text/primary'), pill(type, 'neutral'), text('in ' + room, 'small', 'brand/fg', { w: 'fill' }), fresh ? pill(fresh, 'brand') : null]),
          text(snippet, 'body', 'text/primary', { w: 'fill', maxLines: 2 }),
          row({ name: 'Meta', gap: 6 }, [icon('messages', 14, 'text/tertiary'), text(meta, 'caption', 'text/tertiary')]),
        ]),
        filledIcon('bookmark', 20, 'brand/fg'),
      ]),
      'wRoomsThread',
    );
  return appFrame({ name: 'Saved · Threads', active: 'wSaved', title: 'Saved' }, [
    tabs(['People · 4', 'Threads · 3'], 1, ['wSaved', 'wSavedThreads']),
    text('Saved threads keep the full gist in one place, with new replies marked.', 'small', 'text/tertiary'),
    t('Talking Stage Diaries', 'QuietStorm_24', 'brand', 'Win', 'He said "no pressure" and actually meant it. Waited two weeks for me to feel ready, then picked somewhere public without me asking.', '14 replies · last 2m ago', '3 new'),
    t('Lagos Dating Life', 'NaijaBelle', 'warning', 'Question', 'Where are the best public spots for a first date on the Island?', '41 replies · last 1h ago', '12 new'),
    t('Safety First', 'Mod_Tunde', 'positive', 'Advice', 'New scam pattern: fake courier fees before a first meeting. Here is how it works.', '22 replies · yesterday'),
  ]);
}

