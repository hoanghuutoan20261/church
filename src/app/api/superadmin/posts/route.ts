import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Church } from "@/models/Church";
import { requireSuperadmin } from "@/lib/superadminAuth";

export const dynamic = "force-dynamic";

// GET /api/superadmin/posts
export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const churchSlug = searchParams.get("churchSlug");
    const category = searchParams.get("category");
    const search = searchParams.get("search")?.toLowerCase().trim();

    const query: any = {};
    if (churchSlug && churchSlug !== "all") query.churchSlug = churchSlug;
    if (category && category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { "author.name": { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const churches = await Church.find({}, "name slug denomination profileConfig").lean();
    const churchMap = new Map();
    churches.forEach((c) => churchMap.set(c.slug, c));

    const enriched = posts.map((p: any) => {
      const church = churchMap.get(p.churchSlug);
      return {
        ...p,
        _id: (p._id as any).toString(),
        churchName: church?.name || p.author?.name || "Hội Thánh",
        churchDenomination: church?.denomination || "Hội Thánh Tin Lành",
        churchAvatar: church?.profileConfig?.avatarUrl || p.author?.avatarUrl,
      };
    });

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("GET /api/superadmin/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải danh sách bài viết: " + error.message },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/posts (Superadmin create post for any church or global)
export async function POST(req: NextRequest) {
  const { user, errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const {
      churchSlug = "loibansusong",
      title,
      content,
      category = "announcement",
      scriptureVerse,
      imageUrl,
      videoUrl,
      isPinned = false,
      authorName = "Ban Tổng Quản Trị Hệ Thống",
      authorRole = "Superadmin",
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "Tiêu đề và nội dung là bắt buộc" },
        { status: 400 }
      );
    }

    const church = await Church.findOne({ slug: churchSlug.toLowerCase().trim() });
    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh đã chọn" },
        { status: 404 }
      );
    }

    const newPost = await Post.create({
      churchId: church._id,
      churchSlug: church.slug,
      author: {
        name: authorName,
        role: authorRole,
        avatarUrl:
          church.profileConfig?.avatarUrl ||
          "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=400&q=80",
      },
      category,
      title: title.trim(),
      content: content.trim(),
      scriptureVerse: scriptureVerse ? scriptureVerse.trim() : undefined,
      imageUrl: imageUrl ? imageUrl.trim() : undefined,
      videoUrl: videoUrl ? videoUrl.trim() : undefined,
      isPinned: Boolean(isPinned),
      likesCount: 1,
      comments: [],
    });

    return NextResponse.json({
      success: true,
      message: "Đã đăng bài viết mới thành công!",
      data: newPost,
    });
  } catch (error: any) {
    console.error("POST /api/superadmin/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi đăng bài: " + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/superadmin/posts (Update post or toggle pin)
export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const { postId, isPinned, title, content, category } = body;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Thiếu postId" },
        { status: 400 }
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    if (isPinned !== undefined) post.isPinned = Boolean(isPinned);
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content.trim();
    if (category !== undefined) post.category = category;

    await post.save();

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật bài viết thành công`,
      data: post,
    });
  } catch (error: any) {
    console.error("PUT /api/superadmin/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi cập nhật bài viết: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/posts (Delete any post or comment)
export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const commentId = searchParams.get("commentId");

    if (!postId) {
      return NextResponse.json(
        { success: false, error: "Thiếu postId cần xóa" },
        { status: 400 }
      );
    }

    if (commentId) {
      // Delete single comment from post
      await Post.updateOne(
        { _id: postId },
        { $pull: { comments: { _id: commentId } } }
      );
      return NextResponse.json({
        success: true,
        message: "Đã xóa bình luận thành công",
      });
    }

    // Delete entire post
    const result = await Post.deleteOne({ _id: postId });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy bài viết để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa vĩnh viễn bài viết khỏi hệ thống",
    });
  } catch (error: any) {
    console.error("DELETE /api/superadmin/posts error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi xóa bài viết: " + error.message },
      { status: 500 }
    );
  }
}
