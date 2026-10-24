import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import GeeseSky from './components/GeeseSky';
import WatercolorTrail from './components/WatercolorTrail';
import Hero from './components/Hero';
import PagesNav from './components/PagesNav';
import ScrollTop from './components/ScrollTop';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Work from './pages/Work';
import Photography from './pages/Photography';
import Resume from './pages/Resume';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * Two zones, one column: the identity block and the pages nav are the shell
 * and never change — routes swap only what sits below them.
 *
 * The column is a viewport-tall flex box, so the index page can hand its
 * leftover height to the terrain and fit on one screen; longer pages simply
 * grow past it and scroll.
 */
const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-[100dvh] bg-paper text-ink-900">
        {/* The paper, back to front: the flock, the cursor's brush, then the
            grain over both so they read as painted into it. All fixed and
            z-auto in this one stacking context — a wrapper with its own z-index
            would isolate the trail's and grain's blend modes from the page. */}
        <GeeseSky />
        <WatercolorTrail />
        <div className="paper-grain" aria-hidden="true" />

        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[46rem] flex-col px-6 sm:px-8 pt-5 sm:pt-6 pb-6">
          <Hero />

          <div className="mt-6 reveal" style={{ animationDelay: '0.1s' }}>
            <PagesNav />
          </div>

          <main className="mt-6 flex flex-1 flex-col">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/work" element={<Work />} />
              <Route path="/photography" element={<Photography />} />
              <Route path="/resume" element={<Resume />} />
              {/* Old per-project deep links land on the projects page */}
              <Route path="/projects/*" element={<Navigate to="/projects" replace />} />
              <Route path="*" element={
                <div className="py-16 text-center">
                  <h2 className="text-2xl font-semibold mb-3 tracking-tight">404</h2>
                  <p className="text-ink-500 mb-8 text-sm">page not found</p>
                  <Link to="/" className="inline-block border border-ink-300 px-5 py-2 rounded-full text-sm font-medium hover:bg-paper-100 transition-colors">
                    ➢ back to index
                  </Link>
                </div>
              } />
            </Routes>
          </main>

          <footer className="mt-6">
            {/* painted stroke in place of the old 1px border; mb-4 keeps the old pt-4 gap */}
            <div className="brush-rule mb-4" aria-hidden="true" />
            <p className="text-[13.5px] text-ink-500 select-none">
              © {new Date().getFullYear()} Ethan Tran · Waterloo, ON
            </p>
          </footer>
        </div>

        <ScrollTop />
      </div>
    </Router>
  );
};

export default App;
