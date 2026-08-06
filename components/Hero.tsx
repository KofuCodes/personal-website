import React from 'react';
import TypedName from './TypedName';
import Brand from './Brand';
import LinkPreview from './LinkPreview';

const quietLink =
  'text-[13px] lowercase text-stone-500 dark:text-stone-400 underline decoration-stone-300 dark:decoration-stone-700 underline-offset-[3px] hover:text-stone-900 dark:hover:text-stone-100 hover:decoration-stone-500 transition-colors';

/**
 * Top of the index page: typed name, headshot, bio, and the external links —
 * everything that used to live in the left rail, now stacked above the rest.
 */
const Hero: React.FC = () => (
  <section className="mt-9 reveal" style={{ animationDelay: '0.06s' }}>
    {/* nowrap, with the size capped by the column width so the full
        "xin chào, i'm …" string (~14.5em in IBM Plex Mono) never wraps */}
    <TypedName className="whitespace-nowrap text-[length:min(2.4rem,calc((100vw_-_4rem)_/_14.5))]" />

    <div className="h-px bg-stone-200 dark:bg-stone-800 my-6" />

    {/* Headshot with the bio and links beside it (stacked on mobile) */}
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
      <img
        src="/headshot.jpg"
        alt="Ethan Tran"
        className="w-32 h-32 flex-shrink-0 rounded-xl object-cover ring-1 ring-inset ring-black/5 dark:ring-white/10"
      />
      {/* Capped so the bio keeps a readable measure on a wide column */}
      <div className="flex-1 min-w-0 max-w-2xl">
        <p className="text-[14px] text-stone-600 dark:text-stone-300">
          computer engineering @{' '}
          <Brand name="University of Waterloo" label="UWaterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" />
        </p>
        <p className="text-[14px] leading-relaxed text-stone-600 dark:text-stone-300 mt-2">
          from firmware to PCBs to shipped hackathon builds — I love building hardware that
          feels like software and software that feels like hardware.
        </p>

        {/* External links — underlined, unlike the pages nav up top */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4">
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
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
