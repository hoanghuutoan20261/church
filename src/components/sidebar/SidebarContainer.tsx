"use client";

import React from "react";
import { useWorship, SidebarTab } from "@/context/WorshipContext";
import { CommunityChatTab } from "./CommunityChatTab";
import { ScriptureNotesTab } from "./ScriptureNotesTab";
import { PrivatePrayerTab } from "./PrivatePrayerTab";
import { MessageSquare, BookOpen, Lock, Shield } from "lucide-react";

export const SidebarContainer: React.FC = () => {
  const { activeTab, setActiveTab } = useWorship();

  return (
    <aside className="w-full lg:w-[410px] xl:w-[450px] shrink-0 h-[600px] lg:h-full flex flex-col bg-sanctuary-950 border border-white/[0.08] rounded-lg overflow-hidden shadow-sanctuary">
      {/* Dignified Tab Navigation */}
      <nav
        aria-label="Khung tương tác thánh đường"
        className="flex items-center border-b border-white/[0.08] bg-sanctuary-950 px-1 pt-1.5"
      >
        {/* Tab 1: Cộng Đồng */}
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-serif font-medium border-b-2 transition-all ${
            activeTab === "chat"
              ? "border-gold-400 text-gold-300 bg-sanctuary-900/90"
              : "border-transparent text-sanctuary-400 hover:text-sanctuary-200 hover:bg-sanctuary-900/40"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-gold-400/80" />
          <span className="tracking-wide">Cộng Đồng</span>
        </button>

        {/* Tab 2: Kinh Thánh & Bài Giảng */}
        <button
          onClick={() => setActiveTab("scripture")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-serif font-medium border-b-2 transition-all ${
            activeTab === "scripture"
              ? "border-gold-400 text-gold-300 bg-sanctuary-900/90"
              : "border-transparent text-sanctuary-400 hover:text-sanctuary-200 hover:bg-sanctuary-900/40"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-gold-400/80" />
          <span className="tracking-wide">Kinh Thánh</span>
        </button>

        {/* Tab 3: Cầu Nguyện Kín */}
        <button
          onClick={() => setActiveTab("prayer")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-2 text-xs font-serif font-medium border-b-2 transition-all ${
            activeTab === "prayer"
              ? "border-gold-400 text-gold-300 bg-sanctuary-900/90"
              : "border-transparent text-sanctuary-400 hover:text-sanctuary-200 hover:bg-sanctuary-900/40"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-gold-400/80" />
          <span className="tracking-wide">Cầu Nguyện Kín</span>
        </button>
      </nav>

      {/* Tab Panels */}
      <div className="flex-1 min-h-0">
        {activeTab === "chat" && <CommunityChatTab />}
        {activeTab === "scripture" && <ScriptureNotesTab />}
        {activeTab === "prayer" && <PrivatePrayerTab />}
      </div>
    </aside>
  );
};
