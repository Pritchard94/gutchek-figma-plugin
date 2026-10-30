import { Token } from '../tokens';
import { avatar, box, col, fill, icon, paint, pill, rect, row, text } from '../core/ui';
import { btn, center, chip, group, groupTitle, iconTile, link, listRow, note, screen, surface, use, withDialog } from './kit';
import { seun, tobi, user } from './data';
import { modeOption } from '../components/appearance';

// ---------------------------------------------------------------- personality

export function personality(): FrameNode {
  const traits: Array<[string, string, string, string]> = [
    ['Tone', 'Warm', '4', 'High confidence · 214 posts'],
    ['Humour', 'Playful, some sarcasm', '3', 'High confidence · 96 posts'],
    ['Empathy cues', 'Frequent', '4', 'Medium confidence · 41 posts'],
    ['Conflict style', 'Calm, curt in sport debates', '3', 'Medium confidence · 18 threads'],
    ['How he talks about women and exes', 'Respectful', '4', 'Medium confidence · 12 posts'],
    ['Openness', 'Open to other views', '4', 'Medium confidence · 30 posts'],
    ['Consistency across platforms', 'Consistent', '5', 'High confidence · 3 platforms'],
  ];
  const bars: SceneNode[] = traits.map(([label, value, level, noteText]) => fill(use('TraitBar', { Level: level }, { label, value, note: noteText })));
  const prompt = (str: string) => row({ name: 'Prompt', gap: 10, w: 'fill', cross: 'start' }, [icon('message', 18, 'brand/fg'), text(str, 'small', 'text/primary', { w: 'fill' })]);
  return screen(
    { name: 'Personality', nav: { title: 'Personality', action: 'info', backTo: 'report' }, tall: true, gap: 20 },
    [
      col({ name: 'Intro', gap: 6, w: 'fill' }, [
        text('How ' + tobi.first + ' communicates online', 'h2', 'text/primary', { w: 'fill' }),
        text('An observation of public online behaviour, not a diagnosis.', 'small', 'text/secondary', { w: 'fill' }),
      ]),
      surface(
        [
          text('Snapshot', 'overline', 'brand/fg'),
          text(
            'Tobi comes across as warm and playful, with quick humour that sometimes turns sarcastic in sports debates. He is consistently respectful about women and former partners, apologises when he gets things wrong, and returns often to community and craft.',
            'body',
            'text/primary',
            { w: 'fill' },
          ),
        ],
        'Narrative',
        20,
      ),
      col({ name: 'Traits', w: 'fill', pad: 20, gap: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, bars),
      col({ name: 'Themes', gap: 10, w: 'fill' }, [
        text('Interests and values themes', 'title', 'text/primary'),
        row({ name: 'Chips', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, ['Design', 'Football', 'Cooking', 'Volunteering', 'Tech meetups'].map((c) => chip(c))),
      ]),
      surface(
        [
          text('What this might mean in a relationship', 'title', 'text/primary'),
          prompt('Playful sarcasm can be fun. Notice how it lands when you push back.'),
          prompt('He talks a lot about community. Ask what he is involved in right now.'),
          prompt('Sports debates get heated. Worth seeing how disagreement feels in person.'),
        ],
        'Prompts',
        20,
      ),
      note('info', 'Based on limited public content. People are more than their posts.', 'neutral'),
    ],
  );
}

// ---------------------------------------------------------------- compare

export function compare(): FrameNode {
  const head = (p: typeof tobi) =>
    col({ name: p.first, gap: 8, w: 'fill', cross: 'center', pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
      avatar(p.initials, 56, p.tone),
      center(p.name, 'title'),
      row({ name: 'Scores', gap: 16 }, [
        col({ name: 'Caution', gap: 0, cross: 'center' }, [text(String(p.caution), { family: 'display', weight: 800, size: 32, line: 36 }, 'caution/fg'), text('Caution', 'caption', 'text/secondary')]),
        col({ name: 'Positive', gap: 0, cross: 'center' }, [text(String(p.positive), { family: 'display', weight: 800, size: 32, line: 36 }, 'positive/fg'), text('Positive', 'caption', 'text/secondary')]),
      ]),
      use('ConfidenceBadge', { Level: p.confidence }),
    ]);
  const bar = (value: number, token: Token) =>
    row({ name: 'Value', gap: 8, w: 'fill' }, [
      box({ name: 'Track', dir: 'h', w: 120, h: 6, radius: 3, fill: 'bg/muted' }, [rect(Math.max(4, Math.round(12 * value)), 6, token, 3, 'Bar')]),
      text(String(value), 'smallStrong', 'text/primary'),
    ]);
  const cat = (label: string, side: 'caution' | 'positive', a: number, b: number) => {
    const token: Token = side === 'caution' ? 'caution/fg' : 'positive/fg';
    return col({ name: label, gap: 8, w: 'fill', pad: [14, 16] }, [
      row({ name: 'Label', gap: 8, w: 'fill' }, [icon(side === 'caution' ? 'alert-triangle' : 'check-circle', 16, token), text(label, 'smallStrong', 'text/primary', { w: 'fill' })]),
      row({ name: 'Bars', gap: 16, w: 'fill' }, [bar(a, token), bar(b, token)]),
    ]);
  };
  return screen(
    { name: 'Compare', nav: { title: 'Compare', action: 'share', backTo: 'saved' }, tall: true, gap: 16 },
    [
      row({ name: 'People', gap: 12, w: 'fill', cross: 'start' }, [head(tobi), head(seun)]),
      group(
        [
          cat('Respect toward women', 'positive', 8, 6),
          cat('Community involvement', 'positive', 7, 4),
          cat('Consistency across platforms', 'positive', 9, 6),
          cat('Harassment and hostility', 'caution', 3, 4),
          cat('Deception signals', 'caution', 1, 3),
        ],
        'Categories',
        16,
      ),
      note('info', 'Both reports use scoring version 1.3. Seun has less public data, so differences are less certain.', 'neutral'),
    ],
  );
}

// ---------------------------------------------------------------- safety

function ringed(a: FrameNode): FrameNode {
  a.strokes = [paint('brand/subtle')];
  a.strokeWeight = 2;
  a.strokeAlign = 'OUTSIDE';
  return a;
}

export function safety(): FrameNode {
  const item = (done: boolean, label: string) =>
    row({ name: label, gap: 12, w: 'fill', pad: [12, 16] }, [
      box({ name: 'Checkbox', dir: 'h', w: 22, h: 22, radius: 6, fill: done ? 'positive/solid' : null, stroke: done ? undefined : 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, [
        done ? icon('check', 14, 'text/on-solid') : null,
      ]),
      text(label, 'body', done ? 'text/secondary' : 'text/primary', { w: 'fill' }),
    ]);
  const share = col({ name: 'Share my date', w: 'fill', pad: 20, gap: 14, radius: 20, fill: 'brand/subtle' }, [
    row({ name: 'Head', gap: 12, w: 'fill' }, [
      iconTile('navigation', 'brand', 40),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text('Share my date', 'title', 'text/primary'), text('Send plans and live location to a trusted contact.', 'small', 'text/secondary', { w: 'fill' })]),
    ]),
    row({ name: 'Bottom', gap: 12, w: 'fill' }, [
      row({ name: 'Contacts', gap: -8 }, [ringed(avatar('NK', 32, 'positive')), ringed(avatar('IB', 32, 'warning'))]),
      link(text('2 trusted contacts', 'small', 'text/secondary', { w: 'fill' }), 'trustedContacts'),
      link(btn('Tell a friend', 'Primary', 'Small', undefined, false), 'shareSetup'),
    ]),
  ]);
  return screen(
    { name: 'Stay Safe', tab: 'Stay Safe', nav: { type: 'Large', title: 'Stay Safe', action: 'life-buoy', actionTo: 'resources' }, gap: 20 },
    [
      share,
      col({ name: 'Checklist', gap: 10, w: 'fill' }, [
        row({ name: 'Head', gap: 8, w: 'fill' }, [text('First-date checklist', 'h3', 'text/primary', { w: 'fill' }), text('3 of 6', 'smallStrong', 'positive/fg')]),
        box({ name: 'Progress', dir: 'h', w: 353, h: 6, radius: 3, fill: 'bg/muted' }, [rect(176, 6, 'positive/solid', 3, 'Bar')]),
        group([
          item(true, 'Meet somewhere public'),
          item(true, "Tell a friend where you'll be"),
          item(true, 'Arrange your own transport'),
          item(false, 'Keep your drink with you'),
          item(false, 'Agree a check-in time'),
          item(false, 'Trust your gut. You can leave anytime.'),
        ], 'Checklist items', 50),
      ]),
      col({ name: 'Support', gap: 10, w: 'fill' }, [
        groupTitle('Support'),
        link(
          group([
            listRow('Emergency services', 'Nigeria', 'phone', 'Value', '112'),
            listRow('Sexual assault referral centre', 'Free and confidential', 'life-buoy'),
            listRow('Talk to someone now', 'Chat with a trained listener', 'message'),
          ]),
          'resources',
        ),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- settings

export function settings(): FrameNode {
  const plan = row({ name: 'Plan', w: 'fill', pad: 16, gap: 12, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    iconTile('star', 'brand', 40),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text('Gutchek Plus', 'bodyStrong', 'text/primary'), text('3 of 5 reports left · renews 1 Nov', 'small', 'text/secondary', { w: 'fill' })]),
    btn('Manage', 'Secondary', 'Small', undefined, false),
  ]);
  link(plan, 'plans');
  const del = listRow('Delete my data', 'Account, reports and history', 'trash');
  link(del, 'deleteData');
  return screen(
    { name: 'Me', tab: 'Me', nav: { type: 'Large', title: 'Me', action: null }, gap: 16 },
    [
      link(
        row({ name: 'Profile', w: 'fill', gap: 14 }, [
          avatar(user.initials, 56, 'brand'),
          col({ name: 'Text', gap: 2, w: 'fill' }, [text(user.name, 'h3', 'text/primary'), text(user.email, 'small', 'text/secondary')]),
          pill('Verified', 'positive', 'shield-check'),
        ]),
        'account',
      ),
      plan,
      groupTitle('Privacy'),
      group([
        link(listRow('App lock', 'Face ID to open Gutchek', 'face-id', 'SwitchOn'), 'appLocked'),
        link(listRow('Notes settings', 'Lock Notes, reminders, export', 'notebook-pen'), 'notesSettings'),
        link(listRow('Search history', null, 'clock', 'Value', '12'), 'history'),
        del,
      ]),
      groupTitle('Display'),
      group([link(listRow('Appearance', null, 'moon', 'Value', 'System'), 'appearance')]),
      groupTitle('Notifications'),
      link(group([listRow('Report ready', null, 'bell', 'SwitchOn'), listRow('Report changes', 'Monitoring alerts · Pro', 'trending-up', 'SwitchOff')]), 'notifSettings'),
      groupTitle('Support and legal'),
      group([link(listRow('Help and support', null, 'help'), 'help'), listRow('Terms and privacy', null, 'file'), listRow('Public opt-out page', null, 'globe')]),
    ],
  );
}

export function appearance(): FrameNode {
  return screen(
    { name: 'Appearance', nav: { title: 'Appearance', action: null, backTo: 'settings' }, gap: 16 },
    [
      text('Choose how Gutchek looks', 'h2', 'text/primary', { w: 'fill' }),
      text('System matches your phone, including automatic switching at sunset.', 'small', 'text/secondary', { w: 'fill' }),
      row({ name: 'Options', gap: 10, w: 'fill', cross: 'start' }, [modeOption('system', true, 111, 150), modeOption('light', false, 111, 150), modeOption('dark', false, 111, 150)]),
      group([
        fill(use('ListRow', { Trailing: 'SwitchOn' }, { title: 'Chat wallpaper', subtitle: 'Doodles behind Rooms messages' }, { icons: { icon: 'sparkle' } })),
        fill(use('ListRow', { Trailing: 'SwitchOff' }, { title: 'Dim wallpaper in dark mode', subtitle: 'Lower contrast at night' }, { icons: { icon: 'moon' } })),
      ]),
      note('info', 'Scores, signals and evidence look the same in every mode. Colours always come with icons and labels.', 'neutral'),
    ],
  );
}

export function plans(): FrameNode {
  const planCard = (name: string, price: string, per: string, desc: string, selected = false, badge?: string) =>
    row({ name, w: 'fill', pad: 16, gap: 14, radius: 16, fill: selected ? 'brand/subtle' : 'bg/surface', stroke: selected ? 'border/focus' : 'border/default', strokeW: selected ? 2 : 1, cross: 'start' }, [
      box({ name: 'Radio', dir: 'h', w: 22, h: 22, radius: 11, stroke: selected ? 'brand/fg' : 'border/strong', strokeW: selected ? 6 : 1.5, fill: 'bg/surface' }, []),
      col({ name: 'Text', gap: 4, w: 'fill' }, [
        row({ name: 'Name', gap: 8 }, [text(name, 'bodyStrong', 'text/primary'), badge ? pill(badge, 'brand') : null]),
        text(desc, 'small', 'text/secondary', { w: 'fill' }),
      ]),
      col({ name: 'Price', gap: 0, cross: 'end' }, [text(price, 'title', 'text/primary'), text(per, 'caption', 'text/tertiary')]),
    ]);
  return screen(
    {
      name: 'Plans',
      nav: { title: 'Plans', action: 'x', back: false },
      gap: 12,
      footer: [link(btn('Go Plus'), 'paymentSuccess'), center('Billed monthly through the App Store. Cancel anytime.', 'caption', 'text/tertiary')],
    },
    [
      text('Choose your plan', 'h2', 'text/primary', { w: 'fill' }),
      text('Every plan includes evidence links, confidence levels and the Stay Safe hub.', 'small', 'text/secondary', { w: 'fill' }),
      planCard('Free', '$0', 'month', '1 lite report a month: scores and summary.'),
      planCard('Gutchek Plus', '$7.99', 'month', '5 full reports, evidence viewer, personality and notes.', true, 'Most popular'),
      planCard('Gutchek Pro', '$14.99', 'month', '15 reports, monitoring alerts, compare and PDF export.'),
      planCard('Pay per report', '$2.99', 'report', 'For occasional checks. Card, Paystack or Flutterwave.'),
    ],
  );
}

export function deleteData(): FrameNode {
  const base = settings();
  const dialog = col({ name: 'Dialog', w: 337, pad: 24, gap: 16, radius: 24, fill: 'bg/raised', shadow: 'e3' }, [
    iconTile('trash', 'caution', 48),
    text('Delete your account and data?', 'h3', 'text/primary', { w: 'fill' }),
    text("This permanently deletes your account, saved reports, notes and search history within 30 days. This can't be undone.", 'small', 'text/secondary', { w: 'fill' }),
    col({ name: 'Actions', gap: 10, w: 'fill' }, [btn('Delete everything', 'Destructive'), btn('Keep my account', 'Secondary')]),
  ]);
  return withDialog(base, dialog, 'Settings · Delete data');
}
