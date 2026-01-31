
import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link 
      to={`/projects/${project.slug}`}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 rounded-2xl border border-transparent hover:border-zinc-100 dark:hover:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-all duration-500 w-full overflow-hidden"
    >
      <div className="flex-grow min-w-0 pr-4">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h3 className="text-lg font-bold tracking-tight group-hover:text-black dark:group-hover:text-white transition-colors duration-500 truncate">
            {project.title}
          </h3>
          <span className="text-[9px] mono text-zinc-500 dark:text-zinc-500 uppercase tracking-widest px-2 py-0.5 border border-zinc-200 dark:border-zinc-700 rounded-full whitespace-nowrap transition-colors duration-500">
            {project.year}
          </span>
        </div>
        <p className="text-zinc-400 dark:text-zinc-500 text-sm leading-relaxed truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-500">
          {project.summary}
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0 flex-shrink-0">
        <div className="hidden lg:flex gap-3">
          {project.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-bold text-zinc-200 dark:text-zinc-800 group-hover:text-zinc-300 dark:group-hover:text-zinc-600 uppercase tracking-[0.1em] transition-colors">
              {tag}
            </span>
          ))}
        </div>
        <div className="p-2.5 rounded-full bg-zinc-50 dark:bg-zinc-900 text-zinc-300 dark:text-zinc-700 group-hover:bg-black dark:group-hover:bg-zinc-100 group-hover:text-white dark:group-hover:text-black transition-all duration-300 transform group-hover:translate-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
