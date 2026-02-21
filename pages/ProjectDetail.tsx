import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { projects } from '../data/projects';
import ProjectCard from '../components/ProjectCard';
import ReactBitsBackground from '../components/ReactBitsBackground';

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
        <h1 className="text-2xl font-heading font-bold mb-4 text-[#2a2318] dark:text-[#f5e6d3]">Project not found</h1>
        <Link to="/projects" className="text-[#6b5744] dark:text-[#a1785d] underline mono">Back to projects</Link>
      </div>
    );
  }

  const relatedProjects = projects.filter(p => p.category === project.category && p.slug !== project.slug).slice(0, 2);

  return (
    <>
      <ReactBitsBackground />
      <div className="py-20 max-w-3xl mx-auto relative z-10">
        <Link to="/projects" className="inline-flex items-center text-sm font-medium text-[#8B7355] hover:text-[#2a2318] dark:text-[#a1785d] dark:hover:text-[#f5e6d3] transition-colors mb-12 mono">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to projects
        </Link>

        <header className="mb-16">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="mono text-[10px] uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] bg-white dark:bg-[#3d2f1f] px-3 py-1 rounded-full border border-[#c4a882] dark:border-[#6b5744] shadow-sm">
              {project.year} — {project.category}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-6 text-[#2a2318] dark:text-[#f5e6d3]">{project.title}</h1>
          <p className="text-xl text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed mb-8">{project.summary}</p>

          <div className="flex gap-4">
            {project.links.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318] px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity font-heading shadow-md">
                GitHub
              </a>
            )}
            {project.links.website && (
              <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318] px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity font-heading shadow-md">
                Website
              </a>
            )}
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="border-2 border-[#c4a882] dark:border-[#6b5744] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#f5f5dc] dark:hover:bg-[#3d2f1f] transition-colors text-[#2a2318] dark:text-[#f5e6d3] font-heading shadow-sm">
                Live Demo
              </a>
            )}
          </div>
        </header>

        {/* Main Content Sections */}
        <div className="space-y-16 border-t-2 border-[#c4a882] dark:border-[#6b5744] pt-16">
          <section>
            <h2 className="text-[11px] mono uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] mb-6">The Problem</h2>
            <p className="text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed text-lg">{project.content.problem}</p>
          </section>

          <section>
            <h2 className="text-[11px] mono uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] mb-6">The Solution</h2>
            <p className="text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed text-lg">{project.content.solution}</p>
          </section>

          {project.content.video && (
            <section>
              <h2 className="text-[11px] mono uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] mb-6">Video</h2>
              <div className="flex justify-center">
                <div dangerouslySetInnerHTML={{ __html: project.content.video }} />
              </div>
            </section>
          )}

          {/* Project Images */}
          {(project.content.buildImage || project.content.finishedImage) && (
            <section className={`grid grid-cols-1 ${project.content.buildImage && project.content.finishedImage ? 'md:grid-cols-2' : ''} gap-4`}>
              {project.content.buildImage && (
                <div className="aspect-video bg-white dark:bg-[#f5f5dc] rounded-lg overflow-hidden border-4 border-white dark:border-[#f5f5dc] shadow-[4px_4px_12px_rgba(0,0,0,0.3)]">
                  <img src={project.content.buildImage} alt="Build Process" className="w-full h-full object-cover sepia-[0.15]" />
                </div>
              )}
              {project.content.finishedImage && (
                <div className="aspect-video bg-white dark:bg-[#f5f5dc] rounded-lg overflow-hidden border-4 border-white dark:border-[#f5f5dc] shadow-[4px_4px_12px_rgba(0,0,0,0.3)]">
                  <img src={project.content.finishedImage} alt="Finished Project" className="w-full h-full object-cover sepia-[0.15]" />
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="text-[11px] mono uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] mb-6">The Build</h2>
            <p className="text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed text-lg">{project.content.build}</p>
          </section>

          <section>
            <h2 className="text-[11px] mono uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] mb-6">What I Learned</h2>
            <p className="text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed text-lg">{project.content.learned}</p>
          </section>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <div className="mt-32 pt-20 border-t-2 border-[#c4a882] dark:border-[#6b5744]">
            <h2 className="text-2xl font-heading font-bold mb-10 text-[#2a2318] dark:text-[#f5e6d3]">Related Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedProjects.map(p => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectDetail;