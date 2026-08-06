import React from 'react';
import { experiences } from '../data/experience';
import { BrandLogo } from './Brand';

/**
 * Compact experience rows: logo, company front and center, role as a quiet
 * subtitle, dates on the right. Details stay in data/experience.ts (bullets)
 * for reference — the page keeps only the shape of the story.
 */
const ExperienceTimeline: React.FC = () => {
  return (
    <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
      {experiences.map((exp) => {
        const Wrapper: React.ElementType = exp.link ? 'a' : 'div';
        const wrapperProps = exp.link
          ? { href: exp.link, target: '_blank', rel: 'noopener noreferrer' }
          : {};

        return (
          <li key={exp.id}>
            <Wrapper
              {...wrapperProps}
              className={`group flex items-center gap-4 py-4 ${exp.link ? 'cursor-pointer' : ''}`}
            >
              <BrandLogo
                name={exp.company}
                domain={exp.domain}
                src={exp.logo}
                className="w-10 h-10 p-1.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="flex min-w-0 items-baseline text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    <span className="truncate">{exp.company}</span>
                    {exp.link && (
                      <span className="shrink-0 ml-1.5 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                    )}
                  </h3>
                  <span className="mono text-[11px] italic text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <p className="text-[13px] italic lowercase text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  {exp.role}
                </p>
              </div>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
};

export default ExperienceTimeline;
