import React, { useState, useMemo } from 'react';
import { projects } from '../data/projects';
import { Category } from '../types';
import ProjectCard from '../components/ProjectCard';

const categories: (Category | 'All')[] = ['All', 'Embedded/Firmware', 'Hardware', 'Web/App', 'Hackathons'];

const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesFilter = filter === 'All' || p.category === filter;
      const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                           p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  return (
    <div className="py-24 max-w-3xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tighter mb-6 dark:text-zinc-100">Works</h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">
          A collection of experiments, builds, and products spanning from low-level firmware to full-stack applications.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-16">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all mono ${
                filter === cat 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
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
            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-100/50 dark:focus:ring-zinc-800/50 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
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
          <div className="text-center py-20 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl">
            <p className="text-zinc-400 dark:text-zinc-600 text-sm mono">No matches found for your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;