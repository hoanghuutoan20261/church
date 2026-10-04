import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, AuthTokenPayload } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";

/**
 * Verify that the incoming request is from a legitimate Superadmin.
 * Returns the AuthTokenPayload if valid, or a NextResponse error to immediately return.
 */
export async function requireSuperadmin(
  req?: NextRequest
): Promise<{ user: AuthTokenPayload | null; errorResponse: NextResponse | null }> {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return {
        user: null,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: "Yêu cầu đăng nhập tài khoản Tổng Quản Trị (Superadmin)",
            code: "UNAUTHORIZED",
          },
          { status: 401 }
        ),
      };
    }

    if (authSession.role !== "superadmin") {
      // Check database directly in case role was updated
      await connectDB();
      const dbUser = await User.findById(authSession.userId).lean();
      if (!dbUser || dbUser.role !== "superadmin" || !dbUser.isActive) {
        return {
          user: null,
          errorResponse: NextResponse.json(
            {
              success: false,
              error: "Quyền truy cập bị từ chối: Tài khoản không có đặc quyền Tổng Quản Trị",
              code: "FORBIDDEN",
            },
            { status: 403 }
          ),
        };
      }
    }

    return { user: authSession, errorResponse: null };
  } catch (error: any) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: "Lỗi kiểm tra quyền Superadmin: " + (error?.message || "Lỗi không xác định"),
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      ),
    };
  }
}
