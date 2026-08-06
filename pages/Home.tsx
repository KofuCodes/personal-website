import React, { useMemo, useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { photos } from '../data/photography';
import { Project } from '../types';
import WorkCards from '../components/WorkCards';
import About from '../components/About';
import Reveal from '../components/Reveal';
import ProjectModal from '../components/ProjectModal';
import QuietHeader from '../components/QuietHeader';
import Aperture from '../components/Aperture';

// Heavy (three.js) — code-split so it doesn't block the initial page load.
const ClosedLoopControlTerrain = lazy(() => import('../components/ClosedLoopControlTerrain'));

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

/** Right-panel content for the index page — the identity panel lives in the app shell. */
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
          ? 'text-orange-700 dark:text-coral underline underline-offset-[3px]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
      }`}
    >
      {value}
    </button>
  );

  return (
    <>
      {/* Terrain masthead */}
      <section className="reveal" style={{ animationDelay: '0.12s' }}>
        <div className="h-[clamp(280px,38vh,400px)] w-full">
          <Suspense fallback={<div className="h-full w-full" />}>
            <ClosedLoopControlTerrain />
          </Suspense>
        </div>
        <p className="mt-3 text-center text-[12.5px] italic text-stone-500 dark:text-stone-400">
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
              view all ➢
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

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
};

export default Home;
