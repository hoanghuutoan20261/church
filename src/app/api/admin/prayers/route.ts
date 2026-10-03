import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { PrayerRequest } from "@/models/PrayerRequest";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthUser();
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }

    await connectDB();
    const prayers = await PrayerRequest.find({
      churchSlug: authSession.churchSlug,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: prayers.length,
      data: prayers,
    });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách cầu nguyện kín:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authSession = await getAuthUser();
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();
    const { prayerId, status } = body;

    if (!prayerId || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin prayerId hoặc status" },
        { status: 400 }
      );
    }

    const prayer = await PrayerRequest.findOne({
      _id: prayerId,
      churchSlug: authSession.churchSlug,
    });

    if (!prayer) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy lời cầu thay tương ứng" },
        { status: 404 }
      );
    }

    prayer.status = status;
    await prayer.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật trạng thái thành công!",
      data: prayer,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật lời cầu nguyện:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật dữ liệu" },
      { status: 500 }
    );
  }
}
