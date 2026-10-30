import { Token } from '../tokens';
import { Tone, box, col, divider, icon, pill, row, text, toneTokens } from '../core/ui';
import { use } from '../components/library';
import { barChart, cohort, donut, donutLegend, funnel, hbars, legend, lineChart, sparkline } from '../components/charts';
import { wlink } from './kit';
import { card, equalize, shell, small, table } from './admin';

export type Period = 'Days' | 'Months' | 'Year vs year' | 'Lifetime';

const GROWTH_IDS: Record<Period, string> = { Days: 'adminGrowthDays', Months: 'adminGrowth', 'Year vs year': 'adminGrowthYoY', Lifetime: 'adminGrowthLifetime' };

const RANGE: Record<Period, string> = {
  Days: '26 Sep – 25 Oct 2026',
  Months: 'Nov 2025 – Oct 2026',
  'Year vs year': 'Jan – Oct · 2026 vs 2025',
  Lifetime: 'Since launch · Jan 2025',
};

/** The timeline filter shared by every analytics page. */
export function timeFilter(active: Period, ids: Record<Period, string> = GROWTH_IDS, compare = true): FrameNode {
  const seg = (p: Period) => {
    const on = p === active;
    const s = box({ name: p, dir: 'h', h: 32, pad: [0, 14], radius: 8, fill: on ? 'bg/raised' : null, shadow: on ? 'e1' : undefined, main: 'center', cross: 'center' }, [text(p, on ? 'smallStrong' : 'small', on ? 'text/primary' : 'text/secondary')]);
    return wlink(s, ids[p]);
  };
  const dd = (iconName: string, label: string) =>
    row({ name: label, h: 40, pad: [0, 12], gap: 8, radius: 10, fill: 'bg/surface', stroke: 'border/strong', cross: 'center' }, [icon(iconName, 16, 'text/secondary'), text(label, 'small', 'text/primary'), icon('chevron-down', 14, 'text/tertiary')]);
  return row({ name: 'Time filter', w: 'fill', gap: 12, pad: 12, radius: 16, fill: 'bg/surface', stroke: 'border/default', cross: 'center' }, [
    row({ name: 'Period', h: 40, pad: 4, gap: 2, radius: 10, fill: 'bg/subtle', cross: 'center' }, (['Days', 'Months', 'Year vs year', 'Lifetime'] as Period[]).map(seg)),
    dd('calendar', RANGE[active]),
    row({ name: 'Compare', gap: 8 }, [use('Switch', { State: compare && active !== 'Lifetime' ? 'On' : 'Off' }), text(active === 'Year vs year' ? 'vs 2025' : 'Compare', 'small', 'text/secondary')]),
    box({ name: 'Spacer', w: 'fill', h: 1 }),
    dd('sliders', 'All platforms · All regions'),
    use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Export' }, { show: ['icon'], icons: { icon: 'download' } }),
  ]);
}

function delta(v: string, good: boolean): FrameNode {
  const tone: Tone = good ? 'positive' : 'caution';
  return row({ name: 'Delta', gap: 4, pad: [2, 8], radius: 999, fill: toneTokens[tone].bg }, [icon(good ? 'trending-up' : 'alert-triangle', 12, toneTokens[tone].fg), text(v, 'label', toneTokens[tone].fg)]);
}

function metric(label: string, value: string, change: string, good: boolean, spark: number[], note: string, token: Token = 'brand/fg'): FrameNode {
  return col({ name: label, w: 'fill', gap: 10, pad: 20, radius: 16, fill: 'bg/surface', stroke: 'border/default' }, [
    row({ name: 'Head', w: 'fill', gap: 8 }, [text(label, 'small', 'text/secondary', { w: 'fill' }), delta(change, good)]),
    row({ name: 'Value', w: 'fill', gap: 12, cross: 'end' }, [text(value, { family: 'display', weight: 800, size: 30, line: 36, tracking: -1.5 }, 'text/primary', { w: 'fill' }), sparkline(spark, token, 110, 34)]),
    text(note, 'caption', 'text/tertiary', { w: 'fill' }),
  ]);
}

// ---------------------------------------------------------------- data

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
const SIGNUPS_M = [2100, 2480, 2900, 3150, 3420, 3800, 4260, 4700, 5120, 5600, 6310, 6930];
const SIGNUPS_PREV = [1300, 1520, 1610, 1850, 2010, 2240, 2500, 2790, 3150, 3420, 3800, 4100];
const DAY_LABELS = Array.from({ length: 30 }, (_, i) => {
  const d = 26 + i;
  return d <= 30 ? d + ' Sep' : d - 30 + ' Oct';
});
const SIGNUPS_D = [180, 192, 205, 176, 210, 248, 262, 199, 214, 226, 231, 208, 240, 288, 301, 222, 236, 244, 239, 251, 296, 318, 241, 255, 262, 270, 266, 309, 334, 281];
const SIGNUPS_D_PREV = SIGNUPS_D.map((v) => Math.round(v * 0.78));
const YOY_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const Y2026 = [2900, 3150, 3420, 3800, 4260, 4700, 5120, 5600, 6310, 6930];
const Y2025 = [380, 620, 900, 1180, 1450, 1720, 1980, 2240, 2610, 2900, 2100, 2480];
const LIFE_LABELS = ['Jan 25', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Jan 26', 'Mar', 'May', 'Jul', 'Sep', 'Oct'];
const LIFETIME = [380, 1900, 4550, 8230, 12750, 17550, 23020, 29590, 37150, 46970, 58900, 65830];

function signupChart(p: Period): FrameNode {
  const w = 1056;
  const h = 300;
  if (p === 'Days') {
    return card('Daily sign-ups', [
      lineChart([{ name: 'Previous 30 days', values: SIGNUPS_D_PREV, token: 'border/strong', dashed: true }, { name: 'Last 30 days', values: SIGNUPS_D, token: 'brand/fg', area: true }], DAY_LABELS, { w, h }),
      legend([['Last 30 days', 'brand/fg'], ['Previous 30 days', 'border/strong', true]]),
    ], 'fill', '7,212 sign-ups · +23% vs previous 30 days');
  }
  if (p === 'Year vs year') {
    return card('Monthly sign-ups, 2026 vs 2025', [
      lineChart([{ name: '2025', values: Y2025, token: 'border/strong', dashed: true }, { name: '2026', values: Y2026, token: 'brand/fg', area: true }], YOY_LABELS, { w, h }),
      legend([['2026', 'brand/fg'], ['2025', 'border/strong', true]]),
    ], 'fill', 'Jan to Oct: 46,190 in 2026 vs 15,980 in 2025 · +189%');
  }
  if (p === 'Lifetime') {
    return card('Total users since launch', [
      lineChart([{ name: 'Total users', values: LIFETIME, token: 'brand/fg', area: true }], LIFE_LABELS, { w, h }),
      legend([['Cumulative sign-ups', 'brand/fg']]),
    ], 'fill', '65,830 sign-ups · 48,212 active accounts after deletions');
  }
  return card('Monthly sign-ups', [
    lineChart([{ name: 'Previous period', values: SIGNUPS_PREV, token: 'border/strong', dashed: true }, { name: 'Sign-ups', values: SIGNUPS_M, token: 'brand/fg', area: true }], MONTHS, { w, h }),
    legend([['Last 12 months', 'brand/fg'], ['Previous 12 months', 'border/strong', true]]),
  ], 'fill', '50,770 sign-ups · +61% vs previous 12 months');
}

const KPI: Record<Period, Array<[string, string, string, boolean, number[], string]>> = {
  Days: [
    ['Total users', '48,212', '+4.6%', true, SIGNUPS_D.slice(-12), 'Active accounts today'],
    ['New sign-ups', '7,212', '+23%', true, SIGNUPS_D.slice(-12), 'Last 30 days'],
    ['Daily active users', '6,740', '+9%', true, [5.9, 6.1, 6.0, 6.3, 6.2, 6.4, 6.6, 6.5, 6.7, 6.8, 6.6, 6.74], 'DAU/MAU 31%'],
    ['Activation', '54%', '+3 pts', true, [48, 49, 50, 50, 51, 52, 52, 53, 53, 54, 54, 54], 'First report or chat check within 7 days'],
    ['Paying users', '3,812', '+11%', true, [3.1, 3.2, 3.3, 3.35, 3.4, 3.5, 3.55, 3.6, 3.65, 3.7, 3.76, 3.81], '7.9% of active users'],
    ['Account deletions', '312', '+6%', false, [8, 10, 9, 12, 11, 10, 13, 11, 12, 10, 11, 12], 'Most cite "found what I needed"'],
  ],
  Months: [
    ['Total users', '48,212', '+12.4%', true, SIGNUPS_M, 'Active accounts, end of October'],
    ['New sign-ups', '6,930', '+9.8%', true, SIGNUPS_M, 'October 2026'],
    ['Monthly active users', '21,480', '+14%', true, [12, 13, 14, 15, 15.5, 16.4, 17, 18, 19, 19.8, 20.6, 21.48], 'DAU/MAU 31%'],
    ['Activation', '54%', '+3 pts', true, [44, 45, 47, 48, 49, 50, 51, 52, 52, 53, 54, 54], 'First report or chat check within 7 days'],
    ['Paying users', '3,812', '+8%', true, [1.6, 1.8, 2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.2, 3.4, 3.55, 3.81], '7.9% of active users'],
    ['Account deletions', '1,140', '−4%', true, [140, 128, 122, 118, 110, 104, 101, 99, 96, 95, 92, 88], 'Per month, trending down'],
  ],
  'Year vs year': [
    ['Total users', '48,212', '+212%', true, LIFETIME, 'vs 15,460 at end of Oct 2025'],
    ['Sign-ups Jan to Oct', '46,190', '+189%', true, Y2026, 'vs 15,980 in 2025'],
    ['Monthly active users', '21,480', '+176%', true, [3, 4, 6, 8, 10, 12, 14, 16, 18, 21.48], 'vs 7,780 in Oct 2025'],
    ['Activation', '54%', '+11 pts', true, [43, 44, 46, 48, 49, 50, 51, 52, 53, 54], 'vs 43% in 2025'],
    ['Paying users', '3,812', '+240%', true, [0.4, 0.7, 1, 1.4, 1.8, 2.2, 2.6, 3, 3.4, 3.81], 'vs 1,120 in Oct 2025'],
    ['Account deletions', '9,420', '+88%', false, [3, 4, 5, 6, 6, 7, 7, 8, 9, 9.4], 'Grows with the base; rate down to 2.1%'],
  ],
  Lifetime: [
    ['Total sign-ups', '65,830', 'since launch', true, LIFETIME, 'Jan 2025 to today'],
    ['Active accounts', '48,212', '73% kept', true, LIFETIME.map((v) => v * 0.73), 'After deletions and bans'],
    ['Reports run', '182,400', 'lifetime', true, LIFETIME.map((v) => v * 2.8), '2.8 per user on average'],
    ['Chat checks', '41,300', 'lifetime', true, LIFETIME.map((v) => v * 0.6), 'Since launch in May 2026'],
    ['Lifetime revenue', '$318k', 'lifetime', true, LIFETIME.map((v) => v * 5), 'App stores, Paystack and Flutterwave'],
    ['Room members', '5,333', '6 rooms', true, LIFETIME.map((v) => v * 0.08), 'Rooms launched in August 2026'],
  ],
};

function metricsGrid(p: Period): FrameNode[] {
  const ms = KPI[p].map(([l, v, c, g, s, n]) => metric(l, v, c, g, s, n));
  return [equalize(row({ name: 'Metrics 1', w: 'fill', gap: 16, cross: 'start' }, ms.slice(0, 3))), equalize(row({ name: 'Metrics 2', w: 'fill', gap: 16, cross: 'start' }, ms.slice(3)))];
}

// ---------------------------------------------------------------- growth

function growth(p: Period): FrameNode {
  const name = 'Admin · Growth · ' + p;
  return shell(
    name,
    'adminGrowth',
    'Growth',
    'Users, sign-ups and activation across iOS, Android and web',
    [
      timeFilter(p),
      ...metricsGrid(p),
      signupChart(p),
      equalize(
        row({ name: 'Middle', w: 'fill', gap: 16, cross: 'start' }, [
          card('Activation funnel', [funnel([['Visited website or store page', 118400], ['Signed up', 6930], ['Verified phone', 6120], ['First report or chat check', 3740], ['Became a paying user', 548]], 320)], 'fill'),
          card('Sign-ups by platform', [row({ name: 'Donut row', w: 'fill', gap: 20 }, [donut([[52, 'brand/solid', 'iOS'], [38, 'positive/solid', 'Android'], [10, 'warning/fg', 'Web app']], 140, ['6,930', 'sign-ups']), donutLegend([[52, 'brand/solid', 'iOS'], [38, 'positive/solid', 'Android'], [10, 'warning/fg', 'Web app']])])], 'fill'),
          card('Top regions', [hbars([['Lagos', 3120], ['Abuja', 1240], ['Port Harcourt', 610], ['Accra', 540], ['Ibadan', 420]], 300)], 'fill'),
        ]),
      ),
      equalize(
        row({ name: 'Bottom', w: 'fill', gap: 16, cross: 'start' }, [
          card('Acquisition channels', [
            table(
              [
                { label: 'Channel', w: 'fill' },
                { label: 'Sign-ups', w: 90 },
                { label: 'Activation', w: 90 },
                { label: 'Paid', w: 70 },
              ],
              [
                [small('TikTok', 'text/primary'), small('2,240'), small('58%'), small('8.1%')],
                [small('Shared room posts', 'text/primary'), small('1,390'), small('64%'), small('9.4%')],
                [small('Instagram', 'text/primary'), small('1,180'), small('51%'), small('7.2%')],
                [small('App Store and Google Play search', 'text/primary'), small('1,060'), small('49%'), small('6.8%')],
                [small('Organic search and website', 'text/primary'), small('760'), small('47%'), small('6.1%')],
                [small('Friend referrals', 'text/primary'), small('300'), small('71%'), small('11.2%')],
              ],
            ),
          ]),
          card('New and returning users', [barChart(MONTHS.map((_, i) => [Math.round(SIGNUPS_M[i] / 100), Math.round(SIGNUPS_M[i] / 55)]), MONTHS, ['brand/solid', 'brand/border'], { w: 440, h: 220, barW: 18 }), legend([['New', 'brand/solid'], ['Returning', 'brand/border']])], 480),
        ]),
      ),
    ],
    [use('Button', { Variant: 'Secondary', Size: 'Medium' }, { label: 'Schedule report' }, { show: ['icon'], icons: { icon: 'calendar' } })],
  );
}

export const adminGrowth = () => growth('Months');
export const adminGrowthDays = () => growth('Days');
export const adminGrowthYoY = () => growth('Year vs year');
export const adminGrowthLifetime = () => growth('Lifetime');

// ---------------------------------------------------------------- engagement

const ENG_IDS: Record<Period, string> = { Days: 'adminEngagement', Months: 'adminEngagement', 'Year vs year': 'adminEngagement', Lifetime: 'adminEngagement' };

export function adminEngagement(): FrameNode {
  const dau = SIGNUPS_D.map((v) => v * 24);
  const wau = SIGNUPS_D.map((v) => v * 52);
  return shell('Admin · Engagement', 'adminEngagement', 'Engagement', 'How often people come back and which features they use', [
    timeFilter('Days', ENG_IDS),
    equalize(
      row({ name: 'Metrics', w: 'fill', gap: 16, cross: 'start' }, [
        metric('Daily active users', '6,740', '+9%', true, dau.slice(-12), 'Average over 30 days'),
        metric('Day-30 retention', '38%', '+4 pts', true, [31, 32, 33, 33, 34, 35, 35, 36, 37, 37, 38, 38], 'September cohort'),
        metric('Average session', '6m 40s', '+12%', true, [5.2, 5.4, 5.5, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7], 'Longest in Rooms'),
      ]),
    ),
    card('Active users', [
      lineChart([{ name: 'Weekly active', values: wau, token: 'positive/fg' }, { name: 'Daily active', values: dau, token: 'brand/fg', area: true }], DAY_LABELS, { w: 1056, h: 260 }),
      legend([['Daily active', 'brand/fg'], ['Weekly active', 'positive/fg']]),
    ], 'fill', 'DAU/WAU 46% · DAU/MAU 31%'),
    equalize(
      row({ name: 'Middle', w: 'fill', gap: 16, cross: 'start' }, [
        card('Retention by sign-up month', [
          cohort(
            [
              ['May 2026', '4,260', [100, 61, 48, 42, 39, 37]],
              ['Jun 2026', '4,700', [100, 63, 50, 44, 40]],
              ['Jul 2026', '5,120', [100, 64, 52, 45]],
              ['Aug 2026', '5,600', [100, 66, 53]],
              ['Sep 2026', '6,310', [100, 68]],
              ['Oct 2026', '6,930', [100]],
            ],
            ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'],
          ),
        ], 'fill'),
        card('Feature use · last 30 days', [hbars([['Reports run', 14200], ['Notes written', 11800], ['Personality viewed', 9600], ['Rooms messages', 8900], ['Chat checks', 5100], ['Share my date', 2400], ['Compare', 1300]], 340)], 380),
      ]),
    ),
    card('Notes · private journal', [
      equalize(
        row({ name: 'Notes metrics', w: 'fill', gap: 16, cross: 'start' }, [
          metric('Weekly note writers', '34%', '+6 pts', true, [22, 24, 25, 27, 27, 28, 30, 31, 31, 32, 33, 34], 'Of active users, last 7 days'),
          metric('Notes per writer', '3.4', '+0.4', true, [2.6, 2.7, 2.8, 2.8, 2.9, 3.0, 3.0, 3.1, 3.2, 3.3, 3.3, 3.4], 'A week, median'),
          metric('Checks with a gut log', '21%', '+3 pts', true, [12, 13, 14, 15, 15, 16, 17, 18, 19, 19, 20, 21], 'Log my gut · v1.1'),
          metric('Synced across devices', '58%', '+5 pts', true, [44, 46, 47, 49, 50, 51, 53, 54, 55, 56, 57, 58], 'Writers on 2+ devices'),
        ]),
      ),
      row({ name: 'Privacy', w: 'fill', gap: 8, pad: [10, 14], radius: 12, fill: 'bg/subtle' }, [
        icon('lock', 16, 'text/secondary'),
        text('Counts only. Staff can never read note content. Break-glass access needs logged approval, and none was used this period.', 'small', 'text/secondary', { w: 'fill' }),
      ]),
    ], 'fill', 'Note content outside its owner\u2019s account: 0 incidents'),
    card('Rooms engagement', [
      table(
        [
          { label: 'Room', w: 'fill' },
          { label: 'Members', w: 100 },
          { label: 'Messages', w: 100 },
          { label: 'Active members', w: 130 },
          { label: 'Avg replies', w: 110 },
          { label: 'Held by bot', w: 110 },
        ],
        [
          [small('Talking Stage Diaries', 'text/primary'), small('1,204'), small('3,410'), small('42%'), small('6.8'), small('2.1%')],
          [small('Lagos Dating Life', 'text/primary'), small('2,418'), small('2,960'), small('29%'), small('4.2'), small('5.6%')],
          [small('First Date Stories', 'text/primary'), small('861'), small('1,240'), small('37%'), small('5.1'), small('1.4%')],
          [small('Healing After Heartbreak', 'text/primary'), small('540'), small('820'), small('51%'), small('7.9'), small('0.9%')],
          [small('Safety First', 'text/primary'), small('310'), small('470'), small('48%'), small('3.6'), small('0.4%')],
        ],
      ),
    ]),
  ]);
}

// ---------------------------------------------------------------- revenue

const REV_IDS: Record<Period, string> = { Days: 'adminRevenue', Months: 'adminRevenue', 'Year vs year': 'adminRevenue', Lifetime: 'adminRevenue' };

export function adminRevenue(): FrameNode {
  const mrr26 = [8.1, 9.4, 11, 12.6, 14.5, 16.8, 19.1, 21.6, 24.3, 27.4];
  const mrr25 = [0.9, 1.6, 2.4, 3.2, 4.1, 4.9, 5.8, 6.6, 7.2, 7.9, 7.6, 7.8];
  return shell('Admin · Revenue', 'adminRevenue', 'Revenue', 'Subscriptions and one-off reports across every payment provider', [
    timeFilter('Year vs year', REV_IDS),
    equalize(
      row({ name: 'Metrics 1', w: 'fill', gap: 16, cross: 'start' }, [
        metric('Monthly recurring revenue', '$27.4k', '+247%', true, mrr26, 'vs $7.9k in Oct 2025', 'positive/fg'),
        metric('Paid conversion', '7.9%', '+2.1 pts', true, [5.1, 5.4, 5.8, 6.1, 6.4, 6.8, 7.0, 7.3, 7.6, 7.9], 'Of monthly active users', 'positive/fg'),
        metric('Average revenue per paying user', '$7.18', '+4%', true, [6.6, 6.7, 6.8, 6.8, 6.9, 7.0, 7.0, 7.1, 7.1, 7.18], 'Blended across plans', 'positive/fg'),
      ]),
    ),
    equalize(
      row({ name: 'Metrics 2', w: 'fill', gap: 16, cross: 'start' }, [
        metric('Monthly churn', '4.6%', '−1.2 pts', true, [6.8, 6.5, 6.1, 5.9, 5.6, 5.3, 5.1, 4.9, 4.8, 4.6], 'Paying users who cancel', 'positive/fg'),
        metric('One-off reports', '$3.9k', '+64%', true, [1.2, 1.5, 1.8, 2.1, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9], 'Pay per report this month', 'positive/fg'),
        metric('Refunds', '$410', '+12%', false, [220, 240, 260, 280, 300, 320, 350, 370, 390, 410], '1.5% of revenue', 'caution/fg'),
      ]),
    ),
    card('Monthly recurring revenue, 2026 vs 2025', [
      lineChart([{ name: '2025', values: mrr25, token: 'border/strong', dashed: true }, { name: '2026', values: mrr26, token: 'positive/fg', area: true }], YOY_LABELS, { w: 1056, h: 280, prefix: '$', yMax: 30 }),
      legend([['2026', 'positive/fg'], ['2025', 'border/strong', true]]),
    ], 'fill', 'Jan to Oct revenue: $186k in 2026 vs $49k in 2025'),
    equalize(
      row({ name: 'Middle', w: 'fill', gap: 16, cross: 'start' }, [
        card('Plan mix · paying users', [row({ name: 'Donut row', w: 'fill', gap: 20 }, [donut([[64, 'brand/solid', 'Gutchek Plus'], [21, 'positive/solid', 'Gutchek Pro'], [15, 'warning/fg', 'Pay per report']], 140, ['3,812', 'paying']), donutLegend([[64, 'brand/solid', 'Gutchek Plus'], [21, 'positive/solid', 'Gutchek Pro'], [15, 'warning/fg', 'Pay per report']])])]),
        card('Revenue by provider', [hbars([['App Store', 12400, '$12.4k'], ['Google Play', 8600, '$8.6k'], ['Paystack', 7100, '$7.1k'], ['Flutterwave', 3200, '$3.2k']], 320, 'positive/solid')]),
        card('Unit economics', [
          row({ name: 'LTV', w: 'fill', gap: 8 }, [small('Lifetime value', 'text/secondary', 'fill'), text('$58', 'title', 'text/primary')]),
          divider(),
          row({ name: 'CAC', w: 'fill', gap: 8 }, [small('Blended acquisition cost', 'text/secondary', 'fill'), text('$4.20', 'title', 'text/primary')]),
          divider(),
          row({ name: 'Ratio', w: 'fill', gap: 8 }, [small('LTV to CAC', 'text/secondary', 'fill'), pill('13.8x', 'positive')]),
          divider(),
          row({ name: 'Margin', w: 'fill', gap: 8 }, [small('Gross margin per report', 'text/secondary', 'fill'), pill('71% · target 60%', 'positive')]),
        ], 340),
      ]),
    ),
    card('Why people cancel', [
      hbars([['Found what I needed', 41, '41%'], ['Too expensive', 22, '22%'], ['Not enough public data', 17, '17%'], ['Using it less', 12, '12%'], ['Other', 8, '8%']], 1056, 'brand/solid'),
    ]),
  ]);
}

export const ANALYTICS_PAGES: Array<[string, string, () => FrameNode]> = [
  ['adminGrowth', 'Admin · Growth · Months', adminGrowth],
  ['adminGrowthDays', 'Admin · Growth · Days', adminGrowthDays],
  ['adminGrowthYoY', 'Admin · Growth · Year vs year', adminGrowthYoY],
  ['adminGrowthLifetime', 'Admin · Growth · Lifetime', adminGrowthLifetime],
  ['adminEngagement', 'Admin · Engagement', adminEngagement],
  ['adminRevenue', 'Admin · Revenue', adminRevenue],
];

