import { Token } from '../tokens';
import { Tone, avatar, box, col, fill, icon, rect, row, text } from '../core/ui';
import { btn, center, chip, iconTile, link, group, note, platformLine, screen, sectionHead, surface, use } from './kit';
import { Person, daniel, kemi, tobi } from './data';

function personHeader(p: Person, meta: string): FrameNode {
  return row({ name: 'Person', w: 'fill', gap: 14 }, [
    avatar(p.initials, 56, p.tone),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text(p.name, 'h3', 'text/primary', { w: 'fill' }), text(meta, 'small', 'text/secondary', { w: 'fill' })]),
  ]);
}

function dialCard(tilt: string, caution: string, positive: string, level: string, verdict: string, basis: string): FrameNode {
  return col({ name: 'Libra Scale', w: 'fill', pad: [20, 0, 18, 0], gap: 14, radius: 24, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
    col({ name: 'Verdict', gap: 4, w: 'fill', pad: [0, 20], cross: 'center' }, [text('Verdict', 'overline', 'brand/fg'), center(verdict, 'h2')]),
    use('ScaleDial', { Tilt: tilt }, { 'caution-score': caution, 'positive-score': positive }),
    use('ConfidenceBadge', { Level: level }),
    col({ name: 'Basis', w: 'fill', pad: [0, 20] }, [center(basis, 'caption', 'text/tertiary')]),
  ]);
}

function signalRow(tone: Tone, label: string, meta: string, target?: string): FrameNode {
  const r = row({ name: label, w: 'fill', gap: 12, pad: [12, 14] }, [
    iconTile(tone === 'caution' ? 'alert-triangle' : 'check-circle', tone, 32),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text(label, 'smallStrong', 'text/primary', { w: 'fill' }), text(meta, 'caption', 'text/secondary', { w: 'fill' })]),
    icon('chevron-right', 18, 'text/tertiary'),
  ]);
  if (target) link(r, target);
  return r;
}

function tile(iconName: string, title: string, caption: string, target?: string): FrameNode {
  const t = col({ name: title, w: 'fill', pad: 16, gap: 10, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    iconTile(iconName, 'brand', 36),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary'), text(caption, 'caption', 'text/secondary', { w: 'fill' })]),
  ]);
  if (target) link(t, target);
  return t;
}

export function report(): FrameNode {
  return screen(
    {
      name: 'Report · Overview',
      nav: { title: 'Report', action: 'share', backTo: 'home' },
      tall: true,
      gap: 20,
      footer: [row({ name: 'Actions', gap: 12, w: 'fill' }, [btn('Save', 'Secondary', 'Large', 'bookmark'), btn('Share', 'Primary', 'Large', 'share')])],
      footerDivider: true,
    },
    [
      personHeader(tobi, tobi.handle + ' · 3 platforms'),
      dialCard('Positive', '2', '8', 'High', tobi.verdict, '214 public items · Instagram, X and TikTok · 2019 to 2026'),
      surface([
        text('Summary', 'h3', 'text/primary'),
        text(
          "Tobi's public posts are mostly supportive and upbeat, with steady community involvement. A few heated replies in football threads and one older post about an ex are the only concerns.",
          'body',
          'text/secondary',
          { w: 'fill' },
        ),
      ]),
      col({ name: 'Top signals', gap: 12, w: 'fill' }, [
        sectionHead('Top signals', 'See all 9', 'signalsCaution'),
        group([
          signalRow('positive', 'Supportive comments to women in tech', '23 comments · 2022 to 2026', 'signalsPositive'),
          signalRow('positive', 'Volunteering with a Lagos food bank', '6 posts · 2023 to 2026', 'signalsPositive'),
          signalRow('caution', 'Hostile replies during a football argument', '5 replies · Aug 2024 · Medium', 'evidence'),
        ]),
      ]),
      col({ name: 'Explore', gap: 12, w: 'fill' }, [
        row({ name: 'Row 1', gap: 12, w: 'fill' }, [tile('sliders', 'Signals', '3 caution · 6 positive', 'signalsCaution'), tile('message', 'Personality', 'Communication style', 'personality')]),
        row({ name: 'Row 2', gap: 12, w: 'fill' }, [tile('file', 'Evidence', '214 public items', 'evidence'), tile('columns', 'Compare', 'Side by side with Seun', 'compare')]),
      ]),
      surface([
        text('What we checked', 'h3', 'text/primary'),
        platformLine('IG', 'Instagram · 88 posts and captions'),
        platformLine('X', 'X · 104 posts and replies'),
        platformLine('TT', 'TikTok · 22 video captions'),
        platformLine('FB', 'Facebook · private, not checked', false),
      ]),
      col({ name: 'Footnote', gap: 6, w: 'fill', pad: [4, 0, 8, 0] }, [
        center('Based on public content only. People are more than their posts.', 'caption', 'text/tertiary'),
        center('Something wrong? Report an issue', 'caption', 'brand/fg'),
      ]),
    ],
  );
}

export function reportSevere(): FrameNode {
  return screen(
    {
      name: 'Report · Serious concerns',
      nav: { title: 'Report', action: 'more', backTo: 'home' },
      tall: true,
      gap: 16,
      footer: [link(btn('Show findings'), 'signalsCaution'), link(btn('Talk to someone first', 'Secondary', 'Large', 'life-buoy'), 'safety')],
    },
    [
      personHeader(daniel, daniel.handle + ' · 2 platforms'),
      col({ name: 'Take a breath', w: 'fill', pad: 20, gap: 12, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [
        row({ name: 'Head', gap: 12, w: 'fill' }, [iconTile('wind', 'brand', 44), text('Take a breath', 'h2', 'text/primary', { w: 'fill' })]),
        text(
          "This report includes content some people find upsetting. You're in control: read the findings when you're ready, or talk to someone first.",
          'body',
          'text/secondary',
          { w: 'fill' },
        ),
      ]),
      dialCard('Caution', '8', '3', 'Medium', daniel.verdict, 'Findings are hidden until you choose to see them'),
    ],
  );
}

export function reportLow(): FrameNode {
  return screen(
    {
      name: 'Report · Low confidence',
      nav: { title: 'Report', action: 'more', backTo: 'home' },
      tall: true,
      gap: 16,
      footer: [btn('Add another account', 'Primary', 'Large', 'plus')],
    },
    [
      personHeader(kemi, kemi.handle + ' · 1 platform'),
      dialCard('Low', '1', '2', 'Low', 'Not enough public information', 'Scores are capped until there is more to go on'),
      note('info', "We found only 6 public posts on 1 platform. That's not a clean or a bad result, just too little to weigh fairly.", 'neutral'),
      surface([text('What we checked', 'h3', 'text/primary'), platformLine('IG', 'Instagram · 6 posts'), platformLine('X', 'X · no matching account found', false), platformLine('TT', 'TikTok · no matching account found', false)]),
    ],
  );
}

// ---------------------------------------------------------------- signals

interface Signal {
  side: 'Caution' | 'Positive';
  category: string;
  meta: string;
  severity: string;
  platform: string;
  source: string;
  snippet: string;
}

const caution: Signal[] = [
  {
    side: 'Caution',
    category: 'Hostile replies during a football argument',
    meta: '5 replies in one thread · Aug 2024',
    severity: 'Medium',
    platform: 'X',
    source: 'X · reply · 3 Aug 2024',
    snippet: '"Nobody asked for your opinion. Log off and touch grass, clown."',
  },
  {
    side: 'Caution',
    category: 'Dismissive language about an ex',
    meta: '1 thread · Feb 2021',
    severity: 'Low',
    platform: 'IG',
    source: 'Instagram · caption · 14 Feb 2021',
    snippet: '"Some people only love you when it\'s convenient. Lesson learnt."',
  },
  {
    side: 'Caution',
    category: 'Content flagged as objectifying',
    meta: '1 comment · Jun 2020',
    severity: 'Low',
    platform: 'IG',
    source: 'Instagram · comment · 2 Jun 2020',
    snippet: '"Rate her out of 10 lol"',
  },
];

const positive: Signal[] = [
  {
    side: 'Positive',
    category: 'Supportive comments to women in tech',
    meta: '23 comments · 2022 to 2026',
    severity: 'Strong',
    platform: 'X',
    source: 'X · reply · 11 Mar 2026',
    snippet: '"Proud of you! Your talk on accessibility was the best one today."',
  },
  {
    side: 'Positive',
    category: 'Volunteering with a Lagos food bank',
    meta: '6 posts · 2023 to 2026',
    severity: 'Strong',
    platform: 'IG',
    source: 'Instagram · post · 21 Dec 2025',
    snippet: '"Third year packing boxes with this crew. Come through on Saturday."',
  },
  {
    side: 'Positive',
    category: 'Apologised and corrected a mistake publicly',
    meta: '1 thread · Jan 2025',
    severity: 'Moderate',
    platform: 'X',
    source: 'X · post · 9 Jan 2025',
    snippet: '"I was wrong about this and I\'ve deleted the tweet. Thanks for explaining it."',
  },
];

function signalCard(s: Signal, target?: string): SceneNode {
  const c = fill(use('SignalCard', { Side: s.side }, { category: s.category, meta: s.meta, severity: s.severity, source: s.source, snippet: s.snippet, code: s.platform }));
  if (target) {
    const v = (c as FrameNode).findOne((n) => n.name === 'View source');
    if (v) link(v, target);
  }
  return c;
}

function signals(active: 'First' | 'Second'): FrameNode {
  const list = active === 'First' ? caution : positive;
  return screen(
    { name: active === 'First' ? 'Signals · Caution' : 'Signals · Positive', nav: { title: 'Signals', action: 'sliders', backTo: 'report' }, gap: 14 },
    [
      link(fill(use('Segmented', { Active: active }, { first: 'Caution · 3', second: 'Positive · 6' })), active === 'First' ? 'signalsPositive' : 'signalsCaution'),
      row({ name: 'Filters', gap: 8 }, [chip('All', true), chip('Recent'), chip('Strongest')]),
      ...list.map((s, i) => signalCard(s, i === 0 && active === 'First' ? 'evidence' : undefined)),
    ],
  );
}

export const signalsCaution = () => signals('First');
export const signalsPositive = () => signals('Second');

function weightRow(label: string, value: string, pct: number, token: Token): FrameNode {
  return col({ name: label, gap: 6, w: 'fill' }, [
    row({ name: 'Head', gap: 8, w: 'fill' }, [text(label, 'small', 'text/secondary', { w: 'fill' }), text(value, 'smallStrong', 'text/primary')]),
    box({ name: 'Track', dir: 'h', w: 313, h: 6, radius: 3, fill: 'bg/muted' }, [rect(Math.max(4, Math.round(313 * pct)), 6, token, 3, 'Bar')]),
  ]);
}

export function evidence(): FrameNode {
  const check = (ok: boolean, label: string) =>
    row({ name: label, gap: 10, w: 'fill', cross: 'start' }, [icon(ok ? 'check-circle' : 'info', 18, ok ? 'positive/fg' : 'warning/fg'), text(label, 'small', 'text/primary', { w: 'fill' })]);
  return screen(
    {
      name: 'Evidence detail',
      nav: { title: 'Evidence', action: 'external-link', backTo: 'signalsCaution' },
      tall: true,
      gap: 16,
      footer: [row({ name: 'Actions', gap: 12, w: 'fill' }, [btn('Not relevant', 'Secondary', 'Large', 'eye-off'), btn('Add a note', 'Secondary', 'Large', 'pencil')])],
      footerDivider: true,
    },
    [
      row({ name: 'Finding', gap: 12, w: 'fill' }, [
        iconTile('alert-triangle', 'caution', 44),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('Hostile replies during a football argument', 'bodyStrong', 'text/primary', { w: 'fill' }), text('Caution · Medium severity · 1 of 5 items', 'small', 'text/secondary', { w: 'fill' })]),
      ]),
      surface([
        row({ name: 'Author', gap: 10, w: 'fill' }, [
          box({ name: 'Platform', dir: 'h', w: 36, h: 36, radius: 10, fill: 'bg/muted', main: 'center', cross: 'center' }, [text('X', 'bodyStrong', 'text/secondary')]),
          col({ name: 'Who', gap: 0, w: 'fill' }, [text('@tobiadeyemi', 'smallStrong', 'text/primary'), text('Reply · 3 Aug 2024, 21:14', 'caption', 'text/tertiary')]),
        ]),
        text('Replying to @lagosfootyfan', 'caption', 'text/tertiary'),
        text('"Nobody asked for your opinion. Log off and touch grass, clown."', 'body', 'text/primary', { w: 'fill' }),
        btn('View on X', 'Secondary', 'Medium', 'external-link'),
      ], 'Post'),
      surface([text('Why this was flagged', 'title', 'text/primary'), text('Insulting language aimed at another person, repeated across 5 replies in one thread.', 'small', 'text/secondary', { w: 'fill' })]),
      surface([
        text('Context checks', 'title', 'text/primary'),
        check(true, 'Written by Tobi, not a reshare'),
        check(true, 'Not a quote, song lyric or satire'),
        check(false, 'Part of a heated sports thread, so it counts for less'),
      ]),
      surface([
        text('How much this counts', 'title', 'text/primary'),
        weightRow('Severity', 'Medium · 0.45', 0.45, 'caution/fg'),
        weightRow('Recency', '2024 · 80%', 0.8, 'brand/fg'),
        weightRow('Authorship', 'Own reply · 100%', 1, 'brand/fg'),
        weightRow('Account confidence', 'Confirmed · 100%', 1, 'positive/fg'),
      ]),
      note('info', 'The person can dispute any finding through the public opt-out page. Disputed items are reviewed by a person.', 'neutral'),
    ],
  );
}