import { Theme } from '../tokens';
import { ctx, applyThemeMode, later, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { links } from './kit';
import { purpose, signIn, verify, welcome } from './auth';
import { home, homeEmpty, saved } from './home';
import { matchCompared, matchConfirm, newSearch, newSearchPlatform, processing } from './search';
import { evidence, report, reportLow, reportSevere, signalsCaution, signalsPositive } from './report';
import { compare, deleteData, personality, plans, safety, settings } from './more';

export interface ScreenDef {
  id: string;
  label: string;
  build: () => FrameNode;
}

export const GROUPS: Array<{ title: string; note: string; screens: ScreenDef[] }> = [
  {
    title: '1 · Onboarding',
    note: 'Sign up, verify, and agree to the purpose and age rules before the first search.',
    screens: [
      { id: 'welcome', label: '1.1 Welcome', build: welcome },
      { id: 'signin', label: '1.2 Sign in', build: signIn },
      { id: 'verify', label: '1.3 Verify code', build: verify },
      { id: 'purpose', label: '1.4 Age and purpose', build: purpose },
    ],
  },
  {
    title: '2 · Home and saved',
    note: 'The hub: start a Libra, revisit reports and saved people.',
    screens: [
      { id: 'home', label: '2.1 Home', build: home },
      { id: 'homeEmpty', label: '2.2 Home · first time', build: homeEmpty },
      { id: 'saved', label: '2.3 Saved', build: saved },
    ],
  },
  {
    title: '3 · New Libra',
    note: 'Name and one handle in, confirmed accounts out. Friction here is deliberate.',
    screens: [
      { id: 'search', label: '3.1 New search', build: newSearch },
      { id: 'searchPlatform', label: '3.2 Platform picker', build: newSearchPlatform },
      { id: 'match', label: '3.3 Match confirmation', build: matchConfirm },
      { id: 'matchCompared', label: '3.4 What we compared', build: matchCompared },
      { id: 'processing', label: '3.5 Processing', build: processing },
    ],
  },
  {
    title: '4 · Report',
    note: 'Explain, do not just score. Every number expands into evidence.',
    screens: [
      { id: 'report', label: '4.1 Report overview', build: report },
      { id: 'reportSevere', label: '4.2 Serious concerns', build: reportSevere },
      { id: 'reportLow', label: '4.3 Low confidence', build: reportLow },
      { id: 'signalsCaution', label: '4.4 Signals · Caution', build: signalsCaution },
      { id: 'signalsPositive', label: '4.5 Signals · Positive', build: signalsPositive },
      { id: 'evidence', label: '4.6 Evidence detail', build: evidence },
      { id: 'personality', label: '4.7 Personality', build: personality },
      { id: 'compare', label: '4.8 Compare', build: compare },
    ],
  },
  {
    title: '5 · Safety and settings',
    note: 'Safety tools, privacy controls, plans and data deletion.',
    screens: [
      { id: 'safety', label: '5.1 Safety Hub', build: safety },
      { id: 'settings', label: '5.2 Settings', build: settings },
      { id: 'plans', label: '5.3 Plans', build: plans },
      { id: 'deleteData', label: '5.4 Delete data', build: deleteData },
    ],
  },
];

const GAP = 80;
const SECTION_PAD = 80;
const SECTION_GAP = 160;

function makeReaction(destinationId: string): Reaction {
  return {
    trigger: { type: 'ON_CLICK' },
    actions: [
      {
        type: 'NODE',
        destinationId,
        navigation: 'NAVIGATE',
        transition: { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.3 },
        preserveScrollPosition: false,
      },
    ],
  };
}

export function buildScreens(theme: Theme, page: PageNode): { page: PageNode; frames: Record<string, FrameNode> } {
  ctx.theme = theme;
  links.length = 0;
  page.backgrounds = [hexPaint(theme === 'dark' ? '#05050A' : '#E9EBF0')];
  const frames: Record<string, FrameNode> = {};
  let y = 0;
  for (const g of GROUPS) {
    const built: FrameNode[] = [];
    for (const s of g.screens) {
      let f: FrameNode;
      try {
        f = s.build();
      } catch (e) {
        warn('Screen ' + s.label + ' failed: ' + String(e && (e as Error).message ? (e as Error).message : e));
        continue;
      }
      f.name = s.label + (theme === 'dark' ? ' · Dark' : '');
      applyThemeMode(f, theme);
      frames[s.id] = f;
      built.push(f);
    }
    const tallest = built.reduce((m, f) => Math.max(m, f.height), 852);
    const width = built.length * 393 + (built.length - 1) * GAP + SECTION_PAD * 2;
    const height = tallest + SECTION_PAD * 2 + 64;

    let container: SectionNode | FrameNode;
    try {
      const section = figma.createSection();
      section.name = g.title;
      section.resizeWithoutConstraints(width, height);
      section.fills = [hexPaint(theme === 'dark' ? '#101018' : '#FFFFFF')];
      container = section;
    } catch (_) {
      const frame = figma.createFrame();
      frame.name = g.title;
      frame.resize(width, height);
      frame.fills = [hexPaint(theme === 'dark' ? '#101018' : '#FFFFFF')];
      container = frame;
    }
    page.appendChild(container);
    container.x = 0;
    container.y = y;
    const caption = text(g.note, 'body', 'text/secondary');
    caption.fills = [hexPaint(theme === 'dark' ? '#A9A9BC' : '#475467')];
    container.appendChild(caption);
    caption.x = SECTION_PAD;
    caption.y = SECTION_PAD - 40;
    let x = SECTION_PAD;
    for (const f of built) {
      container.appendChild(f);
      f.x = x;
      f.y = SECTION_PAD + 24;
      x += 393 + GAP;
    }
    y += height + SECTION_GAP;
  }

  const screenOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('screen') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of links) {
    const dest = frames[target];
    if (!dest || node.removed || screenOf(node) === dest) continue;
    later(() => (node as FrameNode).setReactionsAsync([makeReaction(dest.id)]), node);
  }
  if (frames.welcome) {
    try {
      page.flowStartingPoints = [{ nodeId: frames.welcome.id, name: theme === 'dark' ? 'Main flow · Dark' : 'Main flow' }];
    } catch (e) {
      warn('Could not set prototype starting point.');
    }
  }
  ctx.theme = 'light';
  return { page, frames };
}
