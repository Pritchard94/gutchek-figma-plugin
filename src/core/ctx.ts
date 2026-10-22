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

export const PLUGIN_KEY = 'libra';
export const NAME_PREFIX = 'Libra';

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
export function later(fn: () => Promise<unknown>) {
  ctx.pending.push(fn);
}

export async function flush() {
  const jobs = ctx.pending;
  ctx.pending = [];
  const size = 200;
  for (let i = 0; i < jobs.length; i += size) {
    await Promise.all(
      jobs.slice(i, i + size).map((j) =>
        j().catch((e) => {
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

export async function createVariables() {
  try {
    const prim = figma.variables.createVariableCollection(NAME_PREFIX + ' / Primitives');
    const pMode = prim.modes[0].modeId;
    prim.renameMode(pMode, 'Value');
    for (const ramp of Object.keys(primitives)) {
      for (const step of Object.keys(primitives[ramp])) {
        const v = figma.variables.createVariable(ramp + '/' + step, prim, 'COLOR');
        const c = hexToRgba(primitives[ramp][step]);
        v.setValueForMode(pMode, c);
        v.scopes = [];
        v.hiddenFromPublishing = true;
        ctx.primitiveVars.set(ramp + '/' + step, v);
      }
    }

    const dims = figma.variables.createVariableCollection(NAME_PREFIX + ' / Dimensions');
    const dMode = dims.modes[0].modeId;
    dims.renameMode(dMode, 'Value');
    for (const s of spacing) {
      const v = figma.variables.createVariable('space/' + s, dims, 'FLOAT');
      v.setValueForMode(dMode, s);
      v.scopes = ['GAP', 'WIDTH_HEIGHT'];
      setCodeSyntax(v, 'spacing-' + s);
      ctx.dimensionVars.set(s, v);
    }
    for (const key of Object.keys(radius) as Array<keyof typeof radius>) {
      const v = figma.variables.createVariable('radius/' + key, dims, 'FLOAT');
      v.setValueForMode(dMode, radius[key]);
      v.scopes = ['CORNER_RADIUS'];
      setCodeSyntax(v, 'rounded-' + key);
      ctx.radiusVars.set(radius[key], v);
    }

    const color = figma.variables.createVariableCollection(NAME_PREFIX + ' / Color');
    ctx.colorCollection = color;
    ctx.lightModeId = color.modes[0].modeId;
    color.renameMode(ctx.lightModeId, 'Light');
    try {
      ctx.darkModeId = color.addMode('Dark');
      ctx.modes = true;
    } catch (_) {
      ctx.modes = false;
      warn('This Figma plan allows one variable mode per collection, so dark tokens live in a separate "Color Dark" collection.');
    }

    const valueFor = (ref: string): VariableValue => {
      if (isPrimitiveRef(ref)) {
        const pv = ctx.primitiveVars.get(ref);
        if (pv) return figma.variables.createVariableAlias(pv);
      }
      const r = resolveRef(ref);
      return hexToRgba(r.hex, r.alpha);
    };

    const make = (collection: VariableCollection, modeId: string, theme: Theme | 'both') => {
      for (const token of Object.keys(semantic)) {
        const def = semantic[token];
        const v = figma.variables.createVariable(token, collection, 'COLOR');
        v.scopes = scopesFor(def.group);
        setCodeSyntax(v, token.replace('/', '-'));
        if (theme === 'both') {
          v.setValueForMode(ctx.lightModeId, valueFor(def.light));
          v.setValueForMode(ctx.darkModeId, valueFor(def.dark));
          ctx.colorVars.light.set(token, v);
          ctx.colorVars.dark.set(token, v);
        } else {
          v.setValueForMode(modeId, valueFor(def[theme]));
          ctx.colorVars[theme].set(token, v);
        }
      }
    };

    if (ctx.modes) {
      make(color, ctx.lightModeId, 'both');
    } else {
      make(color, ctx.lightModeId, 'light');
      const dark = figma.variables.createVariableCollection(NAME_PREFIX + ' / Color Dark');
      const m = dark.modes[0].modeId;
      dark.renameMode(m, 'Dark');
      ctx.darkCollection = dark;
      ctx.darkModeId = m;
      make(dark, m, 'dark');
    }
  } catch (e) {
    warn('Variables could not be created (' + String(e) + '). Raw colours are used instead.');
  }
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

export function createStyles() {
  for (const key of Object.keys(typeScale) as TypeKey[]) {
    const t = typeScale[key] as (typeof typeScale)[TypeKey] & { upper?: boolean };
    const s = figma.createTextStyle();
    s.name = NAME_PREFIX + '/' + t.name;
    s.fontName = font(t.family, t.weight);
    s.fontSize = t.size;
    s.lineHeight = { unit: 'PIXELS', value: t.line };
    s.letterSpacing = { unit: 'PERCENT', value: t.tracking };
    if (t.upper) s.textCase = 'UPPER';
    s.description = t.usage;
    ctx.textStyles.set(key, s);
  }
  for (const key of Object.keys(elevation) as Array<keyof typeof elevation>) {
    const e = elevation[key];
    const s = figma.createEffectStyle();
    s.name = NAME_PREFIX + '/' + e.name;
    s.description = e.usage;
    s.effects = shadowEffects(key);
    ctx.effectStyles.set(key, s);
  }
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

// ---------------------------------------------------------------- cleanup

export async function removePrevious() {
  for (const c of await figma.variables.getLocalVariableCollectionsAsync()) {
    if (c.name.indexOf(NAME_PREFIX + ' / ') === 0) c.remove();
  }
  for (const s of await figma.getLocalTextStylesAsync()) {
    if (s.name.indexOf(NAME_PREFIX + '/') === 0) s.remove();
  }
  for (const s of await figma.getLocalEffectStylesAsync()) {
    if (s.name.indexOf(NAME_PREFIX + '/') === 0) s.remove();
  }
}
