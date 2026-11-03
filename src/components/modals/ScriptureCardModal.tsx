"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  Palette,
  Upload,
  Sliders,
  Crop,
  Layers,
  Sun,
  Eye,
} from "lucide-react";

export interface ScripturePreset {
  reference: string;
  verse: string;
  theme: string;
}

export const SCRIPTURE_PRESETS: ScripturePreset[] = [
  {
    reference: "Thi-thiên 23:1-2",
    verse: "“Đức Giê-hô-va là Đấng chăn giữ tôi: tôi chẳng thiếu thốn gì. Ngài khiến tôi an nghỉ nơi đồng cỏ xanh tươi, dẫn tôi đến mé nước bình tịnh.”",
    theme: "Bình An & An Nghỉ",
  },
  {
    reference: "Giăng 14:27",
    verse: "“Ta để sự bình an lại cho các ngươi; Ta ban sự bình an của Ta cho các ngươi. Ta cho các ngươi sự bình an chẳng phải như thế gian cho. Lòng các ngươi chớ hề bối rối và đừng sợ hãi.”",
    theme: "Vững Lòng Trông Cậy",
  },
  {
    reference: "Phi-líp 4:6-7",
    verse: "“Chớ lo phiền chi hết, nhưng trong mọi sự hãy dùng lời cầu nguyện, nài xin, và sự tạ ơn mà trình các sự cầu xin của mình cho Đức Chúa Trời.”",
    theme: "Trao Phó Lo Âu",
  },
  {
    reference: "Rô-ma 8:28",
    verse: "“Vả, chúng ta biết rằng mọi sự hiệp lại làm ích cho kẻ yêu mến Đức Chúa Trời, tức là cho kẻ được gọi theo ý muốn Ngài đã định.”",
    theme: "Ý Muốn Tốt Lành",
  },
  {
    reference: "Ca-thương 3:22-23",
    verse: "“Ấy là nhờ sự nhân từ Đức Giê-hô-va mà chúng ta chưa tuyệt; vì sự thương xót của Ngài chẳng dứt. Mỗi buổi sớm mai lại mới luôn, sự thành tín Ngài là lớn lắm.”",
    theme: "Ơn Mới Mỗi Sớm Mai",
  },
  {
    reference: "Châm-ngôn 3:5-6",
    verse: "“Hãy hết lòng tin cậy Đức Giê-hô-va, chớ nương cậy nơi sự thông sáng của con; phàm trong các việc làm của con, khá nhận biết Ngài, thì Ngài sẽ chỉ dẫn các nẻo của con.”",
    theme: "Dẫn Đường Chỉ Lối",
  },
];

export interface BackgroundArtTheme {
  id: string;
  tag: string;
  imageUrl: string;
  accentColor: string;
  pillBg: string;
  borderStyle: "ornate" | "minimal" | "none";
}

export const SACRED_ART_THEMES: BackgroundArtTheme[] = [
  {
    id: "golden-dawn",
    tag: "Tia Nắng Sớm",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#f5d061",
    pillBg: "rgba(245, 208, 97, 0.2)",
    borderStyle: "ornate",
  },
  {
    id: "sunset-cross",
    tag: "Tôn Nghiêm",
    imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#f4a261",
    pillBg: "rgba(244, 162, 97, 0.25)",
    borderStyle: "ornate",
  },
  {
    id: "sacred-scripture",
    tag: "Tĩnh Nguyện",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#e9c46a",
    pillBg: "rgba(233, 196, 106, 0.25)",
    borderStyle: "ornate",
  },
  {
    id: "tranquil-lake",
    tag: "Bình An",
    imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#90e0ef",
    pillBg: "rgba(144, 224, 239, 0.2)",
    borderStyle: "minimal",
  },
  {
    id: "misty-forest",
    tag: "Thiên Nhiên",
    imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#a7c957",
    pillBg: "rgba(167, 201, 87, 0.2)",
    borderStyle: "minimal",
  },
  {
    id: "starlit-heavens",
    tag: "Vĩ Đại",
    imageUrl: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#c77dff",
    pillBg: "rgba(199, 125, 255, 0.25)",
    borderStyle: "ornate",
  },
  {
    id: "golden-harvest",
    tag: "Phước Hạnh",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    accentColor: "#e09f3e",
    pillBg: "rgba(224, 159, 62, 0.25)",
    borderStyle: "minimal",
  },
];

interface ScriptureCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVerse?: string;
  initialReference?: string;
  initialImageUrl?: string;
  churchName?: string;
}

export const ScriptureCardModal: React.FC<ScriptureCardModalProps> = ({
  isOpen,
  onClose,
  initialVerse = "",
  initialReference = "",
  initialImageUrl = "",
  churchName = "Thờ Phượng Trực Tuyến",
}) => {
  const [verseText, setVerseText] = useState(
    initialVerse || SCRIPTURE_PRESETS[0].verse
  );
  const [reference, setReference] = useState(
    initialReference || SCRIPTURE_PRESETS[0].reference
  );
  const [selectedThemeId, setSelectedThemeId] = useState<string>("golden-dawn");
  const [customImage, setCustomImage] = useState<string | null>(initialImageUrl || null);
  const [ratio, setRatio] = useState<"square" | "story">("square"); // 1:1 or 9:16
  const [overlayDarkness, setOverlayDarkness] = useState<number>(0.52);
  const [fontStyle, setFontStyle] = useState<"serif" | "sans">("serif");
  const [borderMode, setBorderMode] = useState<"ornate" | "minimal" | "none">("ornate");
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initial props when opened
  useEffect(() => {
    if (initialVerse) setVerseText(initialVerse);
    if (initialReference) setReference(initialReference);
    if (initialImageUrl) setCustomImage(initialImageUrl);
  }, [initialVerse, initialReference, initialImageUrl]);

  const currentTheme =
    SACRED_ART_THEMES.find((t) => t.id === selectedThemeId) || SACRED_ART_THEMES[0];
  const activeImageUrl = customImage || currentTheme.imageUrl;

  // Handle custom image upload from computer or phone
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper: word-wrap text on HTML5 Canvas with auto line centering
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  // Draw full-canvas image with cover-crop (no squishing)
  const drawCoverImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    canvasW: number,
    canvasH: number
  ) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvasW / canvasH;
    let renderW = canvasW;
    let renderH = canvasH;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasRatio > imgRatio) {
      renderH = canvasW / imgRatio;
      offsetY = (canvasH - renderH) / 2;
    } else {
      renderW = canvasH * imgRatio;
      offsetX = (canvasW - renderW) / 2;
    }
    ctx.drawImage(img, offsetX, offsetY, renderW, renderH);
  };

  // Render High-Resolution Canvas Card
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isStory = ratio === "story";
    const W = 1080;
    const H = isStory ? 1920 : 1080;
    canvas.width = W;
    canvas.height = H;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = activeImageUrl;

    const renderCard = () => {
      // 1. Draw Background Image
      try {
        drawCoverImage(ctx, img, W, H);
      } catch {
        // Fallback rich dark gradient if image fails
        const fallbackGrad = ctx.createLinearGradient(0, 0, W, H);
        fallbackGrad.addColorStop(0, "#1c150c");
        fallbackGrad.addColorStop(1, "#0a0c10");
        ctx.fillStyle = fallbackGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // 2. Cinematic Dark Scrim Overlay (ensures maximum legibility)
      const scrim = ctx.createLinearGradient(0, 0, 0, H);
      scrim.addColorStop(0, `rgba(0, 0, 0, ${Math.min(0.85, overlayDarkness + 0.15)})`);
      scrim.addColorStop(0.3, `rgba(0, 0, 0, ${overlayDarkness})`);
      scrim.addColorStop(0.7, `rgba(0, 0, 0, ${overlayDarkness})`);
      scrim.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.92, overlayDarkness + 0.25)})`);
      ctx.fillStyle = scrim;
      ctx.fillRect(0, 0, W, H);

      // Radial glowing sacred center light
      const centerY = isStory ? H * 0.46 : H / 2;
      const radial = ctx.createRadialGradient(W / 2, centerY, 60, W / 2, centerY, isStory ? 700 : 520);
      radial.addColorStop(0, `${currentTheme.accentColor}25`);
      radial.addColorStop(1, "transparent");
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W, H);

      // 3. Ornate Golden Borders (if enabled)
      if (borderMode === "ornate") {
        ctx.strokeStyle = `${currentTheme.accentColor}55`;
        ctx.lineWidth = 3;
        ctx.strokeRect(45, 45, W - 90, H - 90);

        ctx.strokeStyle = `${currentTheme.accentColor}25`;
        ctx.lineWidth = 1.2;
        ctx.strokeRect(58, 58, W - 116, H - 116);

        // Corner decorative flourishes
        const drawCorner = (x: number, y: number, angle: number) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((angle * Math.PI) / 180);
          ctx.strokeStyle = currentTheme.accentColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(0, 0);
          ctx.lineTo(0, -20);
          ctx.stroke();

          // Small diamond dot at corner
          ctx.fillStyle = currentTheme.accentColor;
          ctx.fillRect(-3, -3, 6, 6);
          ctx.restore();
        };
        drawCorner(45, 45, 180);
        drawCorner(W - 45, 45, 270);
        drawCorner(W - 45, H - 45, 0);
        drawCorner(45, H - 45, 90);
      } else if (borderMode === "minimal") {
        ctx.strokeStyle = `${currentTheme.accentColor}40`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, 40, W - 80, H - 80);
      }

      // 4. Header: Sacred Cross Symbol & Title Ribbon
      const headerTopY = isStory ? 180 : 110;
      ctx.fillStyle = currentTheme.accentColor;
      ctx.strokeStyle = currentTheme.accentColor;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";

      // Cross Symbol
      const crossCenterX = W / 2;
      ctx.beginPath();
      ctx.moveTo(crossCenterX, headerTopY);
      ctx.lineTo(crossCenterX, headerTopY + 48);
      ctx.moveTo(crossCenterX - 16, headerTopY + 16);
      ctx.lineTo(crossCenterX + 16, headerTopY + 16);
      ctx.stroke();

      // Top Tagline
      ctx.textAlign = "center";
      ctx.font = "bold 20px 'Plus Jakarta Sans', sans-serif";
      ctx.letterSpacing = "6px";
      ctx.fillStyle = currentTheme.accentColor;
      ctx.shadowColor = "rgba(0,0,0,0.85)";
      ctx.shadowBlur = 10;
      ctx.fillText("LỜI CHÚA HẰNG SỐNG", W / 2, headerTopY + 84);
      ctx.shadowBlur = 0;

      // Subtle Divider
      ctx.strokeStyle = `${currentTheme.accentColor}60`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W / 2 - 70, headerTopY + 104);
      ctx.lineTo(W / 2 + 70, headerTopY + 104);
      ctx.stroke();

      // 5. Giant Ornate Opening Quotation Mark
      const quoteY = isStory ? headerTopY + 230 : 330;
      ctx.fillStyle = `${currentTheme.accentColor}45`;
      ctx.font = "bold 140px 'Lora', Georgia, serif";
      ctx.fillText("“", W / 2, quoteY);

      // 6. Main Scripture Text
      const fontName = fontStyle === "serif" ? "'Lora', Georgia, serif" : "'Plus Jakarta Sans', sans-serif";
      const cleanVerse = verseText.replace(/^[“”"]+|[“”"]+$/g, "");
      const formattedText = `“${cleanVerse}”`;

      // Dynamic font size depending on length & ratio
      let fontSize = 42;
      if (verseText.length > 200) fontSize = 32;
      else if (verseText.length > 140) fontSize = 36;
      else if (verseText.length > 80) fontSize = 42;
      else fontSize = 48;

      if (isStory) fontSize = Math.round(fontSize * 1.15);

      const lineHeight = fontSize * 1.6;
      ctx.font = `italic 500 ${fontSize}px ${fontName}`;
      ctx.fillStyle = "#ffffff";
      ctx.letterSpacing = "0px";

      // Enhanced text shadow for 3D depth and legibility over photos
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 18;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      const verseStartY = isStory ? headerTopY + 310 : 380;
      const endY = wrapText(ctx, formattedText, W / 2, verseStartY, W - 240, lineHeight);
      ctx.shadowBlur = 0;

      // 7. Scripture Reference Pill Badge
      const refY = Math.max(endY + 45, isStory ? H * 0.68 : 740);

      // Draw glowing pill badge behind reference
      ctx.font = `bold 26px 'Lora', Georgia, serif`;
      const refText = `— ${reference.toUpperCase()} —`;
      const textMetrics = ctx.measureText(refText);
      const pillW = textMetrics.width + 60;
      const pillH = 50;
      const pillX = W / 2 - pillW / 2;
      const pillY = refY - 34;

      // Pill Background
      ctx.fillStyle = currentTheme.pillBg;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 25);
      ctx.fill();

      // Pill Border
      ctx.strokeStyle = `${currentTheme.accentColor}80`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pill Text
      ctx.fillStyle = currentTheme.accentColor;
      ctx.letterSpacing = "3px";
      ctx.fillText(refText, W / 2, refY);

      // 8. Footer Watermark & Branding
      const footerY = H - (isStory ? 140 : 80);
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
      ctx.letterSpacing = "3px";
      ctx.fillText(`NỀN TẢNG THỜ PHƯỢNG TRỰC TUYẾN • ${churchName.toUpperCase()}`, W / 2, footerY);

      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.font = "13px 'Plus Jakarta Sans', sans-serif";
      ctx.letterSpacing = "1px";
      ctx.fillText("Nuôi dưỡng tâm linh • Chia sẻ phước hạnh mỗi ngày", W / 2, footerY + 26);
    };

    img.onload = () => {
      setImageLoaded(true);
      renderCard();
    };
    img.onerror = () => {
      setImageLoaded(false);
      renderCard();
    };

    if (img.complete) {
      renderCard();
    }
  }, [
    isOpen,
    verseText,
    reference,
    selectedThemeId,
    customImage,
    ratio,
    overlayDarkness,
    fontStyle,
    borderMode,
    churchName,
    activeImageUrl,
  ]);

  if (!isOpen) return null;

  // Action: Download High-Res Image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDownloading(true);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeRef = reference.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
      link.download = `thiep-loi-chua-${safeRef || "kinh-thanh"}-${ratio}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Lỗi tải thiệp:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  // Action: Copy Text & Link for Zalo
  const handleCopyForZalo = () => {
    const cleanVerse = verseText.replace(/^[“”"]+|[“”"]+$/g, "");
    const shareText = `🕊️ LỜI CHÚA HÔM NAY:\n“${cleanVerse}”\n— ${reference} —\n\nTham dự phòng thờ phượng trực tuyến tại:\n${window.location.origin}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Action: Share on Facebook
  const handleShareFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=600,height=500");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[95vh] bg-[#101217] border border-[#c5a059]/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-white/[0.08] bg-black/50">
          <div className="flex items-center gap-2.5">
            <div>
              <h3 className="font-serif text-sm sm:text-base font-bold text-stone-100 flex items-center gap-2">
                <span>Thiết Kế Thiệp Lời Chúa</span>
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Left Canvas Preview, Right Customization Tools */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column: Live Canvas Preview (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/40 p-3 sm:p-4 rounded-xl border border-white/5">
            <div
              className={`w-full max-w-[340px] sm:max-w-[380px] rounded-xl overflow-hidden shadow-2xl border border-white/10 relative transition-all duration-300 ${ratio === "story" ? "aspect-[9/16] max-h-[520px]" : "aspect-square"
                }`}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain select-none"
              />
            </div>

            <div className="mt-3 flex items-center justify-between w-full max-w-[340px] sm:max-w-[380px] text-[11px] text-stone-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-[#c5a059]" />
                Xem trước thời gian thực
              </span>
              <span className="font-mono text-stone-300">
                {ratio === "square" ? "1080 × 1080 (1:1)" : "1080 × 1920 (9:16)"}
              </span>
            </div>
          </div>

          {/* Right Column: Customization Controls (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Ratio Selector (Square vs Story) */}
            <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-serif font-bold text-stone-300 flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-[#c5a059]" />
                Khổ Ảnh:
              </span>
              <div className="flex items-center gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => setRatio("square")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-serif font-semibold transition-all border cursor-pointer ${ratio === "square"
                    ? "bg-[#c5a059] text-stone-950 border-[#c5a059] shadow-sm font-bold"
                    : "bg-stone-900 hover:bg-stone-850 text-stone-300 border-white/5"
                    }`}
                >
                  Vuông (1:1)
                </button>
                <button
                  type="button"
                  onClick={() => setRatio("story")}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-serif font-semibold transition-all border cursor-pointer ${ratio === "story"
                    ? "bg-[#c5a059] text-stone-950 border-[#c5a059] shadow-sm font-bold"
                    : "bg-stone-900 hover:bg-stone-850 text-stone-300 border-white/5"
                    }`}
                >
                  Dọc (9:16)
                </button>
              </div>
            </div>

            {/* 2. Background Art Gallery (Real Photography) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-serif font-bold text-stone-200 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-[#c5a059]" />
                  Chọn Tranh Nền Thánh Ca & Thiên Nhiên:
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-serif text-[#c5a059] hover:text-[#f5d996] flex items-center gap-1 underline cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Tải ảnh của bạn</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Photo Thumbnail Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {SACRED_ART_THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id && !customImage;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => {
                        setSelectedThemeId(theme.id);
                        setCustomImage(null);
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all group cursor-pointer text-left ${isSelected
                        ? "border-[#c5a059] ring-2 ring-[#c5a059]/40 shadow-candle"
                        : "border-white/10 hover:border-white/30 opacity-75 hover:opacity-100"
                        }`}
                    >
                      <img
                        src={theme.imageUrl}
                        alt={theme.tag}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#c5a059] rounded-full flex items-center justify-center text-stone-950">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Quick Scripture Verse Presets */}
            <div>
              <label className="text-[11px] font-serif uppercase tracking-wider text-[#c5a059] font-bold block mb-1.5">
                Gợi Ý Câu Gốc Nuôi Dưỡng Tâm Linh:
              </label>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SCRIPTURE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setVerseText(p.verse);
                      setReference(p.reference);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-serif whitespace-nowrap transition-colors border cursor-pointer ${reference === p.reference
                      ? "bg-[#c5a059] text-stone-950 font-bold border-[#c5a059]"
                      : "bg-stone-900 hover:bg-stone-850 text-stone-300 border-white/5"
                      }`}
                  >
                    {p.reference}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Scripture Verse Text Input */}
            <div>
              <label className="text-xs font-serif font-semibold text-stone-300 block mb-1">
                Lời Kinh Thánh (Có thể tự do chỉnh sửa):
              </label>
              <textarea
                rows={2}
                value={verseText}
                onChange={(e) => setVerseText(e.target.value)}
                placeholder="Nhập câu Kinh Thánh..."
                className="w-full p-2.5 rounded-lg bg-stone-900 border border-white/10 text-xs text-stone-100 font-serif focus:border-[#c5a059] focus:outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* 5. Scripture Reference Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-serif font-semibold text-stone-300 block mb-1">
                  Địa chỉ:
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Ví dụ: Thi-thiên 23:1-2"
                  className="w-full p-2 rounded-lg bg-stone-900 border border-white/10 text-xs text-stone-100 font-serif focus:border-[#c5a059] focus:outline-none transition-colors"
                />
              </div>

              {/* Darkness Overlay Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-serif font-semibold text-stone-300 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-[#c5a059]" />
                    Độ Tối Nền Làm Rõ Chữ:
                  </label>
                  <span className="text-[10px] font-mono text-stone-400">
                    {Math.round(overlayDarkness * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.02"
                  value={overlayDarkness}
                  onChange={(e) => setOverlayDarkness(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
                />
              </div>
            </div>

            {/* 6. Border Style & Font Options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-serif font-semibold text-stone-300 block mb-1">
                  Kiểu Khung Viền:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBorderMode("ornate")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-serif border cursor-pointer ${borderMode === "ornate"
                      ? "bg-[#c5a059] text-stone-950 font-bold border-[#c5a059]"
                      : "bg-stone-900 text-stone-300 border-white/5"
                      }`}
                  >
                    Khung
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorderMode("minimal")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-serif border cursor-pointer ${borderMode === "minimal"
                      ? "bg-[#c5a059] text-stone-950 font-bold border-[#c5a059]"
                      : "bg-stone-900 text-stone-300 border-white/5"
                      }`}
                  >
                    Viền Nhẹ
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorderMode("none")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-serif border cursor-pointer ${borderMode === "none"
                      ? "bg-[#c5a059] text-stone-950 font-bold border-[#c5a059]"
                      : "bg-stone-900 text-stone-300 border-white/5"
                      }`}
                  >
                    Không viền
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-serif font-semibold text-stone-300 block mb-1">
                  Kiểu Chữ:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFontStyle("serif")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-serif border cursor-pointer ${fontStyle === "serif"
                      ? "bg-[#c5a059] text-stone-950 font-bold border-[#c5a059]"
                      : "bg-stone-900 text-stone-300 border-white/5"
                      }`}
                  >
                    Serif Lora
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontStyle("sans")}
                    className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-sans border cursor-pointer ${fontStyle === "sans"
                      ? "bg-[#c5a059] text-stone-950 font-bold border-[#c5a059]"
                      : "bg-stone-900 text-stone-300 border-white/5"
                      }`}
                  >
                    Sans Hiện Đại
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Action Buttons */}
        <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-black/50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy for Zalo Button */}
            <button
              onClick={handleCopyForZalo}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-serif transition-all cursor-pointer border ${copied
                ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                : "bg-stone-850 hover:bg-stone-800 text-stone-200 border-white/10"
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã Sao Chép! Dán Vào Zalo Ngay</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#c5a059]" />
                  <span>Sao Chép Cho Zalo</span>
                </>
              )}
            </button>

            {/* Share Facebook */}
            <button
              onClick={handleShareFacebook}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-serif bg-[#1877f2]/20 hover:bg-[#1877f2]/30 text-blue-300 border border-[#1877f2]/40 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Chia Sẻ Facebook</span>
            </button>
          </div>

          {/* Main Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-stone-950 font-serif font-bold text-xs hover:brightness-110 transition-all shadow-candle cursor-pointer"
          >
            <Download className="w-4 h-4 fill-stone-950" />
            <span>Tải Thiệp Về Máy (PNG 1080p)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ScriptureCardModal;
