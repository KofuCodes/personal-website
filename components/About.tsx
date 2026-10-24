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
    // Page links wear the beak accent (like the pages nav) — external links
    // elsewhere keep the quiet ink underline.
    return (
      <Link
        to={part.to}
        className="font-medium text-beak no-underline hover:underline underline-offset-[3px] transition-colors"
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
      <li key={i} className="text-[13.5px] leading-relaxed text-ink-700">
        <div className="flex gap-2.5">
          <span className="text-[11px] leading-[2.4] text-beak/90 select-none" aria-hidden="true">
            ✦
          </span>
          <span>
            <PartList parts={item.parts} />
          </span>
        </div>
        {item.sub && (
          <div className="flex gap-2 pl-6 mt-0.5 text-[12.5px] text-ink-500">
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
