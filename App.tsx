
import React from 'react';
import { GENRES, ARTISTS, FORMATS, VIDEO_PLATFORMS, VIDEO_FEATURES, TEXT_CATEGORIES, IMAGE_CATEGORIES } from './constants';
import AIChat from './components/AIChat';
import VoiceLab from './components/VoiceLab';
import PublishingSuite from './components/PublishingSuite';
import DiscoveryHub from './components/DiscoveryHub';

const App: React.FC = () => {
  return (
    <div className="min-h-screen pb-20 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl music-gradient flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight">FlyMind</span>
        </div>
        <div className="hidden lg:flex space-x-8 text-sm font-medium text-slate-400">
          <a href="#music" className="hover:text-white transition-colors">Music</a>
          <a href="#video" className="hover:text-white transition-colors">Video</a>
          <a href="#image" className="hover:text-white transition-colors">Images</a>
          <a href="#voicelab" className="hover:text-white transition-colors">Voice Lab</a>
          <a href="#launchpad" className="hover:text-white transition-colors">Launchpad</a>
        </div>
        <button className="bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2 rounded-xl text-sm font-medium transition-all active:scale-95">
          Join Studio
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-600/15 blur-[160px] rounded-full -z-10"></div>
        <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full -z-10"></div>
        
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-slate-300 text-[10px] font-bold mb-8 uppercase tracking-[0.2em]">
          <span>Fly Chat Creative Ecosystem v3.5</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9]">
          Fly. <span className="text-transparent bg-clip-text music-gradient">Create</span>. <br/>Inspire.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          The ultimate hub for trending creators. Master sonic engineering, viral motion, and visual storytelling in one unified studio.
        </p>
        <div className="flex flex-wrap justify-center gap-5">
          <button className="music-gradient px-12 py-5 rounded-2xl font-bold shadow-2xl hover:scale-105 transition-transform text-lg flex items-center gap-3">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
             Start Creation
          </button>
          <a href="#launchpad" className="glass px-12 py-5 rounded-2xl font-bold hover:bg-white/10 transition-colors text-lg border border-white/10 flex items-center gap-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            Go Live
          </a>
        </div>
      </section>

      {/* Social Discovery Hub */}
      <DiscoveryHub />

      {/* Voice Lab Section */}
      <VoiceLab />

      {/* Publishing Suite (Launchpad) */}
      <PublishingSuite />

      {/* Image Section */}
      <section id="image" className="max-w-7xl mx-auto px-6 mb-48">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1 order-2 lg:order-1">
             <div className="mb-4 text-amber-400 font-bold uppercase tracking-widest text-xs">Pillar 04</div>
             <h2 className="text-5xl font-black mb-8">Visual Arts & Photography</h2>
             <p className="text-slate-400 text-lg leading-relaxed mb-10">
               In a visual-first world, how you capture and present images defines your brand. Master resolution, transparency, and modern compression for the perfect look.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {IMAGE_CATEGORIES.map((cat, idx) => (
                  <div key={idx} className="glass p-8 rounded-[40px] border border-white/5 hover:border-amber-500/20 transition-all group">
                     <div className="text-4xl mb-6 group-hover:scale-110 transition-transform origin-left">{cat.icon}</div>
                     <h3 className="text-xl font-bold mb-3">{cat.title}</h3>
                     <p className="text-slate-400 text-xs mb-4 leading-relaxed">{cat.description}</p>
                     <div className="flex flex-wrap gap-2">
                        {cat.formats.map((f, i) => (
                          <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full border border-amber-500/10">{f}</span>
                        ))}
                     </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="flex-1 order-1 lg:order-2 relative">
             <div className="absolute -inset-10 bg-amber-500/10 blur-[100px] rounded-full"></div>
             <div className="relative glass p-6 rounded-[50px] border border-white/10 shadow-2xl overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1554080353-a576cf803bda?auto=format&fit=crop&q=80&w=800&h=1000" 
                  alt="Photography Example" 
                  className="w-full h-[500px] object-cover rounded-[36px] group-hover:scale-105 transition-transform duration-700"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Text Section */}
      <section id="text" className="max-w-7xl mx-auto px-6 mb-48 relative">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="lg:w-1/3 sticky top-32">
            <div className="mb-4 text-cyan-400 font-bold uppercase tracking-widest text-xs">Pillar 03</div>
            <h2 className="text-5xl font-black mb-6 leading-tight">Structured Content</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Words are the data of creation. Whether it's source code, rich documents, or web markup, how we store text matters.
            </p>
          </div>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
            {TEXT_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="glass group p-8 rounded-[40px] hover:border-cyan-500/30 transition-all border border-white/5">
                <div className="text-5xl mb-6">{cat.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{cat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{cat.description}</p>
                <div className="flex flex-wrap gap-2">
                  {cat.examples.map((ex, i) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-[10px] uppercase font-bold text-slate-300 border border-white/10">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section id="video" className="max-w-7xl mx-auto px-6 mb-48">
        <div className="text-center mb-20">
          <div className="mb-4 text-rose-400 font-bold uppercase tracking-widest text-xs">Pillar 02</div>
          <h2 className="text-5xl font-black mb-6">Short-Form Motion</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {VIDEO_PLATFORMS.map((platform, idx) => (
            <div key={idx} className={`glass p-10 rounded-[40px] border border-white/5 relative overflow-hidden group`}>
              <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${platform.color} opacity-10 group-hover:opacity-20 blur-3xl transition-opacity`}></div>
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform origin-left">{platform.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{platform.name}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{platform.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Music Section */}
      <section id="music" className="max-w-7xl mx-auto px-6 mb-48">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="mb-4 text-indigo-400 font-bold uppercase tracking-widest text-xs">Pillar 01</div>
            <h2 className="text-5xl font-black mb-4">Sonic Engineering</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {GENRES.map((genre) => (
            <div key={genre.id} className="group relative glass p-10 rounded-[40px] overflow-hidden hover:border-white/20 transition-all cursor-pointer">
              <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${genre.color} opacity-10 group-hover:opacity-30 blur-3xl transition-all`}></div>
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform origin-left">{genre.icon}</div>
              <h3 className="text-2xl font-bold mb-4">{genre.name}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{genre.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Formats Section */}
      <section id="formats" className="max-w-7xl mx-auto px-6 mb-48">
        <div className="glass p-16 rounded-[60px] flex flex-col lg:flex-row items-center gap-20 border border-white/10 bg-slate-900/40">
          <div className="flex-1">
            <h2 className="text-5xl font-black mb-8 leading-tight">The Library</h2>
            <p className="text-slate-400 mb-12 text-lg leading-relaxed">
              Every creation needs a perfect vessel. Select from our library of high-performance digital formats.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FORMATS.map((format, i) => (
                <div key={i} className="flex items-center p-5 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-all group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold mr-5 transition-transform group-hover:scale-110 ${
                    format.category === 'Audio' ? 'bg-indigo-500/20 text-indigo-400' :
                    format.category === 'Video' ? 'bg-rose-500/20 text-rose-400' : 
                    format.category === 'Image' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {format.type[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold block">{format.type}</span>
                    <p className="text-[11px] text-slate-400 uppercase tracking-widest">{format.category} • {format.quality}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-lg music-gradient flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             </div>
             <span className="text-xl font-bold text-white">FlyMind</span>
          </div>
          <p>© 2025 FlyMind Universal Studio. All rights reserved.</p>
        </div>
      </footer>

      {/* AI Chat Bot */}
      <AIChat />
    </div>
  );
};

export default App;
