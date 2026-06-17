import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';
import WorkList from '../components/WorkList';

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <section>
    <h2 className="mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">{label}</h2>
    <p className="text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">{children}</p>
  </section>
);

const Figure: React.FC<{ src: string; caption: string }> = ({ src, caption }) => (
  <figure>
    <div className="aspect-video overflow-hidden rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10">
      <img src={src} alt={caption} className="w-full h-full object-cover" />
    </div>
    <figcaption className="mono text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">{caption}</figcaption>
  </figure>
);

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-6 pt-28 pb-12 text-center">
        <h1 className="text-xl font-semibold mb-3">Project not found</h1>
        <Link to="/projects" className="text-[14px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 underline underline-offset-4">
          Back to work
        </Link>
      </div>
    );
  }

  const categories = Array.isArray(project.category) ? project.category : [project.category];

  const relatedProjects = projects
    .filter((p) => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      return p.slug !== project.slug && cats.some((c) => categories.includes(c));
    })
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-10"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Work
      </Link>

      <header className="mb-10 reveal">
        <div className="mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
          {project.year} · {categories.join(' · ')}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight mb-3">{project.title}</h1>
        <p className="text-[16px] leading-relaxed text-neutral-600 dark:text-neutral-300 mb-6">{project.summary}</p>

        <div className="flex gap-2 flex-wrap">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-85 transition-opacity">
              GitHub
            </a>
          )}
          {project.links.website && (
            <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[13px] font-medium px-3.5 py-1.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:opacity-85 transition-opacity">
              Website
            </a>
          )}
          {project.links.demo && (
            <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-[13px] font-medium px-3.5 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
              Live demo
            </a>
          )}
        </div>
      </header>

      <div className="space-y-10 border-t border-neutral-200 dark:border-neutral-800 pt-10 reveal" style={{ animationDelay: '0.08s' }}>
        <Section label="The problem">{project.content.problem}</Section>
        <Section label="The solution">{project.content.solution}</Section>

        {project.content.video && (
          <section>
            <h2 className="mono text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">Video</h2>
            <div className="overflow-hidden rounded-lg ring-1 ring-inset ring-black/5 dark:ring-white/10" dangerouslySetInnerHTML={{ __html: project.content.video }} />
          </section>
        )}

        {(project.content.buildImage || project.content.finishedImage) && (
          <div className={`grid grid-cols-1 ${project.content.buildImage && project.content.finishedImage ? 'sm:grid-cols-2' : ''} gap-4`}>
            {project.content.buildImage && <Figure src={project.content.buildImage} caption="Build process" />}
            {project.content.finishedImage && <Figure src={project.content.finishedImage} caption="Finished" />}
          </div>
        )}

        <Section label="The build">{project.content.build}</Section>
        <Section label="What I learned">{project.content.learned}</Section>
      </div>

      {relatedProjects.length > 0 && (
        <div className="mt-16">
          <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4">More work</h2>
          <WorkList projects={relatedProjects} />
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
