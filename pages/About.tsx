import React from 'react';

const About: React.FC = () => {
  return (
    <div className="py-24 max-w-2xl mx-auto polaroid-develop">
      <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-12 text-[#2a2318] dark:text-[#f5e6d3]">About Me</h1>

      <div className="space-y-8 text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed text-lg">
        <p>
          I'm a Computer Engineering student @ University of Waterloo with a passion for building hardware that feels like software, and software that feels like hardware.
        </p>
        <p>
          My interest in engineering really clicked at a hardware hackathon in Toronto, where my team built a disco ball that could detect motion, spin up music, and light up in sync. Watching something we wired and coded react instantly to people in the room made everything feel real in a way classes hadn't yet. That experience pulled me into embedded systems, firmware, and PCB design, and I've been hooked on building things that connect physical inputs to responsive, interactive outputs ever since.
        </p>
        <p>
          Beyond the classroom, I'm an active participant in hackathons and student organizations, where I focus on shipping tangible products that solve real problems. I aim for "builder" energy in everything I create.
        </p>
      </div>

      <section className="mt-24">
        <h2 className="text-2xl font-heading font-bold mb-8 text-[#2a2318] dark:text-[#f5e6d3]">The Camera Story</h2>
        <div className="space-y-6 text-[#3d2f1f] dark:text-[#d4a574] leading-relaxed">
          <p>
            Photography isn't just a side hobby for me, it's how I document the world, a dictionary of the world from my lens. It all started when i got flown out to San Francisco for a hackathon.
          </p>
          <p>
            In a moment of pure inspiration (and probably extreme sleep deprivation), I made my biggest impulsive purchase yet: my first dedicated digital camera. Since then, I've been obsessed with capturing urban architecture, the beauty of nature, details that most people overlook, and just memories for me to look back on.
          </p>
          <div className="p-6 bg-[#f5f5dc] dark:bg-[#3d2f1f] border border-[#c4a882] dark:border-[#6b5744] rounded-2xl italic text-sm shadow-md">
            "The best hardware is the one you have with you—especially when it's built as beautifully as a Sony Cybershot DSC-W130."
          </div>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-[11px] mono uppercase tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] mb-8">Technical Stack</h2>
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-[#2a2318] dark:text-[#f5e6d3] mb-4 font-heading">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {['Swift', 'Java', 'C++', 'Python', 'C#', 'TypeScript', 'SQL'].map(tool => (
                <span key={tool} className="px-3 py-1 bg-[#f5f5dc] dark:bg-[#3d2f1f] border border-[#c4a882] dark:border-[#6b5744] rounded-lg text-xs font-medium text-[#6b5744] dark:text-[#a1785d] mono">
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#2a2318] dark:text-[#f5e6d3] mb-4 font-heading">Frameworks & Tools</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'Next.js', 'Arduino', 'SolidWorks', 'Unity', 'Xcode', 'VS Code'].map(tool => (
                <span key={tool} className="px-3 py-1 bg-[#f5f5dc] dark:bg-[#3d2f1f] border border-[#c4a882] dark:border-[#6b5744] rounded-lg text-xs font-medium text-[#6b5744] dark:text-[#a1785d] mono">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;