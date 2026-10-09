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
  Music2,
  BookOpen,
} from "lucide-react";
import { useWorship } from "@/context/WorshipContext";
import { worshipData } from "@/data/worshipServiceData";
import {
  buildHlsStreamUrl,
  extractYouTubeId,
  buildYouTubeEmbedUrl,
  buildFacebookEmbedUrl,
  detectStreamType,
} from "@/lib/streamConfig";

interface HlsPlayerProps {
  streamUrl?: string;
  posterUrl?: string;
  isAdminPreview?: boolean;
}

export const HlsPlayer: React.FC<HlsPlayerProps> = ({
  streamUrl,
  posterUrl = worshipData.fallbackPosterUrl,
  isAdminPreview = false,
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
      ? (church.streamType === "youtube" && extractYouTubeId(church.streamKey)
          ? church.streamKey
          : buildHlsStreamUrl(church.streamKey))
      : worshipData.streamUrl);

  const [activeUrl, setActiveUrl] = useState<string>(effectiveStreamUrl);

  const detectedType = detectStreamType(activeUrl, church?.streamType);
  const isYouTube = detectedType === "youtube";
  const isFacebook = detectedType === "facebook";
  const isHls = detectedType === "hls";
  const youtubeVideoId = isYouTube ? extractYouTubeId(activeUrl) : null;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLocalStream, setIsLocalStream] = useState<boolean>(false);
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

  // Real-time Live Lyrics Synchronization State
  const [liveLyrics, setLiveLyrics] = useState<{
    isEnabled: boolean;
    songTitle?: string;
    stanzaLabel?: string;
    lines?: string[];
    displayType?: "hymn" | "scripture";
    referenceTranslation?: string;
  } | null>(null);
  const [showLyricsSubtitle, setShowLyricsSubtitle] = useState<boolean>(true);

  // Real-time live lyrics / subtitle synchronization via Server-Sent Events (SSE)
  useEffect(() => {
    const slug = church?.slug;
    if (!slug) return;

    let isMounted = true;

    // Initial load: fetch current live lyrics state from MongoDB
    const fetchLyrics = async () => {
      try {
        const res = await fetch(`/api/lyrics?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.liveLyrics) {
            setLiveLyrics(data.liveLyrics);
          }
        }
      } catch {}
    };

    fetchLyrics();

    let eventSource: EventSource | null = null;
    let fallbackPollTimer: NodeJS.Timeout | null = null;

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        eventSource = new EventSource(
          `/api/realtime?churchSlug=${encodeURIComponent(slug)}&channel=lyrics`
        );

        eventSource.addEventListener("lyrics", (e: MessageEvent) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(e.data);
            if (data) {
              setLiveLyrics(data);
            }
          } catch {}
        });

        eventSource.onopen = () => {
          if (fallbackPollTimer) {
            clearInterval(fallbackPollTimer);
            fallbackPollTimer = null;
          }
        };

        eventSource.onerror = () => {
          if (!fallbackPollTimer && isMounted) {
            fallbackPollTimer = setInterval(fetchLyrics, 10000);
          }
        };
      } catch {
        fallbackPollTimer = setInterval(fetchLyrics, 8000);
      }
    } else {
      fallbackPollTimer = setInterval(fetchLyrics, 5000);
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
      if (fallbackPollTimer) clearInterval(fallbackPollTimer);
    };
  }, [church?.slug]);

  // Update activeUrl when effectiveStreamUrl changes
  useEffect(() => {
    setActiveUrl(effectiveStreamUrl);
  }, [effectiveStreamUrl]);

  const [probeSuccessMessage, setProbeSuccessMessage] = useState<string>("");

  // Helper to resolve candidate local & LAN HLS URLs
  const getCandidateUrls = useCallback(
    (streamKey?: string, slug?: string) => {
      const keys = [
        streamKey,
        slug,
        "emmanuel-live",
        "emmanuel",
        "lbs-sunday",
      ].filter(Boolean) as string[];

      const urls: string[] = [];
      const currentHost =
        typeof window !== "undefined" ? window.location.hostname : "localhost";

      for (const k of keys) {
        if (currentHost && currentHost !== "localhost" && currentHost !== "127.0.0.1") {
          urls.push(`http://${currentHost}:8888/live/${k}/index.m3u8`);
          urls.push(`http://${currentHost}:8888/${k}/index.m3u8`);
        }
        urls.push(`http://localhost:8888/live/${k}/index.m3u8`);
        urls.push(`http://localhost:8888/${k}/index.m3u8`);
      }
      return Array.from(new Set(urls));
    },
    []
  );

  const probeLiveHls = async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch(url, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = await res.text();
        if (text.includes("#EXTM3U")) {
          return true;
        }
      }
    } catch {}
    return false;
  };

  // Auto probe local/LAN OBS stream on mount or when streamKey changes (for HLS mode)
  useEffect(() => {
    if (isYouTube || isFacebook) return;
    let isCancelled = false;
    async function checkLocal() {
      if (typeof window === "undefined") return;
      const candidates = getCandidateUrls(church?.streamKey, church?.slug);
      for (const url of candidates) {
        if (isCancelled) return;
        const isLive = await probeLiveHls(url);
        if (isLive && !isCancelled) {
          setActiveUrl(url);
          setIsLocalStream(true);
          setHasError(false);
          setErrorMessage("");
          return;
        }
      }
    }
    checkLocal();
    return () => {
      isCancelled = true;
    };
  }, [church?.streamKey, church?.slug, getCandidateUrls, isYouTube, isFacebook]);

  const handleProbeObs = async () => {
    const candidates = getCandidateUrls(church?.streamKey, church?.slug);
    for (const url of candidates) {
      const isLive = await probeLiveHls(url);
      if (isLive) {
        setActiveUrl(url);
        setIsLocalStream(true);
        setHasError(false);
        setErrorMessage("");
        if (hlsRef.current) {
          hlsRef.current.loadSource(url);
          hlsRef.current.startLoad();
        }
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
        setProbeSuccessMessage("Đã bắt thành công luồng OBS trực tiếp!");
        setTimeout(() => setProbeSuccessMessage(""), 4000);
        return;
      }
    }

    const key = church?.streamKey || "emmanuel-live";
    alert(
      `Chưa nhận được tín hiệu từ OBS!\n\nXin hãy kiểm tra:\n1. Mở phần mềm OBS Studio -> Settings -> Stream:\n   - Service: Custom...\n   - Server: rtmp://localhost:1935/live\n   - Stream Key: ${key}\n2. Bấm 'Start Streaming' trong OBS rồi bấm lại nút này.`
    );
  };

  // Initialize HLS Stream
  useEffect(() => {
    if (isYouTube || isFacebook) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(true);
      setHasError(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxLiveSyncPlaybackRate: 1.5,
        liveSyncDurationCount: 2,
        liveMaxLatencyDurationCount: 3,
        liveDurationInfinity: true,
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
              // If it's local OBS, give it a chance to buffer rather than immediate fallback
              if (isLocalStream) {
                console.warn("Đang chờ nạp phân đoạn OBS...", activeUrl);
                setTimeout(() => {
                  if (hlsRef.current) hlsRef.current.startLoad();
                }, 1000);
                break;
              }
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
  }, [activeUrl, isYouTube, isFacebook, isLocalStream]);

  // Live synchronization state & pause tracking
  const lastPauseTimeRef = useRef<number>(0);
  const [isBehindLive, setIsBehindLive] = useState<boolean>(false);

  // Jump to live broadcast edge
  const jumpToLive = useCallback(() => {
    const video = videoRef.current;
    const hls = hlsRef.current;
    if (!video) return;

    if (hls) {
      hls.startLoad();
      if (typeof hls.liveSyncPosition === "number" && hls.liveSyncPosition > 0) {
        video.currentTime = hls.liveSyncPosition;
      } else if (video.seekable && video.seekable.length > 0) {
        const liveEnd = video.seekable.end(video.seekable.length - 1);
        video.currentTime = Math.max(0, liveEnd - 0.5);
      }
    } else if (video.seekable && video.seekable.length > 0) {
      const liveEnd = video.seekable.end(video.seekable.length - 1);
      video.currentTime = Math.max(0, liveEnd - 0.5);
    }
    setIsBehindLive(false);
  }, []);

  // Monitor live distance to detect if user has lagged behind
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkLiveDistance = () => {
      const hls = hlsRef.current;
      if (hls && typeof hls.liveSyncPosition === "number" && hls.liveSyncPosition > 0) {
        const distance = hls.liveSyncPosition - video.currentTime;
        setIsBehindLive(distance > 5);
      } else if (video.seekable && video.seekable.length > 0) {
        const liveEnd = video.seekable.end(video.seekable.length - 1);
        const distance = liveEnd - video.currentTime;
        setIsBehindLive(distance > 5);
      }
    };

    const interval = setInterval(checkLiveDistance, 2500);
    return () => clearInterval(interval);
  }, []);

  // Video State listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => {
      setIsPlaying(true);
      // If resuming after a pause of more than 2 seconds, auto-jump to live edge!
      const timePaused = Date.now() - lastPauseTimeRef.current;
      if (lastPauseTimeRef.current > 0 && timePaused > 2000) {
        if (timePaused > 8000 && hlsRef.current) {
          hlsRef.current.stopLoad();
          hlsRef.current.loadSource(activeUrl);
          hlsRef.current.startLoad();
        }
        jumpToLive();
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      lastPauseTimeRef.current = Date.now();
    };

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
  }, [activeUrl, jumpToLive]);

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
      const timePaused = Date.now() - lastPauseTimeRef.current;
      // If paused for more than 2 seconds, immediately jump to the live edge
      if (lastPauseTimeRef.current > 0 && timePaused > 2000) {
        if (timePaused > 8000 && hlsRef.current) {
          hlsRef.current.stopLoad();
          hlsRef.current.loadSource(activeUrl);
          hlsRef.current.startLoad();
        }
        jumpToLive();
      }
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    } else {
      lastPauseTimeRef.current = Date.now();
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
      {/* Underlying Video or Embedded Stream (YouTube / Facebook) */}
      {isYouTube && youtubeVideoId ? (
        <iframe
          src={buildYouTubeEmbedUrl(youtubeVideoId, true)}
          className="w-full h-full border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title={`Thờ Phượng Trực Tuyến - ${church?.name || "Hội Thánh"}`}
        />
      ) : isFacebook ? (
        <iframe
          src={buildFacebookEmbedUrl(activeUrl, true)}
          className="w-full h-full border-0 bg-black"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
          title={`Thờ Phượng Trực Tuyến - ${church?.name || "Hội Thánh"}`}
        />
      ) : (
        <video
          ref={videoRef}
          poster={posterUrl}
          playsInline
          className="w-full h-full object-contain bg-black cursor-pointer"
          onClick={togglePlay}
        />
      )}

      {/* Top Banner Overlay inside Video: Sermon Title & Live Status */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Reverent Live / Preview Indicator & Click-to-Sync */}
          <button
            onClick={() => {
              jumpToLive();
              if (videoRef.current?.paused) {
                videoRef.current.play().catch(() => {});
              }
            }}
            className={`pointer-events-auto flex items-center gap-2 px-2.5 py-1 rounded text-xs font-medium backdrop-blur-sm border transition-all ${
              isAdminPreview
                ? "bg-black/60 border-amber-400/50 text-amber-300"
                : isBehindLive
                ? "bg-red-950/90 hover:bg-red-900 border-red-500 text-red-200 animate-pulse cursor-pointer shadow-md ring-1 ring-red-500/40"
                : "bg-black/60 border-gold-400/30 hover:border-gold-400/60 text-red-400 hover:text-red-300 cursor-pointer"
            }`}
            title={
              isAdminPreview
                ? "Màn hình xem trước luồng OBS của Admin"
                : isBehindLive
                ? "Bạn đang xem chậm hơn luồng phát trực tiếp. Bấm để đồng bộ ngay với Hội Thánh!"
                : "Đang xem trực tiếp thời gian thực. Bấm để làm mới luồng."
            }
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isAdminPreview ? "bg-amber-400" : "bg-red-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isAdminPreview ? "bg-amber-500" : "bg-red-500"
                }`}
              />
            </span>
            <span className="tracking-wider text-[11px] font-semibold uppercase font-serif">
              {isAdminPreview
                ? "TỔNG DUYỆT (CHỈ ADMIN)"
                : isBehindLive
                ? "Về Trực Tiếp ⚡"
                : "TRỰC TIẾP"}
            </span>
          </button>

          {/* Quick OBS connection probe button - ONLY for Church Admin in preview mode */}
          {isAdminPreview && (
            <button
              onClick={handleProbeObs}
              className="pointer-events-auto flex items-center gap-1.5 text-[11px] bg-black/70 hover:bg-gold-400/20 text-gold-300 border border-white/15 hover:border-gold-400/40 px-2.5 py-1 rounded transition-colors shadow-sm"
              title="Kiểm tra và kết nối với OBS Studio trên máy của bạn"
            >
              <RefreshCw className="w-3 h-3 text-gold-400" />
              <span className="hidden sm:inline">
                {isLocalStream ? "Đang Bắt OBS" : "Bắt Luồng OBS"}
              </span>
            </button>
          )}

          <div className="hidden md:flex items-center gap-1.5 text-xs text-sanctuary-300 bg-black/50 px-2.5 py-1 rounded border border-white/[0.06]">
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

      {/* Toast Notification when OBS stream connects - ONLY for Admin in preview mode */}
      {isAdminPreview && probeSuccessMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-emerald-950/95 border border-emerald-500/60 text-emerald-200 px-4 py-2 rounded-md shadow-2xl text-xs font-serif flex items-center gap-2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{probeSuccessMessage}</span>
        </div>
      )}

      {/* Center Subtle Play Button (Visible on Pause for native HLS video) */}
      {!isYouTube && !isFacebook && !isPlaying && (
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

      {/* Live Synchronized Lyrics Lower-Third Overlay */}
      {liveLyrics?.isEnabled &&
        showLyricsSubtitle &&
        liveLyrics.lines &&
        liveLyrics.lines.length > 0 && (
          <div className="absolute bottom-16 sm:bottom-20 left-2 right-2 sm:left-6 sm:right-6 z-20 flex flex-col items-center pointer-events-none transition-all duration-300">
            <div className="bg-sanctuary-950/95 backdrop-blur-md border border-gold-400/40 rounded-xl px-4 py-2.5 sm:px-6 sm:py-3.5 shadow-2xl max-w-2xl w-full text-center">
              <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gold-400 font-serif tracking-wider uppercase mb-1">
                {liveLyrics.displayType === "scripture" ? (
                  <>
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span className="font-semibold text-amber-300">
                      {liveLyrics.songTitle || "Kinh Thánh Lời Chúa"}
                    </span>
                    {liveLyrics.referenceTranslation && (
                      <>
                        <span className="text-white/30">•</span>
                        <span className="text-stone-300 font-mono text-[10px]">
                          {liveLyrics.referenceTranslation}
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Music2 className="w-3 h-3 text-gold-400 animate-pulse" />
                    <span className="font-semibold">{liveLyrics.songTitle || "Thánh Ca Tôn Vinh"}</span>
                    {liveLyrics.stanzaLabel && (
                      <>
                        <span className="text-white/30">•</span>
                        <span className="text-gold-300/90 font-medium">{liveLyrics.stanzaLabel}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              <div className="space-y-0.5 sm:space-y-1">
                {liveLyrics.lines.map((line, idx) => {
                  const isSecondary = line.startsWith("“") || line.startsWith('"');
                  return (
                    <p
                      key={idx}
                      className={`font-serif drop-shadow-md leading-relaxed ${
                        isSecondary
                          ? "text-xs sm:text-sm md:text-base text-gold-300 italic opacity-95"
                          : "text-sm sm:text-base md:text-lg text-white font-medium"
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      {/* Bottom Minimalist Controls Bar */}
      {!isYouTube && !isFacebook ? (
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
            <button
              onClick={() => {
                jumpToLive();
                if (videoRef.current?.paused) videoRef.current.play().catch(() => {});
              }}
              className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-400/90 hover:text-emerald-300 font-medium px-2 py-0.5 rounded bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer"
              title="Bấm để đồng bộ ngay lập tức với luồng phát trực tiếp của Hội Thánh"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Đồng bộ thời gian thực</span>
            </button>
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

            {/* Live Lyrics Subtitles Toggle Button (CC) */}
            {liveLyrics?.isEnabled && (
              <button
                onClick={() => setShowLyricsSubtitle((prev) => !prev)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors ${
                  showLyricsSubtitle
                    ? "bg-gold-400/25 border-gold-400/60 text-gold-300 font-medium shadow-sm"
                    : "bg-black/40 border-white/10 text-sanctuary-400 hover:text-sanctuary-200"
                }`}
                title={
                  showLyricsSubtitle
                    ? "Tắt phụ đề lời hát trực tiếp"
                    : "Bật phụ đề lời hát trực tiếp (CC)"
                }
              >
                <Music2 className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-[11px] font-sans">Lời</span>
              </button>
            )}

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
      ) : (
        /* Floating mini-bar for YouTube / Facebook: CC, Focus Mode, Fullscreen */
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 pointer-events-auto">
          {liveLyrics?.isEnabled && (
            <button
              onClick={() => setShowLyricsSubtitle((prev) => !prev)}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded border transition-colors shadow-lg ${
                showLyricsSubtitle
                  ? "bg-gold-400/30 border-gold-400/70 text-gold-300 font-medium"
                  : "bg-black/75 border-white/15 text-sanctuary-300 hover:text-white"
              }`}
              title="Phụ đề lời bài hát (CC)"
            >
              <Music2 className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-[11px] font-sans">Lời</span>
            </button>
          )}

          <button
            onClick={toggleFocusMode}
            className={`p-1.5 rounded border transition-colors shadow-lg ${
              isFocusMode
                ? "bg-gold-400/30 border-gold-400/70 text-gold-300"
                : "bg-black/75 border-white/15 text-sanctuary-300 hover:text-gold-300"
            }`}
            title="Chế độ chiêm niệm thờ phượng"
          >
            {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-black/75 border border-white/15 text-sanctuary-300 hover:text-gold-300 transition-colors shadow-lg"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}
    </div>
  );
};
