import { NAME_HUES, Token, contrast, primitives, tokenHex } from '../tokens';
import { ctx } from '../core/ctx';
import { FillSpec, Kid, abs, add, box, col, gradient, hexPaint, icon, paint, rect, row, snapshot, text, pill, avatar } from '../core/ui';
import { appIcon, glyph, lockup } from '../brand';
import { use } from '../components/library';
import { doodleLayer } from '../components/doodles';
import { MOODS, moodDot, moodFg, moodTint } from '../components/notes';
import { board, bullet, section } from './common';
import { swatchChip, themedPanel } from './foundations';

const EYEBROW = 'Gutchek · Brand guideline';

function card(kids: Kid[], w: number | 'fill' = 'fill', fill: Token = 'bg/canvas', pad = 32, gap = 12, name = 'Card'): FrameNode {
  return col({ name, w, pad, gap, radius: 24, fill }, kids);
}

function labelled(caption: string, node: SceneNode, w: number | 'fill' = 'fill'): FrameNode {
  return col({ name: caption, gap: 12, w }, [node, text(caption, 'small', 'text/secondary', { w: 'fill' })]);
}

function doDont(isDo: boolean, body: string, example?: SceneNode): FrameNode {
  const tone = isDo ? 'positive' : 'caution';
  return col({ name: isDo ? 'Do' : "Don't", gap: 12, w: 'fill', pad: 24, radius: 20, fill: 'bg/canvas', stroke: isDo ? 'positive/border' : 'caution/border' }, [
    pill(isDo ? 'Do' : "Don't", tone, isDo ? 'check' : 'x'),
    example || null,
    text(body, 'body', 'text/primary', { w: 'fill' }),
  ]);
}

// ---------------------------------------------------------------- 01 essence

function essence(): FrameNode {
  const trait = (title: string, body: string, iconName: string) =>
    card(
      [
        box({ name: 'Icon', dir: 'h', w: 48, h: 48, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon(iconName, 24, 'brand/fg')]),
        text(title, 'h3', 'text/primary'),
        text(body, 'body', 'text/secondary', { w: 'fill' }),
      ],
      'fill',
      'bg/canvas',
      28,
      12,
      title,
    );
  const weAre = (rows: string[], positive: boolean) =>
    col({ name: positive ? 'We are' : 'We are not', gap: 14, w: 'fill', pad: 32, radius: 24, fill: positive ? 'brand/subtle' : 'bg/canvas' }, [
      text(positive ? 'Gutchek is' : 'Gutchek is not', 'h3', positive ? 'brand/on-subtle' : 'text/primary'),
      ...rows.map((r) => row({ name: r, gap: 10, w: 'fill', cross: 'start' }, [icon(positive ? 'check' : 'x', 20, positive ? 'brand/fg' : 'text/tertiary'), text(r, 'body', 'text/primary', { w: 'fill' })])),
    ]);
  return board(
    EYEBROW + ' · 01',
    'Brand essence',
    'Gutchek takes its name from the moment before you commit: your gut says something, and you check it. One side of the Gut Meter holds reasons to move forward, the other holds reasons to be careful. Everything in the brand expresses fairness and proof, never accusation.',
    [
      row({ name: 'Statements', gap: 24, w: 'fill', cross: 'start' }, [
        card([text('Purpose', 'overline', 'brand/fg'), text('Help people make safer, better-informed decisions about someone they are getting to know.', 'h2', 'text/primary', { w: 'fill' })]),
        card([text('Promise', 'overline', 'brand/fg'), text('A fast, fair second opinion, with the evidence on the table.', 'h2', 'text/primary', { w: 'fill' })]),
        card([text('Positioning', 'overline', 'brand/fg'), text('The calm, evidence-first alternative to gossip boards and spy-style background checks.', 'h2', 'text/primary', { w: 'fill' })]),
      ]),
      section('Personality', 'Four traits guide every design and writing decision.', [
        row({ name: 'Traits', gap: 24, w: 'fill', cross: 'start' }, [
          trait('Balanced', 'We weigh the good as seriously as the bad. Positive evidence always gets equal space.', 'check-circle'),
          trait('Evidence-first', 'Every score expands into the posts behind it. Users judge for themselves.', 'file'),
          trait('Calm', 'We lower the temperature. Soft surfaces, steady motion, gentle words on hard findings.', 'wind'),
          trait('Protective, not punitive', 'We protect the user without shaming the person they look up.', 'shield-check'),
        ]),
      ]),
      row({ name: 'Is / is not', gap: 24, w: 'fill', cross: 'start' }, [
        weAre(['A trusted friend who did the reading', 'Transparent about what we checked and what we could not', 'Clear about confidence and uncertainty', 'On the side of safety for everyone involved'], true),
        weAre(['A spy app, a gossip board or a judge', 'Certain when the evidence is thin', 'Dramatic, alarming or sensational', 'A tool for employers, landlords or harassment'], false),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 02 logo

function logo(): FrameNode {
  const stage = (kids: Kid[], fillSpec: FillSpec, name: string, h = 280) =>
    box({ name, dir: 'h', w: 'fill', h, radius: 24, main: 'center', cross: 'center', fill: fillSpec }, kids);

  const clear = (() => {
    const lk = lockup(64);
    const pad = 32;
    const f = box({ name: 'Clear space', dir: 'none', w: lk.width + pad * 2, h: lk.height + pad * 2 });
    const guide = rect(lk.width + pad * 2, lk.height + pad * 2, null, 0, 'Clear space guide');
    guide.strokes = [paint('brand/fg')];
    guide.dashPattern = [6, 6];
    guide.strokeWeight = 1;
    add(f, abs(guide, 0, 0));
    add(f, abs(lk, pad, pad));
    add(f, abs(text('x', 'label', 'brand/fg'), 10, pad + lk.height / 2 - 9));
    add(f, abs(text('x', 'label', 'brand/fg'), pad + lk.width / 2 - 4, 6));
    return f;
  })();

  const misuse = (caption: string, node: SceneNode) =>
    col({ name: caption, gap: 12, w: 'fill' }, [
      box({ name: 'Stage', dir: 'h', w: 'fill', h: 180, radius: 20, fill: 'bg/canvas', main: 'center', cross: 'center', stroke: 'caution/border' }, [node]),
      row({ name: 'Caption', gap: 8, w: 'fill' }, [icon('x', 18, 'caution/fg'), text(caption, 'small', 'text/primary', { w: 'fill' })]),
    ]);

  const tilted = glyph(88, 'brand/fg');
  tilted.rotation = -14;
  const twoTone = glyph(88, 'caution/fg', 'positive/fg');
  const stretched = glyph(88, 'brand/fg');
  for (const c of stretched.children) {
    if ('constraints' in c) (c as ConstraintMixin).constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  stretched.resize(150, 64);
  const spy = row({ name: 'Spy', gap: 8, cross: 'center' }, [glyph(72, 'brand/fg'), icon('eye', 40, 'brand/fg')]);

  return board(
    EYEBROW + ' · 02',
    'Logo',
    'The mark is two soft halves curling into each other: your gut and the evidence, meeting in the middle. Ink (#241B43) carries the weight; Lilac (#B9A1EF) answers it. On dark surfaces the ink half turns white. The wordmark GutChek is set in Plus Jakarta Sans Bold in Ink, with capital G and C so both halves of the name read at a glance. The mark always sits beside the wordmark, never above it.',
    [
      row({ name: 'Primary', gap: 24, w: 'fill' }, [
        labelled('Primary lockup on light surfaces', stage([lockup(72)], 'bg/canvas', 'Primary stage')),
        labelled('Reversed on Gutchek Indigo', stage([lockup(72, 'text/on-solid', 'text/on-solid')], [gradient([['#7556E3', 0], ['#4A30B0', 1]], 135)], 'Reversed stage')),
        labelled('Mono for single-colour print and partner use', stage([lockup(72, 'text/primary', 'text/primary')], 'bg/muted', 'Mono stage')),
      ]),
      row({ name: 'Marks', gap: 24, w: 'fill', cross: 'start' }, [
        labelled('App icon. The full-colour mark at 68% of a white tile, with a hairline border on light backgrounds.', stage([row({ name: 'Icons', gap: 24, cross: 'end' }, [appIcon(112), appIcon(80), appIcon(56), appIcon(40)])], 'bg/canvas', 'Icon stage', 300)),
        labelled('Clear space equals x, a quarter of the mark\u2019s height, on every side.', stage([clear], 'bg/canvas', 'Clear space stage', 300)),
        labelled('Minimum sizes: glyph 20pt, lockup 88pt wide. Below that, use the glyph alone.', stage([row({ name: 'Minimums', gap: 32, cross: 'center' }, [glyph(20, 'brand/fg'), lockup(24)])], 'bg/canvas', 'Minimum stage', 300)),
      ]),
      section('Misuse', 'Keep the mark upright, in Ink and Lilac (or one colour), and free of surveillance imagery.', [
        row({ name: 'Misuse grid', gap: 24, w: 'fill', cross: 'start' }, [
          misuse('Do not tilt the mark. Only the Gut Meter needle moves, and only toward real evidence.', tilted),
          misuse('Do not recolour it red and green. Those belong to Caution and Positive; scores carry meaning.', twoTone),
          misuse('Do not stretch, outline or redraw the glyph.', stretched),
          misuse('Do not pair the mark with eyes, magnifiers or crosshairs.', spy),
        ]),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 03 colour

function colour(): FrameNode {
  const hero = (name: string, hex: string, role: string, dark?: string, ink = '#FFFFFF') => {
    const f = col({ name, w: 'fill', h: 300, pad: 28, gap: 6, radius: 24, main: 'end', fill: [hexPaint(hex)] }, []);
    const t1 = text(name, 'h2', 'text/primary');
    const t2 = text(hex + (dark ? '   ·   dark ' + dark : ''), 'smallStrong', 'text/primary');
    const t3 = text(role, 'small', 'text/primary', { w: 'fill' });
    for (const t of [t1, t2, t3]) {
      t.fills = [hexPaint(ink, t === t3 ? 0.85 : 1)];
      add(f, t);
    }
    return f;
  };
  const shares: Array<[string, number, Token]> = [
    ['Neutrals', 0.65, 'bg/muted'],
    ['Indigo', 0.15, 'brand/solid'],
    ['Action Amber', 0.05, 'action/solid'],
    ['Caution', 0.05, 'caution/solid'],
    ['Positive', 0.05, 'positive/solid'],
  ];
  const ratioBar = row({ name: 'Ratio', gap: 0, radius: 20, clip: true }, shares.map(([label, pct, token]) => rect(Math.round(1280 * pct), 72, token, 0, label)));
  const ratioLegend = row(
    { name: 'Legend', gap: 32 },
    shares.map(([label, pct, token]) => row({ name: label, gap: 8 }, [box({ name: 'Dot', w: 12, h: 12, radius: 6, fill: token, dir: 'h' }), text(label + ' ' + Math.round(pct * 100) + '%', 'smallStrong', 'text/secondary')])),
  );
  const pair = (fg: Token, bg: Token, label: string) => {
    const r = contrast(tokenHex(fg, 'light'), tokenHex(bg, 'light'));
    return col({ name: label, gap: 8, w: 'fill', pad: 20, radius: 16, fill: bg, stroke: 'border/default' }, [
      text('Aa', { family: 'display', weight: 700, size: 32, line: 36 }, fg),
      text(label, 'smallStrong', fg),
      text(r.toFixed(1) + ':1 · ' + (r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : 'AA large'), 'caption', fg),
    ]);
  };
  return board(
    EYEBROW + ' · 03',
    'Colour',
    'Deep indigo is the voice of Gutchek: trustworthy, calm and distinct from the red-and-black palette of spy apps. Action Amber marks the one thing to do next. Emerald and warm red belong to the Gut Meter. They carry meaning, so they never appear as decoration.',
    [
      row({ name: 'Core', gap: 20, w: 'fill' }, [
        hero('Gutchek Indigo', primitives.indigo['600'], 'Primary brand, focus, links, selected states.', primitives.indigo['400']),
        hero('Action Amber', primitives.amber['400'], 'The one main button on each screen, with Ink text. Never a flag or severity colour.', undefined, primitives.ink['900']),
        hero('Positive Emerald', primitives.emerald['700'], 'Positive side of the Gut Meter only.', primitives.emerald['400']),
        hero('Caution Red', primitives.red['700'], 'Caution side of the Gut Meter and destructive actions only.', primitives.red['400']),
      ]),
      row({ name: 'Support', gap: 20, w: 'fill' }, [
        hero('Warning Orange', primitives.orange['700'], 'Medium confidence, Likely matches, SLAs and operational warnings.', primitives.orange['400']),
        hero('Ink', primitives.neutral['900'], 'Text and high-emphasis UI in light mode.'),
        hero('Night', primitives.night['950'], 'Dark mode canvas. Surfaces step up through 900 and 850.'),
      ]),
      section('Proportion', 'Neutral surfaces do most of the work. Indigo guides the eye; signal colours appear only where there is a finding.', [
        ratioBar,
        ratioLegend,
      ]),
      section('Mood colours', 'Notes moods borrow the member identity hues, never red or green, so a feeling never reads as a Red Flag or Green Flag. Moods are never scored.', [
        row({ name: 'Moods', gap: 16, w: 'fill' }, MOODS.map((m) => col({ name: m.key, gap: 10, w: 'fill', pad: 20, radius: 20, fill: moodTint(m.key), cross: 'center' }, [moodDot(m.key, 56), text(m.key, 'bodyStrong', moodFg(m.key))]))),
      ]),
      section('Accessible pairings', 'All text pairings meet WCAG 2.2 AA (4.5:1). Ratios are computed from the tokens in this file.', [
        row({ name: 'Pairs', gap: 16, w: 'fill' }, [
          pair('text/primary', 'bg/canvas', 'Text on canvas'),
          pair('text/secondary', 'bg/surface', 'Secondary on surface'),
          pair('text/on-solid', 'brand/solid', 'On indigo'),
          pair('brand/on-subtle', 'brand/subtle', 'Indigo tint'),
          pair('positive/fg', 'positive/subtle', 'Positive tint'),
          pair('caution/fg', 'caution/subtle', 'Caution tint'),
          pair('warning/fg', 'warning/subtle', 'Warning tint'),
          pair('action/on', 'action/solid', 'Ink on Action Amber'),
        ]),
      ]),
      section('Ramps', 'Full ramps live on the Foundations page with the semantic tokens.', [
        row({ name: 'Mini ramps', gap: 8 }, ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((s) => swatchChip(primitives.indigo[s], s, primitives.indigo[s].replace('#', ''), 104))),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 04 type

function typography(): FrameNode {
  const display = ctx.fonts.display[800];
  const ui = ctx.fonts.ui[400];
  const specimen = (title: string, family: 'display' | 'ui', role: string, fontLabel: string) =>
    card(
      [
        text(fontLabel, 'overline', 'brand/fg'),
        text('Aa', { family, weight: family === 'display' ? 800 : 600, size: 160, line: 168, tracking: -4 }, 'text/primary'),
        text(title, 'h2', 'text/primary'),
        text(role, 'body', 'text/secondary', { w: 'fill' }),
        text('ABCDEFGHIJKLMNOPQRSTUVWXYZ\nabcdefghijklmnopqrstuvwxyz\n0123456789 / ? ! % · ( )', { family, weight: 500, size: 20, line: 32 }, 'text/primary', { w: 'fill' }),
      ],
      'fill',
      'bg/canvas',
      40,
      16,
      title,
    );
  return board(
    EYEBROW + ' · 04',
    'Typography',
    'Two families, clear jobs. Plus Jakarta Sans gives headlines and score numerals a warm, confident shape. Inter keeps long reading, evidence and fine print effortless at small sizes.',
    [
      row({ name: 'Specimens', gap: 24, w: 'fill', cross: 'start' }, [
        specimen('Plus Jakarta Sans', 'display', 'Display, headings, verdicts and the large score numerals. Weights 600 to 800. Tight tracking at large sizes.', display.family + ' · ' + display.style),
        specimen('Inter', 'ui', 'Body, labels, buttons, evidence excerpts and legal copy. Weights 400 to 600. Tabular figures for dates and counts.', ui.family + ' · ' + ui.style),
      ]),
      section('Hierarchy in use', 'A report header shows how the Gut Meter carries meaning: verdict first, numbers second, context third.', [
        card(
          [
            text('Report · Tobi Adeyemi', 'overline', 'brand/fg'),
            text('Mostly positive, minor concerns', 'h1', 'text/primary'),
            row({ name: 'Scores', gap: 40, cross: 'end' }, [
              col({ name: 'Caution', gap: 0 }, [text('2', 'display', 'caution/fg'), text('Caution', 'label', 'text/secondary')]),
              col({ name: 'Positive', gap: 0 }, [text('8', 'display', 'positive/fg'), text('Positive', 'label', 'text/secondary')]),
            ]),
            text('Based on 214 public items across 3 platforms, 2019 to 2026. People are more than their posts.', 'body', 'text/secondary', { w: 720 }),
          ],
          'fill',
          'bg/canvas',
          40,
          16,
          'Hierarchy',
        ),
      ]),
      section('Rules', null, [
        col({ name: 'Rules', gap: 12, w: 'fill' }, [
          bullet('Sentence case everywhere, including buttons and titles.'),
          bullet('Never set body text below 14pt or captions below 12pt; the only exception is tab bar labels at the iOS standard 10pt. Support Dynamic Type up to XXL without truncating scores.'),
          bullet('Score numerals always appear with their side label and an icon, so meaning never depends on colour.'),
          bullet('Evidence excerpts are quoted in Inter Regular and keep the original spelling, slang and punctuation.'),
        ]),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 05 layout

function layout(): FrameNode {
  const phone = box({ name: 'Grid demo', dir: 'none', w: 393, h: 852, radius: 48, fill: 'bg/canvas', stroke: 'border/strong', clip: true });
  const overlay = (x: number, y: number, w: number, h: number, token: Token, label: string, opacity = 0.16) => {
    const r = rect(w, h, token, 0, label);
    r.opacity = opacity;
    add(phone, abs(r, x, y));
    if (label) add(phone, abs(text(label, 'caption', 'brand/on-subtle'), x + 8, y + 6));
  };
  overlay(0, 0, 393, 54, 'warning/fg', 'Status bar 54');
  overlay(0, 54, 393, 44, 'brand/solid', 'Nav bar 44', 0.12);
  overlay(0, 852 - 96, 393, 96, 'brand/solid', 'Floating tab bar 62 + home indicator 34', 0.12);
  overlay(0, 98, 20, 852 - 98 - 96, 'caution/fg', '', 0.18);
  overlay(373, 98, 20, 852 - 98 - 96, 'caution/fg', '', 0.18);
  const colW = (353 - 3 * 16) / 4;
  for (let i = 0; i < 4; i++) overlay(20 + i * (colW + 16), 98, colW, 852 - 98 - 96, 'positive/fg', i === 0 ? 'Col' : '', 0.1);
  return board(
    EYEBROW + ' · 05',
    'Layout',
    'Designed at 393 by 852 (iPhone 15 and 16), scaling down to 375 and up to 430. A four-column grid with 20pt margins and 16pt gutters keeps cards, lists and the Gut Meter aligned.',
    [
      row({ name: 'Layout', gap: 64, w: 'fill', cross: 'start' }, [
        phone,
        col({ name: 'Notes', gap: 20, w: 'fill' }, [
          text('Rhythm', 'h2', 'text/primary'),
          bullet('Margins 20pt. Cards pad 16 to 20pt. Sections are separated by 32pt, items inside a section by 12 to 16pt.'),
          bullet('Touch targets are at least 44 by 44pt, including icon buttons and list rows.'),
          bullet('Primary actions sit in the bottom third of the screen, within thumb reach, above the home indicator.'),
          bullet('The tab bar floats: a translucent glass capsule with five destinations (Home, Notes, Gists, Stay Safe, Me; saved reports live in Home), inset 16pt from the edges, with a separate round + action for Run a Gutchek or Check a Chat. Content scrolls underneath it, and it hides on pushed screens.'),
          bullet('Android: same layout at 360 to 412dp, Material system bars replace iOS chrome.'),
          text('Corners and depth', 'h2', 'text/primary'),
          bullet('Corners grow with surface size: 8 for chips, 12 for buttons and fields, 16 for cards, 24 for sheets and swipe cards.'),
          bullet('Depth comes from surface colour first and shadow second. Dark mode uses raised surfaces, not heavier shadows.'),
        ]),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 06 icons and imagery

function iconography(): FrameNode {
  const names = ['check', 'shield-check', 'alert-triangle', 'check-circle', 'search', 'eye-off', 'external-link', 'lock', 'users', 'map-pin', 'calendar', 'bell', 'bookmark', 'heart', 'life-buoy', 'navigation'];
  return board(
    EYEBROW + ' · 06',
    'Iconography and imagery',
    'Icons come from Lucide: open, rounded and quiet. Imagery stays abstract. Gutchek never shows stock photos of phones, keyholes or silhouettes, and never displays a searched person\'s photo outside the match confirmation step.',
    [
      row({ name: 'Icon grid', gap: 16, w: 'fill', wrap: true, wrapGap: 16 }, names.map((n) => col({ name: n, w: 140, pad: 20, gap: 12, cross: 'center', radius: 16, fill: 'bg/canvas' }, [icon(n, 32, 'text/primary'), text(n, 'caption', 'text/secondary')]))),
      row({ name: 'Wallpaper', gap: 32, w: 'fill', cross: 'center' }, [
        (() => {
          const tile = box({ name: 'Wallpaper sample', dir: 'none', w: 640, h: 280, radius: 24, fill: 'bg/canvas', clip: true, stroke: 'border/default' });
          tile.appendChild(doodleLayer(640, 280, 'brand/fg', 0.12));
          return tile;
        })(),
        col({ name: 'Wallpaper notes', gap: 12, w: 'fill' }, [
          text('Chat wallpaper', 'h3', 'text/primary'),
          text('Rooms use a tiled doodle wallpaper, inspired by WhatsApp: line icons from the Lucide set for dating, care and the check, in Indigo at 9% opacity, rotated up to 25 degrees on a 54pt grid.', 'body', 'text/secondary', { w: 'fill' }),
          text('Never include eyes, cameras, locks or anything that suggests surveillance. The pattern sits behind messages only, never behind headers or the composer.', 'body', 'text/secondary', { w: 'fill' }),
          text('Member colours', 'h3', 'text/primary'),
          text('Each nickname gets a stable colour from eight hues, matched on its avatar. Red and green are never used, because they belong to Caution and Positive. Moderators and Gist Bot are always Indigo. Your own messages get an Indigo tint and accent bar; mentions of you get Amber.', 'body', 'text/secondary', { w: 'fill' }),
          row({ name: 'Member colours', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, NAME_HUES.map((h) =>
            box({ name: h, dir: 'h', pad: [4, 10], radius: 999, fill: 'name/' + h + '-tint' }, [text(h.charAt(0).toUpperCase() + h.slice(1), 'smallStrong', 'name/' + h)]),
          )),
        ]),
      ]),
      row({ name: 'Rules', gap: 24, w: 'fill', cross: 'start' }, [
        doDont(true, 'Pair every signal colour with an icon and a word: a triangle for Caution, a check for Positive.', row({ name: 'Example', gap: 8 }, [use('ScoreBadge', { Side: 'Caution' }), use('ScoreBadge', { Side: 'Positive' })])),
        doDont(true, 'Use initials avatars on soft tints. They keep people identifiable without amplifying their photos.', row({ name: 'Avatars', gap: 8 }, [avatar('TA', 48, 'brand'), avatar('SB', 48, 'positive'), avatar('KO', 48, 'warning'), avatar('DO', 48, 'neutral')])),
        doDont(false, 'Do not use surveillance metaphors: eyes, crosshairs, magnifying glasses over faces, or redacted bars.', row({ name: 'Bad icons', gap: 12, opacity: 0.6 }, [icon('eye', 40, 'text/secondary'), icon('search', 40, 'text/secondary')])),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 07 the gut meter

function signature(): FrameNode {
  const states = ['Positive', 'Balanced', 'Caution', 'Pending', 'Low'];
  const motion: Array<[string, string]> = [
    ['Settle', 'Spring, stiffness 120, damping 14, about 600ms. The needle angle maps to the score difference and never pins to either end.'],
    ['Load', 'While processing, the needle sweeps gently across the top of the dial on a 2.4s ease-in-out loop. Stage copy changes as each step completes.'],
    ['Reveal', 'Each half fills and its score counts up from 0 over 500ms after the needle settles. Light haptic (impactLight) on settle.'],
    ['Reduced motion', 'No sweeping or counting. The final state crossfades in over 200ms.'],
  ];
  return board(
    EYEBROW + ' · 07',
    'The Gut Meter',
    'The signature element of the product. A semi-circle dial with two independent scores, one per half, and a needle that settles toward the heavier side. It turns a complicated analysis into one honest picture, and it always sits next to its confidence level.',
    [
      row({ name: 'Anatomy', gap: 48, w: 'fill', cross: 'center' }, [
        card([use('GutMeter', { Tilt: 'Positive' }), use('ConfidenceBadge', { Level: 'High' })], 449, 'bg/canvas', 48, 20, 'Hero dial'),
        col({ name: 'Anatomy notes', gap: 16, w: 'fill' }, [
          text('Anatomy', 'h2', 'text/primary'),
          bullet('Left half: Red Flag score, 1 to 10. Red, flag icon, labelled.'),
          bullet('Right half: Green Flag score, 1 to 10. Emerald, check icon, labelled.'),
          bullet('Needle: settles toward the heavier side. Balanced reports point straight up.'),
          bullet('Confidence badge: High, Medium or Low, with how much data the score is based on.'),
          bullet('Low confidence caps the scores and turns the whole dial neutral, with the message "Not enough public information".'),
        ]),
      ]),
      section('States', null, [row({ name: 'States', gap: 16, w: 'fill', wrap: true, wrapGap: 16 }, states.map((s) => card([use('GutMeter', { Tilt: s }), text(s, 'smallStrong', 'text/secondary')], 401, 'bg/canvas', 24, 12, s)))]),
      section('Motion', 'Motion explains the result; it never performs for its own sake.', [
        col(
          { name: 'Motion table', gap: 0, w: 'fill', radius: 20, clip: true, stroke: 'border/default' },
          motion.map(([k, v], i) =>
            row({ name: k, gap: 24, w: 'fill', pad: [18, 24], fill: i % 2 ? 'bg/surface' : 'bg/canvas' }, [text(k, 'bodyStrong', 'text/primary', { w: 200 }), text(v, 'body', 'text/secondary', { w: 'fill' })]),
          ),
        ),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 08 voice

function voice(): FrameNode {
  const pairRow = (good: string, bad: string, why: string) =>
    row({ name: why, gap: 20, w: 'fill', cross: 'start' }, [doDont(true, good), doDont(false, bad), col({ name: 'Why', gap: 6, w: 'fill', pad: [24, 0] }, [text('Why', 'overline', 'text/tertiary'), text(why, 'body', 'text/secondary', { w: 'fill' })])]);
  const words: Array<[string, string]> = [
    ['the person, them, Tobi', 'target, subject, suspect'],
    ['public posts, public content', 'dirt, receipts, intel'],
    ['caution signals, findings', 'red flags exposed, crimes'],
    ['content flagged as...', 'he is a..., she is a...'],
    ['not enough public information', 'clean, safe, verified good'],
  ];
  return board(
    EYEBROW + ' · 08',
    'Voice and tone',
    'Gutchek sounds like a level-headed friend who has done the reading: factual, warm and brief. We describe content, not character, and we are honest about what we do not know.',
    [
      row({ name: 'Principles', gap: 24, w: 'fill', cross: 'start' }, [
        card([text('Factual', 'h3', 'text/primary'), text('Report what the content says, link to it, and stop. No labels for people.', 'body', 'text/secondary', { w: 'fill' })]),
        card([text('Gentle', 'h3', 'text/primary'), text('Hard findings get softer framing and a pause, never exclamation marks or alarm.', 'body', 'text/secondary', { w: 'fill' })]),
        card([text('Humble', 'h3', 'text/primary'), text('State confidence plainly. Remind people that someone is more than their posts.', 'body', 'text/secondary', { w: 'fill' })]),
      ]),
      section('In practice', null, [
        pairRow('Content flagged as degrading toward women · 4 posts', 'He is a misogynist.', 'Describing content keeps findings checkable and avoids defamation.'),
        pairRow('Not enough public information to score confidently.', 'All clear! No red flags.', 'Low data is low confidence, never a clean result.'),
        pairRow('Take a breath. This report includes content some people find upsetting.', 'WARNING: dangerous person detected.', 'Emotional safety comes first on severe reports.'),
        pairRow('Is this Tobi? Confirm the accounts that belong to them.', 'Target located. 4 accounts found.', 'People are not targets. Users stay in control of identity.'),
      ]),
      section('Vocabulary', null, [
        col(
          { name: 'Vocabulary', gap: 0, w: 'fill', radius: 20, clip: true, stroke: 'border/default' },
          [row({ name: 'Head', gap: 24, w: 'fill', pad: [14, 24], fill: 'bg/subtle' }, [text('Say', 'smallStrong', 'positive/fg', { w: 'fill' }), text('Avoid', 'smallStrong', 'caution/fg', { w: 'fill' })])].concat(
            words.map(([a, b]) => row({ name: a, gap: 24, w: 'fill', pad: [14, 24] }, [text(a, 'body', 'text/primary', { w: 'fill' }), text(b, 'body', 'text/secondary', { w: 'fill' })])),
          ),
        ),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 09 accessibility

function accessibility(): FrameNode {
  const item = (title: string, body: string) =>
    row({ name: title, gap: 16, w: 'fill', cross: 'start', pad: 24, radius: 20, fill: 'bg/canvas' }, [
      box({ name: 'Check', dir: 'h', w: 32, h: 32, radius: 16, fill: 'positive/subtle', main: 'center', cross: 'center' }, [icon('check', 18, 'positive/fg')]),
      col({ name: 'Text', gap: 4, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary'), text(body, 'body', 'text/secondary', { w: 'fill' })]),
    ]);
  return board(
    EYEBROW + ' · 09',
    'Accessibility',
    'Gutchek is a safety product, so it has to work for everyone: in bright sun, at large text sizes, with a screen reader, or for someone who is anxious and reading quickly.',
    [
      row({ name: 'Columns', gap: 24, w: 'fill', cross: 'start' }, [
        col({ name: 'Left', gap: 16, w: 'fill' }, [
          item('Contrast', 'Text meets WCAG AA in both themes (4.5:1 body, 3:1 large text and UI). Ratios are documented on Foundations.'),
          item('Never colour alone', 'Caution and Positive always carry an icon and a word. Charts use position and labels as well as hue.'),
          item('Dynamic Type', 'Layouts reflow up to accessibility sizes. Score numerals scale; labels wrap instead of truncating.'),
          item('Dark mode', 'Every screen ships in light and dark from the same tokens. Users can follow the system or choose.'),
        ]),
        col({ name: 'Right', gap: 16, w: 'fill' }, [
          item('Screen readers', 'The Gut Meter reads as one element: "Red Flag 2 out of 10, Green Flag 8 out of 10, mostly positive, high confidence."'),
          item('Touch and focus', '44pt minimum targets, visible focus rings (border/focus, 2pt) and logical focus order.'),
          item('Motion', 'Respect Reduce Motion: no sweeping needle, no count-ups, crossfades only.'),
          item('Emotional safety', 'Severe reports open with a pause screen, findings are collapsed by default, and support resources are one tap away.'),
        ]),
      ]),
    ],
  );
}

/** Builds the guideline boards on the page. The caller places them. */
export function buildGuidelines(page: PageNode): FrameNode[] {
  ctx.theme = 'light';
  const boards = [essence(), logo(), colour(), typography(), layout(), iconography(), signature(), voice(), accessibility()];
  for (const b of boards) page.appendChild(b);
  return boards;
}

// ---------------------------------------------------------------- cover

const COVER_SHADOW: Effect = { type: 'DROP_SHADOW', color: { r: 0.05, g: 0.03, b: 0.2, a: 0.45 }, offset: { x: 0, y: 32 }, radius: 64, spread: 0, visible: true, blendMode: 'NORMAL' };

function browserWindow(shot: FrameNode, w: number): FrameNode {
  const dot = (hex: string) => box({ name: 'Dot', w: 12, h: 12, radius: 6, fill: [hexPaint(hex)] });
  const chrome = row({ name: 'Chrome', w: 'fill', h: 40, pad: [0, 16], gap: 8, cross: 'center', fill: 'bg/subtle' }, [
    dot('#FF5F57'),
    dot('#FEBC2E'),
    dot('#28C840'),
    box({ name: 'Spacer', w: 'fill', h: 1 }),
    row({ name: 'URL', gap: 6, pad: [5, 14], radius: 999, fill: 'bg/raised', cross: 'center' }, [icon('lock', 12, 'text/tertiary'), text('app.gutchek.com', 'caption', 'text/secondary')]),
    box({ name: 'Spacer', w: 'fill', h: 1 }),
    box({ name: 'Balance', w: 52, h: 1 }),
  ]);
  const c = snapshot(shot);
  c.rescale(w / c.width);
  const win = col({ name: 'Web app snapshot', w, gap: 0, radius: 20, fill: 'bg/raised', clip: true }, [chrome, c]);
  win.effects = [COVER_SHADOW];
  return win;
}

export function buildCover(previews: FrameNode[], page: PageNode, web?: FrameNode): FrameNode {
  ctx.theme = 'light';
  const cover = box({ name: 'Cover', dir: 'none', w: 1920, h: 1080, fill: [gradient([['#2C1E66', 0], ['#5B3FD1', 0.65], ['#7556E3', 1]], 120)], clip: true });
  const left = col({ name: 'Copy', gap: 28, w: 760 }, [
    lockup(72, 'text/on-solid', 'text/on-solid'),
    text('Trust your gut. Then check it.', { family: 'display', weight: 800, size: 80, line: 88, tracking: -3 }, 'text/on-solid', { w: 'fill' }),
    text('Brand guideline, design system, mobile app, web app, website and admin dashboard · v2.1', { family: 'ui', weight: 500, size: 24, line: 34 }, 'text/on-solid', { w: 'fill', opacity: 0.85 }),
    row({ name: 'Meta', gap: 12, wrap: true, w: 'fill' }, [
      metaPill('October 2026'),
      metaPill('iOS 393 × 852'),
      metaPill('Light and dark'),
      metaPill('React Native + NativeWind'),
      metaPill('Web app and website'),
    ]),
    text('Prepared for Pritchard Feyisanumi Francis', 'body', 'text/on-solid', { opacity: 0.7 }),
  ]);
  add(cover, abs(left, 120, 220));
  const phone = (p: FrameNode, x: number, y: number) => {
    const c = snapshot(p);
    c.rescale(0.62);
    const screenH = Math.round(852 * 0.62);
    if (c.height > screenH) {
      c.layoutSizingVertical = 'FIXED';
      c.resize(c.width, screenH);
    }
    c.clipsContent = true;
    c.cornerRadius = 36;
    c.effects = [COVER_SHADOW];
    add(cover, abs(c, x, y));
  };
  if (web) {
    add(cover, abs(browserWindow(web, 900), 960, 120));
    if (previews[0]) phone(previews[0], 900, 500);
    if (previews[1]) phone(previews[1], 1640, 440);
  } else {
    previews.forEach((p, i) => phone(p, 1000 + i * 300, 140 + (i % 2) * 80));
  }
  page.appendChild(cover);
  return cover;
}

function metaPill(label: string): FrameNode {
  const p = row({ name: label, pad: [8, 16], radius: 999, fill: [hexPaint('#FFFFFF', 0.14)] }, [text(label, 'smallStrong', 'text/on-solid')]);
  return p;
}
