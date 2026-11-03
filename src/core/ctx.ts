import {
  Theme,
  Token,
  TypeKey,
  Weight,
  Family,
  elevation,
  hexToRgba,
  isPrimitiveRef,
  primitives,
  radius,
  resolveRef,
  semantic,
  spacing,
  typeScale,
} from '../tokens';

export const NAME_PREFIX = 'Gutchek';
/** Shared plugin data namespace, readable by every Gutchek plugin (plain plugin data is private to one plugin id). */
const SHARED_NS = 'gutchek';

export function tag(node: BaseNode, key: string, value: string) {
  node.setSharedPluginData(SHARED_NS, key, value);
}

export function tagOf(node: BaseNode, key: string): string {
  return node.getSharedPluginData(SHARED_NS, key);
}
/** Prefixes from earlier runs, including the product's former name, removed before regenerating. */
const OLD_PREFIXES = [NAME_PREFIX, 'Libra'];

type FontMap = Record<Weight, FontName>;

export const ctx = {
  theme: 'light' as Theme,
  /** True when one colour collection holds both Light and Dark modes. */
  modes: false,
  colorCollection: null as VariableCollection | null,
  darkCollection: null as VariableCollection | null,
  lightModeId: '',
  darkModeId: '',
  colorVars: { light: new Map<string, Variable>(), dark: new Map<string, Variable>() },
  primitiveVars: new Map<string, Variable>(),
  dimensionVars: new Map<number, Variable>(),
  radiusVars: new Map<number, Variable>(),
  textStyles: new Map<TypeKey, TextStyle>(),
  effectStyles: new Map<string, EffectStyle>(),
  fonts: { display: {} as FontMap, ui: {} as FontMap },
  fontFallback: false,
  pending: [] as Array<() => Promise<unknown>>,
  warnings: [] as string[],
};

export function warn(msg: string) {
  if (ctx.warnings.indexOf(msg) === -1) ctx.warnings.push(msg);
}

/** Queue an async API call (style links, reactions) so builders can stay synchronous. */
export function later(fn: () => Promise<unknown>, node?: BaseNode) {
  ctx.pending.push(node ? () => (node.removed ? Promise.resolve() : fn()) : fn);
}

export async function flush() {
  const jobs = ctx.pending;
  ctx.pending = [];
  const size = 200;
  for (let i = 0; i < jobs.length; i += size) {
    await Promise.all(
      jobs.slice(i, i + size).map((j) =>
        Promise.resolve()
          .then(j)
          .catch((e) => {
            warn('Deferred call failed: ' + String(e && e.message ? e.message : e));
          }),
      ),
    );
  }
}

// ---------------------------------------------------------------- fonts

const STYLE_NAMES: Record<Weight, string[]> = {
  400: ['Regular', 'Book', 'Normal'],
  500: ['Medium'],
  600: ['SemiBold', 'Semi Bold', 'Semibold', 'DemiBold'],
  700: ['Bold'],
  800: ['ExtraBold', 'Extra Bold', 'Extrabold', 'Heavy', 'Black'],
};

const norm = (s: string) => s.toLowerCase().replace(/[\s_-]/g, '');

export async function loadFonts() {
  const available = await figma.listAvailableFontsAsync();
  const byFamily = new Map<string, string[]>();
  for (const f of available) {
    const list = byFamily.get(f.fontName.family) || [];
    list.push(f.fontName.style);
    byFamily.set(f.fontName.family, list);
  }

  const pick = (families: string[], weight: Weight): FontName | null => {
    for (const family of families) {
      const styles = byFamily.get(family);
      if (!styles) continue;
      const wanted = STYLE_NAMES[weight].map(norm);
      const hit = styles.find((s) => wanted.indexOf(norm(s)) !== -1);
      if (hit) return { family, style: hit };
      const order: Weight[] = weight >= 600 ? [700, 600, 800, 500, 400] : [500, 400, 600];
      for (const w of order) {
        const alt = styles.find((s) => STYLE_NAMES[w].map(norm).indexOf(norm(s)) !== -1);
        if (alt) return { family, style: alt };
      }
    }
    return null;
  };

  const weights: Weight[] = [400, 500, 600, 700, 800];
  const families: Record<Family, string[]> = {
    display: ['Plus Jakarta Sans', 'Inter'],
    ui: ['Inter', 'Plus Jakarta Sans'],
  };
  if (!byFamily.has('Plus Jakarta Sans')) {
    ctx.fontFallback = true;
    warn('Plus Jakarta Sans not available, display type falls back to Inter.');
  }
  for (const fam of ['display', 'ui'] as Family[]) {
    for (const w of weights) {
      const f = pick(families[fam], w) || { family: 'Inter', style: 'Regular' };
      ctx.fonts[fam][w] = f;
    }
  }
  const unique = new Map<string, FontName>();
  unique.set('Inter|Regular', { family: 'Inter', style: 'Regular' });
  for (const fam of ['display', 'ui'] as Family[]) {
    for (const w of weights) {
      const f = ctx.fonts[fam][w];
      unique.set(f.family + '|' + f.style, f);
    }
  }
  await Promise.all(Array.from(unique.values()).map((f) => figma.loadFontAsync(f)));
}

export function font(family: Family, weight: Weight): FontName {
  return ctx.fonts[family][weight];
}

// ---------------------------------------------------------------- variables

function setCodeSyntax(v: Variable, web: string) {
  try {
    v.setVariableCodeSyntax('WEB', web);
  } catch (_) {
    /* optional */
  }
}

function scopesFor(group: string): VariableScope[] {
  if (group === 'text') return ['TEXT_FILL'];
  if (group === 'bg') return ['FRAME_FILL', 'SHAPE_FILL'];
  if (group === 'border') return ['STROKE_COLOR'];
  return ['ALL_FILLS', 'STROKE_COLOR'];
}

/** What a token sync did: how many variables and styles it created, and how many existing ones it rewrote. */
export interface SyncReport {
  created: number;
  updated: number;
}

/** True when the file already has the Gutchek colour collection (under the current or the former name). */
export async function hasTokens(): Promise<boolean> {
  const all = await figma.variables.getLocalVariableCollectionsAsync();
  return all.some((c) => OLD_PREFIXES.some((p) => c.name === p + ' / Color'));
}

/**
 * Connects ctx to the Gutchek variables in this file, creating any that are missing. Existing variables keep their
 * ids, so every binding elsewhere in the file survives. With `update`, existing values are rewritten from tokens.ts.
 */
export async function syncVariables(update: boolean): Promise<SyncReport> {
  const report: SyncReport = { created: 0, updated: 0 };
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const existing = await figma.variables.getLocalVariablesAsync();
    const findCollection = (name: string): VariableCollection | null => {
      const hit = collections.filter((c) => c.name === NAME_PREFIX + ' / ' + name)[0];
      if (hit) return hit;
      const legacy = collections.filter((c) => OLD_PREFIXES.some((p) => c.name === p + ' / ' + name))[0];
      if (legacy) legacy.name = NAME_PREFIX + ' / ' + name;
      return legacy || null;
    };
    const collection = (name: string, modeName: string): VariableCollection => {
      const found = findCollection(name);
      if (found) return found;
      const c = figma.variables.createVariableCollection(NAME_PREFIX + ' / ' + name);
      c.renameMode(c.modes[0].modeId, modeName);
      collections.push(c);
      return c;
    };
    const variable = (c: VariableCollection, name: string, type: VariableResolvedDataType): { v: Variable; write: boolean } => {
      const hit = existing.filter((v) => v.variableCollectionId === c.id && v.name === name)[0];
      if (hit) {
        if (update) report.updated++;
        return { v: hit, write: update };
      }
      report.created++;
      return { v: figma.variables.createVariable(name, c, type), write: true };
    };
    const modeNamed = (c: VariableCollection, name: string) => (c.modes.filter((m) => m.name === name)[0] || c.modes[0]).modeId;

    const prim = collection('Primitives', 'Value');
    const pMode = prim.modes[0].modeId;
    for (const ramp of Object.keys(primitives)) {
      for (const step of Object.keys(primitives[ramp])) {
        const { v, write } = variable(prim, ramp + '/' + step, 'COLOR');
        if (write) {
          v.setValueForMode(pMode, hexToRgba(primitives[ramp][step]));
          v.scopes = [];
          v.hiddenFromPublishing = true;
        }
        ctx.primitiveVars.set(ramp + '/' + step, v);
      }
    }

    const dims = collection('Dimensions', 'Value');
    const dMode = dims.modes[0].modeId;
    for (const s of spacing) {
      const { v, write } = variable(dims, 'space/' + s, 'FLOAT');
      if (write) {
        v.setValueForMode(dMode, s);
        v.scopes = ['GAP', 'WIDTH_HEIGHT'];
        setCodeSyntax(v, 'spacing-' + s);
      }
      ctx.dimensionVars.set(s, v);
    }
    for (const key of Object.keys(radius) as Array<keyof typeof radius>) {
      const { v, write } = variable(dims, 'radius/' + key, 'FLOAT');
      if (write) {
        v.setValueForMode(dMode, radius[key]);
        v.scopes = ['CORNER_RADIUS'];
        setCodeSyntax(v, 'rounded-' + key);
      }
      ctx.radiusVars.set(radius[key], v);
    }

    const color = collection('Color', 'Light');
    ctx.colorCollection = color;
    ctx.lightModeId = modeNamed(color, 'Light');
    let dark = findCollection('Color Dark');
    const darkMode = color.modes.filter((m) => m.name === 'Dark')[0];
    if (darkMode) {
      ctx.modes = true;
      ctx.darkModeId = darkMode.modeId;
    } else if (!dark) {
      try {
        ctx.darkModeId = color.addMode('Dark');
        ctx.modes = true;
      } catch (_) {
        ctx.modes = false;
      }
    }
    if (!ctx.modes) {
      warn('This Figma plan allows one variable mode per collection, so dark tokens live in a separate "Color Dark" collection.');
      dark = dark || collection('Color Dark', 'Dark');
      ctx.darkCollection = dark;
      ctx.darkModeId = dark.modes[0].modeId;
    }

    const valueFor = (ref: string): VariableValue => {
      if (isPrimitiveRef(ref)) {
        const pv = ctx.primitiveVars.get(ref);
        if (pv) return figma.variables.createVariableAlias(pv);
      }
      const r = resolveRef(ref);
      return hexToRgba(r.hex, r.alpha);
    };

    const make = (c: VariableCollection, modeId: string, theme: Theme | 'both') => {
      for (const token of Object.keys(semantic)) {
        const def = semantic[token];
        const { v, write } = variable(c, token, 'COLOR');
        if (write) {
          v.scopes = scopesFor(def.group);
          setCodeSyntax(v, token.replace('/', '-'));
          if (theme === 'both') {
            v.setValueForMode(ctx.lightModeId, valueFor(def.light));
            v.setValueForMode(ctx.darkModeId, valueFor(def.dark));
          } else {
            v.setValueForMode(modeId, valueFor(def[theme]));
          }
        }
        if (theme === 'both') {
          ctx.colorVars.light.set(token, v);
          ctx.colorVars.dark.set(token, v);
        } else {
          ctx.colorVars[theme].set(token, v);
        }
      }
    };

    if (ctx.modes) {
      make(color, ctx.lightModeId, 'both');
    } else {
      make(color, ctx.lightModeId, 'light');
      make(dark as VariableCollection, ctx.darkModeId, 'dark');
    }
  } catch (e) {
    warn('Variables could not be created (' + String(e) + '). Raw colours are used instead.');
  }
  return report;
}

/** Apply the Dark mode to a frame so bound variables resolve to dark values. */
export function applyThemeMode(node: FrameNode | SectionNode | ComponentNode, theme: Theme) {
  if (!ctx.modes || !ctx.colorCollection) return;
  try {
    node.setExplicitVariableModeForCollection(ctx.colorCollection, theme === 'dark' ? ctx.darkModeId : ctx.lightModeId);
  } catch (e) {
    warn('Could not set variable mode: ' + String(e));
  }
}

export function colorVar(token: Token, theme: Theme = ctx.theme): Variable | undefined {
  return ctx.colorVars[theme].get(token);
}

// ---------------------------------------------------------------- styles

/**
 * Connects ctx to the Gutchek text and effect styles, creating missing ones. Existing styles keep their ids, so text
 * and frames that use them stay linked. With `update`, their properties are rewritten from tokens.ts.
 */
export async function syncStyles(update: boolean): Promise<SyncReport> {
  const report: SyncReport = { created: 0, updated: 0 };
  const legacyName = (name: string) => OLD_PREFIXES.map((p) => p + name.slice(NAME_PREFIX.length));
  const pick = <S extends BaseStyle>(list: S[], name: string, create: () => S): { s: S; write: boolean } => {
    const hit = list.filter((s) => s.name === name)[0] || list.filter((s) => legacyName(name).indexOf(s.name) !== -1)[0];
    if (hit) {
      hit.name = name;
      if (update) report.updated++;
      return { s: hit, write: update };
    }
    const s = create();
    s.name = name;
    report.created++;
    return { s, write: true };
  };

  const texts = await figma.getLocalTextStylesAsync();
  for (const key of Object.keys(typeScale) as TypeKey[]) {
    const t = typeScale[key] as (typeof typeScale)[TypeKey] & { upper?: boolean };
    const { s, write } = pick(texts, NAME_PREFIX + '/' + t.name, () => figma.createTextStyle());
    if (write) {
      s.fontName = font(t.family, t.weight);
      s.fontSize = t.size;
      s.lineHeight = { unit: 'PIXELS', value: t.line };
      s.letterSpacing = { unit: 'PERCENT', value: t.tracking };
      s.textCase = t.upper ? 'UPPER' : 'ORIGINAL';
      s.description = t.usage;
    }
    ctx.textStyles.set(key, s);
  }

  const effects = await figma.getLocalEffectStylesAsync();
  for (const key of Object.keys(elevation) as Array<keyof typeof elevation>) {
    const e = elevation[key];
    const { s, write } = pick(effects, NAME_PREFIX + '/' + e.name, () => figma.createEffectStyle());
    if (write) {
      s.description = e.usage;
      s.effects = shadowEffects(key);
    }
    ctx.effectStyles.set(key, s);
  }
  const { s: glass, write } = pick(effects, NAME_PREFIX + '/Elevation/Glass', () => figma.createEffectStyle());
  if (write) {
    glass.description = 'Floating translucent chrome: tab bar and floating actions. Pair with a 72 to 80% surface fill.';
    glass.effects = (shadowEffects('e2') as Effect[]).concat([{ type: 'BACKGROUND_BLUR', blurType: 'NORMAL', radius: 24, visible: true }]);
  }
  ctx.effectStyles.set('glass', glass);
  return report;
}

/** How many Gutchek variables and styles tokens.ts defines that this file does not have yet. */
export async function missingTokenCount(): Promise<number> {
  const names = new Set<string>();
  const ours = (await figma.variables.getLocalVariableCollectionsAsync()).filter((c) => OLD_PREFIXES.some((p) => c.name.indexOf(p + ' / ') === 0));
  const byId = new Map(ours.map((c) => [c.id, c.name.slice(c.name.indexOf(' / ') + 3)] as [string, string]));
  for (const v of await figma.variables.getLocalVariablesAsync()) {
    const c = byId.get(v.variableCollectionId);
    if (c) names.add(c + '|' + v.name);
  }
  const styles = (await figma.getLocalTextStylesAsync() as BaseStyle[]).concat(await figma.getLocalEffectStylesAsync());
  for (const s of styles) {
    const prefix = OLD_PREFIXES.filter((p) => s.name.indexOf(p + '/') === 0)[0];
    if (prefix) names.add(NAME_PREFIX + s.name.slice(prefix.length));
  }
  let missing = 0;
  const need = (key: string) => {
    if (!names.has(key)) missing++;
  };
  for (const ramp of Object.keys(primitives)) for (const step of Object.keys(primitives[ramp])) need('Primitives|' + ramp + '/' + step);
  for (const s of spacing) need('Dimensions|space/' + s);
  for (const k of Object.keys(radius)) need('Dimensions|radius/' + k);
  for (const token of Object.keys(semantic)) need('Color|' + token);
  for (const k of Object.keys(typeScale) as TypeKey[]) need(NAME_PREFIX + '/' + typeScale[k].name);
  for (const k of Object.keys(elevation) as Array<keyof typeof elevation>) need(NAME_PREFIX + '/' + elevation[k].name);
  need(NAME_PREFIX + '/Elevation/Glass');
  return missing;
}

export function shadowEffects(key: keyof typeof elevation): Effect[] {
  return elevation[key].layers.map(
    (l): DropShadowEffect => ({
      type: 'DROP_SHADOW',
      color: { r: 16 / 255, g: 24 / 255, b: 40 / 255, a: l.alpha },
      offset: { x: 0, y: l.y },
      radius: l.blur,
      spread: l.spread,
      visible: true,
      blendMode: 'NORMAL',
    }),
  );
}