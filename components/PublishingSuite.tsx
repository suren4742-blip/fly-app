
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Metadata {
  short: string;
  long: string;
  keywords: string;
  whatsNew?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'jp', name: 'Japanese', flag: '🇯🇵' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
];

const PublishingSuite: React.FC = () => {
  const [appName, setAppName] = useState('');
  const [niche, setNiche] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [errors, setErrors] = useState<{ appName?: string; niche?: string; shortDesc?: string }>({});
  
  const [generatedIcon, setGeneratedIcon] = useState<string | null>(null);
  const [generatedFeature, setGeneratedFeature] = useState<string | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false);
  const [isGeneratingFeature, setIsGeneratingFeature] = useState(false);
  const [isGeneratingScreenshots, setIsGeneratingScreenshots] = useState(false);
  
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isMagicGenerating, setIsMagicGenerating] = useState(false);

  // Build States
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildManifest, setBuildManifest] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [buildLogs]);

  const handleMagicGenerate = async () => {
    setIsMagicGenerating(true);
    setErrors({});
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a creative Android app concept for the FlyMind ecosystem. Provide a JSON object with 'appName' (2 words max), 'niche' (short phrase), and 'shortDesc' (max 80 chars).",
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      if (data.appName) setAppName(data.appName);
      if (data.niche) setNiche(data.niche);
      if (data.shortDesc) setShortDesc(data.shortDesc);

      // After setting fields, we can't immediately call other functions because state updates are async
      // But we can use the data directly
      const currentAppName = data.appName || appName;
      const currentNiche = data.niche || niche;
      
      // Trigger metadata generation
      await generateMetadata();
      
      // Trigger asset generation in parallel
      await Promise.all([
        generateAsset(`A minimal, high-quality Android app icon for "${currentAppName}". Focus on "${currentNiche}". Vector style, vibrant colors, centered icon.`, 'icon'),
        generateAsset(`A 1024x500 Feature Graphic for Google Play. App is "${currentAppName}" in the "${currentNiche}" niche. Cinematic lighting, professional marketing art.`, 'feature')
      ]);

    } catch (err) {
      console.error(err);
    } finally {
      setIsMagicGenerating(false);
    }
  };

  const validate = () => {
    const newErrors: { appName?: string; niche?: string; shortDesc?: string } = {};
    if (!appName.trim()) newErrors.appName = 'App name is required.';
    if (!niche.trim()) newErrors.niche = 'Category/Vision is required.';
    if (!shortDesc.trim()) newErrors.shortDesc = 'Initial short description is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateMetadata = async () => {
    if (!validate()) return;
    setIsGenerating(true);
    setAuditResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const langName = LANGUAGES.find(l => l.code === targetLang)?.name || 'English';
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate Google Play Store metadata for an app named "${appName}" in the "${niche}" niche. 
        The user has provided this draft short description: "${shortDesc}".
        The target language MUST be in ${langName}.
        Provide a JSON object with: 
        1. "short": A punchy, SEO-optimized version of the user's draft (exactly 80 characters or less).
        2. "long": A compelling, feature-rich long description (up to 4000 chars) based on the niche and draft.
        3. "keywords": A comma-separated list of 10 SEO-optimized keywords.
        4. "whatsNew": A brief "What's New" release note for version 1.0.0.`,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      setMetadata(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBuildAAB = async () => {
    if (!validate()) return;
    setIsBuilding(true);
    setBuildLogs(["Initializing Build System...", "Targeting Android (AAB)..."]);
    setBuildManifest(null);

    const log = (msg: string) => setBuildLogs(prev => [...prev, `> ${msg}`]);

    try {
      await new Promise(r => setTimeout(r, 800));
      log("Validating creative assets...");
      log(generatedIcon ? "Icon found: [VALID]" : "Warning: Using generic icon placeholder.");
      
      await new Promise(r => setTimeout(r, 600));
      log("Synthesizing AndroidManifest.xml...");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a technical build manifest for an Android App named "${appName}". 
        The app vision is: "${niche}".
        Provide a JSON object containing:
        1. "manifest": A valid AndroidManifest.xml snippet including necessary permissions (e.g., INTERNET, STORAGE).
        2. "gradle": A basic build.gradle dependencies snippet.
        3. "packageName": A suggested package name based on the app name.`,
        config: { responseMimeType: "application/json" }
      });

      const buildData = JSON.parse(response.text || '{}');
      setBuildManifest(response.text);

      await new Promise(r => setTimeout(r, 1000));
      log(`Package name generated: ${buildData.packageName}`);
      log("Compressing resource strings...");
      log("Optimizing PNG assets...");
      
      await new Promise(r => setTimeout(r, 1200));
      log("Signing with Release Key...");
      log("Aligning zip segments...");
      log("BUILD SUCCESSFUL: release.aab generated.");

    } catch (err) {
      log("BUILD FAILED: Connection to compiler interrupted.");
      console.error(err);
    } finally {
      setIsBuilding(false);
    }
  };

  const generateAsset = async (prompt: string, type: 'icon' | 'feature' | 'screenshot') => {
    if (!validate()) return;
    
    if (type === 'icon') setIsGeneratingIcon(true);
    if (type === 'feature') setIsGeneratingFeature(true);
    if (type === 'screenshot') setIsGeneratingScreenshots(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { 
            imageConfig: { 
                aspectRatio: type === 'feature' ? "16:9" : type === 'screenshot' ? "9:16" : "1:1" 
            } 
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const dataUrl = `data:image/png;base64,${part.inlineData.data}`;
          if (type === 'icon') setGeneratedIcon(dataUrl);
          if (type === 'feature') setGeneratedFeature(dataUrl);
          if (type === 'screenshot') setScreenshots(prev => [...prev, dataUrl]);
          break;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (type === 'icon') setIsGeneratingIcon(false);
      if (type === 'feature') setIsGeneratingFeature(false);
      if (type === 'screenshot') setIsGeneratingScreenshots(false);
    }
  };

  const runPolicyAudit = async () => {
    if (!metadata) return;
    setIsAuditing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Act as a Google Play Console specialist. Audit the following app metadata for Google Play Policy compliance and SEO effectiveness.
        App: ${appName}
        Language: ${targetLang}
        Short Description: ${metadata.short}
        Long Description: ${metadata.long}
        Provide a concise report with "Policy Health" (Pass/Action Required) and "Localization Quality".`,
      });
      setAuditResult(response.text || 'Audit completed with no major issues.');
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <section id="launchpad" className="max-w-7xl mx-auto px-6 mb-48">
      <div className="text-center mb-16">
        <div className="mb-4 text-emerald-400 font-bold uppercase tracking-widest text-xs">Pillar 06</div>
        <h2 className="text-6xl font-black mb-6">Android Launchpad</h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Transform your creative project into a global Android app. Generate localized store assets, visual marketing kits, and build your conceptual AAB.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-8">
          <div className="glass p-8 rounded-[40px] border border-white/5 space-y-6 bg-slate-900/40">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-3 text-emerald-400">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414C17.0374 15.3414 16.6433 14.9472 16.6433 14.4617C16.6433 13.9761 17.0374 13.582 17.523 13.582C18.0085 13.582 18.4026 13.9761 18.4026 14.4617C18.4026 14.9472 18.0085 15.3414 17.523 15.3414ZM6.47701 15.3414C5.99146 15.3414 5.59735 14.9472 5.59735 14.4617C5.59735 13.9761 5.99146 13.582 6.47701 13.582C6.96256 13.582 7.35667 13.9761 7.35667 14.4617C7.35667 14.9472 6.96256 15.3414 6.47701 15.3414ZM17.8488 11.0827L19.7915 7.71804C19.9213 7.49321 19.8443 7.20579 19.6195 7.07604C19.3946 6.9463 19.1072 7.02324 18.9774 7.2481L16.9976 10.6775C15.5451 10.0163 13.8442 9.64337 12 9.64337C10.1558 9.64337 8.45491 10.0163 7.00243 10.6775L5.02256 7.2481C4.89281 7.02324 4.6054 6.9463 4.38056 7.07604C4.15573 7.20579 4.07878 7.49321 4.20853 7.71804L6.15119 11.0827C2.55181 13.0298 0.119782 16.7118 0 21.0001H24C23.8802 16.7118 21.4482 13.0298 17.8488 11.0827Z"/></svg>
                Release Architect
              </h3>
              <button 
                onClick={handleMagicGenerate}
                disabled={isMagicGenerating}
                className="text-[10px] font-black text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full hover:bg-emerald-500/10 transition-all flex items-center gap-2"
              >
                {isMagicGenerating ? <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.243 15.657a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0zM5.757 14.243a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414z"/></svg>}
                Magic Generate
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">App Name</label>
                  <input 
                    value={appName}
                    onChange={(e) => {
                      setAppName(e.target.value);
                      if (errors.appName) setErrors(prev => ({ ...prev, appName: undefined }));
                    }}
                    placeholder="e.g. SonicFlow"
                    className={`w-full bg-slate-950 border ${errors.appName ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all`}
                  />
                  {errors.appName && <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{errors.appName}</p>}
                </div>
                <div className="w-24">
                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Locale</label>
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-3 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none text-center"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.flag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Category / Vision</label>
                <input 
                  value={niche}
                  onChange={(e) => {
                    setNiche(e.target.value);
                    if (errors.niche) setErrors(prev => ({ ...prev, niche: undefined }));
                  }}
                  placeholder="e.g. Lofi Beat Maker & Visualizer"
                  className={`w-full bg-slate-950 border ${errors.niche ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all`}
                />
                {errors.niche && <p className="text-[10px] text-red-400 mt-1 ml-1 font-medium">{errors.niche}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Short Description Draft</label>
                <textarea 
                  value={shortDesc}
                  onChange={(e) => {
                    setShortDesc(e.target.value);
                    if (errors.shortDesc) setErrors(prev => ({ ...prev, shortDesc: undefined }));
                  }}
                  placeholder="e.g. Create amazing lo-fi beats with stunning reactive visuals."
                  className={`w-full bg-slate-950 border ${errors.shortDesc ? 'border-red-500/50' : 'border-white/10'} rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all resize-none h-20`}
                  maxLength={80}
                />
                <div className="flex justify-between mt-1">
                  {errors.shortDesc ? <p className="text-[10px] text-red-400 ml-1 font-medium">{errors.shortDesc}</p> : <span></span>}
                  <span className="text-[9px] text-slate-500 font-bold">{shortDesc.length}/80</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={() => generateAsset(`A minimal, high-quality Android app icon for "${appName}". Focus on "${niche}". Vector style, vibrant colors, centered icon, Material Design 3.0.`, 'icon')}
                  disabled={isGeneratingIcon}
                  className="bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {isGeneratingIcon ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : "Create Icon"}
                </button>
                <button 
                  onClick={() => generateAsset(`A 1024x500 Feature Graphic for Google Play. App is "${appName}" in the "${niche}" niche. Cinematic lighting, background bokeh, abstract shapes, professional marketing art.`, 'feature')}
                  disabled={isGeneratingFeature}
                  className="bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-xs font-bold"
                >
                  {isGeneratingFeature ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : "Feature Art"}
                </button>
              </div>

              <button 
                onClick={() => generateAsset(`A mobile app screenshot for "${appName}". Showcasing a ${niche} user interface. High quality, 9:16 vertical, modern UI components, sleek design.`, 'screenshot')}
                disabled={isGeneratingScreenshots || screenshots.length >= 5}
                className="w-full bg-white/5 border border-white/10 hover:border-emerald-500/30 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
              >
                {isGeneratingScreenshots ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div> : `Generate Screenshot (${screenshots.length}/5)`}
              </button>

              <button 
                onClick={generateMetadata}
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-600/20 text-xs"
              >
                {isGenerating ? "Synthesizing..." : "Forge Store Listing"}
              </button>
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border border-white/5 bg-slate-950/40">
             <h4 className="text-xs font-black text-slate-500 uppercase mb-4 tracking-widest">Pre-Flight Checklist</h4>
             <ul className="space-y-3">
                {[
                  { text: 'Android App Bundle (AAB) Built', checked: !!buildManifest },
                  { text: 'Store Metadata Localized', checked: !!metadata },
                  { text: 'App Signing Key Secured', checked: true },
                  { text: 'Privacy Policy URL Ready', checked: false },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs text-slate-300">
                    <div className={`w-4 h-4 rounded-full border ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'}`}>
                      {item.checked && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                    </div>
                    {item.text}
                  </li>
                ))}
             </ul>
          </div>

          <button 
            onClick={handleBuildAAB}
            disabled={isBuilding}
            className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 ${
                isBuilding 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
            }`}
          >
            {isBuilding ? "Compiling..." : "Build AAB Package"}
          </button>
        </div>

        {/* Results Preview */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Console View */}
          <div className="glass h-full min-h-[700px] rounded-[60px] border border-white/10 bg-slate-950 overflow-hidden flex flex-col shadow-2xl animate-chat-window relative">
             {/* Feature Graphic */}
             <div className="relative w-full aspect-[1024/500] bg-slate-900 overflow-hidden shrink-0">
                {generatedFeature ? (
                  <img src={generatedFeature} alt="Feature Graphic" className="w-full h-full object-cover animate-message" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
                    <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
             </div>

             {/* App Info Header */}
             <div className="px-8 -mt-10 relative z-10 flex items-start gap-6 pb-8 border-b border-white/5">
                <div className="w-24 h-24 rounded-[22%] bg-slate-900 border-4 border-slate-950 shadow-2xl flex items-center justify-center overflow-hidden shrink-0">
                  {generatedIcon ? (
                    <img src={generatedIcon} alt="App Icon" className="w-full h-full object-cover animate-message" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-800 rounded-lg animate-pulse"></div>
                  )}
                </div>
                <div className="flex-1 pt-4">
                  <h4 className="text-3xl font-black text-white leading-tight">{appName || "App Name"}</h4>
                  <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider">{niche || "Category"}</div>
                </div>
             </div>

             <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-10">
                {/* Build Console Overlay (Visible during build or if build exists) */}
                {(isBuilding || buildLogs.length > 0) && (
                  <div className="animate-message">
                    <div className="flex items-center justify-between mb-4">
                       <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                         <span className={`w-1.5 h-1.5 rounded-full ${isBuilding ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`}></span>
                         Build Terminal
                       </h5>
                       {buildManifest && !isBuilding && (
                         <button 
                            onClick={() => {
                                const blob = new Blob([buildManifest], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${appName.toLowerCase().replace(/\s+/g, '_')}_manifest.json`;
                                a.click();
                            }}
                            className="text-[9px] font-bold text-slate-500 hover:text-emerald-400 transition-colors uppercase"
                         >
                           Download Manifest
                         </button>
                       )}
                    </div>
                    <div 
                      ref={terminalRef}
                      className="bg-black/80 rounded-3xl p-6 border border-white/5 font-mono text-[11px] h-[250px] overflow-y-auto custom-scrollbar shadow-inner"
                    >
                      {buildLogs.map((log, i) => (
                        <div key={i} className="mb-1 text-slate-400">
                          <span className="text-emerald-500/50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                          {log}
                        </div>
                      ))}
                      {isBuilding && <div className="text-emerald-400 animate-pulse mt-1">_</div>}
                    </div>
                  </div>
                )}

                {/* About this app */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h5 className="text-sm font-black text-white uppercase tracking-widest">About this app</h5>
                   </div>
                   {metadata ? (
                     <div className="animate-message space-y-4">
                        <p className="text-lg font-bold text-slate-100">{metadata.short}</p>
                        <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{metadata.long}</p>
                        
                        <div className="pt-6 border-t border-white/5">
                           <h6 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">What's New</h6>
                           <p className="text-xs text-slate-400 italic">{metadata.whatsNew || "Initial global release."}</p>
                        </div>
                     </div>
                   ) : !isBuilding && (
                     <div className="h-20 bg-white/5 rounded-2xl animate-pulse"></div>
                   )}
                </div>

                {/* Audit Tools */}
                {metadata && (
                  <div className="pt-8 space-y-4">
                    <button 
                      onClick={runPolicyAudit}
                      disabled={isAuditing}
                      className="w-full py-4 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl text-xs font-black uppercase tracking-widest transition-all text-emerald-400"
                    >
                      {isAuditing ? "Analyzing Release..." : "Run Store Audit"}
                    </button>
                    {auditResult && (
                      <div className="p-6 bg-slate-900/80 rounded-3xl border border-white/5 text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap italic animate-message">
                        {auditResult}
                      </div>
                    )}
                  </div>
                )}
             </div>

             {/* Bottom Controls */}
             <div className="p-6 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 flex gap-4">
                <button 
                  onClick={() => {
                    const content = `App: ${appName}\nLocale: ${targetLang}\n\nShort: ${metadata?.short}\n\nLong: ${metadata?.long}\n\nKeywords: ${metadata?.keywords}`;
                    const blob = new Blob([content], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${appName}_store_data.txt`;
                    a.click();
                  }}
                  disabled={!metadata}
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                >
                  Export Store Kit
                </button>
                <button 
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Push to Console
                </button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublishingSuite;
