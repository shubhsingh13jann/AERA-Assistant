import { motion, AnimatePresence } from "framer-motion";

export default function Conversation({ messages }) {
  return (
    <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-2 font-mono text-sm">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="leading-relaxed"
          >
            <span
              className={
                "uppercase text-[10px] tracking-wider mr-2 " +
                (m.role === "you" ? "text-slate-500" : "text-cyan-400")
              }
            >
              {m.role === "you" ? "You" : "Signal"}
            </span>
            <span className="text-slate-100">{m.text}</span>
            <span className="text-[10px] text-slate-500 ml-2">{m.time}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}