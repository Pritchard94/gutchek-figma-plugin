export type Theme = 'light' | 'dark';

export const primitives: Record<string, Record<string, string>> = {
  indigo: {
    '50': '#F4F1FE',
    '100': '#EAE4FD',
    '200': '#D6CBFB',
    '300': '#B8A6F7',
    '400': '#9479F0',
    '500': '#7556E3',
    '600': '#5B3FD1',
    '700': '#4A30B0',
    '800': '#3B278C',
    '900': '#2C1E66',
    '950': '#1E1645',
  },
  emerald: {
    '50': '#ECFDF3',
    '100': '#D1FADF',
    '200': '#A6F0C4',
    '300': '#6CDE9F',
    '400': '#3CCB7F',
    '500': '#1FAE66',
    '600': '#178F55',
    '700': '#1B7F4B',
    '800': '#14603A',
    '900': '#0F472C',
    '950': '#0D2A1C',
  },
  red: {
    '50': '#FEF3F2',
    '100': '#FEE4E2',
    '200': '#FECDCA',
    '300': '#FDA29B',
    '400': '#F97066',
    '500': '#F04438',
    '600': '#D92D20',
    '700': '#B42318',
    '800': '#912018',
    '900': '#7A271A',
    '950': '#2E1411',
  },
  amber: {
    '50': '#FFF9EB',
    '100': '#FEF0CC',
    '200': '#FCDF99',
    '300': '#F9CC66',
    '400': '#F5B83D',
    '500': '#E9A21F',
    '600': '#C98414',
    '700': '#A16610',
    '800': '#7C4E10',
    '900': '#5E3B0F',
    '950': '#2B1D0A',
  },
  orange: {
    '50': '#FFF4ED',
    '200': '#FDD3B4',
    '400': '#FB8A4C',
    '700': '#C2410C',
    '800': '#9A3412',
    '950': '#2C1407',
  },
  ink: { '900': '#1F2937' },
  neutral: {
    '0': '#FFFFFF',
    '25': '#FCFCFD',
    '50': '#F9FAFB',
    '100': '#F2F4F7',
    '200': '#E4E7EC',
    '300': '#D0D5DD',
    '400': '#98A2B3',
    '500': '#667085',
    '600': '#475467',
    '700': '#344054',
    '800': '#1D2939',
    '900': '#101828',
  },
  'name-blue': { fg: '#2563EB', 'fg-dark': '#7DB4FF', tint: '#DBEAFE', 'tint-dark': '#172554' },
  'name-sky': { fg: '#0369A1', 'fg-dark': '#5CC8FF', tint: '#E0F2FE', 'tint-dark': '#0C2A40' },
  'name-teal': { fg: '#0F766E', 'fg-dark': '#3DD6C3', tint: '#CCFBF1', 'tint-dark': '#0B2E2B' },
  'name-purple': { fg: '#9333EA', 'fg-dark': '#C9A2FF', tint: '#F3E8FF', 'tint-dark': '#2E1450' },
  'name-magenta': { fg: '#C026D3', 'fg-dark': '#F28CF5', tint: '#FAE8FF', 'tint-dark': '#3A0F3F' },
  'name-orange': { fg: '#C2410C', 'fg-dark': '#FF9E6B', tint: '#FFEDD5', 'tint-dark': '#3A1A0B' },
  'name-brown': { fg: '#92400E', 'fg-dark': '#E0B07A', tint: '#FEF3C7', 'tint-dark': '#33210C' },
  'name-slate': { fg: '#475569', 'fg-dark': '#B8C2D3', tint: '#E2E8F0', 'tint-dark': '#1E2533' },
  night: {
    '50': '#F5F5FA',
    '300': '#CFCFDC',
    '400': '#A9A9BC',
    '500': '#8A8AA1',
    '600': '#4A4A63',
    '700': '#34344A',
    '800': '#262636',
    '850': '#1C1C2A',
    '900': '#14141F',
    '950': '#0B0B12',
  },
};

/** A semantic value is a primitive reference ("indigo/600") or a raw hex with optional alpha ("#101828@0.5"). */
type Ref = string;

export const semantic: Record<string, { light: Ref; dark: Ref; group: 'bg' | 'text' | 'border' | 'icon' | 'any' }> = {
  'bg/canvas': { light: 'neutral/50', dark: 'night/950', group: 'bg' },
  'bg/surface': { light: 'neutral/0', dark: 'night/900', group: 'bg' },
  'bg/raised': { light: 'neutral/0', dark: 'night/850', group: 'bg' },
  'bg/subtle': { light: 'neutral/100', dark: 'night/850', group: 'bg' },
  'bg/muted': { light: 'neutral/200', dark: 'night/800', group: 'bg' },
  'bg/inverse': { light: 'neutral/900', dark: 'night/50', group: 'bg' },
  'bg/scrim': { light: '#101828@0.48', dark: '#000000@0.64', group: 'bg' },

  'text/primary': { light: 'ink/900', dark: 'night/50', group: 'text' },
  'text/secondary': { light: 'neutral/600', dark: 'night/400', group: 'text' },
  'text/tertiary': { light: 'neutral/500', dark: 'night/500', group: 'text' },
  'text/inverse': { light: 'neutral/0', dark: 'night/950', group: 'text' },
  'text/on-solid': { light: 'neutral/0', dark: 'neutral/0', group: 'text' },

  'border/default': { light: 'neutral/200', dark: 'night/800', group: 'border' },
  'border/strong': { light: 'neutral/300', dark: 'night/700', group: 'border' },
  'border/focus': { light: 'indigo/600', dark: 'indigo/400', group: 'border' },

  'brand/solid': { light: 'indigo/600', dark: 'indigo/500', group: 'any' },
  'brand/solid-pressed': { light: 'indigo/700', dark: 'indigo/600', group: 'any' },
  'brand/fg': { light: 'indigo/600', dark: 'indigo/400', group: 'any' },
  'brand/subtle': { light: 'indigo/50', dark: 'indigo/950', group: 'bg' },
  'brand/on-subtle': { light: 'indigo/700', dark: 'indigo/300', group: 'text' },
  'brand/border': { light: 'indigo/200', dark: 'indigo/800', group: 'border' },

  'positive/solid': { light: 'emerald/700', dark: 'emerald/700', group: 'any' },
  'positive/fg': { light: 'emerald/700', dark: 'emerald/400', group: 'any' },
  'positive/subtle': { light: 'emerald/50', dark: 'emerald/950', group: 'bg' },
  'positive/border': { light: 'emerald/200', dark: 'emerald/800', group: 'border' },

  'caution/solid': { light: 'red/700', dark: 'red/600', group: 'any' },
  'caution/fg': { light: 'red/700', dark: 'red/400', group: 'any' },
  'caution/subtle': { light: 'red/50', dark: 'red/950', group: 'bg' },
  'caution/border': { light: 'red/200', dark: 'red/800', group: 'border' },

  /** Action Amber is reserved for the one main button on each screen. Never a flag or severity colour. */
  'action/solid': { light: 'amber/400', dark: 'amber/400', group: 'any' },
  'action/pressed': { light: 'amber/500', dark: 'amber/300', group: 'any' },
  'action/on': { light: 'ink/900', dark: 'ink/900', group: 'any' },
  'action/subtle': { light: 'amber/50', dark: 'amber/950', group: 'bg' },

  /** Operational warnings (SLAs, medium confidence) use orange so they never read as the action colour. */
  'warning/fg': { light: 'orange/700', dark: 'orange/400', group: 'any' },
  'warning/subtle': { light: 'orange/50', dark: 'orange/950', group: 'bg' },
  'warning/border': { light: 'orange/200', dark: 'orange/800', group: 'border' },
};

/** Member identity colours for Rooms: stable per nickname, never red or green (reserved for signals). */
export const NAME_HUES = ['blue', 'sky', 'teal', 'purple', 'magenta', 'orange', 'brown', 'slate'];
for (const hue of NAME_HUES) {
  semantic['name/' + hue] = { light: 'name-' + hue + '/fg', dark: 'name-' + hue + '/fg-dark', group: 'text' };
  semantic['name/' + hue + '-tint'] = { light: 'name-' + hue + '/tint', dark: 'name-' + hue + '/tint-dark', group: 'bg' };
}

export type Token = keyof typeof semantic & string;

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function hexToRgba(hex: string, alpha = 1): RGBA {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: alpha,
  };
}

export function isPrimitiveRef(ref: Ref): boolean {
  return !ref.startsWith('#');
}

export function resolveRef(ref: Ref): { hex: string; alpha: number } {
  if (ref.startsWith('#')) {
    const [hex, a] = ref.split('@');
    return { hex, alpha: a ? parseFloat(a) : 1 };
  }
  const [ramp, step] = ref.split('/');
  const hex = primitives[ramp] && primitives[ramp][step];
  if (!hex) throw new Error('Unknown primitive ' + ref);
  return { hex, alpha: 1 };
}

export function tokenHex(token: Token, theme: Theme): string {
  return resolveRef(semantic[token][theme]).hex;
}

export function tokenRgba(token: Token, theme: Theme): RGBA {
  const r = resolveRef(semantic[token][theme]);
  return hexToRgba(r.hex, r.alpha);
}

function channel(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgba(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export type Weight = 400 | 500 | 600 | 700 | 800;
export type Family = 'display' | 'ui';

export interface TypeStyle {
  name: string;
  family: Family;
  weight: Weight;
  size: number;
  line: number;
  tracking: number;
  upper?: boolean;
  usage: string;
}

export const typeScale = {
  display: { name: 'Display', family: 'display', weight: 800, size: 48, line: 56, tracking: -2, usage: 'Score numerals, hero statements' },
  h1: { name: 'Heading/H1', family: 'display', weight: 700, size: 32, line: 40, tracking: -1.5, usage: 'Screen titles (large)' },
  h2: { name: 'Heading/H2', family: 'display', weight: 700, size: 24, line: 32, tracking: -1, usage: 'Section titles, verdicts' },
  h3: { name: 'Heading/H3', family: 'display', weight: 600, size: 20, line: 28, tracking: -0.5, usage: 'Card titles, sheet titles' },
  title: { name: 'Title', family: 'ui', weight: 600, size: 17, line: 24, tracking: -0.5, usage: 'Nav bar titles, list titles' },
  body: { name: 'Body/Regular', family: 'ui', weight: 400, size: 16, line: 24, tracking: -0.5, usage: 'Paragraphs, inputs' },
  bodyStrong: { name: 'Body/Strong', family: 'ui', weight: 600, size: 16, line: 24, tracking: -0.5, usage: 'Buttons, emphasis' },
  small: { name: 'Body Small/Regular', family: 'ui', weight: 400, size: 14, line: 20, tracking: -0.25, usage: 'Supporting copy, metadata' },
  smallStrong: { name: 'Body Small/Strong', family: 'ui', weight: 600, size: 14, line: 20, tracking: -0.25, usage: 'Small buttons, chips' },
  label: { name: 'Label', family: 'ui', weight: 500, size: 13, line: 18, tracking: 0, usage: 'Field labels, tab labels' },
  caption: { name: 'Caption', family: 'ui', weight: 400, size: 12, line: 16, tracking: 0, usage: 'Timestamps, footnotes' },
  overline: { name: 'Overline', family: 'ui', weight: 600, size: 11, line: 16, tracking: 8, upper: true, usage: 'Section eyebrows' },
} satisfies Record<string, TypeStyle>;

export type TypeKey = keyof typeof typeScale;

export const spacing = [2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64];

export const radius = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export interface ShadowSpec {
  y: number;
  blur: number;
  spread: number;
  alpha: number;
}

export const elevation: Record<'e1' | 'e2' | 'e3', { name: string; usage: string; layers: ShadowSpec[] }> = {
  e1: {
    name: 'Elevation/1 Card',
    usage: 'Cards and list groups on canvas',
    layers: [
      { y: 1, blur: 2, spread: 0, alpha: 0.06 },
      { y: 1, blur: 3, spread: 0, alpha: 0.1 },
    ],
  },
  e2: {
    name: 'Elevation/2 Floating',
    usage: 'Swipe cards, floating buttons, toasts',
    layers: [
      { y: 4, blur: 8, spread: -2, alpha: 0.1 },
      { y: 2, blur: 4, spread: -2, alpha: 0.06 },
    ],
  },
  e3: {
    name: 'Elevation/3 Overlay',
    usage: 'Bottom sheets, dialogs',
    layers: [
      { y: 20, blur: 24, spread: -4, alpha: 0.08 },
      { y: 8, blur: 8, spread: -4, alpha: 0.03 },
    ],
  },
};

export const device = { width: 393, height: 852, statusBar: 54, homeIndicator: 34, margin: 20 };
