"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

function NewBriefForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetTalent = searchParams?.get("talent") || "";
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Brand");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (targetTalent) {
      setDescription(`Initiating a sovereign contract brief specifically for practitioner: @${targetTalent}.\n\n[Outline your project scope, constraints, and delivery timelines here...]`);
    }
  }, [targetTalent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be signed in as a client to post a brief.");
      return;
    }
    if (!title || !budget || !description) {
      setError("Please fill in all necessary brief details.");
      return;
    }

    setLoading(true);
    setError("");

    const tagsArray = tagInput
      ? tagInput.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    try {
      const { error: insertError } = await supabase
        .from("freelance_jobs")
        .insert({
          title,
          category,
          budget,
          description,
          tags: tagsArray,
          user_id: user.id,
          status: "Ouvert"
        });

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/user/dashboard/client/briefs");
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating job brief:", err);
      setError("An unexpected error occurred during database transmission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background px-6 pt-32 pb-24 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[450px] w-[900px] -translate-x-1/2 rounded-full bg-accent/12 blur-[120px] opacity-75" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <div className="mx-auto max-w-2xl relative">
        {/* Navigation back */}
        <div className="mb-10">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          >
            ← Back to workspace
          </button>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-3xl p-12 hairline text-center py-20"
          >
            <div className="mx-auto h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xl mb-6">
              ✓
            </div>
            <h2 className="font-display text-2xl font-medium text-gradient mb-2">Brief Transmitted</h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Sovereign project has been added to the Thriyon Nexus ledger. Redirecting...
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="glass rounded-3xl p-8 hairline border border-white/8 bg-gradient-to-b from-graphite/40 to-background grain"
          >
            <div className="mb-8">
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                Phase 3 Escrow Setup
              </span>
              <h1 className="font-display text-3xl font-medium text-gradient mt-1">Initiate Project Brief</h1>
              <p className="text-xs text-muted-foreground/80 mt-2 leading-relaxed">
                Describe your requirements, timelines, and budget constraints. Your brief will be logged dynamically.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive font-mono text-[10px] uppercase tracking-wider">
                ⚡ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Project Title / Statement
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rebrand for a sovereign AI lab"
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                />
              </div>

              {/* Grid: Category and Budget */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Category */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                    Core Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#080808] border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                  >
                    <option value="Brand">Brand Identity</option>
                    <option value="Product">Product Design</option>
                    <option value="Campaign">3D & Motion</option>
                    <option value="Engineering">Software Engineering</option>
                    <option value="Editorial">Typography & Editorial</option>
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                    Allocated Budget
                  </label>
                  <input
                    type="text"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. $40k – $80k"
                    className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Technical Scope & Specifications
                </label>
                <textarea
                  required
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline deliverables, technical stack requirements, and general creative goals..."
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300 resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">
                  Keywords / Skills Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. Identity, Systems, Web, Motion"
                  className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/5 transition-all duration-300"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-white py-3.5 text-xs font-semibold text-black transition hover:bg-white/90 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Transmitting to Ledger..." : "Commit Project Brief & Initiate Escrow →"}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function NewBriefPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-muted-foreground font-mono text-xs uppercase tracking-widest">
        Initializing Brief Space...
      </div>
    }>
      <NewBriefForm />
    </Suspense>
  );
}
