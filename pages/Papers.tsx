import React from 'react';
import { papers, PaperStatus } from '../data/papers';

// Status chips get a fill so they read as status, not just another area tag.
const statusStyles: Record<PaperStatus, string> = {
  'In progress':
    'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100',
  Drafting:
    'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700',
  Preprint:
    'bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-200 border-stone-300 dark:border-stone-700',
  Idea: 'bg-stone-100 dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800',
};

const Papers: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      <header className="mb-10 reveal">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Papers</h1>
        <p className="text-[15px] text-stone-500 dark:text-stone-400 leading-relaxed">
          Research I&apos;m exploring or working toward.
        </p>
      </header>

      <div className="reveal" style={{ animationDelay: '0.06s' }}>
        {papers.length > 0 ? (
          <ul className="divide-y divide-stone-200 dark:divide-stone-800 border-y border-stone-200 dark:border-stone-800">
            {papers.map((paper) => (
              <li key={paper.slug} className="py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[15px] font-medium tracking-tight text-stone-900 dark:text-stone-100">
                    {paper.title}
                  </h2>
                  <span className="mono text-[11px] text-stone-400 dark:text-stone-500 whitespace-nowrap">
                    {paper.timeframe}
                  </span>
                </div>
                <p className="text-[13px] text-stone-500 dark:text-stone-400 leading-relaxed mt-1.5">
                  {paper.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span
                    className={`mono text-[10px] rounded px-1.5 py-0.5 border ${statusStyles[paper.status]}`}
                  >
                    {paper.status}
                  </span>
                  {paper.areas.map((area) => (
                    <span
                      key={area}
                      className="mono text-[10px] text-stone-500 dark:text-stone-400 border border-stone-200 dark:border-stone-800 rounded px-1.5 py-0.5"
                    >
                      {area}
                    </span>
                  ))}
                  {paper.links?.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[10px] text-stone-500 dark:text-stone-400 underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-stone-900 dark:hover:decoration-stone-100 transition-colors px-0.5"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-20 border-y border-stone-200 dark:border-stone-800">
            <div className="mono text-[12px] uppercase tracking-wider text-stone-400 dark:text-stone-500">
              Coming soon
            </div>
            <p className="text-[13px] text-stone-400 dark:text-stone-500 mt-2">
              First papers are brewing — nothing published yet.
            </p>
          </div>
        )}
      </div>

      <p className="mt-10 text-[13px] text-stone-400 dark:text-stone-500 leading-relaxed reveal" style={{ animationDelay: '0.12s' }}>
        Working on something adjacent, or want to collaborate?{' '}
        <a
          href="mailto:e64tran@uwaterloo.ca"
          className="underline decoration-stone-300 dark:decoration-stone-600 underline-offset-[3px] hover:decoration-stone-900 dark:hover:decoration-stone-100 transition-colors"
        >
          Reach out
        </a>
        .
      </p>
    </div>
  );
};

export default Papers;
