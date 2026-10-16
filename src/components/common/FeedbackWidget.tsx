"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquarePlus,
  X,
  Star,
  Send,
  CheckCircle2,
  Sparkles,
  User as UserIcon,
  Phone,
  ShieldCheck,
} from "lucide-react";

export const FeedbackWidget: React.FC = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState<"believer" | "pastor" | "tech_team" | "visitor">("believer");
  const [category, setCategory] = useState<
    "suggestion" | "bug" | "ui_ux" | "church_support" | "compliment"
  >("suggestion");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Listen for custom event so any button across the app can open the feedback modal
  useEffect(() => {
    const handleOpenFeedback = () => {
      setIsSubmitted(false);
      setErrorMsg("");
      setIsOpen(true);
    };
    window.addEventListener("open-feedback-modal", handleOpenFeedback);
    return () => window.removeEventListener("open-feedback-modal", handleOpenFeedback);
  }, []);

  // Hide floating button on superadmin portal or projector screen to keep them clean
  const isHiddenRoute =
    pathname?.startsWith("/superadmin") || pathname?.startsWith("/projector");

  if (isHiddenRoute && !isOpen) {
    return null;
  }

  // Extract churchSlug if user is inside /[churchSlug]
  const getChurchSlugFromPath = () => {
    if (!pathname || pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/superadmin")) {
      return "system";
    }
    const seg = pathname.split("/").filter(Boolean)[0];
    return seg || "system";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg("Vui lòng nhập nội dung ý kiến đóng góp của quý vị.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName: senderName.trim() || "Tín hữu / Khách thăm",
          contact: contact.trim(),
          role,
          category,
          rating,
          message: message.trim(),
          churchSlug: getChurchSlugFromPath(),
          pageUrl: pathname || "/",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể gửi góp ý lúc này.");
      }

      setIsSubmitted(true);
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi kết nối.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Action Button (Bottom Left to avoid overlapping chat/scroll buttons) */}
      {!isHiddenRoute && (
        <button
          type="button"
          onClick={() => {
            setIsSubmitted(false);
            setErrorMsg("");
            setIsOpen(true);
          }}
          className="fixed bottom-4 right-4 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#121621]/95 hover:bg-[#181e2c] text-gold-300 border border-gold-400/40 hover:border-gold-400 shadow-2xl backdrop-blur-md transition-all group cursor-pointer"
          title="Đóng góp ý kiến cho Ban Quản Trị Dự Án (Super Admin)"
        >
          <div className="w-6 h-6 rounded-full bg-gold-400/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
            <MessageSquarePlus className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-serif font-semibold tracking-wide pr-0.5">
            Góp Ý Dự Án
          </span>
        </button>
      )}

      {/* Feedback Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setIsOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#0d111a] border border-gold-400/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-sanctuary-100"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-sanctuary-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Đóng hộp thoại"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-gold-500/20 to-amber-500/20 border border-gold-400/40 flex items-center justify-center text-gold-400 shrink-0 shadow-candle">
                <MessageSquarePlus className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold">
                    Hòm Thư Đóng Góp & Phản Hồi
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                  Đóng Góp Ý Kiến Phát Triển Dự Án
                </h3>
                <p className="text-xs text-sanctuary-300 font-sans mt-0.5 leading-relaxed">
                  Mọi ý kiến của quý Mục sư và tín hữu sẽ được gửi trực tiếp về{" "}
                  <strong className="text-gold-300">Đội Ngũ Phát Triển</strong> để hoàn thiện nền tảng phục vụ các Hội Thánh tốt hơn.
                </p>
              </div>
            </div>

            {isSubmitted ? (
              <div className="py-8 px-4 text-center space-y-4 bg-[#121824]/80 rounded-2xl border border-gold-400/30">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif text-lg font-bold text-white">
                    Cảm Ơn Quý Vị Đã Đóng Góp Ý Kiến!
                  </h4>
                  <p className="text-xs text-sanctuary-300 max-w-md mx-auto leading-relaxed">
                    Ý kiến của quý vị đã được ghi nhận và chuyển trực tiếp đến hộp thư của{" "}
                    <span className="text-gold-300 font-semibold">Super Admin</span>. Nguyện Chúa ban phước dồi dào trên quý vị và Hội Thánh!
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="px-4 py-2 rounded-xl bg-sanctuary-850 hover:bg-sanctuary-800 text-gold-300 border border-gold-400/30 text-xs font-serif cursor-pointer"
                  >
                    Gửi thêm ý kiến khác
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2 rounded-xl bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif font-bold text-xs shadow-candle cursor-pointer"
                  >
                    Hoàn Tất
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-sans">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Star Rating */}
                <div className="p-3 rounded-2xl bg-[#121722] border border-white/[0.06] flex items-center justify-between gap-2">
                  <span className="text-sanctuary-200 font-serif font-medium">
                    Mức độ hài lòng của quý vị:
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                        title={`${star} sao`}
                      >
                        <Star
                          className={`w-5 h-5 ${star <= rating
                            ? "text-gold-400 fill-gold-400"
                            : "text-sanctuary-600"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sanctuary-200 font-medium block">
                      Chủ đề góp ý *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#131926] border border-white/10 focus:border-gold-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="suggestion">💡 Đề xuất tính năng mới</option>
                      <option value="ui_ux">🎨 Giao diện & Trải nghiệm (Chữ, Màu sắc)</option>
                      <option value="bug">🛠️ Báo lỗi kỹ thuật / Livestream</option>
                      <option value="church_support">⛪ Hỗ trợ mở Phòng cho Hội Thánh</option>
                      <option value="compliment">❤️ Lời khích lệ & Cảm nhận</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sanctuary-200 font-medium block">
                      Quý vị là
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-[#131926] border border-white/10 focus:border-gold-400 rounded-xl px-3 py-2 text-white focus:outline-none"
                    >
                      <option value="believer">Tín hữu / Con cái Chúa</option>
                      <option value="pastor">Mục sư / Truyền đạo / Chấp sự</option>
                      <option value="tech_team">Ban Truyền thông / Kỹ thuật HT</option>
                      <option value="visitor">Thân hữu / Khách ghé thăm</option>
                    </select>
                  </div>
                </div>

                {/* Sender Name & Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sanctuary-200 font-medium block">
                      Quý danh (Không bắt buộc)
                    </label>
                    <div className="relative flex items-center">
                      <UserIcon className="w-3.5 h-3.5 text-sanctuary-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="VD: MS Nguyễn Văn A / Tín hữu..."
                        className="w-full bg-[#131926] border border-white/10 focus:border-gold-400 rounded-xl pl-8 pr-3 py-2 text-white placeholder-sanctuary-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sanctuary-200 font-medium block">
                      SĐT / Zalo / Email (Nếu cần phản hồi)
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="w-3.5 h-3.5 text-sanctuary-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Số điện thoại hoặc Email..."
                        className="w-full bg-[#131926] border border-white/10 focus:border-gold-400 rounded-xl pl-8 pr-3 py-2 text-white placeholder-sanctuary-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-1">
                  <label className="text-sanctuary-200 font-medium block">
                    Nội dung ý kiến đóng góp *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của quý vị, tính năng mong muốn thêm cho Hội Thánh, hoặc báo lỗi gặp phải..."
                    className="w-full bg-[#131926] border border-white/10 focus:border-gold-400 rounded-xl p-3 text-white placeholder-sanctuary-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Security/Direct to Super Admin note */}
                <div className="flex items-center gap-2 text-[11px] text-sanctuary-400 bg-[#121722] px-3 py-2 rounded-xl border border-white/[0.04]">
                  <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0" />
                  <span>
                    Thư góp ý này được bảo mật và gửi thẳng tới hộp thư của{" "}
                    <strong className="text-sanctuary-200">Đội Ngũ Phát Triển</strong>.
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500 hover:from-gold-300 hover:to-amber-300 text-sanctuary-950 font-serif font-bold text-xs sm:text-sm shadow-candle transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {isSubmitting
                        ? "Đang gửi..."
                        : "Gửi Ý Kiến Đóng Góp"}
                    </span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
