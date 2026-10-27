import { Token } from '../tokens';
import { abs, add, box, circle, col, icon, lineBetween, paint, rect, row, text } from '../core/ui';

export type Tilt = 'Caution' | 'Balanced' | 'Positive' | 'Pending' | 'Low';

const W = 353;
const CX = W / 2;
const R = 116;
const BAND = 16;
const CY = R + 14;
const H = CY + 62;

/** Angles in Figma arcs run clockwise from 3 o'clock, so the top of the dial is 1.5π. */
const TOP = Math.PI * 1.5;

function arc(name: string, from: number, to: number, fill: Token, radius = R, band = BAND): EllipseNode {
  const e = figma.createEllipse();
  e.name = name;
  e.resize(radius * 2, radius * 2);
  e.arcData = { startingAngle: from, endingAngle: to, innerRadius: (radius - band) / radius };
  e.fills = [paint(fill)];
  return e;
}

function scoreBlock(side: 'caution' | 'positive', score: string, tilt: Tilt): FrameNode {
  const quiet = tilt === 'Pending' || tilt === 'Low';
  const fg: Token = tilt === 'Pending' ? 'text/tertiary' : quiet ? 'text/secondary' : side === 'caution' ? 'caution/fg' : 'positive/fg';
  return col({ name: side === 'caution' ? 'Red Flag' : 'Green Flag', w: 112, gap: 0, cross: side === 'caution' ? 'start' : 'end' }, [
    row({ name: 'Label', gap: 5 }, [
      icon(side === 'caution' ? 'flag' : 'check-circle', 14, quiet ? 'text/tertiary' : fg),
      text(side === 'caution' ? 'Red Flag' : 'Green Flag', { family: 'ui', weight: 600, size: 12, line: 16 }, quiet ? 'text/secondary' : fg),
    ]),
    row({ name: 'Score', gap: 1, cross: 'baseline' }, [
      text(score, { family: 'display', weight: 800, size: 36, line: 40, tracking: -2 }, fg, { name: side === 'caution' ? 'caution-score' : 'positive-score' }),
      text('/10', 'caption', 'text/tertiary', { name: 'out-of' }),
    ]),
  ]);
}

/**
 * The Gut Meter: a semi-circle dial, red half for caution and green half for positive.
 * Each half fills from the top outward with its own score; the needle settles toward the heavier side.
 */
export function scaleDial(tilt: Tilt, caution = '2', positive = '8'): FrameNode {
  const f = box({ name: 'GutMeter', dir: 'none', w: W, h: H });
  const quiet = tilt === 'Pending' || tilt === 'Low';
  const c = parseFloat(caution) || 0;
  const p = parseFloat(positive) || 0;
  const gap = 0.035;
  const quarter = Math.PI / 2;

  add(f, abs(arc('Red track', Math.PI, TOP - gap, quiet ? 'bg/muted' : 'caution/subtle'), CX - R, CY - R));
  add(f, abs(arc('Green track', TOP + gap, Math.PI * 2, quiet ? 'bg/muted' : 'positive/subtle'), CX - R, CY - R));
  if (!quiet || tilt === 'Low') {
    const cs = Math.max(0.06, c / 10) * (quarter - gap);
    const ps = Math.max(0.06, p / 10) * (quarter - gap);
    add(f, abs(arc('Red fill', TOP - gap - cs, TOP - gap, quiet ? 'border/strong' : 'caution/solid'), CX - R, CY - R));
    add(f, abs(arc('Green fill', TOP + gap, TOP + gap + ps, quiet ? 'border/strong' : 'positive/solid'), CX - R, CY - R));
  }

  for (let i = 0; i <= 20; i++) {
    const a = Math.PI + (i / 20) * Math.PI;
    const major = i % 5 === 0;
    const r1 = R - BAND - 8;
    const r2 = r1 - (major ? 8 : 4);
    add(f, lineBetween(CX + Math.cos(a) * r1, CY + Math.sin(a) * r1, CX + Math.cos(a) * r2, CY + Math.sin(a) * r2, major ? 'border/strong' : 'border/default', major ? 2 : 1.5, 'Tick'));
  }

  const lean = tilt === 'Pending' ? 0 : Math.max(-1, Math.min(1, (p - c) / 10));
  const a = TOP + lean * quarter * 0.92;
  const len = R - BAND - 22;
  const needle: Token = quiet ? 'text/tertiary' : 'text/primary';
  add(f, lineBetween(CX, CY, CX + Math.cos(a) * len, CY + Math.sin(a) * len, needle, 5, 'Needle'));
  add(f, abs(circle(26, 'bg/surface', 'Hub'), CX - 13, CY - 13));
  add(f, abs(circle(14, needle, 'Hub core'), CX - 7, CY - 7));

  add(f, abs(scoreBlock('caution', caution, tilt), 0, CY + 8));
  add(f, abs(scoreBlock('positive', positive, tilt), W - 112, CY + 8));
  return f;
}

/** Compact two-sided bar used in lists and compare: caution grows left, positive grows right. */
export function balanceBar(caution: number, positive: number, width = 140): FrameNode {
  const half = width / 2 - 1;
  const seg = (value: number, token: Token, side: 'l' | 'r') =>
    box({ name: side === 'l' ? 'Caution track' : 'Positive track', dir: 'h', w: half, h: 6, radius: 3, fill: 'bg/muted', main: side === 'l' ? 'end' : 'start' }, [
      rect(Math.max(2, Math.round((half * value) / 10)), 6, token, 3, side === 'l' ? 'Caution' : 'Positive'),
    ]);
  return row({ name: 'Balance bar', gap: 2 }, [seg(caution, 'caution/fg', 'l'), seg(positive, 'positive/fg', 'r')]);
}
