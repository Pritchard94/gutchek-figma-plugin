import { abs, add, box, col, icon, paint, row, text } from '../core/ui';
import { glyph } from '../brand';
import { btn, center, heroIcon, iconTile, link, note, progressDots, screen, surface } from './kit';

export function intro(): FrameNode {
  const chip = (iconName: string, label: string) =>
    row({ name: label, gap: 8, pad: [10, 14], radius: 999, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [icon(iconName, 16, 'brand/fg'), text(label, 'smallStrong', 'text/primary')]);
  const art = box({ name: 'Art', dir: 'none', w: 353, h: 300, radius: 32, fill: 'brand/subtle' });
  add(art, abs(box({ name: 'Glyph disc', dir: 'h', w: 132, h: 132, radius: 66, fill: 'bg/raised', main: 'center', cross: 'center', shadow: 'e2' }, [glyph(72, 'brand/fg')]), 110, 84));
  add(art, abs(chip('eye-off', 'They are never notified'), 132, 28));
  add(art, abs(chip('lock', 'Public posts only'), 20, 172));
  add(art, abs(chip('file', 'Evidence for every flag'), 128, 238));
  return screen(
    {
      name: 'How Gutchek works',
      nav: { title: '', action: null, backTo: 'welcome' },
      cross: 'center',
      gap: 24,
      footer: [link(btn('Continue'), 'signin'), link(btn('Skip', 'Tertiary'), 'signin')],
    },
    [
      art,
      progressDots(3, 1),
      col({ name: 'Copy', gap: 10, w: 'fill' }, [
        center('A fair second opinion, with the receipts', 'h2'),
        center('Gutchek reads public posts only and weighs the kind as seriously as the concerning. Every flag links back to its source, so you decide.', 'body', 'text/secondary'),
      ]),
    ],
  );
}

export function idIntro(): FrameNode {
  const step = (n: string, iconName: string, title: string, body: string) =>
    row({ name: 'Step ' + n, w: 'fill', gap: 14, cross: 'start' }, [
      iconTile(iconName, 'brand', 40),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary', { w: 'fill' }), text(body, 'small', 'text/secondary', { w: 'fill' })]),
    ]);
  return screen(
    {
      name: 'Verify identity',
      nav: { title: '', action: null, backTo: 'purpose' },
      gap: 16,
      footer: [link(btn('Start verification'), 'selfie'), link(btn('Skip for now', 'Tertiary'), 'notifPrompt')],
    },
    [
      heroIcon('shield-check', 'positive', 72),
      text('Verify your identity', 'h1', 'text/primary', { w: 'fill' }),
      text('Optional, about 2 minutes. Verified members get a trusted badge and help keep Gutchek free of fake accounts.', 'body', 'text/secondary', { w: 'fill' }),
      surface(
        [
          step('1', 'id-card', 'Photo of your ID', "Passport, driver's licence, NIN slip or voter's card."),
          step('2', 'face-id', 'A quick selfie check', "Turn your head slowly so we know it's really you."),
          step('3', 'check-circle', 'We match the two', "Usually instant. We'll tell you if anything needs another look."),
        ],
        'Steps',
        20,
        18,
      ),
      note('lock', 'Verification is handled by our ID partner. Gutchek never stores images of your ID.', 'neutral'),
    ],
  );
}

export function selfie(): FrameNode {
  const cam = box({ name: 'Camera', dir: 'none', w: 353, h: 400, radius: 32, fill: 'bg/inverse', clip: true });
  const oval = figma.createEllipse();
  oval.name = 'Face guide';
  oval.resize(210, 270);
  oval.fills = [];
  oval.strokes = [paint('text/inverse', 0.6)];
  oval.strokeWeight = 3;
  oval.dashPattern = [10, 8];
  add(cam, abs(oval, 72, 52));
  const progress = figma.createEllipse();
  progress.name = 'Progress';
  progress.resize(226, 286);
  progress.arcData = { startingAngle: -Math.PI / 2, endingAngle: Math.PI * 0.75, innerRadius: 0.97 };
  progress.fills = [paint('brand/fg')];
  add(cam, abs(progress, 64, 44));
  add(cam, abs(icon('user', 120, 'text/tertiary'), 116, 120));
  add(cam, abs(row({ name: 'Hint', pad: [8, 14], radius: 999, fill: 'bg/raised', gap: 8 }, [icon('refresh', 16, 'brand/fg'), text('Turn your head slowly to the left', 'smallStrong', 'text/primary')]), 52, 344));
  const check = (label: string, ok: boolean) =>
    row({ name: label, gap: 6, pad: [6, 10], radius: 999, fill: ok ? 'positive/subtle' : 'bg/subtle' }, [icon(ok ? 'check' : 'info', 14, ok ? 'positive/fg' : 'text/secondary'), text(label, 'label', ok ? 'positive/fg' : 'text/secondary')]);
  return screen(
    {
      name: 'Selfie check',
      nav: { title: 'Selfie check', action: 'x', backTo: 'idIntro' },
      cross: 'center',
      gap: 18,
      footer: [link(btn('Continue'), 'notifPrompt'), center('Step 2 of 3 · Your video is deleted after the check', 'caption', 'text/tertiary')],
    },
    [cam, row({ name: 'Checks', gap: 8 }, [check('Good light', true), check('Face in frame', true), check('Remove glasses', false)])],
  );
}

export function notifPrompt(): FrameNode {
  const preview = row({ name: 'Notification preview', w: 'fill', pad: 14, gap: 12, radius: 20, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    box({ name: 'App icon', dir: 'h', w: 38, h: 38, radius: 9, fill: 'brand/solid', main: 'center', cross: 'center' }, [glyph(24, 'text/on-solid')]),
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      row({ name: 'Head', gap: 8, w: 'fill' }, [text('Gutchek', 'smallStrong', 'text/primary', { w: 'fill' }), text('now', 'caption', 'text/tertiary')]),
      text('Your report for Tobi is ready. Mostly positive, minor concerns.', 'small', 'text/secondary', { w: 'fill' }),
    ]),
  ]);
  return screen(
    {
      name: 'Notifications permission',
      cross: 'center',
      gap: 24,
      pad: [48, 20, 24, 20],
      footer: [link(btn('Turn on notifications'), 'home'), link(btn('Not now', 'Tertiary'), 'home')],
    },
    [
      heroIcon('bell', 'brand', 112),
      col({ name: 'Copy', gap: 10, w: 'fill' }, [
        center('Know the moment your report is ready', 'h2'),
        center('We only notify you about your own reports and Share my date check-ins. Nothing is ever sent to the person you look up.', 'body', 'text/secondary'),
      ]),
      preview,
    ],
  );
}

export function appLocked(): FrameNode {
  return screen(
    {
      name: 'App locked',
      cross: 'center',
      gap: 20,
      pad: [140, 20, 24, 20],
      footer: [btn('Unlock with Face ID', 'Primary', 'Large', 'face-id'), btn('Use passcode', 'Tertiary')],
    },
    [
      box({ name: 'Glyph', dir: 'h', w: 96, h: 96, radius: 28, fill: 'brand/solid', main: 'center', cross: 'center' }, [glyph(56, 'text/on-solid')]),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [center('Gutchek is locked', 'h2'), center('Your reports and notes stay private. Unlock to continue.', 'body', 'text/secondary')]),
    ],
  );
}
