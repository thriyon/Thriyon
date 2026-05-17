"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type OpenJob = {
  id: string;
  title: string;
  category: string;
  budget: string;
  description: string;
  tags: string[];
};

export default function FreelancerDashboardPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [rateInput, setRateInput] = useState("");
  const [updatingRate, setUpdatingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (profile?.rate) {
      setRateInput(profile.rate.toString());
    }
  }, [profile]);

  useEffect(() => {
    async function loadOpenJobs() {
      try {
        const { data, error } = await supabase
          .from("freelance_jobs")
          .select("*")
          .eq("status", "Ouvert")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading open jobs:", error.message);
          return;
        }

        if (data) {
          setOpenJobs(
            data.map((job: any) => ({
              id: job.id,
              title: job.title,
              category: job.category,
              budget: job.budget,
              description: job.description,
              tags: job.tags || [],
            }))
          );
        }
      } catch (err) {
        console.error("Error fetching database briefs:", err);
      } finally {
        setLoadingJobs(false);
      }
    }

    loadOpenJobs();
  }, []);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rateInput) return;

    setUpdatingRate(true);
    setRateSuccess(false);

    try {
      const parsedRate = parseInt(rateInput, 10);
      const { error } = await supabase
        .from("profiles")
        .update({ rate: parsedRate })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating rate:", error.message);
      } else {
        setRateSuccess(true);
        await refreshProfile();
        setTimeout(() => setRateSuccess(false), 2000);
      }
    } catch (err) {
      console.error("Error in rate updates:", err);
    } finally {
      setUpdatingRate(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Background radial glowing effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-12">
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
            Sovereign Practitioner Workspace
          </span>
          <h1 className="font-display text-4xl font-medium text-gradient mt-1">
            Welcome back, {profile?.full_name || "Practitioner"}
          </h1>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Adjust active escrow parameters, edit pricing tags, and coordinate assignment channels.
          </p>
        </div>

        {/* Dynamic Controls Grid */}
        <div className="grid gap-6 md:grid-cols-[1fr_360px] items-start mb-16">
          {/* Main workspace widgets */}
          <div className="space-y-6">
            {/* Active metrics */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Stat 1 */}
              <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active Escrow Sprints</span>
                <div className="font-display text-3xl font-semibold text-foreground mt-2">2 sprints</div>
                <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Held in verified smart ledger</p>
              </div>

              {/* Stat 2 */}
              <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
                <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Cumulative Earnings</span>
                <div className="font-display text-3xl font-semibold text-foreground mt-2">$84,600</div>
                <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Escrow released this cycle</p>
              </div>
            </div>

            {/* List of Available Open Briefs from DB */}
            <div className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1">
              <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Available Open Briefs Ledger</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-accent/80 pl-2.5 pr-2 py-0.5 rounded bg-accent/5 border border-accent/25">Live updates</span>
              </div>

              {loadingJobs ? (
                <div className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Synchronizing active ledger briefs...
                </div>
              ) : openJobs.length === 0 ? (
                <div className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  No active briefs are currently open for assignment.
                </div>
              ) : (
                <div className="space-y-6">
                  {openJobs.map((job) => (
                    <div key={job.id} className="border-b border-white/4 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-display text-lg font-medium text-foreground">{job.title}</h4>
                        <span className="font-mono text-[9px] uppercase tracking-wider pl-2.5 pr-2 py-0.5 rounded border border-accent/25 bg-accent/5 text-accent">
                          {job.category}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-3 mb-4">
                        {job.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-mono text-[8px] uppercase text-muted-foreground/50">Allocated Escrow</span>
                          <div className="font-display text-sm font-semibold mt-0.5">{job.budget}</div>
                        </div>
                        <Link
                          href="/user/dashboard/messages"
                          className="rounded-full border border-white/15 hover:bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-wider"
                        >
                          Initiate Chat in Conduit →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar controls (Rate updates) */}
          <div className="space-y-6">
            {/* Direct rate persistence modifier */}
            <div className="glass rounded-3xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background grain">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Rate Tag Persistency</span>
              <h3 className="font-display text-2xl font-medium text-gradient mt-2">Adjust Hourly Escrow</h3>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Updates your sovereign profile entry instantly across the talent indices and active brief lists.
              </p>

              <form onSubmit={handleUpdateRate} className="mt-8 space-y-4">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                    Current Rate ($/hr)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 text-xs">$</span>
                    <input
                      type="number"
                      required
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      placeholder="180"
                      className="w-full bg-white/3 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatingRate}
                  className="w-full rounded-full bg-white py-3.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50 cursor-pointer"
                >
                  {updatingRate ? "Updating Profile..." : "Sync Rate Tag →"}
                </button>
              </form>

              <AnimatePresence>
                {rateSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 rounded-xl border border-accent/20 bg-accent/5 text-accent text-center font-mono text-[9px] uppercase tracking-wider"
                  >
                    ✓ Profile synchronized successfully.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick availability switcher */}
            <div className="glass rounded-3xl p-6 hairline border border-white/6">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Sovereign State Switcher</span>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-foreground">Escrow availability</div>
                  <div className="font-mono text-[8px] uppercase text-accent/80 tracking-wider mt-0.5">Active registry listing</div>
                </div>
                <div className="h-6 w-11 rounded-full bg-accent/20 border border-accent/40 p-0.5 flex items-center justify-end">
                  <div className="h-4.5 w-4.5 rounded-full bg-accent" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
