import { ctx } from '../core/ctx';
import { box, col, icon, row, text } from '../core/ui';
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

export function buildFlow(frames: Record<string, FrameNode>, page: PageNode): PageNode {
  ctx.theme = 'light';
  const root = col({ name: 'User flow', gap: 64, pad: 96, fill: 'bg/canvas', radius: 48 }, [
    col({ name: 'Header', gap: 12 }, [
      text('Gutchek · User flow', 'overline', 'brand/fg'),
      text('Main flow', { family: 'display', weight: 800, size: 64, line: 72, tracking: -2.5 }, 'text/primary'),
      text(
        'From the spec, section 7.2: sign in, confirm purpose and age, start a Gutchek, confirm matches, wait while the evidence is weighed, then read, save and share. Press Play on the Screens · Light page to click through the prototype.',
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
      [frames.lockSetup, 'App lock'],
      [frames.home, 'Home'],
    ]),
    lane('Run a Gutchek', 'Name and one handle in; the user confirms every account before anything is analysed.', [
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
    lane('Reopen the app', 'Still signed in: Gutchek asks for Face ID, falls back to the passcode, and never shows content in the app switcher.', [
      [frames.lockCover, 'App switcher'],
      [frames.appLocked, 'Face ID'],
      [frames.lockFailed, 'Not recognised'],
      [frames.lockPasscode, 'Passcode'],
      [frames.home, 'Home'],
    ]),
    lane('Write a note', 'Flow D: Notes tab, write, pick a mood, then see it on the person\u2019s timeline beside their reports.', [
      [frames.notesHome, 'Notes'],
      [frames.writeNote, 'Write a note'],
      [frames.pickPerson, 'About someone'],
      [frames.personTimeline, 'Timeline'],
      [frames.reflection, 'Reflection · v1.5'],
    ]),
    lane('Check a Chat', 'User-provided evidence: consent, upload, confirm speakers, then safety before scores.', [
      [frames.analyse, 'Check a Chat'],
      [frames.chatConsent, 'Consent'],
      [frames.chatUpload, 'Upload'],
      [frames.speakers, 'Confirm speakers'],
      [frames.chatProcessing, 'Processing'],
      [frames.chatReport, 'Conversation report'],
    ]),
    lane('Gist Rooms', 'Join, accept the rules, post through Gist Bot, and appeal any ban.', [
      [frames.roomsList, 'Rooms'],
      [frames.roomAbout, 'Room details'],
      [frames.roomWelcome, 'Rules and nickname'],
      [frames.roomFeed, 'Feed'],
      [frames.composer, 'New post'],
      [frames.banNotice, 'Ban notice'],
      [frames.appeal, 'Appeal'],
    ]),
    lane('Alternate outcomes', 'The same flow ends differently when the evidence is serious or thin.', [
      [frames.reportSevere, 'Serious concerns'],
      [frames.safety, 'Stay Safe'],
      [frames.reportLow, 'Low confidence'],
    ]),
  ]);
  page.appendChild(root);
  root.x = 0;
  root.y = 0;
  return page;
}
