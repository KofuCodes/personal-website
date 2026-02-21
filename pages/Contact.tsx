
import React from 'react';
import ReactBitsBackground from '../components/ReactBitsBackground';

const Contact: React.FC = () => {
  return (
    <>
      <ReactBitsBackground />
      <div className="py-20 max-w-2xl mx-auto relative z-10">
        <header className="mb-16">
          <h1 className="text-4xl tracking-tight mb-6 text-[#2a2318] dark:text-[#f5e6d3] handwritten">Let's connect</h1>
          <p className="text-[#6b5744] dark:text-[#a1785d] text-lg">
            Whether you want to talk about embedded systems, recruitment, or just say hi, feel free to reach out.
          </p>
        </header>

        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a href="mailto:e64tran@uwaterloo.ca" className="p-6 border-2 border-[#c4a882] dark:border-[#6b5744] rounded-lg hover:bg-[#f5f5dc] dark:hover:bg-[#3d2f1f] transition-colors group shadow-md">
              <span className="mono text-[10px] uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] block mb-2">Email</span>
              <span className="text-lg font-bold group-hover:underline underline-offset-4 decoration-1 text-[#2a2318] dark:text-[#f5e6d3]">e64tran@uwaterloo.ca</span>
            </a>
            <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="p-6 border-2 border-[#c4a882] dark:border-[#6b5744] rounded-lg hover:bg-[#f5f5dc] dark:hover:bg-[#3d2f1f] transition-colors group shadow-md">
              <span className="mono text-[10px] uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] block mb-2">LinkedIn</span>
              <span className="text-lg font-bold group-hover:underline underline-offset-4 decoration-1 text-[#2a2318] dark:text-[#f5e6d3]">/in/ethantrann</span>
            </a>
          </div>

          <div className="p-8 border-2 border-[#c4a882] dark:border-[#6b5744] rounded-lg shadow-md bg-white dark:bg-[#3d2f1f]">
            <h2 className="text-lg mb-6 text-[#2a2318] dark:text-[#f5e6d3] handwritten">Send a quick message</h2>
            <form className="space-y-4" action="mailto:e64tran@uwaterloo.ca" method="get" encType="text/plain">
              <div>
                <label className="block text-xs mono uppercase tracking-widest text-[#8B7355] dark:text-[#a1785d] mb-2 font-medium">Message</label>
                <textarea
                  name="body"
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f5f5dc] dark:bg-[#2a2318] border border-[#c4a882] dark:border-[#6b5744] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c4a882] dark:focus:ring-[#6b5744] resize-none transition-all text-[#2a2318] dark:text-[#e8dcc8] placeholder:text-[#6b5744] dark:placeholder:text-[#a1785d]"
                  placeholder="What's on your mind?"
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#2a2318] dark:bg-[#f5e6d3] text-[#f5e6d3] dark:text-[#2a2318] py-3 rounded-xl text-sm font-semibold hover:bg-[#3d2f1f] dark:hover:bg-[#e8dcc8] transition-colors shadow-md"
              >
                Send via Email Client
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
