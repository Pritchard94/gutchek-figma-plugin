import { Token, TypeKey } from '../tokens';
import { Kid, abs, add, box, col, divider, fill, gradient, hexPaint, icon, recolor, row, text } from '../core/ui';
import { glyph, lockup, wordmark } from '../brand';
import { use } from '../components/library';

export const DESKTOP = 1440;
export const MOBILE = 390;
export const GUTTER = 120;

// ---------------------------------------------------------------- links

export const webLinks: Array<[SceneNode, string]> = [];

export function wlink<T extends SceneNode>(node: T, target: string): T {
  webLinks.push([node, target]);
  return node;
}

// ---------------------------------------------------------------- type

export const display = (size: number, line: number) => ({ family: 'display' as const, weight: 800 as const, size, line, tracking: -2.5 });
export const lead = { family: 'ui' as const, weight: 400 as const, size: 20, line: 32, tracking: -0.5 };

export function heading(eyebrow: string | null, title: string, sub: string | null, o: { align?: 'left' | 'center'; size?: number; w?: number; mobile?: boolean } = {}): FrameNode {
  const center = o.align === 'center';
  const size = o.size || (o.mobile ? 32 : 48);
  return col({ name: 'Heading · ' + title, gap: o.mobile ? 10 : 16, w: o.w || 'fill', cross: center ? 'center' : 'start' }, [
    eyebrow ? text(eyebrow, 'overline', 'brand/fg', { align: center ? 'center' : 'left' }) : null,
    text(title, display(size, Math.round(size * 1.14)), 'text/primary', { w: 'fill', align: center ? 'center' : 'left' }),
    sub ? text(sub, o.mobile ? 'body' : lead, 'text/secondary', { w: 'fill', align: center ? 'center' : 'left' }) : null,
  ]);
}

// ---------------------------------------------------------------- chrome

export function webPage(name: string, kids: Kid[], width = DESKTOP): FrameNode {
  const f = col({ name, w: width, fill: 'bg/canvas', clip: true }, kids);
  f.setPluginData('webpage', '1');
  return f;
}

export function section(name: string, kids: Kid[], o: { fill?: Token; pad?: [number, number]; gap?: number; cross?: 'start' | 'center' } = {}): FrameNode {
  const p = o.pad || [96, GUTTER];
  return col({ name, w: 'fill', pad: [p[0], p[1], p[0], p[1]], gap: o.gap === undefined ? 48 : o.gap, fill: o.fill, cross: o.cross || 'start' }, kids);
}

const NAV: Array<[string, string]> = [
  ['How it works', 'how'],
  ['Check a Chat', 'chat'],
  ['Trust and safety', 'trust'],
  ['Pricing', 'pricing'],
  ['Help', 'helpcenter'],
];

export function webNav(active?: string): FrameNode {
  const links = NAV.map(([label, id]) => wlink(text(label, active === id ? 'bodyStrong' : 'body', active === id ? 'brand/fg' : 'text/secondary'), id));
  return col({ name: 'Nav', w: 'fill', fill: 'bg/surface' }, [
    row({ name: 'Bar', w: 'fill', h: 80, pad: [0, GUTTER], cross: 'center', main: 'between' }, [
      wlink(lockup(30), 'landing'),
      row({ name: 'Links', gap: 36 }, links),
      row({ name: 'Actions', gap: 20 }, [wlink(text('Opt out or dispute', 'smallStrong', 'text/secondary'), 'optout'), wlink(use('Button', { Variant: 'Primary', Size: 'Medium' }, { label: 'Get the app' }), 'landing')]),
    ]),
    divider(),
  ]);
}

export function mobileNav(): FrameNode {
  return col({ name: 'Nav', w: 'fill', fill: 'bg/surface' }, [
    row({ name: 'Bar', w: 'fill', h: 64, pad: [0, 20], cross: 'center', main: 'between' }, [wlink(lockup(24), 'mLanding'), icon('sliders', 24, 'text/primary')]),
    divider(),
  ]);
}

function inverseText(str: string, style: TypeKey, opacity = 1, name?: string): TextNode {
  return text(str, style, 'text/inverse', { opacity, name });
}

export function webFooter(mobile = false): FrameNode {
  const colFor = (title: string, items: Array<[string, string | null]>) =>
    col({ name: title, gap: 14, w: mobile ? 150 : 180 }, [
      inverseText(title, 'overline', 0.6),
      ...items.map(([label, target]) => {
        const t = inverseText(label, 'small', 0.9);
        return target ? wlink(t, target) : t;
      }),
    ]);
  const columns = [
    colFor('Product', [
      ['How it works', 'how'],
      ['Check a Chat', 'chat'],
      ['Pricing', 'pricing'],
      ['Download the app', 'landing'],
    ]),
    colFor('Safety', [
      ['Trust and safety', 'trust'],
      ['Community guidelines', 'guidelines'],
      ['Opt out of Gutchek', 'optout'],
      ['Dispute a finding', 'dispute'],
      ['Check a request', 'status'],
    ]),
    colFor('Support', [
      ['Help centre', 'helpcenter'],
      ['Contact us', 'helpcenter'],
      ['Press', null],
    ]),
    colFor('Legal', [
      ['Privacy policy', 'privacy'],
      ['Terms of use', 'terms'],
      ['Cookie settings', null],
    ]),
  ];
  const brand = col({ name: 'Brand', gap: 16, w: mobile ? 'fill' : 360 }, [
    lockup(28, 'text/inverse', 'text/inverse'),
    inverseText('Know the person behind the DMs. A calm, evidence-first second opinion for dating and personal safety.', 'small', 0.7),
    row({ name: 'Badges', gap: 12 }, [storeBadge('apple'), storeBadge('google')]),
  ]);
  return col({ name: 'Footer', w: 'fill', pad: mobile ? [48, 20, 32, 20] : [80, GUTTER, 40, GUTTER], gap: mobile ? 32 : 56, fill: 'bg/inverse' }, [
    mobile ? col({ name: 'Top', gap: 32, w: 'fill' }, [brand, row({ name: 'Columns', gap: 24, w: 'fill', wrap: true, wrapGap: 32 }, columns)]) : row({ name: 'Top', gap: 48, w: 'fill', cross: 'start', main: 'between' }, [brand, row({ name: 'Columns', gap: 40 }, columns)]),
    box({ name: 'Rule', dir: 'h', w: 'fill', h: 1, fill: [hexPaint('#FFFFFF', 0.12)] }),
    (mobile ? col : row)({ name: 'Bottom', gap: 16, w: 'fill', main: mobile ? undefined : 'between' }, [
      inverseText('© 2026 Gutchek Technologies Ltd. Lagos, Nigeria.', 'caption', 0.6),
      inverseText('Gutchek is not a consumer reporting agency. Do not use Gutchek for employment, housing, credit or tenancy decisions.', 'caption', 0.6),
    ]),
  ]);
}

// ---------------------------------------------------------------- store badges

const APPLE =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"><path fill="#FFFFFF" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>';
const PLAY =
  '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">' +
  '<path fill="#00D7FE" d="M3.6 1.8 13.2 12l-9.6 10.2c-.4-.3-.6-.8-.6-1.4V3.2c0-.6.2-1.1.6-1.4z"/>' +
  '<path fill="#00F076" d="M3.6 1.8c.4-.3 1-.3 1.6 0l11.4 6.8-3.4 3.4z"/>' +
  '<path fill="#FF3A44" d="M13.2 12l3.4 3.4-11.4 6.8c-.6.3-1.2.3-1.6 0z"/>' +
  '<path fill="#FFCE00" d="m16.6 8.6 3.6 2.1c1.1.6 1.1 2 0 2.6l-3.6 2.1-3.4-3.4z"/>' +
  '</svg>';

export function storeBadge(kind: 'apple' | 'google', scale = 1): FrameNode {
  let logo: SceneNode;
  try {
    const n = figma.createNodeFromSvg(kind === 'apple' ? APPLE : PLAY);
    n.name = kind === 'apple' ? 'Apple logo' : 'Google Play logo';
    n.fills = [];
    logo = n;
  } catch (_) {
    logo = box({ name: 'Logo', w: 22, h: 22, dir: 'h' });
  }
  const small = text(kind === 'apple' ? 'Download on the' : 'GET IT ON', { family: 'ui', weight: 500, size: 10, line: 12 }, 'text/primary');
  const big = text(kind === 'apple' ? 'App Store' : 'Google Play', { family: 'ui', weight: 600, size: 18, line: 22, tracking: -1 }, 'text/primary');
  small.fills = [hexPaint('#FFFFFF')];
  big.fills = [hexPaint('#FFFFFF')];
  const b = row({ name: kind === 'apple' ? 'App Store badge' : 'Google Play badge', h: 52, pad: [0, 18, 0, 14], gap: 10, radius: 12, fill: [hexPaint('#000000')], cross: 'center' }, [
    logo,
    col({ name: 'Text', gap: 0 }, [small, big]),
  ]);
  b.strokes = [hexPaint('#FFFFFF', 0.18)];
  b.strokeWeight = 1;
  if (scale !== 1) b.rescale(scale);
  return b;
}

// ---------------------------------------------------------------- phone mockups

export function phone(screen: FrameNode | undefined, scale = 0.62, name = 'Phone'): FrameNode {
  const w = Math.round(393 * scale);
  const h = Math.round(852 * scale);
  const bezel = Math.max(6, Math.round(12 * scale));
  const frame = box({ name, dir: 'h', w: w + bezel * 2, h: h + bezel * 2, pad: bezel, radius: Math.round(62 * scale) + bezel, fill: [hexPaint('#0B0B12')], shadow: 'e3' });
  const view = box({ name: 'Screen', dir: 'none', w, h, radius: Math.round(56 * scale), clip: true, fill: 'bg/canvas' });
  if (screen) {
    const c = screen.clone();
    c.rescale(scale);
    view.appendChild(c);
    c.x = 0;
    c.y = 0;
  }
  frame.appendChild(view);
  return frame;
}

// ---------------------------------------------------------------- blocks

export function featureCard(iconName: string, title: string, body: string, w: number | 'fill' = 'fill'): FrameNode {
  return col({ name: title, gap: 14, w, pad: 28, radius: 24, fill: 'bg/surface', stroke: 'border/default' }, [
    box({ name: 'Icon', dir: 'h', w: 48, h: 48, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon(iconName, 24, 'brand/fg')]),
    text(title, 'h3', 'text/primary', { w: 'fill' }),
    text(body, 'body', 'text/secondary', { w: 'fill' }),
  ]);
}

export function check(label: string, ok = true, token: Token = 'text/primary'): FrameNode {
  return row({ name: label, gap: 12, w: 'fill', cross: 'start' }, [icon(ok ? 'check-circle' : 'x', 20, ok ? 'positive/fg' : 'caution/fg'), text(label, 'body', token, { w: 'fill' })]);
}

export function faq(items: Array<[string, string]>, openIndex = 0): FrameNode {
  return col(
    { name: 'FAQ', w: 'fill', radius: 24, fill: 'bg/surface', stroke: 'border/default', clip: true },
    items.map(([q, a], i) =>
      col({ name: q, w: 'fill', pad: [24, 28], gap: 10 }, [
        row({ name: 'Question', gap: 16, w: 'fill' }, [text(q, 'title', 'text/primary', { w: 'fill' }), icon(i === openIndex ? 'x' : 'plus', 20, 'text/secondary')]),
        i === openIndex ? text(a, 'body', 'text/secondary', { w: 'fill' }) : null,
      ]),
    ).reduce((acc: SceneNode[], n, i) => (i > 0 ? acc.concat([divider(), n]) : acc.concat([n])), []),
  );
}

export function ctaBand(title: string, sub: string, mobile = false): FrameNode {
  const band = col({ name: 'CTA', w: 'fill', pad: mobile ? [40, 24] : [72, 80], gap: 20, radius: mobile ? 24 : 40, cross: 'center', fill: [gradient([['#7556E3', 0], ['#2C1E66', 1]], 135)] }, [
    glyph(mobile ? 40 : 56, 'text/on-solid'),
    text(title, display(mobile ? 32 : 52, mobile ? 38 : 60), 'text/on-solid', { align: 'center', w: 'fill' }),
    text(sub, mobile ? 'body' : lead, 'text/on-solid', { align: 'center', w: 'fill', opacity: 0.85 }),
    (mobile ? col : row)({ name: 'Badges', gap: 12, cross: 'center' }, [storeBadge('apple'), storeBadge('google')]),
  ]);
  return band;
}

export function legalLayout(title: string, updated: string, toc: string[], sections: Array<[string, string[]]>): FrameNode {
  return row({ name: 'Legal', w: 'fill', pad: [64, GUTTER, 96, GUTTER], gap: 80, cross: 'start' }, [
    col({ name: 'Contents', gap: 12, w: 260, pad: 24, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
      text('On this page', 'overline', 'text/tertiary'),
      ...toc.map((t, i) => text(t, i === 0 ? 'smallStrong' : 'small', i === 0 ? 'brand/fg' : 'text/secondary', { w: 'fill' })),
    ]),
    col({ name: 'Body', gap: 40, w: 'fill' }, [
      col({ name: 'Title', gap: 12, w: 'fill' }, [
        text(title, display(48, 56), 'text/primary', { w: 'fill' }),
        row({ name: 'Meta', gap: 12 }, [text(updated, 'small', 'text/tertiary'), use('ConfidenceBadge', { Level: 'Medium' }, { label: 'Draft for legal review' })]),
      ]),
      ...sections.map(([h, paras]) =>
        col({ name: h, gap: 12, w: 'fill' }, [text(h, 'h2', 'text/primary', { w: 'fill' }), ...paras.map((p) => text(p, lead, 'text/secondary', { w: 'fill' }))]),
      ),
    ]),
  ]);
}

export { abs, add, box, col, divider, fill, glyph, icon, lockup, recolor, row, text, wordmark };
