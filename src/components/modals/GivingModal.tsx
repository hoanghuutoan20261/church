"use client";

import React, { useState } from "react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import { X, Copy, Check, Landmark } from "lucide-react";

export const GivingModal: React.FC = () => {
  const { church, activeModal, closeModal } = useWorship();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (activeModal !== "giving") return null;

  const banking = church?.bankingConfig || {
    bankName: worshipData.givingInfo.bankName,
    accountNumber: worshipData.givingInfo.accountNumber,
    accountHolder: worshipData.givingInfo.accountName,
    branch: worshipData.givingInfo.branch,
  };

  const transferSyntax = `DH [HoTen] ${church.slug.toUpperCase()}`;

  // Clean account number for VietQR
  const cleanAcc = banking.accountNumber.replace(/\s+/g, "");
  // Standard Napas VietQR format
  const qrUrl = `https://api.vietqr.io/image/970422-${cleanAcc}-b1X589K.jpg?accountName=${encodeURIComponent(
    banking.accountHolder
  )}&amount=0&addInfo=${encodeURIComponent("DANG HIEN " + church.slug.toUpperCase())}`;

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="giving-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 animate-fadeIn"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-sanctuary-950 border border-gold-400/30 rounded-lg p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-md text-sanctuary-400 hover:text-sanctuary-100 hover:bg-sanctuary-850 transition-colors"
          aria-label="Đóng cửa sổ dâng hiến"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="w-10 h-10 rounded-full bg-gold-400/15 border border-gold-400/40 mx-auto flex items-center justify-center text-gold-400 mb-2">
            <Landmark className="w-5 h-5" />
          </div>
          <h2
            id="giving-modal-title"
            className="font-serif text-lg sm:text-xl font-bold text-sanctuary-100 tracking-normal"
          >
            Dâng Hiến — {church.name}
          </h2>
          <p className="text-xs text-sanctuary-300 font-serif italic max-w-sm mx-auto">
            &ldquo;Mỗi người nên quyên theo lòng mình đã định, không phải phàn nàn hay vì
            miễn cưỡng; vì Đức Chúa Trời yêu kẻ thí của cách vui lòng.&rdquo;
          </p>
          <span className="block text-[11px] text-sanctuary-400 font-sans">
            — 2 Cô-rinh-tô 9:7
          </span>
        </div>

        {/* VietQR Code Visual */}
        <div className="bg-white p-3 rounded-lg max-w-[210px] mx-auto shadow-sm border border-stone-200 text-center">
          <img
            src={qrUrl}
            alt={`Mã VietQR dâng hiến ${church.name}`}
            className="w-full h-auto aspect-square object-contain mx-auto"
            loading="lazy"
          />
          <p className="text-[10px] font-sans font-semibold text-stone-700 mt-1">
            Quét bằng mọi ứng dụng Ngân hàng / Napas 247
          </p>
        </div>

        {/* Bank Details Table */}
        <div className="bg-sanctuary-850/80 border border-white/[0.08] rounded-md p-3.5 space-y-2.5 text-xs font-sans">
          {/* Bank Name */}
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="text-sanctuary-400">Ngân hàng:</span>
            <span className="font-semibold text-sanctuary-100 text-right">
              {banking.bankName}
            </span>
          </div>

          {/* Account Number with Copy */}
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="text-sanctuary-400">Số tài khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-gold-300">
                {banking.accountNumber}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(banking.accountNumber, "accountNumber")
                }
                className="px-2 py-0.5 rounded bg-sanctuary-800 hover:bg-sanctuary-750 text-sanctuary-300 hover:text-white border border-white/10 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedField === "accountNumber" ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-300">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <span className="text-sanctuary-400">Chủ tài khoản:</span>
            <span className="font-semibold text-sanctuary-100 uppercase text-right">
              {banking.accountHolder}
            </span>
          </div>

          {/* Transfer Memo Syntax with Copy */}
          <div className="flex items-center justify-between py-1">
            <span className="text-sanctuary-400">Cú pháp chuyển khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-gold-300 text-xs bg-sanctuary-900 px-2 py-0.5 rounded border border-white/5">
                {transferSyntax}
              </span>
              <button
                onClick={() =>
                  copyToClipboard(transferSyntax, "transferSyntax")
                }
                className="px-2 py-0.5 rounded bg-sanctuary-800 hover:bg-sanctuary-750 text-sanctuary-300 hover:text-white border border-white/10 text-[11px] flex items-center gap-1 transition-colors"
              >
                {copiedField === "transferSyntax" ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pastoral Assurance Note */}
        <p className="text-[11px] text-sanctuary-400 leading-relaxed text-center font-sans">
          Mọi sự dâng hiến đều được quản nhiệm và sử dụng vì mục đích thờ phượng, truyền
          giáo và công tác thiện nguyện của {church.name}.
        </p>

        {/* Confirmation Button */}
        <div className="pt-1 text-center">
          <button
            onClick={closeModal}
            className="w-full py-2 bg-sanctuary-850 hover:bg-sanctuary-800 border border-white/15 text-sanctuary-200 text-xs font-serif font-medium rounded-md transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
