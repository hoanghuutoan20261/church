"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  HYMNS_DATABASE,
  WorshipSong,
  SongStanza,
  transposeChordsLine,
  transposeChord,
} from "@/data/hymnsDataset";
import { parseScriptureQuery } from "@/data/bibleBooks";
import { getChapterVerses } from "@/data/bibleDataset";
import {
  Music2,
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  Search,
  Sparkles,
  Tv,
  Check,
  AlertCircle,
  Plus,
  RefreshCw,
  Eye,
  Keyboard,
  Sliders,
  Guitar,
  BookOpen,
  ListOrdered,
  Trash2,
  ArrowRight,
  Clock,
  Layers,
  Radio,
  FileText,
  Flame,
  Volume2,
  Settings2,
  Maximize2,
  FolderOpen,
} from "lucide-react";

interface AdminLyricsPresenterProps {
  churchSlug: string;
  initialLyrics?: {
    isEnabled: boolean;
    songId?: string;
    songNumber?: number | null;
    songTitle?: string;
    stanzaIndex?: number;
    stanzaLabel?: string;
    lines?: string[];
  };
}

export interface PlaylistItem {
  id: string;
  song: WorshipSong;
  note?: string;
}

export const AdminLyricsPresenter: React.FC<AdminLyricsPresenterProps> = ({
  churchSlug,
  initialLyrics,
}) => {
  // Service Setlist / Playlist for today's service
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([
    {
      id: "pl-1",
      song: HYMNS_DATABASE.find((s) => s.id === "tc-23") || HYMNS_DATABASE[2],
      note: "Tôn Vinh Khai Lễ",
    },
    {
      id: "pl-2",
      song: HYMNS_DATABASE.find((s) => s.id === "cp-10000reasons") || HYMNS_DATABASE[7],
      note: "Ngợi Khen Ban Hát",
    },
    {
      id: "pl-3",
      song: HYMNS_DATABASE.find((s) => s.id === "cp-howgreat") || HYMNS_DATABASE[6],
      note: "Tôn Cao Danh Chúa",
    },
    {
      id: "pl-4",
      song: HYMNS_DATABASE.find((s) => s.id === "tc-415") || HYMNS_DATABASE[0],
      note: "Thờ Phượng & Tĩnh Nguyện",
    },
    {
      id: "pl-5",
      song: HYMNS_DATABASE.find((s) => s.id === "cp-thankyoulord") || HYMNS_DATABASE[11],
      note: "Cầu Nguyện & Dâng Hiến",
    },
  ]);

  // Selected song currently active in the operator deck
  const [selectedSong, setSelectedSong] = useState<WorshipSong>(
    HYMNS_DATABASE.find((s) => s.id === initialLyrics?.songId) || playlist[0]?.song || HYMNS_DATABASE[0]
  );

  // Projection state (Program Out)
  const [isProjecting, setIsProjecting] = useState<boolean>(
    Boolean(initialLyrics?.isEnabled)
  );
  const [activeStanzaIndex, setActiveStanzaIndex] = useState<number>(
    initialLyrics?.stanzaIndex ?? 0
  );
  const [currentProjectedLines, setCurrentProjectedLines] = useState<string[]>(
    initialLyrics?.lines || []
  );

  // Preview / Next Stanza Index
  const [previewStanzaIndex, setPreviewStanzaIndex] = useState<number>(
    (initialLyrics?.stanzaIndex ?? 0) + 1 < (selectedSong?.stanzas?.length || 1)
      ? (initialLyrics?.stanzaIndex ?? 0) + 1
      : 0
  );

  // Status feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  // Navigation & Tool states
  const [activeNavTab, setActiveNavTab] = useState<"playlist" | "library" | "scripture">("playlist");
  const [songSearch, setSongSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showPresenterChords, setShowPresenterChords] = useState(false);
  const [semitoneShift, setSemitoneShift] = useState(0);

  // Display style customization
  const [displayStyle, setDisplayStyle] = useState<"lowerthird" | "subtitle" | "fullscreen">("lowerthird");
  const [activeThemeColor, setActiveThemeColor] = useState<"gold" | "white" | "teal">("gold");

  // Scripture Quick Inject state
  const [scriptureQuery, setScriptureQuery] = useState("Giăng 3:16");
  const [scriptureResult, setScriptureResult] = useState<{
    reference: string;
    text: string;
  } | null>(null);

  // Custom song form
  const [customTitle, setCustomTitle] = useState("");
  const [customKey, setCustomKey] = useState("C");
  const [customContent, setCustomContent] = useState("");

  // Clock
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter library songs
  const filteredLibrarySongs = useMemo(() => {
    return HYMNS_DATABASE.filter((song) => {
      if (categoryFilter !== "all" && song.category !== categoryFilter) {
        return false;
      }
      if (!songSearch.trim()) return true;
      const q = songSearch.toLowerCase().trim();
      const numMatch = song.number ? song.number.toString().includes(q) : false;
      const titleMatch = song.title.toLowerCase().includes(q);
      const lyricsMatch = song.stanzas.some((st) =>
        st.lines.some((l) => l.toLowerCase().includes(q))
      );
      return numMatch || titleMatch || lyricsMatch;
    });
  }, [songSearch, categoryFilter]);

  // Master API Broadcast Call
  const broadcastLyrics = useCallback(
    async (
      enabled: boolean,
      song: WorshipSong,
      stanzaIdx: number,
      lines: string[]
    ) => {
      setIsSaving(true);
      try {
        const payload = {
          isEnabled: enabled,
          songId: song.id,
          songNumber: song.number,
          songTitle: song.title,
          originalTitle: song.originalTitle,
          stanzaIndex: stanzaIdx,
          stanzaLabel: song.stanzas[stanzaIdx]?.label || "",
          lines: enabled ? lines : [],
        };

        const res = await fetch("/api/lyrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setIsProjecting(enabled);
          setActiveStanzaIndex(stanzaIdx);
          setCurrentProjectedLines(enabled ? lines : []);

          // Calculate next preview slide
          const nextIdx = stanzaIdx + 1 < song.stanzas.length ? stanzaIdx + 1 : 0;
          setPreviewStanzaIndex(nextIdx);

          setSaveMessage(
            enabled
              ? `LIVE: ${song.title} (${song.stanzas[stanzaIdx]?.label})`
              : "Đã xóa màn hình (Clear Screen)"
          );
          setTimeout(() => setSaveMessage(""), 2000);
        } else {
          setSaveMessage("Lỗi gửi dữ liệu phát sóng");
        }
      } catch {
        setSaveMessage("Lỗi kết nối máy chủ");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  // Project a specific stanza
  const handleProjectStanza = (index: number) => {
    if (!selectedSong.stanzas[index]) return;
    broadcastLyrics(
      true,
      selectedSong,
      index,
      selectedSong.stanzas[index].lines
    );
  };

  // Master Blackout / Clear All
  const handleClearAll = () => {
    broadcastLyrics(false, selectedSong, activeStanzaIndex, []);
  };

  // Next Stanza (Space / ArrowDown / ArrowRight)
  const handleNextStanza = useCallback(() => {
    if (!selectedSong.stanzas || selectedSong.stanzas.length === 0) return;
    const nextIdx =
      activeStanzaIndex < selectedSong.stanzas.length - 1
        ? activeStanzaIndex + 1
        : 0;
    handleProjectStanza(nextIdx);
  }, [activeStanzaIndex, selectedSong]);

  // Prev Stanza (ArrowUp / ArrowLeft)
  const handlePrevStanza = useCallback(() => {
    if (!selectedSong.stanzas || selectedSong.stanzas.length === 0) return;
    const prevIdx =
      activeStanzaIndex > 0
        ? activeStanzaIndex - 1
        : selectedSong.stanzas.length - 1;
    handleProjectStanza(prevIdx);
  }, [activeStanzaIndex, selectedSong]);

  // Quick Jump to Chorus
  const handleJumpToChorus = () => {
    const chorusIdx = selectedSong.stanzas.findIndex(
      (s) =>
        s.id.startsWith("c") ||
        s.label.toLowerCase().includes("điệp") ||
        s.label.toLowerCase().includes("chorus")
    );
    if (chorusIdx !== -1) {
      handleProjectStanza(chorusIdx);
    } else {
      handleProjectStanza(0);
    }
  };

  // Quick Jump to Verse 1
  const handleJumpToVerse1 = () => {
    handleProjectStanza(0);
  };

  // Switch to next song in playlist
  const handleNextSongInPlaylist = () => {
    const currentIdx = playlist.findIndex((p) => p.song.id === selectedSong.id);
    if (currentIdx !== -1 && currentIdx < playlist.length - 1) {
      const nextSong = playlist[currentIdx + 1].song;
      setSelectedSong(nextSong);
      setActiveStanzaIndex(0);
      setSemitoneShift(0);
      if (isProjecting) {
        broadcastLyrics(true, nextSong, 0, nextSong.stanzas[0].lines);
      }
    }
  };

  // Add song from library to today's playlist
  const handleAddToPlaylist = (song: WorshipSong) => {
    if (playlist.some((p) => p.song.id === song.id)) {
      setSaveMessage(`Bài "${song.title}" đã có trong chương trình`);
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }
    const newItem: PlaylistItem = {
      id: `pl-${Date.now()}`,
      song,
      note: "Hát ca ngợi",
    };
    setPlaylist([...playlist, newItem]);
    setSaveMessage(`Đã thêm "${song.title}" vào chương trình`);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // Remove from playlist
  const handleRemoveFromPlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylist(playlist.filter((p) => p.id !== id));
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === " " || e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleNextStanza();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevStanza();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C" || e.key === "F1") {
        e.preventDefault();
        handleClearAll();
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleJumpToChorus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextStanza, handlePrevStanza, handleClearAll, selectedSong]);

  // Quick Scripture search and project
  const handleSearchScripture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptureQuery.trim()) return;
    const parsed = parseScriptureQuery(scriptureQuery);
    if (!parsed.book) {
      alert("Không tìm thấy sách Kinh Thánh phù hợp.");
      return;
    }
    const verses = getChapterVerses(parsed.book.id, parsed.chapter, parsed.book.name);
    let targetLines: string[] = [];
    if (parsed.verseStart) {
      const end = parsed.verseEnd || parsed.verseStart;
      const selected = verses.filter(
        (v) => v.verse >= parsed.verseStart! && v.verse <= end
      );
      if (selected.length > 0) {
        targetLines = selected.map((v) => `[${v.verse}] ${v.text}`);
      }
    }
    if (targetLines.length === 0 && verses.length > 0) {
      targetLines = verses.slice(0, 3).map((v) => `[${v.verse}] ${v.text}`);
    }

    const ref = `${parsed.book.name} ${parsed.chapter}${
      parsed.verseStart ? `:${parsed.verseStart}${parsed.verseEnd ? `-${parsed.verseEnd}` : ""}` : ""
    }`;

    setScriptureResult({
      reference: ref,
      text: targetLines.join(" "),
    });

    // Create virtual scripture song and project immediately
    const scriptureSong: WorshipSong = {
      id: `scripture-${Date.now()}`,
      title: ref,
      author: "Lời Chúa",
      category: "praise",
      categoryName: "Kinh Thánh",
      defaultKey: "",
      tempo: "",
      timeSignature: "",
      theme: "Lời Chúa",
      stanzas: [
        {
          id: "sc-1",
          label: ref,
          lines: targetLines,
        },
      ],
    };

    setSelectedSong(scriptureSong);
    broadcastLyrics(true, scriptureSong, 0, targetLines);
  };

  // Add custom song
  const handleAddCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customContent.trim()) return;

    const blocks = customContent.split(/\n\s*\n/);
    const stanzas: SongStanza[] = blocks.map((block, idx) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return {
        id: `custom-${idx + 1}`,
        label: idx === 0 ? "Câu 1" : idx === 1 ? "Điệp khúc" : `Câu ${idx}`,
        lines,
      };
    });

    const newSong: WorshipSong = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      author: "Hội Thánh",
      category: "contemporary",
      categoryName: "Tự Do / Đặc Biệt",
      defaultKey: customKey || "C",
      tempo: "Vừa phải",
      timeSignature: "4/4",
      theme: "Tôn Vinh",
      stanzas,
    };

    setSelectedSong(newSong);
    setActiveStanzaIndex(0);
    setPlaylist([...playlist, { id: `pl-${Date.now()}`, song: newSong, note: "Bài tự biên" }]);
    setShowCustomModal(false);
    setCustomTitle("");
    setCustomContent("");
    setSaveMessage(`Đã nạp bài hát mới: ${newSong.title}`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const currentKey = selectedSong.defaultKey
    ? transposeChord(selectedSong.defaultKey, semitoneShift)
    : "";

  const nextStanza = selectedSong?.stanzas?.[previewStanzaIndex];

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ================= 1. MASTER PRODUCTION HEADER ================= */}
      <div className="bg-gradient-to-r from-stone-900 via-[#16181d] to-stone-900 border border-stone-800 rounded-xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Studio Badge & Live Tally Light */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-stone-950 border border-stone-700/60 flex items-center justify-center text-[#c5a059] shadow-inner">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-sm sm:text-base font-bold text-stone-100 tracking-wide flex items-center gap-2">
                <span>Trình Chiếu Thánh Ca Chuyên Nghiệp</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-[#c5a059] border border-[#c5a059]/30">
                  v2.0 Pro
                </span>
              </h2>

              {/* Tally Light */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border transition-all ${
                  isProjecting
                    ? "bg-red-500/20 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse"
                    : "bg-stone-850 text-stone-400 border-stone-700"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isProjecting ? "bg-red-500" : "bg-stone-500"
                  }`}
                />
                <span>{isProjecting ? "ON-AIR (ĐANG CHIẾU)" : "STANDBY (CHỜ)"}</span>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 font-sans flex items-center gap-2 mt-0.5">
              <span>Đang chọn:</span>
              <strong className="text-stone-200 font-serif font-semibold">
                {selectedSong.number ? `TC #${selectedSong.number} — ` : ""}
                {selectedSong.title}
              </strong>
              {currentKey && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="font-mono text-[#c5a059]">Tone: {currentKey}</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right: Master Emergency & Broadcast Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {saveMessage && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1 rounded-md animate-fade-in shadow-sm">
              {saveMessage}
            </span>
          )}

          {/* Quick Jump to Chorus Button */}
          <button
            onClick={handleJumpToChorus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-serif font-medium transition-all shadow-sm"
            title="Nhảy nhanh đến Điệp khúc (Phím tắt: D)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Điệp Khúc (D)</span>
          </button>

          {/* Quick Jump to Verse 1 Button */}
          <button
            onClick={handleJumpToVerse1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 text-xs font-serif font-medium transition-all shadow-sm"
            title="Quay lại câu đầu tiên"
          >
            <span>Câu 1</span>
          </button>

          {/* Clear All / Blackout Button */}
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-serif font-bold transition-all shadow-sm"
            title="Tắt toàn bộ chữ trên màn hình ngay tức thì (Phím ESC hoặc C hoặc F1)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>CLEAR (ESC)</span>
          </button>

          {/* Studio Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/40 border border-stone-800 px-3 py-1 rounded-lg text-xs font-mono text-stone-300">
            <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>{currentTime || "09:00:00"}</span>
          </div>
        </div>
      </div>

      {/* ================= 2. THREE-PANEL MASTER WORKSPACE (Full-Width Responsive) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[760px] h-[calc(100vh-200px)]">
        {/* PANEL 1: SETLIST & LIBRARY (3 Columns) */}
        <div className="lg:col-span-3 bg-[#131519] border border-stone-800/90 rounded-xl flex flex-col overflow-hidden shadow-lg">
          {/* Top Tab Bar */}
          <div className="flex border-b border-stone-800 bg-stone-900/70 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveNavTab("playlist")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-serif font-medium rounded-lg transition-all ${
                activeNavTab === "playlist"
                  ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Chương Trình ({playlist.length})</span>
            </button>

            <button
              onClick={() => setActiveNavTab("library")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-serif font-medium rounded-lg transition-all ${
                activeNavTab === "library"
                  ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Kho Thánh Ca</span>
            </button>

            <button
              onClick={() => setActiveNavTab("scripture")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-serif font-medium rounded-lg transition-all ${
                activeNavTab === "scripture"
                  ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
              title="Chiếu Kinh Thánh tức thời"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lời Chúa</span>
            </button>
          </div>

          {/* TAB 1: SETLIST (Chương trình buổi nhóm) */}
          {activeNavTab === "playlist" && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-2.5 border-b border-stone-800/70 flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-serif">Thứ tự các bài hát Chúa Nhật</span>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="text-[#c5a059] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tự Soạn</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {playlist.map((item, idx) => {
                  const isCurrent = selectedSong.id === item.song.id;
                  const isLiveThis = isCurrent && isProjecting;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedSong(item.song);
                        setActiveStanzaIndex(0);
                        setSemitoneShift(0);
                      }}
                      className={`group p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isLiveThis
                          ? "bg-red-950/30 border-red-500/60 text-stone-100 shadow-md ring-1 ring-red-500/30"
                          : isCurrent
                          ? "bg-[#c5a059]/15 border-[#c5a059]/60 text-stone-100 shadow-sm"
                          : "bg-stone-900/50 border-stone-800/70 hover:bg-stone-850 text-stone-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                            isLiveThis
                              ? "bg-red-500 text-white animate-pulse"
                              : isCurrent
                              ? "bg-[#c5a059] text-stone-950"
                              : "bg-stone-800 text-stone-400"
                          }`}
                        >
                          {idx + 1}
                        </div>

                        <div className="min-w-0">
                          <p className="font-serif text-xs font-bold truncate">
                            {item.song.number ? `#${item.song.number} ` : ""}
                            {item.song.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400">
                            <span className="text-[#c5a059]/90 font-mono">Tone {item.song.defaultKey}</span>
                            <span>•</span>
                            <span className="truncate">{item.note || item.song.categoryName}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleRemoveFromPlaylist(item.id, e)}
                          className="p-1 text-stone-500 hover:text-red-400 transition-colors"
                          title="Xóa khỏi chương trình"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LIBRARY (Kho bài hát) */}
          {activeNavTab === "library" && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Search */}
              <div className="p-2 border-b border-stone-800/70 space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={songSearch}
                    onChange={(e) => setSongSearch(e.target.value)}
                    placeholder="Tìm số bài, tựa đề, lời ca..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto text-[10px] scrollbar-none">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap ${
                      categoryFilter === "all"
                        ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setCategoryFilter("traditional")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap ${
                      categoryFilter === "traditional"
                        ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    Thánh Ca
                  </button>
                  <button
                    onClick={() => setCategoryFilter("contemporary")}
                    className={`px-2 py-0.5 rounded-full whitespace-nowrap ${
                      categoryFilter === "contemporary"
                        ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    Thờ Phượng Trẻ
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-stone-800/40">
                {filteredLibrarySongs.map((song) => {
                  const isSelected = selectedSong.id === song.id;
                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        setSelectedSong(song);
                        setActiveStanzaIndex(0);
                        setSemitoneShift(0);
                      }}
                      className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-[#c5a059]/15 border border-[#c5a059]/40 text-stone-100"
                          : "hover:bg-stone-850/60 text-stone-300"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-serif text-xs font-semibold truncate">
                          {song.number ? `TC #${song.number}: ` : ""}
                          {song.title}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate">
                          {song.originalTitle || song.author}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToPlaylist(song);
                        }}
                        className="p-1 rounded bg-stone-800 hover:bg-[#c5a059] text-stone-400 hover:text-stone-950 transition-colors shrink-0"
                        title="Thêm vào chương trình Chúa Nhật"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: SCRIPTURE QUICK INJECT (Chiếu Kinh Thánh cấp tốc) */}
          {activeNavTab === "scripture" && (
            <div className="flex-1 p-3 flex flex-col space-y-3">
              <div className="text-xs text-stone-300 font-serif font-bold">
                Chiếu Nhanh Câu Lời Chúa
              </div>
              <p className="text-[11px] text-stone-400">
                Nhập câu Kinh Thánh khi Diễn Giả nhắc đến để chiếu ngay lên màn hình
              </p>

              <form onSubmit={handleSearchScripture} className="space-y-2">
                <input
                  type="text"
                  value={scriptureQuery}
                  onChange={(e) => setScriptureQuery(e.target.value)}
                  placeholder="Ví dụ: Giăng 3:16 hoặc Thi Thiên 23"
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-stone-950 font-serif font-bold text-xs shadow-candle"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Chiếu Lên Màn Hình Ngay</span>
                </button>
              </form>

              {scriptureResult && (
                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-1 text-xs">
                  <p className="font-serif font-bold text-[#c5a059]">
                    {scriptureResult.reference}
                  </p>
                  <p className="font-serif text-stone-300 text-[11px] line-clamp-4">
                    {scriptureResult.text}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL 2: SLIDE MATRIX CONTROLLER (5 Columns) */}
        <div className="lg:col-span-5 bg-[#131519] border border-stone-800/90 rounded-xl flex flex-col overflow-hidden shadow-lg">
          {/* Song Header & Pitch Transposition Bar */}
          <div className="p-3 border-b border-stone-800 bg-stone-900/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                {selectedSong.number && (
                  <span className="text-[11px] font-mono font-bold text-[#c5a059] bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30">
                    TC #{selectedSong.number}
                  </span>
                )}
                <h3 className="font-serif text-sm sm:text-base font-bold text-stone-100 truncate max-w-xs">
                  {selectedSong.title}
                </h3>
              </div>
              <p className="text-[10px] text-stone-400 italic font-serif">
                {selectedSong.originalTitle || selectedSong.author}
              </p>
            </div>

            {/* Chords & Transposition Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPresenterChords(!showPresenterChords)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  showPresenterChords
                    ? "bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/40"
                    : "bg-stone-800 text-stone-400 border-stone-700"
                }`}
                title="Bật/Tắt hợp âm"
              >
                <Guitar className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="text-[11px]">Hợp Âm</span>
              </button>

              {showPresenterChords && selectedSong.defaultKey && (
                <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setSemitoneShift((prev) => prev - 1)}
                    className="px-1.5 py-0.5 text-stone-400 hover:text-stone-100 font-mono font-bold"
                    title="Hạ nửa cung"
                  >
                    -
                  </button>
                  <span className="px-1 text-[11px] font-mono text-[#c5a059] font-bold">
                    {currentKey}
                  </span>
                  <button
                    onClick={() => setSemitoneShift((prev) => prev + 1)}
                    className="px-1.5 py-0.5 text-stone-400 hover:text-stone-100 font-mono font-bold"
                    title="Tăng nửa cung"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Bar: Prev / Next / Hotkeys */}
          <div className="px-3 py-2 border-b border-stone-800/80 bg-stone-950/60 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevStanza}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs transition-colors"
                title="Phím mũi tên Trái hoặc Lên"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước</span>
              </button>

              <button
                onClick={handleNextStanza}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-stone-950 font-serif font-bold text-xs transition-all shadow-candle"
                title="Phím Space hoặc mũi tên Phải/Xuống"
              >
                <span>Tiếp Theo (Space)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
              <Keyboard className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Space: Kế tiếp | ESC: Tắt</span>
            </div>
          </div>

          {/* Slide Deck Grid (Scrollable Matrix) */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 xl:grid-cols-2 gap-2.5 content-start">
            {selectedSong.stanzas.map((stanza, idx) => {
              const isLive = idx === activeStanzaIndex && isProjecting;
              const isNext = idx === previewStanzaIndex && isProjecting;
              const isChorus =
                stanza.id.startsWith("c") ||
                stanza.label.toLowerCase().includes("điệp") ||
                stanza.label.toLowerCase().includes("chorus");
              const isBridge =
                stanza.id.startsWith("b") ||
                stanza.label.toLowerCase().includes("bridge");

              return (
                <div
                  key={stanza.id}
                  onClick={() => handleProjectStanza(idx)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                    isLive
                      ? "bg-gradient-to-r from-red-950/40 to-stone-900 border-red-500 shadow-candle ring-2 ring-red-500/40"
                      : isNext
                      ? "bg-amber-950/20 border-amber-500/60 border-dashed"
                      : isChorus
                      ? "bg-stone-900/80 border-[#c5a059]/30 hover:border-[#c5a059]/60"
                      : isBridge
                      ? "bg-stone-900/80 border-purple-500/30 hover:border-purple-500/50"
                      : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  {/* Card Header: Stanza Badge & Hotkey Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isChorus
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : isBridge
                            ? "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                            : "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                        }`}
                      >
                        {stanza.label}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">#{idx + 1}</span>
                    </div>

                    {/* Status Pill */}
                    {isLive ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-red-400 bg-red-950/80 border border-red-500/50 px-2 py-0.5 rounded-full animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        ON AIR
                      </span>
                    ) : isNext ? (
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        NEXT (Space)
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-500 hover:text-stone-300">
                        Bấm để chiếu
                      </span>
                    )}
                  </div>

                  {/* Lyrics Text Preview with Chords */}
                  <div className="space-y-1 font-serif text-xs">
                    {stanza.lines.map((line, lIdx) => {
                      const chord =
                        stanza.chordsLines?.[lIdx] && showPresenterChords
                          ? transposeChordsLine(stanza.chordsLines[lIdx], semitoneShift)
                          : null;
                      return (
                        <div key={lIdx} className="space-y-0.5">
                          {chord && (
                            <p className="font-mono text-[10px] font-bold text-[#c5a059] tracking-wider whitespace-pre">
                              {chord}
                            </p>
                          )}
                          <p
                            className={`leading-relaxed ${
                              isLive
                                ? "text-stone-100 font-semibold"
                                : "text-stone-300"
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

        {/* PANEL 3: DUAL STUDIO MONITORS (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* MONITOR 1: PROGRAM OUT (Livestream Screen Simulation) */}
          <div className="bg-[#131519] border border-stone-800/90 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="p-2.5 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="font-serif font-bold text-stone-200">
                  MÀN HÌNH TÍN ĐỒ (PROGRAM OUT)
                </span>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  isProjecting
                    ? "bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse"
                    : "bg-stone-800 text-stone-500"
                }`}
              >
                {isProjecting ? "● LIVE FEED" : "○ BLACKOUT"}
              </span>
            </div>

            {/* 16:9 Screen Simulation */}
            <div className="relative aspect-video w-full bg-stone-950 overflow-hidden flex flex-col justify-end p-3">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-[1px]"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

              {/* Lower-Third Subtitle Bar Simulation */}
              <div className="relative z-10 w-full flex flex-col items-center">
                {isProjecting && currentProjectedLines.length > 0 ? (
                  <div
                    className={`backdrop-blur-md rounded-xl p-3 shadow-2xl w-full text-center transition-all animate-fadeIn ${
                      displayStyle === "fullscreen"
                        ? "bg-stone-950/95 border border-[#c5a059]/60 my-auto"
                        : "bg-stone-950/90 border border-[#c5a059]/40"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 text-[9px] text-[#c5a059] font-serif tracking-wider uppercase mb-1">
                      <Music2 className="w-2.5 h-2.5 text-[#c5a059] animate-pulse" />
                      <span className="font-bold truncate">{selectedSong.title}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-[#c5a059]/90 font-medium">
                        {selectedSong.stanzas[activeStanzaIndex]?.label}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {currentProjectedLines.map((line, idx) => (
                        <p
                          key={idx}
                          className="font-serif text-xs sm:text-sm text-white font-medium drop-shadow-md leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 bg-stone-950/70 backdrop-blur-sm rounded-lg border border-white/5 w-full">
                    <p className="text-[10px] text-stone-500 font-serif">
                      Màn hình đen (Tín đồ đang xem video không có chữ)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MONITOR 2: STAGE DISPLAY / CONFIDENCE MONITOR (Màn hình nhắc lời Ca Đoàn) */}
          <div className="bg-[#131519] border border-stone-800/90 rounded-xl p-3.5 shadow-lg flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs text-stone-300 font-serif font-bold">
                  <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>MÀN HÌNH CA ĐOÀN (STAGE DISPLAY)</span>
                </div>
                <span className="text-[10px] font-mono text-stone-500">Confidence Screen</span>
              </div>

              {/* Current Singing Line */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
                  ĐANG HÁT (CURRENT):
                </span>
                <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800 min-h-[56px] flex flex-col justify-center">
                  {isProjecting && currentProjectedLines.length > 0 ? (
                    currentProjectedLines.map((l, idx) => (
                      <p key={idx} className="font-serif text-xs font-bold text-stone-100">
                        {l}
                      </p>
                    ))
                  ) : (
                    <p className="text-[11px] text-stone-500 italic font-serif">
                      Chưa vào bài hát...
                    </p>
                  )}
                </div>
              </div>

              {/* Next Upcoming Line Preview */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-stone-400">
                  CÂU KẾ TIẾP (UPCOMING / NEXT):
                </span>
                <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/80 min-h-[50px] flex flex-col justify-center">
                  {nextStanza ? (
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-[#c5a059]">
                        [{nextStanza.label}]
                      </span>
                      {nextStanza.lines.slice(0, 2).map((l, idx) => (
                        <p key={idx} className="font-serif text-[11px] text-stone-400 line-clamp-1">
                          {l}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-stone-500 italic font-serif">
                      Hết bài / Hết câu kế tiếp
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Song Switcher Footer */}
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between text-xs">
              <span className="text-[11px] text-stone-400 font-serif">
                Chuyển bài trong chương trình:
              </span>
              <button
                onClick={handleNextSongInPlaylist}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[#c5a059] font-serif font-medium text-xs transition-colors"
                title="Chuyển sang bài hát tiếp theo trong danh sách Chúa Nhật"
              >
                <span>Bài Kế Tiếp</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. MODAL: CUSTOM SONG COMPOSER ================= */}
      {showCustomModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowCustomModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-stone-900 border border-[#c5a059]/40 rounded-xl p-6 shadow-2xl space-y-4"
          >
            <div className="border-b border-stone-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#c5a059]" />
                  <span>Soạn & Nạp Bài Hát Mới</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Dành cho bài hát ca đoàn đặc biệt, bài hát dịch mới hoặc thơ ca ngợi
                </p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomSong} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-stone-300 font-medium">Tên Bài Hát</label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Ví dụ: Nơi Nào Bằng Nơi Đây"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-300 font-medium">Tone Gốc</label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="G / C / D"
                    className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-[#c5a059]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-stone-300 font-medium">
                  Lời Bài Hát (Mỗi câu/đoạn cách nhau bằng 1 dòng trống)
                </label>
                <textarea
                  rows={8}
                  required
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder={`Câu 1:\nKhi sống phẳng lặng như dòng sông xuôi dòng\nLinh hồn tôi an ninh thay\n\nĐiệp khúc:\nTâm linh tôi yên ninh thay\nLinh hồn tôi an ninh thay`}
                  className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-stone-100 font-serif leading-relaxed focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-750"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-stone-950 font-serif font-bold shadow-candle"
                >
                  Nạp Vào Trình Chiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
