import React from 'react';
import QuietHeader from '../components/QuietHeader';

const resumeHref = '/Ethan_Tran_Resume.pdf';

const quietLink =
  'lowercase underline decoration-stone-300 dark:decoration-stone-700 underline-offset-[3px] hover:text-stone-900 dark:hover:text-stone-100 hover:decoration-stone-500 transition-colors';

/**
 * The resume embedded on the page. The URL fragment hides the viewer chrome
 * in browsers that honor it; browsers that can't inline PDFs (most phones)
 * render the fallback link inside <object> instead.
 */
const Resume: React.FC = () => (
  <section>
    <header className="mb-8 reveal">
      <QuietHeader label="resume">
        <a
          href={resumeHref}
          download="Ethan_Tran_Resume.pdf"
          className={`ml-auto mono text-[12px] text-stone-500 dark:text-stone-400 ${quietLink}`}
        >
          download ↓
        </a>
      </QuietHeader>
      <p className="text-[13.5px] text-stone-500 dark:text-stone-400">the one-pager.</p>
    </header>

    {/* The PDF page is white either way, so the frame stays bg-white in dark mode */}
    <div className="reveal overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-inset ring-black/5 dark:ring-white/10">
      <object
        data={`${resumeHref}#toolbar=0&navpanes=0&view=FitH`}
        type="application/pdf"
        aria-label="Ethan Tran's resume"
        className="w-full aspect-[8.5/11]"
      >
        <p className="p-6 text-[13.5px] text-stone-600">
          your browser can't preview PDFs here —{' '}
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium text-stone-900 ${quietLink}`}
          >
            open the resume
          </a>{' '}
          instead.
        </p>
      </object>
    </div>
  </section>
);

export default Resume;
