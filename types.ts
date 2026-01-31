
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
  bullets: string[];
}
