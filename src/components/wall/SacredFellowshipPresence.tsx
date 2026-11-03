"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Users,
  Flame,
  HeartHandshake,
  Sparkles,
  CheckCircle2,
  Compass,
  Radio,
  ChevronRight,
} from "lucide-react";
import { AmenIcon } from "@/components/common/AmenIcon";

interface LocationStats {
  id: string;
  name: string;
  region: "bac" | "trung" | "nam" | "taynguyen" | "hai-ngoai";
  activeCount: number;
  recentActivity: string;
  isPopular?: boolean;
}

const INITIAL_LOCATIONS: LocationStats[] = [
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    region: "nam",
    activeCount: 54,
    recentActivity: "Vừa hiệp ý Amen 1 phút trước",
    isPopular: true,
  },
  {
    id: "hanoi",
    name: "Thủ Đô Hà Nội",
    region: "bac",
    activeCount: 42,
    recentActivity: "Vừa gửi 1 lời cầu thay",
    isPopular: true,
  },
  {
    id: "danang",
    name: "Đà Nẵng & Miền Trung",
    region: "trung",
    activeCount: 26,
    recentActivity: "Đang tham dự phòng thờ phượng",
  },
  {
    id: "daklak",
    name: "Tây Nguyên (Đắk Lắk, Gia Lai)",
    region: "taynguyen",
    activeCount: 31,
    recentActivity: "Hiệp ý bài hát Thánh Ca",
    isPopular: true,
  },
  {
    id: "cantho",
    name: "Miền Tây (Cần Thơ, Tiền Giang)",
    region: "nam",
    activeCount: 19,
    recentActivity: "Đang đọc Lời Chúa mỗi ngày",
  },
  {
    id: "haiphong",
    name: "Hải Phòng & Quảng Ninh",
    region: "bac",
    activeCount: 16,
    recentActivity: "Vừa hiệp ý Amen",
  },
  {
    id: "overseas",
    name: "Hải Ngoại (Hoa Kỳ, Úc, Hàn Quốc)",
    region: "hai-ngoai",
    activeCount: 28,
    recentActivity: "Theo dõi từ múi giờ xa",
    isPopular: true,
  },
];

interface SacredFellowshipPresenceProps {
  className?: string;
  compact?: boolean;
}

export const SacredFellowshipPresence: React.FC<SacredFellowshipPresenceProps> = ({
  className = "",
  compact = false,
}) => {
  const [locations, setLocations] = useState<LocationStats[]>(INITIAL_LOCATIONS);
  const [userJoinedLocation, setUserJoinedLocation] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [selectedLocId, setSelectedLocId] = useState<string>("hcm");
  const [hasLitCandle, setHasLitCandle] = useState<boolean>(false);
  const [blessingToast, setBlessingToast] = useState<string | null>(null);

  // Load user's previously joined location
  useEffect(() => {
    try {
      const savedLoc = localStorage.getItem("sacred_user_location");
      const savedCandle = localStorage.getItem("sacred_candle_lit");
      if (savedLoc) setUserJoinedLocation(savedLoc);
      if (savedCandle === "true") setHasLitCandle(true);
    } catch {}
  }, []);

  const totalActive = locations.reduce((sum, l) => sum + l.activeCount, 0);

  const handleLightCandle = (locId: string) => {
    const loc = locations.find((l) => l.id === locId);
    if (!loc) return;

    setLocations((prev) =>
      prev.map((l) =>
        l.id === locId ? { ...l, activeCount: l.activeCount + 1, recentActivity: "Vừa thắp sáng lời cầu nguyện!" } : l
      )
    );

    setUserJoinedLocation(loc.name);
    setHasLitCandle(true);
    setShowLocationPicker(false);

    try {
      localStorage.setItem("sacred_user_location", loc.name);
      localStorage.setItem("sacred_candle_lit", "true");
    } catch {}

    setBlessingToast(`Nguyện Chúa ban phước dư dật trên bạn cùng gia đình tại ${loc.name}! 🙏`);
    setTimeout(() => {
      setBlessingToast(null);
    }, 5000);
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-b from-[#14171e] via-[#101217] to-[#0c0e12] border border-[#c5a059]/30 p-3.5 sm:p-4 shadow-xl select-none relative overflow-hidden ${className}`}
    >
      {/* Sacred Ambient Backlight */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059]">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <span className="text-[10px] font-serif uppercase tracking-widest text-[#c5a059] font-bold block">
              Hiệp Một Khắp Nơi
            </span>
            <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-100 flex items-center gap-1.5">
              <span>Bản Đồ Hiệp Nguyện Toàn Quốc</span>
            </h4>
          </div>
        </div>

        {/* Pulsing Live Badge */}
        <div className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-mono text-emerald-300 font-semibold">
            {totalActive} Tín Hữu
          </span>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-3 gap-1.5 py-3 border-b border-white/[0.06] text-center relative z-10">
        <div className="bg-black/35 p-2 rounded-xl border border-white/5">
          <span className="block font-serif text-sm sm:text-base font-bold text-[#f5d996]">
            {totalActive}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-stone-400">
            Đang Kết Nối
          </span>
        </div>
        <div className="bg-black/35 p-2 rounded-xl border border-white/5">
          <span className="block font-serif text-sm sm:text-base font-bold text-amber-300">
            28+
          </span>
          <span className="text-[9px] uppercase tracking-wider text-stone-400">
            Tỉnh Thành
          </span>
        </div>
        <div className="bg-black/35 p-2 rounded-xl border border-white/5">
          <span className="block font-serif text-sm sm:text-base font-bold text-[#c5a059]">
            1,450+
          </span>
          <span className="text-[9px] uppercase tracking-wider text-stone-400">
            Lượt Amen
          </span>
        </div>
      </div>

      {/* Top Active Fellowship Locations */}
      <div className="space-y-1.5 py-3 relative z-10">
        <span className="text-[10px] uppercase tracking-wider text-stone-400 font-serif font-semibold block px-1">
          Khu Vực Đang Cùng Hiệp Ý:
        </span>

        <div className="space-y-1 max-h-52 overflow-y-auto no-scrollbar pr-0.5">
          {locations.slice(0, compact ? 4 : 7).map((loc) => {
            const isUserHere = userJoinedLocation === loc.name;

            return (
              <div
                key={loc.id}
                className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all border ${
                  isUserHere
                    ? "bg-[#c5a059]/15 border-[#c5a059]/50 text-[#f5d996]"
                    : "bg-stone-900/50 hover:bg-stone-850/80 border-white/[0.04] text-stone-300"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="relative shrink-0">
                    <MapPin
                      className={`w-3.5 h-3.5 ${
                        isUserHere ? "text-[#c5a059]" : "text-stone-400"
                      }`}
                    />
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif font-medium truncate text-stone-200">
                        {loc.name}
                      </span>
                      {isUserHere && (
                        <span className="text-[9px] bg-[#c5a059]/25 text-[#c5a059] px-1.5 py-0.2 rounded font-sans font-semibold">
                          Bạn ở đây
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 block truncate font-sans">
                      {loc.recentActivity}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1.5 pl-2">
                  <span className="font-mono text-[11px] font-semibold text-stone-300">
                    {loc.activeCount}
                  </span>
                  <span className="text-[9px] text-stone-500">người</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action: Thắp sáng ngọn nến hiệp nguyện */}
      <div className="pt-2 border-t border-white/[0.08] relative z-10">
        {hasLitCandle && userJoinedLocation ? (
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/30 text-xs text-[#f5d996]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 shrink-0 animate-bounce" />
              <span className="text-[11px]">
                Bạn đã thắp sáng lời cầu nguyện từ <strong>{userJoinedLocation}</strong>!
              </span>
            </div>
            <button
              onClick={() => setShowLocationPicker(true)}
              className="text-[10px] text-stone-400 hover:text-stone-200 underline cursor-pointer"
            >
              Đổi
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLocationPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-stone-950 font-serif font-bold text-xs hover:brightness-110 transition-all shadow-candle cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-stone-950" />
            <span>Thắp Sáng Lời Cầu Nguyện Từ Nơi Bạn Ở</span>
          </button>
        )}
      </div>

      {/* Location Picker Popup */}
      {showLocationPicker && (
        <div className="absolute inset-0 bg-[#0c0e12]/95 backdrop-blur-md p-4 flex flex-col justify-between z-20 rounded-2xl animate-in fade-in zoom-in-95 duration-150">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-serif font-bold text-xs text-[#c5a059] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Chọn Nơi Bạn Đang Ở
              </span>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="text-stone-400 hover:text-stone-200 text-xs cursor-pointer"
              >
                Đóng ✕
              </button>
            </div>

            <p className="text-[11px] text-stone-400 mt-2 mb-3">
              Cùng thắp sáng một ngọn nến hiệp ý từ tỉnh thành hoặc quốc gia của bạn:
            </p>

            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  onClick={() => setSelectedLocId(loc.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs text-left transition-all ${
                    selectedLocId === loc.id
                      ? "bg-[#c5a059]/20 border border-[#c5a059] text-stone-100 font-semibold"
                      : "bg-stone-900 hover:bg-stone-850 text-stone-300 border border-white/5"
                  }`}
                >
                  <span className="font-serif">{loc.name}</span>
                  {selectedLocId === loc.id && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c5a059]" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            <button
              onClick={() => handleLightCandle(selectedLocId)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-stone-950 font-serif font-bold text-xs transition-colors cursor-pointer"
            >
              Xác Nhận & Hiệp Ý Cầu Nguyện
            </button>
          </div>
        </div>
      )}

      {/* Blessing Toast */}
      {blessingToast && (
        <div className="absolute bottom-2 left-2 right-2 bg-stone-900 border border-[#c5a059] p-2.5 rounded-xl text-xs text-[#f5d996] shadow-2xl flex items-center gap-2 z-30 animate-in slide-in-from-bottom-2">
          <HeartHandshake className="w-4 h-4 text-[#c5a059] shrink-0" />
          <span className="text-[11px] leading-tight font-serif">{blessingToast}</span>
        </div>
      )}
    </div>
  );
};
export default SacredFellowshipPresence;
