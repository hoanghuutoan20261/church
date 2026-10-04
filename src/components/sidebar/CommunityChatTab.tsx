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
  Edit3,
  Check,
} from "lucide-react";
import { AmenIcon } from "@/components/common/AmenIcon";

export const CommunityChatTab: React.FC = () => {
  const { church, messages, addMessage } = useWorship();
  const [inputText, setInputText] = useState("");
  const [senderName, setSenderName] = useState("Tín hữu trực tuyến");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Load saved sender name from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("church_chat_sender_name");
      if (saved && saved.trim()) {
        setSenderName(saved.trim());
      }
    }
  }, []);

  // Auto scroll to bottom of chat container only (without scrolling the browser window)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addMessage(inputText, false, senderName);
    setInputText("");
  };

  const handleQuickReaction = (reaction: string) => {
    addMessage(reaction, true, senderName);
  };

  const handleSaveName = () => {
    const finalName = tempName.trim() || senderName;
    setSenderName(finalName);
    if (typeof window !== "undefined") {
      localStorage.setItem("church_chat_sender_name", finalName);
    }
    setIsEditingName(false);
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
      {/* Pinned Pastoral Guidance Notice - Fully Dynamic per Church */}
      <div className="p-3 bg-sanctuary-850/80 border-b border-white/[0.06] text-xs">
        <div className="flex items-start gap-2">
          <Pin className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-serif font-semibold text-gold-300 text-xs">
                Ban Mục Vụ — {church.name}
              </p>
              {church.currentService?.speaker && (
                <span className="text-[10px] text-sanctuary-400 font-serif">
                  ({church.currentService.speaker})
                </span>
              )}
            </div>
            <p className="text-[12px] text-sanctuary-300 leading-relaxed font-sans">
              {church.currentService?.welcomeMessage ||
                `Chào mừng quý tôi con Chúa và thân hữu cùng hiệp một lòng thờ phượng Chúa trực tuyến tại ${church.name}. Kính chúc quý vị một buổi nhóm phước hạnh và tôn vinh Danh Chúa.`}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3.5 space-y-3"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center text-sanctuary-400 space-y-3">
            <div className="w-12 h-12 rounded-full bg-sanctuary-850/80 border border-white/[0.08] flex items-center justify-center text-gold-400/80">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif text-xs font-semibold text-sanctuary-200">
                Phòng trò chuyện {church.name}
              </p>
              <p className="text-[11px] text-sanctuary-400 mt-1 max-w-[260px] leading-relaxed">
                Chưa có tin nhắn trong buổi nhóm này. Hãy gửi lời chào thăm hoặc nhấn các nút hiệp ý bên dưới!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === senderName;
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
                      {isMe && <span className="text-[10px] text-gold-400/70 ml-1 font-normal font-sans">(Bạn)</span>}
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
                      ? "font-serif italic font-medium text-gold-300 flex items-center gap-1.5"
                      : "text-sanctuary-200 font-sans"
                  }`}
                >
                  {msg.isAmenOnly && <AmenIcon className="w-3.5 h-3.5 text-gold-400 shrink-0" filled />}
                  <span>{msg.text.replace(/🙏/g, "").trim()}</span>
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Spiritual Responses / Amen Chips */}
      <div className="px-3 pt-2 pb-1 border-t border-white/[0.06] bg-sanctuary-950/70">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-sanctuary-400 shrink-0 font-medium mr-1">
            Hiệp ý:
          </span>
          {[
            { label: "Amen!", text: "Amen!", isAmen: true },
            { label: "Tạ ơn Chúa", text: "Tạ ơn Chúa", isAmen: false },
            { label: "Ha-lê-lu-gia", text: "Ha-lê-lu-gia", isAmen: false },
            { label: "Xin Chúa thăm viếng", text: "Xin Chúa thăm viếng", isAmen: false },
            { label: "Chúa ban phước", text: "Chúa ban phước", isAmen: false },
          ].map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleQuickReaction(chip.text)}
              className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded bg-sanctuary-850 hover:bg-gold-400/15 text-sanctuary-200 hover:text-gold-300 border border-white/[0.08] hover:border-gold-400/40 text-[11px] transition-all font-serif cursor-pointer"
            >
              {chip.isAmen && <AmenIcon className="w-3 h-3 text-gold-400" filled />}
              <span>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input Bar with Custom Sender Name */}
      <div className="p-3 bg-sanctuary-950 border-t border-white/[0.06]">
        {/* Name Selector */}
        <div className="flex items-center justify-between text-[11px] text-sanctuary-400 mb-1.5 px-0.5">
          <div className="flex items-center gap-1">
            <span>Tên hiển thị:</span>
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveName();
                    }
                  }}
                  maxLength={30}
                  className="bg-sanctuary-800 text-gold-300 px-1.5 py-0.5 rounded text-[11px] border border-gold-400/40 focus:outline-none"
                  placeholder="Nhập tên..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="text-gold-400 hover:text-gold-300 font-semibold text-[10px] px-1"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setTempName(senderName);
                  setIsEditingName(true);
                }}
                className="text-gold-300 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                title="Nhấp để đổi tên hiển thị khi chat"
              >
                <span>{senderName}</span>
                <Edit3 className="w-2.5 h-2.5 text-sanctuary-400" />
              </button>
            )}
          </div>
        </div>

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
            className="p-2 bg-gold-400 hover:bg-gold-500 disabled:opacity-40 disabled:hover:bg-gold-400 text-sanctuary-950 rounded-md transition-colors font-medium shrink-0 cursor-pointer"
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
