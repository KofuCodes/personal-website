import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find(p => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl handwritten mb-4 text-[#2a2318] dark:text-[#f5e6d3]">Project not found</h1>
        <Link to="/projects" className="text-[#6b5744] dark:text-[#a1785d] underline mono">Back to projects</Link>
      </div>
    );
  }

  const relatedProjects = projects
    .filter(p => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      const thisCats = Array.isArray(project.category) ? project.category : [project.category];
      return p.slug !== project.slug && cats.some(c => thisCats.includes(c));
    })
    .slice(0, 2);

  return (
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
            {project.year} — {Array.isArray(project.category) ? project.category.join(', ') : project.category}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl handwritten tracking-tight mb-6 text-[#2a2318] dark:text-[#f5e6d3]">{project.title}</h1>
        <p className="text-xl text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed mb-8">{project.summary}</p>

        <div className="flex gap-4 flex-wrap">
          {project.links.github && (
            <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318] px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity handwritten shadow-md">GitHub</a>
          )}
          {project.links.website && (
            <a href={project.links.website} target="_blank" rel="noopener noreferrer" className="bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318] px-6 py-2 rounded-full text-sm font-semibold hover:opacity-80 transition-opacity handwritten shadow-md">Website</a>
          )}
          {project.links.demo && (
            <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="border-2 border-[#c4a882] dark:border-[#6b5744] px-6 py-2 rounded-full text-sm font-semibold hover:bg-[#f5f5dc] dark:hover:bg-[#3d2f1f] transition-colors text-[#2a2318] dark:text-[#f5e6d3] handwritten shadow-sm">Live Demo</a>
          )}
        </div>
      </header>

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
              <div className="bg-white dark:bg-[#f5f5dc] p-3 pb-8 shadow-[4px_6px_18px_rgba(0,0,0,0.25)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.5)] max-w-2xl w-full" style={{ transform: 'rotate(-0.5deg)' }}>
                <div className="w-full" dangerouslySetInnerHTML={{ __html: project.content.video }} />
              </div>
            </div>
          </section>
        )}

        {(project.content.buildImage || project.content.finishedImage) && (
          <section className={`grid grid-cols-1 ${project.content.buildImage && project.content.finishedImage ? 'md:grid-cols-2' : ''} gap-8`}>
            {project.content.buildImage && (
              <div className="bg-white dark:bg-[#f5f5dc] p-3 pb-10 shadow-[4px_6px_18px_rgba(0,0,0,0.25)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.5)] relative transition-transform duration-300 hover:rotate-0" style={{ transform: 'rotate(1deg)' }}>
                <div className="aspect-video overflow-hidden">
                  <img src={project.content.buildImage} alt="Build Process" className="w-full h-full object-cover sepia-[0.15] contrast-[1.05]" />
                </div>
                <p className="handwritten text-sm text-[#6b5744] dark:text-[#8B7355] absolute bottom-2 left-4">Build Process</p>
              </div>
            )}
            {project.content.finishedImage && (
              <div className="bg-white dark:bg-[#f5f5dc] p-3 pb-10 shadow-[4px_6px_18px_rgba(0,0,0,0.25)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.5)] relative transition-transform duration-300 hover:rotate-0" style={{ transform: 'rotate(-0.8deg)' }}>
                <div className="aspect-video overflow-hidden">
                  <img src={project.content.finishedImage} alt="Finished Project" className="w-full h-full object-cover sepia-[0.15] contrast-[1.05]" />
                </div>
                <p className="handwritten text-sm text-[#6b5744] dark:text-[#8B7355] absolute bottom-2 left-4">Finished</p>
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

      {relatedProjects.length > 0 && (
        <div className="mt-32 pt-20 border-t-2 border-[#c4a882] dark:border-[#6b5744]">
          <h2 className="text-2xl handwritten mb-10 text-[#2a2318] dark:text-[#f5e6d3]">Related Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {relatedProjects.map((p, i) => {
              const relColors = [
                { bg: '#f0e0f0', tape: '#e8a0c8', tapeAngle: -10 },
                { bg: '#d8e8f5', tape: '#4080e0', tapeAngle: 8 },
              ];
              const rc = relColors[i % relColors.length];
              const rot = i === 0 ? -1.5 : 1.2;
              const cats = Array.isArray(p.category) ? p.category : [p.category];
              return (
                <Link
                  key={p.slug}
                  to={`/projects/${p.slug}`}
                  className="group block transition-all duration-300 hover:scale-105 hover:z-10"
                  style={{ transform: `rotate(${rot}deg)` }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotate(0deg) scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = `rotate(${rot}deg)`; }}
                >
                  <div
                    className="shadow-[4px_6px_18px_rgba(0,0,0,0.25)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:shadow-[10px_14px_36px_rgba(0,0,0,0.4)] group-hover:-translate-y-2 relative pt-4"
                    style={{ backgroundColor: rc.bg }}
                  >
                    {/* Photo area */}
                    <div className="mx-3 mb-0 overflow-hidden" style={{ height: '140px' }}>
                      {p.content.buildImage ? (
                        <div className="w-full h-full relative">
                          <img src={p.content.buildImage} alt={p.title} className="w-full h-full object-cover sepia-[0.15] contrast-[1.05] group-hover:sepia-0 transition-all duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-2 left-3"><span className="mono text-[10px] font-bold text-white/90 uppercase tracking-widest drop-shadow">{p.year}</span></div>
                        </div>
                      ) : (
                        <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #d4a574 0%, #c4a882 40%, #8B7355 100%)' }}>
                          <div className="h-full flex items-end p-3"><span className="mono text-[10px] font-bold text-white/80 uppercase tracking-widest">{p.year}</span></div>
                        </div>
                      )}
                    </div>
                    {/* Caption */}
                    <div className="px-4 pt-3 pb-5 min-h-[100px] flex flex-col justify-between">
                      <div>
                        <p className="handwritten text-xl text-[#2a2318] leading-tight mb-1">{p.title}</p>
                        <p className="text-[10px] mono text-[#6b5744] leading-snug line-clamp-2">{p.summary}</p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {cats.slice(0, 2).map(cat => (
                          <span key={cat} className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 mono bg-[#2a2318]/80 text-white dark:bg-[#2a2318] dark:text-[#f5e6d3]" style={{ borderRadius: '2px' }}>{cat}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
