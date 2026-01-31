
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-20 border-t border-zinc-100 dark:border-zinc-900">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-zinc-900 dark:text-zinc-100 font-bold text-sm tracking-tight">Ethan Tran</div>
          <div className="text-zinc-400 dark:text-zinc-700 text-xs mono uppercase tracking-widest">
            © {new Date().getFullYear()} — Waterloo, ON
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <a href="mailto:e64tran@uwaterloo.ca" className="text-sm font-bold tracking-tight text-black dark:text-white hover:opacity-50 transition-opacity">
            e64tran@uwaterloo.ca
          </a>
          <div className="flex space-x-8">
            <a href="https://github.com/kofucodes" target="_blank" rel="noopener noreferrer" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest">GitHub</a>
            <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="text-zinc-400 dark:text-zinc-600 hover:text-black dark:hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
