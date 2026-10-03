"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Radio,
  Settings,
  Users,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";

interface HlsPlayerProps {
  streamUrl?: string;
  posterUrl?: string;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({
  streamUrl,
  posterUrl = worshipData.fallbackPosterUrl,
}) => {
  const { church, isFocusMode, toggleFocusMode } = useWorship();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const effectiveStreamUrl =
    streamUrl ||
    church?.streamUrl ||
    (church?.streamKey
      ? `http://169.58.235.90:8080/live/${church.streamKey}.m3u8`
      : worshipData.streamUrl);

  const [activeUrl, setActiveUrl] = useState<string>(effectiveStreamUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [streamQuality, setStreamQuality] = useState<string>("1080p HD");
  const [isLiveBuffer, setIsLiveBuffer] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [availableQualities, setAvailableQualities] = useState<
    { height: number; index: number }[]
  >([]);

  // Update activeUrl when effectiveStreamUrl changes
  useEffect(() => {
    setActiveUrl(effectiveStreamUrl);
  }, [effectiveStreamUrl]);

  // Initialize HLS Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsRef.current = hls;
      hls.loadSource(activeUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setHasError(false);
        const levels = data.levels.map((lvl, index) => ({
          height: lvl.height || 720,
          index,
        }));
        setAvailableQualities(levels);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        const level = hls.levels[data.level];
        if (level && level.height) {
          setStreamQuality(`${level.height}p`);
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // If current stream fails and it wasn't the backup, switch to backup test stream
              if (activeUrl !== worshipData.streamUrl) {
                console.warn(
                  "Luồng phát trực tiếp chưa lên sóng, chuyển đổi dự phòng video kiểm thử:",
                  activeUrl
                );
                setActiveUrl(worshipData.streamUrl);
                hls.loadSource(worshipData.streamUrl);
                hls.startLoad();
                break;
              }
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              setHasError(true);
              setErrorMessage("Đang kết nối lại luồng thờ phượng trực tuyến...");
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari iOS fallback
      video.src = activeUrl;
      video.addEventListener("loadedmetadata", () => {
        setHasError(false);
      });
      video.addEventListener("error", () => {
        if (activeUrl !== worshipData.streamUrl) {
          video.src = worshipData.streamUrl;
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeUrl]);

  // Video State listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("volumechange", onVolumeChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  // Fullscreen listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // Autohide controls on idle
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
      }
    }, 3200);
  }, [isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleQualitySelect = (levelIndex: number, label: string) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setStreamQuality(label);
    }
    setShowQualityMenu(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-sanctuary-950 rounded-lg overflow-hidden border border-white/[0.08] shadow-sanctuary group select-none flex flex-col justify-between"
    >
      {/* Underlying Video */}
      <video
        ref={videoRef}
        poster={posterUrl}
        playsInline
        className="w-full h-full object-contain bg-black cursor-pointer"
        onClick={togglePlay}
      />

      {/* Top Banner Overlay inside Video: Sermon Title & Live Status */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Reverent Live Indicator */}
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-gold-400/30 px-2.5 py-1 rounded text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-red-400 tracking-wider text-[11px] font-semibold uppercase">
              TRỰC TIẾP
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-sanctuary-300 bg-black/50 px-2.5 py-1 rounded border border-white/[0.06]">
            <Users className="w-3.5 h-3.5 text-sanctuary-400" />
            <span>{worshipData.viewersCount.toLocaleString("vi-VN")} đang hiệp ý</span>
          </div>
        </div>

        {/* Sermon Details on Top Right */}
        <div className="text-right pointer-events-none">
          <p className="text-xs text-gold-300/90 font-serif font-medium tracking-wide">
            {worshipData.speakerTitle}: {worshipData.speaker}
          </p>
          <p className="text-[11px] text-sanctuary-400 font-sans">
            Kinh Thánh:{" "}
            <span className="text-sanctuary-200 font-medium">
              {worshipData.scriptureReference}
            </span>
          </p>
        </div>
      </div>

      {/* Center Subtle Play Button (Visible on Pause) */}
      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/35 cursor-pointer z-10"
        >
          <button
            aria-label="Bắt đầu thờ phượng"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-sanctuary-900/90 border border-gold-400/50 flex items-center justify-center text-gold-300 hover:scale-105 hover:bg-gold-400 hover:text-sanctuary-950 transition-all duration-300 shadow-candle"
          >
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-current translate-x-0.5" />
          </button>
        </div>
      )}

      {/* Error state if stream fails */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center z-20">
          <p className="text-gold-300 font-serif text-lg mb-2">
            Đang phục hồi tín hiệu truyền hình trực tiếp
          </p>
          <p className="text-xs text-sanctuary-400 max-w-md mb-4">
            Đường truyền đang được tự động đồng bộ hóa. Xin quý vị kiên nhẫn trong giây lát.
          </p>
          <button
            onClick={() => {
              if (hlsRef.current) hlsRef.current.loadSource(activeUrl);
              setHasError(false);
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-sanctuary-100 bg-sanctuary-800 border border-gold-400/30 rounded hover:border-gold-400"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử kết nối lại
          </button>
        </div>
      )}

      {/* Bottom Minimalist Controls Bar */}
      <div
        className={`relative z-20 w-full px-4 py-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-sanctuary-200">
          {/* Left Controls: Play/Pause, Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 hover:text-gold-300 rounded transition-colors text-sanctuary-100"
              aria-label={isPlaying ? "Tạm dừng" : "Tiếp tục phát"}
              title={isPlaying ? "Tạm dừng" : "Tiếp tục"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
            </button>

            {/* Volume & Minimal slider */}
            <div className="flex items-center gap-2 group/vol">
              <button
                onClick={toggleMute}
                className="p-1.5 hover:text-gold-300 rounded transition-colors text-sanctuary-300"
                aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                title={isMuted ? "Bật âm thanh" : "Tắt âm"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5 text-sanctuary-400" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-sanctuary-750 accent-gold-400 rounded-lg appearance-none cursor-pointer focus:outline-none"
                aria-label="Âm lượng"
              />
            </div>

            {/* Live Synchronized Badge */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-400/90 font-medium px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Đồng bộ thời gian thực</span>
            </div>
          </div>

          {/* Right Controls: Quality, Focus Mode, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stream Quality Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu((prev) => !prev)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-black/40 border border-white/10 hover:border-gold-400/40 hover:text-gold-300 transition-colors"
                title="Chất lượng hình ảnh"
              >
                <Settings className="w-3.5 h-3.5 text-sanctuary-400" />
                <span className="text-[11px]">{streamQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-36 bg-sanctuary-900 border border-white/10 rounded-md py-1 shadow-sanctuary text-xs z-30">
                  <div className="px-3 py-1 text-[10px] uppercase font-semibold text-sanctuary-400 border-b border-white/5">
                    Độ phân giải
                  </div>
                  <button
                    onClick={() => handleQualitySelect(-1, "Tự động")}
                    className={`w-full text-left px-3 py-1.5 hover:bg-sanctuary-800 transition-colors flex items-center justify-between ${
                      streamQuality === "Tự động" ? "text-gold-400 font-medium" : "text-sanctuary-300"
                    }`}
                  >
                    <span>Tự động (Auto)</span>
                  </button>
                  {availableQualities.length > 0 ? (
                    availableQualities.map((q) => (
                      <button
                        key={q.index}
                        onClick={() => handleQualitySelect(q.index, `${q.height}p`)}
                        className={`w-full text-left px-3 py-1.5 hover:bg-sanctuary-800 transition-colors flex items-center justify-between ${
                          streamQuality === `${q.height}p`
                            ? "text-gold-400 font-medium"
                            : "text-sanctuary-300"
                        }`}
                      >
                        <span>{q.height}p</span>
                        {q.height >= 1080 && (
                          <span className="text-[9px] bg-gold-400/20 text-gold-300 px-1 rounded">
                            HD
                          </span>
                        )}
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setStreamQuality("1080p HD");
                          setShowQualityMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-sanctuary-800 text-sanctuary-300"
                      >
                        1080p HD
                      </button>
                      <button
                        onClick={() => {
                          setStreamQuality("720p");
                          setShowQualityMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-sanctuary-800 text-sanctuary-300"
                      >
                        720p
                      </button>
                      <button
                        onClick={() => {
                          setStreamQuality("480p");
                          setShowQualityMenu(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-sanctuary-800 text-sanctuary-300"
                      >
                        480p (Tiết kiệm)
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Quick Focus Mode inside player */}
            <button
              onClick={toggleFocusMode}
              className={`p-1.5 rounded transition-colors ${
                isFocusMode
                  ? "text-gold-300 bg-gold-400/20"
                  : "text-sanctuary-300 hover:text-sanctuary-100"
              }`}
              title={
                isFocusMode
                  ? "Tắt chế độ chiêm niệm"
                  : "Bật chế độ chiêm niệm (Toàn màn hình không phân tâm)"
              }
              aria-label="Chế độ chiêm niệm"
            >
              {isFocusMode ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4 text-sanctuary-300" />
              )}
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 hover:text-gold-300 rounded transition-colors text-sanctuary-300"
              title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
              aria-label="Toàn màn hình"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
