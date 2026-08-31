import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function detectIntentTag(text) {
  const lower = text.toLowerCase();
  if (lower.includes("youtube") || lower.includes("spotify") || lower.includes("play")) {
    return { label: "MEDIA", color: "bg-red-950/60 text-red-400 border-red-800/40" };
  }
  if (lower.includes("open") || lower.includes("launch")) {
    return { label: "APP", color: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" };
  }
  if (lower.includes("close") || lower.includes("quit") || lower.includes("exit")) {
    return { label: "TERMINATE", color: "bg-rose-950/60 text-rose-400 border-rose-800/40" };
  }
  if (lower.includes("volume") || lower.includes("mute") || lower.includes("pause") || lower.includes("track")) {
    return { label: "SYSTEM", color: "bg-amber-950/60 text-amber-400 border-amber-800/40" };
  }
  if (lower.includes("search") || lower.includes("google") || lower.includes("amazon")) {
    return { label: "SEARCH", color: "bg-sky-950/60 text-sky-400 border-sky-800/40" };
  }
  if (lower.includes("snap") || lower.includes("left") || lower.includes("right") || lower.includes("window")) {
    return { label: "WINDOW", color: "bg-indigo-950/60 text-indigo-400 border-indigo-800/40" };
  }
  if (lower.includes("lock")) {
    return { label: "SECURITY", color: "bg-purple-950/60 text-purple-400 border-purple-800/40" };
  }
  return { label: "GENERAL", color: "bg-cyan-950/60 text-cyan-400 border-cyan-800/40" };
}

export default function Conversation({ messages = [] }) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-900/30">
        <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" />
          Command Stream & Execution Log
        </span>
        <span className="text-[9px] font-mono text-slate-500">
          {messages.length} {messages.length === 1 ? "event" : "events"} recorded
        </span>
      </div>

      {/* Messages Scroll Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1.5 space-y-2.5 max-h-[220px] custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-cyan-900/30 rounded-lg bg-[#0c1015]/40 backdrop-blur-sm">
            <div className="w-8 h-8 rounded-full bg-cyan-950/50 border border-cyan-800/50 flex items-center justify-center mb-2 shadow-[0_0_12px_rgba(0,240,255,0.15)]">
              <span className="text-cyan-400 text-sm">⚡</span>
            </div>
            <p className="text-xs font-mono text-cyan-300 font-semibold mb-1">
              JARVIS Audio Matrix Armed
            </p>
            <p className="text-[11px] font-mono text-slate-400 max-w-xs">
              Say <span className="text-cyan-300 font-bold">"Hey Jarvis"</span> followed by any command to begin.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isUser = m.role === "you" || m.role === "user";
              const tag = detectIntentTag(m.text);

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-2.5 rounded-lg border backdrop-blur-md transition-all ${
                    isUser
                      ? "bg-[#111620]/90 border-cyan-900/40 hover:border-cyan-700/60 shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
                      : "bg-[#0d1c24]/90 border-cyan-500/40 hover:border-cyan-400/80 shadow-[0_0_12px_rgba(0,240,255,0.12)]"
                  }`}
                >
                  {/* Card Telemetry Meta Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border ${
                          isUser
                            ? "bg-slate-900/80 text-slate-300 border-slate-700/60"
                            : "bg-cyan-950/80 text-cyan-300 border-cyan-600/50 shadow-[0_0_6px_rgba(0,240,255,0.2)]"
                        }`}
                      >
                        {isUser ? "USER // VOICE" : "JARVIS // RESPONSE"}
                      </span>

                      {!isUser && (
                        <span
                          className={`text-[8px] font-mono font-semibold px-1 py-0.5 rounded border ${tag.color}`}
                        >
                          {tag.label}
                        </span>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-slate-500">
                      {m.time}
                    </span>
                  </div>

                  {/* Message Body */}
                  <p
                    className={`text-xs font-mono leading-relaxed ${
                      isUser ? "text-slate-200" : "text-cyan-100 font-medium"
                    }`}
                  >
                    {m.text}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}