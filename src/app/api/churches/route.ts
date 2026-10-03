import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const denomination = searchParams.get("denomination") || "";

    const query: any = { isActive: true };

    if (search.trim()) {
      query.name = { $regex: search.trim(), $options: "i" };
    }

    if (denomination && denomination !== "all" && denomination !== "Tất cả") {
      query.denomination = denomination;
    }

    const churches = await Church.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: churches.length,
      data: churches,
    });
  } catch (error: any) {
    console.error("Lỗi lấy danh sách Hội Thánh:", error);
    return NextResponse.json(
      { error: "Không thể lấy danh sách Hội Thánh", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      slug,
      denomination,
      address,
      streamKey,
      themeConfig,
      bankingConfig,
      liveSchedule,
    } = body;

    if (!name || !slug || !streamKey) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên Hội Thánh, mã slug và stream key" },
        { status: 400 }
      );
    }

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    const existingChurch = await Church.findOne({
      $or: [{ slug: formattedSlug }, { streamKey: streamKey.trim() }],
    });

    if (existingChurch) {
      return NextResponse.json(
        { error: "Mã định danh slug hoặc stream key đã tồn tại trên hệ thống" },
        { status: 409 }
      );
    }

    const newChurch = await Church.create({
      name: name.trim(),
      slug: formattedSlug,
      denomination: denomination || "Tin Lành Việt Nam",
      address: address || "Việt Nam",
      streamKey: streamKey.trim(),
      themeConfig: themeConfig || { accentColor: "#c5a059", logoUrl: "" },
      bankingConfig: bankingConfig || {
        bankName: "MB Bank",
        accountNumber: "0386888999",
        accountHolder: "HOI THANH TIN LANH",
        branch: "Chi nhánh TP. Hồ Chí Minh",
      },
      liveSchedule: liveSchedule || "Chúa Nhật, 09:00 - 11:15",
      isActive: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đăng ký Hội Thánh mới thành công!",
        data: newChurch,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Lỗi đăng ký Hội Thánh:", error);
    return NextResponse.json(
      { error: "Không thể đăng ký Hội Thánh", details: error.message },
      { status: 500 }
    );
  }
}
