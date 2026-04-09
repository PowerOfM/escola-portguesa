# Escola Portuguesa

## Project Overview

This is an **AstroJS 5** static site for **Escola Portuguesa Nossa Senhora de Fátima**, a Portuguese language school in Vancouver, BC. The site uses Astro's component model with vanilla CSS — no CSS framework, no preprocessors.

**Live dev server:** `npm start` → `http://localhost:4321`

---

## Project Structure

```
escola-portguesa/
├── astro.config.mjs          # Astro config — output: "static"
├── wrangler.toml             # Cloudflare Pages config — output dir: "dist"
├── public/
│   └── assets/               # Static files served as-is
│       ├── css/
│       │   ├── reset.css       # Modern CSS reset (Josh Comeau style)
│       │   ├── main.css        # Global styles (tokens, layout, header, footer, shared)
│       │   ├── home.css        # Home page sections
│       │   ├── curriculum.css  # Curriculum/fees page
│       │   ├── about.css       # About/teachers page
│       │   ├── calendar.css    # Calendar page
│       │   └── contact.css     # Contact/enrollment form
│       ├── images/             # Hero images, section images, teacher photos
│       └── logo-rooster.jpg    # Site logo
├── src/
│   ├── data/                 # JSON content files (imported directly in pages)
│   │   ├── site.json           # School name, address, email, school year, class days
│   │   ├── home.json           # Home page copy (hero, sections, CTA text)
│   │   ├── about.json          # About page intro paragraphs + volunteers section
│   │   ├── calendar.json       # Array of calendar events
│   │   ├── curriculum/         # One JSON file per curriculum level (filename sets order)
│   │   │   ├── 01-pre-escola.json
│   │   │   ├── 02-a1-basico-inicial.json
│   │   │   ├── 03-a1-basico-emergente.json
│   │   │   ├── 04-a1-basico-aplicado.json
│   │   │   ├── 05-a1-intermediario.json
│   │   │   └── 06-a1-a2.json
│   │   └── teachers/           # One JSON file per teacher (filename sets order)
│   │       ├── 01-lina.json
│   │       ├── 02-rosa-marques.json
│   │       ├── 03-rosa-anita.json
│   │       ├── 04-aurelia.json
│   │       ├── 05-lisandra.json
│   │       └── 06-manuela.json
│   ├── layouts/
│   │   └── Layout.astro        # Base HTML layout (head, header, main, footer)
│   ├── components/
│   │   ├── Header.astro        # Site header with logo + nav + hamburger
│   │   ├── Footer.astro        # Site footer (brand, quick links, contact)
│   │   └── CTA.astro           # "Ready to Begin" CTA section (home + curriculum)
│   └── pages/
│       ├── index.astro         # Home page
│       ├── about.astro         # Our School / Teachers page
│       ├── curriculum.astro    # Curriculum levels + fees
│       ├── calendar.astro      # Important dates
│       └── contact.astro       # Contact info + enrollment form
└── dist/                     # Astro build output (gitignored)
```

---

## Scripts

| Command | Action |
|---|---|
| `npm start` | Start dev server at `http://localhost:4321` |
| `npm run build` | Build static site to `dist/` |
| `npm run preview` | Preview the build locally |
| `npm run deploy` | Deploy `dist/` to Cloudflare Pages via wrangler |

---

## How Data Works

Data is not processed by a build system — it is imported directly as ES modules in each `.astro` file's frontmatter.

**Simple JSON files** (site, home, about, calendar) are imported with a named import:

```js
import site from '../data/site.json';
import calendar from '../data/calendar.json';
```

**Directory collections** (curriculum, teachers) are loaded with `import.meta.glob` and sorted by filename (the numeric prefix controls display order):

```js
const curriculumModules = import.meta.glob('../data/curriculum/*.json', { eager: true });
const curriculum = Object.entries(curriculumModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, mod]) => ({
    slug: path.split('/').pop().replace('.json', ''), // e.g. "01-pre-escola"
    ...mod.default,
  }));
```

The `slug` derived from the filename is used as the tab `data-tab`/`data-panel` attribute on the curriculum page and as the URL hash in home page curriculum pills (e.g. `/curriculum#01-pre-escola`).

---

## Key Files & Their Roles

### `src/layouts/Layout.astro`

Base template for all pages. Props:

| Prop | Type | Effect |
|---|---|---|
| `title` | string | `<title>` tag + page heading |
| `css` | string? | Loads `/assets/css/{css}.css` (page-specific styles) |
| `hideTitle` | boolean | Adds `class="home"` to `<body>`, suppresses the page heading block |
| `heroImage` | string? | Renders a `.page-hero` section with background image instead of plain heading |
| `navPage` | string? | Passed to `<Header>` to highlight the active nav link |

### `src/components/Header.astro`

Absolutely positioned header with a 10px green bar above it. Receives a `navPage` prop and applies `nav-active` class to the matching `<li>`. Includes client-side JavaScript for the mobile hamburger menu (toggle on click, close on outside click or Escape key).

### `src/components/Footer.astro`

Three-column layout: brand/tagline, Quick Links, Contact Us (with SVG icons). Imports `site.json` directly.

### `src/components/CTA.astro`

Full-width CTA section with background image overlay. Imports `home.json` for heading/body text. Used on both the home and curriculum pages.

### `src/pages/index.astro`

Home page. Uses `hideTitle={true}` — no page-hero or page-title block is rendered, and `body.home` CSS rules apply (hides HOME and REGISTER nav links in header). The hero heading contains HTML (`<br>`), rendered with Astro's `set:html` directive.

### `src/pages/about.astro`

"Our School" page. Renders the teachers list from `src/data/teachers/` and the intro/volunteers sections from `about.json`. The teachers section has `id="our-teachers"` so that `/about#our-teachers` anchor links from the footer and home page work correctly.

### `src/pages/curriculum.astro`

Curriculum levels rendered as a tabbed interface. Client-side JavaScript toggles the visible panel by matching `data-tab` to `data-panel`. Below the tabs: feature info cards and school fees pricing with payment options. Ends with the CTA component.

### `src/pages/calendar.astro`

School year info cards followed by a timeline list of events. Calendar event descriptions may contain HTML (e.g. links) and are rendered with `set:html`.

### `src/pages/contact.astro`

Contact info cards and an enrollment inquiry form with a segmented radio control (New/Returning Student), input fields, and a curriculum level `<select>` populated from the curriculum data.

---

## Design System

### Colors
```css
--primary: #143221;      /* Dark green — used everywhere */
--white: #ffffff;
--gray-400: #4a5565;     /* Body text on light backgrounds */
--gray-500: #99a1af;     /* Muted text (footer on dark bg) */
--black: #020202;        /* Default body text */
```

### Typography
- **Headings:** `"Prata"` serif (loaded from Bunny Fonts)
- **Body:** `"Inter"` sans-serif
- **Logo/Nav:** `"Crimson Pro"` serif

### Spacing & Layout
- Container padding: `90px` (responsive down to `24px`)
- Max width: `1512px`
- Border radius: `15px` (cards, buttons, pills, images)

### Buttons
- **`.btn-primary`**: Green radial gradient (`#48d643` → `#42af60` → `#31bb68`), white text, 24px bold, rounded, subtle hover lift
- **`.btn-outline`**: Transparent with primary border, fills primary on hover

---

## Design Source

Design implemented from **Figma**: `https://www.figma.com/design/fX1DfHBau7o4rogZBaLMPo/Untitled?node-id=86-129&m=dev`

Images were extracted from Figma and saved to `public/assets/images/`.

---

## Notable Design Decisions & Gotchas

1. **Hero section**: Background image with `linear-gradient(180deg, transparent 53%, black 100%)` overlay via `::after` pseudo-element. Content positioned at bottom with `align-items: flex-end`.

2. **Hero CTA**: The "Enrolment open..." tag sits *under* the button with a white background pill that visually extends from the button. Achieved with `flex-direction: column`, negative `margin-top`, and `z-index: -1` on the tag.

3. **Curriculum pills**: 6 pills in a grid, each with incrementing white opacity backgrounds (`0.4` → `0.9`). First pill has a special red-tinted text color (`#fef2f2`).

4. **Body class for home page**: `Layout.astro` adds `class="home"` to `<body>` when `hideTitle` is true. CSS uses `body.home .nav-home, body.home .nav-register { display: none; }` to hide those links on the home page.

5. **Footer on white background**: Footer uses white background. Text colors use `--gray-400` for contrast. Border-top on `.footer-bottom` uses `rgba(20,50,33,0.1)`.

6. **Teachers image**: Takes 60% of the grid row (`grid-template-columns: 40% 60%`). Image has `height: 465px` and `object-fit: cover`.

7. **Responsive breakpoints**: `1200px` (tablet — stacks grids, 3-col pills) and `768px` (mobile — 2-col pills, hamburger nav, smaller type).

8. **Pricing cards (curriculum page)**: All three cards are intentionally identical — no "featured" treatment on the middle one. Families are not choosing based on price tier, so no card should be visually elevated.

9. **Badge sizing in flex columns**: `display: inline-block` alone does not shrink an element to fit its content when it's a direct flex child — use `align-self: flex-start` or `width: fit-content`.

10. **`set:html` directive**: Used wherever content from JSON may contain HTML markup — the home hero heading (`<br>` tag), and calendar event descriptions (which can contain `<a>` links).

11. **Curriculum/teachers ordering**: Display order is controlled entirely by the numeric filename prefix (`01-`, `02-`, etc.). `import.meta.glob` returns files in an unspecified order, so results are always `.sort()`ed by path before use.

---

## How to Work With This Project

- **Edit global styles**: `public/assets/css/main.css`
- **Edit page-specific styles**: `public/assets/css/<page>.css`
- **Edit page content/copy**: `src/data/*.json`
- **Add/edit a curriculum level**: Edit or add a file in `src/data/curriculum/` (numeric prefix controls order)
- **Add/edit a teacher**: Edit or add a file in `src/data/teachers/` (numeric prefix controls order)
- **Edit page structure**: `src/pages/<page>.astro`
- **Edit header/footer/layout**: `src/components/` or `src/layouts/Layout.astro`
- **Add images**: Place in `public/assets/images/`, reference as `/assets/images/filename.png`

---

## Known Issues / Open Items

- The teachers image may overflow its container at certain viewport widths — the `height: 465px` with `object-fit: cover` on a 60%-width column can cause overflow on mid-range viewports.
- The enrollment form posts to `action="#"` — no backend or form handler is wired up yet.
