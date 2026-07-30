export type PaperStatus = 'Idea' | 'In progress' | 'Drafting' | 'Preprint';

export interface Paper {
  slug: string;
  title: string;
  status: PaperStatus;
  areas: string[];
  timeframe: string;
  description: string;
  links?: { label: string; href: string }[];
}

/**
 * Upcoming / in-flight research. Empty for now — the page shows a
 * "coming soon" state until something lands here. Newest first.
 *
 * Template:
 * {
 *   slug: 'short-url-safe-id',
 *   title: 'Working Title',
 *   status: 'Idea',            // 'Idea' | 'In progress' | 'Drafting' | 'Preprint'
 *   areas: ['Controls', 'Embedded'],
 *   timeframe: '2026',
 *   description: 'One or two sentences on the question being explored.',
 *   links: [{ label: 'Preprint', href: 'https://…' }],
 * }
 */
export const papers: Paper[] = [];
