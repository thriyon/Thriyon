"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { talents as mockTalents, Talent } from "@/lib/mock";

export default function TalentIndexPage() {
  const [dbFreelancers, setDbFreelancers] = useState<Talent[]>([]);
  const [allTalents, setAllTalents] = useState<Talent[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // Categories extracted from disciplines
  const categories = ["All", "Brand", "3D & Motion", "Product Design", "Engineering", "Typography", "Sound Design"];

  useEffect(() => {
    async function fetchLiveFreelancers() {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "freelancer");

        if (error) {
          console.error("Error fetching live freelancers:", error.message);
          return;
        }

        if (data) {
          const formatted: Talent[] = data.map((profile: any) => ({
            username: profile.id, // Use profile ID as the slug
            name: profile.full_name || "Sovereign Practitioner",
            role: profile.skills?.[0] ? `${profile.skills[0]} Architect` : "Creative Builder",
            location: "Remote / Decentralized",
            rate: profile.rate || 150,
            rating: 5.0,
            available: true,
            skills: profile.skills || [],
            bio: profile.bio || "No manifesto published yet.",
            projects: Math.floor(Math.random() * 20) + 1,
          }));
          setDbFreelancers(formatted);
        }
      } catch (err) {
        console.error("Error in live profiles fetch:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveFreelancers();
  }, []);

  useEffect(() => {
    // Combine db live freelancers (at the top) and mock data
    setAllTalents([...dbFreelancers, ...mockTalents]);
  }, [dbFreelancers]);

  // Filtering logic
  const filtered = allTalents.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase())) ||
      t.bio.toLowerCase().includes(search.toLowerCase());

    if (activeCategory === "All") return matchesSearch;
    
    // Skill matches active category
    const categoryKey = activeCategory.toLowerCase();
    const matchesCategory =
      t.skills.some((s) => s.toLowerCase().includes(categoryKey)) ||
      t.role.toLowerCase().includes(categoryKey) ||
      (activeCategory === "3D & Motion" && (
        t.skills.some((s) => ["cinema4d", "houdini", "octane", "motion"].includes(s.toLowerCase())) ||
        t.role.toLowerCase().includes("3d") || t.role.toLowerCase().includes("motion")
      ));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Cinematic purple radial background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-80" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground"
          >
            Sovereign Index · Active Registry
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.04em] text-gradient"
          >
            The Talent Index
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-xl text-sm md:text-base text-muted-foreground/80 leading-relaxed"
          >
            An invite-only ecosystem of sovereign developers, 3D artists, type designers, and brand architects.
          </motion.p>
        </div>

        {/* Filters and Search controls */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Categories */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-full px-5 py-2.5 text-xs transition duration-300 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-white text-black font-medium"
                    : "border border-white/10 bg-white/3 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search input */}
          <div className="relative w-full max-w-sm">
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search skills, usernames, roles..."
              className="w-full bg-white/5 border border-white/12 rounded-full pl-11 pr-5 py-3 text-xs text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
            />
          </div>
        </motion.div>

        {/* Talent Grid */}
        <motion.div
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((talent, index) => {
              // Custom hue index coloring
              const hues = [
                "from-violet-500/25 to-blue-500/5",
                "from-emerald-500/20 to-teal-500/5",
                "from-rose-500/20 to-indigo-500/5",
                "from-amber-500/20 to-rose-500/5",
                "from-sky-500/20 to-violet-500/5"
              ];
              const cardHue = hues[index % hues.length];

              return (
                <motion.div
                  key={talent.username}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={`/talent/${talent.username}`}
                    className="group glass block rounded-2xl p-6 hairline transition-all duration-300 hover:bg-white/8 hover:shadow-[0_0_25px_-5px_oklch(0.7_0.18_295/0.25)] relative overflow-hidden h-full flex flex-col justify-between"
                  >
                    {/* Corner hover glow */}
                    <div className={`pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${cardHue} blur-3xl opacity-40 transition-all duration-500 group-hover:scale-125 group-hover:opacity-85`} />

                    <div>
                      {/* Live user indicator or availability */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/80">
                          {talent.location}
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider pl-2.5 pr-2 py-0.5 rounded-full border border-white/6 bg-white/3">
                          <span className={`h-1 w-1 rounded-full ${talent.available ? "bg-accent" : "bg-muted-foreground/50"}`} />
                          {talent.available ? "Online" : "Booked"}
                        </div>
                      </div>

                      {/* Profile details */}
                      <h3 className="font-display text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-accent">
                        {talent.name}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/70 mt-1">
                        {talent.role}
                      </p>

                      <p className="mt-4 text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">
                        {talent.bio}
                      </p>
                    </div>

                    {/* Footer/Meta metrics */}
                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/50">Hourly Rate</div>
                        <div className="font-display text-sm font-medium text-foreground mt-0.5">${talent.rate}/hr</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[8px] uppercase tracking-wider text-muted-foreground/50">Experience</div>
                        <div className="font-display text-sm font-medium text-foreground mt-0.5">{talent.projects} cases</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-24 glass rounded-3xl border border-white/6 mt-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">No creative practitioners match filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
