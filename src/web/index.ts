import { ctx, later, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { webLinks } from './kit';
import { Screens, landing, mobileLanding } from './landing';
import { dispute, helpCentre, howItWorks, mobileOptout, notFound, optout, pricing, privacy, requestStatus, terms, trust } from './pages';
import { chatAnalysisPage, communityGuidelines } from './addendum';
import { ADMIN_PAGES } from './admin';

interface WebDef {
  id: string;
  label: string;
  build: (s: Screens) => FrameNode;
}

const DESKTOP_PAGES: WebDef[] = [
  { id: 'landing', label: 'Home', build: landing },
  { id: 'how', label: 'How it works', build: howItWorks },
  { id: 'chat', label: 'Chat analysis', build: chatAnalysisPage },
  { id: 'trust', label: 'Trust and safety', build: trust },
  { id: 'guidelines', label: 'Community guidelines', build: () => communityGuidelines() },
  { id: 'pricing', label: 'Pricing', build: pricing },
  { id: 'optout', label: 'Opt out', build: optout },
  { id: 'dispute', label: 'Dispute a finding', build: dispute },
  { id: 'status', label: 'Request status', build: requestStatus },
  { id: 'helpcenter', label: 'Help centre', build: helpCentre },
  { id: 'privacy', label: 'Privacy policy', build: privacy },
  { id: 'terms', label: 'Terms of use', build: terms },
  { id: 'notfound', label: '404', build: notFound },
];

const MOBILE_PAGES: WebDef[] = [
  { id: 'mLanding', label: 'Home · Mobile', build: mobileLanding },
  { id: 'mOptout', label: 'Opt out · Mobile', build: mobileOptout },
];

const GAP = 120;
const PAD = 120;

function sectionFor(page: PageNode, title: string, note: string, frames: FrameNode[], y: number, gap = GAP): number {
  const tallest = frames.reduce((m, f) => Math.max(m, f.height), 0);
  const width = frames.reduce((w, f) => w + f.width, 0) + gap * Math.max(0, frames.length - 1) + PAD * 2;
  let container: SectionNode | FrameNode;
  try {
    const s = figma.createSection();
    s.name = title;
    s.resizeWithoutConstraints(width, tallest + PAD * 2 + 40);
    s.fills = [hexPaint('#FFFFFF')];
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
  container.appendChild(caption);
  caption.x = PAD;
  caption.y = PAD - 56;
  let x = PAD;
  for (const f of frames) {
    container.appendChild(f);
    f.x = x;
    f.y = PAD;
    x += f.width + gap;
  }
  return y + container.height + 200;
}

export function buildWebsite(page: PageNode, screens: Screens): Record<string, FrameNode> {
  ctx.theme = 'light';
  webLinks.length = 0;
  page.backgrounds = [hexPaint('#E9EBF0')];
  const frames: Record<string, FrameNode> = {};
  const build = (defs: WebDef[]) =>
    defs
      .map((d) => {
        try {
          const f = d.build(screens);
          f.name = d.label;
          frames[d.id] = f;
          return f;
        } catch (e) {
          warn('Web page ' + d.label + ' failed: ' + String(e && (e as Error).message ? (e as Error).message : e));
          return null;
        }
      })
      .filter((f): f is FrameNode => !!f);

  const desktop = build(DESKTOP_PAGES);
  const mobile = build(MOBILE_PAGES);
  const admin = build(ADMIN_PAGES.map(([id, label, fn]) => ({ id, label, build: () => fn() })));
  let y = sectionFor(page, 'Website · Desktop 1440', 'Marketing site, public opt-out and dispute flow, help centre and legal pages. Click through with Play.', desktop, 0);
  y = sectionFor(page, 'Website · Mobile 390', 'Responsive versions of the most-visited pages: the homepage and the opt-out form.', mobile, y, 80);
  sectionFor(page, 'Admin and moderation dashboard · Web app', 'Staff-only dashboard for Gossip Rooms: queues, appeals, members, room settings and an immutable audit log. Role-based access with MFA.', admin, y, 80);

  const mobileTargets: Record<string, string> = { landing: 'mLanding', optout: 'mOptout' };
  const topOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('webpage') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of webLinks) {
    const top = topOf(node);
    const isMobile = !!top && (top === frames.mLanding || top === frames.mOptout);
    const dest = frames[isMobile && mobileTargets[target] ? mobileTargets[target] : target] || frames[target];
    if (!dest || node.removed || top === dest) continue;
    later(() => (node as FrameNode).setReactionsAsync([
      {
        trigger: { type: 'ON_CLICK' },
        actions: [{ type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: { type: 'DISSOLVE', easing: { type: 'EASE_OUT' }, duration: 0.2 }, preserveScrollPosition: false }],
      },
    ]), node);
  }
  try {
    page.flowStartingPoints = [
      { nodeId: frames.landing && frames.landing.id, name: 'Website · Desktop' },
      { nodeId: frames.mLanding && frames.mLanding.id, name: 'Website · Mobile' },
      { nodeId: frames.adminOverview && frames.adminOverview.id, name: 'Admin dashboard' },
    ].filter((p) => !!p.nodeId);
  } catch (_) {
    warn('Could not set website prototype starting points.');
  }
  return frames;
}
