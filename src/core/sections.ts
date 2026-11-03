import { tag, tagOf, warn } from './ctx';
import { hexPaint } from './ui';

/** Canonical page order. A page that has to be created goes after the nearest existing page that precedes it. */
const PAGE_ORDER = ['Cover', 'Brand Guidelines', 'Foundations', 'Components', 'Screens · Light', 'Screens · Dark', 'Web App', 'User Flow', 'Website', 'Waitlist'];

export function findPage(name: string): PageNode | null {
  return figma.root.children.filter((p) => p.name === name)[0] || null;
}

/** Returns the named page, creating it in canonical order if the file does not have it. Never reorders existing pages. */
export async function ensurePage(name: string, background?: string): Promise<PageNode> {
  let page = findPage(name);
  if (!page) {
    page = figma.createPage();
    page.name = name;
    const order = PAGE_ORDER.indexOf(name);
    let index = -1;
    figma.root.children.forEach((p, i) => {
      const k = PAGE_ORDER.indexOf(p.name);
      if (k !== -1 && k < order) index = i;
    });
    figma.root.insertChild(index + 1, page);
    if (background) page.backgrounds = [hexPaint(background)];
  }
  await page.loadAsync();
  await figma.setCurrentPageAsync(page);
  return page;
}

/** The top-level node a plugin generated under this key: tagged on new runs, matched by name for older files. */
export function findSection(page: PageNode, key: string, except?: SceneNode): SceneNode | null {
  const kids = page.children.filter((c) => c !== except);
  return kids.filter((c) => tagOf(c, 'section') === key)[0] || kids.filter((c) => !tagOf(c, 'section') && c.name === key)[0] || null;
}

const overlaps = (a: number, aw: number, b: number, bw: number) => a < b + bw && b < a + aw;

export interface Placement {
  /** Sections stack downwards in a column, or run left to right in a row. */
  flow: 'down' | 'right';
  gap: number;
  /** Column (or row) origin used when the section is new. */
  x?: number;
  y?: number;
  /** Nodes built in the same batch that have not been placed yet. */
  ignore?: SceneNode[];
}

/**
 * Puts a freshly built top-level node (already on the page) where the previous version with the same key was, and
 * removes that previous version. Neighbours after it move by the change in size; nothing else on the page is touched.
 * A section the page does not have yet goes after the last node in its column (or row).
 */
export function putSection(page: PageNode, node: SceneNode, key: string, place: Placement, relinker?: Relinker) {
  tag(node, 'section', key);
  const ignore = place.ignore || [];
  const old = findSection(page, key, node);
  if (old) {
    node.x = old.x;
    node.y = old.y;
    const down = place.flow === 'down';
    const delta = down ? node.height - old.height : node.width - old.width;
    if (Math.abs(delta) > 0.5) {
      for (const s of page.children) {
        if (s === node || s === old || ignore.indexOf(s) !== -1) continue;
        if (down && s.y >= old.y + old.height - 1 && overlaps(s.x, s.width, old.x, old.width)) s.y += delta;
        if (!down && s.x >= old.x + old.width - 1 && overlaps(s.y, s.height, old.y, old.height)) s.x += delta;
      }
    }
    if (relinker) relinker.forget(old);
    old.remove();
    return;
  }
  const others = page.children.filter((s) => s !== node && ignore.indexOf(s) === -1);
  if (place.flow === 'down') {
    const x = place.x || 0;
    const col = others.filter((s) => overlaps(s.x, s.width, x, node.width));
    node.x = x;
    node.y = col.length ? Math.max(...col.map((s) => s.y + s.height)) + place.gap : place.y || 0;
  } else {
    const y = place.y || 0;
    const line = others.filter((s) => overlaps(s.y, s.height, y, node.height));
    node.y = y;
    node.x = line.length ? Math.max(...line.map((s) => s.x + s.width)) + place.gap : place.x || 0;
  }
}

/** Places a batch of new top-level nodes in order, each keyed by its name. */
export function putAll(page: PageNode, nodes: SceneNode[], place: Placement) {
  nodes.forEach((n, i) => putSection(page, n, n.name, Object.assign({}, place, { ignore: nodes.slice(i + 1) })));
}

/** Frames directly inside a page's sections, by builder id (tagged) or by frame name (older files). */
export async function collectFrames(page: PageNode | null, defs: Array<[string, string]>, inSection: (s: SceneNode) => boolean = () => true): Promise<Record<string, FrameNode>> {
  const out: Record<string, FrameNode> = {};
  if (!page) return out;
  await page.loadAsync();
  const byTag = new Map<string, FrameNode>();
  const byName = new Map<string, FrameNode>();
  for (const s of page.children) {
    if (!inSection(s) || !('children' in s)) continue;
    for (const f of (s as ChildrenMixin).children) {
      if (f.type !== 'FRAME') continue;
      const t = tagOf(f, 'id');
      if (t && !byTag.has(t)) byTag.set(t, f);
      if (!byName.has(f.name)) byName.set(f.name, f);
    }
  }
  for (const [id, label] of defs) {
    const f = byTag.get(id) || byName.get(label);
    if (f) out[id] = f;
  }
  return out;
}

/**
 * Keeps prototype links working when only some sections are rebuilt. Frames in untouched sections still point at the
 * ids of the frames that were replaced, so those links are repointed at the new frames with the same id or name.
 */
export class Relinker {
  private old = new Map<string, string>();
  private fresh = new Map<string, string>();

  forget(section: SceneNode) {
    if (!('children' in section)) return;
    for (const f of (section as ChildrenMixin).children) {
      if (f.type !== 'FRAME') continue;
      const t = tagOf(f, 'id');
      this.old.set(f.id, t ? 't:' + t : 'n:' + f.name);
    }
  }

  learn(frames: FrameNode[]) {
    for (const f of frames) {
      const t = tagOf(f, 'id');
      if (t) this.fresh.set('t:' + t, f.id);
      this.fresh.set('n:' + f.name, f.id);
    }
  }

  private target(id: string): string | undefined {
    const key = this.old.get(id);
    return key ? this.fresh.get(key) : undefined;
  }

  async apply(page: PageNode) {
    if (!this.old.size) return;
    try {
      page.flowStartingPoints = page.flowStartingPoints.map((p) => ({ nodeId: this.target(p.nodeId) || p.nodeId, name: p.name }));
    } catch (_) {
      /* starting points are reset by the plugin afterwards */
    }
    const sources = page.findAll((n) => {
      const r = (n as ReactionMixin).reactions;
      return !!r && r.length > 0 && r.some((x) => (x.actions || []).some((a) => a.type === 'NODE' && !!a.destinationId && this.old.has(a.destinationId)));
    });
    let lost = 0;
    await Promise.all(
      sources.map((n) => {
        const reactions = (n as ReactionMixin).reactions
          .map((r) => ({
            trigger: r.trigger,
            actions: (r.actions || [])
              .map((a) => {
                if (a.type !== 'NODE' || !a.destinationId || !this.old.has(a.destinationId)) return a;
                const next = this.target(a.destinationId);
                if (!next) lost++;
                return next ? Object.assign({}, a, { destinationId: next }) : null;
              })
              .filter((a): a is Action => !!a),
          }))
          .filter((r) => r.actions.length > 0);
        return (n as ReactionMixin).setReactionsAsync(reactions as Reaction[]).catch(() => {
          lost++;
        });
      }),
    );
    if (lost) warn(lost + ' prototype link(s) on "' + page.name + '" pointed at frames that no longer exist.');
    this.old.clear();
  }
}

/** Sets this plugin's named prototype starting points and keeps any others, including ones people added. */
export function setStarts(page: PageNode, starts: Array<{ name: string; node?: FrameNode }>) {
  try {
    const names = starts.map((s) => s.name);
    const keep = page.flowStartingPoints.filter((p) => names.indexOf(p.name) === -1);
    const ours = starts.filter((s) => s.node && !s.node.removed).map((s) => ({ nodeId: (s.node as FrameNode).id, name: s.name }));
    page.flowStartingPoints = keep.concat(ours);
  } catch (_) {
    warn('Could not set prototype starting points on "' + page.name + '".');
  }
}

/** Yields to Figma so progress shows and the canvas stays responsive between heavy steps. */
export const breathe = () => new Promise((r) => setTimeout(r, 0));
