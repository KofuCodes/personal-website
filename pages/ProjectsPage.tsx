import React, { useState, useMemo } from 'react';
import { projects } from '../data/projects';
import { Category } from '../types';
import ProjectCard from '../components/ProjectCard';
import ReactBitsBackground from '../components/ReactBitsBackground';

const categories: (Category | 'All')[] = ['All', 'Embedded/Firmware', 'Hardware', 'Web/App', 'Hackathons'];

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

  return (
    <>
      <ReactBitsBackground />
      <div className="py-24 max-w-3xl mx-auto relative z-10">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter mb-6 text-[#2a2318] dark:text-[#f5e6d3]">Works</h1>
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

      <div className="flex flex-col gap-4">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <ProjectCard key={project.slug} project={project} />
          ))
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-[#c4a882] dark:border-[#6b5744] rounded-2xl">
            <p className="text-[#6b5744] dark:text-[#a1785d] text-sm mono">No matches found for your search.</p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ProjectsPage;