import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Post } from "@/models/Post";

// POST /api/posts/[postId]/comment
export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const body = await req.json();
    const { authorName, content } = body;

    if (!postId || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Nội dung bình luận không được để trống" },
        { status: 400 }
      );
    }

    await connectDB();

    const newComment = {
      authorName: authorName?.trim() || "Tín Hữu",
      authorRole: "Thành viên",
      content: content.trim(),
      createdAt: new Date(),
    };

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: newComment } },
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
      message: "Bình luận thành công!",
      data: post.comments[post.comments.length - 1],
      commentsCount: post.comments.length,
    });
  } catch (error: any) {
    console.error("POST /api/posts/[postId]/comment error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi gửi bình luận" },
      { status: 500 }
    );
  }
}
