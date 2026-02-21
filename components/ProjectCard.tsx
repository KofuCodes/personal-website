
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
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 md:p-6 rounded-lg border-2 border-transparent hover:border-[#c4a882] dark:hover:border-[#6b5744] hover:bg-[#f5f5dc] dark:hover:bg-[#3d2f1f] transition-all duration-500 w-full overflow-hidden shadow-md hover:shadow-[4px_4px_12px_rgba(0,0,0,0.2)]"
    >
      <div className="flex-grow min-w-0 pr-4">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <h3 className="text-lg font-bold tracking-tight group-hover:text-[#2a2318] dark:group-hover:text-[#f5e6d3] transition-colors duration-500 truncate text-[#2a2318] dark:text-[#f5e6d3]">
            {project.title}
          </h3>
          <span className="text-[9px] mono text-[#8B7355] dark:text-[#a1785d] uppercase tracking-widest px-2 py-0.5 border border-[#c4a882] dark:border-[#6b5744] rounded-full whitespace-nowrap transition-colors duration-500">
            {project.year}
          </span>
        </div>
        <p className="text-[#6b5744] dark:text-[#a1785d] text-sm leading-relaxed truncate group-hover:text-[#3d2f1f] dark:group-hover:text-[#d4a574] transition-colors duration-500">
          {project.summary}
        </p>
      </div>

      <div className="flex items-center gap-4 mt-4 sm:mt-0 flex-shrink-0">
        <div className="hidden lg:flex gap-3">
          {project.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] font-bold text-[#8B7355] dark:text-[#6b5744] group-hover:text-[#6b5744] dark:group-hover:text-[#a1785d] uppercase tracking-[0.1em] transition-colors">
              {tag}
            </span>
          ))}
        </div>
        <div className="p-2.5 rounded-full bg-[#d4a574] dark:bg-[#6b5744] text-[#2a2318] dark:text-[#f5e6d3] group-hover:bg-[#2a2318] dark:group-hover:bg-[#f5e6d3] group-hover:text-[#f5e6d3] dark:group-hover:text-[#2a2318] transition-all duration-300 transform group-hover:translate-x-1 shadow-md">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
