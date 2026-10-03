"use client";

import React, { useState } from "react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import { X, Music2, ListOrdered, BookOpen } from "lucide-react";

export const HymnalSheetModal: React.FC = () => {
  const { activeModal, closeModal } = useWorship();
  const [activeTab, setActiveTab] = useState<"hymn" | "order">("hymn");

  if (activeModal !== "hymnal") return null;

  const { currentHymn, stages } = worshipData;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hymnal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-sanctuary-950 border border-gold-400/40 rounded-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-md text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] pb-1 gap-2">
          <button
            onClick={() => setActiveTab("hymn")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-medium border-b-2 transition-all ${
              activeTab === "hymn"
                ? "border-gold-400 text-gold-300"
                : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
            }`}
          >
            <Music2 className="w-3.5 h-3.5" />
            <span>Thánh Ca: {currentHymn.title}</span>
          </button>
          <button
            onClick={() => setActiveTab("order")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-medium border-b-2 transition-all ${
              activeTab === "order"
                ? "border-gold-400 text-gold-300"
                : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Thứ Tự Buổi Lễ Thờ Phượng</span>
          </button>
        </div>

        {activeTab === "hymn" ? (
          <div className="space-y-4 pt-1">
            <div className="text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider text-gold-400 font-semibold font-sans">
                Thánh Ca #{currentHymn.number}
              </span>
              <h3
                id="hymnal-modal-title"
                className="font-serif text-lg sm:text-xl font-bold text-sanctuary-100"
              >
                {currentHymn.title}
              </h3>
              <p className="text-[11px] text-sanctuary-400 italic font-serif">
                Tác giả: {currentHymn.author}
              </p>
            </div>

            {/* Hymn Stanzas with Classic Editorial Typography */}
            <div className="bg-sanctuary-850/70 border border-white/[0.06] rounded-md p-5 space-y-4 text-center font-serif">
              {currentHymn.stanzas.map((stanza, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-xs sm:text-sm text-sanctuary-100 leading-relaxed max-w-md mx-auto">
                    {stanza}
                  </p>
                  {idx < currentHymn.stanzas.length - 1 && (
                    <div className="w-8 h-px bg-white/10 mx-auto my-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <h3 className="font-serif text-base font-semibold text-sanctuary-100">
              Chương Trình Lễ Thờ Phượng Chúa Nhật
            </h3>
            <div className="space-y-2">
              {stages.map((stage) => {
                const isCurrent = stage.status === "current";
                const isCompleted = stage.status === "completed";
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between p-3 rounded-md border text-xs ${
                      isCurrent
                        ? "bg-gold-400/10 border-gold-400/40 text-gold-300"
                        : "bg-sanctuary-850 border-white/[0.05] text-sanctuary-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-sanctuary-400">{stage.time}</span>
                      <span className="font-medium">{stage.name}</span>
                    </div>
                    <div>
                      {isCurrent ? (
                        <span className="text-[10px] uppercase font-semibold text-gold-400 bg-gold-400/20 px-2 py-0.5 rounded">
                          Đang diễn ra
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] text-sanctuary-500">
                          Đã hoàn tất
                        </span>
                      ) : (
                        <span className="text-[10px] text-sanctuary-400">Sắp tới</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
