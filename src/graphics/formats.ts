export type Group = 'Social' | 'Share images and email' | 'App stores' | 'Ads';

export interface Format {
  id: string;
  name: string;
  group: Group;
  w: number;
  h: number;
  /** Matched case-insensitively against brief headings. */
  aliases: string[];
  /** Numbered lines in the brief become one graphic each. */
  slides?: boolean;
  /** Top and bottom areas kept clear of text for platform UI (stories, reels). */
  safe?: [number, number];
  cta?: boolean;
  body?: boolean;
}

export const FORMATS: Format[] = [
  { id: 'ig-post', name: 'Instagram post', group: 'Social', w: 1080, h: 1080, aliases: ['instagram post', 'ig post', 'instagram square'] },
  { id: 'ig-portrait', name: 'Instagram portrait', group: 'Social', w: 1080, h: 1350, aliases: ['instagram portrait', 'ig portrait', 'instagram 4:5'] },
  { id: 'ig-carousel', name: 'Instagram carousel', group: 'Social', w: 1080, h: 1350, aliases: ['instagram carousel', 'ig carousel', 'carousel'], slides: true },
  { id: 'ig-story', name: 'Instagram story', group: 'Social', w: 1080, h: 1920, aliases: ['instagram story', 'ig story', 'story', 'reel cover'], safe: [250, 340], slides: true },
  { id: 'wa-status', name: 'WhatsApp status', group: 'Social', w: 1080, h: 1920, aliases: ['whatsapp status', 'whatsapp'], safe: [200, 260], slides: true },
  { id: 'tiktok', name: 'TikTok cover', group: 'Social', w: 1080, h: 1920, aliases: ['tiktok cover', 'tiktok'], safe: [260, 420], slides: true },
  { id: 'x-post', name: 'X post', group: 'Social', w: 1600, h: 900, aliases: ['x post', 'twitter post', 'x image', 'tweet'] },
  { id: 'fb-post', name: 'Facebook post', group: 'Social', w: 1200, h: 630, aliases: ['facebook post', 'fb post', 'facebook'] },
  { id: 'li-post', name: 'LinkedIn post', group: 'Social', w: 1200, h: 627, aliases: ['linkedin post', 'linkedin'] },

  { id: 'og', name: 'Website share image', group: 'Share images and email', w: 1200, h: 630, aliases: ['open graph', 'og image', 'share image', 'website share image', 'link preview'], cta: false },
  { id: 'email-header', name: 'Email header', group: 'Share images and email', w: 1200, h: 400, aliases: ['email header', 'email banner', 'newsletter header'], cta: false, body: false },

  { id: 'appstore', name: 'App Store screenshot', group: 'App stores', w: 1290, h: 2796, aliases: ['app store screenshots', 'app store screenshot', 'ios screenshots', 'iphone screenshots'], slides: true, cta: false },
  { id: 'play-shot', name: 'Google Play screenshot', group: 'App stores', w: 1080, h: 1920, aliases: ['google play screenshots', 'google play screenshot', 'play store screenshots', 'android screenshots'], slides: true, cta: false },
  { id: 'play-feature', name: 'Google Play feature graphic', group: 'App stores', w: 1024, h: 500, aliases: ['feature graphic', 'google play feature graphic', 'play feature graphic'], cta: false, body: false },

  { id: 'meta-square', name: 'Meta ad · square', group: 'Ads', w: 1080, h: 1080, aliases: ['meta ad square', 'facebook ad square', 'instagram ad square'] },
  { id: 'meta-story', name: 'Meta ad · story', group: 'Ads', w: 1080, h: 1920, aliases: ['meta ad story', 'instagram ad story', 'facebook ad story'], safe: [250, 340] },
  { id: 'meta-landscape', name: 'Meta ad · landscape', group: 'Ads', w: 1200, h: 628, aliases: ['meta ad landscape', 'facebook ad landscape'] },
  { id: 'gd-300x250', name: 'Display · Medium rectangle', group: 'Ads', w: 300, h: 250, aliases: ['300x250', 'medium rectangle'] },
  { id: 'gd-336x280', name: 'Display · Large rectangle', group: 'Ads', w: 336, h: 280, aliases: ['336x280', 'large rectangle'] },
  { id: 'gd-728x90', name: 'Display · Leaderboard', group: 'Ads', w: 728, h: 90, aliases: ['728x90', 'leaderboard'], body: false },
  { id: 'gd-970x250', name: 'Display · Billboard', group: 'Ads', w: 970, h: 250, aliases: ['970x250', 'billboard'] },
  { id: 'gd-300x600', name: 'Display · Half page', group: 'Ads', w: 300, h: 600, aliases: ['300x600', 'half page'] },
  { id: 'gd-160x600', name: 'Display · Wide skyscraper', group: 'Ads', w: 160, h: 600, aliases: ['160x600', 'skyscraper', 'wide skyscraper'], body: false },
  { id: 'gd-320x50', name: 'Display · Mobile banner', group: 'Ads', w: 320, h: 50, aliases: ['320x50', 'mobile banner'], body: false },
  { id: 'gd-320x100', name: 'Display · Large mobile banner', group: 'Ads', w: 320, h: 100, aliases: ['320x100', 'large mobile banner'], body: false },
];

/** Headings that expand to several formats at once. */
export const BUNDLES: Array<[string[], string[]]> = [
  [['google display', 'display ads', 'google ads', 'display set'], ['gd-300x250', 'gd-336x280', 'gd-728x90', 'gd-970x250', 'gd-300x600', 'gd-160x600', 'gd-320x50', 'gd-320x100']],
  [['meta ads', 'facebook ads', 'instagram ads'], ['meta-square', 'meta-story', 'meta-landscape']],
  [['social set', 'all social'], ['ig-post', 'ig-portrait', 'ig-story', 'wa-status', 'tiktok', 'x-post', 'fb-post', 'li-post']],
  [['store set', 'app store set'], ['appstore', 'play-shot', 'play-feature']],
  [['full set', 'everything', 'all formats'], FORMATS.map((f) => f.id)],
];

export const GROUP_ORDER: Group[] = ['Social', 'Share images and email', 'App stores', 'Ads'];

export const byId = (id: string) => FORMATS.filter((f) => f.id === id)[0];
