import React from 'react';
import { experiences } from '../data/experience';
import { BrandLogo } from './Brand';

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
              className={`group flex gap-4 py-6 ${exp.link ? 'cursor-pointer' : ''}`}
            >
              <BrandLogo
                name={exp.company}
                domain={exp.domain}
                src={exp.logo}
                className="w-9 h-9 mt-0.5 p-1.5"
              />

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-x-4 gap-y-0.5">
                  <h3 className="text-[15px] font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {exp.role}
                    {exp.link && (
                      <span className="inline-block ml-1.5 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                    )}
                  </h3>
                  <span className="mono text-[11px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                    {exp.period}
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">{exp.company}</p>

                <ul className="mt-3 space-y-1.5">
                  {exp.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex gap-2.5 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                      <span className="text-neutral-300 dark:text-neutral-600 select-none">–</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Wrapper>
          </li>
        );
      })}
    </ul>
  );
};

export default ExperienceTimeline;
