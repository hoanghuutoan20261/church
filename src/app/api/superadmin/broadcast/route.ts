import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { requireSuperadmin } from "@/lib/superadminAuth";
import { realtimeHub } from "@/lib/realtimeHub";

export const dynamic = "force-dynamic";

// POST /api/superadmin/broadcast
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const { churchSlug, action, title, speaker, viewersCount, scriptureReference } = body;

    if (!churchSlug || !action) {
      return NextResponse.json(
        { success: false, error: "Thiếu churchSlug hoặc action ('start' | 'stop' | 'update')" },
        { status: 400 }
      );
    }

    const church = await Church.findOne({ slug: churchSlug.toLowerCase().trim() });
    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh: " + churchSlug },
        { status: 404 }
      );
    }

    if (!church.currentService) {
      church.currentService = {
        title: "Lễ Thờ Phượng Chúa Nhật",
        speaker: church.profileConfig?.leadPastor || "Mục sư Quản Nhiệm",
        speakerTitle: "Mục sư",
        scriptureReference: "Thi Thiên 23:1",
        welcomeMessage: "Chào mừng quý vị cùng tham gia thờ phượng trực tuyến!",
        isLive: false,
        viewersCount: 0,
      };
    }

    if (action === "start") {
      church.currentService.isLive = true;
      if (title) church.currentService.title = title.trim();
      if (speaker) church.currentService.speaker = speaker.trim();
      if (scriptureReference) church.currentService.scriptureReference = scriptureReference.trim();
      if (viewersCount !== undefined) church.currentService.viewersCount = Number(viewersCount);
      else if (church.currentService.viewersCount === 0) church.currentService.viewersCount = 120;
    } else if (action === "stop") {
      church.currentService.isLive = false;
      church.currentService.viewersCount = 0;
    } else if (action === "update") {
      if (title) church.currentService.title = title.trim();
      if (speaker) church.currentService.speaker = speaker.trim();
      if (scriptureReference) church.currentService.scriptureReference = scriptureReference.trim();
      if (viewersCount !== undefined) church.currentService.viewersCount = Number(viewersCount);
    }

    await church.save();

    // Broadcast live status update to all sanctuary viewers in real time
    if (church.currentService) {
      try {
        realtimeHub.emitStatus(church.slug, {
          isLive: Boolean(church.currentService.isLive),
          title: church.currentService.title,
          speaker: church.currentService.speaker,
          viewersCount: church.currentService.viewersCount,
          scriptureReference: church.currentService.scriptureReference,
          welcomeMessage: church.currentService.welcomeMessage,
        });
      } catch (e) {
        console.warn("Lỗi phát sóng trạng thái buổi nhóm trực tiếp từ Superadmin:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Đã ${action === "start" ? "BẮT ĐẦU" : action === "stop" ? "DỪNG" : "CẬP NHẬT"} truyền hình trực tiếp cho ${church.name}`,
      data: {
        slug: church.slug,
        name: church.name,
        currentService: church.currentService,
      },
    });
  } catch (error: any) {
    console.error("POST /api/superadmin/broadcast error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi điều khiển phát sóng: " + error.message },
      { status: 500 }
    );
  }
}
