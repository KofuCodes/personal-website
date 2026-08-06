import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import SensorField from './components/SensorField';
import PagesNav from './components/PagesNav';
import SpotifyStatus from './components/SpotifyStatus';
import ThemeToggle from './components/ThemeToggle';
import Home from './pages/Home';
import Photography from './pages/Photography';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * One centered column for the whole site: a persistent top bar (pages left,
 * now playing + theme right), the page itself, then the footer.
 */
const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-amber-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <SensorField />

        {/* Width tracks what the old right panel had (it was 3fr of 5, i.e. 60vw),
            with a floor so it stays readable and a cap for ultrawides. */}
        <div className="relative z-10 mx-auto w-full max-w-[min(76rem,max(46rem,60vw))] px-6 sm:px-8 pt-8 sm:pt-10 pb-16">
          <header className="flex items-center justify-between gap-3 reveal">
            <PagesNav />
            <div className="flex items-center gap-1 min-w-0">
              {/* Fixed slot: the widget is right-aligned, so letting it size to
                  the track title would slide the whole header on every song. */}
              <div className="flex justify-start shrink-0 w-[46px] sm:w-[184px]">
                <SpotifyStatus />
              </div>
              <span className="opacity-70">
                <ThemeToggle />
              </span>
            </div>
          </header>

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/photography" element={<Photography />} />
              {/* Old work-page deep links (pre split-layout) land home instead of 404ing */}
              <Route path="/projects/*" element={<Navigate to="/" replace />} />
              <Route path="*" element={
                <div className="py-24 text-center">
                  <h1 className="text-2xl font-semibold mb-3 tracking-tight">404</h1>
                  <p className="text-stone-500 dark:text-stone-400 mb-8 mono text-sm">page not found</p>
                  <Link to="/" className="inline-block border border-stone-300 dark:border-stone-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-100 dark:hover:bg-stone-900 transition-colors">
                    ➢ back to index
                  </Link>
                </div>
              } />
            </Routes>
          </main>

          <footer className="mt-16 pt-6 border-t border-stone-200 dark:border-stone-800">
            <p className="text-[12.5px] text-stone-500 dark:text-stone-400 select-none">
              © {new Date().getFullYear()} Ethan Tran · Waterloo, ON
            </p>
          </footer>
        </div>
      </div>
    </Router>
  );
};

export default App;
