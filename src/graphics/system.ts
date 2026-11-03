import { loadFonts, syncStyles, syncVariables, warn } from '../core/ctx';
import { ICONS, iconSvg } from '../icons';
import { iconComps, recolor } from '../core/ui';

/**
 * Connects to the design system the Gutchek General plugin wrote into this file (variables, styles, icons), so
 * graphics stay bound to the same tokens. Anything missing is created; existing tokens are left as they are.
 */
export async function attachDesignSystem(iconHolder: () => FrameNode): Promise<string[]> {
  const notes: string[] = [];
  await loadFonts();

  const vars = await syncVariables(false);
  if (vars.created) notes.push(vars.created + ' Gutchek variables were not in this file, so they were created.');
  const styles = await syncStyles(false);
  if (styles.created) notes.push(styles.created + ' Gutchek text and effect styles were created.');

  const components = figma.root.children.filter((p) => p.name === 'Components')[0];
  if (components) {
    await components.loadAsync();
    for (const c of components.findAll((n) => n.type === 'COMPONENT' && n.name.indexOf('Icon/') === 0)) iconComps.set(c.name.slice(5), c as ComponentNode);
  }
  const missing = Object.keys(ICONS).filter((k) => !iconComps.has(k));
  if (missing.length) {
    const holder = iconHolder();
    for (const name of missing) {
      try {
        const n = figma.createNodeFromSvg(iconSvg(ICONS[name]));
        const comp = figma.createComponentFromNode(n);
        comp.name = 'Icon/' + name;
        comp.fills = [];
        comp.clipsContent = false;
        for (const ch of comp.children) {
          try {
            (ch as ConstraintMixin & SceneNode).constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
          } catch (_) {
            /* groups have no constraints */
          }
        }
        recolor(comp, 'text/primary');
        holder.appendChild(comp);
        iconComps.set(name, comp);
      } catch (_) {
        warn('Icon ' + name + ' could not be created.');
      }
    }
    if (!components) notes.push('Icons were added to this page because the Components page is missing.');
  }
  return notes;
}

/** App screens by label from the Screens · Light page that Gutchek Mobile builds, for phone mockups. Labels look like "3.1 Home". */
export async function findScreens(): Promise<Map<string, FrameNode>> {
  const out = new Map<string, FrameNode>();
  const page = figma.root.children.filter((p) => p.name === 'Screens · Light')[0];
  if (!page) return out;
  await page.loadAsync();
  for (const s of page.children) {
    const kids = 'children' in s ? (s as ChildrenMixin).children : [];
    for (const f of kids) {
      if (f.type !== 'FRAME') continue;
      const label = f.name.replace(/^\d+\.\d+\s+/, '').toLowerCase();
      if (!out.has(label)) out.set(label, f as FrameNode);
    }
  }
  return out;
}

export function screenFor(screens: Map<string, FrameNode>, wanted: string): FrameNode | undefined {
  const w = wanted.trim().toLowerCase();
  if (screens.has(w)) return screens.get(w);
  const keys = Array.from(screens.keys());
  const hit = keys.filter((k) => k.indexOf(w) === 0)[0] || keys.filter((k) => k.indexOf(w) >= 0)[0];
  return hit ? screens.get(hit) : undefined;
}
