import { Tone } from '../core/ui';

export interface Person {
  first: string;
  name: string;
  initials: string;
  handle: string;
  platform: string;
  tone: Tone;
  caution: number;
  positive: number;
  verdict: string;
  confidence: 'High' | 'Medium' | 'Low';
  updated: string;
  note?: string;
}

export const user = { first: 'Ada', name: 'Ada Okonkwo', initials: 'AO', email: 'ada@okonkwo.com', phone: '+234 803 555 0142' };

export const tobi: Person = {
  first: 'Tobi',
  name: 'Tobi Adeyemi',
  initials: 'TA',
  handle: '@tobi.adeyemi',
  platform: 'IG',
  tone: 'brand',
  caution: 2,
  positive: 8,
  verdict: 'Mostly positive, minor concerns',
  confidence: 'High',
  updated: 'Updated today',
  note: 'Met at the Bolt hackathon. Seems kind; check the football threads.',
};

export const seun: Person = {
  first: 'Seun',
  name: 'Seun Bakare',
  initials: 'SB',
  handle: '@seunbakes',
  platform: 'TT',
  tone: 'positive',
  caution: 4,
  positive: 6,
  verdict: 'Mixed, leaning positive',
  confidence: 'Medium',
  updated: 'Updated 3 days ago',
  note: 'From Hinge. Funny. Ask about the Abuja move.',
};

export const daniel: Person = {
  first: 'Daniel',
  name: 'Daniel Okafor',
  initials: 'DO',
  handle: '@danokafor',
  platform: 'X',
  tone: 'neutral',
  caution: 8,
  positive: 3,
  verdict: 'Serious concerns found',
  confidence: 'Medium',
  updated: 'Updated 1 week ago',
  note: 'Cancelled the date. Keeping this for reference.',
};

export const kemi: Person = {
  first: 'Kemi',
  name: 'Kemi Ola',
  initials: 'KO',
  handle: '@kemi.ola',
  platform: 'IG',
  tone: 'warning',
  caution: 1,
  positive: 2,
  verdict: 'Not enough public information',
  confidence: 'Low',
  updated: 'Updated 2 weeks ago',
};

export const people = [tobi, seun, daniel, kemi];
