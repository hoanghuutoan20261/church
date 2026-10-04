"use client";

import React from "react";
import Link from "next/link";
import { useWorship, FontSizeOption } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import { Eye, EyeOff, Type, ArrowLeft, Radio, Newspaper } from "lucide-react";

export const SanctuaryHeader: React.FC = () => {
  const {
    church,
    isFocusMode,
    toggleFocusMode,
    fontSize,
    setFontSize,
    activeView,
    setActiveView,
  } = useWorship();

  const handleNextFontSize = () => {
    if (fontSize === "normal") setFontSize("large");
    else if (fontSize === "large") setFontSize("xlarge");
    else setFontSize("normal");
  };

  const getFontSizeLabel = (size: FontSizeOption) => {
    switch (size) {
      case "normal":
        return "Cỡ chữ: Chuẩn";
      case "large":
        return "Cỡ chữ: Lớn (+15%)";
      case "xlarge":
        return "Cỡ chữ: Rất Lớn (+25%)";
    }
  };

  return (
    <header className="w-full bg-sanctuary-950 border-b border-white/[0.08] px-2.5 sm:px-4 lg:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 select-none z-30">
      {/* Left: Back to Directory & Church Dignified Identity */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Link
          href="/"
          className="p-1.5 rounded-md bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-400 hover:text-gold-300 border border-white/[0.08] transition-colors shrink-0"
          title="Quay lại danh sách các Hội Thánh"
          aria-label="Danh sách Hội Thánh"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-sanctuary-850 border border-gold-400/30 flex items-center justify-center shrink-0 shadow-sm text-gold-400 hidden xs:flex">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400"
          >
            <path d="M12 2v20" />
            <path d="M6 7h12" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-serif tracking-wider uppercase text-[11px] sm:text-xs font-semibold text-gold-400 truncate">
              {church.name}
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-sanctuary-600 shrink-0" />
            <span className="hidden sm:inline-block text-[11px] text-sanctuary-400 tracking-wide font-sans truncate">
              {church.denomination || "Trực Tuyến"}
            </span>
          </div>
          <h1 className="text-xs sm:text-sm font-serif font-medium text-sanctuary-100 tracking-normal truncate">
            {church.currentService?.title ||
              `Lễ Thờ Phượng Trực Tuyến — ${church.name}`}
          </h1>
        </div>
      </div>

      {/* Center: Mode Switcher (Phòng Thờ Phượng vs Tường Hội Thánh) */}
      <div className="flex items-center gap-1 bg-sanctuary-850 p-1 rounded-lg border border-white/[0.08] shadow-inner shrink-0">
        <button
          onClick={() => setActiveView("wall")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-serif transition-all cursor-pointer ${
            activeView === "wall"
              ? "bg-[#c5a059] text-stone-950 font-bold shadow-sm"
              : "text-sanctuary-300 hover:text-stone-100 hover:bg-sanctuary-800"
          }`}
          title="Xem trang giới thiệu và bản tin mục vụ của Hội Thánh"
        >
          <Newspaper className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tường & Bản Tin</span>
          <span className="sm:hidden">Tường</span>
        </button>

        <button
          onClick={() => setActiveView("sanctuary")}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-[11px] sm:text-xs font-serif transition-all cursor-pointer ${
            activeView === "sanctuary"
              ? "bg-sanctuary-950 text-gold-300 font-bold border border-gold-400/40 shadow-sm"
              : "text-sanctuary-300 hover:text-stone-100 hover:bg-sanctuary-800"
          }`}
          title="Vào phòng thờ phượng và nghe giảng trực tuyến"
        >
          {church.currentService?.isLive ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          ) : (
            <Radio className="w-3.5 h-3.5 text-gold-400" />
          )}
          <span className="hidden sm:inline">Phòng Thờ Phượng</span>
          <span className="sm:hidden">Live</span>
        </button>
      </div>

      {/* Right: Accessibility & Focus Mode Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Link
          href="/admin"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-gold-300 border border-white/[0.08] text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          title="Bảng điều khiển quản trị mục vụ Hội Thánh"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
          <span className="hidden md:inline">Quản Trị</span>
        </Link>

        <button
          onClick={handleNextFontSize}
          aria-label={getFontSizeLabel(fontSize)}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 text-xs rounded-md border transition-all ${
            fontSize !== "normal"
              ? "bg-gold-400/15 border-gold-400/40 text-gold-300"
              : "bg-sanctuary-850 border-white/[0.08] text-sanctuary-300 hover:text-sanctuary-100 hover:border-white/20"
          }`}
          title="Tăng giảm kích cỡ chữ cho người cao tuổi"
        >
          <Type className="w-3.5 h-3.5 text-gold-400/90" />
          <span className="hidden md:inline">{getFontSizeLabel(fontSize)}</span>
          <span className="md:hidden font-mono uppercase text-[10px]">
            {fontSize === "normal" ? "A" : fontSize === "large" ? "A+" : "A++"}
          </span>
        </button>

        <button
          onClick={toggleFocusMode}
          className={`flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-3 sm:py-1.5 text-xs font-medium rounded-md border transition-all cursor-pointer ${
            isFocusMode
              ? "bg-gold-400 text-sanctuary-950 border-gold-300 shadow-candle"
              : "bg-sanctuary-850 border-white/[0.08] text-sanctuary-200 hover:text-white hover:border-white/20"
          }`}
          title={
            isFocusMode
              ? "Trở lại giao diện đầy đủ"
              : "Bật chế độ Chiêm Niệm (Ẩn khung trò chuyện để tập trung nghe giảng)"
          }
        >
          {isFocusMode ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát Chiêm Niệm</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-gold-400" />
              <span className="hidden sm:inline">Chiêm Niệm</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
