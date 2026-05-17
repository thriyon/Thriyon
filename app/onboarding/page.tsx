"use client";

import React, { useState, useEffect, useRef } from "react";
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

const CATEGORIES = [
  { value: "Brand", label: "Brand Identity", icon: "◆", desc: "Logo, visual system, strategy" },
  { value: "Product", label: "Product Design", icon: "⬡", desc: "UI/UX, prototyping, design system" },
  { value: "Campaign", label: "3D & Motion", icon: "◎", desc: "Animation, VFX, 3D" },
  { value: "Engineering", label: "Engineering", icon: "⟡", desc: "Web app, mobile, backend" },
  { value: "Editorial", label: "Editorial & Type", icon: "◈", desc: "Publication, typography" },
  { value: "Sound", label: "Sound & Music", icon: "◉", desc: "Composition, sound design" },
];

const BUDGET_SUGGESTIONS = ["< $1K", "$1K – $5K", "$5K – $20K", "$20K – $50K", "$50K+", "Open to discuss"];

const ONBOARDING_TIPS: Record<string, { title: string; body: string }> = {
  title: {
    title: "Un titre qui accroche",
    body: "Soyez précis. Ex: « Landing Page WebGL immersive » plutôt que « Design de site ».",
  },
  category: {
    title: "La bonne discipline",
    body: "Cela détermine qui verra votre brief ou service en priorité.",
  },
  price: {
    title: "Fixez un prix juste",
    body: "Un prix trop bas peut signaler un manque de confiance. Valorisez votre expertise.",
  },
  budget: {
    title: "Le budget crée la confiance",
    body: "Une fourchette claire attire des propositions sérieuses et évite de perdre du temps.",
  },
  delivery: {
    title: "Délai réaliste = satisfaction",
    body: "Incluez un temps de révision. Il vaut mieux livrer en avance qu'en retard.",
  },
  description: {
    title: "Soyez exhaustif et clair",
    body: "Livrables, révisions incluses, hors périmètre. La clarté attire les meilleurs collaborateurs.",
  },
  tags: {
    title: "Vos mots-clés",
    body: "Utilisez les noms des outils et techniques. Ex: Figma, React, After Effects.",
  },
  username: {
    title: "Votre identité unique",
    body: "Ce nom d'utilisateur servira pour l'URL de votre profil (ex: thriyon.com/@nom).",
  }
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading } = useAuth();

  // Step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [role, setRole] = useState<Role>("freelancer");

  // Step 1: Personalization
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Freelancer fields (previously Step 2)
  const [bio, setBio] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkill, setCustomSkill] = useState("");

  // Step 3: Client / Company fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [companyBio, setCompanyBio] = useState("");

  // Step 4: Creation fields (Service OR Brief) (previously Step 3)
  const [itemTitle, setItemTitle] = useState("");
  const [itemCategory, setItemCategory] = useState("Brand");
  const [itemPrice, setItemPrice] = useState<number>(500); // For Freelancer
  const [itemBudget, setItemBudget] = useState(""); // For Client
  const [itemDeliveryDays, setItemDeliveryDays] = useState<number>(7); // For Freelancer
  const [itemDescription, setItemDescription] = useState("");
  const [itemTags, setItemTags] = useState("");
  const [activeTip, setActiveTip] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile data if available
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      if (profile.username && !username) setUsername(profile.username);
      if (profile.avatar_url && !avatarPreview) setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Process Step 1
  const handleStep1Complete = async () => {
    if (!user) return;
    if (!fullName || !username) {
      setError("Veuillez remplir votre nom et nom d'utilisateur.");
      return;
    }
    
    // basic username format check (alphanumeric and underscores)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setError("Le nom d'utilisateur ne peut contenir que des lettres, chiffres et underscores.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
        let avatarUrl = profile?.avatar_url || null;

        if (avatarFile) {
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, avatarFile);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = data.publicUrl;
        }

        const { error: updateError } = await supabase.from('profiles').upsert({
            id: user.id,
            full_name: fullName,
            username: username.toLowerCase(),
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        });

        if (updateError) {
          if (updateError.code === '23505') { // Unique violation
            throw new Error("Ce nom d'utilisateur est déjà pris.");
          }
          throw updateError;
        }
        
        await refreshProfile();
        setStep(2);
    } catch(err: any) {
        setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
        setSaving(false);
    }
  };

  // Process Step 3
  const handleStep3Complete = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const updateData: Record<string, any> = {
        id: user.id,
        role,
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
      setStep(4); // Move to final step
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  // Submit Step 4 and Finish Onboarding
  const handleFinalComplete = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    if (!itemTitle || !itemDescription) {
      setError("Veuillez remplir le titre et la description au minimum.");
      return;
    }

    setSaving(true);
    setError(null);

    const tagsArray = itemTags
      ? itemTags.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
      : [];

    try {
      if (role === "freelancer") {
        const { error: insertError } = await supabase.from("freelancer_services").insert({
          freelancer_id: user.id,
          title: itemTitle,
          category: itemCategory,
          price: Number(itemPrice),
          delivery_days: Number(itemDeliveryDays),
          description: itemDescription,
          tags: tagsArray,
          status: "Actif",
        });
        if (insertError) throw insertError;
      } else {
        const { error: insertError } = await supabase.from("freelance_jobs").insert({
          user_id: user.id,
          title: itemTitle,
          category: itemCategory,
          budget: itemBudget,
          description: itemDescription,
          tags: tagsArray,
          status: "Ouvert",
        });
        if (insertError) throw insertError;
      }

      // Now set onboarding completed
      await supabase.from("profiles").upsert({
        id: user.id,
        onboarding_completed: true,
      });

      await refreshProfile();
      
      // Redirect
      if (role === "client") {
        router.push("/user/dashboard/client");
      } else {
        router.push("/user/dashboard/freelancer");
      }

    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
      setSaving(false);
    }
  };

  // Skip Step 4 and finish onboarding
  const handleSkipStep4 = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        onboarding_completed: true,
      });
      await refreshProfile();
      if (role === "client") {
        router.push("/user/dashboard/client");
      } else {
        router.push("/user/dashboard/freelancer");
      }
    } catch (err) {
      console.error(err);
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

  const totalSteps = 4;
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
        className="relative z-10 w-full max-w-[640px]"
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
            {step === 1 && "Identity & Persona"}
            {step === 2 && "Who are you?"}
            {step === 3 && (role === "freelancer" ? "Your Studio" : "Your Company")}
            {step === 4 && (role === "freelancer" ? "Premier Service" : "Premier Brief")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-[13px] text-muted-foreground/75 leading-relaxed"
          >
            {step === 1 && "Personnalisez votre compte sur le Nexus avant de commencer."}
            {step === 2 && "Define your position in the Nexus. This shapes your entire experience."}
            {step === 3 && role === "freelancer" && "Tell the world what you create. You can always refine this later."}
            {step === 3 && role === "client" && "Help clients understand your organisation at a glance."}
            {step === 4 && role === "freelancer" && "Publiez votre premier service pour être visible sur le Nexus."}
            {step === 4 && role === "client" && "Lancez votre premier projet et attirez les meilleurs talents."}
          </motion.p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-px w-full bg-white/6 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: `${((step - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow">
          <AnimatePresence mode="wait">

            {/* ─── STEP 1: Personalization ─── */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                {/* Avatar Upload */}
                <div className="flex flex-col items-center justify-center space-y-4 mb-8">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="relative h-24 w-24 rounded-full border border-white/20 bg-white/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent/50 transition-colors group"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-3xl text-muted-foreground/50 group-hover:text-accent/80 transition-colors">+</div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-white">Upload</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                  />
                  <div className="text-center">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Photo de Profil</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Satoshi Nakamoto"
                      className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8"
                    />
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                        Nom d'utilisateur
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "username" ? null : "username")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                      >
                        Conseil ✦
                      </button>
                    </div>
                    
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 font-mono text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onFocus={() => setActiveTip("username")}
                        placeholder="satoshi_n"
                        className="w-full bg-white/5 border border-white/12 rounded-2xl pl-8 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8 font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <AnimatePresence>
                  {activeTip === "username" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                    >
                      <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.username.title}</div>
                      <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.username.body}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                  onClick={handleStep1Complete}
                  disabled={saving || !fullName || !username}
                  className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-4"
                >
                  {saving ? "Sauvegarde..." : "Continue →"}
                </button>
              </motion.div>
            )}

            {/* ─── STEP 2: Role Selection ─── */}
            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  </button>

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
                  </button>
                </div>

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
                    onClick={() => setStep(3)}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3A: Freelancer Profile ─── */}
            {step === 3 && role === "freelancer" && (
              <motion.div
                key="step-3-freelancer"
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
                    placeholder="Describe your creative philosophy, your signature style..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8 resize-none"
                  />
                </div>

                {/* Disciplines */}
                <div className="space-y-2">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Primary Disciplines
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FREELANCER_DISCIPLINES.map((skill) => (
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

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-foreground/90 transition hover:bg-white/5"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3Complete}
                    disabled={saving}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save & Continue →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3B: Client / Company Profile ─── */}
            {step === 3 && role === "client" && (
              <motion.div
                key="step-3-client"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Monolith Capital"
                    className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8"
                  />
                </div>

                {/* Industry & Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Industry</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/40"
                    >
                      <option value="" disabled>Select...</option>
                      {INDUSTRIES.map((ind) => <option key={ind} value={ind} className="bg-background">{ind}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">Size</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full bg-white/5 border border-white/12 rounded-xl px-4 py-3.5 text-sm text-foreground focus:outline-none focus:border-accent/40"
                    >
                      <option value="" disabled>Select...</option>
                      {COMPANY_SIZES.map((size) => <option key={size.value} value={size.value} className="bg-background">{size.label}</option>)}
                    </select>
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

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full border border-white/15 px-5 py-3.5 text-sm text-foreground/90 transition hover:bg-white/5"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={handleStep3Complete}
                    disabled={saving || !companyName}
                    className="rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save & Continue →"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 4: Create Service / Brief ─── */}
            {step === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <form onSubmit={handleFinalComplete} className="space-y-6">
                  
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        {role === "freelancer" ? "Titre du Service" : "Titre du Projet"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "title" ? null : "title")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent transition-all"
                      >
                        {activeTip === "title" ? "Masquer" : "Conseil ✦"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {activeTip === "title" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
                        >
                          <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_TIPS.title.title}</div>
                          <p className="text-xs text-muted-foreground/80">{ONBOARDING_TIPS.title.body}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <input
                      type="text"
                      required
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      onFocus={() => setActiveTip("title")}
                      placeholder={role === "freelancer" ? "ex: Landing Page WebGL immersive" : "ex: Refonte de marque complète"}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Catégorie</label>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => { setItemCategory(cat.value); setActiveTip("category"); }}
                          className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all ${
                            itemCategory === cat.value
                              ? "border-accent bg-accent/8 shadow-[0_0_15px_-5px_oklch(0.7_0.18_295/0.3)]"
                              : "border-white/8 bg-white/2 hover:border-white/15"
                          }`}
                        >
                          <span className="text-base">{cat.icon}</span>
                          <div className={`font-mono text-[9px] uppercase tracking-wider ${itemCategory === cat.value ? "text-accent" : "text-foreground/80"}`}>
                            {cat.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Price / Budget */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {role === "freelancer" ? "Tarif Fixe ($)" : "Budget"}
                        </label>
                        <button
                          type="button"
                          onClick={() => setActiveTip(activeTip === "price" ? null : "price")}
                          className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent"
                        >
                          {activeTip === "price" ? "×" : "Conseil ✦"}
                        </button>
                      </div>
                      
                      {role === "freelancer" ? (
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">$</span>
                          <input
                            type="number"
                            required
                            min={1}
                            value={itemPrice}
                            onChange={(e) => setItemPrice(Number(e.target.value) || 0)}
                            onFocus={() => setActiveTip("price")}
                            className="w-full bg-white/3 border border-white/10 rounded-xl pl-8 pr-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                          />
                        </div>
                      ) : (
                        <select
                          value={itemBudget}
                          onChange={(e) => setItemBudget(e.target.value)}
                          className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                        >
                          <option value="" disabled>Sélectionner...</option>
                          {BUDGET_SUGGESTIONS.map(b => <option key={b} value={b} className="bg-background">{b}</option>)}
                        </select>
                      )}
                    </div>

                    {/* Delivery Days (Freelancer only) */}
                    {role === "freelancer" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Délai (Jours)</label>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            required
                            min={1}
                            value={itemDeliveryDays}
                            onChange={(e) => setItemDeliveryDays(Number(e.target.value) || 0)}
                            className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 text-xs font-mono">jours</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                        Description & Détails
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTip(activeTip === "description" ? null : "description")}
                        className="font-mono text-[8px] uppercase tracking-widest text-accent/60 hover:text-accent"
                      >
                        Conseil ✦
                      </button>
                    </div>
                    <textarea
                      required
                      rows={4}
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      onFocus={() => setActiveTip("description")}
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40 resize-none"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Tags (séparés par virgule)</label>
                    <input
                      type="text"
                      value={itemTags}
                      onChange={(e) => setItemTags(e.target.value)}
                      placeholder="Figma, React, 3D..."
                      className="w-full bg-white/3 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="font-mono text-[11px] text-destructive border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center"
                      >
                        ⚡ {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={saving}
                      className="rounded-full border border-white/15 px-6 py-4 text-sm text-foreground/80 hover:bg-white/5 transition"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipStep4}
                      disabled={saving}
                      className="rounded-full border border-white/15 px-6 py-4 text-sm text-foreground/80 hover:bg-white/5 transition"
                    >
                      Passer
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 rounded-full bg-white py-4 text-sm font-semibold text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      {saving ? "Finalisation..." : `Publier & Entrer dans le Nexus →`}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer note */}
        <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          {step === 4 
            ? "Cette étape est essentielle pour démarrer."
            : "You can update all of this later from your profile settings."}
        </p>
      </motion.div>
    </div>
  );
}
