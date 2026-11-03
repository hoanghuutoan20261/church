import { NextRequest, NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/superadminAuth";
import { connectDB } from "@/lib/mongoose";
import { DailyVerse } from "@/models/DailyVerse";
import {
  getAutoDailyVerse,
  formatDateToISO,
  DEFAULT_SCRIPTURE_VERSES,
} from "@/lib/defaultDailyVerses";

// GET /api/superadmin/daily-verse
// Inspect current verse state + preset suggestions
export async function GET(req: NextRequest) {
  const { user, errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const todayStr = formatDateToISO(new Date());
    const autoVerse = getAutoDailyVerse(new Date());

    // Find custom or pinned record
    const pinnedVerse = await DailyVerse.findOne({ isPinned: true }).lean();
    const todayVerse = await DailyVerse.findOne({ date: todayStr }).lean();

    const activeCustom = pinnedVerse || (todayVerse?.isCustom ? todayVerse : null);

    return NextResponse.json({
      success: true,
      data: {
        todayDate: todayStr,
        current: activeCustom
          ? {
              verse: activeCustom.verse,
              reference: activeCustom.reference,
              topic: activeCustom.topic || "Lời Chúa Hôm Nay",
              imageUrl: activeCustom.imageUrl || "",
              isCustom: true,
              isPinned: Boolean(activeCustom.isPinned),
              updatedBy: activeCustom.updatedBy,
              updatedAt: activeCustom.updatedAt,
            }
          : {
              verse: autoVerse.verse,
              reference: autoVerse.reference,
              topic: autoVerse.topic,
              imageUrl: autoVerse.imageUrl || "",
              isCustom: false,
              isPinned: false,
              updatedBy: "Hệ thống tự động luân phiên",
            },
        presets: DEFAULT_SCRIPTURE_VERSES,
      },
    });
  } catch (error: any) {
    console.error("GET /api/superadmin/daily-verse error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi máy chủ" },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/daily-verse
// Actions: "set" (override manually), "reset" (revert to auto), "random" (pick a random preset)
export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { action = "set", verse, reference, topic, imageUrl, isPinned = false } = body;

    await connectDB();
    const todayStr = formatDateToISO(new Date());

    if (action === "reset") {
      // Revert to auto mode by removing overrides
      await DailyVerse.deleteMany({
        $or: [{ date: todayStr }, { isPinned: true }],
      });

      const autoVerse = getAutoDailyVerse(new Date());
      return NextResponse.json({
        success: true,
        message: "Đã đặt lại về chế độ TỰ ĐỘNG luân phiên mỗi ngày thành công!",
        data: {
          ...autoVerse,
          isCustom: false,
          isPinned: false,
        },
      });
    }

    if (action === "random") {
      // Pick random preset and save
      const randomIndex = Math.floor(Math.random() * DEFAULT_SCRIPTURE_VERSES.length);
      const chosen = DEFAULT_SCRIPTURE_VERSES[randomIndex];

      const updated = await DailyVerse.findOneAndUpdate(
        { date: todayStr },
        {
          date: todayStr,
          verse: chosen.verse,
          reference: chosen.reference,
          topic: chosen.topic,
          imageUrl: chosen.imageUrl || "",
          isCustom: true,
          isPinned: false,
          updatedBy: user?.fullName || user?.email || "Superadmin",
        },
        { upsert: true, new: true }
      );

      return NextResponse.json({
        success: true,
        message: `Đã chọn ngẫu nhiên câu gốc: ${chosen.reference}`,
        data: updated,
      });
    }

    // Default action: "set" (manual override)
    if (!verse?.trim() || !reference?.trim()) {
      return NextResponse.json(
        { success: false, message: "Vui lòng nhập đầy đủ câu Kinh Thánh và Địa hạt (Sách, Đoạn, Câu)" },
        { status: 400 }
      );
    }

    // If setting as pinned, unpin others
    if (isPinned) {
      await DailyVerse.updateMany({}, { isPinned: false });
    }

    const saved = await DailyVerse.findOneAndUpdate(
      { date: todayStr },
      {
        date: todayStr,
        verse: verse.trim(),
        reference: reference.trim(),
        topic: topic?.trim() || "Lời Chúa Hôm Nay",
        imageUrl: imageUrl?.trim() || "",
        isCustom: true,
        isPinned: Boolean(isPinned),
        updatedBy: user?.fullName || user?.email || "Superadmin",
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật Câu Gốc Hôm Nay thành công!",
      data: saved,
    });
  } catch (error: any) {
    console.error("POST /api/superadmin/daily-verse error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi cập nhật câu gốc" },
      { status: 500 }
    );
  }
}
