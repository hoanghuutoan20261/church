import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Church } from "@/models/Church";
import { getAuthUser } from "@/lib/auth";

// GET /api/posts?churchSlug=...&category=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchSlug = searchParams.get("churchSlug")?.toLowerCase().trim();
    const category = searchParams.get("category");

    if (!churchSlug) {
      return NextResponse.json(
        { success: false, message: "Thiếu churchSlug" },
        { status: 400 }
      );
    }

    await connectDB();

    const query: Record<string, any> = { churchSlug };
    if (category && category !== "all") {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: posts,
    });
  } catch (error: any) {
    console.error("GET /api/posts error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi máy chủ khi lấy bài viết" },
      { status: 500 }
    );
  }
}

// POST /api/posts (Admin publish post to church wall)
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.json();

    const {
      churchSlug,
      title,
      content,
      category = "announcement",
      scriptureVerse,
      imageUrl,
      videoUrl,
      isPinned = false,
      authorName,
      authorRole,
    } = body;

    if (!churchSlug || !title || !content) {
      return NextResponse.json(
        { success: false, message: "Tiêu đề và nội dung là bắt buộc" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify church exists
    const church = await Church.findOne({ slug: churchSlug.toLowerCase().trim() });
    if (!church) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy Hội Thánh" },
        { status: 404 }
      );
    }

    // Role check if admin user is logged in
    if (authUser && authUser.churchSlug !== churchSlug && authUser.role !== "pastor") {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền đăng bài cho Hội Thánh này" },
        { status: 403 }
      );
    }

    const newPost = await Post.create({
      churchId: church._id,
      churchSlug: church.slug,
      author: {
        name:
          authorName ||
          authUser?.fullName ||
          church.name ||
          "Ban Truyền Thông Hội Thánh",
        role:
          authorRole ||
          (authUser?.role === "pastor"
            ? "Mục sư Quản Nhiệm"
            : "Ban Quản Trị Mục Vụ"),
        avatarUrl: church.profileConfig?.avatarUrl || "",
      },
      category,
      title: title.trim(),
      content: content.trim(),
      scriptureVerse: scriptureVerse?.trim() || "",
      imageUrl: imageUrl?.trim() || "",
      videoUrl: videoUrl?.trim() || "",
      isPinned: Boolean(isPinned),
      likesCount: 0,
      comments: [],
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đã đăng bài viết lên Tường Hội Thánh thành công!",
        data: newPost,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/posts error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi đăng bài viết" },
      { status: 500 }
    );
  }
}
