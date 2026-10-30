import { Token } from '../tokens';
import { Kid, box, col, divider, fill, icon, pill, row, text } from '../core/ui';
import { use } from '../components/library';
import { radioGroup, textArea } from '../screens/kit';
import { MOBILE, check, ctaBand, display, faq, heading, lockup, mobileNav, phone, storeBadge, webFooter, webPage, wlink } from './kit';
import { Screens, planCard } from './landing';
import { CHECKS, GUARDRAILS, HELP_ARTICLES, HELP_CATS, HOW_STEPS, NEVER, PLANS, PLAN_FEATURES, PRICING_FAQ, PRIVACY, PRIVACY_TOC, TERMS, TERMS_TOC } from './pages';
import { CAUTION, LADDER, POSITIVE, RULES } from './addendum';

/** Mobile website, 390 wide. Same copy as desktop, stacked into one column with thumb-sized actions. */

const H_MOBILE = 844;

function hero(eyebrow: string, title: string, sub: string, tok: Token = 'bg/surface'): FrameNode {
  return col({ name: 'Hero', w: 'fill', pad: [40, 20, 32, 20], gap: 12, fill: tok }, [heading(eyebrow, title, sub, { mobile: true })]);
}

function sec(name: string, kids: Kid[], tok?: Token, gap = 16): FrameNode {
  return col({ name, w: 'fill', pad: [40, 20], gap, fill: tok }, kids);
}

function iconRow(iconName: string, title: string, body: string, tok: Token = 'brand/fg', bg: Token = 'brand/subtle'): FrameNode {
  return row({ name: title, w: 'fill', gap: 14, cross: 'start' }, [
    box({ name: 'Icon', dir: 'h', w: 40, h: 40, radius: 12, fill: bg, main: 'center', cross: 'center' }, [icon(iconName, 20, tok)]),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary', { w: 'fill' }), text(body, 'small', 'text/secondary', { w: 'fill' })]),
  ]);
}

function listCard(kids: SceneNode[], name = 'List'): FrameNode {
  const out: SceneNode[] = [];
  kids.forEach((k, i) => {
    if (i) out.push(divider());
    out.push(k);
  });
  return col({ name, w: 'fill', gap: 16, pad: 20, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, out);
}

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

const button = (label: string, variant = 'Primary', target?: string, iconName?: string) => {
  const b = fill(use('Button', { Variant: variant, Size: 'Large' }, { label }, iconName ? { show: ['icon'], icons: { icon: iconName } } : {}));
  return target ? wlink(b, target) : b;
};

const page = (name: string, kids: Kid[]) => webPage(name, [mobileNav(), ...kids, webFooter(true)], MOBILE);

// ---------------------------------------------------------------- menu

export function mobileMenu(): FrameNode {
  const item = (label: string, target: string, iconName: string) =>
    wlink(row({ name: label, w: 'fill', gap: 14, pad: [16, 4] }, [icon(iconName, 22, 'brand/fg'), text(label, 'title', 'text/primary', { w: 'fill' }), icon('chevron-right', 18, 'text/tertiary')]), target);
  const f = col({ name: 'Menu · Mobile', w: MOBILE, h: H_MOBILE, fill: 'bg/surface', clip: true }, [
    row({ name: 'Bar', w: 'fill', h: 64, pad: [0, 20], cross: 'center', main: 'between' }, [wlink(lockup(24), 'mLanding'), wlink(box({ name: 'Close', dir: 'h', w: 40, h: 40, radius: 20, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('x', 20, 'text/primary')]), 'mLanding')]),
    divider(),
    col({ name: 'Links', w: 'fill', pad: [8, 20], gap: 0 }, [
      item('How it works', 'how', 'sparkle'),
      item('Check a Chat', 'chat', 'message'),
      item('Trust and safety', 'trust', 'shield-check'),
      item('Community guidelines', 'guidelines', 'users'),
      item('Pricing', 'pricing', 'card'),
      item('Help centre', 'helpcenter', 'help'),
    ]),
    col({ name: 'Secondary', w: 'fill', pad: [8, 20], gap: 12 }, [
      divider(),
      wlink(row({ name: 'Opt out', w: 'fill', gap: 10, pad: [14, 16], radius: 14, fill: 'brand/subtle' }, [icon('eye-off', 18, 'brand/fg'), text('Opt out or dispute a finding', 'smallStrong', 'brand/on-subtle', { w: 'fill' }), icon('arrow-right', 16, 'brand/fg')]), 'optout'),
    ]),
    box({ name: 'Spacer', w: 'fill', h: 'fill', dir: 'v' }),
    col({ name: 'Get the app', w: 'fill', pad: [20, 20, 32, 20], gap: 12 }, [button('Get the app', 'Primary', 'landing'), row({ name: 'Badges', gap: 10 }, [storeBadge('apple', 0.92), storeBadge('google', 0.92)])]),
  ]);
  f.setPluginData('webpage', '1');
  return f;
}

// ---------------------------------------------------------------- how it works

export function mobileHow(s: Screens): FrameNode {
  const step = ([n, id, title, body, points]: (typeof HOW_STEPS)[number]) =>
    col({ name: 'Step ' + n, w: 'fill', radius: 24, fill: 'bg/surface', stroke: 'border/default', clip: true }, [
      box({ name: 'Art', dir: 'h', w: 'fill', h: 260, fill: 'brand/subtle', main: 'center', cross: 'start', pad: [28, 0, 0, 0], clip: true }, [phone(s[id], 0.46)]),
      col({ name: 'Copy', w: 'fill', pad: 20, gap: 10 }, [pill('Step ' + n, 'brand'), text(title, 'h3', 'text/primary', { w: 'fill' }), text(body, 'small', 'text/secondary', { w: 'fill' }), ...points.map((p) => check(p))]),
    ]);
  return page('How it works · Mobile', [
    hero('How it works', 'From one handle to a fair, evidence-backed picture', 'Gutchek reads what someone has shared publicly, checks the context, and weighs the good and the concerning separately.'),
    sec('Steps', HOW_STEPS.map(step)),
    sec('Boundaries', [
      heading('Boundaries', 'What Gutchek checks, and what it never does', null, { mobile: true }),
      listCard([col({ name: 'Checks', gap: 12, w: 'fill' }, [text('Gutchek checks', 'title', 'text/primary'), ...CHECKS.map((c) => check(c))]), col({ name: 'Never', gap: 12, w: 'fill' }, [text('Gutchek never', 'title', 'text/primary'), ...NEVER.map((c) => check(c, false))])]),
    ], 'bg/surface'),
    sec('Scoring', [
      heading('Scoring', 'How a single post is weighed', 'Patterns count more than one-offs, and no single old post can dominate.', { mobile: true }),
      iconRow('alert-triangle', 'Severity', 'How serious the content is, from mild rudeness to threats.'),
      iconRow('clock', 'Recency', 'Weight halves roughly every 12 to 18 months.'),
      iconRow('user', 'Authorship', 'Their own post counts more than a reply or a reshare.'),
      iconRow('shield-check', 'Account confidence', 'Possible matches are excluded by default.'),
    ]),
    col({ name: 'CTA', w: 'fill', pad: [0, 20, 48, 20] }, [ctaBand('See it for yourself', 'Your first report is free.', true)]),
  ]);
}

// ---------------------------------------------------------------- check a chat

export function mobileChat(s: Screens): FrameNode {
  const art = box({ name: 'Hero art', dir: 'h', w: 'fill', h: 380, radius: 28, fill: 'brand/subtle', main: 'center', cross: 'start', pad: [32, 0, 0, 0], clip: true }, [phone(s.chatReport, 0.56)]);
  const pattern = (t: string, b: string, tone: 'caution' | 'positive') =>
    iconRow(tone === 'caution' ? 'alert-triangle' : 'check-circle', t, b, tone === 'caution' ? 'caution/fg' : 'positive/fg', tone === 'caution' ? 'caution/subtle' : 'positive/subtle');
  return page('Check a Chat · Mobile', [
    col({ name: 'Hero', w: 'fill', pad: [32, 20, 40, 20], gap: 18 }, [
      pill('New · Check a Chat', 'brand', 'message'),
      text('How are they really talking to you?', display(38, 44), 'text/primary', { w: 'fill' }),
      text('Upload screenshots or a chat export. Gutchek spots patterns like pressure, love-bombing or money requests, and the good stuff too, with the exact messages as evidence.', 'body', 'text/secondary', { w: 'fill' }),
      col({ name: 'Points', gap: 8 }, [
        row({ name: 'Free', gap: 8 }, [icon('sparkle', 16, 'brand/fg'), text('1 free a month', 'smallStrong', 'text/secondary')]),
        row({ name: 'Delete', gap: 8 }, [icon('trash', 16, 'brand/fg'), text('Uploads deleted in 24 hours', 'smallStrong', 'text/secondary')]),
        row({ name: 'Mask', gap: 8 }, [icon('eye-off', 16, 'brand/fg'), text('Numbers and addresses masked', 'smallStrong', 'text/secondary')]),
      ]),
      button('Get the app', 'Primary', 'landing'),
      button('See a sample report', 'Secondary', 'landing'),
      art,
    ]),
    sec('Patterns', [
      heading('What Gutchek looks for', 'Patterns, not single messages', 'Each pattern needs at least three instances before it is labelled.', { mobile: true }),
      listCard(CAUTION.map(([t, b]) => pattern(t, b, 'caution')), 'Caution patterns'),
      listCard(POSITIVE.map(([t, b]) => pattern(t, b, 'positive')), 'Positive patterns'),
    ], 'bg/surface'),
    sec('Privacy', [
      heading('Privacy', 'Their messages are personal data', null, { mobile: true }),
      iconRow('trash', 'Deleted in 24 hours', 'Saved reports keep short, redacted excerpts only.'),
      iconRow('eye-off', 'Redacted first', 'Numbers, emails, addresses and ID numbers are masked before analysis.'),
      iconRow('lock', 'Never shared', 'Never posted to Rooms, never searchable.'),
      iconRow('shield', 'Safety first', 'Threats trigger a safety card with support lines before any score.'),
      row({ name: 'Limits', w: 'fill', gap: 12, pad: 16, radius: 16, fill: 'warning/subtle', cross: 'start' }, [icon('info', 20, 'warning/fg'), text('A report is based only on the messages you provide. Screenshots can be cropped or edited, and Gutchek cannot verify them.', 'small', 'text/primary', { w: 'fill' })]),
    ]),
    col({ name: 'CTA', w: 'fill', pad: [0, 20, 48, 20] }, [ctaBand('See the conversation clearly', 'Your first chat check each month is free.', true)]),
  ]);
}

// ---------------------------------------------------------------- trust and community

export function mobileTrust(): FrameNode {
  const target = (n: string, l: string) => col({ name: l, w: 167, gap: 6, pad: 18, radius: 18, fill: 'bg/surface', stroke: 'border/default' }, [text(n, display(28, 34), 'brand/fg'), text(l, 'small', 'text/secondary', { w: 'fill' })]);
  return page('Trust and safety · Mobile', [
    hero('Trust and safety', 'Balance and fairness, not accusation', 'These rules are product requirements. They protect our users, the people they look up, and Gutchek itself.'),
    sec('Guardrails', [heading('Guardrails', 'Nine rules we build around', null, { mobile: true }), listCard(GUARDRAILS.map(([i, t, b]) => iconRow(i, t, b)), 'Guardrails')]),
    sec('Your data', [
      heading('Your data', 'Private by design', null, { mobile: true }),
      iconRow('lock', 'Encrypted', 'In transit and at rest, with a key for each user for names and journal notes.'),
      iconRow('clock', 'Short retention', 'Raw collected posts are deleted after 30 to 90 days.'),
      iconRow('eye-off', 'Private searches', 'No public profiles and no searchable database of reports.'),
      iconRow('trash', 'Delete anytime', 'Everything is gone within 30 days.'),
    ], 'bg/surface'),
    sec('Looked up', [
      col({ name: 'Panel', w: 'fill', gap: 14, pad: 24, radius: 24, fill: 'brand/subtle' }, [
        text('If someone looked you up', 'overline', 'brand/fg'),
        text('You have a say in what Gutchek shows', display(28, 34), 'text/primary', { w: 'fill' }),
        text('A person reviews every request, usually within 7 days.', 'body', 'text/secondary', { w: 'fill' }),
        button('Opt out of Gutchek', 'Primary', 'optout'),
        button('Dispute a finding', 'Secondary', 'dispute'),
      ]),
    ]),
    sec('Targets', [
      heading('Accountability', 'Targets we hold ourselves to', null, { mobile: true }),
      row({ name: 'Grid', w: 'fill', gap: 16, wrap: true, wrapGap: 16 }, [target('< 7 days', 'To resolve a dispute or opt-out'), target('> 90%', 'Precision on high-severity flags'), target('< 2%', 'Reports with a mismatched account'), target('72 hours', 'To notify you of a security incident')]),
    ], 'bg/surface'),
  ]);
}

export function mobileGuidelines(): FrameNode {
  const rule = ([n, t, b, ok]: (typeof RULES)[number]) =>
    row({ name: t, w: 'fill', gap: 14, cross: 'start' }, [
      box({ name: 'Number', dir: 'h', w: 32, h: 32, radius: 16, fill: ok ? 'positive/subtle' : 'caution/subtle', main: 'center', cross: 'center' }, [text(n, 'smallStrong', ok ? 'positive/fg' : 'caution/fg')]),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(t, 'bodyStrong', 'text/primary', { w: 'fill' }), text(b, 'small', 'text/secondary', { w: 'fill' })]),
    ]);
  const level = ([lvl, trig, res, tone]: (typeof LADDER)[number]) =>
    col({ name: lvl, w: 'fill', gap: 6 }, [row({ name: 'Head', gap: 8, w: 'fill' }, [pill(lvl, tone), text(res, 'smallStrong', 'text/primary', { w: 'fill' })]), text(trig, 'small', 'text/secondary', { w: 'fill' })]);
  return page('Community guidelines · Mobile', [
    hero('Gist Rooms', 'Community guidelines', 'Rooms are for sharing your own experience and supporting each other. They are not for exposing anyone.'),
    sec('Rules', [listCard(RULES.map(rule), 'Rules')]),
    sec('Strikes', [heading('Enforcement', 'How strikes and bans work', 'Strikes expire after 90 days of clean behaviour.', { mobile: true }), listCard(LADDER.map(level), 'Ladder')], 'bg/surface'),
    sec('Appeals', [
      iconRow('refresh', 'One appeal per ban', 'Within 7 days, straight from the ban notice.'),
      iconRow('users', 'Reviewed by someone else', 'Never the moderator or bot rule that decided.'),
      iconRow('clock', 'Answered within 72 hours', 'Always with a short explanation.'),
      col({ name: 'Mentioned', w: 'fill', gap: 10, pad: 20, radius: 20, fill: 'brand/subtle' }, [
        text('Mentioned in a post?', 'title', 'text/primary'),
        text('If a room post describes you, you can ask us to remove it, even without an account.', 'small', 'text/secondary', { w: 'fill' }),
        wlink(row({ name: 'CTA', gap: 8 }, [text('Request removal', 'bodyStrong', 'brand/fg'), icon('arrow-right', 18, 'brand/fg')]), 'optout'),
      ]),
    ]),
  ]);
}

// ---------------------------------------------------------------- pricing

export function mobilePricing(): FrameNode {
  const plusIndex = 1;
  const compare = col(
    { name: 'Compare · Plus', w: 'fill', radius: 20, fill: 'bg/surface', stroke: 'border/default', clip: true },
    PLAN_FEATURES.map(([f, vals], i) => {
      const v = vals[plusIndex];
      return row({ name: f, w: 'fill', gap: 12, pad: [12, 16], fill: i % 2 ? 'bg/canvas' : null }, [
        text(f, 'small', 'text/secondary', { w: 'fill' }),
        v === 'yes' ? icon('check', 18, 'positive/fg') : v === '-' ? text('—', 'small', 'text/tertiary') : text(v, 'smallStrong', 'text/primary'),
      ]);
    }),
  );
  const tabs = row({ name: 'Plan tabs', w: 'fill', gap: 6, pad: 4, radius: 12, fill: 'bg/subtle' }, PLANS.map(([n], i) =>
    box({ name: n, dir: 'h', w: 'fill', h: 36, radius: 9, fill: i === plusIndex ? 'bg/raised' : null, shadow: i === plusIndex ? 'e1' : undefined, main: 'center', cross: 'center' }, [text(n.replace('Gutchek ', '').replace('Pay per report', 'Per report'), i === plusIndex ? 'smallStrong' : 'small', i === plusIndex ? 'text/primary' : 'text/secondary')]),
  ));
  return page('Pricing · Mobile', [
    hero('Pricing', 'Simple plans, honest limits', 'Start free. Every plan includes confidence levels, evidence links and the Stay Safe hub.'),
    sec('Plans', PLANS.map(([n, p, per, items, f]) => planCard(n, p, per, items, f, f ? 'Start with Plus' : 'Choose ' + n))),
    sec('Compare', [
      text('Compare plans', 'h3', 'text/primary'),
      tabs,
      compare,
      row({ name: 'Payments', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [pill('Card', 'neutral'), pill('Apple Pay', 'neutral'), pill('Google Pay', 'neutral'), pill('Paystack', 'neutral'), pill('Flutterwave', 'neutral')]),
    ], 'bg/surface'),
    sec('FAQ', [heading('Pricing questions', 'Before you subscribe', null, { mobile: true }), faq(PRICING_FAQ)]),
  ]);
}

// ---------------------------------------------------------------- disputes and status

export function mobileDispute(): FrameNode {
  const drop = col({ name: 'Upload', w: 'fill', gap: 6, pad: 24, radius: 16, cross: 'center', stroke: 'border/strong', dash: [6, 6], fill: 'bg/canvas' }, [
    icon('image', 24, 'text/tertiary'),
    text('Add screenshots or documents', 'smallStrong', 'text/primary'),
    text('PNG, JPG or PDF up to 10 MB', 'caption', 'text/tertiary'),
  ]);
  const steps = ['A reviewer reads the finding with its full context.', 'If you are the person, we verify your identity first.', 'We correct, remove or keep the finding and explain why.'];
  return page('Dispute a finding · Mobile', [
    hero('Disputes', 'Dispute a finding', 'If a finding is wrong, out of context or about someone else, tell us. A trained reviewer looks at every dispute.'),
    col({ name: 'Tabs', w: 'fill', pad: [24, 20, 0, 20] }, [wlink(fill(use('Segmented', { Active: 'Second' }, { first: 'Remove me', second: 'Dispute' })), 'optout')]),
    sec('Form', [
      field('Post link or report reference', 'https://x.com/tobiadeyemi/status/1820…', 'Filled', { leading: 'link' }),
      text("What's wrong?", 'label', 'text/secondary'),
      radioGroup([{ label: 'This account is not mine', on: true }, { label: 'This is a quote, lyric, joke or satire' }, { label: 'The context is missing or misleading' }, { label: 'This content has been deleted' }]),
      textArea('Tell us more', 'I was quoting a line from a film in a thread about it, not speaking to anyone.', false, 110),
      drop,
      field('Email for updates', 'tobi@example.com'),
      button('Submit dispute', 'Primary', 'status'),
    ]),
    sec('How it works', [
      text('How disputes are reviewed', 'h3', 'text/primary'),
      ...steps.map((t, i) => row({ name: 'Step ' + (i + 1), gap: 12, w: 'fill', cross: 'start' }, [box({ name: 'N', dir: 'h', w: 26, h: 26, radius: 13, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(String(i + 1), 'label', 'brand/on-subtle')]), text(t, 'small', 'text/secondary', { w: 'fill' })])),
      row({ name: 'Note', gap: 10, w: 'fill', pad: 14, radius: 14, fill: 'brand/subtle', cross: 'start' }, [icon('eye-off', 18, 'brand/fg'), text('Disputes never reveal who ran a report.', 'small', 'text/primary', { w: 'fill' })]),
    ], 'bg/surface'),
  ]);
}

export function mobileStatus(): FrameNode {
  const step = (state: string, label: string, detail: string) => fill(use('ProgressStep', { State: state }, { label, detail }));
  return page('Request status · Mobile', [
    sec('Status', [
      col({ name: 'Card', w: 'fill', gap: 20, pad: 24, radius: 24, fill: 'bg/surface', stroke: 'border/default', shadow: 'e2', cross: 'center' }, [
        box({ name: 'Icon', dir: 'h', w: 72, h: 72, radius: 36, fill: 'positive/subtle', main: 'center', cross: 'center' }, [icon('check-circle', 34, 'positive/fg')]),
        text('Request received', display(30, 36), 'text/primary', { align: 'center', w: 'fill' }),
        text('We sent a confirmation to tobi@example.com. Keep your reference to check progress.', 'body', 'text/secondary', { align: 'center', w: 'fill' }),
        pill('Reference GCK-2026-04821', 'brand', 'file'),
        divider(),
        col({ name: 'Tracker', gap: 16, w: 'fill' }, [step('Done', 'Request received', '22 Oct 2026, 14:05'), step('Done', 'Identity verified', '22 Oct 2026, 14:12'), step('Active', 'Human review', 'Usually 2 to 5 days'), step('Pending', 'Resolved', 'By 29 Oct 2026 at the latest')]),
        button('Back to Gutchek', 'Secondary', 'landing'),
        button('Contact support', 'Tertiary', 'helpcenter'),
      ]),
    ]),
  ]);
}

// ---------------------------------------------------------------- help, legal, 404

export function mobileHelp(): FrameNode {
  const tile = ([i, t, b]: (typeof HELP_CATS)[number]) =>
    col({ name: t, w: 167, gap: 8, pad: 16, radius: 18, fill: 'bg/surface', stroke: 'border/default' }, [
      box({ name: 'Icon', dir: 'h', w: 36, h: 36, radius: 10, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon(i, 18, 'brand/fg')]),
      text(t, 'smallStrong', 'text/primary', { w: 'fill' }),
      text(b, 'caption', 'text/tertiary', { w: 'fill' }),
    ]);
  const article = (t: string) => row({ name: t, w: 'fill', gap: 10 }, [icon('file', 18, 'text/tertiary'), text(t, 'small', 'text/primary', { w: 'fill' }), icon('chevron-right', 16, 'text/tertiary')]);
  return page('Help centre · Mobile', [
    col({ name: 'Hero', w: 'fill', pad: [40, 20, 32, 20], gap: 20, fill: 'brand/subtle' }, [
      heading('Help centre', 'How can we help?', null, { mobile: true }),
      fill(use('TextField', { State: 'Default' }, { value: 'Search for answers' }, { hide: ['label'], show: ['leading'], icons: { leading: 'search' } })),
    ]),
    sec('Categories', [row({ name: 'Grid', w: 'fill', gap: 16, wrap: true, wrapGap: 16 }, HELP_CATS.map(tile))]),
    sec('Popular', [text('Popular articles', 'h3', 'text/primary'), listCard(HELP_ARTICLES.map(article), 'Articles')], 'bg/surface'),
    sec('Contact', [
      text('Still need help?', 'h3', 'text/primary'),
      iconRow('message', 'Chat with us', 'In the app under Me, Help. We usually reply within an hour.'),
      iconRow('mail', 'Email support', 'support@gutchek.app for account and billing questions.'),
      row({ name: 'Danger', w: 'fill', gap: 12, pad: 16, radius: 16, fill: 'caution/subtle', cross: 'start' }, [icon('alert-triangle', 20, 'caution/fg'), text('In danger right now? Call 112 or your local emergency number.', 'smallStrong', 'text/primary', { w: 'fill' })]),
    ]),
  ]);
}

function legal(name: string, title: string, toc: string[], sections: Array<[string, string[]]>): FrameNode {
  return page(name, [
    col({ name: 'Legal', w: 'fill', pad: [32, 20, 48, 20], gap: 24 }, [
      col({ name: 'Title', gap: 10, w: 'fill' }, [text(title, display(36, 42), 'text/primary', { w: 'fill' }), text('Last updated 22 October 2026', 'small', 'text/tertiary'), use('ConfidenceBadge', { Level: 'Medium' }, { label: 'Draft for legal review' })]),
      row({ name: 'On this page', w: 'fill', gap: 10, pad: [12, 16], radius: 12, fill: 'bg/surface', stroke: 'border/default' }, [icon('menu', 18, 'text/secondary'), text('On this page · ' + toc.length + ' sections', 'smallStrong', 'text/primary', { w: 'fill' }), icon('chevron-down', 18, 'text/secondary')]),
      ...sections.map(([h, paras]) => col({ name: h, gap: 8, w: 'fill' }, [text(h, 'h3', 'text/primary', { w: 'fill' }), ...paras.map((p) => text(p, 'body', 'text/secondary', { w: 'fill' }))])),
    ]),
  ]);
}

export const mobilePrivacy = () => legal('Privacy policy · Mobile', 'Privacy policy', PRIVACY_TOC, PRIVACY);
export const mobileTerms = () => legal('Terms of use · Mobile', 'Terms of use', TERMS_TOC, TERMS);

export function mobileNotFound(): FrameNode {
  const dial = use('GutMeter', { Tilt: 'Pending' }) as InstanceNode;
  dial.rescale(0.92);
  return page('404 · Mobile', [
    col({ name: 'Not found', w: 'fill', pad: [48, 20, 64, 20], gap: 20, cross: 'center' }, [
      text('404', display(88, 96), 'brand/fg', { align: 'center' }),
      dial,
      text("This page didn't pass the gut check", display(30, 36), 'text/primary', { align: 'center', w: 'fill' }),
      text("It may have moved, or the link may be out of date.", 'body', 'text/secondary', { align: 'center', w: 'fill' }),
      button('Go to the homepage', 'Primary', 'landing'),
      button('Visit the help centre', 'Secondary', 'helpcenter'),
    ]),
  ]);
}
