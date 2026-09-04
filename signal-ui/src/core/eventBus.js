// Decoupled Microservice Event Bus (Pub/Sub pattern for inter-module communication)

class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    this.subscribers.get(event).add(callback);

    // Return un-subscribe function
    return () => {
      const subs = this.subscribers.get(event);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  publish(event, data) {
    const subs = this.subscribers.get(event);
    if (subs) {
      subs.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus] Error handling event "${event}":`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();

// Standard Microservice Event Topics
export const EVENTS = {
  COMMAND_DISPATCHED: 'cli:command_dispatched',
  CONVERSATION_MESSAGE: 'conversation:message_added',
  TELEMETRY_UPDATED: 'telemetry:hardware_tick',
  BIO_SCAN_TRIGGER: 'biometrics:rescan_requested',
  AGENT_STATUS_TOGGLED: 'agents:status_changed',
  THREAT_SELECTED: 'threats:selected',
  HOLO_MODE_TOGGLED: 'hud:holo_toggled',
  SOUND_EFFECT_PLAY: 'audio:play_sfx',
};

