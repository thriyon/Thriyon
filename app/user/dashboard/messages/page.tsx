"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

type ChatPartner = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: "online" | "offline";
  lastMessage: string;
  time: string;
};

type Message = {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: string;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Curated list of high-profile practitioners / clients to chat with
  const [partners, setPartners] = useState<ChatPartner[]>([
    { id: "iris", name: "Iris Kano", role: "Creative Director", avatar: "IK", status: "online", lastMessage: "Receiving brief specifications, analysis initiated...", time: "2 min ago" },
    { id: "leon", name: "Leon Vasquez", role: "3D & Motion Designer", avatar: "LV", status: "online", lastMessage: "Can we anchor the interactive physics variables?", time: "20 min ago" },
    { id: "amaru", name: "Amaru Sol", role: "Product Designer", avatar: "AS", status: "offline", lastMessage: "The Monolith OS design tokens look extremely stable.", time: "2 hours ago" },
    { id: "noa", name: "Noa Fontaine", role: "Brand Strategist", avatar: "NF", status: "online", lastMessage: "I'll initiate the escrow allocation now.", time: "1 day ago" }
  ]);

  const [activePartnerId, setActivePartnerId] = useState("iris");
  const [text, setText] = useState("");
  const [chats, setChats] = useState<Record<string, Message[]>>({
    iris: [
      { id: "1", sender: "them", text: "Welcome to Le Conduit. We have established a secure communication pipeline.", timestamp: "16:40" },
      { id: "2", sender: "me", text: "Brilliant. Did you review the Rebrand brief for Atlas?", timestamp: "16:42" },
      { id: "3", sender: "them", text: "Yes. The cinematic parameters are extremely clean. Creative direction aligns perfectly with our studio timelines.", timestamp: "16:43" }
    ],
    leon: [
      { id: "1", sender: "them", text: "Hey! Volumetric shaders for the hero sphere compiled successfully.", timestamp: "15:02" },
      { id: "2", sender: "me", text: "Superb work. Can we tweak the mouse repulsion multiplier?", timestamp: "15:05" },
      { id: "3", sender: "them", text: "Can we anchor the interactive physics variables? Let me verify the code.", timestamp: "15:08" }
    ],
    amaru: [
      { id: "1", sender: "them", text: "We completed the initial design system sprints. Standard typography and token structures are established.", timestamp: "12:00" },
      { id: "2", sender: "me", text: "Incredible. Let's merge it to the master app/globals.css.", timestamp: "12:10" }
    ],
    noa: [
      { id: "1", sender: "them", text: "The brand strategy document has been committed to the IP ledger.", timestamp: "Yesterday" }
    ]
  });

  const activePartner = partners.find((p) => p.id === activePartnerId) || partners[0];
  const activeMessages = chats[activePartnerId] || [];

  // Scroll chat window to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      sender: "me",
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...activeMessages, newMessage];

    setChats((prev) => ({
      ...prev,
      [activePartnerId]: updatedMessages
    }));

    // Update partner's last message on sidebar
    setPartners((prev) =>
      prev.map((p) =>
        p.id === activePartnerId
          ? { ...p, lastMessage: text.trim(), time: "Just now" }
          : p
      )
    );

    setText("");

    // Simulate elite auto-response based on partner character
    setTimeout(() => {
      let replyText = "Brief acknowledged. Resolving parameters...";
      if (activePartnerId === "iris") {
        replyText = "Manifesto parameters verified. Preparing conceptual moodboards inside our workspace.";
      } else if (activePartnerId === "leon") {
        replyText = "Understood. Repulsion vectors optimized, running WebGL rendering locally now.";
      } else if (activePartnerId === "noa") {
        replyText = "Escrow allocation logged. Our brand strategist is ready to initiate the onboarding sprint.";
      }

      const botMessage: Message = {
        id: Math.random().toString(),
        sender: "them",
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setChats((prev) => ({
        ...prev,
        [activePartnerId]: [...(prev[activePartnerId] || []), botMessage]
      }));

      setPartners((prev) =>
        prev.map((p) =>
          p.id === activePartnerId
            ? { ...p, lastMessage: replyText, time: "Just now" }
            : p
        )
      );
    }, 1500);
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Cinematic back-glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px] h-[calc(100vh-220px)] flex flex-col">
        {/* Title Banner */}
        <div className="mb-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Le Conduit · Quiet Chat
          </span>
          <h1 className="font-display text-4xl font-medium text-gradient mt-1">Sovereign Messaging</h1>
        </div>

        {/* Messaging Layout Container */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] rounded-3xl glass hairline border border-white/6 overflow-hidden bg-gradient-to-br from-graphite/30 to-background/50">
          
          {/* Sidebar Chat List */}
          <div className="border-r border-white/6 flex flex-col bg-white/1">
            <div className="p-4 border-b border-white/6 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Secure Channels ({partners.length})
            </div>
            
            <div className="flex-grow overflow-y-auto divide-y divide-white/4">
              {partners.map((partner) => {
                const isActive = partner.id === activePartnerId;
                return (
                  <button
                    key={partner.id}
                    onClick={() => setActivePartnerId(partner.id)}
                    className={`w-full text-left p-4 flex items-start gap-3 transition cursor-pointer ${
                      isActive ? "bg-white/6" : "hover:bg-white/3"
                    }`}
                  >
                    {/* Visual Avatar */}
                    <div className="relative h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-display text-xs font-semibold text-foreground">
                      {partner.avatar}
                      <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#09090b] ${
                        partner.status === "online" ? "bg-accent" : "bg-muted-foreground/30"
                      }`} />
                    </div>

                    {/* Meta Detail */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="font-display text-sm font-medium text-foreground">{partner.name}</span>
                        <span className="font-mono text-[8px] text-muted-foreground/50">{partner.time}</span>
                      </div>
                      <p className="font-mono text-[9px] text-accent/80 uppercase tracking-wide mb-1 truncate">{partner.role}</p>
                      <p className="text-xs text-muted-foreground/60 truncate leading-relaxed">
                        {partner.lastMessage}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chat Conversation View */}
          <div className="flex flex-col h-full bg-white/0.5">
            {/* Active Partner Header */}
            <div className="p-4 border-b border-white/6 flex items-center justify-between bg-white/1">
              <div>
                <h3 className="font-display text-base font-medium text-foreground">{activePartner.name}</h3>
                <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">{activePartner.role}</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider pl-3 pr-2 py-0.5 rounded-full border border-white/6 bg-white/3">
                <span className={`h-1.5 w-1.5 rounded-full ${activePartner.status === "online" ? "bg-accent" : "bg-muted-foreground/50"}`} />
                {activePartner.status === "online" ? "Ready" : "Away"}
              </div>
            </div>

            {/* Message Bubble Thread */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {activeMessages.map((msg) => {
                  const isMe = msg.sender === "me";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex flex-col max-w-[70%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                        isMe
                          ? "bg-white text-black font-medium rounded-tr-none"
                          : "glass border border-white/8 text-foreground/90 rounded-tl-none bg-white/4"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="font-mono text-[8px] text-muted-foreground/45 mt-1">{msg.timestamp}</span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/6 bg-white/1 flex items-center gap-3">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Secure message..."
                className="flex-grow bg-white/3 border border-white/8 rounded-full px-5 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
              />
              <button
                type="submit"
                className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black font-semibold hover:bg-white/95 transition duration-300 cursor-pointer"
              >
                <svg className="h-4 w-4 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-2-9-15-9 15 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
