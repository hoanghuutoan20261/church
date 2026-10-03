"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

interface ChurchItem {
  _id: string;
  name: string;
  slug: string;
  denomination: string;
  address: string;
  streamKey: string;
  liveSchedule: string;
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
    isLive: boolean;
    viewersCount: number;
  };
  bankingConfig?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export default function ChurchDirectoryPage() {
  const router = useRouter();
  const [churches, setChurches] = useState<ChurchItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedDenomination, setSelectedDenomination] = useState<string>("all");
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // New Church Form State
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDenomination, setFormDenomination] = useState("Hội Thánh Tin Lành Việt Nam");
  const [formAddress, setFormAddress] = useState("");
  const [formStreamKey, setFormStreamKey] = useState("");
  const [formSchedule, setFormSchedule] = useState("Chúa Nhật, 09:00 - 11:15");
  const [formAdminName, setFormAdminName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formBankName, setFormBankName] = useState("MB Bank");
  const [formAccNumber, setFormAccNumber] = useState("");
  const [formAccHolder, setFormAccHolder] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const denominations = [
    { id: "all", label: "Tất Cả Hệ Phái" },
    { id: "Hội Thánh Tin Lành Việt Nam", label: "HTTL Việt Nam" },
    { id: "Hội Thánh Báp-tít Việt Nam", label: "HT Báp-tít" },
    { id: "Hội Thánh Trưởng Lão", label: "HT Trưởng Lão" },
    { id: "Hội Thánh Liên Hữu Cơ Đốc", label: "Liên Hữu Cơ Đốc" },
  ];

  // Fetch churches
  const fetchChurches = async () => {
    try {
      setLoading(true);
      // Ensure seed data exists
      await fetch("/api/seed");
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
  }, []);

  // Filter churches
  const filteredChurches = churches.filter((church) => {
    const matchesSearch =
      church.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      church.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDenom =
      selectedDenomination === "all" || church.denomination === selectedDenomination;

    return matchesSearch && matchesDenom;
  });

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
          liveSchedule: formSchedule,
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

      // Refresh list, close modal, and redirect to Admin Dashboard
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
    <div className="min-h-screen bg-sanctuary-950 text-sanctuary-100 flex flex-col font-sans selection:bg-gold-400/25 selection:text-gold-200">
      {/* 1. Dignified Top Header */}
      <header className="w-full bg-sanctuary-950 border-b border-white/[0.08] px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-md bg-sanctuary-950/90">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-sanctuary-850 border border-gold-400/30 flex items-center justify-center text-gold-400 shadow-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-gold-400"
            >
              <path d="M12 2v20" />
              <path d="M6 7h12" />
            </svg>
          </div>
          <div>
            <span className="font-serif tracking-wider uppercase text-xs font-semibold text-gold-400">
              Phòng Thờ Phượng Trực Tuyến
            </span>
            <h1 className="text-sm sm:text-base font-serif font-medium text-sanctuary-100">
              Cổng Kết Nối Các Hội Thánh Việt Nam
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-serif font-medium rounded-md bg-sanctuary-850 hover:bg-sanctuary-800 text-stone-300 hover:text-gold-300 border border-white/10 hover:border-gold-400/40 transition-colors shadow-sm"
            title="Đăng nhập vào bảng quản trị mục vụ Hội Thánh"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            <span className="hidden sm:inline">Quản Trị Mục Vụ</span>
            <span className="sm:hidden">Quản Trị</span>
          </Link>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif font-medium rounded-md bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 border border-gold-400/40 transition-colors shadow-sm"
            title="Đăng ký thêm Hội Thánh vào nền tảng"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đăng Ký Hội Thánh Mới</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-12 pb-10 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-sanctuary-850 border border-gold-400/30 px-3 py-1 rounded-full text-xs font-serif text-gold-300 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>Nền Tảng Thờ Phượng & Kết Nối Đa Giáo Xứ</span>
        </div>

        <h2 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-sanctuary-100 tracking-normal leading-tight">
          Nền Tảng Thờ Phượng & Kết Nối <br className="hidden sm:inline" />
          <span className="text-gold-400 italic font-serif">Các Hội Thánh Trực Tuyến</span>
        </h2>

        <p className="text-xs sm:text-sm text-sanctuary-300 max-w-2xl mx-auto leading-relaxed font-sans">
          Không gian thánh đường trực tuyến trang nghiêm và tĩnh lặng, kết nối quý tôi con
          Chúa khắp mọi miền đất nước cùng hiệp một lòng tôn vinh Ba Ngôi Đức Chúa Trời,
          lắng nghe Lời Ngài và dâng lời cầu thay.
        </p>

        {/* Search & Filter Bar */}
        <div className="pt-4 max-w-2xl mx-auto space-y-3">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-sanctuary-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm Hội Thánh theo tên, địa phương hoặc mã slug..."
              className="w-full bg-sanctuary-900 border border-white/[0.1] focus:border-gold-400/60 rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none transition-colors shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 text-xs text-sanctuary-400 hover:text-white"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Filter Chips */}
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {denominations.map((denom) => (
              <button
                key={denom.id}
                onClick={() => setSelectedDenomination(denom.id)}
                className={`shrink-0 px-3 py-1 rounded-md text-xs font-serif transition-all ${
                  selectedDenomination === denom.id
                    ? "bg-gold-400 text-sanctuary-950 font-semibold shadow-candle"
                    : "bg-sanctuary-900 hover:bg-sanctuary-850 text-sanctuary-300 border border-white/[0.08]"
                }`}
              >
                {denom.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Churches Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] mb-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif text-sm uppercase tracking-wider text-sanctuary-300 font-semibold">
              Danh Sách Phòng Thờ Phượng ({filteredChurches.length})
            </h3>
          </div>
          <span className="text-xs text-sanctuary-400">
            Hệ thống hỗ trợ phát trực tiếp & cầu nguyện riêng biệt
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-sanctuary-400 font-serif">
              Đang tải danh sách các Hội Thánh...
            </p>
          </div>
        ) : filteredChurches.length === 0 ? (
          <div className="bg-sanctuary-900 border border-white/[0.06] rounded-lg p-10 text-center max-w-md mx-auto space-y-3">
            <ChurchIcon className="w-10 h-10 text-sanctuary-500 mx-auto" />
            <h4 className="font-serif text-base text-sanctuary-200 font-semibold">
              Chưa tìm thấy Hội Thánh phù hợp
            </h4>
            <p className="text-xs text-sanctuary-400">
              Không có kết quả khớp với từ khóa &ldquo;{searchTerm}&rdquo;. Quý vị có thể
              đăng ký mới hoặc thử tìm kiếm khác.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedDenomination("all");
              }}
              className="px-4 py-1.5 text-xs bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-300 border border-white/10 rounded"
            >
              Xem tất cả Hội Thánh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChurches.map((church) => {
              const coverImg =
                church.profileConfig?.coverImageUrl ||
                "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80";
              const avatarImg =
                church.profileConfig?.avatarUrl ||
                "https://images.unsplash.com/photo-1548625361-16eb16428c0c?auto=format&fit=crop&w=400&q=80";
              const isLive = Boolean(church.currentService?.isLive);

              return (
                <div
                  key={church._id}
                  className="group relative bg-sanctuary-900 hover:bg-[#14171e] border border-white/[0.08] hover:border-gold-400/40 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div>
                    {/* 1. Card Cover Image Banner */}
                    <Link
                      href={`/${church.slug}?view=sanctuary`}
                      className="block relative h-44 sm:h-48 w-full overflow-hidden bg-sanctuary-950 cursor-pointer"
                    >
                      <img
                        src={coverImg}
                        alt={church.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading="lazy"
                      />

                      {/* Dark Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-sanctuary-900 via-sanctuary-900/40 to-black/60" />

                      {/* Badges on top of image */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-10">
                        <span className="text-[11px] font-medium text-gold-200 bg-sanctuary-950/85 backdrop-blur-md border border-gold-400/30 px-2.5 py-0.5 rounded-full font-sans truncate shadow-md">
                          {church.denomination}
                        </span>

                        {isLive ? (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-red-600/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-md animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white" />
                            <span className="uppercase text-[10px] tracking-wider">
                              Đang Trực Tiếp
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[10px] text-sanctuary-300 bg-sanctuary-950/80 backdrop-blur-md border border-white/10 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-gold-400" />
                            <span>{church.liveSchedule?.split(",")[0] || "Chúa Nhật"}</span>
                          </div>
                        )}
                      </div>

                      {/* Church Avatar overlapping banner */}
                      <div className="absolute -bottom-4 left-4 z-10">
                        <div className="w-12 h-12 rounded-xl bg-sanctuary-950 border-2 border-gold-400/60 p-0.5 shadow-xl overflow-hidden shrink-0">
                          <img
                            src={avatarImg}
                            alt={church.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </Link>

                    {/* 2. Card Content Body */}
                    <div className="pt-6 p-5 space-y-2.5">
                      {/* Slogan Motto */}
                      {church.profileConfig?.slogan && (
                        <p className="text-[11px] italic font-serif text-gold-400/90 line-clamp-1">
                          &ldquo;{church.profileConfig.slogan}&rdquo;
                        </p>
                      )}

                      {/* Church Name */}
                      <Link href={`/${church.slug}?view=sanctuary`} className="block">
                        <h4 className="font-serif text-lg font-bold text-sanctuary-100 group-hover:text-gold-300 transition-colors line-clamp-1 hover:underline decoration-gold-400/40">
                          {church.name}
                        </h4>
                      </Link>

                      {/* Pastor Info */}
                      {church.profileConfig?.leadPastor && (
                        <div className="flex items-center gap-1 text-xs text-sanctuary-400">
                          <span className="text-gold-400 font-serif text-[11px]">Quản nhiệm:</span>
                          <span className="text-sanctuary-300 font-sans truncate">{church.profileConfig.leadPastor}</span>
                        </div>
                      )}

                      {/* Address */}
                      <div className="flex items-start gap-2 text-xs text-sanctuary-400 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-gold-400/70 shrink-0 mt-0.5" />
                        <span className="line-clamp-1 font-sans">{church.address}</span>
                      </div>

                      {/* Schedule */}
                      <div className="flex items-center gap-2 text-xs text-sanctuary-400">
                        <Clock className="w-3.5 h-3.5 text-sanctuary-400 shrink-0" />
                        <span className="font-sans text-sanctuary-300 line-clamp-1">
                          {church.liveSchedule}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Card Bottom Actions */}
                  <div className="px-5 pb-5 pt-3 border-t border-white/[0.06] flex items-center gap-2">
                    <Link
                      href={`/${church.slug}?view=sanctuary`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sanctuary-850 hover:bg-gold-400 text-gold-300 hover:text-sanctuary-950 border border-gold-400/30 hover:border-gold-400 transition-all font-serif text-xs sm:text-sm font-semibold tracking-wide shadow-sm"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Vào Thờ Phượng</span>
                    </Link>

                    <Link
                      href={`/${church.slug}?view=wall`}
                      className="py-2 px-3 rounded-lg bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-300 hover:text-gold-300 border border-white/10 transition-colors flex items-center gap-1.5 text-xs font-serif"
                      title="Xem Tường & Bản Tin Hội Thánh"
                    >
                      <Newspaper className="w-3.5 h-3.5 text-gold-400" />
                      <span className="hidden sm:inline">Tường</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 4. Solemn Footer */}
      <footer className="w-full bg-sanctuary-950 border-t border-white/[0.08] px-4 py-8 text-center space-y-2 select-none">
        <p className="font-serif italic text-xs sm:text-sm text-gold-200/90 max-w-lg mx-auto">
          &ldquo;Kìa, anh em ăn ở hòa thuận nhau, dường tốt đẹp thú vui là dường nào!&rdquo;
        </p>
        <p className="text-[11px] text-sanctuary-500 font-sans">
          — Thi-thiên 133:1 • Nền Tảng Thờ Phượng Trực Tuyến Dành Cho Các Hội Thánh Việt Nam
        </p>
      </footer>

      {/* 5. Register New Church Modal */}
      {showRegisterModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
          onClick={() => setShowRegisterModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-sanctuary-950 border border-gold-400/40 rounded-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-md text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/40 mx-auto flex items-center justify-center text-gold-400 mb-2">
                <ChurchIcon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-sanctuary-100">
                Đăng Ký Phòng Nhóm Hội Thánh Mới
              </h3>
              <p className="text-xs text-sanctuary-400 font-sans max-w-sm mx-auto">
                Hệ thống sẽ tự động tạo phòng trực tuyến và mã định danh chuyên biệt cho Hội
                Thánh của bạn.
              </p>
            </div>

            {submitError && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded">
                {submitError}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-3 pt-1">
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
                      // auto suggest slug
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
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sanctuary-200">
                    Mã đường dẫn (Slug) <span className="text-gold-400">*</span>
                  </label>
                  <div className="flex items-center bg-sanctuary-850 border border-white/[0.08] rounded-md px-2 focus-within:border-gold-400/50">
                    <span className="text-[11px] text-sanctuary-500 font-mono">/</span>
                    <input
                      required
                      type="text"
                      value={formSlug}
                      onChange={(e) =>
                        setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
                      }
                      placeholder="bentre"
                      className="w-full bg-transparent px-1 py-2 text-xs text-gold-300 font-mono focus:outline-none"
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
                    className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
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
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-200 focus:outline-none"
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
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
              </div>

              {/* Admin User Credentials */}
              <div className="p-3 bg-sanctuary-900 border border-white/[0.06] rounded-md space-y-2">
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
                  className="w-full bg-sanctuary-850 border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    required
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="Email đăng nhập quản trị"
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                  <input
                    required
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                    minLength={6}
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Banking for VietQR */}
              <div className="p-3 bg-sanctuary-900 border border-white/[0.06] rounded-md space-y-2">
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                  Tài khoản Dâng Hiến VietQR (Tùy chọn)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formBankName}
                    onChange={(e) => setFormBankName(e.target.value)}
                    placeholder="Tên ngân hàng (MB Bank, VCB...)"
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formAccNumber}
                    onChange={(e) => setFormAccNumber(e.target.value)}
                    placeholder="Số tài khoản ngân hàng"
                    className="w-full bg-sanctuary-850 border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
                <input
                  type="text"
                  value={formAccHolder}
                  onChange={(e) => setFormAccHolder(e.target.value)}
                  placeholder="Tên chủ tài khoản (viết hoa không dấu)"
                  className="w-full bg-sanctuary-850 border border-white/[0.06] rounded px-2.5 py-1.5 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
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
                  className="w-full py-2.5 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-sanctuary-950 font-serif font-semibold text-xs sm:text-sm rounded-md transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
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
    </div>
  );
}
