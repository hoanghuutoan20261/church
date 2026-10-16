import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Feedback } from "@/models/Feedback";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      senderName,
      contact,
      role,
      category,
      rating,
      message,
      churchSlug,
      pageUrl,
    } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập nội dung góp ý của quý vị." },
        { status: 400 }
      );
    }

    const doc = await Feedback.create({
      senderName: senderName?.trim() || "Tín hữu / Khách thăm",
      contact: contact?.trim() || "",
      role: role || "believer",
      category: category || "suggestion",
      rating: typeof rating === "number" ? Math.min(5, Math.max(1, rating)) : 5,
      message: message.trim(),
      churchSlug: churchSlug || "system",
      pageUrl: pageUrl || "/",
      status: "new",
    });

    return NextResponse.json({
      success: true,
      message: "Cảm ơn quý vị! Ý kiến đóng góp đã được gửi trực tiếp đến Đội Ngũ Phát Triển.",
      data: doc,
    });
  } catch (error: any) {
    console.error("POST /api/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi gửi góp ý: " + error.message },
      { status: 500 }
    );
  }
}
