"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { StatCard } from "@/components/user/StatCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  ArrowRight,
  FileText,
  Layers,
  MessageSquare,
  User,
  Zap,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
type Brief = { id: string; title: string; status: string; created_at: string; proposal_count?: number };
type Contract = { id: string; title: string; escrow_status: string; escrow_amount: number; other_party?: string };
type Activity = { id: string; title: string; content: string | null; created_at: string; read: boolean; type?: string };

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const statusBadge: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
  "Ouvert":        { variant: "outline",   label: "Open",       icon: <AlertCircle className="h-2.5 w-2.5" /> },
  "En cours":      { variant: "secondary", label: "Active",     icon: <Clock className="h-2.5 w-2.5" /> },
  "Fonds déposés": { variant: "secondary", label: "Funded",     icon: <Zap className="h-2.5 w-2.5" /> },
  "Livré":         { variant: "default",   label: "Delivered",  icon: <CheckCircle className="h-2.5 w-2.5" /> },
  "Terminé":       { variant: "secondary", label: "Done",       icon: <CheckCircle className="h-2.5 w-2.5" /> },
  "Annulé":        { variant: "destructive", label: "Cancelled", icon: <XCircle className="h-2.5 w-2.5" /> },
  "En litige":     { variant: "destructive", label: "Dispute",  icon: <AlertCircle className="h-2.5 w-2.5" /> },
};

const quickActions = [
  { href: "/user/dashboard/client/briefs/new", label: "Post a Brief", icon: Plus, sub: "Escrow contract node" },
  { href: "/user/dashboard/client/briefs",     label: "My Briefs",   icon: FileText, sub: "Active ledger" },
  { href: "/user/dashboard/messages",           label: "Messages",    icon: MessageSquare, sub: "Le conduit" },
  { href: "/user/profile",                      label: "My Profile",  icon: User, sub: "Public view" },
];

const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile } = useAuth();

  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [totalEscrow, setTotalEscrow] = useState(0);
  const [activeContracts, setActiveContracts] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const isFreelancer = profile?.role === "freelancer";
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      const [briefsRes, contractsRes, notifRes] = await Promise.all([
        supabase
          .from("freelance_jobs")
          .select("id, title, status, created_at")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false })
          .limit(6),

        isFreelancer
          ? supabase.from("contracts").select("id, title, escrow_status, escrow_amount, client:client_id(full_name)").eq("freelancer_id", user!.id).limit(6)
          : supabase.from("contracts").select("id, title, escrow_status, escrow_amount, freelancer:freelancer_id(full_name)").eq("client_id", user!.id).limit(6),

        supabase.from("notifications").select("id, title, content, created_at, read").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(8),
      ]);

      if (cancelled) return;

      if (briefsRes.data) {
        const withCounts = await Promise.all(
          briefsRes.data.map(async (b: any) => {
            const { count } = await supabase.from("job_proposals").select("*", { count: "exact", head: true }).eq("job_id", b.id);
            return { ...b, proposal_count: count ?? 0 };
          })
        );
        setBriefs(withCounts);
      }

      if (contractsRes.data) {
        const mapped = (contractsRes.data as any[]).map((c) => ({
          id: c.id,
          title: c.title,
          escrow_status: c.escrow_status,
          escrow_amount: c.escrow_amount,
          other_party: isFreelancer ? c.client?.full_name : c.freelancer?.full_name,
        }));
        setContracts(mapped);
        setActiveContracts(mapped.filter((c) => ["En cours", "Fonds déposés", "Livré"].includes(c.escrow_status)).length);
        setTotalEscrow(mapped.filter((c) => !["Terminé", "Annulé"].includes(c.escrow_status)).reduce((a, c) => a + (c.escrow_amount ?? 0), 0));
        setEarnings(mapped.filter((c) => c.escrow_status === "Terminé").reduce((a, c) => a + (c.escrow_amount ?? 0), 0));
      }

      if (notifRes.data) setActivity(notifRes.data);
      setLoading(false);
    }

    load();

    const channel = supabase
      .channel(`notifs:${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (p) => {
        if (!cancelled) setActivity((prev) => [p.new as Activity, ...prev.slice(0, 7)]);
      })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user, isFreelancer]);

  return (
    <div className="relative min-h-full w-full px-6 pt-8 pb-16 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 h-[350px] w-[700px] -translate-x-1/2 rounded-full bg-accent/10 blur-[100px] opacity-60" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-10" />

      <div className="mx-auto max-w-[1300px]">

        {/* ── Header ── */}
        <motion.div {...fadeUp} className="mb-10">
          <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-muted-foreground/60">
            {isFreelancer ? "Sovereign Practitioner" : "Sovereign Client"} · Workspace
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-foreground mt-1">
            {greeting}, <span className="text-violet">{profile?.full_name?.split(" ")[0] || "Practitioner"}</span> 👋
          </h1>
          <p className="text-xs text-muted-foreground/70 mt-1.5 max-w-md">
            {isFreelancer
              ? "Track proposals, manage services, and grow your sovereign practice."
              : "Manage briefs, monitor escrow, and coordinate with elite practitioners."}
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <StatCard label="Active Contracts" value={loading ? "—" : activeContracts} sublabel="Live escrow sprints" loading={loading} />
          <StatCard label={isFreelancer ? "Earnings" : "Escrow Allocated"} value={loading ? "—" : `$${(isFreelancer ? earnings : totalEscrow).toLocaleString()}`} sublabel={isFreelancer ? "Released escrow" : "In active contracts"} trend={!loading && (isFreelancer ? earnings > 0 : totalEscrow > 0) ? "up" : "neutral"} trendLabel={!loading ? "vs last month" : undefined} loading={loading} />
          <StatCard label="Briefs Posted" value={loading ? "—" : briefs.length} sublabel="Total submissions" loading={loading} />
          <StatCard label={isFreelancer ? "Hourly Rate" : "Profile Views"} value={loading ? "—" : isFreelancer ? `$${profile?.rate ?? 0}/hr` : "—"} sublabel={isFreelancer ? "Sovereign hourly tag" : "Public impressions"} accent loading={loading} />
        </motion.div>

        {/* ── Main Grid ── */}
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">

          {/* Left column */}
          <div className="space-y-6">

            {/* Quick Actions */}
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }}>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-3 block">Quick Actions</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {quickActions.map(({ href, label, icon: Icon, sub }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group glass rounded-2xl p-4 hairline border border-white/6 hover:border-accent/20 hover:bg-accent/3 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/4 border border-white/8 group-hover:border-accent/20 group-hover:bg-accent/10 transition">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-accent transition" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground group-hover:text-accent transition">{label}</p>
                      <p className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/50 mt-0.5">{sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Briefs */}
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }} className="glass rounded-3xl p-6 hairline border border-white/6">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Recent Briefs</span>
                <Link href="/user/dashboard/client/briefs" className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-accent/80 hover:text-accent transition">
                  View all <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl bg-white/4" />)}
                </div>
              ) : briefs.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-4">
                  <FileText className="h-8 w-8 text-muted-foreground/20" />
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40">No briefs posted yet</p>
                  <Link href="/user/dashboard/client/briefs/new" className="rounded-full bg-white px-5 py-2 text-[10px] font-semibold text-black hover:bg-white/90 transition">
                    Post Your First Brief →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {briefs.map((b) => {
                    const bs = statusBadge[b.status];
                    return (
                      <motion.div
                        key={b.id}
                        whileHover={{ x: 2 }}
                        className="flex items-center justify-between rounded-xl border border-white/5 bg-white/2 px-4 py-3 hover:border-white/10 transition cursor-default"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{b.title}</p>
                          <p className="font-mono text-[8px] uppercase text-muted-foreground/40 mt-0.5">
                            {b.proposal_count} proposal{b.proposal_count !== 1 ? "s" : ""} · {timeAgo(b.created_at)}
                          </p>
                        </div>
                        {bs && (
                          <Badge variant={bs.variant} className="ml-3 shrink-0 gap-1 font-mono text-[8px] uppercase tracking-wider">
                            {bs.icon}{bs.label}
                          </Badge>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Active Contracts */}
            <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }} className="glass rounded-3xl p-6 hairline border border-white/6">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active Contracts</span>
                <Layers className="h-3.5 w-3.5 text-muted-foreground/30" />
              </div>
              {loading ? (
                <div className="space-y-3">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl bg-white/4" />)}</div>
              ) : contracts.length === 0 ? (
                <p className="text-center py-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">No contracts yet</p>
              ) : (
                <div className="space-y-2">
                  {contracts.map((c) => {
                    const bs = statusBadge[c.escrow_status];
                    return (
                      <div key={c.id} className="rounded-xl border border-white/5 bg-white/2 px-4 py-3">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <p className="text-xs font-medium text-foreground truncate">{c.title}</p>
                          {bs && (
                            <Badge variant={bs.variant} className="shrink-0 gap-1 font-mono text-[8px] uppercase">
                              {bs.icon}{bs.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between font-mono text-[8px] uppercase text-muted-foreground/40">
                          <span>{c.other_party || "—"}</span>
                          <span>${(c.escrow_amount ?? 0).toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right column — Activity feed */}
          <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.25 }}>
            <div className="glass rounded-3xl p-6 hairline border border-white/6 sticky top-24">
              <div className="flex justify-between items-center mb-5 pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Activity</span>
                  {activity.some((a) => !a.read) && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                  )}
                </div>
                {activity.some((a) => !a.read) && (
                  <button
                    onClick={async () => {
                      await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
                      setActivity((p) => p.map((a) => ({ ...a, read: true })));
                    }}
                    className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/50 hover:text-foreground transition cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <ScrollArea className="h-[480px] pr-2">
                {loading ? (
                  <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl bg-white/4" />)}</div>
                ) : activity.length === 0 ? (
                  <p className="text-center py-16 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/30">No activity yet</p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence initial={false}>
                      {activity.map((a) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={`rounded-xl border px-4 py-3 transition ${
                            a.read ? "border-white/4 bg-white/1" : "border-accent/15 bg-accent/3"
                          }`}
                        >
                          <div className="flex justify-between items-baseline gap-2 mb-0.5">
                            <p className={`text-[11px] font-medium truncate ${a.read ? "text-foreground/60" : "text-foreground"}`}>
                              {a.title}
                            </p>
                            <span className="font-mono text-[8px] text-muted-foreground/30 shrink-0">{timeAgo(a.created_at)}</span>
                          </div>
                          {a.content && (
                            <p className="text-[10px] text-muted-foreground/50 leading-relaxed line-clamp-2">{a.content}</p>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
