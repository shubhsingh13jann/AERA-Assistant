import React, { useRef, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import { Sparkles } from 'lucide-react';

export const SystemLogs = () => {
  const { messages, logViewMode, setLogViewMode } = useNexusStore();
  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever new messages come in
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, logViewMode]);

  return (
    <div
      className="hud-panel p-2.5 rounded relative flex flex-col h-full overflow-hidden"
      onMouseEnter={() => soundFx.hover()}
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-300 pb-1 border-b border-cyan-500/20 shrink-0">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-cyan-400 font-bold">//</span>
          <span className="text-slate-200">LIVE CONVERSATION STREAM</span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-[#050f24] p-0.5 rounded border border-cyan-500/20 text-[8px]">
          <button
            onClick={() => setLogViewMode('conversation')}
            className={`px-1.5 py-0.5 rounded transition-all font-mono font-bold ${
              logViewMode === 'conversation'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            CHAT
          </button>
          <button
            onClick={() => setLogViewMode('kernel')}
            className={`px-1.5 py-0.5 rounded transition-all font-mono font-bold ${
              logViewMode === 'kernel'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            KERNEL
          </button>
        </div>
      </div>

      {/* Messages / Logs Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 my-1 pr-1 font-mono text-[10px]"
      >
        {logViewMode === 'conversation' ? (
          (!messages || messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-3 border border-dashed border-cyan-900/30 rounded bg-[#061026]/40">
              <Sparkles className="w-5 h-5 text-cyan-400 mb-1 animate-pulse" />
              <div className="text-[10px] text-cyan-300 font-bold">JARVIS Matrix Armed</div>
              <div className="text-[8px] text-slate-400 mt-0.5">
                Say <span className="text-cyan-300 font-semibold">"Hey Jarvis"</span> or type a command below.
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.role === 'you' || m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`p-1.5 rounded border backdrop-blur-sm transition-all ${
                    isUser
                      ? 'bg-[#091328]/80 border-cyan-600/30 hover:border-cyan-500/60'
                      : 'bg-[#051c24]/80 border-emerald-600/30 hover:border-emerald-400/60 shadow-[0_0_8px_rgba(0,240,255,0.06)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5 text-[8px]">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-bold px-1 py-0.2 rounded border ${
                          isUser
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-600/40'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isUser ? 'YOU // VOICE' : 'JARVIS // AI'}
                      </span>
                      {m.tag && (
                        <span className={`px-1 py-0.2 rounded border text-[7px] ${m.tag.color}`}>
                          {m.tag.label}
                        </span>
                      )}
                    </div>
                    <span className="text-[8px] text-slate-500">{m.time}</span>
                  </div>
                  <p className={`text-[9px] leading-relaxed ${isUser ? 'text-slate-200' : 'text-cyan-100 font-medium'}`}>
                    {m.text}
                  </p>
                </div>
              );
            })
          )
        ) : (
          // Kernel Diagnostic Events
          <div className="space-y-1 text-[9px] text-slate-300">
            <div className="flex items-baseline gap-1.5 text-cyan-400/80">
              <span>07:41:59</span>
              <span className="text-slate-300">System boot sequence completed</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-cyan-400/80">
              <span>07:41:59</span>
              <span className="text-slate-300">Neural core synchronized</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-cyan-400/80">
              <span>07:42:01</span>
              <span className="text-cyan-300">Quantum link established [QL-512]</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-cyan-400/80">
              <span>07:42:02</span>
              <span className="text-emerald-300">All local audio & intent modules operational</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-cyan-400/80">
              <span>07:42:05</span>
              <span className="text-slate-300">Acoustic matrix calibrated to microphone</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;

