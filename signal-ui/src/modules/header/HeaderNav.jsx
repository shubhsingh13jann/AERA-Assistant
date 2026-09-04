import React, { useState, useEffect } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import { Sun, ChevronDown, User, RotateCcw } from 'lucide-react';

export const HeaderNav = ({ className = '' }) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-4 select-none ${className}`}>
      {/* Date & Time */}
      <div className="text-right leading-tight">
        <div className="text-xs text-slate-400 font-medium">
          {dateStr || 'Mon, May 26, 2026'}
        </div>
        <div className="text-sm text-slate-100 font-bold tracking-wide mt-0.5">
          {timeStr || '11:47 PM'}
        </div>
      </div>

            {/* Refresh Interface (Reload) Button */}
      <button
        onClick={() => {
          soundService.click();
          window.location.reload();
        }}
        onMouseEnter={() => soundService.hover()}
        className="w-9 h-9 rounded-full bg-[#0a1224]/80 border border-cyan-500/25 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer group"
        title="Refresh Interface (Reload)"
      >
        <RotateCcw className="w-4 h-4 text-cyan-300 group-hover:rotate-[-180deg] transition-transform duration-500" />
      </button>

      {/* Sun / Theme Button */}
      <button
        onClick={() => soundService.click()}
        onMouseEnter={() => soundService.hover()}
        className="w-9 h-9 rounded-full bg-[#0a1224]/80 border border-cyan-500/25 flex items-center justify-center text-slate-300 hover:text-cyan-300 hover:border-cyan-400/50 hover:shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
        title="Toggle Theme"
      >
        <Sun className="w-4 h-4 text-cyan-300" />
      </button>

      {/* User Profile Avatar with Caret */}
      <div className="relative">
        <button
          onClick={() => {
            soundService.click();
            setProfileOpen(!profileOpen);
          }}
          onMouseEnter={() => soundService.hover()}
          className="flex items-center gap-1.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-full bg-[#0d1f44] border-2 border-cyan-400/70 p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.4)] flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-600 via-blue-700 to-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-300 transition-colors" />
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 w-48 rounded-xl border border-cyan-500/30 bg-[#050b18]/95 backdrop-blur-2xl p-3 shadow-2xl z-50 text-xs font-mono space-y-2">
            <div className="text-cyan-300 font-bold border-b border-cyan-500/20 pb-1.5 flex items-center justify-between">
              <span>OPERATOR</span>
              <span className="text-[10px] text-emerald-400 font-normal">ACTIVE</span>
            </div>
            <div className="text-slate-300 text-[11px] space-y-1">
              <div>Role: AI Architect</div>
              <div>System: JARVIS v1.0</div>
              <div className="text-cyan-400 text-[10px]">Access Level: 10 (Root)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderNav;


