"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ChatMessage, worshipData } from "@/data/worshipServiceData";
import { buildHlsStreamUrl } from "@/lib/streamConfig";

export type FontSizeOption = "normal" | "large" | "xlarge";
export type SidebarTab = "chat" | "scripture" | "prayer";
export type ActiveModal = "prayer" | "salvation" | "giving" | "hymnal" | null;

export interface CurrentChurchInfo {
  _id?: string;
  name: string;
  slug: string;
  denomination?: string;
  address?: string;
  streamKey?: string;
  streamUrl?: string;
  themeConfig?: { accentColor?: string; logoUrl?: string };
  bankingConfig?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    branch?: string;
  };
  currentService?: {
    title: string;
    speaker: string;
    speakerTitle: string;
    scriptureReference: string;
    welcomeMessage: string;
    isLive: boolean;
    viewersCount: number;
  };
  profileConfig?: {
    coverImageUrl?: string;
    avatarUrl?: string;
    about?: string;
    leadPastor?: string;
    contactPhone?: string;
    contactEmail?: string;
    slogan?: string;
    googleMapUrl?: string;
  };
  liveSchedule?: string;
  worshipSchedules?: {
    id?: string;
    title: string;
    dayOfWeek: string;
    time: string;
    type?: string;
    description?: string;
  }[];
}

const defaultChurchInfo: CurrentChurchInfo = {
  name: worshipData.churchName,
  slug: "loibansusong",
  denomination: "Hội Thánh Tin Lành Việt Nam",
  address: "Phòng Nhóm Trực Tuyến - Thánh Đường Trung Tâm",
  streamKey: "lbs-sunday",
  streamUrl: buildHlsStreamUrl("lbs-sunday"),
  themeConfig: {
    accentColor: "#c5a059",
    logoUrl: "",
  },
  bankingConfig: {
    bankName: worshipData.givingInfo.bankName,
    accountNumber: worshipData.givingInfo.accountNumber,
    accountHolder: worshipData.givingInfo.accountName,
    branch: worshipData.givingInfo.branch,
  },
  liveSchedule: worshipData.dateTime,
  worshipSchedules: [
    {
      title: "Lễ Thờ Phượng 1",
      dayOfWeek: "Chúa Nhật",
      time: "07:30 - 09:00",
      type: "main",
      description: "Thánh đường Trung Tâm",
    },
    {
      title: "Lễ Thờ Phượng 2",
      dayOfWeek: "Chúa Nhật",
      time: "09:15 - 11:00",
      type: "main",
      description: "Phát sóng trực tuyến chính thức",
    },
    {
      title: "Ban Thanh Niên & Tráng Niên",
      dayOfWeek: "Chúa Nhật",
      time: "18:30 - 20:30",
      type: "youth",
      description: "Sinh hoạt & Ca khen ngợi",
    },
  ],
};

interface WorshipContextType {
  church: CurrentChurchInfo;
  isFocusMode: boolean;
  setIsFocusMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleFocusMode: () => void;
  fontSize: FontSizeOption;
  setFontSize: (size: FontSizeOption) => void;
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  openModal: (modal: ActiveModal) => void;
  closeModal: () => void;
  messages: ChatMessage[];
  addMessage: (text: string, isAmen?: boolean, customSender?: string) => Promise<void>;
  userNotes: string;
  setUserNotes: (notes: string) => void;
  saveUserNotes: (notes: string) => void;
  selectedTranslation: string;
  setSelectedTranslation: (t: string) => void;
  activeView: "sanctuary" | "wall";
  setActiveView: (view: "sanctuary" | "wall") => void;
  updateChurch: (updated: Partial<CurrentChurchInfo>) => void;
}

const WorshipContext = createContext<WorshipContextType | undefined>(undefined);

export function WorshipProvider({
  children,
  initialChurch,
  initialView = "sanctuary",
}: {
  children: React.ReactNode;
  initialChurch?: CurrentChurchInfo;
  initialView?: "sanctuary" | "wall";
}) {
  const [church, setChurch] = useState<CurrentChurchInfo>(
    initialChurch || defaultChurchInfo
  );

  useEffect(() => {
    if (initialChurch) {
      setChurch(initialChurch);
    }
  }, [initialChurch]);

  const updateChurch = (updated: Partial<CurrentChurchInfo>) => {
    setChurch((prev) => ({
      ...prev,
      ...updated,
      profileConfig: {
        ...prev.profileConfig,
        ...(updated.profileConfig || {}),
      },
      bankingConfig: (updated.bankingConfig || prev.bankingConfig)
        ? {
            bankName: updated.bankingConfig?.bankName || prev.bankingConfig?.bankName || "",
            accountNumber: updated.bankingConfig?.accountNumber || prev.bankingConfig?.accountNumber || "",
            accountHolder: updated.bankingConfig?.accountHolder || prev.bankingConfig?.accountHolder || "",
            branch: updated.bankingConfig?.branch || prev.bankingConfig?.branch || "",
          }
        : undefined,
    }));
  };
  const [activeView, setActiveView] = useState<"sanctuary" | "wall">(initialView);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSizeOption>("normal");
  const [activeTab, setActiveTab] = useState<SidebarTab>("chat");
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userNotes, setUserNotes] = useState<string>("");
  const [selectedTranslation, setSelectedTranslation] = useState<string>("BTT 1925");

  // Read URL query parameter ?view=wall or ?view=sanctuary on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get("view");
      if (viewParam === "wall") {
        setActiveView("wall");
      } else {
        setActiveView("sanctuary");
      }
    }
  }, []);

  // Real-time synchronization of chat messages via Server-Sent Events (SSE)
  useEffect(() => {
    let isCancelled = false;

    // Initial load: fetch existing message history from MongoDB
    async function loadChatHistory() {
      try {
        const res = await fetch(`/api/chat?churchSlug=${encodeURIComponent(church.slug)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data) && !isCancelled) {
            setMessages(json.data);
          }
        }
      } catch (err) {
        console.warn("Using offline fallback chat messages:", err);
      }
    }

    loadChatHistory();

    let eventSource: EventSource | null = null;
    let fallbackPollTimer: NodeJS.Timeout | null = null;

    if (typeof window !== "undefined" && "EventSource" in window) {
      try {
        eventSource = new EventSource(
          `/api/realtime?churchSlug=${encodeURIComponent(church.slug)}&channel=chat`
        );

        eventSource.addEventListener("chat", (e: MessageEvent) => {
          if (isCancelled) return;
          try {
            const newMsg = JSON.parse(e.data);
            if (!newMsg || !newMsg.text) return;

            setMessages((prev) => {
              // Deduplicate if already present or replace temporary optimistic message
              const exists = prev.some(
                (m) =>
                  m._id === newMsg._id ||
                  m.id === newMsg.id ||
                  (m.id.startsWith("temp-") &&
                    m.text === newMsg.text &&
                    m.sender === newMsg.sender)
              );
              if (exists) {
                return prev.map((m) =>
                  m.id.startsWith("temp-") &&
                  m.text === newMsg.text &&
                  m.sender === newMsg.sender
                    ? { ...newMsg, id: newMsg._id || newMsg.id }
                    : m
                );
              }
              return [...prev, newMsg];
            });
          } catch (err) {
            console.error("Lỗi xử lý tin nhắn thời gian thực SSE:", err);
          }
        });

        eventSource.onerror = () => {
          // If SSE encounters an issue, activate an emergency slow poll (30s)
          if (!fallbackPollTimer && !isCancelled) {
            fallbackPollTimer = setInterval(loadChatHistory, 30000);
          }
        };

        eventSource.onopen = () => {
          // When SSE connects, disable polling entirely
          if (fallbackPollTimer) {
            clearInterval(fallbackPollTimer);
            fallbackPollTimer = null;
          }
        };
      } catch {
        fallbackPollTimer = setInterval(loadChatHistory, 15000);
      }
    } else {
      fallbackPollTimer = setInterval(loadChatHistory, 10000);
    }

    return () => {
      isCancelled = true;
      if (eventSource) eventSource.close();
      if (fallbackPollTimer) clearInterval(fallbackPollTimer);
    };
  }, [church.slug]);

  // Load persisted notes and accessibility settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedNotes = localStorage.getItem(`church_notes_${church.slug}`);
      if (savedNotes) setUserNotes(savedNotes);

      const savedFontSize = localStorage.getItem("church_font_size") as FontSizeOption;
      if (savedFontSize) {
        setFontSizeState(savedFontSize);
        document.body.setAttribute("data-font-size", savedFontSize);
      }
    }
  }, [church.slug]);

  const setFontSize = (size: FontSizeOption) => {
    setFontSizeState(size);
    if (typeof window !== "undefined") {
      localStorage.setItem("church_font_size", size);
      document.body.setAttribute("data-font-size", size);
    }
  };

  const toggleFocusMode = () => {
    setIsFocusMode((prev) => !prev);
  };

  const openModal = (modal: ActiveModal) => {
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const addMessage = async (
    text: string,
    isAmenOnly: boolean = false,
    customSender?: string
  ) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const senderName =
      customSender?.trim() ||
      (typeof window !== "undefined"
        ? localStorage.getItem("church_chat_sender_name")
        : null) ||
      "Tín hữu trực tuyến";

    const tempMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: senderName,
      role: "member",
      location: "Trực tuyến",
      text: text.trim(),
      timestamp: timeStr,
      isAmenOnly,
    };

    setMessages((prev) => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          churchSlug: church.slug,
          sender: senderName,
          role: "member",
          location: "Trực tuyến",
          text: text.trim(),
          timestamp: timeStr,
          isAmenOnly,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.id) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempMsg.id ? { ...m, id: json.data.id } : m))
          );
        }
      }
    } catch (err) {
      console.error("Lỗi đồng bộ tin nhắn MongoDB:", err);
    }
  };

  const saveUserNotes = (notes: string) => {
    setUserNotes(notes);
    if (typeof window !== "undefined") {
      localStorage.setItem(`church_notes_${church.slug}`, notes);
    }
  };

  return (
    <WorshipContext.Provider
      value={{
        church,
        isFocusMode,
        setIsFocusMode,
        toggleFocusMode,
        fontSize,
        setFontSize,
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        openModal,
        closeModal,
        messages,
        addMessage,
        userNotes,
        setUserNotes,
        saveUserNotes,
        selectedTranslation,
        setSelectedTranslation,
        activeView,
        setActiveView,
        updateChurch,
      }}
    >
      {children}
    </WorshipContext.Provider>
  );
}

export function useWorship() {
  const context = useContext(WorshipContext);
  if (!context) {
    throw new Error("useWorship must be used within a WorshipProvider");
  }
  return context;
}
