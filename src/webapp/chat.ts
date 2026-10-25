import { box, col, fill, icon, pill, row, text } from '../core/ui';
import { use } from '../components/library';
import { bubble, dateChip, healthGauge, shotThumb, toneTimeline } from '../components/chat';
import { alink, appFrame, btn, card, iconTileW, kv } from './shell';

function option(iconName: string, title: string, body: string, on = false, badge?: string): FrameNode {
  return col({ name: title, w: 'fill', gap: 10, pad: 20, radius: 16, fill: on ? 'brand/subtle' : 'bg/surface', stroke: on ? 'border/focus' : 'border/default', strokeW: on ? 2 : 1 }, [
    row({ name: 'Head', gap: 8, w: 'fill' }, [iconTileW(iconName, 'brand', 40), box({ name: 'Spacer', w: 'fill', h: 1 }), badge ? pill(badge, 'positive') : null]),
    text(title, 'bodyStrong', 'text/primary'),
    text(body, 'small', 'text/secondary', { w: 'fill' }),
  ]);
}

export function wAnalyse(): FrameNode {
  const drop = col({ name: 'Drop zone', w: 'fill', gap: 12, pad: [48, 24], radius: 24, cross: 'center', stroke: 'border/focus', strokeW: 2, dash: [8, 8], fill: 'brand/subtle' }, [
    box({ name: 'Icon', dir: 'h', w: 64, h: 64, radius: 32, fill: 'bg/surface', main: 'center', cross: 'center' }, [icon('download', 28, 'brand/fg')]),
    text('Drag screenshots or a chat export here', 'h3', 'text/primary'),
    row({ name: 'Or', gap: 6 }, [text('or', 'body', 'text/secondary'), alink(text('browse files', 'bodyStrong', 'brand/fg'), 'wSpeakers')]),
    text('PNG, JPG or HEIC up to 20 images · WhatsApp .txt, Telegram or Instagram JSON', 'caption', 'text/tertiary'),
  ]);
  const check = (title: string, body: string) => fill(use('CheckRow', { Checked: 'On' }, { title, body }));
  const step = (n: string, t: string) =>
    row({ name: 'Step ' + n, gap: 10, w: 'fill' }, [box({ name: 'N', dir: 'h', w: 24, h: 24, radius: 12, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(n, 'label', 'brand/on-subtle')]), text(t, 'small', 'text/primary', { w: 'fill' })]);
  return appFrame(
    {
      name: 'Analyse a chat',
      active: 'wAnalyse',
      title: 'Analyse a chat',
      rail: [
        alink(
          col({ name: 'Sample', w: 'fill', gap: 10, pad: 24, radius: 20, fill: 'brand/subtle' }, [
            row({ name: 'Head', gap: 8 }, [icon('sparkle', 18, 'brand/fg'), text('See a sample report', 'bodyStrong', 'brand/on-subtle')]),
            text('A fictional chat, analysed exactly like yours would be.', 'small', 'text/secondary', { w: 'fill' }),
          ]),
          'wChatReport',
        ),
        card('Export a chat', [
          row({ name: 'Apps', gap: 8 }, [use('Chip', { Selected: 'On' }, { label: 'WhatsApp' }), use('Chip', { Selected: 'Off' }, { label: 'Telegram' }), use('Chip', { Selected: 'Off' }, { label: 'Instagram' })]),
          step('1', 'Open the chat and tap their name.'),
          step('2', 'Tap Export chat, then Without media.'),
          step('3', 'Save the file and drop it here.'),
        ]),
        card('Your privacy', [kv('Uploads deleted', 'Within 24 hours'), kv('Numbers and addresses', 'Masked first'), kv('Shared to Rooms', 'Never'), kv('Free this month', '1 of 2 left', 'positive/fg')]),
      ],
    },
    [
      col({ name: 'Heading', gap: 6, w: 'fill' }, [text('How is this conversation going?', 'h1', 'text/primary'), text('Libra reports how they communicate, with the exact messages as evidence. Safety comes before scores.', 'body', 'text/secondary', { w: 'fill' })]),
      drop,
      row({ name: 'Options', w: 'fill', gap: 16, cross: 'start' }, [
        option('image', 'Screenshots', 'From WhatsApp, Instagram, iMessage, Hinge, Tinder and more.', true),
        option('file', 'Chat export', 'Full history and exact times. The most accurate option.', false, 'Best'),
        option('message', 'Paste text', 'Paste messages and label who said what.'),
      ]),
      card('Before you upload', [
        check('This is my own conversation', "I'm one of the two people in this chat."),
        check('No one in this chat is under 18', 'We stop the analysis if anyone appears to be a minor.'),
        check("I won't use the report to shame anyone", 'Chat reports are never shared to Rooms or used to label people.'),
      ]),
    ],
  );
}

export function wSpeakers(): FrameNode {
  const labelled = (str: string, who: 'them' | 'you') =>
    col({ name: 'Labelled', w: 'fill', gap: 4, cross: who === 'them' ? 'start' : 'end' }, [pill(who === 'them' ? 'Them · Dayo' : 'You', who === 'them' ? 'neutral' : 'brand'), bubble(str, who, { max: 360 })]);
  const chip = (label: string, on = false) => use('Chip', { Selected: on ? 'On' : 'Off' }, { label });
  return appFrame({ name: 'Confirm speakers', active: 'wAnalyse', title: 'Confirm speakers', crumb: 'Analyse a chat / 5 screenshots', actions: [btn('Analyse chat', 'Primary', 'Medium', 'arrow-right', 'wChatReport')] }, [
    row({ name: 'Split', w: 'fill', gap: 24, cross: 'start' }, [
      card('Your uploads', [
        row({ name: 'Grid', w: 'fill', gap: 12, wrap: true, wrapGap: 12 }, [1, 2, 3, 4, 5].map((n) => shotThumb(n, 96))),
        text('Drag to reorder so the oldest messages come first. 5 of 20 images.', 'caption', 'text/tertiary', { w: 'fill' }),
        col({ name: 'Stage', gap: 10, w: 'fill' }, [text('How long have you been talking?', 'label', 'text/secondary'), row({ name: 'Chips', gap: 8 }, [chip('Just matched'), chip('A few weeks', true), chip('Dating')])]),
        col({ name: 'Worries', gap: 10, w: 'fill' }, [text('Anything worrying you?', 'label', 'text/secondary'), row({ name: 'Chips', gap: 8, wrap: true, wrapGap: 8, w: 'fill' }, [chip('Pressures me', true), chip('Mixed signals'), chip('Asks for money'), chip('Moves too fast', true)])]),
      ], { w: 460 }),
      card('Who said what?', [
        text('We guessed from bubble side and colour in 412 messages. Check a few before we analyse.', 'small', 'text/secondary', { w: 'fill' }),
        col({ name: 'Preview', w: 'fill', gap: 12, pad: 20, radius: 16, fill: 'bg/canvas' }, [
          dateChip('Thursday 2 October'),
          labelled('Good morning beautiful, you slept well?', 'them'),
          labelled('Morning! Yes thanks, you?', 'you'),
          labelled('Send me your WhatsApp now, this app is slow', 'them'),
        ]),
        row({ name: 'Controls', gap: 12, w: 'fill' }, [btn('Swap Them and You', 'Secondary', 'Medium', 'refresh'), fill(use('TextField', { State: 'Filled' }, { label: 'Their nickname (optional)', value: 'Dayo' }, { hide: ['label'] }))]),
      ]),
    ]),
  ]);
}

export function wChatReport(): FrameNode {
  const days: Array<'warm' | 'neutral' | 'hostile' | 'none'> = ['warm', 'warm', 'warm', 'warm', 'warm', 'none', 'none', 'none', 'warm', 'neutral', 'neutral', 'hostile', 'neutral', 'hostile', 'none', 'hostile', 'neutral', 'hostile'];
  const pattern = (side: string, title: string, meta: string, severity: string, q1: string, t1: string, q2: string, t2: string) =>
    fill(use('PatternCard', { Side: side }, { title, meta, severity, quote1: q1, time1: t1, quote2: q2, time2: t2 }));
  const next = (iconName: string, title: string, body: string) =>
    row({ name: title, w: 'fill', gap: 12, cross: 'start' }, [iconTileW(iconName, 'brand', 36), col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'smallStrong', 'text/primary'), text(body, 'small', 'text/secondary', { w: 'fill' })])]);
  return appFrame(
    {
      name: 'Conversation report',
      active: 'wAnalyse',
      title: 'Conversation report',
      crumb: 'Analyse a chat / Dayo',
      tall: true,
      actions: [btn('Delete data', 'Tertiary', 'Medium', 'trash'), btn('Link to a Libra', 'Secondary', 'Medium', 'link', 'wCompare'), btn('Save', 'Primary', 'Medium', 'bookmark')],
      rail: [
        card('Tone over time', [toneTimeline(days, ['2 Oct', '21 Oct'], 312)]),
        card('Evidence', [
          col({ name: 'Thread', w: 'fill', gap: 10 }, [
            dateChip('Thursday 2 October'),
            bubble('That was fun talking today', 'you', { time: '21:10', max: 240 }),
            bubble('Send me your WhatsApp now, this app is slow', 'them', { flag: 'caution', tag: 'Pressure', time: '21:14', max: 240 }),
            bubble('I prefer to chat here for now', 'you', { time: '21:16', max: 240 }),
            bubble('Wow ok. You are not serious then', 'them', { flag: 'caution', tag: 'Guilt after refusal', time: '21:17', max: 240 }),
          ]),
        ], { action: 'Open full chat' }),
        card('What you could do next', [next('message', 'Set a boundary', '"I\'m not comfortable moving off the app yet."'), next('map-pin', 'Meet safely, if you meet', 'Somewhere public, your own transport, Share my date on.'), next('ban', 'Block and report', 'How to on WhatsApp, Instagram and dating apps.')]),
      ],
      railW: 380,
    },
    [
      row({ name: 'Head', w: 'fill', gap: 16 }, [
        iconTileW('message', 'brand', 56),
        col({ name: 'Text', gap: 4, w: 'fill' }, [text('Dayo', 'h1', 'text/primary'), text('WhatsApp · 412 messages · 2 Oct to 21 Oct · uploads deleted', 'small', 'text/secondary')]),
      ]),
      row({ name: 'Limits', w: 'fill', gap: 10, pad: 14, radius: 14, fill: 'warning/subtle', cross: 'start' }, [icon('info', 18, 'warning/fg'), text('Based only on the messages you provided. Screenshots can be cropped, edited or miss context. Use your own judgement.', 'small', 'text/primary', { w: 'fill' })]),
      row({ name: 'Scores', w: 'fill', gap: 20, cross: 'start' }, [
        col({ name: 'Chat signals', w: 'fill', gap: 12, pad: [24, 0], radius: 24, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
          row({ name: 'Label', gap: 8 }, [text('Chat signals', 'overline', 'brand/fg'), pill('Provided by you', 'neutral', 'user')]),
          text('Concerning patterns', 'h2', 'text/primary'),
          use('ScaleDial', { Tilt: 'Caution' }, { 'caution-score': '7', 'positive-score': '3' }),
          use('ConfidenceBadge', { Level: 'Medium' }),
        ]),
        card('Conversation health', [healthGauge(38, 'Strained', 'warning', 180), kv('Dayo starts', '71%'), kv('Your reply time', '12 min'), kv('Longest silence', '3 days')], { w: 280 }),
      ]),
      text('Patterns we found', 'h3', 'text/primary'),
      row({ name: 'Patterns', w: 'fill', gap: 16, cross: 'start' }, [
        pattern('Caution', 'Pressure and rushing', '5 times · 2 Oct to 19 Oct', 'High', '"Send me your WhatsApp now, this app is slow"', 'Them · Thu 2 Oct, 21:14', '"Why are you acting shy? Just come to mine tonight"', 'Them · Sun 19 Oct, 23:40'),
        pattern('Caution', 'Love-bombing, then silence', '4 times in the first week', 'Medium', '"I have never felt this way about anyone"', 'Them · Sat 4 Oct, 00:12', '"When we marry you will cook for me abi"', 'Them · Mon 6 Oct, 22:05'),
      ]),
      row({ name: 'Patterns 2', w: 'fill', gap: 16, cross: 'start' }, [
        pattern('Positive', 'Emotional openness', '3 times · early October', 'Some', '"Honestly I get nervous meeting new people too"', 'Them · Fri 3 Oct, 20:41', '"How did your interview go? I was thinking about it"', 'Them · Tue 7 Oct, 18:15'),
        col({ name: 'Spacer', w: 'fill' }, []),
      ]),
    ],
  );
}
