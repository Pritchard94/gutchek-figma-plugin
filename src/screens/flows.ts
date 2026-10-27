import { Tone, avatar, box, col, divider, fill, icon, pill, platformBadge, row, text } from '../core/ui';
import { bullet } from '../pages/common';
import { btn, center, chip, group, groupTitle, heroIcon, iconTile, link, note, radioGroup, screen, textArea, use, viewport, withSheet } from './kit';
import { people, tobi, Person } from './data';
import { newSearch } from './search';
import { report } from './report';
import { saved } from './home';

// ---------------------------------------------------------------- home

export function notificationsList(): FrameNode {
  const item = (iconName: string, tone: Tone, title: string, body: string, time: string, unread = false) =>
    row({ name: title, w: 'fill', gap: 12, pad: [14, 16], cross: 'start', fill: unread ? 'brand/subtle' : null }, [
      iconTile(iconName, tone, 40),
      col({ name: 'Text', gap: 2, w: 'fill' }, [
        row({ name: 'Head', gap: 8, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary', { w: 'fill' }), text(time, 'caption', 'text/tertiary')]),
        text(body, 'small', 'text/secondary', { w: 'fill' }),
      ]),
    ]);
  return screen(
    { name: 'Notifications', nav: { title: 'Notifications', action: 'settings', backTo: 'home', actionTo: 'notifSettings' }, gap: 12 },
    [
      text('Today', 'overline', 'text/tertiary'),
      link(group([item('file', 'brand', 'Report ready', 'Tobi Adeyemi · Mostly positive, minor concerns', '2m', true), item('shield-check', 'positive', 'You checked in safely', 'Share my date ended. Ngozi was notified.', '1h')], 'Today', 68), 'report'),
      text('Earlier', 'overline', 'text/tertiary'),
      group(
        [
          item('trending-up', 'warning', 'Report changed', "New public posts moved Seun's caution score from 3 to 4.", 'Mon'),
          item('star', 'brand', '1 report left this month', 'Your Gutchek Plus reports reset on 1 Nov.', 'Sun'),
          item('flag', 'neutral', 'Issue resolved', 'We corrected a mismatched account in Kemi\'s report.', '12 Oct'),
        ],
        'Earlier',
        68,
      ),
    ],
  );
}

// ---------------------------------------------------------------- new search

interface Account {
  code: string;
  handle: string;
  method: string;
  tier: 'Confirmed' | 'Likely' | 'Possible';
  on: boolean;
}

export function linkedAccounts(): FrameNode {
  const accounts: Account[] = [
    { code: 'IG', handle: '@tobi.adeyemi', method: 'You added this handle', tier: 'Confirmed', on: true },
    { code: 'TT', handle: '@tobiadeyemi', method: 'Linked in Instagram bio', tier: 'Confirmed', on: true },
    { code: 'X', handle: '@tobiadeyemi', method: 'Same username and display name', tier: 'Likely', on: true },
    { code: 'FB', handle: 'Tobi Adeyemi', method: 'Name and city match only', tier: 'Possible', on: false },
  ];
  const tone = (t: Account['tier']): Tone => (t === 'Confirmed' ? 'positive' : t === 'Likely' ? 'warning' : 'neutral');
  const rows = accounts.map((a) =>
    row({ name: a.handle, w: 'fill', gap: 12, pad: [14, 16] }, [
      platformBadge(a.code, 36),
      col({ name: 'Text', gap: 4, w: 'fill' }, [
        text(a.handle, 'bodyStrong', 'text/primary', { w: 'fill' }),
        text(a.method, 'small', 'text/secondary', { w: 'fill' }),
        pill(a.tier, tone(a.tier)),
      ]),
      use('Switch', { State: a.on ? 'On' : 'Off' }),
    ]),
  );
  const add = row({ name: 'Add account', w: 'fill', gap: 12, pad: [14, 16] }, [
    box({ name: 'Plus', dir: 'h', w: 36, h: 36, radius: 10, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('plus', 20, 'brand/fg')]),
    text('Add an account you know is theirs', 'bodyStrong', 'brand/fg', { w: 'fill' }),
  ]);
  return screen(
    {
      name: 'Linked accounts',
      nav: { title: 'Linked accounts', action: 'help', backTo: 'match' },
      gap: 14,
      footer: [link(btn('Check it'), 'processing'), center('Uses public posts from the last 5 years on included accounts', 'caption', 'text/tertiary')],
    },
    [
      text('3 accounts included', 'h2', 'text/primary', { w: 'fill' }),
      text('Confirmed and Likely accounts are analysed. Possible matches stay out unless you switch them on.', 'small', 'text/secondary', { w: 'fill' }),
      group(rows.concat([add]), 'Accounts', 64),
      note('info', 'We find linked accounts only through public links, like a link in bio or the same unique username.', 'neutral'),
    ],
  );
}

export function noMatch(): FrameNode {
  return screen(
    {
      name: 'No match found',
      nav: { title: 'Run a Gutchek', action: 'x', back: false },
      cross: 'center',
      gap: 18,
      pad: [40, 20, 24, 20],
      footer: [link(btn('Edit search'), 'search'), btn('Try another platform', 'Secondary')],
    },
    [
      heroIcon('search', 'neutral', 96),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [
        center('No public profile found', 'h2'),
        center("We couldn't find a public Instagram account for @tobi.adeyemii. It may be private, renamed or spelled differently.", 'body', 'text/secondary'),
      ]),
      col({ name: 'Tips', w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        text('Things to try', 'title', 'text/primary'),
        bullet('Check the spelling, including dots and underscores.'),
        bullet('Try a handle from another platform they use.'),
        bullet('Add their city to help us confirm the right person.'),
      ]),
      center("Your report credit hasn't been used.", 'caption', 'text/tertiary'),
    ],
  );
}

export function blocked(): FrameNode {
  return screen(
    {
      name: 'Search not available',
      nav: { title: 'Run a Gutchek', action: 'x', back: false },
      cross: 'center',
      gap: 18,
      pad: [40, 20, 24, 20],
      footer: [link(btn('Back to Home', 'Secondary'), 'home'), btn('Why some searches are limited', 'Tertiary')],
    },
    [
      heroIcon('ban', 'neutral', 96),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [
        center("This search isn't available", 'h2'),
        center("We can't run a Gutchek for this person. This happens when someone has opted out, may be under 18, or has been looked up too often.", 'body', 'text/secondary'),
      ]),
      note('shield-check', 'Limits like this protect everyone from Gutchek being used to stalk or harass. Your report credit has not been used.', 'brand'),
    ],
  );
}

export function paywall(): FrameNode {
  const base = newSearch();
  const opt = (title: string, detail: string, price: string, on: boolean) =>
    row({ name: title, w: 'fill', gap: 12, pad: 16, radius: 16, fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'border/focus' : 'border/default', strokeW: on ? 2 : 1 }, [
      box({ name: 'Radio', dir: 'h', w: 22, h: 22, radius: 11, stroke: on ? 'brand/fg' : 'border/strong', strokeW: on ? 6 : 1.5, fill: 'bg/surface' }, []),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary'), text(detail, 'small', 'text/secondary', { w: 'fill' })]),
      text(price, 'title', 'text/primary'),
    ]);
  return withSheet(
    base,
    "You're out of reports",
    [
      text('Your free report resets on 1 Nov. Need one sooner?', 'body', 'text/secondary', { w: 'fill' }),
      opt('One report', 'Full report, evidence and personality', '$2.99', true),
      opt('Gutchek Plus', '5 reports a month, notes and compare', '$7.99/mo', false),
      link(btn('Get 1 report · $2.99'), 'paymentSuccess'),
      link(btn('See all plans', 'Tertiary'), 'plans'),
    ],
    'Paywall · Out of reports',
  );
}

// ---------------------------------------------------------------- report extras

export function addNote(): FrameNode {
  const base = saved();
  return withSheet(
    base,
    'Private note',
    [
      row({ name: 'About', gap: 10 }, [avatar(tobi.initials, 32, tobi.tone), text('About ' + tobi.name, 'smallStrong', 'text/secondary')]),
      textArea('Note', 'Met at the Bolt hackathon. Seems kind; check the football threads before Saturday.', false, 132),
      row({ name: 'Privacy', gap: 8, w: 'fill' }, [icon('lock', 16, 'text/tertiary'), text('Only you can see notes. They are encrypted and never shared.', 'caption', 'text/tertiary', { w: 'fill' })]),
      link(btn('Save note'), 'saved'),
    ],
    'Saved · Private note',
  );
}

export function shareReport(): FrameNode {
  const base = viewport(report());
  const contact = (initials: string, name: string, tone: Tone, on: boolean) =>
    col({ name, gap: 6, cross: 'center', w: 'fill' }, [
      box({ name: 'Ring', dir: 'h', w: 60, h: 60, radius: 30, stroke: on ? 'brand/fg' : undefined, strokeW: 2, main: 'center', cross: 'center' }, [avatar(initials, 52, tone)]),
      text(name, 'label', on ? 'text/primary' : 'text/secondary'),
    ]);
  return withSheet(
    base,
    'Share with a trusted friend',
    [
      text('They get a read-only summary. Evidence excerpts stay private unless you include them.', 'small', 'text/secondary', { w: 'fill' }),
      row({ name: 'Contacts', gap: 8, w: 'fill' }, [
        contact('NK', 'Ngozi', 'positive', true),
        contact('IB', 'Ibrahim', 'warning', false),
        contact('TO', 'Tolu', 'brand', false),
        col({ name: 'Add', gap: 6, cross: 'center', w: 'fill' }, [box({ name: 'Plus', dir: 'h', w: 52, h: 52, radius: 26, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('plus', 22, 'text/secondary')]), text('Add', 'label', 'text/secondary')]),
      ]),
      group(
        [
          fill(use('ListRow', { Trailing: 'SwitchOff' }, { title: 'Include evidence excerpts' }, { hide: ['subtitle'], icons: { icon: 'file' } })),
          fill(use('ListRow', { Trailing: 'Value' }, { title: 'Link expires', value: '24 hours' }, { hide: ['subtitle'], icons: { icon: 'clock' } })),
        ],
        'Options',
      ),
      btn('Send to Ngozi', 'Primary', 'Large', 'share'),
      btn('Copy secure link', 'Secondary', 'Large', 'link'),
    ],
    'Report · Share',
  );
}

export function reportIssue(): FrameNode {
  return screen(
    {
      name: 'Report an issue',
      nav: { title: 'Report an issue', action: null, backTo: 'evidence' },
      gap: 16,
      footer: [link(btn('Send to our review team'), 'report')],
    },
    [
      text("What's wrong with this report?", 'h2', 'text/primary', { w: 'fill' }),
      radioGroup([
        { label: "This isn't the right person", detail: 'An account in the report belongs to someone else.', on: true },
        { label: 'A finding is wrong or out of context', detail: 'For example a quote, a lyric or a joke between friends.' },
        { label: 'Something important is missing' },
        { label: 'Something else' },
      ]),
      textArea('Tell us more (optional)', 'The X account @tobiadeyemi belongs to a different Tobi in Abuja.', false, 100),
      note('info', 'If you are the person in a report, use the public opt-out page at gutchek.app/optout instead.', 'neutral'),
    ],
  );
}

export function comparePicker(): FrameNode {
  const rowFor = (p: Person, on: boolean, disabled = false) =>
    row({ name: p.name, w: 'fill', gap: 12, pad: [14, 16], opacity: disabled ? 0.5 : 1 }, [
      avatar(p.initials, 44, p.tone),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(p.name, 'bodyStrong', 'text/primary'), text(disabled ? 'Low data, cannot be compared' : p.verdict, 'small', 'text/secondary', { w: 'fill' })]),
      box({ name: 'Checkbox', dir: 'h', w: 24, h: 24, radius: 7, fill: on ? 'brand/solid' : null, stroke: on ? undefined : 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, [on ? icon('check', 16, 'text/on-solid') : null]),
    ]);
  return screen(
    {
      name: 'Compare · Choose people',
      nav: { title: 'Compare', action: 'x', back: false },
      gap: 14,
      footer: [link(btn('Side by side', 'Primary', 'Large', 'columns'), 'compare')],
    },
    [
      text('Choose two people', 'h2', 'text/primary', { w: 'fill' }),
      text('Reports are compared on the same scoring version, category by category.', 'small', 'text/secondary', { w: 'fill' }),
      group([rowFor(people[0], true), rowFor(people[1], true), rowFor(people[2], false), rowFor(people[3], false, true)], 'People', 72),
    ],
  );
}

// ---------------------------------------------------------------- safety

export function shareSetup(): FrameNode {
  return screen(
    {
      name: 'Share my date · Set up',
      nav: { title: 'Share my date', action: null, backTo: 'safety' },
      gap: 14,
      footer: [link(btn('Tell a friend', 'Primary', 'Large', 'navigation'), 'shareLive')],
    },
    [
      text('Plan your date', 'h2', 'text/primary', { w: 'fill' }),
      fill(use('TextField', { State: 'Filled' }, { label: "Who you're meeting", value: 'Tobi Adeyemi' }, { show: ['leading'], icons: { leading: 'user' } })),
      fill(use('TextField', { State: 'Filled' }, { label: 'Where', value: 'Nok by Alara, Victoria Island' }, { show: ['leading'], icons: { leading: 'map-pin' } })),
      row({ name: 'When', gap: 12, w: 'fill' }, [
        fill(use('TextField', { State: 'Filled' }, { label: 'Date', value: 'Sat 25 Oct' }, { show: ['leading'], icons: { leading: 'calendar' } })),
        fill(use('TextField', { State: 'Filled' }, { label: 'Time', value: '19:30' }, { show: ['leading'], icons: { leading: 'clock' } })),
      ]),
      group([
        fill(use('ListRow', { Trailing: 'Value' }, { title: 'Check in every', value: '60 min' }, { hide: ['subtitle'], icons: { icon: 'bell' } })),
        fill(use('ListRow', { Trailing: 'SwitchOn' }, { title: 'Share live location', subtitle: 'Only during the date' }, { icons: { icon: 'navigation' } })),
      ]),
      col({ name: 'Share with', gap: 10, w: 'fill' }, [text('Share with', 'label', 'text/secondary'), row({ name: 'Chips', gap: 8 }, [chip('Ngozi', true), chip('Ibrahim'), chip('Add contact')])]),
    ],
  );
}

export function shareLive(): FrameNode {
  const map = box({ name: 'Map', dir: 'none', w: 353, h: 280, radius: 24, fill: 'bg/subtle', clip: true, stroke: 'border/default' });
  const road = (x: number, y: number, w: number, h: number) => {
    const r = box({ name: 'Road', dir: 'none', w, h, radius: 6, fill: 'bg/muted' });
    map.appendChild(r);
    r.x = x;
    r.y = y;
  };
  road(-20, 92, 420, 18);
  road(150, -20, 18, 340);
  road(-20, 200, 260, 14);
  road(250, 140, 140, 12);
  road(60, -10, 12, 120);
  const pulse = box({ name: 'Pulse', dir: 'none', w: 72, h: 72, radius: 36, fill: 'brand/fg', fillOpacity: 0.16 });
  map.appendChild(pulse);
  pulse.x = 123;
  pulse.y = 66;
  const pin = box({ name: 'Pin', dir: 'none', w: 22, h: 22, radius: 11, fill: 'brand/solid', stroke: 'bg/surface', strokeW: 3, strokeAlign: 'OUTSIDE' });
  map.appendChild(pin);
  pin.x = 148;
  pin.y = 91;
  const live = row({ name: 'Live pill', gap: 6, pad: [6, 12], radius: 999, fill: 'bg/raised', shadow: 'e2' }, [box({ name: 'Dot', w: 8, h: 8, radius: 4, fill: 'caution/fg', dir: 'h' }), text('Live · Ngozi can see you', 'label', 'text/primary')]);
  map.appendChild(live);
  live.x = 16;
  live.y = 16;
  return screen(
    {
      name: 'Share my date · Live',
      nav: { title: 'Sharing live', action: null, backTo: 'safety' },
      gap: 14,
      footer: [
        row({ name: 'Actions', gap: 12, w: 'fill' }, [btn("I'm safe", 'Primary', 'Large', 'check'), btn('Get help', 'Destructive', 'Large', 'phone')]),
        link(btn('Stop sharing', 'Tertiary'), 'safety'),
      ],
    },
    [
      map,
      col({ name: 'Check-in', w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        row({ name: 'Head', w: 'fill', gap: 8 }, [text('Next check-in', 'bodyStrong', 'text/primary', { w: 'fill' }), text('in 42 min', 'smallStrong', 'brand/fg')]),
        box({ name: 'Track', dir: 'h', w: 321, h: 6, radius: 3, fill: 'bg/muted' }, [box({ name: 'Bar', w: 96, h: 6, radius: 3, fill: 'brand/solid', dir: 'h' })]),
        text('At Nok by Alara with Tobi Adeyemi · started 19:32', 'small', 'text/secondary', { w: 'fill' }),
      ]),
      note('info', 'If you miss a check-in, Ngozi gets your last location and a prompt to call you.', 'neutral'),
    ],
  );
}

export function trustedContacts(): FrameNode {
  const person = (initials: string, name: string, phone: string, tone: Tone, primary = false) =>
    row({ name, w: 'fill', gap: 12, pad: [14, 16] }, [
      avatar(initials, 44, tone),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(name, 'bodyStrong', 'text/primary'), text(phone, 'small', 'text/secondary')]),
      primary ? pill('Primary', 'brand') : icon('chevron-right', 20, 'text/tertiary'),
    ]);
  return screen(
    {
      name: 'Trusted contacts',
      nav: { title: 'Trusted contacts', action: 'plus', backTo: 'safety' },
      gap: 14,
      footer: [btn('Add a contact', 'Secondary', 'Large', 'plus')],
    },
    [
      text('People who can see your live location during Share my date and get alerts if you miss a check-in.', 'small', 'text/secondary', { w: 'fill' }),
      group([person('NK', 'Ngozi Kalu', '+234 802 555 0187', 'positive', true), person('IB', 'Ibrahim Bello', '+234 809 555 0133', 'warning'), person('TO', 'Tolu Ogun', '+234 701 555 0164', 'brand')], 'Contacts', 72),
      note('lock', "Contacts only hear from Gutchek when you share with them. They never see your reports.", 'neutral'),
    ],
  );
}

export function resources(): FrameNode {
  return screen(
    { name: 'Support resources', nav: { title: 'Support', action: 'globe', backTo: 'safety' }, gap: 12 },
    [
      fill(use('TextField', { State: 'Default' }, { value: 'Search support' }, { hide: ['label'], show: ['leading'], icons: { leading: 'search' } })),
      row({ name: 'Region', gap: 8 }, [chip('Nigeria', true), chip('Ghana'), chip('UK'), chip('US')]),
      groupTitle('Emergency'),
      group([fill(use('ListRow', { Trailing: 'Value' }, { title: 'Emergency services', subtitle: 'Police, fire, ambulance', value: '112' }, { icons: { icon: 'phone' } }))]),
      groupTitle('After sexual violence'),
      group([
        fill(use('ListRow', { Trailing: 'Chevron' }, { title: 'Sexual assault referral centre', subtitle: 'Free medical care and counselling' }, { icons: { icon: 'life-buoy' } })),
        fill(use('ListRow', { Trailing: 'Chevron' }, { title: 'Report to the police', subtitle: 'What to expect and what to bring' }, { icons: { icon: 'shield' } })),
      ]),
      groupTitle('Talk to someone'),
      group([
        fill(use('ListRow', { Trailing: 'Chevron' }, { title: 'Domestic violence helpline', subtitle: 'Confidential, 24 hours' }, { icons: { icon: 'phone' } })),
        fill(use('ListRow', { Trailing: 'Chevron' }, { title: 'Chat with a trained listener', subtitle: 'Mental health support' }, { icons: { icon: 'message' } })),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- settings

export function account(): FrameNode {
  return screen(
    {
      name: 'Account',
      nav: { title: 'Account', action: null, backTo: 'settings' },
      gap: 14,
      footer: [btn('Save changes')],
    },
    [
      col({ name: 'Photo', gap: 8, w: 'fill', cross: 'center' }, [avatar('AO', 80, 'brand'), text('Change photo', 'smallStrong', 'brand/fg')]),
      fill(use('TextField', { State: 'Filled' }, { label: 'Full name', value: 'Ada Okonkwo' })),
      fill(use('TextField', { State: 'Filled' }, { label: 'Email', value: 'ada@okonkwo.com' })),
      fill(use('TextField', { State: 'Filled' }, { label: 'Phone', value: '803 555 0142', prefix: '+234' }, { show: ['prefix'] })),
      group([
        fill(use('ListRow', { Trailing: 'Value' }, { title: 'Identity', value: 'Verified' }, { hide: ['subtitle'], icons: { icon: 'shield-check' } })),
        fill(use('ListRow', { Trailing: 'Value' }, { title: 'Sign-in methods', value: 'Phone, Apple' }, { hide: ['subtitle'], icons: { icon: 'lock' } })),
      ]),
    ],
  );
}

export function history(): FrameNode {
  const item = (p: Person, date: string, status: string, tone: Tone) =>
    row({ name: p.name, w: 'fill', gap: 12, pad: [14, 16] }, [
      avatar(p.initials, 40, p.tone),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(p.name, 'bodyStrong', 'text/primary'), text(date, 'small', 'text/secondary')]),
      pill(status, tone),
    ]);
  return screen(
    {
      name: 'Search history',
      nav: { title: 'Search history', action: 'trash', backTo: 'settings' },
      gap: 12,
      footer: [btn('Clear all history', 'Secondary', 'Large', 'trash')],
    },
    [
      note('lock', 'Your searches are private to you and auto-delete after 90 days. The people you look up are never notified.', 'brand'),
      groupTitle('October'),
      group([item(people[0], '22 Oct · Instagram', 'Saved', 'positive'), item(people[1], '19 Oct · TikTok', 'Saved', 'positive'), item(people[3], '8 Oct · Instagram', 'Low data', 'neutral')], 'October', 68),
      groupTitle('September'),
      group([item(people[2], '29 Sep · X', 'Saved', 'positive')], 'September', 68),
    ],
  );
}

export function notifSettings(): FrameNode {
  const sw = (title: string, subtitle: string | null, iconName: string, on: boolean) =>
    fill(use('ListRow', { Trailing: on ? 'SwitchOn' : 'SwitchOff' }, subtitle ? { title, subtitle } : { title }, { hide: subtitle ? [] : ['subtitle'], icons: { icon: iconName } }));
  return screen(
    { name: 'Notification settings', nav: { title: 'Notifications', action: null, backTo: 'settings' }, gap: 12 },
    [
      groupTitle('Reports'),
      group([sw('Report ready', null, 'file', true), sw('Report changes', 'Monitoring alerts · Pro', 'trending-up', false)]),
      groupTitle('Safety'),
      group([sw('Share my date check-ins', 'Always on while sharing', 'navigation', true), sw('Safety tips', 'One a week at most', 'life-buoy', true)]),
      groupTitle('Account'),
      group([sw('Plan and billing', null, 'card', true), sw('Product news', null, 'sparkle', false)]),
    ],
  );
}

export function help(): FrameNode {
  const q = (title: string) => fill(use('ListRow', { Trailing: 'Chevron' }, { title }, { hide: ['subtitle'], icons: { icon: 'help' } }));
  return screen(
    { name: 'Help', nav: { title: 'Help', action: null, backTo: 'settings' }, gap: 12 },
    [
      fill(use('TextField', { State: 'Default' }, { value: 'Search help articles' }, { hide: ['label'], show: ['leading'], icons: { leading: 'search' } })),
      groupTitle('Popular questions'),
      group([q('How does the Gut Meter work?'), q("Why can't I find someone?"), q('Who can see my searches?'), q('How do I cancel my plan?')]),
      groupTitle('Get in touch'),
      group([
        fill(use('ListRow', { Trailing: 'Chevron' }, { title: 'Chat with support', subtitle: 'Typically replies in under an hour' }, { icons: { icon: 'message' } })),
        fill(use('ListRow', { Trailing: 'Value' }, { title: 'Email us', value: 'support@gutchek.app' }, { hide: ['subtitle'], icons: { icon: 'mail' } })),
      ]),
      row({ name: 'Safety concern', w: 'fill', gap: 12, pad: 16, radius: 16, fill: 'caution/subtle', cross: 'start' }, [
        icon('alert-triangle', 20, 'caution/fg'),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('In danger right now?', 'bodyStrong', 'text/primary'), text('Call 112, or open the Stay Safe hub for local support lines.', 'small', 'text/secondary', { w: 'fill' })]),
      ]),
    ],
  );
}

export function paymentSuccess(): FrameNode {
  const line = (k: string, v: string) => row({ name: k, w: 'fill', gap: 12, pad: [12, 0] }, [text(k, 'small', 'text/secondary', { w: 'fill' }), text(v, 'smallStrong', 'text/primary')]);
  return screen(
    {
      name: 'Payment success',
      cross: 'center',
      gap: 20,
      pad: [56, 20, 24, 20],
      footer: [link(btn('Run a Gutchek', 'Primary', 'Large', 'plus'), 'search'), link(btn('Done', 'Tertiary'), 'home')],
    },
    [
      heroIcon('check-circle', 'positive', 104),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [center("You're on Gutchek Plus", 'h1'), center('5 full reports a month, the evidence viewer, personality snapshots and private notes.', 'body', 'text/secondary')]),
      col({ name: 'Receipt', w: 'fill', pad: [8, 16], radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        line('Plan', 'Gutchek Plus, monthly'),
        divider(),
        line('Charged today', '$7.99'),
        divider(),
        line('Next payment', '22 Nov 2026'),
        divider(),
        line('Reports left', '5 of 5'),
      ]),
    ],
  );
}
