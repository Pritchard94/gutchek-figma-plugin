import { box, col, fill, icon, row, text, divider } from '../core/ui';
import { lockup } from '../brand';
import { btn, center, field, link, listRow, note, screen, use } from './kit';
import { user } from './data';

export function welcome(): FrameNode {
  const hero = box({ name: 'Hero', dir: 'v', w: 'fill', h: 260, radius: 32, fill: 'brand/subtle', main: 'center', cross: 'center', gap: 0 }, [use('GutMeter', { Tilt: 'Positive' })]);
  return screen(
    {
      name: 'Welcome',
      pad: [16, 20, 0, 20],
      gap: 24,
      cross: 'center',
      footer: [
        link(btn('Get started'), 'intro'),
        link(btn('I already have an account', 'Secondary'), 'signin'),
        center('By continuing you agree to the Terms and Privacy Policy. Gutchek is for adults 18 and over.', 'caption', 'text/tertiary'),
      ],
    },
    [
      hero,
      lockup(36),
      col({ name: 'Copy', gap: 12, w: 'fill' }, [
        center('Know the person behind the DMs', 'h1'),
        center('Gutchek weighs what someone has shared publicly, the good and the concerning, so you can decide with clear eyes.', 'body', 'text/secondary'),
      ]),
    ],
  );
}

export function signIn(): FrameNode {
  return screen(
    {
      name: 'Sign in',
      nav: { title: '', action: null, backTo: 'welcome' },
      footer: [
        link(btn('Send code'), 'verify'),
        row({ name: 'Or', gap: 12, w: 'fill' }, [fill(divider()), text('or', 'small', 'text/tertiary'), fill(divider())]),
        row({ name: 'Social sign in', gap: 12, w: 'fill' }, [fill(use('SocialButton', { Provider: 'Apple' })), fill(use('SocialButton', { Provider: 'Google' }))]),
      ],
    },
    [
      text("What's your number?", 'h1', 'text/primary', { w: 'fill' }),
      text("We'll text you a 6-digit code. Your number is never shown to anyone you look up.", 'body', 'text/secondary', { w: 'fill' }),
      fill(use('Segmented', { Active: 'First' }, { first: 'Phone', second: 'Email' })),
      field('Phone number', '803 555 0142', { state: 'Focused', prefix: '+234' }),
    ],
  );
}

export function verify(): FrameNode {
  const digits = ['4', '8', '1', '9', '', ''];
  const boxes = digits.map((d, i) =>
    box(
      {
        name: 'Digit ' + (i + 1),
        dir: 'h',
        w: 'fill',
        h: 60,
        radius: 12,
        fill: 'bg/surface',
        stroke: i === 4 ? 'border/focus' : 'border/strong',
        strokeW: i === 4 ? 2 : 1,
        main: 'center',
        cross: 'center',
      },
      [d ? text(d, { family: 'display', weight: 700, size: 26, line: 32 }, 'text/primary') : i === 4 ? box({ name: 'Caret', w: 2, h: 26, fill: 'brand/fg', dir: 'h' }) : null],
    ),
  );
  return screen(
    {
      name: 'Verify code',
      nav: { title: '', action: null, backTo: 'signin' },
      footer: [link(btn('Verify'), 'purpose'), note('lock', 'Codes expire after 10 minutes. We will never ask for this code by phone or DM.', 'neutral')],
    },
    [
      text('Enter the code', 'h1', 'text/primary', { w: 'fill' }),
      row({ name: 'Sent to', gap: 6, w: 'fill' }, [text('Sent to ' + user.phone + '.', 'body', 'text/secondary'), text('Change', 'bodyStrong', 'brand/fg')]),
      row({ name: 'OTP', gap: 8, w: 'fill' }, boxes),
      row({ name: 'Resend', gap: 6 }, [icon('clock', 16, 'text/tertiary'), text('Resend code in 0:24', 'small', 'text/tertiary')]),
    ],
  );
}

export function purpose(): FrameNode {
  const check = (title: string, body: string) => fill(use('CheckRow', { Checked: 'On' }, { title, body }));
  return screen(
    {
      name: 'Age and purpose',
      nav: { title: '', action: null, backTo: 'verify' },
      gap: 12,
      footer: [
        link(btn('Agree and continue'), 'notifPrompt'),
        center('Searches are private. The person is never notified.', 'caption', 'text/tertiary'),
      ],
    },
    [
      text('Before your first Gutchek', 'h1', 'text/primary', { w: 'fill' }),
      text('Gutchek is built for personal safety. These promises keep it that way for everyone.', 'body', 'text/secondary', { w: 'fill' }),
      check("I'm 18 or older", 'Gutchek is for adults and never profiles anyone under 18.'),
      check("I'm using Gutchek for dating and personal safety", 'Not for employment, housing, credit or tenancy decisions.'),
      check("I won't use Gutchek to harass anyone", 'Repeat lookups of one person are limited. Misuse leads to a ban.'),
      link(listRow('Verify your identity', 'Optional. Adds a trusted badge to your account.', 'id-card'), 'idIntro'),
    ],
  );
}
