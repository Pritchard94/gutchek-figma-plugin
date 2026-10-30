import { Token } from '../tokens';
import { Tone, abs, add, avatar, box, circle, col, icon, paint, platformBadge, row, text, toneTokens } from '../core/ui';
import { use } from './library';
import { bubble, nickAvatar, roomMessage, shotThumb } from './chat';
import { doodleLayer } from './doodles';
import { WEEK, noteCard, weekStrip } from './notes';

/**
 * Onboarding and marketing illustrations, built from real UI parts so they theme with the file
 * and never drift from the product. Each scene is 353 by 360 and can be rescaled.
 */
export const ILLO_W = 353;
export const ILLO_H = 360;

export function blob(size: number, token: Token, opacity: number): EllipseNode {
  const c = circle(size, token, 'Glow');
  c.opacity = opacity;
  c.effects = [{ type: 'LAYER_BLUR', blurType: 'NORMAL', radius: Math.round(size * 0.32), visible: true } as Effect];
  return c;
}

export function stage(name: string, glows: Array<[number, Token, number, number, number]>): FrameNode {
  const f = box({ name, dir: 'none', w: ILLO_W, h: ILLO_H, radius: 36, fill: 'brand/subtle', clip: true });
  for (const [size, token, opacity, x, y] of glows) add(f, abs(blob(size, token, opacity), x, y));
  add(f, abs(doodleLayer(ILLO_W, ILLO_H, 'brand/fg', 0.06, name.length * 7), 0, 0));
  return f;
}

/** Floating glass chip used around the hero card. */
export function floatChip(iconName: string, label: string, tone: Tone = 'brand'): FrameNode {
  const t = toneTokens[tone];
  return row({ name: 'Chip · ' + label, gap: 8, pad: [8, 12, 8, 8], radius: 999, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    box({ name: 'Icon', dir: 'h', w: 24, h: 24, radius: 12, fill: t.bg, main: 'center', cross: 'center' }, [icon(iconName, 14, t.fg)]),
    text(label, 'smallStrong', 'text/primary'),
  ]);
}

function orbit(code: string): FrameNode {
  return box({ name: 'Orbit ' + code, dir: 'h', w: 44, h: 44, radius: 22, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2', main: 'center', cross: 'center' }, [platformBadge(code, 28)]);
}

/** Run a Gutchek: public accounts flow into the Gut Meter, with proof attached. */
export function illoMeter(): FrameNode {
  const f = stage('Illustration · Gut Meter', [
    [240, 'brand/border', 0.9, -60, -50],
    [200, 'positive/subtle', 1, 190, 210],
  ]);
  const dial = use('GutMeter', { Tilt: 'Positive' }) as InstanceNode;
  dial.rescale(0.74);
  const card = col({ name: 'Report card', w: 290, pad: [16, 14, 14, 14], gap: 10, radius: 28, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2', cross: 'center' }, [
    row({ name: 'Who', w: 'fill', gap: 10 }, [
      avatar('TA', 36, 'brand'),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text('Tobi Adeyemi', 'smallStrong', 'text/primary'), row({ name: 'Handle', gap: 4 }, [platformBadge('IG', 14), text('@tobi.adeyemi', 'caption', 'text/tertiary')])]),
      use('ConfidenceBadge', { Level: 'High' }),
    ]),
    dial,
  ]);
  add(f, abs(card, 32, 74));
  add(f, abs(orbit('IG'), 14, 40));
  add(f, abs(orbit('X'), 298, 120));
  add(f, abs(orbit('TT'), 10, 236));
  add(f, abs(floatChip('check-circle', 'Supportive replies', 'positive'), 150, 26));
  add(f, abs(floatChip('flag', 'One heated thread', 'caution'), 20, 316));
  add(f, abs(floatChip('link', 'See the proof', 'brand'), 200, 316));
  return f;
}

/** Check a Chat: screenshots are read, speakers confirmed, patterns tagged with the exact messages. */
export function illoChat(): FrameNode {
  const f = stage('Illustration · Check a Chat', [
    [220, 'caution/subtle', 1, 200, -60],
    [220, 'brand/border', 0.8, -70, 190],
  ]);
  const back1 = shotThumb(1, 120);
  const back2 = shotThumb(2, 120);
  add(f, abs(back1, 18, 58));
  add(f, abs(back2, 218, 46));
  back1.rotation = 8;
  back2.rotation = -8;
  const panel = col({ name: 'Chat', w: 292, pad: 14, gap: 10, radius: 26, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    row({ name: 'Head', gap: 8, w: 'fill' }, [avatar('K', 28, 'neutral'), text('Kunle · from Hinge', 'smallStrong', 'text/primary', { w: 'fill' }), platformBadge('WA', 20)]),
    bubble('Send me your WhatsApp now, this app is slow', 'them', { flag: 'caution', tag: 'Pressure', max: 228 }),
    bubble('Maybe later this week?', 'you', { max: 200 }),
    bubble('No pressure at all, take your time', 'them', { flag: 'positive', tag: 'Respects boundaries', max: 228 }),
  ]);
  add(f, abs(panel, 30, 86));
  add(f, abs(floatChip('sparkle', 'Finding patterns', 'brand'), 16, 28));
  add(f, abs(floatChip('eye-off', 'Numbers masked', 'neutral'), 188, 28));
  return f;
}

/** Notes: a private journal page, a week of moods, and the promises that keep it private. */
export function illoNotes(): FrameNode {
  const f = stage('Illustration · Notes', [
    [230, 'brand/border', 0.85, -50, -60],
    [220, 'name/sky-tint' as Token, 1, 180, 200],
  ]);
  const back = col({ name: 'Back page', w: 250, h: 200, radius: 22, fill: 'bg/raised', stroke: 'border/default', shadow: 'e1' }, []);
  add(f, abs(back, 70, 58));
  back.rotation = 7;
  const page = noteCard(
    { time: 'Today, 21:40', mood: 'Happy', person: 'Tobi', body: 'Long call tonight. He remembered my sister\u2019s wedding without me bringing it up. Felt really seen.', tags: ['talking'] },
    280,
  );
  page.effects = [];
  add(f, abs(page, 36, 92));
  page.rotation = -3;
  const week = col({ name: 'Week card', w: 250, pad: [12, 14], gap: 8, radius: 20, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    text('This week', 'label', 'text/secondary'),
    weekStrip(WEEK, 6, 'fill', 26),
  ]);
  add(f, abs(week, 84, 262));
  add(f, abs(floatChip('lock', 'Only you can see this', 'brand'), 150, 26));
  add(f, abs(floatChip('cloud', 'Synced', 'neutral'), 14, 34));
  return f;
}

/** Gist Rooms: nicknames, supportive reactions, and a bot that checks every post. */
export function illoRooms(): FrameNode {
  const f = stage('Illustration · Gist Rooms', [
    [230, 'brand/border', 0.9, 170, -40],
    [200, 'positive/subtle', 1, -60, 200],
  ]);
  const room = col({ name: 'Room', w: 296, pad: [14, 14, 10, 14], gap: 8, radius: 26, fill: 'bg/raised', stroke: 'border/default', shadow: 'e2' }, [
    row({ name: 'Head', gap: 10, w: 'fill' }, [
      box({ name: 'Tile', dir: 'h', w: 34, h: 34, radius: 10, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('messages', 18, 'brand/fg')]),
      col({ name: 'Text', gap: 0, w: 'fill' }, [text('Talking Stage Diaries', 'smallStrong', 'text/primary'), text('2.4k members · approval required', 'caption', 'text/tertiary')]),
    ]),
    roomMessage({ nick: 'QuietStorm_24', tone: 'brand', type: 'Win', time: '19:58', body: 'He said "no pressure" and actually meant it.', reactions: [[0, 24], [1, 11]], mine: 0 }),
  ]);
  add(f, abs(room, 28, 70));
  const faces = ['NaijaBelle', 'Tayo_Writes', 'Ronke.writes'].map((n) => {
    const a = nickAvatar(n, undefined, 40);
    a.strokes = [paint('bg/raised')];
    a.strokeWeight = 3;
    return a;
  });
  add(f, abs(row({ name: 'Members', gap: -10 }, faces), 230, 26));
  add(f, abs(floatChip('shield-check', 'Gist Bot checks every post', 'positive'), 22, 306));
  add(f, abs(floatChip('user', 'Nicknames only', 'brand'), 24, 26));
  return f;
}
