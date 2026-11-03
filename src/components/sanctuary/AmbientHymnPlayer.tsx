"use client";

import React, { useState, useEffect, useRef } from "react";
import { Music, Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Sparkles } from "lucide-react";

export interface HymnTrack {
  id: string;
  title: string;
  vietnameseTitle: string;
  theme: string;
  chords: number[][]; // frequencies in Hz
  tempoSec: number;
}

export const HYMN_PLAYLIST: HymnTrack[] = [
  {
    id: "amazing-grace",
    title: "Amazing Grace",
    vietnameseTitle: "Ân Điển Lạ Lùng",
    theme: "Ấm Áp & Tạ Ơn",
    tempoSec: 4.2,
    chords: [
      [196.0, 246.94, 293.66, 392.0], // G major
      [196.0, 261.63, 329.63, 392.0], // C/G
      [196.0, 246.94, 293.66, 392.0], // G major
      [164.81, 246.94, 329.63, 392.0], // Em
      [146.83, 220.0, 293.66, 369.99],  // D major
      [196.0, 246.94, 293.66, 392.0], // G major
      [196.0, 261.63, 329.63, 392.0], // C/G
      [196.0, 246.94, 293.66, 392.0], // G major
    ],
  },
  {
    id: "it-is-well",
    title: "It Is Well With My Soul",
    vietnameseTitle: "Tâm Linh Tôi Yên Ninh Thay",
    theme: "Bình An & Vững Lòng",
    tempoSec: 4.5,
    chords: [
      [261.63, 329.63, 392.0, 523.25], // C major
      [196.0, 246.94, 293.66, 392.0],  // G major
      [220.0, 261.63, 329.63, 440.0],  // Am
      [174.61, 261.63, 349.23, 440.0], // F major
      [261.63, 329.63, 392.0, 523.25], // C major
      [196.0, 293.66, 392.0, 493.88],  // G7
      [261.63, 329.63, 392.0, 523.25], // C major
    ],
  },
  {
    id: "great-is-thy-faithfulness",
    title: "Great Is Thy Faithfulness",
    vietnameseTitle: "Thành Tín Chúa Rất Lớn",
    theme: "Ngợi Khen & Tín Thác",
    tempoSec: 4.0,
    chords: [
      [146.83, 220.0, 293.66, 369.99], // D major
      [196.0, 246.94, 293.66, 392.0],  // G major
      [220.0, 277.18, 329.63, 440.0],  // A major
      [146.83, 220.0, 293.66, 369.99], // D major
      [123.47, 185.0, 246.94, 369.99], // Bm
      [164.81, 246.94, 329.63, 392.0], // Em
      [220.0, 277.18, 329.63, 440.0],  // A7
      [146.83, 220.0, 293.66, 369.99], // D major
    ],
  },
  {
    id: "psalm-23",
    title: "The Lord's My Shepherd",
    vietnameseTitle: "Chúa Là Đấng Chăn Giữ Tôi",
    theme: "Tĩnh Lặng & Dẫn Đắt",
    tempoSec: 4.6,
    chords: [
      [174.61, 220.0, 261.63, 349.23], // F major
      [233.08, 293.66, 349.23, 466.16], // Bb major
      [130.81, 196.0, 261.63, 329.63], // C major
      [146.83, 220.0, 261.63, 349.23], // Dm
      [196.0, 233.08, 293.66, 392.0],  // Gm
      [130.81, 196.0, 261.63, 349.23], // C7
      [174.61, 220.0, 261.63, 349.23], // F major
    ],
  },
];

interface AmbientHymnPlayerProps {
  className?: string;
  autoPrompt?: boolean;
}

export const AmbientHymnPlayer: React.FC<AmbientHymnPlayerProps> = ({
  className = "",
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.65);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepRef = useRef<number>(0);
  const masterGainRef = useRef<GainNode | null>(null);

  const currentTrack = HYMN_PLAYLIST[trackIndex];

  // Stop audio synthesis cleanly
  const stopAudio = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
      audioCtxRef.current = null;
      masterGainRef.current = null;
    }
    setIsPlaying(false);
  };

  // Play a single harmonic chord with gentle attack/release
  const playSacredChord = (ctx: AudioContext, masterGain: GainNode, frequencies: number[]) => {
    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1100, now);
    filter.Q.setValueAtTime(1.5, now);
    filter.connect(masterGain);

    frequencies.forEach((freq, idx) => {
      // Warm fundamental tone (sine)
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      // Subtle warm triangle overtone for organ/pad body
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 0.9995, now); // subtle chorus warmth

      const noteGain = ctx.createGain();
      const baseGain = idx === 0 ? 0.045 : 0.035; // slightly louder bass

      noteGain.gain.setValueAtTime(0.0001, now);
      // Gentle sacred swell (attack ~1.0s)
      noteGain.gain.exponentialRampToValueAtTime(baseGain, now + 1.0);
      // Gentle decay & sustain
      noteGain.gain.exponentialRampToValueAtTime(baseGain * 0.7, now + 2.5);
      // Sacred room fade-out
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + (currentTrack.tempoSec + 1.2));

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      noteGain.connect(filter);

      osc1.start(now);
      osc2.start(now);

      osc1.stop(now + currentTrack.tempoSec + 1.5);
      osc2.stop(now + currentTrack.tempoSec + 1.5);
    });
  };

  // Start audio synthesis
  const startAudio = async (targetIndex = trackIndex) => {
    stopAudio();

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      const ctx = new AudioCtxClass();
      if (ctx.state === "suspended") {
        await ctx.resume();
      }
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      stepRef.current = 0;
      const track = HYMN_PLAYLIST[targetIndex];

      // Initial chord immediately
      playSacredChord(ctx, masterGain, track.chords[0]);
      stepRef.current = 1;

      // Loop subsequent chords in rhythmic harmony
      timerRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === "closed") return;
        const nextChord = track.chords[stepRef.current % track.chords.length];
        stepRef.current++;
        playSacredChord(ctx, masterGain, nextChord);
      }, track.tempoSec * 1000);

      setIsPlaying(true);
    } catch (e) {
      console.warn("Ambient Hymn Audio Error:", e);
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (trackIndex + 1) % HYMN_PLAYLIST.length;
    setTrackIndex(nextIdx);
    if (isPlaying) {
      startAudio(nextIdx);
    }
  };

  const handlePrevTrack = () => {
    const prevIdx = (trackIndex - 1 + HYMN_PLAYLIST.length) % HYMN_PLAYLIST.length;
    setTrackIndex(prevIdx);
    if (isPlaying) {
      startAudio(prevIdx);
    }
  };

  // Handle volume changes
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const target = isMuted ? 0 : volume;
      masterGainRef.current.gain.setValueAtTime(target, audioCtxRef.current.currentTime);
    }
  }, [volume, isMuted]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-black/45 border border-[#c5a059]/30 backdrop-blur-md p-2.5 sm:p-3 text-stone-200 shadow-xl transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Track Information & Sacred Equalizer Visualizer */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              isPlaying
                ? "bg-[#c5a059]/20 text-[#c5a059] border border-[#c5a059]/40 shadow-candle"
                : "bg-stone-900 text-stone-400 border border-white/5"
            }`}
          >
            <Music className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-serif uppercase tracking-widest text-[#c5a059] font-bold">
                Thánh Ca Phòng Chờ
              </span>
              {isPlaying && (
                <div className="flex items-center gap-0.5 h-2.5">
                  <span className="w-0.5 bg-[#c5a059] rounded-full animate-bounce h-2" style={{ animationDelay: "0ms" }} />
                  <span className="w-0.5 bg-[#c5a059] rounded-full animate-bounce h-3" style={{ animationDelay: "150ms" }} />
                  <span className="w-0.5 bg-[#c5a059] rounded-full animate-bounce h-1.5" style={{ animationDelay: "300ms" }} />
                  <span className="w-0.5 bg-[#c5a059] rounded-full animate-bounce h-2.5" style={{ animationDelay: "450ms" }} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 truncate">
              <p className="font-serif text-xs font-semibold text-stone-100 truncate">
                {currentTrack.vietnameseTitle}
              </p>
              <span className="text-[10px] text-stone-400 font-sans hidden sm:inline">
                ({currentTrack.title})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Audio Playback Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
          {/* Previous & Next Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevTrack}
              title="Bài thánh ca trước"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors cursor-pointer"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Main Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-serif text-xs font-semibold transition-all cursor-pointer shadow-md ${
                isPlaying
                  ? "bg-[#c5a059]/25 text-[#f5d996] border border-[#c5a059]/60 hover:bg-[#c5a059]/35"
                  : "bg-gradient-to-r from-[#c5a059] to-[#d4af37] text-stone-950 hover:brightness-110 font-bold"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Tạm Dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Bật Nhạc Nguyện</span>
                </>
              )}
            </button>

            <button
              onClick={handleNextTrack}
              title="Bài thánh ca kế tiếp"
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
              className="p-1.5 rounded-lg text-stone-400 hover:text-[#c5a059] hover:bg-stone-800/60 transition-colors cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 text-stone-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#c5a059]" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              title="Âm lượng hòa tấu"
              className="w-14 sm:w-16 h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-[#c5a059]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
