"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const DISCIPLINES = [
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

const CATEGORIES = [
  { value: "Brand", label: "Brand Identity", icon: "◆" },
  { value: "Product", label: "Product Design", icon: "⬡" },
  { value: "Motion", label: "3D & Motion", icon: "◎" },
  { value: "Engineering", label: "Engineering", icon: "⟡" },
  { value: "Editorial", label: "Editorial & Type", icon: "◈" },
  { value: "Sound", label: "Sound & Music", icon: "◉" },
];

export default function BecomeFreelancerPage() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 — Studio profile
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [rate, setRate] = useState<number>(80);
  const [rateModified, setRateModified] = useState(false);

  // Step 2 — First service
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceCategory, setServiceCategory] = useState("Brand");
  const [servicePrice, setServicePrice] = useState<number>(500);
  const [serviceDelivery, setServiceDelivery] = useState<number>(7);
  const [serviceDesc, setServiceDesc] = useState("");
  const [serviceTags, setServiceTags] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  React.useEffect(() => {
    if (!rateModified && servicePrice > 0 && serviceDelivery > 0) {
      let calc = Math.round(servicePrice / (serviceDelivery * 8));
      if (calc < 20) calc = 20;
      if (calc > 500) calc = 500;
      setRate(calc);
    }
  }, [servicePrice, serviceDelivery, rateModified]);

  const handleStep1 = () => {
    if (!bio && selectedSkills.length === 0) {
      setError("Ajoutez au moins une discipline ou une courte biographie.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinish = async (skipService = false) => {
    if (!user) return;
    if (!skipService && (!serviceTitle || !serviceDesc)) {
      setError("Remplissez le titre et la description du service.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      // 1 — Update profile to freelancer
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: user.id,
        role: "freelancer",
        bio: bio || null,
        skills: selectedSkills.length > 0 ? selectedSkills : null,
        rate: rate,
        updated_at: new Date().toISOString(),
      });
      if (profileErr) throw profileErr;

      // 2 — Create first service (optional)
      if (!skipService) {
        const tags = serviceTags
          ? serviceTags.split(",").map((t) => t.trim()).filter(Boolean)
          : [];
        const { error: svcErr } = await supabase.from("freelancer_services").insert({
          freelancer_id: user.id,
          title: serviceTitle,
          category: serviceCategory,
          price: Number(servicePrice),
          delivery_days: Number(serviceDelivery),
          description: serviceDesc,
          tags,
          status: "Actif",
        });
        if (svcErr) throw svcErr;
      }

      await refreshProfile();
      const uname = profile?.username;
      router.push(`/${uname}/dashboard/freelancer`);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 py-24 overflow-hidden">
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/12 blur-[140px] opacity-80" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-15" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[640px]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em] text-accent mb-3">
            Freelance Setup · {step}/2
          </div>
          <h1 className="font-display text-[clamp(2rem,6vw,3rem)] leading-tight tracking-[-0.04em] text-gradient">
            {step === 1 ? "Votre Studio Créatif" : "Premier Service"}
          </h1>
          <p className="mt-3 text-[13px] text-muted-foreground/75 leading-relaxed">
            {step === 1
              ? "Définissez votre identité créative et vos disciplines principales."
              : "Créez votre premier service packagé pour être visible sur le Nexus."}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 h-px w-full bg-white/6 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            animate={{ width: `${(step / 2) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow">
          <AnimatePresence mode="wait">

            {/* Step 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                {/* Bio */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Manifeste / Bio Studio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Décrivez votre philosophie créative, votre style signature..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8 resize-none"
                  />
                </div>

                {/* Disciplines */}
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Disciplines Principales
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {DISCIPLINES.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-full border px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          selectedSkills.includes(skill)
                            ? "border-accent bg-accent/10 text-accent shadow-[0_0_12px_-4px_oklch(0.7_0.18_295/0.4)]"
                            : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
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

                <button
                  type="button"
                  onClick={handleStep1}
                  className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  Continuer →
                </button>
              </motion.div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
                className="space-y-5"
              >
                {/* Service Title */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Titre du Service
                  </label>
                  <input
                    type="text"
                    value={serviceTitle}
                    onChange={(e) => setServiceTitle(e.target.value)}
                    placeholder="ex: Identité de marque complète en 10 jours"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8"
                  />
                </div>

                {/* Category + Price + Delivery in grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Catégorie</label>
                    <select
                      value={serviceCategory}
                      onChange={(e) => setServiceCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground transition-all focus:outline-none focus:border-accent/40 appearance-none"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Prix (USD)</label>
                    <input
                      type="number"
                      min={10}
                      value={servicePrice}
                      onChange={(e) => {
                        setServicePrice(Number(e.target.value));
                        setRateModified(false); // recalculate if they change service values
                      }}
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground transition-all focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Délai (jours)</label>
                    <input
                      type="number"
                      min={1}
                      value={serviceDelivery}
                      onChange={(e) => {
                        setServiceDelivery(Number(e.target.value));
                        setRateModified(false); // recalculate if they change service values
                      }}
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground transition-all focus:outline-none focus:border-accent/40"
                    />
                  </div>
                </div>

                {/* Rate (Calculated) */}
                <div className="space-y-1.5 rounded-2xl bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90">
                      Taux Horaire Déduit
                    </label>
                    <span className="font-display text-xl text-accent">${rate}/h</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mb-4">
                    Calculé sur la base de {serviceDelivery * 8 || 0} heures de travail ({serviceDelivery || 0} jours × 8h). Vous pouvez l'ajuster.
                  </p>
                  <input
                    type="range"
                    min={20}
                    max={500}
                    step={5}
                    value={rate}
                    onChange={(e) => {
                      setRate(Number(e.target.value));
                      setRateModified(true);
                    }}
                    className="w-full accent-[oklch(0.7_0.18_295)]"
                  />
                  <div className="flex justify-between font-mono text-[9px] text-muted-foreground/50 mt-1">
                    <span>$20</span><span>$500</span>
                  </div>
                </div>


                {/* Description */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Description</label>
                  <textarea
                    value={serviceDesc}
                    onChange={(e) => setServiceDesc(e.target.value)}
                    placeholder="Décrivez les livrables, révisions incluses et votre méthode de travail..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 resize-none"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Tags (séparés par virgule)</label>
                  <input
                    type="text"
                    value={serviceTags}
                    onChange={(e) => setServiceTags(e.target.value)}
                    placeholder="Figma, React, After Effects, Motion..."
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40"
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

                <div className="grid grid-cols-[auto_1fr] gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-foreground/90 transition hover:bg-white/5"
                  >
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFinish(false)}
                    disabled={saving}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Activation en cours..." : "Activer mon Studio →"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleFinish(true)}
                  disabled={saving}
                  className="w-full text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50 hover:text-muted-foreground transition mt-1"
                >
                  Passer cette étape →
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
