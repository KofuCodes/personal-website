import React from 'react';

const social = [
  { name: 'GitHub', href: 'https://github.com/kofucodes' },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/ethantrann' },
  { name: 'Instagram', href: 'https://www.instagram.com/ethan.trrann/' },
  { name: 'Email', href: 'mailto:e64tran@uwaterloo.ca' },
];

const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-neutral-200 dark:border-neutral-800 relative z-10 bg-white dark:bg-neutral-950">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-[13px] text-neutral-500 dark:text-neutral-400">
          <span className="text-neutral-700 dark:text-neutral-200 font-medium">Ethan Tran</span>
          <span className="mono text-[12px] ml-2">© {new Date().getFullYear()} · Waterloo, ON</span>
        </div>
        <div className="flex items-center gap-5">
          {social.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target={s.href.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              {s.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
