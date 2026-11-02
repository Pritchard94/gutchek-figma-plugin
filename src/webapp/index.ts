import { Theme } from '../tokens';
import { applyThemeMode, ctx, later, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { appLinks } from './shell';
import { wHome, wHomeEmpty, wLinked, wMatch, wNotifications, wPaywall, wProcessing, wPurpose, wSearch, wSignIn, wVerify } from './core';
import { wCompare, wPersonality, wReport, wSaved, wSavedThreads, wSevere, wSignals } from './report';
import { wAnalyse, wChatReport, wSpeakers } from './chat';
import { wDiscover, wRooms, wRoomsAbout, wRoomsMute, wRoomsShare, wRoomsThread } from './rooms';
import { MOBILE_WEB } from './mobileweb';
import { wNotes, wNotesEvidence, wNotesPerson } from './notes';
import { wBilling, wDelete, wSafety, wSettings } from './account';

type Def = [string, string, () => FrameNode];

const GROUPS: Array<{ title: string; note: string; pages: Def[] }> = [
  {
    title: 'Web app · 1 · Sign in and onboarding',
    note: 'Full-screen sign in with a centred glass card and product illustrations, code verification and the age and purpose agreement.',
    pages: [
      ['wSignIn', 'Sign in', wSignIn],
      ['wVerify', 'Verify code', wVerify],
      ['wPurpose', 'Age and purpose', wPurpose],
    ],
  },
  {
    title: 'Web app · 2 · Home and search',
    note: 'Dashboard, notifications, and the Run a Gutchek flow from name and handle to a finished report.',
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
    title: 'Web app · 3 · Notes',
    note: 'A private journal in three columns: library and people, the feed with tonight\'s prompt and this week\'s moods, and the editor. Person pages put notes, gut logs and reports on one timeline beside an opt-in reflection.',
    pages: [
      ['wNotes', 'Notes', wNotes],
      ['wNotesPerson', 'Notes · person timeline and reflection', wNotesPerson],
      ['wNotesEvidence', 'Notes · export evidence', wNotesEvidence],
    ],
  },
  {
    title: 'Web app · 4 · Report',
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
    title: 'Web app · 5 · Check a Chat',
    note: 'Drag and drop uploads, speaker confirmation side by side, and a two-column conversation report.',
    pages: [
      ['wAnalyse', 'Check a Chat', wAnalyse],
      ['wSpeakers', 'Confirm speakers', wSpeakers],
      ['wChatReport', 'Conversation report', wChatReport],
    ],
  },
  {
    title: 'Web app · 6 · Rooms',
    note: 'Discord-style three columns: rooms, the stream over the doodle wallpaper, and room info or an open thread.',
    pages: [
      ['wRooms', 'Rooms', wRooms],
      ['wRoomsAbout', 'Rooms · room info', wRoomsAbout],
      ['wRoomsThread', 'Rooms · thread', wRoomsThread],
      ['wRoomsMute', 'Rooms · mute', wRoomsMute],
      ['wRoomsShare', 'Rooms · share', wRoomsShare],
      ['wDiscover', 'Discover rooms', wDiscover],
    ],
  },
  {
    title: 'Web app · 7 · Safety and settings',
    note: 'Share my date, contacts and support lines; account, privacy, plans and invoices.',
    pages: [
      ['wSafety', 'Stay Safe', wSafety],
      ['wSettings', 'Settings', wSettings],
      ['wDelete', 'Settings · delete account', wDelete],
      ['wBilling', 'Plan and billing', wBilling],
    ],
  },
  {
    title: 'Web app · 8 · Mobile web',
    note: 'The same web app on a phone browser: a top bar with a menu drawer, a bottom bar for the main sections, and stacked layouts. Rooms open full screen; room info opens from the header.',
    pages: MOBILE_WEB,
  },
];

const GAP = 120;
const PAD = 120;

function section(page: PageNode, title: string, note: string, frames: FrameNode[], y: number, dark: boolean, x0 = 0): number {
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
  container.x = x0;
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
  const rows: Array<{ y: number; g: (typeof GROUPS)[number] }> = [];
  let y = 0;
  let widest = 0;
  for (const g of GROUPS) {
    const frames: FrameNode[] = [];
    for (const d of g.pages) {
      const f = build(d, 'light');
      if (f) {
        light[d[0]] = f;
        frames.push(f);
      }
    }
    rows.push({ y, g });
    y = section(page, g.title, g.note, frames, y, false);
    const last = page.children[page.children.length - 1] as SceneNode;
    widest = Math.max(widest, last.width);
  }
  resolve(light);

  const dark: Record<string, FrameNode> = {};
  const darkX = widest + 400;
  for (const { y: rowY, g } of rows) {
    const frames: FrameNode[] = [];
    for (const d of g.pages) {
      const f = build(d, 'dark');
      if (f) {
        dark[d[0]] = f;
        frames.push(f);
      }
    }
    section(page, g.title + ' · Dark', g.note + ' Dark mode, from the same tokens.', frames, rowY, true, darkX);
  }
  resolve(dark);

  try {
    page.flowStartingPoints = [
      { nodeId: light.wSignIn && light.wSignIn.id, name: 'Web app · Sign in' },
      { nodeId: light.wHome && light.wHome.id, name: 'Web app · Home' },
      { nodeId: dark.wHome && dark.wHome.id, name: 'Web app · Home · Dark' },
    ].filter((p) => !!p.nodeId);
  } catch (_) {
    warn('Could not set web app prototype starting points.');
  }
  return light;
}
