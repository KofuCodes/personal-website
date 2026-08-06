import React from 'react';
import LinkPreview from './LinkPreview';

const social = [
  { name: 'GitHub', href: 'https://github.com/kofucodes', domain: 'github.com' },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/ethantrann', domain: 'linkedin.com' },
  { name: 'Instagram', href: 'https://www.instagram.com/ethan.trrann/', domain: 'instagram.com' },
  { name: 'Email', href: 'mailto:e64tran@uwaterloo.ca' },
];

const linkCls =
  'text-[13px] text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors';

const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-stone-200 dark:border-stone-800 relative z-10 bg-stone-50 dark:bg-stone-950">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-[13px] text-stone-500 dark:text-stone-400">
          <span className="text-stone-700 dark:text-stone-200 font-medium">Ethan Tran</span>
          <span className="mono text-[12px] ml-2">© {new Date().getFullYear()} · Waterloo, ON</span>
        </div>
        <div className="flex items-center gap-5">
          {social.map((s) => (
            <LinkPreview key={s.name} href={s.href} title={s.name} domain={s.domain} side="top" className={linkCls}>
              {s.name}
            </LinkPreview>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
