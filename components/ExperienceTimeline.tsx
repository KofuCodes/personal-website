
import React from 'react';
import { experiences } from '../data/experience';

const ExperienceTimeline: React.FC = () => {
  return (
    <div className="space-y-16">
      {experiences.map((exp) => (
        <div key={exp.id} className="group relative">
          <div className="flex flex-col md:flex-row md:gap-12">
            <div className="md:w-32 mb-2 md:mb-0">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-[0.1em] mono">
                {exp.period.split(' – ')[0]}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight mb-1 dark:text-zinc-100">{exp.role}</h3>
                <p className="text-sm font-semibold text-zinc-400 dark:text-zinc-600">{exp.company}</p>
              </div>
              
              <ul className="space-y-3">
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx} className="text-[13px] text-zinc-500 dark:text-zinc-500 leading-relaxed max-w-lg">
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
