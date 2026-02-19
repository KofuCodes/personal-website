import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { photos } from '../data/photography';
import ProjectCard from '../components/ProjectCard';
import ExperienceTimeline from '../components/ExperienceTimeline';

import InteractivePolaroid from '../components/InteractivePolaroid';

const Home: React.FC = () => {
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3);
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  
  // Get random 20 photos
  const [randomPhotos] = useState(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 20);
  });

  // Generate random rotations for each polaroid
  const [polaroidRotations] = useState(() => 
    randomPhotos.map(() => (Math.random() - 0.5) * 6)
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Polaroid development effect
  useEffect(() => {
    // Simulate Polaroid development time (about 2 seconds)
    const timer = setTimeout(() => {
      setIsDeveloped(true);
    }, 100); // Start developing immediately
    return () => clearTimeout(timer);
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
    <>
      <div className="space-y-16 py-12 md:py-24 relative z-10">
      {/* Triho-style Hero */}
      <section className="max-w-5xl pt-0 md:pt-0 min-h-[70vh] flex flex-col justify-start">
        {/* New Layout: Image with caption on left, text on right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-8 polaroid-develop">
          {/* Left: Polaroid with caption */}
          <div className="flex flex-col items-center md:items-start">
            <InteractivePolaroid
              photo={{
                id: 'headshot',
                url: '/headshot.jpg',
                location: 'Ethan Tran',
                year: '2025'
              }}
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
                      Computer Engineering @<br />
                      University of Waterloo
                    </p>
                  </div>
                </>
              }
            />
          </div>

          {/* Right: Description text */}
          <div className="flex flex-col justify-center space-y-4">
            <ul className="text-base md:text-xl text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed space-y-4">
              <li className="flex gap-3">
                <span className="text-[#2a2318] dark:text-[#f5e6d3] font-semibold flex-shrink-0">•</span>
                <span>Hello! I'm a Computer Engineering student passionate about building impactful software and hardware solutions. Take your time looking around</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#2a2318] dark:text-[#f5e6d3] font-semibold flex-shrink-0">•</span>
                <span>Currently I enjoy doing hardware/software projects, hackathons, and taking pictures of the beautiful scenery.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#2a2318] dark:text-[#f5e6d3] font-semibold flex-shrink-0">•</span>
                <span>Feel free to reach out if you're interested in tech or building something cool!</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="flex items-center gap-6 polaroid-develop" style={{ animationDelay: '0.3s' }}>
          <Link to="/projects" className="group flex items-center gap-2 text-sm font-bold tracking-tight text-[#2a2318] dark:text-[#f5e6d3]">
            <span className="font-heading">VIEW WORKS</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <div className="h-4 w-[1px] bg-[#c4a882] dark:bg-[#6b5744]"></div>
          <div className="flex items-center gap-4">
            <a href="https://github.com/kofucodes" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.731-2.004 1.438-.103.25-.129.599-.129.948v5.419h-3.554s.05-8.789 0-9.514h3.554v1.347c.42-.648 1.36-1.573 3.322-1.573 2.429 0 4.251 1.547 4.251 4.875v5.865zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.956.77-1.71 1.916-1.71 1.144 0 1.915.751 1.915 1.71 0 .951-.771 1.71-1.915 1.71zm1.575 11.597H3.762V9.338h3.15v11.114zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>
            </a>
            <a href="mailto:e64tran@uwaterloo.ca" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </a>
            <a href="https://www.instagram.com/ethan.trrann/" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 110 2.881 1.44 1.44 0 010-2.881z"/></svg>
            </a>
            <a href="https://x.com/EthanT79644" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors">
              <span className="text-lg font-bold">𝕏</span>
            </a>
          </div>
        </div>
      </section>
      <section className="polaroid-develop" style={{ animationDelay: '0.7s' }}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] uppercase mono">Gallery</h2>
            <Link to="/photography" className="group flex items-center gap-2 text-sm font-bold tracking-tight text-[#2a2318] dark:text-[#f5e6d3]">
              <span className="font-heading">VIEW GALLERY</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
          
          {/* Mobile: Single photo view */}
          <div className="md:hidden">
            <div className="relative">
              <InteractivePolaroid
                photo={displayPhotos[currentPhotoIndex]}
                rotation={polaroidRotations[currentPhotoIndex]}
              />
              
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => prev <= 0 ? displayPhotos.length - 1 : prev - 1)}
                  className="p-2 rounded-full bg-[#d4a574] dark:bg-[#8B7355] text-[#2a2318] dark:text-[#f5e6d3] hover:bg-[#c4a882] dark:hover:bg-[#6b5744] transition-colors shadow-md"
                  aria-label="Previous photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <span className="text-sm text-[#6b5744] dark:text-[#a1785d] mono">
                  {currentPhotoIndex + 1} / {displayPhotos.length}
                </span>
                
                <button
                  onClick={() => setCurrentPhotoIndex((prev) => prev >= displayPhotos.length - 1 ? 0 : prev + 1)}
                  className="p-2 rounded-full bg-[#d4a574] dark:bg-[#8B7355] text-[#2a2318] dark:text-[#f5e6d3] hover:bg-[#c4a882] dark:hover:bg-[#6b5744] transition-colors shadow-md"
                  aria-label="Next photo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop: Carousel view */}
          <div className="hidden md:flex items-center gap-4 -mx-16">
            <button
              onClick={prevPhoto}
              className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#c4a882] dark:border-[#6b5744] flex items-center justify-center hover:bg-[#d4a574] dark:hover:bg-[#6b5744] transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex-1 overflow-x-hidden overflow-y-visible py-6">
              <div 
                className="flex gap-4 transition-transform duration-500 ease-in-out items-center"
                style={{ transform: `translateX(calc(-${currentPhotoIndex} * (25% + 4px)))` }}
              >
                {displayPhotos.map((photo, index) => (
                  <div key={photo.id} className="flex-shrink-0 w-[calc(25%-12px)]">
                    <InteractivePolaroid
                      photo={photo}
                      rotation={polaroidRotations[index]}
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={nextPhoto}
              className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-[#c4a882] dark:border-[#6b5744] flex items-center justify-center hover:bg-[#d4a574] dark:hover:bg-[#6b5744] transition-colors shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Simplified Works Section */}
      <section className="polaroid-develop" style={{ animationDelay: '0.9s' }}>
        <div className="mb-12">
          <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] uppercase mb-4 mono">Selected Projects</h2>
          <div className="grid grid-cols-1 gap-4">
            {featuredProjects.map(project => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Compact Timeline Section */}
      <section className="max-w-2xl">
        <h2 className="text-[11px] font-bold tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] uppercase mb-12 mono">Experience</h2>
        <ExperienceTimeline />
      </section>
      
      {/* Final Personality Note */}
      <section className="py-12 flex justify-center">
        <p className="text-[#6b5744] dark:text-[#a1785d] text-sm leading-relaxed handwritten text-lg text-center max-w-2xl">
          Outside of work, you'll find me tinkering with mechanical keyboards, behind a lens capturing urban architecture, or trying to achieve the perfect 40-line Tetris sprint.
        </p>
      </section>
    </div>
    </>
  );
};

export default Home;