import { Token } from '../tokens';
import { abs, add, box, col, gradient, hexPaint, icon, rect, row, text } from '../core/ui';
import { appIcon, glyph, lockup } from '../brand';
import { btn, center, group, groupTitle, heroIcon, iconTile, link, listRow, note, radioGroup, screen, use, viewport } from './kit';
import { user } from './data';

/**
 * App lock. The session stays signed in on the device (refresh token in SecureStore); reopening the app
 * after it was closed or backgrounded past the chosen delay asks for Face ID, fingerprint or the Gutchek passcode.
 */

function faceTarget(tone: 'brand' | 'caution' = 'brand'): FrameNode {
  const fg: Token = tone === 'brand' ? 'brand/fg' : 'caution/fg';
  const f = box({ name: 'Face ID', dir: 'none', w: 112, h: 112 });
  add(f, abs(box({ name: 'Halo', w: 112, h: 112, radius: 56, fill: tone === 'brand' ? 'brand/subtle' : 'caution/subtle' }), 0, 0));
  add(f, abs(box({ name: 'Frame', dir: 'h', w: 80, h: 80, radius: 24, stroke: fg, strokeW: 2, dash: tone === 'brand' ? [10, 6] : undefined, fill: 'bg/raised', main: 'center', cross: 'center' }, [icon('face-id', 44, fg)]), 16, 16));
  return f;
}

function lockHeader(title: string, sub: string): FrameNode {
  return col({ name: 'Copy', gap: 8, w: 'fill' }, [center(title, 'h2'), center(sub, 'body', 'text/secondary')]);
}

const signedIn = () =>
  link(
    row({ name: 'Signed in', gap: 6 }, [icon('lock', 12, 'text/tertiary'), text('Signed in as ' + user.email + ' · ', 'caption', 'text/tertiary'), text('Not you?', 'caption', 'brand/fg')]),
    'signin',
  );

export function appLocked(): FrameNode {
  return screen(
    {
      name: 'App locked',
      cross: 'center',
      gap: 28,
      pad: [72, 20, 24, 20],
      footer: [link(btn('Unlock with Face ID', 'Primary', 'Large', 'face-id'), 'home'), link(btn('Use passcode', 'Tertiary'), 'lockPasscode'), signedIn()],
    },
    [
      appIcon(84),
      lockHeader('Welcome back, ' + user.first, 'You\u2019re still signed in. Unlock to open your reports, chats and notes.'),
      faceTarget(),
      text('Look at your phone to unlock', 'smallStrong', 'brand/fg'),
    ],
  );
}

export function lockFailed(): FrameNode {
  return screen(
    {
      name: 'App locked · Not recognised',
      cross: 'center',
      gap: 28,
      pad: [72, 20, 24, 20],
      footer: [link(btn('Try Face ID again', 'Primary', 'Large', 'face-id'), 'appLocked'), link(btn('Use passcode', 'Secondary'), 'lockPasscode'), signedIn()],
    },
    [
      appIcon(84),
      lockHeader('Face ID didn\u2019t recognise you', 'Make sure your face is in view and nothing is covering it.'),
      faceTarget('caution'),
      row({ name: 'Attempts', gap: 6, pad: [6, 12], radius: 999, fill: 'caution/subtle' }, [icon('info', 14, 'caution/fg'), text('2 tries left, then your passcode', 'label', 'caution/fg')]),
    ],
  );
}

function keypad(withBiometric: boolean): FrameNode {
  const letters = ['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
  const key = (digit: string, sub: string) =>
    col({ name: 'Key ' + digit, w: 78, h: 78, radius: 39, fill: 'bg/subtle', main: 'center', cross: 'center', gap: 0 }, [
      text(digit, { family: 'display', weight: 600, size: 30, line: 34 }, 'text/primary'),
      sub ? text(sub, { family: 'ui', weight: 600, size: 9, line: 11, tracking: 10 }, 'text/tertiary') : null,
    ]);
  const plain = (name: string, kid: SceneNode | null) => box({ name, dir: 'h', w: 78, h: 78, radius: 39, main: 'center', cross: 'center' }, [kid]);
  const rows: SceneNode[] = [];
  for (let r = 0; r < 3; r++) rows.push(row({ name: 'Row ' + (r + 1), gap: 28 }, [0, 1, 2].map((c) => key(String(r * 3 + c + 1), letters[r * 3 + c]))));
  const bio = withBiometric ? link(plain('Face ID key', icon('face-id', 30, 'brand/fg')), 'appLocked') : plain('Empty', null);
  rows.push(row({ name: 'Row 4', gap: 28 }, [bio, key('0', ''), plain('Delete', icon('delete', 28, 'text/secondary'))]));
  return col({ name: 'Keypad', gap: 16, cross: 'center' }, rows);
}

function dots(filled: number, count = 6): FrameNode {
  const ds: SceneNode[] = [];
  for (let i = 0; i < count; i++) ds.push(box({ name: 'Dot ' + (i + 1), w: 14, h: 14, radius: 7, fill: i < filled ? 'brand/fg' : null, stroke: i < filled ? undefined : 'border/strong', strokeW: 1.5 }));
  return row({ name: 'Passcode', gap: 16 }, ds);
}

export function lockPasscode(): FrameNode {
  return screen(
    {
      name: 'App locked · Passcode',
      cross: 'center',
      gap: 22,
      pad: [48, 20, 16, 20],
      footer: [link(row({ name: 'Forgot', gap: 6 }, [text('Forgot your passcode?', 'small', 'text/secondary'), text('Sign in again', 'smallStrong', 'brand/fg')]), 'signin')],
    },
    [
      box({ name: 'Glyph', dir: 'h', w: 56, h: 56, radius: 18, fill: 'brand/solid', main: 'center', cross: 'center' }, [glyph(34, 'text/on-solid')]),
      lockHeader('Enter your passcode', 'Your Gutchek passcode, not your phone\u2019s.'),
      dots(4),
      box({ name: 'Gap', w: 1, h: 8 }),
      keypad(true),
    ],
  );
}

export function lockPasscodeSet(): FrameNode {
  return screen(
    {
      name: 'App lock · Create passcode',
      nav: { title: 'Step 1 of 2', action: null, backTo: 'lockSetup' },
      cross: 'center',
      gap: 22,
      pad: [16, 20, 16, 20],
      footer: [center('6 digits, just for Gutchek. Pick one that isn\u2019t your phone or bank PIN.', 'caption', 'text/tertiary')],
    },
    [lockHeader('Create a passcode', 'You\u2019ll use it when Face ID isn\u2019t available.'), dots(2), box({ name: 'Gap', w: 1, h: 8 }), keypad(false)],
  );
}

export function lockAndroid(): FrameNode {
  const base = viewport(appLocked());
  base.name = 'App locked · Android fingerprint';
  add(base, abs(rect(393, base.height, 'bg/scrim', 0, 'Scrim'), 0, 0));
  const prompt = col({ name: 'Biometric prompt', w: 361, pad: [28, 24, 20, 24], gap: 14, radius: 28, fill: 'bg/raised', shadow: 'e3', cross: 'center' }, [
    row({ name: 'App', gap: 8 }, [appIcon(28), text('Gutchek', 'smallStrong', 'text/secondary')]),
    text('Unlock Gutchek', 'h3', 'text/primary'),
    text('Use your fingerprint to continue', 'small', 'text/secondary'),
    box({ name: 'Sensor', dir: 'h', w: 76, h: 76, radius: 38, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('fingerprint', 40, 'brand/fg')]),
    text('Touch the fingerprint sensor', 'caption', 'text/tertiary'),
    row({ name: 'Actions', w: 'fill', main: 'between' }, [link(text('Use PIN', 'smallStrong', 'brand/fg'), 'lockPasscode'), text('Cancel', 'smallStrong', 'text/secondary')]),
  ]);
  add(base, abs(prompt, 16, base.height - Math.round(prompt.height) - 24));
  return base;
}

export function lockSetup(): FrameNode {
  return screen(
    {
      name: 'App lock · Set up',
      cross: 'center',
      gap: 18,
      pad: [40, 20, 16, 20],
      footer: [link(btn('Turn on Face ID', 'Primary', 'Large', 'face-id'), 'home'), link(btn('Set a passcode instead', 'Secondary'), 'lockPasscodeSet'), link(btn('Not now', 'Tertiary'), 'home')],
    },
    [
      heroIcon('face-id', 'brand', 96),
      lockHeader('Keep Gutchek private', 'You stay signed in. Each time you come back, Gutchek asks for Face ID first, so your reports, chats and notes stay yours even if someone picks up your phone.'),
      radioGroup([
        { label: 'Face ID', detail: 'Recommended. Falls back to your passcode.', on: true },
        { label: 'Passcode only', detail: 'A 6-digit code just for Gutchek.' },
      ]),
      row({ name: 'Android', gap: 8, w: 'fill' }, [icon('fingerprint', 16, 'text/tertiary'), text('On Android, fingerprint or face unlock works the same way.', 'caption', 'text/tertiary', { w: 'fill' })]),
    ],
  );
}

export function appLockSettings(): FrameNode {
  return screen(
    { name: 'App lock settings', nav: { title: 'App lock', action: null, backTo: 'settings' }, gap: 12 },
    [
      row({ name: 'Status', w: 'fill', gap: 12, pad: 14, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
        iconTile('face-id', 'brand', 40),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text('App lock is on', 'smallStrong', 'text/primary'), text('Face ID, then your passcode', 'caption', 'text/tertiary')]),
        use('Switch', { State: 'On' }),
      ]),
      groupTitle('Unlock with'),
      radioGroup([{ label: 'Face ID', on: true }, { label: 'Passcode only' }], 'Unlock with'),
      groupTitle('Ask to unlock'),
      radioGroup([{ label: 'Every time I open Gutchek', on: true }, { label: 'After 1 minute away' }, { label: 'After 5 minutes away' }, { label: 'After 1 hour away' }], 'Ask to unlock'),
      group([link(listRow('Hide content in the app switcher', null, 'eye-off', 'SwitchOn'), 'lockCover'), link(listRow('Change passcode', null, 'lock'), 'lockPasscodeSet')]),
      note('info', 'You stay signed in on this phone. If you\u2019re inactive for 90 days, or sign out from another device, you\u2019ll sign in again.', 'neutral'),
    ],
  );
}

export function lockCover(): FrameNode {
  const f = box({ name: 'App switcher · Privacy cover', dir: 'none', w: 393, h: 852, fill: [hexPaint('#15151C')], clip: true });
  const other = box({ name: 'Other app', w: 250, h: 540, radius: 34, fill: [hexPaint('#2A2A33')] });
  add(f, abs(other, -196, 170));
  const cover = col({ name: 'Gutchek card', w: 270, h: 584, radius: 36, main: 'center', cross: 'center', gap: 16, fill: [gradient([['#7556E3', 0], ['#2C1E66', 1]], 135)] }, [
    lockup(48, 'text/on-solid', 'text/on-solid'),
  ]);
  add(f, abs(cover, 62, 170));
  const label = row({ name: 'Label', gap: 8 }, [appIcon(26), text('Gutchek', 'smallStrong', 'text/inverse')]);
  for (const t of label.findAll((n) => n.type === 'TEXT')) (t as TextNode).fills = [hexPaint('#FFFFFF')];
  add(f, abs(label, 62, 128));
  const caption = text('In the app switcher, Gutchek shows a cover instead of your last screen.', 'small', 'text/inverse', { w: 313, align: 'center' });
  caption.fills = [hexPaint('#FFFFFF', 0.7)];
  add(f, abs(caption, 40, 780));
  f.setPluginData('screen', '1');
  return f;
}

export const LOCK_SCREENS: Array<[string, string, () => FrameNode]> = [
  ['lockSetup', 'Set up app lock', lockSetup],
  ['lockPasscodeSet', 'Create a passcode', lockPasscodeSet],
  ['appLocked', 'App locked · Face ID', appLocked],
  ['lockFailed', 'App locked · Face ID not recognised', lockFailed],
  ['lockPasscode', 'App locked · Passcode', lockPasscode],
  ['lockAndroid', 'App locked · Android fingerprint', lockAndroid],
  ['appLockSettings', 'App lock settings', appLockSettings],
  ['lockCover', 'App switcher cover', lockCover],
];
