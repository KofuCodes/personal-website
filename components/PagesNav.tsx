import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const pages = [
  { label: 'index', to: '/' },
  { label: 'projects', to: '/projects' },
  { label: 'work', to: '/work' },
  { label: 'gallery', to: '/photography' },
  { label: 'resume', to: '/resume' },
];

/**
 * Page navigation, distinct from the external-links row: no underlines, and
 * the active page carries a ➢ marker + the coral accent. Lives in the top bar,
 * outside <Routes>, so it persists across route changes.
 */
const PagesNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav aria-label="Pages" className="flex flex-wrap items-center gap-x-4 gap-y-1 sm:gap-x-5 mono text-[13px] lowercase">
      {pages.map((page) => {
        const active = pathname === page.to;
        return (
          <Link
            key={page.to}
            to={page.to}
            aria-current={active ? 'page' : undefined}
            className={`transition-colors ${
              active
                ? 'text-orange-700 dark:text-coral'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {page.label}
            <span aria-hidden="true" className={`ml-1 ${active ? '' : 'invisible'}`}>➢</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default PagesNav;
