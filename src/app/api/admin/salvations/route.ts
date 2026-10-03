import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { SalvationDecision } from "@/models/SalvationDecision";
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
    const salvations = await SalvationDecision.find({
      churchSlug: authSession.churchSlug,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: salvations.length,
      data: salvations,
    });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách thân hữu tiếp nhận Chúa:", error);
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
    const { decisionId, status } = body;

    if (!decisionId || !status) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin decisionId hoặc status" },
        { status: 400 }
      );
    }

    const decision = await SalvationDecision.findOne({
      _id: decisionId,
      churchSlug: authSession.churchSlug,
    });

    if (!decision) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy hồ sơ quyết định tiếp nhận" },
        { status: 404 }
      );
    }

    decision.status = status;
    await decision.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật tiến trình chăm sóc thành công!",
      data: decision,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật hồ sơ tiếp nhận Chúa:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật dữ liệu" },
      { status: 500 }
    );
  }
}
