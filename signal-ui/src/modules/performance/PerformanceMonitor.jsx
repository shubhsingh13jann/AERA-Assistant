import React, { useState, useEffect, useRef } from 'react';
import { useNexusStore } from '../../core/nexusStore';
import { soundService } from '../../core/soundService';
import {
  Cpu,
  Database,
  HardDrive,
  Wifi,
  Monitor,
  Activity,
  Zap,
  Clock,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export const PerformanceMonitor = () => {
  const { setActiveNav, uptimeSeconds } = useNexusStore();
  const [selectedDevice, setSelectedDevice] = useState('CPU');
  const canvasRef = useRef(null);

  // 60-second historical data points for each device
  const historyRef = useRef({
    CPU: Array.from({ length: 60 }, (_, i) => 22 + Math.sin(i * 0.4) * 8 + (i === 38 ? 48 : 0)),
    Memory: Array.from({ length: 60 }, () => 91),
    Disk: Array.from({ length: 60 }, (_, i) => (i % 8 === 0 ? 40 : 5 + Math.random() * 8)),
    WiFiDirect: Array.from({ length: 60 }, () => 0),
    WiFi: Array.from({ length: 60 }, (_, i) => (i % 12 === 0 ? 15 : 0)),
    GPU0: Array.from({ length: 60 }, (_, i) => (i === 15 || i === 22 ? 35 : 0)),
    GPU1: Array.from({ length: 60 }, (_, i) => 24 + Math.sin(i * 0.3) * 6),
  });

  // Live telemetry state matching the user's host system
  const [telemetry, setTelemetry] = useState({
    cpu: {
      model: '12th Gen Intel(R) Core(TM) i5-1240P',
      utilization: 25,
      speed: '1.56 GHz',
      baseSpeed: '1.70 GHz',
      sockets: 1,
      cores: 12,
      logicalProcessors: 16,
      virtualization: 'Enabled',
      l1Cache: '1.1 MB',
      l2Cache: '9.0 MB',
      l3Cache: '12.0 MB',
      processes: 356,
      threads: 6236,
      handles: 173797,
    },
    memory: {
      inUse: '7.0 GB (91%)',
      total: '7.7 GB',
      available: '0.7 GB',
      committed: '14.2/18.5 GB',
      cached: '1.2 GB',
      pagedPool: '642 MB',
      nonPagedPool: '512 MB',
      speed: '3200 MHz',
      slots: '2 of 2',
      formFactor: 'SODIMM',
      hardwareReserved: '286 MB',
    },
    disk: {
      name: 'Disk 0 (C: D:)',
      type: 'SSD (NVMe)',
      activeTime: 40,
      responseTime: '2.1 ms',
      readSpeed: '120 KB/s',
      writeSpeed: '450 KB/s',
      capacity: '477 GB',
      formatted: '477 GB',
      systemDisk: 'Yes',
      pageFile: 'Yes',
    },
    wifiDirect: {
      name: 'Wi-Fi Direct',
      sub: 'Local Area Connection*...',
      send: '0 Kbps',
      receive: '0 Kbps',
    },
    wifi: {
      name: 'Wi-Fi',
      adapter: 'Intel(R) Wi-Fi 6 AX201 160MHz',
      send: '0 Kbps',
      receive: '0 Kbps',
      connectionType: '802.11ax (Wi-Fi 6)',
      ipv4: '192.168.1.104',
      signal: '5 Bars (Excellent)',
    },
    gpu0: {
      name: 'GPU 0',
      model: 'NVIDIA GeForce RTX...',
      utilization: 0,
      temp: '55 °C',
      dedicatedMemory: '0.8/4.0 GB',
      sharedMemory: '0.2/3.8 GB',
      driverVersion: '537.13',
    },
    gpu1: {
      name: 'GPU 1',
      model: 'Intel(R) UHD Graphics',
      utilization: 24,
      sharedMemory: '1.1/3.8 GB',
      videoDecode: '14%',
    },
  });

  // Listen for native Python host updates if available
  useEffect(() => {
    window.updateHostTelemetry = (payload) => {
      try {
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        setTelemetry((prev) => ({
          ...prev,
          cpu: {
            ...prev.cpu,
            utilization: data.cpuPercent !== undefined ? Math.round(data.cpuPercent) : prev.cpu.utilization,
            speed: data.cpuFreq ? `${(data.cpuFreq / 1000).toFixed(2)} GHz` : prev.cpu.speed,
            processes: data.processes || prev.cpu.processes,
          },
          memory: {
            ...prev.memory,
            inUse: data.memUsed ? `${data.memUsed}/${data.memTotal} GB (${data.memPercent}%)` : prev.memory.inUse,
          },
          disk: {
            ...prev.disk,
            activeTime: data.diskPercent !== undefined ? Math.round(data.diskPercent) : prev.disk.activeTime,
          },
        }));
      } catch (err) {
        console.warn('Telemetry update parse error', err);
      }
    };
  }, []);

  // Tick historical chart
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => {
        const cpuUtil = Math.max(12, Math.min(96, Math.round(prev.cpu.utilization + (Math.random() * 6 - 3))));
        const gpu1Util = Math.max(10, Math.min(60, Math.round(prev.gpu1.utilization + (Math.random() * 4 - 2))));

        // Append to history
        const h = historyRef.current;
        h.CPU.shift();
        h.CPU.push(cpuUtil);

        h.Memory.shift();
        h.Memory.push(91);

        h.Disk.shift();
        h.Disk.push(Math.random() > 0.8 ? 40 : Math.round(Math.random() * 8));

        h.GPU1.shift();
        h.GPU1.push(gpu1Util);

        return {
          ...prev,
          cpu: {
            ...prev.cpu,
            utilization: cpuUtil,
            speed: (1.50 + (cpuUtil / 100) * 0.4).toFixed(2) + ' GHz',
          },
          gpu1: {
            ...prev.gpu1,
            utilization: gpu1Util,
          },
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 60-second Area Chart Canvas Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let lastTime = 0;
    const frameDelay = 1000 / 30;

    const render = (now) => {
      animationId = requestAnimationFrame(render);
      if (now - lastTime < frameDelay) return;
      lastTime = now;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Cyber Grid Lines (10 horizontal & 10 vertical, Task Manager style)
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let i = 1; i <= 5; i++) {
        const y = (h / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let i = 1; i <= 6; i++) {
        const x = (w / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Active series data
      const activeData = historyRef.current[selectedDevice] || historyRef.current.CPU;
      const len = activeData.length;
      if (len === 0) return;

      // Draw Filled Gradient Area
      const areaGrad = ctx.createLinearGradient(0, 0, 0, h);
      areaGrad.addColorStop(0, 'rgba(0, 240, 255, 0.32)');
      areaGrad.addColorStop(0.7, 'rgba(0, 180, 255, 0.08)');
      areaGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(0, h);
      activeData.forEach((val, idx) => {
        const x = (idx / (len - 1)) * w;
        const y = h - (val / 100) * (h - 8);
        ctx.lineTo(x, y);
      });
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = areaGrad;
      ctx.fill();

      // Draw Main Spline / Line
      ctx.beginPath();
      activeData.forEach((val, idx) => {
        const x = (idx / (len - 1)) * w;
        const y = h - (val / 100) * (h - 8);
        if (idx === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Current head pulse dot on the far right
      const lastVal = activeData[len - 1];
      const headY = h - (lastVal / 100) * (h - 8);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(w - 2, headY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [selectedDevice]);

  // Format uptime (e.g. 2:06:13:37)
  const formatUpTime = () => {
    const totalSecs = uptimeSeconds || 195217;
    const days = Math.floor(totalSecs / 86400);
    const hrs = String(Math.floor((totalSecs % 86400) / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    return `${days}:${hrs}:${mins}:${secs}`;
  };

  const devices = [
    {
      id: 'CPU',
      name: 'CPU',
      stat: `${telemetry.cpu.utilization}% ${telemetry.cpu.speed}`,
      icon: Cpu,
      color: '#00f0ff',
    },
    {
      id: 'Memory',
      name: 'Memory',
      stat: `${telemetry.memory.inUse}`,
      icon: Database,
      color: '#38bdf8',
    },
    {
      id: 'Disk',
      name: 'Disk 0 (C: D:)',
      sub: telemetry.disk.type,
      stat: `${telemetry.disk.activeTime}%`,
      icon: HardDrive,
      color: '#10b981',
    },
    {
      id: 'WiFiDirect',
      name: 'Wi-Fi Direct',
      sub: telemetry.wifiDirect.sub,
      stat: `S: 0 R: 0 Kbps`,
      icon: Wifi,
      color: '#a855f7',
    },
    {
      id: 'WiFi',
      name: 'Wi-Fi',
      sub: 'Wi-Fi',
      stat: `S: 0 R: 0 Kbps`,
      icon: Wifi,
      color: '#ec4899',
    },
    {
      id: 'GPU0',
      name: 'GPU 0',
      sub: telemetry.gpu0.model,
      stat: `${telemetry.gpu0.utilization}% (${telemetry.gpu0.temp})`,
      icon: Monitor,
      color: '#f59e0b',
    },
    {
      id: 'GPU1',
      name: 'GPU 1',
      sub: telemetry.gpu1.model,
      stat: `${telemetry.gpu1.utilization}%`,
      icon: Monitor,
      color: '#8b5cf6',
    },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-[#030816] text-slate-100 font-mono p-3 overflow-hidden select-none">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundService.click();
              setActiveNav('DASHBOARD');
            }}
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-500/20 text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO HUD</span>
          </button>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="font-orbitron font-bold text-sm tracking-wider text-cyan-200">
              PERFORMANCE MONITOR // TASK MANAGER
            </span>
          </div>
        </div>

        <div className="text-[10px] text-cyan-400/70">
          HOST ARCHITECTURE // x64 HYBRID
        </div>
      </div>

      {/* Main Split Layout: Left Device List + Right Active Telemetry Panel */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-3 overflow-hidden">
        {/* LEFT DEVICE SELECTOR (Task Manager Style) */}
        <div className="col-span-3 h-full flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1">
          {devices.map((dev) => {
            const isSelected = selectedDevice === dev.id;
            const history = historyRef.current[dev.id] || [];

            return (
              <div
                key={dev.id}
                onClick={() => {
                  soundService.click();
                  setSelectedDevice(dev.id);
                }}
                className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.18)]'
                    : 'bg-[#050e22]/80 border-cyan-500/20 hover:border-cyan-500/50 hover:bg-cyan-950/30 text-slate-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
                )}

                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Mini Sparkline Graph */}
                  <div className="w-12 h-7 rounded border border-cyan-500/30 bg-[#020510] flex items-center justify-center overflow-hidden shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 48 28" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke={isSelected ? '#00f0ff' : '#38bdf8'}
                        strokeWidth="1.4"
                        points={history
                          .slice(-20)
                          .map((v, i) => `${(i / 19) * 48},${28 - (v / 100) * 24}`)
                          .join(' ')}
                      />
                    </svg>
                  </div>

                  <div className="min-w-0 leading-tight">
                    <div className="font-bold text-xs truncate text-slate-100 group-hover:text-cyan-200">
                      {dev.name}
                    </div>
                    {dev.sub && (
                      <div className="text-[8px] text-slate-400 truncate">
                        {dev.sub}
                      </div>
                    )}
                    <div className="text-[9px] text-cyan-300 font-bold truncate mt-0.5">
                      {dev.stat}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT MAIN INSPECTION PANEL */}
        <div className="col-span-9 h-full hud-panel p-3 rounded flex flex-col justify-between overflow-hidden relative">
          <div className="hud-corner hud-corner-tl" />
          <div className="hud-corner hud-corner-tr" />
          <div className="hud-corner hud-corner-bl" />
          <div className="hud-corner hud-corner-br" />

          {/* Device Header */}
          <div className="flex items-start justify-between pb-1.5 border-b border-cyan-500/20 shrink-0">
            <div>
              <div className="font-orbitron font-bold text-xl text-cyan-300 glow-text-cyan leading-none">
                {selectedDevice === 'CPU' && 'CPU'}
                {selectedDevice === 'Memory' && 'Memory'}
                {selectedDevice === 'Disk' && 'Disk 0 (C: D:)'}
                {selectedDevice === 'WiFiDirect' && 'Wi-Fi Direct'}
                {selectedDevice === 'WiFi' && 'Wi-Fi'}
                {selectedDevice === 'GPU0' && 'GPU 0'}
                {selectedDevice === 'GPU1' && 'GPU 1'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                % Utilization
              </div>
            </div>

            <div className="text-right">
              <div className="font-bold text-sm text-slate-200">
                {selectedDevice === 'CPU' && telemetry.cpu.model}
                {selectedDevice === 'Memory' && '7.7 GB DDR4 / LPDDR5'}
                {selectedDevice === 'Disk' && telemetry.disk.type}
                {selectedDevice === 'WiFiDirect' && telemetry.wifiDirect.sub}
                {selectedDevice === 'WiFi' && telemetry.wifi.adapter}
                {selectedDevice === 'GPU0' && telemetry.gpu0.model}
                {selectedDevice === 'GPU1' && telemetry.gpu1.model}
              </div>
              <div className="text-[10px] text-cyan-400 font-bold">
                100%
              </div>
            </div>
          </div>

          {/* Real-time 60s Scrolling Area Chart */}
          <div className="flex-1 my-2 bg-[#020510]/80 rounded border border-cyan-500/25 relative overflow-hidden flex flex-col justify-between p-1">
            <canvas
              ref={canvasRef}
              width={750}
              height={220}
              className="w-full h-full"
            />
            {/* Axis Seconds Legend */}
            <div className="absolute bottom-1 left-2 right-2 flex justify-between text-[8px] font-mono text-cyan-500/60 pointer-events-none">
              <span>60 seconds</span>
              <span>0</span>
            </div>
          </div>

          {/* Detailed Metric Columns (Exact Task Manager Replica) */}
          {selectedDevice === 'CPU' && (
            <div className="grid grid-cols-4 gap-3 pt-2 border-t border-cyan-500/20 text-xs shrink-0">
              {/* Col 1: Hero Metrics */}
              <div className="space-y-2">
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Utilization</div>
                  <div className="text-2xl font-bold font-orbitron text-cyan-300 glow-text-cyan leading-none mt-0.5">
                    {telemetry.cpu.utilization}%
                  </div>
                </div>
                <div>
                  <div className="text-[9px] text-slate-400 uppercase">Speed</div>
                  <div className="text-lg font-bold text-cyan-200 leading-none mt-0.5">
                    {telemetry.cpu.speed}
                  </div>
                </div>
              </div>

              {/* Col 2: Runtime Telemetry */}
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Processes</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.processes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Threads</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.threads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Handles</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.handles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Up time</span>
                  <span className="font-bold text-cyan-300">{formatUpTime()}</span>
                </div>
              </div>

              {/* Col 3: Topology Specs */}
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base speed:</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.baseSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sockets:</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.sockets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cores:</span>
                  <span className="font-bold text-cyan-300">{telemetry.cpu.cores}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Logical processors:</span>
                  <span className="font-bold text-cyan-300">{telemetry.cpu.logicalProcessors}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Virtualization:</span>
                  <span className="font-bold text-emerald-400">{telemetry.cpu.virtualization}</span>
                </div>
              </div>

              {/* Col 4: Cache Topology */}
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">L1 cache:</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.l1Cache}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">L2 cache:</span>
                  <span className="font-bold text-slate-100">{telemetry.cpu.l2Cache}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">L3 cache:</span>
                  <span className="font-bold text-cyan-300">{telemetry.cpu.l3Cache}</span>
                </div>
              </div>
            </div>
          )}

          {selectedDevice === 'Memory' && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cyan-500/20 text-xs shrink-0">
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">In use (Compressed)</span>
                  <span className="font-bold text-cyan-300">{telemetry.memory.inUse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Available</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.available}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Committed</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.committed}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Cached</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.cached}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paged pool</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.pagedPool}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Non-paged pool</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.nonPagedPool}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Speed:</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Slots used:</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.slots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Form factor:</span>
                  <span className="font-bold text-slate-100">{telemetry.memory.formFactor}</span>
                </div>
              </div>
            </div>
          )}

          {selectedDevice === 'Disk' && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cyan-500/20 text-xs shrink-0">
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Active time</span>
                  <span className="font-bold text-emerald-400">{telemetry.disk.activeTime}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg response time</span>
                  <span className="font-bold text-slate-100">{telemetry.disk.responseTime}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Read speed</span>
                  <span className="font-bold text-cyan-300">{telemetry.disk.readSpeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Write speed</span>
                  <span className="font-bold text-cyan-300">{telemetry.disk.writeSpeed}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Capacity:</span>
                  <span className="font-bold text-slate-100">{telemetry.disk.capacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type:</span>
                  <span className="font-bold text-cyan-300">{telemetry.disk.type}</span>
                </div>
              </div>
            </div>
          )}

          {(selectedDevice === 'GPU0' || selectedDevice === 'GPU1') && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cyan-500/20 text-xs shrink-0">
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">3D Utilization</span>
                  <span className="font-bold text-amber-400">
                    {selectedDevice === 'GPU0' ? `${telemetry.gpu0.utilization}%` : `${telemetry.gpu1.utilization}%`}
                  </span>
                </div>
                {selectedDevice === 'GPU0' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPU Temperature</span>
                    <span className="font-bold text-amber-300">{telemetry.gpu0.temp}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dedicated Memory</span>
                  <span className="font-bold text-slate-100">
                    {selectedDevice === 'GPU0' ? telemetry.gpu0.dedicatedMemory : 'N/A (Integrated)'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shared GPU Memory</span>
                  <span className="font-bold text-slate-100">
                    {selectedDevice === 'GPU0' ? telemetry.gpu0.sharedMemory : telemetry.gpu1.sharedMemory}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Driver Version</span>
                  <span className="font-bold text-slate-100">
                    {selectedDevice === 'GPU0' ? telemetry.gpu0.driverVersion : '31.0.101.4575'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {(selectedDevice === 'WiFiDirect' || selectedDevice === 'WiFi') && (
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cyan-500/20 text-xs shrink-0">
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Send Throughput</span>
                  <span className="font-bold text-cyan-300">{telemetry.wifi.send}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Receive Throughput</span>
                  <span className="font-bold text-cyan-300">{telemetry.wifi.receive}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Connection</span>
                  <span className="font-bold text-slate-100">{telemetry.wifi.connectionType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Signal</span>
                  <span className="font-bold text-emerald-400">{telemetry.wifi.signal}</span>
                </div>
              </div>
              <div className="space-y-1.5 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">IPv4</span>
                  <span className="font-bold text-slate-100">{telemetry.wifi.ipv4}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

