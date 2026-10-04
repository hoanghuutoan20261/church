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
import { CommunityChatTab } from "@/components/sidebar/CommunityChatTab";
import { ScriptureNotesTab } from "@/components/sidebar/ScriptureNotesTab";
import { PrivatePrayerTab } from "@/components/sidebar/PrivatePrayerTab";
import { EyeOff, BookOpen, User, MapPin, MessageSquare, Lock, Info, ExternalLink } from "lucide-react";
import { getChurchGoogleMapsUrl } from "@/lib/mapUtils";
import { useState, useEffect } from "react";

function WorshipSanctuaryScreen() {
  const { church, isFocusMode, toggleFocusMode, activeView, setActiveView } = useWorship();
  const [isLive, setIsLive] = useState<boolean>(
    Boolean(church.currentService?.isLive)
  );
  const [mobileTab, setMobileTab] = useState<"chat" | "scripture" | "prayer" | "info">("chat");

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

  // Service details & reflection briefing card
  const ServiceDetailsCard = () => (
    <div className="bg-sanctuary-950 border border-white/[0.08] rounded-lg p-3.5 sm:p-5 shadow-sm space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-3.5 sm:pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-wider uppercase font-semibold text-gold-400 font-sans">
              {church.denomination || "Hội Thánh Tin Lành"}
            </span>
            {church.address && (
              <a
                href={getChurchGoogleMapsUrl(church.address, church.name, church.profileConfig?.googleMapUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-sanctuary-400 hover:text-gold-300 flex items-center gap-1 font-sans transition-colors group cursor-pointer"
                title="Mở Google Maps và chỉ đường tới Hội Thánh"
              >
                <span>•</span>
                <MapPin className="w-3 h-3 text-gold-400 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[260px] sm:max-w-[320px] group-hover:underline underline-offset-2">{church.address}</span>
                <ExternalLink className="w-2.5 h-2.5 text-sanctuary-500 group-hover:text-gold-400 shrink-0 opacity-70" />
              </a>
            )}
          </div>
          <h2 className="font-serif text-base sm:text-xl font-bold text-sanctuary-100">
            {church.currentService?.title || `Lễ Thờ Phượng Chúa Nhật — ${church.name}`}
          </h2>
          <div className="flex items-center gap-3 text-xs text-sanctuary-400 pt-0.5">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-gold-400/80 shrink-0" />
              <strong className="font-medium text-sanctuary-200">
                {church.currentService?.scriptureReference || "Lời Chúa Hôm Nay"}
              </strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sanctuary-400 shrink-0" />
              <span>
                {church.currentService?.speaker ||
                  church.profileConfig?.leadPastor ||
                  "Mục sư Quản Nhiệm"}
              </span>
            </span>
          </div>
        </div>

        {/* Church Service Badge */}
        <div className="shrink-0 bg-sanctuary-850/90 border border-white/[0.06] px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-md text-left sm:text-right">
          <span className="text-[10px] text-sanctuary-400 block uppercase font-medium">
            Thời gian phát sóng
          </span>
          <span className="text-xs font-serif text-gold-300 font-medium">
            {church.liveSchedule || worshipData.dateTime}
          </span>
        </div>
      </div>

      {/* Liturgical Reflection / Church Service Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
        <div className="p-3 bg-sanctuary-850/60 rounded border border-white/[0.04]">
          <span className="text-[10px] uppercase font-semibold text-gold-400 block mb-1">
            1. Thông Điệp Mục Vụ
          </span>
          <p className="text-xs text-sanctuary-300 font-serif leading-relaxed line-clamp-3">
            {church.currentService?.welcomeMessage ||
              church.profileConfig?.about ||
              church.profileConfig?.slogan ||
              "Chào mừng quý ông bà anh chị em cùng hiệp một lòng dâng lời ca ngợi và lắng nghe Lời Chúa."}
          </p>
        </div>

        <div className="p-3 bg-sanctuary-850/60 rounded border border-white/[0.04]">
          <span className="text-[10px] uppercase font-semibold text-gold-400 block mb-1">
            2. Lời Chúa Hôm Nay
          </span>
          <p className="text-xs text-sanctuary-300 font-serif leading-relaxed">
            Phân đoạn Kinh Thánh nền tảng:{" "}
            <strong className="text-gold-300 font-medium">
              {church.currentService?.scriptureReference || "Theo chương trình phụng vụ"}
            </strong>
            . Diễn giả:{" "}
            <span className="text-sanctuary-200">
              {church.currentService?.speaker ||
                church.profileConfig?.leadPastor ||
                "Mục sư Quản Nhiệm"}
            </span>
            .
          </p>
        </div>

        <div className="p-3 bg-sanctuary-850/60 rounded border border-white/[0.04]">
          <span className="text-[10px] uppercase font-semibold text-gold-400 block mb-1">
            3. Lịch Phụng Vụ & Kết Nối
          </span>
          <p className="text-xs text-sanctuary-300 font-serif leading-relaxed">
            {church.liveSchedule || "Chúa Nhật hàng tuần"}
            {church.address ? ` • ${church.address}` : ""}
          </p>
        </div>
      </div>
    </div>
  );

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
                &ldquo;{church.profileConfig?.slogan || "Vả, ấy là nhờ ân điển, bởi đức tin, mà anh em được cứu..."}&rdquo;
              </p>
              <span className="text-[11px] text-sanctuary-400 font-sans">
                — {church.currentService?.scriptureReference || "Lời Chúa Hằng Sống"}
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

              {/* Mobile Sub-Player Segmented Tabs (< lg) */}
              <div className="lg:hidden">
                <div className="flex items-center border border-white/[0.08] bg-sanctuary-950 rounded-t-lg overflow-hidden">
                  <button
                    onClick={() => setMobileTab("chat")}
                    className={`flex-1 py-2.5 px-1 sm:px-2 text-xs font-serif font-medium flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition-all cursor-pointer ${
                      mobileTab === "chat"
                        ? "border-gold-400 text-gold-300 bg-sanctuary-900/90 font-bold"
                        : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Trò Chuyện</span>
                  </button>

                  <button
                    onClick={() => setMobileTab("scripture")}
                    className={`flex-1 py-2.5 px-1 sm:px-2 text-xs font-serif font-medium flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition-all cursor-pointer ${
                      mobileTab === "scripture"
                        ? "border-gold-400 text-gold-300 bg-sanctuary-900/90 font-bold"
                        : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Kinh Thánh</span>
                  </button>

                  <button
                    onClick={() => setMobileTab("prayer")}
                    className={`flex-1 py-2.5 px-1 sm:px-2 text-xs font-serif font-medium flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition-all cursor-pointer ${
                      mobileTab === "prayer"
                        ? "border-gold-400 text-gold-300 bg-sanctuary-900/90 font-bold"
                        : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Cầu Nguyện</span>
                  </button>

                  <button
                    onClick={() => setMobileTab("info")}
                    className={`flex-1 py-2.5 px-1 sm:px-2 text-xs font-serif font-medium flex items-center justify-center gap-1 sm:gap-1.5 border-b-2 transition-all cursor-pointer ${
                      mobileTab === "info"
                        ? "border-gold-400 text-gold-300 bg-sanctuary-900/90 font-bold"
                        : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
                    }`}
                  >
                    <Info className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Chi Tiết</span>
                  </button>
                </div>

                {/* Mobile Active Tab Content */}
                <div className="border border-t-0 border-white/[0.08] rounded-b-lg overflow-hidden bg-sanctuary-950 shadow-sanctuary mb-3">
                  {mobileTab === "chat" && (
                    <div className="h-[480px]">
                      <CommunityChatTab />
                    </div>
                  )}
                  {mobileTab === "scripture" && (
                    <div className="h-[520px]">
                      <ScriptureNotesTab />
                    </div>
                  )}
                  {mobileTab === "prayer" && (
                    <div className="h-[520px]">
                      <PrivatePrayerTab />
                    </div>
                  )}
                  {mobileTab === "info" && (
                    <div className="p-3">
                      <ServiceDetailsCard />
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Service & Speaker Briefing Card (hidden on mobile, shown on lg+) */}
              <div className="hidden lg:block">
                <ServiceDetailsCard />
              </div>
            </div>

            {/* Right Column: Tabbed Modular Panel (Cộng Đồng, Kinh Thánh, Cầu Nguyện Kín) - Desktop Only */}
            <div className="hidden lg:flex shrink-0">
              <SidebarContainer />
            </div>
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
