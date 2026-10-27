import { avatar, box, col, fill, icon, pill, row, text } from '../core/ui';
import { bubble, dateChip, healthGauge, shotThumb, toneTimeline } from '../components/chat';
import { btn, center, chip, group, groupTitle, heroIcon, iconTile, link, note, screen, surface, textArea, use, withSheet } from './kit';
import { home } from './home';

// ---------------------------------------------------------------- shared

function optionRow(iconName: string, title: string, body: string, target?: string, badge?: string): SceneNode {
  const r = row({ name: title, w: 'fill', gap: 14, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default', cross: 'start' }, [
    iconTile(iconName, 'brand', 44),
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      row({ name: 'Head', gap: 8 }, [text(title, 'bodyStrong', 'text/primary'), badge ? pill(badge, 'positive') : null]),
      text(body, 'small', 'text/secondary', { w: 'fill' }),
    ]),
    icon('chevron-right', 20, 'text/tertiary'),
  ]);
  return target ? link(r, target) : r;
}

function honestLimits(): FrameNode {
  return note('info', 'Based only on the messages you provided. Screenshots can be cropped, edited or miss context. Use your own judgement.', 'warning');
}

function chatHeader(name: string, meta: string, sample = false): FrameNode {
  return row({ name: 'Chat header', w: 'fill', gap: 14 }, [
    box({ name: 'Chat icon', dir: 'h', w: 52, h: 52, radius: 16, fill: 'brand/subtle', main: 'center', cross: 'center' }, [icon('message', 26, 'brand/fg')]),
    col({ name: 'Text', gap: 2, w: 'fill' }, [
      row({ name: 'Name', gap: 8 }, [text(name, 'h3', 'text/primary'), sample ? pill('Sample', 'brand') : null]),
      text(meta, 'small', 'text/secondary', { w: 'fill' }),
    ]),
  ]);
}

function chatScaleCard(caution: string, positive: string, tilt: string, level: string, verdict: string): FrameNode {
  return col({ name: 'Chat signals', w: 'fill', pad: [18, 0, 18, 0], gap: 12, radius: 24, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
    row({ name: 'Label', gap: 8 }, [text('Chat signals', 'overline', 'brand/fg'), pill('Provided by you', 'neutral', 'user')]),
    col({ name: 'Verdict', w: 'fill', pad: [0, 20] }, [center(verdict, 'h2')]),
    use('GutMeter', { Tilt: tilt }, { 'caution-score': caution, 'positive-score': positive }),
    use('ConfidenceBadge', { Level: level }),
  ]);
}

// ---------------------------------------------------------------- entry and setup

export function createSheet(): FrameNode {
  const base = home();
  return withSheet(
    base,
    'Start something',
    [
      optionRow('search', 'Run a Gutchek', "Check someone's public posts with a name and one handle.", 'search'),
      optionRow('message', 'Check a Chat', 'Upload screenshots or a chat export to see how they communicate.', 'analyse', '1 free'),
      center('You have 4 reports and 1 free chat check left this month.', 'caption', 'text/tertiary'),
    ],
    'Home · Start something',
  );
}

export function analyse(): FrameNode {
  return screen(
    {
      name: 'Check a Chat',
      nav: { title: 'Check a Chat', action: 'help', backTo: 'home', actionTo: 'exportGuide' },
      gap: 14,
    },
    [
      text('How is this conversation going?', 'h2', 'text/primary', { w: 'fill' }),
      text('Upload a chat with someone you are talking to. Gutchek reports how they communicate, with the exact messages as evidence.', 'small', 'text/secondary', { w: 'fill' }),
      optionRow('image', 'Screenshots', 'Up to 20 images from WhatsApp, Instagram, iMessage, Hinge, Tinder and more.', 'chatConsent'),
      optionRow('file', 'Chat export', 'WhatsApp, Telegram or Instagram export. The most accurate option.', 'chatConsent', 'Best'),
      optionRow('message', 'Paste text', 'Paste messages and label who said what.', 'pasteText'),
      link(
        row({ name: 'Sample', w: 'fill', gap: 12, pad: 16, radius: 16, fill: 'brand/subtle', cross: 'center' }, [
          icon('sparkle', 22, 'brand/fg'),
          col({ name: 'Text', gap: 2, w: 'fill' }, [text('See a sample report', 'bodyStrong', 'brand/on-subtle'), text('A fictional chat, analysed exactly like yours would be.', 'small', 'text/secondary', { w: 'fill' })]),
          icon('chevron-right', 20, 'brand/fg'),
        ]),
        'sampleReport',
      ),
      row({ name: 'Quota', gap: 8, w: 'fill' }, [icon('info', 16, 'text/tertiary'), text('Free plan: 1 chat check a month. After that, each check counts as one report.', 'caption', 'text/tertiary', { w: 'fill' })]),
    ],
  );
}

export function chatConsent(): FrameNode {
  const check = (title: string, body: string) => fill(use('CheckRow', { Checked: 'On' }, { title, body }));
  return screen(
    {
      name: 'Chat consent',
      nav: { title: '', action: null, backTo: 'analyse' },
      gap: 12,
      footer: [link(btn('Agree and continue'), 'chatUpload'), center("You're uploading another person's messages. They are personal data.", 'caption', 'text/tertiary')],
    },
    [
      text('Before you upload', 'h1', 'text/primary', { w: 'fill' }),
      text('Use chat check only for your own safety and dating decisions.', 'body', 'text/secondary', { w: 'fill' }),
      check('This is my own conversation', "I'm one of the two people in this chat."),
      check('No one in this chat is under 18', 'We stop the analysis if anyone appears to be a minor.'),
      check("I won't use the report to shame anyone", 'Chat reports are never shared to Rooms or used to label people.'),
      note('lock', 'Uploads are deleted within 24 hours. Phone numbers, emails, addresses and bank details are masked before analysis.', 'brand'),
    ],
  );
}

export function exportGuide(): FrameNode {
  const step = (n: string, t: string) =>
    row({ name: 'Step ' + n, w: 'fill', gap: 12 }, [
      box({ name: 'Number', dir: 'h', w: 28, h: 28, radius: 14, fill: 'brand/subtle', main: 'center', cross: 'center' }, [text(n, 'smallStrong', 'brand/on-subtle')]),
      text(t, 'body', 'text/primary', { w: 'fill' }),
    ]);
  return withSheet(
    analyse(),
    'Export a chat',
    [
      row({ name: 'Apps', gap: 8 }, [chip('WhatsApp', true), chip('Telegram'), chip('Instagram')]),
      step('1', 'Open the chat and tap their name at the top.'),
      step('2', 'Scroll down and tap Export chat.'),
      step('3', 'Choose Without media.'),
      step('4', 'Share the file to Gutchek.'),
      note('info', 'Exports give the full history with exact times and no reading errors.', 'neutral'),
      btn('Got it'),
    ],
    'Check a Chat · Export guide',
  );
}

export function chatUpload(): FrameNode {
  const thumbs = [1, 2, 3, 4, 5].map((n) => shotThumb(n, 104));
  const add = box({ name: 'Add', dir: 'v', w: 104, h: 166, radius: 14, stroke: 'border/strong', dash: [6, 6], main: 'center', cross: 'center', gap: 6 }, [icon('plus', 24, 'brand/fg'), text('Add', 'smallStrong', 'brand/fg')]);
  return screen(
    {
      name: 'Upload and arrange',
      nav: { title: 'Screenshots', action: null, backTo: 'chatConsent' },
      gap: 16,
      footer: [link(btn('Continue'), 'speakers'), center('5 of 20 images · deleted within 24 hours', 'caption', 'text/tertiary')],
      footerDivider: true,
    },
    [
      row({ name: 'Grid', w: 'fill', gap: 10, wrap: true, wrapGap: 10 }, thumbs.concat([add])),
      text('Drag to reorder so the oldest messages come first. Tap an image to crop or remove it.', 'caption', 'text/tertiary', { w: 'fill' }),
      col({ name: 'Stage', gap: 10, w: 'fill' }, [text('How long have you been talking?', 'label', 'text/secondary'), row({ name: 'Chips', gap: 8 }, [chip('Just matched'), chip('A few weeks', true), chip('Dating')])]),
      col({ name: 'Worries', gap: 10, w: 'fill' }, [
        text('Anything worrying you? (optional)', 'label', 'text/secondary'),
        row({ name: 'Chips', gap: 8, w: 'fill', wrap: true, wrapGap: 8 }, [chip('Pressures me', true), chip('Mixed signals'), chip('Asks for money'), chip('Moves too fast', true), chip('Something else')]),
      ]),
    ],
  );
}

export function pasteText(): FrameNode {
  return screen(
    {
      name: 'Paste text',
      nav: { title: 'Paste text', action: null, backTo: 'analyse' },
      gap: 14,
      footer: [link(btn('Continue'), 'speakers')],
    },
    [
      text('Paste the conversation', 'h2', 'text/primary', { w: 'fill' }),
      text('Start each line with Them: or You:. We will check the labels with you next.', 'small', 'text/secondary', { w: 'fill' }),
      textArea('Conversation', 'Them: Good morning beautiful\nYou: Morning! How was the match?\nThem: Forget the match, when are you coming to mine?\nYou: Maybe somewhere public first?\nThem: Why are you acting shy', false, 260),
      note('lock', 'Pasted text is deleted after analysis unless you save the report.', 'neutral'),
    ],
  );
}

export function speakers(): FrameNode {
  const labelled = (str: string, who: 'them' | 'you') =>
    col({ name: 'Labelled', w: 'fill', gap: 4, cross: who === 'them' ? 'start' : 'end' }, [pill(who === 'them' ? 'Them' : 'You', who === 'them' ? 'neutral' : 'brand'), bubble(str, who)]);
  return screen(
    {
      name: 'Confirm speakers',
      nav: { title: 'Confirm speakers', action: null, backTo: 'chatUpload' },
      gap: 14,
      footer: [link(btn('Looks right'), 'chatProcessing'), btn('Swap sides', 'Secondary', 'Large', 'refresh')],
    },
    [
      text('Who said what?', 'h2', 'text/primary', { w: 'fill' }),
      text('We guessed from bubble side and colour in 412 messages. Check a few before we analyse.', 'small', 'text/secondary', { w: 'fill' }),
      col({ name: 'Sample', w: 'fill', gap: 12, pad: 16, radius: 20, fill: 'bg/surface', stroke: 'border/default' }, [
        labelled('Good morning beautiful, you slept well?', 'them'),
        labelled('Morning! Yes thanks, you?', 'you'),
        labelled('Send me your WhatsApp now, this app is slow', 'them'),
      ]),
      fill(use('TextField', { State: 'Filled' }, { label: 'Their nickname (optional)', value: 'Dayo' })),
    ],
  );
}

export function chatProcessing(): FrameNode {
  const step = (state: string, label: string, detail: string) => fill(use('ProgressStep', { State: state }, { label, detail }));
  const stack = col({ name: 'Art', w: 'fill', gap: 8, pad: [16, 32], radius: 24, fill: 'brand/subtle' }, [
    bubble('Good morning beautiful', 'them', { max: 200 }),
    bubble('Morning!', 'you'),
    bubble('Send me your number now', 'them', { flag: 'caution', tag: 'Checking...' }),
  ]);
  return screen(
    {
      name: 'Chat processing',
      nav: { title: '', action: 'x', back: false },
      cross: 'center',
      gap: 18,
      footer: [link(btn('Continue in background', 'Secondary'), 'safetyCard')],
    },
    [
      stack,
      col({ name: 'Heading', gap: 6, w: 'fill' }, [center('Reading the conversation', 'h2'), center('About a minute for 400 messages.', 'small', 'text/secondary')]),
      col({ name: 'Steps', gap: 14, w: 'fill', pad: [4, 4] }, [
        step('Done', 'Reading messages', '412 messages from 5 screenshots'),
        step('Done', 'Redacting personal details', '6 phone numbers and addresses masked'),
        step('Active', 'Finding patterns', 'Checking tone on both sides first'),
        step('Pending', 'Building your report', 'Scores, timeline and next steps'),
      ]),
    ],
  );
}

export function safetyCard(): FrameNode {
  const step = (iconName: string, title: string, body: string) =>
    row({ name: title, w: 'fill', gap: 12, pad: [12, 16], cross: 'start' }, [
      icon(iconName, 20, 'caution/fg'),
      col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary'), text(body, 'small', 'text/secondary', { w: 'fill' })]),
    ]);
  return screen(
    {
      name: 'Safety card',
      nav: { title: '', action: 'x', back: false },
      gap: 14,
      footer: [btn('Get help now', 'Destructive', 'Large', 'phone'), link(btn('Continue to report', 'Secondary'), 'chatReport')],
    },
    [
      heroIcon('shield', 'caution', 72),
      text('Your safety comes first', 'h1', 'text/primary', { w: 'fill' }),
      text("Some messages threaten to share private images unless you pay. That's serious, and it's not your fault.", 'body', 'text/secondary', { w: 'fill' }),
      group(
        [
          step('download', 'Save the evidence', 'Keep the chat and screenshots. Gutchek kept a redacted copy for you.'),
          step('ban', "Don't pay or send anything more", 'Paying rarely stops threats.'),
          step('flag', 'Block and report on the app', 'Report the account to the platform, then block it.'),
          step('users', 'Tell someone you trust', 'You do not have to handle this alone.'),
        ],
        'Steps',
        48,
      ),
    ],
  );
}

// ---------------------------------------------------------------- report

function patternCard(side: 'Caution' | 'Positive', title: string, meta: string, severity: string, q1: string, t1: string, q2: string, t2: string, target?: string): SceneNode {
  const c = fill(use('PatternCard', { Side: side }, { title, meta, severity, quote1: q1, time1: t1, quote2: q2, time2: t2 }));
  if (target) {
    const ctx = (c as FrameNode).findOne((n) => n.name === 'Footer');
    if (ctx) link(ctx, target);
  }
  return c;
}

function nextStep(iconName: string, title: string, body: string): FrameNode {
  return row({ name: title, w: 'fill', gap: 12, pad: [12, 16], cross: 'start' }, [
    iconTile(iconName, 'brand', 36),
    col({ name: 'Text', gap: 2, w: 'fill' }, [text(title, 'bodyStrong', 'text/primary', { w: 'fill' }), text(body, 'small', 'text/secondary', { w: 'fill' })]),
  ]);
}

function report(sample: boolean): FrameNode {
  const days: Array<'warm' | 'neutral' | 'hostile' | 'none'> = ['warm', 'warm', 'warm', 'warm', 'warm', 'none', 'none', 'none', 'warm', 'neutral', 'neutral', 'hostile', 'neutral', 'hostile', 'none', 'hostile', 'neutral', 'hostile'];
  return screen(
    {
      name: sample ? 'Sample report' : 'Conversation report',
      nav: { title: sample ? 'Sample report' : 'Conversation report', action: 'share', backTo: sample ? 'analyse' : 'home' },
      tall: true,
      gap: 18,
      footer: sample
        ? [link(btn('Check my own chat', 'Primary', 'Large', 'message'), 'chatConsent')]
        : [row({ name: 'Actions', gap: 12, w: 'fill' }, [btn('Keep this', 'Secondary', 'Large', 'bookmark'), link(btn('Link to a Gutchek', 'Primary', 'Large', 'link'), 'combinedView')])],
      footerDivider: true,
    },
    [
      chatHeader('Dayo', 'WhatsApp · 412 messages · 2 Oct to 21 Oct', sample),
      honestLimits(),
      chatScaleCard('7', '3', 'Caution', 'Medium', 'Concerning patterns'),
      surface([
        text('Conversation health', 'title', 'text/primary'),
        row({ name: 'Health', w: 'fill', gap: 16 }, [
          healthGauge(38, 'Strained', 'warning', 150),
          col({ name: 'Facts', gap: 10, w: 'fill' }, [
            row({ name: 'Initiates', gap: 8, w: 'fill' }, [text('Dayo starts', 'small', 'text/secondary', { w: 'fill' }), text('71%', 'smallStrong', 'text/primary')]),
            row({ name: 'Reply', gap: 8, w: 'fill' }, [text('Your reply time', 'small', 'text/secondary', { w: 'fill' }), text('12 min', 'smallStrong', 'text/primary')]),
            row({ name: 'Gaps', gap: 8, w: 'fill' }, [text('Longest silence', 'small', 'text/secondary', { w: 'fill' }), text('3 days', 'smallStrong', 'text/primary')]),
          ]),
        ]),
      ]),
      col({ name: 'Patterns', gap: 12, w: 'fill' }, [
        text('Patterns we found', 'h3', 'text/primary'),
        patternCard('Caution', 'Pressure and rushing', '5 times · 2 Oct to 19 Oct', 'High', '"Send me your WhatsApp now, this app is slow"', 'Them · Thu 2 Oct, 21:14', '"Why are you acting shy? Just come to mine tonight"', 'Them · Sun 19 Oct, 23:40', 'patternDetail'),
        patternCard('Caution', 'Love-bombing, then silence', '4 times in the first week', 'Medium', '"I have never felt this way about anyone"', 'Them · Sat 4 Oct, 00:12', '"When we marry you will cook for me abi"', 'Them · Mon 6 Oct, 22:05'),
        patternCard('Positive', 'Emotional openness', '3 times · early October', 'Some', '"Honestly I get nervous meeting new people too"', 'Them · Fri 3 Oct, 20:41', '"How did your interview go? I was thinking about it"', 'Them · Tue 7 Oct, 18:15'),
      ]),
      surface([text('Tone over time', 'title', 'text/primary'), toneTimeline(days, ['2 Oct', '21 Oct'])]),
      col({ name: 'Next steps', gap: 10, w: 'fill' }, [
        text('What you could do next', 'h3', 'text/primary'),
        group(
          [
            nextStep('message', 'Set a boundary', 'Try: "I\'m not comfortable moving off the app yet. Let\'s keep chatting here."'),
            nextStep('map-pin', 'Meet safely, if you meet', 'Somewhere public, your own transport, and Share my date on.'),
            nextStep('ban', 'Block and report', 'How to block and report on WhatsApp, Instagram and dating apps.'),
          ],
          'Next steps',
          64,
        ),
      ]),
      center('Uploads deleted 21 Oct, 22:40. This report keeps redacted excerpts only.', 'caption', 'text/tertiary'),
    ],
  );
}

export const chatReport = () => report(false);
export const sampleReport = () => report(true);

export function patternDetail(): FrameNode {
  return screen(
    {
      name: 'Pattern in context',
      nav: { title: 'Pressure and rushing', action: null, backTo: 'chatReport' },
      tall: true,
      gap: 14,
      footer: [row({ name: 'Actions', gap: 12, w: 'fill' }, [btn("Doesn't apply", 'Secondary', 'Large', 'eye-off'), btn('Add a note', 'Secondary', 'Large', 'pencil')])],
      footerDivider: true,
    },
    [
      surface([
        row({ name: 'Head', gap: 8 }, [use('ScoreBadge', { Side: 'Caution' }, { label: 'High · 5 times' })]),
        text('Pushing to meet, move off the app or get closer faster than you want, especially after you hesitate.', 'small', 'text/secondary', { w: 'fill' }),
      ]),
      text('Show 6 earlier messages', 'smallStrong', 'brand/fg'),
      col({ name: 'Thread', w: 'fill', gap: 10 }, [
        dateChip('Thursday 2 October'),
        bubble('That was fun talking today', 'you', { time: '21:10' }),
        bubble('Send me your WhatsApp now, this app is slow', 'them', { flag: 'caution', tag: 'Pressure', time: '21:14' }),
        bubble('I prefer to chat here for now', 'you', { time: '21:16' }),
        bubble('Wow ok. You are not serious then', 'them', { flag: 'caution', tag: 'Guilt after refusal', time: '21:17' }),
        dateChip('Sunday 19 October'),
        bubble('Why are you acting shy? Just come to mine tonight', 'them', { flag: 'caution', tag: 'Pressure', time: '23:40' }),
        bubble('Maybe somewhere public first?', 'you', { time: '23:52' }),
      ]),
      text('Show 4 later messages', 'smallStrong', 'brand/fg'),
    ],
  );
}

export function chatLimited(): FrameNode {
  return screen(
    {
      name: 'Chat · limited data',
      nav: { title: 'Screenshots', action: null, backTo: 'chatUpload' },
      gap: 16,
      footer: [link(btn('Replace 2 images'), 'chatUpload'), link(btn('Continue with a limited report', 'Secondary'), 'chatReport')],
    },
    [
      text('Some screenshots were hard to read', 'h2', 'text/primary', { w: 'fill' }),
      text('We read 3 of 5 images clearly. With only 24 readable messages, this will be a limited-data report with lower confidence.', 'body', 'text/secondary', { w: 'fill' }),
      row({ name: 'Grid', w: 'fill', gap: 10, wrap: true, wrapGap: 10 }, [shotThumb(1), shotThumb(2, 104, true), shotThumb(3), shotThumb(4, 104, true), shotThumb(5)]),
      note('alert-triangle', 'Images 2 and 4 are blurry or cropped. A clearer screenshot or a chat export gives a better result.', 'warning'),
    ],
  );
}

export function chatBlocked(): FrameNode {
  return screen(
    {
      name: 'Chat · not analysed',
      nav: { title: 'Check a Chat', action: 'x', back: false },
      cross: 'center',
      gap: 18,
      pad: [48, 20, 24, 20],
      footer: [link(btn('Back to Home', 'Secondary'), 'home'), link(btn('Get support', 'Tertiary'), 'resources')],
    },
    [
      heroIcon('ban', 'neutral', 96),
      col({ name: 'Copy', gap: 8, w: 'fill' }, [
        center("We can't analyse this chat", 'h2'),
        center('This chat may involve someone under 18, or includes content we never process. Nothing was saved, and your free chat check was not used.', 'body', 'text/secondary'),
      ]),
      note('life-buoy', 'If a child may be at risk, contact local authorities or a child protection service.', 'brand'),
    ],
  );
}

export function combinedView(): FrameNode {
  const side = (title: string, sub: string, c: string, p: string, level: string, iconName: string) =>
    col({ name: title, w: 'fill', gap: 10, pad: 16, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
      row({ name: 'Head', gap: 6 }, [icon(iconName, 16, 'brand/fg'), text(title, 'smallStrong', 'text/primary')]),
      text(sub, 'caption', 'text/tertiary', { w: 'fill' }),
      col({ name: 'Scores', gap: 6 }, [use('ScoreBadge', { Side: 'Caution' }, { label: 'Caution ' + c }), use('ScoreBadge', { Side: 'Positive' }, { label: 'Positive ' + p })]),
      use('ConfidenceBadge', { Level: level }),
    ]);
  const item = (tone: 'caution' | 'positive', t: string, src: string) =>
    row({ name: t, w: 'fill', gap: 10, pad: [12, 16] }, [
      icon(tone === 'caution' ? 'alert-triangle' : 'check-circle', 18, tone === 'caution' ? 'caution/fg' : 'positive/fg'),
      text(t, 'small', 'text/primary', { w: 'fill' }),
      pill(src, 'neutral'),
    ]);
  return screen(
    {
      name: 'Combined view',
      nav: { title: 'Seun Bakare', action: 'more', backTo: 'chatReport' },
      gap: 14,
    },
    [
      row({ name: 'Person', gap: 12, w: 'fill' }, [avatar('SB', 48, 'positive'), col({ name: 'Text', gap: 2, w: 'fill' }, [text('Seun Bakare', 'h3', 'text/primary'), text('Public report and 1 linked chat', 'small', 'text/secondary')])]),
      row({ name: 'Side by side', w: 'fill', gap: 12, cross: 'start' }, [side('Public signals', 'From public posts', '4', '6', 'Medium', 'globe'), side('Chat signals', 'Provided by you', '7', '3', 'Medium', 'message')]),
      note('info', 'Chat evidence is shown next to the public report. It never raises or lowers the public scores on its own.', 'neutral'),
      groupTitle('Top signals'),
      group([item('caution', 'Pressure and rushing', 'Chat'), item('caution', 'Hostile replies in threads', 'Public'), item('positive', 'Emotional openness', 'Chat'), item('positive', 'Community involvement', 'Public')], 'Signals', 44),
    ],
  );
}