"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function ClientDashboardPage() {
  const { user, profile } = useAuth();
  const [briefsCount, setBriefsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClientStats() {
      if (!user) return;
      try {
        const { count, error } = await supabase
          .from("freelance_jobs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (error) {
          console.error("Error loading stats:", error.message);
        } else if (count !== null) {
          setBriefsCount(count);
        }
      } catch (err) {
        console.error("Error fetching dashboard statistics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadClientStats();
  }, [user]);

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Background radial violet glows */}
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
            Analyze briefs, escrow flows, and direct-contract communications.
          </p>
        </div>

        {/* Operational Statistics */}
        <div className="grid gap-6 sm:grid-cols-3 mb-12">
          {/* Stat 1 */}
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Live Briefs posted</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">
              {loading ? "..." : briefsCount}
            </div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Transmitted to blockchain ledger</p>
          </div>

          {/* Stat 2 */}
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Allocated Escrow</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">$145,000</div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Held securely in smart hold</p>
          </div>

          {/* Stat 3 */}
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active Specialists</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">3 partners</div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Allocated across 2 nodes</p>
          </div>
        </div>

        {/* Dynamic Navigation cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* Action 1 */}
          <Link
            href="/user/dashboard/client/briefs/new"
            className="group glass rounded-2xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/5 blur-3xl opacity-40 transition-all duration-500 group-hover:scale-125" />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/80">Escrow Contract Node</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 group-hover:text-accent transition-colors">
                Initiate New Brief →
              </h3>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Publish a sovereign task statement, specify parameters, and open application channels.
              </p>
            </div>
            <div className="mt-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">Sovereign allocation</div>
          </Link>

          {/* Action 2 */}
          <Link
            href="/user/dashboard/client/briefs"
            className="group glass rounded-2xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background hover:bg-white/5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/5 blur-3xl opacity-40 transition-all duration-500 group-hover:scale-125" />
            <div>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-accent/80">Active Ledger Node</span>
              <h3 className="font-display text-2xl font-medium text-foreground mt-2 group-hover:text-accent transition-colors">
                Manage Active Briefs →
              </h3>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Review incoming proposals, verify escrow milestones, and coordinate deliveries.
              </p>
            </div>
            <div className="mt-8 font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">Sovereign coordination</div>
          </Link>
        </div>

        {/* Recent Updates */}
        <div className="glass rounded-3xl p-8 hairline border border-white/6">
          <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Recent Ledger Activity</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-accent/80 pl-2.5 pr-2 py-0.5 rounded bg-accent/5 border border-accent/25">Live pipeline</span>
          </div>

          <div className="space-y-4">
            {[
              { id: 1, text: "Practitioner Iris Kano accepted Atlas Rebrand escrow brief.", time: "10 mins ago" },
              { id: 2, text: "Secured milestone #1 payment for Monolith OS dashboard integration.", time: "2 hours ago" },
              { id: 3, text: "Transmitted $40,000 project escrow hold to active ledger.", time: "1 day ago" }
            ].map((update) => (
              <div key={update.id} className="flex justify-between items-center text-xs text-muted-foreground/90">
                <span>{update.text}</span>
                <span className="font-mono text-[9px] text-muted-foreground/50">{update.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
