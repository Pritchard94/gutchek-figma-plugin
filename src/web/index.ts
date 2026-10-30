import { ctx, later, warn } from '../core/ctx';
import { hexPaint, text } from '../core/ui';
import { webLinks } from './kit';
import { Screens, landing, mobileLanding } from './landing';
import { dispute, helpCentre, howItWorks, mobileOptout, notFound, optout, pricing, privacy, requestStatus, terms, trust } from './pages';
import { chatAnalysisPage, communityGuidelines, sharedPost } from './addendum';
import { ADMIN_PAGES } from './admin';
import { ADMIN_EXTRA } from './admin2';
import { ANALYTICS_PAGES } from './admin3';
import { mobileChat, mobileDispute, mobileGuidelines, mobileHelp, mobileHow, mobileMenu, mobileNotFound, mobilePricing, mobilePrivacy, mobileStatus, mobileTerms, mobileTrust } from './mobile';
import { MOBILE } from './kit';

interface WebDef {
  id: string;
  label: string;
  build: (s: Screens) => FrameNode;
}

const DESKTOP_PAGES: WebDef[] = [
  { id: 'landing', label: 'Home', build: landing },
  { id: 'how', label: 'How it works', build: howItWorks },
  { id: 'chat', label: 'Check a Chat', build: chatAnalysisPage },
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
  { id: 'mMenu', label: 'Menu · Mobile', build: mobileMenu },
  { id: 'mHow', label: 'How it works · Mobile', build: mobileHow },
  { id: 'mChat', label: 'Check a Chat · Mobile', build: mobileChat },
  { id: 'mTrust', label: 'Trust and safety · Mobile', build: mobileTrust },
  { id: 'mGuidelines', label: 'Community guidelines · Mobile', build: mobileGuidelines },
  { id: 'mPricing', label: 'Pricing · Mobile', build: mobilePricing },
  { id: 'mOptout', label: 'Opt out · Mobile', build: mobileOptout },
  { id: 'mDispute', label: 'Dispute a finding · Mobile', build: mobileDispute },
  { id: 'mStatus', label: 'Request status · Mobile', build: mobileStatus },
  { id: 'mHelp', label: 'Help centre · Mobile', build: mobileHelp },
  { id: 'mPrivacy', label: 'Privacy policy · Mobile', build: mobilePrivacy },
  { id: 'mTerms', label: 'Terms of use · Mobile', build: mobileTerms },
  { id: 'mNotFound', label: '404 · Mobile', build: mobileNotFound },
  { id: 'mShared', label: 'Shared post · Mobile', build: () => sharedPost() },
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
  const adminDefs = [...ANALYTICS_PAGES, ADMIN_PAGES[0], ADMIN_EXTRA[0], ADMIN_EXTRA[1], ...ADMIN_PAGES.slice(1), ...ADMIN_EXTRA.slice(2)];
  const admin = build(adminDefs.map(([id, label, fn]) => ({ id, label, build: () => fn() })));
  let y = sectionFor(page, 'Website · Desktop 1440', 'Marketing site, public opt-out and dispute flow, help centre and legal pages. Click through with Play.', desktop, 0);
  y = sectionFor(page, 'Website · Mobile 390', 'Every website page at 390 wide: the same copy stacked into one column, a full-screen menu, and links that stay on mobile pages.', mobile, y, 80);
  sectionFor(page, 'Admin dashboard · Web app', 'Staff-only admin: growth, engagement and revenue analytics with a timeline filter, room creation and moderation, trust and safety queues, users and billing, bot rules, staff roles and an immutable audit log. Role-based access with MFA.', admin, y, 80);

  const mobileTargets: Record<string, string> = {
    landing: 'mLanding',
    how: 'mHow',
    chat: 'mChat',
    trust: 'mTrust',
    guidelines: 'mGuidelines',
    pricing: 'mPricing',
    optout: 'mOptout',
    dispute: 'mDispute',
    status: 'mStatus',
    helpcenter: 'mHelp',
    privacy: 'mPrivacy',
    terms: 'mTerms',
    notfound: 'mNotFound',
  };
  const topOf = (n: BaseNode): BaseNode | null => {
    let p: BaseNode | null = n;
    while (p && !(p.type === 'FRAME' && (p as FrameNode).getPluginData('webpage') === '1')) p = p.parent;
    return p;
  };
  for (const [node, target] of webLinks) {
    const top = topOf(node);
    const isMobile = !!top && (top as FrameNode).width === MOBILE;
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
      { nodeId: frames.adminGrowth && frames.adminGrowth.id, name: 'Admin dashboard' },
    ].filter((p) => !!p.nodeId);
  } catch (_) {
    warn('Could not set website prototype starting points.');
  }
  return frames;
}
