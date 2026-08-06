import React from 'react';
import { Link } from 'react-router-dom';
import { aboutItems } from '../data/about';
import { AboutPart } from '../types';
import Brand from './Brand';

const Part: React.FC<{ part: AboutPart }> = ({ part }) => {
  if (typeof part === 'string') return <>{part}</>;

  if ('emoji' in part) {
    return <span aria-hidden="true">{part.emoji}</span>;
  }

  if ('to' in part) {
    return (
      <Link
        to={part.to}
        className="font-medium underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-[3px] hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors"
      >
        {part.text}
      </Link>
    );
  }

  // Brand keeps icon + name on one line and matches the hero's brand styling.
  return <Brand name={part.name ?? part.domain ?? ''} domain={part.domain} src={part.src} />;
};

const PartList: React.FC<{ parts: AboutPart[] }> = ({ parts }) => (
  <>
    {parts.map((part, i) => (
      <Part key={i} part={part} />
    ))}
  </>
);

const About: React.FC = () => (
  <ul className="space-y-2.5">
    {aboutItems.map((item, i) => (
      <li key={i} className="text-[14.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        <div className="flex gap-2.5">
          <span className="text-[9px] leading-[2.4] text-neutral-300 dark:text-neutral-600 select-none" aria-hidden="true">
            ✦
          </span>
          <span>
            <PartList parts={item.parts} />
          </span>
        </div>
        {item.sub && (
          <div className="flex gap-2 pl-6 mt-0.5 text-[13.5px] text-neutral-500 dark:text-neutral-400">
            <span className="select-none" aria-hidden="true">↳</span>
            <span>
              <PartList parts={item.sub} />
            </span>
          </div>
        )}
      </li>
    ))}
  </ul>
);

export default About;
