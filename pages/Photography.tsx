
import React, { useState, useEffect, useMemo } from 'react';
import { photos } from '../data/photography';

const Photography: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentIndices, setCurrentIndices] = useState<{ [key: string]: number }>({});

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
    <div className="py-24 max-w-6xl mx-auto px-4">
      <header className="mb-20">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">Gallery</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed max-w-xl">
          My story, through my lens.
        </p>
      </header>

      <div className="space-y-20">
        {groupedPhotos.map((group, groupIndex) => (
          <section key={group.title}>
            <h2 className="text-xl font-heading font-bold mb-8 text-zinc-900 dark:text-zinc-100">
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
                      <div className="relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 aspect-square">
                        <img 
                          src={photo.url} 
                          alt={`${photo.location} ${photo.year}`}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => goToPhoto(group.title, currentIndex - 1, group.photos.length)}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        aria-label="Previous photo"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      <span className="text-sm text-zinc-500 dark:text-zinc-400 mono">
                        {currentIndex + 1} / {group.photos.length}
                      </span>
                      
                      <button
                        onClick={() => goToPhoto(group.title, currentIndex + 1, group.photos.length)}
                        className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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

            {/* Desktop: Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.photos.map((photo, index) => {
                const delay = Math.min(index * 30, 300);
                return (
                  <div 
                    key={photo.id} 
                    className={`group ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'} transition-all duration-500 ease-out`}
                    style={{ transitionDelay: `${delay}ms` }}
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 aspect-square">
                      <img 
                        src={photo.url} 
                        alt={`${photo.location} ${photo.year}`}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-32 text-center py-12 border-t border-zinc-100 dark:border-zinc-900">
        <p className="text-zinc-300 dark:text-zinc-800 text-xs mono uppercase tracking-[0.2em]">End of Collection</p>
      </footer>
    </div>
  );
};

export default Photography;
