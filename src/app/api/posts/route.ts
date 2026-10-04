import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { Church } from "@/models/Church";
import { getAuthUser } from "@/lib/auth";
import { getChurchAvatar } from "@/lib/churchAvatar";

// GET /api/posts?churchSlug=...&category=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchSlug = searchParams.get("churchSlug")?.toLowerCase().trim();
    const category = searchParams.get("category");

    await connectDB();

    const query: Record<string, any> = {};
    if (churchSlug && churchSlug !== "all") {
      query.churchSlug = churchSlug;
    }
    if (category && category !== "all") {
      query.category = category;
    }

    const posts = await Post.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    // Fetch churches to enrich post author and details
    const churches = await Church.find({}).lean();
    const churchMap = new Map();
    churches.forEach((c) => churchMap.set(c.slug, c));

    const enrichedPosts = posts.map((post: any) => {
      const church = churchMap.get(post.churchSlug);
      return {
        ...post,
        churchName: church?.name || post.author?.name || "Hội Thánh Tin Lành",
        churchDenomination: church?.denomination || "Hội Thánh Tin Lành Việt Nam",
        churchAvatar: getChurchAvatar(
          church?.name || post.author?.name || "Hội Thánh",
          post.churchSlug,
          church?.profileConfig?.avatarUrl || post.author?.avatarUrl
        ),
        isLive: Boolean(church?.currentService?.isLive),
        viewersCount: church?.currentService?.viewersCount || 0,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedPosts,
      count: enrichedPosts.length,
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

    if (!churchSlug || !content) {
      return NextResponse.json(
        { success: false, message: "Nội dung bài viết và Hội Thánh đăng tải là bắt buộc" },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify church exists
    const church = await Church.findOne({ slug: churchSlug.toLowerCase().trim() });
    if (!church) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy Hội Thánh tương ứng" },
        { status: 404 }
      );
    }

    // Require authenticated admin / pastor / superadmin
    if (!authUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Chỉ Mục sư hoặc Ban Quản Trị Hội Thánh mới có quyền đăng bài chính thức lên Bảng Tin.",
        },
        { status: 401 }
      );
    }

    const isSuperAdmin = authUser.role === "superadmin";
    const isChurchAuthorized =
      isSuperAdmin ||
      (authUser.churchSlug &&
        authUser.churchSlug.toLowerCase().trim() === churchSlug.toLowerCase().trim());

    if (!isChurchAuthorized) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bạn chỉ có quyền đăng bài chính thức cho Hội Thánh mà bạn đang phụ trách quản nhiệm.",
        },
        { status: 403 }
      );
    }

    let finalTitle = title?.trim();
    if (!finalTitle) {
      if (category === "announcement") finalTitle = `Thông Báo Mục Vụ - ${church.name}`;
      else if (category === "scripture") finalTitle = "Lời Chúa Nuôi Dưỡng Tâm Linh";
      else if (category === "sermon") finalTitle = "Sứ Điệp Lời Chúa";
      else if (category === "fellowship") finalTitle = "Làm Chứng & Thông Công";
      else if (category === "worship") finalTitle = `Chương Trình Thờ Phượng - ${church.name}`;
      else finalTitle = content.trim().slice(0, 60) + (content.length > 60 ? "..." : "");
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
          (authUser?.role === "superadmin"
            ? "Tổng Quản Trị Hệ Thống"
            : authUser?.role === "pastor"
            ? "Mục sư Quản Nhiệm"
            : "Ban Quản Trị Mục Vụ"),
        avatarUrl: church.profileConfig?.avatarUrl || "",
      },
      category,
      title: finalTitle,
      content: content.trim(),
      scriptureVerse: scriptureVerse?.trim() || "",
      imageUrl: imageUrl?.trim() || "",
      videoUrl: videoUrl?.trim() || "",
      isPinned: Boolean(isPinned),
      likesCount: 0,
      comments: [],
    });

    const enrichedPost = {
      ...newPost.toObject(),
      churchName: church.name,
      churchDenomination: church.denomination || "Hội Thánh Tin Lành Việt Nam",
      churchAvatar: getChurchAvatar(
        church.name,
        church.slug,
        church.profileConfig?.avatarUrl || newPost.author?.avatarUrl
      ),
      isLive: Boolean(church.currentService?.isLive),
      viewersCount: church.currentService?.viewersCount || 0,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Đã đăng bài viết lên Tường Hội Thánh thành công!",
        data: enrichedPost,
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
