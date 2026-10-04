"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Newspaper,
  Info,
  Settings,
  Edit3,
  Trash2,
  Plus,
  Shield,
  Save,
  AlertCircle,
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

const CHRISTIAN_IMAGE_COLLECTION = [
  {
    name: "Tiệc Thánh Thiêng Liêng",
    category: "Tiệc Thánh",
    icon: "🍞",
    url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Kinh Thánh Nền Tảng",
    category: "Lời Chúa",
    icon: "📖",
    url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thập Tự Giá & Bình Minh",
    category: "Đức Tin",
    icon: "✝️",
    url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thánh Đường Uy Nghiêm",
    category: "Thánh Đường",
    icon: "⛪",
    url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ban Hát Lễ Ngợi Khen",
    category: "Ngợi Khen",
    icon: "🎵",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thanh Niên Hiệp Một",
    category: "Thông Công",
    icon: "🤝",
    url: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Trường Chúa Nhật Thiếu Nhi",
    category: "Thiếu Nhi",
    icon: "👶",
    url: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cầu Nguyện & Tĩnh Nguyện",
    category: "Tâm Linh",
    icon: "🙏",
    url: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=1200&q=80",
  },
];

const CHRISTIAN_COVERS_SAMPLE = [
  {
    name: "Thánh Đường Uy Nghiêm",
    url: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Thập Tự Giá Bình Minh",
    url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Hội Thánh Thờ Phượng",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Đỉnh Núi Ánh Sáng",
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
  },
];

const CHRISTIAN_AVATARS_SAMPLE = [
  {
    name: "Thập Tự Giá Vàng",
    url: "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Kinh Thánh Soi Đường",
    url: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Ánh Nến Bình An",
    url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Bánh & Chén Tiệc Thánh",
    url: "https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&w=400&q=80",
  },
];

export const ChurchWallView: React.FC<ChurchWallViewProps> = ({
  onGoToSanctuary,
  isLive,
}) => {
  const { church, openModal, updateChurch } = useWorship();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mobileWallTab, setMobileWallTab] = useState<"feed" | "about" | "gallery">("feed");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{
    url: string;
    title?: string;
    desc?: string;
    category?: string;
  } | null>(null);

  // Admin Session State
  const [adminSession, setAdminSession] = useState<{
    id: string;
    fullName: string;
    email: string;
    role: string;
    churchSlug?: string;
    isSuperAdmin?: boolean;
  } | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState<boolean>(false);

  // Post Creator State (Admin directly publishes to wall)
  const [showPostComposer, setShowPostComposer] = useState<boolean>(false);
  const [newPostCategory, setNewPostCategory] = useState<
    "announcement" | "scripture" | "devotion" | "sermon" | "fellowship"
  >("announcement");
  const [newPostTitle, setNewPostTitle] = useState<string>("");
  const [newPostScripture, setNewPostScripture] = useState<string>("");
  const [newPostContent, setNewPostContent] = useState<string>("");
  const [newPostImageUrl, setNewPostImageUrl] = useState<string>("");
  const [newPostVideoUrl, setNewPostVideoUrl] = useState<string>("");
  const [newPostIsPinned, setNewPostIsPinned] = useState<boolean>(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState<boolean>(false);
  const [showImagePicker, setShowImagePicker] = useState<boolean>(false);

  // Edit Post State
  const [editingPost, setEditingPost] = useState<WallPost | null>(null);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState<boolean>(false);

  // Edit Church Profile Modal State
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [editProfileTab, setEditProfileTab] = useState<"appearance" | "info" | "banking">("appearance");
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>("");
  const [profileFormData, setProfileFormData] = useState({
    coverImageUrl: church.profileConfig?.coverImageUrl || "",
    avatarUrl: church.profileConfig?.avatarUrl || "",
    slogan: church.profileConfig?.slogan || "",
    name: church.name || "",
    denomination: church.denomination || "",
    about: church.profileConfig?.about || "",
    leadPastor: church.profileConfig?.leadPastor || "",
    liveSchedule: church.liveSchedule || "",
    address: church.address || "",
    contactPhone: church.profileConfig?.contactPhone || "",
    contactEmail: church.profileConfig?.contactEmail || "",
    bankName: church.bankingConfig?.bankName || "MB Bank",
    accountNumber: church.bankingConfig?.accountNumber || "",
    accountHolder: church.bankingConfig?.accountHolder || "",
    branch: church.bankingConfig?.branch || "",
  });

  // Comment input per post
  const [commentInputs, setCommentInputs] = useState<
    Record<string, { authorName: string; text: string }>
  >({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  // Check if current logged-in user is an Admin of this church or SuperAdmin
  useEffect(() => {
    let isCancelled = false;
    async function checkAdminAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && !isCancelled) {
            const user = json.data.user;
            const isSuper = Boolean(json.data.isSuperAdmin || user.role === "superadmin");
            const userChurchSlug = (user.churchSlug || json.data.church?.slug || "").toLowerCase().trim();
            const currentSlug = (church.slug || "").toLowerCase().trim();
            const authorized = isSuper || (userChurchSlug && userChurchSlug === currentSlug);

            if (authorized) {
              setAdminSession({ ...user, isSuperAdmin: isSuper });
              setIsAuthorizedAdmin(true);
            }
          }
        }
      } catch (err) {
        // Guest viewer
      }
    }

    checkAdminAuth();
    return () => {
      isCancelled = true;
    };
  }, [church.slug]);

  const openProfileModal = () => {
    setProfileFormData({
      coverImageUrl: church.profileConfig?.coverImageUrl || "",
      avatarUrl: church.profileConfig?.avatarUrl || "",
      slogan: church.profileConfig?.slogan || "",
      name: church.name || "",
      denomination: church.denomination || "",
      about: church.profileConfig?.about || "",
      leadPastor: church.profileConfig?.leadPastor || "",
      liveSchedule: church.liveSchedule || "",
      address: church.address || "",
      contactPhone: church.profileConfig?.contactPhone || "",
      contactEmail: church.profileConfig?.contactEmail || "",
      bankName: church.bankingConfig?.bankName || "MB Bank",
      accountNumber: church.bankingConfig?.accountNumber || "",
      accountHolder: church.bankingConfig?.accountHolder || "",
      branch: church.bankingConfig?.branch || "",
    });
    setProfileSuccessMsg("");
    setShowEditProfileModal(true);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết.");
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          title: newPostTitle.trim(),
          category: newPostCategory,
          scriptureVerse: newPostScripture.trim(),
          content: newPostContent.trim(),
          imageUrl: newPostImageUrl.trim(),
          videoUrl: newPostVideoUrl.trim(),
          isPinned: newPostIsPinned,
          authorName:
            adminSession?.fullName ||
            church.profileConfig?.leadPastor ||
            church.name,
          authorRole: adminSession?.isSuperAdmin
            ? "Tổng Quản Trị Hệ Thống"
            : church.profileConfig?.leadPastor
            ? "Mục sư Quản Nhiệm"
            : "Ban Quản Trị Mục Vụ",
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setPosts((prev) => [json.data, ...prev]);
        setShowPostComposer(false);
        setNewPostTitle("");
        setNewPostScripture("");
        setNewPostContent("");
        setNewPostImageUrl("");
        setNewPostVideoUrl("");
        setNewPostIsPinned(false);
        setShowImagePicker(false);
      } else {
        alert(json.message || "Lỗi khi đăng bài viết.");
      }
    } catch (err: any) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleTogglePin = async (postId: string, currentPinned: boolean) => {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, isPinned: !currentPinned }),
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, isPinned: !currentPinned } : p
          )
        );
      } else {
        alert(json.message || "Lỗi khi đổi trạng thái ghim");
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Quý vị có chắc chắn muốn xóa bài viết này khỏi Tường Hội Thánh không?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/posts?id=${postId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      } else {
        alert(json.message || "Không thể xóa bài viết");
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleSaveEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    setIsSubmittingEdit(true);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: editingPost._id,
          title: editingPost.title,
          category: editingPost.category,
          scriptureVerse: editingPost.scriptureVerse,
          content: editingPost.content,
          imageUrl: editingPost.imageUrl,
          isPinned: editingPost.isPinned,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === editingPost._id ? { ...p, ...editingPost } : p))
        );
        setEditingPost(null);
      } else {
        alert(json.message || "Lỗi khi cập nhật bài viết");
      }
    } catch (err: any) {
      alert("Lỗi kết nối: " + err.message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const res = await fetch("/api/admin/church", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          name: profileFormData.name.trim(),
          denomination: profileFormData.denomination.trim(),
          address: profileFormData.address.trim(),
          liveSchedule: profileFormData.liveSchedule.trim(),
          profileConfig: {
            coverImageUrl: profileFormData.coverImageUrl.trim(),
            avatarUrl: profileFormData.avatarUrl.trim(),
            slogan: profileFormData.slogan.trim(),
            about: profileFormData.about.trim(),
            leadPastor: profileFormData.leadPastor.trim(),
            contactPhone: profileFormData.contactPhone.trim(),
            contactEmail: profileFormData.contactEmail.trim(),
          },
          bankingConfig: {
            bankName: profileFormData.bankName.trim(),
            accountNumber: profileFormData.accountNumber.trim(),
            accountHolder: profileFormData.accountHolder.trim(),
            branch: profileFormData.branch.trim(),
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        updateChurch({
          name: profileFormData.name.trim(),
          denomination: profileFormData.denomination.trim(),
          address: profileFormData.address.trim(),
          liveSchedule: profileFormData.liveSchedule.trim(),
          profileConfig: {
            ...church.profileConfig,
            coverImageUrl: profileFormData.coverImageUrl.trim(),
            avatarUrl: profileFormData.avatarUrl.trim(),
            slogan: profileFormData.slogan.trim(),
            about: profileFormData.about.trim(),
            leadPastor: profileFormData.leadPastor.trim(),
            contactPhone: profileFormData.contactPhone.trim(),
            contactEmail: profileFormData.contactEmail.trim(),
          },
          bankingConfig: {
            bankName: profileFormData.bankName.trim(),
            accountNumber: profileFormData.accountNumber.trim(),
            accountHolder: profileFormData.accountHolder.trim(),
            branch: profileFormData.branch.trim(),
          },
        });
        setProfileSuccessMsg("Đã lưu cập nhật thông tin Tường thành công!");
        setTimeout(() => {
          setShowEditProfileModal(false);
          setProfileSuccessMsg("");
        }, 1000);
      } else {
        alert(json.error || json.message || "Lỗi khi lưu thông tin");
      }
    } catch (err: any) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

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
      {/* 0. Dedicated Admin Ribbon if authorized */}
      {isAuthorizedAdmin && (
        <div className="bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border-b border-gold-400/40 py-2.5 px-4 text-xs shadow-xl flex flex-wrap items-center justify-between gap-2.5 z-20 sticky top-0 sm:static">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse shrink-0" />
            <span className="font-serif font-bold text-gold-300">
              Chế Độ Quản Trị ({adminSession?.fullName || "Mục Vụ"}):
            </span>
            <span className="text-stone-300 hidden sm:inline text-[11px]">
              Quý vị có quyền đăng bài trực tiếp và chỉnh sửa toàn bộ thông tin Tường Hội Thánh này.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setMobileWallTab("feed");
                setShowPostComposer(true);
                window.scrollTo({ top: 380, behavior: "smooth" });
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Đăng Bài Mới</span>
            </button>

            <button
              onClick={openProfileModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Sửa Thông Tin Tường</span>
            </button>

            <Link
              href="/admin"
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs font-serif flex items-center gap-1.5 transition-colors"
              title="Vào Trang Quản Trị Toàn Diện"
            >
              <Shield className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Admin Panel</span>
            </Link>
          </div>
        </div>
      )}

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
          <div className="relative w-full h-48 sm:h-72 md:h-80 bg-stone-900 overflow-hidden group">
            <img
              src={coverUrl}
              alt="Ảnh bìa Hội Thánh"
              className="w-full h-full object-cover brightness-[0.75]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14161a] via-[#14161a]/30 to-transparent" />
            
            {/* Quick edit cover button for admin */}
            {isAuthorizedAdmin && (
              <button
                onClick={openProfileModal}
                className="absolute top-4 left-4 bg-black/75 hover:bg-black/90 text-stone-200 border border-white/20 px-3 py-1.5 rounded-full text-xs font-serif flex items-center gap-1.5 shadow-lg backdrop-blur-md cursor-pointer transition-all hover:scale-105 z-10"
                title="Thay đổi ảnh bìa và thông tin Tường"
              >
                <Camera className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Đổi Ảnh Bìa / Thông Tin</span>
              </button>
            )}

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
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#14161a] border-4 border-[#14161a] ring-2 ring-[#c5a059]/60 shadow-2xl flex items-center justify-center text-[#c5a059] shrink-0 overflow-hidden relative group">
                  <img
                    src={getChurchAvatar(church.name, church.slug, church.profileConfig?.avatarUrl)}
                    alt={church.name}
                    className="w-full h-full object-cover"
                  />
                  {isAuthorizedAdmin && (
                    <button
                      onClick={openProfileModal}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer"
                      title="Đổi ảnh đại diện Hội Thánh"
                    >
                      <Camera className="w-5 h-5 text-[#c5a059]" />
                      <span className="text-[10px] font-serif mt-1">Đổi Avatar</span>
                    </button>
                  )}
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
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onGoToSanctuary}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer ${isLive
                      ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                      : "bg-[#c5a059] hover:bg-[#d6b068] text-stone-950"
                    }`}
                >
                  <Radio className="w-4 h-4 shrink-0" />
                  <span>{isLive ? "Xem Trực Tiếp (Live)" : "Phòng Thờ Phượng"}</span>
                </button>

                <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => openModal("prayer")}
                    className="px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>Cầu Nguyện</span>
                  </button>

                  <button
                    onClick={() => openModal("giving")}
                    className="px-2.5 sm:px-3.5 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                    <span>Dâng Hiến</span>
                  </button>

                  <button
                    onClick={copyPageLink}
                    className="px-2.5 sm:px-3 py-2.5 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-700 text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    title="Sao chép liên kết trang Hội Thánh"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300 text-[11px] sm:hidden">Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-stone-300 text-[11px] sm:hidden">Chia sẻ</span>
                      </>
                    )}
                  </button>
                </div>

                {isAuthorizedAdmin && (
                  <button
                    onClick={openProfileModal}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-gold-400/20 hover:bg-gold-400/30 text-gold-300 border border-gold-400/50 text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Chỉnh sửa toàn bộ thông tin Tường Hội Thánh"
                  >
                    <Settings className="w-4 h-4 text-gold-400" />
                    <span>Sửa Thông Tin Tường</span>
                  </button>
                )}
              </div>
            </div>

            {/* Slogan Motto Banner */}
            <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-400">
              <p className="italic font-serif text-stone-300 text-center sm:text-left">
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

      {/* 2.5 Mobile Segmented Tab Switcher (< lg) */}
      <div className="lg:hidden max-w-6xl mx-auto px-3 sm:px-4 mt-3">
        <div className="flex items-center bg-[#14161a] border border-stone-800 rounded-xl p-1 shadow-md">
          <button
            onClick={() => setMobileWallTab("feed")}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-serif font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileWallTab === "feed"
                ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 shrink-0" />
            <span>Bản Tin</span>
          </button>

          <button
            onClick={() => setMobileWallTab("about")}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-serif font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileWallTab === "about"
                ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Giới Thiệu</span>
          </button>

          <button
            onClick={() => setMobileWallTab("gallery")}
            className={`flex-1 py-2 px-2 rounded-lg text-xs font-serif font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mobileWallTab === "gallery"
                ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5 shrink-0" />
            <span>Hình Ảnh</span>
          </button>
        </div>
      </div>

      {/* 3. Main 2-Column Body: Left Sidebar (Info) & Right Feed (Wall Posts) */}
      <div className="max-w-6xl mx-auto px-3 sm:px-4 mt-3 sm:mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* ================= LEFT COLUMN: CHURCH ABOUT & INFO ================= */}
          <aside className={`lg:col-span-4 space-y-4 sm:space-y-5 ${mobileWallTab === "feed" ? "hidden lg:block" : "block"}`}>
            {/* Card 1: Giới thiệu & Mục vụ */}
            <div className={`bg-[#14161a] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg ${mobileWallTab === "gallery" ? "hidden lg:block" : "block"}`}>
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
              <div className={`bg-[#14161a] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-lg ${mobileWallTab === "gallery" ? "hidden lg:block" : "block"}`}>
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

            {/* Card 3: Thư Viện Hình Ảnh Sinh Hoạt (Giống Facebook Photos Box) */}
            <div className={`bg-[#14161a] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3.5 shadow-lg ${mobileWallTab === "about" ? "hidden lg:block" : "block"}`}>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#c5a059]" />
                  <span>Hình Ảnh Sinh Hoạt</span>
                </h3>
                <span className="text-[11px] text-stone-400 font-mono">
                  {CHURCH_GALLERY_PHOTOS.length} ảnh
                </span>
              </div>

              {/* Grid: 2 cols on mobile, 3 cols on sm+ */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 sm:p-2">
                      <span className="text-[10px] sm:text-[9px] font-serif text-stone-200 line-clamp-1">
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

            {/* Card 4: Lời Chúa Khích Lệ */}
            <div className={`bg-gradient-to-br from-[#1c1f26] to-[#14161a] border border-[#c5a059]/30 rounded-xl p-4 sm:p-5 space-y-2.5 shadow-lg ${mobileWallTab === "gallery" ? "hidden lg:block" : "block"}`}>
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
          <main className={`lg:col-span-8 space-y-4 sm:space-y-5 ${mobileWallTab === "feed" ? "block" : "hidden lg:block"}`}>
            {/* Admin Post Composer Box (Facebook-style) */}
            {isAuthorizedAdmin && (
              <div className="bg-[#14161a] border border-[#c5a059]/40 rounded-xl p-3.5 sm:p-4 shadow-xl space-y-3">
                {/* Collapsed / Quick Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1c1f26] border border-[#c5a059]/60 shrink-0 overflow-hidden">
                    <img
                      src={getChurchAvatar(church.name, church.slug, church.profileConfig?.avatarUrl)}
                      alt={church.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {!showPostComposer ? (
                    <button
                      type="button"
                      onClick={() => setShowPostComposer(true)}
                      className="flex-1 text-left bg-stone-900/90 hover:bg-stone-850 border border-stone-800 hover:border-[#c5a059]/50 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-stone-400 transition-all cursor-pointer shadow-inner flex items-center justify-between"
                    >
                      <span>Mục sư / Ban Quản Trị, quý vị muốn chia sẻ điều gì hôm nay?</span>
                      <Edit3 className="w-4 h-4 text-[#c5a059] shrink-0 ml-2" />
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-between">
                      <div className="text-xs font-serif font-bold text-stone-200 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span>Tạo Bài Viết Mục Vụ Mới</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPostComposer(false)}
                        className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-850 transition-colors cursor-pointer"
                        title="Thu gọn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons when collapsed */}
                {!showPostComposer && (
                  <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setNewPostCategory("announcement");
                        setShowPostComposer(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900/60 hover:bg-stone-850 border border-stone-800 text-stone-300 font-serif flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Thông Báo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPostCategory("scripture");
                        setShowPostComposer(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900/60 hover:bg-stone-850 border border-stone-800 text-stone-300 font-serif flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                      <span>Lời Chúa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewPostCategory("devotion");
                        setShowPostComposer(true);
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900/60 hover:bg-stone-850 border border-stone-800 text-stone-300 font-serif flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Tĩnh Nguyện</span>
                    </button>
                  </div>
                )}

                {/* Expanded Form */}
                {showPostComposer && (
                  <form onSubmit={handleCreatePost} className="space-y-3 pt-1 border-t border-stone-800">
                    {/* Category Pills */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-serif font-bold text-stone-300">
                        Chuyên mục bài viết
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {[
                          { id: "announcement", label: "Thông Báo" },
                          { id: "scripture", label: "Lời Chúa" },
                          { id: "devotion", label: "Tĩnh Nguyện" },
                          { id: "sermon", label: "Bài Giảng" },
                          { id: "fellowship", label: "Sinh Hoạt / Thông Công" },
                        ].map((cat) => (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setNewPostCategory(cat.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-colors cursor-pointer ${
                              newPostCategory === cat.id
                                ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                                : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                            }`}
                          >
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <input
                        type="text"
                        placeholder="Tiêu đề bài viết (ví dụ: Thông báo Lễ Phục Sinh, Sứ điệp Đức Tin)..."
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        className="w-full bg-stone-900/90 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Scripture Verse (Optional) */}
                    <div>
                      <input
                        type="text"
                        placeholder="Câu gốc Kinh Thánh (ví dụ: Giăng 3:16, Thi Thiên 23:1) - Tuỳ chọn"
                        value={newPostScripture}
                        onChange={(e) => setNewPostScripture(e.target.value)}
                        className="w-full bg-stone-900/90 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none font-serif italic"
                      />
                    </div>

                    {/* Content Textarea */}
                    <div>
                      <textarea
                        rows={4}
                        required
                        placeholder="Nội dung tâm tình, thông báo hoặc sứ điệp của Hội Thánh..."
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full bg-stone-900/90 border border-stone-800 focus:border-[#c5a059] rounded-xl p-3.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none leading-relaxed transition-colors resize-y"
                      />
                    </div>

                    {/* Image Attachment & Curated Picker */}
                    <div className="space-y-2 bg-stone-900/50 p-3 rounded-xl border border-stone-800/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-serif font-bold text-stone-300 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                          <span>Hình ảnh đính kèm (URL hoặc chọn từ thư viện Cơ Đốc)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowImagePicker(!showImagePicker)}
                          className="text-[11px] text-[#c5a059] hover:underline font-serif cursor-pointer"
                        >
                          {showImagePicker ? "Đóng thư viện mẫu" : "⚡ Chọn ảnh đẹp có sẵn"}
                        </button>
                      </div>

                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... (Dán liên kết ảnh)"
                        value={newPostImageUrl}
                        onChange={(e) => setNewPostImageUrl(e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none"
                      />

                      {/* Curated Christian Images Grid */}
                      {showImagePicker && (
                        <div className="space-y-1.5 pt-1">
                          <p className="text-[10px] text-stone-400">
                            Chạm vào ảnh để tự động áp dụng làm hình ảnh bài viết:
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                            {CHRISTIAN_IMAGE_COLLECTION.map((item, idx) => (
                              <div
                                key={idx}
                                onClick={() => {
                                  setNewPostImageUrl(item.url);
                                  setShowImagePicker(false);
                                }}
                                className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all aspect-video ${
                                  newPostImageUrl === item.url
                                    ? "border-[#c5a059] ring-2 ring-[#c5a059]/50"
                                    : "border-stone-800 hover:border-stone-600"
                                }`}
                              >
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                                  <span className="text-[9px] text-white line-clamp-1 font-serif">
                                    {item.name}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Image Preview if provided */}
                      {newPostImageUrl && (
                        <div className="relative w-full h-36 rounded-lg overflow-hidden border border-stone-700 bg-stone-950 mt-2">
                          <img
                            src={newPostImageUrl}
                            alt="Xem trước ảnh bài viết"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setNewPostImageUrl("")}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/70 hover:bg-black text-white cursor-pointer"
                            title="Gỡ ảnh"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Video / Livestream Link (Optional) */}
                    <div>
                      <input
                        type="url"
                        placeholder="Link Video YouTube / Facebook (nếu có bài giảng / clip sinh hoạt)"
                        value={newPostVideoUrl}
                        onChange={(e) => setNewPostVideoUrl(e.target.value)}
                        className="w-full bg-stone-900/90 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none"
                      />
                    </div>

                    {/* Pin Checkbox & Submit */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={newPostIsPinned}
                          onChange={(e) => setNewPostIsPinned(e.target.checked)}
                          className="rounded border-stone-700 text-[#c5a059] focus:ring-[#c5a059] bg-stone-900"
                        />
                        <span className="flex items-center gap-1 font-serif">
                          <Pin className="w-3 h-3 text-amber-400 rotate-45" />
                          <span>Ghim bài viết này lên đầu bảng tin</span>
                        </span>
                      </label>

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPostComposer(false);
                            setShowImagePicker(false);
                          }}
                          className="px-3 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-serif transition-colors cursor-pointer"
                        >
                          Huỷ
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmittingPost || !newPostContent.trim()}
                          className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d6b068] disabled:opacity-50 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {isSubmittingPost ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                              <span>Đang đăng...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Đăng Bài Ngay</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}

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
                      <div className="p-3.5 sm:p-5 pb-2.5 sm:pb-3 flex items-start justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] shrink-0 font-serif font-bold text-xs overflow-hidden">
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-xs sm:text-sm text-stone-100">
                                {post.author.name}
                              </span>
                              <span className="text-[10px] bg-stone-800 text-[#c5a059] px-2 py-0.2 rounded-full font-serif">
                                {post.author.role}
                              </span>
                            </div>

                            <p className="text-[10px] sm:text-[11px] text-stone-500 font-sans mt-0.5">
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

                        <div className="flex items-center gap-1.5 sm:gap-2">
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

                          {/* Admin Post Actions */}
                          {isAuthorizedAdmin && (
                            <div className="flex items-center gap-1 ml-1 border-l border-stone-800 pl-1.5">
                              <button
                                type="button"
                                onClick={() => handleTogglePin(post._id, Boolean(post.isPinned))}
                                title={post.isPinned ? "Bỏ ghim bài viết" : "Ghim bài viết lên đầu"}
                                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                  post.isPinned
                                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
                                    : "bg-stone-850 border-stone-700 text-stone-400 hover:text-amber-300 hover:border-amber-500/40"
                                }`}
                              >
                                <Pin className="w-3.5 h-3.5 rotate-45" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingPost(post)}
                                title="Chỉnh sửa bài viết này"
                                className="p-1.5 rounded-lg bg-stone-850 border border-stone-700 text-stone-400 hover:text-[#c5a059] hover:border-[#c5a059]/40 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletePost(post._id)}
                                title="Xóa bài viết này khỏi Tường"
                                className="p-1.5 rounded-lg bg-stone-850 border border-stone-700 text-stone-400 hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="px-3.5 sm:px-5 space-y-2 sm:space-y-3">
                        <h2 className="font-serif text-base sm:text-lg font-bold text-stone-100 leading-snug">
                          {post.title}
                        </h2>

                        {post.scriptureVerse && (
                          <div className="p-2.5 sm:p-3 rounded-lg bg-stone-900/80 border-l-2 border-[#c5a059] text-xs font-serif italic text-stone-300 leading-relaxed">
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
                          className="mt-3 px-0 sm:px-5 cursor-pointer group"
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
                      <div className="px-3.5 sm:px-5 py-2 sm:py-2.5 mt-2 flex items-center justify-between text-[11px] text-stone-400 border-b border-stone-800/80">
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
                      <div className="px-2 sm:px-5 py-1 flex items-center justify-around text-xs font-medium text-stone-300 border-b border-stone-800">
                        <button
                          onClick={() => handleLike(post._id)}
                          className={`flex-1 py-2 sm:py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 rounded-lg transition-colors cursor-pointer ${hasLiked
                              ? "text-[#c5a059] bg-[#c5a059]/10 font-bold"
                              : "hover:bg-stone-850 hover:text-stone-100"
                            }`}
                        >
                          <span className="text-sm">🙏</span>
                          <span>{hasLiked ? "Đã Amen" : "Hiệp Ý"}</span>
                        </button>

                        <button
                          onClick={() =>
                            setExpandedComments((prev) => ({
                              ...prev,
                              [post._id]: !prev[post._id],
                            }))
                          }
                          className="flex-1 py-2 sm:py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 rounded-lg hover:bg-stone-850 hover:text-stone-100 transition-colors cursor-pointer"
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
                          className="flex-1 py-2 sm:py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 rounded-lg hover:bg-stone-850 hover:text-stone-100 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4 text-stone-400" />
                          <span>Chia sẻ</span>
                        </button>
                      </div>

                      {/* Comments Section */}
                      <div className="p-3 sm:p-5 bg-[#0f1115]/50 space-y-2.5 sm:space-y-3">
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

      {/* 4. Edit Post Modal */}
      {editingPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setEditingPost(null)}
        >
          <div
            className="bg-[#14161a] border border-stone-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#c5a059]" />
                <span>Chỉnh Sửa Bài Viết</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPost} className="space-y-3.5">
              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">
                  Chuyên mục
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: "announcement", label: "Thông Báo" },
                    { id: "scripture", label: "Lời Chúa" },
                    { id: "devotion", label: "Tĩnh Nguyện" },
                    { id: "sermon", label: "Bài Giảng" },
                    { id: "fellowship", label: "Sinh Hoạt / Thông Công" },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() =>
                        setEditingPost((prev) => (prev ? { ...prev, category: cat.id as any } : null))
                      }
                      className={`px-2.5 py-1 rounded-lg text-xs font-serif transition-colors cursor-pointer ${
                        editingPost.category === cat.id
                          ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                          : "bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">
                  Tiêu đề bài viết
                </label>
                <input
                  type="text"
                  value={editingPost.title}
                  onChange={(e) =>
                    setEditingPost((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none"
                />
              </div>

              {/* Scripture Verse */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">
                  Câu gốc Kinh Thánh (Tuỳ chọn)
                </label>
                <input
                  type="text"
                  value={editingPost.scriptureVerse || ""}
                  onChange={(e) =>
                    setEditingPost((prev) =>
                      prev ? { ...prev, scriptureVerse: e.target.value } : null
                    )
                  }
                  className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none font-serif italic"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">
                  Nội dung bài viết *
                </label>
                <textarea
                  rows={5}
                  required
                  value={editingPost.content}
                  onChange={(e) =>
                    setEditingPost((prev) => (prev ? { ...prev, content: e.target.value } : null))
                  }
                  className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl p-3.5 text-xs sm:text-sm text-stone-100 focus:outline-none leading-relaxed resize-y"
                />
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-xs font-serif font-bold text-stone-300">
                  Liên kết hình ảnh (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingPost.imageUrl || ""}
                  onChange={(e) =>
                    setEditingPost((prev) =>
                      prev ? { ...prev, imageUrl: e.target.value } : null
                    )
                  }
                  className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-lg px-3 py-1.5 text-xs text-stone-200 focus:outline-none"
                />
                {editingPost.imageUrl && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border border-stone-700 bg-stone-950 mt-1.5">
                    <img
                      src={editingPost.imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Pin */}
              <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={Boolean(editingPost.isPinned)}
                  onChange={(e) =>
                    setEditingPost((prev) =>
                      prev ? { ...prev, isPinned: e.target.checked } : null
                    )
                  }
                  className="rounded border-stone-700 text-[#c5a059] focus:ring-[#c5a059] bg-stone-900"
                />
                <span className="flex items-center gap-1 font-serif">
                  <Pin className="w-3 h-3 text-amber-400 rotate-45" />
                  <span>Ghim bài viết này lên đầu bảng tin</span>
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-serif transition-colors cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit || !editingPost.content.trim()}
                  className="px-5 py-2 rounded-xl bg-[#c5a059] hover:bg-[#d6b068] disabled:opacity-50 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSubmittingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Lưu Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Church Profile Modal */}
      {showEditProfileModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
          onClick={() => setShowEditProfileModal(false)}
        >
          <div
            className="bg-[#14161a] border border-stone-800 rounded-2xl max-w-3xl w-full p-4 sm:p-6 space-y-4 shadow-2xl relative max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#c5a059]" />
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-100">
                    Chỉnh Sửa Thông Tin Tường Hội Thánh
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    Cập nhật hình ảnh, thông điệp, liên hệ và tài khoản dâng hiến
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProfileModal(false)}
                className="text-stone-400 hover:text-stone-200 p-1.5 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success Message Banner */}
            {profileSuccessMsg && (
              <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-3 text-xs text-emerald-300 font-serif flex items-center gap-2 animate-fadeIn shrink-0">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 bg-stone-900 p-1 rounded-xl border border-stone-800 shrink-0">
              <button
                type="button"
                onClick={() => setEditProfileTab("appearance")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-serif transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  editProfileTab === "appearance"
                    ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Giao Diện & Châm Ngôn</span>
              </button>

              <button
                type="button"
                onClick={() => setEditProfileTab("info")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-serif transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  editProfileTab === "info"
                    ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>Thông Tin & Liên Hệ</span>
              </button>

              <button
                type="button"
                onClick={() => setEditProfileTab("banking")}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-serif transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                  editProfileTab === "banking"
                    ? "bg-[#c5a059] text-stone-950 font-bold shadow"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Dâng Hiến (VietQR)</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProfile} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Tab 1: Appearance */}
              {editProfileTab === "appearance" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Cover Photo */}
                  <div className="space-y-2 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
                    <label className="text-xs font-serif font-bold text-stone-200 flex items-center justify-between">
                      <span>Ảnh Bìa Tường (Cover Image URL)</span>
                      <span className="text-[10px] text-stone-400 font-normal">Kích thước chuẩn: 1200x400</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (Dán link ảnh bìa)"
                      value={profileFormData.coverImageUrl}
                      onChange={(e) =>
                        setProfileFormData((prev) => ({ ...prev, coverImageUrl: e.target.value }))
                      }
                      className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none"
                    />

                    {/* Quick Christian Cover Samples */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] text-[#c5a059] font-serif">
                        ⚡ Hoặc chọn nhanh ảnh bìa Cơ Đốc nghệ thuật cao:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CHRISTIAN_COVERS_SAMPLE.map((cov, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              setProfileFormData((prev) => ({ ...prev, coverImageUrl: cov.url }))
                            }
                            className={`relative h-16 rounded-lg overflow-hidden border cursor-pointer group transition-all ${
                              profileFormData.coverImageUrl === cov.url
                                ? "border-[#c5a059] ring-2 ring-[#c5a059]/50"
                                : "border-stone-800 hover:border-stone-600"
                            }`}
                          >
                            <img
                              src={cov.url}
                              alt={cov.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                              <span className="text-[9px] text-white line-clamp-1 font-serif">
                                {cov.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {profileFormData.coverImageUrl && (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-stone-700 bg-stone-950 mt-1">
                        <img
                          src={profileFormData.coverImageUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Avatar Photo */}
                  <div className="space-y-2 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
                    <label className="text-xs font-serif font-bold text-stone-200 flex items-center justify-between">
                      <span>Ảnh Đại Diện Hội Thánh (Avatar URL)</span>
                      <span className="text-[10px] text-stone-400 font-normal">Kích thước chuẩn: Hình vuông / Tròn</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://... (Dán link ảnh đại diện)"
                      value={profileFormData.avatarUrl}
                      onChange={(e) =>
                        setProfileFormData((prev) => ({ ...prev, avatarUrl: e.target.value }))
                      }
                      className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none"
                    />

                    {/* Quick Christian Avatar Samples */}
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[10px] text-[#c5a059] font-serif">
                        ⚡ Hoặc chọn nhanh biểu trưng Hội Thánh mẫu:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {CHRISTIAN_AVATARS_SAMPLE.map((av, idx) => (
                          <div
                            key={idx}
                            onClick={() =>
                              setProfileFormData((prev) => ({ ...prev, avatarUrl: av.url }))
                            }
                            className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer group transition-all ${
                              profileFormData.avatarUrl === av.url
                                ? "border-[#c5a059] bg-[#c5a059]/10"
                                : "border-stone-800 hover:border-stone-700 bg-stone-900"
                            }`}
                          >
                            <img
                              src={av.url}
                              alt={av.name}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <span className="text-[10px] text-stone-300 font-serif line-clamp-1">
                              {av.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Slogan */}
                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-200">
                      Châm ngôn / Tiêu ngữ Hội Thánh (Slogan)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Hiệp Một — Yêu Thương — Phụng Sự"
                      value={profileFormData.slogan}
                      onChange={(e) =>
                        setProfileFormData((prev) => ({ ...prev, slogan: e.target.value }))
                      }
                      className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none font-serif"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Info */}
              {editProfileTab === "info" && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-200">
                        Tên Hội Thánh *
                      </label>
                      <input
                        type="text"
                        required
                        value={profileFormData.name}
                        onChange={(e) =>
                          setProfileFormData((prev) => ({ ...prev, name: e.target.value }))
                        }
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-200">
                        Giáo hạt / Hệ phái
                      </label>
                      <input
                        type="text"
                        placeholder="Hội Thánh Tin Lành Việt Nam..."
                        value={profileFormData.denomination}
                        onChange={(e) =>
                          setProfileFormData((prev) => ({ ...prev, denomination: e.target.value }))
                        }
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-200">
                        Mục sư Quản Nhiệm
                      </label>
                      <input
                        type="text"
                        placeholder="Mục sư..."
                        value={profileFormData.leadPastor}
                        onChange={(e) =>
                          setProfileFormData((prev) => ({ ...prev, leadPastor: e.target.value }))
                        }
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-200">
                        Lịch nhóm thờ phượng trực tiếp
                      </label>
                      <input
                        type="text"
                        placeholder="Chúa Nhật, 09:00 & 19:30"
                        value={profileFormData.liveSchedule}
                        onChange={(e) =>
                          setProfileFormData((prev) => ({ ...prev, liveSchedule: e.target.value }))
                        }
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-200">
                      Địa chỉ Nhà Thờ / Điểm Nhóm
                    </label>
                    <input
                      type="text"
                      placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                      value={profileFormData.address}
                      onChange={(e) =>
                        setProfileFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-200">
                        Số điện thoại văn phòng
                      </label>
                      <input
                        type="text"
                        placeholder="028... hoặc 090..."
                        value={profileFormData.contactPhone}
                        onChange={(e) =>
                          setProfileFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                        }
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-serif font-bold text-stone-200">
                        Email văn phòng
                      </label>
                      <input
                        type="email"
                        placeholder="vanphong@hoithanh.org"
                        value={profileFormData.contactEmail}
                        onChange={(e) =>
                          setProfileFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                        }
                        className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-serif font-bold text-stone-200">
                      Giới thiệu sơ lược về Hội Thánh (About)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Giới thiệu về lịch sử, khải tượng, và các thánh vụ trọng tâm..."
                      value={profileFormData.about}
                      onChange={(e) =>
                        setProfileFormData((prev) => ({ ...prev, about: e.target.value }))
                      }
                      className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl p-3 text-xs text-stone-100 focus:outline-none leading-relaxed resize-y"
                    />
                  </div>
                </div>
              )}

              {/* Tab 3: Banking */}
              {editProfileTab === "banking" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-stone-900/60 p-3.5 rounded-xl border border-stone-800 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-serif font-bold text-stone-200">
                          Tên ngân hàng
                        </label>
                        <select
                          value={profileFormData.bankName}
                          onChange={(e) =>
                            setProfileFormData((prev) => ({ ...prev, bankName: e.target.value }))
                          }
                          className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                        >
                          <option value="MB Bank">MB Bank (Quân Đội)</option>
                          <option value="Vietcombank">Vietcombank</option>
                          <option value="Techcombank">Techcombank</option>
                          <option value="ACB">ACB (Á Châu)</option>
                          <option value="BIDV">BIDV</option>
                          <option value="VietinBank">VietinBank</option>
                          <option value="Agribank">Agribank</option>
                          <option value="VPBank">VPBank</option>
                          <option value="TPBank">TPBank</option>
                          <option value="Sacombank">Sacombank</option>
                          <option value="VIB">VIB</option>
                          <option value="SHB">SHB</option>
                          <option value="HDBank">HDBank</option>
                          <option value="MSB">MSB</option>
                          <option value="OCB">OCB</option>
                          <option value="SeABank">SeABank</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-serif font-bold text-stone-200">
                          Số tài khoản ngân hàng *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: 0386888999"
                          value={profileFormData.accountNumber}
                          onChange={(e) =>
                            setProfileFormData((prev) => ({ ...prev, accountNumber: e.target.value }))
                          }
                          className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#c5a059] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-serif font-bold text-stone-200">
                          Tên chủ tài khoản (In hoa không dấu) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ví dụ: HOI THANH TIN LANH"
                          value={profileFormData.accountHolder}
                          onChange={(e) =>
                            setProfileFormData((prev) => ({
                              ...prev,
                              accountHolder: e.target.value.toUpperCase(),
                            }))
                          }
                          className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs uppercase text-stone-100 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-serif font-bold text-stone-200">
                          Chi nhánh (Tuỳ chọn)
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Chi nhánh TP.HCM"
                          value={profileFormData.branch}
                          onChange={(e) =>
                            setProfileFormData((prev) => ({ ...prev, branch: e.target.value }))
                          }
                          className="w-full bg-stone-900 border border-stone-800 focus:border-[#c5a059] rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live VietQR Preview */}
                  {profileFormData.accountNumber && (
                    <div className="p-3 bg-stone-900/90 rounded-xl border border-stone-800 flex items-center gap-3">
                      <div className="w-16 h-16 bg-white p-1 rounded-lg shrink-0 border border-stone-700 shadow flex items-center justify-center">
                        <img
                          src={`https://img.vietqr.io/image/${profileFormData.bankName.replace(/\s+/g, "")}-${profileFormData.accountNumber}-compact2.png?amount=0&addInfo=DangHien%20${church.slug}&accountName=${encodeURIComponent(profileFormData.accountHolder || "HOI THANH")}`}
                          alt="VietQR Preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-xs space-y-0.5 min-w-0">
                        <p className="text-[11px] font-serif font-bold text-[#c5a059]">
                          Xem trước mã VietQR tự động sinh:
                        </p>
                        <p className="text-stone-300 font-mono text-[11px]">
                          {profileFormData.bankName} • {profileFormData.accountNumber}
                        </p>
                        <p className="text-stone-400 text-[10px] uppercase truncate">
                          {profileFormData.accountHolder}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Bottom Action */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs font-serif transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2.5 rounded-xl bg-[#c5a059] hover:bg-[#d6b068] disabled:opacity-50 text-stone-950 font-serif font-bold text-xs sm:text-sm shadow flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Lưu Cập Nhật Tường</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
