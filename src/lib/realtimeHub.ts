import { EventEmitter } from "events";

export interface RealtimeChatMessage {
  _id: string;
  id: string;
  churchSlug: string;
  sender: string;
  role: "pastor" | "moderator" | "elder" | "member";
  location?: string;
  text: string;
  timestamp: string;
  isAmenOnly: boolean;
  createdAt: Date | string;
}

export interface RealtimeLyricsPayload {
  isEnabled: boolean;
  songId?: string;
  songNumber?: number | null;
  songTitle?: string;
  originalTitle?: string;
  stanzaIndex?: number;
  stanzaLabel?: string;
  lines?: string[];
  displayType?: "hymn" | "scripture";
  referenceTranslation?: string;
  layoutMode?: "lowerthird" | "subtitle" | "fullscreen";
  themeStyle?: "gold" | "white" | "teal" | "amber";
  updatedAt?: Date | string;
}

export interface RealtimeServiceStatus {
  isLive: boolean;
  title?: string;
  speaker?: string;
  viewersCount?: number;
  scriptureReference?: string;
  welcomeMessage?: string;
  streamType?: string;
  streamUrl?: string;
}

export type RealtimeEventCallback = (data: any) => void;

class ChurchRealtimeHub extends EventEmitter {
  private activeViewers: Map<string, Set<string>> = new Map();
  private disconnectTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    super();
    // Allow large numbers of concurrent listeners across sanctuary viewers
    this.setMaxListeners(5000);
  }

  addViewer(churchSlug: string, clientId: string): number {
    const slug = churchSlug.toLowerCase().trim();
    const key = `${slug}:${clientId}`;

    // If there's a pending disconnect for this viewer, cancel it immediately
    if (this.disconnectTimeouts.has(key)) {
      clearTimeout(this.disconnectTimeouts.get(key)!);
      this.disconnectTimeouts.delete(key);
    }

    if (!this.activeViewers.has(slug)) {
      this.activeViewers.set(slug, new Set());
    }
    const set = this.activeViewers.get(slug)!;
    const wasPresent = set.has(clientId);
    set.add(clientId);
    const count = set.size;

    // Only emit when an actual new viewer is added
    if (!wasPresent) {
      this.emitViewers(slug, count);
    }
    return count;
  }

  removeViewer(churchSlug: string, clientId: string, delayMs = 6000): number {
    const slug = churchSlug.toLowerCase().trim();
    const key = `${slug}:${clientId}`;

    if (this.disconnectTimeouts.has(key)) {
      clearTimeout(this.disconnectTimeouts.get(key)!);
    }

    // Debounce disconnect by 6 seconds to prevent flickering on quick tab switch or reconnect
    const timer = setTimeout(() => {
      this.disconnectTimeouts.delete(key);
      if (this.activeViewers.has(slug)) {
        const set = this.activeViewers.get(slug)!;
        if (set.has(clientId)) {
          set.delete(clientId);
          const count = set.size;
          this.emitViewers(slug, count);
        }
      }
    }, delayMs);

    this.disconnectTimeouts.set(key, timer);
    return this.activeViewers.get(slug)?.size || 0;
  }

  getViewersCount(churchSlug: string): number {
    const slug = churchSlug.toLowerCase().trim();
    return this.activeViewers.get(slug)?.size || 0;
  }

  emitViewers(churchSlug: string, count: number) {
    const slug = churchSlug.toLowerCase().trim();
    this.emit(`viewers:${slug}`, count);
    this.emit(`all:${slug}`, { type: "viewers", count });
  }

  onViewers(churchSlug: string, listener: (count: number) => void) {
    const channel = `viewers:${churchSlug.toLowerCase().trim()}`;
    this.on(channel, listener);
    return () => this.off(channel, listener);
  }

  emitChat(churchSlug: string, message: RealtimeChatMessage) {
    const slug = churchSlug.toLowerCase().trim();
    this.emit(`chat:${slug}`, message);
    this.emit(`all:${slug}`, { type: "chat", data: message });
  }

  emitLyrics(churchSlug: string, lyrics: RealtimeLyricsPayload) {
    const slug = churchSlug.toLowerCase().trim();
    this.emit(`lyrics:${slug}`, lyrics);
    this.emit(`all:${slug}`, { type: "lyrics", data: lyrics });
  }

  emitStatus(churchSlug: string, status: RealtimeServiceStatus) {
    const slug = churchSlug.toLowerCase().trim();
    this.emit(`status:${slug}`, status);
    this.emit(`all:${slug}`, { type: "status", data: status });
  }

  onChat(churchSlug: string, listener: (message: RealtimeChatMessage) => void) {
    const channel = `chat:${churchSlug.toLowerCase().trim()}`;
    this.on(channel, listener);
    return () => this.off(channel, listener);
  }

  onLyrics(churchSlug: string, listener: (lyrics: RealtimeLyricsPayload) => void) {
    const channel = `lyrics:${churchSlug.toLowerCase().trim()}`;
    this.on(channel, listener);
    return () => this.off(channel, listener);
  }

  onStatus(churchSlug: string, listener: (status: RealtimeServiceStatus) => void) {
    const channel = `status:${churchSlug.toLowerCase().trim()}`;
    this.on(channel, listener);
    return () => this.off(channel, listener);
  }

  onAll(
    churchSlug: string,
    listener: (event: { type: "chat" | "lyrics" | "status"; data: any }) => void
  ) {
    const channel = `all:${churchSlug.toLowerCase().trim()}`;
    this.on(channel, listener);
    return () => this.off(channel, listener);
  }
}

// Attach singleton to globalThis to persist across Next.js HMR in development
const globalForRealtime = globalThis as unknown as {
  churchRealtimeHub?: ChurchRealtimeHub;
};

export const realtimeHub =
  globalForRealtime.churchRealtimeHub || new ChurchRealtimeHub();

if (process.env.NODE_ENV !== "production") {
  globalForRealtime.churchRealtimeHub = realtimeHub;
}
