import { Theme, Token, TypeKey } from '../tokens';
import { ctx, NAME_PREFIX, applyThemeMode } from '../core/ctx';
import {
  Tone,
  add,
  avatar,
  box,
  circle,
  col,
  divider,
  findByName,
  hexPaint,
  icon,
  iconComps,
  paint,
  pill,
  platformBadge,
  recolor,
  rect,
  row,
  setText,
  shadow,
  text,
  toneTokens,
} from '../core/ui';
import { ICONS, iconSvg } from '../icons';
import { glyph } from '../brand';
import { Tilt, scaleDial } from './scale';

type Props = Record<string, string>;

interface Def {
  set: string;
  group: string;
  description: string;
  variants: Props[];
  build: (p: Props) => SceneNode;
}

const defs: Def[] = [];
const registry = new Map<string, ComponentNode>();
let shared = true;

function define(set: string, group: string, description: string, variants: Props[], build: (p: Props) => SceneNode) {
  defs.push({ set, group, description, variants, build });
}

function cross(a: Record<string, string[]>): Props[] {
  let out: Props[] = [{}];
  for (const k of Object.keys(a)) {
    const next: Props[] = [];
    for (const o of out) for (const v of a[k]) next.push(Object.assign({}, o, { [k]: v }));
    out = next;
  }
  return out;
}

function propsName(p: Props): string {
  return Object.keys(p)
    .map((k) => k + '=' + p[k])
    .join(', ');
}

function vkey(set: string, p: Props, theme: Theme): string {
  return (shared ? '' : theme + ':') + set + '|' + propsName(p);
}

export function named<T extends SceneNode>(n: T, name: string): T {
  n.name = name;
  return n;
}

function hidden<T extends SceneNode>(n: T, hide = true): T {
  n.visible = !hide;
  return n;
}

export interface UseOpts {
  hide?: string[];
  show?: string[];
  icons?: Record<string, string>;
  name?: string;
}

function firstStrokePaint(node: SceneNode): Paint | null {
  let found: Paint | null = null;
  const visit = (n: SceneNode) => {
    if (found) return;
    if ('children' in n) {
      for (const c of (n as ChildrenMixin).children) visit(c as SceneNode);
      return;
    }
    const g = n as GeometryMixin;
    if (Array.isArray(g.strokes) && g.strokes.length) found = g.strokes[0] as Paint;
  };
  visit(node);
  return found;
}

function applyPaint(node: SceneNode, p: Paint) {
  const visit = (n: SceneNode) => {
    if ('children' in n) {
      for (const c of (n as ChildrenMixin).children) visit(c as SceneNode);
      return;
    }
    const g = n as GeometryMixin;
    if (Array.isArray(g.strokes) && g.strokes.length) g.strokes = [p];
    if (Array.isArray(g.fills) && (g.fills as Paint[]).length) g.fills = [p];
  };
  visit(node);
}

export function swapIcon(root: SceneNode, layer: string, iconName: string, token?: Token) {
  const n = findByName(root, layer);
  const c = iconComps.get(iconName);
  if (!n || !c || n.type !== 'INSTANCE') return;
  const before = firstStrokePaint(n);
  n.swapComponent(c);
  n.name = layer;
  if (token) recolor(n, token);
  else if (before) applyPaint(n, before);
}

/** Place an instance of a library component and override its text layers. */
export function use(set: string, props: Props = {}, texts: Record<string, string> = {}, o: UseOpts = {}): SceneNode {
  const def = defs.find((d) => d.set === set);
  if (!def) throw new Error('Unknown component ' + set);
  const full = Object.assign({}, def.variants[0], props);
  const comp = registry.get(vkey(set, full, ctx.theme));
  const node = comp ? comp.createInstance() : def.build(full);
  for (const k of Object.keys(texts)) setText(node, k, texts[k]);
  for (const k of o.hide || []) {
    const n = findByName(node, k);
    if (n) n.visible = false;
  }
  for (const k of o.show || []) {
    const n = findByName(node, k);
    if (n) n.visible = true;
  }
  if (o.icons) for (const k of Object.keys(o.icons)) swapIcon(node, k, o.icons[k]);
  node.name = o.name || set;
  return node;
}

// ---------------------------------------------------------------- definitions

function statusBar(): FrameNode {
  const bars = row({ name: 'Signal', gap: 2, cross: 'end' }, [4, 6, 8, 10].map((h, i) => rect(3, h, 'text/primary', 1, 'Bar ' + (i + 1))));
  const battery = row({ name: 'Battery', gap: 1, cross: 'center' }, [
    box({ name: 'Body', dir: 'h', w: 25, h: 12, radius: 4, pad: 2, stroke: 'border/strong' }, [rect(19, 8, 'text/primary', 2, 'Level')]),
    rect(1.5, 4, 'border/strong', 1, 'Cap'),
  ]);
  return row({ name: 'StatusBar', w: 393, h: 54, pad: [0, 28, 0, 44], main: 'between', cross: 'center' }, [
    text('9:41', { family: 'ui', weight: 600, size: 17, tracking: -2 }, 'text/primary', { name: 'time' }),
    row({ name: 'Indicators', gap: 6 }, [bars, icon('wifi', 18, 'text/primary'), battery]),
  ]);
}

define('StatusBar', 'System', 'iOS status bar. Colour follows text/primary so it flips with the theme.', [{}], statusBar);

define('HomeIndicator', 'System', 'iOS home indicator area, 34pt.', [{}], () =>
  box({ name: 'HomeIndicator', dir: 'h', w: 393, h: 34, main: 'center', cross: 'end', pad: [0, 0, 8, 0] }, [rect(134, 5, 'text/primary', 3, 'Indicator')]),
);

const TABS = [
  { key: 'Home', icon: 'home' },
  { key: 'Saved', icon: 'bookmark' },
  { key: 'Safety', icon: 'shield' },
  { key: 'Settings', icon: 'settings' },
];

define('TabBar', 'Navigation', 'Primary navigation. Four destinations from the spec: Home, Saved, Safety, Settings.', cross({ Active: TABS.map((t) => t.key) }), (p) =>
  col({ name: 'TabBar', w: 393, fill: 'bg/surface' }, [
    divider(),
    row(
      { name: 'Tabs', w: 'fill', pad: [8, 8, 0, 8] },
      TABS.map((t) => {
        const on = p.Active === t.key;
        const c: Token = on ? 'brand/fg' : 'text/tertiary';
        return col({ name: 'tab-' + t.key.toLowerCase(), w: 'fill', gap: 4, cross: 'center', pad: [4, 0] }, [
          icon(t.icon, 24, c),
          text(t.key, { family: 'ui', weight: on ? 600 : 500, size: 11, line: 14 }, c, { name: 'label-' + t.key.toLowerCase() }),
        ]);
      }),
    ),
    use('HomeIndicator'),
  ]),
);

define('NavBar', 'Navigation', 'Inline bar for pushed screens, Large for tab roots. Swap action-icon per screen.', cross({ Type: ['Inline', 'Large'] }), (p) => {
  if (p.Type === 'Large') {
    return row({ name: 'NavBar', w: 393, pad: [8, 20, 12, 20], gap: 12, cross: 'center' }, [
      text('Title', 'h1', 'text/primary', { name: 'title', w: 'fill' }),
      box({ name: 'action', dir: 'h', w: 40, h: 40, radius: 20, fill: 'bg/subtle', main: 'center', cross: 'center' }, [named(icon('bell', 20, 'text/primary'), 'action-icon')]),
    ]);
  }
  return row({ name: 'NavBar', w: 393, h: 44, pad: [0, 8], cross: 'center' }, [
    box({ name: 'back', dir: 'h', w: 44, h: 44, main: 'center', cross: 'center' }, [named(icon('chevron-left', 24, 'text/primary'), 'back-icon')]),
    text('Title', 'title', 'text/primary', { name: 'title', w: 'fill', align: 'center' }),
    box({ name: 'action', dir: 'h', w: 44, h: 44, main: 'center', cross: 'center' }, [named(icon('more', 24, 'text/primary'), 'action-icon')]),
  ]);
});

define('SheetHeader', 'Navigation', 'Top of every bottom sheet: grabber, title and close.', [{}], () =>
  col({ name: 'SheetHeader', w: 393, pad: [8, 20, 8, 20], gap: 12, cross: 'center' }, [
    rect(36, 5, 'border/strong', 3, 'Grabber'),
    row({ name: 'Title row', w: 'fill', gap: 12 }, [
      text('Sheet title', 'h3', 'text/primary', { name: 'title', w: 'fill' }),
      box({ name: 'close', dir: 'h', w: 32, h: 32, radius: 16, fill: 'bg/subtle', main: 'center', cross: 'center' }, [icon('x', 18, 'text/secondary')]),
    ]),
  ]),
);

const BTN_H: Props = { Large: '52', Medium: '44', Small: '36' };
const BTN_PAD: Props = { Large: '20', Medium: '16', Small: '12' };

define(
  'Button',
  'Actions and inputs',
  'One primary action per screen. Destructive is reserved for deleting data. Use the hidden icon layer for leading icons.',
  cross({ Variant: ['Primary', 'Secondary', 'Tertiary', 'Destructive'], Size: ['Large', 'Medium', 'Small'] }),
  (p) => {
    const fg: Token = p.Variant === 'Secondary' ? 'text/primary' : p.Variant === 'Tertiary' ? 'brand/fg' : 'text/on-solid';
    const bg: Token | null = p.Variant === 'Primary' ? 'brand/solid' : p.Variant === 'Destructive' ? 'caution/solid' : p.Variant === 'Secondary' ? 'bg/surface' : null;
    const style: TypeKey = p.Size === 'Small' ? 'smallStrong' : 'bodyStrong';
    return row(
      {
        name: 'Button',
        h: parseInt(BTN_H[p.Size], 10),
        pad: [0, parseInt(BTN_PAD[p.Size], 10)],
        gap: 8,
        main: 'center',
        cross: 'center',
        radius: 12,
        fill: bg,
        stroke: p.Variant === 'Secondary' ? 'border/strong' : undefined,
      },
      [hidden(named(icon('plus', p.Size === 'Small' ? 16 : 20, fg), 'icon')), text('Button', style, fg, { name: 'label' })],
    );
  },
);

define('IconButton', 'Actions and inputs', '44pt touch target. Always give it an accessibility label in code.', cross({ Style: ['Ghost', 'Tonal', 'Solid'] }), (p) =>
  box(
    {
      name: 'IconButton',
      dir: 'h',
      w: 44,
      h: 44,
      radius: 22,
      main: 'center',
      cross: 'center',
      fill: p.Style === 'Tonal' ? 'bg/subtle' : p.Style === 'Solid' ? 'brand/solid' : null,
    },
    [named(icon('share', 20, p.Style === 'Solid' ? 'text/on-solid' : 'text/primary'), 'icon')],
  ),
);

define('TextField', 'Actions and inputs', 'Label above, helper below. Error state always pairs colour with a message.', cross({ State: ['Default', 'Focused', 'Filled', 'Error'] }), (p) => {
  const border: Token = p.State === 'Focused' ? 'border/focus' : p.State === 'Error' ? 'caution/fg' : 'border/strong';
  return col({ name: 'TextField', w: 353, gap: 6 }, [
    text('Label', 'label', 'text/secondary', { name: 'label' }),
    row({ name: 'Field', w: 'fill', h: 52, pad: [0, 16], gap: 8, radius: 12, fill: 'bg/surface', stroke: border, strokeW: p.State === 'Focused' ? 2 : 1 }, [
      hidden(named(icon('user', 20, 'text/tertiary'), 'leading')),
      hidden(text('+234', 'body', 'text/primary', { name: 'prefix' })),
      text(p.State === 'Default' ? 'Placeholder' : 'Value', 'body', p.State === 'Default' ? 'text/tertiary' : 'text/primary', { name: 'value' }),
      hidden(rect(2, 22, 'brand/fg', 1, 'caret'), p.State !== 'Focused'),
      box({ name: 'spacer', w: 'fill', h: 1 }),
      hidden(named(icon('chevron-down', 20, 'text/tertiary'), 'trailing')),
    ]),
    hidden(text(p.State === 'Error' ? 'Enter a valid handle' : 'Helper text', 'caption', p.State === 'Error' ? 'caution/fg' : 'text/tertiary', { name: 'helper' }), p.State !== 'Error'),
  ]);
});

define('Chip', 'Actions and inputs', 'Filters and single choices.', cross({ Selected: ['Off', 'On'] }), (p) => {
  const on = p.Selected === 'On';
  return row({ name: 'Chip', h: 36, pad: [0, 14], gap: 6, radius: 999, fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'brand/border' : 'border/strong', cross: 'center' }, [
    hidden(named(icon('check', 16, on ? 'brand/on-subtle' : 'text/secondary'), 'icon'), !on),
    text('Chip', 'smallStrong', on ? 'brand/on-subtle' : 'text/primary', { name: 'label' }),
  ]);
});

define('Segmented', 'Actions and inputs', 'Two-way switch, used for Caution | Positive and Phone | Email.', cross({ Active: ['First', 'Second'] }), (p) => {
  const seg = (key: string, label: string, on: boolean) =>
    box({ name: 'Segment ' + key, dir: 'h', w: 'fill', h: 'fill', main: 'center', cross: 'center', radius: 9, fill: on ? 'bg/raised' : null, shadow: on ? 'e1' : undefined }, [
      text(label, 'smallStrong', on ? 'text/primary' : 'text/secondary', { name: key }),
    ]);
  return row({ name: 'Segmented', w: 353, h: 44, pad: 4, gap: 4, radius: 12, fill: 'bg/subtle' }, [seg('first', 'First', p.Active === 'First'), seg('second', 'Second', p.Active === 'Second')]);
});

define('Switch', 'Actions and inputs', 'Binary settings. 51 by 31, iOS proportions.', cross({ State: ['On', 'Off'] }), (p) => {
  const knob = circle(27, 'text/on-solid', 'Knob');
  shadow(knob, 'e1');
  return box({ name: 'Switch', dir: 'h', w: 51, h: 31, pad: 2, radius: 999, fill: p.State === 'On' ? 'brand/solid' : 'bg/muted', main: p.State === 'On' ? 'end' : 'start', cross: 'center' }, [knob]);
});

define('CheckRow', 'Actions and inputs', 'Attestations and checklists. The whole row is the tap target.', cross({ Checked: ['On', 'Off'] }), (p) => {
  const on = p.Checked === 'On';
  return row({ name: 'CheckRow', w: 353, pad: 16, gap: 12, radius: 16, fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'brand/border' : 'border/default', cross: 'start' }, [
    box({ name: 'Checkbox', dir: 'h', w: 24, h: 24, radius: 7, fill: on ? 'brand/solid' : null, stroke: on ? undefined : 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, [on ? icon('check', 16, 'text/on-solid') : null]),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text('Title', 'bodyStrong', 'text/primary', { name: 'title', w: 'fill' }), text('Supporting text', 'small', 'text/secondary', { name: 'body', w: 'fill' })]),
  ]);
});

define(
  'ScaleDial',
  'Libra report',
  'The signature element. Tilts toward the heavier side; Pending animates while loading, Low shows capped scores in neutral.',
  cross({ Tilt: ['Positive', 'Balanced', 'Caution', 'Pending', 'Low'] }),
  (p) => {
    const scores: Record<string, [string, string]> = { Positive: ['2', '8'], Balanced: ['5', '5'], Caution: ['8', '3'], Pending: ['–', '–'], Low: ['1', '2'] };
    const s = scores[p.Tilt];
    return scaleDial(p.Tilt as Tilt, s[0], s[1]);
  },
);

define('ScoreBadge', 'Libra report', 'Compact score for lists. Icon plus label, never colour alone.', cross({ Side: ['Caution', 'Positive'] }), (p) =>
  pill(p.Side === 'Caution' ? 'Caution 2' : 'Positive 8', p.Side === 'Caution' ? 'caution' : 'positive', p.Side === 'Caution' ? 'alert-triangle' : 'check-circle', 'ScoreBadge'),
);

define('ConfidenceBadge', 'Libra report', 'Shown next to every score. Low data means low confidence, never a neutral result.', cross({ Level: ['High', 'Medium', 'Low'] }), (p) => {
  const tone: Tone = p.Level === 'High' ? 'brand' : p.Level === 'Medium' ? 'warning' : 'neutral';
  const t = toneTokens[tone];
  const n = p.Level === 'High' ? 3 : p.Level === 'Medium' ? 2 : 1;
  return row({ name: 'ConfidenceBadge', gap: 6, pad: [4, 10, 4, 8], radius: 999, fill: t.bg }, [
    row({ name: 'Bars', gap: 2, cross: 'end' }, [6, 9, 12].map((h, i) => rect(3, h, i < n ? t.fg : 'border/strong', 1, 'Bar ' + (i + 1)))),
    text(p.Level + ' confidence', 'label', t.fg, { name: 'label' }),
  ]);
});

define('SignalCard', 'Libra report', 'One finding, always linked to its source. Wording describes content, never the person.', cross({ Side: ['Caution', 'Positive'] }), (p) => {
  const caution = p.Side === 'Caution';
  const t = toneTokens[caution ? 'caution' : 'positive'];
  const sev = pill(caution ? 'High' : 'Strong', 'neutral', undefined, 'severity-pill');
  const sevText = sev.findOne((n) => n.type === 'TEXT');
  if (sevText) sevText.name = 'severity';
  return col({ name: 'SignalCard', w: 353, pad: 16, gap: 12, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Header', gap: 12, w: 'fill', cross: 'start' }, [
      box({ name: 'Icon tile', dir: 'h', w: 36, h: 36, radius: 10, fill: t.bg, main: 'center', cross: 'center' }, [icon(caution ? 'alert-triangle' : 'check-circle', 20, t.fg)]),
      col({ name: 'Titles', gap: 2, w: 'fill' }, [
        text(caution ? 'Content flagged as degrading toward women' : 'Supportive comments to women in tech', 'bodyStrong', 'text/primary', { name: 'category', w: 'fill' }),
        text(caution ? '4 posts · most recent Mar 2026' : '23 comments · 2022 to 2026', 'small', 'text/secondary', { name: 'meta', w: 'fill' }),
      ]),
      sev,
    ]),
    col({ name: 'Evidence', gap: 8, w: 'fill', pad: 12, radius: 12, fill: 'bg/subtle' }, [
      row({ name: 'Source row', gap: 8, w: 'fill' }, [platformBadge('X', 20), text('X · own post · 14 Mar 2026', 'caption', 'text/secondary', { name: 'source', w: 'fill' })]),
      text(caution ? '"Women only want you for what you can buy them. Learnt that the hard way."' : '"Proud of you! Your talk on accessibility was the best one today."', 'small', 'text/primary', { name: 'snippet', w: 'fill' }),
    ]),
    row({ name: 'Actions', gap: 20, w: 'fill' }, [
      row({ name: 'View source', gap: 6 }, [icon('external-link', 16, 'brand/fg'), text('View source', 'smallStrong', 'brand/fg', { name: 'view-source' })]),
      row({ name: 'Not relevant', gap: 6 }, [icon('eye-off', 16, 'text/secondary'), text('Not relevant', 'smallStrong', 'text/secondary', { name: 'not-relevant' })]),
    ]),
  ]);
});

function fact(iconName: string, label: string, layer: string): FrameNode {
  return row({ name: 'Fact ' + layer, gap: 8, w: 'fill' }, [icon(iconName, 16, 'text/tertiary'), text(label, 'small', 'text/secondary', { name: layer, w: 'fill' })]);
}

define('MatchCard', 'Libra report', 'Candidate account in the confirmation stack. Possible matches are excluded from scoring unless confirmed.', cross({ Tier: ['Confirmed', 'Likely', 'Possible'] }), (p) => {
  const pct = p.Tier === 'Confirmed' ? 92 : p.Tier === 'Likely' ? 64 : 31;
  const tone: Tone = p.Tier === 'Confirmed' ? 'positive' : p.Tier === 'Likely' ? 'warning' : 'neutral';
  const t = toneTokens[tone];
  const tier = pill(p.Tier, tone, p.Tier === 'Confirmed' ? 'shield-check' : p.Tier === 'Likely' ? 'link' : 'help', 'tier-pill');
  const tierText = tier.findOne((n) => n.type === 'TEXT');
  if (tierText) tierText.name = 'tier';
  const trackW = 281;
  return col({ name: 'MatchCard', w: 321, pad: 20, gap: 16, radius: 24, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    row({ name: 'Top', gap: 12, w: 'fill', cross: 'start' }, [
      avatar('TA', 56, 'brand'),
      col({ name: 'Identity', gap: 4, w: 'fill' }, [
        text('Tobi Adeyemi', 'h3', 'text/primary', { name: 'name', w: 'fill' }),
        row({ name: 'Handle row', gap: 6 }, [platformBadge('IG', 18), text('@tobi.adeyemi', 'small', 'text/secondary', { name: 'handle' })]),
      ]),
      tier,
    ]),
    text('Product designer. Lagos. Football on Sundays, jollof debates all week.', 'small', 'text/secondary', { name: 'bio', w: 'fill' }),
    col({ name: 'Facts', gap: 8, w: 'fill' }, [fact('map-pin', 'Lagos, Nigeria', 'location'), fact('users', '1k to 5k followers', 'followers'), fact('link', 'Links to TikTok and X in bio', 'links')]),
    divider(),
    col({ name: 'Strength', gap: 8, w: 'fill' }, [
      row({ name: 'Strength head', gap: 8, w: 'fill' }, [text('Match strength', 'smallStrong', 'text/primary', { w: 'fill' }), text(pct + '%', 'smallStrong', t.fg, { name: 'strength' })]),
      box({ name: 'Track', dir: 'h', w: trackW, h: 8, radius: 4, fill: 'bg/muted' }, [rect(Math.round((trackW * pct) / 100), 8, t.solid, 4, 'Bar')]),
    ]),
  ]);
});

define('TraitBar', 'Libra report', 'Communication-style trait on a five-step scale. Observations of public behaviour, not diagnoses.', cross({ Level: ['1', '2', '3', '4', '5'] }), (p) => {
  const level = parseInt(p.Level, 10);
  return col({ name: 'TraitBar', w: 353, gap: 8 }, [
    row({ name: 'Head', gap: 8, w: 'fill' }, [text('Tone', 'bodyStrong', 'text/primary', { name: 'label', w: 'fill' }), text('Warm', 'smallStrong', 'brand/fg', { name: 'value' })]),
    row({ name: 'Segments', gap: 4, w: 'fill' }, [1, 2, 3, 4, 5].map((i) => rect('fill', 8, i <= level ? 'brand/solid' : 'bg/muted', 4, 'Segment ' + i))),
    text('High confidence · 142 posts', 'caption', 'text/tertiary', { name: 'note' }),
  ]);
});

define('ProgressStep', 'Libra report', 'Staged progress on the processing screen.', cross({ State: ['Done', 'Active', 'Pending'] }), (p) => {
  let indicator: FrameNode;
  if (p.State === 'Done') {
    indicator = box({ name: 'Indicator', dir: 'h', w: 28, h: 28, radius: 14, fill: 'positive/solid', main: 'center', cross: 'center' }, [icon('check', 16, 'text/on-solid')]);
  } else if (p.State === 'Active') {
    const ring = figma.createEllipse();
    ring.name = 'Ring';
    ring.resize(22, 22);
    ring.arcData = { startingAngle: -Math.PI / 2, endingAngle: Math.PI * 0.9, innerRadius: 0.72 };
    ring.fills = [paint('brand/fg')];
    indicator = box({ name: 'Indicator', dir: 'h', w: 28, h: 28, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [ring]);
  } else {
    indicator = box({ name: 'Indicator', dir: 'h', w: 28, h: 28, radius: 14, stroke: 'border/strong', strokeW: 1.5, main: 'center', cross: 'center' }, []);
  }
  return row({ name: 'ProgressStep', w: 353, gap: 14, cross: 'start' }, [
    indicator,
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      text('Step', 'bodyStrong', p.State === 'Pending' ? 'text/tertiary' : 'text/primary', { name: 'label', w: 'fill' }),
      text('Detail', 'small', p.State === 'Pending' ? 'text/tertiary' : 'text/secondary', { name: 'detail', w: 'fill' }),
    ]),
  ]);
});

define('ListRow', 'Content and feedback', 'Settings and navigation rows. Group rows inside a surface card with dividers.', cross({ Trailing: ['Chevron', 'Value', 'SwitchOn', 'SwitchOff', 'None'] }), (p) => {
  let trailing: SceneNode | null = null;
  if (p.Trailing === 'Chevron') trailing = icon('chevron-right', 20, 'text/tertiary');
  if (p.Trailing === 'Value') trailing = row({ name: 'Trailing', gap: 4 }, [text('Value', 'small', 'text/secondary', { name: 'value' }), icon('chevron-right', 20, 'text/tertiary')]);
  if (p.Trailing === 'SwitchOn') trailing = use('Switch', { State: 'On' });
  if (p.Trailing === 'SwitchOff') trailing = use('Switch', { State: 'Off' });
  return row({ name: 'ListRow', w: 353, pad: [12, 16], gap: 12, minH: 60 }, [
    box({ name: 'Icon tile', dir: 'h', w: 36, h: 36, radius: 10, fill: 'bg/subtle', main: 'center', cross: 'center' }, [named(icon('user', 20, 'text/secondary'), 'icon')]),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text('Title', 'body', 'text/primary', { name: 'title', w: 'fill' }), text('Supporting text', 'small', 'text/secondary', { name: 'subtitle', w: 'fill' })]),
    trailing,
  ]);
});

define('Avatar', 'Content and feedback', 'Initials only. Libra never shows a searched person\'s photo outside match confirmation.', cross({ Size: ['32', '40', '56', '72'] }), (p) => avatar('AO', parseInt(p.Size, 10), 'brand'));

define('Toast', 'Content and feedback', 'Brief confirmation. Auto-dismisses after 4 seconds; never carries the only copy of important information.', cross({ Tone: ['Neutral', 'Positive', 'Caution'] }), (p) =>
  row({ name: 'Toast', w: 353, pad: [14, 16], gap: 12, radius: 14, fill: 'bg/inverse', shadow: 'e2' }, [
    icon(p.Tone === 'Positive' ? 'check-circle' : p.Tone === 'Caution' ? 'alert-triangle' : 'info', 20, 'text/inverse'),
    text('Report saved to Saved', 'smallStrong', 'text/inverse', { name: 'message', w: 'fill' }),
  ]),
);

define('EmptyState', 'Content and feedback', 'Calm empty states lead with the scale and one clear next step.', [{}], () =>
  col({ name: 'EmptyState', w: 353, pad: [20, 24], gap: 10, cross: 'center' }, [
    box({ name: 'Art', dir: 'h', w: 80, h: 80, radius: 40, fill: 'brand/subtle', main: 'center', cross: 'center' }, [glyph(44, 'brand/fg')]),
    text('Nothing here yet', 'h3', 'text/primary', { name: 'title', align: 'center', w: 'fill' }),
    text('Supporting copy explains what will appear here and why.', 'small', 'text/secondary', { name: 'body', align: 'center', w: 'fill' }),
  ]),
);

// ---------------------------------------------------------------- build

function configureSet(cs: ComponentSetNode) {
  const n = cs.children.length;
  let maxW = 0;
  for (const c of cs.children) maxW = Math.max(maxW, c.width);
  const vertical = maxW > 300;
  cs.layoutMode = vertical ? 'VERTICAL' : 'HORIZONTAL';
  cs.itemSpacing = 24;
  cs.paddingTop = cs.paddingBottom = cs.paddingLeft = cs.paddingRight = 32;
  cs.counterAxisAlignItems = 'MIN';
  if (!vertical && n > 4) {
    cs.layoutWrap = 'WRAP';
    cs.counterAxisSpacing = 24;
    cs.resize(4 * maxW + 3 * 24 + 64, cs.height);
    cs.layoutSizingHorizontal = 'FIXED';
    cs.layoutSizingVertical = 'HUG';
  } else {
    cs.layoutSizingHorizontal = 'HUG';
    cs.layoutSizingVertical = 'HUG';
  }
  cs.fills = [];
  cs.strokes = [hexPaint('#9747FF')];
  cs.dashPattern = [10, 5];
  cs.strokeWeight = 1;
  cs.cornerRadius = 16;
}

function buildIcons(): FrameNode {
  const grid = row({ name: 'Icons', w: 1100, gap: 16, wrap: true, wrapGap: 16 }, []);
  for (const name of Object.keys(ICONS)) {
    let node: FrameNode;
    try {
      node = figma.createNodeFromSvg(iconSvg(ICONS[name]));
    } catch (e) {
      ctx.warnings.push('Icon ' + name + ' failed to import');
      continue;
    }
    const comp = figma.createComponentFromNode(node);
    comp.name = 'Icon/' + name;
    comp.fills = [];
    comp.clipsContent = false;
    comp.description = 'Lucide ' + name + ', 24pt, 1.5 stroke.';
    for (const c of comp.children) {
      try {
        (c as ConstraintMixin & SceneNode).constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
      } catch (_) {
        /* groups have no constraints */
      }
    }
    recolor(comp, 'text/primary');
    iconComps.set(name, comp);
    const cell = col({ name: name, w: 120, pad: [16, 8], gap: 10, cross: 'center', radius: 12, fill: 'bg/surface', stroke: 'border/default' }, []);
    cell.appendChild(comp);
    add(cell, text(name, 'caption', 'text/secondary', { align: 'center' }));
    add(grid, cell);
  }
  return grid;
}

const GROUP_NOTES: Record<string, string> = {
  System: 'Device chrome shared by every screen.',
  Navigation: 'How people move through Libra.',
  'Actions and inputs': 'Controls with 44pt minimum touch targets and visible focus.',
  'Libra report': 'The building blocks of a Libra report. Every number expands into evidence.',
  'Content and feedback': 'Lists, people and system messages.',
};

function sectionFor(groups: Map<string, FrameNode>, root: FrameNode, group: string): FrameNode {
  let wrap = groups.get(group);
  if (wrap) return wrap;
  const sectionFrame = col({ name: group, gap: 24, w: 'fill' }, [
    text(group, 'h1', 'text/primary'),
    text(GROUP_NOTES[group] || '', 'body', 'text/secondary'),
  ]);
  wrap = row({ name: group + ' items', gap: 32, wrap: true, wrapGap: 32, w: 'fill', cross: 'start' }, []);
  add(sectionFrame, wrap);
  add(root, sectionFrame);
  groups.set(group, wrap);
  return wrap;
}

function buildSetFor(def: Def, theme: Theme, holder: FrameNode) {
  const comps: ComponentNode[] = [];
  for (const v of def.variants) {
    const node = def.build(v);
    const comp = node.type === 'COMPONENT' ? node : figma.createComponentFromNode(node);
    comp.name = def.variants.length > 1 ? propsName(v) : NAME_PREFIX + '/' + def.set;
    comp.description = def.description;
    registry.set(vkey(def.set, v, theme), comp);
    comps.push(comp);
  }
  if (comps.length > 1) {
    for (const c of comps) holder.appendChild(c);
    const cs = figma.combineAsVariants(comps, holder);
    cs.name = NAME_PREFIX + '/' + def.set;
    cs.description = def.description;
    configureSet(cs);
  } else {
    holder.appendChild(comps[0]);
  }
}

export function buildLibrary(page: PageNode, sharedMode: boolean): FrameNode[] {
  shared = sharedMode;
  const roots: FrameNode[] = [];
  const themes: Theme[] = sharedMode ? ['light'] : ['light', 'dark'];
  for (const theme of themes) {
    ctx.theme = theme;
    const root = col({ name: 'Components · ' + (theme === 'dark' ? 'Dark' : 'Light'), w: 2600, pad: 96, gap: 96, fill: 'bg/canvas', radius: 40 }, [
      col({ name: 'Header', gap: 12, w: 'fill' }, [
        text('Libra · Components', 'overline', 'brand/fg'),
        text('Component library', { family: 'display', weight: 800, size: 64, line: 72, tracking: -2.5 }, 'text/primary'),
        text(
          'Every component is bound to Libra colour variables and text styles. Switch a frame to the Dark mode and instances re-theme automatically. Variant properties mirror the props used in code (src/components).',
          { family: 'ui', weight: 400, size: 20, line: 32 },
          'text/secondary',
          { w: 1100 },
        ),
      ]),
    ]);
    applyThemeMode(root, theme);
    page.appendChild(root);
    if (theme === 'light') {
      const iconsSection = col({ name: 'Icons', gap: 24, w: 'fill' }, [
        text('Iconography', 'h1', 'text/primary'),
        text('Lucide, 24pt grid, 1.5 stroke, round caps and joins. Each icon is a component; instances recolour through variables.', 'body', 'text/secondary'),
        buildIcons(),
      ]);
      add(root, iconsSection);
    }
    const groups = new Map<string, FrameNode>();
    for (const def of defs) {
      const wrap = sectionFor(groups, root, def.group);
      const card = col({ name: def.set, gap: 16, pad: 32, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [
        text(def.set, 'h3', 'text/primary'),
        text(def.description, 'small', 'text/secondary', { w: 420 }),
      ]);
      add(wrap, card);
      buildSetFor(def, theme, card);
    }
    roots.push(root);
  }
  ctx.theme = 'light';
  return roots;
}