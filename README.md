# Gutchek Figma plugins

This repo contains five Figma plugins for the Gutchek brand. Four of them build the design file, each owning its own pages:

- **Gutchek General** owns the design system and brand: variables and styles, the component library, foundations, brand guidelines and the cover. Run it first.
- **Gutchek Mobile** owns the iOS app screens (light and dark) and the user flow.
- **Gutchek Website & Waitlist** owns the marketing website (desktop, mobile and the staff admin dashboard) and the waitlist page.
- **Gutchek Web App** owns the signed-in web app (desktop and mobile web, light and dark).

The fifth, **Gutchek Graphic Designer**, turns a plain-language brief into ready-to-export marketing graphics: social posts, stories, share images, email headers, app store screenshots and ad banners.

All plugins run entirely inside Figma. They make no network requests.

## Setup

You need [Node.js](https://nodejs.org) and the Figma desktop app (development plugins can only be imported in the desktop app).

1. Install dependencies and build every plugin:

   ```sh
   npm install
   npm run build
   ```

   This writes `plugins/<name>/code.js` for the four design plugins and `graphics/code.js` for the Graphic Designer. These files are gitignored, so you need to build after every pull.

2. In Figma desktop, open a design file and go to **Plugins → Development → Import plugin from manifest…**. Import each plugin once:
   - `plugins/general/manifest.json` for **Gutchek General**
   - `plugins/mobile/manifest.json` for **Gutchek Mobile**
   - `plugins/website/manifest.json` for **Gutchek Website & Waitlist**
   - `plugins/webapp/manifest.json` for **Gutchek Web App**
   - `graphics/manifest.json` for **Gutchek Graphic Designer**

3. Run any plugin from **Plugins → Development**.

For best results, install **Plus Jakarta Sans** (display type) and **Inter** (UI type). If Plus Jakarta Sans is missing, display text falls back to Inter and the plugin says so in its notes.

## The design plugins

### Who owns what

| Plugin | Pages | Parts you can tick |
| --- | --- | --- |
| Gutchek General | Cover, Brand Guidelines, Foundations, Components | Variables and styles, Component library, Rebuild every component, Foundations, Brand Guidelines, Cover |
| Gutchek Mobile | Screens · Light, Screens · Dark, User Flow | Each flow group (Onboarding, App lock, Home and saved, Notes, Run a Gutchek, Report, Check a Chat, Gist Rooms, Safety, Settings and account) in light and in dark, and the user flow map |
| Gutchek Website & Waitlist | Website, Waitlist | Website desktop, Website mobile, Admin dashboard, Waitlist desktop, Waitlist mobile |
| Gutchek Web App | Web App | Each web app group (Sign in, Home and search, Notes, Report, Check a Chat, Rooms, Safety and settings, Mobile web) in light and in dark |

General also owns the **Gutchek / Color** variables, the spacing and radius variables and the **Gutchek/…** text and effect styles. Every generated frame is bound to them. On paid Figma plans, light and dark are two modes of one colour collection. On the Starter plan (one mode per collection), dark tokens go into a separate **Gutchek / Color Dark** collection.

Mobile, Website & Waitlist and Web App build from General's variables, styles and components, so they refuse to run until General has run in the file. The website's phone mockups and the cover use the app screens, so for a new file run the plugins in this order: General, Mobile, Web App, Website & Waitlist, then General again with **Cover** ticked.

### How to use them

1. Run a plugin. A panel lists the parts it owns, each marked **Missing** or **In file**.
2. Only the missing parts are ticked. Tick anything else you want rebuilt from the code, or press **Clear** and pick one part.
3. Press **Update**. Progress, then a summary and any notes, appear in the panel. The panel stays open so you can run it again.

### What a run touches

A run changes only the parts you ticked:

- **A section is rebuilt where it is.** The new section takes the old one's position. Sections below it (or to the right, on the board pages) move only if its size changed. Other sections, and anything you added to the page yourself, are left alone.
- **Prototype links keep working.** Links from untouched frames to a rebuilt frame are pointed at the new frame, and starting points are kept, including your own.
- **Variables and styles are updated in place.** Ticking **Variables and styles** adds anything missing and rewrites existing values from the code. Their ids don't change, so nothing in the file comes unbound. The other plugins only add tokens that are missing and never change existing ones.
- **Components are never rebuilt by accident.** **Component library** adds components, variants and icons that are new in the code and leaves existing ones alone. **Rebuild every component from code** replaces the whole library, then switches every instance in the file to the new components (keeping overrides) before the old ones are removed.
- **Pages are never deleted or reordered.** A missing page is created in the usual position.

Edits you made inside a section are lost when that section is rebuilt, so duplicate a section before ticking it if you want to keep your version.

Files made by the old all-in-one generator work as they are: sections are matched by name. The first time you run General, it removes the leftover **Gutchek · Generator log** page.

## Gutchek Graphic Designer

### What it does

The Graphic Designer reads a brief and designs every graphic it lists on a page named **Graphic Design**. It groups the graphics into sections (Social, Share images and email, App stores and Ads) and adds a summary card of the brief, plus any notes. Every frame has a PNG export setting, so you can export it straight away.

The graphics use the same variables, styles and icons as Gutchek General. If the file doesn't have them yet, the plugin creates the missing ones first and leaves existing ones unchanged. Phone mockups use real app screens from the **Screens · Light** page, so run Gutchek Mobile in the same file first if you want those. Without it, the plugin uses illustrations instead and says so in the notes.

### How to use it

1. Run **Plugins → Development → Gutchek Graphic Designer**. A panel opens with a sample brief already loaded.
2. Write or paste your brief into the panel. You can also drop in a Word (`.docx`), Markdown (`.md`) or text (`.txt`) file, or click the drop area to choose one.
3. Click **Generate graphics**.

Running it again clears and rebuilds the **Graphic Design** page. Other pages are not touched.

There's a starter brief in `graphics/brief-template.md` (with a Word version in `graphics/brief-template.docx`). Past briefs are kept in `graphics/briefs/`.

### Writing a brief

A brief has campaign defaults at the top, then one heading per format. The lines under a heading override the defaults for that format only.

```md
# Waitlist launch
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
3. Join the waitlist at gutchek.app | logo

## App Store screenshots
1. Know the person behind the DMs | phone: Home
2. A fair read, with the receipts | phone: Report overview | theme: light

## Google display
Headline: Trust your gut. Then check it.
Visual: meter
```

**Fields** (several synonyms are accepted for each):

| Field | Also accepted | Notes |
| --- | --- | --- |
| `Headline` | Title, Tagline | Main line of text |
| `Body` | Text, Copy, Subline, Description | Supporting copy |
| `CTA` | Button, Call to action | Button label |
| `Visual` | Image, Art, Screen | See the visuals list below |
| `Theme` | Style, Background | `brand`, `light` or `dark` |
| `Eyebrow` | Tag, Label, Kicker | Small label above the headline |
| `Link` | URL, Website | Shown on the graphic |

Write `CTA: none` (or `Body: none`, `Eyebrow: none`) to leave that element off.

**Visuals:** `meter`, `chat`, `notes`, `rooms`, `gauge`, `logo`, `quote: your words`, `icon: flag`, `poll: Yes, Maybe, No`, `ask: your prompt`, `phone: Home`, and `phones: Home, Report overview`. Phone visuals look up screens on the **Screens · Light** page by name, for example `Home`, `Report overview`, `Notes` or `Room feed`.

**Slides:** carousels, stories, WhatsApp status, TikTok covers and store screenshots take one numbered (or bulleted) line per slide, in the form `caption | visual | theme: …`. Each line becomes its own graphic.

**Labels:** add a note in brackets to a heading to label the output, for example `## Instagram story (Post 4 · Poll frames)`.

If the brief names no formats at all, the plugin generates the full set.

### Formats

| Heading | Size (px) |
| --- | --- |
| Instagram post | 1080 × 1080 |
| Instagram portrait | 1080 × 1350 |
| Instagram carousel | 1080 × 1350 per slide |
| Instagram story | 1080 × 1920 |
| WhatsApp status | 1080 × 1920 |
| TikTok cover | 1080 × 1920 |
| X post | 1600 × 900 |
| Facebook post | 1200 × 630 |
| LinkedIn post | 1200 × 627 |
| Website share image (Open Graph) | 1200 × 630 |
| Email header | 1200 × 400 |
| App Store screenshots | 1290 × 2796 per slide |
| Google Play screenshots | 1080 × 1920 per slide |
| Google Play feature graphic | 1024 × 500 |
| Display sizes (`300x250`, `336x280`, `728x90`, `970x250`, `300x600`, `160x600`, `320x50`, `320x100`) | As named |

Story-shaped formats keep the top and bottom clear of text so the platform's own UI doesn't cover it.

Some headings expand into several formats at once:

| Heading | Produces |
| --- | --- |
| Meta ads | Square, story and landscape Meta ads |
| Google display | All eight display sizes |
| Social set | Every social format except the carousel |
| Store set | App Store screenshots, Google Play screenshots and the feature graphic |
| Full set | Every format |

## Development

| Command | What it does |
| --- | --- |
| `npm run build` | Bundles all five plugins with esbuild |
| `npm run watch` | Rebuilds the four design plugins on change |
| `npm run typecheck` | Type-checks with TypeScript |
| `npm run smoke` | Runs the plugins against a mock Figma API (`test/`) under the normal, Starter-plan and missing-font scenarios. It checks partial reruns: only the ticked section changes, variable and style ids survive, and instances and prototype links stay connected |
| `npm run check` | Typecheck, build and smoke tests together |

After rebuilding, run the plugin again in Figma to pick up the new `code.js`. You don't need to re-import the manifest.

### Project layout

- `src/plugins/` holds the four design plugin entry points (`general.ts`, `mobile.ts`, `website.ts`, `webapp.ts`). Their manifests are in `plugins/<name>/`.
- `src/core/panel.ts` and `src/core/panel.html` are the checklist panel all four share. `src/core/sections.ts` replaces one section in place and repoints prototype links.
- `src/graphics/` holds the Graphic Designer: brief parsing, the format list and the layout code. Its UI is `graphics/ui.html`.
- `src/tokens.ts` defines the colour, type, spacing, radius and elevation tokens shared by every plugin.
- `src/core/` holds the shared Figma helpers: variables, styles, fonts and layout primitives.
- `src/components/`, `src/pages/`, `src/screens/`, `src/webapp/` and `src/web/` build the components, documentation pages, app screens, web app and website.
- `brand/gutchek-logo.svg` is the master logo. After changing it, run `node tools/import-logo.js` to regenerate `src/brand-paths.ts`, then rebuild.
