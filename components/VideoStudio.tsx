
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

const REASSURING_MESSAGES = [
  "Visualizing your concept...",
  "Rendering frames in high fidelity...",
  "Applying cinematic lighting...",
  "Synthesizing motion vectors...",
  "Polishing final pixels...",
  "Almost ready for prime time..."
];

const PRESET_TRACKS = [
  { id: 'lofi', name: 'Lofi Chill', icon: '☕' },
  { id: 'cinematic', name: 'Epic Cinematic', icon: '🎭' },
  { id: 'electronic', name: 'Cyberpunk Beats', icon: '🌃' },
];

const FX_PRESETS = [
  { id: 'reverb', name: 'Reverb', icon: '⛰️' },
  { id: 'echo', name: 'Echo', icon: '🗣️' },
  { id: 'distortion', name: 'Grime', icon: '🎸' },
];

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [statusMessage, setStatusMessage] = useState(REASSURING_MESSAGES[0]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio states
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string | null>(null);
  const [volume, setVolume] = useState(70);
  
  // FX States
  const [activeFx, setActiveFx] = useState<string | null>(null);
  const [fxIntensity, setFxIntensity] = useState(50);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Web Audio Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const distortionNodeRef = useRef<WaveShaperNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackNodeRef = useRef<GainNode | null>(null);
  const outputGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let interval: number;
    if (isGenerating) {
      let idx = 0;
      interval = window.setInterval(() => {
        idx = (idx + 1) % REASSURING_MESSAGES.length;
        setStatusMessage(REASSURING_MESSAGES[idx]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Initialize Web Audio Graph
  const initAudioFx = () => {
    if (!audioRef.current || audioCtxRef.current) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const source = ctx.createMediaElementSource(audioRef.current);
    sourceNodeRef.current = source;

    const distortion = ctx.createWaveShaper();
    distortionNodeRef.current = distortion;

    const delay = ctx.createDelay(2.0);
    delayNodeRef.current = delay;

    const feedback = ctx.createGain();
    feedbackNodeRef.current = feedback;

    const output = ctx.createGain();
    outputGainRef.current = output;

    // Connect graph: Source -> Distortion -> Delay Loop (Delay -> Feedback -> Delay) -> Output -> Destination
    source.connect(distortion);
    distortion.connect(output);
    
    // Echo/Reverb loop
    distortion.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(output);

    output.connect(ctx.destination);
    
    updateFxNodes();
  };

  const updateFxNodes = () => {
    if (!audioCtxRef.current) return;

    // Volume Logic
    if (outputGainRef.current) {
      outputGainRef.current.gain.setTargetAtTime(volume / 100, audioCtxRef.current.currentTime, 0.05);
    }

    // Distortion Logic
    if (distortionNodeRef.current) {
      const amount = activeFx === 'distortion' ? fxIntensity * 4 : 0;
      const k = typeof amount === 'number' ? amount : 50;
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
      }
      distortionNodeRef.current.curve = curve;
      distortionNodeRef.current.oversample = '4x';
    }

    // Delay/Feedback Logic for Echo & Reverb
    if (delayNodeRef.current && feedbackNodeRef.current) {
      if (activeFx === 'echo') {
        delayNodeRef.current.delayTime.value = 0.4; // Consistent echo time
        feedbackNodeRef.current.gain.value = fxIntensity / 150; // 0 to 0.66
      } else if (activeFx === 'reverb') {
        delayNodeRef.current.delayTime.value = 0.05; // Very short delay for room feel
        feedbackNodeRef.current.gain.value = fxIntensity / 110; // High feedback for "tails"
      } else {
        feedbackNodeRef.current.gain.value = 0;
      }
    }
  };

  useEffect(() => {
    updateFxNodes();
  }, [activeFx, fxIntensity, volume]);

  // Sync audio with video
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    const handlePlay = () => {
      initAudioFx();
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      audio.play();
    };
    const handlePause = () => audio.pause();
    const handleSeek = () => {
      audio.currentTime = video.currentTime % (audio.duration || 1);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeek);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeek);
    };
  }, [videoUrl, audioUrl]);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setAudioName(file.name);
      setSelectedPreset(null);
    }
  };

  const selectPreset = (id: string) => {
    setSelectedPreset(id);
    setAudioName(PRESET_TRACKS.find(t => t.id === id)?.name || null);
    setAudioUrl(null); 
  };

  const enrichPrompt = async () => {
    if (!prompt.trim() || isEnriching) return;
    setIsEnriching(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Expand this simple video prompt into a highly detailed, cinematic description for an AI video generator. 
        Focus on camera movement, specific lighting, textures, and atmosphere. 
        Keep it under 200 characters.
        User prompt: "${prompt}"`,
        config: {
          systemInstruction: "You are a cinematic prompt engineer. Output ONLY the expanded description, no conversational filler."
        }
      });
      const enrichedText = response.text?.trim();
      if (enrichedText) {
        setPrompt(enrichedText);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to enrich prompt. Try again.");
    } finally {
      setIsEnriching(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      // @ts-ignore
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } else {
        throw new Error("No video was generated.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("entity was not found")) {
        setError("API Key Error. Please re-select your paid API key.");
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } else {
        setError("Generation failed. Check your billing or prompt and try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass rounded-[40px] border border-rose-500/20 bg-slate-950/80 overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[500px] lg:min-h-[600px] transition-all duration-500">
      {/* Input Side */}
      <div className="flex-1 p-6 sm:p-10 lg:p-14 space-y-6 sm:space-y-8 flex flex-col justify-center">
        <div>
          <div className="text-rose-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>
            Veo 3.1 Vision Engine
          </div>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
            AI Viral Clip <br className="hidden sm:block"/>Studio
          </h3>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder="Describe your scene... e.g., 'A futuristic skateboarder gliding through a neon jungle, cinematic light, slow motion'"
              className="w-full h-24 sm:h-28 bg-slate-900 border border-white/10 rounded-3xl px-5 sm:px-6 py-4 sm:py-5 text-sm focus:ring-2 focus:ring-rose-500/50 outline-none transition-all resize-none custom-scrollbar placeholder:text-slate-600"
            />
            <button
              onClick={enrichPrompt}
              disabled={isEnriching || isGenerating || !prompt.trim()}
              className={`absolute bottom-4 right-4 p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                isEnriching 
                ? 'bg-indigo-500/20 text-indigo-400 cursor-wait' 
                : 'bg-white/5 hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/30'
              }`}
              title="Enhance prompt with AI"
            >
              {isEnriching ? (
                <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
              )}
              {isEnriching ? "Enriching..." : "Magic"}
            </button>
          </div>
          
          {/* Audio & FX Section */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Soundtrack Layer</label>
                {(audioName || selectedPreset) && <span className="text-[10px] text-emerald-400 font-bold truncate max-w-[150px]">✓ {audioName || 'Preset Loaded'}</span>}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TRACKS.map(track => (
                  <button
                    key={track.id}
                    onClick={() => selectPreset(track.id)}
                    className={`py-2 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center gap-1 ${
                      selectedPreset === track.id 
                      ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-sm">{track.icon}</span>
                    {track.name.split(' ')[0]}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  accept=".mp3,.wav,.ogg" 
                  onChange={handleAudioUpload}
                  className="hidden" 
                  id="audio-upload"
                />
                <label 
                  htmlFor="audio-upload"
                  className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-2xl text-[11px] font-bold text-slate-400 flex items-center justify-center gap-2 cursor-pointer hover:border-rose-500/50 hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                  Custom Audio (MP3/WAV)
                </label>
              </div>

              {(audioUrl || selectedPreset) && (
                <div className="animate-message px-2 py-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">Track Volume</span>
                    <span className="text-[9px] font-bold text-emerald-400">{volume}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>
              )}
            </div>

            {/* Audio Effects Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">FX Engine</label>
                {activeFx && <span className="text-[9px] text-rose-400 font-black uppercase tracking-widest animate-pulse">{activeFx} Active</span>}
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {FX_PRESETS.map(fx => (
                  <button
                    key={fx.id}
                    onClick={() => setActiveFx(activeFx === fx.id ? null : fx.id)}
                    className={`py-2 rounded-xl border text-[10px] font-bold transition-all flex items-center justify-center gap-2 ${
                      activeFx === fx.id 
                      ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/20' 
                      : 'bg-slate-900 border-white/5 text-slate-500 hover:bg-white/5'
                    }`}
                  >
                    <span>{fx.icon}</span>
                    {fx.name}
                  </button>
                ))}
              </div>

              {activeFx && (
                <div className="animate-message px-2 pt-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">FX Intensity</span>
                    <span className="text-[9px] font-bold text-rose-400">{fxIntensity}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={fxIntensity}
                    onChange={(e) => setFxIntensity(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:grayscale text-white font-bold py-4 sm:py-5 rounded-3xl transition-all active:scale-95 shadow-xl shadow-rose-600/20 flex items-center justify-center gap-3 group"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="text-sm sm:text-base">{statusMessage}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"/>
                  </svg>
                  <span className="text-sm sm:text-base">Generate Clip</span>
                </>
              )}
            </button>
            
            <p className="text-[9px] sm:text-[10px] text-slate-500 text-center leading-relaxed px-4">
              *Requires a paid API key. Generation usually takes 1-3 minutes. <br/>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-rose-400 hover:underline">Billing Info</a>
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[11px] sm:text-xs text-center animate-message">
            {error}
          </div>
        )}
      </div>

      {/* Preview Side */}
      <div className="flex-1 bg-slate-900/40 p-6 sm:p-10 md:p-12 border-t md:border-t-0 md:border-l border-white/10 flex items-center justify-center">
        <div className="relative aspect-[9/16] w-full max-w-[220px] sm:max-w-[280px] lg:max-w-[320px] glass rounded-3xl overflow-hidden shadow-2xl border border-white/10 group transition-all duration-700">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-5 p-6 sm:p-10 text-center">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-rose-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-2 bg-rose-500/20 rounded-full animate-pulse"></div>
              </div>
              <p className="text-[11px] sm:text-xs text-rose-400 font-bold animate-pulse px-2">{statusMessage}</p>
            </div>
          ) : videoUrl ? (
            <>
              <video 
                ref={videoRef}
                src={videoUrl} 
                autoPlay 
                loop 
                playsInline
                crossOrigin="anonymous"
                className="w-full h-full object-cover animate-message"
                controls
              />
              <audio 
                ref={audioRef} 
                src={audioUrl || undefined} 
                loop 
                crossOrigin="anonymous"
                className="hidden" 
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <a 
                  href={videoUrl} 
                  download="viral_clip.mp4"
                  className="bg-black/60 backdrop-blur-md hover:bg-black/80 p-3 rounded-2xl border border-white/10 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                </a>
                {(audioUrl || selectedPreset) && (
                   <div className="bg-emerald-500/80 backdrop-blur-md p-2 rounded-xl text-[8px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-all text-center">
                      Audio Synced
                   </div>
                )}
                {activeFx && (
                   <div className="bg-rose-500/80 backdrop-blur-md p-2 rounded-xl text-[8px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-all text-center">
                      {activeFx} Engine
                   </div>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 p-8 sm:p-12 text-center">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 mb-6 text-rose-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/50">Preview Studio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
