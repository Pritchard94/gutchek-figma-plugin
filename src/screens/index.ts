import { Theme } from '../tokens';
import { ctx, applyThemeMode, later, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { links } from './kit';
import { purpose, signIn, verify, welcome } from './auth';
import { home, homeEmpty, saved } from './home';
import { matchCompared, matchConfirm, newSearch, newSearchPlatform, processing } from './search';
import { evidence, report, reportLow, reportSevere, signalsCaution, signalsPositive } from './report';
import { compare, deleteData, personality, plans, safety, settings } from './more';
import { appLocked, idIntro, intro, notifPrompt, selfie } from './onboarding';
import { analyse, chatBlocked, chatConsent, chatLimited, chatProcessing, chatReport, chatUpload, combinedView, createSheet, exportGuide, pasteText, patternDetail, safetyCard, sampleReport, speakers } from './chat';
import { appeal, banNotice, composer, joinPending, myStanding, postHeld, reportPost, roomAbout, roomWelcome, roomsList } from './rooms';
import { messageActions, muteSheet, roomFeed, roomFeedBlocked, thread } from './roomchat';
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
    title: '1 · Onboarding',
    note: 'Sign up, verify, agree to the purpose and age rules, and optionally verify identity before the first search.',
    screens: [
      ['welcome', 'Welcome', welcome],
      ['intro', 'How Libra works', intro],
      ['signin', 'Sign in', signIn],
      ['verify', 'Verify code', verify],
      ['purpose', 'Age and purpose', purpose],
      ['idIntro', 'Verify identity', idIntro],
      ['selfie', 'Selfie check', selfie],
      ['notifPrompt', 'Notifications permission', notifPrompt],
    ],
  },
  {
    title: '2 · Home and saved',
    note: 'The hub: start a Libra, revisit reports, notifications and saved people.',
    screens: [
      ['home', 'Home', home],
      ['homeEmpty', 'Home · first time', homeEmpty],
      ['notificationsList', 'Notifications', notificationsList],
      ['saved', 'Saved', saved],
      ['addNote', 'Private note', addNote],
    ],
  },
  {
    title: '3 · New Libra',
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
    title: '4 · Report',
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
    title: '5 · Safety',
    note: 'Share my date, trusted contacts and local support, one tap from anywhere.',
    screens: [
      ['safety', 'Safety Hub', safety],
      ['shareSetup', 'Share my date · set up', shareSetup],
      ['shareLive', 'Share my date · live', shareLive],
      ['trustedContacts', 'Trusted contacts', trustedContacts],
      ['resources', 'Support resources', resources],
    ],
  },
  {
    title: '7 · Chat analysis',
    note: 'Upload a conversation, confirm who said what, and get a behaviour report with the exact messages as evidence. Safety comes before scores.',
    screens: [
      ['create', 'Start something', createSheet],
      ['analyse', 'Analyse a chat', analyse],
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
    title: '8 · Gossip Rooms',
    note: 'Moderated rooms for sharing your own experience under a nickname. Libra Bot screens every post; bans always come with a reason and an appeal.',
    screens: [
      ['roomsList', 'Rooms', roomsList],
      ['roomAbout', 'Room details', roomAbout],
      ['joinPending', 'Join request pending', joinPending],
      ['roomWelcome', 'Rules and nickname', roomWelcome],
      ['roomFeed', 'Room feed', roomFeed],
      ['thread', 'Thread', thread],
      ['messageActions', 'Message actions', messageActions],
      ['muteSheet', 'Mute room', muteSheet],
      ['composer', 'New post', () => composer()],
      ['roomFeedBlocked', 'Blocked by Libra Bot', roomFeedBlocked],
      ['postHeld', 'Post held for review', postHeld],
      ['reportPost', 'Report a post', reportPost],
      ['banNotice', 'Ban notice', banNotice],
      ['appeal', 'Appeal', appeal],
      ['myStanding', 'Your standing', myStanding],
    ],
  },
  {
    title: '6 · Settings and account',
    note: 'Privacy controls, plans, payments and data deletion.',
    screens: [
      ['settings', 'Settings', settings],
      ['account', 'Account', account],
      ['history', 'Search history', history],
      ['notifSettings', 'Notification settings', notifSettings],
      ['help', 'Help', help],
      ['appLocked', 'App locked', appLocked],
      ['plans', 'Plans', plans],
      ['paymentSuccess', 'Payment success', paymentSuccess],
      ['deleteData', 'Delete data', deleteData],
    ],
  },
];

const ORDER = ['Onboarding', 'Home and saved', 'New Libra', 'Report', 'Chat analysis', 'Gossip Rooms', 'Safety', 'Settings and account'];
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
