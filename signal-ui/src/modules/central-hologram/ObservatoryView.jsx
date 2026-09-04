import React from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { JarvisReactor } from './JarvisReactor';
import { Database, Lightbulb, BarChart3, Box } from 'lucide-react';

export const ObservatoryView = () => {
  const { orbState, addConversationMessage } = useNexusStore();

  const handleAction = (label, query) => {
    soundService.buttonClick();
    addConversationMessage('user', query);
    setTimeout(() => {
      addConversationMessage('assistant', `Executing ${label}... Analyzing context and telemetry.`);
    }, 600);
  };

  return (
    <div className="relative flex-1 h-full min-h-0 overflow-hidden flex flex-col justify-between select-none bg-[#030712]">
      {/* Deep Space / Observatory Cockpit Curved Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Planetary Horizon Glow */}
        <div
          className="absolute -bottom-[38%] left-[-15%] right-[-15%] h-[75%] rounded-[100%] border-t border-cyan-500/20 shadow-[0_-20px_80px_rgba(0,180,255,0.18)]"
          style={{
            background: 'radial-gradient(ellipse at center bottom, #091a3c 0%, #040d22 45%, #020614 75%, transparent 100%)',
          }}
        />

        {/* Distant stars */}
        <div className="absolute top-12 left-16 w-1 h-1 bg-white/70 rounded-full blur-[0.5px]" />
        <div className="absolute top-24 left-32 w-1.5 h-1.5 bg-cyan-200/80 rounded-full blur-[0.5px]" />
        <div className="absolute top-10 right-28 w-1 h-1 bg-white/60 rounded-full" />
        <div className="absolute top-36 right-48 w-1.5 h-1.5 bg-blue-300/80 rounded-full blur-[0.5px]" />
        <div className="absolute top-44 left-1/4 w-1 h-1 bg-white/50 rounded-full" />
        <div className="absolute top-16 right-1/3 w-1 h-1 bg-white/70 rounded-full" />

        {/* Ambient Observatory Window Vignette / Arch */}
        <div className="absolute inset-0 border border-cyan-900/15 rounded-3xl m-3 pointer-events-none shadow-[inset_0_0_80px_rgba(2,6,23,0.85)]" />
      </div>

      {/* Top Section: Ambient Quote */}
      <div className="relative z-10 px-8 pt-8 flex items-start justify-between pointer-events-none">
        <div>
          <p className="text-slate-300/85 text-sm md:text-base font-light tracking-wide italic">
            &ldquo;A smarter tomorrow, with you.&rdquo;
          </p>
        </div>
      </div>

      {/* Central Floating Viewport: Pure Digital Holographic JARVIS Energy Core */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
        {/* Left Floating Glass Pill: Listening... */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-cyan-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-cyan-400/50">
          <div className="flex items-center gap-1 text-cyan-400">
            <span className="w-1 h-3 bg-cyan-400 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-cyan-400 rounded-full animate-pulse [animation-delay:150ms]" />
            <span className="w-1 h-2.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:300ms]" />
          </div>
          <span className="text-xs font-medium text-slate-200 tracking-wide">Listening...</span>
        </div>

        {/* Master JarvisReactor Component */}
        <JarvisReactor state={orbState} />

        {/* Right Floating Glass Pill: Processing... */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-blue-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all hover:border-blue-400/50">
          <span className="text-xs font-medium text-slate-200 tracking-wide">Processing...</span>
          <div className="flex items-center gap-1 text-blue-400">
            <span className="w-1 h-2.5 bg-blue-400 rounded-full animate-pulse [animation-delay:200ms]" />
            <span className="w-1 h-5 bg-blue-400 rounded-full animate-pulse [animation-delay:100ms]" />
            <span className="w-1 h-3 bg-blue-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Mid-Lower Text Quote */}
      <div className="relative z-10 px-8 flex justify-end pointer-events-none mb-2">
        <p className="text-slate-400/80 text-xs md:text-sm font-light tracking-wide italic">
          &ldquo;Ask anything. I'm here to help.&rdquo;
        </p>
      </div>

      {/* Bottom 4 Quick Action Cards */}
      <div className="relative z-20 px-8 pb-7">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto">
          {/* Card 1 */}
          <button
            onClick={() => handleAction('Document Analysis', 'Analyze the active document set.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all mb-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Database className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-200 text-center leading-tight">
              Analyze<br />Documents
            </span>
          </button>

          {/* Card 2 */}
          <button
            onClick={() => handleAction('Q&A Assistant', 'How do quantum circuits maintain superposition?')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-blue-950/40 backdrop-blur-md border border-slate-800 hover:border-blue-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all mb-2 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <Lightbulb className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-blue-200 text-center leading-tight">
              Answer<br />Questions
            </span>
          </button>

          {/* Card 3 */}
          <button
            onClick={() => handleAction('Insight Engine', 'Generate telemetry insights for current node operations.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-indigo-950/40 backdrop-blur-md border border-slate-800 hover:border-indigo-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all mb-2 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-200 text-center leading-tight">
              Generate<br />Insights
            </span>
          </button>

          {/* Card 4 */}
          <button
            onClick={() => handleAction('Architecture Builder', 'Formulate a distributed event queue architecture.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-cyan-950/40 backdrop-blur-md border border-slate-800 hover:border-cyan-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:text-cyan-300 transition-all mb-2 shadow-[0_0_12px_rgba(0,240,255,0.2)]">
              <Box className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-cyan-200 text-center leading-tight">
              Build<br />Solutions
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservatoryView;
