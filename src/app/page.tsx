"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getChurchAvatar, getDefaultChurchAvatar } from "@/lib/churchAvatar";
import {
  Search,
  Church as ChurchIcon,
  MapPin,
  Clock,
  Radio,
  ArrowRight,
  Plus,
  Sparkles,
  X,
  Check,
  Building2,
  Users,
  ShieldCheck,
  Lock,
  Mail,
  User as UserIcon,
  Newspaper,
  Heart,
  HeartHandshake,
  Share2,
  BookOpen,
  Music,
  Play,
  Flame,
  Shield,
  Bell,
  Copy,
  RefreshCw,
  Volume2,
  VolumeX,
  Calendar,
  Compass,
  Eye,
  MessageCircle,
  ThumbsUp,
  Send,
  Image as ImageIcon,
  MoreHorizontal,
  Smile,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Trash2,
} from "lucide-react";
import { ImageUploadBox } from "@/components/common/ImageUploadBox";

interface ChurchItem {
  _id: string;
  name: string;
  slug: string;
  denomination: string;
  address: string;
  streamKey: string;
  liveSchedule: string;
  worshipSchedules?: {
    id?: string;
    title: string;
    dayOfWeek: string;
    time: string;
    type?: string;
    description?: string;
  }[];
  isActive: boolean;
  profileConfig?: {
    coverImageUrl?: string;
    avatarUrl?: string;
    slogan?: string;
    about?: string;
    leadPastor?: string;
  };
  currentService?: {
    title: string;
    speaker: string;
    speakerTitle?: string;
    scriptureReference?: string;
    welcomeMessage?: string;
    isLive: boolean;
    viewersCount: number;
  };
  bankingConfig?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

interface FeedComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
}

interface FeedPost {
  id: string;
  churchSlug: string;
  churchName: string;
  denomination: string;
  avatar: string;
  timeAgo: string;
  category: "live" | "scripture" | "announcement" | "testimony" | "sermon" | "fellowship" | "devotion" | string;
  title?: string;
  content: string;
  scriptureVerse?: string;
  mediaType: "video" | "image" | "scripture" | string;
  mediaUrl?: string;
  isLive?: boolean;
  viewersCount?: number;
  speaker?: string;
  amenCount: number;
  loveCount: number;
  shareCount: number;
  comments: FeedComment[];
}

// Initial Facebook-style Stories
const STORIES_DATA = [
  {
    id: "create",
    isCreate: true,
    title: "Thắp Nến / Đăng Ký",
    subtitle: "Tạo lời cầu thay mới",
    bg: "from-gold-500/20 to-amber-700/20",
  },
  {
    id: "s1",
    churchName: "HTTL Lời Ban Sự Sống",
    slug: "loibansusong",
    avatar: getDefaultChurchAvatar("Hội Thánh Tin Lành Lời Ban Sự Sống", "loibansusong"),
    cover: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80",
    isLive: true,
    tag: "Đang Trực Tiếp",
  },
  {
    id: "s2",
    churchName: "HTTL Ân Điển Đà Nẵng",
    slug: "andien",
    avatar: getDefaultChurchAvatar("Hội Thánh Tin Lành Ân Điển Đà Nẵng", "andien"),
    cover: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=80",
    isLive: false,
    tag: "Chúa Nhật 08:30",
  },
  {
    id: "s3",
    churchName: "Hội Thánh Hà Nội",
    slug: "hanoi",
    avatar: getDefaultChurchAvatar("Hội Thánh Tin Lành Hà Nội", "hanoi"),
    cover: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=800&q=80",
    isLive: false,
    tag: "Đêm Ca Khen",
  },
  {
    id: "s4",
    churchName: "Hội Thánh Bến Tre",
    slug: "emmanuel",
    avatar: getDefaultChurchAvatar("Hội Thánh Tin Lành Emmanuel Bến Tre", "emmanuel"),
    cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
    isLive: false,
    tag: "Học Kinh Thánh",
  },
];

// Initial Facebook-style feed posts
const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: "post-live-1",
    churchSlug: "loibansusong",
    churchName: "Hội Thánh Tin Lành Lời Ban Sự Sống",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    avatar: getDefaultChurchAvatar("Hội Thánh Tin Lành Lời Ban Sự Sống", "loibansusong"),
    timeAgo: "Đang phát trực tiếp • 15 phút trước",
    category: "live",
    isLive: true,
    viewersCount: 382,
    speaker: "Mục sư Quản nhiệm Nguyễn Văn An",
    title: "Chương Trình Thờ Phượng Chúa Nhật: Ân Điển & Sự Bình An Trọn Vẹn",
    content:
      "Kính mời toàn thể quý tôi con Chúa khắp nơi cùng hòa lòng dự phần trong giờ thờ phượng thiêng liêng sáng Chúa Nhật hôm nay. Cùng dâng tiếng hát tôn vinh Đức Chúa Trời và lắng nghe Sứ điệp Lời Chúa từ Mục sư Quản nhiệm.",
    scriptureVerse: "Rô-ma 8:31-39",
    mediaType: "video",
    mediaUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
    amenCount: 148,
    loveCount: 94,
    shareCount: 28,
    comments: [
      {
        id: "c1",
        author: "Cô Nguyễn Thị Mai (TP. HCM)",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
        content: "Amen, tạ ơn Chúa! Âm thanh và hình ảnh hôm nay rất rõ nét và trang nghiêm. Nguyện Chúa ban phước dồi dào trên Mục sư và ban kỹ thuật!",
        time: "10 phút trước",
      },
      {
        id: "c2",
        author: "Gia đình Chấp sự Trần Hùng",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
        content: "Cả gia đình chúng tôi tại Bình Dương đang cùng hiệp ý thờ phượng. Ha-lê-lu-gia!",
        time: "6 phút trước",
      },
    ],
  },
  {
    id: "post-scripture-2",
    churchSlug: "andien",
    churchName: "Hội Thánh Tin Lành Ân Điển",
    denomination: "Hội Thánh Báp-tít Việt Nam",
    avatar: getDefaultChurchAvatar("Hội Thánh Tin Lành Ân Điển", "andien"),
    timeAgo: "2 giờ trước • 🌐 Công khai",
    category: "scripture",
    content:
      "Lời Chúa là sức mạnh và sự nâng đỡ kỳ diệu cho linh hồn chúng ta giữa mọi cơn bão táp của cuộc đời. Hãy cùng suy ngẫm câu gốc nuôi dưỡng tâm linh hôm nay:",
    scriptureVerse: "“Đức Giê-hô-va là Đấng chăn giữ tôi: tôi chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh.” — Thi-thiên 23:1-2",
    mediaType: "scripture",
    amenCount: 215,
    loveCount: 120,
    shareCount: 42,
    comments: [
      {
        id: "c3",
        author: "Thầy truyền đạo Minh Đức",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
        content: "Cảm tạ Chúa vì Ngài luôn là Đấng chăn giữ nhân từ trọn đời chúng ta.",
        time: "1 giờ trước",
      },
    ],
  },
  {
    id: "post-photo-3",
    churchSlug: "loibansusong",
    churchName: "Ban Thanh Niên & Ban Hát Lễ Hội Thánh",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    avatar: getDefaultChurchAvatar("Ban Thanh Niên & Ban Hát Lễ Hội Thánh", "loibansusong"),
    timeAgo: "Hôm qua lúc 19:30 • 🌐 Công khai",
    category: "announcement",
    content:
      "Khoảnh khắc phước hạnh trong đêm bồi linh & ca khen Chúa của các bạn trẻ cuối tuần qua. Nguyện Chúa dấy lên một thế hệ trẻ kính sợ Chúa, vững bước trong Lời Ngài và kết quả cho vương quốc Đức Chúa Trời!",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    amenCount: 98,
    loveCount: 65,
    shareCount: 19,
    comments: [],
  },
];

const PROTESTANT_ILLUSTRATIONS = [
  {
    name: "Tiệc Thánh",
    category: "Tiệc Thánh",
    icon: "🍞",
    url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Kinh Thánh",
    category: "Lời Chúa",
    icon: "📖",
    url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thanh Niên",
    category: "Thông Công",
    icon: "🤝",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ban Hát Lễ",
    category: "Ngợi Khen",
    icon: "🎵",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thiếu Nhi",
    category: "Trường Chúa Nhật",
    icon: "👶",
    url: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Hiệp Nguyện",
    category: "Cầu Nguyện",
    icon: "🙏",
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function ChurchDirectoryPage() {
  const router = useRouter();
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [navTab, setNavTab] = useState<"feed" | "sanctuary" | "churches" | "prayers">("feed");
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<string>("all");
  const [userReactions, setUserReactions] = useState<Record<string, "amen" | "love" | null>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInputText, setCommentInputText] = useState<Record<string, string>>({});
  const [composerText, setComposerText] = useState("");
  const [composerCategory, setComposerCategory] = useState("announcement");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showPastorPostModal, setShowPastorPostModal] = useState<boolean>(false);
  const [isPublishingPastorPost, setIsPublishingPastorPost] = useState<boolean>(false);
  const [pastorPostForm, setPastorPostForm] = useState({
    title: "",
    content: "",
    category: "announcement",
    scriptureVerse: "",
    imageUrl: "",
    videoUrl: "",
    churchSlug: "",
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [showPrayerModal, setShowPrayerModal] = useState<boolean>(false);
  const [prayerForm, setPrayerForm] = useState({
    name: "",
    isAnonymous: false,
    contact: "",
    category: "Sức khỏe & Chữa lành",
    churchSlug: "loibansusong",
    prayerContent: "",
  });
  const [prayerSubmitted, setPrayerSubmitted] = useState<boolean>(false);
  const [isSubmittingPrayer, setIsSubmittingPrayer] = useState<boolean>(false);

  // Time formatter for posts & comments
  function formatTimeAgo(dateString?: string | Date) {
    if (!dateString) return "Vừa xong";
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return "Vừa xong";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  // Meditative Audio Hymn Synth Player
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<any>(null);

  // Sunday Service Countdown State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // New Church Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDenomination, setFormDenomination] = useState("Hội Thánh Tin Lành Việt Nam");
  const [formAddress, setFormAddress] = useState("");
  const [formStreamKey, setFormStreamKey] = useState("");
  const [formSchedule, setFormSchedule] = useState("Chúa Nhật: Lễ 1 (08:00) • Lễ 2 (09:30)");
  const [formSchedules, setFormSchedules] = useState<
    { id: string; title: string; dayOfWeek: string; time: string; type: string; description: string }[]
  >([
    {
      id: "1",
      title: "Lễ Thờ Phượng 1",
      dayOfWeek: "Chúa Nhật",
      time: "08:00 - 09:30",
      type: "main",
      description: "Thánh đường",
    },
    {
      id: "2",
      title: "Lễ Thờ Phượng 2",
      dayOfWeek: "Chúa Nhật",
      time: "09:45 - 11:15",
      type: "main",
      description: "Phát sóng trực tuyến",
    },
  ]);
  const [formAdminName, setFormAdminName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formBankName, setFormBankName] = useState("MB Bank");
  const [formAccNumber, setFormAccNumber] = useState("");
  const [formAccHolder, setFormAccHolder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Fetch all posts from MongoDB across all churches
  const fetchPosts = async () => {
    try {
      setLoadingPosts(true);
      const res = await fetch("/api/posts");
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: FeedPost[] = json.data.map((p: any) => {
            let mediaType: "video" | "image" | "scripture" = "image";
            if (p.videoUrl) mediaType = "video";
            else if (p.scriptureVerse && !p.imageUrl) mediaType = "scripture";
            else if (p.imageUrl) mediaType = "image";

            return {
              id: p._id || p.id,
              churchSlug: p.churchSlug,
              churchName: p.churchName || p.author?.name || "Hội Thánh Tin Lành",
              denomination: p.churchDenomination || "Hội Thánh Tin Lành Việt Nam",
              avatar: getChurchAvatar(
                p.churchName || p.author?.name || "Hội Thánh",
                p.churchSlug,
                p.churchAvatar || p.author?.avatarUrl
              ),
              timeAgo: p.isLive ? "Đang phát trực tiếp" : formatTimeAgo(p.createdAt),
              category: p.category || "announcement",
              title: p.title,
              content: p.content,
              scriptureVerse: p.scriptureVerse,
              mediaType,
              mediaUrl: p.videoUrl || p.imageUrl,
              isLive: Boolean(p.isLive),
              viewersCount: p.viewersCount || 0,
              speaker: p.author?.name || "Mục sư Quản Nhiệm",
              amenCount: p.likesCount || 0,
              loveCount: Math.max(1, Math.floor((p.likesCount || 10) / 2)),
              shareCount: Math.max(0, Math.floor((p.likesCount || 5) / 3)),
              comments: (p.comments || []).map((c: any, idx: number) => ({
                id: c._id || `c-${idx}`,
                author: c.authorName || "Tín Hữu",
                avatar:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                content: c.content,
                time: formatTimeAgo(c.createdAt),
              })),
            };
          });
          setFeedPosts(mapped);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy bài viết:", err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Fetch churches
  const fetchChurches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/churches");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setChurches(json.data);
        }
      }
    } catch (err) {
      console.error("Lỗi tải danh sách Hội Thánh:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchChurches();
    fetchPosts();

    // Check user auth session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.user) {
          setCurrentUser(json.data.user);
        }
      })
      .catch(() => { });

    return () => {
      stopAmbientHymn();
    };
  }, []);

  // Countdown timer to next Sunday 09:00 AM
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay();
      let daysUntilSunday = (7 - day) % 7;

      if (day === 0 && (now.getHours() > 11 || (now.getHours() === 11 && now.getMinutes() >= 30))) {
        daysUntilSunday = 7;
      }

      target.setDate(now.getDate() + daysUntilSunday);
      target.setHours(9, 0, 0, 0);

      const diff = target.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Peaceful Ambient Hymnal Chords
  const playAmbientHymn = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const chordProgression = [
        [261.63, 329.63, 392.0, 493.88], // C, E, G, B
        [220.0, 261.63, 329.63, 440.0],  // A, C, E, A
        [174.61, 261.63, 329.63, 349.23], // F, C, E, F
        [196.0, 261.63, 293.66, 392.0],  // G, C, D, G
      ];
      let step = 0;

      const playChord = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;
        const now = ctx.currentTime;
        const chord = chordProgression[step % chordProgression.length];
        step++;

        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.045, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 6);
        });
      };

      playChord();
      synthTimerRef.current = setInterval(playChord, 5200);
      setIsAudioPlaying(true);
    } catch (e) {
      console.warn("AudioContext not allowed or not supported yet:", e);
    }
  };

  const stopAmbientHymn = () => {
    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
      synthTimerRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => { });
      audioCtxRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const toggleAmbientAudio = () => {
    if (isAudioPlaying) {
      stopAmbientHymn();
    } else {
      playAmbientHymn();
    }
  };

  // Facebook-style Amen reaction toggle (persisted to backend)
  const handleReaction = async (postId: string, type: "amen" | "love") => {
    const current = userReactions[postId];
    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        if (current === type) {
          return {
            ...post,
            amenCount: type === "amen" ? Math.max(0, post.amenCount - 1) : post.amenCount,
            loveCount: type === "love" ? Math.max(0, post.loveCount - 1) : post.loveCount,
          };
        }
        return {
          ...post,
          amenCount:
            type === "amen"
              ? post.amenCount + 1
              : current === "amen"
                ? Math.max(0, post.amenCount - 1)
                : post.amenCount,
          loveCount:
            type === "love"
              ? post.loveCount + 1
              : current === "love"
                ? Math.max(0, post.loveCount - 1)
                : post.loveCount,
        };
      })
    );

    setUserReactions((prev) => ({
      ...prev,
      [postId]: current === type ? null : type,
    }));

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch (e) {
      console.error("Lỗi tương tác like:", e);
    }
  };

  // Submit comment to post (persisted to backend)
  const handleAddComment = async (postId: string) => {
    const text = commentInputText[postId]?.trim();
    if (!text) return;

    const newComment: FeedComment = {
      id: "comm-" + Date.now(),
      author: "Tín Hữu (Bạn)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
      content: text,
      time: "Vừa xong",
    };

    setFeedPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      })
    );

    setCommentInputText((prev) => ({ ...prev, [postId]: "" }));

    try {
      await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: "Tín Hữu (Bạn)",
          content: text,
        }),
      });
    } catch (e) {
      console.error("Lỗi gửi bình luận:", e);
    }
  };

  // Create official church post (only for logged-in pastor/admin/superadmin)
  const handlePublishPost = async (customPayload?: {
    churchSlug?: string;
    title?: string;
    content: string;
    category?: string;
    scriptureVerse?: string;
    imageUrl?: string;
    videoUrl?: string;
  }) => {
    if (!currentUser) {
      alert("Chỉ Mục sư hoặc Ban Quản Trị Hội Thánh mới có quyền đăng bài chính thức lên Bảng Tin.");
      return;
    }

    const churchSlugToUse =
      customPayload?.churchSlug ||
      (currentUser.churchSlug && currentUser.churchSlug !== "system"
        ? currentUser.churchSlug
        : churches[0]?.slug || "loibansusong");

    const contentToUse = customPayload ? customPayload.content.trim() : composerText.trim();
    if (!contentToUse) {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    const categoryToUse = customPayload?.category || composerCategory || "announcement";
    const titleToUse = customPayload?.title?.trim() || "";

    try {
      setIsPublishingPastorPost(true);
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: churchSlugToUse,
          title: titleToUse,
          content: contentToUse,
          category: categoryToUse,
          scriptureVerse: customPayload?.scriptureVerse?.trim() || "",
          imageUrl: customPayload?.imageUrl?.trim() || "",
          videoUrl: customPayload?.videoUrl?.trim() || "",
          authorName: currentUser.fullName,
          authorRole:
            currentUser.role === "superadmin"
              ? "Tổng Quản Trị Hệ Thống"
              : "Mục sư Quản Nhiệm",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setComposerText("");
        setShowPastorPostModal(false);
        setPastorPostForm({
          title: "",
          content: "",
          category: "announcement",
          scriptureVerse: "",
          imageUrl: "",
          videoUrl: "",
          churchSlug: "",
        });
        await fetchPosts();
      } else {
        alert(data.message || "Không thể đăng bài viết.");
      }
    } catch (err) {
      console.error("Lỗi đăng bài viết:", err);
      alert("Đã xảy ra lỗi kết nối khi đăng bài viết.");
    } finally {
      setIsPublishingPastorPost(false);
    }
  };

  // Submit prayer request from believer
  const handleSendPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerForm.prayerContent.trim()) return;

    try {
      setIsSubmittingPrayer(true);
      await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: prayerForm.churchSlug || churches[0]?.slug || "loibansusong",
          name: prayerForm.isAnonymous ? "Con cái Chúa (Ẩn danh)" : (prayerForm.name || "Ẩn danh"),
          isAnonymous: prayerForm.isAnonymous,
          contact: prayerForm.contact || null,
          wantsPastorCall: Boolean(prayerForm.contact),
          category: prayerForm.category,
          confidentialLevel: "pastor_only",
          prayerContent: prayerForm.prayerContent.trim(),
        }),
      });
      setPrayerSubmitted(true);
    } catch (err) {
      console.error("Lỗi gửi lời cầu nguyện:", err);
      setPrayerSubmitted(true);
    } finally {
      setIsSubmittingPrayer(false);
    }
  };

  // Toggle favorite church
  const toggleFavorite = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(slug)) {
      updated = favorites.filter((s) => s !== slug);
    } else {
      updated = [...favorites, slug];
    }
    setFavorites(updated);
    try {
      localStorage.setItem("sanctuary_favorites", JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter churches
  const filteredChurches = churches.filter((church) => {
    return (
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filter feed posts across all churches
  const filteredFeedPosts = feedPosts.filter((post) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      post.churchName.toLowerCase().includes(term) ||
      (post.title && post.title.toLowerCase().includes(term)) ||
      post.content.toLowerCase().includes(term) ||
      (post.scriptureVerse && post.scriptureVerse.toLowerCase().includes(term));

    let matchesCategory = true;
    if (feedCategoryFilter === "announcement") {
      matchesCategory = post.category === "announcement";
    } else if (feedCategoryFilter === "scripture") {
      matchesCategory = post.category === "scripture" || Boolean(post.scriptureVerse);
    } else if (feedCategoryFilter === "sermon") {
      matchesCategory = post.category === "sermon" || post.mediaType === "video";
    } else if (feedCategoryFilter === "fellowship") {
      matchesCategory = post.category === "fellowship" || post.category === "testimony";
    } else if (feedCategoryFilter === "worship") {
      matchesCategory = post.category === "worship" || Boolean(post.isLive);
    }

    return matchesSearch && matchesCategory;
  });

  const liveChurches = churches.filter((c) => Boolean(c.currentService?.isLive));
  const currentUserChurch = churches.find((c) => c.slug === currentUser?.churchSlug);
  const churchDisplayName = currentUserChurch?.name
    ? currentUserChurch.name.startsWith("Hội Thánh")
      ? currentUserChurch.name
      : `Hội Thánh ${currentUserChurch.name}`
    : "";

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formSlug || !formStreamKey) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchName: formName,
          slug: formSlug,
          denomination: formDenomination,
          address: formAddress || "Việt Nam",
          streamKey: formStreamKey,
          liveSchedule: formSchedules.length > 0
            ? formSchedules.map((s) => `${s.dayOfWeek}: ${s.title} (${s.time})`).join(" • ")
            : formSchedule,
          worshipSchedules: formSchedules,
          adminName: formAdminName || "Mục sư Quản Nhiệm",
          email: formEmail,
          password: formPassword,
          bankName: formBankName || "MB Bank",
          accountNumber: formAccNumber || "0386888999",
          accountHolder: formAccHolder || formName.toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể đăng ký Hội Thánh");
      }

      await fetchChurches();
      setShowRegisterModal(false);
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090d] text-sanctuary-100 flex flex-col font-sans selection:bg-gold-400/25 selection:text-gold-200">
      {/* ========================================================================= */}
      {/* 1. FACEBOOK-STYLE GLOBAL APP HEADER (THANH ĐIỀU HƯỚNG TRÊN CÙNG)           */}
      {/* ========================================================================= */}
      <header className="w-full bg-[#0b0e14]/95 border-b border-white/[0.08] px-2.5 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-50 backdrop-blur-xl shadow-md">
        {/* Left: Brand Icon + Search Bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 md:flex-initial min-w-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-sanctuary-800 to-sanctuary-950 border border-gold-400/60 flex items-center justify-center text-gold-400 shadow-candle group-hover:border-gold-300 transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 sm:w-5 sm:h-5 text-gold-400 drop-shadow-[0_0_8px_rgba(197,160,89,0.7)]"
              >
                <path d="M12 2v20" />
                <path d="M6 7h12" />
              </svg>
            </div>
            <div className="hidden lg:block">
              <span className="font-serif font-bold text-sm tracking-wide text-white block">
                Cổng Thờ Phượng
              </span>
              <span className="text-[10px] text-gold-400/90 font-serif tracking-widest uppercase block -mt-0.5">
                Cộng Đồng Cơ Đốc
              </span>
            </div>
          </Link>

          {/* Facebook-style round search bar */}
          <div className="relative flex items-center flex-1 max-w-[220px] sm:max-w-[280px]">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sanctuary-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm Hội Thánh, câu gốc..."
              className="w-full bg-sanctuary-850 border border-white/[0.06] focus:border-gold-400/60 rounded-full pl-8 sm:pl-9 pr-3 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Center: Facebook-style Primary Navigation Icon Tabs (Desktop Only) */}
        <nav className="hidden md:flex items-center justify-center gap-1 sm:gap-2 flex-1 max-w-md mx-2">
          <button
            onClick={() => setNavTab("feed")}
            className={`flex items-center justify-center h-10 px-4 sm:px-6 rounded-xl transition-all relative ${navTab === "feed"
              ? "text-gold-400 bg-gold-400/10"
              : "text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850"
              }`}
            title="Bảng Tin Mục Vụ"
          >
            <Newspaper className="w-5 h-5" />
            {navTab === "feed" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setNavTab("sanctuary")}
            className={`flex items-center justify-center h-10 px-4 sm:px-6 rounded-xl transition-all relative ${navTab === "sanctuary"
              ? "text-gold-400 bg-gold-400/10"
              : "text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850"
              }`}
            title="Lễ Thờ Phượng Trực Tuyến"
          >
            <div className="relative">
              <Radio className="w-5 h-5" />
              {liveChurches.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            {navTab === "sanctuary" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setNavTab("churches")}
            className={`flex items-center justify-center h-10 px-4 sm:px-6 rounded-xl transition-all relative ${navTab === "churches"
              ? "text-gold-400 bg-gold-400/10"
              : "text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850"
              }`}
            title="Danh Bạ Hội Thánh"
          >
            <Building2 className="w-5 h-5" />
            {navTab === "churches" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setNavTab("prayers")}
            className={`flex items-center justify-center h-10 px-4 sm:px-6 rounded-xl transition-all relative ${navTab === "prayers"
              ? "text-gold-400 bg-gold-400/10"
              : "text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850"
              }`}
            title="Góc Hiệp Lòng Cầu Thay"
          >
            <Heart className="w-5 h-5" />
            {navTab === "prayers" && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gold-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Quick Hymn Audio Player, Admin & Create Church */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={toggleAmbientAudio}
            className={`p-1.5 sm:p-2 rounded-full transition-all border ${isAudioPlaying
              ? "bg-gold-400/20 border-gold-400 text-gold-300 shadow-candle"
              : "bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-400 border-white/10"
              }`}
            title={isAudioPlaying ? "Tắt giai điệu thánh ca" : "Bật giai điệu thánh ca piano"}
          >
            {isAudioPlaying ? (
              <Volume2 className="w-4 h-4 text-gold-400 animate-pulse" />
            ) : (
              <Music className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-bold rounded-full bg-gold-400 hover:bg-gold-500 text-sanctuary-950 transition-colors shadow-sm cursor-pointer"
            title="Đăng ký thêm Hội Thánh mới"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Đăng Ký Hội Thánh</span>
          </button>

          {currentUser ? (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-300 border border-gold-400/40 transition-colors text-xs font-serif shadow-sm"
              title="Vào Bảng Điều Khiển Mục Vụ"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span className="hidden md:inline font-medium truncate max-w-[130px]">{currentUser.fullName}</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-sanctuary-850 hover:bg-sanctuary-800 text-stone-300 hover:text-gold-300 border border-white/10 transition-colors text-xs font-serif"
              title="Quản trị mục vụ Hội Thánh"
            >
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span className="hidden md:inline">Quản Trị</span>
            </Link>
          )}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. THE FACEBOOK-STYLE 3-COLUMN MAIN BODY                                 */}
      {/* ========================================================================= */}
      <div className="flex-1 max-w-[1480px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4 flex gap-6 items-start pb-24 md:pb-8">
        {/* ----------------------------------------------------------------------- */}
        {/* 2.1 LEFT COLUMN: FACEBOOK-STYLE SHORTCUTS & NAVIGATION                  */}
        {/* ----------------------------------------------------------------------- */}
        <aside className="w-64 xl:w-72 hidden md:flex flex-col gap-4 shrink-0 sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pb-6 select-none">
          {/* User / Platform Welcome Card (Role-Aware) */}
          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sanctuary-900 via-[#10141f] to-[#0d1017] border border-gold-400/30 space-y-2.5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500 to-amber-300 border-2 border-gold-400 p-0.5 shadow-sm shrink-0 overflow-hidden">
                  {currentUserChurch ? (
                    <img
                      src={getChurchAvatar(currentUserChurch.name, currentUserChurch.slug, currentUserChurch.profileConfig?.avatarUrl)}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gold-400 text-sanctuary-950 flex items-center justify-center font-bold text-sm">
                      {currentUser.role === "superadmin" ? "👑" : currentUser.fullName?.slice(0, 1) || "⛪"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white block truncate">
                      {currentUser.fullName}
                    </span>
                  </div>
                  <span className="text-[11px] text-gold-400 font-serif block truncate font-medium">
                    {currentUser.role === "superadmin"
                      ? "👑 Tổng Quản Trị Hệ Thống"
                      : currentUser.role === "pastor"
                      ? "Mục Sư Quản Nhiệm"
                      : currentUser.role === "tech_leader"
                      ? "Ban Kỹ Thuật Hội Thánh"
                      : "Ban Quản Trị Mục Vụ"}
                  </span>
                  {churchDisplayName && (
                    <span className="text-[10px] text-sanctuary-400 font-sans block truncate mt-0.5" title={churchDisplayName}>
                      {churchDisplayName}
                    </span>
                  )}
                </div>
              </div>

              {/* Quick actions when logged in */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px]">
                <Link
                  href="/admin"
                  className="text-gold-300 hover:text-gold-200 hover:underline flex items-center gap-1 font-serif"
                  title="Vào Bảng Điều Khiển Quản Trị Mục Vụ"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                  <span>Trang Mục Vụ</span>
                </Link>
                <button
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    setCurrentUser(null);
                    window.location.reload();
                  }}
                  className="text-sanctuary-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Đăng xuất khỏi tài khoản"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-sanctuary-900 border border-white/[0.06] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500/20 to-amber-300/20 border border-gold-400/30 p-0.5 shadow-sm shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Tín hữu"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold text-white block truncate">
                  Con Cái Chúa (Tín Hữu)
                </span>
                <span className="text-[11px] text-gold-400 font-serif block">
                  Phòng Thờ Phượng Trực Tuyến
                </span>
              </div>
            </div>
          )}

          {/* Primary Shortcuts Menu */}
          <div className="space-y-1">
            <button
              onClick={() => setNavTab("feed")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-serif font-medium transition-colors text-left ${navTab === "feed"
                ? "bg-sanctuary-850 text-gold-300 border border-gold-400/20"
                : "text-sanctuary-300 hover:bg-sanctuary-850/60 hover:text-white"
                }`}
            >
              <div className="w-7 h-7 rounded-lg bg-gold-400/10 flex items-center justify-center text-gold-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <span className="text-sm">Bảng Tin Mục Vụ</span>
            </button>

            <button
              onClick={() => setNavTab("sanctuary")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-serif font-medium transition-colors text-left ${navTab === "sanctuary"
                ? "bg-sanctuary-850 text-gold-300 border border-gold-400/20"
                : "text-sanctuary-300 hover:bg-sanctuary-850/60 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-red-600/15 flex items-center justify-center text-red-400">
                  <Radio className="w-4 h-4" />
                </div>
                <span className="text-sm">Thờ Phượng Trực Tuyến</span>
              </div>
              {liveChurches.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white animate-pulse">
                  {liveChurches.length} LIVE
                </span>
              )}
            </button>

            <button
              onClick={() => setNavTab("prayers")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-serif font-medium transition-colors text-left ${navTab === "prayers"
                ? "bg-sanctuary-850 text-gold-300 border border-gold-400/20"
                : "text-sanctuary-300 hover:bg-sanctuary-850/60 hover:text-white"
                }`}
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-sm">Góc Hiệp Lòng Cầu Thay</span>
            </button>

            <button
              onClick={() => setNavTab("churches")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-serif font-medium transition-colors text-left ${navTab === "churches"
                ? "bg-sanctuary-850 text-gold-300 border border-gold-400/20"
                : "text-sanctuary-300 hover:bg-sanctuary-850/60 hover:text-white"
                }`}
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-sm">Khám Phá Các Hội Thánh</span>
            </button>
          </div>

          <div className="h-px bg-white/[0.06] my-1" />

          {/* Lối tắt các Hội Thánh đã lưu / nổi bật */}
          <div className="space-y-1">
            <span className="text-[11px] font-serif uppercase tracking-wider text-sanctuary-400 font-bold px-3">
              Lối Tắt Hội Thánh Nổi Bật
            </span>
            {churches.slice(0, 3).map((c) => (
              <Link
                key={c._id}
                href={`/${c.slug}?view=sanctuary`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-serif text-sanctuary-300 hover:bg-sanctuary-850 hover:text-gold-300 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10 shrink-0">
                  <img
                    src={getChurchAvatar(c.name, c.slug, c.profileConfig?.avatarUrl)}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="truncate">{c.name}</span>
              </Link>
            ))}
          </div>

          {/* Scripture Verse Quote */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121620] to-[#0a0c12] border border-gold-400/20 text-xs font-serif space-y-1.5 shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-gold-400 font-bold block">
              Lời Hứa Hôm Nay
            </span>
            <p className="italic text-sanctuary-200 text-[11px] leading-relaxed">
              &ldquo;Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh.&rdquo;
            </p>
            <span className="text-[10px] text-gold-400 block text-right">— Thi-thiên 23:2</span>
          </div>

          {/* Footer mini links */}
          <div className="px-3 text-[11px] text-sanctuary-500 font-sans space-y-1">
            <div className="flex gap-2">
              <Link href="/admin" className="hover:underline">Quản Trị</Link>
              <span>•</span>
              <button onClick={() => setShowRegisterModal(true)} className="hover:underline">Đăng Ký</button>
              <span>•</span>
              <a href="#top" className="hover:underline">Đầu trang</a>
            </div>
            <p>© 2026 Cổng Thờ Phượng Trực Tuyến Việt Nam</p>
          </div>
        </aside>

        {/* ----------------------------------------------------------------------- */}
        {/* 2.2 CENTER COLUMN: THE SACRED NEWSFEED & STORIES CAROUSEL                */}
        {/* ----------------------------------------------------------------------- */}
        <main className="flex-1 max-w-2xl mx-auto w-full space-y-4">
          {/* TAB 1: BẢNG TIN (THE MAIN FACEBOOK-STYLE FEED) */}
          {navTab === "feed" && (
            <>
              {/* ================================================================= */}
              {/* FACEBOOK STORIES / REELS CAROUSEL                                  */}
              {/* ================================================================= */}
              {/* ================================================================= */}
              {/* FACEBOOK STORIES / REELS CAROUSEL (DYNAMIC FROM CHURCHES)          */}
              {/* ================================================================= */}
              <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 no-scrollbar select-none -mx-2 px-2 sm:mx-0 sm:px-0">
                {/* 1. Register new church / create post card */}
                <div
                  onClick={() => setShowRegisterModal(true)}
                  className="w-24 sm:w-32 h-36 sm:h-48 rounded-xl sm:rounded-2xl bg-sanctuary-900 border border-white/[0.08] hover:border-gold-400/50 flex flex-col justify-between p-2 sm:p-2.5 shrink-0 cursor-pointer group shadow-sm hover:shadow-candle transition-all relative overflow-hidden"
                >
                  <div className="h-20 sm:h-28 w-full rounded-lg sm:rounded-xl bg-sanctuary-850 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gold-400 text-sanctuary-950 flex items-center justify-center font-bold shadow-md">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                  <div className="text-center pt-0.5 sm:pt-1">
                    <span className="font-serif text-[10px] sm:text-[11px] font-bold text-white block leading-tight">
                      Đăng Ký
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gold-400 font-sans block">
                      Hội Thánh Mới
                    </span>
                  </div>
                </div>

                {/* 2. Church stories from all churches in MongoDB */}
                {churches.map((church) => {
                  const isLive = Boolean(church.currentService?.isLive);
                  const cover =
                    church.profileConfig?.coverImageUrl ||
                    "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80";
                  const avatar = getChurchAvatar(church.name, church.slug, church.profileConfig?.avatarUrl);

                  return (
                    <Link
                      key={church._id}
                      href={`/${church.slug}?view=${isLive ? "sanctuary" : "wall"}`}
                      className="w-24 sm:w-32 h-36 sm:h-48 rounded-xl sm:rounded-2xl border border-white/[0.08] hover:border-gold-400/60 p-2 sm:p-2.5 shrink-0 group shadow-md hover:shadow-candle transition-all relative overflow-hidden flex flex-col justify-between"
                      title={church.name}
                    >
                      <img
                        src={cover}
                        alt={church.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter brightness-75"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50" />

                      {/* Top Story Avatar with Gold / Red Ring */}
                      <div className="relative z-10">
                        <div
                          className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 ${isLive ? "border-red-500 animate-pulse" : "border-gold-400"
                            } p-0.5 shadow-md overflow-hidden bg-black`}
                        >
                          <img
                            src={avatar}
                            alt={church.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>

                      {/* Bottom Story Label */}
                      <div className="relative z-10 space-y-0.5 sm:space-y-1">
                        {isLive ? (
                          <span className="inline-block px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase bg-red-600 text-white animate-pulse">
                            🔴 LIVE
                          </span>
                        ) : (
                          <span className="inline-block px-1 sm:px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-black/60 text-gold-300 border border-white/10 truncate max-w-full">
                            {church.denomination?.replace("Hội Thánh Tin Lành", "HTTL") || "Chúa Nhật"}
                          </span>
                        )}
                        <span className="font-serif text-[10px] sm:text-xs font-bold text-white block line-clamp-2 leading-tight drop-shadow-md">
                          {church.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* ================================================================= */}
              {/* FACEBOOK-STYLE ROLE-AWARE BAR: OFFICIAL PUBLISHER VS PRAYER BOX   */}
              {/* ================================================================= */}
              {currentUser && (currentUser.role === "pastor" || currentUser.role === "admin" || currentUser.role === "superadmin") ? (
                /* OFFICIAL CHURCH PUBLISHER BAR (DÀNH CHO MỤC SƯ & QUẢN TRỊ VIÊN) */
                <div className="bg-sanctuary-900 border border-gold-400/40 rounded-2xl p-3.5 sm:p-4 shadow-md space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold-400 text-sanctuary-950 flex items-center justify-center font-bold text-xs shadow-sm">
                        {currentUser.role === "superadmin" ? "👑" : "⛪"}
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xs text-white block">
                          {currentUser.fullName} ({currentUser.role === "superadmin" ? "Tổng Quản Trị" : "Mục Sư Quản Nhiệm"})
                        </span>
                        <span className="text-[10px] text-gold-400 font-serif">
                          {currentUser.role === "superadmin"
                            ? "Đăng thông báo mục vụ cho toàn mạng lưới Hội Thánh"
                            : `Đại diện ${churchDisplayName}`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={composerCategory}
                        onChange={(e) => setComposerCategory(e.target.value)}
                        className="bg-sanctuary-850 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-sanctuary-200 focus:outline-none"
                      >
                        <option value="announcement">Thông Báo</option>
                        <option value="scripture">📖 Lời Chúa</option>
                        <option value="sermon">🎬 Sứ Điệp</option>
                        <option value="fellowship">🙏 Làm Chứng</option>
                        <option value="worship">⛪ Giờ Thờ Phượng</option>
                      </select>
                      <button
                        onClick={() => {
                          setPastorPostForm({
                            title: "",
                            content: composerText,
                            category: composerCategory,
                            scriptureVerse: "",
                            imageUrl: "",
                            videoUrl: "",
                            churchSlug: currentUser.churchSlug || churches[0]?.slug || "",
                          });
                          setShowPastorPostModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-300 border border-gold-400/30 text-[11px] font-serif transition-colors cursor-pointer"
                        title="Mở bảng soạn bài viết đầy đủ (tiêu đề, câu gốc, hình ảnh, bài giảng)"
                      >
                        Soạn Chi Tiết
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={composerText}
                      onChange={(e) => setComposerText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePublishPost();
                      }}
                      placeholder="Viết lời Chúa hoặc thông báo mục vụ cho Hội Thánh..."
                      className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-full px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-gold-400"
                    />
                    <button
                      onClick={() => handlePublishPost()}
                      disabled={!composerText.trim() || isPublishingPastorPost}
                      className="px-4 py-2 rounded-full bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-sanctuary-950 font-bold text-xs font-serif shrink-0 cursor-pointer shadow-sm transition-all"
                    >
                      {isPublishingPastorPost ? "Đang Đăng..." : "Đăng Tin"}
                    </button>
                  </div>
                </div>
              ) : (
                /* COMMUNITY PRAYER & PRAISE CARD (DÀNH CHO TÍN HỮU & CỘNG ĐỒNG) */
                <div className="bg-gradient-to-br from-sanctuary-900 via-[#10141f] to-[#0c0f17] border border-gold-400/25 rounded-2xl p-4 sm:p-4.5 shadow-md space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gold-500/20 to-amber-400/20 border border-gold-400/40 flex items-center justify-center text-gold-400 shrink-0 shadow-sm">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                          Hiệp Lòng Cầu Thay & Lời Tạ Ơn
                        </h3>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[9px] font-serif bg-gold-400/10 text-gold-300 border border-gold-400/30">
                          Cộng Đồng Tín Hữu
                        </span>
                      </div>
                      <p className="text-xs text-sanctuary-300 font-sans mt-0.5 line-clamp-1">
                        Quý tôi con Chúa có điều gì cần các Mục Sư và cộng đồng hiệp ý dâng lên Chúa hôm nay?
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => {
                        setPrayerSubmitted(false);
                        setShowPrayerModal(true);
                      }}
                      className="flex-1 py-2 sm:py-2.5 px-3.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-candle transition-all cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-sanctuary-950" />
                      <span>Gửi Lời Cầu Thay Ngay</span>
                    </button>

                    <button
                      onClick={() => setNavTab("prayers")}
                      className="py-2 sm:py-2.5 px-3 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-200 hover:text-white border border-white/10 text-xs font-serif transition-colors shrink-0 cursor-pointer"
                    >
                      Bức Tường Cầu Thay
                    </button>

                    <Link
                      href="/admin"
                      className="hidden sm:flex items-center gap-1 py-2 sm:py-2.5 px-3 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-400 hover:text-gold-300 border border-white/10 text-[11px] font-serif transition-colors shrink-0"
                      title="Mục sư đăng nhập để đăng bài thông báo chính thức"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                      <span>Mục Sư</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Feed Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-serif -mx-2 px-2 sm:mx-0 sm:px-0">
                {[
                  { id: "all", label: `Tất Cả (${feedPosts.length})` },
                  { id: "announcement", label: "Thông Báo" },
                  { id: "scripture", label: "Lời Chúa" },
                  { id: "sermon", label: "Sứ Điệp" },
                  { id: "fellowship", label: "Làm Chứng & Thông Công" },
                  { id: "worship", label: "Giờ Thờ Phượng" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFeedCategoryFilter(cat.id)}
                    className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all text-[11px] sm:text-xs ${feedCategoryFilter === cat.id
                      ? "bg-gold-400 text-sanctuary-950 font-bold shadow-sm"
                      : "bg-sanctuary-900 hover:bg-sanctuary-850 text-sanctuary-300 border border-white/[0.06]"
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* ================================================================= */}
              {/* FACEBOOK-STYLE FEED POSTS (CÁC BÀI VIẾT TỪ TOÀN BỘ CÁC HỘI THÁNH) */}
              {/* ================================================================= */}
              <div className="space-y-4">
                {loadingPosts ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className="bg-sanctuary-900 border border-white/[0.06] rounded-2xl p-4 space-y-3 animate-pulse"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sanctuary-850" />
                          <div className="space-y-1.5 flex-1">
                            <div className="h-3.5 bg-sanctuary-850 rounded w-1/3" />
                            <div className="h-2.5 bg-sanctuary-850 rounded w-1/4" />
                          </div>
                        </div>
                        <div className="space-y-2 py-2">
                          <div className="h-3 bg-sanctuary-850 rounded w-full" />
                          <div className="h-3 bg-sanctuary-850 rounded w-4/5" />
                        </div>
                        <div className="h-44 bg-sanctuary-850 rounded-xl w-full" />
                      </div>
                    ))}
                  </div>
                ) : filteredFeedPosts.length === 0 ? (
                  <div className="bg-sanctuary-900 border border-white/[0.08] rounded-2xl p-10 text-center space-y-3">
                    <Newspaper className="w-10 h-10 text-gold-400/40 mx-auto" />
                    <h4 className="font-serif text-base text-white font-bold">
                      Chưa có bài viết nào trong mục này
                    </h4>
                    <p className="text-xs text-sanctuary-400">
                      Hãy chọn mục khác hoặc đăng lời chia sẻ đầu tiên lên bảng tin cộng đồng!
                    </p>
                    <button
                      onClick={() => setFeedCategoryFilter("all")}
                      className="px-4 py-1.5 rounded-lg bg-sanctuary-850 text-gold-300 text-xs font-serif border border-white/10"
                    >
                      Xem tất cả bài viết
                    </button>
                  </div>
                ) : (
                  filteredFeedPosts.map((post) => {
                    const userReact = userReactions[post.id];
                    const isCommentsOpen = activeCommentPostId === post.id;

                    return (
                      <article
                        key={post.id}
                        className="bg-sanctuary-900 border border-white/[0.08] hover:border-gold-400/30 rounded-2xl shadow-md transition-colors overflow-hidden"
                      >
                        {/* Post Header: Avatar, Name, Time, More options */}
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Link href={`/${post.churchSlug}?view=wall`} title={`Xem Tường Hội Thánh ${post.churchName}`}>
                              <div className="w-10 h-10 rounded-full border border-gold-400/40 overflow-hidden shadow-sm hover:border-gold-300 transition-colors">
                                <img
                                  src={post.avatar}
                                  alt={post.churchName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </Link>
                            <div>
                              <Link
                                href={`/${post.churchSlug}?view=wall`}
                                title={`Xem Tường Hội Thánh ${post.churchName}`}
                                className="font-serif font-bold text-sm text-white hover:text-gold-300 transition-colors flex items-center gap-1.5"
                              >
                                <span>{post.churchName}</span>
                                <CheckCircle2 className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                              </Link>
                              <span className="text-[11px] text-sanctuary-400 font-sans block">
                                {post.timeAgo}
                              </span>
                            </div>
                          </div>

                          <button className="p-1.5 rounded-full hover:bg-sanctuary-850 text-sanctuary-400 hover:text-white transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Post Content Caption */}
                        <div className="px-4 pb-3 space-y-2">
                          {post.title && (
                            <h3 className="font-serif font-bold text-base sm:text-lg text-gold-200">
                              {post.title}
                            </h3>
                          )}
                          <p className="text-xs sm:text-sm text-sanctuary-200 leading-relaxed font-sans font-light whitespace-pre-line">
                            {post.content}
                          </p>
                        </div>

                        {/* Post Media: Video / Scripture / Image */}
                        {post.mediaType === "video" && (
                          <div className="relative aspect-video w-full bg-black overflow-hidden group">
                            <img
                              src={post.mediaUrl}
                              alt={post.title}
                              className="w-full h-full object-cover filter brightness-90 group-hover:scale-102 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                            {/* Live Video Overlay Badges */}
                            <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-600 text-white shadow-md animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                Đang Trực Tiếp
                              </span>
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] bg-black/70 text-gold-300 border border-white/10 backdrop-blur-md">
                                <Eye className="w-3 h-3 text-gold-400" />
                                <span>{post.viewersCount} người xem</span>
                              </span>
                            </div>

                            {/* Center Play Button */}
                            <Link
                              href={`/${post.churchSlug}?view=sanctuary`}
                              className="absolute inset-0 flex items-center justify-center z-10"
                            >
                              <div className="w-16 h-16 rounded-full bg-gold-400/90 hover:bg-gold-400 text-sanctuary-950 flex items-center justify-center shadow-candle hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 fill-current ml-1" />
                              </div>
                            </Link>

                            {/* Bottom Video Meta Bar */}
                            <div className="absolute bottom-3 inset-x-4 flex items-center justify-between text-xs text-white z-10">
                              <div>
                                <span className="text-gold-300 font-serif font-semibold block text-sm">
                                  {post.speaker}
                                </span>
                                <span className="text-sanctuary-300 text-[11px] font-serif">
                                  Câu gốc: {post.scriptureVerse}
                                </span>
                              </div>
                              <Link
                                href={`/${post.churchSlug}?view=sanctuary`}
                                className="px-3 py-1.5 rounded-lg bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs shadow-md transition-colors"
                              >
                                Vào Xem
                              </Link>
                            </div>
                          </div>
                        )}

                        {post.mediaType === "scripture" && post.scriptureVerse && (
                          <div className="px-4 py-2">
                            <div className="p-4 rounded-xl bg-gradient-to-br from-[#181510] to-[#12141a] border border-gold-400/30 text-center space-y-2 shadow-inner">
                              <BookOpen className="w-5 h-5 text-gold-400 mx-auto" />
                              <p className="font-serif italic text-sm sm:text-base text-gold-100 leading-relaxed">
                                {post.scriptureVerse}
                              </p>
                            </div>
                          </div>
                        )}

                        {post.mediaType === "image" && post.mediaUrl && (
                          <div className="w-full overflow-hidden bg-black">
                            <img
                              src={post.mediaUrl}
                              alt="Hình ảnh bài đăng"
                              className="w-full max-h-[460px] object-cover"
                            />
                          </div>
                        )}

                        {/* Post Reactions Stats Summary */}
                        <div className="px-4 py-2 flex items-center justify-between text-xs text-sanctuary-400 border-b border-white/[0.05]">
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1">
                              <span className="w-5 h-5 rounded-full bg-gold-500 text-[10px] flex items-center justify-center text-sanctuary-950 font-bold shadow-sm">
                                🙏
                              </span>
                              <span className="w-5 h-5 rounded-full bg-red-500 text-[10px] flex items-center justify-center text-white shadow-sm">
                                ❤️
                              </span>
                            </div>
                            <span>
                              {post.amenCount + post.loveCount} lượt Hiệp Nguyện & Yêu Thương
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setActiveCommentPostId(isCommentsOpen ? null : post.id)
                              }
                              className="hover:underline"
                            >
                              {post.comments.length} bình luận
                            </button>
                            <span>•</span>
                            <span>{post.shareCount} lượt chia sẻ</span>
                          </div>
                        </div>

                        {/* Post Reaction Action Buttons: Amen, Love, Comment, Share */}
                        <div className="px-1 sm:px-2 py-1 flex items-center justify-around text-[11px] sm:text-xs font-serif">
                          <button
                            onClick={() => handleReaction(post.id, "amen")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl transition-colors font-medium ${userReact === "amen"
                              ? "text-gold-400 font-bold bg-gold-400/10"
                              : "text-sanctuary-300 hover:bg-sanctuary-850 hover:text-white"
                              }`}
                          >
                            <span className="text-sm sm:text-base">🙏</span>
                            <span className="truncate">Amen</span>
                          </button>

                          <button
                            onClick={() => handleReaction(post.id, "love")}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl transition-colors font-medium ${userReact === "love"
                              ? "text-red-400 font-bold bg-red-500/10"
                              : "text-sanctuary-300 hover:bg-sanctuary-850 hover:text-white"
                              }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${userReact === "love" ? "fill-current" : ""
                                }`}
                            />
                            <span className="truncate">Yêu Thích</span>
                          </button>

                          <button
                            onClick={() =>
                              setActiveCommentPostId(isCommentsOpen ? null : post.id)
                            }
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl text-sanctuary-300 hover:bg-sanctuary-850 hover:text-white transition-colors font-medium"
                          >
                            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">Bình Luận</span>
                          </button>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/${post.churchSlug}`
                              );
                              alert("Đã sao chép liên kết bài viết!");
                            }}
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 sm:py-2 px-1 rounded-xl text-sanctuary-300 hover:bg-sanctuary-850 hover:text-white transition-colors font-medium"
                          >
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                            <span className="truncate">Chia Sẻ</span>
                          </button>
                        </div>

                        {/* Post Comments Drawer */}
                        {isCommentsOpen && (
                          <div className="p-4 bg-sanctuary-950/60 border-t border-white/[0.06] space-y-3">
                            {/* List of comments */}
                            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                              {post.comments.length === 0 ? (
                                <p className="text-xs text-sanctuary-400 text-center py-2">
                                  Chưa có bình luận nào. Hãy là người đầu tiên gửi lời chúc phước!
                                </p>
                              ) : (
                                post.comments.map((comm) => (
                                  <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                                    <img
                                      src={comm.avatar}
                                      alt={comm.author}
                                      className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                                    />
                                    <div className="bg-sanctuary-850 border border-white/[0.06] rounded-2xl px-3 py-2 flex-1">
                                      <span className="font-serif font-bold text-white block">
                                        {comm.author}
                                      </span>
                                      <p className="text-sanctuary-200 mt-0.5 leading-relaxed font-sans font-light">
                                        {comm.content}
                                      </p>
                                      <span className="text-[10px] text-sanctuary-400 mt-1 block">
                                        {comm.time}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>

                            {/* Write Comment Box */}
                            <div className="flex items-center gap-2 pt-1">
                              <input
                                type="text"
                                value={commentInputText[post.id] || ""}
                                onChange={(e) =>
                                  setCommentInputText({
                                    ...commentInputText,
                                    [post.id]: e.target.value,
                                  })
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAddComment(post.id);
                                }}
                                placeholder="Viết lời chúc phước hoặc Amen..."
                                className="w-full bg-sanctuary-850 border border-white/[0.08] rounded-full px-3.5 py-1.5 text-xs text-white placeholder-sanctuary-500 focus:outline-none focus:border-gold-400/50"
                              />
                              <button
                                onClick={() => handleAddComment(post.id)}
                                className="p-2 rounded-full bg-gold-400 text-sanctuary-950 font-bold hover:bg-gold-500 transition-colors shadow-sm shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  }))}
              </div>
            </>
          )}

          {/* TAB 2: KHÁN PHÒNG THỜ PHƯỢNG TRỰC TIẾP */}
          {navTab === "sanctuary" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-sanctuary-900 border border-gold-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-serif uppercase tracking-wider font-bold">
                  <Radio className="w-4 h-4 animate-pulse text-red-500" />
                  <span>Các Buổi Thờ Phượng Đang Phát Trực Tiếp</span>
                </div>
                <span className="text-xs text-sanctuary-400">
                  {liveChurches.length} Hội Thánh đang trực tiếp
                </span>
              </div>

              {churches.map((church) => (
                <div
                  key={church._id}
                  className="bg-sanctuary-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-md flex flex-col sm:flex-row gap-4 p-4"
                >
                  <div className="relative w-full sm:w-48 h-36 rounded-xl overflow-hidden bg-black shrink-0">
                    <img
                      src={church.profileConfig?.coverImageUrl || "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=600&q=80"}
                      alt={church.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">
                        LIVE
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] text-gold-400 font-serif">
                        {church.denomination}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-white">
                        {church.name}
                      </h4>
                      <p className="text-xs text-sanctuary-300 font-serif italic">
                        Chủ đề: &ldquo;{church.currentService?.title || "Lễ Thờ Phượng Chúa Nhật"}&rdquo;
                      </p>
                      <p className="text-xs text-sanctuary-400 mt-1">
                        Diễn giả: {church.currentService?.speaker || church.profileConfig?.leadPastor}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Link
                        href={`/${church.slug}?view=sanctuary`}
                        className="px-4 py-2 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Vào Thờ Phượng Trực Tiếp</span>
                      </Link>

                      <Link
                        href={`/${church.slug}?view=wall`}
                        className="px-3 py-2 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 text-xs font-serif"
                      >
                        Xem Bản Tin
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DANH BẠ HỘI THÁNH */}
          {navTab === "churches" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredChurches.map((church) => (
                  <div
                    key={church._id}
                    className="bg-sanctuary-900 border border-white/[0.08] rounded-2xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={getChurchAvatar(church.name, church.slug, church.profileConfig?.avatarUrl)}
                        alt={church.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gold-400/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gold-400 font-serif block truncate">
                          {church.denomination}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-white truncate">
                          {church.name}
                        </h4>
                        <span className="text-xs text-sanctuary-400 flex items-center gap-1 mt-0.5 truncate font-sans">
                          <MapPin className="w-3 h-3 text-gold-400 shrink-0" />
                          {church.address}
                        </span>
                      </div>
                    </div>

                    {/* Worship Schedules Info */}
                    <div className="space-y-1 bg-sanctuary-950/60 p-2.5 rounded-xl border border-white/[0.04]">
                      <div className="flex items-center gap-1.5 text-[11px] text-gold-300 font-serif font-medium">
                        <Clock className="w-3 h-3 text-gold-400 shrink-0" />
                        <span>Lịch Thờ Phượng & Sinh Hoạt:</span>
                      </div>
                      {church.worshipSchedules && church.worshipSchedules.length > 0 ? (
                        <div className="space-y-1">
                          {church.worshipSchedules.map((sch, sIdx) => (
                            <div key={sch.id || sIdx} className="flex items-center justify-between text-[11px] text-sanctuary-300">
                              <span className="truncate pr-1">• {sch.dayOfWeek}: {sch.title}</span>
                              <span className="font-mono text-amber-400 shrink-0">{sch.time}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-sanctuary-400">
                          {church.liveSchedule || "Chúa Nhật: Lễ 1 (08:00) • Lễ 2 (09:30)"}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05]">
                      <Link
                        href={`/${church.slug}?view=sanctuary`}
                        className="flex-1 py-1.5 rounded-lg bg-gold-400 text-sanctuary-950 font-serif font-bold text-xs text-center shadow-sm"
                      >
                        Vào Phòng
                      </Link>
                      <Link
                        href={`/${church.slug}?view=wall`}
                        className="px-3 py-1.5 rounded-lg bg-sanctuary-850 text-sanctuary-300 text-xs font-serif text-center"
                      >
                        Bản Tin
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GÓC HIỆP LÒNG CẦU THAY */}
          {navTab === "prayers" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-sanctuary-900 border border-gold-400/30 space-y-2">
                <div className="flex items-center gap-2 text-gold-400 text-xs font-serif uppercase tracking-wider font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Bức Tường Hiệp Lòng Cầu Thay Toàn Quốc</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  &ldquo;Hãy cầu nguyện cho nhau để anh em được lành bệnh&rdquo;
                </h3>
                <p className="text-xs text-sanctuary-300">
                  Mỗi lời hiệp ý của quý vị là một nguồn an ủi và sức mạnh lớn lao cho anh chị em trong Chúa.
                </p>
              </div>

              {/* Feed posts marked as prayer */}
              {feedPosts.filter(p => p.category === "scripture" || p.category === "testimony").map(p => (
                <div key={p.id} className="p-4 rounded-2xl bg-sanctuary-900 border border-white/[0.08] space-y-3">
                  <Link
                    href={`/${p.churchSlug}?view=wall`}
                    className="flex items-center gap-2.5 group"
                    title={`Xem Tường Hội Thánh ${p.churchName}`}
                  >
                    <img src={p.avatar} alt={p.churchName} className="w-8 h-8 rounded-full object-cover border border-white/10 group-hover:border-gold-400/50" />
                    <div>
                      <span className="font-serif font-bold text-xs text-white group-hover:text-gold-300 transition-colors block">{p.churchName}</span>
                      <span className="text-[10px] text-sanctuary-400 font-sans block">{p.timeAgo}</span>
                    </div>
                  </Link>
                  <p className="text-xs text-sanctuary-200 leading-relaxed font-serif italic">
                    &ldquo;{p.content}&rdquo;
                  </p>
                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                    <span className="text-xs text-gold-400 font-mono font-bold">
                      {p.amenCount} người đã hiệp ý
                    </span>
                    <button
                      onClick={() => handleReaction(p.id, "amen")}
                      className="px-3 py-1 rounded-lg bg-gold-400/20 text-gold-300 border border-gold-400/40 text-xs font-serif font-bold"
                    >
                      🙏 Amen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ----------------------------------------------------------------------- */}
        {/* 2.3 RIGHT COLUMN: FACEBOOK-STYLE EVENTS, ONLINE CONTACTS & NOTIFICATIONS*/}
        {/* ----------------------------------------------------------------------- */}
        <aside className="w-72 xl:w-80 hidden lg:flex flex-col gap-4 shrink-0 sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto no-scrollbar pb-6 select-none">
          {/* Sunday Service Countdown Card (Giống mục Sự Kiện Facebook) */}
          <div className="p-4 rounded-2xl bg-sanctuary-900 border border-gold-400/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-gold-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                Lễ Chúa Nhật Kế Tiếp
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                09:00 Sáng
              </span>
            </div>

            <p className="text-xs text-sanctuary-300 font-sans leading-relaxed">
              Các phòng thờ phượng trực tuyến sẽ mở phát sóng đồng loạt sau:
            </p>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-1.5 text-center">
              <div className="bg-sanctuary-950 p-2 rounded-xl border border-white/10">
                <span className="block font-mono text-lg font-bold text-gold-300">{String(timeLeft.days).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase text-sanctuary-400">Ngày</span>
              </div>
              <div className="bg-sanctuary-950 p-2 rounded-xl border border-white/10">
                <span className="block font-mono text-lg font-bold text-gold-300">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase text-sanctuary-400">Giờ</span>
              </div>
              <div className="bg-sanctuary-950 p-2 rounded-xl border border-white/10">
                <span className="block font-mono text-lg font-bold text-gold-300">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase text-sanctuary-400">Phút</span>
              </div>
              <div className="bg-sanctuary-950 p-2 rounded-xl border border-white/10">
                <span className="block font-mono text-lg font-bold text-amber-400 animate-pulse">{String(timeLeft.seconds).padStart(2, "0")}</span>
                <span className="text-[9px] uppercase text-sanctuary-400">Giây</span>
              </div>
            </div>

            {/* Multi-Schedule Quick View */}
            <div className="pt-2.5 border-t border-white/[0.08] space-y-1.5">
              <span className="text-[11px] font-serif font-bold text-gold-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-gold-400" />
                Các Giờ Lễ & Sinh Hoạt Trong Tuần
              </span>
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-sanctuary-300 bg-sanctuary-950/70 px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                  <span>Lễ 1 (Sáng Chúa Nhật)</span>
                  <span className="font-mono text-gold-400 font-medium">08:00 - 09:30</span>
                </div>
                <div className="flex items-center justify-between text-sanctuary-300 bg-sanctuary-950/70 px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                  <span>Lễ 2 (Trực tuyến chính)</span>
                  <span className="font-mono text-gold-400 font-medium">09:45 - 11:15</span>
                </div>
                <div className="flex items-center justify-between text-sanctuary-300 bg-sanctuary-950/70 px-2.5 py-1.5 rounded-lg border border-white/[0.04]">
                  <span>Cầu Nguyện / Thanh Niên</span>
                  <span className="font-mono text-amber-400 font-medium">Tối Thứ Bảy / CN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook-style Online Churches & Pastors List (Người liên hệ trực tuyến) */}
          <div className="p-3.5 rounded-2xl bg-sanctuary-900 border border-white/[0.06] space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <span className="text-xs font-serif font-bold text-sanctuary-200 uppercase tracking-wider">
                Hội Thánh & Mục Sư Trực Tuyến
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-1">
              {churches.map((church) => {
                const isLive = Boolean(church.currentService?.isLive);

                return (
                  <Link
                    key={church._id}
                    href={`/${church.slug}?view=sanctuary`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-sanctuary-850 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img
                          src={getChurchAvatar(church.name, church.slug, church.profileConfig?.avatarUrl)}
                          alt={church.name}
                          className="w-full h-full object-cover"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-sanctuary-900 ${isLive ? "bg-red-500 animate-pulse" : "bg-emerald-500"
                            }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-serif font-medium text-sanctuary-200 group-hover:text-gold-300 block truncate">
                          {church.name}
                        </span>
                        <span className="text-[10px] text-sanctuary-400 block truncate">
                          {church.profileConfig?.leadPastor || "Mục sư Quản nhiệm"}
                        </span>
                      </div>
                    </div>

                    {isLive ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-600/90 text-white shrink-0">
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-mono shrink-0">
                        Online
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Quick VietQR Giving Card (Dâng hiến 1 click) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#141820] to-[#0c0e14] border border-gold-400/20 space-y-2 shadow-sm text-center">
            <span className="text-[11px] font-serif uppercase tracking-wider text-gold-400 font-bold block">
              Dâng Hiến & Đồng Công Mục Vụ
            </span>
            <p className="text-[11px] text-sanctuary-300 font-sans leading-relaxed">
              Tích hợp chuẩn VietQR chuyển khoản nhanh chóng, minh bạch đến các Hội Thánh.
            </p>
            <Link
              href="/loibansusong?view=sanctuary"
              className="inline-block w-full py-1.5 rounded-lg bg-gold-400/15 hover:bg-gold-400/25 text-gold-300 border border-gold-400/30 text-xs font-serif transition-colors"
            >
              Mở Mã VietQR Dâng Hiến
            </Link>
          </div>
        </aside>
      </div>

      {/* ========================================================================= */}
      {/* 3. REGISTER NEW CHURCH MODAL                                              */}
      {/* ========================================================================= */}
      {showRegisterModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-sanctuary-950 border border-gold-400/40 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-11 h-11 rounded-2xl bg-gold-400/15 border border-gold-400/40 mx-auto flex items-center justify-center text-gold-400 mb-2 shadow-candle">
                <ChurchIcon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Đăng Ký Phòng Nhóm Hội Thánh Mới
              </h3>
              <p className="text-xs text-sanctuary-400 font-sans max-w-sm mx-auto">
                Hệ thống sẽ tự động tạo phòng phát trực tiếp chuyên biệt và mã định danh cho
                Hội Thánh của quý vị.
              </p>
            </div>

            {submitError && (
              <div className="p-3 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded-xl">
                {submitError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-sanctuary-200">
                  Tên Hội Thánh <span className="text-gold-400">*</span>
                </label>
                <input
                  required
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!formSlug) {
                      const slugified = e.target.value
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[đĐ]/g, "d")
                        .replace(/[^a-z0-9]/g, "");
                      setFormSlug(slugified);
                    }
                  }}
                  placeholder="Ví dụ: Hội Thánh Tin Lành Bến Tre"
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/60 rounded-xl px-3.5 py-2.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sanctuary-200">
                    Mã đường dẫn (Slug) <span className="text-gold-400">*</span>
                  </label>
                  <div className="flex items-center bg-sanctuary-850 border border-white/[0.08] rounded-xl px-3 focus-within:border-gold-400/60">
                    <span className="text-[11px] text-sanctuary-500 font-mono">/</span>
                    <input
                      required
                      type="text"
                      value={formSlug}
                      onChange={(e) =>
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      placeholder="bentre"
                      className="w-full bg-transparent px-1 py-2.5 text-xs text-gold-300 font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-sanctuary-200">
                    Khóa luồng phát (Stream Key) <span className="text-gold-400">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formStreamKey}
                    onChange={(e) => setFormStreamKey(e.target.value.trim())}
                    placeholder="bentre-live"
                    className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/60 rounded-xl px-3.5 py-2.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-sanctuary-200">
                  Hệ phái Hội Thánh
                </label>
                <select
                  value={formDenomination}
                  onChange={(e) => setFormDenomination(e.target.value)}
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/60 rounded-xl px-3.5 py-2.5 text-xs text-sanctuary-200 focus:outline-none"
                >
                  <option value="Hội Thánh Tin Lành Việt Nam">
                    Hội Thánh Tin Lành Việt Nam
                  </option>
                  <option value="Hội Thánh Báp-tít Việt Nam">
                    Hội Thánh Báp-tít Việt Nam
                  </option>
                  <option value="Hội Thánh Trưởng Lão">Hội Thánh Trưởng Lão</option>
                  <option value="Hội Thánh Liên Hữu Cơ Đốc">
                    Hội Thánh Liên Hữu Cơ Đốc
                  </option>
                  <option value="Hội Thánh Độc Lập / Ân Điển">
                    Hội Thánh Độc Lập / Ân Điển
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-sanctuary-200">
                  Địa chỉ nhà thờ
                </label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ví dụ: 123 Đường Đoàn Hoàng Minh, TP. Bến Tre"
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/60 rounded-xl px-3.5 py-2.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
              </div>

              {/* Multi Worship Schedules */}
              <div className="p-3.5 bg-sanctuary-900 border border-white/[0.06] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                      Lịch Thờ Phượng & Sinh Hoạt Trong Tuần
                    </span>
                    <span className="text-[10px] text-sanctuary-400">
                      Hội Thánh có thể thêm nhiều giờ lễ (Lễ 1, Lễ 2, Cầu nguyện, Ban Thanh Niên...)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSchedules([
                        ...formSchedules,
                        {
                          id: String(Date.now()),
                          title: `Buổi Lễ ${formSchedules.length + 1}`,
                          dayOfWeek: "Chúa Nhật",
                          time: "19:30 - 21:00",
                          type: "fellowship",
                          description: "",
                        },
                      ]);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gold-400/20 text-gold-300 hover:bg-gold-400/30 border border-gold-400/40 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>+ Thêm lịch</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formSchedules.map((sch, idx) => (
                    <div
                      key={sch.id || idx}
                      className="p-2.5 rounded-lg bg-sanctuary-850/90 border border-white/[0.06] space-y-2"
                    >
                      <div className="grid grid-cols-12 gap-1.5 items-center">
                        <div className="col-span-4 sm:col-span-3">
                          <select
                            value={sch.dayOfWeek}
                            onChange={(e) => {
                              const updated = [...formSchedules];
                              updated[idx].dayOfWeek = e.target.value;
                              setFormSchedules(updated);
                            }}
                            className="w-full bg-sanctuary-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-sanctuary-200 focus:outline-none"
                          >
                            <option value="Chúa Nhật">Chúa Nhật</option>
                            <option value="Thứ Hai">Thứ Hai</option>
                            <option value="Thứ Ba">Thứ Ba</option>
                            <option value="Thứ Tư">Thứ Tư</option>
                            <option value="Thứ Năm">Thứ Năm</option>
                            <option value="Thứ Sáu">Thứ Sáu</option>
                            <option value="Thứ Bảy">Thứ Bảy</option>
                          </select>
                        </div>
                        <div className="col-span-4 sm:col-span-4">
                          <input
                            type="text"
                            value={sch.time}
                            onChange={(e) => {
                              const updated = [...formSchedules];
                              updated[idx].time = e.target.value;
                              setFormSchedules(updated);
                            }}
                            placeholder="08:00 - 09:30"
                            className="w-full bg-sanctuary-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-sanctuary-100 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-4">
                          <input
                            type="text"
                            value={sch.title}
                            onChange={(e) => {
                              const updated = [...formSchedules];
                              updated[idx].title = e.target.value;
                              setFormSchedules(updated);
                            }}
                            placeholder="Tên buổi lễ..."
                            className="w-full bg-sanctuary-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-sanctuary-100 focus:outline-none"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              setFormSchedules(formSchedules.filter((_, i) => i !== idx));
                            }}
                            disabled={formSchedules.length <= 1}
                            className="text-sanctuary-500 hover:text-red-400 disabled:opacity-30 cursor-pointer p-1"
                            title="Xóa giờ lễ này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin User Credentials */}
              <div className="p-3.5 bg-sanctuary-900 border border-white/[0.06] rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Tài Khoản Đăng Nhập Quản Trị</span>
                </span>
                <input
                  required
                  type="text"
                  value={formAdminName}
                  onChange={(e) => setFormAdminName(e.target.value)}
                  placeholder="Họ & tên người quản trị (Mục sư / Trưởng ban kỹ thuật)"
                  className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    required
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Email đăng nhập quản trị"
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                  <input
                    required
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    minLength={6}
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Banking for VietQR */}
              <div className="p-3.5 bg-sanctuary-900 border border-white/[0.06] rounded-xl space-y-2">
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                  Tài khoản Dâng Hiến VietQR (Tùy chọn)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="Tên ngân hàng (MB Bank, VCB...)"
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formAccNumber}
                    onChange={(e) => setFormAccNumber(e.target.value)}
                    placeholder="Số tài khoản ngân hàng"
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={formAccHolder}
                  onChange={(e) => setFormAccHolder(e.target.value)}
                  placeholder="Tên chủ tài khoản (viết hoa không dấu)"
                  className="w-full bg-sanctuary-850 border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formName ||
                    !formSlug ||
                    !formStreamKey ||
                    !formEmail ||
                    !formPassword
                  }
                  className="w-full py-3 bg-gradient-to-r from-gold-400 to-amber-400 hover:from-gold-300 hover:to-amber-300 disabled:opacity-40 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm rounded-xl transition-all shadow-candle flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>Đang khởi tạo phòng thờ phượng...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Hoàn Tất & Tạo Phòng Trực Tuyến</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3.1 PRAYER REQUEST MODAL (CHO CON CÁI CHÚA GỬI LỜI CẦU THAY)              */}
      {/* ========================================================================= */}
      {showPrayerModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowPrayerModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0e131d] border border-gold-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowPrayerModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-sanctuary-400 hover:text-sanctuary-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {prayerSubmitted ? (
              <div className="py-6 text-center space-y-3 animate-fadeIn">
                <div className="w-14 h-14 rounded-full bg-gold-400/20 border border-gold-400/50 flex items-center justify-center mx-auto text-gold-400 shadow-candle">
                  <Flame className="w-7 h-7 text-gold-400 animate-pulse" />
                </div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Nguyện Chúa Nhậm Lời Hiệp Ý Cầu Xin Của Quý Vị!
                </h3>
                <p className="text-xs text-sanctuary-300 font-serif italic max-w-md mx-auto leading-relaxed">
                  &ldquo;Đừng lo lắng chi cả, nhưng trong mọi sự hãy dùng lời cầu nguyện, nài xin và sự tạ ơn mà trình các điều cầu xin của mình cho Đức Chúa Trời; sự bình an của Đức Chúa Trời vượt quá mọi sự hiểu biết, sẽ gìn giữ lòng và ý tưởng anh em trong Đấng Christ Giê-xu.&rdquo;
                </p>
                <span className="text-[11px] text-gold-400 font-serif block">— Phi-líp 4:6-7</span>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setShowPrayerModal(false);
                      setPrayerSubmitted(false);
                    }}
                    className="px-6 py-2 rounded-xl bg-gold-400 text-sanctuary-950 font-serif font-bold text-xs shadow-candle"
                  >
                    Hoàn Tất
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <div className="w-11 h-11 rounded-2xl bg-gold-400/15 border border-gold-400/40 mx-auto flex items-center justify-center text-gold-400 mb-2 shadow-candle">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Gửi Lời Cầu Thay & Nan Đề Lên Chúa
                  </h3>
                  <p className="text-xs text-sanctuary-300 font-sans max-w-sm mx-auto">
                    Nan đề của quý vị sẽ được dâng lên Chúa trong giờ hiệp nguyện và gửi đến các Mục sư để cùng cầu thay.
                  </p>
                </div>

                <form onSubmit={handleSendPrayer} className="space-y-3.5 pt-1 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sanctuary-200 font-medium">Họ & Tên (hoặc Ẩn danh)</label>
                      <input
                        type="text"
                        disabled={prayerForm.isAnonymous}
                        value={prayerForm.isAnonymous ? "Con cái Chúa (Ẩn danh)" : prayerForm.name}
                        onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })}
                        placeholder="Nhập tên của quý vị..."
                        className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold-400 disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sanctuary-200 font-medium">Số điện thoại / Zalo (Tùy chọn)</label>
                      <input
                        type="text"
                        value={prayerForm.contact}
                        onChange={(e) => setPrayerForm({ ...prayerForm, contact: e.target.value })}
                        placeholder="Để Mục sư gọi cầu nguyện riêng..."
                        className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="anonCheck"
                      checked={prayerForm.isAnonymous}
                      onChange={(e) => setPrayerForm({ ...prayerForm, isAnonymous: e.target.checked })}
                      className="rounded text-gold-400"
                    />
                    <label htmlFor="anonCheck" className="text-xs text-sanctuary-300 cursor-pointer">
                      Gửi dưới danh nghĩa ẩn danh (Bảo mật thông tin cá nhân)
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sanctuary-200 font-medium">Hội Thánh Tiếp Nhận</label>
                      <select
                        value={prayerForm.churchSlug}
                        onChange={(e) => setPrayerForm({ ...prayerForm, churchSlug: e.target.value })}
                        className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                      >
                        {churches.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sanctuary-200 font-medium">Phân Loại Nan Đề</label>
                      <select
                        value={prayerForm.category}
                        onChange={(e) => setPrayerForm({ ...prayerForm, category: e.target.value })}
                        className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                      >
                        <option value="Sức khỏe & Chữa lành">Sức khỏe & Chữa lành</option>
                        <option value="Gia đình & Hôn nhân">Gia đình & Hôn nhân</option>
                        <option value="Công việc & Tài chính">Công việc & Tài chính</option>
                        <option value="Lời Tạ Ơn Chúa">Lời Tạ Ơn Chúa</option>
                        <option value="Giải cứu & Vượt qua khó khăn">Giải cứu & Vượt qua khó khăn</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sanctuary-200 font-medium">
                      Nội Dung Cầu Nguyện Chi Tiết <span className="text-gold-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={prayerForm.prayerContent}
                      onChange={(e) => setPrayerForm({ ...prayerForm, prayerContent: e.target.value })}
                      placeholder="Xin Chúa chữa lành bệnh tật cho người thân, tiếp trợ công việc, hay lời ngợi khen tạ ơn..."
                      className="w-full bg-[#131926] border border-white/10 focus:border-gold-400/60 rounded-xl p-3 text-white placeholder-sanctuary-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingPrayer || !prayerForm.prayerContent.trim()}
                      className="w-full py-3 bg-gradient-to-r from-gold-400 to-amber-400 hover:from-gold-300 hover:to-amber-300 disabled:opacity-40 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm rounded-xl transition-all shadow-candle flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmittingPrayer ? (
                        <span>Đang dâng lời cầu xin...</span>
                      ) : (
                        <>
                          <Flame className="w-4 h-4 text-sanctuary-950" />
                          <span>Dâng Lời Cầu Thay Lên Chúa</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* PASTOR & ADMIN DETAILED POST COMPOSER MODAL */}
      {showPastorPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#0c1017] border border-gold-400/40 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-sanctuary-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gold-400 text-sanctuary-950 flex items-center justify-center font-bold text-xs shadow-sm">
                  {currentUser?.role === "superadmin" ? "👑" : "⛪"}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white">
                    Soạn Bài Viết Mục Vụ Chính Thức
                  </h3>
                  <span className="text-[11px] text-gold-400 font-serif">
                    Đăng tin tức, Lời Chúa hoặc thông báo cho Hội Thánh
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowPastorPostModal(false)}
                className="text-sanctuary-400 hover:text-white p-1 text-sm rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handlePublishPost(pastorPostForm);
              }}
              className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs font-serif"
            >
              {/* Church Selector (for superadmin or to confirm church) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Hội Thánh Đăng Tải</label>
                  {currentUser?.role === "superadmin" ? (
                    <select
                      value={pastorPostForm.churchSlug || churches[0]?.slug}
                      onChange={(e) => setPastorPostForm({ ...pastorPostForm, churchSlug: e.target.value })}
                      className="w-full bg-[#131926] border border-gold-400/40 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      {churches.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-gold-300 font-medium truncate">
                      {churches.find((c) => c.slug === currentUser?.churchSlug)?.name || currentUser?.fullName}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Phân Loại Bài Viết</label>
                  <select
                    value={pastorPostForm.category}
                    onChange={(e) => setPastorPostForm({ ...pastorPostForm, category: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="announcement">Thông Báo Mục Vụ</option>
                    <option value="scripture">Lời Chúa & Câu Gốc</option>
                    <option value="sermon">Sứ Điệp / Bài Giảng</option>
                    <option value="fellowship">Làm Chứng & Thông Công</option>
                    <option value="worship">Giờ Thờ Phượng Chúa</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-sanctuary-200 font-medium">
                  Tiêu Đề Bài Viết <span className="text-sanctuary-500 font-normal">(Tự động tạo nếu để trống)</span>
                </label>
                <input
                  type="text"
                  value={pastorPostForm.title}
                  onChange={(e) => setPastorPostForm({ ...pastorPostForm, title: e.target.value })}
                  placeholder="Ví dụ: Thông Báo Chương Trình Bồi Linh Mùa Phục Sinh..."
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Scripture Verse */}
              <div className="space-y-1">
                <label className="text-sanctuary-200 font-medium">
                  Câu Gốc Kinh Thánh <span className="text-sanctuary-500 font-normal">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={pastorPostForm.scriptureVerse}
                  onChange={(e) => setPastorPostForm({ ...pastorPostForm, scriptureVerse: e.target.value })}
                  placeholder="Ví dụ: Thi-thiên 23:1, Giăng 3:16, Rô-ma 8:28..."
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-sanctuary-200 font-medium">
                  Nội Dung Bài Viết <span className="text-gold-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={pastorPostForm.content}
                  onChange={(e) => setPastorPostForm({ ...pastorPostForm, content: e.target.value })}
                  placeholder="Kính chào quý tôi con Chúa, kính gửi thông tin mục vụ hoặc tâm tình nuôi dưỡng thuộc linh..."
                  className="w-full bg-[#131926] border border-white/10 focus:border-gold-400/60 rounded-xl p-3 text-white placeholder-sanctuary-500 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Image Upload Component with WebP compression */}
              <ImageUploadBox
                type="post"
                value={pastorPostForm.imageUrl}
                onChange={(url) => setPastorPostForm({ ...pastorPostForm, imageUrl: url })}
                label="Hình Ảnh Minh Họa Bài Viết"
              />

              {/* Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPastorPostModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-white border border-white/10 transition-colors font-medium text-xs cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPublishingPastorPost || !pastorPostForm.content.trim()}
                  className="flex-[2] py-2.5 bg-gradient-to-r from-gold-400 to-amber-400 hover:from-gold-300 hover:to-amber-300 disabled:opacity-40 text-sanctuary-950 font-bold text-xs rounded-xl transition-all shadow-candle flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isPublishingPastorPost ? (
                    <span>Đang đăng bài...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Đăng Bài Viết Lên Bảng Tin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION TAB BAR (FACEBOOK STYLE CHO MOBILE)           */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0a0d13]/95 border-t border-white/[0.08] backdrop-blur-xl px-2 py-1 flex items-center justify-around shadow-2xl safe-area-bottom">
        <button
          onClick={() => {
            setNavTab("feed");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${navTab === "feed" ? "text-gold-400 font-bold" : "text-sanctuary-400 hover:text-sanctuary-200"
            }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Bảng Tin</span>
        </button>

        <button
          onClick={() => {
            setNavTab("sanctuary");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors relative ${navTab === "sanctuary" ? "text-gold-400 font-bold" : "text-sanctuary-400 hover:text-sanctuary-200"
            }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5" />
            {liveChurches.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] mt-0.5">Trực Tiếp</span>
        </button>

        {/* Center floating button: Đăng Ký Hội Thánh */}
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex flex-col items-center justify-center -mt-5"
          title="Đăng Ký Hội Thánh"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-gold-500 to-amber-300 text-sanctuary-950 flex items-center justify-center shadow-candle hover:scale-105 transition-transform border-2 border-[#0a0d13]">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] text-gold-300 mt-0.5 font-medium">Đăng Ký</span>
        </button>

        <button
          onClick={() => {
            setNavTab("churches");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${navTab === "churches" ? "text-gold-400 font-bold" : "text-sanctuary-400 hover:text-sanctuary-200"
            }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Điểm nhóm</span>
        </button>

        <button
          onClick={() => {
            setNavTab("prayers");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${navTab === "prayers" ? "text-gold-400 font-bold" : "text-sanctuary-400 hover:text-sanctuary-200"
            }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Cầu Thay</span>
        </button>
      </nav>
    </div>
  );
}
