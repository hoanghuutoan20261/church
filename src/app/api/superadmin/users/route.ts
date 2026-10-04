import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Church } from "@/models/Church";
import { hashPassword } from "@/lib/auth";
import { requireSuperadmin } from "@/lib/superadminAuth";

export const dynamic = "force-dynamic";

// GET /api/superadmin/users
export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).select("-passwordHash").lean();

    const churches = await Church.find({}, "name slug denomination").lean();
    const churchMap = new Map();
    churches.forEach((c) => churchMap.set(c.slug, c.name));

    const enriched = users.map((u: any) => ({
      ...u,
      _id: (u._id as any).toString(),
      churchName: u.churchSlug === "system" ? "Toàn Hệ Thống" : churchMap.get(u.churchSlug) || u.churchSlug,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("GET /api/superadmin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải danh sách người dùng: " + error.message },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/users (Create new user or pastor or superadmin)
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const {
      fullName,
      email,
      password,
      role = "pastor",
      churchSlug = "system",
      phone = "",
    } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Họ tên, email và mật khẩu là bắt buộc" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Email ${cleanEmail} đã tồn tại trong hệ thống` },
        { status: 400 }
      );
    }

    let churchId = undefined;
    if (churchSlug !== "system") {
      const church = await Church.findOne({ slug: churchSlug.toLowerCase().trim() });
      if (church) {
        churchId = church._id;
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
      phone: phone.trim(),
      role,
      churchSlug: churchSlug.toLowerCase().trim(),
      churchId,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo tài khoản '${newUser.fullName}' (${newUser.role}) thành công`,
      data: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        churchSlug: newUser.churchSlug,
      },
    });
  } catch (error: any) {
    console.error("POST /api/superadmin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tạo tài khoản: " + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/superadmin/users (Update user role, active status, reset password)
export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const { userId, role, isActive, password, fullName, phone } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Thiếu userId cần cập nhật" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy người dùng" },
        { status: 404 }
      );
    }

    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    if (password && password.trim().length >= 6) {
      user.passwordHash = await hashPassword(password.trim());
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thông tin tài khoản '${user.fullName}'`,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/superadmin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi cập nhật người dùng: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/users
export async function DELETE(req: NextRequest) {
  const { user: currentAdmin, errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Thiếu userId cần xóa" },
        { status: 400 }
      );
    }

    if (userId === currentAdmin?.userId) {
      return NextResponse.json(
        { success: false, error: "Bạn không thể tự xóa tài khoản của chính mình" },
        { status: 400 }
      );
    }

    const result = await User.deleteOne({ _id: userId });
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tài khoản để xóa" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đã xóa vĩnh viễn tài khoản người dùng",
    });
  } catch (error: any) {
    console.error("DELETE /api/superadmin/users error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi xóa người dùng: " + error.message },
      { status: 500 }
    );
  }
}
