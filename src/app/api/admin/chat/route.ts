import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { ChatMessage } from "@/models/ChatMessage";
import { getAuthUser } from "@/lib/auth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }
    return NextResponse.json({ success: true, message: "Chat admin endpoint active" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const messageId = searchParams.get("id");
    const churchSlugParam = searchParams.get("churchSlug");
    const clearAll = searchParams.get("clearAll") === "true";

    await connectDB();

    // 1. Dọn sạch toàn bộ phòng chat của Hội Thánh
    if (clearAll) {
      const deleteFilter: Record<string, any> = {};
      const targetSlug =
        authSession.role === "superadmin"
          ? churchSlugParam || authSession.churchSlug
          : authSession.churchSlug;

      if (targetSlug && targetSlug !== "system") {
        deleteFilter.churchSlug = targetSlug;
      }

      const deleteResult = await ChatMessage.deleteMany(deleteFilter);
      return NextResponse.json({
        success: true,
        message: `Đã dọn sạch ${deleteResult.deletedCount} tin nhắn trong phòng chat`,
        deletedCount: deleteResult.deletedCount,
      });
    }

    // 2. Xóa 1 tin nhắn theo ID
    if (!messageId || messageId === "undefined" || messageId === "null") {
      return NextResponse.json(
        { success: false, error: "Thiếu ID tin nhắn cần xóa" },
        { status: 400 }
      );
    }

    // Xây dựng điều kiện truy vấn an toàn
    const query: Record<string, any> = {};
    if (mongoose.Types.ObjectId.isValid(messageId)) {
      query._id = new mongoose.Types.ObjectId(messageId);
    } else {
      query._id = messageId;
    }

    // Nếu không phải superadmin, chỉ cho phép xóa tin nhắn thuộc Hội Thánh của mình
    if (authSession.role !== "superadmin") {
      query.churchSlug = authSession.churchSlug;
    } else if (churchSlugParam && churchSlugParam !== "system") {
      query.churchSlug = churchSlugParam;
    }

    const result = await ChatMessage.deleteOne(query);

    if (result.deletedCount === 0) {
      // Thử tìm theo string id nếu query ObjectId không match
      const fallbackResult = await ChatMessage.deleteOne({
        $or: [{ _id: messageId }, { id: messageId }],
      });

      if (fallbackResult.deletedCount === 0) {
        return NextResponse.json(
          { success: false, error: "Không tìm thấy tin nhắn hoặc đã bị xóa" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Đã gỡ bỏ tin nhắn vi phạm thành công",
    });
  } catch (error: any) {
    console.error("Lỗi xóa tin nhắn quản duyệt:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống khi xóa tin nhắn" },
      { status: 500 }
    );
  }
}
