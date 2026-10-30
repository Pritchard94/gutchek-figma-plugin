import { Token } from '../tokens';
import { PLATFORMS, abs, add, box, col, fill, icon, platformBadge, row, text, divider } from '../core/ui';
import { btn, center, chip, field, group, link, listRow, note, progressDots, screen, use, withSheet } from './kit';
import { tobi } from './data';

export function newSearch(): FrameNode {
  const chips = row(
    { name: 'Platforms', gap: 8, wrap: true, wrapGap: 8, w: 'fill' },
    PLATFORMS.map((p) => chip(p.name, p.code === 'IG')),
  );
  return screen(
    {
      name: 'New search',
      nav: { title: 'Run a Gutchek', action: 'x', back: false },
      gap: 18,
      footer: [link(btn('Find them', 'Primary', 'Large', 'search'), 'match'), center('Uses 1 of 4 reports left this month', 'caption', 'text/tertiary')],
      footerDivider: true,
    },
    [
      col({ name: 'Intro', gap: 6, w: 'fill' }, [
        text('Who are you getting to know?', 'h2', 'text/primary', { w: 'fill' }),
        text('Gutchek only reads public content. They are never notified.', 'small', 'text/secondary', { w: 'fill' }),
      ]),
      row({ name: 'Name', gap: 12, w: 'fill' }, [field('First name', 'Tobi'), field('Last name', 'Adeyemi')]),
      col({ name: 'Platform', gap: 10, w: 'fill' }, [text('Where do you know them from?', 'label', 'text/secondary'), chips]),
      link(field('Instagram handle', 'tobi.adeyemi', { state: 'Focused', prefix: '@', trailing: 'chevron-down', helper: 'One handle is enough. We find linked accounts through public links only.' }), 'searchPlatform'),
      col({ name: 'Optional', gap: 10, w: 'fill' }, [
        text('Optional, helps confirm identity', 'label', 'text/secondary'),
        group([listRow('City', null, 'map-pin', 'Value', 'Lagos'), listRow('Age range', null, 'calendar', 'Value', '27 to 32'), listRow('A photo you already have', null, 'image', 'Value', 'Add')]),
      ]),
      link(
        row({ name: 'Log my gut', w: 'fill', gap: 12, pad: [12, 14], radius: 16, fill: 'name/sky-tint' as Token }, [
          icon('leaf', 20, 'name/sky' as Token),
          col({ name: 'Text', gap: 1, w: 'fill' }, [text('Log my gut first', 'smallStrong', 'text/primary'), text('How do they feel to you? See it beside the result.', 'caption', 'text/secondary', { w: 'fill' })]),
          icon('chevron-right', 18, 'text/tertiary'),
        ]),
        'logGut',
      ),
      note('shield-check', 'For dating and personal safety only. Searches are private and rate-limited to prevent misuse.', 'brand'),
    ],
  );
}

export function newSearchPlatform(): FrameNode {
  const base = newSearch();
  const rows = PLATFORMS.map((p, i) => {
    const on = p.code === 'IG';
    return col({ name: p.name, w: 'fill', gap: 0 }, [
      i > 0 ? divider() : null,
      row({ name: 'Row', w: 'fill', gap: 14, pad: [12, 0] }, [
        platformBadge(p.code, 32),
        text(p.name, 'body', 'text/primary', { w: 'fill' }),
        box({ name: 'Radio', dir: 'h', w: 22, h: 22, radius: 11, stroke: on ? 'brand/fg' : 'border/strong', strokeW: on ? 6 : 1.5, fill: 'bg/surface' }, []),
      ]),
    ]);
  });
  return withSheet(base, 'Choose a platform', [col({ name: 'Options', gap: 0, w: 'fill' }, rows), btn('Done')], 'New search · Platform sheet');
}

function cardStack(): FrameNode {
  const top = use('MatchCard', { Tier: 'Confirmed' }, { name: tobi.name, handle: tobi.handle, initials: tobi.initials });
  const h = Math.round(top.height);
  const stack = box({ name: 'Card stack', dir: 'none', w: 353, h: h + 32 });
  const back2 = box({ name: 'Card behind 2', dir: 'v', w: 273, h, radius: 24, fill: 'bg/raised', stroke: 'border/default', opacity: 0.5 });
  const back1 = box({ name: 'Card behind 1', dir: 'v', w: 297, h, radius: 24, fill: 'bg/raised', stroke: 'border/default', opacity: 0.8 });
  add(stack, abs(back2, 40, 28));
  add(stack, abs(back1, 28, 14));
  add(stack, abs(top, 16, 0));
  return stack;
}

export function matchConfirm(): FrameNode {
  const what = row({ name: 'What we compared', gap: 6 }, [icon('info', 16, 'brand/fg'), text('What we compared', 'smallStrong', 'brand/fg')]);
  link(what, 'matchCompared');
  return screen(
    {
      name: 'Match confirmation',
      nav: { title: 'Confirm accounts', action: 'help', backTo: 'search' },
      cross: 'center',
      gap: 14,
      footer: [
        row({ name: 'Decision', gap: 12, w: 'fill' }, [btn('Not them', 'Secondary', 'Large', 'x'), link(btn("That's them", 'Primary', 'Large', 'check'), 'linkedAccounts')]),
        what,
      ],
    },
    [
      row({ name: 'Counter', gap: 10 }, [progressDots(3, 0), text('Account 1 of 3', 'label', 'text/secondary')]),
      center('Is this ' + tobi.first + '?', 'h2'),
      center("Only accounts you confirm are analysed. Possible matches are never scored unless you say yes.", 'small', 'text/secondary'),
      cardStack(),
    ],
  );
}

export function matchCompared(): FrameNode {
  const base = matchConfirm();
  const item = (ok: 'yes' | 'info', label: string, detail: string) =>
    row({ name: label, w: 'fill', gap: 12, pad: [10, 0], cross: 'start' }, [
      icon(ok === 'yes' ? 'check-circle' : 'info', 20, ok === 'yes' ? 'positive/fg' : 'text/tertiary'),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(label, 'bodyStrong', 'text/primary', { w: 'fill' }), text(detail, 'small', 'text/secondary', { w: 'fill' })]),
    ]);
  return withSheet(
    base,
    'What we compared',
    [
      item('yes', 'Display name matches', '"Tobi Adeyemi" on Instagram and the name you entered.'),
      item('yes', 'Link in bio', 'Instagram bio links to tiktok.com/@tobiadeyemi.'),
      item('yes', 'Same unique username', '@tobiadeyemi on X with a matching display name.'),
      item('yes', 'Location text', 'Bio says Lagos, which matches the city you added.'),
      item('info', 'What we never use', 'No face recognition and no writing-style matching to find or unmask accounts.'),
      btn('Got it'),
    ],
    'Match confirmation · What we compared',
  );
}

export function processing(): FrameNode {
  const step = (state: string, label: string, detail: string) => fill(use('ProgressStep', { State: state }, { label, detail }));
  const close = btn('Continue in background', 'Secondary');
  return screen(
    {
      name: 'Processing',
      nav: { title: '', action: 'x', back: false },
      cross: 'center',
      gap: 16,
      footer: [link(close, 'report')],
    },
    [
      use('GutMeter', { Tilt: 'Pending' }),
      col({ name: 'Heading', gap: 6, w: 'fill' }, [center('Weighing the evidence', 'h2'), center('This usually takes under a minute.', 'small', 'text/secondary')]),
      col({ name: 'Steps', gap: 14, w: 'fill', pad: [4, 4] }, [
        step('Done', 'Finding public profiles', '3 accounts confirmed'),
        step('Done', 'Reading public posts', '214 posts, captions and comments'),
        step('Active', 'Weighing signals', 'Checking context: quotes, lyrics and satire'),
        step('Pending', 'Writing your report', 'Summary, personality and evidence'),
      ]),
      note('bell', "You can leave this screen. We'll send a notification when the report is ready.", 'neutral'),
    ],
  );
}
