import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Project } from '../types';

const StoryBlock: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section>
    <h3 className="mono text-[10px] uppercase tracking-wider text-stone-400 mb-1">
      {label}
    </h3>
    <p className="text-[13.5px] leading-relaxed text-stone-200">{children}</p>
  </section>
);

/**
 * Project detail as a modal over the page — everything stays on the home
 * page, no navigation. Esc or backdrop click closes; media (video + photos)
 * on the left, the story on the right (stacked on mobile).
 */
const ProjectModal: React.FC<{ project: Project | null; onClose: () => void }> = ({
  project,
  onClose,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // True only when a mousedown started on the backdrop itself — a text-selection
  // drag that ends past the card edge must not close the modal.
  const backdropDown = useRef(false);

  // Escape closes; Tab is trapped inside the dialog
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const root = rootRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!root.contains(active)) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  // Scroll lock while open
  useEffect(() => {
    if (!project) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [project]);

  // Move focus into the dialog on open; restore it to the opener on close
  useEffect(() => {
    if (!project) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    return () => opener?.focus?.();
  }, [project]);

  if (!project) return null;

  const categories = Array.isArray(project.category) ? project.category : [project.category];
  const hasMedia = !!(project.content.video || project.content.buildImage || project.content.finishedImage);

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] overflow-y-auto overscroll-contain bg-black/90 modal-fade"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
    >
      {/* Close button */}
      <button
        ref={closeRef}
        onClick={onClose}
        className="fixed top-4 right-4 z-[110] w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <line x1="3" y1="3" x2="13" y2="13" />
          <line x1="13" y1="3" x2="3" y2="13" />
        </svg>
      </button>

      <div
        className="min-h-full flex items-start lg:items-center justify-center p-4 pt-16 lg:p-8"
        onMouseDown={(e) => {
          backdropDown.current = e.target === e.currentTarget;
        }}
        onClick={(e) => {
          if (backdropDown.current && e.target === e.currentTarget) onClose();
          backdropDown.current = false;
        }}
      >
        <div
          className={`modal-pop flex flex-col lg:flex-row gap-6 w-full ${hasMedia ? 'max-w-4xl' : 'max-w-md'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Media column */}
          {hasMedia && (
            <div className="flex-1 min-w-0 space-y-3">
              {project.content.video && (
                <div
                  className="overflow-hidden rounded-lg ring-1 ring-white/10"
                  dangerouslySetInnerHTML={{ __html: project.content.video }}
                />
              )}
              {project.content.buildImage && (
                <img
                  src={project.content.buildImage}
                  alt={`${project.title} — build`}
                  className="w-full h-auto rounded-lg ring-1 ring-white/10"
                />
              )}
              {project.content.finishedImage && (
                <img
                  src={project.content.finishedImage}
                  alt={`${project.title} — finished`}
                  className="w-full h-auto rounded-lg ring-1 ring-white/10"
                />
              )}
            </div>
          )}

          {/* Story column */}
          <div className="w-full lg:w-96 shrink-0 pb-8 lg:pb-0">
            <div className="mono text-[10px] uppercase tracking-wider text-stone-400 mb-2">
              {project.year} · {categories.join(' · ')}
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white mb-1.5">{project.title}</h2>
            <p className="text-[14px] leading-relaxed text-stone-300 mb-5">{project.summary}</p>

            <div className="space-y-4">
              <StoryBlock label="The problem">{project.content.problem}</StoryBlock>
              <StoryBlock label="The solution">{project.content.solution}</StoryBlock>
              <StoryBlock label="The build">{project.content.build}</StoryBlock>
              <StoryBlock label="What I learned">{project.content.learned}</StoryBlock>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-5">
              {project.tags.map((tag) => (
                <span key={tag} className="mono text-[10px] text-stone-400 border border-white/15 rounded px-1.5 py-0.5">
                  {tag}
                </span>
              ))}
            </div>

            {(project.links.github || project.links.website || project.links.demo) && (
              <div className="flex gap-2 flex-wrap mt-5">
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[12.5px] font-medium px-3.5 py-1.5 rounded-full bg-white text-stone-900 hover:opacity-85 transition-opacity"
                  >
                    GitHub ↗
                  </a>
                )}
                {project.links.website && (
                  <a
                    href={project.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[12.5px] font-medium px-3.5 py-1.5 rounded-full bg-white text-stone-900 hover:opacity-85 transition-opacity"
                  >
                    Website ↗
                  </a>
                )}
                {project.links.demo && (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border border-white/25 text-white hover:bg-white/10 transition-colors"
                  >
                    Live demo ↗
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectModal;
