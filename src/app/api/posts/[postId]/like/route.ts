import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Post } from "@/models/Post";

// POST /api/posts/[postId]/like
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    if (!postId) {
      return NextResponse.json(
        { success: false, message: "Thiếu postId" },
        { status: 400 }
      );
    }

    await connectDB();

    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: 1 } },
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy bài viết" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã hiệp ý Amen!",
      likesCount: post.likesCount,
    });
  } catch (error: any) {
    console.error("POST /api/posts/[postId]/like error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tương tác bài viết" },
      { status: 500 }
    );
  }
}
