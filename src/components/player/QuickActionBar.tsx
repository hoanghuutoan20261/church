"use client";

import React, { useState } from "react";
import { HeartHandshake, QrCode, BookOpen, Share2, Check } from "lucide-react";
import { CrossIcon } from "@/components/common/CrossIcon";
import { useWorship } from "@/context/WorshipContext";

export const QuickActionBar: React.FC = () => {
  const { openModal } = useWorship();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="w-full bg-sanctuary-950 border border-white/[0.08] rounded-lg p-2.5 sm:p-3.5 my-2.5 sm:my-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-2.5">
        {/* Primary Pastoral CTAs */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          {/* Button 1: Cần Cầu Nguyện (Warm Accent Bronze/Gold) */}
          <button
            onClick={() => openModal("prayer")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md bg-sanctuary-850 hover:bg-gold-400/10 text-gold-300 border border-gold-400/40 hover:border-gold-400 transition-all font-serif text-[11px] sm:text-sm font-medium tracking-wide shadow-sm cursor-pointer"
            title="Gửi nan đề cầu nguyện riêng đến Ban Mục Vụ"
          >
            <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
            <span className="truncate">Cầu Nguyện</span>
          </button>

          {/* Button 2: Tiếp Nhận Chúa (Dignified Warm Wine/Sacrament Accent CTA) */}
          <button
            onClick={() => openModal("salvation")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md bg-sacrament/25 hover:bg-sacrament/40 text-amber-100 border border-sacrament-light/50 transition-all font-serif text-[11px] sm:text-sm font-medium tracking-wide shadow-sm cursor-pointer"
            title="Dành cho thân hữu muốn tìm hiểu hoặc tiếp nhận Chúa Giê-xu"
          >
            <CrossIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200 shrink-0" />
            <span className="truncate">Tin Nhận Chúa</span>
          </button>

          {/* Button 3: Dâng Hiến (Clean VietQR Modal) */}
          <button
            onClick={() => openModal("giving")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-md bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-200 hover:text-white border border-white/10 hover:border-white/20 transition-all text-[11px] sm:text-sm font-medium tracking-wide cursor-pointer"
            title="Mở mã VietQR dâng hiến cho Hội Thánh"
          >
            <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gold-400 shrink-0" />
            <span className="truncate">Dâng Hiến</span>
          </button>
        </div>

        {/* Secondary Pastoral Tools */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          {/* Sheet / Hymnal */}
          <button
            onClick={() => openModal("hymnal")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-sanctuary-900 hover:bg-sanctuary-850 text-sanctuary-300 hover:text-sanctuary-100 border border-white/[0.08] text-[11px] sm:text-xs transition-colors cursor-pointer"
            title="Xem lời bài hát Thánh ca và thứ tự buổi lễ"
          >
            <BookOpen className="w-3.5 h-3.5 text-sanctuary-400 shrink-0" />
            <span>Thánh Ca & Thứ Tự</span>
          </button>

          {/* Share Service */}
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md bg-sanctuary-900 hover:bg-sanctuary-850 text-sanctuary-300 hover:text-sanctuary-100 border border-white/[0.08] text-[11px] sm:text-xs transition-colors cursor-pointer"
            title="Sao chép liên kết phòng thờ phượng"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-emerald-300 font-medium">Đã sao chép</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-sanctuary-400 shrink-0" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
