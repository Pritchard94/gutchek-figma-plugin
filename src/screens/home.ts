import { avatar, box, col, fill, gradient, hexPaint, icon, row, text } from '../core/ui';
import { glyph } from '../brand';
import { btn, chip, field, iconTile, link, scorePair, screen, sectionHead, surface, use } from './kit';
import { Person, daniel, kemi, people, seun, tobi, user } from './data';

function newLibraCard(credits = '4 of 5 reports left this month'): FrameNode {
  const white = (str: string, style: 'h2' | 'small' | 'caption', opacity = 1) => {
    const t = text(str, style, 'text/on-solid', { w: 'fill', opacity });
    return t;
  };
  const cta = row({ name: 'New Libra button', h: 44, pad: [0, 16], gap: 8, radius: 12, fill: [hexPaint('#FFFFFF')], cross: 'center' }, [
    icon('plus', 20, 'brand/solid'),
    text('New Libra', 'bodyStrong', 'brand/solid'),
  ]);
  for (const n of cta.findAll((c) => c.type === 'TEXT')) (n as TextNode).fills = [hexPaint('#4A30B0')];
  link(cta, 'search');
  return col({ name: 'New Libra card', w: 'fill', pad: 20, gap: 12, radius: 24, fill: [gradient([['#7556E3', 0], ['#4A30B0', 1]], 135)], clip: true }, [
    row({ name: 'Top', w: 'fill', gap: 12 }, [glyph(36, 'text/on-solid'), box({ name: 'Spacer', w: 'fill', h: 1 }), text(credits, 'caption', 'text/on-solid', { opacity: 0.8 })]),
    white('Start a new Libra', 'h2'),
    white('Add a name and one social handle. A balanced, evidence-linked report in under a minute.', 'small', 0.88),
    cta,
  ]);
}

function reportRow(p: Person, target?: string): FrameNode {
  const r = row({ name: 'Report ' + p.first, w: 'fill', pad: 14, gap: 12, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    avatar(p.initials, 44, p.tone),
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      text(p.name, 'bodyStrong', 'text/primary', { w: 'fill' }),
      text(p.verdict, 'small', 'text/secondary', { w: 'fill' }),
      text(p.updated, 'caption', 'text/tertiary', { w: 'fill' }),
    ]),
    p.confidence === 'Low' ? use('ConfidenceBadge', { Level: 'Low' }, { label: 'Low data' }) : col({ name: 'Mini', gap: 4, cross: 'end' }, [scorePair(String(p.caution), String(p.positive))]),
  ]);
  if (target) link(r, target);
  return r;
}

export function home(): FrameNode {
  const saved = row(
    { name: 'Saved people', gap: 16, w: 'fill' },
    people.map((p) => col({ name: p.first, gap: 6, cross: 'center', w: 'fill' }, [avatar(p.initials, 56, p.tone), text(p.first, 'label', 'text/secondary')])),
  );
  return screen(
    { name: 'Home', tab: 'Home', nav: { type: 'Large', title: 'Good evening, ' + user.first, action: 'bell', actionTo: 'notificationsList' }, gap: 24 },
    [
      newLibraCard(),
      col({ name: 'Recent', gap: 12, w: 'fill' }, [sectionHead('Recent reports', 'See all', 'saved'), reportRow(tobi, 'report'), reportRow(daniel, 'reportSevere')]),
      row({ name: 'Safety tip', w: 'fill', pad: 16, gap: 14, radius: 16, fill: 'positive/subtle', cross: 'start' }, [
        iconTile('life-buoy', 'positive', 40),
        col({ name: 'Text', gap: 4, w: 'fill' }, [
          text('Safety tip of the day', 'overline', 'positive/fg'),
          text('Meet first dates somewhere public, and let a friend know your plans with Share my date.', 'small', 'text/primary', { w: 'fill' }),
          text('Open Safety Hub', 'smallStrong', 'positive/fg'),
        ]),
      ]),
      col({ name: 'Saved', gap: 12, w: 'fill' }, [sectionHead('Saved people', 'Manage', 'saved'), saved]),
    ],
  );
}

export function homeEmpty(): FrameNode {
  const step = (n: string, title: string) =>
    row({ name: 'Step ' + n, w: 'fill', gap: 12 }, [
      box({ name: 'Number', dir: 'h', w: 28, h: 28, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(n, 'smallStrong', 'brand/on-subtle')]),
      text(title, 'small', 'text/primary', { w: 'fill' }),
    ]);
  return screen(
    { name: 'Home · First time', tab: 'Home', nav: { type: 'Large', title: 'Hi, ' + user.first, action: 'bell' }, gap: 20 },
    [
      newLibraCard('1 free report this month'),
      fill(use('EmptyState', {}, { title: 'No reports yet', body: 'Reports you run appear here. Saved people stay private to you.' })),
      surface(
        [
          text('How Libra works', 'title', 'text/primary'),
          step('1', 'Add a name and one social handle'),
          step('2', "Confirm the accounts that are really theirs"),
          step('3', 'Read a balanced, evidence-linked report'),
        ],
        'How it works',
        16,
        12,
      ),
    ],
  );
}

export function saved(): FrameNode {
  const card = (p: Person, target?: string) => {
    const c = col({ name: 'Saved ' + p.first, w: 'fill', pad: 16, gap: 12, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
      row({ name: 'Top', w: 'fill', gap: 12 }, [
        avatar(p.initials, 44, p.tone),
        col({ name: 'Text', gap: 2, w: 'fill' }, [text(p.name, 'bodyStrong', 'text/primary', { w: 'fill' }), text(p.verdict, 'small', 'text/secondary', { w: 'fill' })]),
        p.confidence === 'Low' ? use('ConfidenceBadge', { Level: 'Low' }, { label: 'Low data' }) : scorePair(String(p.caution), String(p.positive)),
      ]),
      p.note
        ? link(row({ name: 'Note', w: 'fill', pad: [10, 12], gap: 8, radius: 10, fill: 'bg/subtle', cross: 'start' }, [icon('pencil', 16, 'text/tertiary'), text(p.note, 'small', 'text/secondary', { w: 'fill' })]), 'addNote')
        : null,
    ]);
    if (target) link(c, target);
    return c;
  };
  return screen(
    {
      name: 'Saved',
      tab: 'Saved',
      nav: { type: 'Large', title: 'Saved', action: 'columns' },
      gap: 16,
      footer: [link(btn('Compare two people', 'Secondary', 'Large', 'columns'), 'comparePicker')],
    },
    [
      field('Search', 'Search saved people', { state: 'Default', leading: 'search', hideLabel: true }),
      row({ name: 'Filters', gap: 8 }, [chip('All', true), chip('Positive'), chip('Caution'), chip('Low data')]),
      card(tobi, 'report'),
      card(seun),
      card(daniel, 'reportSevere'),
      card(kemi, 'reportLow'),
    ],
  );
}