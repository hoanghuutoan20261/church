import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { SalvationDecision } from "@/models/SalvationDecision";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Public submission for new believers who decide to accept Jesus Christ
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { churchSlug, fullName, phoneNumber, city, hasPrayed, serviceTheme } = body;

    if (!fullName || !fullName.trim() || !phoneNumber || !phoneNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp họ tên và số điện thoại liên hệ" },
        { status: 400 }
      );
    }

    const cleanFullName = fullName.trim().slice(0, 100);
    const cleanPhoneNumber = phoneNumber.trim().slice(0, 30);
    const cleanCity = (city || "Chưa rõ").trim().slice(0, 100);
    const cleanTheme = (serviceTheme || "Thờ Phượng Chúa Nhật").trim().slice(0, 150);

    const record = await SalvationDecision.create({
      churchSlug: (churchSlug || "loibansusong").toLowerCase().trim(),
      fullName: cleanFullName,
      phoneNumber: cleanPhoneNumber,
      city: cleanCity,
      hasPrayed: Boolean(hasPrayed),
      serviceTheme: cleanTheme,
      status: "pending_pastoral_care",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Chúc mừng quyết định tin nhận Chúa của bạn!",
        id: record._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi lưu quyết định tin nhận Chúa:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lưu thông tin vào cơ sở dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Strictly protected: Only authorized pastors / church admins or superadmin can read salvation decisions
 */
export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Quyền truy cập bị từ chối: Yêu cầu đăng nhập quản trị để xem danh sách thân hữu tin nhận Chúa",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const churchSlugParam = searchParams.get("churchSlug");

    const query: any = {};

    // If not superadmin, strictly constrain query to their assigned church only
    if (authSession.role !== "superadmin") {
      query.churchSlug = authSession.churchSlug;
    } else if (churchSlugParam) {
      query.churchSlug = churchSlugParam.toLowerCase().trim();
    }

    const decisions = await SalvationDecision.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      count: decisions.length,
      data: decisions,
    });
  } catch (error: any) {
    console.error("Lỗi tải danh sách tin nhận Chúa:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}
