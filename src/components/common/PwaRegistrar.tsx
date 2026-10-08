"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Share2, PlusSquare, Sparkles, Smartphone } from "lucide-react";

export function PwaRegistrar() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("PWA Service Worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already installed in standalone mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        return; // Already installed, do not show prompt
      }

      // Check if user dismissed banner recently (within 7 days)
      const dismissedAt = localStorage.getItem("church_pwa_dismissed_at");
      if (dismissedAt) {
        const diffDays =
          (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (diffDays < 7) {
          return;
        }
      }

      // 3. Detect iOS Safari
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      const isSafari =
        isIosDevice &&
        !/crios|fxios|optios/.test(userAgent) &&
        /safari/.test(userAgent);

      if (isIosDevice) {
        setIsIos(true);
        // Show gentle iOS install banner after 5 seconds
        const timer = setTimeout(() => {
          setShowInstallBanner(true);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }

    // 4. Capture Android/Chrome/Edge beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("church_pwa_dismissed_at", String(Date.now()));
    }
  };

  if (!showInstallBanner) return null;

  return (
    <>
      {/* Floating PWA Install Bar at bottom of screen */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn">
        <div className="bg-[#14171e]/95 backdrop-blur-md border border-[#c5a059]/40 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Icon Avatar */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1e2430] to-[#0f1115] border border-[#c5a059]/40 flex items-center justify-center shrink-0 shadow-md">
              <svg
                viewBox="0 0 100 100"
                className="w-6 h-6 text-[#c5a059] fill-current"
              >
                <rect x="42" y="10" width="16" height="80" rx="4" />
                <rect x="22" y="30" width="56" height="16" rx="4" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-100 truncate">
                  Cài Đặt Ứng Dụng Hội Thánh
                </h4>
                <Sparkles className="w-3 h-3 text-[#c5a059] shrink-0" />
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                Mở nhanh 1 chạm, toàn màn hình cho quý cụ và tín hữu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b38e47] text-sanctuary-950 font-serif font-bold text-xs hover:brightness-110 transition-all shadow-md cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cài Đặt</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
              title="Để sau"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Instruction Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-stone-900 border border-[#c5a059]/40 rounded-3xl p-5 shadow-2xl text-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#c5a059]" />
                <h3 className="font-serif font-bold text-base text-white">
                  Cài Đặt Trên iPhone / iPad
                </h3>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-stone-300">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-850 border border-stone-800">
                <span className="w-5 h-5 rounded-full bg-[#c5a059]/20 text-[#f6d78d] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <p>
                  Nhấn vào nút <strong>Chia sẻ</strong>{" "}
                  <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-400" /> ở thanh công cụ dưới cùng của trình duyệt Safari.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-850 border border-stone-800">
                <span className="w-5 h-5 rounded-full bg-[#c5a059]/20 text-[#f6d78d] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <p>
                  Cuộn xuống và chọn{" "}
                  <strong className="text-white">&quot;Thêm vào MH chính&quot;</strong> (Add to Home Screen){" "}
                  <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-400" />.
                </p>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-850 border border-stone-800">
                <span className="w-5 h-5 rounded-full bg-[#c5a059]/20 text-[#f6d78d] font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <p>
                  Nhấn nút <strong className="text-amber-300">&quot;Thêm&quot; (Add)</strong> ở góc trên bên phải màn hình để hoàn tất.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIosGuide(false);
                setShowInstallBanner(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#c5a059] text-sanctuary-950 font-serif font-bold text-xs cursor-pointer hover:brightness-110 transition-all shadow-md"
            >
              Đã Hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
}
