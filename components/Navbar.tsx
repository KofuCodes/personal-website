import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SpotifyStatus from './SpotifyStatus';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Work', path: '/projects' },
    { name: 'Gallery', path: '/photography' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const applyTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const toggleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    const dark = !isDark;
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!doc.startViewTransition || reduce) {
      applyTheme(dark);
      return;
    }

    // Reveal expands from the toggle button's center.
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    try {
      const transition = doc.startViewTransition(() => applyTheme(dark));
      transition.ready
        .then(() => {
          document.documentElement.animate(
            {
              clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`],
            },
            {
              duration: 480,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          );
        })
        .catch(() => {});
    } catch {
      applyTheme(dark);
    }
  };

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200/80 dark:border-neutral-800/80'
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
                    ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
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
            className="hidden md:inline-flex items-center text-[13px] font-medium px-3 py-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
          >
            Résumé
          </a>

          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-300"
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
        <div className="md:hidden bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 px-6 py-5 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`py-2 text-base ${
                isActive(link.path)
                  ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                  : 'text-neutral-500 dark:text-neutral-400'
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
            className="mt-2 inline-flex w-fit items-center text-sm font-medium px-4 py-2 rounded-md border border-neutral-300 dark:border-neutral-700"
            onClick={() => setIsOpen(false)}
          >
            Résumé
          </a>
          <div className="pt-4 mt-2 border-t border-neutral-200 dark:border-neutral-800">
            <SpotifyStatus />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
