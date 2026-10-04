import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }

    await connectDB();
    const targetSlug = req.nextUrl.searchParams.get("slug");
    let church = null;
    if (authSession.role === "superadmin" && targetSlug) {
      church = await Church.findOne({ slug: targetSlug.toLowerCase().trim() });
    }
    if (!church && authSession.churchId) {
      church = await Church.findById(authSession.churchId);
    }
    if (!church && authSession.churchSlug) {
      church = await Church.findOne({ slug: authSession.churchSlug.toLowerCase().trim() });
    }

    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh tương ứng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: church,
    });
  } catch (error: any) {
    console.error("Lỗi lấy thông tin quản trị Hội Thánh:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi hệ thống" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authSession = await getAuthUser(req);
    if (!authSession) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập quản trị" },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await req.json();

    const {
      name,
      denomination,
      address,
      liveSchedule,
      currentService,
      bankingConfig,
      themeConfig,
      churchSlug,
      churchId,
    } = body;

    let church = null;
    if (authSession.role === "superadmin") {
      const targetSlug = churchSlug || req.nextUrl.searchParams.get("slug");
      const targetId = churchId || body._id || body.id;
      if (targetSlug) {
        church = await Church.findOne({ slug: targetSlug.toLowerCase().trim() });
      } else if (targetId) {
        church = await Church.findById(targetId);
      }
      if (!church && authSession.churchId) {
        church = await Church.findById(authSession.churchId);
      }
    } else {
      if (authSession.churchId) {
        church = await Church.findById(authSession.churchId);
      } else if (authSession.churchSlug) {
        church = await Church.findOne({ slug: authSession.churchSlug.toLowerCase().trim() });
      }
    }

    if (!church) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy Hội Thánh tương ứng" },
        { status: 404 }
      );
    }

    if (name) church.name = name.trim();
    if (denomination) church.denomination = denomination.trim();
    if (address) church.address = address.trim();
    if (liveSchedule) church.liveSchedule = liveSchedule.trim();

    if (currentService) {
      church.currentService = {
        title: currentService.title ?? church.currentService?.title ?? "",
        speaker: currentService.speaker ?? church.currentService?.speaker ?? "",
        speakerTitle:
          currentService.speakerTitle ??
          church.currentService?.speakerTitle ??
          "Diễn giả",
        scriptureReference:
          currentService.scriptureReference ??
          church.currentService?.scriptureReference ??
          "",
        welcomeMessage:
          currentService.welcomeMessage ??
          church.currentService?.welcomeMessage ??
          "",
        isLive: currentService.isLive ?? church.currentService?.isLive ?? false,
        viewersCount:
          currentService.viewersCount ??
          church.currentService?.viewersCount ??
          0,
      };
    }

    if (body.profileConfig) {
      church.profileConfig = {
        coverImageUrl:
          body.profileConfig.coverImageUrl ?? church.profileConfig?.coverImageUrl,
        avatarUrl: body.profileConfig.avatarUrl ?? church.profileConfig?.avatarUrl,
        about: body.profileConfig.about ?? church.profileConfig?.about,
        leadPastor:
          body.profileConfig.leadPastor ?? church.profileConfig?.leadPastor,
        contactPhone:
          body.profileConfig.contactPhone ?? church.profileConfig?.contactPhone,
        contactEmail:
          body.profileConfig.contactEmail ?? church.profileConfig?.contactEmail,
        slogan: body.profileConfig.slogan ?? church.profileConfig?.slogan,
      };
    }

    if (bankingConfig) {
      church.bankingConfig = {
        bankName: bankingConfig.bankName ?? church.bankingConfig?.bankName ?? "MB Bank",
        accountNumber:
          bankingConfig.accountNumber ??
          church.bankingConfig?.accountNumber ??
          "0386888999",
        accountHolder:
          bankingConfig.accountHolder ??
          church.bankingConfig?.accountHolder ??
          "HOI THANH TIN LANH",
        branch: bankingConfig.branch ?? church.bankingConfig?.branch ?? "Việt Nam",
      };
    }

    if (themeConfig) {
      church.themeConfig = {
        accentColor:
          themeConfig.accentColor ?? church.themeConfig?.accentColor ?? "#c5a059",
        logoUrl: themeConfig.logoUrl ?? church.themeConfig?.logoUrl ?? "",
      };
    }

    await church.save();

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình Hội Thánh thành công!",
      data: church,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật cấu hình Hội Thánh:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi cập nhật dữ liệu" },
      { status: 500 }
    );
  }
}
