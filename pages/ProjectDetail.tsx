import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const project = projects.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4 dark:text-zinc-100">Project not found</h1>
        <Link to="/projects" className="text-zinc-500 dark:text-zinc-400 underline mono">Back to projects</Link>
      </div>
    );
  }

  const relatedProjects = projects.filter(p => p.category === project.category && p.slug !== project.slug).slice(0, 2);

  return (
    <div className="py-20 max-w-3xl mx-auto">
      <Link to="/projects" className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-black dark:hover:text-white transition-colors mb-12 mono">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to projects
      </Link>

      <header className="mb-16">
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600 bg-zinc-50 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">
            {project.year} — {project.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6 dark:text-zinc-100">{project.title}</h1>
        <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">{project.summary}</p>
        
        <div className="flex gap-4">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity font-heading">
              GitHub
            </a>
          )}
          {project.links.website && (
            <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity font-heading">
              Website
            </a>
          )}
          {project.links.demo && (
            <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="border border-zinc-200 dark:border-zinc-800 px-6 py-2 rounded-full text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors dark:text-zinc-100 font-heading">
              Live Demo
            </a>
          )}
        </div>
      </header>

      {/* Main Content Sections */}
      <div className="space-y-16 border-t border-zinc-100 dark:border-zinc-900 pt-16">
        <section>
          <h2 className="text-[11px] mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6">The Problem</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">{project.content.problem}</p>
        </section>

        <section>
          <h2 className="text-[11px] mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6">The Solution</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">{project.content.solution}</p>
        </section>

        {project.content.video && (
          <section>
            <h2 className="text-[11px] mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6">Video</h2>
            <div className="flex justify-center">
              <div dangerouslySetInnerHTML={{ __html: project.content.video }} />
            </div>
          </section>
        )}

        {/* Project Images */}
        {(project.content.buildImage || project.content.finishedImage) && (
          <section className={`grid grid-cols-1 ${project.content.buildImage && project.content.finishedImage ? 'md:grid-cols-2' : ''} gap-4`}>
            {project.content.buildImage && (
              <div className="aspect-video bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <img src={project.content.buildImage} alt="Build Process" className="w-full h-full object-cover" />
              </div>
            )}
            {project.content.finishedImage && (
              <div className="aspect-video bg-zinc-50 dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800">
                <img src={project.content.finishedImage} alt="Finished Project" className="w-full h-full object-cover" />
              </div>
            )}
          </section>
        )}

        <section>
          <h2 className="text-[11px] mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6">The Build</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">{project.content.build}</p>
        </section>

        <section>
          <h2 className="text-[11px] mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-6">What I Learned</h2>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-lg">{project.content.learned}</p>
        </section>
      </div>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="mt-32 pt-20 border-t border-zinc-100 dark:border-zinc-900">
          <h2 className="text-2xl font-heading font-bold mb-10 dark:text-zinc-100">Related Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProjects.map(p => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;