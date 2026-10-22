import { ctx } from '../core/ctx';
import { box, col, icon, row, text } from '../core/ui';
import { newPage } from './common';

const SCALE = 0.5;

function thumb(frame: FrameNode | undefined, caption: string): FrameNode | null {
  if (!frame) return null;
  const c = frame.clone();
  c.rescale(SCALE);
  const viewport = box({ name: 'Viewport', dir: 'none', w: Math.round(393 * SCALE), h: Math.round(852 * SCALE), radius: 24, clip: true, stroke: 'border/default', shadow: 'e2' });
  viewport.appendChild(c);
  c.x = 0;
  c.y = 0;
  return col({ name: caption, gap: 12, cross: 'center' }, [viewport, text(caption, 'smallStrong', 'text/secondary')]);
}

function arrow(): FrameNode {
  return box({ name: 'Arrow', dir: 'h', w: 48, h: 48, radius: 24, fill: 'bg/surface', stroke: 'border/default', main: 'center', cross: 'center' }, [icon('arrow-right', 24, 'brand/fg')]);
}

function lane(title: string, note: string, steps: Array<[FrameNode | undefined, string]>): FrameNode {
  const items: SceneNode[] = [];
  steps.forEach(([f, label], i) => {
    const t = thumb(f, label);
    if (!t) return;
    if (items.length) items.push(arrow());
    items.push(t);
  });
  return col({ name: title, gap: 24, pad: 48, radius: 32, fill: 'bg/surface' }, [
    col({ name: 'Head', gap: 4 }, [text(title, 'h2', 'text/primary'), text(note, 'body', 'text/secondary')]),
    row({ name: 'Steps', gap: 24, cross: 'center' }, items),
  ]);
}

export function buildFlow(frames: Record<string, FrameNode>): PageNode {
  const page = newPage('User Flow');
  ctx.theme = 'light';
  const root = col({ name: 'User flow', gap: 64, pad: 96, fill: 'bg/canvas', radius: 48 }, [
    col({ name: 'Header', gap: 12 }, [
      text('Libra · User flow', 'overline', 'brand/fg'),
      text('Main flow', { family: 'display', weight: 800, size: 64, line: 72, tracking: -2.5 }, 'text/primary'),
      text(
        'From the spec, section 7.2: sign in, confirm purpose and age, start a Libra, confirm matches, wait while the scale weighs, then read, save and share. Press Play on the Screens · Light page to click through the prototype.',
        { family: 'ui', weight: 400, size: 20, line: 32 },
        'text/secondary',
        { w: 1200 },
      ),
    ]),
    lane('Get started', 'Friction on purpose: verification and a purpose agreement before any search.', [
      [frames.welcome, 'Welcome'],
      [frames.signin, 'Sign in'],
      [frames.verify, 'Verify code'],
      [frames.purpose, 'Age and purpose'],
      [frames.home, 'Home'],
    ]),
    lane('Run a Libra', 'Name and one handle in; the user confirms every account before anything is analysed.', [
      [frames.search, 'New search'],
      [frames.match, 'Confirm matches'],
      [frames.processing, 'Weighing'],
      [frames.report, 'Report'],
    ]),
    lane('Explore the report', 'Every score expands into why.', [
      [frames.report, 'Report'],
      [frames.signalsCaution, 'Signals'],
      [frames.evidence, 'Evidence'],
      [frames.personality, 'Personality'],
      [frames.compare, 'Compare'],
    ]),
    lane('Alternate outcomes', 'The same flow ends differently when the evidence is serious or thin.', [
      [frames.reportSevere, 'Serious concerns'],
      [frames.safety, 'Safety Hub'],
      [frames.reportLow, 'Low confidence'],
    ]),
  ]);
  page.appendChild(root);
  root.x = 0;
  root.y = 0;
  return page;
}
