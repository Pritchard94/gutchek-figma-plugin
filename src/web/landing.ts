import { Token } from '../tokens';
import { abs, add, avatar, box, col, hexPaint, icon, pill, row, text } from '../core/ui';
import { use } from '../components/library';
import { DESKTOP, GUTTER, MOBILE, check, ctaBand, display, faq, featureCard, heading, lead, mobileNav, phone, section, storeBadge, webFooter, webNav, webPage, wlink } from './kit';

export type Screens = Record<string, FrameNode>;

const TRUST: Array<[string, string]> = [
  ['lock', 'Public posts only'],
  ['eye-off', 'They are never notified'],
  ['file', 'Evidence for every flag'],
];

const STATS: Array<[string, string]> = [
  ['< 1 min', 'From one handle to a full report'],
  ['100%', 'Of flags link back to their source'],
  ['0', 'Alerts sent to the person you look up'],
  ['18+', 'Adults only, purpose-checked'],
];

const STEPS: Array<[string, string, string, string]> = [
  ['1', 'search', 'Add a name and one handle', 'Instagram, X, TikTok, Facebook and more. Add a city to help us find the right person.'],
  ['2', 'match', "Confirm it's really them", 'We show the public accounts we found and why. Nothing is analysed until you say yes.'],
  ['3', 'report', 'Read a balanced report', 'Caution and positive scores, a confidence level and the posts behind every finding.'],
];

const FEATURES: Array<[string, string, string]> = [
  ['file', 'Evidence viewer', 'Every flag and every positive opens the original post, with date, platform and context checks.'],
  ['message', 'Check a Chat', 'Upload a conversation and see patterns like pressure, love-bombing or money requests, with the exact messages.'],
  ['sparkle', 'Personality snapshot', 'How someone communicates online: tone, humour, conflict style. Observations, never diagnoses.'],
  ['users', 'Gist Rooms', 'Moderated rooms to share your own experience under a nickname. Never a place to expose anyone.'],
  ['navigation', 'Share my date', 'Send plans and live location to a trusted friend, with check-ins that escalate if you miss one.'],
  ['lock', 'Private by design', 'Searches stay private, reports are encrypted, and you can delete everything in a tap.'],
];

const PRINCIPLES: Array<[string, string, string]> = [
  ['globe', 'Public data only', 'No private accounts, no logins bypassed, no leaked databases. Ever.'],
  ['users', 'You confirm every account', 'No face recognition, no unmasking anonymous accounts, no guessing.'],
  ['file', 'Facts, not labels', '"Content flagged as degrading toward women", never "he is a misogynist".'],
  ['shield-check', 'Rights for the person searched', 'Anyone can opt out or dispute a finding, reviewed by a person.'],
];

const FAQ: Array<[string, string]> = [
  ['Will the person know I looked them up?', 'No. Gutchek never notifies the person, never shows who searched whom, and keeps your search history private to you.'],
  ['Where does Gutchek get its information?', 'Only from public content: official platform APIs, licensed data providers and anything you choose to upload. We never access private accounts.'],
  ['How accurate are the scores?', 'Every score comes with a confidence level and links to its evidence. Thin data means low confidence, not a clean result. You make the call.'],
  ['Can I use Gutchek to screen tenants or employees?', 'No. Gutchek is for dating and personal safety only. Using it for employment, housing or credit decisions is against our terms.'],
  ['What if someone looks me up?', 'You can opt out or dispute any finding on our public opt-out page. Requests are reviewed by a person, usually within a week.'],
];

function trustRow(): FrameNode {
  return row({ name: 'Trust', gap: 24, wrap: true, wrapGap: 12 }, TRUST.map(([i, l]) => row({ name: l, gap: 8 }, [icon(i, 18, 'brand/fg'), text(l, 'smallStrong', 'text/secondary')])));
}

function stats(mobile = false): FrameNode {
  const cells = STATS.map(([n, l]) =>
    col({ name: n, gap: 6, w: mobile ? 155 : 'fill' }, [text(n, display(mobile ? 32 : 44, mobile ? 38 : 52), 'brand/fg'), text(l, 'small', 'text/secondary', { w: 'fill' })]),
  );
  return mobile
    ? row({ name: 'Stats', w: 'fill', gap: 20, wrap: true, wrapGap: 24, pad: [32, 20], fill: 'bg/surface' }, cells)
    : row({ name: 'Stats', w: 'fill', gap: 48, pad: [48, GUTTER], fill: 'bg/surface' }, cells);
}

function stepCard(s: Screens, [n, id, title, body]: (typeof STEPS)[number]): FrameNode {
  const art = box({ name: 'Art', dir: 'h', w: 'fill', h: 340, fill: 'brand/subtle', main: 'center', cross: 'start', pad: [40, 0, 0, 0], clip: true }, [phone(s[id], 0.52)]);
  return col({ name: 'Step ' + n, w: 'fill', radius: 32, fill: 'bg/surface', stroke: 'border/default', clip: true }, [
    art,
    col({ name: 'Copy', w: 'fill', pad: 28, gap: 10 }, [
      box({ name: 'Number', dir: 'h', w: 32, h: 32, radius: 16, fill: 'brand/solid', main: 'center', cross: 'center' }, [text(n, 'smallStrong', 'text/on-solid')]),
      text(title, 'h3', 'text/primary', { w: 'fill' }),
      text(body, 'body', 'text/secondary', { w: 'fill' }),
    ]),
  ]);
}

function scaleCard(w: number | 'fill' = 520): FrameNode {
  const dial = use('GutMeter', { Tilt: 'Positive' }) as InstanceNode;
  const mobile = w === 'fill';
  if (mobile) dial.rescale(0.86);
  return col({ name: 'Scale card', w, pad: mobile ? [28, 8] : [40, 32], gap: 18, radius: 32, fill: 'bg/surface', stroke: 'border/default', shadow: 'e2', cross: 'center' }, [
    text('Verdict', 'overline', 'brand/fg'),
    text('Mostly positive, minor concerns', 'h2', 'text/primary', { align: 'center', w: 'fill' }),
    dial,
    use('ConfidenceBadge', { Level: 'High' }),
    text('214 public items · Instagram, X and TikTok', 'caption', 'text/tertiary'),
  ]);
}

function scaleExplainer(): FrameNode[] {
  const point = (iconName: string, tone: Token, title: string, body: string) =>
    row({ name: title, gap: 16, w: 'fill', cross: 'start' }, [
      box({ name: 'Icon', dir: 'h', w: 44, h: 44, radius: 12, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon(iconName, 22, tone)]),
      col({ name: 'Text', gap: 4, w: 'fill' }, [text(title, 'h3', 'text/primary'), text(body, 'body', 'text/secondary', { w: 'fill' })]),
    ]);
  return [
    point('alert-triangle', 'caution/fg', 'Caution, 1 to 10', 'How strongly the evidence suggests risk: harassment, hostility toward women, deception, threats.'),
    point('check-circle', 'positive/fg', 'Positive, 1 to 10', 'How strongly it shows kindness, respect, accountability and community. Weighed just as seriously.'),
    point('shield-check', 'brand/fg', 'Confidence', 'How much public data the scores rest on. Low data means a low-confidence result, never a clean one.'),
  ];
}

function principlesBand(mobile = false): FrameNode {
  const item = ([i, t, b]: (typeof PRINCIPLES)[number]) =>
    col({ name: t, gap: 12, w: mobile ? 'fill' : 'fill' }, [
      box({ name: 'Icon', dir: 'h', w: 48, h: 48, radius: 14, fill: [hexPaint('#FFFFFF', 0.1)], main: 'center', cross: 'center' }, [icon(i, 24, 'text/inverse')]),
      text(t, 'h3', 'text/inverse', { w: 'fill' }),
      text(b, 'body', 'text/inverse', { w: 'fill', opacity: 0.72 }),
    ]);
  return col({ name: 'Principles', w: 'fill', pad: mobile ? [56, 20] : [96, GUTTER], gap: mobile ? 32 : 56, fill: 'bg/inverse' }, [
    col({ name: 'Heading', gap: 14, w: mobile ? 'fill' : 760 }, [
      text('Our principles', 'overline', 'text/inverse', { opacity: 0.6 }),
      text('Built with guardrails, not loopholes', display(mobile ? 32 : 48, mobile ? 38 : 56), 'text/inverse', { w: 'fill' }),
      text('Gutchek handles information about real people. These rules are product requirements, and they decide what we will never build.', mobile ? 'body' : lead, 'text/inverse', { w: 'fill', opacity: 0.72 }),
    ]),
    (mobile ? col : row)({ name: 'Items', gap: mobile ? 28 : 40, w: 'fill', cross: 'start' }, PRINCIPLES.map(item)),
    wlink(row({ name: 'Link', gap: 8 }, [text('Read our Trust and safety principles', 'bodyStrong', 'text/inverse'), icon('arrow-right', 18, 'text/inverse')]), 'trust'),
  ]);
}

function quotes(): FrameNode {
  const q = (quote: string, who: string, initials: string, tone: 'brand' | 'positive' | 'warning') =>
    col({ name: who, w: 'fill', gap: 20, pad: 32, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [
      icon('quote', 28, 'brand/fg'),
      text(quote, { family: 'ui', weight: 500, size: 18, line: 28, tracking: -0.5 }, 'text/primary', { w: 'fill' }),
      row({ name: 'Who', gap: 12 }, [avatar(initials, 40, tone), text(who, 'smallStrong', 'text/secondary')]),
    ]);
  return col({ name: 'Quotes', w: 'fill', gap: 20 }, [
    row({ name: 'Cards', w: 'fill', gap: 24, cross: 'start' }, [
      q('"It didn\'t tell me what to think. It showed me the posts, and the good stuff too. I went on the date feeling calm."', 'Amaka, 26, Lagos', 'AM', 'brand'),
      q('"I liked that it said low confidence instead of pretending. That honesty is why I trust it."', 'Zainab, 29, Abuja', 'ZA', 'positive'),
      q('"Share my date is the feature I didn\'t know I needed. My sister gets a ping if I miss a check-in."', 'Funmi, 31, Lagos', 'FU', 'warning'),
    ]),
    text('Placeholder quotes for design review. Replace with real beta feedback before launch.', 'caption', 'text/tertiary'),
  ]);
}

export function planCard(name: string, price: string, per: string, items: string[], featured = false, cta = 'Get started'): FrameNode {
  return col({ name, w: 'fill', gap: 20, pad: 32, radius: 28, fill: featured ? 'brand/subtle' : 'bg/surface', stroke: featured ? 'border/focus' : 'border/default', strokeW: featured ? 2 : 1 }, [
    row({ name: 'Head', gap: 10, w: 'fill' }, [text(name, 'h3', 'text/primary', { w: 'fill' }), featured ? pill('Most popular', 'brand') : null]),
    row({ name: 'Price', gap: 6, cross: 'baseline' }, [text(price, display(44, 52), 'text/primary'), text(per, 'body', 'text/tertiary')]),
    col({ name: 'Includes', gap: 12, w: 'fill' }, items.map((i) => check(i))),
    wlink(row({ name: 'CTA', w: 'fill' }, [use('Button', { Variant: featured ? 'Primary' : 'Secondary', Size: 'Large' }, { label: cta })]), 'pricing'),
  ]);
}

export function pricingPreview(): SceneNode[] {
  return [
    row({ name: 'Plans', w: 'fill', gap: 24, cross: 'start' }, [
      planCard('Free', '$0', 'per month', ['1 lite report a month', 'Scores and summary', 'Stay Safe hub and Share my date']),
      planCard('Gutchek Plus', '$7.99', 'per month', ['5 full reports a month', 'Evidence viewer and personality', 'Private notes'], true, 'Start with Plus'),
      planCard('Gutchek Pro', '$14.99', 'per month', ['15 reports a month', 'Monitoring alerts and compare', 'PDF export']),
    ]),
    wlink(text('Need just one? Pay per report for $2.99, with local payment options.', 'bodyStrong', 'brand/fg'), 'pricing'),
  ];
}

export function landing(s: Screens): FrameNode {
  const art = box({ name: 'Hero art', dir: 'none', w: 560, h: 640, radius: 48, fill: 'brand/subtle', clip: true });
  add(art, abs(phone(s.home, 0.62, 'Phone · Home'), 36, 40));
  add(art, abs(phone(s.report, 0.62, 'Phone · Report'), 270, 96));
  return webPage('Landing', [
    webNav(),
    row({ name: 'Hero', w: 'fill', pad: [72, GUTTER, 96, GUTTER], gap: 64, cross: 'center' }, [
      col({ name: 'Copy', gap: 28, w: 'fill' }, [
        pill('Now in beta in Lagos and Abuja', 'brand', 'sparkle'),
        text('Know the person behind the DMs', display(76, 84), 'text/primary', { w: 'fill' }),
        text('Gutchek weighs what someone has shared publicly, the good and the concerning, and shows you the evidence behind every score. So you can decide with clear eyes.', lead, 'text/secondary', { w: 'fill' }),
        row({ name: 'Badges', gap: 12 }, [storeBadge('apple'), storeBadge('google')]),
        trustRow(),
      ]),
      art,
    ]),
    stats(),
    section('How it works', [
      heading('How it works', 'Three steps to a clearer picture', 'A fast second opinion before you invest emotionally or meet in person.', { align: 'center' }),
      row({ name: 'Steps', w: 'fill', gap: 24, cross: 'start' }, STEPS.map((st) => stepCard(s, st))),
    ], { cross: 'center' }),
    section('The Gut Meter', [
      row({ name: 'Scale', w: 'fill', gap: 80, cross: 'center' }, [
        scaleCard(),
        col({ name: 'Explainer', gap: 28, w: 'fill' }, [heading('The Gut Meter', 'Two pans, weighed separately', null), ...scaleExplainer()]),
      ]),
    ], { fill: 'bg/surface' }),
    section('Features', [
      heading('Everything in one calm place', 'More than a score', 'Tools for every stage of getting to know someone, from first DM to first date.', { align: 'center', w: 820 }),
      row({ name: 'Grid', w: 'fill', gap: 24, wrap: true, wrapGap: 24 }, FEATURES.map(([i, t, b]) => featureCard(i, t, b, 384))),
    ], { cross: 'center' }),
    principlesBand(),
    section('Voices', [heading('From our beta', 'People are more than their posts', null, { align: 'center' }), quotes()], { cross: 'center' }),
    section('Pricing', [heading('Pricing', 'Start free. Upgrade when you need more.', null, { align: 'center' }), ...pricingPreview()], { fill: 'bg/surface', cross: 'center' }),
    section('FAQ', [heading('Questions', 'Good questions to ask', null, { align: 'center' }), col({ name: 'FAQ wrap', w: 880 }, [faq(FAQ)])], { cross: 'center' }),
    section('Closing CTA', [ctaBand('Date with clear eyes', 'Download Gutchek and run your first report free.')], { pad: [0, GUTTER] }),
    box({ name: 'Spacer', w: DESKTOP, h: 96, dir: 'v' }),
    webFooter(),
  ]);
}

export function mobileLanding(s: Screens): FrameNode {
  const art = box({ name: 'Hero art', dir: 'h', w: 'fill', h: 440, radius: 32, fill: 'brand/subtle', main: 'center', cross: 'start', pad: [36, 0, 0, 0], clip: true }, [phone(s.home, 0.62)]);
  const step = ([n, , title, body]: (typeof STEPS)[number]) =>
    row({ name: 'Step ' + n, w: 'fill', gap: 14, cross: 'start' }, [
      box({ name: 'Number', dir: 'h', w: 32, h: 32, radius: 16, fill: 'brand/solid', main: 'center', cross: 'center' }, [text(n, 'smallStrong', 'text/on-solid')]),
      col({ name: 'Text', gap: 4, w: 'fill' }, [text(title, 'title', 'text/primary', { w: 'fill' }), text(body, 'small', 'text/secondary', { w: 'fill' })]),
    ]);
  return webPage(
    'Landing · Mobile',
    [
      mobileNav(),
      col({ name: 'Hero', w: 'fill', pad: [32, 20, 40, 20], gap: 20 }, [
        pill('Now in beta in Lagos and Abuja', 'brand', 'sparkle'),
        text('Know the person behind the DMs', display(42, 48), 'text/primary', { w: 'fill' }),
        text('Gutchek weighs what someone has shared publicly, the good and the concerning, and shows you the evidence behind every score.', 'body', 'text/secondary', { w: 'fill' }),
        row({ name: 'Badges', gap: 10 }, [storeBadge('apple', 0.92), storeBadge('google', 0.92)]),
        trustRow(),
        art,
      ]),
      stats(true),
      col({ name: 'How it works', w: 'fill', pad: [48, 20], gap: 24 }, [heading('How it works', 'Three steps to a clearer picture', null, { mobile: true }), ...STEPS.map(step)]),
      col({ name: 'Scale', w: 'fill', pad: [48, 20], gap: 24, fill: 'bg/surface' }, [heading('The Gut Meter', 'Two pans, weighed separately', null, { mobile: true }), scaleCard('fill')]),
      principlesBand(true),
      col({ name: 'FAQ', w: 'fill', pad: [48, 20], gap: 24 }, [heading('Questions', 'Good questions to ask', null, { mobile: true }), faq(FAQ.slice(0, 3))]),
      col({ name: 'CTA', w: 'fill', pad: [0, 20, 48, 20] }, [ctaBand('Date with clear eyes', 'Run your first report free.', true)]),
      webFooter(true),
    ],
    MOBILE,
  );
}
