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

type MyService = {
  id: string;
  title: string;
  category: string;
  price: number;
  delivery_days: number;
  status: string;
};

type Proposal = {
  id: string;
  status: string;
  bid_amount: number;
  created_at: string;
  freelance_jobs: { title: string } | null;
};

export default function FreelancerDashboardPage() {
  const { user, profile, refreshProfile } = useAuth();

  // Rate
  const [rateInput, setRateInput] = useState("");
  const [updatingRate, setUpdatingRate] = useState(false);
  const [rateSuccess, setRateSuccess] = useState(false);

  // Offres Ouvertes
  const [openJobs, setOpenJobs] = useState<OpenJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  // My Services
  const [myServices, setMyServices] = useState<MyService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // My Proposals
  const [myProposals, setMyProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);

  // Contract counts
  const [activeContracts, setActiveContracts] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  // Active tab
  const [activeTab, setActiveTab] = useState<"offers" | "services" | "proposals">("offers");

  useEffect(() => {
    if (profile?.rate) setRateInput(profile.rate.toString());
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    // Load open jobs
    supabase
      .from("freelance_jobs")
      .select("id, title, category, budget, description, tags")
      .eq("status", "Ouvert")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setOpenJobs(data);
        setLoadingJobs(false);
      });

    // Load my services
    supabase
      .from("freelancer_services")
      .select("id, title, category, price, delivery_days, status")
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMyServices(data);
        setLoadingServices(false);
      });

    // Load my proposals
    supabase
      .from("job_proposals")
      .select("id, status, bid_amount, created_at, freelance_jobs(title)")
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMyProposals(data as any);
        setLoadingProposals(false);
      });

    // Load active contracts
    supabase
      .from("contracts")
      .select("id, escrow_amount, escrow_status")
      .eq("freelancer_id", user.id)
      .then(({ data }) => {
        if (data) {
          setActiveContracts(data.filter((c: any) => c.escrow_status === "En cours").length);
          setTotalEarnings(
            data
              .filter((c: any) => c.escrow_status === "Terminé")
              .reduce((acc: number, c: any) => acc + (c.escrow_amount || 0), 0)
          );
        }
      });
  }, [user]);

  const handleUpdateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !rateInput) return;
    setUpdatingRate(true);
    setRateSuccess(false);
    const { error } = await supabase
      .from("profiles")
      .update({ rate: parseInt(rateInput, 10) })
      .eq("id", user.id);
    if (!error) {
      setRateSuccess(true);
      await refreshProfile();
      setTimeout(() => setRateSuccess(false), 2500);
    }
    setUpdatingRate(false);
  };

  const handleToggleService = async (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === "Actif" ? "Inactif" : "Actif";
    await supabase.from("freelancer_services").update({ status: newStatus }).eq("id", serviceId);
    setMyServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, status: newStatus } : s)));
  };

  const handleDeleteService = async (serviceId: string) => {
    await supabase.from("freelancer_services").delete().eq("id", serviceId);
    setMyServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const tabs = [
    { key: "offers", label: "Offres Ouvertes" },
    { key: "services", label: "My Services" },
    { key: "proposals", label: "My Proposals" },
  ] as const;

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
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
        </div>

        {/* Stats Row */}
        <div className="grid gap-6 sm:grid-cols-3 mb-10">
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Active Contracts</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">{activeContracts}</div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Live escrow sprints</p>
          </div>
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Cumulative Earnings</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">
              ${totalEarnings.toLocaleString()}
            </div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Escrow released</p>
          </div>
          <div className="glass rounded-2xl p-6 hairline border border-white/6 bg-white/1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Current Rate</span>
            <div className="font-display text-3xl font-semibold text-foreground mt-2">
              ${profile?.rate || 0}/hr
            </div>
            <p className="font-mono text-[8px] uppercase text-muted-foreground/50 mt-1">Sovereign hourly tag</p>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid gap-6 md:grid-cols-[1fr_320px] items-start">
          {/* Left — tabbed content */}
          <div className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1">
            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-white/6 pb-4">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full transition cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-accent/10 text-accent border border-accent/25"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              {activeTab === "services" && (
                <Link
                  href={`/${profile?.username || 'user'}/dashboard/freelancer/services/new`}
                  className="ml-auto font-mono text-[9px] uppercase tracking-wider px-3 py-1.5 rounded-full bg-white text-black transition hover:bg-white/90 cursor-pointer"
                >
                  + Add Service
                </Link>
              )}
            </div>

            <AnimatePresence mode="wait">
              {/* Open Offers Tab */}
              {activeTab === "offers" && (
                <motion.div key="offers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingJobs ? (
                    <p className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">Synchronizing ledger...</p>
                  ) : openJobs.length === 0 ? (
                    <p className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">Aucune offre disponible pour le moment.</p>
                  ) : (
                    <div className="space-y-6">
                      {openJobs.map((job) => (
                        <div key={job.id} className="border-b border-white/4 pb-6 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-display text-base font-medium text-foreground">{job.title}</h4>
                            <span className="font-mono text-[9px] uppercase tracking-wider pl-2.5 pr-2 py-0.5 rounded border border-accent/25 bg-accent/5 text-accent shrink-0 ml-3">
                              {job.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 mb-4">{job.description}</p>
                          {job.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {job.tags.map((t) => (
                                <span key={t} className="font-mono text-[8px] uppercase tracking-wider px-2 py-0.5 rounded border border-white/8 text-muted-foreground/60">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-mono text-[8px] uppercase text-muted-foreground/50">Budget</span>
                              <div className="font-display text-sm font-semibold mt-0.5">{job.budget}</div>
                            </div>
                            <Link
                              href={`/${profile?.username || 'user'}/dashboard/freelancer/proposals/new?job=${job.id}`}
                              className="rounded-full border border-white/15 hover:bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-wider transition"
                            >
                              Submit Proposal →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* My Services Tab */}
              {activeTab === "services" && (
                <motion.div key="services" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingServices ? (
                    <p className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading services...</p>
                  ) : myServices.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">No services listed yet.</p>
                      <Link
                        href={`/${profile?.username || 'user'}/dashboard/freelancer/services/new`}
                        className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-black hover:bg-white/90 transition"
                      >
                        Create Your First Service →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myServices.map((service) => (
                        <div key={service.id} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/2 p-5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`h-1.5 w-1.5 rounded-full ${service.status === "Actif" ? "bg-accent" : "bg-muted-foreground/30"}`} />
                              <h4 className="font-display text-sm font-medium text-foreground truncate">{service.title}</h4>
                            </div>
                            <div className="flex gap-4 font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60">
                              <span>${service.price}</span>
                              <span>{service.delivery_days}d delivery</span>
                              <span>{service.category}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleToggleService(service.id, service.status)}
                              className="font-mono text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-white/10 hover:bg-white/5 transition cursor-pointer"
                            >
                              {service.status === "Actif" ? "Pause" : "Activate"}
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="font-mono text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-full border border-destructive/20 text-destructive/70 hover:bg-destructive/5 transition cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* My Proposals Tab */}
              {activeTab === "proposals" && (
                <motion.div key="proposals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingProposals ? (
                    <p className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">Loading proposals...</p>
                  ) : myProposals.length === 0 ? (
                    <p className="text-center py-12 font-mono text-xs uppercase tracking-widest text-muted-foreground">No proposals submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {myProposals.map((proposal) => {
                        const statusColors: Record<string, string> = {
                          "En attente": "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
                          "Accepté": "text-accent border-accent/20 bg-accent/5",
                          "Refusé": "text-destructive border-destructive/20 bg-destructive/5",
                          "Retiré": "text-muted-foreground border-white/10 bg-white/3",
                        };
                        return (
                          <div key={proposal.id} className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/2 p-5">
                            <div>
                              <h4 className="font-display text-sm font-medium text-foreground mb-1">
                                {proposal.freelance_jobs?.title || "Unknown Offer"}
                              </h4>
                              <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/60">
                                Bid: ${proposal.bid_amount.toLocaleString()}
                              </div>
                            </div>
                            <span className={`font-mono text-[8px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[proposal.status] || statusColors["En attente"]}`}>
                              {proposal.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right sidebar — Rate modifier */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background grain">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">Rate Tag Persistency</span>
              <h3 className="font-display text-2xl font-medium text-gradient mt-2">Adjust Hourly Escrow</h3>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Updates your sovereign profile entry instantly across the talent indices.
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
                  {updatingRate ? "Updating..." : "Sync Rate Tag →"}
                </button>
              </form>

              <AnimatePresence>
                {rateSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 rounded-xl border border-accent/20 bg-accent/5 text-accent text-center font-mono text-[9px] uppercase tracking-wider"
                  >
                    ✓ Profile synchronized.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="glass rounded-3xl p-6 hairline border border-white/6">
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Quick Links</span>
              <div className="mt-4 space-y-2">
                <Link href={`/${profile?.username || 'user'}/dashboard/messages`} className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-xs text-foreground hover:bg-white/5 transition">
                  <span>Le Conduit Messages</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
                <Link href="/talent" className="flex items-center justify-between rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-xs text-foreground hover:bg-white/5 transition">
                  <span>View Talent Registry</span>
                  <span className="text-muted-foreground">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
