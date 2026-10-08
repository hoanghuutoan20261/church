"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  BookOpen,
  Music2,
  Maximize2,
  Minimize2,
  Tv,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Keyboard,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  X,
  HelpCircle,
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

function ProjectorContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = (params?.slug as string) || "";

  // Query parameter overrides
  const urlMode = searchParams.get("mode"); // "obs" for transparent overlay
  const urlLayout = searchParams.get("layout") as "lowerthird" | "subtitle" | "fullscreen" | null;
  const urlTheme = searchParams.get("theme") as "gold" | "white" | "teal" | "amber" | null;

  const [data, setData] = useState<LiveLyricsPayload | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);

  // Projection display states
  const [isObsMode, setIsObsMode] = useState<boolean>(urlMode === "obs");
  const [bgStyle, setBgStyle] = useState<"sanctuary" | "pureblack" | "transparent">(
    urlMode === "obs" ? "transparent" : "sanctuary"
  );
  const [overrideLayout, setOverrideLayout] = useState<"lowerthird" | "subtitle" | "fullscreen" | null>(
    urlLayout || (urlMode === "obs" ? "lowerthird" : null)
  );

  // Local Presentation Controls
  const [isBlackout, setIsBlackout] = useState<boolean>(false);
  const [isCleared, setIsCleared] = useState<boolean>(false);
  const [fontScale, setFontScale] = useState<number>(100);
  const [showShortcutsModal, setShowShortcutsModal] = useState<boolean>(false);
  const [copiedObsUrl, setCopiedObsUrl] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load saved font scale from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedScale = localStorage.getItem("church_projector_font_scale");
      if (savedScale) {
        const parsed = parseInt(savedScale, 10);
        if (!isNaN(parsed) && parsed >= 70 && parsed <= 160) {
          setFontScale(parsed);
        }
      }
    }
  }, []);

  const updateFontScale = (newScale: number) => {
    const clamped = Math.max(70, Math.min(160, newScale));
    setFontScale(clamped);
    if (typeof window !== "undefined") {
      localStorage.setItem("church_projector_font_scale", String(clamped));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2800);
  };

  // Real-time live lyrics projection sync via Server-Sent Events (SSE)
  useEffect(() => {
    if (!slug) return;
    let isCancelled = false;

    // Initial load: fetch current live state from MongoDB
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

    let eventSource: EventSource | null = null;
    let fallbackPollTimer: NodeJS.Timeout | null = null;

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        eventSource = new EventSource(
          `/api/realtime?churchSlug=${encodeURIComponent(slug)}&channel=lyrics`
        );

        eventSource.addEventListener("lyrics", (e: MessageEvent) => {
          if (isCancelled) return;
          try {
            const liveLyrics = JSON.parse(e.data);
            if (liveLyrics) {
              setData(liveLyrics);
              setIsConnected(true);
              // Automatically lift temporary local clear when operator projects a new slide
              setIsCleared(false);
            }
          } catch (err) {
            console.error("Lỗi cập nhật lời bài hát máy chiếu SSE:", err);
          }
        });

        eventSource.onopen = () => {
          if (!isCancelled) {
            setIsConnected(true);
            if (fallbackPollTimer) {
              clearInterval(fallbackPollTimer);
              fallbackPollTimer = null;
            }
          }
        };

        eventSource.onerror = () => {
          if (!isCancelled) {
            setIsConnected(false);
            if (!fallbackPollTimer) {
              fallbackPollTimer = setInterval(fetchLive, 5000);
            }
          }
        };
      } catch {
        fallbackPollTimer = setInterval(fetchLive, 3000);
      }
    } else {
      fallbackPollTimer = setInterval(fetchLive, 2000);
    }

    return () => {
      isCancelled = true;
      if (eventSource) eventSource.close();
      if (fallbackPollTimer) clearInterval(fallbackPollTimer);
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

  // Keyboard Shortcuts (B, C, F, O, T, L, +, -, 0, ?, H, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // B - Toggle Blackout
      if (key === "b") {
        e.preventDefault();
        setIsBlackout((prev) => {
          const next = !prev;
          showToast(next ? "Đã bật màn hình đen (Blackout)" : "Đã tắt Blackout");
          return next;
        });
      }
      // C - Toggle Clear
      else if (key === "c") {
        e.preventDefault();
        setIsCleared((prev) => {
          const next = !prev;
          showToast(next ? "Đã xóa tạm thời lời bài hát (Clear)" : "Đã khôi phục hiển thị lời");
          return next;
        });
      }
      // F - Fullscreen
      else if (key === "f") {
        e.preventDefault();
        toggleFullscreen();
      }
      // O - Toggle OBS Transparent Mode
      else if (key === "o") {
        e.preventDefault();
        setIsObsMode((prev) => {
          const next = !prev;
          if (next) {
            setBgStyle("transparent");
            setOverrideLayout("lowerthird");
            showToast("Đã bật chế độ OBS Studio Lower-Third (Nền trong suốt)");
          } else {
            setBgStyle("sanctuary");
            setOverrideLayout(null);
            showToast("Đã chuyển về chế độ Màn Chiếu Thánh Đường");
          }
          return next;
        });
      }
      // T - Cycle Background Style
      else if (key === "t") {
        e.preventDefault();
        setBgStyle((prev) => {
          const next =
            prev === "sanctuary" ? "pureblack" : prev === "pureblack" ? "transparent" : "sanctuary";
          showToast(
            next === "sanctuary"
              ? "Nền: Thánh Đường Trang Trọng"
              : next === "pureblack"
              ? "Nền: Đen Tuyệt Đối"
              : "Nền: Trong Suốt OBS"
          );
          return next;
        });
      }
      // L - Cycle Layout Mode
      else if (key === "l") {
        e.preventDefault();
        setOverrideLayout((prev) => {
          const next =
            prev === "fullscreen" ? "lowerthird" : prev === "lowerthird" ? "subtitle" : "fullscreen";
          showToast(
            next === "lowerthird"
              ? "Bố cục: Hạ tầng chân trang (Lower-Third)"
              : next === "subtitle"
              ? "Bố cục: Phụ đề (Subtitle)"
              : "Bố cục: Toàn màn hình (Fullscreen)"
          );
          return next;
        });
      }
      // + or = : Zoom in font size
      else if (key === "+" || key === "=") {
        e.preventDefault();
        setFontScale((prev) => {
          const next = Math.min(prev + 10, 160);
          updateFontScale(next);
          showToast(`Cỡ chữ: ${next}%`);
          return next;
        });
      }
      // - or _ : Zoom out font size
      else if (key === "-" || key === "_") {
        e.preventDefault();
        setFontScale((prev) => {
          const next = Math.max(prev - 10, 70);
          updateFontScale(next);
          showToast(`Cỡ chữ: ${next}%`);
          return next;
        });
      }
      // 0 : Reset font size
      else if (key === "0") {
        e.preventDefault();
        updateFontScale(100);
        showToast("Cỡ chữ: 100% (Mặc định)");
      }
      // H or ? : Toggle Shortcut Help Modal
      else if (key === "h" || key === "?") {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      }
      // Escape: Close modals
      else if (key === "escape") {
        setShowShortcutsModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
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

  const copyObsBrowserSourceUrl = () => {
    if (typeof window === "undefined") return;
    const obsUrl = `${window.location.origin}/projector/${slug}?mode=obs`;
    navigator.clipboard.writeText(obsUrl).then(() => {
      setCopiedObsUrl(true);
      showToast("Đã sao chép link OBS Browser Source (Nền trong suốt)!");
      setTimeout(() => setCopiedObsUrl(false), 3000);
    });
  };

  const isScripture = data?.displayType === "scripture";
  const rawEnabled = Boolean(data?.isEnabled && data?.lines && data.lines.length > 0);
  const isEnabled = rawEnabled && !isBlackout && !isCleared;
  const layout = overrideLayout || data?.layoutMode || "fullscreen";

  // Color theme mapping
  const activeTheme = urlTheme || data?.themeStyle || "gold";
  const getThemeColors = () => {
    switch (activeTheme) {
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
  const bgClass = isObsMode || bgStyle === "transparent"
    ? "bg-transparent"
    : bgStyle === "pureblack"
    ? "bg-black"
    : "bg-[#090b10] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#131722] via-[#090b10] to-[#040508]";

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen w-screen overflow-hidden select-none transition-colors duration-500 flex flex-col justify-between ${bgClass}`}
      style={{
        backgroundColor: isObsMode || bgStyle === "transparent" ? "transparent" : undefined,
      }}
    >
      {/* ================= FLOATING HUD CONTROLS (AUTO-HIDE) ================= */}
      <div
        className={`fixed top-4 left-4 right-4 z-50 flex items-center justify-between transition-opacity duration-300 pointer-events-none ${
          showControls && !isObsMode ? "opacity-100" : isObsMode && showControls ? "opacity-80" : "opacity-0"
        }`}
      >
        {/* Left Badge: Church / Connection / State Indicators */}
        <div className="flex items-center gap-2 pointer-events-auto bg-stone-900/90 backdrop-blur-md border border-stone-800 rounded-full px-3.5 py-1.5 shadow-2xl text-xs font-serif">
          <Tv className="w-3.5 h-3.5 text-[#c5a059]" />
          <span className="font-bold text-stone-200">Màn Chiếu:</span>
          <span className="font-mono text-[#c5a059]">/{slug}</span>
          <span className="mx-1 text-stone-600">•</span>
          {isConnected ? (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <Wifi className="w-3 h-3" />
              <span>Realtime SSE</span>
            </span>
          ) : (
            <span className="text-red-400 flex items-center gap-1 text-[11px]">
              <WifiOff className="w-3 h-3" />
              <span>Mất kết nối</span>
            </span>
          )}

          {isBlackout && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-sans font-bold animate-pulse">
              BLACKOUT
            </span>
          )}
          {isCleared && !isBlackout && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-sans font-bold">
              CLEARED
            </span>
          )}
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto bg-stone-900/95 backdrop-blur-md border border-stone-800 rounded-full p-1.5 shadow-2xl">
          {/* OBS Browser Source Link Copy Button */}
          <button
            onClick={copyObsBrowserSourceUrl}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-sans font-medium text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Sao chép liên kết Browser Source để dán vào OBS Studio (Nền trong suốt)"
          >
            {copiedObsUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#c5a059]" />}
            <span className="hidden sm:inline">OBS Link</span>
          </button>

          {/* Quick Font Size Controls */}
          <div className="flex items-center gap-1 bg-stone-800/80 rounded-full px-2 py-0.5 text-[11px] text-stone-300">
            <button
              onClick={() => updateFontScale(fontScale - 10)}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Giảm kích thước chữ (Phím -)"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="font-mono text-[10px] text-amber-300 px-0.5 min-w-[28px] text-center">
              {fontScale}%
            </span>
            <button
              onClick={() => updateFontScale(fontScale + 10)}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Tăng kích thước chữ (Phím +)"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Background Mode Toggle */}
          <button
            onClick={() =>
              setBgStyle((prev) =>
                prev === "sanctuary" ? "pureblack" : prev === "pureblack" ? "transparent" : "sanctuary"
              )
            }
            className="px-2.5 py-1 rounded-full text-[11px] text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            title="Đổi kiểu nền (Phím T)"
          >
            Nền: {bgStyle === "sanctuary" ? "Thánh Đường" : bgStyle === "pureblack" ? "Đen" : "Trong Suốt"}
          </button>

          {/* Layout Mode Toggle */}
          <button
            onClick={() =>
              setOverrideLayout((prev) =>
                prev === "fullscreen" ? "lowerthird" : prev === "lowerthird" ? "subtitle" : "fullscreen"
              )
            }
            className="px-2.5 py-1 rounded-full text-[11px] text-stone-300 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer hidden md:inline"
            title="Đổi bố cục hiển thị (Phím L)"
          >
            Bố cục: {layout === "lowerthird" ? "Lower-Third" : layout === "subtitle" ? "Phụ đề" : "Toàn màn hình"}
          </button>

          {/* Blackout Toggle Button */}
          <button
            onClick={() => setIsBlackout(!isBlackout)}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isBlackout ? "bg-red-500/30 text-red-300" : "hover:bg-stone-800 text-stone-300 hover:text-white"
            }`}
            title="Tắt màn hình / Blackout (Phím B)"
          >
            {isBlackout ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts Cheat-sheet Button */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title="Bảng phím tắt điều khiển (Phím ? hoặc H)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Thoát toàn màn hình (Phím F)" : "Toàn màn hình (Phím F)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-stone-100 border border-[#c5a059]/40 rounded-full px-4 py-1.5 shadow-2xl text-xs font-serif font-medium flex items-center gap-2 animate-fadeIn pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= MAIN PROJECTION SURFACE ================= */}
      <main
        className={`flex-1 flex flex-col justify-center items-center relative transition-all duration-300 ${
          isObsMode || bgStyle === "transparent" ? "p-4 sm:p-8" : "p-6 md:p-12 lg:p-16"
        }`}
      >
        {/* Subtle Watermark Cross when Standby / Blackout (Hidden in OBS Transparent Mode) */}
        {!isEnabled && !isObsMode && bgStyle !== "transparent" && (
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
                ? "mt-auto pb-4 sm:pb-8"
                : layout === "subtitle"
                ? "mt-auto pb-6 sm:pb-12"
                : "my-auto"
            }`}
            style={{
              transform: `scale(${fontScale / 100})`,
              transformOrigin: layout === "lowerthird" || layout === "subtitle" ? "bottom center" : "center center",
            }}
          >
            <div
              className={`rounded-2xl transition-all ${
                layout === "lowerthird"
                  ? "bg-black/85 backdrop-blur-md p-5 sm:p-7 border border-white/15 shadow-2xl text-center"
                  : layout === "subtitle"
                  ? "bg-black/75 backdrop-blur-sm p-4 text-center rounded-xl border border-white/10"
                  : "text-center p-4 sm:p-8"
              }`}
            >
              {/* Slide Meta Banner: Scripture Reference or Hymn Header */}
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-5 flex-wrap">
                {isScripture ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-serif font-bold tracking-wider uppercase shadow-sm">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>{data.songTitle || "Kinh Thánh Lời Chúa"}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#f6d78d] text-xs sm:text-sm font-serif font-bold tracking-wider uppercase shadow-sm">
                    <Music2 className="w-4 h-4 text-[#c5a059]" />
                    <span>
                      {data.songNumber ? `TC ${data.songNumber} • ` : ""}
                      {data.songTitle || "Thánh Ca Tôn Vinh"}
                    </span>
                  </div>
                )}

                {/* Stanza or Translation Tag */}
                {data.stanzaLabel && !isScripture && (
                  <span className="text-xs sm:text-sm font-serif font-semibold text-stone-300 px-2.5 py-0.5 rounded-full bg-stone-800/90 border border-stone-700/70">
                    {data.stanzaLabel}
                  </span>
                )}

                {isScripture && data.referenceTranslation && (
                  <span className="text-xs sm:text-sm font-mono font-bold text-stone-400 px-2.5 py-0.5 rounded-full bg-stone-850 border border-stone-700/70">
                    {data.referenceTranslation}
                  </span>
                )}
              </div>

              {/* Main Verses / Lyrics Lines (Large High-Legibility Typography with Crisp Shadows) */}
              <div className="space-y-3 sm:space-y-4">
                {data.lines?.map((line, idx) => {
                  const isSecondary = line.startsWith("“") || line.startsWith('"');
                  return (
                    <p
                      key={idx}
                      className={`font-serif tracking-wide transition-all ${
                        isSecondary
                          ? "italic text-amber-200 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] text-base sm:text-xl md:text-2xl lg:text-3xl mt-1 opacity-95"
                          : layout === "lowerthird"
                          ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,1)] leading-relaxed"
                          : layout === "subtitle"
                          ? "text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white drop-shadow-[0_3px_10px_rgba(0,0,0,1)] leading-relaxed"
                          : "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-stone-100 drop-shadow-[0_3px_12px_rgba(0,0,0,1)] leading-snug sm:leading-relaxed"
                      } ${theme.glow}`}
                      style={{
                        textShadow:
                          isObsMode || bgStyle === "transparent"
                            ? "0 2px 4px rgba(0,0,0,1), 0 0 14px rgba(0,0,0,0.9)"
                            : undefined,
                      }}
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

      {/* ================= BOTTOM FOOTER (HIDDEN IN OBS MODE) ================= */}
      {!isObsMode && bgStyle !== "transparent" && (
        <footer className="p-3 text-center text-[10px] text-stone-600 font-serif tracking-widest uppercase">
          Cổng Thờ Phượng Cơ Đốc • Màn Chiếu Thánh Đường & Sân Khấu • Bấm [?] để xem phím tắt
        </footer>
      )}

      {/* ================= KEYBOARD SHORTCUTS CHEAT-SHEET MODAL ================= */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-stone-900 border border-[#c5a059]/40 rounded-2xl p-6 shadow-2xl text-stone-200 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-[#c5a059]" />
                <h3 className="font-serif font-bold text-lg text-white">
                  Phím Tắt Điều Khiển Màn Chiếu
                </h3>
              </div>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Tắt màn hình (Blackout)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">B</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Xóa tạm thời lời (Clear)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">C</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Toàn màn hình (Fullscreen)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">F</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Bật/Tắt chế độ OBS Overlay</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">O</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Đổi kiểu nền (Background)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">T</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Đổi kiểu bố cục (Layout)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">L</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Tăng cỡ chữ (+10%)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">+</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Giảm cỡ chữ (-10%)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">-</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Đặt lại cỡ chữ (100%)</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">0</kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-850 border border-stone-800">
                <span className="text-stone-300">Đóng bảng phím tắt</span>
                <kbd className="px-2 py-1 bg-stone-800 text-amber-300 rounded font-mono font-bold">Esc</kbd>
              </div>
            </div>

            <div className="p-3 bg-[#c5a059]/10 border border-[#c5a059]/25 rounded-xl text-xs text-[#f6d78d] flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Gợi ý OBS Studio:</strong> Dán link{" "}
                <code className="text-white font-mono bg-black/40 px-1 py-0.5 rounded">
                  {typeof window !== "undefined" ? window.location.origin : ""}/projector/{slug}?mode=obs
                </code>{" "}
                vào nguồn <em>Browser Source</em> trong OBS Studio để có lớp chữ viền trong suốt đè lên livestream trực tiếp!
              </p>
            </div>

            <button
              onClick={() => setShowShortcutsModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e47] text-sanctuary-950 font-serif font-bold text-sm cursor-pointer hover:brightness-110 transition-all shadow-md"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectorDisplayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-screen bg-[#090b10] flex items-center justify-center text-stone-400 font-serif text-sm">
          Đang khởi tạo màn chiếu...
        </div>
      }
    >
      <ProjectorContent />
    </Suspense>
  );
}
