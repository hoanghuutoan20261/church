import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { DailyVerse } from "@/models/DailyVerse";
import { getAutoDailyVerse, formatDateToISO } from "@/lib/defaultDailyVerses";

// GET /api/daily-verse
// Returns today's verse: either Superadmin manual override OR automatic rotation
export async function GET(req: NextRequest) {
  try {
    const today = new Date();
    const todayStr = formatDateToISO(today);

    // Default fallback verse calculated automatically
    const autoVerse = getAutoDailyVerse(today);

    try {
      await connectDB();

      // 1. Check if superadmin pinned a global verse
      const pinnedVerse = await DailyVerse.findOne({ isPinned: true }).lean();
      if (pinnedVerse && pinnedVerse.verse?.trim()) {
        return NextResponse.json({
          success: true,
          data: {
            date: todayStr,
            verse: pinnedVerse.verse,
            reference: pinnedVerse.reference,
            topic: pinnedVerse.topic || "Lời Chúa Hôm Nay",
            imageUrl: pinnedVerse.imageUrl || autoVerse.imageUrl,
            isCustom: true,
            isPinned: true,
            updatedBy: pinnedVerse.updatedBy,
          },
        });
      }

      // 2. Check if superadmin manually set/overrode a verse specifically for today
      const todayCustomVerse = await DailyVerse.findOne({ date: todayStr, isCustom: true }).lean();
      if (todayCustomVerse && todayCustomVerse.verse?.trim()) {
        return NextResponse.json({
          success: true,
          data: {
            date: todayStr,
            verse: todayCustomVerse.verse,
            reference: todayCustomVerse.reference,
            topic: todayCustomVerse.topic || "Lời Chúa Hôm Nay",
            imageUrl: todayCustomVerse.imageUrl || autoVerse.imageUrl,
            isCustom: true,
            isPinned: false,
            updatedBy: todayCustomVerse.updatedBy,
          },
        });
      }
    } catch (dbErr) {
      console.warn("DB daily verse lookup failed, using auto fallback:", dbErr);
    }

    // 3. Automatic Daily Rotation (Zero admin intervention needed)
    return NextResponse.json({
      success: true,
      data: {
        date: todayStr,
        verse: autoVerse.verse,
        reference: autoVerse.reference,
        topic: autoVerse.topic,
        imageUrl: autoVerse.imageUrl,
        isCustom: false,
        isPinned: false,
        updatedBy: "Hệ thống tự động luân phiên",
      },
    });
  } catch (error: any) {
    console.error("GET /api/daily-verse error:", error);
    const fallback = getAutoDailyVerse(new Date());
    return NextResponse.json({
      success: true,
      data: {
        ...fallback,
        isCustom: false,
      },
    });
  }
}
