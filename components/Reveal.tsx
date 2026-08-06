import React, { useEffect, useRef } from 'react';

/**
 * Scroll reveal: children start faded + lifted and transition in the first
 * time they enter the viewport (CSS in index.html: .sreveal / .is-visible).
 */
const Reveal: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`sreveal ${className}`}>
      {children}
    </div>
  );
};

export default Reveal;
