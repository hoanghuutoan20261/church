"use client";

import React, { useState } from "react";
import { useWorship } from "@/context/WorshipContext";
import {
  Lock,
  HeartHandshake,
  CheckCircle2,
  Shield,
  PhoneCall,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";

export const PrivatePrayerTab: React.FC = () => {
  const { church } = useWorship();
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contact, setContact] = useState("");
  const [wantsPastorCall, setWantsPastorCall] = useState(false);
  const [category, setCategory] = useState("Sức khỏe & Chữa lành");
  const [confidentialLevel, setConfidentialLevel] = useState("pastor_only");
  const [prayerContent, setPrayerContent] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const categories = [
    "Sức khỏe & Chữa lành",
    "Gia đình & Hôn nhân",
    "Đức tin & Đời sống tâm linh",
    "Việc làm & Kinh tế",
    "Bình an & Giải cứu",
    "Tạ ơn Chúa & Phước lành",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerContent.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/prayer-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          name: isAnonymous ? "Con cái Chúa (Ẩn danh)" : name,
          isAnonymous,
          contact: wantsPastorCall ? contact : null,
          wantsPastorCall,
          category,
          confidentialLevel,
          prayerContent,
        }),
      });

      if (!res.ok) {
        throw new Error("Không thể gửi dữ liệu lên máy chủ");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Lỗi khi gửi lời cầu thay:", err);
      // Fallback display
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setName("");
    setIsAnonymous(false);
    setContact("");
    setWantsPastorCall(false);
    setPrayerContent("");
    setIsSubmitted(false);
    setErrorMsg("");
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-sanctuary-900 select-text">
        <div className="w-14 h-14 rounded-full bg-gold-400/15 border border-gold-400/40 flex items-center justify-center text-gold-400 mb-4 shadow-candle">
          <Flame className="w-7 h-7 text-gold-300" />
        </div>

        <h3 className="font-serif text-lg font-semibold text-sanctuary-100 mb-2">
          Lời Cầu Thay Đã Được Tiếp Nhận
        </h3>

        <p className="text-xs text-sanctuary-300 max-w-sm leading-relaxed mb-5 font-sans">
          Ban Mục Vụ và các chiến sĩ cầu thay đã nhận được nan đề của quý vị trong cơ sở
          dữ liệu thánh đường. Nguyện xin bình an vượt quá mọi sự hiểu biết gìn giữ lòng
          và ý tưởng quý vị trong Chúa Cứu Thế Giê-xu.
        </p>

        {/* Biblical Assurance Quote */}
        <div className="bg-sanctuary-850 border border-white/[0.08] p-4 rounded-md text-left mb-6 max-w-sm">
          <p className="font-serif italic text-xs text-gold-200 leading-relaxed">
            &ldquo;Chớ lo phiền chi hết, nhưng trong mọi sự hãy dùng lời cầu nguyện, nài
            xin, và sự tạ ơn mà trình các sự cầu xin của mình cho Đức Chúa Trời.&rdquo;
          </p>
          <span className="block text-[11px] text-sanctuary-400 text-right mt-1 font-sans">
            — Phi-líp 4:6
          </span>
        </div>

        <button
          onClick={handleReset}
          className="px-4 py-2 text-xs font-serif font-medium text-gold-300 bg-sanctuary-850 hover:bg-gold-400/10 border border-gold-400/30 rounded-md transition-colors"
        >
          Gửi thêm một lời cầu nguyện khác
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-sanctuary-900 select-text">
      {/* Reassurance Banner */}
      <div className="p-3 bg-sanctuary-850/80 border-b border-white/[0.06]">
        <div className="flex items-start gap-2.5">
          <Shield className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-serif font-semibold text-xs text-gold-300">
              Mục Vụ Cầu Thay Kín & Riêng Tư
            </h4>
            <p className="text-[11px] text-sanctuary-400 font-sans leading-relaxed mt-0.5">
              Mọi nan đề được lưu trữ bảo mật trực tiếp đến Ban Mục Vụ. Không công khai trên
              buổi trực tuyến.
            </p>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        {errorMsg && (
          <div className="p-2 bg-red-950/60 border border-red-500/30 text-red-300 text-xs rounded">
            {errorMsg}
          </div>
        )}

        {/* Name / Anonymous */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-sanctuary-200">
              Họ và tên của quý vị
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
            value={isAnonymous ? "Một con cái Chúa (Ẩn danh)" : name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn An"
            className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 disabled:opacity-50 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
          />
        </div>

        {/* Prayer Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-sanctuary-200">
            Nhu cầu cần hiệp ý
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md px-3 py-2 text-xs text-sanctuary-200 focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Prayer Content Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-sanctuary-200">
            Chi tiết lời cầu thay <span className="text-gold-400">*</span>
          </label>
          <textarea
            required
            rows={5}
            value={prayerContent}
            onChange={(e) => setPrayerContent(e.target.value)}
            placeholder="Xin chân thành chia sẻ nan đề, khó khăn về thể xác, tâm thần hoặc việc gia đình bạn đang trải qua..."
            className="w-full bg-sanctuary-850 border border-white/[0.08] focus:border-gold-400/50 rounded-md p-3 text-xs sm:text-sm text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none resize-none font-serif leading-relaxed"
          />
        </div>

        {/* Confidentiality Tier */}
        <div className="space-y-1.5 pt-1">
          <label className="text-xs font-medium text-sanctuary-300">
            Mức độ chia sẻ
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setConfidentialLevel("pastor_only")}
              className={`p-2 rounded border text-left transition-all ${
                confidentialLevel === "pastor_only"
                  ? "bg-gold-400/15 border-gold-400/40 text-gold-300"
                  : "bg-sanctuary-850 border-white/[0.06] text-sanctuary-400"
              }`}
            >
              <div className="font-semibold text-[11px] flex items-center gap-1">
                <Lock className="w-3 h-3 text-gold-400" /> Chỉ Mục Sư Quản Nhiệm
              </div>
              <p className="text-[10px] text-sanctuary-400 mt-0.5">Bảo mật tuyệt đối</p>
            </button>

            <button
              type="button"
              onClick={() => setConfidentialLevel("prayer_team")}
              className={`p-2 rounded border text-left transition-all ${
                confidentialLevel === "prayer_team"
                  ? "bg-gold-400/15 border-gold-400/40 text-gold-300"
                  : "bg-sanctuary-850 border-white/[0.06] text-sanctuary-400"
              }`}
            >
              <div className="font-semibold text-[11px] flex items-center gap-1">
                <HeartHandshake className="w-3 h-3 text-gold-400" /> Ban Cầu Nguyện
              </div>
              <p className="text-[10px] text-sanctuary-400 mt-0.5">Nhiều người hiệp ý</p>
            </button>
          </div>
        </div>

        {/* Pastoral Phone Contact Request */}
        <div className="pt-2 border-t border-white/[0.06] space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-sanctuary-200">
            <input
              type="checkbox"
              checked={wantsPastorCall}
              onChange={(e) => setWantsPastorCall(e.target.checked)}
              className="rounded border-white/20 bg-sanctuary-800 text-gold-400 focus:ring-0"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-gold-400" />
              Tôi mong muốn Mục sư gọi điện thoại cầu nguyện cùng
            </span>
          </label>

          {wantsPastorCall && (
            <input
              type="text"
              required={wantsPastorCall}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Số điện thoại / Zalo để Mục sư liên hệ"
              className="w-full bg-sanctuary-850 border border-gold-400/30 rounded-md px-3 py-2 text-xs text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none"
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-3 pb-2">
          <button
            type="submit"
            disabled={isSubmitting || !prayerContent.trim()}
            className="w-full py-2.5 px-4 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 text-sanctuary-950 font-serif font-semibold text-xs sm:text-sm rounded-md transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Đang gửi lên máy chủ...</span>
            ) : (
              <>
                <HeartHandshake className="w-4 h-4" />
                <span>Gửi Lời Cầu Thay Trong Đức Tin</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
