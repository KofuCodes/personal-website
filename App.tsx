import React, { useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import SensorField from './components/SensorField';
import Hero from './components/Hero';
import PagesNav from './components/PagesNav';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Work from './pages/Work';
import Photography from './pages/Photography';

// Heavy (three.js) — code-split so it doesn't block the initial page load.
const ClosedLoopControlTerrain = lazy(() => import('./components/ClosedLoopControlTerrain'));

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * Two zones, one column: everything above <main> — identity, pages nav, and
 * the closed-loop terrain — is the shell and never changes. Routes swap only
 * what sits below it.
 */
const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-amber-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <SensorField />

        {/* --content is this column's inner width, used to size the hero type. */}
        <div
          className="relative z-10 mx-auto w-full max-w-[46rem] px-6 sm:px-8 pt-8 sm:pt-10 pb-16"
          style={{ '--content': 'min(100vw - 4rem, 42rem)' } as React.CSSProperties}
        >
          <Hero />

          <div className="mt-10 reveal" style={{ animationDelay: '0.1s' }}>
            <PagesNav />
          </div>

          <section className="mt-6 reveal" style={{ animationDelay: '0.14s' }}>
            <div className="h-[clamp(280px,38vh,400px)] w-full">
              <Suspense fallback={<div className="h-full w-full" />}>
                <ClosedLoopControlTerrain />
              </Suspense>
            </div>
            <p className="mt-3 text-center text-[12.5px] italic text-stone-500 dark:text-stone-400">
              I'm always self-adjusting to the targeted goal
            </p>
          </section>

          <main className="mt-14">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/work" element={<Work />} />
              <Route path="/photography" element={<Photography />} />
              {/* Old per-project deep links land on the projects page */}
              <Route path="/projects/*" element={<Navigate to="/projects" replace />} />
              <Route path="*" element={
                <div className="py-16 text-center">
                  <h2 className="text-2xl font-semibold mb-3 tracking-tight">404</h2>
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
