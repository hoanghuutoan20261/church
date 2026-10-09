"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Church,
  Radio,
  BookOpen,
  HeartHandshake,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Phone,
  Calendar,
  User as UserIcon,
  Sparkles,
  AlertCircle,
  Clock,
  Shield,
  HelpCircle,
  RefreshCw,
  Newspaper,
  Pin,
  Send,
  ThumbsUp,
  Image as ImageIcon,
  Music2,
  Plus,
  MapPin,
} from "lucide-react";
import { HlsPlayer } from "@/components/player/HlsPlayer";
import { WorshipProvider } from "@/context/WorshipContext";
import { AdminLyricsPresenter } from "@/components/admin/AdminLyricsPresenter";
import { getChurchAvatar } from "@/lib/churchAvatar";
import { ImageUploadBox } from "@/components/common/ImageUploadBox";
import { AmenIcon } from "@/components/common/AmenIcon";
import { IWorshipScheduleItem } from "@/models/Church";
import { getChurchGoogleMapsUrl } from "@/lib/mapUtils";

interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface ChurchConfig {
  _id: string;
  name: string;
  slug: string;
  denomination: string;
  address: string;
  streamKey: string;
  streamType?: "youtube" | "facebook" | "mediamtx" | "custom_hls";
  streamUrl?: string;
  liveSchedule: string;
  worshipSchedules?: IWorshipScheduleItem[];
  currentService: {
    title: string;
    speaker: string;
    speakerTitle: string;
    scriptureReference: string;
    welcomeMessage: string;
    isLive: boolean;
    viewersCount: number;
  };
  bankingConfig: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch?: string;
  };
  profileConfig?: {
    coverImageUrl?: string;
    avatarUrl?: string;
    about?: string;
    leadPastor?: string;
    contactPhone?: string;
    contactEmail?: string;
    slogan?: string;
    googleMapUrl?: string;
  };
  themeConfig: {
    accentColor: string;
    logoUrl: string;
  };
  liveLyrics?: {
    isEnabled: boolean;
    songId?: string;
    songNumber?: number | null;
    songTitle?: string;
    originalTitle?: string;
    stanzaIndex?: number;
    stanzaLabel?: string;
    lines?: string[];
    displayType?: "hymn" | "scripture";
    referenceTranslation?: string;
    layoutMode?: "lowerthird" | "subtitle" | "fullscreen";
    themeStyle?: "gold" | "white" | "teal" | "amber";
  };
}

interface PrayerItem {
  _id: string;
  name: string;
  contact?: string;
  category: string;
  confidentialLevel: string;
  prayerContent: string;
  wantsPastorCall: boolean;
  status: "new" | "praying" | "completed";
  createdAt: string;
}

interface SalvationItem {
  _id: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  hasPrayed: boolean;
  serviceTheme: string;
  status: "pending_pastoral_care" | "contacted" | "discipleship";
  createdAt: string;
}

interface ChatItem {
  _id: string;
  id?: string;
  sender: string;
  role: string;
  text: string;
  timestamp: string;
  createdAt: string;
}

const CHRISTIAN_ILLUSTRATIONS_POSTS = [
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
    category: "Trường CN",
    icon: "👶",
    url: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Cầu Nguyện",
    category: "Tâm Linh",
    icon: "✝️",
    url: "https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Bác Ái",
    category: "Yêu Thương",
    icon: "🎁",
    url: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thánh Đường",
    category: "Nhà Chúa",
    icon: "⛪",
    url: "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Ánh Nến",
    category: "Phục Sinh",
    icon: "🕯️",
    url: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Thập Tự Giá",
    category: "Đức Tin",
    icon: "✝️",
    url: "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=80",
  },
];

const CHRISTIAN_COVERS = [
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

const CHRISTIAN_AVATARS = [
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

export default function ChurchAdminDashboard() {
  const router = useRouter();

  // App State
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [church, setChurch] = useState<ChurchConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "stream" | "sermon" | "lyrics" | "prayers" | "salvations" | "chat" | "wall" | "settings"
  >("stream");

  // Form states
  const [serviceForm, setServiceForm] = useState({
    title: "",
    speaker: "",
    speakerTitle: "Mục sư Quản Nhiệm",
    scriptureReference: "",
    welcomeMessage: "",
    isLive: false,
  });

  const [streamSettingsForm, setStreamSettingsForm] = useState<{
    streamType: "youtube" | "facebook" | "mediamtx" | "custom_hls";
    streamUrl: string;
  }>({
    streamType: "youtube",
    streamUrl: "",
  });
  const [isSavingStream, setIsSavingStream] = useState(false);
  const [streamSaveSuccess, setStreamSaveSuccess] = useState("");
  const [isProbingObs, setIsProbingObs] = useState(false);

  const [bankForm, setBankForm] = useState({
    bankName: "MB Bank",
    accountNumber: "",
    accountHolder: "",
    branch: "",
  });

  const [churchInfoForm, setChurchInfoForm] = useState({
    name: "",
    denomination: "",
    address: "",
    liveSchedule: "",
    worshipSchedules: [] as IWorshipScheduleItem[],
  });

  const [profileForm, setProfileForm] = useState({
    coverImageUrl: "",
    avatarUrl: "",
    about: "",
    leadPastor: "",
    contactPhone: "",
    contactEmail: "",
    slogan: "",
    googleMapUrl: "",
  });

  const [postForm, setPostForm] = useState({
    title: "",
    content: "",
    category: "announcement" as
      | "announcement"
      | "scripture"
      | "devotion"
      | "sermon"
      | "fellowship",
    scriptureVerse: "",
    imageUrl: "",
    isPinned: false,
  });

  const [wallPosts, setWallPosts] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);

  // Data lists
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [salvations, setSalvations] = useState<SalvationItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatItem[]>([]);

  // UI state
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedServer, setCopiedServer] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");

  // Load Admin Profile and Church Configuration
  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/admin/login");
          return;
        }

        const json = await res.json();
        if (json.success && json.data) {
          setCurrentUser(json.data.user);
          const ch: ChurchConfig = json.data.church;
          setChurch(ch);

          // Populate forms
          if (ch.currentService) {
            setServiceForm({
              title: ch.currentService.title || "",
              speaker: ch.currentService.speaker || "",
              speakerTitle: ch.currentService.speakerTitle || "Mục sư Quản Nhiệm",
              scriptureReference: ch.currentService.scriptureReference || "",
              welcomeMessage: ch.currentService.welcomeMessage || "",
              isLive: Boolean(ch.currentService.isLive),
            });
          }

          setStreamSettingsForm({
            streamType: ch.streamType || "youtube",
            streamUrl: ch.streamUrl || "",
          });

          if (ch.bankingConfig) {
            setBankForm({
              bankName: ch.bankingConfig.bankName || "MB Bank",
              accountNumber: ch.bankingConfig.accountNumber || "",
              accountHolder: ch.bankingConfig.accountHolder || "",
              branch: ch.bankingConfig.branch || "",
            });
          }

          if (ch.profileConfig) {
            setProfileForm({
              coverImageUrl: ch.profileConfig.coverImageUrl || "",
              avatarUrl: ch.profileConfig.avatarUrl || "",
              about: ch.profileConfig.about || "",
              leadPastor: ch.profileConfig.leadPastor || "",
              contactPhone: ch.profileConfig.contactPhone || "",
              contactEmail: ch.profileConfig.contactEmail || "",
              slogan: ch.profileConfig.slogan || "",
              googleMapUrl: ch.profileConfig.googleMapUrl || "",
            });
          }

          setChurchInfoForm({
            name: ch.name || "",
            denomination: ch.denomination || "",
            address: ch.address || "",
            liveSchedule: ch.liveSchedule || "",
            worshipSchedules: ch.worshipSchedules || [],
          });
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, [router]);

  // Load Tab-specific data
  useEffect(() => {
    if (!church?.slug) return;

    if (activeTab === "prayers") {
      fetch("/api/admin/prayers")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setPrayers(data.data || []);
        })
        .catch(console.error);
    } else if (activeTab === "salvations") {
      fetch("/api/admin/salvations")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setSalvations(data.data || []);
        })
        .catch(console.error);
    } else if (activeTab === "chat") {
      fetch(`/api/chat?churchSlug=${encodeURIComponent(church.slug)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setChatMessages(data.data || []);
        })
        .catch(console.error);
    } else if (activeTab === "wall") {
      fetch("/api/admin/posts")
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setWallPosts(data.data || []);
        })
        .catch(console.error);
    }
  }, [activeTab, church?.slug]);

  // Save Service Program Updates
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess("");

    try {
      const res = await fetch("/api/admin/church", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentService: serviceForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccess("Đã lưu và cập nhật tức thì lên phòng thờ phượng!");
        setTimeout(() => setSaveSuccess(""), 4000);
      }
    } catch {
      alert("Lỗi khi lưu dữ liệu. Xin thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Save Stream Configuration (Source & URL)
  const handleSaveStreamSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!church) return;
    setIsSavingStream(true);
    setStreamSaveSuccess("");
    try {
      const res = await fetch("/api/admin/church", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          streamType: streamSettingsForm.streamType,
          streamUrl: streamSettingsForm.streamUrl.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChurch((prev) =>
          prev
            ? {
                ...prev,
                streamType: streamSettingsForm.streamType,
                streamUrl: streamSettingsForm.streamUrl.trim(),
              }
            : null
        );
        setStreamSaveSuccess("Đã lưu và đồng bộ cấu hình nguồn phát trực tiếp!");
        setTimeout(() => setStreamSaveSuccess(""), 4000);
      } else {
        alert(data.error || "Không thể lưu cấu hình nguồn phát.");
      }
    } catch {
      alert("Lỗi khi kết nối với máy chủ để lưu cấu hình nguồn phát.");
    } finally {
      setIsSavingStream(false);
    }
  };

  // Handle auto-discovered OBS stream URL from player probe
  const handleObsStreamFound = async (foundUrl: string) => {
    if (!church || !foundUrl) return;
    if (streamSettingsForm.streamUrl !== foundUrl) {
      setStreamSettingsForm((prev) => ({
        ...prev,
        streamType: "mediamtx",
        streamUrl: foundUrl,
      }));
      try {
        await fetch("/api/admin/church", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            churchSlug: church.slug,
            streamType: "mediamtx",
            streamUrl: foundUrl,
          }),
        });
        setStreamSaveSuccess("Đã tự động bắt & lưu luồng OBS trực tiếp!");
        setTimeout(() => setStreamSaveSuccess(""), 4000);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Manually probe and capture OBS stream directly from server or local
  const handleManualProbeObs = async () => {
    if (!church) return;
    setIsProbingObs(true);
    setStreamSaveSuccess("");
    try {
      const res = await fetch(
        `/api/stream/probe?key=${encodeURIComponent(church.streamKey || "")}&slug=${encodeURIComponent(church.slug || "")}`
      );
      const data = await res.json();
      if (data.isLive && data.streamUrl) {
        setStreamSettingsForm((prev) => ({
          ...prev,
          streamType: "mediamtx",
          streamUrl: data.streamUrl,
        }));
        await fetch("/api/admin/church", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            churchSlug: church.slug,
            streamType: "mediamtx",
            streamUrl: data.streamUrl,
          }),
        });
        setStreamSaveSuccess("Đã bắt và lưu thành công luồng OBS trực tiếp!");
        setTimeout(() => setStreamSaveSuccess(""), 4000);
      } else {
        const host =
          typeof window !== "undefined" && window.location.hostname
            ? window.location.hostname
            : "hoithanhvn.com";
        alert(
          `Chưa nhận được tín hiệu từ OBS!\n\nXin hãy kiểm tra:\n1. Mở phần mềm OBS Studio -> Cài đặt (Settings) -> Luồng (Stream):\n   - Dịch vụ (Service): Tự chọn... (Custom...)\n   - Máy chủ (Server): rtmp://${host}:1935/live\n   - Khóa luồng (Stream Key): ${church.streamKey}\n2. Bấm 'Bắt đầu phát luồng' (Start Streaming) trong OBS rồi thử lại.`
        );
      }
    } catch {
      alert("Lỗi khi kết nối tới máy chủ dò luồng.");
    } finally {
      setIsProbingObs(false);
    }
  };

  // Toggle Live Broadcast status
  const handleToggleLiveStatus = async (isLive: boolean) => {
    if (!church) return;
    setServiceForm((prev) => ({ ...prev, isLive }));
    try {
      await fetch("/api/admin/church", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          currentService: { ...serviceForm, isLive },
          streamType: streamSettingsForm.streamType,
          streamUrl: streamSettingsForm.streamUrl.trim(),
        }),
      });
      setSaveSuccess(
        isLive
          ? "Đã kích hoạt trạng thái: ĐANG PHÁT TRỰC TIẾP (ON-AIR)"
          : "Đã chuyển trạng thái: TẠM DỪNG / KẾT THÚC (OFF-AIR)"
      );
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Save Banking & Info & Profile
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess("");

    try {
      const res = await fetch("/api/admin/church", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...churchInfoForm,
          bankingConfig: bankForm,
          profileConfig: profileForm,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.church) setChurch(data.church);
        setSaveSuccess("Cập nhật thông tin Hội Thánh & Dâng hiến thành công!");
        setTimeout(() => setSaveSuccess(""), 4000);
      }
    } catch {
      alert("Lỗi cập nhật. Xin thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  // Publish new post to Church Wall
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title.trim() || !postForm.content.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung bài viết.");
      return;
    }

    setIsPosting(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church?.slug,
          title: postForm.title,
          content: postForm.content,
          category: postForm.category,
          scriptureVerse: postForm.scriptureVerse,
          imageUrl: postForm.imageUrl,
          isPinned: postForm.isPinned,
          authorName: currentUser?.fullName || church?.name || "Ban Quản Trị",
          authorRole:
            currentUser?.role === "pastor"
              ? "Mục sư Quản Nhiệm"
              : "Ban Truyền Thông Hội Thánh",
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setWallPosts((prev) => [data.data, ...prev]);
        setPostForm({
          title: "",
          content: "",
          category: "announcement",
          scriptureVerse: "",
          imageUrl: "",
          isPinned: false,
        });
        setSaveSuccess("Đã đăng bài viết lên Tường Hội Thánh thành công!");
        setTimeout(() => setSaveSuccess(""), 4000);
      } else {
        alert(data.message || "Lỗi khi đăng bài viết.");
      }
    } catch {
      alert("Lỗi kết nối khi đăng bài.");
    } finally {
      setIsPosting(false);
    }
  };

  // Delete post from Wall
  const handleDeletePost = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi Tường Hội Thánh?"))
      return;

    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setWallPosts((prev) => prev.filter((p) => p._id !== id));
        setSaveSuccess("Đã xóa bài viết khỏi Tường!");
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Pin on post
  const handleTogglePinPost = async (id: string, currentPinned: boolean) => {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: id, isPinned: !currentPinned }),
      });
      const data = await res.json();
      if (data.success) {
        setWallPosts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, isPinned: !currentPinned } : p
          )
        );
        setSaveSuccess(
          !currentPinned
            ? "Đã ghim bài viết lên đầu Tường!"
            : "Đã bỏ ghim bài viết."
        );
        setTimeout(() => setSaveSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark prayer status
  const handleUpdatePrayerStatus = async (
    prayerId: string,
    status: "praying" | "completed"
  ) => {
    try {
      const res = await fetch("/api/admin/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayerId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setPrayers((prev) =>
          prev.map((p) => (p._id === prayerId ? { ...p, status } : p))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mark salvation status
  const handleUpdateSalvationStatus = async (
    decisionId: string,
    status: "contacted" | "discipleship"
  ) => {
    try {
      const res = await fetch("/api/admin/salvations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decisionId, status }),
      });
      const data = await res.json();
      if (data.success) {
        setSalvations((prev) =>
          prev.map((s) => (s._id === decisionId ? { ...s, status } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete chat message
  const handleDeleteChatMessage = async (id: string) => {
    if (!id) {
      alert("Không tìm thấy ID của tin nhắn.");
      return;
    }
    if (!confirm("Bạn có chắc chắn muốn xóa tin nhắn này khỏi phòng chat?"))
      return;
    try {
      const slug = church?.slug || "";
      const res = await fetch(
        `/api/admin/chat?id=${encodeURIComponent(id)}&churchSlug=${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) =>
          prev.filter((m) => m._id !== id && (m as any).id !== id)
        );
      } else {
        alert(data.error || "Không thể xóa tin nhắn");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi xóa tin nhắn");
    }
  };

  // Clear all chat messages for this church
  const handleClearAllChatMessages = async () => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong phòng chat của Hội Thánh này?"
      )
    )
      return;
    try {
      const slug = church?.slug || "";
      const res = await fetch(
        `/api/admin/chat?clearAll=true&churchSlug=${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        setChatMessages([]);
      } else {
        alert(data.error || "Không thể dọn dẹp phòng chat");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối khi dọn dẹp phòng chat");
    }
  };

  // Logout
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const copyToClipboard = (text: string, type: "server" | "key") => {
    navigator.clipboard.writeText(text);
    if (type === "server") {
      setCopiedServer(true);
      setTimeout(() => setCopiedServer(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f1115] text-stone-200 flex flex-col items-center justify-center space-y-3 font-serif">
        <div className="w-10 h-10 rounded-full border-2 border-[#c5a059] border-t-transparent animate-spin" />
        <p className="text-xs text-stone-400">Đang tải không gian quản trị mục vụ...</p>
      </div>
    );
  }

  if (!church) return null;

  const currentHost =
    typeof window !== "undefined" && window.location.hostname
      ? window.location.hostname
      : "localhost";
  const rtmpServerUrl = `rtmp://${currentHost}:1935/live`;

  return (
    <WorshipProvider initialChurch={church}>
      <div className="min-h-screen bg-[#0f1115] text-[#f3f4f6] font-sans selection:bg-[#c5a059]/30 selection:text-[#f3f4f6] flex flex-col">
        {/* 1. Admin Top Navigation Bar */}
        <header className="sticky top-0 z-40 bg-[#14161a]/95 backdrop-blur-md border-b border-stone-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-900 border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059] shadow-sm overflow-hidden shrink-0">
              <img
                src={getChurchAvatar(church.name, church.slug, profileForm.avatarUrl || church.profileConfig?.avatarUrl)}
                alt={church.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-sm sm:text-base font-bold text-stone-100 line-clamp-1">
                  {church.name}
                </h1>
                <span className="text-[10px] bg-stone-800 text-[#c5a059] border border-[#c5a059]/30 px-2 py-0.5 rounded-full font-serif font-semibold">
                  Quản Trị
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-sans">
                Mã phòng: <span className="font-mono text-stone-300">/{church.slug}</span>
              </p>
            </div>
          </div>

          {/* Right header actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={`/${church.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-850 hover:bg-stone-800 text-stone-200 border border-white/10 hover:border-[#c5a059]/40 text-xs transition-colors shadow-sm"
              title="Mở phòng thờ phượng trực tuyến của Hội Thánh trong tab mới"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#c5a059]" />
              <span className="hidden sm:inline">Xem Phòng Nhóm</span>
            </Link>

            <div className="hidden md:flex flex-col text-right pr-2 border-r border-stone-800">
              <span className="text-xs text-stone-200 font-medium font-serif">
                {currentUser?.fullName}
              </span>
              <span className="text-[10px] text-[#c5a059]">
                {currentUser?.role === "tech_leader"
                  ? "Ban Kỹ Thuật"
                  : "Mục Sư Quản Nhiệm"}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-md hover:bg-red-950/40 text-stone-400 hover:text-red-300 border border-transparent hover:border-red-500/30 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Đăng xuất khỏi bảng quản trị"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng Xuất</span>
            </button>
          </div>
        </header>

        {/* 2. Global Save Feedback Banner */}
        {saveSuccess && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-200 px-4 py-2 text-xs font-serif text-center flex items-center justify-center gap-2 animate-fade-in shadow-md">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* 3. Main Workspace Container (Full-Width Studio Layout) */}
        <div className="flex-1 w-full px-3 sm:px-5 py-4 flex flex-col md:flex-row gap-4 lg:gap-5">
          {/* Left Column: Navigation Tabs */}
          <aside className="w-full md:w-60 lg:w-64 xl:w-72 shrink-0 space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-stone-500 font-serif font-semibold px-3 mb-2">
              Phân Hệ Quản Trị
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab("stream")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "stream"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <Radio className="w-4 h-4 shrink-0 text-[#c5a059]" />
                <span>1. Live Studio & Phát Sóng</span>
              </button>

              <button
                onClick={() => setActiveTab("sermon")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "sermon"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <BookOpen className="w-4 h-4 shrink-0 text-[#c5a059]" />
                <span>2. Chủ Đề & Bài Giảng</span>
              </button>

              <button
                onClick={() => setActiveTab("lyrics")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "lyrics"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Music2 className="w-4 h-4 shrink-0 text-[#c5a059]" />
                  <span>3. Trình Chiếu Thánh Ca & Kinh Thánh</span>
                </div>
                {church.liveLyrics?.isEnabled && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold animate-pulse">
                    LIVE
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("prayers")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "prayers"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <HeartHandshake className="w-4 h-4 shrink-0 text-[#c5a059]" />
                  <span>4. Cầu Nguyện Kín</span>
                </div>
                {prayers.filter((p) => p.status === "new").length > 0 && (
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold">
                    {prayers.filter((p) => p.status === "new").length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("salvations")}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "salvations"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#c5a059]" />
                  <span>5. Thân Hữu Tiếp Nhận</span>
                </div>
                {salvations.filter((s) => s.status === "pending_pastoral_care")
                  .length > 0 && (
                    <span className="bg-gold-500/20 text-gold-300 border border-gold-400/30 text-[10px] px-1.5 py-0.2 rounded-full font-sans font-bold">
                      {
                        salvations.filter(
                          (s) => s.status === "pending_pastoral_care"
                        ).length
                      }
                    </span>
                  )}
              </button>

              <button
                onClick={() => setActiveTab("chat")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "chat"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0 text-[#c5a059]" />
                <span>6. Quản Duyệt Chat</span>
              </button>

              <button
                onClick={() => setActiveTab("wall")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "wall"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <Newspaper className="w-4 h-4 shrink-0 text-[#c5a059]" />
                <span>7. Tường & Bài Viết</span>
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${activeTab === "settings"
                    ? "bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/40 font-semibold shadow-sm"
                    : "text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent"
                  }`}
              >
                <CreditCard className="w-4 h-4 shrink-0 text-[#c5a059]" />
                <span>8. Dâng Hiến & Cài Đặt</span>
              </button>
            </nav>

            <div className="pt-6">
              <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400 space-y-2">
                <div className="flex items-center gap-1.5 text-stone-300 font-serif font-semibold">
                  <HelpCircle className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Trợ Giúp Kỹ Thuật</span>
                </div>
                <p className="leading-relaxed">
                  Khi cần hỗ trợ luồng OBS hoặc kết nối máy chủ, liên hệ đội ngũ kỹ thuật
                  qua hotline mục vụ.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Column: Tab Content (Full-Width Studio Responsive) */}
          <main className="flex-1 min-w-0 bg-[#14161a] border border-stone-800 rounded-xl p-4 sm:p-6 shadow-xl">
            {/* ================= TAB 1: LIVE STUDIO & PHÁT SÓNG ================= */}
            {activeTab === "stream" && (
              <div className="space-y-6">
                {/* Header Title */}
                <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <Radio className="w-5 h-5 text-[#c5a059]" />
                      <span>Live Studio & Điều Khiển Phát Sóng</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Xem trước tín hiệu thực từ OBS, quản lý phát sóng và điều phối phòng chờ tín hữu
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-serif font-semibold border ${serviceForm.isLive
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${serviceForm.isLive ? "bg-red-500 animate-ping" : "bg-amber-400"
                          }`}
                      />
                      <span>{serviceForm.isLive ? "ĐANG ON-AIR" : "CHẾ ĐỘ TỔNG DUYỆT (OFF-AIR)"}</span>
                    </span>
                  </div>
                </div>

                {/* Master Broadcast Control Banner */}
                <div
                  className={`p-4 sm:p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-lg ${serviceForm.isLive
                      ? "bg-gradient-to-r from-red-950/70 via-stone-900 to-stone-900 border-red-500/50"
                      : "bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border-amber-500/30"
                    }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-serif font-bold text-sm sm:text-base">
                      {serviceForm.isLive ? (
                        <>
                          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse inline-block" />
                          <span className="text-red-300 uppercase tracking-wide">
                            Đang Phát Sóng Toàn Thánh Đường (ON-AIR)
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                          <span className="text-amber-200 uppercase tracking-wide">
                            Chế Độ Tổng Duyệt Nội Bộ (OFF-AIR — Phòng Chờ Đang Bật)
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                      {serviceForm.isLive
                        ? "Toàn thể tín hữu và thân hữu khi truy cập đang xem trực tiếp luồng này. Khi buổi thờ phượng kết thúc, hãy bấm nút Kết thúc để chuyển tín hữu sang màn hình cảm tạ."
                        : "Người ngoài khi vào phòng nhóm chỉ thấy 'Phòng Chờ Thờ Phượng' với nến sáng và thông tin bài giảng. Chỉ có admin xem trước được tín hiệu OBS bên dưới để chuẩn bị."}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {serviceForm.isLive ? (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Bạn có chắc chắn muốn KẾT THÚC buổi phát sóng trực tiếp?\nTín hữu trên khắp nơi sẽ được chuyển về màn hình cảm tạ / phòng chờ."
                            )
                          ) {
                            handleToggleLiveStatus(false);
                          }
                        }}
                        className="px-5 py-3 rounded-lg bg-stone-800 hover:bg-red-900/80 text-stone-200 hover:text-white border border-stone-600 hover:border-red-500/50 font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <span className="w-2.5 h-2.5 rounded-sm bg-red-400" />
                        <span>KẾT THÚC BUỔI NHÓM (DỪNG LIVE)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "BẮT ĐẦU PHÁT SÓNG TRỰC TIẾP CHO HỘI THÁNH?\n\nMọi tín hữu đang ở phòng chờ sẽ lập tức được chuyển vào luồng phát trực tiếp từ OBS."
                            )
                          ) {
                            handleToggleLiveStatus(true);
                          }
                        }}
                        className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl hover:shadow-red-900/50 transition-all transform hover:scale-[1.02] cursor-pointer"
                      >
                        <Radio className="w-4 h-4 text-white animate-pulse" />
                        <span>BẮT ĐẦU PHÁT SÓNG (GO LIVE)</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 2-Column Grid: Preview Monitor (Left) & Quick Sermon Settings (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Live Preview & OBS Ingest Info */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Preview Monitor Card */}
                    <div className="bg-[#0f1115] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-sm font-semibold text-stone-100 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-[#c5a059]" />
                            <span>Màn Hình Kiểm Tra Luồng (Live Preview)</span>
                          </h3>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${serviceForm.isLive
                                ? "bg-red-500/20 text-red-300 border border-red-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                          >
                            {serviceForm.isLive ? "ON-AIR" : "PREVIEW CHỈ ADMIN"}
                          </span>
                        </div>
                        <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
                          1080p • 60fps Low-Latency
                        </span>
                      </div>

                      {/* HlsPlayer in Admin Preview Mode */}
                      <div className="rounded-lg overflow-hidden border border-stone-800 bg-black shadow-inner">
                        <HlsPlayer
                          isAdminPreview={!serviceForm.isLive}
                          streamUrl={streamSettingsForm.streamUrl || church.streamUrl}
                          onStreamUrlFound={handleObsStreamFound}
                        />
                      </div>

                      <div className="p-2.5 rounded bg-stone-900/60 border border-stone-800/80 text-[11px] text-stone-400 flex items-start gap-2">
                        <span className="text-[#c5a059] font-bold">💡 Mẹo:</span>
                        <span>
                          {streamSettingsForm.streamType === "youtube"
                            ? "Dán link YouTube Live bên dưới và kiểm tra khung xem trước. Bấm 'Bắt Đầu Phát Sóng' để mở thánh đường cho tín hữu."
                            : streamSettingsForm.streamType === "facebook"
                            ? "Dán link Facebook Live bên dưới. Bấm 'Bắt Đầu Phát Sóng' để mở thánh đường cho tín hữu."
                            : "Khởi động OBS và bấm Start Streaming. Màn hình phía trên sẽ hiển thị khung hình thực tế. Người xem bên ngoài sẽ chỉ thấy khi bạn bấm 'Bắt Đầu Phát Sóng (Go Live)'."}
                        </span>
                      </div>
                    </div>

                    {/* Stream Source & Parameters Card */}
                    <div className="bg-[#0f1115] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
                        <div className="flex items-center gap-2">
                          <Radio className="w-4 h-4 text-[#c5a059]" />
                          <h3 className="font-serif text-sm font-semibold text-[#c5a059]">
                            Cấu Hình Nguồn Phát Sóng (Stream Source)
                          </h3>
                        </div>
                        {streamSaveSuccess && (
                          <span className="text-xs text-emerald-400 font-serif flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {streamSaveSuccess}
                          </span>
                        )}
                      </div>

                      {/* Source Type Selector Tabs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setStreamSettingsForm((prev) => ({ ...prev, streamType: "youtube" }))
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                            streamSettingsForm.streamType === "youtube"
                              ? "bg-red-500/20 text-red-300 border-red-500/60 shadow-sm"
                              : "bg-[#14161a] text-stone-400 border-stone-800 hover:text-stone-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          <span>YouTube Live</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStreamSettingsForm((prev) => ({ ...prev, streamType: "mediamtx" }))
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                            streamSettingsForm.streamType === "mediamtx"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm"
                              : "bg-[#14161a] text-stone-400 border-stone-800 hover:text-stone-200"
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" />
                          <span>OBS Studio</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStreamSettingsForm((prev) => ({ ...prev, streamType: "facebook" }))
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                            streamSettingsForm.streamType === "facebook"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/60 shadow-sm"
                              : "bg-[#14161a] text-stone-400 border-stone-800 hover:text-stone-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>Facebook Live</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStreamSettingsForm((prev) => ({ ...prev, streamType: "custom_hls" }))
                          }
                          className={`px-3 py-2 rounded-lg text-xs font-serif font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                            streamSettingsForm.streamType === "custom_hls"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/60 shadow-sm"
                              : "bg-[#14161a] text-stone-400 border-stone-800 hover:text-stone-200"
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span>Luồng HLS (.m3u8)</span>
                        </button>
                      </div>

                      {/* YouTube Live Configuration */}
                      {streamSettingsForm.streamType === "youtube" && (
                        <div className="space-y-3 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-xs text-stone-300 font-medium flex items-center justify-between">
                              <span>Đường dẫn YouTube Live (URL hoặc Video ID):</span>
                              <span className="text-[11px] text-stone-500">Khuyên dùng cho Hội Thánh</span>
                            </label>
                            <input
                              type="text"
                              value={streamSettingsForm.streamUrl}
                              onChange={(e) =>
                                setStreamSettingsForm((prev) => ({
                                  ...prev,
                                  streamUrl: e.target.value,
                                }))
                              }
                              placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                              className="w-full bg-[#14161a] border border-stone-700 text-stone-100 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-md focus:outline-none focus:border-[#c5a059]"
                            />
                            <p className="text-[11px] text-stone-400 leading-relaxed">
                              💡 Bạn chỉ cần dán link phát trực tiếp YouTube của Hội Thánh vào đây. Mọi tín hữu và khách khi truy cập phòng nhóm sẽ xem được luồng phát ngay lập tức trên máy tính hoặc điện thoại mà không cần cài đặt thêm phần mềm.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* OBS Studio Configuration */}
                      {streamSettingsForm.streamType === "mediamtx" && (
                        <div className="space-y-3 pt-1">
                          {/* Server URL field */}
                          <div className="space-y-1.5">
                            <label className="text-xs text-stone-400 font-medium">
                              1. Máy chủ phát sóng (Server):
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={rtmpServerUrl}
                                className="flex-1 bg-[#14161a] border border-stone-700 text-stone-200 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-md select-all focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(rtmpServerUrl, "server")}
                                className="px-3.5 py-2.5 rounded-md bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                              >
                                {copiedServer ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400">Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-stone-400" />
                                    <span>Sao Chép</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Stream Key field */}
                          <div className="space-y-1.5">
                            <label className="text-xs text-stone-400 font-medium">
                              2. Khóa luồng phát (Stream Key):
                            </label>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <input
                                  type={showStreamKey ? "text" : "password"}
                                  readOnly
                                  value={church.streamKey}
                                  className="w-full bg-[#14161a] border border-stone-700 text-stone-200 font-mono text-xs sm:text-sm px-3.5 py-2.5 pr-10 rounded-md select-all focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowStreamKey(!showStreamKey)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                                >
                                  {showStreamKey ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => copyToClipboard(church.streamKey, "key")}
                                className="px-3.5 py-2.5 rounded-md bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                              >
                                {copiedKey ? (
                                  <>
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    <span className="text-emerald-400">Đã chép</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-4 h-4 text-stone-400" />
                                    <span>Sao Chép</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Live Probe & Sync Button for OBS */}
                          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-900/60 p-3 rounded-lg border border-stone-800">
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                <span>Kiểm tra & Bắt luồng phát OBS:</span>
                              </p>
                              <p className="text-[11px] text-stone-400">
                                Sau khi bấm Start Streaming trên OBS, bấm nút để hệ thống tự động bắt và lưu luồng.
                              </p>
                              {streamSettingsForm.streamUrl && (
                                <p className="text-[11px] text-emerald-400 font-mono truncate">
                                  ✓ Đang đồng bộ: {streamSettingsForm.streamUrl}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={handleManualProbeObs}
                              disabled={isProbingObs}
                              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-serif font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md disabled:opacity-50 cursor-pointer shrink-0"
                            >
                              {isProbingObs ? (
                                <>
                                  <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                                  <span>Đang kiểm tra luồng...</span>
                                </>
                              ) : (
                                <>
                                  <Radio className="w-3.5 h-3.5" />
                                  <span>Bắt Luồng OBS & Tự Động Lưu</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Facebook Live Configuration */}
                      {streamSettingsForm.streamType === "facebook" && (
                        <div className="space-y-3 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-xs text-stone-300 font-medium">
                              Đường dẫn video trực tiếp Facebook:
                            </label>
                            <input
                              type="text"
                              value={streamSettingsForm.streamUrl}
                              onChange={(e) =>
                                setStreamSettingsForm((prev) => ({
                                  ...prev,
                                  streamUrl: e.target.value,
                                }))
                              }
                              placeholder="https://www.facebook.com/.../videos/..."
                              className="w-full bg-[#14161a] border border-stone-700 text-stone-100 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-md focus:outline-none focus:border-[#c5a059]"
                            />
                            <p className="text-[11px] text-stone-400 leading-relaxed">
                              💡 Dán liên kết video phát trực tiếp từ Fanpage hoặc Group Facebook của Hội Thánh.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Custom HLS Configuration */}
                      {streamSettingsForm.streamType === "custom_hls" && (
                        <div className="space-y-3 pt-1">
                          <div className="space-y-1.5">
                            <label className="text-xs text-stone-300 font-medium">
                              Đường dẫn luồng HLS (.m3u8):
                            </label>
                            <input
                              type="text"
                              value={streamSettingsForm.streamUrl}
                              onChange={(e) =>
                                setStreamSettingsForm((prev) => ({
                                  ...prev,
                                  streamUrl: e.target.value,
                                }))
                              }
                              placeholder="https://server.example.com/live/stream.m3u8"
                              className="w-full bg-[#14161a] border border-stone-700 text-stone-100 font-mono text-xs sm:text-sm px-3.5 py-2.5 rounded-md focus:outline-none focus:border-[#c5a059]"
                            />
                            <p className="text-[11px] text-stone-400 leading-relaxed">
                              💡 Hỗ trợ mọi luồng phát trực tiếp chuẩn HLS qua giao thức HTTPS/HTTP.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Action Button: Save Stream Source */}
                      <div className="pt-2 flex items-center justify-between border-t border-stone-800/80">
                        <span className="text-[11px] text-stone-500">
                          Luồng sẽ tự cập nhật cho người xem khi bắt đầu phát sóng.
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveStreamSettings()}
                          disabled={isSavingStream}
                          className="px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSavingStream ? "Đang lưu..." : "Lưu Cài Đặt Nguồn Phát"}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick Sermon & Program Configuration */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Quick Sermon Config Card */}
                    <form
                      onSubmit={handleSaveService}
                      className="bg-[#0f1115] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-lg"
                    >
                      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-[#c5a059]" />
                          <h3 className="font-serif text-sm font-semibold text-stone-100">
                            Thông Tin Bài Giảng & Buổi Nhóm
                          </h3>
                        </div>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-3 py-1.5 rounded-md bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs text-stone-300 font-medium">
                            Chủ Đề Buổi Nhóm / Bài Giảng:
                          </label>
                          <input
                            type="text"
                            value={serviceForm.title}
                            onChange={(e) =>
                              setServiceForm({ ...serviceForm, title: e.target.value })
                            }
                            placeholder="Lễ Thờ Phượng Chúa Nhật..."
                            className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-stone-300 font-medium">
                              Diễn Giả:
                            </label>
                            <input
                              type="text"
                              value={serviceForm.speaker}
                              onChange={(e) =>
                                setServiceForm({ ...serviceForm, speaker: e.target.value })
                              }
                              placeholder="Mục sư..."
                              className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-stone-300 font-medium">
                              Chức Danh:
                            </label>
                            <input
                              type="text"
                              value={serviceForm.speakerTitle}
                              onChange={(e) =>
                                setServiceForm({
                                  ...serviceForm,
                                  speakerTitle: e.target.value,
                                })
                              }
                              placeholder="Mục sư Quản Nhiệm"
                              className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-stone-300 font-medium">
                            Phân Đoạn Kinh Thánh:
                          </label>
                          <input
                            type="text"
                            value={serviceForm.scriptureReference}
                            onChange={(e) =>
                              setServiceForm({
                                ...serviceForm,
                                scriptureReference: e.target.value,
                              })
                            }
                            placeholder="Giăng 3:16 hoặc Thi Thiên 23"
                            className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-stone-300 font-medium">
                            Lời Chào Mừng / Thông Báo Phòng Chờ:
                          </label>
                          <textarea
                            rows={3}
                            value={serviceForm.welcomeMessage}
                            onChange={(e) =>
                              setServiceForm({
                                ...serviceForm,
                                welcomeMessage: e.target.value,
                              })
                            }
                            placeholder="Chào mừng quý con cái Chúa và thân hữu..."
                            className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059] resize-none"
                          />
                        </div>
                      </div>
                    </form>

                    {/* Public Link Card for Testing */}
                    <div className="bg-[#0f1115] border border-stone-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
                      <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
                        <ExternalLink className="w-4 h-4 text-[#c5a059]" />
                        <span>Đường Dẫn Thánh Đường Cho Tín Hữu:</span>
                      </div>
                      <div className="p-3 bg-[#14161a] rounded-lg border border-stone-700/80 font-mono text-xs text-[#c5a059] break-all select-all flex items-center justify-between">
                        <span>/{church.slug}</span>
                        <span className="text-[10px] text-stone-500">Mã định danh</span>
                      </div>

                      <Link
                        href={`/${church.slug}`}
                        target="_blank"
                        className="w-full py-2.5 rounded-lg bg-stone-800 hover:bg-[#c5a059] hover:text-stone-950 text-stone-200 font-serif font-semibold text-xs flex items-center justify-center gap-2 border border-stone-700 hover:border-[#c5a059] shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Mở Tab Khách (Xem Thử Phòng Chờ / Live)</span>
                      </Link>
                      <p className="text-[11px] text-stone-500 leading-normal text-center">
                        Mở link này trong tab ẩn danh để kiểm tra trải nghiệm của tín hữu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: SERMON & PROGRAM ================= */}
            {activeTab === "sermon" && (
              <form onSubmit={handleSaveService} className="space-y-6">
                <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-[#c5a059]" />
                      <span>Nội Dung & Chương Trình Thờ Phượng</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Thông tin hiển thị trực tiếp trên màn hình của tín hữu và thân hữu
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Đang lưu..." : "Cập Nhật Buổi Nhóm"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs text-stone-300 font-medium">
                      Chủ Đề Buổi Nhóm / Bài Giảng:
                    </label>
                    <input
                      type="text"
                      value={serviceForm.title}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, title: e.target.value })
                      }
                      placeholder="Lễ Thờ Phượng Chúa Nhật — 'Bước Đi Trong Ân Điển'"
                      className="w-full bg-[#0f1115] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-300 font-medium">
                      Diễn Giả / Người Chia Sẻ:
                    </label>
                    <input
                      type="text"
                      value={serviceForm.speaker}
                      onChange={(e) =>
                        setServiceForm({ ...serviceForm, speaker: e.target.value })
                      }
                      placeholder="Mục sư Quản Nhiệm..."
                      className="w-full bg-[#0f1115] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-stone-300 font-medium">
                      Chức Danh / Vai Trò:
                    </label>
                    <input
                      type="text"
                      value={serviceForm.speakerTitle}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          speakerTitle: e.target.value,
                        })
                      }
                      placeholder="Diễn giả / Mục sư Quản Nhiệm"
                      className="w-full bg-[#0f1115] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs text-stone-300 font-medium">
                      Phân Đoạn Kinh Thánh Trọng Tâm:
                    </label>
                    <input
                      type="text"
                      value={serviceForm.scriptureReference}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          scriptureReference: e.target.value,
                        })
                      }
                      placeholder="Ê-phê-sô 2:8–10 hoặc Giăng 3:16"
                      className="w-full bg-[#0f1115] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs text-stone-300 font-medium">
                      Thông Báo Mục Vụ Đầu Giờ / Lời Chào Mừng:
                    </label>
                    <textarea
                      rows={3}
                      value={serviceForm.welcomeMessage}
                      onChange={(e) =>
                        setServiceForm({
                          ...serviceForm,
                          welcomeMessage: e.target.value,
                        })
                      }
                      placeholder="Chào mừng quý con cái Chúa và thân hữu..."
                      className="w-full bg-[#0f1115] border border-stone-700 rounded-lg p-3 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              </form>
            )}

            {/* ================= TAB 3: CHIẾU LỜI THÁNH CA ================= */}
            {activeTab === "lyrics" && (
              <AdminLyricsPresenter
                churchSlug={church.slug}
                initialLyrics={church.liveLyrics}
              />
            )}

            {/* ================= TAB 4: CONFIDENTIAL PRAYERS ================= */}
            {activeTab === "prayers" && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <HeartHandshake className="w-5 h-5 text-[#c5a059]" />
                      <span>Hộp Thư Cầu Nguyện Kín Của Tín Hữu</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Chỉ Ban Mục Vụ và Mục sư mới có quyền xem các lời cầu thay riêng tư này
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      fetch("/api/admin/prayers")
                        .then((r) => r.json())
                        .then((data) => {
                          if (data.success) setPrayers(data.data || []);
                        });
                    }}
                    className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {prayers.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 font-serif space-y-2">
                    <HeartHandshake className="w-8 h-8 mx-auto text-stone-600" />
                    <p className="text-sm">Hiện chưa có lời cầu nguyện kín nào gửi đến Hội Thánh.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prayers.map((prayer) => (
                      <div
                        key={prayer._id}
                        className="p-4 rounded-lg bg-[#0f1115] border border-stone-800 space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-stone-200 text-sm">
                              {prayer.name}
                            </span>
                            <span className="text-[10px] bg-stone-800 text-[#c5a059] border border-stone-700 px-2 py-0.5 rounded">
                              {prayer.category}
                            </span>
                            {prayer.wantsPastorCall && (
                              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-semibold">
                                Cần Mục Sư Gọi Lại
                              </span>
                            )}
                          </div>

                          <span className="text-[10px] text-stone-500 font-sans">
                            {new Date(prayer.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        {prayer.contact && (
                          <div className="text-xs text-[#c5a059] flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>Liên hệ: {prayer.contact}</span>
                          </div>
                        )}

                        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans bg-stone-900/60 p-3 rounded border border-stone-800/80">
                          &ldquo;{prayer.prayerContent}&rdquo;
                        </p>

                        <div className="flex items-center justify-between pt-2 border-t border-stone-800/60">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-stone-400">Trạng thái:</span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${prayer.status === "completed"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : prayer.status === "praying"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                    : "bg-red-950 text-red-300 border border-red-800"
                                }`}
                            >
                              {prayer.status === "completed"
                                ? "Đã Hiệp Ý & Hoàn Tất"
                                : prayer.status === "praying"
                                  ? "Đang Cầu Thay"
                                  : "Mới Gửi Đến"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {prayer.status !== "praying" && (
                              <button
                                onClick={() =>
                                  handleUpdatePrayerStatus(prayer._id, "praying")
                                }
                                className="text-xs px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-750 text-stone-300 border border-stone-700 transition-colors"
                              >
                                Đang Cầu Thay
                              </button>
                            )}
                            {prayer.status !== "completed" && (
                              <button
                                onClick={() =>
                                  handleUpdatePrayerStatus(prayer._id, "completed")
                                }
                                className="text-xs px-2.5 py-1 rounded bg-emerald-900 hover:bg-emerald-850 text-emerald-100 border border-emerald-700 transition-colors"
                              >
                                Đã Xong
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 4: SALVATION DECISIONS ================= */}
            {activeTab === "salvations" && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#c5a059]" />
                      <span>Danh Sách Thân Hữu Tiếp Nhận Chúa</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Những tấm lòng đã mở ra tiếp nhận Chúa Cứu Thế qua buổi thờ phượng trực tuyến
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      fetch("/api/admin/salvations")
                        .then((r) => r.json())
                        .then((data) => {
                          if (data.success) setSalvations(data.data || []);
                        });
                    }}
                    className="p-2 text-stone-400 hover:text-stone-200 transition-colors"
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {salvations.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 font-serif space-y-2">
                    <Sparkles className="w-8 h-8 mx-auto text-stone-600" />
                    <p className="text-sm">Chưa có thông tin thân hữu tiếp nhận Chúa được ghi nhận.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-800 border border-stone-800 rounded-lg overflow-hidden bg-[#0f1115]">
                    {salvations.map((item) => (
                      <div
                        key={item._id}
                        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-900/40 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-stone-100 text-sm">
                              {item.fullName}
                            </span>
                            <span className="text-[10px] text-stone-400 font-sans">
                              ({item.city})
                            </span>
                          </div>
                          <div className="text-xs text-[#c5a059] flex items-center gap-1.5 font-mono">
                            <Phone className="w-3.5 h-3.5 text-stone-400" />
                            <span>{item.phoneNumber}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 font-sans">
                            Thời gian quyết định:{" "}
                            {new Date(item.createdAt).toLocaleString("vi-VN")}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`text-xs px-2.5 py-1 rounded font-medium ${item.status === "discipleship"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : item.status === "contacted"
                                  ? "bg-blue-950 text-blue-300 border border-blue-800"
                                  : "bg-amber-950 text-amber-300 border border-amber-800"
                              }`}
                          >
                            {item.status === "discipleship"
                              ? "Đang Môn Đồ Hóa"
                              : item.status === "contacted"
                                ? "Đã Liên Hệ"
                                : "Cần Chăm Sóc"}
                          </span>

                          {item.status !== "contacted" && item.status !== "discipleship" && (
                            <button
                              onClick={() =>
                                handleUpdateSalvationStatus(item._id, "contacted")
                              }
                              className="text-xs px-3 py-1 rounded bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-bold transition-all shadow-sm"
                            >
                              Đã Gọi Điện
                            </button>
                          )}

                          {item.status === "contacted" && (
                            <button
                              onClick={() =>
                                handleUpdateSalvationStatus(item._id, "discipleship")
                              }
                              className="text-xs px-3 py-1 rounded bg-emerald-900 hover:bg-emerald-850 text-emerald-100 border border-emerald-700 transition-colors"
                            >
                              Gia Nhập Lớp Giáo Lý
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 5: CHAT MODERATION ================= */}
            {activeTab === "chat" && (
              <div className="space-y-6">
                <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#c5a059]" />
                      <span>Điều Phối Bình Luận Cộng Đồng</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Kiểm duyệt và loại bỏ các bình luận gây chia rẽ hoặc không phù hợp
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {chatMessages.length > 0 && (
                      <button
                        onClick={handleClearAllChatMessages}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 transition-colors cursor-pointer"
                        title="Dọn sạch toàn bộ tin nhắn phòng chat"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Dọn sạch phòng chat</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        fetch(`/api/chat?churchSlug=${encodeURIComponent(church.slug)}`)
                          .then((r) => r.json())
                          .then((data) => {
                            if (data.success) setChatMessages(data.data || []);
                          });
                      }}
                      className="p-2 text-stone-400 hover:text-stone-200 transition-colors rounded-lg bg-stone-900 border border-stone-800"
                      title="Làm mới bình luận"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {chatMessages.length === 0 ? (
                  <div className="py-12 text-center text-stone-500 font-serif space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-stone-600" />
                    <p className="text-sm">Hiện chưa có tin nhắn nào trong phòng nhóm.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-800/80 border border-stone-800 rounded-lg overflow-hidden bg-[#0f1115] max-h-[500px] overflow-y-auto">
                    {chatMessages.map((msg) => {
                      const msgId = msg._id || (msg as any).id;
                      return (
                        <div
                          key={msgId}
                          className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-900/50 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-bold text-stone-200 text-xs sm:text-sm">
                                {msg.sender}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                {msg.timestamp}
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm text-stone-300 font-sans">
                              {msg.text}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteChatMessage(msgId)}
                            className="p-2 rounded hover:bg-red-950/60 text-stone-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Xóa bình luận vi phạm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ================= TAB 6: WALL & POSTS ================= */}
            {activeTab === "wall" && (
              <div className="space-y-6">
                {/* Header Title */}
                <div className="border-b border-stone-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-[#c5a059]" />
                      <span>Quản Trị Tường & Bài Viết Mục Vụ</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Đăng thông báo, câu gốc Lời Chúa, hình ảnh sinh hoạt và quản lý trang Profile Hội Thánh
                    </p>
                  </div>

                  <Link
                    href={`/${church.slug}`}
                    target="_blank"
                    className="px-3.5 py-1.5 rounded-lg bg-stone-800 hover:bg-[#c5a059] hover:text-stone-950 text-stone-200 font-serif font-semibold text-xs flex items-center gap-1.5 border border-stone-700 hover:border-[#c5a059] transition-all cursor-pointer shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Xem Tường Thực Tế</span>
                  </Link>
                </div>

                {/* Grid 2 Columns: Create Post (Left) & Manage Posts (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Create Post Form */}
                  <form
                    onSubmit={handleCreatePost}
                    className="lg:col-span-5 bg-[#0f1115] border border-stone-800 rounded-xl p-5 space-y-4 shadow-lg self-start"
                  >
                    <div className="border-b border-stone-800 pb-3">
                      <h3 className="font-serif text-sm font-bold text-stone-100 flex items-center gap-2">
                        <Send className="w-4 h-4 text-[#c5a059]" />
                        <span>Đăng Bài Mới Lên Tường</span>
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-stone-300 font-medium">
                          Tiêu Đề Bài Viết:
                        </label>
                        <input
                          type="text"
                          required
                          value={postForm.title}
                          onChange={(e) =>
                            setPostForm({ ...postForm, title: e.target.value })
                          }
                          placeholder="Thông báo lễ phục sinh, tĩnh nguyện tuần này..."
                          className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300 font-medium">
                          Chuyên Mục Bài Viết:
                        </label>
                        <select
                          value={postForm.category}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              category: e.target.value as any,
                            })
                          }
                          className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                        >
                          <option value="announcement">Thông Báo Mục Vụ</option>
                          <option value="scripture">Lời Chúa Mỗi Ngày</option>
                          <option value="devotion">Tĩnh Nguyện & Suy Ngẫm</option>
                          <option value="sermon">Bài Giảng & Video</option>
                          <option value="fellowship">Sinh Hoạt Ban Ngành</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300 font-medium">
                          Câu Gốc Kinh Thánh Trích Dẫn (nếu có):
                        </label>
                        <input
                          type="text"
                          value={postForm.scriptureVerse}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              scriptureVerse: e.target.value,
                            })
                          }
                          placeholder="Ví dụ: Thi Thiên 23:1 hoặc Giăng 3:16"
                          className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-stone-300 font-medium">
                          Nội Dung Bài Viết:
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={postForm.content}
                          onChange={(e) =>
                            setPostForm({ ...postForm, content: e.target.value })
                          }
                          placeholder="Soạn nội dung bài chia sẻ, tâm tình hoặc thông báo chi tiết đến tín hữu..."
                          className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059] resize-none"
                        />
                      </div>

                      {/* Image Upload Box with WebP compression */}
                      <ImageUploadBox
                        type="post"
                        value={postForm.imageUrl}
                        onChange={(url) => setPostForm({ ...postForm, imageUrl: url })}
                        label="Hình Ảnh Đính Kèm Bài Viết"
                      />

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="isPinnedCheck"
                          checked={postForm.isPinned}
                          onChange={(e) =>
                            setPostForm({
                              ...postForm,
                              isPinned: e.target.checked,
                            })
                          }
                          className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-[#c5a059] focus:ring-0"
                        />
                        <label
                          htmlFor="isPinnedCheck"
                          className="text-xs text-stone-300 select-none cursor-pointer flex items-center gap-1"
                        >
                          <Pin className="w-3 h-3 text-amber-400" />
                          <span>Ghim bài viết này lên đầu Tường Hội Thánh</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={isPosting}
                        className="w-full py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isPosting ? "Đang đăng bài..." : "Đăng Lên Tường Hội Thánh"}</span>
                      </button>
                    </div>
                  </form>

                  {/* Right Column: Manage Existing Posts */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="font-serif text-sm font-bold text-stone-100">
                        Bài Viết Đã Đăng ({wallPosts.length})
                      </h3>
                      <button
                        onClick={() => {
                          fetch("/api/admin/posts")
                            .then((r) => r.json())
                            .then((d) => {
                              if (d.success) setWallPosts(d.data || []);
                            });
                        }}
                        className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Làm mới</span>
                      </button>
                    </div>

                    {wallPosts.length === 0 ? (
                      <div className="bg-[#0f1115] border border-stone-800 rounded-xl p-10 text-center space-y-2">
                        <Newspaper className="w-8 h-8 text-stone-600 mx-auto" />
                        <p className="text-xs text-stone-400">
                          Chưa có bài viết nào trên Tường. Hãy sử dụng form bên trái để đăng bài đầu tiên!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
                        {wallPosts.map((post) => (
                          <div
                            key={post._id}
                            className="bg-[#0f1115] border border-stone-800 rounded-xl p-4 space-y-2.5 shadow-md"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {post.isPinned && (
                                    <span className="flex items-center gap-1 px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-serif font-bold">
                                      <Pin className="w-2.5 h-2.5" />
                                      <span>Ghim</span>
                                    </span>
                                  )}
                                  <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.2 rounded-full">
                                    {post.category}
                                  </span>
                                  <span className="text-[10px] text-stone-500 font-mono">
                                    {new Date(post.createdAt).toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>

                                <h4 className="font-serif font-bold text-sm text-stone-100 mt-1 line-clamp-1">
                                  {post.title}
                                </h4>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleTogglePinPost(post._id, post.isPinned)}
                                  className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${post.isPinned
                                      ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
                                    }`}
                                  title={post.isPinned ? "Bỏ ghim" : "Ghim lên đầu Tường"}
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeletePost(post._id)}
                                  className="p-1.5 rounded text-stone-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Xóa bài viết này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                              {post.content}
                            </p>

                            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-800/80">
                              <span className="flex items-center gap-1.5 text-[#c5a059]">
                                <AmenIcon className="w-3.5 h-3.5 text-[#c5a059]" filled />
                                <span>{post.likesCount || 0} Amen</span>
                              </span>
                              <span>{post.comments?.length || 0} bình luận</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 7: GIVING & SETTINGS ================= */}
            {activeTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="border-b border-stone-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-stone-100 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#c5a059]" />
                      <span>Cấu Hình Dâng Hiến & Thông Tin Hội Thánh</span>
                    </h2>
                    <p className="text-xs text-stone-400">
                      Tự động tạo mã VietQR dâng hiến và hiển thị thông tin giới thiệu
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? "Đang lưu..." : "Lưu Thông Tin"}</span>
                  </button>
                </div>

                {/* Banking section */}
                <div className="p-4 sm:p-5 rounded-lg bg-[#0f1115] border border-stone-800 space-y-4">
                  <h3 className="font-serif text-sm font-semibold text-[#c5a059]">
                    Tài Khoản Tiếp Nhận Dâng Hiến (Tự Động Sinh Mã VietQR)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Ngân Hàng Tiếp Nhận:
                      </label>
                      <input
                        type="text"
                        value={bankForm.bankName}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, bankName: e.target.value })
                        }
                        placeholder="MB Bank, Vietcombank, Techcombank..."
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Số Tài Khoản:
                      </label>
                      <input
                        type="text"
                        value={bankForm.accountNumber}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, accountNumber: e.target.value })
                        }
                        placeholder="0386888999"
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 font-mono focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Tên Chủ Tài Khoản:
                      </label>
                      <input
                        type="text"
                        value={bankForm.accountHolder}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, accountHolder: e.target.value })
                        }
                        placeholder="HOI THANH TIN LANH..."
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 uppercase focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Chi Nhánh:
                      </label>
                      <input
                        type="text"
                        value={bankForm.branch}
                        onChange={(e) =>
                          setBankForm({ ...bankForm, branch: e.target.value })
                        }
                        placeholder="Chi nhánh TP. Hồ Chí Minh"
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>
                  </div>
                </div>

                {/* Church General Info */}
                <div className="p-4 sm:p-5 rounded-lg bg-[#0f1115] border border-stone-800 space-y-4">
                  <h3 className="font-serif text-sm font-semibold text-[#c5a059]">
                    Thông Tin Hành Chính Hội Thánh
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Tên Hội Thánh:
                      </label>
                      <input
                        type="text"
                        value={churchInfoForm.name}
                        onChange={(e) =>
                          setChurchInfoForm({
                            ...churchInfoForm,
                            name: e.target.value,
                          })
                        }
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Giáo Hạt / Hệ Phái:
                      </label>
                      <input
                        type="text"
                        value={churchInfoForm.denomination}
                        onChange={(e) =>
                          setChurchInfoForm({
                            ...churchInfoForm,
                            denomination: e.target.value,
                          })
                        }
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-stone-300 font-medium">
                          Địa Chỉ Nhà Thờ / Văn Phòng:
                        </label>
                        {churchInfoForm.address && (
                          <a
                            href={getChurchGoogleMapsUrl(churchInfoForm.address, churchInfoForm.name, profileForm.googleMapUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#c5a059] hover:underline flex items-center gap-1 cursor-pointer"
                            title="Mở Google Maps và kiểm tra vị trí"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Mở Google Maps</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                      <input
                        type="text"
                        value={churchInfoForm.address}
                        onChange={(e) =>
                          setChurchInfoForm({
                            ...churchInfoForm,
                            address: e.target.value,
                          })
                        }
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Multi-Schedule Management */}
                    <div className="space-y-3 sm:col-span-2 p-3.5 rounded-xl bg-[#14161a] border border-stone-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs text-[#c5a059] font-serif font-bold uppercase tracking-wider block">
                            Danh Sách Các Giờ Lễ & Sinh Hoạt Trong Tuần
                          </label>
                          <span className="text-[11px] text-stone-400">
                            Thêm nhiều khung giờ cho các buổi lễ của Hội Thánh (Lễ 1, Lễ 2, Cầu nguyện, Ban Thanh Niên...)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newSchedules = [
                              ...(churchInfoForm.worshipSchedules || []),
                              {
                                id: String(Date.now()),
                                title: `Lễ Thờ Phượng ${(churchInfoForm.worshipSchedules?.length || 0) + 1}`,
                                dayOfWeek: "Chúa Nhật",
                                time: "08:00 - 09:30",
                                type: "main",
                                description: "",
                              },
                            ];
                            const summary = newSchedules.map((s) => `${s.dayOfWeek}: ${s.title} (${s.time})`).join(" • ");
                            setChurchInfoForm({
                              ...churchInfoForm,
                              worshipSchedules: newSchedules,
                              liveSchedule: summary,
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#c5a059]/20 hover:bg-[#c5a059]/30 text-[#c5a059] border border-[#c5a059]/40 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm Buổi Lễ Mới</span>
                        </button>
                      </div>

                      {/* Schedule Items List */}
                      {churchInfoForm.worshipSchedules && churchInfoForm.worshipSchedules.length > 0 ? (
                        <div className="space-y-2">
                          {churchInfoForm.worshipSchedules.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2"
                            >
                              <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-12 sm:col-span-3">
                                  <label className="text-[10px] text-stone-400 block mb-0.5">Ngày trong tuần</label>
                                  <select
                                    value={item.dayOfWeek}
                                    onChange={(e) => {
                                      const updated = [...(churchInfoForm.worshipSchedules || [])];
                                      updated[idx] = { ...updated[idx], dayOfWeek: e.target.value };
                                      const summary = updated.map((s) => `${s.dayOfWeek}: ${s.title} (${s.time})`).join(" • ");
                                      setChurchInfoForm({ ...churchInfoForm, worshipSchedules: updated, liveSchedule: summary });
                                    }}
                                    className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-[#c5a059]"
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

                                <div className="col-span-12 sm:col-span-3">
                                  <label className="text-[10px] text-stone-400 block mb-0.5">Khung giờ</label>
                                  <input
                                    type="text"
                                    value={item.time}
                                    onChange={(e) => {
                                      const updated = [...(churchInfoForm.worshipSchedules || [])];
                                      updated[idx] = { ...updated[idx], time: e.target.value };
                                      const summary = updated.map((s) => `${s.dayOfWeek}: ${s.title} (${s.time})`).join(" • ");
                                      setChurchInfoForm({ ...churchInfoForm, worshipSchedules: updated, liveSchedule: summary });
                                    }}
                                    placeholder="08:00 - 09:30"
                                    className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                                  />
                                </div>

                                <div className="col-span-10 sm:col-span-5">
                                  <label className="text-[10px] text-stone-400 block mb-0.5">Tên chương trình / Buổi lễ</label>
                                  <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                      const updated = [...(churchInfoForm.worshipSchedules || [])];
                                      updated[idx] = { ...updated[idx], title: e.target.value };
                                      const summary = updated.map((s) => `${s.dayOfWeek}: ${s.title} (${s.time})`).join(" • ");
                                      setChurchInfoForm({ ...churchInfoForm, worshipSchedules: updated, liveSchedule: summary });
                                    }}
                                    placeholder="Lễ Thờ Phượng 1..."
                                    className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-2.5 py-1.5 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059]"
                                  />
                                </div>

                                <div className="col-span-2 sm:col-span-1 flex items-end justify-center pb-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = (churchInfoForm.worshipSchedules || []).filter((_, i) => i !== idx);
                                      const summary = updated.map((s) => `${s.dayOfWeek}: ${s.title} (${s.time})`).join(" • ");
                                      setChurchInfoForm({ ...churchInfoForm, worshipSchedules: updated, liveSchedule: summary });
                                    }}
                                    className="p-1.5 text-stone-400 hover:text-red-400 transition-colors cursor-pointer"
                                    title="Xóa giờ lễ này"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-lg bg-stone-900 border border-dashed border-stone-700 text-center space-y-1">
                          <p className="text-xs text-stone-400">
                            Chưa thiết lập nhiều giờ lễ. Hệ thống đang dùng chuỗi tóm tắt:
                          </p>
                          <p className="text-xs text-gold-300 font-mono">
                            {churchInfoForm.liveSchedule || "Chưa có lịch"}
                          </p>
                        </div>
                      )}

                      <div className="pt-1">
                        <label className="text-[10px] text-stone-400 block mb-0.5">
                          Tóm tắt hiển thị trực tiếp (Live Schedule Text):
                        </label>
                        <input
                          type="text"
                          value={churchInfoForm.liveSchedule}
                          onChange={(e) =>
                            setChurchInfoForm({
                              ...churchInfoForm,
                              liveSchedule: e.target.value,
                            })
                          }
                          className="w-full bg-[#0f1115] border border-stone-800 rounded-lg px-3 py-1.5 text-xs text-stone-300 focus:outline-none focus:border-[#c5a059]"
                          placeholder="Chúa Nhật: Lễ 1 (08:00) • Lễ 2 (09:30)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Wall & Cover Configuration */}
                <div className="p-4 sm:p-5 rounded-lg bg-[#0f1115] border border-stone-800 space-y-4">
                  <h3 className="font-serif text-sm font-semibold text-[#c5a059]">
                    Cấu Hình Tường Profile & Nhận Diện Hội Thánh
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs text-stone-300 font-medium">
                        Khẩu Hiệu / Slogan Hội Thánh:
                      </label>
                      <input
                        type="text"
                        value={profileForm.slogan}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, slogan: e.target.value })
                        }
                        placeholder="Hiệp Một — Yêu Thương — Phụng Sự"
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <ImageUploadBox
                        type="cover"
                        value={profileForm.coverImageUrl}
                        onChange={(url) => setProfileForm({ ...profileForm, coverImageUrl: url })}
                        label="Ảnh Bìa Tường Hội Thánh (Cover Image)"
                      />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <ImageUploadBox
                        type="avatar"
                        value={profileForm.avatarUrl}
                        onChange={(url) => setProfileForm({ ...profileForm, avatarUrl: url })}
                        label="Ảnh Đại Diện / Biểu Trưng (Avatar)"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Mục Sư Quản Nhiệm:
                      </label>
                      <input
                        type="text"
                        value={profileForm.leadPastor}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, leadPastor: e.target.value })
                        }
                        placeholder="Mục sư..."
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Hotline Liên Hệ:
                      </label>
                      <input
                        type="text"
                        value={profileForm.contactPhone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, contactPhone: e.target.value })
                        }
                        placeholder="028 3822 5566"
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-stone-300 font-medium">
                        Email Mục Vụ:
                      </label>
                      <input
                        type="email"
                        value={profileForm.contactEmail}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, contactEmail: e.target.value })
                        }
                        placeholder="mucvu@hoithanh.vn"
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-stone-300 font-medium">
                          Link Google Maps Ghim Vị Trí (Tùy Chọn):
                        </label>
                        <span className="text-[11px] text-stone-500 font-normal">
                          Để trống hệ thống sẽ tự động tạo link theo địa chỉ Hội Thánh
                        </span>
                      </div>
                      <input
                        type="url"
                        value={profileForm.googleMapUrl}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, googleMapUrl: e.target.value })
                        }
                        placeholder="https://maps.app.goo.gl/... hoặc https://goo.gl/maps/..."
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 focus:outline-none focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs text-stone-300 font-medium">
                        Lời Giới Thiệu / Về Hội Thánh:
                      </label>
                      <textarea
                        rows={3}
                        value={profileForm.about}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, about: e.target.value })
                        }
                        placeholder="Giới thiệu sứ mạng, lịch sử và tâm tình phục vụ của Hội Thánh..."
                        className="w-full bg-[#14161a] border border-stone-700 rounded-lg px-3.5 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-[#c5a059] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </main>
        </div>
      </div>
    </WorshipProvider>
  );
}
