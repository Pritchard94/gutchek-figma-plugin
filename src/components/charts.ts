import { Token } from '../tokens';
import { abs, add, box, col, paint, rect, row, text } from '../core/ui';

export interface Series {
  name: string;
  values: number[];
  token: Token;
  dashed?: boolean;
  area?: boolean;
}

/** Polyline (or closed area) from points, positioned at its bounding box. */
function vectorPath(points: Array<[number, number]>, close: boolean, baseline?: number): VectorNode {
  const pts = close && baseline !== undefined ? points.concat([[points[points.length - 1][0], baseline], [points[0][0], baseline]]) : points;
  const minX = Math.min(...pts.map((p) => p[0]));
  const minY = Math.min(...pts.map((p) => p[1]));
  const d = pts.map((p, i) => (i ? 'L ' : 'M ') + (p[0] - minX).toFixed(1) + ' ' + (p[1] - minY).toFixed(1)).join(' ') + (close ? ' Z' : '');
  const v = figma.createVector();
  v.vectorPaths = [{ windingRule: close ? 'NONZERO' : 'NONE', data: d }];
  v.x = minX;
  v.y = minY;
  return v;
}

export function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(Math.round(n));
}

/** Line chart with y gridlines, x labels and optional comparison series and area fill. */
export function lineChart(series: Series[], xLabels: string[], o: { w: number; h: number; yMax?: number; ticks?: number; prefix?: string; showDots?: boolean }): FrameNode {
  const padL = 44;
  const padB = 26;
  const plotW = o.w - padL - 8;
  const plotH = o.h - padB - 8;
  const max = o.yMax || Math.max(...series.map((s) => Math.max(...s.values))) * 1.1;
  const ticks = o.ticks || 4;
  const f = box({ name: 'Line chart', dir: 'none', w: o.w, h: o.h });
  for (let i = 0; i <= ticks; i++) {
    const y = 8 + plotH - (plotH * i) / ticks;
    add(f, abs(rect(plotW, 1, i === 0 ? 'border/strong' : 'border/default', 0, 'Grid'), padL, Math.round(y)));
    add(f, abs(text((o.prefix || '') + fmt((max * i) / ticks), 'caption', 'text/tertiary'), 0, Math.round(y) - 8));
  }
  const n = Math.max(...series.map((s) => s.values.length));
  const step = n > 1 ? plotW / (n - 1) : plotW;
  const every = Math.max(1, Math.ceil(xLabels.length / 8));
  xLabels.forEach((l, i) => {
    if (i % every !== 0 && i !== xLabels.length - 1) return;
    const t = text(l, 'caption', 'text/tertiary');
    add(f, abs(t, Math.round(padL + i * step - 12), o.h - 18));
  });
  for (const s of series) {
    const pts: Array<[number, number]> = s.values.map((v, i) => [padL + i * step, 8 + plotH - (plotH * v) / max]);
    if (s.area) {
      const a = vectorPath(pts, true, 8 + plotH);
      a.name = s.name + ' area';
      a.fills = [paint(s.token, 0.12)];
      a.strokes = [];
      f.appendChild(a);
    }
    const line = vectorPath(pts, false);
    line.name = s.name;
    line.fills = [];
    line.strokes = [paint(s.token)];
    line.strokeWeight = s.dashed ? 2 : 2.5;
    line.strokeCap = 'ROUND';
    line.strokeJoin = 'ROUND';
    if (s.dashed) line.dashPattern = [6, 5];
    f.appendChild(line);
    if (o.showDots !== false && !s.dashed) {
      const last = pts[pts.length - 1];
      const dot = box({ name: 'Last', dir: 'h', w: 10, h: 10, radius: 5, fill: s.token, stroke: 'bg/surface', strokeW: 2, strokeAlign: 'OUTSIDE' });
      add(f, abs(dot, Math.round(last[0] - 5), Math.round(last[1] - 5)));
    }
  }
  return f;
}

export function legend(items: Array<[string, Token, boolean?]>): FrameNode {
  return row(
    { name: 'Legend', gap: 16 },
    items.map(([l, tok, dashed]) =>
      row({ name: l, gap: 6 }, [dashed ? row({ name: 'Dash', gap: 2 }, [rect(6, 2, tok, 1, 'a'), rect(6, 2, tok, 1, 'b')]) : rect(12, 3, tok, 2, 'Swatch'), text(l, 'caption', 'text/secondary')]),
    ),
  );
}

export function sparkline(values: number[], token: Token = 'brand/fg', w = 96, h = 32): FrameNode {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const step = w / (values.length - 1);
  const pts: Array<[number, number]> = values.map((v, i) => [i * step, 2 + (h - 4) * (1 - (v - min) / span)]);
  const f = box({ name: 'Sparkline', dir: 'none', w, h });
  const a = vectorPath(pts, true, h);
  a.fills = [paint(token, 0.12)];
  a.strokes = [];
  f.appendChild(a);
  const l = vectorPath(pts, false);
  l.fills = [];
  l.strokes = [paint(token)];
  l.strokeWeight = 2;
  l.strokeCap = 'ROUND';
  l.strokeJoin = 'ROUND';
  f.appendChild(l);
  return f;
}

/** Vertical bars; each entry can stack several values. */
export function barChart(groups: number[][], labels: string[], tokens: Token[], o: { w: number; h: number; max?: number; barW?: number }): FrameNode {
  const max = o.max || Math.max(...groups.map((g) => g.reduce((a, b) => a + b, 0))) * 1.1;
  const plotH = o.h - 22;
  return col({ name: 'Bar chart', w: o.w, gap: 6 }, [
    row(
      { name: 'Bars', w: 'fill', h: plotH, gap: 6, cross: 'end' },
      groups.map((g, i) =>
        col({ name: labels[i] || 'Bar ' + i, w: 'fill', gap: 2, cross: 'center' }, g.map((v, j) => rect(o.barW || 20, Math.max(2, Math.round((plotH * v) / max)), tokens[j], 4, 'Segment'))),
      ),
    ),
    row({ name: 'Labels', w: 'fill', gap: 6 }, labels.map((l) => box({ name: l, dir: 'h', w: 'fill', main: 'center' }, [text(l, 'caption', 'text/tertiary')]))),
  ]);
}

/** Donut from arcs; segments are [value, token, label]. */
export function donut(segments: Array<[number, Token, string]>, size = 160, centre?: [string, string]): FrameNode {
  const total = segments.reduce((a, s) => a + s[0], 0);
  const f = box({ name: 'Donut', dir: 'none', w: size, h: size });
  let start = -Math.PI / 2;
  for (const [v, tok, label] of segments) {
    const sweep = (Math.PI * 2 * v) / total;
    const e = figma.createEllipse();
    e.name = label;
    e.resize(size, size);
    e.arcData = { startingAngle: start + 0.02, endingAngle: start + sweep - 0.02, innerRadius: 0.72 };
    e.fills = [paint(tok)];
    add(f, abs(e, 0, 0));
    start += sweep;
  }
  if (centre) {
    const c = col({ name: 'Centre', w: size, gap: 0, cross: 'center' }, [text(centre[0], { family: 'display', weight: 800, size: 22, line: 26, tracking: -1 }, 'text/primary'), text(centre[1], 'caption', 'text/tertiary')]);
    add(f, abs(c, 0, Math.round(size / 2 - 22)));
  }
  return f;
}

export function donutLegend(segments: Array<[number, Token, string]>): FrameNode {
  const total = segments.reduce((a, s) => a + s[0], 0);
  return col(
    { name: 'Donut legend', w: 'fill', gap: 10 },
    segments.map(([v, tok, label]) =>
      row({ name: label, w: 'fill', gap: 8 }, [box({ name: 'Dot', dir: 'h', w: 10, h: 10, radius: 5, fill: tok }), text(label, 'small', 'text/primary', { w: 'fill' }), text(Math.round((v / total) * 100) + '%', 'smallStrong', 'text/primary')]),
    ),
  );
}

/** Horizontal funnel with step conversion. */
export function funnel(steps: Array<[string, number]>, w: number): FrameNode {
  const max = steps[0][1];
  const barMax = w - 180;
  return col(
    { name: 'Funnel', w, gap: 10 },
    steps.map(([label, v], i) => {
      const conv = i === 0 ? '' : Math.round((v / steps[i - 1][1]) * 100) + '% of previous';
      return col({ name: label, w: 'fill', gap: 4 }, [
        row({ name: 'Head', w: 'fill', gap: 8 }, [text(label, 'small', 'text/primary', { w: 'fill' }), text(fmt(v), 'smallStrong', 'text/primary'), conv ? text(conv, 'caption', 'text/tertiary') : null]),
        box({ name: 'Track', dir: 'h', w: 'fill', h: 10, radius: 5, fill: 'bg/subtle' }, [rect(Math.max(6, Math.round((barMax * v) / max)), 10, i === steps.length - 1 ? 'positive/solid' : 'brand/solid', 5, 'Bar')]),
      ]);
    }),
  );
}

/** Retention cohort heatmap: rows of percentages, shaded by value. */
export function cohort(rows: Array<[string, string, number[]]>, weeks: string[]): FrameNode {
  const cellW = 64;
  const head = row({ name: 'Head', gap: 4 }, [box({ name: 'Cohort', dir: 'h', w: 150 }, [text('Cohort', 'overline', 'text/tertiary')]), box({ name: 'Users', dir: 'h', w: 70 }, [text('Users', 'overline', 'text/tertiary')]), ...weeks.map((w) => box({ name: w, dir: 'h', w: cellW, main: 'center' }, [text(w, 'overline', 'text/tertiary')]))]);
  return col({ name: 'Cohorts', gap: 4 }, [
    head,
    ...rows.map(([label, users, vals]) =>
      row({ name: label, gap: 4 }, [
        box({ name: 'Label', dir: 'h', w: 150 }, [text(label, 'small', 'text/primary')]),
        box({ name: 'Users', dir: 'h', w: 70 }, [text(users, 'small', 'text/secondary')]),
        ...weeks.map((_, i) => {
          const v = vals[i];
          if (v === undefined) return box({ name: 'Empty', dir: 'h', w: cellW, h: 32, radius: 6, fill: 'bg/subtle' });
          const cell = box({ name: 'Cell', dir: 'h', w: cellW, h: 32, radius: 6, fill: 'brand/solid', fillOpacity: Math.max(0.08, v / 100), main: 'center', cross: 'center' }, [text(v + '%', 'label', v > 45 ? 'text/on-solid' : 'text/primary')]);
          return cell;
        }),
      ]),
    ),
  ]);
}

/** Horizontal bars with label and value, for regions, features and channels. */
export function hbars(items: Array<[string, number, string?]>, w: number, token: Token = 'brand/solid'): FrameNode {
  const max = Math.max(...items.map((i) => i[1]));
  return col(
    { name: 'Bars', w, gap: 12 },
    items.map(([label, v, suffix]) =>
      col({ name: label, w: 'fill', gap: 4 }, [
        row({ name: 'Head', w: 'fill', gap: 8 }, [text(label, 'small', 'text/primary', { w: 'fill' }), text(suffix || fmt(v), 'smallStrong', 'text/primary')]),
        box({ name: 'Track', dir: 'h', w: 'fill', h: 8, radius: 4, fill: 'bg/subtle' }, [rect(Math.max(4, Math.round(((w - 2) * v) / max)), 8, token, 4, 'Bar')]),
      ]),
    ),
  );
}
