
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="py-20 border-t-2 border-[#c4a882] dark:border-[#6b5744]">
      <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="text-[#2a2318] dark:text-[#f5e6d3] font-bold text-sm tracking-tight handwritten text-xl">Ethan Tran</div>
          <div className="text-[#6b5744] dark:text-[#a1785d] text-xs mono uppercase tracking-widest">
            © {new Date().getFullYear()} — Waterloo, ON
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-4">
          <a href="mailto:e64tran@uwaterloo.ca" className="text-sm font-bold tracking-tight text-[#2a2318] dark:text-[#f5e6d3] hover:opacity-50 transition-opacity handwritten text-lg">
            e64tran@uwaterloo.ca
          </a>
          <div className="flex space-x-8">
            <a href="https://github.com/kofucodes" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors text-[11px] font-bold uppercase tracking-widest">GitHub</a>
            <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="text-[#8B7355] dark:text-[#a1785d] hover:text-[#2a2318] dark:hover:text-[#f5e6d3] transition-colors text-[11px] font-bold uppercase tracking-widest">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
