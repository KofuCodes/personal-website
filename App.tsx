import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SensorField from './components/SensorField';
import Home from './pages/Home';
import Papers from './pages/Papers';
import Photography from './pages/Photography';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

/**
 * Home is a self-contained split-panel layout with its own links/theme
 * toggle/copyright, so the navbar and footer chrome only render on subpages.
 */
const AppShell: React.FC = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col">
      <SensorField />
      {!isHome && <Navbar />}
      <main className="flex-grow w-full relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/papers" element={<Papers />} />
          <Route path="/photography" element={<Photography />} />
          {/* Old work-page deep links (pre split-layout) land home instead of 404ing */}
          <Route path="/projects/*" element={<Navigate to="/" replace />} />
          <Route path="*" element={
            <div className="max-w-2xl mx-auto px-6 py-40 text-center">
              <h1 className="text-3xl font-semibold mb-3 tracking-tight">404</h1>
              <p className="text-neutral-500 dark:text-neutral-400 mb-8 mono text-sm">Page not found</p>
              <Link to="/" className="inline-block border border-neutral-300 dark:border-neutral-700 px-5 py-2 rounded-full text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
                Back home
              </Link>
            </div>
          } />
        </Routes>
      </main>
      {!isHome && <Footer />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AppShell />
    </Router>
  );
};

export default App;
