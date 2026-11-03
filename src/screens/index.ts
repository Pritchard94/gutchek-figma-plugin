import { Theme } from '../tokens';
import { ctx, applyThemeMode, later, tag, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { links } from './kit';
import { purpose, signIn, verify, welcome } from './auth';
import { home, homeEmpty, saved } from './home';
import { matchCompared, matchConfirm, newSearch, newSearchPlatform, processing } from './search';
import { evidence, report, reportLow, reportSevere, signalsCaution, signalsPositive } from './report';
import { appearance, compare, deleteData, personality, plans, safety, settings } from './more';
import { NOTES_SCREENS } from './notes';
import { LOCK_SCREENS } from './lock';
import { idIntro, intro, introChat, introRooms, notifPrompt, selfie } from './onboarding';
import { analyse, chatBlocked, chatConsent, chatLimited, chatProcessing, chatReport, chatUpload, combinedView, createSheet, exportGuide, pasteText, patternDetail, safetyCard, sampleReport, speakers } from './chat';
import { appeal, banNotice, composer, joinPending, myStanding, postHeld, reportPost, roomAbout, roomWelcome, roomsList } from './rooms';
import { messageActions, muteSheet, roomInfo, quoteComposer, roomFeed, roomFeedBlocked, savedThreads, shareSheet, thread, threadSaved } from './roomchat';
import {
  account,
  addNote,
  blocked,
  comparePicker,
  help,
  history,
  linkedAccounts,
  noMatch,
  notifSettings,
  notificationsList,
  paymentSuccess,
  paywall,
  reportIssue,
  resources,
  shareLive,
  shareReport,
  shareSetup,
  trustedContacts,
} from './flows';

export interface ScreenDef {
  id: string;
  label: string;
  build: () => FrameNode;
}

type Group = { title: string; note: string; screens: Array<[string, string, () => FrameNode]> };

const DEFS: Group[] = [
  {
    title: 'Onboarding',
    note: 'Sign up, verify, agree to the purpose and age rules, and optionally verify identity before the first search.',
    screens: [
      ['welcome', 'Welcome', welcome],
      ['intro', 'Onboarding · Run a Gutchek', intro],
      ['introChat', 'Onboarding · Check a Chat', introChat],
      ['introRooms', 'Onboarding · Gist Rooms', introRooms],
      ['signin', 'Sign in', signIn],
      ['verify', 'Verify code', verify],
      ['purpose', 'Age and purpose', purpose],
      ['idIntro', 'Verify identity', idIntro],
      ['selfie', 'Selfie check', selfie],
      ['notifPrompt', 'Notifications permission', notifPrompt],
    ],
  },
  {
    title: 'Home and saved',
    note: 'The hub: start a Gutchek, revisit reports, notifications and saved people.',
    screens: [
      ['home', 'Home', home],
      ['homeEmpty', 'Home · first time', homeEmpty],
      ['notificationsList', 'Notifications', notificationsList],
      ['saved', 'Saved', saved],
      ['savedThreads', 'Saved · Threads', savedThreads],
      ['addNote', 'Private note', addNote],
    ],
  },
  {
    title: 'Run a Gutchek',
    note: 'Name and one handle in, confirmed accounts out. Friction here is deliberate, and every dead end explains itself.',
    screens: [
      ['search', 'New search', newSearch],
      ['searchPlatform', 'Platform picker', newSearchPlatform],
      ['match', 'Match confirmation', matchConfirm],
      ['matchCompared', 'What we compared', matchCompared],
      ['linkedAccounts', 'Linked accounts', linkedAccounts],
      ['processing', 'Processing', processing],
      ['noMatch', 'No match found', noMatch],
      ['blocked', 'Search not available', blocked],
      ['paywall', 'Out of reports', paywall],
    ],
  },
  {
    title: 'Report',
    note: 'Explain, do not just score. Every number expands into evidence.',
    screens: [
      ['report', 'Report overview', report],
      ['reportSevere', 'Serious concerns', reportSevere],
      ['reportLow', 'Low confidence', reportLow],
      ['signalsCaution', 'Signals · Caution', signalsCaution],
      ['signalsPositive', 'Signals · Positive', signalsPositive],
      ['evidence', 'Evidence detail', evidence],
      ['personality', 'Personality', personality],
      ['comparePicker', 'Compare · choose people', comparePicker],
      ['compare', 'Compare', compare],
      ['shareReport', 'Share report', shareReport],
      ['reportIssue', 'Report an issue', reportIssue],
    ],
  },
  {
    title: 'Safety',
    note: 'Share my date, trusted contacts and local support, one tap from anywhere.',
    screens: [
      ['safety', 'Stay Safe', safety],
      ['shareSetup', 'Share my date · set up', shareSetup],
      ['shareLive', 'Share my date · live', shareLive],
      ['trustedContacts', 'Trusted contacts', trustedContacts],
      ['resources', 'Support resources', resources],
    ],
  },
  {
    title: 'Check a Chat',
    note: 'Upload a conversation, confirm who said what, and get a behaviour report with the exact messages as evidence. Safety comes before scores.',
    screens: [
      ['create', 'Start something', createSheet],
      ['analyse', 'Check a Chat', analyse],
      ['sampleReport', 'Sample report', sampleReport],
      ['exportGuide', 'Export guide', exportGuide],
      ['chatConsent', 'Before you upload', chatConsent],
      ['chatUpload', 'Upload and arrange', chatUpload],
      ['pasteText', 'Paste text', pasteText],
      ['speakers', 'Confirm speakers', speakers],
      ['chatProcessing', 'Chat processing', chatProcessing],
      ['safetyCard', 'Safety card', safetyCard],
      ['chatReport', 'Conversation report', chatReport],
      ['patternDetail', 'Pattern in context', patternDetail],
      ['combinedView', 'Combined view', combinedView],
      ['chatLimited', 'Limited data', chatLimited],
      ['chatBlocked', 'Chat not analysed', chatBlocked],
    ],
  },
  {
    title: 'Gist Rooms',
    note: 'Moderated rooms for sharing your own experience under a nickname. Gist Bot screens every post; bans always come with a reason and an appeal.',
    screens: [
      ['roomsList', 'Rooms', roomsList],
      ['roomAbout', 'Room details', roomAbout],
      ['joinPending', 'Join request pending', joinPending],
      ['roomWelcome', 'Rules and nickname', roomWelcome],
      ['roomFeed', 'Room feed', roomFeed],
      ['thread', 'Thread', thread],
      ['threadSaved', 'Thread · saved', threadSaved],
      ['quoteComposer', 'Quote post', quoteComposer],
      ['shareSheet', 'Share post', shareSheet],
      ['messageActions', 'Message actions', messageActions],
      ['muteSheet', 'Mute room', muteSheet],
      ['roomInfo', 'Room info', roomInfo],
      ['composer', 'New post', () => composer()],
      ['roomFeedBlocked', 'Blocked by Gist Bot', roomFeedBlocked],
      ['postHeld', 'Post held for review', postHeld],
      ['reportPost', 'Report a post', reportPost],
      ['banNotice', 'Ban notice', banNotice],
      ['appeal', 'Appeal', appeal],
      ['myStanding', 'Your standing', myStanding],
    ],
  },
  {
    title: 'Settings and account',
    note: 'Privacy controls, plans, payments and data deletion.',
    screens: [
      ['settings', 'Settings', settings],
      ['account', 'Account', account],
      ['history', 'Search history', history],
      ['appearance', 'Appearance', appearance],
      ['notifSettings', 'Notification settings', notifSettings],
      ['help', 'Help', help],
      ['plans', 'Plans', plans],
      ['paymentSuccess', 'Payment success', paymentSuccess],
      ['deleteData', 'Delete data', deleteData],
    ],
  },
  {
    title: 'Notes',
    note: 'A private journal: daily notes, person cards with one timeline, Log my gut, reflections and evidence. Private by default, synced to the account, never scored.',
    screens: NOTES_SCREENS,
  },
  {
    title: 'App lock',
    note: 'You stay signed in. When Gutchek is reopened it asks for Face ID, fingerprint on Android, or a Gutchek passcode, and hides itself in the app switcher.',
    screens: LOCK_SCREENS,
  },
];

const ORDER = ['Onboarding', 'App lock', 'Home and saved', 'Notes', 'Run a Gutchek', 'Report', 'Check a Chat', 'Gist Rooms', 'Safety', 'Settings and account'];
DEFS.sort((a, b) => ORDER.indexOf(a.title) - ORDER.indexOf(b.title));

export const GROUPS: Array<{ title: string; note: string; screens: ScreenDef[] }> = DEFS.map((g, gi) => ({
  title: gi + 1 + ' · ' + g.title,
  note: g.note,
  screens: g.screens.map(([id, label, build], i) => ({ id, label: gi + 1 + '.' + (i + 1) + ' ' + label, build })),
}));

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

export const SCREEN_PAGES: Record<Theme, string> = { light: 'Screens · Light', dark: 'Screens · Dark' };
export const SCREEN_BACKGROUND: Record<Theme, string> = { light: '#E9EBF0', dark: '#05050A' };

/** Builder id and frame name of every screen, for finding screens that are already in the file. */
export function screenKeys(theme: Theme): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  for (const g of GROUPS) for (const s of g.screens) out.push([s.id, s.label + (theme === 'dark' ? ' · Dark' : '')]);
  return out;
}

/** Builds one flow group as a section on the current page. Prototype links are queued in `links` for resolveScreenLinks. */
export function buildScreenGroup(theme: Theme, g: (typeof GROUPS)[number], page: PageNode): { section: SectionNode | FrameNode; frames: Record<string, FrameNode> } {
  ctx.theme = theme;
  const frames: Record<string, FrameNode> = {};
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
    tag(f, 'id', s.id);
    applyThemeMode(f, theme);
    frames[s.id] = f;
    built.push(f);
  }
  const tallest = built.reduce((m, f) => Math.max(m, f.height), 852);
  const width = built.length * 393 + Math.max(0, built.length - 1) * GAP + SECTION_PAD * 2;
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
  ctx.theme = 'light';
  return { section: container, frames };
}

export const SCREEN_SECTION_GAP = SECTION_GAP;

/** Wires the links queued while building to their destination screens, which may be new or already on the page. */
export function resolveScreenLinks(frames: Record<string, FrameNode>) {
  const screenOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('screen') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of links) {
    const dest = frames[target];
    if (!dest || dest.removed || node.removed || screenOf(node) === dest) continue;
    later(() => (node as FrameNode).setReactionsAsync([makeReaction(dest.id)]), node);
  }
  links.length = 0;
}
