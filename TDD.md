# Technical Design Document — Ethan Tran Personal Website

**Last Updated:** February 21, 2026  
**Author:** Ethan Tran  
**Status:** Living Document

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Architecture](#4-architecture)
5. [Routing](#5-routing)
6. [Pages](#6-pages)
7. [Components](#7-components)
8. [Data Layer](#8-data-layer)
9. [External Services & APIs](#9-external-services--apis)
10. [Visual Design System](#10-visual-design-system)
11. [Theme System](#11-theme-system)
12. [Build & Deployment](#12-build--deployment)

---

## 1. Project Overview

A personal portfolio and photography website for Ethan Tran, a Computer Engineering student at the University of Waterloo. The site showcases engineering projects, a photography gallery, work experience, and a live Spotify "now playing" status.

The aesthetic is inspired by analogue photography: warm cream/brown tones, film grain textures, polaroid cards, monospaced type, and a hand-developed-photo animation on entry.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.2.3 |
| Language | TypeScript | ~5.8.2 |
| Build Tool | Vite | ^6.2.0 |
| Routing | React Router DOM | ^7.12.0 |
| Styling | Tailwind CSS (CDN) | Latest |
| Fonts | Google Fonts (Special Elite, Caveat, Courier Prime, Amatic SC) | — |
| External API | Lanyard REST API (Spotify/Discord) | v1 |
| Serverless Functions | Vercel-compatible `/api` handlers | — |
| Package Manager | npm | — |

> **Note:** Tailwind CSS is loaded via CDN in `index.html` rather than as a PostCSS plugin. Configuration is inlined in a `tailwind.config` script block. The `darkMode: 'class'` strategy is used.

---

## 3. Repository Structure

```
/
├── index.html               # Entry HTML, Tailwind CDN, font imports, dark mode init script
├── index.tsx                # React DOM root mount
├── App.tsx                  # Root router, layout shell, 404 route
├── types.ts                 # Shared TypeScript interfaces (Project, Experience, Category)
├── metadata.json            # (Legacy/unused) static metadata
├── tsconfig.json            # TypeScript compiler config
├── vite.config.ts           # Vite config: port 3000, path alias @/, env passthrough
├── package.json             # Dependencies and npm scripts
│
├── pages/
│   ├── Home.tsx             # Landing page
│   ├── About.tsx            # About Me page
│   ├── ProjectsPage.tsx     # Filterable project list
│   ├── ProjectDetail.tsx    # Individual project detail view
│   ├── Photography.tsx      # Photography gallery
│   └── Contact.tsx          # Contact page (currently unused in router)
│
├── components/
│   ├── Navbar.tsx           # Fixed top navigation bar + theme toggle + SpotifyStatus
│   ├── Footer.tsx           # Bottom footer with copyright and social links
│   ├── FilmBackground.tsx   # Animated canvas: film grain + film-strip edges (dark mode)
│   ├── ReactBitsBackground.tsx  # Animated canvas: floating polaroid/camera/film particles
│   ├── InteractivePolaroid.tsx  # Polaroid card with click-to-enlarge and flip animation
│   ├── ProjectCard.tsx      # Row card linking to a project detail page
│   ├── ExperienceTimeline.tsx   # Vertical experience list
│   └── SpotifyStatus.tsx    # Live Spotify/Discord "now playing" widget
│
├── data/
│   ├── projects.ts          # Static array of Project objects
│   ├── experience.ts        # Static array of Experience objects
│   └── photography.ts       # Static array of Photo objects + Photo interface
│
├── api/
│   ├── spotify-token.ts     # Serverless: OAuth code → access + refresh tokens
│   └── spotify-refresh.ts   # Serverless: Refresh token → new access token
│
└── public/
    └── photography/         # Static image assets organized by album
        ├── Hamilton - 2025/
        ├── Montréal/
        ├── San Francisco - 2025/
        ├── Selena_s Bday/
        ├── Toronto - 2024/
        ├── Toronto - 2025/
        ├── Waterloo - 2025/
        └── Will_s bday/
```

---

## 4. Architecture

### 4.1 Application Shell (`App.tsx`)

`App.tsx` wraps the entire application in a `HashRouter` (chosen to support static hosting without server-side routing). It renders:

1. `ScrollToTop` — a utility component that listens to `pathname` changes and calls `window.scrollTo(0, 0)`.
2. A full-screen `div` with the base background colour and text colours, plus the top-level flex layout.
3. `FilmBackground` — full-viewport fixed canvas behind all content.
4. `Navbar` — fixed top bar.
5. `<main>` — max-width `4xl` (56rem), centred, with top padding (`pt-16`) to clear the navbar.
6. `<Routes>` — page routing.
7. `Footer` — bottom bar.

### 4.2 Component Hierarchy

```
App
├── FilmBackground          (fixed canvas, z-0)
├── Navbar                  (fixed, z-50)
│   └── SpotifyStatus
├── main
│   ├── Home
│   │   ├── InteractivePolaroid (×1 hero headshot)
│   │   ├── InteractivePolaroid (×20 gallery carousel)
│   │   ├── ProjectCard (×3 featured, grid layout)
│   │   └── ExperienceTimeline
│   ├── About
│   ├── ProjectsPage
│   │   ├── ReactBitsBackground
│   │   └── ProjectCard (×n filtered, flex column)
│   ├── ProjectDetail
│   │   ├── ReactBitsBackground
│   │   └── ProjectCard (×2 related)
│   ├── Photography
│   │   ├── ReactBitsBackground
│   │   └── InteractivePolaroid (×n per group)
│   └── Contact
│       └── ReactBitsBackground
└── Footer
```

---

## 5. Routing

The app uses **HashRouter** (`#`-prefixed paths) to allow deployment on static hosts.

| Route | Component | Description |
|---|---|---|
| `/` | `Home` | Landing page |
| `/about` | `About` | Bio and personal background |
| `/projects` | `ProjectsPage` | Filterable, searchable project list |
| `/projects/:slug` | `ProjectDetail` | Full detail view for one project |
| `/photography` | `Photography` | Gallery grouped by location/year |
| `*` | Inline JSX | 404 — "Page not found" with Home link |

> `Contact.tsx` exists but is **not registered** in the router as of the current version.

---

## 6. Pages

### 6.1 Home (`pages/Home.tsx`)

**Purpose:** Hero landing page with an intro polaroid, photo gallery preview, featured projects, experience timeline, and a personality closing note.

**Imports:** `ProjectCard`, `ExperienceTimeline`, `InteractivePolaroid` (no film strip components).

**State:**
- `isDeveloped: boolean` — drives the `polaroid-develop` CSS animation class after a 100 ms delay on mount.
- `currentPhotoIndex: number` — tracks the active photo position in the gallery carousel. Manual prev/next buttons control it.
- `randomPhotos: Photo[]` — 20 photos randomly sampled from the full `photos` array, frozen on mount via `useState` initialiser.
- `polaroidRotations: number[]` — random `±3°` rotation per photo, frozen on mount.

**Key Sections (in order):**

1. **Hero** (`min-h-[70vh]`) — Two-column grid (`md:grid-cols-2`):
   - **Left:** `InteractivePolaroid` showing `/headshot.jpg` with a custom caption ("Ethan Tran" + "Computer Engineering @ University of Waterloo"). Fixed rotation of −2°. Back text: "my foggy golden gate bridge picture ;("
   - **Right:** Three bullet points introducing the developer. Uses `text-base md:text-xl` with brown-toned colours.
   - Below the grid: "VIEW WORKS" link → `/projects`, social icon links (GitHub, LinkedIn, Email, Instagram, 𝕏). Separated by a thin vertical divider.
   - Wrapped in `polaroid-develop` animation class.

2. **Gallery** — Section label "Gallery" with "VIEW GALLERY" link → `/photography`.
   - **Mobile (`md:hidden`):** Single `InteractivePolaroid` with prev/next arrow buttons and a "1 / 20" counter.
   - **Desktop (`hidden md:flex`):** Horizontal carousel of 20 polaroids in `w-[calc(25%-12px)]` slots (4 visible at a time). Controlled by prev/next round buttons. Slides via `translateX(calc(-index * (25% + 4px)))` with a 500 ms ease-in-out transition. Negative margin (`-mx-16`) lets it bleed slightly past the content column.
   - Wrapped in `polaroid-develop` with `animationDelay: 0.7s`.

3. **Selected Projects** — Section label "Selected Projects". Top 3 `featured === true` projects rendered as `ProjectCard` in a single-column grid (`grid grid-cols-1 gap-4`). Wrapped in `polaroid-develop` with `animationDelay: 0.9s`.

4. **Experience** — Section label "Experience". `ExperienceTimeline` component. Max-width `2xl`.

5. **Personality Note** — Centred handwritten paragraph about hobbies (keyboards, urban photography, Tetris sprint). Max-width `2xl`.

---

### 6.2 About (`pages/About.tsx`)

**Purpose:** Static bio page describing background, interests, and hobbies.

**Design:** Minimal — no background particle canvas, plain prose with Tailwind spacing. Uses the base page font (Courier Prime).

---

### 6.3 Projects Page (`pages/ProjectsPage.tsx`)

**Purpose:** Browse and filter all projects.

**Background:** `ReactBitsBackground` (floating particles).

**State:**
- `filter: Category | 'All'` — active category filter.
- `search: string` — free-text search across `title` and `tags`.

**Filtering logic (`useMemo`):**
```ts
projects.filter(p => {
  const matchesFilter = filter === 'All' || (Array.isArray(p.category)
    ? p.category.includes(filter)
    : p.category === filter);
  const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase())
    || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
  return matchesFilter && matchesSearch;
});
```

**Categories:** `All`, `Embedded/Firmware`, `Hardware`, `Web/App`, `Hackathons`

**Layout:** Category filter buttons (rounded-full pills) + search input (rounded-xl). Filtered projects rendered in a `flex flex-col gap-4` list of `ProjectCard` components. Empty state: dashed border box with "No matches found" message.

---

### 6.4 Project Detail (`pages/ProjectDetail.tsx`)

**Purpose:** Full narrative view of one project, resolved by `slug` URL param.

**Background:** `ReactBitsBackground`.

**Behaviour:**
- If the slug doesn't match any project, show a "Project not found" fallback with a back link.
- `useEffect` scrolls to top on slug change (belt-and-suspenders alongside `ScrollToTop`).

**Sections rendered per project:**
1. Back to projects link
2. Header — title, year badge, category tags, tech stack tags, action links (GitHub, Website, Demo)
3. The Problem
4. The Solution
5. Video (optional `<iframe>` embed via `dangerouslySetInnerHTML`)
6. Build / Finished images (optional)
7. The Build
8. What I Learned
9. Related Projects — up to 2 projects sharing the same category, rendered as `ProjectCard`

---

### 6.5 Photography (`pages/Photography.tsx`)

**Purpose:** Gallery of photos grouped by location and year.

**Background:** `ReactBitsBackground`.

**State:**
- `mounted: boolean` — delays render until after hydration (avoids SSR mismatch if ever used).
- `currentIndices: { [groupTitle: string]: number }` — active photo index within each group's carousel.

**Grouping logic (`useMemo`):** Photos are bucketed by `"${photo.location} - ${photo.year}"` key, then sorted so groups with more photos appear first.

**Navigation:** Previous/next arrow buttons per group call `goToPhoto(groupTitle, index, total)`.

Each photo is rendered as an `InteractivePolaroid` with a fixed `rotation={0}` (gallery mode).

---

### 6.6 Contact (`pages/Contact.tsx`)

**Purpose:** Contact information — email, LinkedIn, GitHub, Discord.

**Background:** `ReactBitsBackground`.

**Status:** Component exists and is complete but is **not wired into the router**.

---

## 7. Components

### 7.1 `Navbar`

- **Position:** `fixed top-0`, full width, `z-50`.
- **Height:** `h-20` (80 px).
- **Backdrop:** `backdrop-blur-xl` with 90% opacity background, bottom border with 50% opacity.
- **Logo:** "ETHAN TRAN" text link → `/`. Special Elite font, `text-sm font-bold tracking-tighter`.
- **Nav links (desktop):** Home, About, Works, Gallery — `text-[12px] font-bold uppercase tracking-widest mono`. Active state uses `location.pathname` match (primary colour for active, muted for inactive).
- **Right side controls:**
  - `SpotifyStatus` (hidden on mobile, visible `md:block`)
  - Resume PDF link → `/Ethan_Tran_Resume.pdf` (opens `_blank`). Styled as a rounded-full pill button with document icon.
  - Dark/light mode toggle button (sun/moon SVG icons). Rounded-full with hover background.
  - Hamburger button (mobile only, `md:hidden`). Toggles open/close icon.
- **Mobile menu:** Appears when `isOpen === true`. Includes nav links (Special Elite font, `text-lg`), resume link, and `SpotifyStatus` below a separator. Links call `setIsOpen(false)` on click.

---

### 7.2 `Footer`

- **Top border:** 2px solid in border colour.
- **Padding:** `py-20`.
- **Left column:** "Ethan Tran" in handwritten font (`text-xl`) + `© {year} — Waterloo, ON` in mono.
- **Right column:** Email link (`e64tran@uwaterloo.ca`) in handwritten font, plus GitHub and LinkedIn text links in `text-[11px] font-bold uppercase tracking-widest`.

---

### 7.3 `FilmBackground`

**Type:** Canvas-based, `fixed inset-0`, pointer-events-none, `z-0`.

**Behaviour:**
- Renders animated film grain by cycling through 6 pre-baked `ImageData` canvases at 1/5 scale (upscaled for a chunky film look). Grain frames are randomised per frame cycle.
- In **dark mode only**: draws film-strip bars along the top (22 px) and bottom (28 px) edges of the viewport, with sprocket holes at regular 28 px intervals and frame tick marks between them.
- In **light mode**: only grain is drawn; film strips are hidden.
- **Mouse glow effect:** A warm radial gradient (golden tones) follows the cursor — outer glow (320 px radius) plus a tight inner hotspot (70 px). Opacity differs slightly between dark/light modes.
- Responds to theme changes via `MutationObserver` on `document.documentElement` to rebuild grain canvases.
- Cleans up `requestAnimationFrame`, `resize`, `mousemove` listeners, and the `MutationObserver` on unmount.

---

### 7.4 `ReactBitsBackground`

**Type:** Canvas-based, `fixed inset-0`, pointer-events-none.

**Usage:** Rendered inside `ProjectsPage`, `ProjectDetail`, `Photography`, and `Contact` — but **not** on `Home` or `About`.

**Behaviour:**
- Spawns 25 particles of types `'polaroid'`, `'camera'`, or `'film'`.
- Each particle drifts slowly (`speedX/Y ≈ ±0.15`) and rotates.
- Mouse proximity causes a repulsion force: particles within 150 px are pushed away.
- Wraps at canvas edges (toroidal).
- Particles are drawn with very low opacity (0.03–0.11) using custom `ctx` draw functions for each type.
- Responds to resize and cleans up on unmount.

---

### 7.5 `InteractivePolaroid`

**Props:**

| Prop | Type | Default | Description |
|---|---|---|---|
| `photo` | `{ id, url, location, year? }` | required | Photo data |
| `rotation` | `number` | `0` | CSS rotation in degrees |
| `customCaption` | `React.ReactNode` | — | Replaces default location caption |
| `imageClassName` | `string` | `"w-full h-48 object-cover sepia-[0.2] contrast-[1.1]"` | Image CSS classes |
| `backText` | `string` | — | Text shown on the back face when flipped |

**Interaction states:**
1. **Default** — small polaroid card with hover scale (1.08×) and shadow lift.
2. **Enlarged** — first click opens a full-screen overlay (via `createPortal` into `document.body`, `z-[9999]`). Backdrop click or X button closes.
3. **Flipped** — second click in enlarged state flips the card 180° on the Y-axis (`perspective: 2000px`) to reveal the back face with `backText`.

**Architecture note:** The enlarged state uses `React.createPortal` to escape the local stacking context and render directly on `<body>`.

---

### 7.6 `ProjectCard`

A `<Link>` wrapping the entire card, routing to `/projects/:slug`.

**Layout:** Flex row (`sm:flex-row`, stacks vertically on mobile). Full width, with `p-5 md:p-6` padding and `rounded-lg`.

**Content:**
- **Left (flex-grow):** Project title (`text-lg font-bold`), year badge (`text-[9px] mono` in a `rounded-full` bordered pill), summary text (truncated to one line).
- **Right (flex-shrink-0):** Up to 2 tags (`hidden lg:flex`, `text-[10px] font-bold uppercase`), and a round arrow button with accent background.

**Hover state:**
- 2px border appears in border colour.
- Background shifts to hover surface colour.
- Arrow button inverts colours and translates +1px right.
- Shadow intensifies (`shadow-md` → `shadow-[4px_4px_12px_rgba(0,0,0,0.2)]`).

**No film/sprocket styling** — the card is a clean minimal row.

---

### 7.7 `ExperienceTimeline`

Renders the `experiences` array as a vertical list. Each entry shows:
- Role + Company + period
- Bullet points

No interactive state.

---

### 7.8 `SpotifyStatus`

**Data source:** [Lanyard REST API](https://api.lanyard.rest/v1/users/:id) — a free service that exposes Discord presence data including Spotify activity.

**Discord ID:** `"369238803656998912"` (hardcoded).

**Behaviour:**
- Polls once on mount (`useEffect`).
- Stores last-played track in `localStorage` under key `spotify_last_played` so the widget can show stale data when not currently listening.
- **Render states:**
  - `loading`: skeleton shimmer.
  - `error` (non-404, non-`user_not_monitored`): error text.
  - Actively listening: album art + song name + artist, green pulse dot.
  - Not listening but has cached last played: dimmed last-played track.
  - No data / `user_not_monitored`: component returns `null`.

---

## 8. Data Layer

All data is **static TypeScript modules** — no database, no CMS.

### 8.1 `types.ts`

```ts
type Category = 'Embedded/Firmware' | 'Hardware' | 'Web/App' | 'Hackathons';

interface Project {
  slug: string;
  title: string;
  year: string;
  category: Category | Category[];
  summary: string;          // short one-liner for cards
  description: string;      // medium description
  bullets: string[];        // short achievement bullets
  tags: string[];           // tech / topic tags
  links: { github?, demo?, website? };
  featured: boolean;
  content: {
    problem: string;
    solution: string;
    build: string;
    learned: string;
    video?: string;          // raw HTML iframe string
    buildImage?: string;
    finishedImage?: string;
  };
}

interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;            // e.g. "Sep 2023 – Jun 2025"
  bullets: string[];
}
```

### 8.2 `data/projects.ts`

Array of 4 `Project` objects. Featured projects (all `featured: true`): TetriPad, Gundam Ranger Morpher, HammerHacks 2024, Coloradio.

Projects can have a **single** category string or an **array** of categories (e.g. `['Hardware', 'Hackathons']`). The filter logic handles both forms.

### 8.3 `data/experience.ts`

Array of 4 `Experience` entries:
- Software Developer Lead @ Saltfleet Parliament (Sep 2023 – Jun 2025)
- Organizer / Software Developer @ HammerHacks (Jun 2024 – Dec 2024)
- App Developer @ Swift Kids (Feb 2024 – Jun 2024)
- Camera Operator Director @ OFSAA (Feb 2024 – Mar 2024)

### 8.4 `data/photography.ts`

Single `Photo` interface:
```ts
interface Photo {
  id: string;
  url: string;       // relative path under /photography/
  location: string;
  year: string;
  aspect: 'portrait' | 'landscape' | 'square';
}
```

80+ photos across albums: San Francisco 2025, Toronto 2024 & 2025, Hamilton 2025, Waterloo 2025, Montréal, Will's Bday, Selena's Bday.

---

## 9. External Services & APIs

### 9.1 Lanyard (Spotify Status)

- **Endpoint:** `GET https://api.lanyard.rest/v1/users/{discord_id}`
- **No auth required.** Free public API.
- **Rate:** Called once on component mount (no polling loop); could be extended to a WebSocket subscription with the Lanyard WS API for real-time updates.
- **Fallback:** `localStorage` cache of last-played track persists across sessions.

### 9.2 Serverless Functions (`/api`)

Two Vercel-compatible serverless handlers exist for a Spotify OAuth flow that is **not currently wired to the front-end**:

| File | Route | Purpose |
|---|---|---|
| `api/spotify-token.ts` | `POST /api/spotify-token` | Exchange OAuth code for access + refresh token |
| `api/spotify-refresh.ts` | `POST /api/spotify-refresh` | Use refresh token to get a new access token |

**Environment variables required (if deployed):**
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

These exist as a possible future migration from Lanyard to direct Spotify API polling.

### 9.3 Google Fonts

Loaded via `<link>` in `index.html`:
- `Special Elite` (`.font-heading`)
- `Caveat` (`.handwritten`)
- `Courier Prime` (`.mono`, body default)
- `Amatic SC`

---

## 10. Visual Design System

### 10.1 Colour Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| Background | `#f5e6d3` (warm cream) | `#2a2318` (dark brown) | Page background |
| Text Primary | `#2a2318` | `#f5e6d3` | Headings, strong text |
| Text Secondary | `#3d2f1f` | `#d4a574` | Body copy |
| Text Muted | `#6b5744` | `#a1785d` | Labels, captions |
| Text Faintest | `#8B7355` | `#a1785d` | Metadata, tags |
| Border | `#c4a882` | `#6b5744` | Card borders, dividers |
| Surface Hover | `#f5f5dc` | `#3d2f1f` | Card hover background |
| Accent/Selection | `#d4a574` | `#8B7355` | Selection highlight |

### 10.2 Typography

| Class | Font | Use |
|---|---|---|
| (body default) | Courier Prime | Default body text |
| `.font-heading` | Special Elite | Display headings, logo, nav links |
| `.handwritten` | Caveat | Captions, personality notes, footer name |
| `.mono` | Courier Prime | Labels, tags, metadata, section headers |

Section labels follow a consistent pattern:
```
text-[11px] font-bold tracking-[0.2em] uppercase mono text-[#8B7355]
```

### 10.3 Key Animations

| Name | Trigger | Effect |
|---|---|---|
| `polaroidDevelop` | `polaroid-develop` class applied | `opacity 0→1`, `brightness 2→1`, `contrast 0.3→1`, `saturate 0→1` over 2.5 s ease-out |
| Polaroid hover | CSS `:hover` | `scale(1.08)`, shadow lift |
| Polaroid flip | Second click on enlarged polaroid | `rotateY(180deg)` 700 ms |
| ProjectCard hover | CSS `group-hover` | Border appears, background shifts, arrow inverts + translates +1 px |
| Gallery carousel | Prev/next button click | `translateX` shift with 500 ms `ease-in-out` transition |
| `ReactBitsBackground` | Continuous `requestAnimationFrame` | Particle drift + mouse repulsion |
| `FilmBackground` | Continuous `requestAnimationFrame` | Cycled grain texture + film strip sprocket drawing (dark mode) + mouse-following warm glow |

### 10.4 CSS Styles (in `index.html <style>`)

- Custom scrollbar styling (8 px width, themed thumb colours).
- `::selection` colours (light/dark).
- `@keyframes polaroidDevelop` — the develop-from-white-flash animation.
- `scroll-behavior: smooth` on body.
- `-webkit-font-smoothing: antialiased`.

---

## 11. Theme System

### 11.1 Persistence

Tailwind `darkMode: 'class'` — the `dark` class is toggled on `<html>`.

```
localStorage key: 'theme'   values: 'light' | 'dark'
```

### 11.2 Initialisation (Flash Prevention)

A blocking inline `<script>` in `index.html` reads `localStorage` (or falls back to `prefers-color-scheme`) **before** the first paint, avoiding a light-mode flash:

```html
<script>
  if (localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
</script>
```

### 11.3 Toggle

`Navbar.toggleTheme()` flips the class on `document.documentElement` and persists to `localStorage`. The `isDark` React state controls which icon (sun/moon) is displayed.

---

## 12. Build & Deployment

### 12.1 Vite Config

```ts
// vite.config.ts
{
  server: { port: 3000, host: '0.0.0.0' },
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  },
  resolve: { alias: { '@': path.resolve(__dirname, '.') } }
}
```

### 12.2 npm Scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Local dev server on port 3000 |
| `build` | `vite build` | Production bundle to `/dist` |
| `preview` | `vite preview` | Serve the production build locally |

### 12.3 Deployment Notes

- The app uses `HashRouter` — compatible with any static host (GitHub Pages, Vercel, Netlify) without `_redirects` or `vercel.json` rewrite rules.
- The `/api` serverless functions are Vercel-compatible. On Vercel, files in `/api` are automatically deployed as Edge/Node functions.
- `public/photography/` images are large JPEGs — consider image optimisation (WebP conversion, lazy loading) for production.
- No `.env` file is committed; `GEMINI_API_KEY`, `SPOTIFY_CLIENT_ID`, and `SPOTIFY_CLIENT_SECRET` are injected as environment variables at build time.
