
import React, { useState, useRef, useEffect } from 'react';
import { getCreativeExplanation } from '../services/geminiService';

const VoiceLab: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startVisualizer = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    
    source.connect(analyser);
    // Increased FFT size for higher detail in the visualization
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      // Transparent clear for potential trail effects, though here we clear fully for sharpness
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;
      
      const centerY = canvas.height / 2;

      // Create a beautiful gradient for the waveform
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#818cf8'); // Indigo 400
      gradient.addColorStop(0.5, '#c084fc'); // Purple 400
      gradient.addColorStop(1, '#818cf8'); // Indigo 400

      ctx.fillStyle = gradient;
      
      // Add a slight glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(129, 140, 248, 0.5)';

      for (let i = 0; i < bufferLength; i++) {
        // Calculate bar height based on frequency data
        // We cap the height to prevent clipping
        const barHeight = (dataArray[i] / 255) * (canvas.height * 0.8);
        
        // Draw mirrored bars from the center for a "waveform" look
        // We use rounded ends for a modern aesthetic
        const yPos = centerY - barHeight / 2;
        
        // Only draw if there's enough signal to see
        if (barHeight > 2) {
          // Drawing a rounded rectangle (simplified for performance)
          ctx.beginPath();
          ctx.roundRect(x, yPos, barWidth - 1, barHeight, 4);
          ctx.fill();
        } else {
          // Draw a baseline thin line when quiet
          ctx.fillRect(x, centerY - 1, barWidth - 1, 2);
        }

        x += barWidth;
      }
    };
    
    draw();
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsProcessing(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          const result = await getCreativeExplanation(
            "Analyze this audio snippet. Provide creative feedback, identify potential use cases, or suggest improvements.",
            [],
            { data: base64Audio, mimeType: 'audio/webm' }
          );
          setAnalysis(result);
          setIsProcessing(false);
        };
        
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setAnalysis(null);
    } catch (err) {
      console.error("Recording error:", err);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    }
  };

  return (
    <section id="voicelab" className="max-w-7xl mx-auto px-6 mb-48">
      <div className="glass p-12 md:p-20 rounded-[60px] border border-indigo-500/20 bg-slate-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <svg className="w-40 h-40 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div>
              <div className="mb-4 text-indigo-400 font-bold uppercase tracking-widest text-xs">Pillar 05</div>
              <h2 className="text-5xl font-black mb-6">Voice Lab</h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Capture your ideas as they happen. Record vocal melodies, script drafts, or sound effects and let our AI Guru analyze them for you.
              </p>
            </div>

            <div className="flex items-center space-x-6">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 relative ${
                  isRecording 
                  ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110' 
                  : 'music-gradient shadow-2xl hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <div className="w-8 h-8 bg-white rounded-sm"></div>
                ) : (
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  </svg>
                )}
                {isRecording && (
                  <div className="absolute -inset-4 border-2 border-red-500 rounded-full animate-ping opacity-20"></div>
                )}
              </button>
              
              <div className="flex-1">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-24 rounded-2xl bg-slate-900/60 border border-white/5"
                  width={600}
                  height={96}
                />
                <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">
                  {isRecording ? "Listening to frequencies..." : isProcessing ? "Universal Guru is thinking..." : "Ready to record"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <div className="glass rounded-[40px] p-8 border border-white/5 min-h-[300px] flex flex-col relative overflow-hidden bg-slate-900/80">
              <h4 className="font-bold text-indigo-400 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Guru Analysis
              </h4>
              
              {isProcessing ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="text-slate-400 animate-pulse text-sm">Transcribing & Analyzing...</p>
                </div>
              ) : analysis ? (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar animate-message">
                  {analysis}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 animate-message">
                  <div className="text-4xl mb-4 opacity-20">🎙️</div>
                  <p className="text-slate-500 text-sm">Record a sample to get instant creative insights.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VoiceLab;
