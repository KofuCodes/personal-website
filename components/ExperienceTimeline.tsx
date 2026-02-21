
import React from 'react';
import { experiences } from '../data/experience';

const ExperienceTimeline: React.FC = () => {
  return (
    <div className="space-y-0">
      {experiences.map((exp, index) => (
        <div key={exp.id} className="group relative">
          <div className="flex flex-col md:flex-row md:gap-12">
            {/* Left: Year + timeline connector */}
            <div className="md:w-32 mb-2 md:mb-0 relative">
              <span className="text-[11px] font-bold text-[#8B7355] dark:text-[#a1785d] uppercase tracking-[0.1em] mono">
                {exp.period.split(' – ')[0]}
              </span>
              {/* Vertical connecting line */}
              <div className="hidden md:block absolute left-[60px] top-6 bottom-0 w-[1px] bg-[#c4a882]/40 dark:bg-[#6b5744]/40"
                style={{ height: index < experiences.length - 1 ? 'calc(100% + 2rem)' : '0' }}
              />
              {/* Timeline dot */}
              <div className="hidden md:block absolute left-[56px] top-1 w-[9px] h-[9px] rounded-full border-2 border-[#c4a882] dark:border-[#6b5744] bg-[#f5e6d3] dark:bg-[#2a2318]" />
            </div>

            {/* Right: Content */}
            <div className="flex-1 pb-12">
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight mb-1 text-[#2a2318] dark:text-[#f5e6d3]">{exp.role}</h3>
                <p className="text-sm font-semibold text-[#6b5744] dark:text-[#a1785d]">{exp.company}</p>
              </div>

              <ul className="space-y-3">
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx} className="text-[13px] text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed max-w-lg">
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTimeline;
