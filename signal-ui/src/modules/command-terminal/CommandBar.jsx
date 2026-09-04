import React, { useState } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';
import {
  Crosshair,
  Maximize,
  Minimize,
  Sliders,
  Grid,
  Send,
} from 'lucide-react';

export const CommandBar = () => {
  const {
    executeCommand,
    toggleHoloMode,
    holoMode,
    toggleQuickAccess,
  } = useNexusStore();

  const [inputVal, setInputVal] = useState('');
  const [outputMsg, setOutputMsg] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const res = executeCommand(inputVal);
    setOutputMsg(res);
    setInputVal('');

    setTimeout(() => {
      setOutputMsg('');
    }, 4500);
  };

  const handleKeyDown = () => {
    soundFx.terminalKey();
  };

  const toggleFullscreen = () => {
    soundFx.click();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  return (
    <footer className="relative z-30 w-full px-3 py-1 border-t border-cyan-500/20 bg-[#060b19]/95 backdrop-blur-md shrink-0 select-none">
      {/* Dynamic Command Feedback Toast */}
      {outputMsg && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 rounded border border-cyan-400/80 bg-[#061430] text-cyan-200 text-[10px] font-mono shadow-2xl z-50 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span>{outputMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Left Mini Glyph */}
        <div className="flex items-center gap-2 text-cyan-400/60 shrink-0">
          <div className="p-1 rounded border border-cyan-500/20 bg-cyan-950/30">
            <Grid className="w-3 h-3 text-cyan-400" />
          </div>
          <div className="text-[9px] font-mono tracking-widest text-slate-400 hidden sm:block">
            CLI // READY
          </div>
        </div>

        {/* Center Command Line Prompt */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-2xl relative">
          <div className="relative flex items-center">
            <span className="absolute left-2.5 font-mono font-bold text-cyan-400 text-xs select-none pointer-events-none">
              &gt;_
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type directive (e.g. 'open browser', 'play music', 'scan', 'boost', 'help')..."
              className="w-full pl-8 pr-8 py-1 bg-[#050e24]/80 border border-cyan-500/30 rounded focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-cyan-200 font-mono text-[11px] placeholder:text-slate-500 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 p-1 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
              title="Execute Directive"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </form>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={toggleQuickAccess}
            onMouseEnter={() => soundFx.hover()}
            className="flex items-center gap-1 px-2.5 py-1 rounded border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-cyan-300 font-mono text-[10px] font-semibold tracking-wider transition-all cursor-pointer"
          >
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">QUICK ACCESS</span>
          </button>

          <button
            onClick={toggleHoloMode}
            onMouseEnter={() => soundFx.hover()}
            className={`flex items-center gap-1 px-2.5 py-1 rounded border font-mono text-[10px] font-semibold tracking-wider transition-all cursor-pointer ${
              holoMode
                ? 'border-cyan-400 bg-cyan-500/30 text-cyan-200 glow-box-cyan'
                : 'border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400 text-slate-300'
            }`}
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span className="hidden md:inline">HOLO MODE</span>
          </button>

          <button
            onClick={toggleFullscreen}
            onMouseEnter={() => soundFx.hover()}
            className="flex items-center gap-1 px-2 py-1 rounded border border-cyan-500/30 bg-cyan-950/20 hover:border-cyan-400 hover:bg-cyan-500/10 text-slate-300 font-mono text-[10px] font-semibold tracking-wider transition-all cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="w-3 h-3 text-cyan-400" />
            ) : (
              <Maximize className="w-3 h-3 text-cyan-400" />
            )}
            <span className="hidden md:inline">FULL SCREEN</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default CommandBar;

