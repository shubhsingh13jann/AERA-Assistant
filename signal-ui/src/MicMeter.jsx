export default function MicMeter({ level, deviceName }) {
  return (
    <div className="mt-6 pt-4 border-t border-[#262b2f] flex items-center gap-3 font-mono text-xs text-slate-500">
      <span className="uppercase tracking-wider shrink-0">Mic</span>
      <span className="truncate max-w-[180px]" title={deviceName}>
        {deviceName || "not detected"}
      </span>
      <div className="flex-1 h-2 bg-[#1c2024] rounded overflow-hidden">
        <div
          className="h-full bg-cyan-400 transition-all duration-150"
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="w-8 text-right shrink-0">{level}%</span>
    </div>
  );
}