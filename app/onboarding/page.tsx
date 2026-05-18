"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

const ONBOARDING_USERNAME_TIP = {
  title: "Votre identité unique",
  body: "Ce nom d'utilisateur servira pour l'URL de votre profil (ex: thriyon.com/@nom). Lettres, chiffres et underscores uniquement.",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, refreshProfile, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showTip, setShowTip] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from existing profile
  useEffect(() => {
    if (profile) {
      if (profile.full_name && !fullName) setFullName(profile.full_name);
      if (profile.username && !username) setUsername(profile.username);
      if (profile.avatar_url && !avatarPreview) setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  // Guard: already onboarded → redirect
  useEffect(() => {
    if (!loading && user && profile && profile.onboarding_completed) {
      const uname = profile.username || "user";
      if (profile.role === "client") {
        router.push(`/${uname}/dashboard/client`);
      } else {
        router.push(`/${uname}/dashboard/freelancer`);
      }
    }
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, profile, router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    if (!fullName || !username) {
      setError("Veuillez remplir votre nom et votre nom d'utilisateur.");
      return;
    }

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
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
        avatarUrl = data.publicUrl;
      }

      const { error: updateError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        username: username.toLowerCase(),
        avatar_url: avatarUrl,
        role: "client",
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      });

      if (updateError) {
        if (updateError.code === "23505") {
          throw new Error("Ce nom d'utilisateur est déjà pris. Essayez-en un autre.");
        }
        throw updateError;
      }

      await refreshProfile();
      router.push(`/${username.toLowerCase()}/dashboard/client`);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde.");
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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Backdrop */}
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
            Nexus · Identity Setup
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-display text-[clamp(2rem,6vw,3.2rem)] leading-[1.0] tracking-[-0.04em] text-gradient"
          >
            Welcome to Thriyon
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-3 text-[13px] text-muted-foreground/75 leading-relaxed"
          >
            Configurez votre identité souveraine en moins d'une minute.
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow"
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
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              Photo de Profil <span className="text-muted-foreground/40">(optionnel)</span>
            </p>
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
                  onClick={() => setShowTip((v) => !v)}
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
                  onFocus={() => setShowTip(true)}
                  placeholder="satoshi_n"
                  className="w-full bg-white/5 border border-white/12 rounded-2xl pl-8 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all focus:outline-none focus:border-accent/40 focus:bg-white/8 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Username Tip */}
          <AnimatePresence>
            {showTip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 rounded-xl border border-accent/15 bg-accent/5 px-4 py-3"
              >
                <div className="font-mono text-[8px] uppercase tracking-widest text-accent mb-1">{ONBOARDING_USERNAME_TIP.title}</div>
                <p className="text-xs text-muted-foreground/80">{ONBOARDING_USERNAME_TIP.body}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 font-mono text-[11px] text-destructive border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center"
              >
                ⚡ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <button
            type="button"
            onClick={handleComplete}
            disabled={saving || !fullName || !username}
            className="w-full mt-6 rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Création du compte..." : "Rejoindre le Nexus →"}
          </button>

          <p className="mt-5 text-center font-mono text-[10px] text-muted-foreground/50 leading-relaxed">
            Vous rejoindrez en tant que compte standard. Vous pourrez ensuite devenir{" "}
            <span className="text-accent/70">Freelance</span> ou configurer un profil{" "}
            <span className="text-accent/70">Business</span> depuis votre espace.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
