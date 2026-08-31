import { useState, useEffect } from "react";
import FluidArcReactor from "./FluidArcReactor";
import Conversation from "./Conversation";
import MicMeter from "./MicMeter";
import QuickActions from "./QuickActions";

export default function App() {
  const [orbState, setOrbState] = useState("idle");
  const [messages, setMessages] = useState([]);
  const [micLevel, setMicLevelState] = useState(0);
  const [deviceName, setDeviceName] = useState("");
  const [clock, setClock] = useState("");

  // Live Digital Clock Telemetry
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString("en-GB", { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Native pywebview Bridge Handlers
  useEffect(() => {
    window.setOrbState = (state) => setOrbState(state);
    window.addMessage = (role, text) => {
      setMessages((prev) => [
        ...prev.slice(-15),
        {
          id: crypto.randomUUID(),
          role,
          text,
          time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        },
      ]);
    };
    window.setMicLevel = (level, name) => {
      setMicLevelState(level);
      if (name) setDeviceName(name);
    };
  }, []);

  const handleQuickPreset = (cmdText) => {
    // When clicking a preset, add it to the conversation as a preview prompt
    window.addMessage("you", cmdText);
    setOrbState("listening");
    setTimeout(() => {
      setOrbState("speaking");
      window.addMessage("assistant", `Preset selected: "${cmdText}". Speak the command or say "Hey Jarvis" to execute live.`);
      setTimeout(() => setOrbState("idle"), 2500);
    }, 800);
  };

  return (
    <div className="relative min-h-screen bg-[#07090c] text-slate-100 font-sans flex items-center justify-center p-3 overflow-hidden select-none">
      
      {/* Background Ambient Fluid Glow & Grid Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-950/25 via-[#07090c] to-[#040608] pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Sci-Fi Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Main Holographic JARVIS HUD Container */}
      <div className="relative z-10 w-full max-w-4xl bg-[#0c1015]/90 border border-cyan-500/30 rounded-xl p-5 shadow-[0_0_40px_rgba(0,240,255,0.12)] backdrop-blur-xl">
        
        {/* Holographic HUD Corner Chamfer Accents */}
        <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

        {/* Top Telemetry Status Header */}
        <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3 mb-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse" />
              <span className="text-cyan-400 font-bold tracking-[3px] text-sm">
                SIGNAL // JARVIS MK-85
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-700/40">
              SYS: ONLINE
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="hidden md:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              WHISPER STT
            </span>
            <span className="hidden md:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              OLLAMA READY
            </span>
            <span className="text-cyan-300 font-bold bg-[#070b10] px-2 py-0.5 rounded border border-cyan-900/50">
              {clock || "12:00:00"}
            </span>
          </div>
        </div>

        {/* Primary Interactive Split Grid: Fluid Arc Reactor + Command Stream */}
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 items-center">
          {/* Left: Fluid Arc Reactor & Acoustic Waves */}
          <div className="flex flex-col items-center justify-center bg-[#090d12]/60 rounded-lg p-2 border border-cyan-950/50">
            <FluidArcReactor state={orbState} micLevel={micLevel} />
          </div>

          {/* Right: Holographic Conversation Feed & Presets */}
          <div className="flex flex-col justify-between h-full bg-[#090d12]/40 rounded-lg p-3 border border-cyan-950/40">
            <Conversation messages={messages} />
            <QuickActions onSelect={handleQuickPreset} />
          </div>
        </div>

        {/* Bottom: Precision Microphone Level & Hardware Diagnostic */}
        <MicMeter level={micLevel} deviceName={deviceName} />
      </div>
    </div>
  );
}