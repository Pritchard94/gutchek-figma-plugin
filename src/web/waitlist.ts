import { ctx, later, warn } from '../core/ctx';
import { FillSpec, Kid, abs, paint, add, box, col, divider, fill, gradient, hexPaint, icon, pill, rect, row, text } from '../core/ui';
import { glyph, lockup } from '../brand';
import { use } from '../components/library';
import { doodleLayer } from '../components/doodles';
import { ILLO_W, blob, illoChat, illoMeter, illoNotes } from '../components/illustrations';
import { nickAvatar, roomMessage } from '../components/chat';
import { DESKTOP, GUTTER, MOBILE, display, faq, heading, lead } from './kit';
import { sectionFor } from './index';

/**
 * Pre-launch waitlist: a demand test with the Gutchek name and tagline (spec 14.5). Collects contact, city, age range
 * and the feature people would use first. No queue positions: everyone gets in by city and sign-up date, and invites
 * never change that.
 */

const links: Array<[SceneNode, string]> = [];
const go = <T extends SceneNode>(node: T, target: string): T => {
  links.push([node, target]);
  return node;
};

const FAQ: Array<[string, string]> = [
  ['When does Gutchek open?', 'We start with a closed beta in Lagos and Abuja, then open city by city. Everyone on the list gets an email when it opens where they live.'],
  ['Will the person know I looked them up?', 'No. Gutchek never notifies anyone and never shows who searched whom.'],
  ['Is it free?', 'There will be a free plan with one report and one chat check a month, plus Notes. Paid plans add more reports.'],
  ['What do you do with my email or number?', 'We only use it to tell you when Gutchek opens and to send the survey if you ask for it. You can leave the list any time.'],
  ['Does inviting friends get me in sooner?', 'No. Invites are just a way to share Gutchek. Access goes by city and sign-up date for everyone.'],
];

const FEATURES: Array<[() => FrameNode, string, string, string]> = [
  [illoMeter, 'Run a Gutchek', 'A name and one handle in. A fair read of their public posts out, the good and the concerning, with the post behind every flag.', 'At launch'],
  [illoChat, 'Check a Chat', 'Upload screenshots of a conversation. See pressure, love-bombing or respect, quoting the exact messages.', 'At launch'],
  [illoNotes, 'Notes', 'A private journal for how each chat or date made you feel, with one timeline per person.', 'At launch'],
];

const TRUST: Array<[string, string, string]> = [
  ['globe', 'Public posts only', 'Never private accounts, logins or leaked data.'],
  ['eye-off', 'They\u2019re never notified', 'No alerts, and no one sees who searched whom.'],
  ['file', 'Proof for every flag', 'Every finding links to the post it came from.'],
  ['shield-check', 'Adults only', '18+ and for dating and personal safety only.'],
];

// ---------------------------------------------------------------- shared pieces

function nav(mobile: boolean): FrameNode {
  const join = go(use('Button', { Variant: 'Primary', Size: mobile ? 'Small' : 'Medium' }, { label: mobile ? 'Join' : 'Join the waitlist' }), mobile ? 'wlmForm' : 'wlLanding');
  return col({ name: 'Nav', w: 'fill', fill: 'bg/surface' }, [
    row({ name: 'Bar', w: 'fill', h: mobile ? 60 : 76, pad: [0, mobile ? 20 : GUTTER], cross: 'center', main: 'between' }, [
      lockup(mobile ? 24 : 28),
      row({ name: 'Right', gap: 16, cross: 'center' }, [mobile ? null : pill('Coming soon', 'brand', 'sparkle'), join]),
    ]),
    divider(),
  ]);
}

function footer(mobile: boolean): FrameNode {
  const t = (s: string, o = 0.7) => {
    const n = text(s, 'caption', 'text/inverse', { opacity: o });
    return n;
  };
  return (mobile ? col : row)({ name: 'Footer', w: 'fill', pad: mobile ? [32, 20] : [40, GUTTER], gap: mobile ? 16 : 24, fill: 'bg/inverse', cross: mobile ? 'start' : 'center' }, [
    lockup(24, 'text/inverse', 'text/inverse'),
    mobile ? null : box({ name: 'Spacer', w: 'fill', h: 1 }),
    row({ name: 'Links', gap: 20 }, [t('Privacy', 0.9), t('Terms', 0.9), t('Opt out or dispute', 0.9)]),
    t('\u00a9 2026 Gutchek Technologies Ltd. Lagos, Nigeria.'),
  ]);
}

function useChip(label: string, iconName: string, on: boolean): FrameNode {
  return row({ name: label, gap: 6, pad: [8, 12], radius: 999, fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'brand/fg' : 'border/default', strokeW: on ? 1.5 : 1 }, [
    icon(iconName, 14, on ? 'brand/fg' : 'text/secondary'),
    text(label, on ? 'smallStrong' : 'small', on ? 'brand/on-subtle' : 'text/primary'),
  ]);
}

function field(label: string, value: string, state = 'Filled', o: { trailing?: string; leading?: string; helper?: string } = {}): SceneNode {
  const show: string[] = [];
  const icons: Record<string, string> = {};
  const texts: Record<string, string> = { label, value };
  if (o.trailing) {
    show.push('trailing');
    icons.trailing = o.trailing;
  }
  if (o.leading) {
    show.push('leading');
    icons.leading = o.leading;
  }
  if (o.helper) {
    show.push('helper');
    texts.helper = o.helper;
  }
  return fill(use('TextField', { State: state }, texts, { show, icons }));
}

/** The sign-up form. error shows inline validation on the email and the 18+ box. */
function signupForm(error: boolean, target: string): Kid[] {
  const adult = error
    ? col({ name: 'Adult', gap: 6, w: 'fill' }, [
        fill(use('CheckRow', { Checked: 'Off' }, { title: 'I\u2019m 18 or older', body: 'Gutchek is for adults only.' })),
        row({ name: 'Error', gap: 6 }, [icon('alert-triangle', 14, 'caution/fg'), text('Please confirm you\u2019re 18 or older', 'caption', 'caution/fg')]),
      ])
    : fill(use('CheckRow', { Checked: 'On' }, { title: 'I\u2019m 18 or older', body: 'Gutchek is for adults only.' }));
  return [
    fill(use('Segmented', { Active: 'First' }, { first: 'Email', second: 'WhatsApp' })),
    error ? field('Email', 'ada@okonkwo', 'Error', { helper: 'Enter a full email address, like name@example.com' }) : field('Email', 'ada@okonkwo.com', 'Focused'),
    row({ name: 'Where and age', gap: 12, w: 'fill' }, [field('City', 'Lagos', 'Filled', { trailing: 'chevron-down' }), field('Age range', '25 to 34', 'Filled', { trailing: 'chevron-down' })]),
    col({ name: 'Use first', gap: 8, w: 'fill' }, [
      text('What would you use first?', 'label', 'text/secondary'),
      row({ name: 'Choices', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [useChip('Run a Gutchek', 'gauge', true), useChip('Check a Chat', 'message', false), useChip('Notes', 'notebook-pen', false), useChip('Gist Rooms', 'messages', false)]),
    ]),
    adult,
    go(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Join the waitlist' })), target),
    row({ name: 'Privacy', gap: 6, w: 'fill', cross: 'start' }, [icon('lock', 14, 'text/tertiary'), text('We only use this to tell you when Gutchek opens. Leave the list any time.', 'caption', 'text/tertiary', { w: 'fill' })]),
  ];
}

function featureCard([illo, title, body, when]: (typeof FEATURES)[number], w: number | 'fill'): FrameNode {
  const art = illo();
  const inner = typeof w === 'number' ? w - 32 : MOBILE - 40 - 32;
  art.rescale(inner / ILLO_W);
  return col({ name: title, w, gap: 14, pad: [16, 16, 24, 16], radius: 32, fill: 'bg/surface', stroke: 'border/default' }, [
    art,
    col({ name: 'Copy', gap: 8, w: 'fill', pad: [0, 8] }, [row({ name: 'Head', gap: 8, w: 'fill' }, [text(title, 'h3', 'text/primary', { w: 'fill' }), pill(when, 'brand')]), text(body, 'body', 'text/secondary', { w: 'fill' })]),
  ]);
}

function laterStrip(mobile: boolean): FrameNode {
  const faces = ['NaijaBelle', 'Tayo_Writes', 'Ronke.writes'].map((n) => {
    const a = nickAvatar(n, undefined, 28);
    a.strokes = [paint('bg/raised')];
    a.strokeWeight = 2;
    return a;
  });
  const art = col({ name: 'Room preview', w: mobile ? 'fill' : 380, gap: 8, pad: [14, 14, 10, 14], radius: 22, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    row({ name: 'Head', gap: 10, w: 'fill' }, [
      box({ name: 'Tile', dir: 'h', w: 32, h: 32, radius: 10, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('messages', 16, 'brand/fg')]),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text('Talking Stage Diaries', 'smallStrong', 'text/primary'), text('Approval required · nicknames only', 'caption', 'text/tertiary')]),
      row({ name: 'Members', gap: -8 }, faces),
    ]),
    roomMessage({ nick: 'QuietStorm_24', tone: 'brand', type: 'Win', time: '19:58', body: 'He said "no pressure" and actually meant it.', reactions: [[0, 24], [1, 11]], mine: 0 }),
  ]);
  return (mobile ? col : row)({ name: 'Also coming', w: 'fill', gap: mobile ? 16 : 32, pad: mobile ? 16 : 24, radius: 28, fill: 'brand/subtle', cross: mobile ? 'start' : 'center' }, [
    art,
    col({ name: 'Copy', gap: 8, w: 'fill' }, [
      pill('Later', 'neutral', 'clock'),
      text('Gist Rooms', mobile ? 'title' : 'h2', 'text/primary'),
      text('Moderated rooms to share your own dating experiences under a nickname. Never a place to expose anyone.', mobile ? 'small' : 'body', 'text/secondary', { w: 'fill' }),
    ]),
  ]);
}

function trustGrid(mobile: boolean): FrameNode {
  const item = ([i, t, b]: (typeof TRUST)[number]) =>
    row({ name: t, w: mobile ? 'fill' : 'fill', gap: 14, cross: 'start' }, [
      box({ name: 'Icon', dir: 'h', w: 44, h: 44, radius: 12, fill: [hexPaint('#FFFFFF', 0.1)], main: 'center', cross: 'center' }, [icon(i, 22, 'text/inverse')]),
      col({ name: 'Text', gap: 4, w: 'fill' }, [text(t, mobile ? 'bodyStrong' : 'title', 'text/inverse'), text(b, 'small', 'text/inverse', { w: 'fill', opacity: 0.72 })]),
    ]);
  return col({ name: 'Trust', w: 'fill', pad: mobile ? [48, 20] : [80, GUTTER], gap: mobile ? 24 : 40, fill: 'bg/inverse' }, [
    text('Built with guardrails', mobile ? display(30, 36) : display(44, 52), 'text/inverse', { w: 'fill' }),
    (mobile ? col : row)({ name: 'Items', gap: mobile ? 20 : 32, w: 'fill', cross: 'start' }, TRUST.map(item)),
  ]);
}

function ctaBand(mobile: boolean, target: string): FrameNode {
  return col({ name: 'CTA', w: 'fill', pad: mobile ? [40, 24] : [64, 80], gap: 18, radius: mobile ? 28 : 40, cross: 'center', fill: [gradient([['#7556E3', 0], ['#2C1E66', 1]], 135)] }, [
    glyph(mobile ? 40 : 56, 'text/on-solid'),
    text('Be there when it opens', display(mobile ? 30 : 48, mobile ? 36 : 56), 'text/on-solid', { align: 'center', w: 'fill' }),
    text('One email when Gutchek opens in your city. Nothing else unless you ask.', mobile ? 'body' : lead, 'text/on-solid', { align: 'center', w: 'fill', opacity: 0.85 }),
    go(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Join the waitlist' }), target),
  ]);
}

function successBadge(size: number): FrameNode {
  const f = box({ name: 'Success', dir: 'none', w: size * 2, h: size * 1.4 });
  add(f, abs(blob(size * 1.2, 'brand/border', 0.8), size * 0.1, -size * 0.1));
  add(f, abs(blob(size, 'positive/subtle', 1), size * 0.9, size * 0.3));
  add(f, abs(box({ name: 'Disc', dir: 'h', w: size, h: size, radius: size / 2, fill: 'bg/raised', shadow: 'e2', main: 'center', cross: 'center' }, [glyph(Math.round(size * 0.56))]), size / 2, size * 0.2));
  return f;
}

function shareTarget(label: string, bg: FillSpec, code: string, size = 52): FrameNode {
  return col({ name: label, gap: 6, cross: 'center' }, [
    box({ name: 'Icon', dir: 'h', w: size, h: size, radius: size / 2, fill: bg, main: 'center', cross: 'center' }, [
      code === 'link' ? icon('link', Math.round(size * 0.42), 'text/primary') : text(code, { family: 'ui', weight: 700, size: Math.round(size * 0.3) }, 'text/on-solid'),
    ]),
    text(label, 'caption', 'text/secondary'),
  ]);
}

const SHARES = (): Array<[string, FillSpec, string]> => [
  ['WhatsApp', [hexPaint('#25D366')], 'WA'],
  ['Instagram', [gradient([['#F58529', 0], ['#DD2A7B', 0.5], ['#8134AF', 1]], 45)], 'IG'],
  ['X', [hexPaint('#000000')], 'X'],
  ['Copy link', 'bg/subtle', 'link'],
];


function successCards(mobile: boolean, shareTo?: string): FrameNode[] {
  const survey = col({ name: 'Survey', w: 'fill', gap: 14, pad: mobile ? 20 : 32, radius: 28, fill: 'bg/surface', stroke: 'border/default' }, [
    box({ name: 'Icon', dir: 'h', w: 48, h: 48, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('file-text', 24, 'brand/fg')]),
    text('Help shape Gutchek', mobile ? 'title' : 'h3', 'text/primary'),
    text('A 3-minute anonymous survey about what you\u2019d use and what worries you. Your answers decide what we build first.', mobile ? 'small' : 'body', 'text/secondary', { w: 'fill' }),
    row({ name: 'Meta', gap: 12 }, [row({ name: 'Time', gap: 4 }, [icon('clock', 14, 'text/tertiary'), text('3 minutes', 'caption', 'text/tertiary')]), row({ name: 'Anon', gap: 4 }, [icon('eye-off', 14, 'text/tertiary'), text('Anonymous', 'caption', 'text/tertiary')])]),
    fill(use('Button', { Variant: 'Brand', Size: 'Large' }, { label: 'Take the survey' }, { show: ['icon'], icons: { icon: 'external-link' } })),
  ]);
  const shares = row({ name: 'Share', w: 'fill', gap: 0, main: 'between' }, SHARES().map(([l, bg, c]) => shareTarget(l, bg, c, mobile ? 48 : 56)));
  const invite = col({ name: 'Invite', w: 'fill', gap: 14, pad: mobile ? 20 : 32, radius: 28, fill: 'bg/surface', stroke: 'border/default' }, [
    box({ name: 'Icon', dir: 'h', w: 48, h: 48, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('users', 24, 'brand/fg')]),
    text('Invite a friend', mobile ? 'title' : 'h3', 'text/primary'),
    text('Know someone who\u2019d want a second opinion before a first date? Send them the link.', mobile ? 'small' : 'body', 'text/secondary', { w: 'fill' }),
    shareTo ? go(shares, shareTo) : shares,
    row({ name: 'Link', w: 'fill', gap: 10, pad: [10, 10, 10, 14], radius: 12, fill: 'bg/subtle', cross: 'center' }, [
      icon('link', 16, 'text/tertiary'),
      text('gutchek.app/waitlist', 'small', 'text/primary', { w: 'fill' }),
      use('Button', { Variant: 'Secondary', Size: 'Small' }, { label: 'Copy' }),
    ]),
    row({ name: 'Note', gap: 6, w: 'fill', cross: 'start' }, [icon('info', 14, 'text/tertiary'), text('Invites don\u2019t change when you get access. Everyone gets in by city and sign-up date.', 'caption', 'text/tertiary', { w: 'fill' })]),
  ]);
  return [survey, invite];
}

function details(mobile: boolean): FrameNode {
  return (mobile ? col : row)({ name: 'Your details', w: 'fill', gap: mobile ? 10 : 16, pad: [16, 20], radius: 18, fill: 'bg/subtle', cross: mobile ? 'start' : 'center' }, [
    row({ name: 'Summary', gap: 8, w: 'fill' }, [icon('check-circle', 16, 'positive/fg'), text('ada@okonkwo.com · Lagos · Run a Gutchek first', 'small', 'text/primary', { w: 'fill' })]),
    row({ name: 'Actions', gap: 16 }, [text('Change details', 'smallStrong', 'brand/fg'), text('Leave the list', 'smallStrong', 'text/secondary')]),
  ]);
}

function pageFrame(name: string, kids: Kid[], w: number, h?: number): FrameNode {
  const f = col({ name, w, fill: 'bg/canvas', clip: true }, kids);
  if (h && f.height < h) {
    f.layoutSizingVertical = 'FIXED';
    f.resize(w, h);
  }
  f.setPluginData('webpage', '1');
  return f;
}

// ---------------------------------------------------------------- desktop

function desktopHero(error: boolean): FrameNode {
  const hero = box({ name: 'Hero', dir: 'none', w: DESKTOP, h: 820, fill: 'bg/canvas', clip: true });
  add(hero, abs(blob(720, 'brand/border', 0.6), -200, -260));
  add(hero, abs(blob(520, 'positive/subtle', 0.9), 1080, 460));
  add(hero, abs(blob(420, 'caution/subtle', 0.8), 640, -180));
  add(hero, abs(doodleLayer(DESKTOP, 820, 'brand/fg', 0.045, 31), 0, 0));
  const copy = col({ name: 'Copy', gap: 26, w: 620 }, [
    pill('Coming soon to Lagos and Abuja', 'brand', 'sparkle'),
    text('Trust your gut. Then check it.', display(76, 82), 'text/primary', { w: 'fill' }),
    text('Gutchek gives you a fair, evidence-backed second opinion on someone you\u2019re getting to know, before you invest emotionally or meet in person.', lead, 'text/secondary', { w: 'fill' }),
    row({ name: 'Trust', gap: 20, wrap: true, wrapGap: 12, w: 'fill' }, TRUST.slice(0, 3).map(([i, t]) => row({ name: t, gap: 8 }, [icon(i, 18, 'brand/fg'), text(t, 'smallStrong', 'text/secondary')]))),
    row({ name: 'Meter', gap: 16, pad: [14, 20, 14, 14], radius: 20, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
      (() => {
        const d = use('GutMeter', { Tilt: 'Positive' }) as InstanceNode;
        d.rescale(0.42);
        return d;
      })(),
      col({ name: 'Text', gap: 2 }, [text('The Gut Meter', 'smallStrong', 'text/primary'), text('Red Flag and Green Flag, scored separately', 'caption', 'text/secondary')]),
    ]),
  ]);
  add(hero, abs(copy, GUTTER, 120));
  const card = col({ name: 'Sign-up card', w: 500, gap: 16, pad: [32, 32, 28, 32], radius: 32, fill: 'bg/raised', stroke: 'border/default', shadow: 'glass' }, [
    col({ name: 'Head', gap: 6, w: 'fill' }, [text('Join the waitlist', 'h2', 'text/primary'), text('Be among the first to try Gutchek when it opens in your city.', 'body', 'text/secondary', { w: 'fill' })]),
    ...signupForm(error, 'wlSuccess'),
  ]);
  add(hero, abs(card, DESKTOP - GUTTER - 500, 80));
  return hero;
}

function desktopLanding(error: boolean): FrameNode {
  const cardW = Math.floor((DESKTOP - GUTTER * 2 - 48) / 3);
  return pageFrame(error ? 'Waitlist · Form errors' : 'Waitlist', [
    nav(false),
    desktopHero(error),
    col({ name: 'Features', w: 'fill', pad: [96, GUTTER], gap: 40, cross: 'center', fill: 'bg/surface' }, [
      heading('What\u2019s coming', 'Three tools, one calm place', 'For every stage of getting to know someone, from first DM to first date.', { align: 'center', w: 820 }),
      row({ name: 'Cards', w: 'fill', gap: 24, cross: 'start' }, FEATURES.map((f) => featureCard(f, cardW))),
      laterStrip(false),
    ]),
    trustGrid(false),
    col({ name: 'FAQ', w: 'fill', pad: [96, GUTTER], gap: 40, cross: 'center' }, [heading('Questions', 'Before you join', null, { align: 'center' }), col({ name: 'FAQ wrap', w: 880 }, [faq(FAQ)])]),
    col({ name: 'CTA wrap', w: 'fill', pad: [0, GUTTER, 96, GUTTER] }, [ctaBand(false, 'wlLanding')]),
    footer(false),
  ], DESKTOP);
}

function desktopSuccess(): FrameNode {
  return pageFrame('Waitlist · You\u2019re on the list', [
    nav(false),
    col({ name: 'Body', w: 'fill', pad: [72, 240, 96, 240], gap: 32, cross: 'center' }, [
      successBadge(120),
      col({ name: 'Copy', gap: 12, w: 760, cross: 'center' }, [
        text('You\u2019re on the list', display(60, 68), 'text/primary', { align: 'center', w: 'fill' }),
        text('We\u2019ll email ada@okonkwo.com when Gutchek opens in Lagos. Until then, two ways to help.', lead, 'text/secondary', { align: 'center', w: 'fill' }),
      ]),
      row({ name: 'Cards', w: 'fill', gap: 24, cross: 'start' }, successCards(false)),
      details(false),
    ]),
    footer(false),
  ], DESKTOP, 1024);
}

// ---------------------------------------------------------------- mobile

const MH = 844;

function mobileLanding(): FrameNode {
  const art = illoMeter();
  art.rescale((MOBILE - 40) / ILLO_W);
  return pageFrame('Waitlist · Mobile', [
    nav(true),
    col({ name: 'Hero', w: 'fill', pad: [32, 20, 40, 20], gap: 18, fill: 'bg/canvas' }, [
      pill('Coming soon to Lagos and Abuja', 'brand', 'sparkle'),
      text('Trust your gut. Then check it.', display(42, 48), 'text/primary', { w: 'fill' }),
      text('A fair, evidence-backed second opinion on someone you\u2019re getting to know, before you meet.', 'body', 'text/secondary', { w: 'fill' }),
      go(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Join the waitlist' })), 'wlmForm'),
      col({ name: 'Trust', gap: 8 }, TRUST.slice(0, 3).map(([i, t]) => row({ name: t, gap: 8 }, [icon(i, 16, 'brand/fg'), text(t, 'smallStrong', 'text/secondary')]))),
      art,
    ]),
    col({ name: 'Features', w: 'fill', pad: [48, 20], gap: 20, fill: 'bg/surface' }, [
      heading('What\u2019s coming', 'Three tools, one calm place', null, { mobile: true }),
      ...FEATURES.map((f) => featureCard(f, 'fill')),
      laterStrip(true),
    ]),
    trustGrid(true),
    col({ name: 'FAQ', w: 'fill', pad: [48, 20], gap: 20 }, [heading('Questions', 'Before you join', null, { mobile: true }), faq(FAQ.slice(0, 4))]),
    col({ name: 'CTA wrap', w: 'fill', pad: [0, 20, 48, 20] }, [ctaBand(true, 'wlmForm')]),
    footer(true),
  ], MOBILE);
}

function mobileForm(error: boolean): FrameNode {
  const f = col({ name: error ? 'Waitlist · Mobile · Form errors' : 'Waitlist · Mobile · Join', w: MOBILE, h: MH, fill: 'bg/canvas', clip: true }, [
    row({ name: 'Bar', w: 'fill', h: 60, pad: [0, 20], cross: 'center', main: 'between', fill: 'bg/surface' }, [
      lockup(24),
      go(box({ name: 'Close', dir: 'h', w: 36, h: 36, radius: 18, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('x', 18, 'text/secondary')]), 'wlmLanding'),
    ]),
    divider(),
    col({ name: 'Form', w: 'fill', pad: [24, 20, 24, 20], gap: 16 }, [
      col({ name: 'Head', gap: 6, w: 'fill' }, [text('Join the waitlist', 'h2', 'text/primary'), text('Be among the first to try Gutchek in your city.', 'small', 'text/secondary', { w: 'fill' })]),
      ...signupForm(error, 'wlmSuccess'),
    ]),
  ]);
  f.setPluginData('webpage', '1');
  return f;
}

function mobileSuccess(): FrameNode {
  return pageFrame('Waitlist · Mobile · You\u2019re on the list', [
    nav(true),
    col({ name: 'Body', w: 'fill', pad: [24, 20, 40, 20], gap: 20, cross: 'center' }, [
      successBadge(88),
      text('You\u2019re on the list', display(34, 40), 'text/primary', { align: 'center', w: 'fill' }),
      text('We\u2019ll email ada@okonkwo.com when Gutchek opens in Lagos.', 'body', 'text/secondary', { align: 'center', w: 'fill' }),
      ...successCards(true, 'wlmShare'),
      details(true),
    ]),
    footer(true),
  ], MOBILE);
}

function mobileShare(): FrameNode {
  const base = mobileSuccess();
  base.layoutSizingVertical = 'FIXED';
  base.resize(MOBILE, MH);
  base.name = 'Waitlist · Mobile · Invite a friend';
  add(base, abs(rect(MOBILE, MH, 'bg/scrim', 0, 'Scrim'), 0, 0));
  const preview = row({ name: 'Preview', w: 'fill', gap: 12, pad: 12, radius: 16, fill: 'bg/subtle' }, [
    box({ name: 'Thumb', dir: 'h', w: 52, h: 52, radius: 12, fill: [gradient([['#7556E3', 0], ['#2C1E66', 1]], 135)], main: 'center', cross: 'center' }, [glyph(30, 'text/on-solid')]),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text('Gutchek · Trust your gut. Then check it.', 'smallStrong', 'text/primary', { w: 'fill', maxLines: 1 }), text('gutchek.app/waitlist', 'caption', 'text/tertiary')]),
  ]);
  const message = col({ name: 'Message', w: 'fill', gap: 4, pad: 14, radius: 14, stroke: 'border/default' }, [
    text('Message', 'label', 'text/tertiary'),
    text('I just joined the Gutchek waitlist. A fair second opinion before a first date, with proof for every flag: gutchek.app/waitlist', 'small', 'text/primary', { w: 'fill' }),
  ]);
  const apps = row({ name: 'Apps', w: 'fill', gap: 0, main: 'between' }, [
    shareTarget('WhatsApp', [hexPaint('#25D366')], 'WA', 56),
    shareTarget('Instagram', [gradient([['#F58529', 0], ['#DD2A7B', 0.5], ['#8134AF', 1]], 45)], 'IG', 56),
    shareTarget('X', [hexPaint('#000000')], 'X', 56),
    shareTarget('Messages', [hexPaint('#34C759')], 'SMS', 56),
    shareTarget('Telegram', [hexPaint('#229ED9')], 'TG', 56),
  ]);
  const sheet = col({ name: 'Share sheet', w: MOBILE, pad: [10, 20, 28, 20], gap: 16, radius: [28, 28, 0, 0], fill: 'bg/raised', shadow: 'e3', cross: 'center' }, [
    rect(36, 5, 'border/strong', 3, 'Grabber'),
    row({ name: 'Head', w: 'fill' }, [text('Invite a friend', 'h3', 'text/primary', { w: 'fill' }), go(box({ name: 'Close', dir: 'h', w: 32, h: 32, radius: 16, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('x', 16, 'text/secondary')]), 'wlmSuccess')]),
    preview,
    message,
    apps,
    row({ name: 'Copy', w: 'fill', gap: 12, pad: [14, 16], radius: 14, fill: 'bg/subtle' }, [icon('link', 18, 'text/primary'), text('Copy link', 'bodyStrong', 'text/primary', { w: 'fill' })]),
    text('Invites don\u2019t change when you get access.', 'caption', 'text/tertiary'),
  ]);
  add(base, abs(sheet, 0, MH - Math.round(sheet.height)));
  return base;
}

// ---------------------------------------------------------------- page

export function buildWaitlist(page: PageNode): Record<string, FrameNode> {
  ctx.theme = 'light';
  links.length = 0;
  page.backgrounds = [hexPaint('#E9EBF0')];
  const frames: Record<string, FrameNode> = {};
  const make = (defs: Array<[string, () => FrameNode]>) =>
    defs
      .map(([id, fn]) => {
        try {
          const f = fn();
          frames[id] = f;
          return f;
        } catch (e) {
          warn('Waitlist page ' + id + ' failed: ' + String(e && (e as Error).message ? (e as Error).message : e));
          return null;
        }
      })
      .filter((f): f is FrameNode => !!f);
  const desktop = make([
    ['wlLanding', () => desktopLanding(false)],
    ['wlErrors', () => desktopLanding(true)],
    ['wlSuccess', desktopSuccess],
  ]);
  const mobile = make([
    ['wlmLanding', mobileLanding],
    ['wlmForm', () => mobileForm(false)],
    ['wlmErrors', () => mobileForm(true)],
    ['wlmSuccess', mobileSuccess],
    ['wlmShare', mobileShare],
  ]);
  const y = sectionFor(page, 'Waitlist · Desktop 1440', 'Pre-launch sign-up test with the Gutchek name and tagline (spec 14.5). Collects contact, city, age range and the feature people want first. No queue positions; invites never change access.', desktop, 0);
  sectionFor(page, 'Waitlist · Mobile 390', 'The same waitlist on phones, where most WhatsApp and Instagram links will land: landing, the join form and its errors, success, and the invite share sheet.', mobile, y, 80);

  const topOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('webpage') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of links) {
    const dest = frames[target];
    if (!dest || node.removed || topOf(node) === dest) continue;
    later(() => (node as FrameNode).setReactionsAsync([
      {
        trigger: { type: 'ON_CLICK' },
        actions: [{ type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 }, preserveScrollPosition: false }],
      },
    ]), node);
  }
  try {
    page.flowStartingPoints = [
      { nodeId: frames.wlLanding && frames.wlLanding.id, name: 'Waitlist · Desktop' },
      { nodeId: frames.wlmLanding && frames.wlmLanding.id, name: 'Waitlist · Mobile' },
    ].filter((p) => !!p.nodeId);
  } catch (_) {
    warn('Could not set waitlist prototype starting points.');
  }
  return frames;
}
