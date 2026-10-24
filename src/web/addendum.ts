import { Token } from '../tokens';
import { box, col, icon, pill, row, text } from '../core/ui';
import { GUTTER, ctaBand, display, featureCard, heading, lead, phone, section, webFooter, webNav, webPage, wlink } from './kit';
import { Screens } from './landing';
import { use } from '../components/library';

const CAUTION: Array<[string, string]> = [
  ['Love-bombing', 'Intense affection or promises very early, then withdrawal.'],
  ['Pressure and rushing', 'Pushing to meet, move off the app or send photos faster than you want.'],
  ['Boundary violation', 'Carrying on after "no" or "not yet", or guilt-tripping after refusal.'],
  ['Gaslighting', '"You are overreacting", denying what was said, flipping blame.'],
  ['Hot and cold', 'Long gaps, sudden intensity, plans that never happen.'],
  ['Control and jealousy', 'Demanding to know where you are, who you talk to, what you wear.'],
  ['Financial requests', 'Money, airtime, gifts or "urgent emergencies". A classic scam pattern.'],
  ['Threats and coercion', 'Threats, revenge talk or coercive sexual messages. Safety help comes first.'],
];

const POSITIVE: Array<[string, string]> = [
  ['Respects boundaries', 'Accepts "no" calmly, checks you are comfortable, waits.'],
  ['Consistent', 'Reliable replies, follows through, words match actions.'],
  ['Emotionally open', 'Shares feelings, listens and asks about you.'],
  ['Accountable', 'Apologises genuinely and changes behaviour.'],
];

function patternTile(title: string, body: string, tone: 'caution' | 'positive'): FrameNode {
  const fg: Token = tone === 'caution' ? 'caution/fg' : 'positive/fg';
  return col({ name: title, w: 282, gap: 10, pad: 24, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', gap: 8 }, [icon(tone === 'caution' ? 'alert-triangle' : 'check-circle', 18, fg), text(title, 'bodyStrong', 'text/primary')]),
    text(body, 'small', 'text/secondary', { w: 'fill' }),
  ]);
}

export function chatAnalysisPage(s: Screens): FrameNode {
  const art = box({ name: 'Hero art', dir: 'none', w: 560, h: 620, radius: 48, fill: 'brand/subtle', clip: true });
  const p1 = phone(s.chatUpload, 0.6, 'Phone · Upload');
  const p2 = phone(s.chatReport, 0.6, 'Phone · Report');
  art.appendChild(p1);
  p1.x = 40;
  p1.y = 44;
  art.appendChild(p2);
  p2.x = 276;
  p2.y = 96;
  return webPage('Chat analysis', [
    webNav('chat'),
    row({ name: 'Hero', w: 'fill', pad: [72, GUTTER, 96, GUTTER], gap: 64, cross: 'center' }, [
      col({ name: 'Copy', gap: 26, w: 'fill' }, [
        pill('New · Chat analysis', 'brand', 'message'),
        text('How are they really talking to you?', display(68, 76), 'text/primary', { w: 'fill' }),
        text('Upload screenshots or a chat export. Libra spots patterns like pressure, love-bombing or money requests, and the good stuff too, with the exact messages as evidence.', lead, 'text/secondary', { w: 'fill' }),
        row({ name: 'Points', gap: 24 }, [
          row({ name: 'Free', gap: 8 }, [icon('sparkle', 18, 'brand/fg'), text('2 free a month', 'smallStrong', 'text/secondary')]),
          row({ name: 'Delete', gap: 8 }, [icon('trash', 18, 'brand/fg'), text('Uploads deleted in 24h', 'smallStrong', 'text/secondary')]),
          row({ name: 'Mask', gap: 8 }, [icon('eye-off', 18, 'brand/fg'), text('Numbers and addresses masked', 'smallStrong', 'text/secondary')]),
        ]),
        wlink(row({ name: 'CTA', gap: 12 }, [use('Button', { Variant: 'Primary', Size: 'Large' }, { label: 'Get the app' }), use('Button', { Variant: 'Secondary', Size: 'Large' }, { label: 'See a sample report' })]), 'landing'),
      ]),
      art,
    ]),
    section('Patterns', [
      heading('What Libra looks for', 'Patterns, not single messages', 'Each pattern has a written definition and needs at least three instances before it is labelled. Banter is checked on both sides first.', { align: 'center', w: 900 }),
      row({ name: 'Caution', w: 'fill', gap: 24, wrap: true, wrapGap: 24 }, CAUTION.map(([t, b]) => patternTile(t, b, 'caution'))),
      row({ name: 'Positive', w: 'fill', gap: 24, wrap: true, wrapGap: 24 }, POSITIVE.map(([t, b]) => patternTile(t, b, 'positive'))),
    ], { fill: 'bg/surface', cross: 'center' }),
    section('Privacy', [
      heading('Privacy', 'Their messages are personal data. We treat them that way.', null, { align: 'center', w: 900 }),
      row({ name: 'Cards', w: 'fill', gap: 24, cross: 'start' }, [
        featureCard('trash', 'Deleted in 24 hours', 'Raw uploads are deleted within a day. Saved reports keep short, redacted excerpts only.'),
        featureCard('eye-off', 'Redacted first', 'Phone numbers, emails, addresses, bank and ID numbers are masked before analysis.'),
        featureCard('lock', 'Never shared', 'Chat reports are never posted to Rooms, never searchable and never used to label anyone publicly.'),
        featureCard('shield', 'Safety first', 'Threats or sextortion trigger a safety card with steps and support lines before any score.'),
      ]),
    ], { cross: 'center' }),
    section('Limits', [
      row({ name: 'Panel', w: 'fill', gap: 48, pad: 56, radius: 40, fill: 'warning/subtle', cross: 'center' }, [
        icon('info', 40, 'warning/fg'),
        col({ name: 'Copy', gap: 12, w: 'fill' }, [
          text('Honest about its limits', display(36, 44), 'text/primary', { w: 'fill' }),
          text('A report is based only on the messages you provide. Screenshots can be cropped, edited or miss context, and Libra cannot verify them. Chat signals sit next to public signals, never mixed in.', lead, 'text/secondary', { w: 'fill' }),
        ]),
      ]),
    ], { pad: [0, GUTTER] }),
    section('CTA', [ctaBand('See the conversation clearly', 'Your first two chat analyses each month are free.')], { pad: [96, GUTTER] }),
    webFooter(),
  ]);
}

export function communityGuidelines(): FrameNode {
  const rule = (n: string, title: string, body: string, ok: boolean) =>
    row({ name: title, w: 'fill', gap: 20, pad: 28, radius: 20, fill: 'bg/surface', stroke: 'border/default', cross: 'start' }, [
      box({ name: 'Number', dir: 'h', w: 40, h: 40, radius: 20, fill: ok ? 'positive/subtle' : 'caution/subtle', main: 'center', cross: 'center' }, [text(n, 'bodyStrong', ok ? 'positive/fg' : 'caution/fg')]),
      col({ name: 'Text', gap: 6, w: 'fill' }, [text(title, 'h3', 'text/primary', { w: 'fill' }), text(body, 'body', 'text/secondary', { w: 'fill' })]),
    ]);
  const ladder: Array<[string, string, string, 'neutral' | 'warning' | 'caution']> = [
    ['Warning', 'First minor breach, like rude tone or off-topic posts', 'Post removed with an explanation', 'neutral'],
    ['Strike 1', 'Repeated minor or one moderate breach', '24-hour mute', 'warning'],
    ['Strike 2', 'Another breach within 30 days', '7-day room ban', 'warning'],
    ['Strike 3', 'Third breach within 90 days', '30-day ban from all rooms', 'caution'],
    ['Permanent', 'Threats, doxxing, minors, leaked images, severe harassment', 'Removal, with a limited appeal', 'caution'],
  ];
  return webPage('Community guidelines', [
    webNav(),
    col({ name: 'Hero', w: 'fill', pad: [96, GUTTER, 80, GUTTER], cross: 'center', fill: 'bg/surface' }, [
      heading('Gossip Rooms', 'Community guidelines', 'Rooms are for sharing your own experience and supporting each other. They are not for exposing anyone. These rules apply in every room.', { align: 'center', w: 880, size: 60 }),
    ]),
    section('Rules', [
      rule('1', 'Share your own experience', '"This happened to me" is welcome. Accusing a named person of a crime is not, and is held for review.', true),
      rule('2', 'Never identify anyone', 'No full names, phone numbers, addresses, workplaces, handles, photos or screenshots that reveal identity.', false),
      rule('3', 'No threats or sexual violence content', 'Including jokes, revenge posts and encouragement of harm.', false),
      rule('4', 'No hate, harassment or pile-ons', 'There are no downvotes for a reason. Disagree kindly.', false),
      rule('5', 'No selling or money requests', 'No promotions, links to paid services or requests for money.', false),
      rule('6', 'Nothing involving minors', 'Any content involving under-18s leads to an immediate ban and a safety report.', false),
      rule('7', 'Keep the room private', 'No screenshots of room content outside Libra.', false),
    ], { gap: 16 }),
    section('Strikes', [
      heading('Enforcement', 'How strikes and bans work', 'Strikes expire after 90 days of clean behaviour. Every decision records the rule, the post, the time and who or what made it.'),
      col({ name: 'Ladder', w: 'fill', radius: 24, fill: 'bg/surface', stroke: 'border/default', clip: true }, ladder.map(([lvl, trig, res, tone], i) =>
        row({ name: lvl, w: 'fill', gap: 24, pad: [20, 28], fill: i % 2 ? 'bg/canvas' : null }, [box({ name: 'Level', dir: 'h', w: 140 }, [pill(lvl, tone)]), text(trig, 'body', 'text/secondary', { w: 'fill' }), text(res, 'bodyStrong', 'text/primary', { w: 300 })]),
      )),
    ], { fill: 'bg/surface' }),
    section('Appeals', [
      row({ name: 'Appeals', w: 'fill', gap: 24, cross: 'start' }, [
        featureCard('refresh', 'One appeal per ban', 'Appeal within 7 days, in up to 1,000 characters, straight from the ban notice.'),
        featureCard('users', 'Reviewed by someone else', 'Never the moderator, or the bot rule, that made the original decision.'),
        featureCard('clock', 'Answered within 72 hours', 'Overturn, reduce or uphold, always with a short explanation.'),
      ]),
      col({ name: 'Mentioned', w: 'fill', gap: 12, pad: 40, radius: 28, fill: 'brand/subtle' }, [
        text('Mentioned in a post?', 'h2', 'text/primary'),
        text('If a room post describes you, you can ask us to remove it, even without a Libra account.', lead, 'text/secondary', { w: 'fill' }),
        wlink(row({ name: 'CTA', gap: 8 }, [text('Request removal', 'bodyStrong', 'brand/fg'), icon('arrow-right', 18, 'brand/fg')]), 'optout'),
      ]),
    ]),
    webFooter(),
  ]);
}