"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { CurrentChurchInfo, useWorship } from "@/context/WorshipContext";
import { getChurchAvatar } from "@/lib/churchAvatar";
import {
  Church as ChurchIcon,
  Radio,
  HeartHandshake,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Share2,
  Check,
  Pin,
  MessageCircle,
  ThumbsUp,
  Sparkles,
  BookOpen,
  Send,
  Video,
  ExternalLink,
  ChevronDown,
  Filter,
  X,
  Maximize2,
  Camera,
  QrCode,
  Image as ImageIcon,
} from "lucide-react";

interface CommentItem {
  _id?: string;
  authorName: string;
  authorRole?: string;
  content: string;
  createdAt: string | Date;
}

interface WallPost {
  _id: string;
  churchSlug: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  category: "announcement" | "scripture" | "devotion" | "sermon" | "fellowship";
  title: string;
  content: string;
  scriptureVerse?: string;
  imageUrl?: string;
  videoUrl?: string;
  isPinned: boolean;
  likesCount: number;
  comments: CommentItem[];
  createdAt: string;
}

interface ChurchWallViewProps {
  onGoToSanctuary: () => void;
  isLive: boolean;
}

const CHURCH_GALLERY_PHOTOS = [
  {
    id: 1,
    title: "Lễ Tiệc Thánh Thiêng Liêng",
    desc: "Hiệp lòng tưởng niệm sự thương khó và hy sinh của Chúa Cứu Thế Giê-xu trên thập tự giá.",
    url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
    category: "Tiệc Thánh",
  },
  {
    id: 2,
    title: "Đêm Ca Khen Ban Thanh Niên",
    desc: "Tuổi trẻ kính sợ Chúa, hiệp một thờ phượng và ca ngợi danh Đấng Tạo Hóa.",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
    category: "Thanh Niên",
  },
  {
    id: 3,
    title: "Ban Hát Lễ Tôn Vinh Chúa",
    desc: "Dâng tiếng hát ngợi khen tôn cao danh Chúa trong buổi Lễ Chúa Nhật.",
    url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1200&q=80",
    category: "Ban Hát Lễ",
  },
  {
    id: 4,
    title: "Lớp Kinh Thánh Thiếu Nhi",
    desc: "Dạy cho trẻ thơ con đường nó phải theo, để khi trở về già cũng không hề lìa khỏi đó.",
    url: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80",
    category: "Thiếu Nhi",
  },
  {
    id: 5,
    title: "Hành Trình Bác Ái & Yêu Thương",
    desc: "Lan tỏa tình yêu thương của Chúa đến với những mảnh đời cơ nhỡ trong cộng đồng.",
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
    category: "Bác Ái",
  },
  {
    id: 6,
    title: "Ánh Nến Phục Sinh Trang Nghiêm",
    desc: "Không gian thánh đường lung linh trong đêm lễ cảm tạ ơn Chúa.",
    url: "https://images.unsplash.com/photo-1548625361-195972886a86?auto=format&fit=crop&w=1200&q=80",
    category: "Thánh Đường",
  },
];

export const ChurchWallView: React.FC<ChurchWallViewProps> = ({
  onGoToSanctuary,
  isLive,
}) => {
  const { church, openModal } = useWorship();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{
    url: string;
    title?: string;
    desc?: string;
    category?: string;
  } | null>(null);

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<
    Record<string, { authorName: string; text: string }>
  >({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Lightbox keyboard navigation (Escape to close) & scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedLightboxImage(null);
      }
    };
    if (selectedLightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedLightboxImage]);

  // Fetch posts from API
  useEffect(() => {
    if (!church?.slug) return;
    let isCancelled = false;

    async function fetchPosts() {
      setIsLoading(true);
      try {
        const url =
          activeCategory === "all"
            ? `/api/posts?churchSlug=${church.slug}`
            : `/api/posts?churchSlug=${church.slug}&category=${activeCategory}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success && !isCancelled) {
          setPosts(data.data || []);
        }
      } catch (err) {
        console.error("Lỗi tải bài viết tường:", err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    }

    fetchPosts();
    return () => {
      isCancelled = true;
    };
  }, [church?.slug, activeCategory]);

  // Handle Like / Amen
  const handleLike = async (postId: string) => {
    if (likedPosts[postId]) return;

    // Optimistic update
    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likesCount: p.likesCount + 1 } : p
      )
    );

    try {
      await fetch(`/api/posts/${postId}/like`, { method: "POST" });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Comment Submission
  const handleAddComment = async (postId: string) => {
    const input = commentInputs[postId];
    if (!input || !input.text.trim()) return;

    setSubmittingComment((prev) => ({ ...prev, [postId]: true }));

    try {
      const res = await fetch(`/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: input.authorName.trim() || "Tín Hữu",
          content: input.text.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId
              ? { ...p, comments: [...p.comments, data.data] }
              : p
          )
        );
        // Clear input and ensure comment section is open
        setCommentInputs((prev) => ({
          ...prev,
          [postId]: { authorName: input.authorName, text: "" },
        }));
        setExpandedComments((prev) => ({ ...prev, [postId]: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const coverUrl =
    church.profileConfig?.coverImageUrl ||
    "https://images.unsplash.com/photo-1548625361-195972886a86?auto=format&fit=crop&w=1920&q=80";

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "announcement":
        return { label: "Thông Báo Mục Vụ", color: "bg-red-500/20 text-red-300 border-red-500/30" };
      case "scripture":
        return { label: "Lời Chúa Mỗi Ngày", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case "devotion":
        return { label: "Tĩnh Nguyện & Suy Ngẫm", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case "sermon":
        return { label: "Bài Giảng & Video", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" };
      case "fellowship":
        return { label: "Sinh Hoạt Ban Ngành", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" };
      default:
        return { label: "Bản Tin", color: "bg-stone-500/20 text-stone-300 border-stone-500/30" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-stone-200 pb-20 selection:bg-[#c5a059]/30">
      {/* 1. Sticky On-Air Alert Banner if currently Live */}
      {isLive && (
        <div className="bg-gradient-to-r from-red-950 via-stone-900 to-red-950 border-b border-red-500/50 py-3 px-4 sm:px-6 sticky top-0 z-30 shadow-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <div>
              <p className="text-xs sm:text-sm font-serif font-bold text-red-200 flex items-center gap-2">
                <span>HỘI THÁNH ĐANG PHÁT SÓNG TRỰC TIẾP BUỔI THỜ PHƯỢNG</span>
              </p>
              <p className="text-[11px] text-stone-300 hidden sm:block">
                {church.currentService?.title || "Chương trình thờ phượng đang diễn ra"}
              </p>
            </div>
          </div>

          <button
            onClick={onGoToSanctuary}
            className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 shrink-0 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Vào Phòng Thờ Phượng Ngay</span>
          </button>
        </div>
      )}

      {/* 2. Facebook-style Church Cover Photo & Profile Header */}
      <div className="max-w-6xl mx-auto px-0 sm:px-4 pt-0 sm:pt-4">
        <div className="bg-[#14161a] border-b sm:border border-stone-800 sm:rounded-2xl overflow-hidden shadow-2xl">
          {/* Panoramic Cover Image */}
          <div className="relative w-full h-48 sm:h-72 md:h-80 bg-stone-900 overflow-hidden">
            <img
              src={coverUrl}
              alt="Ảnh bìa Hội Thánh"
              className="w-full h-full object-cover brightness-[0.75]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14161a] via-[#14161a]/30 to-transparent" />
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[11px] text-stone-300 font-serif flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Trang Mục Vụ Chính Thức</span>
            </div>
          </div>

          {/* Profile Identity Section */}
          <div className="px-5 sm:px-8 pb-6 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-5 text-center sm:text-left">
              {/* Avatar + Basic Names */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#14161a] border-4 border-[#14161a] ring-2 ring-[#c5a059]/60 shadow-2xl flex items-center justify-center text-[#c5a059] shrink-0 overflow-hidden relative">
                  <img
                    src={getChurchAvatar(church.name, church.slug, church.profileConfig?.avatarUrl)}
                    alt={church.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-100">
                      {church.name}
                    </h1>
                    <span
                      className="text-[#c5a059] text-sm"
                      title="Trang thông tin đã xác thực"
                    >
                      ✓
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#c5a059] font-serif font-medium">
                    {church.denomination || "Hội Thánh Tin Lành Việt Nam"}
                  </p>

                  <p className="text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>{church.address || "Việt Nam"}</span>
                  </p>
                </div>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <button
                  onClick={onGoToSanctuary}
                  className={`px-4 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer ${isLive
                      ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                      : "bg-[#c5a059] hover:bg-[#d6b068] text-stone-950"
                    }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>{isLive ? "Xem Trực Tiếp (Live)" : "Phòng Thờ Phượng"}</span>
                </button>

                <button
                  onClick={() => openModal("prayer")}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4 text-red-400" />
                  <span>Xin Cầu Nguyện</span>
                </button>

                <button
                  onClick={() => openModal("giving")}
                  className="px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-[#c5a059]" />
                  <span>Dâng Hiến</span>
                </button>

                <button
                  onClick={copyPageLink}
                  className="p-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs transition-colors cursor-pointer"
                  title="Sao chép liên kết trang Hội Thánh"
                >
                  {copiedLink ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Slogan Motto Banner */}
            <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
              <p className="italic font-serif text-stone-300">
                &ldquo;{church.profileConfig?.slogan || "Hiệp Một — Yêu Thương — Phụng Sự"}&rdquo;
              </p>
              <div className="flex items-center gap-4 text-[11px] text-stone-400">
                <span>
                  Lịch nhóm:{" "}
                  <strong className="text-stone-200">
                    {church.liveSchedule || "Chúa Nhật, 09:00"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Body: Left Sidebar (Info) & Right Feed (Wall Posts) */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ================= LEFT COLUMN: CHURCH ABOUT & INFO ================= */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Card 1: Giới thiệu & Mục vụ */}
            <div className="bg-[#14161a] border border-stone-800 rounded-xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                  <ChurchIcon className="w-4 h-4 text-[#c5a059]" />
                  <span>Giới Thiệu Hội Thánh</span>
                </h3>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {church.profileConfig?.about ||
                  "Chào mừng quý vị đến với trang thông tin chính thức của Hội Thánh. Nơi cùng nhau thờ phượng Chúa, gây dựng đức tin và kết nối yêu thương trong Đấng Christ."}
              </p>

              <div className="space-y-2.5 text-xs text-stone-300 pt-1">
                <div className="flex items-start gap-2.5">
                  <span className="text-[#c5a059] font-serif font-medium shrink-0">
                    Quản nhiệm:
                  </span>
                  <span>
                    {church.profileConfig?.leadPastor || "Mục sư Quản Nhiệm"}
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-stone-200">Lịch thờ phượng:</span>
                    <p className="text-stone-400 mt-0.5">
                      {church.liveSchedule || "Chúa Nhật, 09:00 - 11:15"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-stone-200">Địa chỉ:</span>
                    <p className="text-stone-400 mt-0.5">
                      {church.address || "Việt Nam"}
                    </p>
                  </div>
                </div>

                {church.profileConfig?.contactPhone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>{church.profileConfig.contactPhone}</span>
                  </div>
                )}

                {church.profileConfig?.contactEmail && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                    <span>{church.profileConfig.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Dâng Hiến Mục Vụ (kèm mã VietQR minh họa) */}
            {church.bankingConfig && (
              <div className="bg-[#14161a] border border-stone-800 rounded-xl p-5 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#c5a059]" />
                    <span>Dâng Hiến Mục Vụ</span>
                  </h3>
                  <button
                    onClick={() => openModal("giving")}
                    className="text-[11px] text-[#c5a059] hover:underline cursor-pointer"
                  >
                    Xem chi tiết
                  </button>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#0f1115] border border-stone-800">
                  {/* VietQR illustration thumbnail */}
                  <div
                    onClick={() =>
                      setSelectedLightboxImage({
                        url: `https://img.vietqr.io/image/${church.bankingConfig?.bankName?.replace(/\s+/g, "") || "MB"}-${church.bankingConfig?.accountNumber || "0386888999"}-compact2.png?amount=0&addInfo=DangHien%20${church.slug}&accountName=${encodeURIComponent(church.bankingConfig?.accountHolder || "HOI THANH")}`,
                        title: "Mã VietQR Dâng Hiến — " + church.name,
                        desc: `Ngân hàng: ${church.bankingConfig?.bankName} • Số tài khoản: ${church.bankingConfig?.accountNumber} • Chủ tài khoản: ${church.bankingConfig?.accountHolder}`,
                        category: "Dâng Hiến",
                      })
                    }
                    className="w-16 h-16 sm:w-18 sm:h-18 bg-white p-1 rounded-lg shrink-0 border border-stone-700 shadow-md cursor-pointer group relative overflow-hidden flex items-center justify-center"
                    title="Bấm để phóng to mã QR"
                  >
                    <img
                      src={`https://img.vietqr.io/image/${church.bankingConfig?.bankName?.replace(/\s+/g, "") || "MB"}-${church.bankingConfig?.accountNumber || "0386888999"}-compact2.png?amount=0&addInfo=DangHien%20${church.slug}&accountName=${encodeURIComponent(church.bankingConfig?.accountHolder || "HOI THANH")}`}
                      alt="VietQR"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 text-xs">
                    <div className="text-stone-400 font-sans truncate">
                      {church.bankingConfig.bankName}
                    </div>
                    <div className="text-sm font-bold text-[#c5a059] tracking-wider font-mono select-all truncate">
                      {church.bankingConfig.accountNumber}
                    </div>
                    <div className="text-[10px] text-stone-300 font-sans uppercase truncate">
                      {church.bankingConfig.accountHolder}
                    </div>
                    <p className="text-[10px] text-stone-500 pt-0.5">
                      💡 Chạm vào mã QR để phóng to
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Card: Thư Viện Hình Ảnh Sinh Hoạt (Giống Facebook Photos Box) */}
            <div className="bg-[#14161a] border border-stone-800 rounded-xl p-5 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#c5a059]" />
                  <span>Hình Ảnh Sinh Hoạt</span>
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">
                  {CHURCH_GALLERY_PHOTOS.length} ảnh
                </span>
              </div>

              {/* Grid 3x2 Photos */}
              <div className="grid grid-cols-3 gap-2">
                {CHURCH_GALLERY_PHOTOS.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() =>
                      setSelectedLightboxImage({
                        url: photo.url,
                        title: photo.title,
                        desc: photo.desc,
                        category: photo.category,
                      })
                    }
                    className="relative aspect-square rounded-lg overflow-hidden border border-stone-800 bg-stone-900 group cursor-pointer shadow-sm hover:border-[#c5a059]/60 transition-all"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                      <span className="text-[9px] font-serif text-stone-200 line-clamp-1">
                        {photo.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-stone-500 text-center pt-1">
                Chạm vào ảnh để xem kích thước lớn
              </p>
            </div>

            {/* Card 3: Lời Chúa Khích Lệ */}
            <div className="bg-gradient-to-br from-[#1c1f26] to-[#14161a] border border-[#c5a059]/30 rounded-xl p-5 space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-serif font-semibold text-[#c5a059]">
                <BookOpen className="w-4 h-4" />
                <span>Câu Gốc Tuần Này</span>
              </div>
              <p className="text-xs text-stone-200 italic font-serif leading-relaxed">
                &ldquo;Đức Giê-hô-va là Đấng chăn giữ tôi; tôi sẽ chẳng thiếu thốn gì.
                Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh.&rdquo;
              </p>
              <p className="text-[11px] text-right text-stone-400 font-sans font-medium">
                — Thi Thiên 23:1–2
              </p>
            </div>
          </aside>

          {/* ================= RIGHT COLUMN: WALL FEED ================= */}
          <main className="lg:col-span-8 space-y-5">
            {/* Category Filter Bar */}
            <div className="bg-[#14161a] border border-stone-800 rounded-xl p-3 shadow-md flex items-center gap-2 overflow-x-auto scrollbar-none">
              <Filter className="w-4 h-4 text-stone-500 shrink-0 ml-1" />
              {[
                { id: "all", label: "Tất Cả" },
                { id: "announcement", label: "Thông Báo" },
                { id: "scripture", label: "Lời Chúa" },
                { id: "devotion", label: "Tĩnh Nguyện" },
                { id: "sermon", label: "Bài Giảng" },
                { id: "fellowship", label: "Sinh Hoạt" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${activeCategory === tab.id
                      ? "bg-[#c5a059] text-stone-950 font-serif font-bold shadow-sm"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-850"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Posts Stream */}
            {isLoading ? (
              <div className="py-16 text-center space-y-3 font-serif">
                <div className="w-8 h-8 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-stone-400">Đang tải bản tin Hội Thánh...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-[#14161a] border border-stone-800 rounded-xl p-10 text-center space-y-3 shadow-md">
                <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-500 mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-base font-bold text-stone-200">
                  Chưa có bài viết trong chuyên mục này
                </h4>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  Ban Truyền Thông Hội Thánh sẽ sớm cập nhật các thông báo mục vụ và bài chia sẻ Lời Chúa tại đây.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post) => {
                  const badge = getCategoryBadge(post.category);
                  const isExpanded = expandedComments[post._id];
                  const hasLiked = likedPosts[post._id];

                  return (
                    <article
                      key={post._id}
                      className="bg-[#14161a] border border-stone-800 rounded-xl overflow-hidden shadow-xl transition-all"
                    >
                      {/* Post Header */}
                      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-900 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0 font-serif font-bold text-xs overflow-hidden">
                            <img
                              src={getChurchAvatar(
                                post.author?.name || church.name,
                                post.churchSlug || church.slug,
                                post.author?.avatarUrl
                              )}
                              alt={post.author.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif font-bold text-xs sm:text-sm text-stone-100">
                                {post.author.name}
                              </span>
                              <span className="text-[10px] bg-stone-800 text-[#c5a059] px-2 py-0.2 rounded-full font-serif">
                                {post.author.role}
                              </span>
                            </div>

                            <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                              {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {post.isPinned && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-serif font-bold">
                              <Pin className="w-3 h-3 rotate-45" />
                              <span>Ghim</span>
                            </span>
                          )}

                          <span
                            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-serif font-semibold ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 sm:px-5 space-y-3">
                        <h2 className="font-serif text-base sm:text-lg font-bold text-stone-100 leading-snug">
                          {post.title}
                        </h2>

                        {post.scriptureVerse && (
                          <div className="p-3 rounded-lg bg-stone-900/80 border-l-2 border-[#c5a059] text-xs font-serif italic text-stone-300 leading-relaxed">
                            <span>&ldquo;{post.scriptureVerse}&rdquo;</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-stone-300 whitespace-pre-line leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Attached Image */}
                      {post.imageUrl && (
                        <div
                          onClick={() =>
                            setSelectedLightboxImage({
                              url: post.imageUrl!,
                              title: post.title,
                              desc: post.content,
                              category: badge.label,
                            })
                          }
                          className="mt-3.5 px-0 sm:px-5 cursor-pointer group"
                        >
                          <div className="relative w-full max-h-[460px] overflow-hidden sm:rounded-lg border-y sm:border border-stone-800 bg-black">
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover max-h-[460px] group-hover:scale-[1.015] transition-transform duration-300"
                            />
                            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] text-stone-300 font-serif flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Maximize2 className="w-3.5 h-3.5 text-[#c5a059]" />
                              <span>Phóng to</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Interaction Counts Bar */}
                      <div className="px-4 sm:px-5 py-2.5 mt-2 flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800/80">
                        <div className="flex items-center gap-1.5 text-[#c5a059]">
                          <span className="w-4 h-4 rounded-full bg-[#c5a059]/20 flex items-center justify-center text-[10px]">
                            🙏
                          </span>
                          <span>
                            <strong>{post.likesCount}</strong> người hiệp ý Amen
                          </span>
                        </div>

                        <div className="text-stone-500">
                          {post.comments?.length || 0} bình luận
                        </div>
                      </div>

                      {/* Action Buttons: Like / Amen & Comment */}
                      <div className="px-4 sm:px-5 py-1.5 flex items-center justify-around text-xs font-medium text-stone-300 border-b border-stone-800">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer ${hasLiked
                              ? "text-[#c5a059] bg-[#c5a059]/10 font-bold"
                              : "hover:bg-stone-850 hover:text-stone-100"
                            }`}
                        >
                          <span className="text-sm">🙏</span>
                          <span>{hasLiked ? "Đã Amen" : "Hiệp Ý (Amen)"}</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post._id]: !prev[post._id],
                            }))
                          }
                          className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-stone-850 hover:text-stone-100 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-4 h-4 text-stone-400" />
                          <span>Bình luận</span>
                        </button>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/${church.slug}#post-${post._id}`
                            );
                            alert("Đã sao chép liên kết bài viết!");
                          }}
                          className="flex-1 py-2 flex items-center justify-center gap-1.5 rounded-lg hover:bg-stone-850 hover:text-stone-100 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 text-stone-400" />
                          <span>Chia sẻ</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      <div className="p-4 sm:p-5 bg-[#0f1115]/50 space-y-3">
                        {/* Existing Comments */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-2.5">
                            {post.comments.map((cmt, idx) => (
                              <div
                                key={cmt._id || idx}
                                className="flex items-start gap-2.5"
                              >
                                <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[11px] font-serif font-bold text-[#c5a059] shrink-0">
                                  {cmt.authorName ? cmt.authorName.charAt(0) : "T"}
                                </div>
                                <div className="flex-1 bg-[#14161a] border border-stone-800 rounded-xl px-3.5 py-2 text-xs">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-serif font-semibold text-stone-200">
                                      {cmt.authorName}
                                    </span>
                                    <span className="text-[10px] text-stone-500">
                                      {new Date(cmt.createdAt).toLocaleDateString("vi-VN", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  <p className="text-stone-300 mt-1 leading-relaxed">
                                    {cmt.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Comment Input */}
                        <div className="flex items-start gap-2 pt-1">
                          <div className="w-7 h-7 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[10px] font-serif font-bold text-[#c5a059] shrink-0 mt-1">
                            Tôi
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <input
                              type="text"
                              placeholder="Tên của bạn (ví dụ: Chấp sự An, Thân hữu Minh)..."
                              value={commentInputs[post._id]?.authorName || ""}
                              onChange={(e) =>
                                setCommentInputs((prev) => ({
                                  ...prev,
                                  [post._id]: {
                                    authorName: e.target.value,
                                    text: prev[post._id]?.text || "",
                                  },
                                }))
                              }
                              className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#c5a059]"
                            />

                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                placeholder="Viết lời chúc phước, hiệp ý hoặc cảm tạ..."
                                value={commentInputs[post._id]?.text || ""}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post._id);
                                  }
                                }}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post._id]: {
                                      authorName: prev[post._id]?.authorName || "",
                                      text: e.target.value,
                                    },
                                  }))
                                }
                                className="flex-1 bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                              />

                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={submittingComment[post._id]}
                                className="px-3 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Gửi</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedLightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn"
          onClick={() => setSelectedLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedLightboxImage(null)}
              className="absolute -top-12 right-0 sm:right-2 text-stone-400 hover:text-white bg-stone-900/90 hover:bg-stone-800 p-2 rounded-full border border-stone-700/80 transition-all z-10 cursor-pointer shadow-lg"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image container */}
            <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-[#0f1115] shadow-2xl max-h-[78vh] flex items-center justify-center">
              <img
                src={selectedLightboxImage.url}
                alt={selectedLightboxImage.title || "Hình ảnh hội thánh"}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl select-none"
              />
            </div>

            {/* Caption bar */}
            {(selectedLightboxImage.title || selectedLightboxImage.desc || selectedLightboxImage.category) && (
              <div className="mt-3 bg-[#14161a]/95 border border-stone-800 rounded-xl px-4 py-2.5 max-w-2xl w-full text-center space-y-1 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {selectedLightboxImage.category && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/30 font-semibold">
                      {selectedLightboxImage.category}
                    </span>
                  )}
                  {selectedLightboxImage.title && (
                    <h4 className="text-sm font-serif font-bold text-stone-100">
                      {selectedLightboxImage.title}
                    </h4>
                  )}
                </div>
                {selectedLightboxImage.desc && (
                  <p className="text-xs text-stone-400 line-clamp-2">
                    {selectedLightboxImage.desc}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
