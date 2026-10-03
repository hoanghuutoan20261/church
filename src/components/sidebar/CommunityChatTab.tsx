"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorship } from "@/context/WorshipContext";
import { ChatMessage } from "@/data/worshipServiceData";
import {
  Send,
  Pin,
  ShieldCheck,
  Heart,
  Sparkles,
  Info,
  MapPin,
  MessageSquare,
} from "lucide-react";

export const CommunityChatTab: React.FC = () => {
  const { messages, addMessage } = useWorship();
  const [inputText, setInputText] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom of chat container only (without scrolling the browser window)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addMessage(inputText);
    setInputText("");
  };

  const handleQuickReaction = (reaction: string) => {
    addMessage(reaction, true);
  };

  const getRoleBadge = (role?: ChatMessage["role"]) => {
    switch (role) {
      case "pastor":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold-300 bg-gold-400/20 border border-gold-400/35 px-1.5 py-0.2 rounded">
            <ShieldCheck className="w-3 h-3 text-gold-400" />
            Mục Vụ
          </span>
        );
      case "moderator":
        return (
          <span className="inline-flex items-center text-[10px] font-medium text-amber-300 bg-amber-950/60 border border-amber-600/30 px-1.5 py-0.2 rounded">
            Điều phối
          </span>
        );
      case "elder":
        return (
          <span className="inline-flex items-center text-[10px] font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-600/30 px-1.5 py-0.2 rounded">
            Trưởng lão
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-sanctuary-900 select-text">
      {/* Pinned Pastoral Guidance Notice */}
      <div className="p-3 bg-sanctuary-850/80 border-b border-white/[0.06] text-xs">
        <div className="flex items-start gap-2">
          <Pin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-serif font-semibold text-gold-300 text-xs">
              Chào thăm từ Ban Mục Vụ
            </p>
            <p className="text-[12px] text-sanctuary-300 leading-relaxed font-sans">
              Chào mừng quý ông bà anh chị em hiệp nhất thờ phượng Chúa. Xin vui lòng giữ
              lời chào thăm hoà nhã, gây dựng và tôn vinh Danh Chúa.
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3"
      >
        {messages.map((msg) => {
          const isMe = msg.sender.includes("Tôi");
          const isPinned = msg.id === "m-pinned";

          if (isPinned) return null; // already displayed in banner

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 p-2.5 rounded-md transition-colors ${
                isMe
                  ? "bg-gold-400/[0.07] border border-gold-400/20 ml-2"
                  : "bg-sanctuary-850/70 border border-white/[0.04]"
              }`}
            >
              {/* Header: Sender Name, Role Badge, Location, Timestamp */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`font-semibold text-xs tracking-tight ${
                      isMe
                        ? "text-gold-300 font-sans"
                        : msg.role === "pastor"
                        ? "text-gold-400 font-serif"
                        : "text-sanctuary-200"
                    }`}
                  >
                    {msg.sender}
                  </span>
                  {getRoleBadge(msg.role)}
                  {msg.location && (
                    <span className="text-[10px] text-sanctuary-400 flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      {msg.location}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-sanctuary-500 tabular-nums shrink-0">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message Content */}
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  msg.isAmenOnly
                    ? "font-serif italic font-medium text-gold-300"
                    : "text-sanctuary-200 font-sans"
                }`}
              >
                {msg.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Spiritual Responses / Amen Chips (Reverent, no confetti spam) */}
      <div className="px-3 pt-2 pb-1 border-t border-white/[0.06] bg-sanctuary-950/70">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-sanctuary-400 shrink-0 font-medium mr-1">
            Hiệp ý:
          </span>
          {[
            "Amen! 🙏",
            "Tạ ơn Chúa",
            "Ha-lê-lu-gia",
            "Xin Chúa thăm viếng",
            "Chúa ban phước",
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleQuickReaction(chip)}
              className="shrink-0 px-2.5 py-1 rounded bg-sanctuary-850 hover:bg-gold-400/15 text-sanctuary-200 hover:text-gold-300 border border-white/[0.08] hover:border-gold-400/40 text-[11px] transition-all font-serif"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-sanctuary-950 border-t border-white/[0.06]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Gửi lời chào thăm hoặc hiệp ý amen..."
            maxLength={200}
            className="flex-1 bg-sanctuary-850 border border-white/[0.08] rounded-md px-3 py-2 text-xs sm:text-sm text-sanctuary-100 placeholder-sanctuary-500 focus:outline-none focus:border-gold-400/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 disabled:hover:bg-gold-400 text-sanctuary-950 rounded-md transition-colors font-medium shrink-0"
            title="Gửi tin nhắn"
            aria-label="Gửi"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-sanctuary-400 mt-1.5 text-center">
          Nhắc nhở: Buổi thờ phượng được kiểm duyệt để giữ sự tôn nghiêm.
        </p>
      </div>
    </div>
  );
};
