
export type Category = 'Embedded/Firmware' | 'Hardware' | 'Web/App' | 'Hackathons';

export interface Project {
  slug: string;
  title: string;
  year: string;
  category: Category | Category[];
  summary: string;
  description: string;
  bullets: string[];
  tags: string[];
  links: {
    github?: string;
    demo?: string;
    website?: string;
  };
  featured: boolean;
  content: {
    problem: string;
    solution: string;
    build: string;
    learned: string;
    video?: string;
    buildImage?: string;
    finishedImage?: string;
  };
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  period: string;
  /** Kept as reference material (resume, future detail views) — not rendered on the home page. */
  bullets?: string[];
  /** Optional logo: a website domain (favicon) or a local /public/logos asset. */
  domain?: string;
  logo?: string;
  link?: string;
}

/**
 * One inline piece of an about line. Mix and match, in order:
 *   'plain text'                             — rendered as-is
 *   { emoji: '📷' }                          — an emoji icon
 *   { domain: 'nvidia.com', name: 'NVIDIA' } — brand icon (site favicon) + name, kept on one line
 *   { src: '/logos/x.png', name: 'X' }       — same, from a local asset
 *   { text: 'gallery', to: '/photography' }  — an internal link
 *
 * The `?: never` matrix keeps the arms mutually exclusive, so a mis-authored
 * part (e.g. emoji + domain together, or a link missing its text) is a compile
 * error instead of silently rendering the wrong branch.
 */
export type AboutPart =
  | string
  | { emoji: string; domain?: never; src?: never; name?: never; text?: never; to?: never }
  | { domain: string; src?: string; name?: string; emoji?: never; text?: never; to?: never }
  | { src: string; name: string; domain?: never; emoji?: never; text?: never; to?: never }
  | { text: string; to: string; emoji?: never; domain?: never; src?: never; name?: never };

export interface AboutItem {
  parts: AboutPart[];
  /** Optional indented "↳" sub-line rendered under the item. */
  sub?: AboutPart[];
}
