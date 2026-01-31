
import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="py-20 max-w-2xl mx-auto">
      <header className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-6">Let's connect</h1>
        <p className="text-zinc-500 text-lg">
          Whether you want to talk about embedded systems, recruitment, or just say hi, feel free to reach out.
        </p>
      </header>

      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="mailto:e64tran@uwaterloo.ca" className="p-6 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-colors group">
            <span className="mono text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">Email</span>
            <span className="text-lg font-bold group-hover:underline underline-offset-4 decoration-1">e64tran@uwaterloo.ca</span>
          </a>
          <a href="https://linkedin.com/in/ethantrann" target="_blank" rel="noopener noreferrer" className="p-6 border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-colors group">
            <span className="mono text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">LinkedIn</span>
            <span className="text-lg font-bold group-hover:underline underline-offset-4 decoration-1">/in/ethantrann</span>
          </a>
        </div>

        <div className="p-8 border border-zinc-100 rounded-2xl">
          <h2 className="text-lg font-bold mb-6">Send a quick message</h2>
          <form className="space-y-4" action="mailto:e64tran@uwaterloo.ca" method="get" encType="text/plain">
            <div>
              <label className="block text-xs mono uppercase tracking-widest text-zinc-400 mb-2 font-medium">Message</label>
              <textarea 
                name="body"
                rows={4}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 resize-none transition-all"
                placeholder="What's on your mind?"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              Send via Email Client
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
