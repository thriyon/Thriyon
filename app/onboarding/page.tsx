"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

type Role = "freelancer" | "client";

const INDUSTRIES = [
  "Tech & Software",
  "Design & Creative",
  "Marketing & Media",
  "Finance & FinTech",
  "E-commerce & Retail",
  "Music & Sound",
  "Film & Video",
  "Fashion & Lifestyle",
  "Architecture & Interior",
  "Health & Wellness",
  "Legal & Compliance",
  "Education & EdTech",
  "Other",
];

const COMPANY_SIZES = [
  { label: "Solo founder", value: "1" },
  { label: "Small team (2–10)", value: "2-10" },
  { label: "Growing studio (11–50)", value: "11-50" },
  { label: "Mid-size company (51–200)", value: "51-200" },
  { label: "Large enterprise (200+)", value: "200+" },
];

const BUDGET_RANGES = [
  { label: "Under $1K per project", value: "<1k" },
  { label: "$1K – $5K per project", value: "1k-5k" },
  { label: "$5K – $20K per project", value: "5k-20k" },
  { label: "$20K – $50K per project", value: "20k-50k" },
  { label: "$50K+ per project", value: "50k+" },
];

const FREELANCER_DISCIPLINES = [
  "Brand & Identity",
  "3D & Motion",
  "Product Design",
  "Full-stack Engineering",
  "Frontend Engineering",
  "Type & Typography",
  "Photography",
  "Sound Design",
  "Art Direction",
  "Copywriting",
  "Video & Film",
  "Illustration",
  "UI/UX Design",
  "Data & Analytics",
  "DevOps & Cloud",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading } = useAuth();

  // Step state
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>("freelancer");

  // Freelancer fields
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  // Client / Company fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [companyBio, setCompanyBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guard: if already onboarded, redirect to correct dashboard
  useEffect(() => {
    if (!loading && user && profile && profile.onboarding_completed) {
      if (profile.role === "client") {
        router.push("/user/dashboard/client");
      } else {
        router.push("/user/dashboard/freelancer");
      }
    }
    // If not logged in at all, send to login
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, profile, router]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
    }
    setCustomSkill("");
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const updateData: Record<string, any> = {
        id: user.id,
        role,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      };

      if (role === "freelancer") {
        updateData.bio = bio || null;
        updateData.skills = selectedSkills.length > 0 ? selectedSkills : null;
      } else {
        updateData.company_name = companyName || null;
        updateData.industry = industry || null;
        updateData.company_size = companySize || null;
        updateData.website = website || null;
        updateData.budget_range = budgetRange || null;
        updateData.bio = companyBio || null;
      }

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(updateData);

      if (upsertError) {
        setError(upsertError.message);
        setSaving(false);
        return;
      }

      await refreshProfile();

      if (role === "freelancer") {
        // Guide them to create their first service
        router.push("/user/dashboard/freelancer/services/new?onboarding=true");
      } else {
        // Guide them to post their first brief
        router.push("/user/dashboard/client/briefs/new?onboarding=true");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  const totalSteps = 2;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Violet glow backdrop */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/12 blur-[140px] opacity-80" />
      <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[500px] rounded-full bg-violet-900/20 blur-[100px]" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[560px]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent mb-3"
          >
            Onboarding · {step}/{totalSteps}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-[clamp(2rem,6vw,3.2rem)] leading-[1.0] tracking-[-0.04em] text-gradient"
          >
            {step === 1 ? "Who are you?" : role === "freelancer" ? "Your Studio" : "Your Company"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-[13px] text-muted-foreground/75 leading-relaxed"
          >
            {step === 1
              ? "Define your position in the Nexus. This shapes your entire experience."
              : role === "freelancer"
              ? "Tell the world what you create. You can always refine this later."
              : "Help clients understand your organisation at a glance."}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-px w-full bg-white/6 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: "50%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow">
          <AnimatePresence mode="wait">

            {/* ─── STEP 1: Role Selection ─── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Freelancer card */}
                  <button
                    type="button"
                    onClick={() => setRole("freelancer")}
                    className={`group flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-300 cursor-pointer ${
                      role === "freelancer"
                        ? "border-accent bg-accent/5 shadow-[0_0_30px_-8px_oklch(0.7_0.18_295/0.3)]"
                        : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-colors ${role === "freelancer" ? "bg-accent/20" : "bg-white/5"}`}>
                      ◆
                    </div>
                    <div>
                      <div className="font-display text-lg font-medium tracking-tight">Freelancer</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Sovereign Studio
                      </div>
                      <p className="mt-2.5 text-[12px] text-muted-foreground/70 leading-relaxed">
                        You offer services, take on briefs, and deliver exceptional creative work independently.
                      </p>
                    </div>
                    {role === "freelancer" && (
                      <motion.div
                        layoutId="role-check"
                        className="ml-auto h-5 w-5 rounded-full bg-accent flex items-center justify-center text-black text-[10px] font-bold shrink-0 self-end"
                      >
                        ✓
                      </motion.div>
                    )}
                  </button>

                  {/* Client card */}
                  <button
                    type="button"
                    onClick={() => setRole("client")}
                    className={`group flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-300 cursor-pointer ${
                      role === "client"
                        ? "border-accent bg-accent/5 shadow-[0_0_30px_-8px_oklch(0.7_0.18_295/0.3)]"
                        : "border-white/8 bg-white/2 hover:border-white/15 hover:bg-white/4"
                    }`}
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xl transition-colors ${role === "client" ? "bg-accent/20" : "bg-white/5"}`}>
                      ⬡
                    </div>
                    <div>
                      <div className="font-display text-lg font-medium tracking-tight">Client / Studio</div>
                      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        Initiate Briefs
                      </div>
                      <p className="mt-2.5 text-[12px] text-muted-foreground/70 leading-relaxed">
                        You commission work, post briefs, and collaborate with world-class creative talent.
                      </p>
                    </div>
                    {role === "client" && (
                      <motion.div
                        layoutId="role-check"
                        className="ml-auto h-5 w-5 rounded-full bg-accent flex items-center justify-center text-black text-[10px] font-bold shrink-0 self-end"
                      >
                        ✓
                      </motion.div>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99]"
                >
                  Continue →
                </button>
              </motion.div>
            )}

            {/* ─── STEP 2A: Freelancer Profile ─── */}
            {step === 2 && role === "freelancer" && (
              <motion.div
                key="step-2-freelancer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Your Manifesto / Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your creative philosophy, your signature style, and the kind of work you're known for…"
                    rows={3}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40 resize-none"
                  />
                </div>

                {/* Disciplines / Skills */}
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Primary Disciplines <span className="text-muted-foreground/50">(Select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FREELANCER_DISCIPLINES.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          selectedSkills.includes(skill)
                            ? "border-accent bg-accent/10 text-accent shadow-[0_0_12px_-4px_oklch(0.7_0.18_295/0.4)]"
                            : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {/* Custom skill input */}
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                      placeholder="Add another discipline…"
                      className="flex-1 bg-white/5 border border-white/12 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 focus:bg-white/8"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-foreground/90 hover:bg-white/5 transition-all"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Selected skills display */}
                {selectedSkills.length > 0 && (
                  <div className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-accent mb-2">Selected ({selectedSkills.length})</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkills.map((s) => (
                        <span
                          key={s}
                          onClick={() => toggleSkill(s)}
                          className="flex items-center gap-1.5 rounded-full bg-accent/10 border border-accent/20 px-3 py-1 font-mono text-[10px] text-accent cursor-pointer hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-all"
                        >
                          {s} <span className="text-[8px]">✕</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-[11px] text-destructive border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center"
                    >
                      ⚡ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-foreground/90 transition hover:bg-white/5"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={saving}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Launch Studio → Create First Service"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2B: Client / Company Profile ─── */}
            {step === 2 && role === "client" && (
              <motion.div
                key="step-2-client"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Company / Studio Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Monolith Capital, Iris Studio"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                  />
                </div>

                {/* Industry */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Industry / Sector
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => setIndustry(ind)}
                        className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          industry === ind
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Company Size */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Company Size
                  </label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {COMPANY_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setCompanySize(size.value)}
                        className={`rounded-xl border px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                          companySize === size.value
                            ? "border-accent bg-accent/8 text-foreground shadow-[0_0_15px_-6px_oklch(0.7_0.18_295/0.3)]"
                            : "border-white/8 text-muted-foreground hover:border-white/15 hover:text-foreground"
                        }`}
                      >
                        <span className="font-mono text-[10px] uppercase tracking-wider">{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typical Budget */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Typical Project Budget
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BUDGET_RANGES.map((b) => (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => setBudgetRange(b.value)}
                        className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                          budgetRange === b.value
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Website */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Website <span className="text-muted-foreground/40">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://your-company.com"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
                  />
                </div>

                {/* Company Brief */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Brief Description <span className="text-muted-foreground/40">(optional)</span>
                  </label>
                  <textarea
                    value={companyBio}
                    onChange={(e) => setCompanyBio(e.target.value)}
                    placeholder="What does your company do? What kind of creative work do you commission?"
                    rows={2}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40 resize-none"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-[11px] text-destructive border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center"
                    >
                      ⚡ {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-foreground/90 transition hover:bg-white/5"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleComplete}
                    disabled={saving || !companyName}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Enter the Nexus →"}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          You can update all of this later from your profile settings.
        </p>
      </motion.div>
    </div>
  );
}
