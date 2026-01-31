import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import Photography from './pages/Photography';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-300 flex flex-col transition-colors duration-500 selection:bg-zinc-100 dark:selection:bg-zinc-800">
        <Navbar />
        <main className="flex-grow max-w-4xl mx-auto px-6 pt-16 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/photography" element={<Photography />} />
            <Route path="*" element={
              <div className="py-40 text-center">
                <h1 className="text-4xl font-heading font-bold mb-4 text-zinc-900 dark:text-zinc-100">404</h1>
                <p className="text-zinc-500 dark:text-zinc-500 mb-8 mono text-sm">Page not found</p>
                <a href="/" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mono">Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;