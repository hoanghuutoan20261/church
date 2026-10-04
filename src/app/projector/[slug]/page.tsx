"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import {
  BookOpen,
  Music2,
  Maximize2,
  Minimize2,
  Tv,
  Sparkles,
  Wifi,
  WifiOff,
  Sun,
  Moon,
} from "lucide-react";

interface LiveLyricsPayload {
  isEnabled: boolean;
  songId?: string;
  songNumber?: number | null;
  songTitle?: string;
  originalTitle?: string;
  stanzaIndex?: number;
  stanzaLabel?: string;
  lines?: string[];
  displayType?: "hymn" | "scripture";
  referenceTranslation?: string;
  layoutMode?: "lowerthird" | "subtitle" | "fullscreen";
  themeStyle?: "gold" | "white" | "teal" | "amber";
  updatedAt?: string;
}

export default function ProjectorDisplayPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";

  const [data, setData] = useState<LiveLyricsPayload | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);
  const [bgStyle, setBgStyle] = useState<"sanctuary" | "pureblack" | "transparent">("sanctuary");

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Poll live lyrics every 750ms for low-latency projection sync
  useEffect(() => {
    if (!slug) return;
    let isCancelled = false;

    const fetchLive = async () => {
      try {
        const res = await fetch(`/api/lyrics?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.success) {
            setData(json.liveLyrics);
            setIsConnected(true);
          }
        } else {
          if (!isCancelled) setIsConnected(false);
        }
      } catch {
        if (!isCancelled) setIsConnected(false);
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 750);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [slug]);

  // Fullscreen detection
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Auto-hide controls when mouse is idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2800);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const isScripture = data?.displayType === "scripture";
  const isEnabled = Boolean(data?.isEnabled && data?.lines && data.lines.length > 0);
  const layout = data?.layoutMode || "fullscreen";

  // Color theme mapping
  const getThemeColors = () => {
    switch (data?.themeStyle) {
      case "white":
        return {
          header: "text-white/80",
          border: "border-white/20",
          badge: "bg-white/10 text-white",
          text: "text-white",
          glow: "drop-shadow-[0_2px_12px_rgba(255,255,255,0.25)]",
        };
      case "teal":
        return {
          header: "text-teal-300",
          border: "border-teal-400/30",
          badge: "bg-teal-500/15 text-teal-300",
          text: "text-teal-50",
          glow: "drop-shadow-[0_2px_12px_rgba(45,212,191,0.3)]",
        };
      case "amber":
        return {
          header: "text-amber-400",
          border: "border-amber-400/40",
          badge: "bg-amber-500/15 text-amber-300",
          text: "text-amber-50",
          glow: "drop-shadow-[0_2px_12px_rgba(251,191,36,0.3)]",
        };
      default: // gold
        return {
          header: "text-[#e5c07b]",
          border: "border-[#c5a059]/40",
          badge: "bg-[#c5a059]/15 text-[#f6d78d]",
          text: "text-stone-100",
          glow: "drop-shadow-[0_2px_16px_rgba(197,160,89,0.35)]",
        };
    }
  };

  const theme = getThemeColors();

  // Background styling
  const bgClass =
    bgStyle === "pureblack"
      ? "bg-black"
      : bgStyle === "transparent"
      ? "bg-transparent"
      : "bg-[#090b10] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131722] via-[#090b10] to-[#040508]";

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-screen overflow-hidden select-none transition-colors duration-500 flex flex-col justify-between ${bgClass}`}
    >
      {/* ================= FLOATING HUD CONTROLS (AUTO-HIDE) ================= */}
      <div
        className={`fixed top-4 left-4 right-4 z-50 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2 pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-full px-3.5 py-1.5 shadow-2xl text-xs font-serif">
          <Tv className="w-3.5 h-3.5 text-[#c5a059]" />
          <span className="font-bold text-stone-200">Màn Chiếu Hội Thánh:</span>
          <span className="font-mono text-[#c5a059]">/{slug}</span>
          <span className="mx-1 text-stone-600">•</span>
          {isConnected ? (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <Wifi className="w-3 h-3" />
              <span>Đang kết nối</span>
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1 text-[11px]">
              <WifiOff className="w-3 h-3" />
              <span>Mất kết nối</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-full p-1.5 shadow-2xl">
          {/* Background Mode Selector */}
          <button
            onClick={() =>
              setBgStyle((prev) =>
                prev === "sanctuary"
                  ? "pureblack"
                  : prev === "pureblack"
                  ? "transparent"
                  : "sanctuary"
              )
            }
            className="px-2.5 py-1 rounded-full text-[11px] text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Đổi kiểu nền (Thánh đường / Đen tuyền / Trong suốt OBS)"
          >
            Nền: {bgStyle === "sanctuary" ? "Thánh Đường" : bgStyle === "pureblack" ? "Đen Tuyệt Đối" : "Trong Suốt"}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình (F11)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= MAIN PROJECTION SURFACE ================= */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 lg:p-16 relative">
        {/* Subtle Watermark Cross when Blackout / Standby */}
        {!isEnabled && (
          <div className="flex flex-col items-center justify-center space-y-4 opacity-15 transition-opacity duration-700">
            <svg
              viewBox="0 0 100 120"
              className="w-24 h-28 text-[#c5a059] fill-current"
            >
              <rect x="42" y="10" width="16" height="100" rx="4" />
              <rect x="20" y="32" width="60" height="16" rx="4" />
            </svg>
            <span className="font-serif tracking-[0.3em] uppercase text-xs text-stone-400">
              Phòng Thờ Phượng Trực Tuyến
            </span>
          </div>
        )}

        {/* Active Live Slide Content */}
        {isEnabled && data && (
          <div
            className={`w-full max-w-5xl transition-all duration-300 animate-fadeIn ${
              layout === "lowerthird"
                ? "mt-auto pb-4"
                : layout === "subtitle"
                ? "mt-auto pb-8"
                : "my-auto"
            }`}
          >
            <div
              className={`rounded-2xl transition-all ${
                layout === "lowerthird"
                  ? "bg-black/90 backdrop-blur-md p-6 sm:p-8 border border-white/10 shadow-2xl text-center"
                  : layout === "subtitle"
                  ? "p-4 text-center"
                  : "text-center p-4 sm:p-8"
              }`}
            >
              {/* Slide Meta Banner: Scripture Reference or Hymn Header */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-wrap">
                {isScripture ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-serif font-bold tracking-wider uppercase shadow-sm">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{data.songTitle || "Kinh Thánh Lời Chúa"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 text-[#f6d78d] text-xs sm:text-sm font-serif font-bold tracking-wider uppercase shadow-sm">
                    <Music2 className="w-4 h-4 text-[#c5a059]" />
                    <span>
                      {data.songNumber ? `TC ${data.songNumber} • ` : ""}
                      {data.songTitle || "Thánh Ca Tôn Vinh"}
                    </span>
                  </div>
                )}

                {/* Stanza or Translation Tag */}
                {data.stanzaLabel && !isScripture && (
                  <span className="text-xs sm:text-sm font-serif font-semibold text-stone-300 px-2.5 py-0.5 rounded-full bg-stone-800/80 border border-stone-700/60">
                    {data.stanzaLabel}
                  </span>
                )}

                {isScripture && data.referenceTranslation && (
                  <span className="text-xs sm:text-sm font-mono font-bold text-stone-400 px-2.5 py-0.5 rounded-full bg-stone-850 border border-stone-700/60">
                    {data.referenceTranslation}
                  </span>
                )}
              </div>

              {/* Main Verses / Lyrics Lines (Large High-Legibility Typography) */}
              <div className="space-y-3 sm:space-y-5">
                {data.lines?.map((line, idx) => {
                  const isSecondary = line.startsWith("“") || line.startsWith('"');
                  return (
                    <p
                      key={idx}
                      className={`font-serif tracking-wide transition-all ${
                        isSecondary
                          ? "italic text-amber-200/90 drop-shadow-md text-base sm:text-xl md:text-2xl lg:text-3xl mt-1 opacity-95"
                          : layout === "lowerthird"
                          ? "text-xl sm:text-2xl md:text-3xl font-medium text-white drop-shadow-md leading-relaxed"
                          : layout === "subtitle"
                          ? "text-lg sm:text-xl md:text-2xl font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed"
                          : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-stone-100 drop-shadow-xl leading-snug sm:leading-relaxed"
                      } ${theme.glow}`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= BOTTOM METRIC BAR ================= */}
      <footer className="p-3 text-center text-[10px] text-stone-600 font-serif tracking-widest uppercase">
        Cổng Thờ Phượng Cơ Đốc • Màn Chiếu Thánh Đường & Sân Khấu
      </footer>
    </div>
  );
}
