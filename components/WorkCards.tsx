import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import Aperture from './Aperture';

/**
 * Visual project grid — a large image per project so the work leads.
 * The image comes from `content.buildImage` (drop the file in /public);
 * projects without one get a neutral placeholder.
 */
const WorkCards: React.FC<{ projects: Project[] }> = ({ projects }) => {
  return (
    <div className="grid sm:grid-cols-2 gap-x-4 gap-y-8">
      {projects.map((p) => {
        const categories = Array.isArray(p.category) ? p.category : [p.category];
        const img = p.content.buildImage;
        return (
          <Link key={p.slug} to={`/projects/${p.slug}`} className="group block">
            <div className="aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10 bg-neutral-100 dark:bg-neutral-900">
              {img ? (
                <img
                  src={img}
                  alt={p.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-neutral-300 dark:text-neutral-600">
                  <Aperture className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between gap-3 mt-2.5">
              <h3 className="text-[14.5px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                {p.title}
              </h3>
              <span className="mono text-[11px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                {p.year}
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2">
              {p.summary}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="mono text-[10px] text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5"
                >
                  {cat}
                </span>
              ))}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default WorkCards;
