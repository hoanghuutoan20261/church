import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Feedback } from "@/models/Feedback";
import { requireSuperadmin } from "@/lib/superadminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const filter: Record<string, any> = {};
    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.category = category;

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      success: true,
      data: feedbacks.map((f) => ({
        ...f,
        _id: (f._id as any).toString(),
      })),
    });
  } catch (error: any) {
    console.error("GET /api/superadmin/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải danh sách góp ý: " + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const { feedbackId, status, adminNote } = body;

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã góp ý (feedbackId)" },
        { status: 400 }
      );
    }

    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (typeof adminNote === "string") updateData.adminNote = adminNote.trim();

    const updated = await Feedback.findByIdAndUpdate(
      feedbackId,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy góp ý" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật trạng thái góp ý thành công!",
      data: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/superadmin/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi cập nhật góp ý: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const feedbackId = searchParams.get("feedbackId");

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, error: "Thiếu mã góp ý cần xóa" },
        { status: 400 }
      );
    }

    await Feedback.findByIdAndDelete(feedbackId);

    return NextResponse.json({
      success: true,
      message: "Đã xóa góp ý thành công!",
    });
  } catch (error: any) {
    console.error("DELETE /api/superadmin/feedback error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi xóa góp ý: " + error.message },
      { status: 500 }
    );
  }
}
