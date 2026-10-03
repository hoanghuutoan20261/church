"use client";

import React, { useState } from "react";
import { useWorship } from "@/context/WorshipContext";
import { X, HeartHandshake, CheckCircle2, Shield, Flame } from "lucide-react";

export const PrayerRequestModal: React.FC = () => {
  const { church, activeModal, closeModal } = useWorship();
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contact, setContact] = useState("");
  const [category, setCategory] = useState("Sức khỏe & Chữa lành");
  const [content, setContent] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (activeModal !== "prayer") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          name: isAnonymous ? "Con cái Chúa (Ẩn danh)" : name,
          isAnonymous,
          contact: contact || null,
          wantsPastorCall: Boolean(contact),
          category,
          confidentialLevel: "pastor_only",
          prayerContent: content,
        }),
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Lỗi gửi lời cầu nguyện:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setContent("");
    setName("");
    setContact("");
    closeModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="prayer-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fadeIn"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-sanctuary-950 border border-gold-400/40 rounded-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-md text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1 pt-1">
          <div className="w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/40 mx-auto flex items-center justify-center text-gold-400 mb-2">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2
            id="prayer-modal-title"
            className="font-serif text-lg sm:text-xl font-bold text-sanctuary-100"
          >
            Yêu Cầu Cầu Nguyện Kín
          </h2>
          <p className="text-xs text-sanctuary-300 font-sans max-w-sm mx-auto">
            Gửi trực tiếp đến Ban Mục Vụ Hội Thánh. Chúng tôi đồng hành và dâng trình nan
            đề của bạn lên Chúa.
          </p>
        </div>

        {isSubmitted ? (
          <div className="py-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gold-400/20 border border-gold-400/50 flex items-center justify-center mx-auto text-gold-300">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-base font-semibold text-sanctuary-100">
              Nguyện Xin Chúa Ban Sự Bình An & Chữa Lành!
            </h3>
            <p className="text-xs text-sanctuary-300 max-w-sm mx-auto leading-relaxed">
              Lời cầu thay của bạn đã được lưu trữ bảo mật và chuyển đến Mục sư quản
              nhiệm. Hãy vững lòng tin cậy vì Chúa luôn lắng nghe tiếng khóc cầu của con
              cái Ngài.
            </p>
            <button
              onClick={handleClose}
              className="mt-3 px-6 py-2 bg-gold-400 hover:bg-gold-500 text-sanctuary-950 font-serif text-xs font-semibold rounded-md transition-colors"
            >
              Trở lại thờ phượng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-sanctuary-200">
                Tên của bạn
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-sanctuary-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded border-white/20 bg-sanctuary-800 text-gold-400 focus:ring-0"
                />
                <span>Xin ẩn danh</span>
              </label>
            </div>

            <input
              type="text"
              disabled={isAnonymous}
              value={isAnonymous ? "Con cái Chúa (Ẩn danh)" : name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Họ và tên"
              className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-sanctuary-200">
                Nhu cầu cầu thay
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-200 focus:outline-none"
              >
                <option value="Sức khỏe & Chữa lành">Sức khỏe & Chữa lành thể xác</option>
                <option value="Gia đình & Con cái">Gia đình & Con cái</option>
                <option value="Công việc & Kinh tế">Công việc & Kinh tế</option>
                <option value="Giải cứu & Bình an tâm linh">
                  Giải cứu & Bình an tâm linh
                </option>
                <option value="Tạ ơn Chúa">Tạ ơn Chúa vì ơn phước</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-sanctuary-200">
                Nội dung chi tiết <span className="text-gold-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Xin giãi bày nan đề của bạn..."
                className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md p-3 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none resize-none font-serif leading-relaxed"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-sanctuary-200">
                Số điện thoại (nếu muốn Mục sư liên hệ tâm vấn)
              </label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Để trống nếu chỉ cần cầu thay kín"
                className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="w-full py-2.5 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-sanctuary-950 font-serif font-semibold text-xs sm:text-sm rounded-md transition-colors"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi Lời Cầu Thay"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
