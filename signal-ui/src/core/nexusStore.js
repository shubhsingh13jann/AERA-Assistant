import { create } from 'zustand';
import { soundService } from './soundService';
import { hardwareService } from './hardwareService';
import { eventBus, EVENTS } from './eventBus';

// Detect intent tag
export function detectIntentTag(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('youtube') || lower.includes('spotify') || lower.includes('play') || lower.includes('music')) {
    return { label: 'MEDIA', color: 'border-red-500/40 text-red-400 bg-red-950/40' };
  }
  if (lower.includes('open') || lower.includes('launch') || lower.includes('start')) {
    return { label: 'APP', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40' };
  }
  if (lower.includes('close') || lower.includes('quit') || lower.includes('exit') || lower.includes('kill')) {
    return { label: 'TERMINATE', color: 'border-rose-500/40 text-rose-400 bg-rose-950/40' };
  }
  if (lower.includes('volume') || lower.includes('mute') || lower.includes('pause') || lower.includes('lock')) {
    return { label: 'SYSTEM', color: 'border-amber-500/40 text-amber-400 bg-amber-950/40' };
  }
  if (lower.includes('search') || lower.includes('google') || lower.includes('who') || lower.includes('what')) {
    return { label: 'QUERY', color: 'border-sky-500/40 text-sky-400 bg-sky-950/40' };
  }
  return { label: 'PROTOCOL', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40' };
}

export const useNexusStore = create((set, get) => {
  const specs = hardwareService.specs;
  const startTime = Date.now();

  // Listen to EventBus hardware updates
  eventBus.subscribe(EVENTS.TELEMETRY_UPDATED, (snapshot) => {
    set((state) => {
      const newCpu = Math.min(98, Math.max(12, +(state.coreStatus.cpu + snapshot.cpuFlux).toFixed(1)));
      return {
        coreStatus: {
          ...state.coreStatus,
          cpu: newCpu,
          memory: snapshot.realMemUsage || state.coreStatus.memory,
          network: snapshot.netFlux,
        },
        resourceOverview: {
          ...state.resourceOverview,
          cpu: Math.round(newCpu),
          memory: snapshot.realMemUsage || state.resourceOverview.memory,
          total: Math.round((newCpu + (snapshot.realMemUsage || 40)) / 2),
        },
        latency: snapshot.latency,
        packetsRate: snapshot.packetsRate,
      };
    });
  });

  return {
    // Real System Clock
    currentTime: '',
    currentDate: '',

    // Real Hardware Specs
    hardware: specs,
    systemStatus: 'ONLINE',
    systemSubStatus: 'Core Matrix Armed & Calibrated',
    micLevel: 0,
    micDevice: 'Default Audio Endpoint',
    orbState: 'idle',

    // Core Metrics
    coreStatus: {
      cpu: 18.4,
      memory: 42.1,
      storage: 64.2,
      network: 12.8,
      neuralNet: 100.0,
      cores: specs.cores,
      memoryGB: specs.memoryGB,
    },
    resourceOverview: {
      total: 38,
      cpu: 24,
      gpu: 31,
      memory: 42,
      storage: 64,
    },
    quantumLink: 'STABLE',
    latency: specs.rtt.replace(' ms', '') || '14',
    packetsRate: '4.8',

    // Real Conversation Messages Stream
    messages: [
      {
        id: 'msg-init-1',
        role: 'assistant',
        text: 'Signal JARVIS Core initialized. All audio devices and intent pipelines armed.',
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        tag: { label: 'SYSTEM', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/40' },
      },
      {
        id: 'msg-init-2',
        role: 'assistant',
        text: 'Ready for vocal trigger "Hey Jarvis" or direct command bar input.',
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        tag: { label: 'READY', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/40' },
      }
    ],

    logViewMode: 'conversation', // 'conversation' | 'kernel'

    // AI Agents
    agents: [
      { id: 'sentinel', name: 'Sentinel', role: 'Threat Detection', status: 'ACTIVE', efficiency: '99.4%', tasks: 142 },
      { id: 'oracle', name: 'Oracle', role: 'Neural Router', status: 'ACTIVE', efficiency: '98.1%', tasks: 840 },
      { id: 'synth', name: 'Synth', role: 'Audio Synthesis', status: 'ACTIVE', efficiency: '94.7%', tasks: 56 },
      { id: 'vertex', name: 'Vertex', role: 'Hardware Monitor', status: 'ACTIVE', efficiency: '100%', tasks: 38 },
      { id: 'ares', name: 'Ares', role: 'Security Shield', status: 'ACTIVE', efficiency: '97.8%', tasks: 318 },
    ],

    // Real-Time System Event Feed
    realTimeFeed: [
      { id: 'rf-1', time: 'LIVE', title: 'Acoustic Pipeline Armed', desc: 'Whisper STT model calibrated', status: 'success' },
      { id: 'rf-2', time: 'SYNC', title: 'Local Intent Router Ready', desc: 'System actions mapped', status: 'success' },
      { id: 'rf-3', time: 'OK', title: 'Database SQLite Connected', desc: 'signal.db session active', status: 'info' },
    ],

    // UI Interactive States
    activeNav: 'DASHBOARD',
    holoMode: false,
    soundEnabled: true,
    selectedAgent: null,
    selectedThreat: null,
    quickAccessOpen: false,
    activeHeaderTab: 'display',

    uptimeSeconds: 0,

    // Actions
    updateClock: () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', options).toUpperCase();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      set({
        currentTime: timeStr,
        currentDate: dateStr,
        uptimeSeconds: elapsed,
      });
    },

    setOrbState: (state) => set({ orbState: state }),

    setMicLevel: (level, device) => set({ micLevel: level, ...(device ? { micDevice: device } : {}) }),

    setLogViewMode: (mode) => {
      soundService.click();
      set({ logViewMode: mode });
    },

    addConversationMessage: (role, text) => {
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      const tag = detectIntentTag(text);
      const newMsg = {
        id: `msg-${Date.now()}-${Math.random()}`,
        role,
        text,
        time,
        tag,
      };

      set((state) => ({
        messages: [...state.messages.slice(-50), newMsg],
        realTimeFeed: [
          {
            id: `rf-${Date.now()}`,
            time,
            title: role === 'you' ? 'User Instruction Received' : 'Assistant Executed Response',
            desc: text.length > 36 ? text.substring(0, 36) + '...' : text,
            status: role === 'you' ? 'info' : 'success',
          },
          ...state.realTimeFeed.slice(0, 5),
        ],
      }));

      eventBus.publish(EVENTS.CONVERSATION_MESSAGE, newMsg);

      if (role === 'assistant') {
        soundService.click();
      } else {
        soundService.scan();
      }
    },

    setActiveNav: (nav) => {
      soundService.click();
      set({ activeNav: nav });
    },

    setActiveHeaderTab: (tab) => {
      soundService.click();
      set({ activeHeaderTab: tab });
    },

    toggleHoloMode: () => {
      soundService.hologramHum();
      set((state) => {
        const next = !state.holoMode;
        eventBus.publish(EVENTS.HOLO_MODE_TOGGLED, next);
        return { holoMode: next };
      });
    },

    toggleSound: () => {
      const next = soundService.toggle();
      set({ soundEnabled: next });
    },

    setSelectedAgent: (agent) => {
      soundService.click();
      set({ selectedAgent: agent });
    },

    toggleAgentStatus: (agentId) => {
      soundService.click();
      set((state) => ({
        agents: state.agents.map((a) =>
          a.id === agentId
            ? { ...a, status: a.status === 'ACTIVE' ? 'IDLE' : 'ACTIVE' }
            : a
        ),
      }));
      eventBus.publish(EVENTS.AGENT_STATUS_TOGGLED, agentId);
    },

    setSelectedThreat: (threat) => {
      soundService.alert();
      set({ selectedThreat: threat });
      eventBus.publish(EVENTS.THREAT_SELECTED, threat);
    },

    toggleQuickAccess: () => {
      soundService.click();
      set((state) => ({ quickAccessOpen: !state.quickAccessOpen }));
    },

    executeCommand: (cmd) => {
      const trimmed = cmd.trim();
      if (!trimmed) return null;

      get().addConversationMessage('you', trimmed);
      eventBus.publish(EVENTS.COMMAND_DISPATCHED, trimmed);

      const lower = trimmed.toLowerCase();

      if (lower === 'help') {
        setTimeout(() => {
          get().addConversationMessage(
            'assistant',
            'Available system directives: "scan", "status", "clear", "boost", "holo", "sound", or any natural request.'
          );
        }, 400);
        return 'Directives catalog retrieved.';
      }

      if (lower === 'clear') {
        set({ messages: [] });
        return 'Conversation & terminal memory purged.';
      }

      if (lower === 'holo') {
        get().toggleHoloMode();
        return 'Holo scanline shader toggled.';
      }

      if (lower === 'sound') {
        get().toggleSound();
        return `Audio FX ${get().soundEnabled ? 'ENABLED' : 'MUTED'}.`;
      }

      if (lower === 'scan') {
        soundService.alert();
        setTimeout(() => {
          get().addConversationMessage('assistant', 'Security scan complete: 0 vulnerabilities found, all system ports secured.');
        }, 600);
        return 'Diagnostic scan dispatched.';
      }

      if (lower === 'boost') {
        set((state) => ({
          coreStatus: { ...state.coreStatus, cpu: 98.4 },
          resourceOverview: { ...state.resourceOverview, total: 88 },
        }));
        setTimeout(() => {
          get().addConversationMessage('assistant', 'Overdrive engaged: Computational pipelines shifted to high-priority allocation.');
        }, 500);
        return 'Overdrive mode engaged.';
      }

      setTimeout(() => {
        get().addConversationMessage(
          'assistant',
          `Directive received: "${trimmed}". Processing instruction through intent pipeline.`
        );
      }, 500);

      return `Dispatched: "${trimmed}"`;
    },

    tickHardware: () => {
      hardwareService.tick();
    },

    updateHostMetrics: (payload) => {
      if (!payload) return;
      set((state) => ({
        coreStatus: {
          ...state.coreStatus,
          cpu: payload.cpuPercent ?? state.coreStatus.cpu,
          memory: payload.memPercent ?? state.coreStatus.memory,
        },
        resourceOverview: {
          ...state.resourceOverview,
          cpu: Math.round(payload.cpuPercent ?? state.resourceOverview.cpu),
          memory: Math.round(payload.memPercent ?? state.resourceOverview.memory),
        },
      }));
    },
  };
});

