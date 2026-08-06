# ethantran.ca

Personal site — Vite + React + Tailwind (CDN) + three.js.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build in /dist
```

All content lives in **`/data`** as plain TypeScript — you never touch a component to
add a project, a job, an about line, or a photo. The sections below are the recipes.

## Add a project

1. **Drop an image in `/public`** (e.g. `/public/myproject.jpg`). This becomes the big
   card thumbnail on the home page + `/projects` grid, and the build photo on the
   detail page. Skip it and the card shows a neutral placeholder.
2. **Add an entry to [`data/projects.ts`](data/projects.ts):**

```ts
{
  slug: 'my-project',            // URL: /#/projects/my-project
  title: 'My Project',
  year: '2026',
  category: 'Embedded/Firmware', // or an array: ['Hardware', 'Hackathons']
  summary: 'One-liner shown on the card.',
  description: 'Longer intro paragraph for the detail page.',
  bullets: ['What you did, one line each.'],
  tags: ['Firmware', 'PCB'],     // searchable on /projects
  links: { github: 'https://github.com/...' },  // also: demo, website
  featured: true,                // "Selected work" shows the FIRST 4 featured entries in
                                 // this file's order — all 4 current projects are featured,
                                 // so move yours higher (or unfeature one) to surface it
  content: {                     // the detail-page story
    problem: '...',
    solution: '...',
    build: '...',
    learned: '...',
    buildImage: '/myproject.jpg',   // ← the card image from step 1
    // finishedImage: '/myproject-done.jpg',  // optional "Finished" photo beside it on the detail page
    // video: '<iframe ...></iframe>',        // optional YouTube embed
  },
}
```

Valid categories are defined in [`types.ts`](types.ts) (`Category`) — add a new one
there and to the filter list in [`pages/ProjectsPage.tsx`](pages/ProjectsPage.tsx) if needed.

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
  link: 'https://company.com',    // makes the row clickable
}
```

No `domain`/`logo` → a monogram chip is generated from the company name.
`bullets` are optional and currently not rendered — the home page keeps rows compact.

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
| Hero + socials | inline | [`pages/Home.tsx`](pages/Home.tsx) |
| Closed-loop terrain + caption | — | [`components/ClosedLoopControlTerrain.tsx`](components/ClosedLoopControlTerrain.tsx) (canvas), [`pages/Home.tsx`](pages/Home.tsx) (caption) |
| Selected work / projects grid | `data/projects.ts` | [`components/WorkCards.tsx`](components/WorkCards.tsx) |
| Project detail + "More work" list | `data/projects.ts` | [`pages/ProjectDetail.tsx`](pages/ProjectDetail.tsx), [`components/WorkList.tsx`](components/WorkList.tsx) |
| Experience | `data/experience.ts` | [`components/ExperienceTimeline.tsx`](components/ExperienceTimeline.tsx) |
| About | `data/about.ts` | [`components/About.tsx`](components/About.tsx) |
| Papers | `data/papers.ts` | [`pages/Papers.tsx`](pages/Papers.tsx) |
| Gallery (+ home preview) | `data/photography.ts` | [`pages/Photography.tsx`](pages/Photography.tsx), [`pages/Home.tsx`](pages/Home.tsx) |
