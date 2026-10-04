import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { Church } from "@/models/Church";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthUser();
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Chưa đăng nhập" },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(authSession.userId).select("-passwordHash");
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "Tài khoản không hợp lệ hoặc đã bị khóa" },
        { status: 401 }
      );
    }

    let church = null;
    if (user.churchId) {
      church = await Church.findById(user.churchId);
    }

    if (user.role !== "superadmin" && (!church || !church.isActive)) {
      return NextResponse.json(
        { success: false, error: "Hội Thánh không tồn tại hoặc chưa kích hoạt" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        church,
        isSuperAdmin: user.role === "superadmin",
      },
    });
  } catch (error: any) {
    console.error("Lỗi lấy thông tin phiên đăng nhập:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}
