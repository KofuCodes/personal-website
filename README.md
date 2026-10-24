# ethantran.ca

Personal site — Vite + React + Tailwind (CDN) + three.js.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in /dist
```

The site is one centered column made of two zones. The **shell** never changes:
the hero (name, with now-playing on its line, then
headshot + bio + links), the ➢ pages nav, and the closed-loop terrain. Routes
swap only what sits **below** it — `index` (about), `projects`, `work`
(experience), `gallery`. Project details open in a modal, not a separate route.

All content lives in **`/data`** as plain TypeScript — you never touch a component to
add a project, a job, an about line, or a photo. The sections below are the recipes.

## Add a project

1. **Drop an image in `/public`** (e.g. `/public/myproject.jpg`). It renders at its
   natural aspect ratio as the card image, and again inside the modal. Skip it and the
   card becomes a caption-only entry.
2. **Add an entry to [`data/projects.ts`](data/projects.ts):**

```ts
{
  slug: 'my-project',            // unique id
  title: 'My Project',
  year: '2026',
  category: 'Embedded/Firmware', // shown in the modal; or an array: ['Hardware', 'Hackathons']
  kind: 'hardware',              // which filter shows it: 'software' | 'hardware' | 'both' (default)
  summary: 'One-liner shown under the card title and in the modal.',
  tags: ['Firmware', 'PCB'],     // chips in the modal
  links: { github: 'https://github.com/...' },  // also: demo, website — buttons in the modal
  content: {                     // the modal story
    problem: '...',
    solution: '...',
    build: '...',
    learned: '...',
    buildImage: '/myproject.jpg',           // ← the image from step 1
    // finishedImage: '/myproject-done.jpg',  // optional second photo
    // video: '<iframe ...></iframe>',        // optional YouTube embed, shown above the photos
  },
}
```

All projects render on the projects page in this file's order, flowing left/right into
two columns. Valid categories are defined in [`types.ts`](types.ts) (`Category`).

## Add experience

Add an entry to [`data/experience.ts`](data/experience.ts):

```ts
{
  id: '5',
  role: 'Firmware Intern',        // shown as the small italic subtitle
  company: 'Company',             // shown big
  period: 'May 2026 – Aug 2026',
  domain: 'company.com',          // logo = the site's favicon (zero setup)
  // logo: '/logos/company.png',  // or a local file if the favicon is ugly
  link: 'https://company.com',    // adds a ↗ link on the company name
  bullets: ['Shown when the row is hovered (tapped on mobile).'],
}
```

No `domain`/`logo` → a monogram chip is generated from the company name.

## Add an about line

Add an entry to [`data/about.ts`](data/about.ts). Each line is a list of parts,
rendered in order:

```ts
{
  parts: [
    'Currently building a ',
    { emoji: '🤖' },                          // emoji icon
    ' robot with ',
    { domain: 'nvidia.com', name: 'NVIDIA' }, // favicon icon + "NVIDIA" label, kept on one line
    ' Jetson.',
    // { text: 'gallery', to: '/photography' } // internal link
  ],
  // sub: ['↳-style indented sub-line, same part types'],
}
```

## Add photos

Drop files in `/public/photography/<Album>/` and register each in
[`data/photography.ts`](data/photography.ts) with `id`, `url`, `location`, `year`, `aspect`
(`id` must be unique — it's the React list key). Browsers can't show `.HEIC`, so convert
those to JPG first. Albums are grouped by `location — year`, newest year first; the
`priority` list in [`pages/Photography.tsx`](pages/Photography.tsx) decides which places
lead within a year.

## On repeat (Spotify)

The index shows my five most-played Spotify tracks over the past ~4 weeks as album covers
([`components/OnRepeat.tsx`](components/OnRepeat.tsx)). They come from
[`api/top-tracks.ts`](api/top-tracks.ts), a Vercel function the CDN caches for an hour, so
the shelf updates by itself. Until it's configured the section simply doesn't show.

One-time setup:
1. In the [Spotify developer dashboard](https://developer.spotify.com/dashboard), create an
   app (Web API) and add the redirect URI `http://127.0.0.1:8888/callback`.
2. Put the app's `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env.local`, then run
   `node --env-file=.env.local scripts/spotify-auth.mjs` (same in PowerShell, cmd or bash).
   Open the link it prints, approve, and add the `SPOTIFY_REFRESH_TOKEN` it prints to
   `.env.local` — the shelf now shows under `npm run dev` (the dev server serves `/api/*`
   like Vercel does).
3. Add the same three variables to the Vercel project's environment variables and redeploy.

## Where things render

| Section | Data | Component |
|---|---|---|
| Shell layout (zones, routes) + footer | — | [`App.tsx`](App.tsx) |
| Hero — name, now playing, headshot, bio, links | inline | [`components/Hero.tsx`](components/Hero.tsx), [`components/SpotifyStatus.tsx`](components/SpotifyStatus.tsx) |
| Pages nav (➢ index / projects / work / gallery) | — | [`components/PagesNav.tsx`](components/PagesNav.tsx) |
| Back-to-top pill (appears past 260px) | — | [`components/ScrollTop.tsx`](components/ScrollTop.tsx) |
| Closed-loop terrain + caption | — | [`components/ClosedLoopControlTerrain.tsx`](components/ClosedLoopControlTerrain.tsx) (canvas), [`App.tsx`](App.tsx) (sizing + caption) |
| Section headers ("x —") | — | [`components/QuietHeader.tsx`](components/QuietHeader.tsx) |
| index → About | `data/about.ts` | [`pages/Home.tsx`](pages/Home.tsx), [`components/About.tsx`](components/About.tsx) |
| index → On repeat (Spotify top 5) | `/api/top-tracks` | [`components/OnRepeat.tsx`](components/OnRepeat.tsx), [`api/top-tracks.ts`](api/top-tracks.ts) |
| projects → cards + filters | `data/projects.ts` | [`pages/Projects.tsx`](pages/Projects.tsx), [`components/WorkCards.tsx`](components/WorkCards.tsx) |
| Project detail modal | `data/projects.ts` | [`components/ProjectModal.tsx`](components/ProjectModal.tsx) |
| work → experience (hover to expand) | `data/experience.ts` | [`pages/Work.tsx`](pages/Work.tsx), [`components/ExperienceTimeline.tsx`](components/ExperienceTimeline.tsx) |
| gallery → photos | `data/photography.ts` | [`pages/Photography.tsx`](pages/Photography.tsx) |

Animations are the `.reveal` CSS classes in [`index.html`](index.html): a load-time
stagger for the hero, nav, and terrain, and the fade each page plays when routes swap.

**Theme**: minimal watercolor, sampled from a painting of geese in flight. Warm paper
(`paper`) with a cool payne's-grey `ink-*` scale, Inter throughout (the same stack as
wcagas.com), and a single goose-beak orange accent (`beak`) — the ✦ about markers,
active filter/nav page, focus rings, and the terrain's goal marker all wear it. Light only; all tokens live in the Tailwind
config in `index.html`.

Behind the page, back to front ([`App.tsx`](App.tsx)):
- [`GeeseSky`](components/GeeseSky.tsx) — the flock (`public/geese.webp`, feathered so
  no edge shows). It blooms in on first load, then only floats softly (a few px of rise
  and sway, a faint lean from the cursor). It sits behind the header and scrolls away a
  little slower than the page, so it never stays behind body text.
- [`WatercolorTrail`](components/WatercolorTrail.tsx) — the cursor is a damp brush: faint
  strokes with a darker drying rim that fade to nothing in ~3–4 s (mouse/pen only, off
  under reduced motion).
- `.paper-grain` — a fixed cold-press texture over both. `.brush-rule` is the painted
  divider used in the hero and footer.
