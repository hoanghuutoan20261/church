"use client";

import React from "react";
import Link from "next/link";
import { useWorship, FontSizeOption } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import { Eye, EyeOff, Type, ArrowLeft } from "lucide-react";

export const SanctuaryHeader: React.FC = () => {
  const { church, isFocusMode, toggleFocusMode, fontSize, setFontSize } = useWorship();

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
    <header className="w-full bg-sanctuary-950 border-b border-white/[0.08] px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4 select-none z-30">
      {/* Left: Back to Directory & Church Dignified Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="p-1.5 rounded-md bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-400 hover:text-gold-300 border border-white/[0.08] transition-colors shrink-0"
          title="Quay lại danh sách các Hội Thánh"
          aria-label="Danh sách Hội Thánh"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="w-9 h-9 rounded-md bg-sanctuary-850 border border-gold-400/30 flex items-center justify-center shrink-0 shadow-sm text-gold-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-gold-400"
          >
            <path d="M12 2v20" />
            <path d="M6 7h12" />
          </svg>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-serif tracking-wider uppercase text-xs font-semibold text-gold-400 truncate">
              {church.name}
            </span>
            <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-sanctuary-600" />
            <span className="hidden sm:inline-block text-[11px] text-sanctuary-400 tracking-wide font-sans truncate">
              {church.denomination || "Trực Tuyến"}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-serif font-medium text-sanctuary-100 tracking-normal truncate">
            {worshipData.serviceTitle} —{" "}
            <span className="text-sanctuary-300 italic">
              &ldquo;{worshipData.theme}&rdquo;
            </span>
          </h1>
        </div>
      </div>

      {/* Center: Liturgical Stage Progress (Desktop) */}
      <div className="hidden xl:flex items-center gap-2 bg-sanctuary-900/90 border border-white/[0.06] rounded-md px-3 py-1">
        <span className="text-[11px] uppercase tracking-wider text-sanctuary-400 mr-1 font-medium">
          Tiến trình:
        </span>
        <div className="flex items-center gap-1.5 text-xs">
          {worshipData.stages.map((stage, idx) => {
            const isCurrent = stage.status === "current";
            const isDone = stage.status === "completed";
            return (
              <React.Fragment key={stage.id}>
                {idx > 0 && <span className="text-sanctuary-700">›</span>}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                    isCurrent
                      ? "bg-gold-400/15 text-gold-300 border border-gold-400/40"
                      : isDone
                      ? "text-sanctuary-500 line-through opacity-75"
                      : "text-sanctuary-400"
                  }`}
                  title={`${stage.time} - ${stage.name}`}
                >
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  )}
                  <span>{stage.name}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Right: Accessibility & Focus Mode Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleNextFontSize}
          aria-label={getFontSizeLabel(fontSize)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border transition-all ${
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
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
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
              <span className="hidden sm:inline">Chiêm Niệm (Focus)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
