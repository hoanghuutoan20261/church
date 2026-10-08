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
  constructor() {
    super();
    // Allow large numbers of concurrent listeners across sanctuary viewers
    this.setMaxListeners(5000);
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
