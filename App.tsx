import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import FilmBackground from './components/FilmBackground';
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
      <div className="min-h-screen bg-[#f5e6d3] dark:bg-[#2a2318] text-[#2a2318] dark:text-[#e8dcc8] flex flex-col transition-colors duration-500 selection:bg-[#d4a574] dark:selection:bg-[#8B7355]">
        <FilmBackground />
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
                <h1 className="text-4xl font-heading font-bold mb-4 text-[#2a2318] dark:text-[#f5e6d3]">404</h1>
                <p className="text-[#6b5744] dark:text-[#a1785d] mb-8 mono text-sm">Page not found</p>
                <a href="/" className="bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318] px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest mono">Home</a>
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