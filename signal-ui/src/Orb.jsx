import { motion } from "framer-motion";

const ringVariants = {
  idle: { scale: 1, opacity: 0 },
  active: (i) => ({
    scale: [1, 2.3],
    opacity: [0.6, 0],
    transition: { duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" },
  }),
};

const coreVariants = {
  idle: { scale: 1 },
  listening: { scale: 1.05, transition: { duration: 0.4 } },
  speaking: {
    scale: [1, 1.08, 1],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
};

const glowByState = {
  idle: "0 0 26px 6px rgba(47,217,242,0.25), 0 0 60px 18px rgba(47,217,242,0.1)",
  listening: "0 0 34px 9px rgba(47,217,242,0.55), 0 0 80px 26px rgba(47,217,242,0.3)",
  speaking: "0 0 42px 12px rgba(47,217,242,0.75), 0 0 100px 32px rgba(47,217,242,0.4)",
};

export default function Orb({ state = "idle" }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={ringVariants}
            animate={state === "idle" ? "idle" : "active"}
            className="absolute w-24 h-24 rounded-full border border-cyan-400"
          />
        ))}
        <motion.div
          variants={coreVariants}
          animate={state}
          style={{
            boxShadow: glowByState[state],
            background:
              "radial-gradient(circle at 35% 30%, #d3f9ff, #2fd9f2 45%, #0d4a56 100%)",
          }}
          className="w-24 h-24 rounded-full"
        />
      </div>
      <div className="mt-3 text-xs tracking-widest uppercase text-slate-400 font-mono">
        {state}
      </div>
    </div>
  );
}