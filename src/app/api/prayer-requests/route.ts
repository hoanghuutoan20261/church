import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { PrayerRequest } from "@/models/PrayerRequest";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Public submission of prayer requests from believers / visitors
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      churchSlug,
      name,
      isAnonymous,
      contact,
      wantsPastorCall,
      category,
      confidentialLevel,
      prayerContent,
    } = body;

    if (!prayerContent || !prayerContent.trim()) {
      return NextResponse.json(
        { success: false, error: "Nội dung lời cầu thay không được để trống" },
        { status: 400 }
      );
    }

    if (prayerContent.trim().length > 2000) {
      return NextResponse.json(
        { success: false, error: "Nội dung lời cầu thay vượt quá giới hạn 2000 ký tự" },
        { status: 400 }
      );
    }

    const sanitizedName = isAnonymous
      ? "Con cái Chúa (Ẩn danh)"
      : (name || "Ẩn danh").trim().slice(0, 100);

    const sanitizedContact = contact ? contact.trim().slice(0, 80) : null;

    const record = await PrayerRequest.create({
      churchSlug: (churchSlug || "loibansusong").toLowerCase().trim(),
      name: sanitizedName,
      isAnonymous: Boolean(isAnonymous),
      contact: sanitizedContact,
      wantsPastorCall: Boolean(wantsPastorCall),
      category: (category || "Sức khỏe & Chữa lành").slice(0, 100),
      confidentialLevel: confidentialLevel === "prayer_team" ? "prayer_team" : "pastor_only",
      prayerContent: prayerContent.trim().slice(0, 2000),
      status: "new",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lời cầu thay đã được tiếp nhận trong ân điển",
        id: record._id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi lưu lời cầu nguyện:", error);
    return NextResponse.json(
      { success: false, error: "Không thể lưu lời cầu thay vào cơ sở dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Strictly protected: Only authorized church admins / pastors or superadmin can read private prayer requests
 */
export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        {
          success: false,
          error: "Quyền truy cập bị từ chối: Yêu cầu đăng nhập quản trị để xem danh sách nan đề cầu nguyện",
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

    const requests = await PrayerRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error: any) {
    console.error("Lỗi tải danh sách cầu nguyện:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}
