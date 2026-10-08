"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  HYMNS_DATABASE,
  WorshipSong,
  SongStanza,
  transposeChordsLine,
  transposeChord,
} from "@/data/hymnsDataset";
import { BIBLE_BOOKS, BibleBook, parseScriptureQuery, findBibleBook } from "@/data/bibleBooks";
import { getChapterVerses, BibleVerse, getVerseTextByTranslation } from "@/data/bibleDataset";
import { BIBLE_TRANSLATIONS, getTranslationInfo } from "@/data/bibleTranslations";
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
  Copy,
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
  ExternalLink,
  BookmarkCheck,
  ArrowUp,
  ArrowDown,
  Info,
  X,
  Share2,
} from "lucide-react";

// Slide structure for active projection deck
export interface PresentationSlide {
  id: string;
  label: string; // e.g. "Câu 1", "Điệp khúc", "Thi Thiên 23:1-2"
  lines: string[];
  chordsLines?: string[];
}

export interface ActivePresentationItem {
  id: string;
  type: "hymn" | "scripture";
  title: string;
  subtitle?: string;
  songNumber?: number | null;
  referenceTranslation?: string;
  defaultKey?: string;
  slides: PresentationSlide[];
}

export interface PlaylistItem {
  id: string;
  type: "hymn" | "scripture";
  title: string;
  subtitle: string;
  note?: string;
  song?: WorshipSong;
  scriptureItem?: ActivePresentationItem;
}

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
    displayType?: "hymn" | "scripture";
    referenceTranslation?: string;
    layoutMode?: "lowerthird" | "subtitle" | "fullscreen";
    themeStyle?: "gold" | "white" | "teal" | "amber";
  };
}

// Convert WorshipSong to ActivePresentationItem
function hymnToPresentationItem(song: WorshipSong): ActivePresentationItem {
  return {
    id: song.id,
    type: "hymn",
    title: song.title,
    subtitle: song.originalTitle || song.author,
    songNumber: song.number,
    defaultKey: song.defaultKey,
    slides: song.stanzas.map((st) => ({
      id: st.id,
      label: st.label,
      lines: st.lines,
      chordsLines: st.chordsLines,
    })),
  };
}

// Convert Scripture reference to ActivePresentationItem with intelligent chunking
function scriptureToPresentationItem(
  reference: string,
  verses: { verse: number; text: string; secondaryText?: string }[],
  translation = "BTT",
  secondaryTrans?: string
): ActivePresentationItem {
  const slides: PresentationSlide[] = [];
  const isBilingualMode = !!secondaryTrans && verses.some((v) => !!v.secondaryText);
  const chunkSize = isBilingualMode ? 1 : verses.length > 3 ? 2 : 1;

  for (let i = 0; i < verses.length; i += chunkSize) {
    const chunk = verses.slice(i, i + chunkSize);
    const vLabels =
      chunk.length === 1
        ? `Câu ${chunk[0].verse}`
        : `Câu ${chunk[0].verse}–${chunk[chunk.length - 1].verse}`;

    let lines: string[];
    if (isBilingualMode) {
      lines = chunk.flatMap((v) => {
        const res = [`[${v.verse}] ${v.text}`];
        if (v.secondaryText) {
          const clean = v.secondaryText.replace(/^[“"']+|[”"']+$/g, "").trim();
          res.push(`“${clean}”`);
        }
        return res;
      });
    } else {
      lines = chunk.map((v) => `[${v.verse}] ${v.text}`);
    }

    slides.push({
      id: `sc-slide-${i}`,
      label: `${reference} (${vLabels})`,
      lines,
    });
  }

  if (slides.length === 0) {
    slides.push({
      id: "sc-slide-empty",
      label: reference,
      lines: [reference],
    });
  }

  const pTrans = getTranslationInfo(translation);
  const sTrans = secondaryTrans ? getTranslationInfo(secondaryTrans) : null;
  const transSubtitle = sTrans
    ? `${pTrans.shortName} • ${sTrans.shortName}`
    : pTrans.shortName;

  return {
    id: `scripture-${Date.now()}`,
    type: "scripture",
    title: reference,
    subtitle: `Kinh Thánh Lời Chúa • ${transSubtitle}`,
    referenceTranslation: transSubtitle,
    defaultKey: "",
    slides,
  };
}

// 10 Classic Church Sermon Scripture Passages for 1-Click Access
const POPULAR_SERMON_SCRIPTURES = [
  { ref: "Giăng 3:16", desc: "Tình Yêu Thương Cứu Rỗi Vĩ Đại", tag: "Cứu Rỗi" },
  { ref: "Thi Thiên 23:1-6", desc: "Chúa Là Đấng Chăn Giữ Tôi", tag: "Bình An" },
  { ref: "Phi-líp 4:6-7", desc: "Chớ Lo Phiền Chi Hết", tag: "Đức Tin" },
  { ref: "Thi Thiên 91:1-4", desc: "Nơi Nương Náu Đấng Chí Cao", tag: "Bảo Vệ" },
  { ref: "Rô-ma 8:31-39", desc: "Không Ai Phân Rẽ Chúng Ta", tag: "Đắc Thắng" },
  { ref: "1 Cô-rinh-tô 13:4-8", desc: "Bài Ca Tình Yêu Thương", tag: "Yêu Thương" },
  { ref: "Giô-suê 1:8-9", desc: "Hãy Vững Lòng Bền Chí", tag: "Can Đảm" },
  { ref: "Ma-thi-ơ 6:33-34", desc: "Tìm Kiếm Nước Đức Chúa Trời", tag: "Mục Đích" },
  { ref: "Thi Thiên 100:1-5", desc: "Hãy Cảm Tạ Mà Vào Các Cửa Ngài", tag: "Tạ Ơn" },
  { ref: "Ê-sai 40:29-31", desc: "Trông Đợi Chúa Được Sức Mới", tag: "Hy Vọng" },
];

export const AdminLyricsPresenter: React.FC<AdminLyricsPresenterProps> = ({
  churchSlug,
  initialLyrics,
}) => {
  // Service Setlist / Playlist for today's service (mixed Hymns & Scriptures)
  const defaultSong1 = HYMNS_DATABASE.find((s) => s.id === "tc-23") || HYMNS_DATABASE[2];
  const defaultSong2 = HYMNS_DATABASE.find((s) => s.id === "cp-10000reasons") || HYMNS_DATABASE[7];
  const defaultSong3 = HYMNS_DATABASE.find((s) => s.id === "tc-415") || HYMNS_DATABASE[0];
  const defaultSong4 = HYMNS_DATABASE.find((s) => s.id === "cp-thankyoulord") || HYMNS_DATABASE[11];

  const defaultSc1Verses = getChapterVerses("PSA", 100, "Thi Thiên").slice(0, 5);
  const defaultSc1Item = scriptureToPresentationItem("Thi Thiên 100:1-5", defaultSc1Verses, "BTT 1925");

  const defaultSc2Verses = getChapterVerses("JHN", 3, "Giăng").filter(
    (v) => v.verse === 16 || v.verse === 17
  );
  const defaultSc2Item = scriptureToPresentationItem("Giăng 3:16-17", defaultSc2Verses, "BTT 1925");

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([
    {
      id: "pl-1",
      type: "hymn",
      title: defaultSong1.title,
      subtitle: `TC #${defaultSong1.number || 23} • Tone ${defaultSong1.defaultKey}`,
      note: "1. Tôn Vinh Khai Lễ",
      song: defaultSong1,
    },
    {
      id: "pl-2",
      type: "scripture",
      title: "Thi Thiên 100:1-5",
      subtitle: "Kinh Thánh Khai Lễ • BTT 1925",
      note: "2. Kinh Thánh Khai Lễ",
      scriptureItem: defaultSc1Item,
    },
    {
      id: "pl-3",
      type: "hymn",
      title: defaultSong2.title,
      subtitle: `Thánh Ca Hiện Đại • Tone ${defaultSong2.defaultKey}`,
      note: "3. Ngợi Khen Ban Hát",
      song: defaultSong2,
    },
    {
      id: "pl-4",
      type: "scripture",
      title: "Giăng 3:16-17",
      subtitle: "Câu Gốc Bài Giảng • BTT 1925",
      note: "4. Kinh Thánh Bài Giảng",
      scriptureItem: defaultSc2Item,
    },
    {
      id: "pl-5",
      type: "hymn",
      title: defaultSong3.title,
      subtitle: `TC #${defaultSong3.number || 415} • Tone ${defaultSong3.defaultKey}`,
      note: "5. Đáp Ứng Lời Chúa",
      song: defaultSong3,
    },
    {
      id: "pl-6",
      type: "hymn",
      title: defaultSong4.title,
      subtitle: `Thánh Ca Tạ Ơn • Tone ${defaultSong4.defaultKey}`,
      note: "6. Dâng Hiến & Tất Lễ",
      song: defaultSong4,
    },
  ]);

  // Selected item currently active in the operator deck
  const [activeItem, setActiveItem] = useState<ActivePresentationItem>(
    hymnToPresentationItem(defaultSong1)
  );

  // Projection state (Program Out)
  const [isProjecting, setIsProjecting] = useState<boolean>(Boolean(initialLyrics?.isEnabled));
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(initialLyrics?.stanzaIndex ?? 0);
  const [currentProjectedLines, setCurrentProjectedLines] = useState<string[]>(
    initialLyrics?.lines || []
  );

  // Preview / Next Slide Index
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(
    (initialLyrics?.stanzaIndex ?? 0) + 1 < (activeItem?.slides?.length || 1)
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
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);

  // Display style customization
  const [displayStyle, setDisplayStyle] = useState<"lowerthird" | "subtitle" | "fullscreen">(
    initialLyrics?.layoutMode || "lowerthird"
  );
  const [activeThemeColor, setActiveThemeColor] = useState<"gold" | "white" | "teal" | "amber">(
    initialLyrics?.themeStyle || "gold"
  );

  // Scripture Studio State
  const [scriptureSubTab, setScriptureSubTab] = useState<"smart" | "browser">("smart");
  const [scriptureQuery, setScriptureQuery] = useState("Giăng 3:16-17");
  const [selectedTranslation, setSelectedTranslation] = useState<string>("BTT");
  const [isBilingual, setIsBilingual] = useState<boolean>(false);
  const [secondaryTranslation, setSecondaryTranslation] = useState<string>("NIV");
  const [isFetchingScripture, setIsFetchingScripture] = useState<boolean>(false);

  // Scripture 66 Books Browser State
  const [selectedTestament, setSelectedTestament] = useState<"OT" | "NT">("NT");
  const [selectedBookCategory, setSelectedBookCategory] = useState<string>("all");
  const [selectedBook, setSelectedBook] = useState<BibleBook>(
    BIBLE_BOOKS.find((b) => b.id === "JHN") || BIBLE_BOOKS[42]
  );
  const [selectedChapter, setSelectedChapter] = useState<number>(3);
  const [verseStart, setVerseStart] = useState<number>(16);
  const [verseEnd, setVerseEnd] = useState<number>(17);

  // Scripture search result preview
  const [scriptureResultItem, setScriptureResultItem] = useState<ActivePresentationItem | null>(null);

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
      const originalMatch = song.originalTitle ? song.originalTitle.toLowerCase().includes(q) : false;
      const lyricsMatch = song.stanzas.some((st) =>
        st.lines.some((l) => l.toLowerCase().includes(q))
      );
      return numMatch || titleMatch || originalMatch || lyricsMatch;
    });
  }, [songSearch, categoryFilter]);

  // Master API Broadcast Call to backend and all connected displays
  const broadcastPresentation = useCallback(
    async (
      enabled: boolean,
      item: ActivePresentationItem,
      slideIdx: number,
      lines: string[]
    ) => {
      setIsSaving(true);
      try {
        const payload = {
          isEnabled: enabled,
          songId: item.id,
          songNumber: item.songNumber || null,
          songTitle: item.title,
          originalTitle: item.subtitle || "",
          stanzaIndex: slideIdx,
          stanzaLabel: item.slides[slideIdx]?.label || "",
          lines: enabled ? lines : [],
          displayType: item.type,
          referenceTranslation: item.referenceTranslation || selectedTranslation,
          layoutMode: displayStyle,
          themeStyle: activeThemeColor,
        };

        const res = await fetch("/api/lyrics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          setIsProjecting(enabled);
          setActiveSlideIndex(slideIdx);
          setCurrentProjectedLines(enabled ? lines : []);

          // Calculate next preview slide
          const nextIdx = slideIdx + 1 < item.slides.length ? slideIdx + 1 : 0;
          setPreviewSlideIndex(nextIdx);

          setSaveMessage(
            enabled
              ? `LIVE: ${item.title} (${item.slides[slideIdx]?.label || "Slide"})`
              : "Đã xóa màn hình (Blackout)"
          );
          setTimeout(() => setSaveMessage(""), 2500);
        } else {
          setSaveMessage("Lỗi gửi dữ liệu phát sóng");
        }
      } catch {
        setSaveMessage("Lỗi kết nối máy chủ");
      } finally {
        setIsSaving(false);
      }
    },
    [displayStyle, activeThemeColor, selectedTranslation]
  );

  // Project a specific slide
  const handleProjectSlide = (index: number) => {
    if (!activeItem.slides[index]) return;
    broadcastPresentation(true, activeItem, index, activeItem.slides[index].lines);
  };

  // Master Blackout / Clear All
  const handleClearAll = () => {
    broadcastPresentation(false, activeItem, activeSlideIndex, []);
  };

  // Next Slide (Space / ArrowDown / ArrowRight)
  const handleNextSlide = useCallback(() => {
    if (!activeItem.slides || activeItem.slides.length === 0) return;
    const nextIdx =
      activeSlideIndex < activeItem.slides.length - 1 ? activeSlideIndex + 1 : 0;
    handleProjectSlide(nextIdx);
  }, [activeSlideIndex, activeItem]);

  // Prev Slide (ArrowUp / ArrowLeft)
  const handlePrevSlide = useCallback(() => {
    if (!activeItem.slides || activeItem.slides.length === 0) return;
    const prevIdx =
      activeSlideIndex > 0 ? activeSlideIndex - 1 : activeItem.slides.length - 1;
    handleProjectSlide(prevIdx);
  }, [activeSlideIndex, activeItem]);

  // Jump to Chorus (if Hymn)
  const handleJumpToChorus = () => {
    if (activeItem.type !== "hymn") return;
    const chorusIdx = activeItem.slides.findIndex(
      (s) =>
        s.id.startsWith("c") ||
        s.label.toLowerCase().includes("điệp") ||
        s.label.toLowerCase().includes("chorus")
    );
    if (chorusIdx !== -1) {
      handleProjectSlide(chorusIdx);
    } else {
      handleProjectSlide(0);
    }
  };

  // Jump to Verse 1
  const handleJumpToSlide1 = () => {
    handleProjectSlide(0);
  };

  // Switch to next item in playlist
  const handleNextItemInPlaylist = () => {
    const currentIdx = playlist.findIndex((p) => p.title === activeItem.title);
    if (currentIdx !== -1 && currentIdx < playlist.length - 1) {
      const nextPlaylistItem = playlist[currentIdx + 1];
      loadPlaylistItem(nextPlaylistItem);
    }
  };

  // Load a playlist item into the operator deck
  const loadPlaylistItem = (item: PlaylistItem) => {
    if (item.type === "hymn" && item.song) {
      const pItem = hymnToPresentationItem(item.song);
      setActiveItem(pItem);
      setActiveSlideIndex(0);
      setSemitoneShift(0);
      if (isProjecting) {
        broadcastPresentation(true, pItem, 0, pItem.slides[0].lines);
      }
    } else if (item.type === "scripture" && item.scriptureItem) {
      setActiveItem(item.scriptureItem);
      setActiveSlideIndex(0);
      setSemitoneShift(0);
      if (isProjecting) {
        broadcastPresentation(true, item.scriptureItem, 0, item.scriptureItem.slides[0].lines);
      }
    }
  };

  // Add Hymn to Playlist
  const handleAddHymnToPlaylist = (song: WorshipSong) => {
    if (playlist.some((p) => p.song?.id === song.id)) {
      setSaveMessage(`Bài "${song.title}" đã có trong chương trình`);
      setTimeout(() => setSaveMessage(""), 2000);
      return;
    }
    const newItem: PlaylistItem = {
      id: `pl-${Date.now()}`,
      type: "hymn",
      title: song.title,
      subtitle: `TC #${song.number || "—"} • Tone ${song.defaultKey}`,
      note: "Hát Ca Ngợi",
      song,
    };
    setPlaylist([...playlist, newItem]);
    setSaveMessage(`Đã thêm "${song.title}" vào chương trình`);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // Remove from Playlist
  const handleRemoveFromPlaylist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaylist(playlist.filter((p) => p.id !== id));
  };

  // Open Popout Stage Projector Window
  const handleOpenProjectorWindow = () => {
    window.open(
      `/projector/${churchSlug}`,
      "ChurchProjectorWindow",
      "width=1280,height=720,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  // Open Popout OBS Transparent Overlay Window
  const handleOpenObsWindow = () => {
    window.open(
      `/projector/${churchSlug}?mode=obs`,
      "ChurchObsWindow",
      "width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  // Copy OBS Studio Browser Source URL
  const handleCopyObsLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/projector/${churchSlug}?mode=obs`;
      navigator.clipboard.writeText(url).then(() => {
        setSaveMessage("Đã copy link OBS Browser Source (Nền trong suốt)!");
        setTimeout(() => setSaveMessage(""), 2800);
      });
    }
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
        handleNextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C" || e.key === "F1") {
        e.preventDefault();
        handleClearAll();
      } else if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        handleJumpToChorus();
      } else if (e.key === "1") {
        e.preventDefault();
        handleJumpToSlide1();
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleNextItemInPlaylist();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextSlide, handlePrevSlide, handleClearAll, activeItem]);

  // Execute Scripture Search (Instant local preview + asynchronous remote sync)
  const executeScriptureLookup = async (
    queryString: string,
    translation = selectedTranslation,
    bilingual = isBilingual,
    secTrans = secondaryTranslation
  ) => {
    const parsed = parseScriptureQuery(queryString);
    if (!parsed.book) {
      alert(
        "Không tìm thấy sách Kinh Thánh phù hợp. Vui lòng kiểm tra lại chính tả (ví dụ: Giăng 3:16 hoặc Thi Thiên 23)."
      );
      return;
    }

    // 1. Instant local fallback for 0ms lag
    const localVerses = getChapterVerses(
      parsed.book.id,
      parsed.chapter,
      parsed.book.name
    );
    let selectedVerses: { verse: number; text: string; secondaryText?: string }[] = [];

    const getPrimary = (v: BibleVerse) => getVerseTextByTranslation(v, translation);
    const getSecondary = (v: BibleVerse) =>
      bilingual ? getVerseTextByTranslation(v, secTrans) : undefined;

    if (parsed.verseStart) {
      const end = parsed.verseEnd || parsed.verseStart;
      const filtered = localVerses.filter(
        (v) => v.verse >= parsed.verseStart! && v.verse <= end
      );
      if (filtered.length > 0) {
        selectedVerses = filtered.map((v) => ({
          verse: v.verse,
          text: getPrimary(v),
          secondaryText: getSecondary(v),
        }));
      }
    }

    if (selectedVerses.length === 0 && localVerses.length > 0) {
      selectedVerses = localVerses.slice(0, 3).map((v) => ({
        verse: v.verse,
        text: getPrimary(v),
        secondaryText: getSecondary(v),
      }));
    }

    const fullRef = `${parsed.book.name} ${parsed.chapter}${
      parsed.verseStart
        ? `:${parsed.verseStart}${
            parsed.verseEnd && parsed.verseEnd !== parsed.verseStart
              ? `–${parsed.verseEnd}`
              : ""
          }`
        : ""
    }`;

    const localItem = scriptureToPresentationItem(
      fullRef,
      selectedVerses,
      translation,
      bilingual ? secTrans : undefined
    );
    setScriptureResultItem(localItem);

    // 2. Query /api/bible for full 66-book accuracy and authentic translation text
    try {
      setIsFetchingScripture(true);
      const url = `/api/bible?q=${encodeURIComponent(queryString)}&version=${encodeURIComponent(
        translation
      )}${bilingual ? `&secondaryVersion=${encodeURIComponent(secTrans)}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.verses) && data.verses.length > 0) {
          let apiVerses = data.verses;
          if (parsed.verseStart) {
            const end = parsed.verseEnd || parsed.verseStart;
            const filtered = apiVerses.filter(
              (v: any) => v.verse >= parsed.verseStart! && v.verse <= end
            );
            if (filtered.length > 0) apiVerses = filtered;
          } else {
            apiVerses = apiVerses.slice(0, 5);
          }

          const remoteItem = scriptureToPresentationItem(
            fullRef,
            apiVerses.map((v: any) => ({
              verse: v.verse,
              text: v.text,
              secondaryText: v.secondaryText,
            })),
            translation,
            bilingual ? secTrans : undefined
          );
          setScriptureResultItem(remoteItem);
        }
      }
    } catch {
      // Keep localItem on network failure
    } finally {
      setIsFetchingScripture(false);
    }

    return localItem;
  };

  // Handle Scripture Submit from Search Input
  const handleSearchScripture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptureQuery.trim()) return;
    executeScriptureLookup(
      scriptureQuery,
      selectedTranslation,
      isBilingual,
      secondaryTranslation
    );
  };

  // Project Scripture Immediately
  const handleLiveScriptureNow = (item: ActivePresentationItem) => {
    setActiveItem(item);
    setActiveSlideIndex(0);
    setSemitoneShift(0);
    broadcastPresentation(true, item, 0, item.slides[0].lines);
  };

  // Add Scripture to Today's Setlist
  const handleAddScriptureToPlaylist = (item: ActivePresentationItem) => {
    const newItem: PlaylistItem = {
      id: `pl-${Date.now()}`,
      type: "scripture",
      title: item.title,
      subtitle: `${item.subtitle} • ${item.slides.length} slide`,
      note: "Kinh Thánh Bài Giảng",
      scriptureItem: item,
    };
    setPlaylist([...playlist, newItem]);
    setSaveMessage(`Đã thêm Lời Chúa "${item.title}" vào chương trình`);
    setTimeout(() => setSaveMessage(""), 2000);
  };

  // 66 Books Browser: Generate verses for current selection
  const browserChapterVerses = useMemo(() => {
    return getChapterVerses(selectedBook.id, selectedChapter, selectedBook.name);
  }, [selectedBook, selectedChapter]);

  // Handle Scripture Picked from 66 Books Browser
  const handlePickFromBrowser = async () => {
    const vRangeStr =
      verseStart === verseEnd
        ? `:${verseStart}`
        : `:${verseStart}–${Math.max(verseStart, verseEnd)}`;
    const ref = `${selectedBook.name} ${selectedChapter}${vRangeStr}`;

    const filtered = browserChapterVerses.filter(
      (v) => v.verse >= verseStart && v.verse <= Math.max(verseStart, verseEnd)
    );
    const versesToUse =
      filtered.length > 0 ? filtered : browserChapterVerses.slice(0, 2);

    const localFormatted = versesToUse.map((v) => ({
      verse: v.verse,
      text: getVerseTextByTranslation(v, selectedTranslation),
      secondaryText: isBilingual
        ? getVerseTextByTranslation(v, secondaryTranslation)
        : undefined,
    }));

    const pItem = scriptureToPresentationItem(
      ref,
      localFormatted,
      selectedTranslation,
      isBilingual ? secondaryTranslation : undefined
    );
    setScriptureResultItem(pItem);

    // Sync with /api/bible for exact full-chapter authentic remote text
    try {
      setIsFetchingScripture(true);
      const url = `/api/bible?book=${encodeURIComponent(
        selectedBook.id
      )}&chapter=${selectedChapter}&version=${encodeURIComponent(
        selectedTranslation
      )}${
        isBilingual
          ? `&secondaryVersion=${encodeURIComponent(secondaryTranslation)}`
          : ""
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.verses) && data.verses.length > 0) {
          const apiFiltered = data.verses.filter(
            (v: any) =>
              v.verse >= verseStart && v.verse <= Math.max(verseStart, verseEnd)
          );
          const finalVerses =
            apiFiltered.length > 0 ? apiFiltered : data.verses.slice(0, 3);
          const remoteItem = scriptureToPresentationItem(
            ref,
            finalVerses.map((v: any) => ({
              verse: v.verse,
              text: v.text,
              secondaryText: v.secondaryText,
            })),
            selectedTranslation,
            isBilingual ? secondaryTranslation : undefined
          );
          setScriptureResultItem(remoteItem);
        }
      }
    } catch {
      // keep pItem
    } finally {
      setIsFetchingScripture(false);
    }

    return pItem;
  };

  // Filter 66 Books by Testament and Category
  const filteredBooks = useMemo(() => {
    return BIBLE_BOOKS.filter((b) => {
      if (b.testament !== selectedTestament) return false;
      if (selectedBookCategory !== "all" && b.category !== selectedBookCategory) {
        return false;
      }
      return true;
    });
  }, [selectedTestament, selectedBookCategory]);

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

    const pItem = hymnToPresentationItem(newSong);
    setActiveItem(pItem);
    setActiveSlideIndex(0);
    setPlaylist([
      ...playlist,
      {
        id: `pl-${Date.now()}`,
        type: "hymn",
        title: newSong.title,
        subtitle: `Tự Biên • Tone ${newSong.defaultKey}`,
        note: "Bài hát đặc biệt",
        song: newSong,
      },
    ]);
    setShowCustomModal(false);
    setCustomTitle("");
    setCustomContent("");
    setSaveMessage(`Đã nạp bài hát mới: ${newSong.title}`);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const currentKey = activeItem.defaultKey
    ? transposeChord(activeItem.defaultKey, semitoneShift)
    : "";

  const nextSlide = activeItem?.slides?.[previewSlideIndex];
  const isScripture = activeItem.type === "scripture";

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ================= 1. MASTER PRODUCTION HEADER ================= */}
      <div className="bg-gradient-to-r from-[#12151c] via-[#161a24] to-[#12151c] border border-stone-800 rounded-xl p-3 sm:p-4 shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Studio Identity & Tally Light */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-950 border border-stone-700/60 flex items-center justify-center text-[#c5a059] shadow-inner">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-serif text-sm sm:text-base font-bold text-stone-100 tracking-wide flex items-center gap-2">
                <span>Trình Chiếu Thánh Ca & Kinh Thánh</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-[#c5a059] border border-[#c5a059]/30">
                  v3.0 Pro Studio
                </span>
              </h2>

              {/* Tally Light */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border transition-all ${
                  isProjecting
                    ? "bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.35)] animate-pulse"
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
                {activeItem.songNumber ? `TC #${activeItem.songNumber} — ` : ""}
                {activeItem.title}
              </strong>
              {currentKey && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="font-mono text-[#c5a059]">Tone: {currentKey}</span>
                </>
              )}
              {isScripture && activeItem.referenceTranslation && (
                <>
                  <span className="text-stone-600">•</span>
                  <span className="font-mono text-amber-400 text-[10px]">
                    {activeItem.referenceTranslation}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center / Right: Master Emergency & Production Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {saveMessage && (
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-md animate-fade-in shadow-sm">
              {saveMessage}
            </span>
          )}

          {/* Popout Projector Stage Screen Button */}
          <button
            onClick={handleOpenProjectorWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-200 hover:text-white border border-white/10 hover:border-[#c5a059]/50 text-xs font-serif font-medium transition-all shadow-sm cursor-pointer"
            title="Mở cửa sổ trình chiếu độc lập để kéo sang máy chiếu số 2 / màn hình LED"
          >
            <Tv className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="hidden sm:inline">Màn Chiếu Sân Khấu</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </button>

          {/* Popout OBS Transparent Lower-Third Overlay Button */}
          <button
            onClick={handleOpenObsWindow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-400/60 text-xs font-serif font-medium transition-all shadow-sm cursor-pointer"
            title="Mở cửa sổ đồ họa chữ trong suốt (Lower-Third) dành cho Livestream OBS Studio"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">OBS Lower-Third</span>
            <ExternalLink className="w-3 h-3 text-stone-400" />
          </button>

          {/* Copy OBS Browser Source Link Button */}
          <button
            onClick={handleCopyObsLink}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-white border border-white/10 hover:border-stone-600 text-xs font-serif transition-all shadow-sm cursor-pointer"
            title="Sao chép đường dẫn Browser Source dán vào OBS Studio"
          >
            <Copy className="w-3 h-3 text-[#c5a059]" />
            <span className="text-[11px]">Copy OBS</span>
          </button>

          {/* Quick Jump to Chorus Button (Hymn only) */}
          {!isScripture && (
            <button
              onClick={handleJumpToChorus}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-serif font-medium transition-all shadow-sm cursor-pointer"
              title="Nhảy nhanh đến Điệp khúc (Phím tắt: D)"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Điệp Khúc (D)</span>
            </button>
          )}

          {/* Quick Jump to Verse 1 Button */}
          <button
            onClick={handleJumpToSlide1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 text-xs font-serif font-medium transition-all shadow-sm cursor-pointer"
            title="Quay lại câu đầu tiên (Phím: 1)"
          >
            <span>Câu 1 (1)</span>
          </button>

          {/* Clear All / Blackout Button */}
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-serif font-bold transition-all shadow-sm cursor-pointer"
            title="Tắt toàn bộ chữ trên màn hình ngay tức thì (Phím ESC hoặc C)"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>XÓA (ESC)</span>
          </button>

          {/* Hotkeys Modal Button */}
          <button
            onClick={() => setShowHotkeysModal(true)}
            className="p-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-700 transition-colors cursor-pointer"
            title="Xem danh sách phím tắt điều khiển"
          >
            <Keyboard className="w-4 h-4 text-[#c5a059]" />
          </button>

          {/* Studio Clock */}
          <div className="hidden sm:flex items-center gap-1.5 bg-black/50 border border-stone-800 px-3 py-1.5 rounded-lg text-xs font-mono text-stone-300">
            <Clock className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>{currentTime || "09:00:00"}</span>
          </div>
        </div>
      </div>

      {/* ================= 2. THREE-PANEL MASTER WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[760px] h-[calc(100vh-200px)]">
        {/* PANEL 1: SETLIST & LIBRARIES (3.5 Columns on LG) */}
        <div className="lg:col-span-4 xl:col-span-3 bg-[#131519] border border-stone-800/90 rounded-xl flex flex-col overflow-hidden shadow-lg">
          {/* Top Tab Bar: 3 Main Sections */}
          <div className="flex border-b border-stone-800 bg-stone-900/80 p-1 gap-1 shrink-0">
            <button
              onClick={() => setActiveNavTab("playlist")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-serif font-medium rounded-lg transition-all cursor-pointer ${
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
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-serif font-medium rounded-lg transition-all cursor-pointer ${
                activeNavTab === "library"
                  ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Thánh Ca</span>
            </button>

            <button
              onClick={() => setActiveNavTab("scripture")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 text-xs font-serif font-medium rounded-lg transition-all cursor-pointer ${
                activeNavTab === "scripture"
                  ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold shadow-sm"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
              }`}
              title="Tra cứu & Chiếu Kinh Thánh chuyên nghiệp"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Kinh Thánh</span>
            </button>
          </div>

          {/* TAB 1: SETLIST (Chương trình buổi nhóm hôm nay) */}
          {activeNavTab === "playlist" && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-2.5 border-b border-stone-800/70 flex items-center justify-between text-[11px] text-stone-400">
                <span className="font-serif">Thứ tự các phần thờ phượng & Lời Chúa</span>
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Soạn Mới</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {playlist.map((item, idx) => {
                  const isCurrent = activeItem.title === item.title;
                  const isLiveThis = isCurrent && isProjecting;
                  return (
                    <div
                      key={item.id}
                      onClick={() => loadPlaylistItem(item)}
                      className={`group p-2.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        isLiveThis
                          ? "bg-red-950/30 border-red-500/60 text-stone-100 shadow-md ring-1 ring-red-500/40"
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
                          <div className="flex items-center gap-1.5">
                            {item.type === "scripture" ? (
                              <BookOpen className="w-3 h-3 text-amber-400 shrink-0" />
                            ) : (
                              <Music2 className="w-3 h-3 text-[#c5a059] shrink-0" />
                            )}
                            <p className="font-serif text-xs font-bold truncate">
                              {item.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400">
                            <span className="truncate">{item.note || item.subtitle}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleRemoveFromPlaylist(item.id, e)}
                          className="p-1 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
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

          {/* TAB 2: HYMNS LIBRARY (Kho Thánh Ca) */}
          {activeNavTab === "library" && (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Search & Categories */}
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

                <div className="flex gap-1 overflow-x-auto text-[10px] scrollbar-none pb-0.5">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "traditional", label: "Thánh Ca" },
                    { id: "contemporary", label: "Thờ Phượng Trẻ" },
                    { id: "christmas", label: "Giáng Sinh" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={`px-2 py-0.5 rounded-full whitespace-nowrap cursor-pointer transition-all ${
                        categoryFilter === cat.id
                          ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 font-bold"
                          : "bg-stone-800/80 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hymns List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-stone-800/40">
                {filteredLibrarySongs.map((song) => {
                  const isSelected = activeItem.title === song.title;
                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        const pItem = hymnToPresentationItem(song);
                        setActiveItem(pItem);
                        setActiveSlideIndex(0);
                        setSemitoneShift(0);
                        if (isProjecting) {
                          broadcastPresentation(true, pItem, 0, pItem.slides[0].lines);
                        }
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
                          {song.originalTitle || song.author} • Tone {song.defaultKey}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddHymnToPlaylist(song);
                        }}
                        className="p-1 rounded bg-stone-800 hover:bg-[#c5a059] text-stone-400 hover:text-stone-950 transition-colors shrink-0 cursor-pointer"
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

          {/* TAB 3: SCRIPTURE PROJECTION STUDIO (Tra cứu & Chiếu Kinh Thánh) */}
          {activeNavTab === "scripture" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 space-y-3">
              {/* Scripture Sub-mode Toggle */}
              <div className="flex rounded-lg bg-stone-950 p-1 border border-stone-800 text-[11px] font-serif">
                <button
                  onClick={() => setScriptureSubTab("smart")}
                  className={`flex-1 py-1 px-2 rounded-md font-medium transition-all cursor-pointer ${
                    scriptureSubTab === "smart"
                      ? "bg-[#c5a059]/20 text-[#c5a059] font-bold shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Tra Cứu Nhanh
                </button>
                <button
                  onClick={() => setScriptureSubTab("browser")}
                  className={`flex-1 py-1 px-2 rounded-md font-medium transition-all cursor-pointer ${
                    scriptureSubTab === "browser"
                      ? "bg-[#c5a059]/20 text-[#c5a059] font-bold shadow-sm"
                      : "text-stone-400 hover:text-stone-200"
                  }`}
                >
                  Duyệt 66 Sách
                </button>
              </div>

              {/* Comprehensive Bible Translations & Bilingual Studio Selector */}
              <div className="space-y-2 p-2.5 rounded-xl bg-stone-950/90 border border-stone-800 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-stone-300 font-serif font-bold">Bản dịch chính:</span>
                    <span className="text-[9px] text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-semibold">
                      {getTranslationInfo(selectedTranslation).badge}
                    </span>
                  </div>
                  {isFetchingScripture && (
                    <span className="text-[10px] font-mono text-amber-400 animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Đồng bộ...
                    </span>
                  )}
                </div>

                <select
                  value={selectedTranslation}
                  onChange={(e) => {
                    const newTr = e.target.value;
                    setSelectedTranslation(newTr);
                    if (scriptureResultItem) {
                      executeScriptureLookup(
                        scriptureResultItem.title,
                        newTr,
                        isBilingual,
                        secondaryTranslation
                      );
                    }
                  }}
                  className="w-full bg-stone-900 border border-stone-700/80 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 font-serif focus:outline-none focus:border-amber-500"
                >
                  <optgroup label="🇻🇳 BẢN DỊCH TIẾNG VIỆT">
                    {BIBLE_TRANSLATIONS.filter((t) => t.language === "vi").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortName} – {t.name} [{t.badge}]
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="🇬🇧 BẢN DỊCH TIẾNG ANH (ENGLISH)">
                    {BIBLE_TRANSLATIONS.filter((t) => t.language === "en").map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortName} – {t.name} [{t.badge}]
                      </option>
                    ))}
                  </optgroup>
                </select>

                {/* Bilingual Projection Switch */}
                <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isBilingual}
                        onChange={(e) => {
                          const nextBilingual = e.target.checked;
                          setIsBilingual(nextBilingual);
                          if (scriptureResultItem) {
                            executeScriptureLookup(
                              scriptureResultItem.title,
                              selectedTranslation,
                              nextBilingual,
                              secondaryTranslation
                            );
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-stone-700 text-amber-500 focus:ring-amber-500 bg-stone-900 cursor-pointer accent-amber-500"
                      />
                      <span className="text-[11px] font-serif font-bold text-stone-200 group-hover:text-amber-300 transition-colors">
                        Chiếu Song Ngữ (Bilingual)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-stone-400 bg-stone-900 px-1.5 py-0.5 rounded border border-stone-800">
                      Việt + Anh
                    </span>
                  </label>

                  {isBilingual && (
                    <div className="flex items-center gap-2 pl-5 pt-1 animate-fadeIn">
                      <span className="text-[10px] text-stone-400 font-serif whitespace-nowrap">Bản dịch phụ:</span>
                      <select
                        value={secondaryTranslation}
                        onChange={(e) => {
                          const newSec = e.target.value;
                          setSecondaryTranslation(newSec);
                          if (scriptureResultItem) {
                            executeScriptureLookup(
                              scriptureResultItem.title,
                              selectedTranslation,
                              true,
                              newSec
                            );
                          }
                        }}
                        className="flex-1 bg-stone-900 border border-stone-700/80 rounded px-2 py-1 text-[11px] text-stone-200 font-mono focus:outline-none focus:border-amber-500"
                      >
                        {BIBLE_TRANSLATIONS.filter((t) => t.id !== selectedTranslation).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.shortName} ({t.badge})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Sub-mode 1: Smart Input & Popular Passages */}
              {scriptureSubTab === "smart" && (
                <div className="space-y-3">
                  <form onSubmit={handleSearchScripture} className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={scriptureQuery}
                        onChange={(e) => setScriptureQuery(e.target.value)}
                        placeholder="Ví dụ: Giăng 3:16 hoặc Thi Thiên 23:1-4"
                        className="w-full bg-stone-950 border border-stone-800 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-[#c5a059] hover:from-amber-500 hover:to-[#d6b068] text-stone-950 font-serif font-bold text-xs shadow-candle cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Tra Cứu Đoạn Kinh Thánh</span>
                    </button>
                  </form>

                  {/* 1-Click Popular Sermon Passages */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-stone-400 font-serif flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#c5a059]" />
                      <span>Câu gốc bài giảng gợi ý:</span>
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                      {POPULAR_SERMON_SCRIPTURES.map((p) => (
                        <button
                          key={p.ref}
                          onClick={() => {
                            setScriptureQuery(p.ref);
                            executeScriptureLookup(
                              p.ref,
                              selectedTranslation,
                              isBilingual,
                              secondaryTranslation
                            );
                          }}
                          className="p-1.5 rounded-lg bg-stone-900 border border-stone-800 hover:border-[#c5a059]/40 text-left transition-all cursor-pointer group"
                        >
                          <p className="font-serif text-[11px] font-bold text-[#c5a059] group-hover:text-amber-300 truncate">
                            {p.ref}
                          </p>
                          <p className="text-[9px] text-stone-400 truncate">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-mode 2: 66 Books Chapter & Verse Browser */}
              {scriptureSubTab === "browser" && (
                <div className="space-y-2.5 text-xs">
                  {/* Testament Switch */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedTestament("OT");
                        setSelectedBook(BIBLE_BOOKS[0]);
                        setSelectedChapter(1);
                      }}
                      className={`flex-1 py-1 rounded text-[11px] font-serif transition-colors cursor-pointer ${
                        selectedTestament === "OT"
                          ? "bg-stone-800 text-[#c5a059] font-bold border border-[#c5a059]/30"
                          : "bg-stone-900/60 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      Cựu Ước (39 Sách)
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTestament("NT");
                        setSelectedBook(BIBLE_BOOKS.find((b) => b.id === "JHN") || BIBLE_BOOKS[42]);
                        setSelectedChapter(3);
                      }}
                      className={`flex-1 py-1 rounded text-[11px] font-serif transition-colors cursor-pointer ${
                        selectedTestament === "NT"
                          ? "bg-stone-800 text-[#c5a059] font-bold border border-[#c5a059]/30"
                          : "bg-stone-900/60 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      Tân Ước (27 Sách)
                    </button>
                  </div>

                  {/* Book Selector Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400 font-serif">Chọn Sách:</label>
                    <select
                      value={selectedBook.id}
                      onChange={(e) => {
                        const b = BIBLE_BOOKS.find((bk) => bk.id === e.target.value);
                        if (b) {
                          setSelectedBook(b);
                          setSelectedChapter(1);
                          setVerseStart(1);
                          setVerseEnd(1);
                        }
                      }}
                      className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2 text-xs text-stone-100 font-serif focus:outline-none focus:border-[#c5a059]"
                    >
                      {filteredBooks.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.totalChapters} đoạn)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter Selector Grid */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-serif">
                      <span>Đoạn / Chương (1–{selectedBook.totalChapters}):</span>
                      <span className="font-mono text-[#c5a059] font-bold">Đoạn {selectedChapter}</span>
                    </div>
                    <div className="max-h-24 overflow-y-auto grid grid-cols-6 gap-1 p-1 bg-stone-950 border border-stone-800 rounded-lg">
                      {Array.from({ length: selectedBook.totalChapters }, (_, i) => i + 1).map((ch) => (
                        <button
                          key={ch}
                          onClick={() => setSelectedChapter(ch)}
                          className={`py-1 text-[11px] font-mono rounded transition-colors cursor-pointer ${
                            selectedChapter === ch
                              ? "bg-[#c5a059] text-stone-950 font-bold"
                              : "hover:bg-stone-800 text-stone-300"
                          }`}
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Verse Range Selection */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400">Từ Câu:</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={verseStart}
                        onChange={(e) => setVerseStart(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-stone-950 border border-stone-800 rounded p-1.5 text-xs text-stone-100 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-stone-400">Đến Câu:</label>
                      <input
                        type="number"
                        min={verseStart}
                        max={100}
                        value={verseEnd}
                        onChange={(e) => setVerseEnd(Math.max(verseStart, parseInt(e.target.value) || verseStart))}
                        className="w-full bg-stone-950 border border-stone-800 rounded p-1.5 text-xs text-stone-100 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handlePickFromBrowser}
                    className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-bold text-xs shadow-sm cursor-pointer"
                  >
                    Xem Phân Đoạn Này
                  </button>
                </div>
              )}

              {/* Scripture Preview & Action Deck */}
              {scriptureResultItem && (
                <div className="p-3 rounded-xl bg-stone-900 border border-amber-500/40 space-y-2 text-xs shadow-lg animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                    <p className="font-serif font-bold text-amber-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      <span>{scriptureResultItem.title}</span>
                    </p>
                    <span className="text-[10px] font-mono text-stone-400">
                      {scriptureResultItem.referenceTranslation}
                    </span>
                  </div>

                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {scriptureResultItem.slides.map((s, sIdx) => (
                      <div key={sIdx} className="space-y-0.5">
                        <span className="text-[9px] font-mono text-[#c5a059]">Slide #{sIdx + 1}:</span>
                        {s.lines.map((l, lIdx) => (
                          <p key={lIdx} className="font-serif text-stone-200 text-[11px] leading-relaxed">
                            {l}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* Actions for this scripture */}
                  <div className="pt-2 border-t border-stone-800 flex items-center gap-2">
                    <button
                      onClick={() => handleLiveScriptureNow(scriptureResultItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs shadow-md transition-transform hover:scale-[1.02] cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5 animate-pulse" />
                      <span>Chiếu Ngay</span>
                    </button>

                    <button
                      onClick={() => handleAddScriptureToPlaylist(scriptureResultItem)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-[#c5a059] border border-[#c5a059]/40 font-serif font-medium text-xs transition-colors cursor-pointer"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      <span>+ Vào Setlist</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANEL 2: SLIDE MATRIX OPERATOR (5 Columns on LG) */}
        <div className="lg:col-span-5 bg-[#131519] border border-stone-800/90 rounded-xl flex flex-col overflow-hidden shadow-lg">
          {/* Header & Pitch/Tone Bar */}
          <div className="p-3 border-b border-stone-800 bg-stone-900/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                {activeItem.songNumber && (
                  <span className="text-[11px] font-mono font-bold text-[#c5a059] bg-[#c5a059]/15 px-2 py-0.5 rounded border border-[#c5a059]/30">
                    TC #{activeItem.songNumber}
                  </span>
                )}
                {isScripture && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                    KINH THÁNH
                  </span>
                )}
                <h3 className="font-serif text-sm sm:text-base font-bold text-stone-100 truncate max-w-xs">
                  {activeItem.title}
                </h3>
              </div>
              <p className="text-[10px] text-stone-400 italic font-serif">
                {activeItem.subtitle}
              </p>
            </div>

            {/* Musician Chords & Transposition Controls */}
            {!isScripture && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPresenterChords(!showPresenterChords)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs transition-colors cursor-pointer ${
                    showPresenterChords
                      ? "bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/40"
                      : "bg-stone-800 text-stone-400 border-stone-700"
                  }`}
                  title="Bật/Tắt hợp âm trên màn hình điều khiển"
                >
                  <Guitar className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span className="text-[11px]">Hợp Âm</span>
                </button>

                {showPresenterChords && activeItem.defaultKey && (
                  <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg p-0.5 text-xs">
                    <button
                      onClick={() => setSemitoneShift((prev) => prev - 1)}
                      className="px-1.5 py-0.5 text-stone-400 hover:text-stone-100 font-mono font-bold cursor-pointer"
                      title="Hạ nửa cung (-1)"
                    >
                      -
                    </button>
                    <span className="px-1.5 text-[11px] font-mono text-[#c5a059] font-bold">
                      {currentKey}
                    </span>
                    <button
                      onClick={() => setSemitoneShift((prev) => prev + 1)}
                      className="px-1.5 py-0.5 text-stone-400 hover:text-stone-100 font-mono font-bold cursor-pointer"
                      title="Tăng nửa cung (+1)"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Bar: Prev / Next / Hotkeys */}
          <div className="px-3 py-2 border-b border-stone-800/80 bg-stone-950/60 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevSlide}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-serif transition-colors cursor-pointer"
                title="Phím mũi tên Trái hoặc Lên"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Trước (←)</span>
              </button>

              <button
                onClick={handleNextSlide}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-[#c5a059] hover:from-amber-500 hover:to-[#d6b068] text-stone-950 font-serif font-bold text-xs transition-all shadow-candle cursor-pointer"
                title="Phím Space hoặc mũi tên Phải/Xuống"
              >
                <span>Tiếp Theo (Space)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-1 font-mono">
              <Keyboard className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">Space: Tiếp | ESC: Tắt</span>
            </div>
          </div>

          {/* Slide Deck Matrix Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 xl:grid-cols-2 gap-2.5 content-start">
            {activeItem.slides.map((slide, idx) => {
              const isLive = idx === activeSlideIndex && isProjecting;
              const isNext = idx === previewSlideIndex && isProjecting;
              const isChorus =
                slide.id.startsWith("c") ||
                slide.label.toLowerCase().includes("điệp") ||
                slide.label.toLowerCase().includes("chorus");
              const isBridge =
                slide.id.startsWith("b") ||
                slide.label.toLowerCase().includes("bridge");

              return (
                <div
                  key={slide.id}
                  onClick={() => handleProjectSlide(idx)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all relative flex flex-col justify-between ${
                    isLive
                      ? "bg-gradient-to-r from-red-950/40 to-stone-900 border-red-500 shadow-candle ring-2 ring-red-500/40"
                      : isNext
                      ? "bg-amber-950/20 border-amber-500/60 border-dashed"
                      : isChorus
                      ? "bg-stone-900/80 border-[#c5a059]/30 hover:border-[#c5a059]/60"
                      : isBridge
                      ? "bg-stone-900/80 border-purple-500/30 hover:border-purple-500/50"
                      : isScripture
                      ? "bg-stone-900/60 border-amber-500/20 hover:border-amber-500/50"
                      : "bg-stone-900/50 border-stone-800 hover:border-stone-700"
                  }`}
                >
                  {/* Card Header: Stanza Badge & Hotkey Tag */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-serif font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isScripture
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : isChorus
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : isBridge
                            ? "bg-purple-400/20 text-purple-300 border border-purple-400/30"
                            : "bg-blue-400/20 text-blue-300 border border-blue-400/30"
                        }`}
                      >
                        {slide.label}
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

                  {/* Lyrics / Verses Text Preview */}
                  <div className="space-y-1 font-serif text-xs">
                    {slide.lines.map((line, lIdx) => {
                      const chord =
                        slide.chordsLines?.[lIdx] && showPresenterChords
                          ? transposeChordsLine(slide.chordsLines[lIdx], semitoneShift)
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

        {/* PANEL 3: DUAL MONITORS & PRODUCTION STYLE (3.5 Columns on LG) */}
        <div className="lg:col-span-3 xl:col-span-4 flex flex-col space-y-4">
          {/* MONITOR 1: PROGRAM OUT (Livestream Screen Simulation) */}
          <div className="bg-[#131519] border border-stone-800/90 rounded-xl overflow-hidden shadow-lg flex flex-col">
            <div className="p-2.5 bg-stone-900/80 border-b border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#c5a059]" />
                <span className="font-serif font-bold text-stone-200">
                  MÀN HÌNH TÍN HỮU (PROGRAM OUT)
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

              {/* Projection Simulation Layer */}
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
                      {isScripture ? (
                        <BookOpen className="w-3 h-3 text-amber-400 animate-pulse" />
                      ) : (
                        <Music2 className="w-2.5 h-2.5 text-[#c5a059] animate-pulse" />
                      )}
                      <span className="font-bold truncate">{activeItem.title}</span>
                      <span className="text-white/30">•</span>
                      <span className="text-[#c5a059]/90 font-medium">
                        {activeItem.slides[activeSlideIndex]?.label}
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
                      Màn hình đen (Tín hữu đang xem video không có chữ)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MONITOR 2: STAGE DISPLAY / CONFIDENCE MONITOR (Màn hình nhắc lời) */}
          <div className="bg-[#131519] border border-stone-800/90 rounded-xl p-3.5 shadow-lg flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                <div className="flex items-center gap-1.5 text-xs text-stone-300 font-serif font-bold">
                  <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>MÀN HÌNH NHẮC LỜI (STAGE DISPLAY)</span>
                </div>
                <span className="text-[10px] font-mono text-stone-500">Confidence Screen</span>
              </div>

              {/* Current Live Line */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400">
                  ĐANG CHIẾU (CURRENT):
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
                      Đang ở trạng thái chờ (Chưa phát sóng)...
                    </p>
                  )}
                </div>
              </div>

              {/* Next Upcoming Slide Preview */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-stone-400">
                  CÂU KẾ TIẾP (UPCOMING / NEXT):
                </span>
                <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800/80 min-h-[50px] flex flex-col justify-center">
                  {nextSlide ? (
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-[#c5a059]">
                        [{nextSlide.label}]
                      </span>
                      {nextSlide.lines.slice(0, 2).map((l, idx) => (
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

            {/* Presentation Settings & Template Bar */}
            <div className="pt-2 border-t border-stone-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-400 font-serif">Kiểu bố cục:</span>
                <div className="flex items-center gap-1 font-serif text-[10px]">
                  {[
                    { id: "lowerthird", label: "1/3 Dưới" },
                    { id: "subtitle", label: "Phụ Đề" },
                    { id: "fullscreen", label: "Toàn Màn" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setDisplayStyle(m.id as any)}
                      className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        displayStyle === m.id
                          ? "bg-[#c5a059]/20 text-[#c5a059] border-[#c5a059]/50 font-bold"
                          : "bg-stone-900 text-stone-400 border-stone-800"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Song Switcher Footer */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[11px] text-stone-400 font-serif">
                  Chuyển sang phần kế tiếp:
                </span>
                <button
                  onClick={handleNextItemInPlaylist}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-[#c5a059] font-serif font-medium text-xs transition-colors cursor-pointer"
                  title="Chuyển sang phần tiếp theo trong chương trình Chúa Nhật"
                >
                  <span>Mục Kế Tiếp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
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
                  <span>Soạn & Nạp Bài Hát / Lời Ca Mới</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Dành cho bài thánh ca đặc biệt, bài hát tôn vinh của ban hát hoặc thơ chúc tụng
                </p>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
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
                  className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-750 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#c5a059] hover:bg-[#b38e47] text-stone-950 font-serif font-bold shadow-candle cursor-pointer"
                >
                  Nạp Vào Trình Chiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 4. MODAL: KEYBOARD SHORTCUTS GUIDE ================= */}
      {showHotkeysModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setShowHotkeysModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-stone-900 border border-[#c5a059]/40 rounded-xl p-5 shadow-2xl space-y-4"
          >
            <div className="border-b border-stone-800 pb-2.5 flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#c5a059]" />
                <span>Bảng Phím Tắt Điều Khiển Nhanh</span>
              </h3>
              <button
                onClick={() => setShowHotkeysModal(false)}
                className="text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: "Space / → / ↓", desc: "Chuyển sang câu / slide kế tiếp" },
                { key: "← / ↑", desc: "Quay lại câu / slide trước" },
                { key: "D", desc: "Nhảy nhanh vào Điệp Khúc (Chorus)" },
                { key: "1", desc: "Quay lại Câu 1 (Verse 1)" },
                { key: "ESC / C", desc: "Xóa màn hình ngay tức thì (Blackout)" },
                { key: "N", desc: "Chuyển sang bài / phần tiếp theo trong Setlist" },
                { key: "F11", desc: "Bật / Tắt Toàn Màn Hình trên máy chiếu" },
              ].map((hk) => (
                <div
                  key={hk.key}
                  className="flex items-center justify-between p-2 rounded-lg bg-stone-950 border border-stone-800"
                >
                  <span className="font-mono text-[#c5a059] font-bold">{hk.key}</span>
                  <span className="text-stone-300 font-serif">{hk.desc}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-800 text-center">
              <button
                onClick={() => setShowHotkeysModal(false)}
                className="px-4 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-750 text-stone-200 font-serif text-xs cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
