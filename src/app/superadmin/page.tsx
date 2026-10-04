"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Crown,
  Church as ChurchIcon,
  Radio,
  Newspaper,
  Users,
  Settings,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  LogOut,
  Sparkles,
  Lock,
  Mail,
  Key,
  Calendar,
  MapPin,
  Heart,
  MessageCircle,
  Pin,
  Play,
  Square,
  Sliders,
  Database,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Filter,
} from "lucide-react";

interface SuperAdminKPIs {
  totalChurches: number;
  activeChurches: number;
  inactiveChurches: number;
  liveChurchesCount: number;
  totalViewers: number;
  totalPosts: number;
  pinnedPostsCount: number;
  totalLikes: number;
  totalComments: number;
  totalUsers: number;
  totalPrayers: number;
}

interface ChurchItem {
  _id: string;
  name: string;
  slug: string;
  denomination: string;
  address: string;
  streamKey: string;
  liveSchedule: string;
  isActive: boolean;
  isLive?: boolean;
  viewersCount?: number;
  liveTitle?: string;
  leadPastor?: string;
  postCount?: number;
  adminCount?: number;
  profileConfig?: {
    coverImageUrl?: string;
    avatarUrl?: string;
    slogan?: string;
    about?: string;
    leadPastor?: string;
  };
  bankingConfig?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
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
}

interface PostItem {
  _id: string;
  churchSlug: string;
  churchName: string;
  churchDenomination?: string;
  churchAvatar?: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  likesCount: number;
  comments: any[];
  scriptureVerse?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
}

interface UserItem {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  churchSlug: string;
  churchName?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export default function SuperAdminPage() {
  const router = useRouter();

  // Auth state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState("superadmin@church.vn");
  const [loginPassword, setLoginPassword] = useState("SuperAdmin@2026");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "churches" | "posts" | "users" | "broadcasts" | "maintenance"
  >("overview");

  // Dashboard Data
  const [kpis, setKpis] = useState<SuperAdminKPIs | null>(null);
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [postCategoryFilter, setPostCategoryFilter] = useState("all");
  const [churchSlugFilter, setChurchSlugFilter] = useState("all");

  // Modals state
  const [showChurchModal, setShowChurchModal] = useState(false);
  const [editingChurch, setEditingChurch] = useState<ChurchItem | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  // Reseed state
  const [isReseeding, setIsReseeding] = useState(false);

  // Church Form
  const [churchForm, setChurchForm] = useState({
    name: "",
    slug: "",
    denomination: "Hội Thánh Tin Lành Việt Nam",
    address: "",
    streamKey: "",
    liveSchedule: "Chúa Nhật, 08:30 - 11:00",
    leadPastor: "Mục sư Quản Nhiệm",
    slogan: "Nơi Lời Chúa Đem Lại Sự Sống & Hy Vọng Mới",
    about: "Hội Thánh được thành lập để rao truyền tình yêu thương và lẽ thật của Đức Chúa Trời.",
    bankName: "MB Bank",
    accountNumber: "0386888999",
    accountHolder: "",
    isActive: true,
  });

  // Post Form
  const [postForm, setPostForm] = useState({
    churchSlug: "loibansusong",
    title: "",
    content: "",
    category: "announcement",
    scriptureVerse: "",
    imageUrl: "",
    videoUrl: "",
    isPinned: false,
    authorName: "Ban Tổng Quản Trị Hệ Thống",
    authorRole: "Superadmin",
  });

  // User Form
  const [userForm, setUserForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "pastor",
    churchSlug: "loibansusong",
    phone: "",
  });

  // Check login status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.user && json.data.user.role === "superadmin") {
          setCurrentUser(json.data.user);
          loadAllData();
        } else {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Đăng nhập thất bại");
      }

      if (json.data?.user?.role !== "superadmin") {
        throw new Error("Tài khoản này không có quyền Tổng Quản Trị (Superadmin).");
      }

      setCurrentUser(json.data.user);
      loadAllData();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [statsRes, churchesRes, postsRes, usersRes] = await Promise.all([
        fetch("/api/superadmin/stats"),
        fetch("/api/superadmin/churches"),
        fetch("/api/superadmin/posts"),
        fetch("/api/superadmin/users"),
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success) setKpis(statsJson.data.kpis);
      }
      if (churchesRes.ok) {
        const churchesJson = await churchesRes.json();
        if (churchesJson.success) setChurches(churchesJson.data);
      }
      if (postsRes.ok) {
        const postsJson = await postsRes.json();
        if (postsJson.success) setPosts(postsJson.data);
      }
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        if (usersJson.success) setUsers(usersJson.data);
      }
    } catch (err) {
      console.error("Lỗi nạp dữ liệu Superadmin:", err);
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 4000);
  };

  // Toggle Live for any church
  const handleToggleBroadcast = async (
    churchSlug: string,
    currentLive: boolean,
    serviceTitle?: string
  ) => {
    try {
      const action = currentLive ? "stop" : "start";
      const res = await fetch("/api/superadmin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug,
          action,
          title: serviceTitle || "Lễ Thờ Phượng Chúa Nhật Trực Tuyến",
          viewersCount: currentLive ? 0 : 250,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Lỗi thao tác");

      showNotification(json.message);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Toggle Church Active status
  const handleToggleChurchActive = async (church: ChurchItem) => {
    try {
      const res = await fetch("/api/superadmin/churches", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchId: church._id,
          isActive: !church.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(`Đã ${!church.isActive ? "kích hoạt" : "tạm dừng"} ${church.name}`);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Delete Church
  const handleDeleteChurch = async (church: ChurchItem) => {
    const confirmed = confirm(
      `CẢNH BÁO NGUY HIỂM: Bạn có chắc chắn muốn XÓA VĨNH VIỄN Hội Thánh '${church.name}' (/${church.slug}) không?\nHành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/superadmin/churches?id=${church._id}&deleteContent=true`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(json.message);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Toggle Post Pinned
  const handleTogglePostPin = async (post: PostItem) => {
    try {
      const res = await fetch("/api/superadmin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post._id,
          isPinned: !post.isPinned,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(`Đã ${!post.isPinned ? "ghim" : "bỏ ghim"} bài viết`);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Delete Post
  const handleDeletePost = async (post: PostItem) => {
    const confirmed = confirm(`Bạn có chắc chắn muốn xóa bài viết "${post.title}"?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/superadmin/posts?postId=${post._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(json.message);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Toggle User Active
  const handleToggleUserActive = async (user: UserItem) => {
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          isActive: !user.isActive,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(`Đã ${!user.isActive ? "kích hoạt" : "tạm khóa"} tài khoản ${user.email}`);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Change User Role
  const handleChangeUserRole = async (user: UserItem, newRole: string) => {
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          role: newRole,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(`Đã đổi vai trò của ${user.fullName} thành ${newRole}`);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Reset User Password
  const handleResetPassword = async () => {
    if (!resetPasswordUserId || !newPasswordValue.trim()) return;

    try {
      const res = await fetch("/api/superadmin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: resetPasswordUserId,
          password: newPasswordValue.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification("Đã đặt lại mật khẩu mới thành công!");
      setResetPasswordUserId(null);
      setNewPasswordValue("");
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Save Church (Create or Edit)
  const handleSaveChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingChurch) {
        // Update
        const res = await fetch("/api/superadmin/churches", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            churchId: editingChurch._id,
            name: churchForm.name,
            denomination: churchForm.denomination,
            address: churchForm.address,
            streamKey: churchForm.streamKey,
            liveSchedule: churchForm.liveSchedule,
            isActive: churchForm.isActive,
            profileConfig: {
              leadPastor: churchForm.leadPastor,
              slogan: churchForm.slogan,
              about: churchForm.about,
            },
            bankingConfig: {
              bankName: churchForm.bankName,
              accountNumber: churchForm.accountNumber,
              accountHolder: churchForm.accountHolder,
            },
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        showNotification(json.message);
      } else {
        // Create
        const res = await fetch("/api/superadmin/churches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(churchForm),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        showNotification(json.message);
      }

      setShowChurchModal(false);
      setEditingChurch(null);
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Save Post
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(json.message);
      setShowPostModal(false);
      setPostForm({
        churchSlug: "loibansusong",
        title: "",
        content: "",
        category: "announcement",
        scriptureVerse: "",
        imageUrl: "",
        videoUrl: "",
        isPinned: false,
        authorName: "Ban Tổng Quản Trị Hệ Thống",
        authorRole: "Superadmin",
      });
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Save User
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/superadmin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification(json.message);
      setShowUserModal(false);
      setUserForm({
        fullName: "",
        email: "",
        password: "",
        role: "pastor",
        churchSlug: "loibansusong",
        phone: "",
      });
      loadAllData();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  // Run Reseed
  const handleReseedData = async () => {
    const confirmed = confirm(
      "Bạn có chắc muốn chạy lại kịch bản Khởi Tạo Dữ Liệu Mẫu (Reseed)?\nToàn bộ 6 Hội Thánh và các bài đăng phong phú sẽ được cập nhật đồng bộ lại."
    );
    if (!confirmed) return;

    try {
      setIsReseeding(true);
      const res = await fetch("/api/superadmin/reseed", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      showNotification("Đã khởi tạo lại dữ liệu mẫu đa dạng thành công!");
      loadAllData();
    } catch (err: any) {
      alert("Lỗi reseed: " + err.message);
    } finally {
      setIsReseeding(false);
    }
  };

  // Open edit modal for church
  const openEditChurch = (church: ChurchItem) => {
    setEditingChurch(church);
    setChurchForm({
      name: church.name,
      slug: church.slug,
      denomination: church.denomination,
      address: church.address,
      streamKey: church.streamKey,
      liveSchedule: church.liveSchedule || "Chúa Nhật, 08:30 - 11:00",
      leadPastor: church.profileConfig?.leadPastor || "Mục sư Quản Nhiệm",
      slogan: church.profileConfig?.slogan || "Hiệp Một — Yêu Thương — Phụng Sự",
      about: church.profileConfig?.about || "",
      bankName: church.bankingConfig?.bankName || "MB Bank",
      accountNumber: church.bankingConfig?.accountNumber || "0386888999",
      accountHolder: church.bankingConfig?.accountHolder || church.name,
      isActive: church.isActive,
    });
    setShowChurchModal(true);
  };

  // Filtered churches
  const filteredChurches = churches.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.slug.toLowerCase().includes(term) ||
      c.denomination.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
  });

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesTerm =
      p.title.toLowerCase().includes(term) ||
      p.content.toLowerCase().includes(term) ||
      p.churchName.toLowerCase().includes(term);

    const matchesCat =
      postCategoryFilter === "all" || p.category === postCategoryFilter;
    const matchesChurch =
      churchSlugFilter === "all" || p.churchSlug === churchSlugFilter;

    return matchesTerm && matchesCat && matchesChurch;
  });

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.churchSlug.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  });

  // =========================================================================
  // VIEW 1: SUPERADMIN AUTHENTICATION GATE (MÀN HÌNH ĐĂNG NHẬP BẢO MẬT)
  // =========================================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#06080c] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-12 h-12 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
          <span className="font-serif text-gold-300 text-sm tracking-wider">
            Đang xác thực quyền Tổng Quản Trị...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#06080d] via-[#090d14] to-[#040608] flex items-center justify-center p-4 selection:bg-gold-500/30 selection:text-gold-200">
        <div className="w-full max-w-md bg-[#0d121c]/90 border border-gold-400/40 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Subtle gold decorative glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-gold-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-gold-500 to-amber-300 text-sanctuary-950 flex items-center justify-center mx-auto shadow-candle border border-gold-200">
              <Crown className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-gold-400 uppercase font-bold px-2.5 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/30">
                SYSTEM ROOT PRIVILEGES
              </span>
              <h1 className="font-serif text-2xl font-bold text-white mt-1.5">
                Cổng Tổng Quản Trị
              </h1>
              <p className="text-xs text-sanctuary-300 font-sans mt-1">
                Toàn quyền giám sát & điều hành các Hội Thánh trên toàn quốc
              </p>
            </div>
          </div>

          {loginError && (
            <div className="mt-5 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-serif font-medium text-sanctuary-200 flex items-center justify-between">
                <span>Email Tổng Quản Trị</span>
                <span className="text-[11px] text-gold-400 font-mono">superadmin@church.vn</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-sanctuary-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="superadmin@church.vn"
                  className="w-full bg-[#131926] border border-white/[0.08] focus:border-gold-400/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-sanctuary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-serif font-medium text-sanctuary-200 flex items-center justify-between">
                <span>Mật khẩu tối cao</span>
                <span className="text-[11px] text-gold-400 font-mono">SuperAdmin@2026</span>
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-sanctuary-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#131926] border border-white/[0.08] focus:border-gold-400/70 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-sanctuary-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 hover:from-gold-300 hover:to-amber-300 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm shadow-candle transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực thông tin...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>Đăng Nhập Quyền Superadmin</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Button */}
          <div className="mt-5 pt-4 border-t border-white/[0.08] text-center space-y-2 relative z-10">
            <button
              type="button"
              onClick={() => {
                setLoginEmail("superadmin@church.vn");
                setLoginPassword("SuperAdmin@2026");
                handleLogin();
              }}
              className="w-full py-2 px-3 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-300 border border-gold-400/30 text-xs font-serif flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span>⚡ Đăng Nhập Nhanh Bằng Tài Khoản Mẫu</span>
            </button>

            <Link
              href="/"
              className="inline-block text-[11px] text-sanctuary-400 hover:text-white transition-colors"
            >
              ← Quay lại Cổng Thờ Phượng công khai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: THE MAIN SUPERADMIN MASTER DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#070a10] text-sanctuary-100 flex flex-col font-sans selection:bg-gold-400/25 selection:text-gold-200">
      {/* Action Notification Toast */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161c28] border border-gold-400/50 text-gold-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-serif animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. SUPERADMIN MASTER HEADER BAR                                       */}
      {/* ===================================================================== */}
      <header className="w-full bg-[#0b1018]/95 border-b border-white/[0.08] px-4 sm:px-6 py-2.5 sticky top-0 z-40 backdrop-blur-xl shadow-lg flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-gold-400 text-sanctuary-950 flex items-center justify-center shadow-candle border border-gold-200 shrink-0">
            <Crown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm sm:text-base text-white">
                Superadmin Portal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-red-600/90 text-white uppercase tracking-wider">
                TOÀN QUYỀN HỆ THỐNG
              </span>
            </div>
            <span className="text-[11px] text-gold-400/90 font-serif block">
              Tổng Quản Trị Cổng Thờ Phượng Trực Tuyến Việt Nam
            </span>
          </div>
        </div>

        {/* Center: Live Streams Indicator & Search */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-sanctuary-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm Hội Thánh, bài viết, người dùng..."
              className="w-full bg-[#121824] border border-white/[0.08] focus:border-gold-400/60 rounded-full pl-8 pr-3 py-1.5 text-xs text-white placeholder-sanctuary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right: Quick Links, Refresh & User profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={loadingData}
            className="p-2 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-white border border-white/10 transition-colors"
            title="Làm mới toàn bộ dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin text-gold-400" : ""}`} />
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-200 border border-white/10 text-xs font-serif transition-colors"
            title="Mở cổng xem công khai"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gold-400" />
            <span>Trang Chủ</span>
          </Link>

          <Link
            href="/admin"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-200 border border-white/10 text-xs font-serif transition-colors"
            title="Chuyển sang trang Quản trị Mục sư"
          >
            <ChurchIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Mục Vụ</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-serif transition-colors cursor-pointer"
            title="Đăng xuất khỏi phiên Tổng Quản Trị"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. SUB-HEADER NAVIGATION TABS                                         */}
      {/* ===================================================================== */}
      <nav className="w-full bg-[#0e131d] border-b border-white/[0.08] px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 text-xs font-serif">
        {[
          { id: "overview", label: "📊 Tổng Quan Hệ Thống", badge: null },
          {
            id: "churches",
            label: "🏛️ Quản Lý Hội Thánh",
            badge: churches.length,
          },
          {
            id: "broadcasts",
            label: "🔴 Điều Khiển Phát Sóng",
            badge: kpis?.liveChurchesCount || 0,
            badgeLive: true,
          },
          { id: "posts", label: "📰 Bài Đăng & Kiểm Duyệt", badge: posts.length },
          { id: "users", label: "👥 Người Dùng & Phân Quyền", badge: users.length },
          { id: "maintenance", label: "⚙️ CSDL & Bảo Trì", badge: null },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 cursor-pointer font-medium ${activeTab === tab.id
              ? "bg-gold-400 text-sanctuary-950 font-bold shadow-sm"
              : "text-sanctuary-300 hover:text-white hover:bg-sanctuary-850 border border-transparent"
              }`}
          >
            <span>{tab.label}</span>
            {tab.badge !== null && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${tab.badgeLive
                  ? "bg-red-600 text-white animate-pulse"
                  : activeTab === tab.id
                    ? "bg-sanctuary-950 text-gold-300"
                    : "bg-sanctuary-800 text-sanctuary-300"
                  }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ===================================================================== */}
      {/* 3. MAIN WORKSPACE                                                     */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* =================================================================== */}
        {/* TAB 1: TỔNG QUAN HỆ THỐNG (KPI DASHBOARD)                           */}
        {/* =================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-[#0f1420] border border-white/[0.08] hover:border-gold-400/40 p-4 rounded-2xl space-y-2 transition-all">
                <div className="flex items-center justify-between text-sanctuary-400">
                  <span className="text-[11px] font-serif uppercase tracking-wider">Hội Thánh</span>
                  <ChurchIcon className="w-4 h-4 text-gold-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                  {kpis?.totalChurches || churches.length}
                </div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{kpis?.activeChurches || churches.length} đang hoạt động</span>
                </span>
              </div>

              <div className="bg-[#0f1420] border border-red-500/30 p-4 rounded-2xl space-y-2 transition-all shadow-sm">
                <div className="flex items-center justify-between text-red-400">
                  <span className="text-[11px] font-serif uppercase tracking-wider font-bold">Trực Tiếp</span>
                  <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-red-400">
                  {kpis?.liveChurchesCount || 0}
                </div>
                <span className="text-[10px] text-sanctuary-300 font-sans">
                  {kpis?.totalViewers || 0} tín hữu đang xem
                </span>
              </div>

              <div className="bg-[#0f1420] border border-white/[0.08] hover:border-gold-400/40 p-4 rounded-2xl space-y-2 transition-all">
                <div className="flex items-center justify-between text-sanctuary-400">
                  <span className="text-[11px] font-serif uppercase tracking-wider">Bài Đăng</span>
                  <Newspaper className="w-4 h-4 text-amber-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                  {kpis?.totalPosts || posts.length}
                </div>
                <span className="text-[10px] text-sanctuary-400 font-sans">
                  {kpis?.pinnedPostsCount || 0} bài ghim đầu trang
                </span>
              </div>

              <div className="bg-[#0f1420] border border-white/[0.08] hover:border-gold-400/40 p-4 rounded-2xl space-y-2 transition-all">
                <div className="flex items-center justify-between text-sanctuary-400">
                  <span className="text-[11px] font-serif uppercase tracking-wider">Hiệp Nguyện</span>
                  <Heart className="w-4 h-4 text-pink-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                  {kpis?.totalLikes || 0}
                </div>
                <span className="text-[10px] text-sanctuary-400 font-sans">Lượt Amen & Yêu thương</span>
              </div>

              <div className="bg-[#0f1420] border border-white/[0.08] hover:border-gold-400/40 p-4 rounded-2xl space-y-2 transition-all">
                <div className="flex items-center justify-between text-sanctuary-400">
                  <span className="text-[11px] font-serif uppercase tracking-wider">Bình Luận</span>
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                  {kpis?.totalComments || 0}
                </div>
                <span className="text-[10px] text-sanctuary-400 font-sans">Lời chúc phước</span>
              </div>

              <div className="bg-[#0f1420] border border-white/[0.08] hover:border-gold-400/40 p-4 rounded-2xl space-y-2 transition-all">
                <div className="flex items-center justify-between text-sanctuary-400">
                  <span className="text-[11px] font-serif uppercase tracking-wider">Tài Khoản</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-white">
                  {kpis?.totalUsers || users.length}
                </div>
                <span className="text-[10px] text-sanctuary-400 font-sans">Mục sư & Ban kỹ thuật</span>
              </div>
            </div>

            {/* Switchboard: Currently Live Broadcasts */}
            <div className="bg-[#0e131d] border border-white/[0.08] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <h3 className="font-serif text-base font-bold text-white">
                    Trung Tâm Giám Sát Phát Sóng Trực Tiếp
                  </h3>
                </div>
                <span className="text-xs text-sanctuary-400">
                  {churches.filter((c) => c.isLive).length} phòng đang phát sóng trực tiếp
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {churches.map((church) => {
                  const isLive = Boolean(church.currentService?.isLive ?? church.isLive);
                  return (
                    <div
                      key={church._id}
                      className={`p-4 rounded-xl border transition-all ${isLive
                        ? "bg-red-950/20 border-red-500/40 shadow-sm"
                        : "bg-[#121722] border-white/[0.06]"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] text-gold-400 font-serif block">
                            {church.denomination}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-white truncate">
                            {church.name}
                          </h4>
                          <span className="text-xs text-sanctuary-400 font-mono block">
                            /{church.slug} • Khóa: {church.streamKey}
                          </span>
                        </div>
                        {isLive ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-600 text-white uppercase animate-pulse shrink-0">
                            🔴 LIVE ({church.currentService?.viewersCount || 100})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-sanctuary-800 text-sanctuary-400 shrink-0">
                            Ngoại tuyến
                          </span>
                        )}
                      </div>

                      {isLive && (
                        <p className="text-xs text-sanctuary-200 mt-2 italic font-serif truncate">
                          Chủ đề: &ldquo;{church.currentService?.title || "Lễ Chúa Nhật"}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.06]">
                        <button
                          onClick={() =>
                            handleToggleBroadcast(
                              church.slug,
                              isLive,
                              church.currentService?.title
                            )
                          }
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-serif font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${isLive
                            ? "bg-red-600/80 hover:bg-red-600 text-white"
                            : "bg-emerald-600/80 hover:bg-emerald-600 text-white"
                            }`}
                        >
                          {isLive ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Cưỡng chế TẮT Live</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>BẬT Live mẫu</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/${church.slug}?view=sanctuary`}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-white transition-colors"
                          title="Mở phòng thờ phượng"
                        >
                          <Eye className="w-4 h-4 text-gold-400" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Action Bar for Superadmin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setEditingChurch(null);
                  setChurchForm({
                    name: "",
                    slug: "",
                    denomination: "Hội Thánh Tin Lành Việt Nam",
                    address: "Việt Nam",
                    streamKey: "",
                    liveSchedule: "Chúa Nhật, 08:30 - 11:00",
                    leadPastor: "Mục sư Quản Nhiệm",
                    slogan: "Nơi Lời Chúa Đem Lại Sự Sống Đời Đời",
                    about: "",
                    bankName: "MB Bank",
                    accountNumber: "0386888999",
                    accountHolder: "",
                    isActive: true,
                  });
                  setShowChurchModal(true);
                }}
                className="p-4 rounded-2xl bg-gradient-to-br from-gold-500/10 to-amber-700/10 border border-gold-400/30 hover:border-gold-400/60 transition-all text-left flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-400 text-sanctuary-950 flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">Thêm Hội Thánh Mới</h4>
                  <p className="text-xs text-sanctuary-400">Đăng ký phòng trực tuyến cho Hội Thánh chi hội</p>
                </div>
              </button>

              <button
                onClick={() => setShowPostModal(true)}
                className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-700/10 border border-blue-400/30 hover:border-blue-400/60 transition-all text-left flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">Đăng Thông Báo Hệ Thống</h4>
                  <p className="text-xs text-sanctuary-400">Phát thông điệp đến toàn bộ con cái Chúa & tín hữu</p>
                </div>
              </button>

              <button
                onClick={() => setShowUserModal(true)}
                className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-700/10 border border-purple-400/30 hover:border-purple-400/60 transition-all text-left flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold shadow-md group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">Thêm Tài Khoản Mục Sư</h4>
                  <p className="text-xs text-sanctuary-400">Cấp quyền quản trị viên Hội Thánh</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: QUẢN LÝ TOÀN BỘ HỘI THÁNH (CHURCHES MANAGEMENT)             */}
        {/* =================================================================== */}
        {activeTab === "churches" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e131d] p-4 rounded-2xl border border-white/[0.08]">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Danh Sách Toàn Bộ Hội Thánh ({filteredChurches.length})
                </h3>
                <p className="text-xs text-sanctuary-400 font-sans">
                  Quản lý quyền hạn, khóa luồng phát, tài khoản ngân hàng và trạng thái hoạt động
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setEditingChurch(null);
                    setChurchForm({
                      name: "",
                      slug: "",
                      denomination: "Hội Thánh Tin Lành Việt Nam",
                      address: "Việt Nam",
                      streamKey: "",
                      liveSchedule: "Chúa Nhật, 08:30 - 11:00",
                      leadPastor: "Mục sư Quản Nhiệm",
                      slogan: "Nơi Lời Chúa Đem Lại Sự Sống Đời Đời",
                      about: "",
                      bankName: "MB Bank",
                      accountNumber: "0386888999",
                      accountHolder: "",
                      isActive: true,
                    });
                    setShowChurchModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Hội Thánh</span>
                </button>
              </div>
            </div>

            {/* Churches Table */}
            <div className="bg-[#0e131d] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#121824] text-sanctuary-400 font-serif uppercase tracking-wider text-[11px] border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Hội Thánh & Địa Chỉ</th>
                      <th className="py-3 px-3">Mã Định Danh (Slug)</th>
                      <th className="py-3 px-3">Khóa Phát (Stream Key)</th>
                      <th className="py-3 px-3">Mục Sư Quản Nhiệm</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-center">Trực Tiếp</th>
                      <th className="py-3 px-3 text-center">Bài Đăng</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredChurches.map((church) => {
                      const isLive = Boolean(church.currentService?.isLive ?? church.isLive);
                      return (
                        <tr
                          key={church._id}
                          className="hover:bg-sanctuary-850/40 transition-colors"
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  church.profileConfig?.avatarUrl ||
                                  "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=120&q=80"
                                }
                                alt={church.name}
                                className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0"
                              />
                              <div className="min-w-0">
                                <span className="text-[10px] text-gold-400 font-serif block truncate">
                                  {church.denomination}
                                </span>
                                <span className="font-serif font-bold text-white text-sm block truncate">
                                  {church.name}
                                </span>
                                <span className="text-[11px] text-sanctuary-400 block truncate">
                                  {church.address}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-mono text-gold-300">
                            /{church.slug}
                          </td>

                          <td className="py-3.5 px-3 font-mono text-sanctuary-300">
                            {church.streamKey}
                          </td>

                          <td className="py-3.5 px-3 font-serif text-sanctuary-200">
                            {church.profileConfig?.leadPastor || "Mục sư Quản Nhiệm"}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => handleToggleChurchActive(church)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${church.isActive !== false
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-red-500/15 text-red-400 border border-red-500/30"
                                }`}
                            >
                              {church.isActive !== false ? "🟢 Hoạt Động" : "🔴 Tạm Khóa"}
                            </button>
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() =>
                                handleToggleBroadcast(
                                  church.slug,
                                  isLive,
                                  church.currentService?.title
                                )
                              }
                              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${isLive
                                ? "bg-red-600 text-white animate-pulse"
                                : "bg-sanctuary-800 text-sanctuary-400 hover:text-white"
                                }`}
                            >
                              {isLive ? "🔴 LIVE" : "Offline"}
                            </button>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono text-sanctuary-300">
                            {church.postCount || 0}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                href={`/${church.slug}?view=sanctuary`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-400 hover:text-gold-300"
                                title="Xem Khán Phòng Thờ Phượng"
                              >
                                <Radio className="w-3.5 h-3.5" />
                              </Link>

                              <Link
                                href={`/${church.slug}?view=wall`}
                                target="_blank"
                                className="p-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-white"
                                title="Xem Tường Hội Thánh"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                onClick={() => openEditChurch(church)}
                                className="p-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-blue-400 hover:text-blue-300 cursor-pointer"
                                title="Chỉnh sửa thông tin"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDeleteChurch(church)}
                                className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-300 cursor-pointer"
                                title="Xóa vĩnh viễn Hội Thánh"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: KIỂM DUYỆT & QUẢN LÝ BÀI ĐĂNG (POSTS MANAGEMENT)             */}
        {/* =================================================================== */}
        {activeTab === "posts" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header & Filter Bar */}
            <div className="bg-[#0e131d] p-4 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Quản Lý Toàn Bộ Bài Viết ({filteredPosts.length})
                </h3>
                <p className="text-xs text-sanctuary-400">
                  Ghim bài viết lên đầu bảng tin, kiểm duyệt nội dung, xóa bài vi phạm hoặc đăng tin hệ thống
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Category selector */}
                <select
                  value={postCategoryFilter}
                  onChange={(e) => setPostCategoryFilter(e.target.value)}
                  className="bg-sanctuary-850 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-sanctuary-200 focus:outline-none"
                >
                  <option value="all">Tất cả danh mục</option>
                  <option value="announcement">Thông Báo</option>
                  <option value="scripture">Lời Chúa</option>
                  <option value="sermon">Bài Giảng</option>
                  <option value="fellowship">Thông Công & Cầu Thay</option>
                </select>

                {/* Church selector */}
                <select
                  value={churchSlugFilter}
                  onChange={(e) => setChurchSlugFilter(e.target.value)}
                  className="bg-sanctuary-850 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-sanctuary-200 focus:outline-none"
                >
                  <option value="all">Tất cả Hội Thánh</option>
                  {churches.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowPostModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Đăng Bài Mới</span>
                </button>
              </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((post) => (
                <div
                  key={post._id}
                  className={`bg-[#0e131d] border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-colors ${post.isPinned
                    ? "border-gold-400/50 bg-[#121622]"
                    : "border-white/[0.08]"
                    }`}
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={
                          post.churchAvatar ||
                          "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=120&q=80"
                        }
                        alt={post.churchName}
                        className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-xs text-white block truncate">
                          {post.churchName}
                        </span>
                        <span className="text-[10px] text-sanctuary-400 block">
                          Tác giả: {post.author?.name} • /{post.churchSlug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {post.isPinned && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-gold-400/20 text-gold-300 border border-gold-400/40 flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          <span>Đang Ghim</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-sanctuary-800 text-sanctuary-300 uppercase">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-gold-200 line-clamp-1">
                      {post.title}
                    </h4>
                    <p className="text-xs text-sanctuary-300 font-sans line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Stats & Actions */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-sanctuary-400">
                    <div className="flex items-center gap-3">
                      <span>🙏 {post.likesCount || 0} Amen</span>
                      <span>💬 {post.comments?.length || 0} bình luận</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTogglePostPin(post)}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${post.isPinned
                          ? "bg-gold-400 text-sanctuary-950 font-bold"
                          : "bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300"
                          }`}
                        title={post.isPinned ? "Bỏ ghim bài viết" : "Ghim bài viết lên đầu"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeletePost(post)}
                        className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 transition-colors cursor-pointer"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: QUẢN LÝ NGƯỜI DÙNG & TÀI KHOẢN (USERS MANAGEMENT)           */}
        {/* =================================================================== */}
        {activeTab === "users" && (
          <div className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="bg-[#0e131d] p-4 rounded-2xl border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Danh Sách Tài Khoản Quản Trị ({filteredUsers.length})
                </h3>
                <p className="text-xs text-sanctuary-400">
                  Phân quyền mục sư, trưởng ban kỹ thuật, kiểm duyệt viên và Tổng Quản Trị
                </p>
              </div>

              <button
                onClick={() => setShowUserModal(true)}
                className="px-4 py-2 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Tài Khoản</span>
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-[#0e131d] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#121824] text-sanctuary-400 font-serif uppercase tracking-wider text-[11px] border-b border-white/[0.08]">
                    <tr>
                      <th className="py-3 px-4">Họ & Tên</th>
                      <th className="py-3 px-3">Email Đăng Nhập</th>
                      <th className="py-3 px-3">Hội Thánh Liên Kết</th>
                      <th className="py-3 px-3">Vai Trò</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-sanctuary-850/40 transition-colors">
                        <td className="py-3.5 px-4 font-serif font-bold text-white">
                          <div className="flex items-center gap-2">
                            {user.role === "superadmin" && (
                              <Crown className="w-4 h-4 text-gold-400 shrink-0" />
                            )}
                            <span>{user.fullName}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-mono text-gold-300">
                          {user.email}
                        </td>

                        <td className="py-3.5 px-3 text-sanctuary-300">
                          {user.churchName || user.churchSlug}
                        </td>

                        <td className="py-3.5 px-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user, e.target.value)}
                            disabled={user._id === currentUser?.id}
                            className="bg-sanctuary-850 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none"
                          >
                            <option value="superadmin">👑 Superadmin</option>
                            <option value="pastor">Mục Sư (Pastor)</option>
                            <option value="tech_leader">Trưởng Ban Kỹ Thuật</option>
                            <option value="moderator">Kiểm Duyệt Viên</option>
                            <option value="admin">Quản Trị Viên</option>
                          </select>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <button
                            onClick={() => handleToggleUserActive(user)}
                            disabled={user._id === currentUser?.id}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${user.isActive !== false
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                              }`}
                          >
                            {user.isActive !== false ? "Hoạt Động" : "Bị Khóa"}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setResetPasswordUserId(user._id);
                                setNewPasswordValue("Church@2026");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-300 text-xs font-serif border border-white/10"
                            >
                              Đổi Mật Khẩu
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: ĐIỀU KHIỂN PHÁT SÓNG TOÀN QUỐC (MASTER LIVE BROADCAST)        */}
        {/* =================================================================== */}
        {activeTab === "broadcasts" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-[#0e131d] p-5 rounded-2xl border border-gold-400/30 space-y-2">
              <div className="flex items-center gap-2 text-gold-400 text-xs font-serif uppercase tracking-wider font-bold">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Bàn Điều Khiển Trung Tâm Phát Sóng Trực Tiếp (Master Switchboard)</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-white">
                Giám Sát & Điều Phối Luồng Live HLS/RTMP Cho Toàn Bộ Hệ Thống
              </h3>
              <p className="text-xs text-sanctuary-300 max-w-2xl leading-relaxed">
                Superadmin có quyền cưỡng chế Bật hoặc Tắt luồng phát của bất kỳ Hội Thánh nào nếu Mục sư quên đóng phòng, hoặc phát động buổi hiệp nguyện toàn quốc khẩn cấp.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {churches.map((church) => {
                const isLive = Boolean(church.currentService?.isLive ?? church.isLive);
                const hlsUrl = `http://169.58.235.90:8080/live/${church.streamKey}.m3u8`;

                return (
                  <div
                    key={church._id}
                    className={`bg-[#0e131d] border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${isLive ? "border-red-500/50 shadow-candle" : "border-white/[0.08]"
                      }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] text-gold-400 font-serif">
                            {church.denomination}
                          </span>
                          <h4 className="font-serif font-bold text-base text-white">
                            {church.name}
                          </h4>
                          <span className="text-xs text-sanctuary-400 font-mono block">
                            Mã: /{church.slug}
                          </span>
                        </div>

                        {isLive ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-600 text-white animate-pulse">
                            🔴 ĐANG PHÁT
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-sanctuary-800 text-sanctuary-400">
                            Ngoại tuyến
                          </span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl bg-sanctuary-950 border border-white/[0.06] space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between text-sanctuary-400 text-[11px]">
                          <span>Stream Key:</span>
                          <span className="text-gold-300 font-bold">{church.streamKey}</span>
                        </div>
                        <div className="flex items-center justify-between text-sanctuary-400 text-[11px]">
                          <span>Số người xem:</span>
                          <span className="text-white font-bold">
                            {church.currentService?.viewersCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                      <button
                        onClick={() =>
                          handleToggleBroadcast(
                            church.slug,
                            isLive,
                            church.currentService?.title
                          )
                        }
                        className={`w-full py-2.5 rounded-xl font-serif font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer ${isLive
                          ? "bg-red-600 hover:bg-red-500 text-white shadow-md"
                          : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                          }`}
                      >
                        {isLive ? (
                          <>
                            <Square className="w-4 h-4 fill-current" />
                            <span>CƯỠNG CHẾ TẮT PHÁT SÓNG</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-current" />
                            <span>KÍCH HOẠT PHÁT SÓNG TRỰC TIẾP</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${church.slug}?view=sanctuary`}
                          target="_blank"
                          className="flex-1 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-200 text-xs font-serif text-center"
                        >
                          Vào Khán Phòng
                        </Link>
                        <Link
                          href={`/${church.slug}?view=wall`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 text-xs font-serif text-center"
                        >
                          Tường
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 6: CÔNG CỤ HỆ THỐNG & CSDL (SYSTEM & MAINTENANCE)               */}
        {/* =================================================================== */}
        {activeTab === "maintenance" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Reseed card */}
            <div className="bg-[#0e131d] border border-gold-400/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-gold-400">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    Tái Tạo & Đồng Bộ Cơ Sở Dữ Liệu Mẫu (Reseed Database)
                  </h3>
                  <p className="text-xs text-sanctuary-300 font-sans">
                    Tự động tạo mới 6 Hội Thánh thực tế tại 3 miền Bắc - Trung - Nam, 10 bài đăng mục vụ phong phú và 2 luồng phát trực tiếp mẫu.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-sanctuary-950 border border-white/[0.06] text-xs font-mono text-sanctuary-300 space-y-1">
                <p>• Endpoint: POST /api/superadmin/reseed</p>
                <p>• Dữ liệu: 6 Hội Thánh (Hà Nội, Cầu Giấy, Đà Nẵng, TP.HCM, Bến Tre, Lam Sơn)</p>
                <p>• Bài viết: Lễ Chúa Nhật, Lời Chứng, Cứu Trợ Hỏa Hoạn, Đêm Ca Khen, Lớp Học</p>
              </div>

              <button
                onClick={handleReseedData}
                disabled={isReseeding}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-300 hover:to-amber-400 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm flex items-center gap-2 shadow-candle cursor-pointer disabled:opacity-50"
              >
                {isReseeding ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang khởi tạo lại toàn bộ dữ liệu mẫu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Chạy Lại Kịch Bản Reseed Dữ Liệu Ngay</span>
                  </>
                )}
              </button>
            </div>

            {/* System Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0e131d] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-serif font-bold text-sm">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Trạng Thái Hạ Tầng Máy Chủ</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/[0.05]">
                    <span className="text-sanctuary-400">Database Engine:</span>
                    <span className="text-emerald-400">MongoDB Atlas Cluster (SSL/TLS ReplicaSet)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.05]">
                    <span className="text-sanctuary-400">Streaming Media Server:</span>
                    <span className="text-gold-300">Node-Media-Server (HLS / RTMP Port 8080/1935)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.05]">
                    <span className="text-sanctuary-400">Next.js Framework:</span>
                    <span className="text-white">Next.js 14 (App Router & Server Actions)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sanctuary-400">VietQR API Gateway:</span>
                    <span className="text-emerald-400">Napas 24/7 Dynamic Generator</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0e131d] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-serif font-bold text-sm">
                  <Crown className="w-4 h-4 text-gold-400" />
                  <span>Đặc Quyền Của Tổng Quản Trị (Superadmin)</span>
                </div>
                <ul className="space-y-2 text-xs text-sanctuary-300 font-sans">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Toàn quyền thêm, sửa, xóa, khóa/mở bất kỳ Hội Thánh nào trong hệ thống.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Kiểm duyệt, ghim hoặc xóa mọi bài viết, bình luận từ bất kỳ thành viên.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Điều khiển cưỡng chế luồng phát sóng trực tiếp (force live start/stop).</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-gold-400 shrink-0" />
                    <span>Tạo, cấp quyền và đặt lại mật khẩu cho tất cả tài khoản Mục sư.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ===================================================================== */}
      {/* 4. MODALS (CHURCH, POST, USER, RESET PASSWORD)                         */}
      {/* ===================================================================== */}

      {/* Modal 1: Add / Edit Church */}
      {showChurchModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowChurchModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-[#0e131d] border border-gold-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowChurchModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-sanctuary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <ChurchIcon className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">
                {editingChurch ? `Chỉnh Sửa Hội Thánh: ${editingChurch.name}` : "Thêm Hội Thánh Mới"}
              </h3>
            </div>

            <form onSubmit={handleSaveChurch} className="space-y-3.5 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-sanctuary-200 font-medium">Tên Hội Thánh *</label>
                <input
                  required
                  type="text"
                  value={churchForm.name}
                  onChange={(e) => {
                    setChurchForm({
                      ...churchForm,
                      name: e.target.value,
                      slug: editingChurch
                        ? churchForm.slug
                        : e.target.value
                          .toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/[đĐ]/g, "d")
                          .replace(/[^a-z0-9]/g, ""),
                    });
                  }}
                  placeholder="Ví dụ: Hội Thánh Tin Lành Cần Thơ"
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-gold-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Slug Đường Dẫn *</label>
                  <input
                    required
                    disabled={Boolean(editingChurch)}
                    type="text"
                    value={churchForm.slug}
                    onChange={(e) => setChurchForm({ ...churchForm, slug: e.target.value })}
                    placeholder="cantho"
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-gold-300 font-mono focus:outline-none focus:border-gold-400 disabled:opacity-60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Khóa Stream Key *</label>
                  <input
                    required
                    type="text"
                    value={churchForm.streamKey}
                    onChange={(e) => setChurchForm({ ...churchForm, streamKey: e.target.value })}
                    placeholder="cantho-live"
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-sanctuary-100 font-mono focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Hệ Phái</label>
                  <input
                    type="text"
                    value={churchForm.denomination}
                    onChange={(e) => setChurchForm({ ...churchForm, denomination: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Mục Sư Quản Nhiệm</label>
                  <input
                    type="text"
                    value={churchForm.leadPastor}
                    onChange={(e) => setChurchForm({ ...churchForm, leadPastor: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sanctuary-200 font-medium">Địa Chỉ Nhà Thờ</label>
                <input
                  type="text"
                  value={churchForm.address}
                  onChange={(e) => setChurchForm({ ...churchForm, address: e.target.value })}
                  placeholder="Số 123 Đường..., TP..."
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Lịch Nhóm Thờ Phượng</label>
                  <input
                    type="text"
                    value={churchForm.liveSchedule}
                    onChange={(e) => setChurchForm({ ...churchForm, liveSchedule: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium">Khẩu Hiệu (Slogan)</label>
                  <input
                    type="text"
                    value={churchForm.slogan}
                    onChange={(e) => setChurchForm({ ...churchForm, slogan: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#131926] rounded-xl border border-white/[0.06] space-y-2">
                <span className="font-serif font-bold text-gold-400 text-[11px] uppercase">
                  Tài Khoản Dâng Hiến VietQR
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={churchForm.bankName}
                    onChange={(e) => setChurchForm({ ...churchForm, bankName: e.target.value })}
                    placeholder="Tên ngân hàng (MB Bank...)"
                    className="bg-[#0b1018] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={churchForm.accountNumber}
                    onChange={(e) =>
                      setChurchForm({ ...churchForm, accountNumber: e.target.value })
                    }
                    placeholder="Số tài khoản"
                    className="bg-[#0b1018] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  value={churchForm.accountHolder}
                  onChange={(e) => setChurchForm({ ...churchForm, accountHolder: e.target.value })}
                  placeholder="Tên chủ tài khoản"
                  className="w-full bg-[#0b1018] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={churchForm.isActive}
                  onChange={(e) => setChurchForm({ ...churchForm, isActive: e.target.checked })}
                  className="rounded text-gold-400"
                />
                <label htmlFor="isActiveCheck" className="text-white text-xs cursor-pointer">
                  Kích hoạt trạng thái hoạt động của Hội Thánh này
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm shadow-candle transition-colors cursor-pointer"
                >
                  {editingChurch ? "Lưu Cập Nhật Hội Thánh" : "Tạo & Đăng Ký Hội Thánh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Publish Global Post */}
      {showPostModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowPostModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0e131d] border border-gold-400/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowPostModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-sanctuary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">
                Đăng Bài Viết Hệ Thống Mới
              </h3>
            </div>

            <form onSubmit={handleSavePost} className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-sanctuary-200">Đăng Dưới Tên Hội Thánh *</label>
                <select
                  value={postForm.churchSlug}
                  onChange={(e) => setPostForm({ ...postForm, churchSlug: e.target.value })}
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {churches.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name} (/{c.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sanctuary-200">Danh Mục</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="announcement">Thông Báo Mục Vụ</option>
                    <option value="scripture">Lời Chúa & Bồi Linh</option>
                    <option value="sermon">Bài Giảng & Video</option>
                    <option value="fellowship">Làm Chứng & Thông Công</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sanctuary-200">Tác Giả Hiển Thị</label>
                  <input
                    type="text"
                    value={postForm.authorName}
                    onChange={(e) => setPostForm({ ...postForm, authorName: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sanctuary-200">Tiêu Đề Bài Viết *</label>
                <input
                  required
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="Nhập tiêu đề thông báo..."
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sanctuary-200">Nội Dung Chi Tiết *</label>
                <textarea
                  required
                  rows={4}
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="Nhập nội dung bài viết..."
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sanctuary-200">Câu Gốc Kinh Thánh (Tùy chọn)</label>
                <input
                  type="text"
                  value={postForm.scriptureVerse}
                  onChange={(e) => setPostForm({ ...postForm, scriptureVerse: e.target.value })}
                  placeholder="Ví dụ: Giăng 3:16"
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPinnedCheck"
                  checked={postForm.isPinned}
                  onChange={(e) => setPostForm({ ...postForm, isPinned: e.target.checked })}
                />
                <label htmlFor="isPinnedCheck" className="text-gold-300 font-serif cursor-pointer">
                  📌 Ghim bài viết này lên vị trí đầu tiên của Bảng Tin toàn quốc
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm shadow-candle transition-colors cursor-pointer"
                >
                  Xuất Bản Bài Viết
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Create User */}
      {showUserModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowUserModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-[#0e131d] border border-gold-400/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-sanctuary-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gold-400" />
              <h3 className="font-serif text-lg font-bold text-white">Tạo Tài Khoản Quản Trị Mới</h3>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-sanctuary-200">Họ và Tên *</label>
                <input
                  required
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  placeholder="Mục sư..."
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sanctuary-200">Email Đăng Nhập *</label>
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  placeholder="pastor@church.vn"
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sanctuary-200">Mật Khẩu Khởi Tạo *</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sanctuary-200">Vai Trò</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="pastor">Mục Sư Quản Nhiệm</option>
                    <option value="tech_leader">Trưởng Ban Kỹ Thuật</option>
                    <option value="moderator">Kiểm Duyệt Viên</option>
                    <option value="admin">Quản Trị Viên</option>
                    <option value="superadmin">👑 Superadmin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-sanctuary-200">Hội Thánh</label>
                  <select
                    value={userForm.churchSlug}
                    onChange={(e) => setUserForm({ ...userForm, churchSlug: e.target.value })}
                    className="w-full bg-[#131926] border border-white/10 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="system">Toàn Hệ Thống</option>
                    {churches.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm shadow-candle transition-colors cursor-pointer"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Reset Password */}
      {resetPasswordUserId && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setResetPasswordUserId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm bg-[#0e131d] border border-gold-400/40 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-serif text-base font-bold text-white">
              Đặt Lại Mật Khẩu Người Dùng
            </h3>
            <p className="text-xs text-sanctuary-400">
              Nhập mật khẩu mới cho tài khoản được chọn:
            </p>

            <input
              type="text"
              value={newPasswordValue}
              onChange={(e) => setNewPasswordValue(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
              className="w-full bg-[#131926] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-gold-300 font-mono focus:outline-none"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setResetPasswordUserId(null)}
                className="flex-1 py-2 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 text-xs font-serif"
              >
                Hủy
              </button>
              <button
                onClick={handleResetPassword}
                className="flex-1 py-2 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs shadow-candle"
              >
                Lưu Mật Khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
