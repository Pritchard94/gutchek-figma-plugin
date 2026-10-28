import { PLATFORMS, abs, add, avatar, box, col, divider, fill, gradient, hexPaint, icon, pill, platformBadge, row, text } from '../core/ui';
import { glyph, lockup } from '../brand';
import { use } from '../components/library';
import { Person, daniel, kemi, people, seun, tobi, user } from '../screens/data';
import { ILLO_W, blob, floatChip, illoChat, illoMeter, illoRooms } from '../components/illustrations';
import { doodleLayer } from '../components/doodles';
import { APP_H, APP_W, alink, appFrame, btn, card, field, iconTileW, kv, modal, table } from './shell';

// ---------------------------------------------------------------- auth

const AUTH_STEPS = ['Account', 'Code', 'Promises'];

/**
 * Full-bleed auth stage: soft brand glows and a faint doodle field, the form in a centred glass
 * card, and two product illustrations tilted either side so the product sells itself.
 */
function authStage(name: string, step: number, kids: SceneNode[], cardW = 460): FrameNode {
  const f = box({ name, dir: 'none', w: APP_W, h: APP_H, fill: 'bg/canvas', clip: true });
  add(f, abs(blob(720, 'brand/border', 0.7), -220, -260));
  add(f, abs(blob(560, 'positive/subtle', 1), 1040, 620));
  add(f, abs(blob(440, 'caution/subtle', 0.9), 960, -160));
  add(f, abs(blob(380, 'brand/subtle', 1), 120, 700));
  add(f, abs(doodleLayer(APP_W, APP_H, 'brand/fg', 0.05, 23), 0, 0));

  const top = row({ name: 'Top bar', w: APP_W - 96, cross: 'center', main: 'between' }, [
    lockup(28),
    row({ name: 'Right', gap: 20, cross: 'center' }, [
      text('Help centre', 'smallStrong', 'text/secondary'),
      row({ name: 'Safe', gap: 6, pad: [6, 12], radius: 999, fill: 'bg/raised', stroke: 'border/default' }, [icon('lock', 14, 'positive/fg'), text('Private and encrypted', 'label', 'text/secondary')]),
    ]),
  ]);
  add(f, abs(top, 48, 32));

  const stepper = row(
    { name: 'Steps', gap: 6, w: 'fill' },
    AUTH_STEPS.map((s, i) =>
      col({ name: 'Step · ' + s, gap: 6, w: 'fill' }, [
        box({ name: 'Bar', dir: 'h', w: 'fill', h: 4, radius: 2, fill: i <= step ? 'brand/solid' : 'border/default' }),
        text(s, 'label', i === step ? 'text/primary' : 'text/tertiary'),
      ]),
    ),
  );
  const card = col({ name: 'Auth card', w: cardW, gap: 20, pad: [32, 36, 36, 36], radius: 32, fill: 'bg/raised', stroke: 'border/default', shadow: 'glass' }, [stepper, ...kids]);
  add(f, abs(card, Math.round((APP_W - cardW) / 2), Math.max(108, Math.round((APP_H - card.height) / 2) + 20)));

  const left = illoMeter();
  left.rescale(0.92);
  left.rotation = 5;
  add(f, abs(left, 96, 300));
  const right = step === 0 ? illoRooms() : illoChat();
  right.rescale(0.92);
  right.rotation = -5;
  add(f, abs(right, APP_W - 96 - Math.round(ILLO_W * 0.92), 260));

  add(f, abs(floatChip('eye-off', 'They are never notified', 'neutral'), 150, 220));
  add(f, abs(floatChip('file', 'Every flag links to its source', 'brand'), 1060, 680));

  f.setPluginData('webapp', '1');
  return f;
}

const authTitle = (t: string) => text(t, { family: 'display', weight: 800, size: 34, line: 40, tracking: -1.5 }, 'text/primary', { w: 'fill' });

export function wSignIn(): FrameNode {
  return authStage('Sign in', 0, [
      authTitle('Trust your gut. Then check it.'),
      text('Sign in or create an account. Gutchek is for adults 18 and over.', 'body', 'text/secondary', { w: 'fill' }),
      row({ name: 'Social', gap: 12, w: 'fill' }, [fill(use('SocialButton', { Provider: 'Apple' })), fill(use('SocialButton', { Provider: 'Google' }))]),
      row({ name: 'Or', gap: 12, w: 'fill' }, [fill(divider()), text('or use your phone', 'small', 'text/tertiary'), fill(divider())]),
      fill(use('Segmented', { Active: 'First' }, { first: 'Phone', second: 'Email' })),
      field('Phone number', '803 555 0142', 'Focused', { prefix: '+234' }),
      alink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Send code' })), 'wVerify'),
      text('By continuing you agree to the Terms of use and Privacy policy.', 'caption', 'text/tertiary', { w: 'fill' }),
  ]);
}

export function wVerify(): FrameNode {
  const digits = ['4', '8', '1', '9', '', ''];
  return authStage('Verify code', 1, [
    alink(row({ name: 'Back', gap: 6 }, [icon('chevron-left', 18, 'text/secondary'), text('Back', 'smallStrong', 'text/secondary')]), 'wSignIn'),
    authTitle('Enter the code'),
    row({ name: 'Sent to', gap: 6, w: 'fill' }, [text('Sent to ' + user.phone + '.', 'body', 'text/secondary'), text('Change', 'bodyStrong', 'brand/fg')]),
    row(
      { name: 'OTP', gap: 8, w: 'fill' },
      digits.map((d, i) =>
        box({ name: 'Digit ' + (i + 1), dir: 'h', w: 'fill', h: 60, radius: 14, fill: 'bg/surface', stroke: i === 4 ? 'border/focus' : 'border/strong', strokeW: i === 4 ? 2 : 1, main: 'center', cross: 'center' }, [
          d ? text(d, { family: 'display', weight: 700, size: 26, line: 32 }, 'text/primary') : i === 4 ? box({ name: 'Caret', w: 2, h: 26, fill: 'brand/fg', dir: 'h' }) : null,
        ]),
      ),
    ),
    alink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Verify' })), 'wPurpose'),
    row({ name: 'Resend', gap: 6 }, [icon('clock', 16, 'text/tertiary'), text('Resend code in 0:24 · Codes expire after 10 minutes', 'small', 'text/tertiary')]),
  ]);
}

export function wPurpose(): FrameNode {
  const check = (title: string, body: string) => fill(use('CheckRow', { Checked: 'On' }, { title, body }));
  return authStage(
    'Age and purpose',
    2,
    [
      authTitle('Before your first Gutchek'),
      text('Gutchek is built for personal safety. These promises keep it that way for everyone.', 'body', 'text/secondary', { w: 'fill' }),
      check("I'm 18 or older", 'Gutchek is for adults and never profiles anyone under 18.'),
      check("I'm using Gutchek for dating and personal safety", 'Not for employment, housing, credit or tenancy decisions.'),
      check("I won't use Gutchek to harass anyone", 'Repeat lookups of one person are limited. Misuse leads to a ban.'),
      row({ name: 'Actions', gap: 12, w: 'fill' }, [alink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Agree and continue' })), 'wHome'), use('Button', { Variant: 'Tertiary', Size: 'Large' }, { label: 'Verify my ID' })]),
    ],
    520,
  );
}

// ---------------------------------------------------------------- home

function scoreCell(p: Person): SceneNode {
  return p.confidence === 'Low'
    ? use('ConfidenceBadge', { Level: 'Low' }, { label: 'Low data' })
    : row({ name: 'Scores', gap: 6 }, [use('ScoreBadge', { Side: 'Caution' }, { label: String(p.caution) }), use('ScoreBadge', { Side: 'Positive' }, { label: String(p.positive) })]);
}

function personCell(p: Person): FrameNode {
  return row({ name: p.name, gap: 12 }, [avatar(p.initials, 40, p.tone), col({ name: 'Text', gap: 0 }, [text(p.name, 'bodyStrong', 'text/primary'), text(p.handle, 'caption', 'text/tertiary')])]);
}

const REPORT_TARGET: Record<string, string> = { Tobi: 'wReport', Daniel: 'wSevere', Seun: 'wCompare', Kemi: 'wReport' };

export function reportsTable(list: Person[], variant: 'compact' | 'notes' = 'compact'): FrameNode {
  const notes = variant === 'notes';
  const cols = notes
    ? [
        { label: 'Person', w: 220 },
        { label: 'Verdict', w: 'fill' as const },
        { label: 'Scores', w: 140 },
        { label: 'Confidence', w: 150 },
        { label: 'Private note', w: 220 },
        { label: 'Updated', w: 90 },
      ]
    : [
        { label: 'Person', w: 210 },
        { label: 'Verdict', w: 'fill' as const },
        { label: 'Scores', w: 140 },
        { label: 'Updated', w: 90 },
      ];
  return table(
    cols,
    list.map((p) => {
      const cells: SceneNode[] = [personCell(p), text(p.verdict, 'small', 'text/primary', { w: 'fill' }), scoreCell(p)];
      if (notes) {
        cells.push(use('ConfidenceBadge', { Level: p.confidence }));
        cells.push(text(p.note || '—', 'small', 'text/secondary', { w: 'fill', maxLines: 2 }));
      }
      cells.push(text(p.updated.replace('Updated ', ''), 'small', 'text/secondary'));
      return cells;
    }),
    { links: list.map((p) => REPORT_TARGET[p.first]) },
  );
}

function notificationsList(): FrameNode[] {
  const n = (iconName: string, tone: 'brand' | 'positive' | 'warning' | 'neutral', title: string, body: string, time: string) =>
    row({ name: title, w: 'fill', gap: 12, cross: 'start' }, [
      iconTileW(iconName, tone, 36),
      col({ name: 'Text', gap: 2, w: 'fill' }, [row({ name: 'Head', gap: 8, w: 'fill' }, [text(title, 'smallStrong', 'text/primary', { w: 'fill' }), text(time, 'caption', 'text/tertiary')]), text(body, 'caption', 'text/secondary', { w: 'fill' })]),
    ]);
  return [
    n('file', 'brand', 'Report ready', 'Tobi Adeyemi · mostly positive', '2m'),
    n('messages', 'brand', '12 new in Talking Stage Diaries', 'NaijaBelle asked a question', '5m'),
    n('shield-check', 'positive', 'Checked in safely', 'Ngozi was notified', '1h'),
    n('trending-up', 'warning', 'Report changed', "Seun's caution score moved to 4", 'Mon'),
  ];
}

function homeContent(firstTime: boolean): SceneNode[] {
  const newLibra = col({ name: 'Run a Gutchek', w: 'fill', gap: 14, pad: 28, radius: 24, fill: [gradient([['#7556E3', 0], ['#4A30B0', 1]], 135)] }, [
    row({ name: 'Top', gap: 10, w: 'fill' }, [glyph(36, 'text/on-solid'), box({ name: 'Spacer', w: 'fill', h: 1 }), text(firstTime ? '1 free report' : '3 of 5 reports left', 'caption', 'text/on-solid', { opacity: 0.85 })]),
    text('Run a Gutchek', { family: 'display', weight: 800, size: 28, line: 34, tracking: -1.5 }, 'text/on-solid'),
    text('A name and one social handle. A balanced, evidence-linked report in under a minute.', 'body', 'text/on-solid', { w: 'fill', opacity: 0.88 }),
    alink(row({ name: 'CTA', h: 44, pad: [0, 18], gap: 8, radius: 12, fill: [hexPaint('#FFFFFF')], cross: 'center' }, [icon('plus', 20, 'brand/solid'), text('Run a Gutchek', 'bodyStrong', 'brand/solid')]), 'wSearch'),
  ]);
  const chat = alink(
    col({ name: 'Check a Chat', w: 'fill', gap: 14, pad: 28, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [
      iconTileW('message', 'brand', 48),
      text('Check a Chat', { family: 'display', weight: 800, size: 28, line: 34, tracking: -1.5 }, 'text/primary'),
      text('Drop in screenshots or a chat export to see how they communicate, with the exact messages.', 'body', 'text/secondary', { w: 'fill' }),
      row({ name: 'Free', gap: 8 }, [pill('1 free this month', 'positive', 'sparkle'), text('Open', 'smallStrong', 'brand/fg'), icon('arrow-right', 16, 'brand/fg')]),
    ]),
    'wAnalyse',
  );
  const recent = firstTime
    ? card(null, [
        col({ name: 'Empty', w: 'fill', gap: 12, pad: [32, 0], cross: 'center' }, [
          box({ name: 'Art', dir: 'h', w: 88, h: 88, radius: 44, fill: 'brand/subtle', main: 'center', cross: 'center' }, [glyph(48, 'brand/fg')]),
          text('No reports yet', 'h3', 'text/primary'),
          text('Reports you run appear here. Saved people stay private to you.', 'body', 'text/secondary'),
          btn('Run your first Gutchek', 'Primary', 'Medium', 'plus', 'wSearch'),
        ]),
      ])
    : col({ name: 'Recent', w: 'fill', gap: 12 }, [row({ name: 'Head', gap: 8, w: 'fill' }, [text('Recent reports', 'h3', 'text/primary', { w: 'fill' }), alink(text('View all', 'smallStrong', 'brand/fg'), 'wSaved')]), reportsTable(people)]);
  return [
    row({ name: 'Greeting', gap: 8, w: 'fill' }, [col({ name: 'Text', gap: 4, w: 'fill' }, [text((firstTime ? 'Welcome, ' : 'Good evening, ') + user.first, { family: 'display', weight: 800, size: 36, line: 44, tracking: -2 }, 'text/primary'), text(firstTime ? "Let's start with someone you're getting to know." : 'Saturday 25 October · 2 reports updated this week', 'body', 'text/secondary')])]),
    row({ name: 'Actions', w: 'fill', gap: 20, cross: 'start' }, [newLibra, chat]),
    recent,
  ];
}

function homeRail(firstTime: boolean): SceneNode[] {
  const roomRow = (name: string, preview: string, unread?: string, muted = false) =>
    alink(
      row({ name, w: 'fill', gap: 10 }, [
        iconTileW('message', 'brand', 32),
        col({ name: 'Text', gap: 0, w: 'fill' }, [text(name, 'smallStrong', muted ? 'text/secondary' : 'text/primary', { w: 'fill', maxLines: 1 }), text(preview, 'caption', 'text/tertiary', { w: 'fill', maxLines: 1 })]),
        unread ? box({ name: 'Badge', dir: 'h', h: 20, pad: [0, 7], radius: 10, fill: 'brand/solid', cross: 'center' }, [text(unread, { family: 'ui', weight: 700, size: 11, line: 14 }, 'text/on-solid')]) : muted ? icon('bell-off', 14, 'text/tertiary') : null,
      ]),
      'wRooms',
    );
  return [
    card('Notifications', notificationsList(), { action: 'See all', actionTo: 'wNotifications', gap: 14 }),
    firstTime
      ? card('How Gutchek works', [kv('1', 'Add a name and one handle'), kv('2', 'Confirm the right accounts'), kv('3', 'Read a balanced report')])
      : card('Your rooms', [roomRow('Talking Stage Diaries', 'NaijaBelle: Is that normal or a red flag…', '12'), roomRow('Safety First', 'Mod_Tunde: New scam pattern…', '3'), roomRow('First Date Stories', 'Tayo_Writes: Update on the cinema…', undefined, true)], { action: 'Open', actionTo: 'wRooms', gap: 14 }),
    col({ name: 'Safety tip', w: 'fill', gap: 8, pad: 20, radius: 20, fill: 'positive/subtle' }, [
      row({ name: 'Head', gap: 8 }, [icon('life-buoy', 18, 'positive/fg'), text('Safety tip of the day', 'overline', 'positive/fg')]),
      text('Meet first dates somewhere public, and share your plans with a friend using Share my date.', 'small', 'text/primary', { w: 'fill' }),
      alink(text('Open Safety', 'smallStrong', 'positive/fg'), 'wSafety'),
    ]),
  ];
}

export function wHome(): FrameNode {
  return appFrame({ name: 'Home', active: 'wHome', title: 'Home', rail: homeRail(false) }, homeContent(false));
}

export function wHomeEmpty(): FrameNode {
  return appFrame({ name: 'Home · first time', active: 'wHome', title: 'Home', rail: homeRail(true) }, homeContent(true));
}

export function wNotifications(): FrameNode {
  const base = wHome();
  const panel = col({ name: 'Notifications panel', w: 420, gap: 16, pad: 20, radius: 20, fill: 'bg/raised', stroke: 'border/default', shadow: 'e3' }, [
    row({ name: 'Head', gap: 8, w: 'fill' }, [text('Notifications', 'h3', 'text/primary', { w: 'fill' }), text('Mark all read', 'smallStrong', 'brand/fg')]),
    row({ name: 'Filters', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'All' }), use('Chip', { Selected: 'Off' }, { label: 'Reports' }), use('Chip', { Selected: 'Off' }, { label: 'Rooms' }), use('Chip', { Selected: 'Off' }, { label: 'Safety' })]),
    ...notificationsList(),
    divider(),
    alink(text('Notification settings', 'smallStrong', 'brand/fg'), 'wSettings'),
  ]);
  base.name = 'Home · Notifications';
  add(base, abs(panel, 1440 - 420 - 32, 72));
  return base;
}

// ---------------------------------------------------------------- search

export function wSearch(): FrameNode {
  const chips = row({ name: 'Platforms', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, PLATFORMS.map((p) => use('Chip', { Selected: p.code === 'IG' ? 'On' : 'Off' }, { label: p.name })));
  const step = (n: string, t: string, b: string) =>
    row({ name: 'Step ' + n, w: 'fill', gap: 12, cross: 'start' }, [
      box({ name: 'Number', dir: 'h', w: 28, h: 28, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(n, 'smallStrong', 'brand/on-subtle')]),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(t, 'smallStrong', 'text/primary'), text(b, 'caption', 'text/secondary', { w: 'fill' })]),
    ]);
  return appFrame(
    {
      name: 'New search',
      active: 'wSearch',
      title: 'Run a Gutchek',
      crumb: 'Home / Run a Gutchek',
      rail: [
        card('How Gutchek finds accounts', [step('1', 'We read the handle you give us', 'Its public profile, bio and links.'), step('2', 'We follow public links', 'Link in bio and cross-posted handles.'), step('3', 'You confirm every account', 'Nothing is analysed until you say yes.')]),
        card('What we never do', [
          row({ name: 'a', gap: 8, w: 'fill' }, [icon('x', 16, 'caution/fg'), text('Access private accounts', 'small', 'text/primary', { w: 'fill' })]),
          row({ name: 'b', gap: 8, w: 'fill' }, [icon('x', 16, 'caution/fg'), text('Use face recognition', 'small', 'text/primary', { w: 'fill' })]),
          row({ name: 'c', gap: 8, w: 'fill' }, [icon('x', 16, 'caution/fg'), text('Tell anyone you searched', 'small', 'text/primary', { w: 'fill' })]),
        ]),
      ],
    },
    [
      card(null, [
        text('Who are you getting to know?', 'h2', 'text/primary'),
        text('Gutchek only reads public content. They are never notified.', 'body', 'text/secondary'),
        row({ name: 'Name', gap: 16, w: 'fill' }, [field('First name', 'Tobi'), field('Last name', 'Adeyemi')]),
        col({ name: 'Platform', gap: 10, w: 'fill' }, [text('Where do you know them from?', 'label', 'text/secondary'), chips]),
        field('Instagram handle', 'tobi.adeyemi', 'Focused', { prefix: '@', helper: 'One handle is enough. We find linked accounts through public links only.' }),
        row({ name: 'Optional', gap: 16, w: 'fill' }, [field('City (optional)', 'Lagos', 'Filled', { leading: 'map-pin' }), field('Age range (optional)', '27 to 32', 'Filled', { trailing: 'chevron-down' })]),
        row({ name: 'Photo', w: 'fill', gap: 12, pad: 16, radius: 14, stroke: 'border/strong', dash: [6, 6] }, [icon('image', 20, 'text/tertiary'), text('Add a photo you already have (optional). Used only to compare with profiles we find.', 'small', 'text/secondary', { w: 'fill' })]),
        divider(),
        row({ name: 'Footer', gap: 12, w: 'fill' }, [
          row({ name: 'Purpose', gap: 8, w: 'fill' }, [icon('shield-check', 16, 'brand/fg'), text('For dating and personal safety only · uses 1 of 3 reports left', 'caption', 'text/tertiary', { w: 'fill' })]),
          btn('Find them', 'Primary', 'Large', 'search', 'wMatch'),
        ]),
      ], { pad: 32, gap: 20 }),
    ],
  );
}

export function wPaywall(): FrameNode {
  const opt = (title: string, detail: string, price: string, on: boolean) =>
    row({ name: title, w: 'fill', gap: 12, pad: 16, radius: 16, fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'border/focus' : 'border/default', strokeW: on ? 2 : 1 }, [
      box({ name: 'Radio', dir: 'h', w: 22, h: 22, radius: 11, stroke: on ? 'brand/fg' : 'border/strong', strokeW: on ? 6 : 1.5, fill: 'bg/surface' }, []),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary'), text(detail, 'small', 'text/secondary', { w: 'fill' })]),
      text(price, 'title', 'text/primary'),
    ]);
  const dialog = col({ name: 'Dialog', w: 520, gap: 16, pad: 32, radius: 28, fill: 'bg/raised', shadow: 'e3' }, [
    iconTileW('star', 'brand', 48),
    text("You're out of reports this month", 'h2', 'text/primary', { w: 'fill' }),
    text('Your reports reset on 1 Nov. Need one sooner?', 'body', 'text/secondary', { w: 'fill' }),
    opt('One report', 'Full report, evidence and personality', '$2.99', true),
    opt('Upgrade to Gutchek Pro', '15 reports, monitoring and compare', '$14.99/mo', false),
    row({ name: 'Actions', gap: 12, w: 'fill' }, [alink(fill(use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Get 1 report · $2.99' })), 'wMatch'), alink(use('Button', { Variant: 'Secondary', Size: 'Large' }, { label: 'See plans' }), 'wBilling')]),
  ]);
  return modal(wSearch(), dialog, 'New search · Out of reports');
}

// ---------------------------------------------------------------- match and analysis

export function wMatch(): FrameNode {
  const cand = (tier: string, name: string, handle: string, initials: string) =>
    col({ name: handle, w: 'fill', gap: 12, cross: 'center' }, [
      use('MatchCard', { Tier: tier }, { name, handle, initials }),
      row({ name: 'Decision', gap: 10 }, [use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Not them' }, { show: ['icon'], icons: { icon: 'x' } }), alink(use('Button', { Variant: tier === 'Possible' ? 'Secondary' : 'Primary', Size: 'Medium' }, { label: "That's them" }, { show: ['icon'], icons: { icon: 'check' } }), 'wLinked')]),
    ]);
  const compared = (ok: boolean, t: string) => row({ name: t, w: 'fill', gap: 10, cross: 'start' }, [icon(ok ? 'check-circle' : 'info', 18, ok ? 'positive/fg' : 'text/tertiary'), text(t, 'small', 'text/primary', { w: 'fill' })]);
  return appFrame(
    {
      name: 'Match confirmation',
      active: 'wSearch',
      title: 'Confirm accounts',
      crumb: 'Run a Gutchek / Tobi Adeyemi',
    },
    [
      col({ name: 'Heading', gap: 6, w: 'fill' }, [text('Is this Tobi?', 'h1', 'text/primary'), text('We found 3 public accounts. Confirm the ones that belong to the person you are getting to know.', 'body', 'text/secondary', { w: 'fill' })]),
      row({ name: 'Candidates', w: 'fill', gap: 20, cross: 'start' }, [
        cand('Confirmed', 'Tobi Adeyemi', '@tobi.adeyemi', 'TA'),
        cand('Likely', 'Tobi Adeyemi', '@tobiadeyemi', 'TA'),
        cand('Possible', 'Tobi A.', '@tobi_a_official', 'TA'),
      ]),
      row({ name: 'More', gap: 8 }, [icon('plus', 16, 'brand/fg'), text('Add an account you know is theirs', 'smallStrong', 'brand/fg')]),
      row({ name: 'Explain', w: 'fill', gap: 20, cross: 'start' }, [
        card('What we compared', [
          compared(true, 'Display name matches "Tobi Adeyemi"'),
          compared(true, 'Instagram bio links to tiktok.com/@tobiadeyemi'),
          compared(true, 'Same unique username on X'),
          compared(true, 'Bio location matches Lagos'),
          compared(false, 'No face recognition or writing-style matching is ever used'),
        ]),
        col({ name: 'Rule', w: 360, gap: 8, pad: 24, radius: 20, fill: 'brand/subtle' }, [text('Possible matches stay out', 'smallStrong', 'brand/on-subtle'), text('Accounts matched on name and city only are never scored unless you confirm them.', 'small', 'text/primary', { w: 'fill' })]),
      ]),
    ],
  );
}

export function wLinked(): FrameNode {
  const tone = (t: string) => (t === 'Confirmed' ? 'positive' : t === 'Likely' ? 'warning' : 'neutral') as 'positive' | 'warning' | 'neutral';
  const rows: Array<[string, string, string, string, boolean]> = [
    ['IG', '@tobi.adeyemi', 'You added this handle', 'Confirmed', true],
    ['TT', '@tobiadeyemi', 'Linked in Instagram bio', 'Confirmed', true],
    ['X', '@tobiadeyemi', 'Same username and display name', 'Likely', true],
    ['FB', 'Tobi Adeyemi', 'Name and city match only', 'Possible', false],
  ];
  return appFrame({ name: 'Linked accounts', active: 'wSearch', title: 'Linked accounts', crumb: 'Run a Gutchek / Tobi Adeyemi', actions: [btn('Check it', 'Primary', 'Medium', 'arrow-right', 'wProcessing')] }, [
    col({ name: 'Heading', gap: 6, w: 'fill' }, [text('3 accounts included', 'h1', 'text/primary'), text('Confirmed and Likely accounts are analysed. Possible matches stay out unless you switch them on.', 'body', 'text/secondary', { w: 'fill' })]),
    table(
      [
        { label: 'Account', w: 'fill' },
        { label: 'How we found it', w: 300 },
        { label: 'Match', w: 140 },
        { label: 'Include', w: 90 },
      ],
      rows.map(([code, handle, method, tier, on]) => [
        row({ name: handle, gap: 12 }, [platformBadge(code, 32), text(handle, 'bodyStrong', 'text/primary')]),
        text(method, 'small', 'text/secondary'),
        pill(tier, tone(tier)),
        use('Switch', { State: on ? 'On' : 'Off' }),
      ]),
    ),
    row({ name: 'Note', gap: 8 }, [icon('info', 16, 'text/tertiary'), text('Analysis uses public posts from the last 5 years on included accounts.', 'small', 'text/tertiary')]),
  ]);
}

export function wProcessing(): FrameNode {
  const step = (state: string, label: string, detail: string) => fill(use('ProgressStep', { State: state }, { label, detail }));
  const dial = use('GutMeter', { Tilt: 'Pending' }) as InstanceNode;
  dial.rescale(1.2);
  return appFrame({ name: 'Processing', active: 'wSearch', title: 'Weighing the evidence', crumb: 'Run a Gutchek / Tobi Adeyemi' }, [
    row({ name: 'Center', w: 'fill', main: 'center', pad: [24, 0] }, [
      col({ name: 'Card', w: 640, gap: 24, pad: 40, radius: 28, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
        dial,
        col({ name: 'Heading', gap: 6, w: 'fill', cross: 'center' }, [text('Weighing the evidence', 'h2', 'text/primary'), text('Usually under a minute. You can keep using Gutchek; we will notify you.', 'body', 'text/secondary')]),
        col({ name: 'Steps', gap: 16, w: 'fill' }, [
          step('Done', 'Finding public profiles', '3 accounts confirmed'),
          step('Done', 'Reading public posts', '214 posts, captions and comments'),
          step('Active', 'Weighing signals', 'Checking context: quotes, lyrics and satire'),
          step('Pending', 'Writing your report', 'Summary, personality and evidence'),
        ]),
        row({ name: 'Actions', gap: 12 }, [btn('Back to Home', 'Secondary', 'Medium', undefined, 'wHome'), btn('View report', 'Primary', 'Medium', 'arrow-right', 'wReport')]),
      ]),
    ]),
  ]);
}