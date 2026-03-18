# Escola Portuguesa — Agent Handoff Document

## Project Overview

This is an **11ty (Eleventy)** static site for **Escola Portuguesa Nossa Senhora de Fátima**, a Portuguese language school in Vancouver, BC. The site is built with `.njk` (Nunjucks) templates and vanilla CSS — no frameworks, no preprocessors.

**Live dev server:** `http://localhost:8080` (watcher running in background, no need to build manually)

---

## Project Structure

```
escola-portguesa/
├── .eleventy.js          # Eleventy config — input: "pages", output: "build"
├── assets/
│   ├── css/
│   │   ├── reset.css       # Modern CSS reset (Josh Comeau style)
│   │   ├── main.css        # Global styles (design tokens, layout, header, footer, shared components)
│   │   ├── home.css        # Styles for the home page (hero, school, curriculum, teachers sections)
│   │   ├── curriculum.css  # Styles for the curriculum/fees page
│   │   ├── about.css       # Styles for the about page
│   │   ├── calendar.css    # Styles for the calendar page
│   │   └── contact.css     # Styles for the contact page
│   └── images/           # Downloaded from Figma (hero-bg.png, our-school.png, etc.)
├── pages/                # Eleventy input directory
│   ├── _includes/
│   │   ├── layout.njk    # Base HTML layout (head, header, footer, main)
│   │   ├── header.njk    # Site header with logo + nav
│   │   └── footer.njk    # Site footer
│   ├── index.njk         # Home page (uses hideTitle: true)
│   ├── about.njk
│   ├── calendar.njk
│   ├── contact.njk
│   └── curriculum.njk
└── build/                # Eleventy output directory
```

---

## Key Files & Their Roles

### `pages/_includes/layout.njk`
- Base template for all pages
- Loads `reset.css` then `main.css`
- Conditionally adds `class="home"` to `<body>` when `hideTitle: true` (used by index page to hide HOME/REGISTER nav links)
- Conditionally renders a `.page-title` section with `<h1>` unless `hideTitle` is set

### `pages/_includes/header.njk`
- Absolutely positioned header with a 10px green bar above it
- Logo group: rooster image + school name in Crimson Pro font, white background with negative left margin for overlap effect
- Nav: frosted glass pill (`backdrop-filter: blur(4px)`, `rgba(20,50,33,0.25)` background)
- Nav links use Crimson Pro, uppercase, with rounded hover states
- "Register" link has solid primary background

### `pages/_includes/footer.njk`
- Three-column layout: brand/description, Quick Links, Contact Us (with SVG icons)
- Copyright bar at bottom with top border

### `pages/index.njk`
- Home page with `hideTitle: true` in frontmatter
- Sections: hero, school, curriculum, teachers, CTA

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
- Border radius: `15px` (used on cards, buttons, pills, images)

### Buttons
- **`.btn-primary`**: Green radial gradient (`#48d643` → `#42af60` → `#31bb68`), white text, 24px bold, rounded, subtle hover lift
- **`.btn-outline`**: Transparent with primary border, fills primary on hover

---

## Design Source

Design was implemented from **Figma**: `https://www.figma.com/design/fX1DfHBau7o4rogZBaLMPo/Untitled?node-id=86-129&m=dev`

Images were extracted from Figma using `download_figma_images` and saved to `assets/images/`.

---

## Notable Design Decisions & Gotchas

1. **Hero section**: Background image with `linear-gradient(180deg, transparent 53%, black 100%)` overlay via `::after` pseudo-element. Content positioned at bottom with `align-items: flex-end`.

2. **Hero CTA**: The "Enrolment open..." tag sits *under* the button with a white background pill that visually extends from the button. Achieved with `flex-direction: column`, negative `margin-top`, and `z-index: -1` on the tag.

3. **Curriculum pills**: 6 pills in a grid, each with incrementing white opacity backgrounds (`0.4` → `0.9`). First pill has a special red-tinted text color (`#fef2f2`).

4. **Body class for home page**: `layout.njk` adds `class="home"` to `<body>` when `hideTitle` is true. CSS uses `body.home .nav-home, body.home .nav-register { display: none; }` to hide those links on the home page.

5. **Footer on white background**: Footer was changed from green to white. Text colors adjusted from `--gray-500` to `--gray-400` for contrast. Border-top on `.footer-bottom` uses `rgba(20,50,33,0.1)`.

6. **Teachers image**: Takes 60% of the grid row (`grid-template-columns: 40% 60%`). Image has `height: 465px` and `object-fit: cover`.

7. **Responsive breakpoints**: `1200px` (tablet — stacks grids, 3-col pills) and `768px` (mobile — 2-col pills, hidden nav, smaller type).

8. **Pricing cards (curriculum page)**: All three cards are intentionally identical — no "featured" treatment on the middle one. Families are not choosing a number of children based on price, so no card should be visually elevated. The `.fees-pricing-card--featured` rule was removed.

9. **Badge sizing in flex columns**: `display: inline-block` alone does not shrink an element to fit its content when it's a direct child of a flex column — the flex algorithm stretches it to the cross axis. Use `align-self: flex-start` alongside `inline-block` (or switch to `width: fit-content`) to make pill/badge elements hug their text.

---

## How to Work With This Project

- **Edit global styles**: `assets/css/main.css` — design tokens, shared components, header/footer
- **Edit page-specific styles**: `assets/css/<page>.css` (e.g. `home.css`, `curriculum.css`)
- **Edit home page**: `pages/index.njk`
- **Edit other pages**: `pages/*.njk`
- **Edit layout/header/footer**: `pages/_includes/*.njk`
- **Add images**: Place in `assets/images/`, reference as `/assets/images/filename.png`
- **No build step needed**: Watcher auto-rebuilds on save

---

## Known Issues / Open Items

- The teachers image may overflow its container at certain viewport widths — the `height: 465px` with `object-fit: cover` on a 60%-width column can cause overflow. May need `width: 100%` or `overflow: hidden` on the wrapper.
- Navigation is completely hidden on mobile (`display: none` at 768px) — a hamburger menu was not implemented.
- The header nav doesn't highlight the current page.