import React, { useMemo, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { photos } from '../data/photography';
import { Project } from '../types';
import ExperienceTimeline from '../components/ExperienceTimeline';
import WorkCards from '../components/WorkCards';
import About from '../components/About';
import Brand from '../components/Brand';
import TypedName from '../components/TypedName';
import Reveal from '../components/Reveal';
import ProjectModal from '../components/ProjectModal';
import ThemeToggle from '../components/ThemeToggle';
import SpotifyStatus from '../components/SpotifyStatus';
import Aperture from '../components/Aperture';
import LinkPreview from '../components/LinkPreview';

// Heavy (three.js) — code-split so it doesn't block the initial page load.
const ClosedLoopControlTerrain = lazy(() => import('../components/ClosedLoopControlTerrain'));

const quietLink =
  'text-[13px] lowercase text-stone-500 dark:text-stone-400 underline decoration-stone-300 dark:decoration-stone-700 underline-offset-[3px] hover:text-stone-900 dark:hover:text-stone-100 hover:decoration-stone-500 transition-colors';

/** Quiet section marker: lowercase mono, muted, trailing em dash. */
const QuietHeader: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <div className="mb-4 flex items-baseline gap-4">
    <h2 className="mono text-[12px] lowercase tracking-wider text-stone-400 dark:text-stone-500">
      {label} —
    </h2>
    {children}
  </div>
);

type Filter = 'all' | 'software' | 'hardware';

// Unbiased Fisher–Yates shuffle.
const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const Home: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [galleryPreview] = useState(() => shuffle(photos).slice(0, 6));

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        const kind = p.kind ?? 'both';
        return filter === 'all' || kind === filter || kind === 'both';
      }),
    [filter]
  );

  const filterButton = (value: Exclude<Filter, 'all'>) => (
    <button
      aria-pressed={filter === value}
      onClick={() => setFilter(filter === value ? 'all' : value)}
      className={`mono text-[12px] lowercase transition-colors ${
        filter === value
          ? 'text-amber-700 dark:text-amber-500 underline underline-offset-[3px]'
          : 'text-stone-400 dark:text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
      }`}
    >
      {value}
    </button>
  );

  return (
    <div className="grid min-h-screen lg:h-screen lg:overflow-hidden grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* ── Left panel: identity (sticky on desktop) ── */}
      <aside className="flex flex-col p-8 pt-12 lg:p-14 lg:h-full lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <div>
          <section className="reveal" style={{ animationDelay: '0s' }}>
            {/* nowrap + clamp sized so the full "hey, i'm …" string never wraps mid-animation */}
            <TypedName className="whitespace-nowrap text-[clamp(1.7rem,0.9rem+1.75vw,2.4rem)]" />
            <div className="w-full max-w-md h-px bg-stone-200 dark:bg-stone-800 my-5" />
            <p className="text-[14px] text-stone-600 dark:text-stone-300">
              computer engineering @{' '}
              <Brand name="University of Waterloo" label="UWaterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" />
            </p>
            <p className="text-[14px] leading-relaxed text-stone-600 dark:text-stone-300 mt-2">
              from firmware to PCBs to shipped hackathon builds — I love building hardware that
              feels like software and software that feels like hardware.
            </p>
          </section>

          {/* Links row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-6 reveal" style={{ animationDelay: '0.08s' }}>
            <LinkPreview href="https://github.com/kofucodes" title="GitHub" domain="github.com" className={quietLink}>
              github
            </LinkPreview>
            <LinkPreview href="https://linkedin.com/in/ethantrann" title="LinkedIn" domain="linkedin.com" className={quietLink}>
              linkedin
            </LinkPreview>
            <LinkPreview href="https://www.instagram.com/ethan.trrann/" title="Instagram" domain="instagram.com" className={quietLink}>
              instagram
            </LinkPreview>
            <a href="mailto:e64tran@uwaterloo.ca" className={quietLink}>
              email
            </a>
            <a href="/Ethan_Tran_Resume.pdf" target="_blank" rel="noopener noreferrer" className={quietLink}>
              resume
            </a>
            <Link to="/papers" className={quietLink}>
              papers
            </Link>
            <Link to="/photography" className={quietLink}>
              gallery
            </Link>
            <span className="ml-auto opacity-70">
              <ThemeToggle />
            </span>
          </div>

          {/* Experience */}
          <section className="mt-10 reveal" style={{ animationDelay: '0.16s' }}>
            <QuietHeader label="experience" />
            <ExperienceTimeline />
          </section>
        </div>

        {/* Bottom: now playing + copyright (desktop only — on mobile this would
            land mid-page between experience and the terrain) */}
        <div className="hidden lg:block mt-auto pt-10 reveal" style={{ animationDelay: '0.24s' }}>
          <div className="-ml-1.5 mb-3">
            <SpotifyStatus />
          </div>
          <p className="text-[12.5px] text-stone-400 dark:text-stone-500 select-none">
            © {new Date().getFullYear()} Ethan Tran · Waterloo, ON
          </p>
        </div>
      </aside>

      {/* ── Right panel: terrain, about, projects, gallery (scrolls) ── */}
      <div className="p-8 lg:p-14 lg:h-full lg:overflow-y-auto lg:border-l lg:border-stone-200 dark:lg:border-stone-800">
        {/* Terrain masthead */}
        <section className="reveal" style={{ animationDelay: '0.12s' }}>
          <div className="h-[clamp(280px,38vh,400px)] w-full">
            <Suspense fallback={<div className="h-full w-full" />}>
              <ClosedLoopControlTerrain />
            </Suspense>
          </div>
          <p className="mt-3 text-center text-[12.5px] italic text-stone-400 dark:text-stone-500">
            I'm always self-adjusting to the targeted goal
          </p>
        </section>

        {/* About */}
        <Reveal className="mt-12">
          <section>
            <QuietHeader label="about" />
            <About />
          </section>
        </Reveal>

        {/* Projects */}
        <Reveal className="mt-12">
          <section>
            <QuietHeader label="projects">
              {filterButton('software')}
              {filterButton('hardware')}
            </QuietHeader>
            {filteredProjects.length > 0 ? (
              <WorkCards projects={filteredProjects} onOpen={setSelectedProject} />
            ) : (
              <p className="mono text-[12px] text-stone-400 dark:text-stone-500 py-8 text-center">
                nothing here yet.
              </p>
            )}
          </section>
        </Reveal>

        {/* Gallery preview */}
        <Reveal className="mt-12">
          <section className="group">
            <QuietHeader label="gallery">
              <Aperture className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 self-center" animate />
              <Link
                to="/photography"
                className="ml-auto text-[13px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
              >
                view all →
              </Link>
            </QuietHeader>
            <div className="grid grid-cols-3 gap-2">
              {galleryPreview.map((photo) => (
                <Link
                  key={photo.id}
                  to="/photography"
                  className="relative aspect-square overflow-hidden rounded-md ring-1 ring-inset ring-black/5 dark:ring-white/10"
                  title={`${photo.location} · ${photo.year}`}
                >
                  <img
                    src={photo.url}
                    alt={photo.location}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </Link>
              ))}
            </div>
          </section>
        </Reveal>

        {/* Mobile-only footer (the aside footer is hidden below lg) */}
        <div className="lg:hidden mt-12">
          <div className="-ml-1.5 mb-3">
            <SpotifyStatus />
          </div>
          <p className="text-[12.5px] text-stone-400 dark:text-stone-500 select-none">
            © {new Date().getFullYear()} Ethan Tran · Waterloo, ON
          </p>
        </div>
      </div>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};

export default Home;
