"use client";

import React, { useState } from "react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import {
  BookOpen,
  FileText,
  Copy,
  Check,
  Bookmark,
  Share2,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export const ScriptureNotesTab: React.FC = () => {
  const {
    userNotes,
    setUserNotes,
    saveUserNotes,
    selectedTranslation,
    setSelectedTranslation,
  } = useWorship();

  const [activeSubTab, setActiveSubTab] = useState<"scripture" | "notes">("scripture");
  const [copiedNotes, setCopiedNotes] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserNotes(e.target.value);
  };

  const handleSaveNotes = () => {
    saveUserNotes(userNotes);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleCopyNotes = () => {
    if (typeof window !== "undefined") {
      const fullText = `[Ghi Chú Bài Giảng: ${worshipData.theme}]\nDiễn giả: ${worshipData.speaker}\nKinh Thánh: ${worshipData.scriptureReference}\n\n${userNotes}`;
      navigator.clipboard.writeText(fullText);
      setCopiedNotes(true);
      setTimeout(() => setCopiedNotes(false), 2000);
    }
  };

  const handleAppendVerseToNotes = (verseText: string, verseNum: number) => {
    const addition = `\n> "(${worshipData.scriptures.reference} câu ${verseNum}) ${verseText}"\n`;
    setUserNotes(userNotes ? userNotes + addition : addition);
    setActiveSubTab("notes");
  };

  return (
    <div className="flex flex-col h-full bg-sanctuary-900 select-text">
      {/* Sub-tab switcher: Kinh Thánh vs Ghi Chú Cá Nhân */}
      <div className="flex border-b border-white/[0.08] bg-sanctuary-950 px-3 pt-2">
        <button
          onClick={() => setActiveSubTab("scripture")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
            activeSubTab === "scripture"
              ? "border-gold-400 text-gold-300 bg-sanctuary-850/60"
              : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Kinh Thánh & Dàn Ý</span>
        </button>
        <button
          onClick={() => setActiveSubTab("notes")}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-all ${
            activeSubTab === "notes"
              ? "border-gold-400 text-gold-300 bg-sanctuary-850/60"
              : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sổ Tay Bài Giảng</span>
          {userNotes.trim().length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
          )}
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {activeSubTab === "scripture" ? (
          <>
            {/* Scripture Header Card */}
            <div className="bg-sanctuary-850 border border-gold-400/20 rounded-md p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                <div>
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-gold-400">
                    Phân Đoạn Nền Tảng
                  </span>
                  <h3 className="font-serif text-base font-semibold text-sanctuary-100">
                    {worshipData.scriptures.reference}
                  </h3>
                </div>

                {/* Translation selector */}
                <select
                  value={selectedTranslation}
                  onChange={(e) => setSelectedTranslation(e.target.value)}
                  className="bg-sanctuary-900 border border-white/10 rounded text-[11px] text-sanctuary-200 px-2 py-1 focus:border-gold-400"
                >
                  <option value="BTT 1925">Bản Truyền Thống 1925</option>
                  <option value="BD 2011">Bản Dịch 2011</option>
                  <option value="BPT">Bản Phổ Thông</option>
                </select>
              </div>

              {/* Verses with Editorial Typography */}
              <div className="space-y-3 pt-1">
                {worshipData.scriptures.verses.map((verse) => (
                  <div
                    key={verse.verse}
                    className="group/verse relative pl-6 text-sm text-sanctuary-200 font-serif leading-relaxed hover:bg-gold-400/[0.04] p-1.5 rounded transition-colors"
                  >
                    <span className="absolute left-1 top-1.5 text-[11px] font-sans font-bold text-gold-400/90 select-none">
                      {verse.verse}
                    </span>
                    <p className="inline text-sanctuary-100">{verse.text}</p>
                    <button
                      onClick={() => handleAppendVerseToNotes(verse.text, verse.verse)}
                      className="opacity-0 group-hover/verse:opacity-100 text-[10px] ml-2 text-gold-400 hover:underline font-sans inline-flex items-center gap-0.5"
                      title="Chèn câu này vào ghi chú cá nhân"
                    >
                      + Trích dẫn vào sổ tay
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sermon Outline Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-sanctuary-400 font-sans">
                  Dàn Ý Bài Giảng Đồng Bộ
                </h4>
                <span className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Đang giảng điểm 2
                </span>
              </div>

              <div className="space-y-2.5">
                {worshipData.sermonOutline.map((section, idx) => {
                  const isCurrent = idx === 1; // Current outline point
                  return (
                    <div
                      key={section.id}
                      className={`p-3 rounded-md border transition-all ${
                        isCurrent
                          ? "bg-gold-400/[0.08] border-gold-400/40 shadow-sm"
                          : "bg-sanctuary-850/60 border-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h5
                          className={`font-serif text-sm font-medium ${
                            isCurrent ? "text-gold-300 font-semibold" : "text-sanctuary-200"
                          }`}
                        >
                          {section.title}
                        </h5>
                        <span className="text-[10px] font-mono text-sanctuary-400 shrink-0">
                          {section.verseRef}
                        </span>
                      </div>
                      <p className="text-xs text-sanctuary-300 leading-relaxed font-sans mb-2">
                        {section.summary}
                      </p>
                      <ul className="text-xs text-sanctuary-400 space-y-1 pl-4 list-disc marker:text-gold-400/70">
                        {section.points.map((pt, pIdx) => (
                          <li key={pIdx}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Sermon Notes Section */
          <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-sm font-medium text-sanctuary-100">
                  Ghi Chép Của Bạn
                </h4>
                <p className="text-[11px] text-sanctuary-400 font-sans">
                  Ghi chú được lưu trên trình duyệt của bạn
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyNotes}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-sanctuary-850 border border-white/10 hover:border-gold-400 text-sanctuary-200"
                  title="Sao chép toàn bộ ghi chú"
                >
                  {copiedNotes ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-gold-400" />
                  )}
                  <span>{copiedNotes ? "Đã chép" : "Sao chép"}</span>
                </button>
              </div>
            </div>

            {/* Reflection Textarea */}
            <div className="relative flex-1 min-h-[300px] flex flex-col">
              <textarea
                value={userNotes}
                onChange={handleNotesChange}
                placeholder="Ghi lại những Lời Chúa cảm động lòng bạn hôm nay, lời hứa nguyện hoặc câu hỏi cần suy ngẫm thêm..."
                className="w-full flex-1 min-h-[280px] bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md p-3 text-xs sm:text-sm text-sanctuary-100 leading-relaxed placeholder-sanctuary-500 resize-none font-serif focus:outline-none"
              />
            </div>

            {/* Bottom Actions for Notes */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-sanctuary-400">
                {userNotes.length} ký tự
              </span>
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif text-xs font-semibold rounded transition-colors shadow-sm"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã lưu thành công!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu Sổ Tay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
