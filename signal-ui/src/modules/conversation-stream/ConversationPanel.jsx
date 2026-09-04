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
  Activity,
  Check,
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
    addConversationMessage('you', text);
    setInputVal('');

    // Simulate JARVIS thinking and responding
    setOrbState('processing');
    setTimeout(() => {
      setOrbState('speaking');
      addConversationMessage('assistant', `Understood. Analyzing telemetry and processing your query regarding "${text}".`);
      setTimeout(() => {
        setOrbState('idle');
      }, 2500);
    }, 1200);
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
    <div className="w-full h-full flex flex-col justify-between bg-[#040916]/85 backdrop-blur-2xl border border-cyan-500/20 rounded-2xl shadow-2xl p-4 select-none z-20 overflow-hidden">
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/15 shrink-0">
        <h2 className="text-base font-bold tracking-wide text-white">Conversation</h2>
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

      {/* 2. Messages Stream */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-4 my-3 pr-1 text-sm font-sans"
      >
        {/* User Voice Message 1 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600/80 flex items-center justify-center text-white shadow-[0_0_8px_rgba(37,99,235,0.6)]">
              <Mic className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold text-slate-200">You</span>
            <span className="text-[10px] text-slate-500">11:47 PM</span>
          </div>

          <div className="ml-8 bg-[#091328]/90 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-3 space-y-2 shadow-lg">
            <p className="text-slate-100 text-xs leading-relaxed">
              What is the summary of this PDF?
            </p>

            {/* Audio Waveform Player */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => togglePlayVoice('v1')}
                className="w-7 h-7 rounded-full bg-blue-600/60 hover:bg-blue-600 flex items-center justify-center text-white transition-all cursor-pointer shadow-[0_0_8px_rgba(37,99,235,0.5)]"
              >
                {playingVoice === 'v1' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
              </button>

              {/* Waveform Bars */}
              <div className="flex-1 flex items-center gap-0.5 h-6">
                {[12, 18, 8, 22, 14, 26, 10, 20, 15, 24, 18, 12, 28, 16, 22, 14, 18, 9, 21, 15, 11, 25, 17, 13, 20, 12, 16].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      playingVoice === 'v1' && i < 15
                        ? 'bg-cyan-300 shadow-[0_0_6px_#00f0ff]'
                        : 'bg-cyan-500/40'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0">0:04</span>
            </div>
          </div>
        </div>

        {/* JARVIS AI Response 1 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full bg-[#0a1630] border border-cyan-400/80 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.5)]">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-cyan-300">JARVIS</span>
            <span className="text-[10px] text-slate-500">11:47 PM</span>
          </div>

          <div className="ml-8 bg-[#061022]/90 border border-cyan-500/30 rounded-2xl rounded-tl-sm p-3 space-y-2.5 shadow-lg">
            <p className="text-slate-200 text-xs leading-relaxed">
              I've analyzed the PDF. Here's a concise summary:
            </p>

            <ol className="space-y-1.5 text-xs text-slate-300 pl-4 list-decimal marker:text-cyan-400 marker:font-bold leading-relaxed">
              <li>The document discusses the fundamentals of artificial intelligence...</li>
              <li>It highlights real-world applications in healthcare, education, and industry...</li>
              <li>It concludes with future opportunities and challenges...</li>
            </ol>

            {/* Attached PDF Card */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0a1836]/90 border border-cyan-500/30 shadow-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-100">AI_Research_Paper.pdf</div>
                  <div className="text-[10px] text-slate-400">12 pages • Analyzed</div>
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
          </div>
        </div>

        {/* User Voice Message 2 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-600/80 flex items-center justify-center text-white shadow-[0_0_8px_rgba(37,99,235,0.6)]">
              <Mic className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold text-slate-200">You</span>
            <span className="text-[10px] text-slate-500">11:48 PM</span>
          </div>

          <div className="ml-8 bg-[#091328]/90 border border-cyan-500/20 rounded-2xl rounded-tl-sm p-3 space-y-2 shadow-lg">
            <p className="text-slate-100 text-xs leading-relaxed">
              Can you explain the second point in detail?
            </p>

            {/* Audio Waveform Player */}
            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => togglePlayVoice('v2')}
                className="w-7 h-7 rounded-full bg-blue-600/60 hover:bg-blue-600 flex items-center justify-center text-white transition-all cursor-pointer shadow-[0_0_8px_rgba(37,99,235,0.5)]"
              >
                {playingVoice === 'v2' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
              </button>

              <div className="flex-1 flex items-center gap-0.5 h-6">
                {[14, 20, 10, 24, 18, 22, 12, 19, 14, 26, 17, 11, 23, 15, 20, 13, 16].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      playingVoice === 'v2' && i < 10
                        ? 'bg-cyan-300 shadow-[0_0_6px_#00f0ff]'
                        : 'bg-cyan-500/40'
                    }`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              <span className="text-[11px] font-mono text-slate-400 shrink-0">0:03</span>
            </div>
          </div>
        </div>

        {/* JARVIS AI Reply 2 */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="relative w-6 h-6 rounded-full bg-[#0a1630] border border-cyan-400/80 flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.5)]">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-cyan-300">JARVIS</span>
            <span className="text-[10px] text-slate-500">11:48 PM</span>
          </div>

          <div className="ml-8 bg-[#061022]/90 border border-cyan-500/30 rounded-2xl rounded-tl-sm p-3 space-y-2 shadow-lg">
            <p className="text-slate-200 text-xs leading-relaxed">
              Sure! The second point focuses on real-world applications...
            </p>

            {/* Typing Indicator Dots */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* Dynamic New Messages */}
        {messages.slice(2).map((m) => {
          const isUser = m.role === 'you' || m.role === 'user';
          return (
            <div key={m.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                    isUser
                      ? 'bg-blue-600/80 shadow-[0_0_8px_rgba(37,99,235,0.6)]'
                      : 'bg-[#0a1630] border border-cyan-400/80 shadow-[0_0_8px_rgba(0,240,255,0.5)]'
                  }`}
                >
                  {isUser ? <Mic className="w-3 h-3" /> : <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <span className={`text-xs font-semibold ${isUser ? 'text-slate-200' : 'text-cyan-300'}`}>
                  {isUser ? 'You' : 'JARVIS'}
                </span>
                <span className="text-[10px] text-slate-500">{m.time}</span>
              </div>
              <div
                className={`ml-8 rounded-2xl rounded-tl-sm p-3 shadow-lg text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#091328]/90 border border-cyan-500/20 text-slate-100'
                    : 'bg-[#061022]/90 border border-cyan-500/30 text-slate-200'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Input Box & Voice State Pills */}
      <div className="space-y-2.5 pt-2 border-t border-cyan-500/15 shrink-0">
        {/* Input Bar */}
        <div className="relative flex items-center gap-2 bg-[#061024]/90 border border-cyan-500/25 rounded-full px-3 py-1.5 shadow-[inset_0_0_12px_rgba(0,240,255,0.06)]">
          {/* Waveform Voice Trigger Button */}
          <button
            onClick={() => {
              soundService.click();
              setOrbState(orbState === 'listening' ? 'idle' : 'listening');
            }}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              orbState === 'listening' ? 'text-emerald-400 animate-pulse' : 'text-cyan-400 hover:text-cyan-200'
            }`}
            title="Toggle Voice Input"
          >
            <Activity className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Speak or type your message..."
            className="flex-1 bg-transparent border-none outline-none text-xs text-slate-100 placeholder:text-slate-500 font-sans tracking-wide"
          />

          {/* Paperclip Attachment */}
          <button
            onClick={() => soundService.click()}
            className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white flex items-center justify-center shadow-[0_0_12px_rgba(37,99,235,0.6)] transition-all cursor-pointer"
            title="Send Message"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Assistant Voice State Pills */}
        <div className="flex items-center justify-between px-1">
          <button
            onClick={() => {
              soundService.click();
              setOrbState('listening');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              orbState === 'listening'
                ? 'bg-emerald-950/60 border border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'text-slate-400 hover:text-emerald-300 border border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${orbState === 'listening' ? 'bg-emerald-400 animate-ping' : 'bg-emerald-500'}`} />
            <span>Listening</span>
          </button>

          <button
            onClick={() => {
              soundService.click();
              setOrbState('processing');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              orbState === 'processing'
                ? 'bg-cyan-950/60 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                : 'text-slate-400 hover:text-cyan-300 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Processing</span>
          </button>

          <button
            onClick={() => {
              soundService.click();
              setOrbState('speaking');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              orbState === 'speaking'
                ? 'bg-blue-950/60 border border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                : 'text-slate-400 hover:text-blue-300 border border-transparent'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${orbState === 'speaking' ? 'bg-blue-400 animate-pulse' : 'bg-blue-500'}`} />
            <span>Responding</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationPanel;
