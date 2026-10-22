import { Token } from '../tokens';
import { abs, add, box, circle, col, icon, lineBetween, paint, placeRotated, rect, row, text, toneTokens, Tone } from '../core/ui';

export type Tilt = 'Caution' | 'Balanced' | 'Positive' | 'Pending' | 'Low';

const W = 353;
const H = 212;
const CX = W / 2;
const PIVOT_Y = 36;
const BEAM = 246;
const CARD_W = 108;

function pan(side: 'caution' | 'positive', score: string, tilt: Tilt): FrameNode {
  const neutral = tilt === 'Pending' || tilt === 'Low';
  const tone: Tone = neutral ? 'neutral' : side;
  const t = toneTokens[tone];
  const numColor: Token = tilt === 'Pending' ? 'text/tertiary' : neutral ? 'text/secondary' : side === 'caution' ? 'caution/fg' : 'positive/fg';
  return col({ name: side === 'caution' ? 'Caution pan' : 'Positive pan', w: CARD_W, pad: [10, 12, 12, 12], gap: 0, radius: 16, fill: t.bg, stroke: t.border, cross: 'center' }, [
    row({ name: 'Label', gap: 4 }, [
      icon(side === 'caution' ? 'alert-triangle' : 'check-circle', 14, neutral ? 'text/tertiary' : t.fg),
      text(side === 'caution' ? 'Caution' : 'Positive', 'label', neutral ? 'text/secondary' : t.fg),
    ]),
    row({ name: 'Score', gap: 2, cross: 'baseline' }, [
      text(score, { family: 'display', weight: 800, size: 40, line: 46, tracking: -2 }, numColor, { name: side === 'caution' ? 'caution-score' : 'positive-score' }),
      text('/10', 'small', 'text/tertiary', { name: 'out-of' }),
    ]),
  ]);
}

export function scaleDial(tilt: Tilt, caution = '2', positive = '8'): FrameNode {
  const f = box({ name: 'ScaleDial', dir: 'none', w: W, h: H });
  const deg = tilt === 'Caution' ? -7 : tilt === 'Positive' ? 7 : 0;
  const a = (deg * Math.PI) / 180;
  const half = BEAM / 2 - 2;
  const left = { x: CX - Math.cos(a) * half, y: PIVOT_Y - Math.sin(a) * half };
  const right = { x: CX + Math.cos(a) * half, y: PIVOT_Y + Math.sin(a) * half };
  const beamToken: Token = tilt === 'Pending' || tilt === 'Low' ? 'text/tertiary' : 'brand/fg';

  const ground = figma.createEllipse();
  ground.name = 'Ground';
  ground.resize(200, 12);
  ground.fills = [paint('bg/muted')];
  add(f, abs(ground, CX - 100, H - 18));
  add(f, abs(rect(4, H - 26 - PIVOT_Y, beamToken, 2, 'Post'), CX - 2, PIVOT_Y));
  add(f, abs(rect(112, 8, beamToken, 4, 'Base'), CX - 56, H - 26));

  const cards: Array<[FrameNode, { x: number; y: number }]> = [
    [pan('caution', caution, tilt), left],
    [pan('positive', positive, tilt), right],
  ];
  const placed: Array<[FrameNode, number, number]> = [];
  for (const [card, end] of cards) {
    const x = Math.round(end.x - CARD_W / 2);
    const y = Math.round(end.y + 26);
    add(f, lineBetween(end.x, end.y, x + 16, y + 1, 'border/strong', 1.5, 'String'));
    add(f, lineBetween(end.x, end.y, x + CARD_W - 16, y + 1, 'border/strong', 1.5, 'String'));
    placed.push([card, x, y]);
  }

  const beam = rect(BEAM, 6, beamToken, 3, 'Beam');
  f.appendChild(beam);
  placeRotated(beam, CX, PIVOT_Y, deg);
  for (const end of [left, right]) add(f, abs(circle(8, beamToken, 'Hook'), end.x - 4, end.y - 4));
  add(f, abs(circle(18, beamToken, 'Pivot'), CX - 9, PIVOT_Y - 9));
  add(f, abs(circle(8, 'bg/surface', 'Pivot core'), CX - 4, PIVOT_Y - 4));
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
