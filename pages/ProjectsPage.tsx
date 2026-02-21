import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { Category } from '../types';

const categories: (Category | 'All')[] = ['All', 'Embedded/Firmware', 'Hardware', 'Web/App', 'Hackathons'];

const categoryColors: Record<string, string> = {
  'Embedded/Firmware': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
  'Hardware': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
  'Web/App': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
  'Hackathons': 'bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]',
};

// Pastel polaroid tints
const pastelColors = [
  { bg: '#f0e0f0', dark: '#d4b8d4', tape: '#e8a0c8', tapeAngle: -12 },
  { bg: '#f5f0d0', dark: '#e0d8a8', tape: '#e84080', tapeAngle: 0 },
  { bg: '#d8e8f5', dark: '#b8d0e8', tape: '#a0d840', tapeAngle: 8 },
  { bg: '#d8f0d8', dark: '#b0d8b0', tape: '#4080e0', tapeAngle: -15 },
  { bg: '#f5d8e0', dark: '#e0b8c8', tape: '#a040c0', tapeAngle: 5 },
  { bg: '#f0dcd0', dark: '#d8c0a8', tape: '#e8a020', tapeAngle: -8 },
];

const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesFilter = filter === 'All' || (Array.isArray(p.category) ? p.category.includes(filter) : p.category === filter);
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  // Stable rotations per project slug
  const rotations = useMemo(() => {
    const map: Record<string, number> = {};
    projects.forEach((p, i) => {
      const angles = [-2.5, 1.8, -1.2, 2.1, -1.8, 1.5, -2.0, 0.8];
      map[p.slug] = angles[i % angles.length];
    });
    return map;
  }, []);

  return (
    <div className="py-24 max-w-4xl mx-auto relative z-10">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl handwritten tracking-tighter mb-6 text-[#2a2318] dark:text-[#f5e6d3]">Works</h1>
        <p className="text-[#6b5744] dark:text-[#a1785d] text-lg leading-relaxed">
          A collection of experiments, builds, and products spanning from low-level firmware to full-stack applications.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-16">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all mono shadow-sm ${
                filter === cat
                  ? 'bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318]'
                  : 'bg-white dark:bg-[#3d2f1f] text-[#6b5744] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] hover:bg-[#f5f5dc] dark:hover:bg-[#2a2318] border border-[#c4a882] dark:border-[#6b5744]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full px-4 py-2.5 bg-white dark:bg-[#3d2f1f] border border-[#c4a882] dark:border-[#6b5744] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#c4a882]/30 dark:focus:ring-[#6b5744]/30 transition-all placeholder:text-[#6b5744] dark:placeholder:text-[#a1785d] text-[#2a2318] dark:text-[#e8dcc8] shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5">
          {filteredProjects.map((project, idx) => {
            const rotation = rotations[project.slug] ?? 0;
            const projectCategories = Array.isArray(project.category) ? project.category : [project.category];
            const color = pastelColors[idx % pastelColors.length];

            return (
              <Link
                key={project.slug}
                to={`/projects/${project.slug}`}
                className="group block transition-all duration-300 hover:scale-105 hover:z-10"
                style={{ transform: `rotate(${rotation}deg)` }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${rotation}deg)`; }}
              >
                <div
                  className="shadow-[4px_6px_18px_rgba(0,0,0,0.25)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[10px_14px_36px_rgba(0,0,0,0.4)] dark:group-hover:shadow-[10px_14px_36px_rgba(0,0,0,0.7)] group-hover:-translate-y-2 relative pt-4"
                  style={{ backgroundColor: color.bg }}
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
                          background: `linear-gradient(${135 + (project.slug.length * 17) % 90}deg, #d4a574 0%, #c4a882 40%, #8B7355 100%)`,
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

                    <div className="flex flex-wrap gap-1 mt-2">
                      {projectCategories.slice(0, 2).map(cat => (
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

                  {/* Arrow on hover */}
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
      ) : (
        <div className="text-center py-20 border-2 border-dashed border-[#c4a882] dark:border-[#6b5744] rounded-2xl">
          <p className="text-[#6b5744] dark:text-[#a1785d] text-sm mono">No matches found for your search.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
