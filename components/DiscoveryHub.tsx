
import React, { useState } from 'react';
import { TRENDING_CONTENT, FOLLOWING_FEED } from '../constants';
import VideoStudio from './VideoStudio';

type Tab = 'trending' | 'video' | 'following';

const DiscoveryHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('trending');

  return (
    <div className="max-w-7xl mx-auto px-6 mb-32">
      <div className="glass p-2 rounded-2xl mb-12 flex items-center justify-center max-w-md mx-auto border border-white/10 shadow-xl">
        <button 
          onClick={() => setActiveTab('trending')}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all ${activeTab === 'trending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Trending
        </button>
        <button 
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all ${activeTab === 'video' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Video
        </button>
        <button 
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all ${activeTab === 'following' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
        >
          Following
        </button>
      </div>

      <div className="animate-message">
        {activeTab === 'trending' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRENDING_CONTENT.map((item) => (
              <div key={item.id} className="glass p-4 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer">
                <div className="relative aspect-square mb-4 overflow-hidden rounded-2xl">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10">
                    {item.views}
                  </div>
                </div>
                <h4 className="font-bold text-white mb-1 truncate">{item.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.author}</span>
                  <span className="text-[10px] uppercase font-black text-indigo-400">{item.type}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'video' && (
          <div className="space-y-12">
            <VideoStudio />
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-[9/16] glass rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5 hover:border-white/20 transition-all">
                  <img 
                    src={`https://images.unsplash.com/photo-${1550000000000 + i * 1000}?auto=format&fit=crop&q=80&w=300&h=533`} 
                    className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-500"
                    alt="Short Video"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-bold">V{i}</div>
                        <span className="text-[10px] font-bold">Creator_{i}</span>
                     </div>
                     <p className="text-[10px] text-white/80 line-clamp-1">Amazing new motion #vfx #art</p>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <svg className="w-12 h-12 text-white drop-shadow-2xl" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="max-w-2xl mx-auto space-y-4">
            {FOLLOWING_FEED.map((item) => (
              <div key={item.id} className="glass p-5 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full music-gradient flex items-center justify-center font-black text-white shadow-lg">
                    {item.avatar}
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-sm">{item.user} <span className="font-normal text-slate-400 ml-1">{item.action}</span></h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{item.time}</p>
                  </div>
                </div>
                <button className="px-4 py-1.5 border border-cyan-500/30 text-cyan-400 text-xs font-bold rounded-full hover:bg-cyan-500/10 transition-colors">
                  View
                </button>
              </div>
            ))}
            <div className="text-center py-8 opacity-40">
              <p className="text-xs text-slate-500">You're all caught up! ✨</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryHub;
