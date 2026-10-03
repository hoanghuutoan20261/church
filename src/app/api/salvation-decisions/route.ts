import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { SalvationDecision } from "@/models/SalvationDecision";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { churchSlug, fullName, phoneNumber, city, hasPrayed, serviceTheme } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp họ tên và số điện thoại liên hệ" },
        { status: 400 }
      );
    }

    const record = await SalvationDecision.create({
      churchSlug: (churchSlug || "loibansusong").toLowerCase().trim(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      city: city ? city.trim() : "Chưa rõ",
      hasPrayed: Boolean(hasPrayed),
      serviceTheme: serviceTheme || "Thờ Phượng Chúa Nhật",
      status: "pending_pastoral_care",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Chúc mừng quyết định tin nhận Chúa của bạn!",
        id: record._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi lưu quyết định tin nhận Chúa:", error);
    return NextResponse.json(
      { error: "Không thể lưu thông tin vào cơ sở dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const churchSlug = searchParams.get("churchSlug");

    const query: any = {};
    if (churchSlug) {
      query.churchSlug = churchSlug.toLowerCase().trim();
    }

    const decisions = await SalvationDecision.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, count: decisions.length, data: decisions });
  } catch (error: any) {
    console.error("Lỗi tải danh sách tin nhận Chúa:", error);
    return NextResponse.json(
      { error: "Lỗi tải dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}
