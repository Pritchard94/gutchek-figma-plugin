import { Theme } from '../tokens';
import { applyThemeMode, ctx, later, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { appLinks } from './shell';
import { wHome, wHomeEmpty, wLinked, wMatch, wNotifications, wPaywall, wProcessing, wPurpose, wSearch, wSignIn, wVerify } from './core';
import { wCompare, wPersonality, wReport, wSaved, wSavedThreads, wSevere, wSignals } from './report';
import { wAnalyse, wChatReport, wSpeakers } from './chat';
import { wDiscover, wRooms, wRoomsMute, wRoomsShare, wRoomsThread } from './rooms';
import { wBilling, wDelete, wSafety, wSettings } from './account';

type Def = [string, string, () => FrameNode];

const GROUPS: Array<{ title: string; note: string; pages: Def[] }> = [
  {
    title: 'Web app · 1 · Sign in and onboarding',
    note: 'Split-screen sign in with the scale, code verification and the age and purpose agreement.',
    pages: [
      ['wSignIn', 'Sign in', wSignIn],
      ['wVerify', 'Verify code', wVerify],
      ['wPurpose', 'Age and purpose', wPurpose],
    ],
  },
  {
    title: 'Web app · 2 · Home and search',
    note: 'Dashboard, notifications, and the New Libra flow from name and handle to a finished report.',
    pages: [
      ['wHome', 'Home', wHome],
      ['wHomeEmpty', 'Home · first time', wHomeEmpty],
      ['wNotifications', 'Home · notifications', wNotifications],
      ['wSearch', 'New search', wSearch],
      ['wPaywall', 'New search · out of reports', wPaywall],
      ['wMatch', 'Match confirmation', wMatch],
      ['wLinked', 'Linked accounts', wLinked],
      ['wProcessing', 'Processing', wProcessing],
    ],
  },
  {
    title: 'Web app · 3 · Report',
    note: 'Report tabs with a right rail for notes and confidence. Signals use a master-detail layout so evidence sits beside the finding.',
    pages: [
      ['wReport', 'Report · overview', wReport],
      ['wSevere', 'Report · serious concerns', wSevere],
      ['wSignals', 'Report · signals and evidence', wSignals],
      ['wPersonality', 'Report · personality', wPersonality],
      ['wCompare', 'Compare', wCompare],
      ['wSaved', 'Saved · people', wSaved],
      ['wSavedThreads', 'Saved · threads', wSavedThreads],
    ],
  },
  {
    title: 'Web app · 4 · Chat analysis',
    note: 'Drag and drop uploads, speaker confirmation side by side, and a two-column conversation report.',
    pages: [
      ['wAnalyse', 'Analyse a chat', wAnalyse],
      ['wSpeakers', 'Confirm speakers', wSpeakers],
      ['wChatReport', 'Conversation report', wChatReport],
    ],
  },
  {
    title: 'Web app · 5 · Rooms',
    note: 'Discord-style three columns: rooms, the stream over the doodle wallpaper, and room info or an open thread.',
    pages: [
      ['wRooms', 'Rooms', wRooms],
      ['wRoomsThread', 'Rooms · thread', wRoomsThread],
      ['wRoomsMute', 'Rooms · mute', wRoomsMute],
      ['wRoomsShare', 'Rooms · share', wRoomsShare],
      ['wDiscover', 'Discover rooms', wDiscover],
    ],
  },
  {
    title: 'Web app · 6 · Safety and settings',
    note: 'Share my date, contacts and support lines; account, privacy, plans and invoices.',
    pages: [
      ['wSafety', 'Safety', wSafety],
      ['wSettings', 'Settings', wSettings],
      ['wDelete', 'Settings · delete account', wDelete],
      ['wBilling', 'Plan and billing', wBilling],
    ],
  },
];

const DARK = ['wHome', 'wReport', 'wSignals', 'wChatReport', 'wRooms', 'wSafety'];

const GAP = 120;
const PAD = 120;

function section(page: PageNode, title: string, note: string, frames: FrameNode[], y: number, dark: boolean): number {
  const tallest = frames.reduce((m, f) => Math.max(m, f.height), 0);
  const width = frames.reduce((w, f) => w + f.width, 0) + GAP * Math.max(0, frames.length - 1) + PAD * 2;
  let container: SectionNode | FrameNode;
  try {
    const s = figma.createSection();
    s.name = title;
    s.resizeWithoutConstraints(width, tallest + PAD * 2 + 40);
    s.fills = [hexPaint(dark ? '#101018' : '#FFFFFF')];
    container = s;
  } catch (_) {
    const f = figma.createFrame();
    f.name = title;
    f.resize(width, tallest + PAD * 2 + 40);
    container = f;
  }
  page.appendChild(container);
  container.x = 0;
  container.y = y;
  const caption = text(note, 'body', 'text/secondary');
  caption.fills = [hexPaint(dark ? '#A9A9BC' : '#475467')];
  container.appendChild(caption);
  caption.x = PAD;
  caption.y = PAD - 56;
  let x = PAD;
  for (const f of frames) {
    container.appendChild(f);
    f.x = x;
    f.y = PAD;
    x += f.width + GAP;
  }
  return y + container.height + 200;
}

function resolve(frames: Record<string, FrameNode>) {
  const topOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('webapp') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of appLinks) {
    const dest = frames[target];
    if (!dest || node.removed || topOf(node) === dest) continue;
    later(
      () =>
        (node as FrameNode).setReactionsAsync([
          {
            trigger: { type: 'ON_CLICK' },
            actions: [{ type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.15 }, preserveScrollPosition: false }],
          },
        ]),
      node,
    );
  }
  appLinks.length = 0;
}

function build(def: Def, theme: Theme): FrameNode | null {
  ctx.theme = theme;
  try {
    const f = def[2]();
    f.name = def[1] + (theme === 'dark' ? ' · Dark' : '');
    applyThemeMode(f, theme);
    return f;
  } catch (e) {
    warn('Web app page ' + def[1] + ' failed: ' + String(e && (e as Error).message ? (e as Error).message : e));
    return null;
  } finally {
    ctx.theme = 'light';
  }
}

export function buildWebApp(page: PageNode): Record<string, FrameNode> {
  page.backgrounds = [hexPaint('#E9EBF0')];
  appLinks.length = 0;
  const light: Record<string, FrameNode> = {};
  let y = 0;
  for (const g of GROUPS) {
    const frames: FrameNode[] = [];
    for (const d of g.pages) {
      const f = build(d, 'light');
      if (f) {
        light[d[0]] = f;
        frames.push(f);
      }
    }
    y = section(page, g.title, g.note, frames, y, false);
  }
  resolve(light);

  const dark: Record<string, FrameNode> = {};
  const darkFrames: FrameNode[] = [];
  for (const g of GROUPS) {
    for (const d of g.pages) {
      if (DARK.indexOf(d[0]) === -1) continue;
      const f = build(d, 'dark');
      if (f) {
        dark[d[0]] = f;
        darkFrames.push(f);
      }
    }
  }
  section(page, 'Web app · Dark mode', 'Key pages in dark mode, from the same tokens. Every other page follows the same rules.', darkFrames, y, true);
  resolve(Object.assign({}, light, dark));

  try {
    page.flowStartingPoints = [
      { nodeId: light.wSignIn && light.wSignIn.id, name: 'Web app · Sign in' },
      { nodeId: light.wHome && light.wHome.id, name: 'Web app · Home' },
    ].filter((p) => !!p.nodeId);
  } catch (_) {
    warn('Could not set web app prototype starting points.');
  }
  return light;
}
