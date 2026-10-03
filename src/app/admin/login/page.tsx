"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Church,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ Email và Mật khẩu.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Đăng nhập không thành công.");
        setIsLoading(false);
        return;
      }

      // Success -> Redirect to Admin Dashboard
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMessage("Lỗi kết nối máy chủ. Xin vui lòng thử lại sau.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#f3f4f6] flex flex-col justify-between selection:bg-[#c5a059]/30 selection:text-[#f3f4f6] font-sans">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Về Cổng Kết Nối Các Hội Thánh</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#c5a059] font-serif">
          <ShieldCheck className="w-4 h-4" />
          <span>Cổng Quản Trị Mục Vụ & Kỹ Thuật</span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md bg-[#14161a] border border-stone-800 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-[#c5a059]/40 flex items-center justify-center mx-auto text-[#c5a059] shadow-sm">
              <Church className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-100">
              Đăng Nhập Quản Trị
            </h1>
            <p className="text-xs text-stone-400 font-sans leading-relaxed">
              Dành riêng cho Mục sư Quản nhiệm, Ban Chấp Sự và Ban Kỹ Thuật Hội Thánh
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/60 border border-red-500/30 text-red-200 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Email Quản Trị</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pastor@hoithanh.vn"
                required
                className="w-full bg-[#0c0d10] border border-stone-700/80 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#c5a059]" />
                <span>Mật Khẩu</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0c0d10] border border-stone-700/80 rounded-lg px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#c5a059] hover:bg-[#d6b068] text-stone-950 font-serif font-bold text-xs sm:text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>Vào Bảng Quản Trị Mục Vụ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-stone-400 space-y-2">
            <p>
              Hội Thánh chưa có tài khoản?{" "}
              <Link
                href="/#register"
                className="text-[#c5a059] hover:underline font-medium"
              >
                Đăng ký Hội Thánh mới
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Solemn Footer */}
      <footer className="py-4 text-center text-[11px] text-stone-500 border-t border-white/[0.05]">
        Hệ Thống Quản Trị Thờ Phượng & Kết Nối Các Hội Thánh Trực Tuyến Việt Nam
      </footer>
    </div>
  );
}
