import React from 'react';
import Brand from './Brand';
import LinkPreview from './LinkPreview';
import SpotifyStatus from './SpotifyStatus';

const quietLink =
  'text-[14px] lowercase text-ink-500 underline decoration-ink-300 underline-offset-[3px] hover:text-ink-900 hover:decoration-ink-500 transition-colors';

/**
 * The persistent identity block: name (with now-playing sharing its line),
 * headshot, bio, and external links. Lives in the shell above the pages nav,
 * so it never changes as routes swap.
 */
const Hero: React.FC = () => (
  // relative z-30: .reveal makes this a stacking context, which would otherwise
  // trap the link-preview cards below later siblings (the terrain HUD is z-10).
  <section className="relative z-30 reveal" style={{ animationDelay: '0.06s' }}>
    {/* Name left, now playing right. Below sm they stack above the name
        instead, since the two can't share a 360px line. */}
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <h1 className="whitespace-nowrap text-[2rem] sm:text-[2.25rem] font-semibold tracking-tight leading-tight text-ink-900">
        Ethan Tran
      </h1>

      <div className="flex shrink-0 items-center gap-1 self-end sm:self-auto">
        {/* Fixed slot: the cluster is right-aligned, so letting the widget size
            to the track title would slide the row on every song. */}
        <div className="flex w-[46px] shrink-0 justify-start sm:w-[184px]">
          <SpotifyStatus />
        </div>
      </div>
    </div>

    <div className="brush-rule my-5" aria-hidden="true" />

    {/* Headshot with the bio and links beside it (stacked on mobile) */}
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
      <img
        src="/headshot.jpg"
        alt="Ethan Tran"
        className="w-28 h-28 flex-shrink-0 rounded-xl object-cover ring-1 ring-inset ring-black/5"
      />
      {/* Capped so the bio keeps a readable measure on a wide column */}
      <div className="flex-1 min-w-0 max-w-2xl">
        <p className="text-[14px] sm:text-[15px] text-ink-600">
          computer engineering @{' '}
          <Brand name="University of Waterloo" label="UWaterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" />
        </p>
        <p className="text-[14px] sm:text-[15px] leading-relaxed text-ink-600 mt-2">
          from firmware to PCBs to shipped hackathon builds — I love building hardware that
          feels like software and software that feels like hardware.
        </p>

        {/* External links — underlined, unlike the pages nav below */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
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
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
