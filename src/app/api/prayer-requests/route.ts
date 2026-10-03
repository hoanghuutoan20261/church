import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { PrayerRequest } from "@/models/PrayerRequest";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      churchSlug,
      name,
      isAnonymous,
      contact,
      wantsPastorCall,
      category,
      confidentialLevel,
      prayerContent,
    } = body;

    if (!prayerContent || !prayerContent.trim()) {
      return NextResponse.json(
        { error: "Nội dung lời cầu thay không được để trống" },
        { status: 400 }
      );
    }

    const record = await PrayerRequest.create({
      churchSlug: (churchSlug || "loibansusong").toLowerCase().trim(),
      name: isAnonymous ? "Con cái Chúa (Ẩn danh)" : (name || "Ẩn danh").trim(),
      isAnonymous: Boolean(isAnonymous),
      contact: contact ? contact.trim() : null,
      wantsPastorCall: Boolean(wantsPastorCall),
      category: category || "Sức khỏe & Chữa lành",
      confidentialLevel: confidentialLevel || "pastor_only",
      prayerContent: prayerContent.trim(),
      status: "new",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lời cầu thay đã được tiếp nhận trong ân điển",
        id: record._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi lưu lời cầu nguyện:", error);
    return NextResponse.json(
      { error: "Không thể lưu lời cầu thay vào cơ sở dữ liệu", details: error.message },
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

    const requests = await PrayerRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    console.error("Lỗi tải danh sách cầu nguyện:", error);
    return NextResponse.json(
      { error: "Lỗi tải dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}
