"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type Conversation = {
  id: string;
  partner: {
    id: string;
    full_name: string;
    role: string;
    avatar_url: string | null;
  };
  last_message_at: string;
  lastMessage?: string;
};

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    async function loadConversations() {
      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          last_message_at,
          participant_one,
          participant_two
        `,
        )
        .or(`participant_one.eq.${user!.id},participant_two.eq.${user!.id}`)
        .order("last_message_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoadingConvs(false);
        return;
      }
      if (!data || data.length === 0) {
        setLoadingConvs(false);
        return;
      }

      // Fetch partner profiles
      const partnerIds = data.map((c: any) =>
        c.participant_one === user!.id ? c.participant_two : c.participant_one,
      );

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url")
        .in("id", partnerIds);

      const profileMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p]));

      // Fetch last message for each conversation
      const convList: Conversation[] = await Promise.all(
        data.map(async (c: any) => {
          const partnerId = c.participant_one === user!.id ? c.participant_two : c.participant_one;
          const partner = profileMap[partnerId] || {
            id: partnerId,
            full_name: "Unknown",
            role: "—",
            avatar_url: null,
          };

          const { data: lastMsgData } = await supabase
            .from("messages")
            .select("content")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1);

          return {
            id: c.id,
            partner,
            last_message_at: c.last_message_at,
            lastMessage: lastMsgData?.[0]?.content || "No messages yet.",
          };
        }),
      );

      setConversations(convList);
      if (convList.length > 0) setActiveConvId(convList[0].id);
      setLoadingConvs(false);
    }

    loadConversations();
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId || !user) return;
    setLoadingMsgs(true);

    async function loadMessages() {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at, read")
        .eq("conversation_id", activeConvId)
        .order("created_at", { ascending: true });

      if (!error && data) setMessages(data);
      setLoadingMsgs(false);
    }

    loadMessages();

    // Mark messages as read
    supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", activeConvId)
      .neq("sender_id", user.id)
      .then(() => {});

    // Realtime subscription for new messages
    const channel = supabase
      .channel(`messages:${activeConvId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConvId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConvId, user]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConvId || !user) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert({
      conversation_id: activeConvId,
      sender_id: user.id,
      content: text.trim(),
    });

    if (!error) {
      // Update last_message_at on conversation
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", activeConvId);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: text.trim(), last_message_at: new Date().toISOString() }
            : c,
        ),
      );
      setText("");
    }
    setSending(false);
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px] h-[calc(100vh-220px)] flex flex-col">
        <div className="mb-8">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Le Conduit · Quiet Chat
          </span>
          <h1 className="font-display text-4xl font-medium text-gradient mt-1">
            Sovereign Messaging
          </h1>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr] rounded-3xl glass hairline border border-white/6 overflow-hidden bg-gradient-to-br from-graphite/30 to-background/50">
          {/* Sidebar */}
          <div className="border-r border-white/6 flex flex-col bg-white/1">
            <div className="p-4 border-b border-white/6 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              Secure Channels ({conversations.length})
            </div>

            <div className="flex-grow overflow-y-auto divide-y divide-white/4">
              {loadingConvs ? (
                <div className="p-8 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Establishing secure channels...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  No conversations yet. Start by messaging a freelancer from their profile.
                </div>
              ) : (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConvId(conv.id)}
                      className={`w-full text-left p-4 flex items-start gap-3 transition cursor-pointer ${
                        isActive ? "bg-white/6" : "hover:bg-white/3"
                      }`}
                    >
                      <div className="relative h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5 flex items-center justify-center font-display text-xs font-semibold text-foreground">
                        {conv.partner.avatar_url ? (
                          <img
                            src={conv.partner.avatar_url}
                            alt=""
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          initials(conv.partner.full_name)
                        )}
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#09090b] bg-accent" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <span className="font-display text-sm font-medium text-foreground truncate">
                            {conv.partner.full_name}
                          </span>
                          <span className="font-mono text-[8px] text-muted-foreground/50 shrink-0 ml-2">
                            {timeAgo(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="font-mono text-[9px] text-accent/80 uppercase tracking-wide mb-1 truncate">
                          {conv.partner.role}
                        </p>
                        <p className="text-xs text-muted-foreground/60 truncate leading-relaxed">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat View */}
          <div className="flex flex-col h-full">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                Select a channel to begin transmission
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="p-4 border-b border-white/6 flex items-center justify-between bg-white/1">
                  <div>
                    <h3 className="font-display text-base font-medium text-foreground">
                      {activeConv.partner.full_name}
                    </h3>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">
                      {activeConv.partner.role}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider pl-3 pr-2 py-0.5 rounded-full border border-white/6 bg-white/3">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Secure
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                  {loadingMsgs ? (
                    <div className="text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground pt-12">
                      Loading channel...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground pt-12">
                      No messages yet. Start the transmission.
                    </div>
                  ) : (
                    <AnimatePresence>
                      {messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        const time = new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col max-w-[70%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                isMe
                                  ? "bg-white text-black font-medium rounded-tr-none"
                                  : "glass border border-white/8 text-foreground/90 rounded-tl-none bg-white/4"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <span className="font-mono text-[8px] text-muted-foreground/45 mt-1">
                              {time}
                            </span>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSend}
                  className="p-4 border-t border-white/6 bg-white/1 flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Secure message..."
                    className="flex-grow bg-white/3 border border-white/8 rounded-full px-5 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black font-semibold hover:bg-white/95 transition duration-300 cursor-pointer disabled:opacity-50"
                  >
                    {sending ? (
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                    ) : (
                      <svg
                        className="h-4 w-4 transform rotate-90"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 19l9-2-9-15-9 15 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
