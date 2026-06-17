import React from 'react';
import Brand from '../components/Brand';
import Aperture from '../components/Aperture';

const languages = ['Swift', 'Java', 'C++', 'Python', 'C#', 'TypeScript', 'SQL'];
const tools = ['React', 'Next.js', 'Arduino', 'SolidWorks', 'Unity', 'Xcode', 'VS Code'];

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-[13px] px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300">
    {children}
  </span>
);

const About: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 pt-28 pb-12">
      <header className="mb-10 reveal">
        <h1 className="text-2xl font-semibold tracking-tight">About</h1>
      </header>

      <div className="space-y-12">
        <section className="space-y-4 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300 reveal" style={{ animationDelay: '0.04s' }}>
          <p>
            I'm a Computer Engineering student at{' '}
            <Brand name="University of Waterloo" domain="uwaterloo.ca" href="https://uwaterloo.ca" /> with a passion
            for building hardware that feels like software, and software that feels like hardware.
          </p>
          <p>
            It clicked at a hardware hackathon in Toronto, where my team built a disco ball that detected motion,
            spun up music, and lit up in sync. Watching something we wired and coded react instantly to the room made
            everything feel real in a way classes hadn't yet. That pulled me into embedded systems, firmware, and PCB
            design — and I've been hooked on connecting physical inputs to responsive outputs ever since.
          </p>
          <p>
            Beyond class, I spend a lot of time at hackathons and student organizations, focused on shipping tangible
            products that solve real problems. I aim for builder energy in everything I make.
          </p>
        </section>

        <section className="reveal" style={{ animationDelay: '0.1s' }}>
          <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-4 flex items-center gap-2">
            <Aperture className="w-3.5 h-3.5" /> The camera story
          </h2>
          <div className="space-y-4 text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
            <p>
              Photography isn't just a side hobby — it's how I document the world, a dictionary of places seen through
              my lens. It started when I got flown out to San Francisco for a hackathon.
            </p>
            <p>
              In a moment of pure inspiration (and probably extreme sleep deprivation), I made my biggest impulse
              purchase yet: my first dedicated camera, a Sony Cybershot. Since then
              I've been obsessed with capturing urban architecture, nature, and the details most people overlook.
            </p>
          </div>
        </section>

        <section className="reveal" style={{ animationDelay: '0.16s' }}>
          <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 text-[15px] italic text-neutral-600 dark:text-neutral-300 leading-relaxed">
            "The best hardware is the one you have with you — especially when it's built as beautifully as a Sony
            Cybershot DSC-W130."
          </blockquote>
        </section>

        <section className="reveal" style={{ animationDelay: '0.22s' }}>
          <h2 className="mono text-[12px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-5">Stack</h2>
          <div className="space-y-5">
            <div>
              <h3 className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 mb-2.5">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languages.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
            <div>
              <h3 className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400 mb-2.5">Frameworks &amp; tools</h3>
              <div className="flex flex-wrap gap-2">
                {tools.map((t) => <Tag key={t}>{t}</Tag>)}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
