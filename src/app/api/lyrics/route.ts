import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { getAuthUser } from "@/lib/auth";
import { realtimeHub } from "@/lib/realtimeHub";

export const dynamic = "force-dynamic";

/**
 * GET /api/lyrics?slug=emmanuel
 * Fetch real-time live lyrics for sanctuary viewers
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã định danh slug Hội Thánh" },
        { status: 400 }
      );
    }

    await connectDB();
    const church = await Church.findOne(
      { slug: slug.toLowerCase().trim(), isActive: true },
      "liveLyrics name slug currentService"
    ).lean();

    if (!church) {
      return NextResponse.json(
        { success: false, error: "Hội Thánh không tồn tại" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        liveLyrics: church.liveLyrics || {
          isEnabled: false,
          songId: "",
          songTitle: "",
          stanzaIndex: 0,
          stanzaLabel: "",
          lines: [],
          displayType: "hymn",
          referenceTranslation: "BTT 1925",
          layoutMode: "lowerthird",
          themeStyle: "gold",
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("Lỗi lấy dữ liệu lời bài hát trực tiếp:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lyrics
 * Admin updates live lyrics projection
 */
export async function POST(req: NextRequest) {
  try {
    const authSession = await getAuthUser();
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu quyền quản trị Hội Thánh" },
        { status: 401 }
      );
    }

    await connectDB();
    const church = await Church.findById(authSession.churchId);
    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh tương ứng" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const {
      isEnabled,
      songId,
      songNumber,
      songTitle,
      originalTitle,
      stanzaIndex,
      stanzaLabel,
      lines,
      displayType,
      referenceTranslation,
      layoutMode,
      themeStyle,
    } = body;

    church.liveLyrics = {
      isEnabled: Boolean(isEnabled),
      songId: songId || "",
      songNumber: typeof songNumber === "number" ? songNumber : null,
      songTitle: songTitle || "",
      originalTitle: originalTitle || "",
      stanzaIndex: typeof stanzaIndex === "number" ? stanzaIndex : 0,
      stanzaLabel: stanzaLabel || "",
      lines: Array.isArray(lines) ? lines : [],
      displayType: displayType === "scripture" ? "scripture" : "hymn",
      referenceTranslation: referenceTranslation || "BTT 1925",
      layoutMode: layoutMode || "lowerthird",
      themeStyle: themeStyle || "gold",
      updatedAt: new Date(),
    };

    await church.save();

    // Broadcast live lyrics projection update via SSE to all projectors and sanctuary viewers instantly
    try {
      realtimeHub.emitLyrics(church.slug, church.liveLyrics);
    } catch (e) {
      console.warn("Lỗi phát sóng lời bài hát thời gian thực:", e);
    }

    return NextResponse.json({
      success: true,
      message: isEnabled ? "Đang chiếu lời trực tiếp!" : "Đã tắt trình chiếu lời",
      liveLyrics: church.liveLyrics,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật chiếu lời:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật" },
      { status: 500 }
    );
  }
}
