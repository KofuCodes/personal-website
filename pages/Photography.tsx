
import React, { useState, useEffect, useMemo } from 'react';
import { photos } from '../data/photography';
import ReactBitsBackground from '../components/ReactBitsBackground';
import InteractivePolaroid from '../components/InteractivePolaroid';

const Photography: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentIndices, setCurrentIndices] = useState<{ [key: string]: number }>({});

  // Pre-compute stable random rotations for each photo to avoid jitter on re-render
  const photoRotations = useMemo(() => {
    const rotations: { [key: string]: number } = {};
    photos.forEach(photo => {
      rotations[photo.id] = (Math.random() - 0.5) * 6;
    });
    return rotations;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const goToPhoto = (groupTitle: string, index: number, total: number) => {
    setCurrentIndices(prev => ({
      ...prev,
      [groupTitle]: (index + total) % total
    }));
  };

  // Group photos by location and year
  const groupedPhotos = useMemo(() => {
    const groups: { [key: string]: typeof photos } = {};

    photos.forEach(photo => {
      const key = `${photo.location} - ${photo.year}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(photo);
    });

    // Custom sort order: Waterloo first, then San Francisco, then others by year
    const priorityOrder = ['Waterloo, Ontario', 'San Francisco, California'];

    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const locationA = a.split(' - ')[0];
      const locationB = b.split(' - ')[0];
      const yearA = a.split(' - ')[1];
      const yearB = b.split(' - ')[1];

      const priorityA = priorityOrder.indexOf(locationA);
      const priorityB = priorityOrder.indexOf(locationB);

      // If both have priority, sort by priority then year
      if (priorityA !== -1 && priorityB !== -1) {
        if (priorityA !== priorityB) return priorityA - priorityB;
        return yearB.localeCompare(yearA);
      }
      // If only A has priority, A comes first
      if (priorityA !== -1) return -1;
      // If only B has priority, B comes first
      if (priorityB !== -1) return 1;
      // Otherwise sort by year (descending) then location
      if (yearA !== yearB) return yearB.localeCompare(yearA);
      return a.localeCompare(b);
    });

    return sortedKeys.map(key => ({
      title: key,
      photos: groups[key]
    }));
  }, []);

  return (
    <>
      <ReactBitsBackground />
      <div className="py-24 max-w-6xl mx-auto px-4 relative z-10">
        <header className="mb-20">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6 text-[#2a2318] dark:text-[#f5e6d3]">Gallery</h1>
          <p className="text-[#6b5744] dark:text-[#a1785d] text-lg leading-relaxed max-w-xl handwritten text-2xl">
            My story, through my lens.
          </p>
        </header>

        <div className="space-y-20">
          {groupedPhotos.map((group, groupIndex) => (
            <section key={group.title}>
              <h2 className="text-2xl handwritten font-bold mb-8 text-[#3d2f1f] dark:text-[#d4a574]">
                {group.title}
              </h2>

              {/* Mobile: Single photo carousel */}
              <div className="md:hidden">
                {(() => {
                  const currentIndex = currentIndices[group.title] || 0;
                  const photo = group.photos[currentIndex];
                  return (
                    <div className="relative">
                      <div
                        className={`${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} transition-all duration-500 ease-out`}
                      >
                        <InteractivePolaroid
                          photo={photo}
                          rotation={photoRotations[photo.id] || 0}
                          imageClassName="w-full aspect-square object-cover sepia-[0.2] contrast-[1.1]"
                        />
                      </div>

                      {/* Navigation */}
                      <div className="flex items-center justify-between mt-6">
                        <button
                          onClick={() => goToPhoto(group.title, currentIndex - 1, group.photos.length)}
                          className="p-2 rounded-full bg-[#d4a574] dark:bg-[#8B7355] text-[#2a2318] dark:text-[#f5e6d3] hover:bg-[#c4a882] dark:hover:bg-[#6b5744] transition-colors shadow-md"
                          aria-label="Previous photo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <span className="text-sm text-[#6b5744] dark:text-[#a1785d] mono">
                          {currentIndex + 1} / {group.photos.length}
                        </span>

                        <button
                          onClick={() => goToPhoto(group.title, currentIndex + 1, group.photos.length)}
                          className="p-2 rounded-full bg-[#d4a574] dark:bg-[#8B7355] text-[#2a2318] dark:text-[#f5e6d3] hover:bg-[#c4a882] dark:hover:bg-[#6b5744] transition-colors shadow-md"
                          aria-label="Next photo"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Desktop: Grid layout with Polaroid frames */}
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {group.photos.map((photo, index) => {
                  const delay = Math.min(index * 30, 300);
                  // Random slight rotation for each Polaroid
                  const rotation = photoRotations[photo.id] || 0;
                  return (
                    <div
                      key={photo.id}
                      className={`${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} transition-all duration-500 ease-out`}
                      style={{
                        transitionDelay: `${delay}ms`
                      }}
                    >
                      <InteractivePolaroid
                        photo={photo}
                        rotation={rotation}
                        imageClassName="w-full aspect-square object-cover sepia-[0.2] contrast-[1.1]"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-32 text-center py-12 border-t-2 border-[#c4a882] dark:border-[#6b5744]">
          <p className="text-[#8B7355] dark:text-[#a1785d] text-sm handwritten text-2xl tracking-wide">End of Collection</p>
        </footer>
      </div>
    </>
  );
};

export default Photography;

