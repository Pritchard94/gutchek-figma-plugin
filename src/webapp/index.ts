import { Theme } from '../tokens';
import { applyThemeMode, ctx, later, tag, warn } from '../core/ctx';
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

function section(page: PageNode, title: string, note: string, frames: FrameNode[], dark: boolean): SectionNode | FrameNode {
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
  return container;
}

export const WEBAPP_PAGE = 'Web App';
export const WEBAPP_SECTION_GAP = 200;
/** Space between the light column and the dark column. */
export const WEBAPP_COLUMN_GAP = 400;
export const WEBAPP_GROUPS = GROUPS;

export function webAppTitle(g: (typeof GROUPS)[number], theme: Theme): string {
  return g.title + (theme === 'dark' ? ' · Dark' : '');
}

/** Builder ids and frame names. Dark frames carry a ':dark' id so both themes can share one page. */
export function webAppKeys(theme: Theme): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const g of GROUPS) for (const d of g.pages) out.push([d[0] + (theme === 'dark' ? ':dark' : ''), d[1] + (theme === 'dark' ? ' · Dark' : '')]);
  return out;
}

/** Builds one group in one theme as a section on the current page. Links are queued for resolveWebAppLinks. */
export function buildWebAppGroup(page: PageNode, g: (typeof GROUPS)[number], theme: Theme): { section: SectionNode | FrameNode; frames: Record<string, FrameNode> } {
  const frames: Record<string, FrameNode> = {};
  const built: FrameNode[] = [];
  for (const d of g.pages) {
    const f = build(d, theme);
    if (f) {
      tag(f, 'id', d[0] + (theme === 'dark' ? ':dark' : ''));
      frames[d[0]] = f;
      built.push(f);
    }
  }
  const note = theme === 'dark' ? g.note + ' Dark mode, from the same tokens.' : g.note;
  return { section: section(page, webAppTitle(g, theme), note, built, theme === 'dark'), frames };
}

/** Wires queued links to frames of the same theme, keyed by builder id without the ':dark' suffix. */
export function resolveWebAppLinks(frames: Record<string, FrameNode>) {
  resolve(frames);
}

export function webAppStarts(light: Record<string, FrameNode>, dark: Record<string, FrameNode>): Array<{ name: string; node?: FrameNode }> {
  return [
    { name: 'Web app · Sign in', node: light.wSignIn },
    { name: 'Web app · Home', node: light.wHome },
    { name: 'Web app · Home · Dark', node: dark.wHome },
  ];
}

function resolve(frames: Record<string, FrameNode>) {
  const topOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('webapp') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of appLinks) {
    const dest = frames[target];
    if (!dest || dest.removed || node.removed || topOf(node) === dest) continue;
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
