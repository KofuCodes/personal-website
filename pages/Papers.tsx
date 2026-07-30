import React from 'react';
import { papers, PaperStatus } from '../data/papers';

// Status chips get a fill so they read as status, not just another area tag.
const statusStyles: Record<PaperStatus, string> = {
  'In progress':
    'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100',
  Drafting:
    'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700',
  Preprint:
    'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700',
  Idea: 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800',
};

const Papers: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      <header className="mb-10 reveal">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Papers</h1>
        <p className="text-[15px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Research I&apos;m exploring or working toward.
        </p>
      </header>

      <div className="reveal" style={{ animationDelay: '0.06s' }}>
        {papers.length > 0 ? (
          <ul className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
            {papers.map((paper) => (
              <li key={paper.slug} className="py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-[15px] font-medium tracking-tight text-neutral-900 dark:text-neutral-100">
                    {paper.title}
                  </h2>
                  <span className="mono text-[11px] text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                    {paper.timeframe}
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-1.5">
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
                      className="mono text-[10px] text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800 rounded px-1.5 py-0.5"
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
                      className="mono text-[10px] text-neutral-500 dark:text-neutral-400 underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-2 hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors px-0.5"
                    >
                      {link.label} ↗
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-20 border-y border-neutral-200 dark:border-neutral-800">
            <div className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Coming soon
            </div>
            <p className="text-[13px] text-neutral-400 dark:text-neutral-500 mt-2">
              First papers are brewing — nothing published yet.
            </p>
          </div>
        )}
      </div>

      <p className="mt-10 text-[13px] text-neutral-400 dark:text-neutral-500 leading-relaxed reveal" style={{ animationDelay: '0.12s' }}>
        Working on something adjacent, or want to collaborate?{' '}
        <a
          href="mailto:e64tran@uwaterloo.ca"
          className="underline decoration-neutral-300 dark:decoration-neutral-600 underline-offset-[3px] hover:decoration-neutral-900 dark:hover:decoration-neutral-100 transition-colors"
        >
          Reach out
        </a>
        .
      </p>
    </div>
  );
};

export default Papers;
