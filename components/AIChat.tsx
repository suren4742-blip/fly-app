
import React, { useState, useRef, useEffect } from 'react';
import { getCreativeExplanation } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SUGGESTED_TOPICS } from '../constants';

const AudioWaveform: React.FC = () => (
  <div className="flex items-center space-x-[2px] h-3">
    <div className="waveform-bar" style={{ animationDelay: '0s' }}></div>
    <div className="waveform-bar" style={{ animationDelay: '0.1s' }}></div>
    <div className="waveform-bar" style={{ animationDelay: '0.2s' }}></div>
    <div className="waveform-bar" style={{ animationDelay: '0.3s' }}></div>
    <div className="waveform-bar" style={{ animationDelay: '0.4s' }}></div>
  </div>
);

const ThinkingIndicator: React.FC = () => (
  <div className="flex justify-start animate-message">
    <div className="flex flex-col space-y-1.5 max-w-[85%]">
      <div className="flex items-center space-x-2 ml-1 mb-1">
        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
          Guru is synthesizing
        </span>
      </div>
      <div className="bg-slate-800 p-4 rounded-2xl rounded-bl-none border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2000ms] animate-[shimmer_2s_infinite]"></div>
        <div className="flex items-center space-x-3">
          <div className="flex space-x-1.5">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s]"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></div>
          </div>
          <div className="w-[1px] h-4 bg-white/10"></div>
          <div className="text-[10px] text-slate-500 font-medium italic">Consulting creative archives...</div>
        </div>
      </div>
    </div>
  </div>
);

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'initial-msg',
      role: 'model', 
      text: 'Hi! I am your Fly Chat assistant. I can now hear you! Click the mic to record a voice message about your creative project. 🎶📹📝🖼️' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading, isRecording]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          handleSend("Sent a voice message.", { data: base64Audio, mimeType: 'audio/webm' });
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async (text: string, audioData?: { data: string, mimeType: string }) => {
    if ((!text.trim() && !audioData) || isLoading) return;
    
    const userMsg: ChatMessage = { 
      id: `user-${Date.now()}`,
      role: 'user', 
      text: text,
      isAudio: !!audioData
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getCreativeExplanation(text, messages, audioData);
    setMessages(prev => [...prev, { 
      id: `model-${Date.now()}`,
      role: 'model', 
      text: response || 'I had trouble processing that.' 
    }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="glass w-[350px] md:w-[420px] h-[580px] rounded-3xl mb-4 overflow-hidden flex flex-col shadow-2xl animate-chat-window">
          <div className="music-gradient p-5 flex justify-between items-center shadow-lg">
            <div>
              <h3 className="font-bold text-lg leading-tight">Fly Chat</h3>
              <p className="text-[10px] text-white/80 uppercase tracking-widest font-medium">Sound • Vision • Text • Image</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-900/60 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative overflow-hidden ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-white/5'
                }`}>
                  {msg.isAudio && (
                    <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-white/20">
                      <div className="bg-white/20 p-1 rounded-full flex items-center justify-center">
                        <AudioWaveform />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {msg.role === 'user' ? 'Voice Input' : 'Voice Assisted'}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isRecording && (
              <div className="flex justify-end animate-message">
                <div className="bg-red-500/20 border border-red-500/30 p-3 rounded-2xl rounded-br-none flex items-center space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-red-400">Recording... {formatTime(recordingTime)}</span>
                </div>
              </div>
            )}
            {isLoading && <ThinkingIndicator />}
          </div>

          <div className="p-4 border-t border-white/10 bg-slate-900/90 backdrop-blur-md">
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_TOPICS.map((topic, i) => (
                <button 
                  key={i}
                  disabled={isLoading || isRecording}
                  onClick={() => handleSend(topic)}
                  className="text-[11px] bg-slate-800 hover:bg-indigo-900/50 hover:border-indigo-500/50 text-indigo-200 py-1.5 px-3 rounded-full border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
                >
                  {topic}
                </button>
              ))}
            </div>
            <div className="flex space-x-2 items-center">
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`p-3 rounded-2xl transition-all active:scale-95 shadow-lg ${
                  isRecording 
                  ? 'bg-red-500 hover:bg-red-400 text-white animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {isRecording ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <input 
                disabled={isLoading || isRecording}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder={isRecording ? "Listening..." : "Ask your creative question..."}
                className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:scale-[1.01] focus:shadow-[0_0_20px_rgba(99,102,241,0.25)] focus:border-indigo-500/40 transition-all duration-300 disabled:opacity-50"
              />
              <button 
                disabled={isLoading || isRecording || !input.trim()}
                onClick={() => handleSend(input)}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white p-3 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="music-gradient h-16 w-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 ring-4 ring-white/10 group"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
        </div>
      </button>
    </div>
  );
};

export default AIChat;
