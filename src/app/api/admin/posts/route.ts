import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { getAuthUser } from "@/lib/auth";

// GET /api/admin/posts - Fetch all posts for the authenticated admin's church
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    await connectDB();

    const churchSlugParam = req.nextUrl.searchParams.get("churchSlug");
    const targetSlug =
      authUser.role === "superadmin" && churchSlugParam
        ? churchSlugParam.toLowerCase().trim()
        : authUser.churchSlug;

    const posts = await Post.find(targetSlug ? { churchSlug: targetSlug } : {})
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error: any) {
    console.error("GET /api/admin/posts error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy danh sách bài viết" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/posts?id=... - Delete a post
export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID bài viết" },
        { status: 400 }
      );
    }

    await connectDB();

    const postQuery =
      authUser.role === "superadmin"
        ? { _id: postId }
        : { _id: postId, churchSlug: authUser.churchSlug };

    const post = await Post.findOne(postQuery);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bài viết hoặc bạn không có quyền xóa" },
        { status: 404 }
      );
    }

    await Post.findByIdAndDelete(postId);

    return NextResponse.json({
      success: true,
      message: "Đã xóa bài viết khỏi Tường Hội Thánh thành công!",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/posts error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa bài viết" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/posts - Toggle pin or edit post
export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { success: false, message: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { postId, isPinned, title, content, category, scriptureVerse, imageUrl } = body;

    if (!postId) {
      return NextResponse.json(
        { success: false, message: "Thiếu ID bài viết" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateFields: Record<string, any> = {};
    if (typeof isPinned === "boolean") updateFields.isPinned = isPinned;
    if (title) updateFields.title = title.trim();
    if (content) updateFields.content = content.trim();
    if (category) updateFields.category = category;
    if (scriptureVerse !== undefined) updateFields.scriptureVerse = scriptureVerse.trim();
    if (imageUrl !== undefined) updateFields.imageUrl = imageUrl.trim();

    const updateQuery =
      authUser.role === "superadmin"
        ? { _id: postId }
        : { _id: postId, churchSlug: authUser.churchSlug };

    const updatedPost = await Post.findOneAndUpdate(
      updateQuery,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bài viết để cập nhật" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật bài viết thành công!",
      data: updatedPost,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/posts error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật bài viết" },
      { status: 500 }
    );
  }
}
