import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { photos } from '../data/photography';
import ExperienceTimeline from '../components/ExperienceTimeline';
import InteractivePolaroid from '../components/InteractivePolaroid';

const Home: React.FC = () => {
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [randomPhotos] = useState(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  });

  const [polaroidRotations] = useState(() =>
    randomPhotos.map(() => (Math.random() - 0.5) * 6)
  );

  // Project card tilt angles — small random rotations like real polaroids
  const [projectRotations] = useState(() =>
    featuredProjects.map((_, i) => {
      const base = [-2.5, 1.8, -1.2];
      return base[i] ?? (Math.random() - 0.5) * 4;
    })
  );

  const nextPhoto = () => {
    const maxIndex = Math.max(0, randomPhotos.length - 4);
    setCurrentPhotoIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevPhoto = () => {
    const maxIndex = Math.max(0, randomPhotos.length - 4);
    setCurrentPhotoIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  // Pastel polaroid tints — soft random coloring per card like real polaroid frames
  const pastelColors = [
    { bg: '#f0e0f0', dark: '#d4b8d4', tape: '#e8a0c8', tapeAngle: -12 },  // lavender
    { bg: '#f5f0d0', dark: '#e0d8a8', tape: '#e84080', tapeAngle: 0 },     // cream-yellow
    { bg: '#d8e8f5', dark: '#b8d0e8', tape: '#a0d840', tapeAngle: 8 },     // sky blue
    { bg: '#d8f0d8', dark: '#b0d8b0', tape: '#4080e0', tapeAngle: -15 },   // mint
    { bg: '#f5d8e0', dark: '#e0b8c8', tape: '#a040c0', tapeAngle: 5 },     // pink
    { bg: '#f0dcd0', dark: '#d8c0a8', tape: '#e8a020', tapeAngle: -8 },    // peach
  ];

  const [projectColors] = useState(() =>
    featuredProjects.map((_, i) => pastelColors[i % pastelColors.length])
  );

  // Category tag color mapping
  const categoryColors: Record<string, string> = {
    'Embedded/Firmware': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
    'Hardware': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
    'Web/App': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
    'Hackathons': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
  };

  return (
    <>
      <div className="space-y-20 py-12 md:py-24 relative z-10">

        {/* ── Hero ── */}
        <section className="min-h-[70vh] flex flex-col justify-start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-8 polaroid-develop">
            {/* Headshot polaroid */}
            <div className="flex flex-col items-center md:items-start">
              <InteractivePolaroid
                photo={{ id: 'headshot', url: '/headshot.jpg', location: 'Ethan Tran', year: '2025' }}
                rotation={-2}
                imageClassName="w-64 h-64 md:w-80 md:h-80 object-cover sepia-[0.15]"
                backText="my foggy golden gate bridge picture ;("
                customCaption={
                  <>
                    <div className="absolute bottom-1 left-3 text-left">
                      <p className="handwritten text-2xl md:text-3xl text-[#2a2318] dark:text-[#3d2f1f]">Ethan Tran</p>
                    </div>
                    <div className="absolute bottom-0 right-2 text-right pb-1">
                      <p className="handwritten text-xs md:text-sm text-[#6b5744] dark:text-[#8B7355] leading-tight whitespace-nowrap">
                        Computer Engineering @<br />University of Waterloo
                      </p>
                    </div>
                  </>
                }
              />
            </div>

            {/* Intro text */}
            <div className="flex flex-col justify-center space-y-4">
              <ul className="text-base md:text-xl text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed space-y-4">
                <li className="flex gap-3">
                  <span className="text-[#2a2318] dark:text-[#f5e6d3] font-semibold flex-shrink-0">•</span>
                  <span>Hello! I'm a Computer Engineering student passionate about building impactful software and hardware solutions. Take your time looking around.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#2a2318] dark:text-[#f5e6d3] font-semibold flex-shrink-0">•</span>
                  <span>I enjoy hardware/software projects, hackathons, and capturing beautiful scenery through a lens.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#2a2318] dark:text-[#f5e6d3] font-semibold flex-shrink-0">•</span>
                  <span>Feel free to reach out if you're interested in tech or building something cool!</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-6 polaroid-develop" style={{ animationDelay: '0.3s' }}>
            <Link to="/projects" className="group flex items-center gap-2 text-sm font-bold tracking-tight text-[#2a2318] dark:text-[#f5e6d3]">
              <span className="handwritten text-lg">View Works</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <div className="h-4 w-[1px] bg-[#c4a882] dark:bg-[#6b5744]" />
            <div className="flex items-center gap-4">
              <a href="https://github.com/kofucodes" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
              </a>
              <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.789 0-9.514h3.554v1.347c.42-.648 1.36-1.573 3.322-1.573 2.429 0 4.251 1.547 4.251 4.875v5.865zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.956.77-1.71 1.916-1.71 1.144 0 1.915.751 1.915 1.71 0 .951-.771 1.71-1.915 1.71zm1.575 11.597H3.762V9.338h3.15v11.114zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
              </a>
              <a href="mailto:e64tran@uwaterloo.ca" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </a>
              <a href="https://www.instagram.com/ethan.trrann/" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110 2.881 1.44 1.44 0 010-2.881z" /></svg>
              </a>
              <a href="https://x.com/EthanT79644" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
                <span className="text-lg font-bold">𝕏</span>
              </a>
            </div>
          </div>
        </section>

        {/* ── Gallery ── */}
        <section className="polaroid-develop" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] uppercase mono">Gallery</h2>
            <Link to="/photography" className="group flex items-center gap-2 text-sm font-bold tracking-tight text-[#2a2318] dark:text-[#f5e6d3]">
              <span className="handwritten text-lg">View Gallery</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <InteractivePolaroid
              photo={randomPhotos[currentPhotoIndex]}
              rotation={polaroidRotations[currentPhotoIndex]}
              imageClassName="w-full aspect-square object-cover sepia-[0.2] contrast-[1.1]"
            />
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setCurrentPhotoIndex((p) => (p <= 0 ? randomPhotos.length - 1 : p - 1))} className="p-2 rounded-full bg-[#d4a574] dark:bg-[#8B7355] text-[#2a2318] shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <span className="text-sm text-[#6b5744] dark:text-[#a1785d] mono">{currentPhotoIndex + 1} / {randomPhotos.length}</span>
              <button onClick={() => setCurrentPhotoIndex((p) => (p >= randomPhotos.length - 1 ? 0 : p + 1))} className="p-2 rounded-full bg-[#d4a574] dark:bg-[#8B7355] text-[#2a2318] shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Desktop carousel */}
          <div className="hidden md:flex items-center gap-4 -mx-16">
            <button onClick={prevPhoto} className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#c4a882] dark:border-[#6b5744] flex items-center justify-center hover:bg-[#d4a574] dark:hover:bg-[#6b5744] transition-colors shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex-1 overflow-x-hidden overflow-y-visible py-6">
              <div className="flex gap-4 transition-transform duration-500 ease-in-out items-center" style={{ transform: `translateX(calc(-${currentPhotoIndex} * (25% + 4px)))` }}>
                {randomPhotos.map((photo, index) => (
                  <div key={photo.id} className="flex-shrink-0 w-[calc(25%-12px)]">
                    <InteractivePolaroid photo={photo} rotation={polaroidRotations[index]} />
                  </div>
                ))}
              </div>
            </div>
            <button onClick={nextPhoto} className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#c4a882] dark:border-[#6b5744] flex items-center justify-center hover:bg-[#d4a574] dark:hover:bg-[#6b5744] transition-colors shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </section>

        {/* ── Selected Projects — Polaroid Board ── */}
        <section className="polaroid-develop" style={{ animationDelay: '0.9s' }}>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] uppercase mono">Selected Projects</h2>
            <Link to="/projects" className="group flex items-center gap-2 text-sm font-bold tracking-tight text-[#2a2318] dark:text-[#f5e6d3]">
              <span className="handwritten text-lg">All Works</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Polaroid project cards — staggered layout */}
          <div className="relative">
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 py-4">
              {featuredProjects.map((project, i) => {
                const rotation = projectRotations[i];
                const categories = Array.isArray(project.category) ? project.category : [project.category];

                return (
                  <Link
                    key={project.slug}
                    to={`/projects/${project.slug}`}
                    className="group block transition-all duration-300 hover:scale-105 hover:z-10"
                    style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${rotation}deg)`; }}
                  >
                    {/* Polaroid card */}
                    <div
                      className="shadow-[4px_6px_18px_rgba(0,0,0,0.25)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[10px_14px_36px_rgba(0,0,0,0.4)] dark:group-hover:shadow-[10px_14px_36px_rgba(0,0,0,0.7)] group-hover:-translate-y-2 relative pt-4"
                      style={{ backgroundColor: projectColors[i].bg }}
                    >
                        {/* Photo area */}
                      <div className="mx-3 mb-0 overflow-hidden" style={{ height: '140px' }}>
                        {project.content.buildImage ? (
                          <div className="w-full h-full relative">
                            <img
                              src={project.content.buildImage}
                              alt={project.title}
                              className="w-full h-full object-cover sepia-[0.15] contrast-[1.05] group-hover:sepia-0 group-hover:contrast-100 transition-all duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black/30 to-transparent" />
                            <div className="absolute bottom-2 left-3">
                              <span className="mono text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow">{project.year}</span>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="w-full h-full sepia-[0.3] group-hover:sepia-[0.1] transition-all duration-500"
                            style={{
                              background: [
                                'linear-gradient(135deg, #d4a574 0%, #c4a882 40%, #8B7355 100%)',
                                'linear-gradient(135deg, #8B7355 0%, #d4a574 50%, #c4a882 100%)',
                                'linear-gradient(135deg, #c4a882 0%, #8B7355 40%, #d4a574 100%)',
                              ][i % 3],
                            }}
                          >
                            <div className="h-full flex items-end p-3">
                              <span className="mono text-[10px] font-bold text-white/80 uppercase tracking-widest">{project.year}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Caption area */}
                      <div className="px-4 pt-3 pb-5 min-h-[110px] flex flex-col justify-between">
                        <div>
                          <p className="handwritten text-xl text-[#2a2318] leading-tight mb-1 group-hover:opacity-80 transition-opacity">
                            {project.title}
                          </p>
                          <p className="text-[10px] mono text-[#6b5744] leading-snug line-clamp-2">
                            {project.summary}
                          </p>
                        </div>

                        {/* Category tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {categories.slice(0, 2).map(cat => (
                            <span
                              key={cat}
                              className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 mono ${categoryColors[cat] || 'bg-[#f5e6d3] text-[#6b5744]'}`}
                              style={{ borderRadius: '2px' }}
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Arrow peek at bottom */}
                      <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <svg className="w-4 h-4 text-[#8B7355]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        </section>

        {/* ── Experience ── */}
        <section className="max-w-2xl">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] uppercase mb-12 mono">Experience</h2>
          <ExperienceTimeline />
        </section>

        {/* ── Personality Note ── */}
        <section className="py-12 flex justify-center">
          <p className="text-[#6b5744] dark:text-[#a1785d] leading-relaxed handwritten text-lg text-center max-w-2xl">
            Outside of work, you'll find me tinkering with mechanical keyboards, behind a lens capturing urban architecture, or trying to achieve the perfect 40-line Tetris sprint.
          </p>
        </section>
      </div>
    </>
  );
};

export default Home;
