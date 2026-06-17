import React, { useState, useMemo } from 'react';
import { projects } from '../data/projects';
import { Category } from '../types';
import WorkList from '../components/WorkList';

const categories: (Category | 'All')[] = ['All', 'Embedded/Firmware', 'Hardware', 'Web/App', 'Hackathons'];

const ProjectsPage: React.FC = () => {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesFilter =
        filter === 'All' || (Array.isArray(p.category) ? p.category.includes(filter) : p.category === filter);
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      <header className="mb-10 reveal">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Work</h1>
        <p className="text-[15px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Experiments, builds, and products — from low-level firmware to full-stack apps.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-8 reveal" style={{ animationDelay: '0.06s' }}>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-full text-[12px] transition-colors border ${
                filter === cat
                  ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100'
                  : 'text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search…"
          className="w-full sm:w-44 px-3 py-1.5 bg-transparent border border-neutral-200 dark:border-neutral-800 rounded-full text-[13px] focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="reveal" style={{ animationDelay: '0.12s' }}>
        {filteredProjects.length > 0 ? (
          <WorkList projects={filteredProjects} />
        ) : (
          <div className="text-center py-16 text-[13px] text-neutral-400 dark:text-neutral-500 mono">
            No matches found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
