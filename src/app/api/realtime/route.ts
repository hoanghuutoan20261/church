import { NextRequest, NextResponse } from "next/server";
import { realtimeHub } from "@/lib/realtimeHub";

export const dynamic = "force-dynamic";

/**
 * GET /api/realtime?churchSlug=lbs-sunday&channel=all
 * Server-Sent Events (SSE) streaming endpoint for Sanctuary clients and Projector displays
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const churchSlug = (
    searchParams.get("churchSlug") ||
    searchParams.get("slug") ||
    "loibansusong"
  )
    .toLowerCase()
    .trim();

  const channel = (searchParams.get("channel") || "all").toLowerCase().trim();

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;

  const safeWrite = async (data: string) => {
    if (isClosed) return;
    try {
      await writer.write(encoder.encode(data));
    } catch {
      isClosed = true;
    }
  };

  // Initial connection ready confirmation
  safeWrite(
    `event: ready\ndata: ${JSON.stringify({
      connected: true,
      churchSlug,
      channel,
      timestamp: new Date().toISOString(),
    })}\n\n`
  );

  // Set up listeners based on requested channel
  let unsubscribeChat: (() => void) | null = null;
  let unsubscribeLyrics: (() => void) | null = null;
  let unsubscribeStatus: (() => void) | null = null;

  if (channel === "all" || channel === "chat") {
    unsubscribeChat = realtimeHub.onChat(churchSlug, (message) => {
      safeWrite(`event: chat\ndata: ${JSON.stringify(message)}\n\n`);
    });
  }

  if (channel === "all" || channel === "lyrics") {
    unsubscribeLyrics = realtimeHub.onLyrics(churchSlug, (lyrics) => {
      safeWrite(`event: lyrics\ndata: ${JSON.stringify(lyrics)}\n\n`);
    });
  }

  if (channel === "all" || channel === "status") {
    unsubscribeStatus = realtimeHub.onStatus(churchSlug, (status) => {
      safeWrite(`event: status\ndata: ${JSON.stringify(status)}\n\n`);
    });
  }

  // Heartbeat ping every 15s to keep connection alive through firewall / proxies
  const heartbeatInterval = setInterval(() => {
    if (isClosed) {
      clearInterval(heartbeatInterval);
      return;
    }
    safeWrite(`: heartbeat\n\n`);
  }, 15000);

  // Clean up when client disconnects
  req.signal.addEventListener("abort", () => {
    isClosed = true;
    clearInterval(heartbeatInterval);
    if (unsubscribeChat) unsubscribeChat();
    if (unsubscribeLyrics) unsubscribeLyrics();
    if (unsubscribeStatus) unsubscribeStatus();
    writer.close().catch(() => {});
  });

  return new NextResponse(responseStream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
