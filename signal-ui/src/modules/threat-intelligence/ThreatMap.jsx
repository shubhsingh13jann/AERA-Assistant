import React, { useState } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundFx } from '../../core/soundService';

export const ThreatMap = () => {
  const { setSelectedThreat } = useNexusStore();
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Realistic Geographic Threat Pins (relative coordinates on equirectangular map)
  const hotspots = [
    { id: 'tokyo', name: 'Tokyo Sector 3', x: 82, y: 34, risk: 'HIGH', count: 2 },
    { id: 'delhi', name: 'New Delhi Node', x: 67, y: 40, risk: 'MED', count: 1 },
    { id: 'frankfurt', name: 'Frankfurt Central', x: 50, y: 26, risk: 'HIGH', count: 1 },
    { id: 'newyork', name: 'New York Gateway', x: 26, y: 32, risk: 'HIGH', count: 3 },
    { id: 'sydney', name: 'Sydney Pacific Hub', x: 88, y: 76, risk: 'LOW', count: 4 },
  ];

  return (
    <div
      className="hud-panel p-2.5 rounded relative flex flex-col justify-between h-full"
      onMouseEnter={() => soundFx.hover()}
    >
      <div className="hud-corner hud-corner-tl" />
      <div className="hud-corner hud-corner-tr" />
      <div className="hud-corner hud-corner-bl" />
      <div className="hud-corner hud-corner-br" />

      {/* Header */}
      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-300 pb-1 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5 font-bold">
          <span className="text-cyan-400 font-bold">//</span>
          <span className="text-slate-200">THREAT MAP</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-400/80">
          <span>GLOBAL OVERVIEW</span>
          <span className="text-slate-500">··· &gt;</span>
        </div>
      </div>

      {/* Realistic World Map Vector Graphic */}
      <div className="relative w-full flex-1 my-1 bg-[#040c1e]/60 rounded border border-cyan-500/20 overflow-hidden flex items-center justify-center min-h-[90px]">
        {/* Equirectangular World Continents Path */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full text-cyan-900/60 fill-current opacity-85"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Cybernetic Latitude & Longitude Graticule */}
          <g stroke="rgba(0, 240, 255, 0.12)" strokeWidth="1" fill="none">
            <line x1="0" y1="125" x2="1000" y2="125" strokeDasharray="4 6" />
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="375" x2="1000" y2="375" strokeDasharray="4 6" />
            <line x1="250" y1="0" x2="250" y2="500" strokeDasharray="4 6" />
            <line x1="500" y1="0" x2="500" y2="500" />
            <line x1="750" y1="0" x2="750" y2="500" strokeDasharray="4 6" />
          </g>

          {/* North America */}
          <path d="M 120,40 L 170,30 L 210,45 L 240,35 L 270,55 L 250,90 L 290,110 L 260,140 L 230,120 L 200,160 L 215,190 L 240,195 L 250,225 L 210,240 L 190,210 L 160,190 L 130,140 L 100,100 L 95,65 Z" />
          {/* Greenland */}
          <path d="M 330,20 L 390,25 L 380,75 L 340,80 Z" />
          {/* South America */}
          <path d="M 270,250 L 320,265 L 360,290 L 350,350 L 320,420 L 290,460 L 275,410 L 285,340 L 260,300 Z" />
          {/* Europe */}
          <path d="M 470,75 L 530,65 L 560,95 L 540,135 L 500,150 L 460,140 L 450,110 L 475,90 Z" />
          {/* UK & Ireland */}
          <path d="M 450,85 L 465,85 L 460,110 L 445,105 Z" />
          {/* Africa */}
          <path d="M 465,165 L 550,170 L 585,225 L 560,300 L 530,370 L 495,380 L 475,310 L 440,240 L 445,190 Z" />
          {/* Madagascar */}
          <path d="M 590,320 L 605,330 L 595,370 L 585,360 Z" />
          {/* Asia & Siberia */}
          <path d="M 560,65 L 680,45 L 820,55 L 890,95 L 860,150 L 800,170 L 760,210 L 710,190 L 680,240 L 630,260 L 610,210 L 580,180 L 570,120 Z" />
          {/* India Subcontinent */}
          <path d="M 640,200 L 690,215 L 670,285 L 640,260 Z" />
          {/* Japan */}
          <path d="M 865,140 L 885,160 L 870,200 L 855,180 Z" />
          {/* Southeast Asia & Indonesia */}
          <path d="M 720,240 L 780,255 L 770,300 L 735,285 Z" />
          <path d="M 750,310 L 820,320 L 810,340 L 760,335 Z" />
          {/* Australia */}
          <path d="M 800,340 L 880,335 L 910,380 L 890,440 L 830,440 L 795,395 Z" />
          {/* New Zealand */}
          <path d="M 940,420 L 955,430 L 945,465 L 930,455 Z" />
        </svg>

        {/* Pulsing Anomaly Beacons at Real Coordinates */}
        {hotspots.map((spot) => {
          const isHigh = spot.risk === 'HIGH';
          return (
            <div
              key={spot.id}
              onClick={() => {
                soundFx.alert();
                setSelectedThreat({
                  id: spot.id,
                  title: `${spot.name} Threat Vector`,
                  location: spot.name,
                  severity: spot.risk,
                  timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
                });
              }}
              onMouseEnter={() => setHoveredPoint(spot)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
            >
              <div
                className={`w-3 h-3 rounded-full animate-ping opacity-80 ${
                  isHigh ? 'bg-red-500' : 'bg-amber-400'
                }`}
              />
              <div
                className={`absolute inset-0 m-auto w-1.5 h-1.5 rounded-full ${
                  isHigh ? 'bg-red-400 shadow-[0_0_8px_#ef4444]' : 'bg-amber-400'
                }`}
              />
            </div>
          );
        })}

        {/* Tooltip */}
        {hoveredPoint && (
          <div
            style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y - 14}%` }}
            className="absolute -translate-x-1/2 -translate-y-full z-30 bg-[#061026] border border-cyan-400 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-200 pointer-events-none shadow-xl whitespace-nowrap"
          >
            <div className="font-bold text-slate-100">{hoveredPoint.name}</div>
            <div className="text-red-400 font-bold">{hoveredPoint.risk} RISK • {hoveredPoint.count} VECTORS</div>
          </div>
        )}
      </div>

      {/* Risk Metrics Breakdown */}
      <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-cyan-500/15">
        <div>
          <span className="text-slate-400 mr-1">HIGH RISK</span>
          <span className="font-bold text-red-400 glow-text-red">3</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">MEDIUM</span>
          <span className="font-bold text-amber-400">7</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">LOW RISK</span>
          <span className="font-bold text-cyan-300">21</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatMap;

