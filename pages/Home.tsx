import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { photos } from '../data/photography';
import ProjectCard from '../components/ProjectCard';
import ExperienceTimeline from '../components/ExperienceTimeline';

const Home: React.FC = () => {
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
  const [displayName, setDisplayName] = useState('');
  const fullContent = "Ethan Tran";
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Get random 20 photos
  const [randomPhotos] = useState(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayName(fullContent.slice(0, i + 1));
      i++;
      if (i >= fullContent.length) {
        clearInterval(interval);
        setTimeout(() => setIsTypingDone(true), 500);
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const nextPhoto = () => {
    const maxIndex = Math.max(0, randomPhotos.length - 4);
    setCurrentPhotoIndex((prev) => prev >= maxIndex ? 0 : prev + 1);
  };

  const prevPhoto = () => {
    const maxIndex = Math.max(0, randomPhotos.length - 4);
    setCurrentPhotoIndex((prev) => prev <= 0 ? maxIndex : prev - 1);
  };

  const displayPhotos = randomPhotos;

  return (
    <div className="space-y-16 py-24">
      {/* Triho-style Hero */}
      <section className="max-w-4xl pt-8 md:pt-0 min-h-[70vh] flex flex-col justify-start">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start mb-8">
          <div className={`hidden md:flex items-start justify-start transition-opacity duration-1000 delay-300 ${isTypingDone ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-48 h-48 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
              <img src="/headshot.jpg" alt="Ethan Tran" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="col-span-1 md:col-span-3 h-[80px] md:h-[120px]">
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tighter leading-none mb-4 min-h-[1.2em]">
              {displayName}
              {!isTypingDone && <span className="cursor"></span>}
            </h1>
            <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base transition-opacity duration-1000 ${isTypingDone ? 'opacity-100' : 'opacity-0'}`}>
              <a href="https://uwaterloo.ca" target="_blank" rel="noopener noreferrer" className="mono hover:text-black dark:hover:text-white transition-colors underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2">CompEng @UWaterloo</a>
              <span className="text-zinc-200 dark:text-zinc-800">•</span>
              <span className="mono">Firmware</span>
              <span className="text-zinc-200 dark:text-zinc-800">•</span>
              <span className="mono">Product</span>
            </div>
          </div>
        </div>
        
        <ul className={`text-lg md:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mb-12 transition-all duration-1000 delay-300 space-y-3 ${isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <li className="flex gap-3">
            <span className="text-black dark:text-white font-semibold flex-shrink-0">•</span>
            <span>Passionate about building hardware and firmware that solve real-world problems</span>
          </li>
          <li className="flex gap-3">
            <span className="text-black dark:text-white font-semibold flex-shrink-0">•</span>
            <span>Work spans embedded systems, firmware, hardware design, product dev, hackathon organizing, and more</span>
          </li>
          <li className="flex gap-3">
            <span className="text-black dark:text-white font-semibold flex-shrink-0">•</span>
            <span>Feel free to reach out if you're interested in tech or building something cool!</span>
          </li>
        </ul>

        <div className={`flex items-center gap-6 transition-all duration-1000 delay-500 ${isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Link to="/projects" className="group flex items-center gap-2 text-sm font-bold tracking-tight dark:text-zinc-100">
            <span className="font-heading">VIEW WORKS</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/kofucodes" target="_blank" rel="noopener noreferrer" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.789 0-9.514h3.554v1.347c.42-.648 1.36-1.573 3.322-1.573 2.429 0 4.251 1.547 4.251 4.875v5.865zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.956.77-1.71 1.916-1.71 1.144 0 1.915.751 1.915 1.71 0 .951-.771 1.71-1.915 1.71zm1.575 11.597H3.762V9.338h3.15v11.114zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
            </a>
            <a href="mailto:e64tran@uwaterloo.ca" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </a>
            <a href="https://www.instagram.com/ethan.trrann/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110 2.881 1.44 1.44 0 010-2.881z"/></svg>
            </a>
            <a href="https://x.com/EthanT79644" target="_blank" rel="noopener noreferrer" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors">
              <span className="text-lg font-bold">𝕏</span>
            </a>
          </div>
        </div>
      </section>
      <section className={`transition-all duration-1000 delay-700 ${isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-6">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase mb-8 mono">Gallery</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={prevPhoto}
              className="flex-shrink-0 w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 overflow-hidden">
              <div 
                className="flex gap-4 transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(calc(-${currentPhotoIndex} * (25% + 4px)))` }}
              >
                {displayPhotos.map((photo) => (
                  <div key={photo.id} className="flex-shrink-0 w-[calc(25%-12px)] rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <img
                      src={photo.url}
                      alt={photo.location}
                      className="w-full h-48 object-cover"
                    />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 p-3 font-heading">
                      {photo.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextPhoto}
              className="flex-shrink-0 w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Simplified Works Section */}
      <section className={`transition-all duration-1000 delay-700 ${isTypingDone ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-12">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase mb-4 mono">Selected Projects</h2>
          <div className="grid grid-cols-1 gap-4">
            {featuredProjects.map(project => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Compact Timeline Section */}
      <section className="max-w-2xl">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-600 uppercase mb-12 mono">Experience</h2>
        <ExperienceTimeline />
      </section>
      
      {/* Final Personality Note */}
      <section className="py-12 flex justify-center">
        <p className="text-zinc-400 dark:text-zinc-600 text-sm leading-relaxed italic font-heading text-center max-w-2xl">
          Outside of work, you'll find me tinkering with mechanical keyboards, behind a lens capturing urban architecture, or trying to achieve the perfect 40-line Tetris sprint.
        </p>
      </section>
    </div>
  );
};

export default Home;