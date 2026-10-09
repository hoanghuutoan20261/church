import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Server-side stream probe endpoint.
 * Directly probes MediaMTX on the local machine (http://127.0.0.1:8888)
 * without browser Mixed-Content or CORS restrictions.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const streamKey = searchParams.get("key") || "";
    const slug = searchParams.get("slug") || "";

    const keys = [
      streamKey,
      slug,
      "tinlanhlamson-live",
      "tinlanhlamson",
      "emmanuel-live",
      "emmanuel",
    ].filter(Boolean);

    // Get the protocol and host of the incoming request
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host") || "hoithanhvn.com";
    const origin = `${proto}://${host}`;

    // Candidate paths to check against MediaMTX locally
    const internalCandidates: { internalUrl: string; publicPath: string }[] = [];

    for (const k of keys) {
      // 1. MediaMTX path: live/{key}/index.m3u8
      // If Nginx has proxy_pass http://127.0.0.1:8888 (no trailing slash) -> public is /live/{key}/index.m3u8
      // If Nginx has proxy_pass http://127.0.0.1:8888/ (with trailing slash) -> public is /live/live/{key}/index.m3u8
      internalCandidates.push({
        internalUrl: `http://127.0.0.1:8888/live/${k}/index.m3u8`,
        publicPath: `/live/live/${k}/index.m3u8`,
      });
      internalCandidates.push({
        internalUrl: `http://127.0.0.1:8888/live/${k}/index.m3u8`,
        publicPath: `/live/${k}/index.m3u8`,
      });

      // 2. MediaMTX path: {key}/index.m3u8 (if streamed without /live in OBS)
      internalCandidates.push({
        internalUrl: `http://127.0.0.1:8888/${k}/index.m3u8`,
        publicPath: `/live/${k}/index.m3u8`,
      });
    }

    for (const item of internalCandidates) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(item.internalUrl, {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const text = await res.text();
          if (text.includes("#EXTM3U")) {
            // Also test if publicPath is reachable via Nginx
            let bestPublicUrl = `${origin}${item.publicPath}`;
            try {
              const testPublic = await fetch(bestPublicUrl, {
                cache: "no-store",
                signal: AbortSignal.timeout(1500),
              });
              if (testPublic.ok) {
                const pubText = await testPublic.text();
                if (pubText.includes("#EXTM3U")) {
                  return NextResponse.json({
                    success: true,
                    isLive: true,
                    streamUrl: bestPublicUrl,
                    publicPath: item.publicPath,
                    key: streamKey,
                  });
                }
              }
            } catch {}

            // Fallback to the candidate public url
            return NextResponse.json({
              success: true,
              isLive: true,
              streamUrl: bestPublicUrl,
              publicPath: item.publicPath,
              key: streamKey,
            });
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      isLive: false,
      message: "Chưa phát hiện luồng phát OBS đang hoạt động trên máy chủ.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi kiểm tra luồng" },
      { status: 500 }
    );
  }
}
