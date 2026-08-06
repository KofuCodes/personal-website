import React from 'react';
import { Project } from '../types';

/**
 * Projects as photos in an essay: two columns of natural-aspect images with
 * a quiet caption beneath, alternating column by file order. Clicking a card
 * opens the project modal — nothing navigates away. The image comes from
 * `content.buildImage`; projects without one render as a caption-only card.
 */
const ProjectCard: React.FC<{ project: Project; onOpen: (p: Project) => void }> = ({
  project,
  onOpen,
}) => {
  const img = project.content.buildImage;
  return (
    <figure
      className="group cursor-pointer mb-7 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 dark:focus-visible:ring-coral/80"
      onClick={() => onOpen(project)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(project);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.title} details`}
    >
      {img && (
        <div className="overflow-hidden rounded-md ring-1 ring-inset ring-black/5 dark:ring-white/10 bg-amber-100 dark:bg-stone-900">
          <img
            src={img}
            alt={project.title}
            loading="lazy"
            className="block w-full h-auto transition duration-300 group-hover:brightness-[1.05]"
          />
        </div>
      )}
      <figcaption className={img ? 'mt-2' : 'border-b border-stone-200 dark:border-stone-800 pb-3'}>
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-[14.5px] font-medium tracking-tight text-stone-900 dark:text-stone-100 underline decoration-transparent decoration-1 underline-offset-[3px] transition-colors duration-200 group-hover:decoration-stone-400 dark:group-hover:decoration-stone-500">
            {project.title}
          </span>
          <span className="mono text-[11px] text-stone-500 dark:text-stone-400 whitespace-nowrap">
            {project.year}
          </span>
        </span>
        <span className="mt-0.5 block text-[12.5px] italic text-stone-500 dark:text-stone-400 leading-relaxed">
          {project.summary}
        </span>
      </figcaption>
    </figure>
  );
};

const WorkCards: React.FC<{ projects: Project[]; onOpen: (p: Project) => void }> = ({
  projects,
  onOpen,
}) => {
  const leftCol: Project[] = [];
  const rightCol: Project[] = [];
  projects.forEach((p, i) => (i % 2 === 0 ? leftCol : rightCol).push(p));

  return (
    <div className="flex gap-5">
      <div className="min-w-0 flex-1 flex flex-col">
        {leftCol.map((p) => (
          <ProjectCard key={p.slug} project={p} onOpen={onOpen} />
        ))}
      </div>
      <div className="min-w-0 flex-1 flex flex-col">
        {rightCol.map((p) => (
          <ProjectCard key={p.slug} project={p} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
};

export default WorkCards;
