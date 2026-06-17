import React from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types';
import Aperture from './Aperture';

const Thumb: React.FC<{ project: Project }> = ({ project }) => {
  const img = project.content.buildImage;
  if (img) {
    return (
      <img
        src={img}
        alt=""
        loading="lazy"
        className="w-16 h-12 rounded-md object-cover flex-shrink-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 grayscale group-hover:grayscale-0 transition-all duration-500"
      />
    );
  }
  return (
    <div className="w-16 h-12 rounded-md flex-shrink-0 grid place-items-center bg-neutral-100 dark:bg-neutral-900 ring-1 ring-inset ring-black/5 dark:ring-white/10 text-neutral-300 dark:text-neutral-600">
      <Aperture className="w-5 h-5" />
    </div>
  );
};

const WorkList: React.FC<{ projects: Project[] }> = ({ projects }) => {
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
      {projects.map((p) => {
        const categories = Array.isArray(p.category) ? p.category : [p.category];
        return (
          <li key={p.slug}>
            <Link
              to={`/projects/${p.slug}`}
              className="group flex items-center gap-4 py-4 -mx-3 px-3 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition-colors"
            >
              <Thumb project={p} />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100 truncate">
                    {p.title}
                  </h3>
                  <span className="mono text-[11px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                    {p.year}
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
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
              </div>

              <svg
                className="w-4 h-4 flex-shrink-0 text-neutral-300 dark:text-neutral-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default WorkList;
