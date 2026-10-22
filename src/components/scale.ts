import { Token } from '../tokens';
import { abs, add, box, circle, col, icon, lineBetween, placeRotated, rect, row, text, toneTokens, Tone } from '../core/ui';

export type Tilt = 'Caution' | 'Balanced' | 'Positive' | 'Pending' | 'Low';

const W = 353;
const CX = W / 2;
const PIVOT_Y = 14;
const BEAM = 216;
const CARD_W = 96;
const HANG = 12;
const BASE_Y = 128;
const H = BASE_Y + 6;
const TILT = 7;

function pan(side: 'caution' | 'positive', score: string, tilt: Tilt): FrameNode {
  const neutral = tilt === 'Pending' || tilt === 'Low';
  const tone: Tone = neutral ? 'neutral' : side;
  const t = toneTokens[tone];
  const numColor: Token = tilt === 'Pending' ? 'text/tertiary' : neutral ? 'text/secondary' : side === 'caution' ? 'caution/fg' : 'positive/fg';
  return col({ name: side === 'caution' ? 'Caution pan' : 'Positive pan', w: CARD_W, pad: [8, 10, 10, 10], gap: 0, radius: 14, fill: t.bg, stroke: t.border, cross: 'center' }, [
    row({ name: 'Label', gap: 4 }, [
      icon(side === 'caution' ? 'alert-triangle' : 'check-circle', 13, neutral ? 'text/tertiary' : t.fg),
      text(side === 'caution' ? 'Caution' : 'Positive', { family: 'ui', weight: 600, size: 12, line: 16 }, neutral ? 'text/secondary' : t.fg),
    ]),
    row({ name: 'Score', gap: 1, cross: 'baseline' }, [
      text(score, { family: 'display', weight: 800, size: 34, line: 38, tracking: -2 }, numColor, { name: side === 'caution' ? 'caution-score' : 'positive-score' }),
      text('/10', 'caption', 'text/tertiary', { name: 'out-of' }),
    ]),
  ]);
}

/** Compact Libra Scale: beam tilts toward the heavier pan; pans hang close under the beam. */
export function scaleDial(tilt: Tilt, caution = '2', positive = '8'): FrameNode {
  const f = box({ name: 'ScaleDial', dir: 'none', w: W, h: H });
  const deg = tilt === 'Caution' ? -TILT : tilt === 'Positive' ? TILT : 0;
  const a = (deg * Math.PI) / 180;
  const half = BEAM / 2 - 2;
  const left = { x: CX - Math.cos(a) * half, y: PIVOT_Y - Math.sin(a) * half };
  const right = { x: CX + Math.cos(a) * half, y: PIVOT_Y + Math.sin(a) * half };
  const beamToken: Token = tilt === 'Pending' || tilt === 'Low' ? 'text/tertiary' : 'brand/fg';

  add(f, abs(rect(3, BASE_Y - PIVOT_Y, beamToken, 1.5, 'Post'), CX - 1.5, PIVOT_Y));
  add(f, abs(rect(72, 6, beamToken, 3, 'Base'), CX - 36, BASE_Y));

  const cards: Array<[FrameNode, { x: number; y: number }]> = [
    [pan('caution', caution, tilt), left],
    [pan('positive', positive, tilt), right],
  ];
  const placed: Array<[FrameNode, number, number]> = [];
  for (const [card, end] of cards) {
    const x = Math.round(end.x - CARD_W / 2);
    const y = Math.round(end.y + HANG);
    add(f, lineBetween(end.x, end.y, x + 18, y + 1, 'border/strong', 1, 'String'));
    add(f, lineBetween(end.x, end.y, x + CARD_W - 18, y + 1, 'border/strong', 1, 'String'));
    placed.push([card, x, y]);
  }

  const beam = rect(BEAM, 4, beamToken, 2, 'Beam');
  f.appendChild(beam);
  placeRotated(beam, CX, PIVOT_Y, deg);
  for (const end of [left, right]) add(f, abs(circle(6, beamToken, 'Hook'), end.x - 3, end.y - 3));
  add(f, abs(circle(14, beamToken, 'Pivot'), CX - 7, PIVOT_Y - 7));
  add(f, abs(circle(6, 'bg/surface', 'Pivot core'), CX - 3, PIVOT_Y - 3));
  for (const [card, x, y] of placed) add(f, abs(card, x, y));
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
