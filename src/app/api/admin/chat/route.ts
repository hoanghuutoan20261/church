import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { ChatMessage } from "@/models/ChatMessage";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest) {
  try {
    const authSession = await getAuthUser();
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: "Thiếu ID tin nhắn cần xóa" },
        { status: 400 }
      );
    }

    await connectDB();
    const result = await ChatMessage.deleteOne({
      _id: messageId,
      churchSlug: authSession.churchSlug,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tin nhắn hoặc đã bị xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã gỡ bỏ tin nhắn vi phạm",
    });
  } catch (error: any) {
    console.error("Lỗi xóa tin nhắn quản duyệt:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
