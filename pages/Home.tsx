import React, { useState, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { photos } from '../data/photography';
import ExperienceTimeline from '../components/ExperienceTimeline';
import WorkList from '../components/WorkList';
import Brand from '../components/Brand';
import Aperture from '../components/Aperture';

// Heavy (three.js) — code-split so it doesn't block the initial page load.
const ClosedLoopControlTerrain = lazy(() => import('../components/ClosedLoopControlTerrain'));

const socials = [
  {
    name: 'GitHub',
    href: 'https://github.com/kofucodes',
    path: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/in/ethantrann',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.789 0-9.514h3.554v1.347c.42-.648 1.36-1.573 3.322-1.573 2.429 0 4.251 1.547 4.251 4.875v5.865zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.956.77-1.71 1.916-1.71 1.144 0 1.915.751 1.915 1.71 0 .951-.771 1.71-1.915 1.71zm1.575 11.597H3.762V9.338h3.15v11.114zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/ethan.trrann/',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110 2.881 1.44 1.44 0 010-2.881z',
  },
];

const Home: React.FC = () => {
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 4);

  const [galleryPreview] = useState(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  });

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      {/* ── Hero ── */}
      <section className="reveal" style={{ animationDelay: '0s' }}>
        <div className="flex items-center gap-4 mb-7">
          <img
            src="/headshot.jpg"
            alt="Ethan Tran"
            className="w-28 h-28 rounded-2xl object-cover ring-1 ring-inset ring-black/5 dark:ring-white/10"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Ethan Tran</h1>
            <p className="text-[14px] text-neutral-500 dark:text-neutral-400 mt-0.5">
              Computer Engineering ·{' '}
              <Brand name="University of Waterloo" label="Waterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" />
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p>
            Computer Engineering student at{' '}
            <Brand name="University of Waterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" />, building
            hardware that feels like software and software that feels like hardware.
          </p>
          <p>
            Most of my time goes to embedded systems and firmware — usually around an{' '}
            <Brand name="Arduino" domain="arduino.cc" href="https://www.arduino.cc" /> and a soldering iron — plus
            the occasional hackathon with friends.
          </p>
          <p>
            Off the keyboard, I shoot urban architecture and travel on a Sony Cybershot. The{' '}
            <Link to="/photography" className="font-medium underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-[3px] hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors">gallery</Link>{' '}
            is where my favorite frames live.
          </p>
        </div>

        <div className="flex items-center gap-1 mt-6">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="w-8 h-8 grid place-items-center rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                <path d={s.path} />
              </svg>
            </a>
          ))}
          <a
            href="mailto:e64tran@uwaterloo.ca"
            aria-label="Email"
            className="w-8 h-8 grid place-items-center rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Signature: closed-loop control over terrain ── */}
      <section className="mt-12 reveal" style={{ animationDelay: '0.08s' }}>
        <div className="h-80 w-full">
          <Suspense fallback={<div className="h-full w-full" />}>
            <ClosedLoopControlTerrain />
          </Suspense>
        </div>
      </section>

      {/* ── Selected Work ── */}
      <section className="mt-16 reveal" style={{ animationDelay: '0.14s' }}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Selected work</h2>
          <Link to="/projects" className="text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            All work →
          </Link>
        </div>
        <WorkList projects={featuredProjects} />
      </section>

      {/* ── Experience ── */}
      <section className="mt-16 reveal" style={{ animationDelay: '0.16s' }}>
        <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2">Experience</h2>
        <ExperienceTimeline />
      </section>

      {/* ── Gallery preview ── */}
      <section className="mt-16 reveal group" style={{ animationDelay: '0.24s' }}>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-2">
            <Aperture className="w-3.5 h-3.5" animate /> Gallery
          </h2>
          <Link to="/photography" className="text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
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

      {/* ── Closing note ── */}
      <p className="mt-16 text-[14px] leading-relaxed text-neutral-500 dark:text-neutral-400 reveal" style={{ animationDelay: '0.32s' }}>
        Outside of work you'll find me tuning mechanical keyboards, chasing clean architecture shots, or grinding a
        40-line Tetris sprint.
      </p>
    </div>
  );
};

export default Home;
