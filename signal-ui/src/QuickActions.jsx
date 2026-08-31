import { motion } from "framer-motion";

const QUICK_COMMANDS = [
  { icon: "🎵", text: "Play music on YouTube", tag: "MEDIA" },
  { icon: "💻", text: "Open Visual Studio Code", tag: "APP" },
  { icon: "🔊", text: "Volume to 65%", tag: "SYSTEM" },
  { icon: "🔍", text: "Search AI news on Google", tag: "WEB" },
  { icon: "🪟", text: "Move this window to the left", tag: "WINDOW" },
  { icon: "🔒", text: "Lock the computer", tag: "SECURITY" },
];

export default function QuickActions({ onSelect }) {
  return (
    <div className="mt-3 pt-3 border-t border-cyan-900/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400/70 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-sm animate-pulse" />
          Tactical Command Presets
        </span>
        <span className="text-[9px] font-mono text-slate-500">
          Click preset to preview
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_COMMANDS.map((cmd, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect && onSelect(cmd.text)}
            className="group px-2.5 py-1 rounded-md bg-[#10151c]/80 hover:bg-[#16202c] border border-cyan-900/40 hover:border-cyan-400/60 transition-all duration-150 flex items-center gap-1.5 text-left cursor-pointer shadow-[0_0_8px_rgba(0,0,0,0.5)]"
          >
            <span className="text-xs">{cmd.icon}</span>
            <span className="text-[11px] font-mono text-slate-300 group-hover:text-cyan-200 transition-colors">
              {cmd.text}
            </span>
            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-cyan-950/60 text-cyan-400/80 border border-cyan-800/40">
              {cmd.tag}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

