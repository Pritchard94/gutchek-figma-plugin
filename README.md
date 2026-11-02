# Gutchek Figma plugins

This repo contains two Figma plugins for the Gutchek brand:

- **Gutchek Design Generator** builds a complete design file in one run: the design system, brand guidelines, the mobile app (light and dark), the web app, the user flow, the marketing website and the waitlist page.
- **Gutchek Graphic Designer** turns a plain-language brief into ready-to-export marketing graphics: social posts, stories, share images, email headers, app store screenshots and ad banners.

Both plugins run entirely inside Figma. They make no network requests.

## Setup

You need [Node.js](https://nodejs.org) and the Figma desktop app (development plugins can only be imported in the desktop app).

1. Install dependencies and build both plugins:

   ```sh
   npm install
   npm run build
   ```

   This writes `code.js` (the generator) and `graphics/code.js` (the graphic designer). Both files are gitignored, so you need to build after every pull.

2. In Figma desktop, open a design file and go to **Plugins → Development → Import plugin from manifest…**. Import each plugin once:
   - `manifest.json` in the repo root for the **Gutchek Design Generator**
   - `graphics/manifest.json` for the **Gutchek Graphic Designer**

3. Run either plugin from **Plugins → Development**.

For best results, install **Plus Jakarta Sans** (display type) and **Inter** (UI type). If Plus Jakarta Sans is missing, display text falls back to Inter and the generator notes this in its log.

## Gutchek Design Generator

### What it does

Run the plugin in a design file (ideally an empty one) and it builds the following pages, in this order:

| Page | Contents |
| --- | --- |
| Cover | Cover frame with app and web app previews, also set as the file thumbnail |
| Brand Guidelines | Personality, logo use and misuse, colour, accessible pairings, the Gut Meter, motion and vocabulary |
| Foundations | Colour, type, spacing, radius and elevation tokens |
| Components | The component library, including `Icon/…` components |
| Screens · Light | Every mobile app screen, grouped by flow, in light mode |
| Screens · Dark | The same screens in dark mode |
| Web App | Desktop and mobile web versions of the app |
| User Flow | A map of how the app screens connect |
| Website | The marketing website |
| Waitlist | The waitlist landing page |

It also creates the **Gutchek / Color** variables, plus spacing and radius variables and **Gutchek/…** text and effect styles. Every generated frame is bound to these variables and styles. On paid Figma plans, light and dark live as two modes of one colour collection. On the Starter plan (one mode per collection), dark tokens go into a separate **Gutchek / Color Dark** collection.

### How to use it

1. Open the file you want to generate into.
2. Run **Plugins → Development → Gutchek Design Generator**. There is no UI. Progress messages appear at the bottom of the screen and the plugin closes itself when it's done.
3. You land on the Cover page. The closing message tells you whether light and dark ended up as modes or as separate collections.

**Running it again replaces the previous output.** Before building, the generator deletes:

- every page it created on an earlier run
- every empty page
- all variable collections and styles whose names start with `Gutchek` (or the old name, `Libra`)

Pages you created yourself are kept, as long as they're not empty. Changes you made to generated pages are lost, so duplicate anything you want to keep before running it again.

### When something goes wrong

If the run finishes with warnings or fails partway, the plugin adds a **Gutchek · Generator log** page. It lists the stage that was running, the error and any warnings, so you can diagnose a problem from a share link. The page is removed automatically on the next run.

## Gutchek Graphic Designer

### What it does

The Graphic Designer reads a brief and designs every graphic it lists on a page named **Graphic Design**. It groups the graphics into sections (Social, Share images and email, App stores and Ads) and adds a summary card of the brief, plus any notes. Every frame has a PNG export setting, so you can export it straight away.

The graphics use the same variables, styles and icons as the generator. If the file doesn't have them yet, the plugin creates them first. Phone mockups use real app screens from the **Screens · Light** page, so run the Design Generator in the same file first if you want those. Without it, the plugin uses illustrations instead and says so in the notes.

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
| `npm run build` | Bundles both plugins with esbuild |
| `npm run watch` | Rebuilds on change |
| `npm run typecheck` | Type-checks with TypeScript |
| `npm run smoke` | Runs both plugins against a mock Figma API (`test/`), including Starter-plan, missing-font and re-run scenarios |
| `npm run check` | Typecheck, build and smoke tests together |

After rebuilding, run the plugin again in Figma to pick up the new `code.js`. You don't need to re-import the manifest.

### Project layout

- `src/main.ts` is the Design Generator entry point.
- `src/graphics/` holds the Graphic Designer: brief parsing, the format list and the layout code. Its UI is `graphics/ui.html`.
- `src/tokens.ts` defines the colour, type, spacing, radius and elevation tokens shared by both plugins.
- `src/core/` holds the shared Figma helpers: variables, styles, fonts and layout primitives.
- `src/components/`, `src/pages/`, `src/screens/`, `src/webapp/` and `src/web/` build the components, documentation pages, app screens, web app and website.
- `brand/gutchek-logo.svg` is the master logo. After changing it, run `node tools/import-logo.js` to regenerate `src/brand-paths.ts`, then rebuild.
