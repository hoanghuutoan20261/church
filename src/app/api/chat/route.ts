import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { ChatMessage } from "@/models/ChatMessage";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const churchSlug = (searchParams.get("churchSlug") || "loibansusong").toLowerCase().trim();

    const messages = await ChatMessage.find({ churchSlug })
      .sort({ createdAt: 1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      data: messages.map((m) => ({
        id: (m as any)._id ? (m as any)._id.toString() : String((m as any).id || Date.now()),
        churchSlug: m.churchSlug,
        sender: m.sender,
        role: m.role || "member",
        location: m.location,
        text: m.text,
        timestamp: m.timestamp,
        isAmenOnly: Boolean(m.isAmenOnly),
      })),
    });
  } catch (error: any) {
    console.error("Lỗi tải tin nhắn:", error);
    return NextResponse.json({
      success: false,
      fallback: true,
      data: [],
      details: error.message,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { churchSlug, sender, role, location, text, timestamp, isAmenOnly } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Tin nhắn không được để trống" },
        { status: 400 }
      );
    }

    const slug = (churchSlug || "loibansusong").toLowerCase().trim();

    const newRecord = await ChatMessage.create({
      churchSlug: slug,
      sender: sender ? sender.trim() : "Tín hữu trực tuyến",
      role: role || "member",
      location: location || "Trực tuyến",
      text: text.trim().slice(0, 300),
      timestamp:
        timestamp ||
        new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isAmenOnly: Boolean(isAmenOnly),
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newRecord._id.toString(),
          churchSlug: slug,
          sender: newRecord.sender,
          role: newRecord.role,
          location: newRecord.location,
          text: newRecord.text,
          timestamp: newRecord.timestamp,
          isAmenOnly: newRecord.isAmenOnly,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi gửi tin nhắn:", error);
    return NextResponse.json(
      { error: "Không thể lưu tin nhắn", details: error.message },
      { status: 500 }
    );
  }
}
