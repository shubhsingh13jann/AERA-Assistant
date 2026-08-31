import { useMemo } from "react";

/**
 * Clean device name strings that suffer from double UTF-8 decoding or mojibake
 * (e.g. "Microphone Array (IntelÂ® Smart Sound...)" -> "Microphone Array (Intel® Smart Sound...)")
 */
function sanitizeDeviceName(rawName) {
  if (!rawName) return "Ready (Awaiting Audio Stream)";
  try {
    return rawName
      .replace(/Â®/g, "®")
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€/g, '"')
      .trim();
  } catch {
    return rawName;
  }
}

export default function MicMeter({ level = 0, deviceName = "" }) {
  const cleanName = useMemo(() => sanitizeDeviceName(deviceName), [deviceName]);
  const isDisconnected = cleanName.toLowerCase().includes("disconnected");
  const isArmed = !isDisconnected && (level > 0 || deviceName.length > 0);

  const SEGMENTS = 28;
  const activeSegments = Math.round((level / 100) * SEGMENTS);

  return (
    <div className="mt-4 pt-3 border-t border-cyan-900/30 font-mono text-xs text-slate-400 select-none">
      {/* Top Diagnostics Line */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-cyan-400 uppercase">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isDisconnected
                  ? "bg-rose-500 animate-ping"
                  : isArmed
                  ? "bg-emerald-400 shadow-[0_0_6px_#34d399]"
                  : "bg-cyan-500"
              }`}
            />
            Mic Stream
          </span>
          <span className="text-[11px] text-slate-300 max-w-[280px] truncate" title={cleanName}>
            {cleanName}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-slate-500">
          <span className="bg-[#0b1016] px-1.5 py-0.5 rounded border border-cyan-900/30 text-cyan-400/80">
            16 kHz PCM
          </span>
          <span className="font-bold text-cyan-300 w-10 text-right">
            {level}%
          </span>
        </div>
      </div>

      {/* Multi-Segment LED Equalizer Bar */}
      <div className="flex items-center gap-1 h-3 p-0.5 bg-[#0a0e13] rounded border border-cyan-900/40 shadow-inner">
        {Array.from({ length: SEGMENTS }).map((_, idx) => {
          const isActive = idx < activeSegments;
          // Gradient from Cyan -> Luminous Emerald -> Alert Orange at peak
          let segmentColor = "bg-cyan-500 shadow-[0_0_5px_#00f0ff]";
          if (idx > SEGMENTS * 0.8) {
            segmentColor = "bg-amber-400 shadow-[0_0_5px_#f59e0b]";
          } else if (idx > SEGMENTS * 0.5) {
            segmentColor = "bg-teal-400 shadow-[0_0_5px_#2dd4bf]";
          }

          return (
            <div
              key={idx}
              className={`flex-1 h-full rounded-[1px] transition-all duration-75 ${
                isActive ? segmentColor : "bg-slate-900/80"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}