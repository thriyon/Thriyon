"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Brief = {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: string;
  created_at: string;
  proposal_count?: number;
};

type Contract = {
  id: string;
  title: string;
  escrow_status: string;
  escrow_amount: number;
  freelancer: { full_name: string } | null;
};

type Notification = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  read: boolean;
};

export default function ClientDashboardPage() {
  const { user, profile } = useAuth();

  const [offers, setOffers] = useState<Brief[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Aggregate stats
  const [totalEscrow, setTotalEscrow] = useState(0);
  const [activeContractCount, setActiveContractCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    async function loadAll() {
      // My offers with proposal counts
      const { data: offersData } = await supabase
        .from("freelance_jobs")
        .select("id, title, category, budget, status, created_at")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (offersData) {
        const offersWithCounts = await Promise.all(
          offersData.map(async (b: any) => {
            const { count } = await supabase
              .from("job_proposals")
              .select("*", { count: "exact", head: true })
              .eq("job_id", b.id);
            return { ...b, proposal_count: count || 0 };
          })
        );
        setOffers(offersWithCounts);
      }

      // My active contracts
      const { data: contractsData } = await supabase
        .from("contracts")
        .select("id, title, escrow_status, escrow_amount, freelancer:freelancer_id(full_name)")
        .eq("client_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (contractsData) {
        setContracts(contractsData as any);
        setActiveContractCount(
          contractsData.filter((c: any) => ["En cours", "Fonds déposés", "Livré"].includes(c.escrow_status)).length
        );
        setTotalEscrow(
          contractsData
            .filter((c: any) => !["Terminé", "Annulé"].includes(c.escrow_status))
            .reduce((acc: number, c: any) => acc + (c.escrow_amount || 0), 0)
        );
      }

      // Notifications
      const { data: notifData } = await supabase
        .from("notifications")
        .select("id, title, content, created_at, read")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (notifData) setNotifications(notifData);
      setLoading(false);
    }

    loadAll();

    // Realtime notification subscription
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev.slice(0, 4)]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = async () => {
    await supabase.from("notifications").update({ read: true }).eq("user_id", user!.id).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const statusColors: Record<string, string> = {
    "Ouvert": "text-accent border-accent/25 bg-accent/5",
    "En cours": "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
    "Terminé": "text-muted-foreground border-white/10 bg-white/3",
    "Fermé": "text-muted-foreground border-white/10 bg-white/3",
    "Fonds déposés": "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
    "Livré": "text-accent border-accent/25 bg-accent/5",
    "Annulé": "text-destructive border-destructive/20 bg-destructive/5",
    "En litige": "text-destructive border-destructive/20 bg-destructive/5",
  };

  function timeAgo(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Sovereign Client Workspace
          </span>
          <h1 className="font-display text-4xl font-medium text-gradient mt-1">
            Welcome back, {profile?.full_name || "Sovereign Client"}
          </h1>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Gérez vos offres, suivez vos contrats actifs et flux d'escrow.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Offres actives</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">
              {loading ? "..." : offers.length}
            </div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Transmitted to ledger</p>
          </div>
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Allocated Escrow</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">
              ${totalEscrow.toLocaleString()}
            </div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Held in active contracts</p>
          </div>
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active Contracts</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">{activeContractCount}</div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Live partner engagements</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-10">
          <Link
            href={`/${profile?.username || 'user'}/dashboard/client/offers/new`}
            className="group glass rounded-2xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/5 blur-3xl opacity-40 transition-all duration-500 group-hover:scale-125" />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/80">Escrow Contract Node</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 group-hover:text-accent transition-colors">
                Créer une Offre →
              </h3>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Publiez un cahier des charges, spécifiez les paramètres et ouvrez les candidatures.
              </p>
            </div>
            <div className="mt-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">Sovereign allocation</div>
          </Link>
          <Link
            href={`/${profile?.username || 'user'}/dashboard/client/offers`}
            className="group glass rounded-2xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/5 blur-3xl opacity-40 transition-all duration-500 group-hover:scale-125" />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/80">Active Ledger Node</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 group-hover:text-accent transition-colors">
                Gérer les Offres Actives →
              </h3>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Examinez les propositions reçues, vérifiez les jalons d'escrow et coordonnez les livraisons.
              </p>
            </div>
            <div className="mt-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">Sovereign coordination</div>
          </Link>
        </div>

        {/* Bottom grid: Recent briefs + Recent contracts + Notifications */}
        <div className="grid gap-6 md:grid-cols-[1fr_1fr_340px]">

          {/* Recent Briefs */}
          <div className="glass rounded-3xl p-6 hairline border border-white/6">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Offres Récentes</span>
              <Link href={`/${profile?.username || 'user'}/dashboard/client/offers`} className="font-mono text-[8px] uppercase tracking-wider text-accent/80 hover:text-accent transition">
                View all →
              </Link>
            </div>
            {loading ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center py-6">Loading...</p>
            ) : offers.length === 0 ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center py-6">Aucune offre publiée pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {offers.map((brief) => (
                  <div key={brief.id} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-foreground font-medium truncate">{brief.title}</p>
                      <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-0.5">
                        {brief.proposal_count} proposal{brief.proposal_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <span className={`ml-3 font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusColors[brief.status] || ""}`}>
                      {brief.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Contracts */}
          <div className="glass rounded-3xl p-6 hairline border border-white/6">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active Contracts</span>
            </div>
            {loading ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center py-6">Loading...</p>
            ) : contracts.length === 0 ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center py-6">No contracts yet.</p>
            ) : (
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div key={contract.id} className="rounded-xl border border-white/6 bg-white/2 px-4 py-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs text-foreground font-medium truncate flex-1 mr-2">{contract.title}</p>
                      <span className={`font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${statusColors[contract.escrow_status] || ""}`}>
                        {contract.escrow_status}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">
                      <span>{contract.freelancer?.full_name || "—"}</span>
                      <span>${contract.escrow_amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="glass rounded-3xl p-6 hairline border border-white/6">
            <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Notifications</span>
                {notifications.some((n) => !n.read) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </div>
              {notifications.some((n) => !n.read) && (
                <button
                  onClick={markAllRead}
                  className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60 hover:text-foreground transition cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            {loading ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center py-6">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground text-center py-6">No activity yet.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`rounded-xl border px-4 py-3 transition ${
                      notif.read ? "border-white/4 bg-white/1" : "border-accent/15 bg-accent/3"
                    }`}
                  >
                    <div className="flex justify-between items-baseline">
                      <p className={`text-xs font-medium ${notif.read ? "text-foreground/70" : "text-foreground"}`}>
                        {notif.title}
                      </p>
                      <span className="font-mono text-[8px] text-muted-foreground/40 ml-2 shrink-0">{timeAgo(notif.created_at)}</span>
                    </div>
                    {notif.content && (
                      <p className="text-[10px] text-muted-foreground/60 mt-1 leading-relaxed line-clamp-2">{notif.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
