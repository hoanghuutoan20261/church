import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { ChatMessage } from "@/models/ChatMessage";

export const dynamic = "force-dynamic";

const initialChurchesData = [
  {
    name: "Hội Thánh Tin Lành Lời Ban Sự Sống",
    slug: "loibansusong",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    address: "Số 123 Đường Nguyễn Tri Phương, Quận 10, TP. Hồ Chí Minh",
    streamKey: "lbs-sunday",
    themeConfig: {
      accentColor: "#c5a059",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng TMCP Quân Đội (MB Bank)",
      accountNumber: "0386888999",
      accountHolder: "HOI THANH TIN LANH LOI BAN SU SONG",
      branch: "Chi nhánh TP. Hồ Chí Minh",
    },
    liveSchedule: "Chúa Nhật: Lễ 1 (07:30) • Lễ 2 (09:15) • Lễ 3 (18:30)",
    isActive: true,
  },
  {
    name: "Hội Thánh Tin Lành Ân Điển",
    slug: "andien",
    denomination: "Hội Thánh Báp-tít Việt Nam",
    address: "Số 45 Đường Trần Phú, Quận Hải Châu, TP. Đà Nẵng",
    streamKey: "andien-sunday",
    themeConfig: {
      accentColor: "#d97706",
      logoUrl: "",
    },
    bankingConfig: {
      bankName: "Ngân hàng Ngoại Thương Việt Nam (Vietcombank)",
      accountNumber: "0071001234567",
      accountHolder: "HOI THANH TIN LANH AN DIEN",
      branch: "Chi nhánh Đà Nẵng",
    },
    liveSchedule: "Chúa Nhật, 08:30 - 10:45",
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const count = await Church.countDocuments();
    if (count === 0) {
      await Church.insertMany(initialChurchesData);
      return NextResponse.json({
        success: true,
        message: "Đã khởi tạo thành công 2 Hội Thánh mẫu vào MongoDB!",
        count: initialChurchesData.length,
      });
    }

    // Ensure our 2 core churches exist
    for (const item of initialChurchesData) {
      const existing = await Church.findOne({ slug: item.slug });
      if (!existing) {
        await Church.create(item);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cơ sở dữ liệu Hội Thánh đã sẵn sàng.",
      count: await Church.countDocuments(),
    });
  } catch (error: any) {
    console.error("Lỗi seed dữ liệu:", error);
    return NextResponse.json(
      { error: "Không thể seed dữ liệu", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
