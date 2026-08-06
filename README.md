# ethantran.ca

Personal site — Vite + React + Tailwind (CDN) + three.js.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in /dist
```

The home page is a split-panel portfolio: identity + experience on the left (sticky on
desktop), terrain / about / projects / gallery on the right (scrolls). Everything lives
on one page — project details open in a modal, not a separate route.

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

All projects render on the home page in this file's order, flowing left/right into two
columns. Valid categories are defined in [`types.ts`](types.ts) (`Category`).

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
(`id` must be unique — it's the React list key).

## Where things render

| Section | Data | Component |
|---|---|---|
| Typed name + bio + links (left panel) | inline | [`pages/Home.tsx`](pages/Home.tsx), [`components/TypedName.tsx`](components/TypedName.tsx), [`components/ThemeToggle.tsx`](components/ThemeToggle.tsx) |
| Experience (hover to expand) | `data/experience.ts` | [`components/ExperienceTimeline.tsx`](components/ExperienceTimeline.tsx) |
| Now playing / copyright (left bottom) | — | [`components/SpotifyStatus.tsx`](components/SpotifyStatus.tsx), [`pages/Home.tsx`](pages/Home.tsx) |
| Closed-loop terrain + caption | — | [`components/ClosedLoopControlTerrain.tsx`](components/ClosedLoopControlTerrain.tsx) (canvas), [`pages/Home.tsx`](pages/Home.tsx) (caption) |
| About | `data/about.ts` | [`components/About.tsx`](components/About.tsx) |
| Project cards + filters | `data/projects.ts` | [`components/WorkCards.tsx`](components/WorkCards.tsx), filters in [`pages/Home.tsx`](pages/Home.tsx) |
| Project detail modal | `data/projects.ts` | [`components/ProjectModal.tsx`](components/ProjectModal.tsx) |
| Papers | `data/papers.ts` | [`pages/Papers.tsx`](pages/Papers.tsx) |
| Gallery (+ home preview) | `data/photography.ts` | [`pages/Photography.tsx`](pages/Photography.tsx), [`pages/Home.tsx`](pages/Home.tsx) |
| PD cursor-chaser dot | — | [`components/LoopCursor.tsx`](components/LoopCursor.tsx) |

Scroll animations are [`components/Reveal.tsx`](components/Reveal.tsx) (right-panel
sections below the masthead) and the `.reveal` CSS classes in [`index.html`](index.html)
(load-time stagger for the left panel, the terrain masthead, and subpages).

**Theme**: warm stone palette with a single amber "target" accent — the ✦ about
markers, active filter, typing cursor, focus rings, the terrain's goal marker, and
the cursor-chaser dot all wear it. The chaser is a real underdamped PD controller
(cursor = setpoint), matching the terrain caption.
