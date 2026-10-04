import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { requireSuperadmin } from "@/lib/superadminAuth";

export const dynamic = "force-dynamic";

// GET /api/superadmin/churches
export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const churches = await Church.find({}).sort({ createdAt: -1 }).lean();

    // Map post count and admin count for each church
    const postCounts = await Post.aggregate([
      { $group: { _id: "$churchSlug", count: { $sum: 1 } } },
    ]);
    const postCountMap: Record<string, number> = {};
    postCounts.forEach((pc) => {
      postCountMap[pc._id] = pc.count;
    });

    const userCounts = await User.aggregate([
      { $group: { _id: "$churchSlug", count: { $sum: 1 } } },
    ]);
    const userCountMap: Record<string, number> = {};
    userCounts.forEach((uc) => {
      userCountMap[uc._id] = uc.count;
    });

    const enriched = churches.map((c) => ({
      ...c,
      _id: (c._id as any).toString(),
      postCount: postCountMap[c.slug] || 0,
      adminCount: userCountMap[c.slug] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      count: enriched.length,
    });
  } catch (error: any) {
    console.error("GET /api/superadmin/churches error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tải danh sách Hội Thánh: " + error.message },
      { status: 500 }
    );
  }
}

// POST /api/superadmin/churches (Create a church directly)
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      slug,
      denomination = "Hội Thánh Tin Lành Việt Nam",
      address = "Việt Nam",
      streamKey,
      liveSchedule = "Chúa Nhật, 08:30 - 11:00",
      leadPastor = "Mục sư Quản Nhiệm",
      slogan = "Hiệp Một — Yêu Thương — Phụng Sự",
      about = "Hội Thánh thành lập với sứ mạng tôn vinh Chúa và gây dựng đức tin.",
      coverImageUrl,
      avatarUrl,
      bankName = "MB Bank",
      accountNumber = "0386888999",
      accountHolder,
      isActive = true,
    } = body;

    if (!name || !slug || !streamKey) {
      return NextResponse.json(
        { success: false, error: "Tên, slug và streamKey là bắt buộc" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    // Check duplicate slug
    const existing = await Church.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Slug '/${cleanSlug}' đã được sử dụng bởi một Hội Thánh khác` },
        { status: 400 }
      );
    }

    const newChurch = await Church.create({
      name: name.trim(),
      slug: cleanSlug,
      denomination: denomination.trim(),
      address: address.trim(),
      streamKey: streamKey.trim(),
      liveSchedule: liveSchedule.trim(),
      isActive: Boolean(isActive),
      themeConfig: {
        accentColor: "#c5a059",
        logoUrl: "",
      },
      profileConfig: {
        coverImageUrl:
          coverImageUrl ||
          "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
        avatarUrl:
          avatarUrl ||
          "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=400&q=80",
        leadPastor: leadPastor.trim(),
        slogan: slogan.trim(),
        about: about.trim(),
      },
      currentService: {
        title: "Lễ Thờ Phượng Chúa Nhật",
        speaker: leadPastor.trim(),
        speakerTitle: "Mục sư Quản Nhiệm",
        scriptureReference: "Thi Thiên 23:1",
        welcomeMessage: "Chào mừng quý tôi con Chúa hiệp ý thờ phượng!",
        isLive: false,
        viewersCount: 0,
      },
      bankingConfig: {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: (accountHolder || name).toUpperCase().trim(),
        branch: "Chi nhánh",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo Hội Thánh '${newChurch.name}' thành công!`,
      data: newChurch,
    });
  } catch (error: any) {
    console.error("POST /api/superadmin/churches error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi tạo Hội Thánh: " + error.message },
      { status: 500 }
    );
  }
}

// PUT /api/superadmin/churches (Update any church)
export async function PUT(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const body = await req.json();
    const { churchId, slug, ...updates } = body;

    const query: any = {};
    if (churchId) query._id = churchId;
    else if (slug) query.slug = slug;
    else {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp churchId hoặc slug để cập nhật" },
        { status: 400 }
      );
    }

    const church = await Church.findOne(query);
    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh cần cập nhật" },
        { status: 404 }
      );
    }

    // Apply allowed updates
    if (updates.name !== undefined) church.name = updates.name.trim();
    if (updates.denomination !== undefined) church.denomination = updates.denomination.trim();
    if (updates.address !== undefined) church.address = updates.address.trim();
    if (updates.streamKey !== undefined) church.streamKey = updates.streamKey.trim();
    if (updates.liveSchedule !== undefined) church.liveSchedule = updates.liveSchedule.trim();
    if (updates.isActive !== undefined) church.isActive = Boolean(updates.isActive);

    if (updates.profileConfig) {
      church.profileConfig = {
        ...church.profileConfig,
        ...updates.profileConfig,
      };
    }

    if (updates.bankingConfig) {
      church.bankingConfig = {
        ...church.bankingConfig,
        ...updates.bankingConfig,
      };
    }

    if (updates.currentService) {
      church.currentService = {
        ...church.currentService,
        ...updates.currentService,
      };
    }

    await church.save();

    return NextResponse.json({
      success: true,
      message: `Đã cập nhật thông tin Hội Thánh '${church.name}'`,
      data: church,
    });
  } catch (error: any) {
    console.error("PUT /api/superadmin/churches error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi cập nhật Hội Thánh: " + error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/superadmin/churches (Delete a church and optional clean up)
export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireSuperadmin(req);
  if (errorResponse) return errorResponse;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const churchId = searchParams.get("id");

    const query: any = {};
    if (churchId) query._id = churchId;
    else if (slug) query.slug = slug;
    else {
      return NextResponse.json(
        { success: false, error: "Thiếu id hoặc slug Hội Thánh cần xóa" },
        { status: 400 }
      );
    }

    const church = await Church.findOne(query);
    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh để xóa" },
        { status: 404 }
      );
    }

    const churchSlug = church.slug;
    await Church.deleteOne({ _id: church._id });

    // Also delete associated posts and users if requested
    const deleteContent = searchParams.get("deleteContent") === "true";
    if (deleteContent) {
      await Post.deleteMany({ churchSlug });
      await User.deleteMany({ churchSlug });
    }

    return NextResponse.json({
      success: true,
      message: `Đã xóa vĩnh viễn Hội Thánh '${church.name}' (/${churchSlug})`,
    });
  } catch (error: any) {
    console.error("DELETE /api/superadmin/churches error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi xóa Hội Thánh: " + error.message },
      { status: 500 }
    );
  }
}
