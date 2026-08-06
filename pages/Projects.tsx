import React, { useMemo, useState } from 'react';
import { projects } from '../data/projects';
import { Project } from '../types';
import WorkCards from '../components/WorkCards';
import ProjectModal from '../components/ProjectModal';
import QuietHeader from '../components/QuietHeader';

type Filter = 'all' | 'software' | 'hardware';

const Projects: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const filteredProjects = useMemo(
    () =>
      projects.filter((p) => {
        const kind = p.kind ?? 'both';
        return filter === 'all' || kind === filter || kind === 'both';
      }),
    [filter]
  );

  const filterButton = (value: Exclude<Filter, 'all'>) => (
    <button
      aria-pressed={filter === value}
      onClick={() => setFilter(filter === value ? 'all' : value)}
      className={`mono text-[12px] lowercase transition-colors ${
        filter === value
          ? 'text-orange-700 dark:text-coral underline underline-offset-[3px]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
      }`}
    >
      {value}
    </button>
  );

  return (
    <section className="reveal">
      <QuietHeader label="projects">
        {filterButton('software')}
        {filterButton('hardware')}
      </QuietHeader>

      {filteredProjects.length > 0 ? (
        <WorkCards projects={filteredProjects} onOpen={setSelectedProject} />
      ) : (
        <p className="mono text-[12px] text-stone-500 dark:text-stone-400 py-8 text-center">
          nothing here yet.
        </p>
      )}

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </section>
  );
};

export default Projects;
