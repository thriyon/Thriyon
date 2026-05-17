"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { talents as mockTalents, showcases as mockShowcases, Talent } from "@/lib/mock";

export default function TalentShowcasePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;

  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadTalentProfile() {
      if (!username) return;

      // 1. Check if it's a mock talent
      const mockMatch = mockTalents.find((t) => t.username.toLowerCase() === username.toLowerCase());
      if (mockMatch) {
        setTalent(mockMatch);
        setLoading(false);
        return;
      }

      // 2. Otherwise query Supabase profiles
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", username)
          .single();

        if (fetchError || !data) {
          setError(true);
        } else {
          setTalent({
            username: data.id,
            name: data.full_name || "Sovereign Practitioner",
            role: data.skills?.[0] ? `${data.skills[0]} Specialist` : "Sovereign Practitioner",
            location: "Remote / Decentralized",
            rate: data.rate || 140,
            rating: 5.0,
            available: true,
            skills: data.skills || [],
            bio: data.bio || "No custom bio established yet.",
            projects: 6,
          });
        }
      } catch (err) {
        console.error("Error fetching database profile:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadTalentProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white mr-3" />
        Resolving Identity...
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-6 text-center">
        <div className="font-mono text-xs uppercase tracking-widest text-destructive mb-4">⚡ Interface Error</div>
        <h2 className="font-display text-2xl font-medium mb-6">Identity could not be verified in the index.</h2>
        <Link href="/talent" className="rounded-full border border-white/15 px-6 py-2.5 text-xs hover:bg-white/5">
          Return to index
        </Link>
      </div>
    );
  }

  // Filter showcases for this specific user or display fallback curated galleries
  const personalShowcases = mockShowcases.filter(
    (s) => s.studio.toLowerCase().includes(talent.name.split(" ")[0].toLowerCase())
  );

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px]">
        {/* Navigation back */}
        <div className="mb-12">
          <Link href="/talent" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all">
            ← Return to registry
          </Link>
        </div>

        {/* Typographic Hero Grid */}
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] items-start mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4"
            >
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" /></span>
              {talent.available ? "Ready for brief assignment" : "Currently occupied"} · {talent.location}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-[0.9] tracking-[-0.04em] text-gradient font-bold"
            >
              {talent.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs uppercase tracking-[0.2em] text-accent/80 mt-3"
            >
              {talent.role}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-[1.2] tracking-tight text-foreground/90 max-w-3xl"
            >
              "{talent.bio}"
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.25 }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {talent.skills.map((skill) => (
                <span
                  key={skill}
                  className="font-mono text-[9px] uppercase tracking-wider px-3.5 py-1.5 rounded-full border border-white/6 bg-white/3 text-muted-foreground hover:text-foreground hover:border-white/15 transition-all"
                >
                  {skill}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Escrow Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background grain"
          >
            <h3 className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/80 mb-6">
              Studio Escrow Contract
            </h3>

            <div className="space-y-6">
              <div className="flex justify-between items-baseline border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Min Escrow Rate</span>
                <span className="font-display text-2xl font-medium">${talent.rate}/hr</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Reputation Index</span>
                <span className="font-display text-2xl font-medium">{talent.rating} / 5.0</span>
              </div>
              <div className="flex justify-between items-baseline border-b border-white/5 pb-4">
                <span className="font-mono text-[10px] uppercase text-muted-foreground">Active cases</span>
                <span className="font-display text-2xl font-medium">{talent.projects} cases</span>
              </div>
            </div>

            <button
              onClick={() => router.push(`/user/dashboard/client/briefs/new?talent=${talent.username}`)}
              className="w-full mt-8 rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              Initiate Project Brief →
            </button>

            <p className="mt-4 text-[10px] text-muted-foreground/60 text-center leading-relaxed font-mono uppercase tracking-wider">
              Payments structured via secure escrow hold.
            </p>
          </motion.div>
        </div>

        {/* Projects / Showcases Section */}
        <div>
          <div className="mb-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            <span>Portfolio Cases ({personalShowcases.length || 3})</span>
            <span className="h-px flex-1 bg-white/8" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {personalShowcases.length > 0
              ? personalShowcases.map((showcase) => (
                  <div
                    key={showcase.slug}
                    className={`glass rounded-2xl p-6 hairline transition-all duration-300 hover:bg-white/5 hover:scale-[1.01] relative overflow-hidden`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="font-mono text-[9px] uppercase text-accent/80 border border-accent/25 bg-accent/5 px-2.5 py-0.5 rounded-full">
                        {showcase.discipline}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground/60">{showcase.year}</span>
                    </div>

                    <h4 className="font-display text-lg font-medium text-foreground mb-1">
                      {showcase.title}
                    </h4>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                      Studio Case Study
                    </p>

                    <div className="mt-12 h-36 rounded-xl border border-white/5 bg-gradient-to-br from-white/3 to-white/1 relative overflow-hidden flex items-center justify-center">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">Visualizer hold</span>
                    </div>
                  </div>
                ))
              : // Generic fallback cases in case it is a custom database user
                [
                  { id: 1, title: "Identity — Sovereign System", disc: "Brand" },
                  { id: 2, title: "Canvas — Visual Workspace", disc: "Web / Core" },
                  { id: 3, title: "Pulse — Motion & Sound", disc: "3D / Motion" }
                ].map((fallback) => (
                  <div
                    key={fallback.id}
                    className="glass rounded-2xl p-6 hairline transition-all duration-300 hover:bg-white/5 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="font-mono text-[9px] uppercase text-accent/80 border border-accent/25 bg-accent/5 px-2.5 py-0.5 rounded-full">
                        {fallback.disc}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground/60">2026</span>
                    </div>

                    <h4 className="font-display text-lg font-medium text-foreground mb-1">
                      {fallback.title}
                    </h4>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/60">
                      Studio Case Study
                    </p>

                    <div className="mt-12 h-36 rounded-xl border border-white/5 bg-gradient-to-br from-white/3 to-white/1 relative overflow-hidden flex items-center justify-center">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">Visualizer hold</span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
