"use client";

import React, { useState, useMemo } from "react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import {
  HYMNS_DATABASE,
  WorshipSong,
  transposeChordsLine,
  transposeChord,
} from "@/data/hymnsDataset";
import {
  X,
  Music2,
  ListOrdered,
  Search,
  Sliders,
  ChevronLeft,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  Guitar,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";

export const HymnalSheetModal: React.FC = () => {
  const { activeModal, closeModal, addMessage, setActiveTab } = useWorship();
  const [modalTab, setModalTab] = useState<"songbook" | "order">("songbook");

  // Songbook states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSong, setSelectedSong] = useState<WorshipSong | null>(
    HYMNS_DATABASE[0] || null
  );
  const [showChords, setShowChords] = useState(false);
  const [semitoneShift, setSemitoneShift] = useState(0);
  const [fontSizeLevel, setFontSizeLevel] = useState<"sm" | "base" | "lg">("base");
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [sharedToChatSuccess, setSharedToChatSuccess] = useState(false);

  // Filter songs
  const filteredSongs = useMemo(() => {
    return HYMNS_DATABASE.filter((song) => {
      // Category filter
      if (selectedCategory !== "all" && song.category !== selectedCategory) {
        return false;
      }
      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const numMatch = song.number ? song.number.toString().includes(q) : false;
      const titleMatch = song.title.toLowerCase().includes(q);
      const origMatch = song.originalTitle?.toLowerCase().includes(q);
      const authorMatch = song.author.toLowerCase().includes(q);
      const lyricsMatch = song.stanzas.some((st) =>
        st.lines.some((l) => l.toLowerCase().includes(q))
      );
      return numMatch || titleMatch || origMatch || authorMatch || lyricsMatch;
    });
  }, [searchQuery, selectedCategory]);

  if (activeModal !== "hymnal") return null;

  const { stages } = worshipData;

  const currentKey = selectedSong
    ? transposeChord(selectedSong.defaultKey, semitoneShift)
    : "";

  const handleCopyLyrics = () => {
    if (!selectedSong) return;
    const lines: string[] = [
      `${selectedSong.number ? `Thánh Ca #${selectedSong.number}: ` : ""}${selectedSong.title}`,
      selectedSong.originalTitle ? `(${selectedSong.originalTitle})` : "",
      `Tác giả: ${selectedSong.author}`,
      `Tone: ${currentKey}`,
      "",
    ];

    selectedSong.stanzas.forEach((stanza) => {
      lines.push(`--- ${stanza.label} ---`);
      stanza.lines.forEach((l) => lines.push(l));
      lines.push("");
    });

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const handleShareToChat = async () => {
    if (!selectedSong) return;
    const firstLine = selectedSong.stanzas[0]?.lines[0] || "";
    const msg = `🎵 Cùng tôn vinh Chúa qua bài: "${selectedSong.title}" (${firstLine})`;
    await addMessage(msg);
    setSharedToChatSuccess(true);
    setTimeout(() => {
      setSharedToChatSuccess(false);
      closeModal();
      setActiveTab("chat");
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="hymnal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-sanctuary-950 border border-gold-400/40 rounded-xl shadow-2xl flex flex-col h-[90vh] overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/[0.08] bg-sanctuary-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-400/15 border border-gold-400/30 flex items-center justify-center text-gold-300">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="hymnal-modal-title"
                className="font-serif text-base sm:text-lg font-bold text-sanctuary-100 flex items-center gap-2"
              >
                <span>Thánh Ca & Lời Tôn Vinh</span>
                <span className="hidden sm:inline-block text-[10px] font-sans font-normal px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300 border border-gold-400/30">
                  {HYMNS_DATABASE.length} bài hát
                </span>
              </h2>
              <p className="text-[11px] text-sanctuary-400 font-sans">
                Tra cứu bài hát thờ phượng, hợp âm tôn vinh và thứ tự buổi lễ
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-1.5 rounded-lg text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/[0.08] px-4 sm:px-6 bg-sanctuary-950 shrink-0">
          <button
            onClick={() => setModalTab("songbook")}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-serif font-medium border-b-2 transition-all ${
              modalTab === "songbook"
                ? "border-gold-400 text-gold-300 bg-sanctuary-900/60"
                : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
            }`}
          >
            <Music2 className="w-4 h-4" />
            <span>Kho Bài Hát & Hợp Âm</span>
          </button>

          <button
            onClick={() => setModalTab("order")}
            className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-serif font-medium border-b-2 transition-all ${
              modalTab === "order"
                ? "border-gold-400 text-gold-300 bg-sanctuary-900/60"
                : "border-transparent text-sanctuary-400 hover:text-sanctuary-200"
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Thứ Tự Buổi Lễ Thờ Phượng</span>
          </button>
        </div>

        {/* Tab Content: Songbook */}
        {modalTab === "songbook" && (
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* Left Column: Search & Song List */}
            <div className="w-full md:w-72 lg:w-80 border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col shrink-0 bg-sanctuary-900/30">
              {/* Search Bar */}
              <div className="p-3 border-b border-white/[0.06] space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-sanctuary-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo số bài, tên, lời..."
                    className="w-full bg-sanctuary-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none focus:border-gold-400/60"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sanctuary-400 hover:text-sanctuary-200 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === "all"
                        ? "bg-gold-400/20 text-gold-300 border border-gold-400/40"
                        : "text-sanctuary-400 hover:text-sanctuary-200 bg-sanctuary-850"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setSelectedCategory("traditional")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === "traditional"
                        ? "bg-gold-400/20 text-gold-300 border border-gold-400/40"
                        : "text-sanctuary-400 hover:text-sanctuary-200 bg-sanctuary-850"
                    }`}
                  >
                    Thánh Ca
                  </button>
                  <button
                    onClick={() => setSelectedCategory("contemporary")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === "contemporary"
                        ? "bg-gold-400/20 text-gold-300 border border-gold-400/40"
                        : "text-sanctuary-400 hover:text-sanctuary-200 bg-sanctuary-850"
                    }`}
                  >
                    Thờ Phượng Trẻ
                  </button>
                  <button
                    onClick={() => setSelectedCategory("praise")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-colors ${
                      selectedCategory === "praise"
                        ? "bg-gold-400/20 text-gold-300 border border-gold-400/40"
                        : "text-sanctuary-400 hover:text-sanctuary-200 bg-sanctuary-850"
                    }`}
                  >
                    Ca Ngợi
                  </button>
                </div>
              </div>

              {/* Song List Scrollable */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
                {filteredSongs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-sanctuary-400 font-sans space-y-1">
                    <p>Không tìm thấy bài hát phù hợp</p>
                    <p className="text-[10px] text-sanctuary-500">
                      Thử tìm theo số bài như &quot;415&quot; hoặc từ khóa &quot;bình an&quot;
                    </p>
                  </div>
                ) : (
                  filteredSongs.map((song) => {
                    const isSelected = selectedSong?.id === song.id;
                    return (
                      <button
                        key={song.id}
                        onClick={() => {
                          setSelectedSong(song);
                          setSemitoneShift(0);
                        }}
                        className={`w-full text-left p-3 transition-colors flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-gold-400/10 border-l-2 border-gold-400 text-sanctuary-100"
                            : "hover:bg-sanctuary-850/60 text-sanctuary-300"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded shrink-0 flex items-center justify-center text-xs font-mono font-bold ${
                            song.number
                              ? "bg-gold-400/15 text-gold-300 border border-gold-400/30"
                              : "bg-sanctuary-800 text-sanctuary-400"
                          }`}
                        >
                          {song.number ? song.number : "🎵"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-xs font-medium text-sanctuary-100 truncate">
                            {song.title}
                          </p>
                          <p className="text-[10px] text-sanctuary-400 truncate">
                            {song.originalTitle || song.author}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-sanctuary-500">
                            <span className="font-mono text-gold-400/80">Tone {song.defaultKey}</span>
                            <span>•</span>
                            <span className="truncate">{song.theme}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Song Viewer & Chords */}
            <div className="flex-1 min-h-0 flex flex-col bg-sanctuary-950 overflow-hidden">
              {selectedSong ? (
                <>
                  {/* Song Detail Toolbar */}
                  <div className="p-3 sm:p-4 border-b border-white/[0.08] bg-sanctuary-900/60 shrink-0 flex flex-wrap items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedSong.number && (
                          <span className="text-[11px] font-mono font-bold text-gold-400 bg-gold-400/15 px-2 py-0.5 rounded border border-gold-400/30">
                            TC #{selectedSong.number}
                          </span>
                        )}
                        <h3 className="font-serif text-base sm:text-lg font-bold text-sanctuary-100">
                          {selectedSong.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-sanctuary-400 italic font-serif">
                        {selectedSong.originalTitle ? `${selectedSong.originalTitle} — ` : ""}
                        {selectedSong.author}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Toggle Chords */}
                      <button
                        onClick={() => setShowChords(!showChords)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          showChords
                            ? "bg-gold-400/20 text-gold-300 border-gold-400/40"
                            : "bg-sanctuary-850 text-sanctuary-300 hover:text-white border-white/10"
                        }`}
                        title="Bật/Tắt hiển thị hợp âm cho nhạc cụ"
                      >
                        <Guitar className="w-3.5 h-3.5 text-gold-400" />
                        <span>Hợp Âm: {showChords ? "Bật" : "Tắt"}</span>
                      </button>

                      {/* Transpose Controls (only if chords on) */}
                      {showChords && (
                        <div className="flex items-center gap-1 bg-sanctuary-850 border border-white/10 rounded-lg p-0.5 text-xs">
                          <button
                            onClick={() => setSemitoneShift((prev) => prev - 1)}
                            className="px-2 py-1 text-sanctuary-300 hover:text-gold-300 font-mono font-bold"
                            title="Hạ nửa cung"
                          >
                            -
                          </button>
                          <span className="px-1 text-[11px] font-mono text-gold-300 font-semibold">
                            {currentKey}
                            {semitoneShift !== 0 && (
                              <span className="text-[9px] text-sanctuary-400 ml-0.5">
                                ({semitoneShift > 0 ? `+${semitoneShift}` : semitoneShift})
                              </span>
                            )}
                          </span>
                          <button
                            onClick={() => setSemitoneShift((prev) => prev + 1)}
                            className="px-2 py-1 text-sanctuary-300 hover:text-gold-300 font-mono font-bold"
                            title="Nâng nửa cung"
                          >
                            +
                          </button>
                          {semitoneShift !== 0 && (
                            <button
                              onClick={() => setSemitoneShift(0)}
                              className="text-[9px] text-sanctuary-400 hover:text-sanctuary-200 px-1 border-l border-white/10"
                              title="Khôi phục tông gốc"
                            >
                              Gốc
                            </button>
                          )}
                        </div>
                      )}

                      {/* Font size */}
                      <div className="flex items-center bg-sanctuary-850 border border-white/10 rounded-lg p-0.5 text-xs">
                        <button
                          onClick={() => setFontSizeLevel("sm")}
                          className={`px-1.5 py-1 rounded text-[11px] ${
                            fontSizeLevel === "sm" ? "text-gold-300 font-bold bg-white/5" : "text-sanctuary-400"
                          }`}
                          title="Cỡ chữ nhỏ"
                        >
                          A-
                        </button>
                        <button
                          onClick={() => setFontSizeLevel("base")}
                          className={`px-1.5 py-1 rounded text-[11px] ${
                            fontSizeLevel === "base" ? "text-gold-300 font-bold bg-white/5" : "text-sanctuary-400"
                          }`}
                          title="Cỡ chữ tiêu chuẩn"
                        >
                          A
                        </button>
                        <button
                          onClick={() => setFontSizeLevel("lg")}
                          className={`px-1.5 py-1 rounded text-[11px] ${
                            fontSizeLevel === "lg" ? "text-gold-300 font-bold bg-white/5" : "text-sanctuary-400"
                          }`}
                          title="Cỡ chữ lớn"
                        >
                          A+
                        </button>
                      </div>

                      {/* Copy Lyrics */}
                      <button
                        onClick={handleCopyLyrics}
                        className="p-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-sanctuary-100 border border-white/10 transition-colors"
                        title="Sao chép toàn bộ lời bài hát"
                      >
                        {copiedSuccess ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Share to Chat */}
                      <button
                        onClick={handleShareToChat}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 border border-gold-400/30 text-xs transition-colors"
                        title="Chia sẻ bài hát vào khung chat chung"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">
                          {sharedToChatSuccess ? "Đã gửi vào chat!" : "Gửi vào Chat"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Lyrics Display Scrollable */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                    {/* Song Metadata Banner */}
                    <div className="flex items-center justify-between text-xs text-sanctuary-400 border-b border-white/[0.06] pb-3">
                      <div className="flex items-center gap-3">
                        <span>
                          Tông: <strong className="text-gold-300 font-mono">{currentKey}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Nhịp: <strong className="text-sanctuary-200">{selectedSong.timeSignature}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Điệu: <strong className="text-sanctuary-200">{selectedSong.tempo}</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-sanctuary-500 font-serif">
                        {selectedSong.categoryName}
                      </span>
                    </div>

                    {/* Stanzas */}
                    <div className="space-y-6 max-w-xl mx-auto">
                      {selectedSong.stanzas.map((stanza) => {
                        const isChorus = stanza.id.startsWith("c");
                        return (
                          <div
                            key={stanza.id}
                            className={`p-4 rounded-xl border transition-colors ${
                              isChorus
                                ? "bg-gold-400/[0.05] border-gold-400/30 shadow-sm"
                                : "bg-sanctuary-900/40 border-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2.5">
                              <span
                                className={`text-[11px] font-serif font-bold uppercase tracking-wider ${
                                  isChorus ? "text-gold-400" : "text-sanctuary-400"
                                }`}
                              >
                                {stanza.label}
                              </span>
                            </div>

                            <div className="space-y-2 font-serif">
                              {stanza.lines.map((line, idx) => {
                                const chordLine = stanza.chordsLines?.[idx];
                                const transposedChordLine =
                                  chordLine && showChords
                                    ? transposeChordsLine(chordLine, semitoneShift)
                                    : null;

                                return (
                                  <div key={idx} className="space-y-0.5">
                                    {showChords && transposedChordLine && (
                                      <p className="font-mono text-xs font-bold text-gold-400/90 whitespace-pre tracking-wide">
                                        {transposedChordLine}
                                      </p>
                                    )}
                                    <p
                                      className={`text-sanctuary-100 leading-relaxed ${
                                        fontSizeLevel === "sm"
                                          ? "text-xs sm:text-sm"
                                          : fontSizeLevel === "lg"
                                          ? "text-base sm:text-lg"
                                          : "text-sm sm:text-base"
                                      }`}
                                    >
                                      {line}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-center text-sanctuary-400 font-sans">
                  Chọn một bài hát từ danh sách bên trái để xem lời và hợp âm
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab Content: Order of Worship */}
        {modalTab === "order" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-2xl mx-auto w-full">
            <div className="border-b border-white/[0.06] pb-3">
              <h3 className="font-serif text-lg font-bold text-sanctuary-100">
                Chương Trình Lễ Thờ Phượng Chúa Nhật
              </h3>
              <p className="text-xs text-sanctuary-400 font-sans">
                Tiến trình các tiết mục trong buổi lễ theo thời gian quy định
              </p>
            </div>

            <div className="space-y-2.5">
              {stages.map((stage) => {
                const isCurrent = stage.status === "current";
                const isCompleted = stage.status === "completed";
                return (
                  <div
                    key={stage.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
                      isCurrent
                        ? "bg-gold-400/10 border-gold-400/50 text-gold-300 shadow-sm"
                        : "bg-sanctuary-900/60 border-white/[0.06] text-sanctuary-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/30 text-sanctuary-400 border border-white/5">
                        {stage.time}
                      </span>
                      <span className="font-serif font-medium">{stage.name}</span>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="text-[10px] uppercase font-semibold text-gold-400 bg-gold-400/20 px-2.5 py-1 rounded-full border border-gold-400/40 animate-pulse">
                          Đang diễn ra
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] text-sanctuary-500">
                          ✓ Đã hoàn tất
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
