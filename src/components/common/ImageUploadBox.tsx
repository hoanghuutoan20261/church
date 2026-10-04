"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Check, ImageIcon, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { compressImageClient, formatBytes } from "@/lib/imageCompressor";

interface ImageUploadBoxProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  type?: "avatar" | "cover" | "post" | "general";
  helperText?: string;
  presetSamples?: { name: string; url: string }[];
  aspectRatio?: "square" | "cover" | "post" | "auto";
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  value,
  onChange,
  type = "general",
  helperText,
  presetSamples = [],
  aspectRatio = "auto",
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStats, setUploadStats] = useState<{
    originalSize: number;
    savedSize: number;
    savedPercent: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showPresets, setShowPresets] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp tin hình ảnh hợp lệ (PNG, JPG, WebP...).");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setUploadStats(null);

    try {
      // 1. Client-side compression
      let maxWidth = 1400;
      let maxHeight = 1400;
      if (type === "avatar") {
        maxWidth = 400;
        maxHeight = 400;
      } else if (type === "cover") {
        maxWidth = 1920;
        maxHeight = 800;
      }

      const compressed = await compressImageClient(file, {
        maxWidth,
        maxHeight,
        quality: 0.82,
        mimeType: "image/webp",
      });

      // 2. Upload to server VPS
      const formData = new FormData();
      formData.append("file", compressed.file);
      formData.append("type", type);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Lỗi khi lưu ảnh lên máy chủ");
      }

      onChange(json.url);
      setUploadStats({
        originalSize: compressed.originalSize,
        savedSize: json.savedSize || compressed.compressedSize,
        savedPercent: json.savedPercent || compressed.compressionRatio,
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setErrorMsg(err.message || "Không thể tải ảnh lên máy chủ.");
    } finally {
      setIsUploading(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square max-w-[160px] mx-auto"
      : aspectRatio === "cover"
      ? "aspect-[16/6] w-full"
      : aspectRatio === "post"
      ? "aspect-[16/9] w-full"
      : "h-36 w-full";

  return (
    <div className="space-y-2">
      {/* Label and Presets toggle */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-serif font-bold text-stone-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#c5a059]" />
            <span>{label}</span>
          </label>
        )}

        {presetSamples.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] text-[#c5a059] hover:underline font-serif cursor-pointer ml-auto"
          >
            {showPresets ? "Đóng ảnh mẫu" : "⚡ Chọn ảnh mẫu Cơ Đốc"}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Main Upload Box / Preview Box */}
      {!value ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-[#c5a059] bg-[#c5a059]/10"
              : "border-stone-700 hover:border-[#c5a059]/70 bg-stone-900/60 hover:bg-stone-900"
          }`}
        >
          {isUploading ? (
            <div className="py-3 flex flex-col items-center gap-2 text-stone-300">
              <RefreshCw className="w-7 h-7 text-[#c5a059] animate-spin" />
              <p className="text-xs font-serif font-semibold">
                Đang nén ảnh & tải lên máy chủ VPS...
              </p>
              <p className="text-[10px] text-stone-400">
                (Tự động tối ưu WebP để tiết kiệm dung lượng)
              </p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-stone-800/80 border border-stone-700 flex items-center justify-center text-[#c5a059]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-serif font-bold text-stone-200">
                  Bấm để tải ảnh lên <span className="font-normal text-stone-400">hoặc kéo thả vào đây</span>
                </p>
                <p className="text-[10px] text-stone-400">
                  Lưu trực tiếp vào VPS • Tự động nén WebP giảm 80-95% dung lượng
                </p>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {/* Active Preview */}
          <div
            className={`relative rounded-xl overflow-hidden border border-stone-700 bg-stone-950 shadow-md ${aspectClass}`}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />

            {/* Top Action Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-2.5 py-1 rounded-full bg-black/75 hover:bg-black text-white text-[11px] font-serif border border-white/20 shadow-md backdrop-blur-sm flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
                title="Thay đổi ảnh khác"
              >
                <RefreshCw className={`w-3 h-3 ${isUploading ? "animate-spin" : ""}`} />
                <span>Đổi ảnh</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setUploadStats(null);
                }}
                className="p-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white shadow-md cursor-pointer transition-colors"
                title="Gỡ ảnh này"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Storage indicator tag */}
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-stone-300 border border-white/10 font-mono">
              {value.startsWith("/uploads/") ? "📁 Lưu trên VPS" : "🔗 Link ngoài"}
            </div>
          </div>
        </div>
      )}

      {/* Success Compression Stats Banner */}
      {uploadStats && (
        <div className="p-2 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-[11px] text-emerald-300 font-serif flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Đã tối ưu: {formatBytes(uploadStats.originalSize)} ➔{" "}
              <strong>{formatBytes(uploadStats.savedSize)}</strong> (-{uploadStats.savedPercent}%)
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Đã lưu VPS</span>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-2 bg-red-950/70 border border-red-500/40 rounded-lg text-[11px] text-red-300 font-serif flex items-center gap-1.5 animate-fadeIn">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Optional Preset Presets Samples */}
      {showPresets && presetSamples.length > 0 && (
        <div className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl space-y-1.5 animate-fadeIn">
          <p className="text-[10px] text-[#c5a059] font-serif">
            ⚡ Hoặc chạm vào một ảnh Cơ Đốc mẫu để áp dụng nhanh:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
            {presetSamples.map((ps, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(ps.url);
                  setShowPresets(false);
                  setUploadStats(null);
                }}
                className={`relative rounded-lg overflow-hidden border cursor-pointer group transition-all aspect-video ${
                  value === ps.url
                    ? "border-[#c5a059] ring-2 ring-[#c5a059]/50"
                    : "border-stone-800 hover:border-stone-600"
                }`}
              >
                <img
                  src={ps.url}
                  alt={ps.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                  <span className="text-[9px] text-white line-clamp-1 font-serif">
                    {ps.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {helperText && <p className="text-[10px] text-stone-400">{helperText}</p>}
    </div>
  );
};
