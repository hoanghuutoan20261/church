import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Church } from "@/models/Church";
import { comparePassword, signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ Email và Mật khẩu" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản không tồn tại. Vui lòng kiểm tra lại email.",
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Tài khoản này đã bị tạm khóa. Vui lòng liên hệ quản trị viên.",
        },
        { status: 403 }
      );
    }

    // Verify password
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    // Fetch linked church if not superadmin
    let church = null;
    if (user.churchId) {
      church = await Church.findById(user.churchId);
    }

    if (user.role !== "superadmin" && (!church || !church.isActive)) {
      return NextResponse.json(
        {
          success: false,
          error: "Hội Thánh liên kết không còn hoạt động hoặc chưa được kích hoạt.",
        },
        { status: 403 }
      );
    }

    // Update lastLoginAt
    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });

    // Issue Token
    const token = signToken({
      userId: (user._id as any).toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      churchSlug: church?.slug || "system",
      churchId: church ? (church._id as any).toString() : "system",
    });

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          isSuperAdmin: user.role === "superadmin",
        },
        church: church
          ? {
              id: church._id,
              name: church.name,
              slug: church.slug,
              streamKey: church.streamKey,
            }
          : {
              name: "Hệ Thống Tổng Quản Trị",
              slug: "system",
            },
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Lỗi đăng nhập:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống khi đăng nhập" },
      { status: 500 }
    );
  }
}
