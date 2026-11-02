import { elevation, typeScale, TypeKey } from '../tokens';
import { NAME_PREFIX, createStyles, createVariables, ctx, loadFonts, warn } from '../core/ctx';
import { ICONS, iconSvg } from '../icons';
import { iconComps, recolor } from '../core/ui';

/**
 * Connects to the design system the Gutchek generator wrote into this file (variables, styles, icons), so graphics
 * stay bound to the same tokens. If the generator has not run here, the tokens and styles are created first.
 */
export async function attachDesignSystem(iconHolder: () => FrameNode): Promise<string[]> {
  const notes: string[] = [];
  await loadFonts();

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const color = collections.filter((c) => c.name === NAME_PREFIX + ' / Color')[0];
  if (!color) {
    await createVariables();
    notes.push('Gutchek colour variables were not in this file, so they were created.');
  } else {
    const dark = collections.filter((c) => c.name === NAME_PREFIX + ' / Color Dark')[0];
    const vars = await figma.variables.getLocalVariablesAsync('COLOR');
    ctx.colorCollection = color;
    ctx.modes = color.modes.length > 1;
    const mode = (c: VariableCollection, name: string) => (c.modes.filter((m) => m.name === name)[0] || c.modes[0]).modeId;
    ctx.lightModeId = mode(color, 'Light');
    ctx.darkModeId = ctx.modes ? mode(color, 'Dark') : dark ? dark.modes[0].modeId : ctx.lightModeId;
    for (const v of vars) {
      if (v.variableCollectionId === color.id) {
        ctx.colorVars.light.set(v.name, v);
        if (ctx.modes) ctx.colorVars.dark.set(v.name, v);
      } else if (dark && v.variableCollectionId === dark.id) ctx.colorVars.dark.set(v.name, v);
    }
  }

  const textStyles = await figma.getLocalTextStylesAsync();
  const effectStyles = await figma.getLocalEffectStylesAsync();
  const tsByName = new Map(textStyles.map((s) => [s.name, s] as [string, TextStyle]));
  const fxByName = new Map(effectStyles.map((s) => [s.name, s] as [string, EffectStyle]));
  const textHit = (Object.keys(typeScale) as TypeKey[]).every((k) => tsByName.has(NAME_PREFIX + '/' + typeScale[k].name));
  if (!textHit || !fxByName.has(NAME_PREFIX + '/Elevation/Glass')) {
    for (const s of textStyles) if (s.name.indexOf(NAME_PREFIX + '/') === 0) s.remove();
    for (const s of effectStyles) if (s.name.indexOf(NAME_PREFIX + '/') === 0) s.remove();
    createStyles();
    notes.push('Gutchek text and effect styles were created.');
  } else {
    for (const k of Object.keys(typeScale) as TypeKey[]) ctx.textStyles.set(k, tsByName.get(NAME_PREFIX + '/' + typeScale[k].name) as TextStyle);
    for (const k of Object.keys(elevation) as Array<keyof typeof elevation>) {
      const s = fxByName.get(NAME_PREFIX + '/' + elevation[k].name);
      if (s) ctx.effectStyles.set(k, s);
    }
    ctx.effectStyles.set('glass', fxByName.get(NAME_PREFIX + '/Elevation/Glass') as EffectStyle);
  }

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

/** App screens by label from the generator's Screens page, for phone mockups. Labels look like "3.1 Home". */
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
