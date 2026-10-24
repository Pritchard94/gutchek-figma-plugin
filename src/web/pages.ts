import { Token } from '../tokens';
import { box, col, divider, fill, icon, pill, row, text } from '../core/ui';
import { use } from '../components/library';
import { radioGroup, textArea } from '../screens/kit';
import { GUTTER, MOBILE, check, ctaBand, display, faq, featureCard, heading, lead, legalLayout, mobileNav, phone, section, webFooter, webNav, webPage, wlink } from './kit';
import { Screens, planCard } from './landing';

function field(label: string, value: string, state = 'Filled', o: { prefix?: string; leading?: string; trailing?: string } = {}): SceneNode {
  const show: string[] = [];
  const icons: Record<string, string> = {};
  const texts: Record<string, string> = { label, value };
  if (o.prefix) {
    show.push('prefix');
    texts.prefix = o.prefix;
  }
  if (o.leading) {
    show.push('leading');
    icons.leading = o.leading;
  }
  if (o.trailing) {
    show.push('trailing');
    icons.trailing = o.trailing;
  }
  return fill(use('TextField', { State: state }, texts, { show, icons }));
}

function btn(label: string, variant = 'Primary', size = 'Large', target?: string): SceneNode {
  const b = use('Button', { Variant: variant, Size: size }, { label });
  return target ? wlink(b, target) : b;
}

function hero(eyebrow: string, title: string, sub: string, tone: Token = 'bg/surface'): FrameNode {
  return col({ name: 'Hero', w: 'fill', pad: [96, GUTTER, 80, GUTTER], cross: 'center', fill: tone }, [heading(eyebrow, title, sub, { align: 'center', w: 880, size: 60 })]);
}

function sideNote(title: string, items: string[], noteText?: string): FrameNode {
  return col({ name: title, w: 400, gap: 20, pad: 32, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [
    text(title, 'h3', 'text/primary'),
    col({ name: 'Items', gap: 16, w: 'fill' }, items.map((t, i) =>
      row({ name: 'Item ' + (i + 1), gap: 14, w: 'fill', cross: 'start' }, [
        box({ name: 'Number', dir: 'h', w: 28, h: 28, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(String(i + 1), 'smallStrong', 'brand/on-subtle')]),
        text(t, 'body', 'text/secondary', { w: 'fill' }),
      ]),
    )),
    noteText
      ? row({ name: 'Note', gap: 10, w: 'fill', pad: 16, radius: 14, fill: 'brand/subtle', cross: 'start' }, [icon('eye-off', 18, 'brand/fg'), text(noteText, 'small', 'text/primary', { w: 'fill' })])
      : null,
  ]);
}

function formCard(title: string, sub: string, kids: SceneNode[], w: number | 'fill' = 'fill'): FrameNode {
  return col({ name: title, w, gap: 20, pad: 40, radius: 28, fill: 'bg/surface', stroke: 'border/default' }, [
    col({ name: 'Head', gap: 6, w: 'fill' }, [text(title, 'h2', 'text/primary', { w: 'fill' }), text(sub, 'body', 'text/secondary', { w: 'fill' })]),
    ...kids,
  ]);
}

// ---------------------------------------------------------------- how it works

export function howItWorks(s: Screens): FrameNode {
  const stepRow = (n: string, id: string, title: string, body: string, points: string[], flip: boolean) => {
    const art = box({ name: 'Art', dir: 'h', w: 520, h: 560, radius: 40, fill: 'brand/subtle', main: 'center', cross: 'center' }, [phone(s[id], 0.58)]);
    const copy = col({ name: 'Copy', gap: 18, w: 'fill' }, [
      pill('Step ' + n, 'brand'),
      text(title, display(40, 48), 'text/primary', { w: 'fill' }),
      text(body, lead, 'text/secondary', { w: 'fill' }),
      col({ name: 'Points', gap: 12, w: 'fill' }, points.map((p) => check(p))),
    ]);
    return row({ name: 'Step ' + n, w: 'fill', gap: 80, cross: 'center' }, flip ? [copy, art] : [art, copy]);
  };
  const weight = (iconName: string, title: string, body: string) => featureCard(iconName, title, body);
  return webPage('How it works', [
    webNav('how'),
    hero('How it works', 'From one handle to a fair, evidence-backed picture', 'Libra reads what someone has shared publicly, checks the context, and weighs the good and the concerning separately. Here is exactly how.'),
    section('Steps', [
      stepRow('1', 'search', 'Tell us who', 'A first name, a last name and one public handle is enough. Add a city or age range to help confirm identity.', ['Instagram, X, TikTok, Facebook, Snapchat, LinkedIn, Reddit, YouTube', 'Purpose check: dating and personal safety only'], false),
      stepRow('2', 'match', 'Confirm the right person', 'We show candidate accounts with a match strength and what we compared. You decide which accounts are theirs.', ['Linked through public signals like a link in bio', 'No face recognition, no unmasking anonymous accounts'], true),
      stepRow('3', 'processing', 'We weigh the evidence', 'Public posts, captions and comments are classified, checked for context like quotes, lyrics and satire, and weighted.', ['Usually under a minute', 'Keep using the app; we notify you when it is ready'], false),
      stepRow('4', 'report', 'Read, save and decide', 'Two independent scores, a confidence level, a plain-language summary and every post behind every finding.', ['Mark anything not relevant to you', 'Share a summary with a trusted friend'], true),
    ], { gap: 120 }),
    section('Checks', [
      heading('Boundaries', 'What Libra checks, and what it never does', null, { align: 'center' }),
      row({ name: 'Columns', w: 'fill', gap: 24, cross: 'start' }, [
        col({ name: 'Checks', w: 'fill', gap: 16, pad: 40, radius: 28, fill: 'bg/canvas' }, [
          text('Libra checks', 'h3', 'text/primary'),
          check('Public posts, captions and comments the person wrote'),
          check('Public bios, links and cross-posted handles'),
          check('Public news mentions and anything you choose to upload'),
          check('Positive signals: kindness, accountability, community'),
        ]),
        col({ name: 'Never', w: 'fill', gap: 16, pad: 40, radius: 28, fill: 'bg/canvas' }, [
          text('Libra never', 'h3', 'text/primary'),
          check('Accesses private accounts or bypasses logins', false),
          check('Uses leaked databases or fake accounts', false),
          check('Uses face recognition to find people', false),
          check('Profiles anyone under 18, or tells anyone you searched', false),
        ]),
      ]),
    ], { fill: 'bg/surface', cross: 'center' }),
    section('Weighting', [
      heading('Scoring', 'How a single post is weighed', 'Each item counts more when it is severe, recent, written by the person, and on an account you confirmed. Patterns count more than one-offs, and no single old post can dominate.', { align: 'center', w: 900 }),
      row({ name: 'Factors', w: 'fill', gap: 24, cross: 'start' }, [
        weight('alert-triangle', 'Severity', 'How serious the content is, from mild rudeness to threats.'),
        weight('clock', 'Recency', 'Recent posts count more. Weight halves roughly every 12 to 18 months.'),
        weight('user', 'Authorship', 'Their own post counts more than a reply, and a reply more than a reshare.'),
        weight('shield-check', 'Account confidence', 'Confirmed accounts count fully. Possible matches are excluded by default.'),
      ]),
    ], { cross: 'center' }),
    section('CTA', [ctaBand('See it for yourself', 'Your first report is free.')], { pad: [0, GUTTER] }),
    box({ name: 'Spacer', w: 1440, h: 96, dir: 'v' }),
    webFooter(),
  ]);
}

// ---------------------------------------------------------------- trust and safety

const GUARDRAILS: Array<[string, string, string]> = [
  ['globe', 'Public data only', 'Only publicly visible content. Never private accounts, bypassed logins or leaked databases.'],
  ['link', 'Careful account linking', 'Only verifiable public signals, every match confirmed by the user. No face recognition or writing-style matching.'],
  ['file', 'Factual wording', 'We report content, never character. Every flag links to the post, date and context.'],
  ['sliders', 'Honest confidence', 'Every score shows its confidence and data volume. Thin data is low confidence, never a good result.'],
  ['quote', 'Context first', 'Quotes, lyrics, satire, reclaimed language and replies are detected before anything is flagged.'],
  ['shield', 'Purpose limits', 'Dating and personal safety only. Employment, housing, credit and harassment uses are blocked.'],
  ['users', 'Rights for the person searched', 'Public opt-out, correction and disputes, reviewed by a person on a published timeline.'],
  ['ban', 'No minors', 'We never profile anyone identified as under 18, and every user must be 18 or older.'],
  ['bell', 'Anti-harassment', 'Rate limits, blocks on repeat lookups of one person, and we never reveal who searched whom.'],
];

export function trust(): FrameNode {
  const target = (n: string, l: string) =>
    col({ name: l, w: 'fill', gap: 8, pad: 28, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [text(n, display(40, 48), 'brand/fg'), text(l, 'body', 'text/secondary', { w: 'fill' })]);
  return webPage('Trust and safety', [
    webNav('trust'),
    hero('Trust and safety', 'Balance and fairness, not accusation', 'Libra holds sensitive information about real people. These rules are product requirements. They protect our users, the people they look up, and Libra itself.'),
    section('Guardrails', [
      heading('Guardrails', 'Nine rules we build around', null, { align: 'center' }),
      row({ name: 'Grid', w: 'fill', gap: 24, wrap: true, wrapGap: 24 }, GUARDRAILS.map(([i, t, b]) => featureCard(i, t, b, 384))),
    ], { cross: 'center' }),
    section('Your data', [
      heading('Your data', 'Private by design', null),
      row({ name: 'Data', w: 'fill', gap: 24, cross: 'start' }, [
        featureCard('lock', 'Encrypted', 'TLS 1.3 in transit, AES-256 at rest, and field-level encryption for names and notes.'),
        featureCard('clock', 'Short retention', 'Raw collected posts are deleted after 30 to 90 days. We keep only what a saved report needs.'),
        featureCard('eye-off', 'Private searches', 'No public profiles, no leaderboards and no searchable database of reports.'),
        featureCard('trash', 'Delete anytime', 'Delete your account and all your data from Settings. It is gone within 30 days.'),
      ]),
    ], { fill: 'bg/surface' }),
    section('Looked up', [
      row({ name: 'Panel', w: 'fill', gap: 48, pad: 56, radius: 40, fill: 'brand/subtle', cross: 'center' }, [
        col({ name: 'Copy', gap: 14, w: 'fill' }, [
          text('If someone looked you up', 'overline', 'brand/fg'),
          text('You have a say in what Libra shows', display(40, 48), 'text/primary', { w: 'fill' }),
          text('Ask us to stop analysing your public content, or dispute a specific finding. A person reviews every request, usually within 7 days.', lead, 'text/secondary', { w: 'fill' }),
        ]),
        col({ name: 'Actions', gap: 12, w: 320 }, [fill(btn('Opt out of Libra', 'Primary', 'Large', 'optout')), fill(btn('Dispute a finding', 'Secondary', 'Large', 'dispute'))]),
      ]),
    ]),
    section('Targets', [
      heading('Accountability', 'Targets we hold ourselves to', 'We publish these and report against them every quarter.'),
      row({ name: 'Targets', w: 'fill', gap: 24, cross: 'start' }, [
        target('< 7 days', 'To resolve a dispute or opt-out request'),
        target('> 90%', 'Precision on high-severity flags in human review'),
        target('< 2%', 'Of reports with a mismatched account'),
        target('72 hours', 'To notify you of any security incident'),
      ]),
    ], { fill: 'bg/surface' }),
    webFooter(),
  ]);
}

// ---------------------------------------------------------------- pricing

export function pricing(): FrameNode {
  const plans: Array<[string, string, string, string[], boolean]> = [
    ['Free', '$0', 'per month', ['1 lite report a month', 'Scores and summary', 'Safety Hub'], false],
    ['Libra Plus', '$7.99', 'per month', ['5 full reports a month', 'Evidence viewer', 'Personality and notes'], true],
    ['Libra Pro', '$14.99', 'per month', ['15 reports a month', 'Monitoring alerts', 'Compare and PDF export'], false],
    ['Pay per report', '$2.99', 'per report', ['One full report', 'No subscription', 'Paystack and Flutterwave'], false],
  ];
  const features: Array<[string, string[]]> = [
    ['Reports per month', ['1 lite', '5', '15', 'As needed']],
    ['Scores, confidence and summary', ['yes', 'yes', 'yes', 'yes']],
    ['Evidence viewer', ['-', 'yes', 'yes', 'yes']],
    ['Personality snapshot', ['-', 'yes', 'yes', 'yes']],
    ['Chat analyses', ['2 a month', '2 + credits', '2 + credits', '1 credit']],
    ['Gossip Rooms', ['yes', 'yes', 'yes', 'yes']],
    ['Private notes', ['-', 'yes', 'yes', '-']],
    ['Compare two people', ['-', '-', 'yes', '-']],
    ['Monitoring alerts', ['-', '-', 'yes', '-']],
    ['PDF export and secure share links', ['-', '-', 'yes', '-']],
    ['Safety Hub and Share my date', ['yes', 'yes', 'yes', 'yes']],
  ];
  const cell = (v: string, w: number | 'fill') =>
    box({ name: 'Cell', dir: 'h', w, main: 'center', cross: 'center' }, [
      v === 'yes' ? icon('check', 20, 'positive/fg') : v === '-' ? text('—', 'body', 'text/tertiary') : text(v, 'smallStrong', 'text/primary'),
    ]);
  const table = col({ name: 'Comparison', w: 'fill', radius: 24, fill: 'bg/surface', stroke: 'border/default', clip: true }, [
    row({ name: 'Head', w: 'fill', pad: [20, 28], fill: 'bg/subtle' }, [text('Compare plans', 'bodyStrong', 'text/primary', { w: 'fill' }), ...plans.map(([n]) => box({ name: n, dir: 'h', w: 160, main: 'center' }, [text(n, 'smallStrong', 'text/primary')]))]),
    ...features.map(([f, vals], i) =>
      row({ name: f, w: 'fill', pad: [16, 28], fill: i % 2 ? 'bg/canvas' : null }, [text(f, 'body', 'text/secondary', { w: 'fill' }), ...vals.map((v) => cell(v, 160))]),
    ),
  ]);
  return webPage('Pricing', [
    webNav('pricing'),
    hero('Pricing', 'Simple plans, honest limits', 'Start free. Every plan includes confidence levels, evidence links and the Safety Hub. Local pricing and payment options in Nigeria.'),
    section('Plans', [row({ name: 'Plans', w: 'fill', gap: 20, cross: 'start' }, plans.map(([n, p, per, items, f]) => planCard(n, p, per, items, f, f ? 'Start with Plus' : 'Choose ' + n)))]),
    section('Compare', [table, row({ name: 'Payments', gap: 12, cross: 'center' }, [text('Pay with', 'small', 'text/tertiary'), pill('Card', 'neutral'), pill('Apple Pay', 'neutral'), pill('Google Pay', 'neutral'), pill('Paystack', 'neutral'), pill('Flutterwave', 'neutral')])], { pad: [0, GUTTER], gap: 24 }),
    section('FAQ', [
      heading('Pricing questions', 'Before you subscribe', null, { align: 'center' }),
      col({ name: 'FAQ wrap', w: 880 }, [
        faq([
          ['Can I cancel anytime?', 'Yes. Cancel in Settings or through the App Store or Google Play. You keep your plan until the end of the billing period.'],
          ['What counts as a report?', 'One person, analysed across the accounts you confirm. Refreshing a saved report within 30 days is free.'],
          ['Do unused reports roll over?', 'No. Reports reset each month on your billing date.'],
          ['Is a search charged if nothing is found?', 'No. If we find no public profile or a search is blocked, your credit is not used.'],
        ]),
      ]),
    ], { cross: 'center' }),
    webFooter(),
  ]);
}

// ---------------------------------------------------------------- opt-out and disputes

function optoutForm(w: number | 'fill' = 'fill', mobile = false): FrameNode {
  return formCard(
    'Request removal',
    'Tell us which public accounts are yours. We will stop analysing them and remove them from existing reports.',
    [
      field('Full name', 'Tobi Adeyemi'),
      field('Email for updates', 'tobi@example.com'),
      (mobile ? col : row)({ name: 'Handles', gap: 12, w: 'fill' }, [field('Instagram', 'tobi.adeyemi', 'Filled', { prefix: '@' }), field('X', 'tobiadeyemi', 'Filled', { prefix: '@' })]),
      field('Other accounts (optional)', 'Add a link or handle', 'Default', { leading: 'link' }),
      field('Country', 'Nigeria', 'Filled', { trailing: 'chevron-down' }),
      fill(use('CheckRow', { Checked: 'On' }, { title: 'I am this person, or their parent or legal representative', body: "We'll ask you to verify your identity before anything changes." })),
      wlink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Continue to identity check' })), 'status'),
    ],
    w,
  );
}

export function optout(): FrameNode {
  const option = (iconName: string, title: string, body: string, cta: string, target: string, primary: boolean) =>
    col({ name: title, w: 'fill', gap: 16, pad: 36, radius: 28, fill: 'bg/surface', stroke: primary ? 'border/focus' : 'border/default', strokeW: primary ? 2 : 1 }, [
      box({ name: 'Icon', dir: 'h', w: 52, h: 52, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon(iconName, 26, 'brand/fg')]),
      text(title, 'h2', 'text/primary', { w: 'fill' }),
      text(body, 'body', 'text/secondary', { w: 'fill' }),
      btn(cta, primary ? 'Primary' : 'Secondary', 'Large', target),
    ]);
  const timeline = row(
    { name: 'Timeline', w: 'fill', gap: 16 },
    [
      ['1', 'Submit', 'Tell us which accounts are yours'],
      ['2', 'Verify', 'A quick ID check so no one can opt out for you'],
      ['3', 'Review', 'A person reviews every request'],
      ['4', 'Done', 'Usually within 7 days, and we email you'],
    ].map(([n, t, b]) =>
      col({ name: t, w: 'fill', gap: 10, pad: 24, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
        box({ name: 'Number', dir: 'h', w: 32, h: 32, radius: 16, fill: 'brand/solid', main: 'center', cross: 'center' }, [text(n, 'smallStrong', 'text/on-solid')]),
        text(t, 'h3', 'text/primary'),
        text(b, 'small', 'text/secondary', { w: 'fill' }),
      ]),
    ),
  );
  return webPage('Opt out', [
    webNav(),
    hero('Opt out and disputes', 'Your public content, your say', "Whether or not you've used Libra, you can ask us to stop analysing your public accounts or correct a finding. No account needed."),
    section('Options', [row({ name: 'Options', w: 'fill', gap: 24, cross: 'start' }, [
      option('ban', 'Remove me from Libra', 'We stop analysing your public accounts and remove you from existing reports. Future searches for you will be blocked.', 'Request removal', 'optout', true),
      option('flag', 'Dispute a finding', 'Something wrong, out of context or about someone else? Tell us, and a person will review it.', 'Dispute a finding', 'dispute', false),
      option('message', 'Remove a room post about me', 'If a Gossip Rooms post describes you, we can remove it, even if you are not a Libra member.', 'Request post removal', 'status', false),
    ]), timeline], { gap: 32 }),
    section('Form', [row({ name: 'Form row', w: 'fill', gap: 40, cross: 'start' }, [
      optoutForm(),
      sideNote(
        'What happens next',
        ['We confirm your email.', 'You verify your identity with a photo ID and a selfie. Images are deleted after the check.', 'A reviewer removes your accounts and blocks future searches.', 'We email you when it is done.'],
        'We never tell anyone you opted out, and we never confirm whether someone searched for you.',
      ),
    ])], { fill: 'bg/surface' }),
    webFooter(),
  ]);
}

export function dispute(): FrameNode {
  const drop = col({ name: 'Upload', w: 'fill', gap: 8, pad: 32, radius: 16, cross: 'center', stroke: 'border/strong', dash: [6, 6], fill: 'bg/canvas' }, [
    icon('image', 28, 'text/tertiary'),
    text('Drag screenshots or documents here', 'bodyStrong', 'text/primary'),
    text('PNG, JPG or PDF up to 10 MB each', 'caption', 'text/tertiary'),
  ]);
  return webPage('Dispute a finding', [
    webNav(),
    hero('Disputes', 'Dispute a finding', 'If a finding is wrong, out of context or about someone else, tell us. A trained reviewer looks at every dispute.'),
    section('Form', [row({ name: 'Form row', w: 'fill', gap: 40, cross: 'start' }, [
      formCard('About the finding', 'Paste the link from the post, or the report reference if someone shared one with you.', [
        field('Post link or report reference', 'https://x.com/tobiadeyemi/status/1820…', 'Filled', { leading: 'link' }),
        text("What's wrong?", 'label', 'text/secondary'),
        radioGroup([
          { label: 'This account is not mine', on: true },
          { label: 'This is a quote, lyric, joke or satire' },
          { label: 'The context is missing or misleading' },
          { label: 'This content has been deleted' },
        ]),
        textArea('Tell us more', 'I was quoting a line from a film in a thread about it, not speaking to anyone. The full thread shows this.', false, 120),
        drop,
        field('Email for updates', 'tobi@example.com'),
        wlink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Submit dispute' })), 'status'),
      ]),
      sideNote('How disputes are reviewed', ['A reviewer reads the finding with its full context.', 'If you are the person, we verify your identity first.', 'We correct, remove, or keep the finding and explain why.', 'Overturned findings retrain our models.'], 'Disputes never reveal who ran a report.'),
    ])], { fill: 'bg/surface' }),
    webFooter(),
  ]);
}

export function requestStatus(): FrameNode {
  const step = (state: string, label: string, detail: string) => fill(use('ProgressStep', { State: state }, { label, detail }));
  return webPage('Request status', [
    webNav(),
    section('Status', [
      col({ name: 'Card', w: 720, gap: 28, pad: 48, radius: 32, fill: 'bg/surface', stroke: 'border/default', shadow: 'e2', cross: 'center' }, [
        box({ name: 'Icon', dir: 'h', w: 88, h: 88, radius: 44, fill: 'positive/subtle', main: 'center', cross: 'center' }, [icon('check-circle', 40, 'positive/fg')]),
        col({ name: 'Copy', gap: 10, w: 'fill', cross: 'center' }, [
          text('Request received', display(40, 48), 'text/primary', { align: 'center', w: 'fill' }),
          text('We sent a confirmation to tobi@example.com. Keep your reference to check progress.', lead, 'text/secondary', { align: 'center', w: 'fill' }),
          pill('Reference LBR-2026-04821', 'brand', 'file'),
        ]),
        divider(),
        col({ name: 'Tracker', gap: 20, w: 'fill' }, [
          step('Done', 'Request received', '22 Oct 2026, 14:05'),
          step('Done', 'Identity verified', '22 Oct 2026, 14:12'),
          step('Active', 'Human review', 'Usually 2 to 5 days'),
          step('Pending', 'Resolved', 'By 29 Oct 2026 at the latest'),
        ]),
        row({ name: 'Actions', gap: 12 }, [btn('Back to Libra', 'Secondary', 'Large', 'landing'), btn('Contact support', 'Tertiary', 'Large', 'helpcenter')]),
      ]),
    ], { cross: 'center', pad: [96, GUTTER] }),
    webFooter(),
  ]);
}

// ---------------------------------------------------------------- help, legal, 404

export function helpCentre(): FrameNode {
  const cats: Array<[string, string, string]> = [
    ['sparkle', 'Getting started', 'Accounts, verification and your first Libra.'],
    ['scale', 'Reports and scoring', 'How the scale, confidence and evidence work.'],
    ['shield-check', 'Privacy and safety', 'Who sees what, and how we protect it.'],
    ['card', 'Plans and billing', 'Subscriptions, refunds and local payments.'],
    ['flag', 'Opt-out and disputes', 'If someone looked you up.'],
    ['life-buoy', 'Safety resources', 'Share my date and local support lines.'],
  ];
  const article = (t: string) => row({ name: t, w: 'fill', gap: 12, pad: [18, 24] }, [icon('file', 20, 'text/tertiary'), text(t, 'body', 'text/primary', { w: 'fill' }), icon('chevron-right', 20, 'text/tertiary')]);
  const articles = ['How does the Libra Scale work?', "Why can't Libra find someone?", 'Will the person know I looked them up?', 'How do I verify my identity?', 'How do I cancel or change my plan?'];
  return webPage('Help centre', [
    webNav('helpcenter'),
    col({ name: 'Hero', w: 'fill', pad: [96, GUTTER, 80, GUTTER], gap: 32, cross: 'center', fill: 'brand/subtle' }, [
      heading('Help centre', 'How can we help?', null, { align: 'center', size: 60 }),
      col({ name: 'Search', w: 640 }, [fill(use('TextField', { State: 'Default' }, { value: 'Search for answers' }, { hide: ['label'], show: ['leading'], icons: { leading: 'search' } }))]),
    ]),
    section('Categories', [row({ name: 'Grid', w: 'fill', gap: 24, wrap: true, wrapGap: 24 }, cats.map(([i, t, b]) => featureCard(i, t, b, 384)))]),
    section('Popular', [
      row({ name: 'Popular row', w: 'fill', gap: 40, cross: 'start' }, [
        col({ name: 'Articles', w: 'fill', gap: 16 }, [
          text('Popular articles', 'h2', 'text/primary'),
          col({ name: 'List', w: 'fill', radius: 24, fill: 'bg/surface', stroke: 'border/default', clip: true }, articles.reduce((a: SceneNode[], t, i) => a.concat(i ? [divider(), article(t)] : [article(t)]), [])),
        ]),
        col({ name: 'Contact', w: 400, gap: 16 }, [
          text('Still need help?', 'h2', 'text/primary'),
          featureCard('message', 'Chat with us', 'In the app under Settings, Help. We usually reply within an hour.'),
          featureCard('mail', 'Email support', 'support@libra.app for account and billing questions.'),
          row({ name: 'Danger', w: 'fill', gap: 12, pad: 20, radius: 20, fill: 'caution/subtle', cross: 'start' }, [icon('alert-triangle', 22, 'caution/fg'), text('In danger right now? Call 112 or your local emergency number.', 'bodyStrong', 'text/primary', { w: 'fill' })]),
        ]),
      ]),
    ], { pad: [0, GUTTER] }),
    box({ name: 'Spacer', w: 1440, h: 96, dir: 'v' }),
    webFooter(),
  ]);
}

export function privacy(): FrameNode {
  const toc = ['Summary', 'What we collect', 'How we use it', 'Retention', 'Your rights', 'People who are searched', 'Security', 'Contact'];
  return webPage('Privacy policy', [
    webNav(),
    legalLayout('Privacy policy', 'Last updated 22 October 2026', toc, [
      ['Summary', ['Libra helps you make safer decisions about people you are getting to know, using public information only. We collect as little as we can, keep it for as short a time as we can, and never sell it.']],
      ['What we collect', ['About you: your name, phone or email, age confirmation, purpose agreement, optional identity verification result, subscription status and app settings.', 'About the people you search: the name and handle you enter, public accounts you confirm, and short excerpts and links to public posts used in your report.']],
      ['How we use it', ['To build reports you request, keep Libra safe from misuse, process payments, and improve the accuracy of our models using human-reviewed, de-identified samples.']],
      ['Retention', ['Raw collected items are deleted after 30 to 90 days. Saved reports keep only the excerpts and links they need. Search history auto-deletes after 90 days.']],
      ['Your rights', ['You can access, correct, export or delete your data at any time from Settings, or by emailing privacy@libra.app. We comply with the Nigeria Data Protection Act 2023, GDPR and CCPA where they apply.']],
      ['People who are searched', ['Anyone can opt out, request correction or dispute a finding at libra.app/optout without an account. We never notify a person that they were searched, and we never reveal who searched them.']],
    ]),
    webFooter(),
  ]);
}

export function terms(): FrameNode {
  const toc = ['Who can use Libra', 'Permitted use', 'Prohibited use', 'Reports are opinions', 'Subscriptions', 'Termination', 'Liability', 'Contact'];
  return webPage('Terms of use', [
    webNav(),
    legalLayout('Terms of use', 'Last updated 22 October 2026', toc, [
      ['Who can use Libra', ['You must be 18 or older and agree to use Libra for dating and personal safety decisions only.']],
      ['Permitted use', ['Running reports on people you are getting to know, saving and comparing them, sharing summaries with trusted friends, and using the Safety Hub.']],
      ['Prohibited use', ['Employment, housing, credit, insurance or tenancy decisions; stalking, harassment or doxxing; searching for anyone under 18; or attempting to identify anonymous accounts. Misuse leads to a permanent ban.']],
      ['Reports are opinions', ['Reports describe public content and are not statements of fact about a person\'s character or conduct. Always use your own judgement. People are more than their posts.']],
      ['Subscriptions', ['Plans renew automatically until cancelled. Unused reports do not roll over. Credits are not used when no profile is found or a search is blocked.']],
    ]),
    webFooter(),
  ]);
}

export function notFound(): FrameNode {
  return webPage('404', [
    webNav(),
    section('Not found', [
      col({ name: 'Card', w: 640, gap: 24, cross: 'center' }, [
        text('404', display(120, 128), 'brand/fg', { align: 'center' }),
        use('ScaleDial', { Tilt: 'Pending' }),
        text('This page tipped the scale', display(40, 48), 'text/primary', { align: 'center', w: 'fill' }),
        text("We couldn't find what you were looking for. It may have moved, or the link may be out of date.", lead, 'text/secondary', { align: 'center', w: 'fill' }),
        row({ name: 'Actions', gap: 12 }, [btn('Go to the homepage', 'Primary', 'Large', 'landing'), btn('Visit the help centre', 'Secondary', 'Large', 'helpcenter')]),
      ]),
    ], { cross: 'center', pad: [120, GUTTER] }),
    webFooter(),
  ]);
}

export function mobileOptout(): FrameNode {
  return webPage(
    'Opt out · Mobile',
    [
      mobileNav(),
      col({ name: 'Hero', w: 'fill', pad: [40, 20, 32, 20], gap: 12, fill: 'bg/surface' }, [heading('Opt out and disputes', 'Your public content, your say', 'Ask us to stop analysing your public accounts, or correct a finding. No account needed.', { mobile: true })]),
      col({ name: 'Options', w: 'fill', pad: [24, 20], gap: 12 }, [
        row({ name: 'Tabs', w: 'fill' }, [fill(use('Segmented', { Active: 'First' }, { first: 'Remove me', second: 'Dispute' }))]),
      ]),
      col({ name: 'Form', w: 'fill', pad: [0, 20, 32, 20], gap: 16 }, [
        field('Full name', 'Tobi Adeyemi'),
        field('Email for updates', 'tobi@example.com'),
        field('Instagram', 'tobi.adeyemi', 'Filled', { prefix: '@' }),
        field('Country', 'Nigeria', 'Filled', { trailing: 'chevron-down' }),
        fill(use('CheckRow', { Checked: 'On' }, { title: 'I am this person or their representative', body: "We'll verify your identity next." })),
        wlink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Continue to identity check' })), 'status'),
        row({ name: 'Note', gap: 10, w: 'fill', pad: 16, radius: 14, fill: 'brand/subtle', cross: 'start' }, [icon('eye-off', 18, 'brand/fg'), text('We never tell anyone you opted out.', 'small', 'text/primary', { w: 'fill' })]),
      ]),
      webFooter(true),
    ],
    MOBILE,
  );
}