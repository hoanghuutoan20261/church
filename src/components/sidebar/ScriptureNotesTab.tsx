"use client";

import React, { useState, useEffect, useRef } from "react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import {
  BIBLE_BOOKS,
  BibleBook,
  findBibleBook,
  parseScriptureQuery,
} from "@/data/bibleBooks";
import {
  BookOpen,
  FileText,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Sparkles,
  X,
  Plus,
  Share2,
  Bookmark,
  MessageSquare,
  Type,
  ExternalLink,
} from "lucide-react";

interface DisplayVerse {
  verse: number;
  text: string;
  textBtt?: string;
  textBdm?: string;
  textNiv?: string;
}

export const ScriptureNotesTab: React.FC = () => {
  const {
    church,
    userNotes,
    setUserNotes,
    saveUserNotes,
    addMessage,
    setActiveTab,
  } = useWorship();

  const [activeSubTab, setActiveSubTab] = useState<"scripture" | "notes">("scripture");

  // Scripture State
  const defaultBook = BIBLE_BOOKS.find((b) => b.id === "PSA") || BIBLE_BOOKS[18];
  const [currentBook, setCurrentBook] = useState<BibleBook>(defaultBook);
  const [currentChapter, setCurrentChapter] = useState<number>(23);
  const [verses, setVerses] = useState<DisplayVerse[]>([]);
  const [isLoadingVerses, setIsLoadingVerses] = useState<boolean>(false);
  const [highlightVerseStart, setHighlightVerseStart] = useState<number | null>(null);
  const [highlightVerseEnd, setHighlightVerseEnd] = useState<number | null>(null);

  // Search input
  const [searchInput, setSearchInput] = useState<string>("");

  // Modals for Book Picker & Chapter Picker
  const [showBookPicker, setShowBookPicker] = useState<boolean>(false);
  const [showChapterPicker, setShowChapterPicker] = useState<boolean>(false);
  const [bookPickerTestament, setBookPickerTestament] = useState<"all" | "OT" | "NT">("all");
  const [bookPickerSearch, setBookPickerSearch] = useState<string>("");

  // Reading Preferences
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [version, setVersion] = useState<"BTT" | "BDM" | "BILINGUAL">("BTT");

  // Copy / Notification Toast
  const [copiedToast, setCopiedToast] = useState<string | null>(null);
  const [savedNotesToast, setSavedNotesToast] = useState<boolean>(false);

  // Highlight scroll reference
  const highlightedRef = useRef<HTMLDivElement | null>(null);

  // 1. Fetch verses whenever Book, Chapter, or Version changes
  useEffect(() => {
    let isCancelled = false;
    async function fetchVerses() {
      setIsLoadingVerses(true);
      try {
        const verParam = version === "BDM" ? "BDM" : version === "BILINGUAL" ? "BILINGUAL" : "BTT";
        const res = await fetch(
          `/api/bible?book=${encodeURIComponent(currentBook.id)}&chapter=${currentChapter}&version=${encodeURIComponent(verParam)}`
        );
        const data = await res.json();
        if (data.success && !isCancelled) {
          setVerses(data.verses || []);
        }
      } catch (err) {
        console.error("Lỗi tải phân đoạn Kinh Thánh:", err);
      } finally {
        if (!isCancelled) setIsLoadingVerses(false);
      }
    }

    fetchVerses();
    return () => {
      isCancelled = true;
    };
  }, [currentBook.id, currentChapter, version]);

  // 2. Auto-scroll to highlighted verse if present
  useEffect(() => {
    if (highlightVerseStart && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightVerseStart, verses]);

  // 3. Jump to today's sermon scripture if available
  const handleJumpToSermonScripture = () => {
    const rawRef =
      church.currentService?.scriptureReference || worshipData.scriptureReference;
    if (!rawRef) return;

    const parsed = parseScriptureQuery(rawRef);
    if (parsed.book) {
      setCurrentBook(parsed.book);
      setCurrentChapter(parsed.chapter);
      setHighlightVerseStart(parsed.verseStart || null);
      setHighlightVerseEnd(parsed.verseEnd || null);
      setActiveSubTab("scripture");
      showToast(`Đã mở phân đoạn bài giảng: ${parsed.book.name} ${parsed.chapter}`);
    }
  };

  // 4. Handle Search Query (e.g. "Giăng 3:16", "Thi Thiên 23", "Epheso 2")
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const parsed = parseScriptureQuery(searchInput);
    if (parsed.book) {
      setCurrentBook(parsed.book);
      setCurrentChapter(parsed.chapter);
      setHighlightVerseStart(parsed.verseStart || null);
      setHighlightVerseEnd(parsed.verseEnd || null);
      setSearchInput("");
      showToast(`Đang hiển thị: ${parsed.book.name} chương ${parsed.chapter}`);
    } else {
      showToast("Không tìm thấy sách phù hợp. Vui lòng thử lại!");
    }
  };

  // Helper toast notification
  const showToast = (msg: string) => {
    setCopiedToast(msg);
    setTimeout(() => setCopiedToast(null), 2500);
  };

  // Navigate next / prev chapter
  const handlePrevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
      setHighlightVerseStart(null);
    }
  };

  const handleNextChapter = () => {
    if (currentChapter < currentBook.totalChapters) {
      setCurrentChapter(currentChapter + 1);
      setHighlightVerseStart(null);
    }
  };

  // Append verse to personal notes
  const handleAppendVerseToNotes = (verseItem: DisplayVerse) => {
    const quote = `\n> **${currentBook.name} ${currentChapter}:${verseItem.verse}** — "${verseItem.text}"\n`;
    setUserNotes(userNotes ? userNotes + quote : quote);
    showToast(`Đã chèn câu ${verseItem.verse} vào Sổ Tay Ghi Chú!`);
  };

  // Copy single verse to clipboard
  const handleCopySingleVerse = (verseItem: DisplayVerse) => {
    const textToCopy = `"${verseItem.text}" (${currentBook.name} ${currentChapter}:${verseItem.verse})`;
    navigator.clipboard.writeText(textToCopy);
    showToast(`Đã sao chép câu ${verseItem.verse}!`);
  };

  // Share verse into live community chat
  const handleShareToChat = (verseItem: DisplayVerse) => {
    const chatSnippet = `📖 "${verseItem.text}" (${currentBook.name} ${currentChapter}:${verseItem.verse})`;
    addMessage(chatSnippet);
    setActiveTab("chat");
  };

  // Save personal notes
  const handleSaveNotes = () => {
    saveUserNotes(userNotes);
    setSavedNotesToast(true);
    setTimeout(() => setSavedNotesToast(false), 2000);
  };

  // Copy all notes
  const handleCopyAllNotes = () => {
    const title = church.currentService?.title || worshipData.serviceTitle;
    const speaker = church.currentService?.speaker || worshipData.speaker;
    const fullText = `[GHI CHÚ BÀI GIẢNG — ${church.name}]\nChủ đề: ${title}\nDiễn giả: ${speaker}\nKinh Thánh nền tảng: ${currentBook.name} ${currentChapter}\nNgày: ${new Date().toLocaleDateString("vi-VN")}\n\n${userNotes}`;
    navigator.clipboard.writeText(fullText);
    showToast("Đã sao chép toàn bộ sổ tay ghi chú!");
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case "sm":
        return "text-xs leading-relaxed";
      case "base":
        return "text-sm leading-relaxed";
      case "lg":
        return "text-base leading-relaxed";
      case "xl":
        return "text-lg leading-loose";
    }
  };

  // Filter books for book picker modal
  const filteredBooks = BIBLE_BOOKS.filter((b) => {
    const matchTestament =
      bookPickerTestament === "all" || b.testament === bookPickerTestament;
    const matchSearch =
      bookPickerSearch.trim() === "" ||
      b.name.toLowerCase().includes(bookPickerSearch.toLowerCase()) ||
      b.englishName.toLowerCase().includes(bookPickerSearch.toLowerCase()) ||
      b.aliases.some((a) => a.includes(bookPickerSearch.toLowerCase()));
    return matchTestament && matchSearch;
  });

  return (
    <div className="flex flex-col h-full bg-sanctuary-900 select-text relative">
      {/* Toast Notification */}
      {copiedToast && (
        <div className="absolute top-12 inset-x-4 z-40 bg-gold-400 text-sanctuary-950 font-serif font-bold text-xs px-3 py-2 rounded-lg shadow-xl text-center animate-fadeIn border border-gold-300">
          {copiedToast}
        </div>
      )}

      {/* 1. Sub-Tab Switcher: Tra Cứu Kinh Thánh vs Sổ Tay Bài Giảng */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-sanctuary-950 px-3 pt-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveSubTab("scripture")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-medium border-b-2 transition-all cursor-pointer ${
              activeSubTab === "scripture"
                ? "border-gold-400 text-gold-300 bg-sanctuary-850/60 font-semibold"
                : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kinh Thánh Trực Tuyến</span>
          </button>

          <button
            onClick={() => setActiveSubTab("notes")}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-serif font-medium border-b-2 transition-all cursor-pointer ${
              activeSubTab === "notes"
                ? "border-gold-400 text-gold-300 bg-sanctuary-850/60 font-semibold"
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

        {/* Quick Button to Jump to Today's Sermon Scripture */}
        <button
          onClick={handleJumpToSermonScripture}
          className="px-2 py-1 rounded bg-gold-400/15 hover:bg-gold-400/25 border border-gold-400/30 text-[11px] font-serif text-gold-300 flex items-center gap-1 transition-colors cursor-pointer"
          title="Nhảy đến phân đoạn Kinh Thánh của bài giảng hôm nay"
        >
          <Bookmark className="w-3 h-3 text-gold-400 fill-gold-400/30 shrink-0" />
          <span className="hidden sm:inline">Câu gốc bài giảng</span>
        </button>
      </div>

      {/* ================= 2. TAB CONTENT: KINH THÁNH ================= */}
      {activeSubTab === "scripture" && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Search & Navigator Header */}
          <div className="p-3 bg-sanctuary-950/90 border-b border-white/[0.06] space-y-2.5">
            {/* Quick Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tra cứu: Giăng 3:16, Thi Thiên 23, Rô-ma 8..."
                className="w-full bg-sanctuary-850 border border-white/[0.1] focus:border-gold-400/60 rounded-lg pl-8 pr-16 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-sanctuary-400 absolute left-2.5 pointer-events-none" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="absolute right-12 text-sanctuary-500 hover:text-sanctuary-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1 px-2.5 py-1 rounded bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-[11px] transition-colors cursor-pointer"
              >
                Tra
              </button>
            </form>

            {/* Selector Bar: Book Dropdown + Chapter Dropdown + Version Selector */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                {/* Book Selector Button */}
                <button
                  onClick={() => setShowBookPicker(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 border border-white/[0.08] hover:border-gold-400/40 text-xs font-serif font-semibold text-gold-300 transition-colors cursor-pointer"
                  title="Chọn sách trong 66 sách Kinh Thánh"
                >
                  <span className="truncate">{currentBook.name}</span>
                  <ChevronDown className="w-3 h-3 text-gold-400 shrink-0" />
                </button>

                {/* Chapter Selector Button */}
                <button
                  onClick={() => setShowChapterPicker(true)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 border border-white/[0.08] hover:border-gold-400/40 text-xs font-mono font-medium text-sanctuary-200 transition-colors cursor-pointer"
                  title="Chọn chương"
                >
                  <span>Ch.{currentChapter}</span>
                  <ChevronDown className="w-3 h-3 text-sanctuary-400 shrink-0" />
                </button>

                {/* Next / Prev Chapter Controls */}
                <div className="flex items-center bg-sanctuary-850 border border-white/[0.08] rounded-lg overflow-hidden">
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapter <= 1}
                    className="p-1.5 hover:bg-sanctuary-800 text-sanctuary-300 disabled:opacity-30 transition-colors cursor-pointer"
                    title="Chương trước"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] text-sanctuary-500 font-mono px-0.5 select-none">
                    /
                  </span>
                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapter >= currentBook.totalChapters}
                    className="p-1.5 hover:bg-sanctuary-800 text-sanctuary-300 disabled:opacity-30 transition-colors cursor-pointer"
                    title="Chương tiếp theo"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Version & Font Controls */}
              <div className="flex items-center gap-1.5">
                {/* Version Selector */}
                <select
                  value={version}
                  onChange={(e) => setVersion(e.target.value as any)}
                  className="bg-sanctuary-850 border border-white/[0.08] rounded-lg text-[11px] text-sanctuary-300 px-2 py-1 focus:outline-none focus:border-gold-400 cursor-pointer"
                >
                  <option value="BTT">BTT 1925</option>
                  <option value="BDM">Bản Dịch Mới</option>
                  <option value="BILINGUAL">Song Ngữ (NIV)</option>
                </select>

                {/* Font Size Button */}
                <button
                  onClick={() => {
                    if (fontSize === "sm") setFontSize("base");
                    else if (fontSize === "base") setFontSize("lg");
                    else if (fontSize === "lg") setFontSize("xl");
                    else setFontSize("sm");
                  }}
                  className="p-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 border border-white/[0.08] text-[11px] font-serif font-bold transition-colors cursor-pointer"
                  title="Thay đổi cỡ chữ Kinh Thánh"
                >
                  <Type className="w-3.5 h-3.5 text-gold-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Verses Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoadingVerses ? (
              <div className="py-20 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-sanctuary-400 font-serif">
                  Đang mở Lời Chúa...
                </p>
              </div>
            ) : (
              <>
                {/* Chapter Title Header */}
                <div className="pb-3 border-b border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gold-400 font-semibold font-sans">
                      {currentBook.testament === "OT" ? "Cựu Ước" : "Tân Ước"} •{" "}
                      {currentBook.englishName}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-sanctuary-100">
                      {currentBook.name} — Chương {currentChapter}
                    </h3>
                  </div>

                  <span className="text-[10px] text-sanctuary-500 font-mono">
                    {verses.length} câu
                  </span>
                </div>

                {/* Verses List */}
                <div className="space-y-3 pt-1">
                  {verses.map((verseItem) => {
                    const isHighlighted =
                      highlightVerseStart &&
                      verseItem.verse >= highlightVerseStart &&
                      (!highlightVerseEnd || verseItem.verse <= highlightVerseEnd);

                    return (
                      <div
                        key={verseItem.verse}
                        ref={isHighlighted ? highlightedRef : null}
                        className={`group/verse relative p-2.5 rounded-lg transition-all border ${
                          isHighlighted
                            ? "bg-gold-400/10 border-gold-400/50 shadow-sm"
                            : "border-transparent hover:bg-sanctuary-850/60 hover:border-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Verse Number Badge */}
                          <span className="text-xs font-serif font-bold text-gold-400 select-none shrink-0 mt-0.5 w-5 text-right">
                            {verseItem.verse}
                          </span>

                          {/* Verse Text Content */}
                          <div className="flex-1 space-y-1">
                            <p
                              className={`font-serif text-sanctuary-100 ${getFontSizeClass()}`}
                            >
                              {verseItem.text}
                            </p>

                            {/* Bilingual English (NIV) Stack if selected */}
                            {version === "BILINGUAL" && verseItem.textNiv && (
                              <p className="text-xs text-sanctuary-400 font-sans italic pt-0.5">
                                {verseItem.textNiv}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Hover Action Bar */}
                        <div className="opacity-0 group-hover/verse:opacity-100 transition-opacity flex items-center justify-end gap-1.5 pt-1.5 mt-1 border-t border-white/[0.04]">
                          <button
                            onClick={() => handleAppendVerseToNotes(verseItem)}
                            className="text-[10px] text-gold-400 hover:text-gold-300 font-sans px-2 py-0.5 rounded bg-gold-400/10 hover:bg-gold-400/20 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Thêm trích dẫn câu này vào Sổ Tay Ghi Chú"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Trích dẫn vào sổ tay</span>
                          </button>

                          <button
                            onClick={() => handleCopySingleVerse(verseItem)}
                            className="text-[10px] text-sanctuary-400 hover:text-sanctuary-200 font-sans px-1.5 py-0.5 rounded hover:bg-sanctuary-800 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Sao chép câu gốc"
                          >
                            <Copy className="w-2.5 h-2.5" />
                            <span>Chép</span>
                          </button>

                          <button
                            onClick={() => handleShareToChat(verseItem)}
                            className="text-[10px] text-sanctuary-400 hover:text-sanctuary-200 font-sans px-1.5 py-0.5 rounded hover:bg-sanctuary-800 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Gửi câu Kinh Thánh này vào khung trò chuyện phòng thờ phượng"
                          >
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>Hiệp ý</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Chapter Navigation Bar */}
                <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs font-serif">
                  <button
                    onClick={handlePrevChapter}
                    disabled={currentChapter <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 disabled:opacity-30 border border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Chương trước</span>
                  </button>

                  <span className="text-[11px] text-sanctuary-400">
                    {currentBook.name} • {currentChapter} / {currentBook.totalChapters}
                  </span>

                  <button
                    onClick={handleNextChapter}
                    disabled={currentChapter >= currentBook.totalChapters}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 disabled:opacity-30 border border-white/[0.06] transition-colors cursor-pointer"
                  >
                    <span>Chương sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ================= 3. TAB CONTENT: SỔ TAY BÀI GIẢNG ================= */}
      {activeSubTab === "notes" && (
        <div className="flex-1 flex flex-col min-h-0 p-4 space-y-3">
          {/* Notes Header */}
          <div className="bg-sanctuary-850/80 border border-white/[0.08] rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-gold-400 font-semibold font-sans">
                Sổ Tay Thu Hoạch Linh Trình
              </span>
              <span className="text-[10px] text-sanctuary-400">
                Tự động lưu trên thiết bị
              </span>
            </div>
            <h4 className="font-serif text-sm font-bold text-sanctuary-100 truncate">
              {church.currentService?.title || worshipData.serviceTitle}
            </h4>
            <p className="text-xs text-sanctuary-400">
              Diễn giả:{" "}
              <strong className="text-stone-300 font-serif">
                {church.currentService?.speaker || worshipData.speaker}
              </strong>
            </p>
          </div>

          {/* Notes Textarea */}
          <div className="flex-1 flex flex-col relative min-h-0">
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Ghi chép những lẽ thật tâm đắc, bài học áp dụng hoặc câu gốc Lời Chúa được đánh thức trong tâm linh hôm nay...&#10;&#10;💡 Mẹo: Khi đọc Kinh Thánh, nhấp vào '+ Trích dẫn vào sổ tay' để chèn nhanh câu Lời Chúa vào đây."
              className="flex-1 w-full bg-sanctuary-950 border border-white/[0.08] focus:border-gold-400/60 rounded-xl p-3.5 text-xs sm:text-sm text-sanctuary-100 placeholder-sanctuary-600 focus:outline-none resize-none font-serif leading-relaxed"
            />
          </div>

          {/* Notes Bottom Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              onClick={() => {
                if (confirm("Quý vị có chắc chắn muốn làm mới sổ tay ghi chú?")) {
                  setUserNotes("");
                }
              }}
              className="text-xs text-red-400 hover:text-red-300 hover:underline transition-colors"
            >
              Làm mới
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAllNotes}
                className="px-3 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 border border-white/[0.08] text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sao chép toàn bộ ghi chú"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </button>

              <button
                onClick={handleSaveNotes}
                className="px-4 py-1.5 rounded-lg bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                {savedNotesToast ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-900" />
                    <span>Đã lưu!</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Lưu ghi chú</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. MODAL: CHỌN SÁCH KINH THÁNH (66 SÁCH) ================= */}
      {showBookPicker && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col p-4 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gold-400" />
              <h3 className="font-serif text-sm font-bold text-sanctuary-100">
                Chọn Sách Kinh Thánh (66 Sách)
              </h3>
            </div>
            <button
              onClick={() => setShowBookPicker(false)}
              className="p-1 rounded text-sanctuary-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="py-2.5 space-y-2 border-b border-white/[0.06]">
            <input
              type="text"
              value={bookPickerSearch}
              onChange={(e) => setBookPickerSearch(e.target.value)}
              placeholder="Tìm tên sách (ví dụ: Sáng thế, Thi thiên, Giăng, Rô-ma)..."
              className="w-full bg-sanctuary-850 border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none focus:border-gold-400"
            />

            {/* Testament Toggle */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setBookPickerTestament("all")}
                className={`flex-1 py-1 rounded-md text-[11px] font-serif transition-colors ${
                  bookPickerTestament === "all"
                    ? "bg-gold-400 text-sanctuary-950 font-bold"
                    : "bg-sanctuary-850 text-sanctuary-300 hover:bg-sanctuary-800"
                }`}
              >
                Toàn Bộ (66)
              </button>
              <button
                onClick={() => setBookPickerTestament("OT")}
                className={`flex-1 py-1 rounded-md text-[11px] font-serif transition-colors ${
                  bookPickerTestament === "OT"
                    ? "bg-gold-400 text-sanctuary-950 font-bold"
                    : "bg-sanctuary-850 text-sanctuary-300 hover:bg-sanctuary-800"
                }`}
              >
                Cựu Ước (39)
              </button>
              <button
                onClick={() => setBookPickerTestament("NT")}
                className={`flex-1 py-1 rounded-md text-[11px] font-serif transition-colors ${
                  bookPickerTestament === "NT"
                    ? "bg-gold-400 text-sanctuary-950 font-bold"
                    : "bg-sanctuary-850 text-sanctuary-300 hover:bg-sanctuary-800"
                }`}
              >
                Tân Ước (27)
              </button>
            </div>
          </div>

          {/* Books Grid Scrollable */}
          <div className="flex-1 overflow-y-auto pt-3 space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {filteredBooks.map((b) => {
                const isSelected = b.id === currentBook.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBook(b);
                      setCurrentChapter(1);
                      setHighlightVerseStart(null);
                      setShowBookPicker(false);
                      setShowChapterPicker(true);
                    }}
                    className={`flex flex-col items-start p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-gold-400/20 border-gold-400 text-gold-300 font-semibold"
                        : "bg-sanctuary-850/80 border-white/[0.05] text-sanctuary-200 hover:bg-sanctuary-800 hover:border-gold-400/30"
                    }`}
                  >
                    <span className="text-xs font-serif truncate w-full">{b.name}</span>
                    <span className="text-[10px] text-sanctuary-400 font-sans truncate">
                      {b.totalChapters} chương • {b.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. MODAL: CHỌN CHƯƠNG ================= */}
      {showChapterPicker && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col p-4 animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm font-bold text-gold-400">
                {currentBook.name}
              </span>
              <span className="text-xs text-sanctuary-300">
                — Chọn Chương (1 - {currentBook.totalChapters})
              </span>
            </div>
            <button
              onClick={() => setShowChapterPicker(false)}
              className="p-1 rounded text-sanctuary-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chapter Grid */}
          <div className="flex-1 overflow-y-auto pt-3">
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
              {Array.from({ length: currentBook.totalChapters }, (_, i) => i + 1).map(
                (chNum) => {
                  const isSelected = chNum === currentChapter;
                  return (
                    <button
                      key={chNum}
                      onClick={() => {
                        setCurrentChapter(chNum);
                        setHighlightVerseStart(null);
                        setShowChapterPicker(false);
                      }}
                      className={`h-10 rounded-lg border font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                        isSelected
                          ? "bg-gold-400 text-sanctuary-950 border-gold-300 shadow-md scale-105"
                          : "bg-sanctuary-850 border-white/[0.06] text-sanctuary-200 hover:bg-sanctuary-800 hover:border-gold-400/40"
                      }`}
                    >
                      {chNum}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScriptureNotesTab;
