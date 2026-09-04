import React, { useState, useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import {
  Mic,
  FileText,
  Copy,
  Download,
  ExternalLink,
  Paperclip,
  Send,
  Play,
  Pause,
  Check,
  Sparkles,
} from 'lucide-react';

export const ConversationPanel = () => {
  const { messages, addConversationMessage, orbState, setOrbState } = useNexusStore();
  const [inputVal, setInputVal] = useState('');
  const [playingVoice, setPlayingVoice] = useState(null);
  const [copiedFile, setCopiedFile] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text) return;
    soundService.click();
    setInputVal('');

    // Check if running inside Pywebview Python desktop shell
    if (window.pywebview && window.pywebview.api && window.pywebview.api.process_text_command) {
      window.pywebview.api.process_text_command(text);
      return;
    }

    // Web Browser Local Intent Fallback Mode
    addConversationMessage('you', text);
    setOrbState('listening');

    const lower = text.toLowerCase();
    if (lower === 'hey jarvis' || lower === 'hi jarvis' || lower === 'jarvis' || lower === 'hello jarvis') {
      setTimeout(() => {
        setOrbState('speaking');
        addConversationMessage('assistant', 'Yes boss.');
        setTimeout(() => setOrbState('idle'), 2000);
      }, 400);
      return;
    }

    setTimeout(() => {
      setOrbState('processing');
      setTimeout(() => {
        setOrbState('speaking');
        addConversationMessage('assistant', `Directive received: "${text}". Intent pipeline executed successfully.`);
        setTimeout(() => setOrbState('idle'), 2000);
      }, 800);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const togglePlayVoice = (id) => {
    soundService.click();
    if (playingVoice === id) {
      setPlayingVoice(null);
    } else {
      setPlayingVoice(id);
      setTimeout(() => setPlayingVoice(null), 4000);
    }
  };

  const handleCopy = () => {
    soundService.click();
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-[#040916]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl shadow-2xl p-4 select-none z-20 overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
          <h2 className="text-base font-bold tracking-wide text-white">Conversation</h2>
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_6px_#10b981]" />
          </span>
          <span className="text-[11px] font-mono font-semibold text-emerald-400 tracking-wider">
            JARVIS Active
          </span>
        </div>
      </div>

      {/* 2. Messages Stream (Dynamically linked to Python backend & state) */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-4 my-3 pr-1 text-sm font-sans"
      >
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => {
            const isUser = msg.role === 'you' || msg.role === 'user';
            const isJarvis = msg.role === 'assistant' || msg.role === 'jarvis';

            return (
              <div key={msg.id || index} className="space-y-1 animate-fadeIn">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isUser ? (
                      <div className="w-6 h-6 rounded-full bg-blue-600/80 flex items-center justify-center text-white shadow-[0_0_8px_rgba(37,99,235,0.6)] shrink-0">
                        <Mic className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="relative w-6 h-6 rounded-full bg-[#0a1630] border border-cyan-400/80 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.5)] shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                      </div>
                    )}
                    <span className={`text-xs font-semibold ${isUser ? 'text-slate-200' : 'text-cyan-300'}`}>
                      {isUser ? 'You' : 'JARVIS'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.time || 'NOW'}</span>
                  </div>

                  {msg.tag && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${msg.tag.color || 'border-cyan-500/30 text-cyan-300'}`}>
                      {msg.tag.label}
                    </span>
                  )}
                </div>

                {/* Content Box */}
                <div
                  className={`ml-8 rounded-2xl rounded-tl-sm p-3 shadow-lg space-y-2 ${
                    isUser
                      ? 'bg-[#091328]/95 border border-cyan-500/20'
                      : 'bg-[#061022]/95 border border-cyan-500/30'
                  }`}
                >
                  <p className="text-slate-200 text-xs md:text-sm leading-relaxed font-sans whitespace-pre-wrap">
                    {msg.text}
                  </p>

                  {/* Audio Waveform Player if message contains audio sample */}
                  {msg.audioUrl && (
                    <div className="flex items-center gap-2.5 pt-1">
                      <button
                        onClick={() => togglePlayVoice(msg.id)}
                        className="w-7 h-7 rounded-full bg-blue-600/60 hover:bg-blue-600 flex items-center justify-center text-white transition-all cursor-pointer shadow-[0_0_8px_rgba(37,99,235,0.5)]"
                      >
                        {playingVoice === msg.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                      </button>

                      <div className="flex-1 flex items-center gap-0.5 h-6">
                        {[12, 18, 8, 22, 14, 26, 10, 20, 15, 24, 18, 12, 28, 16, 22, 14, 18, 9, 21, 15].map((h, i) => (
                          <div
                            key={i}
                            className={`w-1 rounded-full transition-all duration-150 ${
                              playingVoice === msg.id && i < 12
                                ? 'bg-cyan-300 shadow-[0_0_6px_#00f0ff]'
                                : 'bg-cyan-500/40'
                            }`}
                            style={{ height: `${h}px` }}
                          />
                        ))}
                      </div>

                      <span className="text-[11px] font-mono text-slate-400 shrink-0">0:03</span>
                    </div>
                  )}

                  {/* Optional File Card Attachment */}
                  {msg.file && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a1836]/90 border border-cyan-500/30 shadow-md mt-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-red-400" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-100">{msg.file.name || 'AI_Research_Paper.pdf'}</div>
                          <div className="text-[10px] text-slate-400">{msg.file.size || '12 pages • Analyzed'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          onClick={handleCopy}
                          className="p-1 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors cursor-pointer"
                          title="Copy reference"
                        >
                          {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => soundService.click()}
                          className="p-1 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => soundService.click()}
                          className="p-1 hover:text-cyan-300 hover:bg-cyan-500/10 rounded transition-colors cursor-pointer"
                          title="Open externally"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 py-12">
            <Sparkles className="w-8 h-8 text-cyan-500/40 animate-pulse" />
            <p className="text-xs font-mono text-cyan-400/80">Listening for trigger &ldquo;Hey Jarvis&rdquo;...</p>
          </div>
        )}

        {/* Live Typing / Processing Indicator */}
        {(orbState === 'listening' || orbState === 'processing' || orbState === 'speaking') && (
          <div className="space-y-1 animate-fadeIn">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full bg-[#0a1630] border border-cyan-400/80 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.5)]">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <span className="text-xs font-semibold text-cyan-300">JARVIS</span>
            </div>

            <div className="ml-8 bg-[#061022]/90 border border-cyan-500/30 rounded-2xl rounded-tl-sm p-3 shadow-lg flex items-center gap-2 text-cyan-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{orbState === 'listening' ? 'Listening to voice...' : orbState === 'processing' ? 'Processing neural intent...' : 'Synthesizing response...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Input & Voice Status Controls */}
      <div className="space-y-2 pt-2 border-t border-cyan-500/15 shrink-0">
        {/* Input Bar */}
        <div className="relative flex items-center bg-[#071126]/90 border border-cyan-500/30 rounded-full px-3.5 py-2 shadow-inner focus-within:border-cyan-400/70 focus-within:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all">
          <Mic className="w-4 h-4 text-cyan-400 mr-2 shrink-0 animate-pulse" />

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak or type your message..."
            className="w-full bg-transparent text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />

          <div className="flex items-center gap-1.5 ml-2 shrink-0">
            <button
              onClick={() => soundService.click()}
              className="p-1 hover:text-cyan-300 text-slate-400 transition-colors cursor-pointer"
              title="Attach File"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
              title="Send Message"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Voice Pipeline Status Filter Pills */}
        <div className="flex items-center justify-between px-1 text-[11px] font-mono">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            orbState === 'listening' ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Listening</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            orbState === 'processing' ? 'bg-cyan-950/60 border-cyan-500/60 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Processing</span>
          </div>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition-all ${
            orbState === 'speaking' ? 'bg-blue-950/60 border-blue-500/60 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-900/40 border-slate-800 text-slate-500'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span>Responding</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPanel;
