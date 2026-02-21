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
    { name: 'Works', path: '/projects' },
    { name: 'Gallery', path: '/photography' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#f5e6d3]/95 dark:bg-[#2a2318]/95 shadow-[0_2px_20px_rgba(42,35,24,0.12)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.4)]'
          : 'bg-[#f5e6d3]/80 dark:bg-[#2a2318]/80'
      } backdrop-blur-xl`}
    >
      {/* Polaroid top tape strip */}
      <div className="h-[3px] w-full bg-[#c4a882]/60 dark:bg-[#6b5744]/60 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(139,115,85,0.3) 20px, rgba(139,115,85,0.3) 21px)'
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo: Polaroid-styled */}
        <div className="flex items-center gap-8">
          <Link to="/" className="group" aria-label="Home">
            <span className="handwritten text-2xl text-[#2a2318] dark:text-[#f5e6d3] group-hover:opacity-70 transition-opacity">
              Ethan Tran
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`relative px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 mono rounded-sm ${
                  isActive(link.path)
                    ? 'text-[#2a2318] dark:text-[#f5e6d3]'
                    : 'text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3]'
                }`}
              >
                {/* Active underline styled like a polaroid label tape */}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#d4a574] dark:bg-[#8B7355] rounded-full" />
                )}
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <SpotifyStatus />
          </div>

          {/* Resume — styled as a polaroid label sticker */}
          <a
            href="/Ethan_Tran_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-[#f5f5dc] text-[#2a2318] border border-[#c4a882] dark:border-[#c4a882] text-[10px] font-bold uppercase tracking-widest mono shadow-[2px_2px_0px_rgba(196,168,130,0.6)] dark:shadow-[2px_2px_0px_rgba(107,87,68,0.6)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all duration-150"
            style={{ borderRadius: '2px' }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Résumé
          </a>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#d4a574]/30 dark:hover:bg-[#6b5744]/40 transition-colors text-[#6b5744] dark:text-[#d4a574]"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center text-[#6b5744] dark:text-[#a1785d]"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-[#f5e6d3] dark:bg-[#2a2318] border-t border-[#c4a882]/50 dark:border-[#6b5744]/50 px-6 py-6 flex flex-col gap-5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-xl handwritten flex items-center gap-3 ${
                isActive(link.path)
                  ? 'text-[#2a2318] dark:text-[#f5e6d3]'
                  : 'text-[#8B7355] dark:text-[#a1785d]'
              }`}
              onClick={() => setIsOpen(false)}
            >
              {isActive(link.path) && (
                <span className="w-6 h-[2px] bg-[#d4a574] dark:bg-[#8B7355] rounded-full inline-block" />
              )}
              {link.name}
            </Link>
          ))}

          <a
            href="/Ethan_Tran_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 px-4 py-2 bg-white dark:bg-[#f5f5dc] text-[#2a2318] border border-[#c4a882] text-sm font-bold uppercase tracking-widest mono shadow-[2px_2px_0px_rgba(196,168,130,0.8)]"
            style={{ borderRadius: '2px' }}
            onClick={() => setIsOpen(false)}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Résumé
          </a>

          <div className="pt-4 border-t border-[#c4a882]/40 dark:border-[#6b5744]/40">
            <SpotifyStatus />
          </div>
        </div>
      )}

      {/* Bottom tape strip */}
      <div className="h-[2px] w-full bg-[#c4a882]/40 dark:bg-[#6b5744]/40" />
    </nav>
  );
};

export default Navbar;
