import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { User } from "@/models/User";
import { hashPassword, signToken, setAuthCookie } from "@/lib/auth";
import { getDefaultChurchAvatar } from "@/lib/churchAvatar";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      churchName,
      slug,
      denomination = "Hội Thánh Tin Lành Việt Nam",
      address = "Việt Nam",
      streamKey,
      adminName,
      email,
      password,
      phone = "",
      role = "pastor",
      bankName = "MB Bank",
      accountNumber = "0386888999",
      accountHolder = "HOI THANH TIN LANH",
      branch = "Việt Nam",
    } = body;

    // Validate required fields
    if (!churchName || !churchName.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên Hội Thánh" },
        { status: 400 }
      );
    }

    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập mã định danh (slug)" },
        { status: 400 }
      );
    }

    if (!adminName || !adminName.trim()) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập tên người quản trị (Mục sư/Kỹ thuật)" },
        { status: 400 }
      );
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập email hợp lệ" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Mật khẩu tối thiểu phải từ 6 ký tự" },
        { status: 400 }
      );
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");
    const cleanEmail = email.toLowerCase().trim();
    const finalStreamKey =
      (streamKey && streamKey.trim()) || `${cleanSlug}-live`;

    // Check if slug or streamKey already exists
    const existingChurch = await Church.findOne({
      $or: [{ slug: cleanSlug }, { streamKey: finalStreamKey }],
    });

    if (existingChurch) {
      return NextResponse.json(
        {
          success: false,
          error:
            existingChurch.slug === cleanSlug
              ? "Mã đường dẫn (slug) này đã được sử dụng. Xin chọn tên khác."
              : "Khóa luồng phát (stream key) này đã tồn tại trên hệ thống.",
        },
        { status: 409 }
      );
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email này đã được đăng ký tài khoản. Vui lòng đăng nhập.",
        },
        { status: 409 }
      );
    }

    // 1. Create Church
    const newChurch = await Church.create({
      name: churchName.trim(),
      slug: cleanSlug,
      denomination: denomination.trim(),
      address: address.trim(),
      streamKey: finalStreamKey,
      themeConfig: {
        accentColor: "#c5a059",
        logoUrl: "",
      },
      bankingConfig: {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        branch: branch.trim(),
      },
      profileConfig: {
        coverImageUrl:
          "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
        avatarUrl: getDefaultChurchAvatar(churchName.trim(), slug.trim()),
        slogan: "Hiệp Một — Yêu Thương — Phụng Sự",
        about: `Chào mừng quý con cái Chúa và thân hữu đến với trang thông tin của ${churchName.trim()}. Nơi cùng nhau thờ phượng Chúa, gây dựng đức tin và kết nối yêu thương trong Đấng Christ.`,
        leadPastor: role === "pastor" ? adminName.trim() : "Mục sư Quản Nhiệm",
        contactEmail: cleanEmail,
        contactPhone: phone.trim(),
      },
      currentService: {
        title: `Lễ Thờ Phượng Chúa Nhật — ${churchName.trim()}`,
        speaker: adminName.trim(),
        speakerTitle: role === "pastor" ? "Mục sư Quản Nhiệm" : "Diễn giả",
        scriptureReference: "Thi Thiên 23",
        welcomeMessage:
          "Chào mừng quý tôi con Chúa cùng thân hữu tham dự chương trình thờ phượng trực tuyến sáng nay. Nguyện xin ơn phước dư dật của Chúa tuôn đổ trên mỗi gia đình.",
        isLive: false,
        viewersCount: 0,
      },
      liveSchedule: "Chúa Nhật, 09:00 - 11:15",
      isActive: true,
    });

    // 2. Hash password and create User
    const passwordHash = await hashPassword(password);
    const newUser = await User.create({
      fullName: adminName.trim(),
      email: cleanEmail,
      passwordHash,
      phone: phone.trim(),
      role: role === "tech_leader" ? "tech_leader" : "pastor",
      churchSlug: cleanSlug,
      churchId: newChurch._id,
      isActive: true,
      lastLoginAt: new Date(),
    });

    // 3. Issue Token & Cookie
    const token = signToken({
      userId: (newUser._id as any).toString(),
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      churchSlug: newChurch.slug,
      churchId: (newChurch._id as any).toString(),
    });

    const response = NextResponse.json({
      success: true,
      message: "Đăng ký Hội Thánh và tài khoản quản trị thành công!",
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
        },
        church: {
          id: newChurch._id,
          name: newChurch.name,
          slug: newChurch.slug,
          streamKey: newChurch.streamKey,
        },
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Lỗi đăng ký Hội Thánh:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống khi đăng ký" },
      { status: 500 }
    );
  }
}
