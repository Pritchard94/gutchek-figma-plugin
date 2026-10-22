import { Token, contrast, primitives, tokenHex } from '../tokens';
import { ctx } from '../core/ctx';
import { FillSpec, Kid, abs, add, box, col, gradient, hexPaint, icon, paint, rect, row, text, pill, avatar } from '../core/ui';
import { appIcon, glyph, lockup } from '../brand';
import { use } from '../components/library';
import { board, bullet, layoutHorizontally, section } from './common';
import { swatchChip, themedPanel } from './foundations';

const EYEBROW = 'Libra · Brand guideline';

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
      text(positive ? 'Libra is' : 'Libra is not', 'h3', positive ? 'brand/on-subtle' : 'text/primary'),
      ...rows.map((r) => row({ name: r, gap: 10, w: 'fill', cross: 'start' }, [icon(positive ? 'check' : 'x', 20, positive ? 'brand/fg' : 'text/tertiary'), text(r, 'body', 'text/primary', { w: 'fill' })])),
    ]);
  return board(
    EYEBROW + ' · 01',
    'Brand essence',
    'Libra takes its name from the scale: one pan holds reasons to move forward, the other holds reasons to be careful. Everything in the brand expresses balance and fairness, never accusation.',
    [
      row({ name: 'Statements', gap: 24, w: 'fill', cross: 'start' }, [
        card([text('Purpose', 'overline', 'brand/fg'), text('Help people make safer, better-informed decisions about someone they are getting to know.', 'h2', 'text/primary', { w: 'fill' })]),
        card([text('Promise', 'overline', 'brand/fg'), text('A fast, fair second opinion, with the evidence on the table.', 'h2', 'text/primary', { w: 'fill' })]),
        card([text('Positioning', 'overline', 'brand/fg'), text('The calm, evidence-first alternative to gossip boards and spy-style background checks.', 'h2', 'text/primary', { w: 'fill' })]),
      ]),
      section('Personality', 'Four traits guide every design and writing decision.', [
        row({ name: 'Traits', gap: 24, w: 'fill', cross: 'start' }, [
          trait('Balanced', 'We weigh the good as seriously as the bad. Positive evidence always gets equal space.', 'scale'),
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
  const twoTone = glyph(88, 'brand/fg');
  const pans = twoTone.findAll((n) => n.type === 'VECTOR' && 'fills' in n && Array.isArray(n.fills) && (n.fills as Paint[]).length > 0);
  if (pans[0]) (pans[0] as VectorNode).fills = [paint('caution/fg')];
  if (pans[1]) (pans[1] as VectorNode).fills = [paint('positive/fg')];
  const stretched = glyph(88, 'brand/fg');
  for (const c of stretched.children) {
    if ('constraints' in c) (c as ConstraintMixin).constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
  }
  stretched.resize(150, 64);
  const spy = row({ name: 'Spy', gap: 8, cross: 'center' }, [glyph(72, 'brand/fg'), icon('eye', 40, 'brand/fg')]);

  return board(
    EYEBROW + ' · 02',
    'Logo',
    'The glyph is a balanced scale drawn with a single weight: a beam, a fulcrum and two equal pans. It always sits level. The lowercase wordmark is set in Plus Jakarta Sans ExtraBold with tight tracking, so it feels friendly rather than official.',
    [
      row({ name: 'Primary', gap: 24, w: 'fill' }, [
        labelled('Primary lockup on light surfaces', stage([lockup(72)], 'bg/canvas', 'Primary stage')),
        labelled('Reversed on Libra Indigo', stage([lockup(72, 'text/on-solid', 'text/on-solid')], [gradient([['#7556E3', 0], ['#4A30B0', 1]], 135)], 'Reversed stage')),
        labelled('Mono for single-colour print and partner use', stage([lockup(72, 'text/primary', 'text/primary')], 'bg/muted', 'Mono stage')),
      ]),
      row({ name: 'Marks', gap: 24, w: 'fill', cross: 'start' }, [
        labelled('App icon. Gradient Indigo 500 to 700 at 135 degrees, glyph at 58% of the tile.', stage([row({ name: 'Icons', gap: 24, cross: 'end' }, [appIcon(112), appIcon(80), appIcon(56), appIcon(40)])], 'bg/canvas', 'Icon stage', 300)),
        labelled('Clear space equals x, the height of one pan plus its strings, on every side.', stage([clear], 'bg/canvas', 'Clear space stage', 300)),
        labelled('Minimum sizes: glyph 20pt, lockup 88pt wide. Below that, use the glyph alone.', stage([row({ name: 'Minimums', gap: 32, cross: 'center' }, [glyph(20, 'brand/fg'), lockup(24)])], 'bg/canvas', 'Minimum stage', 300)),
      ]),
      section('Misuse', 'Keep the mark level, single-colour and free of surveillance imagery.', [
        row({ name: 'Misuse grid', gap: 24, w: 'fill', cross: 'start' }, [
          misuse('Do not tilt the mark. Only the in-product scale tilts, and only toward real evidence.', tilted),
          misuse('Do not colour the pans red and green. The logo stays neutral; scores carry meaning.', twoTone),
          misuse('Do not stretch, outline or redraw the glyph.', stretched),
          misuse('Do not pair the mark with eyes, magnifiers or crosshairs.', spy),
        ]),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 03 colour

function colour(): FrameNode {
  const hero = (name: string, hex: string, role: string, dark?: string) => {
    const f = col({ name, w: 'fill', h: 300, pad: 28, gap: 6, radius: 24, main: 'end', fill: [hexPaint(hex)] }, []);
    const ink = '#FFFFFF';
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
    ['Neutrals', 0.7, 'bg/muted'],
    ['Indigo', 0.2, 'brand/solid'],
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
    'Deep indigo is the voice of Libra: trustworthy, calm and distinct from the red-and-black palette of spy apps. Emerald and warm red belong to the scale. They carry meaning, so they never appear as decoration.',
    [
      row({ name: 'Core', gap: 20, w: 'fill' }, [
        hero('Libra Indigo', primitives.indigo['600'], 'Primary brand, actions, focus, links.', primitives.indigo['400']),
        hero('Positive Emerald', primitives.emerald['700'], 'Positive side of the scale only.', primitives.emerald['400']),
        hero('Caution Red', primitives.red['700'], 'Caution side of the scale and destructive actions only.', primitives.red['400']),
      ]),
      row({ name: 'Support', gap: 20, w: 'fill' }, [
        hero('Amber', primitives.amber['700'], 'Minor concerns, medium confidence, Likely matches.', primitives.amber['400']),
        hero('Ink', primitives.neutral['900'], 'Text and high-emphasis UI in light mode.'),
        hero('Night', primitives.night['950'], 'Dark mode canvas. Surfaces step up through 900 and 850.'),
      ]),
      section('Proportion', 'Neutral surfaces do most of the work. Indigo guides the eye; signal colours appear only where there is a finding.', [
        ratioBar,
        ratioLegend,
      ]),
      section('Accessible pairings', 'All text pairings meet WCAG 2.2 AA (4.5:1). Ratios are computed from the tokens in this file.', [
        row({ name: 'Pairs', gap: 16, w: 'fill' }, [
          pair('text/primary', 'bg/canvas', 'Text on canvas'),
          pair('text/secondary', 'bg/surface', 'Secondary on surface'),
          pair('text/on-solid', 'brand/solid', 'On indigo'),
          pair('brand/on-subtle', 'brand/subtle', 'Indigo tint'),
          pair('positive/fg', 'positive/subtle', 'Positive tint'),
          pair('caution/fg', 'caution/subtle', 'Caution tint'),
          pair('warning/fg', 'warning/subtle', 'Amber tint'),
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
      section('Hierarchy in use', 'A report header shows how the scale carries meaning: verdict first, numbers second, context third.', [
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
          bullet('Never set body text below 14pt or captions below 12pt. Support Dynamic Type up to XXL without truncating scores.'),
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
  overlay(0, 852 - 83, 393, 83, 'brand/solid', 'Tab bar 49 + home indicator 34', 0.12);
  overlay(0, 98, 20, 852 - 98 - 83, 'caution/fg', '', 0.18);
  overlay(373, 98, 20, 852 - 98 - 83, 'caution/fg', '', 0.18);
  const colW = (353 - 3 * 16) / 4;
  for (let i = 0; i < 4; i++) overlay(20 + i * (colW + 16), 98, colW, 852 - 98 - 83, 'positive/fg', i === 0 ? 'Col' : '', 0.1);
  return board(
    EYEBROW + ' · 05',
    'Layout',
    'Designed at 393 by 852 (iPhone 15 and 16), scaling down to 375 and up to 430. A four-column grid with 20pt margins and 16pt gutters keeps cards, lists and the scale aligned.',
    [
      row({ name: 'Layout', gap: 64, w: 'fill', cross: 'start' }, [
        phone,
        col({ name: 'Notes', gap: 20, w: 'fill' }, [
          text('Rhythm', 'h2', 'text/primary'),
          bullet('Margins 20pt. Cards pad 16 to 20pt. Sections are separated by 32pt, items inside a section by 12 to 16pt.'),
          bullet('Touch targets are at least 44 by 44pt, including icon buttons and list rows.'),
          bullet('Primary actions sit in the bottom third of the screen, within thumb reach, above the home indicator.'),
          bullet('Long reports scroll inside a fixed frame; the nav bar stays pinned and the tab bar hides on pushed screens.'),
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
  const names = ['scale', 'shield-check', 'alert-triangle', 'check-circle', 'search', 'eye-off', 'external-link', 'lock', 'users', 'map-pin', 'calendar', 'bell', 'bookmark', 'heart', 'life-buoy', 'navigation'];
  return board(
    EYEBROW + ' · 06',
    'Iconography and imagery',
    'Icons come from Lucide: open, rounded and quiet. Imagery stays abstract. Libra never shows stock photos of phones, keyholes or silhouettes, and never displays a searched person\'s photo outside the match confirmation step.',
    [
      row({ name: 'Icon grid', gap: 16, w: 'fill', wrap: true, wrapGap: 16 }, names.map((n) => col({ name: n, w: 140, pad: 20, gap: 12, cross: 'center', radius: 16, fill: 'bg/canvas' }, [icon(n, 32, 'text/primary'), text(n, 'caption', 'text/secondary')]))),
      row({ name: 'Rules', gap: 24, w: 'fill', cross: 'start' }, [
        doDont(true, 'Pair every signal colour with an icon and a word: a triangle for Caution, a check for Positive.', row({ name: 'Example', gap: 8 }, [use('ScoreBadge', { Side: 'Caution' }), use('ScoreBadge', { Side: 'Positive' })])),
        doDont(true, 'Use initials avatars on soft tints. They keep people identifiable without amplifying their photos.', row({ name: 'Avatars', gap: 8 }, [avatar('TA', 48, 'brand'), avatar('SB', 48, 'positive'), avatar('KO', 48, 'warning'), avatar('DO', 48, 'neutral')])),
        doDont(false, 'Do not use surveillance metaphors: eyes, crosshairs, magnifying glasses over faces, or redacted bars.', row({ name: 'Bad icons', gap: 12, opacity: 0.6 }, [icon('eye', 40, 'text/secondary'), icon('search', 40, 'text/secondary')])),
      ]),
    ],
  );
}

// ---------------------------------------------------------------- 07 the scale

function signature(): FrameNode {
  const states = ['Positive', 'Balanced', 'Caution', 'Pending', 'Low'];
  const motion: Array<[string, string]> = [
    ['Tilt', 'Spring, stiffness 120, damping 14, about 600ms. Maximum tilt 7 degrees; the angle maps to the score difference.'],
    ['Load', 'While processing, the beam rocks plus or minus 3 degrees on a 2.4s ease-in-out loop. Stage copy changes as each step completes.'],
    ['Reveal', 'Scores count up from 0 over 500ms after the tilt settles. Light haptic (impactLight) on settle.'],
    ['Reduced motion', 'No rocking or counting. The final state crossfades in over 200ms.'],
  ];
  return board(
    EYEBROW + ' · 07',
    'The Libra Scale',
    'The signature element of the product. Two independent scores, one per pan, and a beam that leans toward the heavier side. It turns a complicated analysis into one honest picture, and it always sits next to its confidence level.',
    [
      row({ name: 'Anatomy', gap: 48, w: 'fill', cross: 'center' }, [
        card([use('ScaleDial', { Tilt: 'Positive' }), use('ConfidenceBadge', { Level: 'High' })], 449, 'bg/canvas', 48, 20, 'Hero dial'),
        col({ name: 'Anatomy notes', gap: 16, w: 'fill' }, [
          text('Anatomy', 'h2', 'text/primary'),
          bullet('Left pan: Caution score, 1 to 10. Red, triangle icon, labelled.'),
          bullet('Right pan: Positive score, 1 to 10. Emerald, check icon, labelled.'),
          bullet('Beam: tilts toward the heavier side. Balanced reports stay level.'),
          bullet('Confidence badge: High, Medium or Low, with how much data the score is based on.'),
          bullet('Low confidence caps the scores and turns the whole dial neutral, with the message "Not enough public information".'),
        ]),
      ]),
      section('States', null, [row({ name: 'States', gap: 16, w: 'fill', wrap: true, wrapGap: 16 }, states.map((s) => card([use('ScaleDial', { Tilt: s }), text(s, 'smallStrong', 'text/secondary')], 401, 'bg/canvas', 24, 12, s)))]),
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
    'Libra sounds like a level-headed friend who has done the reading: factual, warm and brief. We describe content, not character, and we are honest about what we do not know.',
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
    'Libra is a safety product, so it has to work for everyone: in bright sun, at large text sizes, with a screen reader, or for someone who is anxious and reading quickly.',
    [
      row({ name: 'Columns', gap: 24, w: 'fill', cross: 'start' }, [
        col({ name: 'Left', gap: 16, w: 'fill' }, [
          item('Contrast', 'Text meets WCAG AA in both themes (4.5:1 body, 3:1 large text and UI). Ratios are documented on Foundations.'),
          item('Never colour alone', 'Caution and Positive always carry an icon and a word. Charts use position and labels as well as hue.'),
          item('Dynamic Type', 'Layouts reflow up to accessibility sizes. Score numerals scale; labels wrap instead of truncating.'),
          item('Dark mode', 'Every screen ships in light and dark from the same tokens. Users can follow the system or choose.'),
        ]),
        col({ name: 'Right', gap: 16, w: 'fill' }, [
          item('Screen readers', 'The scale reads as one element: "Caution 2 out of 10, Positive 8 out of 10, mostly positive, high confidence."'),
          item('Touch and focus', '44pt minimum targets, visible focus rings (border/focus, 2pt) and logical focus order.'),
          item('Motion', 'Respect Reduce Motion: no rocking scale, no count-ups, crossfades only.'),
          item('Emotional safety', 'Severe reports open with a pause screen, findings are collapsed by default, and support resources are one tap away.'),
        ]),
      ]),
    ],
  );
}

export function buildGuidelines(page: PageNode): PageNode {
  ctx.theme = 'light';
  const boards = [essence(), logo(), colour(), typography(), layout(), iconography(), signature(), voice(), accessibility()];
  for (const b of boards) page.appendChild(b);
  layoutHorizontally(boards, 160);
  return page;
}

// ---------------------------------------------------------------- cover

export function buildCover(previews: FrameNode[], page: PageNode): PageNode {
  ctx.theme = 'light';
  const cover = box({ name: 'Cover', dir: 'none', w: 1920, h: 1080, fill: [gradient([['#2C1E66', 0], ['#5B3FD1', 0.65], ['#7556E3', 1]], 120)], clip: true });
  const left = col({ name: 'Copy', gap: 28, w: 820 }, [
    lockup(72, 'text/on-solid', 'text/on-solid'),
    text('Know the person behind the DMs', { family: 'display', weight: 800, size: 80, line: 88, tracking: -3 }, 'text/on-solid', { w: 'fill' }),
    text('Brand guideline, design system and mobile app design · v1.0', { family: 'ui', weight: 500, size: 24, line: 34 }, 'text/on-solid', { w: 'fill', opacity: 0.85 }),
    row({ name: 'Meta', gap: 12, wrap: true, w: 'fill' }, [
      metaPill('October 2026'),
      metaPill('iOS 393 × 852'),
      metaPill('Light and dark'),
      metaPill('React Native + NativeWind'),
    ]),
    text('Prepared for Pritchard Feyisanumi Francis', 'body', 'text/on-solid', { opacity: 0.7 }),
  ]);
  add(cover, abs(left, 120, 220));
  previews.forEach((p, i) => {
    const c = p.clone();
    c.rescale(0.72);
    c.cornerRadius = 40;
    c.effects = [{ type: 'DROP_SHADOW', color: { r: 0.05, g: 0.03, b: 0.2, a: 0.45 }, offset: { x: 0, y: 32 }, radius: 64, spread: 0, visible: true, blendMode: 'NORMAL' }];
    add(cover, abs(c, 1000 + i * 300, 140 + (i % 2) * 80));
  });
  page.appendChild(cover);
  cover.x = 0;
  cover.y = 0;
  return page;
}

function metaPill(label: string): FrameNode {
  const p = row({ name: label, pad: [8, 16], radius: 999, fill: [hexPaint('#FFFFFF', 0.14)] }, [text(label, 'smallStrong', 'text/on-solid')]);
  return p;
}
