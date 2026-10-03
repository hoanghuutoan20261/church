"use client";

import React from "react";
import { WorshipProvider, useWorship, CurrentChurchInfo } from "@/context/WorshipContext";
import { SanctuaryHeader } from "@/components/header/SanctuaryHeader";
import { HlsPlayer } from "@/components/player/HlsPlayer";
import { QuickActionBar } from "@/components/player/QuickActionBar";
import { SidebarContainer } from "@/components/sidebar/SidebarContainer";
import { GivingModal } from "@/components/modals/GivingModal";
import { SalvationModal } from "@/components/modals/SalvationModal";
import { PrayerRequestModal } from "@/components/modals/PrayerRequestModal";
import { HymnalSheetModal } from "@/components/modals/HymnalSheetModal";
import { worshipData } from "@/data/worshipServiceData";
import { SanctuaryWaitingRoom } from "@/components/sanctuary/SanctuaryWaitingRoom";
import { ChurchWallView } from "@/components/wall/ChurchWallView";
import { EyeOff, BookOpen, User, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

function WorshipSanctuaryScreen() {
  const { church, isFocusMode, toggleFocusMode, activeView, setActiveView } = useWorship();
  const [isLive, setIsLive] = useState<boolean>(
    Boolean(church.currentService?.isLive)
  );

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Periodic polling for live broadcast state from Church Admin
  useEffect(() => {
    if (!church?.slug) return;
    let isCancelled = false;

    const pollLiveStatus = async () => {
      try {
        const res = await fetch(
          `/api/churches?slug=${encodeURIComponent(church.slug)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && !isCancelled) {
            const serverLiveState = Boolean(json.data.currentService?.isLive);
            setIsLive(serverLiveState);
          }
        }
      } catch {}
    };

    const interval = setInterval(pollLiveStatus, 3500);
    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [church?.slug]);

  return (
    <div className="min-h-screen bg-sanctuary-900 text-sanctuary-100 flex flex-col font-sans relative selection:bg-gold-400/25 selection:text-gold-200">
      {/* 1. Sanctuary Top Bar (Hidden in Full Focus Mode) */}
      {!isFocusMode && <SanctuaryHeader />}

      {/* 2. Main Workspace: Church Profile Wall vs Sanctuary */}
      {activeView === "wall" ? (
        <ChurchWallView
          onGoToSanctuary={() => setActiveView("sanctuary")}
          isLive={isLive}
        />
      ) : (
        <main
          className={`flex-1 transition-all duration-300 p-2 sm:p-4 lg:p-5 flex flex-col ${
            isFocusMode ? "justify-center max-w-7xl mx-auto w-full p-2 sm:p-6" : ""
          }`}
        >
        {isFocusMode ? (
          /* Full Focus Mode (Chế độ Chiêm Niệm - Distraction-free) */
          <div className="relative w-full flex flex-col items-center justify-center space-y-3">
            {/* Top Exit Floating Control */}
            <div className="w-full flex items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLive ? "bg-red-500 animate-pulse" : "bg-amber-400"
                  }`}
                />
                <span className="text-xs uppercase tracking-widest text-gold-300 font-serif">
                  Chế Độ Chiêm Niệm Thờ Phượng — {church.name}
                </span>
              </div>
              <button
                onClick={toggleFocusMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-200 border border-white/10 hover:border-gold-400/40 text-xs transition-colors shadow-sm"
              >
                <EyeOff className="w-3.5 h-3.5 text-gold-400" />
                <span>Thoát Chế Độ Chiêm Niệm (ESC)</span>
              </button>
            </div>

            {/* Expansive Player or Waiting Room */}
            <div className="w-full max-w-6xl shadow-2xl">
              {isLive ? <HlsPlayer /> : <SanctuaryWaitingRoom />}
            </div>

            {/* Minimalist Subtitle/Scripture bar below focused player */}
            <div className="text-center pt-2">
              <p className="font-serif italic text-xs sm:text-sm text-gold-200/90">
                &ldquo;Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu...&rdquo;
              </p>
              <span className="text-[11px] text-sanctuary-400 font-sans">
                — {worshipData.scriptureReference}
              </span>
            </div>
          </div>
        ) : (
          /* Standard Dignified Sanctuary Layout */
          <div className="flex-1 flex flex-col lg:flex-row gap-4 xl:gap-5 max-w-[1720px] mx-auto w-full">
            {/* Left / Center: Video Player & Service Details */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* High-priority Player or Waiting Room */}
              {isLive ? <HlsPlayer /> : <SanctuaryWaitingRoom />}

              {/* Quick Action Bar (Cần Cầu Nguyện, Tiếp Nhận Chúa, Dâng Hiến) */}
              <QuickActionBar />

              {/* Service & Speaker Briefing Card (Dignified Architectural Panel) */}
              <div className="bg-sanctuary-950 border border-white/[0.08] rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] tracking-wider uppercase font-semibold text-gold-400 font-sans">
                        {church.denomination || "Hội Thánh Tin Lành"}
                      </span>
                      {church.address && (
                        <span className="text-xs text-sanctuary-400 flex items-center gap-1 font-sans">
                          • <MapPin className="w-3 h-3 text-sanctuary-500" />
                          <span className="truncate max-w-[320px]">{church.address}</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-sanctuary-100">
                      {worshipData.theme}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-sanctuary-400 pt-0.5">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-gold-400/80" />
                        <strong className="font-medium text-sanctuary-200">
                          {worshipData.scriptureReference}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-sanctuary-400" />
                        <span>{worshipData.speaker}</span>
                      </span>
                    </div>
                  </div>

                  {/* Church Service Badge */}
                  <div className="shrink-0 bg-sanctuary-850/90 border border-white/[0.06] px-3.5 py-2 rounded-md text-right sm:text-left">
                    <span className="text-[10px] text-sanctuary-400 block uppercase font-medium">
                      Thời gian phát sóng
                    </span>
                    <span className="text-xs font-serif text-gold-300 font-medium">
                      {church.liveSchedule || worshipData.dateTime}
                    </span>
                  </div>
                </div>

                {/* Liturgical Reflection Excerpt */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-sanctuary-850/60 rounded border border-white/[0.04]">
                    <span className="text-[10px] uppercase font-semibold text-gold-400 block mb-1">
                      1. Nguồn Gốc Ân Điển
                    </span>
                    <p className="text-xs text-sanctuary-300 font-serif leading-relaxed">
                      Sự tha thứ và phục hòa không phát xuất từ công trạng loài người, mà từ
                      tấm lòng yêu thương vô điều kiện của Đức Chúa Cha.
                    </p>
                  </div>

                  <div className="p-3 bg-sanctuary-850/60 rounded border border-white/[0.04]">
                    <span className="text-[10px] uppercase font-semibold text-gold-400 block mb-1">
                      2. Tiếp Nhận Bởi Đức Tin
                    </span>
                    <p className="text-xs text-sanctuary-300 font-serif leading-relaxed">
                      Đức tin không phải là thành tích, mà là đôi tay mở rộng tiếp nhận món
                      quà cứu chuộc qua sự chết của Chúa Cứu Thế Giê-xu.
                    </p>
                  </div>

                  <div className="p-3 bg-sanctuary-850/60 rounded border border-white/[0.04]">
                    <span className="text-[10px] uppercase font-semibold text-gold-400 block mb-1">
                      3. Sống Đời Bày Tỏ
                    </span>
                    <p className="text-xs text-sanctuary-300 font-serif leading-relaxed">
                      Mỗi người được tái sinh trở nên kiệt tác sống của Chúa, bước đi trong
                      những việc lành đã được sắm sẵn trước cho chúng ta.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Tabbed Modular Panel (Cộng Đồng, Kinh Thánh, Cầu Nguyện Kín) */}
            <SidebarContainer />
          </div>
        )}
      </main>
      )}

      {/* 3. Sanctuary Modals */}
      <GivingModal />
      <SalvationModal />
      <PrayerRequestModal />
      <HymnalSheetModal />
    </div>
  );
}

export function SanctuaryClient({
  church,
  initialView = "sanctuary",
}: {
  church: CurrentChurchInfo;
  initialView?: "sanctuary" | "wall";
}) {
  return (
    <WorshipProvider initialChurch={church} initialView={initialView}>
      <WorshipSanctuaryScreen />
    </WorshipProvider>
  );
}

export default SanctuaryClient;
