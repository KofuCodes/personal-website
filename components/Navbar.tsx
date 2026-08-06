import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SpotifyStatus from './SpotifyStatus';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Papers', path: '/papers' },
    { name: 'Gallery', path: '/photography' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="text-[15px] font-semibold tracking-tight hover:opacity-60 transition-opacity">
          Ethan Tran
        </Link>

        <div className="flex items-center gap-1">
          <div className="hidden md:flex items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-1.5 text-[13px] rounded-md transition-colors ${
                  isActive(link.path)
                    ? 'text-stone-900 dark:text-stone-100 font-medium'
                    : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:block mx-2">
            <SpotifyStatus />
          </div>

          <a
            href="/Ethan_Tran_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center text-[13px] font-medium px-3 py-1.5 rounded-md border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
          >
            Résumé
          </a>

          <ThemeToggle />

          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-stone-600 dark:text-stone-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
              <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'} />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 px-6 py-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`py-2 text-base ${
                isActive(link.path)
                  ? 'text-stone-900 dark:text-stone-100 font-medium'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <a
            href="/Ethan_Tran_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex w-fit items-center text-sm font-medium px-4 py-2 rounded-md border border-stone-300 dark:border-stone-700"
            onClick={() => setIsOpen(false)}
          >
            Résumé
          </a>
          <div className="pt-4 mt-2 border-t border-stone-200 dark:border-stone-800">
            <SpotifyStatus />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
