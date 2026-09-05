import React from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  Wind,
  ExternalLink,
  Play,
  Radio,
  Newspaper,
  Calendar,
} from 'lucide-react';

function getWeatherIcon(iconType) {
  switch (iconType) {
    case 'sun':
      return <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" />;
    case 'cloud-rain':
    case 'cloud-drizzle':
      return <CloudRain className="w-6 h-6 text-sky-400 animate-bounce-subtle" />;
    case 'cloud-lightning':
      return <CloudLightning className="w-6 h-6 text-yellow-300 animate-pulse" />;
    case 'snowflake':
      return <Snowflake className="w-6 h-6 text-cyan-200" />;
    case 'cloud':
    case 'cloud-sun':
    case 'cloud-fog':
    default:
      return <Cloud className="w-6 h-6 text-slate-300" />;
  }
}

export const WeatherCard = ({ data }) => {
  if (!data) return null;
  const { city, country, temp, condition, icon, wind, high, low, forecast = [] } = data;

  return (
    <div className="mt-2.5 p-3.5 rounded-xl bg-gradient-to-br from-[#0a1832]/95 via-[#081224]/90 to-[#050b18]/95 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)] select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
            {getWeatherIcon(icon)}
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">
              {city} {country ? `• ${country}` : ''}
            </div>
            <div className="text-[10px] text-amber-300/80 font-mono uppercase tracking-wider">
              {condition}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black font-mono text-amber-300 tracking-tight">
            {temp}°<span className="text-sm font-normal text-amber-400/70">C</span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            H: {high}° / L: {low}°
          </div>
        </div>
      </div>

      {/* Atmospheric Telemetry */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-[#050d1d]/80 px-2.5 py-1.5 rounded-lg border border-cyan-500/15 mb-2.5">
        <div className="flex items-center gap-1.5">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span>Wind: {wind} km/h</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Telemetry</span>
        </div>
      </div>

      {/* 3-Day Forecast Strip */}
      {forecast && forecast.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {forecast.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-1.5 rounded-lg bg-[#08152c]/70 border border-cyan-500/20 text-center"
            >
              <span className="text-[10px] font-mono text-slate-400 font-semibold mb-1">
                {item.day}
              </span>
              <div className="scale-75 my-0.5">
                {getWeatherIcon(item.icon)}
              </div>
              <span className="text-[11px] font-mono text-amber-200 font-bold">
                {item.high}°
              </span>
              <span className="text-[9px] font-mono text-slate-500">
                {item.low}°
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NewsHeroCard = ({ data }) => {
  if (!data) return null;
  const { title, summary, source, url, image, category = 'TECH', time } = data;

  return (
    <div className="mt-2.5 rounded-xl bg-gradient-to-b from-[#09152a]/95 to-[#050b18]/95 border border-sky-500/30 overflow-hidden shadow-[0_0_20px_rgba(14,165,233,0.15)] group select-none">
      {/* Hero Image */}
      {image && (
        <div className="relative w-full h-36 overflow-hidden bg-slate-900 border-b border-sky-500/20">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b18] via-transparent to-black/30" />

          {/* Publisher Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#040814]/85 border border-sky-400/40 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-sky-200 uppercase tracking-wider">
              {source}
            </span>
          </div>

          <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-sky-950/80 border border-sky-500/40 text-[9px] font-mono text-sky-300">
            {category}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-sky-200 transition-colors leading-snug">
          {title}
        </h3>

        {summary && (
          <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-3">
            {summary}
          </p>
        )}

        {/* Footer Link */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-500/15">
          <span className="text-[9px] font-mono text-slate-500">
            {time || 'Verified Feed'}
          </span>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-900/50 px-2 py-1 rounded border border-sky-500/30 transition-colors cursor-pointer"
          >
            <span>Read Article</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export const MediaCard = ({ data }) => {
  if (!data) return null;
  const { title, platform = 'YouTube', url, thumbnail } = data;

  return (
    <div className="mt-2.5 rounded-xl bg-gradient-to-r from-[#1c080b]/90 via-[#0d162b]/90 to-[#070e1c]/90 border border-red-500/40 p-3 shadow-[0_0_20px_rgba(239,68,68,0.18)] select-none">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-red-500/20">
        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          Now Playing • {platform}
        </div>
        <span className="text-[9px] font-mono text-slate-400">Autoplay Active</span>
      </div>

      <div className="flex gap-3 items-center">
        {thumbnail && (
          <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border border-red-500/30 shadow-md group">
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_10px_#ef4444]">
                <Play className="w-3 h-3 ml-0.5 fill-white" />
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate mb-1" title={title}>
            {title}
          </div>
          <div className="text-[10px] text-slate-400 line-clamp-1 mb-2">
            Launched in standalone app mode
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] font-mono text-red-300 hover:text-white bg-red-950/60 hover:bg-red-900/70 px-2 py-0.5 rounded border border-red-500/40 transition-colors cursor-pointer"
          >
            <span>Open in Browser</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
