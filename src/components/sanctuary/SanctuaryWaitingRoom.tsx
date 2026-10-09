"use client";

import React from "react";
import { useWorship } from "@/context/WorshipContext";
import {
  Church as ChurchIcon,
  Clock,
  Radio,
  BookOpen,
  HeartHandshake,
  CreditCard,
  Sparkles,
  Calendar,
} from "lucide-react";

export const SanctuaryWaitingRoom: React.FC = () => {
  const { church, openModal } = useWorship();

  const serviceTitle =
    church.currentService?.title || `Lễ Thờ Phượng Trực Tuyến — ${church.name}`;
  const speaker =
    church.currentService?.speaker ||
    church.profileConfig?.leadPastor ||
    "Mục sư Quản Nhiệm";
  const speakerTitle = church.currentService?.speakerTitle || "Diễn giả";
  const scripture =
    church.currentService?.scriptureReference || "Lời Chúa Hôm Nay";
  const welcomeMessage =
    church.currentService?.welcomeMessage ||
    church.profileConfig?.about ||
    `Chào mừng quý con cái Chúa và thân hữu tham dự phòng thờ phượng trực tuyến của ${church.name}. Ban Kỹ Thuật đang hoàn tất khâu chuẩn bị để phát sóng.`;

  return (
    <div className="relative w-full min-h-[290px] sm:min-h-0 sm:aspect-video bg-[#111317] rounded-lg overflow-hidden border border-white/[0.08] shadow-2xl flex flex-col justify-between p-3.5 sm:p-6 md:p-8 select-none">
      {/* Background Sacred Ambient Lighting */}
      <div className="absolute inset-0 bg-radial-gradient from-[#c5a059]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Top Bar inside Waiting Room */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        {/* Pulsing Status Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 border border-amber-500/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="text-amber-300 text-[10px] sm:text-[11px] font-serif font-bold uppercase tracking-wider">
            Phòng Chờ (Chưa Lên Sóng)
          </span>
        </div>

        {/* Church Schedule */}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-stone-400 bg-black/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/[0.05]">
          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#c5a059]" />
          <span className="truncate max-w-[150px] sm:max-w-none">{church.liveSchedule || "Chúa Nhật, 09:00"}</span>
        </div>
      </div>

      {/* 2. Center Content: Sacred Altar & Sermon Information */}
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-2 sm:space-y-3.5 py-2 sm:py-4">
        {/* Stylized Cross / Church Icon */}
        <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-stone-900 border border-[#c5a059]/40 flex items-center justify-center mx-auto text-[#c5a059] shadow-candle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 sm:w-7 sm:h-7"
          >
            <path d="M12 2v20" />
            <path d="M6 7h12" />
          </svg>
        </div>

        <div>
          <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-[#c5a059] font-serif font-semibold">
            {church.name}
          </span>
          <h2 className="font-serif text-base sm:text-2xl font-bold text-stone-100 tracking-tight mt-0.5 sm:mt-1 line-clamp-2">
            {serviceTitle}
          </h2>
        </div>

        {/* Sermon Details */}
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-4 text-[11px] sm:text-xs text-stone-300 bg-stone-900/80 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-stone-800">
          <span className="flex items-center gap-1">
            <span className="text-stone-500">{speakerTitle}:</span>
            <strong className="text-stone-200 font-serif">{speaker}</strong>
          </span>
          <span className="text-stone-600 hidden sm:inline">•</span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
            <span className="text-stone-500">Kinh Thánh:</span>
            <strong className="text-[#c5a059] font-serif">{scripture}</strong>
          </span>
        </div>

        {/* Pastoral Welcome Message */}
        <p className="text-[11px] sm:text-sm text-stone-400 font-sans leading-relaxed italic max-w-xl mx-auto px-2 sm:px-4 line-clamp-2 sm:line-clamp-none">
          &ldquo;{welcomeMessage}&rdquo;
        </p>
      </div>

      {/* 3. Bottom Status Bar & Quick Spiritual Preparation */}
      <div className="relative z-10 pt-2 sm:pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs">
        {/* Realtime Sync Radar Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-stone-400 text-center sm:text-left">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-[11px]">
            Hệ thống kết nối trực tiếp • Tự động phát sóng khi Mục sư bắt đầu.
          </span>
        </div>

        {/* Quick actions while waiting */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={() => openModal("prayer")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 border border-white/10 hover:border-[#c5a059]/40 text-[11px] sm:text-xs transition-colors cursor-pointer"
          >
            <HeartHandshake className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Cầu Nguyện Kín</span>
          </button>

          <button
            onClick={() => openModal("giving")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded bg-stone-850 hover:bg-stone-800 text-stone-300 border border-white/10 hover:border-[#c5a059]/40 text-[11px] sm:text-xs transition-colors cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>Dâng Hiến VietQR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default SanctuaryWaitingRoom;
