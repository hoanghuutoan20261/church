"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  bankingConfig?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export default function ChurchDirectoryPage() {
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
      const res = await fetch("/api/churches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          slug: formSlug,
          denomination: formDenomination,
          address: formAddress || "Việt Nam",
          streamKey: formStreamKey,
          liveSchedule: formSchedule,
          bankingConfig: {
            bankName: formBankName || "MB Bank",
            accountNumber: formAccNumber || "0386888999",
            accountHolder: formAccHolder || formName.toUpperCase(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể đăng ký Hội Thánh");
      }

      // Refresh list and close
      await fetchChurches();
      setShowRegisterModal(false);
      // Reset form
      setFormName("");
      setFormSlug("");
      setFormStreamKey("");
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

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif font-medium rounded-md bg-gold-400/10 hover:bg-gold-400/20 text-gold-300 border border-gold-400/40 transition-colors"
          title="Đăng ký thêm Hội Thánh vào nền tảng"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Đăng Ký Hội Thánh Mới</span>
          <span className="sm:hidden">Thêm</span>
        </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredChurches.map((church) => (
              <div
                key={church._id}
                className="group relative bg-sanctuary-900 hover:bg-sanctuary-850/80 border border-white/[0.08] hover:border-gold-400/40 rounded-lg p-5 flex flex-col justify-between transition-all duration-200 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Status & Denomination */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-gold-300 bg-gold-400/10 border border-gold-400/25 px-2 py-0.5 rounded font-sans truncate">
                      {church.denomination}
                    </span>

                    {/* Live Indicator */}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-400 bg-red-950/40 border border-red-500/30 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <span className="uppercase text-[10px] tracking-wider">
                        Trực Tiếp
                      </span>
                    </div>
                  </div>

                  {/* Church Name */}
                  <h4 className="font-serif text-lg font-bold text-sanctuary-100 group-hover:text-gold-200 transition-colors line-clamp-2">
                    {church.name}
                  </h4>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-xs text-sanctuary-400">
                    <MapPin className="w-3.5 h-3.5 text-gold-400/70 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 font-sans">{church.address}</span>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-center gap-2 text-xs text-sanctuary-400">
                    <Clock className="w-3.5 h-3.5 text-sanctuary-400 shrink-0" />
                    <span className="font-sans text-sanctuary-300">
                      {church.liveSchedule}
                    </span>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-5 mt-4 border-t border-white/[0.06]">
                  <Link
                    href={`/${church.slug}`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-md bg-sanctuary-850 hover:bg-gold-400 text-gold-300 hover:text-sanctuary-950 border border-gold-400/30 hover:border-gold-400 transition-all font-serif text-xs sm:text-sm font-semibold tracking-wide shadow-sm"
                  >
                    <span>Vào Phòng Thờ Phượng</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
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

              {/* Banking for VietQR */}
              <div className="p-3 bg-sanctuary-900 border border-white/[0.06] rounded-md space-y-2">
                <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-wider block">
                  Tài khoản Dâng Hiến VietQR
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
                  disabled={isSubmitting || !formName || !formSlug || !formStreamKey}
                  className="w-full py-2.5 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-sanctuary-950 font-serif font-semibold text-xs sm:text-sm rounded-md transition-all shadow-sm flex items-center justify-center gap-2"
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
