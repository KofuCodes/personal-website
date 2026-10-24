import React from 'react';
import QuietHeader from '../components/QuietHeader';

const resumeHref = '/Ethan_Tran_Resume.pdf';

const quietLink =
  'lowercase underline decoration-ink-300 underline-offset-[3px] hover:text-ink-900 hover:decoration-ink-500 transition-colors';

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
          className={`ml-auto text-[13px] text-ink-500 ${quietLink}`}
        >
          download ↓
        </a>
      </QuietHeader>
      <p className="text-[14.5px] text-ink-500">the one-pager.</p>
    </header>

    {/* The PDF page is white, so the frame is too (not paper) */}
    <div className="reveal overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-inset ring-black/5">
      <object
        data={`${resumeHref}#toolbar=0&navpanes=0&view=FitH`}
        type="application/pdf"
        aria-label="Ethan Tran's resume"
        className="w-full aspect-[8.5/11]"
      >
        <p className="p-6 text-[14.5px] text-ink-600">
          your browser can't preview PDFs here —{' '}
          <a
            href={resumeHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-medium text-ink-900 ${quietLink}`}
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
