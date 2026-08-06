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

    {/* The inner layer is absolute so it gets a definite height: `h-full`
        inside a flex-1 box resolves against flex-basis 0%, i.e. to nothing,
        which left the canvas stuck at its intrinsic 150px. */}
    <div className="relative mt-6 w-full flex-1 min-h-[180px]">
      <div className="absolute inset-0">
        <Suspense fallback={<div className="h-full w-full" />}>
          <ClosedLoopControlTerrain />
        </Suspense>
      </div>
    </div>
    <p className="mt-2.5 text-center text-[12.5px] italic text-stone-500 dark:text-stone-400">
      I'm always self-adjusting to the targeted goal
    </p>
  </section>
);

export default Home;
