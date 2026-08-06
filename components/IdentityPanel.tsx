import React from 'react';
import { useLocation } from 'react-router-dom';
import TypedName from './TypedName';
import PagesNav from './PagesNav';
import Brand from './Brand';
import LinkPreview from './LinkPreview';
import ThemeToggle from './ThemeToggle';
import ExperienceTimeline from './ExperienceTimeline';
import SpotifyStatus from './SpotifyStatus';
import QuietHeader from './QuietHeader';

const quietLink =
  'text-[13px] lowercase text-stone-500 dark:text-stone-400 underline decoration-stone-300 dark:decoration-stone-700 underline-offset-[3px] hover:text-stone-900 dark:hover:text-stone-100 hover:decoration-stone-500 transition-colors';

/**
 * The persistent left panel: who I am, always on screen. Routes only swap the
 * right panel. On mobile, subpages collapse this to name + nav + links so the
 * page content isn't a full screen of scrolling away.
 */
const IdentityPanel: React.FC = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <aside className="flex flex-col p-8 pt-10 lg:p-14 lg:h-full lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
      <div>
        <div className="reveal" style={{ animationDelay: '0s' }}>
          <PagesNav />
        </div>

        <section className="mt-8 reveal" style={{ animationDelay: '0.06s' }}>
          {/* nowrap, with the size capped by the panel width so the full "hey, i'm …"
              string (~11.1em in IBM Plex Mono, cursor included) never wraps or overflows */}
          <TypedName className="whitespace-nowrap text-[length:min(clamp(1.5rem,0.9rem+1.75vw,2.4rem),(100vw-72px)/11.1)] lg:text-[length:min(clamp(1.5rem,0.9rem+1.75vw,2.4rem),(40vw-126px)/11.1)]" />
          <div className="w-full max-w-md h-px bg-stone-200 dark:bg-stone-800 my-5" />
          <img
            src="/headshot.jpg"
            alt="Ethan Tran"
            className="w-32 h-32 rounded-xl object-cover ring-1 ring-inset ring-black/5 dark:ring-white/10 mb-5"
          />
          <p className="text-[14px] text-stone-600 dark:text-stone-300">
            computer engineering @{' '}
            <Brand name="University of Waterloo" label="UWaterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" />
          </p>
          <p className="text-[14px] leading-relaxed text-stone-600 dark:text-stone-300 mt-2">
            from firmware to PCBs to shipped hackathon builds — I love building hardware that
            feels like software and software that feels like hardware.
          </p>
        </section>

        {/* External links — underlined, unlike the pages nav above */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-6 reveal" style={{ animationDelay: '0.1s' }}>
          <LinkPreview href="https://github.com/kofucodes" title="GitHub" domain="github.com" className={quietLink}>
            github
          </LinkPreview>
          <LinkPreview href="https://linkedin.com/in/ethantrann" title="LinkedIn" domain="linkedin.com" className={quietLink}>
            linkedin
          </LinkPreview>
          <LinkPreview href="https://www.instagram.com/ethan.trrann/" title="Instagram" domain="instagram.com" className={quietLink}>
            instagram
          </LinkPreview>
          <a href="mailto:e64tran@uwaterloo.ca" className={quietLink}>
            email
          </a>
          <a href="/Ethan_Tran_Resume.pdf" target="_blank" rel="noopener noreferrer" className={quietLink}>
            resume
          </a>
          <span className="ml-auto opacity-70">
            <ThemeToggle />
          </span>
        </div>

        {/* Experience — hidden on mobile subpages so content stays close */}
        <section className={`mt-10 reveal ${isHome ? '' : 'hidden lg:block'}`} style={{ animationDelay: '0.16s' }}>
          <QuietHeader label="experience" />
          <ExperienceTimeline />
        </section>
      </div>

      {/* Bottom: now playing + copyright (desktop only — mobile gets its own
          footer at the end of the right panel) */}
      <div className="hidden lg:block mt-auto pt-10 reveal" style={{ animationDelay: '0.24s' }}>
        <div className="-ml-1.5 mb-3">
          <SpotifyStatus />
        </div>
        <p className="text-[12.5px] text-stone-500 dark:text-stone-400 select-none">
          © {new Date().getFullYear()} Ethan Tran · Waterloo, ON
        </p>
      </div>
    </aside>
  );
};

export default IdentityPanel;
