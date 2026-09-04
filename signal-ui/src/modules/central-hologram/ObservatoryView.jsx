import React, { useState, useEffect, useRef } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { eventBus, EVENTS } from '../../core/eventBus';
import { JarvisReactor } from './JarvisReactor';
import { Database, Lightbulb, BarChart3, Box } from 'lucide-react';

export const ObservatoryView = () => {
  const { orbState, messages, addConversationMessage } = useNexusStore();
  const [overrideState, setOverrideState] = useState(null);
  const errorTimerRef = useRef(null);

  // Helper to trigger red warning error state safely for 4 seconds
  const triggerRedErrorState = () => {
    soundService.alert();
    setOverrideState('error');
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
    }
    errorTimerRef.current = setTimeout(() => {
      setOverrideState(null);
    }, 4000);
  };

  // 1. Direct subscription to orbState === 'error'
  useEffect(() => {
    if (orbState === 'error') {
      triggerRedErrorState();
    }
  }, [orbState]);

  // 2. Persistent detection of error / rejection / failure / not-found / couldn't in last message
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];

    if (lastMsg.role === 'assistant' || lastMsg.role === 'jarvis') {
      const lower = (lastMsg.text || '').toLowerCase();
      const errorKeywords = [
        'error', 'reject', 'unable', 'failed', 'cannot', "couldn't", "can't",
        'could not', 'not find', 'not found', "didn't find", 'no match',
        'invalid', 'unknown', 'sorry', 'unrecognized', 'problem', 'issue', 'don\'t'
      ];
      const isError = errorKeywords.some((kw) => lower.includes(kw));
      if (isError) {
        triggerRedErrorState();
      }
    }
  }, [messages]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  // Compute active reactor state: 'error' (red) | 'listening' | 'thinking' | 'responding' | 'idle' | 'dormant'
  let currentState = overrideState;
  if (!currentState) {
    if (orbState === 'error') currentState = 'error';
    else if (orbState === 'listening') currentState = 'listening';
    else if (orbState === 'processing') currentState = 'thinking';
    else if (orbState === 'speaking') currentState = 'responding';
    else if (messages && messages.length > 2) currentState = 'idle';
    else currentState = 'dormant';
  }

  const handleAction = (label, query) => {
    soundService.buttonClick();
    resetInactivityTimer();
    addConversationMessage('user', query);

    // If testing error state
    if (query.toLowerCase().includes('reject') || query.toLowerCase().includes('error')) {
      setTimeout(() => {
        addConversationMessage('assistant', `Command rejected: Cannot fulfill requested system operation.`);
      }, 600);
      return;
    }

    setTimeout(() => {
      addConversationMessage('assistant', `Executing ${label}... Analyzing context and telemetry.`);
    }, 600);
  };

  return (
    <div className="relative flex-1 h-full min-h-0 overflow-hidden flex flex-col justify-between select-none bg-[#02050f]">
      {/* 1. CINEMATIC HIGH-RESOLUTION LABORATORY OBSERVATORY CHAMBER BACKDROP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Photorealistic Sci-Fi Chamber Background Image */}
        <img
          src="/observatory_bg.jpg"
          alt="Sci-Fi Observatory Chamber"
          className="w-full h-full object-cover object-center transition-all duration-700 opacity-90"
        />

        {/* Dynamic Threat Red Warning Flash Overlay */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            currentState === 'error' ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle at center, rgba(255,0,50,0.4) 0%, rgba(160,0,40,0.65) 60%, rgba(20,0,5,0.9) 100%)',
            mixBlendMode: 'color-dodge',
          }}
        />

        {/* Soft Core Radial Ambient Light directly behind the Reactor */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[110px] pointer-events-none transition-all duration-700"
          style={{
            background: currentState === 'error'
              ? 'radial-gradient(circle, rgba(255,0,85,0.55) 0%, rgba(180,0,50,0.2) 50%, transparent 80%)'
              : currentState === 'dormant'
              ? 'transparent'
              : 'radial-gradient(circle, rgba(0,240,255,0.38) 0%, rgba(59,130,246,0.18) 50%, transparent 80%)',
          }}
        />
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
        {/* Left Floating Glass Pill: Status */}
        <div className={`absolute left-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-2xl transition-all ${
          currentState === 'error'
            ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
            : 'bg-slate-900/60 border-cyan-500/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        }`}>
          <div className={`flex items-center gap-1 ${currentState === 'error' ? 'text-rose-400' : 'text-cyan-400'}`}>
            <span className={`w-1 h-3 rounded-full animate-pulse ${currentState === 'error' ? 'bg-rose-400' : 'bg-cyan-400'}`} />
            <span className={`w-1 h-5 rounded-full animate-pulse [animation-delay:150ms] ${currentState === 'error' ? 'bg-rose-400' : 'bg-cyan-400'}`} />
            <span className={`w-1 h-2.5 rounded-full animate-pulse [animation-delay:300ms] ${currentState === 'error' ? 'bg-rose-400' : 'bg-cyan-400'}`} />
          </div>
          <span className={`text-xs font-medium tracking-wide ${currentState === 'error' ? 'text-rose-200 font-bold' : 'text-slate-200'}`}>
            {currentState === 'error' ? 'Command Failed / Not Found' : currentState === 'dormant' ? 'Reactor OFF (10s Inactive)' : 'Listening...'}
          </span>
        </div>

        {/* Master JarvisReactor Component */}
        <JarvisReactor state={currentState} />

        {/* Right Floating Glass Pill: State Indicator */}
        <div className={`absolute right-8 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3 px-4 py-2.5 rounded-2xl backdrop-blur-md border shadow-2xl transition-all ${
          currentState === 'error'
            ? 'bg-rose-950/80 border-rose-500/70 text-rose-200 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
            : 'bg-slate-900/60 border-blue-500/25 text-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
        }`}>
          <span className="text-xs font-medium tracking-wide">
            {currentState === 'error' ? 'Threat / Warning' : currentState === 'dormant' ? 'Lights OFF (Standby)' : 'Processing...'}
          </span>
          <div className={`flex items-center gap-1 ${currentState === 'error' ? 'text-rose-400' : 'text-blue-400'}`}>
            <span className={`w-1 h-2.5 rounded-full animate-pulse ${currentState === 'error' ? 'bg-rose-400' : 'bg-blue-400'}`} />
            <span className={`w-1 h-5 rounded-full animate-pulse [animation-delay:100ms] ${currentState === 'error' ? 'bg-rose-400' : 'bg-blue-400'}`} />
            <span className={`w-1 h-3 rounded-full animate-pulse ${currentState === 'error' ? 'bg-rose-400' : 'bg-blue-400'}`} />
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

          {/* Card 4 (Test Command Rejection) */}
          <button
            onClick={() => handleAction('Test Command Rejection', 'Reject command execution.')}
            className="group flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-900/60 hover:bg-rose-950/40 backdrop-blur-md border border-slate-800 hover:border-rose-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:text-rose-300 transition-all mb-2 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
              <Box className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-medium text-slate-200 group-hover:text-rose-200 text-center leading-tight">
              Test Reject<br />Warning
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservatoryView;
