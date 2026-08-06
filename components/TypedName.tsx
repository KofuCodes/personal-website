import React, { useEffect, useState } from 'react';

const PREFIX = "xin chào, i'm ";
const NAME = 'Ethan Tran';
const TYPED_PAUSE = 1100;
const START_DELAY = 650;

type Phase = 'idle' | 'typing' | 'deleting' | 'done';

// Play the type-out once per page load. The hero now lives inside <Routes>, so
// navigating gallery → index remounts it, and replaying the ~9s intro every
// time would be tiresome.
let hasPlayed = false;

/** Human-ish keystroke delay: mostly steady, with occasional hesitation. */
const typeDelay = () =>
  Math.random() < 0.12 ? 260 + Math.random() * 180 : 95 + Math.random() * 80;

/** Backspace rhythm: quick bursts broken up by pauses. */
const deleteDelay = () =>
  Math.random() < 0.28 ? 320 + Math.random() * 260 : 75 + Math.random() * 55;

/**
 * Hero heading that types out "xin chào, i'm Ethan Tran", pauses, then
 * backspaces the "xin chào, i'm " part so only the name remains.
 */
const TypedName: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [prefixCount, setPrefixCount] = useState(0);
  const [nameCount, setNameCount] = useState(hasPlayed ? NAME.length : 0);
  const [phase, setPhase] = useState<Phase>(hasPlayed ? 'done' : 'idle');

  useEffect(() => {
    if (phase === 'done') {
      hasPlayed = true;
      return;
    }

    // Reduced motion: skip straight to the final state
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const id = window.setTimeout(() => {
        setPrefixCount(0);
        setNameCount(NAME.length);
        setPhase('done');
      }, 0);
      return () => window.clearTimeout(id);
    }

    let id: number;
    if (phase === 'idle') {
      id = window.setTimeout(() => setPhase('typing'), START_DELAY);
    } else if (phase === 'typing') {
      if (prefixCount < PREFIX.length) {
        id = window.setTimeout(() => setPrefixCount((c) => c + 1), typeDelay());
      } else if (nameCount < NAME.length) {
        id = window.setTimeout(() => setNameCount((c) => c + 1), typeDelay());
      } else {
        id = window.setTimeout(() => setPhase('deleting'), TYPED_PAUSE);
      }
    } else {
      if (prefixCount > 0) {
        id = window.setTimeout(() => setPrefixCount((c) => c - 1), deleteDelay());
      } else {
        id = window.setTimeout(() => setPhase('done'), 600);
      }
    }
    return () => window.clearTimeout(id);
  }, [phase, prefixCount, nameCount]);

  const typedAll = prefixCount === PREFIX.length && nameCount === NAME.length;
  const blinking = phase === 'idle' || (phase === 'typing' && typedAll);

  const cursor = (
    <span
      aria-hidden="true"
      className={`inline-block w-[3px] h-[0.72em] ml-[0.08em] bg-coral ${
        blinking ? 'animate-blink' : ''
      }`}
    />
  );

  return (
    <h1 className={`font-semibold tracking-tight leading-tight text-stone-500 dark:text-stone-400 ${className}`}>
      <span className="sr-only">xin chào, i&apos;m Ethan Tran</span>
      <span aria-hidden="true">
        {PREFIX.slice(0, prefixCount)}
        {phase === 'deleting' && cursor}
        <span className="text-stone-900 dark:text-stone-100">{NAME.slice(0, nameCount)}</span>
        {phase !== 'deleting' && phase !== 'done' && cursor}
      </span>
    </h1>
  );
};

export default TypedName;
