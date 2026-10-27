import { Tone, avatar, box, col, divider, fill, icon, pill, rect, row, text } from '../core/ui';
import { use } from '../components/library';
import { user } from '../screens/data';
import { alink, appFrame, btn, card, field, iconTileW, kv, modal, table } from './shell';
import { planCard } from '../web/landing';
import { modeOption } from '../components/appearance';

// ---------------------------------------------------------------- safety

export function wSafety(): FrameNode {
  const item = (done: boolean, label: string) =>
    row({ name: label, w: 'fill', gap: 12, pad: [10, 0] }, [
      box({ name: 'Checkbox', dir: 'h', w: 22, h: 22, radius: 6, fill: done ? 'positive/solid' : null, stroke: done ? undefined : 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, [done ? icon('check', 14, 'text/on-solid') : null]),
      text(label, 'body', done ? 'text/secondary' : 'text/primary', { w: 'fill' }),
    ]);
  const contact = (initials: string, name: string, phone: string, tone: Tone, primary = false) =>
    row({ name, w: 'fill', gap: 12, pad: [8, 0] }, [avatar(initials, 40, tone), col({ name: 'Text', gap: 0, w: 'fill' }, [text(name, 'smallStrong', 'text/primary'), text(phone, 'caption', 'text/tertiary')]), primary ? pill('Primary', 'brand') : icon('more', 18, 'text/tertiary')]);
  const line = (iconName: string, title: string, sub: string, value?: string) =>
    row({ name: title, w: 'fill', gap: 12, pad: [10, 0] }, [iconTileW(iconName, 'neutral', 36), col({ name: 'Text', gap: 0, w: 'fill' }, [text(title, 'smallStrong', 'text/primary'), text(sub, 'caption', 'text/tertiary')]), value ? text(value, 'h3', 'text/primary') : icon('chevron-right', 18, 'text/tertiary')]);
  return appFrame({ name: 'Stay Safe', active: 'wSafety', title: 'Stay Safe', actions: [btn('Call 112', 'Destructive', 'Medium', 'phone')] }, [
    row({ name: 'Top', w: 'fill', gap: 24, cross: 'start' }, [
      card('Share my date', [
        text('Send your plans and live location to a trusted contact, with check-ins that escalate if you miss one.', 'small', 'text/secondary', { w: 'fill' }),
        row({ name: 'Who', gap: 16, w: 'fill' }, [field("Who you're meeting", 'Tobi Adeyemi', 'Filled', { leading: 'user' }), field('Where', 'Nok by Alara, Victoria Island', 'Filled', { leading: 'map-pin' })]),
        row({ name: 'When', gap: 16, w: 'fill' }, [field('Date', 'Sat 25 Oct', 'Filled', { leading: 'calendar' }), field('Time', '19:30', 'Filled', { leading: 'clock' }), field('Check in every', '60 min', 'Filled', { trailing: 'chevron-down' })]),
        row({ name: 'Share with', gap: 8, w: 'fill' }, [text('Share with', 'label', 'text/secondary'), use('Chip', { Selected: 'On' }, { label: 'Ngozi' }), use('Chip', { Selected: 'Off' }, { label: 'Ibrahim' }), box({ name: 'Spacer', w: 'fill', h: 1 }), btn('Tell a friend', 'Primary', 'Medium', 'navigation')]),
      ], { pad: 28 }),
      card('First-date checklist', [
        row({ name: 'Progress', gap: 8, w: 'fill' }, [box({ name: 'Track', dir: 'h', w: 'fill', h: 6, radius: 3, fill: 'bg/muted' }, [rect(140, 6, 'positive/solid', 3, 'Bar')]), text('3 of 6', 'smallStrong', 'positive/fg')]),
        item(true, 'Meet somewhere public'),
        item(true, "Tell a friend where you'll be"),
        item(true, 'Arrange your own transport'),
        item(false, 'Keep your drink with you'),
        item(false, 'Agree a check-in time'),
        item(false, 'Trust your gut. You can leave anytime.'),
      ], { w: 380 }),
    ]),
    row({ name: 'Bottom', w: 'fill', gap: 24, cross: 'start' }, [
      card('Trusted contacts', [contact('NK', 'Ngozi Kalu', '+234 802 555 0187', 'positive', true), contact('IB', 'Ibrahim Bello', '+234 809 555 0133', 'warning'), contact('TO', 'Tolu Ogun', '+234 701 555 0164', 'brand'), btn('Add a contact', 'Secondary', 'Medium', 'plus')], { action: 'Manage' }),
      card('Support lines · Nigeria', [line('phone', 'Emergency services', 'Police, fire, ambulance', '112'), line('life-buoy', 'Sexual assault referral centre', 'Free medical care and counselling'), line('phone', 'Domestic violence helpline', 'Confidential, 24 hours'), line('message', 'Chat with a trained listener', 'Mental health support')], { action: 'Change region' }),
    ]),
  ]);
}

// ---------------------------------------------------------------- settings

const SETTINGS_NAV: Array<[string, string, string]> = [
  ['user', 'Account', 'wSettings'],
  ['lock', 'Privacy and data', 'wSettings'],
  ['bell', 'Notifications', 'wSettings'],
  ['card', 'Plan and billing', 'wBilling'],
  ['clock', 'Search history', 'wSettings'],
  ['shield', 'Room standing', 'wRooms'],
];

function settingsNav(active: string): FrameNode {
  return col(
    { name: 'Settings nav', w: 240, gap: 2, pad: 8, radius: 16, fill: 'bg/surface', stroke: 'border/default' },
    SETTINGS_NAV.map(([i, l, to]) => {
      const on = l === active;
      return alink(row({ name: l, w: 'fill', gap: 10, pad: [10, 12], radius: 10, fill: on ? 'brand/subtle' : null }, [icon(i, 18, on ? 'brand/fg' : 'text/secondary'), text(l, on ? 'smallStrong' : 'small', on ? 'brand/on-subtle' : 'text/primary')]), to);
    }),
  );
}

function toggle(title: string, sub: string, on: boolean): FrameNode {
  return row({ name: title, w: 'fill', gap: 16, pad: [12, 0] }, [col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary'), text(sub, 'small', 'text/secondary', { w: 'fill' })]), use('Switch', { State: on ? 'On' : 'Off' })]);
}

export function wSettings(): FrameNode {
  return appFrame({ name: 'Settings', active: 'wSettings', title: 'Settings' }, [
    row({ name: 'Layout', w: 'fill', gap: 24, cross: 'start' }, [
      settingsNav('Account'),
      col({ name: 'Panels', w: 'fill', gap: 20 }, [
        card('Account', [
          row({ name: 'Photo', gap: 16, w: 'fill' }, [avatar(user.initials, 64, 'brand'), col({ name: 'Text', gap: 4, w: 'fill' }, [text(user.name, 'h3', 'text/primary'), row({ name: 'Badges', gap: 8 }, [pill('Identity verified', 'positive', 'shield-check'), pill('18+', 'neutral')])]), btn('Change photo', 'Secondary', 'Small')]),
          row({ name: 'Fields', gap: 16, w: 'fill' }, [field('Full name', user.name), field('Email', user.email)]),
          row({ name: 'Fields 2', gap: 16, w: 'fill' }, [field('Phone', '803 555 0142', 'Filled', { prefix: '+234' }), field('Sign-in methods', 'Phone, Apple', 'Filled', { trailing: 'chevron-down' })]),
        ], { action: 'Save changes' }),
        card('Appearance', [
          text('System follows your computer, including automatic switching at sunset. You can also switch from the sidebar.', 'small', 'text/secondary', { w: 'fill' }),
          row({ name: 'Options', gap: 24, w: 'fill', cross: 'start' }, [modeOption('system', true, 256, 140, 'desktop'), modeOption('light', false, 256, 140, 'desktop'), modeOption('dark', false, 256, 140, 'desktop')]),
        ]),
        card('Privacy and security', [
          toggle('Lock Gutchek with a passkey', 'Required on this browser after 15 minutes away.', true),
          divider(),
          toggle('Auto-delete search history', 'Searches are removed after 90 days.', true),
          divider(),
          toggle('Monitoring alerts', 'Tell me when new public posts change a saved report. Pro.', false),
          divider(),
          row({ name: 'Danger', w: 'fill', gap: 16, pad: [12, 0] }, [col({ name: 'Text', gap: 2, w: 'fill' }, [text('Delete account and data', 'bodyStrong', 'caution/fg'), text('Reports, notes, chat checks and history, within 30 days.', 'small', 'text/secondary')]), alink(btn('Delete account', 'Destructive', 'Small'), 'wDelete')]),
        ]),
      ]),
    ]),
  ]);
}

export function wDelete(): FrameNode {
  const dialog = col({ name: 'Dialog', w: 480, gap: 16, pad: 32, radius: 28, fill: 'bg/raised', shadow: 'e3' }, [
    iconTileW('trash', 'caution', 52),
    text('Delete your account and data?', 'h2', 'text/primary', { w: 'fill' }),
    text("This permanently deletes your account, saved reports, notes, chat checks and search history within 30 days. This can't be undone.", 'body', 'text/secondary', { w: 'fill' }),
    field('Type DELETE to confirm', 'DELETE', 'Focused'),
    row({ name: 'Actions', gap: 12, w: 'fill' }, [alink(fill(use('Button', { Variant: 'Secondary', Size: 'Large' }, { label: 'Keep my account' })), 'wSettings'), fill(use('Button', { Variant: 'Destructive', Size: 'Large' }, { label: 'Delete everything' }))]),
  ]);
  return modal(wSettings(), dialog, 'Settings · Delete account');
}

export function wBilling(): FrameNode {
  return appFrame({ name: 'Plan and billing', active: 'wSettings', title: 'Settings', crumb: 'Settings / Plan and billing' }, [
    row({ name: 'Layout', w: 'fill', gap: 24, cross: 'start' }, [
      settingsNav('Plan and billing'),
      col({ name: 'Panels', w: 'fill', gap: 20 }, [
        row({ name: 'Current', w: 'fill', gap: 16, pad: 24, radius: 20, fill: 'brand/subtle', stroke: 'brand/border' }, [
          iconTileW('star', 'brand', 48),
          col({ name: 'Text', gap: 2, w: 'fill' }, [text('Gutchek Plus · $7.99 a month', 'h3', 'text/primary'), text('3 of 5 reports left, chat checks count as reports · renews 1 Nov', 'small', 'text/secondary')]),
          btn('Cancel plan', 'Tertiary', 'Small'),
        ]),
        row({ name: 'Plans', w: 'fill', gap: 16, cross: 'start' }, [
          planCard('Free', '$0', 'per month', ['1 lite report a month', '1 chat check a month', 'Gists and Stay Safe'], false, 'Downgrade'),
          planCard('Gutchek Plus', '$7.99', 'per month', ['5 full reports', 'Evidence and personality', 'Private notes'], true, 'Current plan'),
          planCard('Gutchek Pro', '$14.99', 'per month', ['15 reports', 'Monitoring and compare', 'PDF export'], false, 'Go Pro'),
        ]),
        card('Invoices', [
          table(
            [
              { label: 'Date', w: 160 },
              { label: 'Description', w: 'fill' },
              { label: 'Method', w: 160 },
              { label: 'Amount', w: 100 },
              { label: '', w: 100 },
            ],
            [
              [text('1 Oct 2026', 'small', 'text/primary'), text('Gutchek Plus · monthly', 'small', 'text/primary'), text('Paystack · card 4242', 'small', 'text/secondary'), text('$7.99', 'smallStrong', 'text/primary'), text('Download', 'smallStrong', 'brand/fg')],
              [text('14 Sep 2026', 'small', 'text/primary'), text('One report', 'small', 'text/primary'), text('Flutterwave · bank', 'small', 'text/secondary'), text('$2.99', 'smallStrong', 'text/primary'), text('Download', 'smallStrong', 'brand/fg')],
              [text('1 Sep 2026', 'small', 'text/primary'), text('Gutchek Plus · monthly', 'small', 'text/secondary'), text('Paystack · card 4242', 'small', 'text/secondary'), text('$7.99', 'smallStrong', 'text/primary'), text('Download', 'smallStrong', 'brand/fg')],
            ],
          ),
          kv('Payment method', 'Visa ending 4242 · Paystack'),
        ]),
      ]),
    ]),
  ]);
}
