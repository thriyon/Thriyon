"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { projects as mockProjects, Project } from "@/lib/mock";

export default function ClientOffersPage() {
  const { user, profile } = useAuth();
  const [dbJobs, setDbJobs] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClientOffers() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("freelance_jobs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching database offers:", error.message);
          return;
        }

        if (data) {
          const formatted: Project[] = data.map((job: any) => ({
            slug: job.id,
            title: job.title,
            client: "Sovereign Client",
            budget: job.budget,
            duration: "Flexible Assignment",
            category: job.category,
            tags: job.tags || [],
            posted: "Just now",
            proposals: 0,
            summary: job.description,
          }));
          setDbJobs(formatted);
        }
      } catch (err) {
        console.error("Error in offers load logic:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchClientOffers();
  }, [user]);

  useEffect(() => {
    // Merge live DB projects with curated mock projects to represent a active ledger
    setAllProjects([...dbJobs, ...mockProjects]);
  }, [dbJobs]);

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Background radial glowing effects */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-[1400px]">
        {/* Workspace header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
              Client Workspace · Project Ledgers
            </span>
            <h1 className="font-display text-4xl font-medium text-gradient mt-1">Offres & Contrats Escrow</h1>
            <p className="text-xs text-muted-foreground/80 mt-1">
              Gérez vos offres de projet, libérations d'escrow et engagements partenaires.
            </p>
          </div>

          <Link
            href={`/${profile?.username}/dashboard/client/offers/new`}
            className="inline-flex rounded-full bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-white/90 text-center"
          >
            + Créer une Offre
          </Link>
        </div>

        {/* Dynamic Project Board */}
        {loading ? (
          <div className="text-center py-24 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Sychronizing ledgers...
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatePresence>
              {allProjects.map((proj, idx) => (
                <motion.div
                  key={proj.slug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className="glass rounded-2xl p-6 hairline border border-white/6 hover:bg-white/5 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Meta row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[9px] uppercase tracking-wider pl-2.5 pr-2 py-0.5 rounded-full border border-accent/25 bg-accent/5 text-accent">
                        {proj.category}
                      </span>
                      <span className="font-mono text-[9px] text-muted-foreground/70">{proj.posted}</span>
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl font-medium text-foreground mb-2 group-hover:text-accent">
                      {proj.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-muted-foreground/80 leading-relaxed mb-6 line-clamp-3">
                      {proj.summary}
                    </p>

                    {/* Tag pills */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-mono text-[8px] uppercase tracking-wider px-2 py-1 rounded bg-white/3 border border-white/5 text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Financial Meta footer */}
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[8px] uppercase text-muted-foreground/50">Project Escrow Value</div>
                      <div className="font-display text-sm font-semibold mt-0.5">{proj.budget}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[8px] uppercase text-muted-foreground/50">Proposals</div>
                      <div className="font-display text-sm font-semibold mt-0.5">{proj.proposals} active</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
