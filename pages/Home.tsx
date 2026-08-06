import React, { Suspense, lazy } from 'react';
import About from '../components/About';
import QuietHeader from '../components/QuietHeader';

// Heavy (three.js) — code-split so it doesn't block the initial page load.
const ClosedLoopControlTerrain = lazy(() => import('../components/ClosedLoopControlTerrain'));

/**
 * Index: the about list, then the closed-loop terrain. The terrain is the flex
 * child that absorbs whatever height is left over, so the whole page lands
 * inside one viewport without scrolling.
 */
const Home: React.FC = () => (
  <section className="reveal flex flex-1 flex-col">
    <div>
      <QuietHeader label="about" />
      <About />
    </div>

    <div className="mt-6 flex-1 min-h-[180px] w-full">
      <Suspense fallback={<div className="h-full w-full" />}>
        <ClosedLoopControlTerrain />
      </Suspense>
    </div>
    <p className="mt-2.5 text-center text-[12.5px] italic text-stone-500 dark:text-stone-400">
      I'm always self-adjusting to the targeted goal
    </p>
  </section>
);

export default Home;
