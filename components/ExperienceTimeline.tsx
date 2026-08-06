import React, { useState } from 'react';
import { experiences } from '../data/experience';
import { BrandLogo } from './Brand';

/**
 * Compact experience rows that expand on hover (tap on mobile) to show the
 * detail bullets from data/experience.ts — the shape of the story up front,
 * the substance one hover away.
 */
const ExperienceTimeline: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-stone-200 dark:divide-stone-800">
      {experiences.map((exp) => {
        const isExpanded = expandedId === exp.id;
        const hasDetail = !!exp.bullets?.length;

        const toggle = () => setExpandedId((prev) => (prev === exp.id ? null : exp.id));

        return (
          <li
            key={exp.id}
            // Pointer (not mouse) events so a touch tap doesn't fire a synthetic
            // mouseenter that expands the row just before click collapses it.
            onPointerEnter={hasDetail ? (e) => { if (e.pointerType !== 'touch') setExpandedId(exp.id); } : undefined}
            onPointerLeave={hasDetail ? (e) => { if (e.pointerType !== 'touch') setExpandedId(null); } : undefined}
            onClick={hasDetail ? toggle : undefined}
            onKeyDown={
              hasDetail
                ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggle();
                    }
                  }
                : undefined
            }
            tabIndex={hasDetail ? 0 : undefined}
            role={hasDetail ? 'button' : undefined}
            aria-expanded={hasDetail ? isExpanded : undefined}
            className={
              hasDetail
                ? 'cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-700 dark:focus-visible:ring-coral/80'
                : ''
            }
          >
            <div className="py-3.5">
              <div className="flex items-center gap-3">
                <BrandLogo
                  name={exp.company}
                  domain={exp.domain}
                  src={exp.logo}
                  className="w-9 h-9 p-1.5"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <h3 className="flex min-w-0 items-baseline text-[15px] font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                      {exp.link ? (
                        <a
                          href={exp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="group flex min-w-0 items-baseline"
                        >
                          <span className="truncate">{exp.company}</span>
                          <span className="shrink-0 ml-1.5 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                        </a>
                      ) : (
                        <span className="truncate">{exp.company}</span>
                      )}
                    </h3>
                    <span className="mono text-[11px] italic text-stone-400 dark:text-stone-500 whitespace-nowrap">
                      {exp.period}
                    </span>
                  </div>
                  <p className="text-[13px] italic lowercase text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                    {exp.role}
                  </p>
                </div>
              </div>

              {/* Expandable bullets — grid-rows trick animates height without JS measuring */}
              {hasDetail && (
                <div aria-hidden={!isExpanded} className={`accordion ${isExpanded ? 'open' : ''}`}>
                  <div className="overflow-hidden">
                    <ul className="pt-2.5 pl-12 space-y-1">
                      {exp.bullets!.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex gap-2 text-[12.5px] leading-relaxed text-stone-600 dark:text-stone-300"
                        >
                          <span className="text-stone-300 dark:text-stone-600 select-none">–</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ExperienceTimeline;
