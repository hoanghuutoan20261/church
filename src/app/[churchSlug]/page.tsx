import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongoose";
import { Church } from "@/models/Church";
import { SanctuaryClient } from "./SanctuaryClient";
import { CurrentChurchInfo } from "@/context/WorshipContext";
import { ArrowLeft, Church as ChurchIcon, HelpCircle } from "lucide-react";
import { buildHlsStreamUrl } from "@/lib/streamConfig";

interface PageProps {
  params: {
    churchSlug: string;
  };
  searchParams?: {
    view?: string;
  };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.churchSlug.toLowerCase().trim();

  try {
    await connectDB();
    const church = await Church.findOne({ slug, isActive: true }).lean();

    if (!church) {
      return {
        title: "Không Tìm Thấy Hội Thánh | Nền Tảng Thờ Phượng Trực Tuyến",
      };
    }

    return {
      title: `${church.name} | Thờ Phượng Trực Tuyến`,
      description: `Phòng thờ phượng trực tuyến chính thức của ${church.name} (${church.denomination}). Tham gia hiệp ý thờ phượng, nghe giảng và dâng lời cầu thay.`,
    };
  } catch {
    return {
      title: "Thờ Phượng Trực Tuyến",
    };
  }
}

export default async function ChurchSanctuaryPage({ params, searchParams }: PageProps) {
  const slug = params.churchSlug.toLowerCase().trim();

  await connectDB();
  const churchDoc = await Church.findOne({ slug, isActive: true }).lean();

  if (!churchDoc) {
    return (
      <div className="min-h-screen bg-sanctuary-950 text-sanctuary-100 flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-full bg-sanctuary-850 border border-gold-400/30 flex items-center justify-center text-gold-400 mb-5 shadow-candle">
          <ChurchIcon className="w-8 h-8" />
        </div>

        <span className="text-[11px] uppercase tracking-widest text-gold-400 font-serif font-semibold mb-2">
          Thông Báo Mục Vụ
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-sanctuary-100 max-w-md leading-tight mb-3">
          Không Tìm Thấy Phòng Thờ Phượng
        </h1>

        <p className="text-xs sm:text-sm text-sanctuary-300 max-w-md leading-relaxed mb-6 font-sans">
          Hội Thánh với mã định danh{" "}
          <code className="text-gold-300 font-mono bg-sanctuary-850 px-2 py-0.5 rounded border border-white/10">
            /{slug}
          </code>{" "}
          hiện chưa được đăng ký trên hệ thống hoặc đã tạm dừng chương trình trực tuyến.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-semibold text-xs sm:text-sm transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về Cổng Kết Nối Các Hội Thánh</span>
          </Link>
        </div>

        <div className="mt-12 text-[11px] text-sanctuary-500 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Nếu quý vị là quản nhiệm Hội Thánh, vui lòng liên hệ Ban Kỹ Thuật để đăng ký.</span>
        </div>
      </div>
    );
  }

  // Map database document to clean client-ready format
  const churchData: CurrentChurchInfo = {
    _id: (churchDoc._id as any).toString(),
    name: churchDoc.name,
    slug: churchDoc.slug,
    denomination: churchDoc.denomination || "Tin Lành Việt Nam",
    address: churchDoc.address || "Việt Nam",
    streamKey: churchDoc.streamKey,
    streamType: (churchDoc as any).streamType || "youtube",
    streamUrl:
      (churchDoc as any).streamUrl?.trim() ||
      buildHlsStreamUrl(churchDoc.streamKey),
    themeConfig: churchDoc.themeConfig,
    bankingConfig: {
      bankName: churchDoc.bankingConfig?.bankName || "MB Bank",
      accountNumber: churchDoc.bankingConfig?.accountNumber || "0386888999",
      accountHolder:
        churchDoc.bankingConfig?.accountHolder || "HOI THANH TIN LANH LOI BAN SU SONG",
      branch: churchDoc.bankingConfig?.branch || "Chi nhánh TP. Hồ Chí Minh",
    },
    profileConfig: churchDoc.profileConfig,
    liveSchedule: churchDoc.liveSchedule || "Chúa Nhật, 09:00 - 11:15",
    worshipSchedules: churchDoc.worshipSchedules && churchDoc.worshipSchedules.length > 0
      ? (churchDoc.worshipSchedules as any[]).map((s) => ({
          id: s._id ? s._id.toString() : s.id,
          title: s.title || "Lễ Thờ Phượng",
          dayOfWeek: s.dayOfWeek || "Chúa Nhật",
          time: s.time || "09:00",
          type: s.type || "main",
          description: s.description || "",
        }))
      : undefined,
    currentService: churchDoc.currentService
      ? {
          title: churchDoc.currentService.title,
          speaker: churchDoc.currentService.speaker,
          speakerTitle: churchDoc.currentService.speakerTitle || "Diễn giả",
          scriptureReference: churchDoc.currentService.scriptureReference,
          welcomeMessage: churchDoc.currentService.welcomeMessage,
          isLive: Boolean(churchDoc.currentService.isLive),
          viewersCount: churchDoc.currentService.viewersCount || 0,
        }
      : undefined,
  };

  const initialView = searchParams?.view === "wall" ? "wall" : "sanctuary";

  return <SanctuaryClient church={churchData} initialView={initialView} />;
}
