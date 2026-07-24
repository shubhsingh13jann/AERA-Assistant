import { useState, useEffect } from "react";
import Orb from "./Orb";
import Conversation from "./Conversation";

export default function App() {
  const [orbState, setOrbState] = useState("idle");
  const [messages, setMessages] = useState([]);

  // Python (via pywebview) calls window.setOrbState / window.addMessage
  // directly - that's the bridge, no fetch/websocket needed.
  useEffect(() => {
    window.setOrbState = (state) => setOrbState(state);
    window.addMessage = (role, text) => {
      setMessages((prev) => [
        ...prev.slice(-7),
        {
          id: crypto.randomUUID(),
          role,
          text,
          time: new Date().toLocaleTimeString("en-GB", { hour12: false }),
        },
      ]);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0d0f] text-slate-100 font-mono flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-[#14171a] border border-[#262b2f] rounded-md p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#262b2f] pb-4 mb-6">
          <span className="text-cyan-400 tracking-[3px] font-semibold">SIGNAL</span>
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            voice command console
          </span>
        </div>
        <div className="grid grid-cols-[210px_1fr] gap-8">
          <Orb state={orbState} />
          <Conversation messages={messages} />
        </div>
      </div>
    </div>
  );
}