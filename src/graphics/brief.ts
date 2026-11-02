import { BUNDLES, FORMATS, Format, byId } from './formats';

/**
 * Reads a plain-language brief. Lines before the first format heading set campaign defaults; each format heading
 * (for example "Instagram story" or "## Google display") starts a block of "Key: value" lines. Numbered or bulleted
 * lines inside a slide format (carousel, store screenshots) become one graphic each:
 *   1. Know the person behind the DMs | phone: Home | theme: light
 */

export type Theme = 'brand' | 'light' | 'dark';

export interface Fields {
  headline?: string;
  body?: string;
  cta?: string;
  visual?: string;
  theme?: Theme;
  eyebrow?: string;
  link?: string;
}

export interface Item extends Fields {
  format: Format;
  label: string;
}

export interface Brief {
  campaign: string;
  defaults: Fields;
  items: Item[];
  notes: string[];
}

const KEYS: Record<string, keyof Fields | 'campaign'> = {
  campaign: 'campaign',
  name: 'campaign',
  project: 'campaign',
  headline: 'headline',
  title: 'headline',
  tagline: 'headline',
  body: 'body',
  text: 'body',
  copy: 'body',
  subline: 'body',
  subheadline: 'body',
  description: 'body',
  cta: 'cta',
  button: 'cta',
  'call to action': 'cta',
  visual: 'visual',
  image: 'visual',
  art: 'visual',
  picture: 'visual',
  screen: 'visual',
  theme: 'theme',
  style: 'theme',
  background: 'theme',
  eyebrow: 'eyebrow',
  tag: 'eyebrow',
  label: 'eyebrow',
  kicker: 'eyebrow',
  link: 'link',
  url: 'link',
  website: 'link',
};

const clean = (s: string) =>
  s
    .replace(/\u00a0/g, ' ')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function toTheme(v: string): Theme | undefined {
  const s = v.toLowerCase();
  if (/dark|night|black/.test(s)) return 'dark';
  if (/light|white|plain/.test(s)) return 'light';
  if (/brand|indigo|purple|gradient|colour|color/.test(s)) return 'brand';
  return undefined;
}

function matchHeading(line: string): string[] | null {
  const s = line
    .replace(/^#+\s*/, '')
    .replace(/[:.]\s*$/, '')
    .toLowerCase()
    .replace(/\s*\(.*\)\s*$/, '')
    .replace(/[×*]/g, 'x')
    .replace(/\s+x\s+/g, 'x')
    .trim();
  if (!s || s.length > 60) return null;
  for (const [names, ids] of BUNDLES) if (names.some((n) => s === n || s.indexOf(n) === 0)) return ids;
  const exact = FORMATS.filter((f) => f.aliases.some((a) => s === a));
  if (exact.length) return [exact[0].id];
  const loose = FORMATS.filter((f) => f.aliases.some((a) => s.indexOf(a) === 0 && s.length - a.length < 14));
  return loose.length ? [loose[0].id] : null;
}

function setField(target: Fields, key: keyof Fields, value: string) {
  if (key === 'theme') {
    const t = toTheme(value);
    if (t) target.theme = t;
  } else target[key] = value;
}

function parseKeyValue(line: string): [keyof Fields | 'campaign', string] | null {
  const m = line.match(/^([A-Za-z][A-Za-z ]{1,24})\s*[:\u2013\u2014-]\s+(.+)$/) || line.match(/^([A-Za-z][A-Za-z ]{1,24}):\s*(.+)$/);
  if (!m) return null;
  const k = KEYS[m[1].trim().toLowerCase()];
  return k ? [k, m[2].trim()] : null;
}

/** "Caption | phone: Home | theme: light" or "Caption: smaller body". */
function parseSlide(text: string): Fields {
  const parts = text.split('|').map((p) => p.trim()).filter(Boolean);
  const out: Fields = {};
  const first = parts.shift() || '';
  const kv = parseKeyValue(first);
  if (kv && kv[0] !== 'campaign') setField(out, kv[0], kv[1]);
  else {
    const split = first.split(/\s+[\u2013\u2014]\s+|:\s+/);
    out.headline = split[0];
    if (split[1]) out.body = split.slice(1).join(': ');
  }
  for (const p of parts) {
    const pkv = parseKeyValue(p);
    if (pkv && pkv[0] !== 'campaign') setField(out, pkv[0], pkv[1]);
    else if (/^(phone|phones|screen|meter|chat|notes|rooms|gauge|logo|quote|icon|poll|ask|none)\b/i.test(p)) out.visual = p;
    else if (toTheme(p)) out.theme = toTheme(p);
    else out.body = out.body ? out.body + ' ' + p : p;
  }
  return out;
}

export function parseBrief(source: string): Brief {
  const lines = source
    .split(/\r?\n/)
    .map(clean)
    .filter((l) => l && !/^-{3,}$/.test(l));
  const brief: Brief = { campaign: 'Gutchek campaign', defaults: {}, items: [], notes: [] };
  let block: { ids: string[]; fields: Fields; slides: Fields[]; label: string; tag: string } | null = null;

  const close = () => {
    if (!block) return;
    for (const id of block.ids) {
      const format = byId(id);
      const base = format.name + (block.tag ? ' \u00b7 ' + block.tag : '');
      if (format.slides && block.slides.length) {
        block.slides.forEach((s, i) => brief.items.push(Object.assign({}, block!.fields, s, { format, label: base + (block!.slides.length > 1 ? ' \u00b7 ' + (i + 1) + '/' + block!.slides.length : '') })));
      } else {
        brief.items.push(Object.assign({}, block.fields, { format, label: base }));
        if (block.slides.length && !format.slides) brief.notes.push('Numbered lines under "' + block.label + '" were ignored: only carousels and store screenshots use them.');
      }
    }
    block = null;
  };

  for (const line of lines) {
    const heading = /^#+\s/.test(line) || !parseKeyValue(line) ? matchHeading(line) : null;
    if (heading) {
      close();
      block = { ids: heading, fields: {}, slides: [], label: line.replace(/^#+\s*/, ''), tag: ((line.match(/\(([^)]+)\)\s*:?\s*$/) || [])[1] || '').trim() };
      continue;
    }
    const list = line.match(/^(?:\d+[.)]|[-*\u2022])\s+(.+)$/);
    if (list && block) {
      block.slides.push(parseSlide(list[1]));
      continue;
    }
    const kv = parseKeyValue(line);
    if (kv) {
      if (kv[0] === 'campaign') brief.campaign = kv[1];
      else setField(block ? block.fields : brief.defaults, kv[0], kv[1]);
      continue;
    }
    if (/^#+\s/.test(line)) {
      if (!block && brief.items.length === 0 && brief.campaign === 'Gutchek campaign') brief.campaign = line.replace(/^#+\s*/, '');
      else brief.notes.push('Unknown format "' + line.replace(/^#+\s*/, '') + '" was skipped.');
      continue;
    }
    if (block && !block.fields.body) block.fields.body = line;
    else if (!block && !brief.defaults.body && brief.items.length === 0 && line.length > 30) brief.defaults.body = line;
  }
  close();

  if (!brief.items.length) {
    brief.notes.push('No formats were named, so the full set was generated.');
    for (const f of FORMATS) brief.items.push({ format: f, label: f.name });
  }
  return brief;
}

export const SAMPLE_BRIEF = `# Waitlist launch
Tagline: Trust your gut. Then check it.
Body: A fair, evidence-backed second opinion on someone you're getting to know, before you meet.
CTA: Join the waitlist
Link: gutchek.app/waitlist
Theme: brand

## Instagram post
Headline: Know the person behind the DMs
Visual: meter

## Instagram carousel
1. Trust your gut. Then check it. | logo
2. Run a Gutchek: a fair read of their public posts, with proof for every flag | meter | theme: light
3. Check a Chat: see pressure, love-bombing or respect in the exact messages | chat | theme: light
4. Notes: how each chat really made you feel, in one private timeline | notes | theme: light
5. Join the waitlist at gutchek.app | logo

## Instagram story
Headline: Coming soon to Lagos and Abuja
Visual: phone: Home

## WhatsApp status
Headline: Something feel off? Check the chat.
Visual: chat

## X post
Headline: A second opinion before the first date
Visual: phones: Home, Report overview

## Website share image
Headline: Trust your gut. Then check it.
Visual: meter

## Email header
Headline: You're on the list
Theme: light
Visual: logo

## App Store screenshots
1. Know the person behind the DMs | phone: Home
2. A fair read, with the receipts | phone: Report overview | theme: light
3. Something feel off? Check the chat | phone: Conversation report
4. Your gut, written down | phone: Notes | theme: light
5. Talk it through in Gist Rooms | phone: Room feed

## Google Play feature graphic
Headline: Trust your gut. Then check it.
Visual: meter

## Meta ads
Headline: Before the first date, check the vibe
Visual: chat

## Google display
Headline: Trust your gut. Then check it.
Visual: meter
`;
