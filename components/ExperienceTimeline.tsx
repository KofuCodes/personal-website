
import React from 'react';
import { experiences } from '../data/experience';

const ExperienceTimeline: React.FC = () => {
  return (
    <div className="space-y-16">
      {experiences.map((exp) => (
        <div key={exp.id} className="group relative">
          <div className="flex flex-col md:flex-row md:gap-12">
            <div className="md:w-32 mb-2 md:mb-0">
              <span className="text-[11px] font-bold text-[#8B7355] dark:text-[#a1785d] uppercase tracking-[0.1em] mono">
                {exp.period.split(' – ')[0]}
              </span>
            </div>
            
            <div className="flex-1">
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
