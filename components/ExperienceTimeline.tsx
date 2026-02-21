
import React from 'react';
import { experiences } from '../data/experience';

const tapeColors = [
  { color: '#e8a0c8', angle: -8 },   // pink
  { color: '#a0d840', angle: 5 },     // green
  { color: '#4080e0', angle: -12 },   // blue
  { color: '#e8a020', angle: 7 },     // orange
];

const ExperienceTimeline: React.FC = () => {
  const rotations = [-0.6, 0.4, -0.3, 0.5];

  return (
    <div className="space-y-6">
      {experiences.map((exp, index) => {
        const tape = tapeColors[index % tapeColors.length];
        return (
        <div
          key={exp.id}
          className="group relative"
          style={{ transform: `rotate(${rotations[index % rotations.length]}deg)` }}
        >
          <div className="bg-[#fffef8] dark:bg-[#f5f0e0] border border-[#d4c4a8]/60 dark:border-[#8B7355]/30 shadow-[3px_4px_14px_rgba(0,0,0,0.12)] dark:shadow-[3px_4px_14px_rgba(0,0,0,0.35)] relative overflow-visible">

            {/* Colored tape */}
            <div
              className="absolute -top-3 z-10 w-12 h-5 opacity-70"
              style={{
                left: index % 2 === 0 ? '20px' : 'auto',
                right: index % 2 === 1 ? '20px' : 'auto',
                transform: `rotate(${tape.angle}deg)`,
                backgroundColor: tape.color,
                clipPath: 'polygon(3% 0%, 97% 0%, 100% 45%, 96% 100%, 4% 100%, 0% 55%)',
              }}
            />

            <div className="p-5 md:p-6">
              {/* Header row: role + period */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                <div>
                  <h3 className="text-base font-bold tracking-tight text-[#2a2318] leading-tight">{exp.role}</h3>
                  <p className="handwritten text-sm text-[#6b5744] dark:text-[#8B7355] mt-0.5">{exp.company}</p>
                </div>
                {/* Date stamp */}
                <span className="mono text-[9px] uppercase tracking-[0.15em] text-[#5c3d2e] dark:text-[#5c4a38] whitespace-nowrap self-start mt-1 sm:mt-0">
                  {exp.period}
                </span>
              </div>

              {/* Bullets */}
              <ul className="space-y-2 mt-3">
                {exp.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex gap-2 text-[12px] text-[#3d2f1f] dark:text-[#5c4a38] leading-relaxed">
                    <span className="text-[#c4a882] dark:text-[#8B7355] mt-0.5 flex-shrink-0">—</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom edge */}
            <div className="h-[2px] w-full bg-[#c4a882]/20 dark:bg-[#6b5744]/20" />
          </div>

          {/* Connecting thread */}
          {index < experiences.length - 1 && (
            <div className="flex justify-center py-0">
              <div className="w-[1px] h-6 bg-[#c4a882]/30 dark:bg-[#6b5744]/30" />
            </div>
          )}
        </div>
        );
      })}
    </div>
  );
};

export default ExperienceTimeline;
