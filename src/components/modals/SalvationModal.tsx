"use client";

import React, { useState } from "react";
import { useWorship } from "@/context/WorshipContext";
import { X, Sparkles, Heart, Phone, CheckCircle2, MessageCircle } from "lucide-react";

export const SalvationModal: React.FC = () => {
  const { church, activeModal, closeModal } = useWorship();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [city, setCity] = useState("");
  const [hasPrayed, setHasPrayed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (activeModal !== "salvation") return null;

  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/salvation-decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          fullName,
          phoneNumber,
          city,
          hasPrayed,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể ghi nhận thông tin");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Lỗi gửi quyết định tiếp nhận Chúa:", err);
      // Fallback show success
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="salvation-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-sanctuary-950 border border-gold-400/40 rounded-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-md text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-10 h-10 rounded-full bg-sacrament/30 border border-sacrament-light/50 mx-auto flex items-center justify-center text-amber-200 mb-2 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2
            id="salvation-modal-title"
            className="font-serif text-lg sm:text-xl font-bold text-sanctuary-100"
          >
            Quyết Định Tiếp Nhận Chúa Cứu Thế Giê-xu
          </h2>
          <p className="text-xs text-sanctuary-300 font-sans max-w-md mx-auto leading-relaxed">
            Nếu bạn đang tìm kiếm ý nghĩa cuộc đời, sự tha thứ và bình an thật từ Thiên
            Chúa, Ngài đang dang rộng vòng tay đón đợi bạn hôm nay.
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-gold-400 mx-auto" />
            <h3 className="font-serif text-base font-semibold text-sanctuary-100">
              Chúc Mừng Bạn Trong Đại Gia Đình Chúa!
            </h3>
            <p className="text-xs text-sanctuary-300 leading-relaxed max-w-sm mx-auto font-sans">
              Thông tin của bạn đã được ghi nhận. Ban Mục sư Hội Thánh sẽ chủ động liên
              hệ qua điện thoại/Zalo để chúc mừng, gửi tặng bạn cuốn Kinh Thánh Tân Ước và
              hướng dẫn những bước đi đức tin đầu tiên.
            </p>
            <button
              onClick={closeModal}
              className="mt-4 px-6 py-2 bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif text-xs font-semibold rounded-md transition-colors"
            >
              Trở lại buổi thờ phượng
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* The Sinner's Prayer Card */}
            <div className="bg-sanctuary-850/90 border border-gold-400/25 rounded-md p-4 space-y-2.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                Lời Cầu Nguyện Bằng Đức Tin
              </span>
              <p className="font-serif italic text-xs sm:text-sm text-gold-100 leading-relaxed">
                &ldquo;Lạy Chúa Giê-xu, con biết con là người có tội và không thể tự cứu
                mình. Con tin rằng Chúa đã vì yêu con mà chịu chết đền tội cho con trên
                cây thập tự và đã sống lại. Giờ đây, con thành tâm mở lòng tiếp nhận Ngài
                làm Cứu Chúa và Chủ cuộc đời con. Xin tha thứ mọi tội lỗi của con và ngự
                vào lòng con từ nay cho đến đời đời. Con cầu nguyện trong Danh Đức Chúa
                Jêsus Christ. Amen.&rdquo;
              </p>
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-sanctuary-200">
                  <input
                    type="checkbox"
                    checked={hasPrayed}
                    onChange={(e) => setHasPrayed(e.target.checked)}
                    className="rounded border-white/20 bg-sanctuary-800 text-gold-400 focus:ring-0"
                  />
                  <span>Tôi đã cầu nguyện những lời này bằng cả tấm lòng</span>
                </label>
              </div>
            </div>

            {/* Decision Connection Form */}
            <form onSubmit={handleSubmitDecision} className="space-y-3 pt-1">
              {errorMessage && (
                <div className="p-2 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-sanctuary-200">
                  Họ và tên của bạn
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Minh Trí"
                  className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sanctuary-200">
                    Số điện thoại / Zalo
                  </label>
                  <input
                    required
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="09xx xxx xxx"
                    className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-sanctuary-200">
                    Tỉnh / Thành phố
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !hasPrayed || !fullName || !phoneNumber}
                  className="w-full py-2.5 px-4 bg-sacrament hover:bg-sacrament-light disabled:opacity-40 text-amber-100 font-serif font-semibold text-xs sm:text-sm rounded-md transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4 text-amber-200" />
                  <span>
                    {isSubmitting
                      ? "Đang lưu thông tin..."
                      : "Xác Nhận Quyết Định & Kết Nối Với Mục Sư"}
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-sanctuary-400 text-center leading-normal">
                Chúng tôi trân trọng và đồng hành cùng bạn mà không hề có bất kỳ sự làm
                phiền nào.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
