import React from 'react';

const About: React.FC = () => {
  return (
    <div className="py-24 max-w-3xl mx-auto relative z-10 polaroid-develop">
      {/* Page header */}
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl handwritten tracking-tight mb-4 text-[#2a2318] dark:text-[#f5e6d3]">About Me</h1>
        <div className="w-16 h-[2px] bg-[#d4a574] dark:bg-[#8B7355]" />
      </div>

      <div className="space-y-10">
        {/* Bio — Polaroid card */}
        <div
          className="bg-white dark:bg-[#f5f5dc] p-6 md:p-8 pb-10 shadow-[4px_6px_18px_rgba(0,0,0,0.2)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.45)] relative overflow-visible"
          style={{ transform: 'rotate(-0.5deg)' }}
        >
          {/* Colored tape */}
          <div className="absolute -top-3 left-8 z-10 w-14 h-6 opacity-75" style={{ transform: 'rotate(-10deg)', backgroundColor: '#e8a0c8', clipPath: 'polygon(3% 0%, 97% 0%, 100% 45%, 96% 100%, 4% 100%, 0% 55%)' }} />

          <div className="space-y-6 text-[#3d2f1f] leading-relaxed text-base md:text-lg">
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
          <p className="handwritten text-sm text-[#6b5744] dark:text-[#8B7355] mt-6 text-right">— ethan, 2025</p>
        </div>

        {/* Camera Story — Polaroid card */}
        <div
          className="bg-white dark:bg-[#f5f5dc] p-6 md:p-8 pb-10 shadow-[4px_6px_18px_rgba(0,0,0,0.2)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.45)] relative overflow-visible"
          style={{ transform: 'rotate(0.7deg)' }}
        >
          {/* Colored tape */}
          <div className="absolute -top-3 right-12 z-10 w-14 h-6 opacity-75" style={{ transform: 'rotate(6deg)', backgroundColor: '#a0d840', clipPath: 'polygon(3% 0%, 97% 0%, 100% 45%, 96% 100%, 4% 100%, 0% 55%)' }} />

          <h2 className="handwritten text-2xl md:text-3xl text-[#2a2318] dark:text-[#3d2f1f] mb-6">The Camera Story</h2>
          <div className="space-y-6 text-[#3d2f1f] leading-relaxed text-base md:text-lg">
            <p>
              Photography isn't just a side hobby for me, it's how I document the world, a dictionary of the world from my lens. It all started when i got flown out to San Francisco for a hackathon.
            </p>
            <p>
              In a moment of pure inspiration (and probably extreme sleep deprivation), I made my biggest impulsive purchase yet: my first dedicated digital camera. Since then, I've been obsessed with capturing urban architecture, the beauty of nature, details that most people overlook, and just memories for me to look back on.
            </p>
          </div>
        </div>

        {/* Quote — Pinned note */}
        <div className="flex justify-center py-4">
          <div
            className="relative bg-[#fffef5] dark:bg-[#f5f5dc] p-6 md:p-8 max-w-md shadow-[3px_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[3px_4px_12px_rgba(0,0,0,0.4)] overflow-visible"
            style={{ transform: 'rotate(1.5deg)' }}
          >
            {/* Colored tape */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-12 h-5 opacity-75" style={{ transform: 'rotate(-5deg)', backgroundColor: '#4080e0', clipPath: 'polygon(3% 0%, 97% 0%, 100% 45%, 96% 100%, 4% 100%, 0% 55%)' }} />
            <p className="handwritten text-lg md:text-xl text-[#3d2f1f] dark:text-[#2a2318] italic text-center leading-relaxed">
              "The best hardware is the one you have with you—especially when it's built as beautifully as a Sony Cybershot DSC-W130."
            </p>
          </div>
        </div>

        {/* Technical Stack — Polaroid card */}
        <div
          className="bg-white dark:bg-[#f5f5dc] p-6 md:p-8 pb-10 shadow-[4px_6px_18px_rgba(0,0,0,0.2)] dark:shadow-[4px_6px_18px_rgba(0,0,0,0.45)] relative overflow-visible"
          style={{ transform: 'rotate(-0.3deg)' }}
        >
          {/* Colored tape */}
          <div className="absolute -top-3 left-10 z-10 w-14 h-6 opacity-75" style={{ transform: 'rotate(4deg)', backgroundColor: '#e8a020', clipPath: 'polygon(3% 0%, 97% 0%, 100% 45%, 96% 100%, 4% 100%, 0% 55%)' }} />

          <h2 className="text-[11px] mono uppercase tracking-[0.2em] text-[#8B7355] dark:text-[#a1785d] mb-8">Technical Stack</h2>
          <div className="space-y-8">
            <div>
              <h3 className="handwritten text-lg text-[#2a2318] dark:text-[#3d2f1f] mb-4">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {['Swift', 'Java', 'C++', 'Python', 'C#', 'TypeScript', 'SQL'].map(tool => (
                  <span key={tool} className="px-3 py-1.5 bg-[#f5e6d3] dark:bg-[#3d2f1f]/80 border border-[#c4a882] dark:border-[#6b5744] rounded text-xs font-medium text-[#6b5744] dark:text-[#a1785d] mono shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="handwritten text-lg text-[#2a2318] dark:text-[#3d2f1f] mb-4">Frameworks & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {['React', 'Next.js', 'Arduino', 'SolidWorks', 'Unity', 'Xcode', 'VS Code'].map(tool => (
                  <span key={tool} className="px-3 py-1.5 bg-[#f5e6d3] dark:bg-[#3d2f1f]/80 border border-[#c4a882] dark:border-[#6b5744] rounded text-xs font-medium text-[#6b5744] dark:text-[#a1785d] mono shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;