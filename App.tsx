import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import SensorField from './components/SensorField';
import LoopCursor from './components/LoopCursor';
import IdentityPanel from './components/IdentityPanel';
import SpotifyStatus from './components/SpotifyStatus';
import Home from './pages/Home';
import Papers from './pages/Papers';
import Photography from './pages/Photography';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    // On desktop the right panel is the scroll container, not the window
    document.getElementById('right-panel')?.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * Split-panel shell for the whole site: the identity panel on the left never
 * changes — routes swap only the right panel's content.
 */
const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-amber-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <SensorField />
        <LoopCursor />
        <div className="relative z-10 grid min-h-screen lg:h-screen lg:overflow-hidden grid-cols-1 lg:grid-cols-[2fr_3fr]">
          <IdentityPanel />

          <main
            id="right-panel"
            className="p-8 lg:p-14 lg:h-full lg:overflow-y-auto lg:border-l lg:border-stone-200 dark:lg:border-stone-800"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/papers" element={<Papers />} />
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

            {/* Mobile-only footer (the identity-panel footer is hidden below lg) */}
            <div className="lg:hidden mt-12">
              <div className="-ml-1.5 mb-3">
                <SpotifyStatus />
              </div>
              <p className="text-[12.5px] text-stone-500 dark:text-stone-400 select-none">
                © {new Date().getFullYear()} Ethan Tran · Waterloo, ON
              </p>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
