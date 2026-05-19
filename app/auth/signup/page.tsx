"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, profile } = useAuth();

  // Already logged in → send to right place
  useEffect(() => {
    if (user && profile) {
      if (!profile.onboarding_completed || !profile.username) {
        router.push("/onboarding");
      } else if (profile.role === "client") {
        router.push(`/${profile.username}/dashboard/client`);
      } else {
        router.push(`/${profile.username}/dashboard/freelancer`);
      }
    }
  }, [user, profile, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const newUser = data.user;
      if (!newUser) {
        setError("Account creation failed. Please try again.");
        setLoading(false);
        return;
      }

      // Create a minimal profile record so the user exists in profiles
      await supabase.from("profiles").upsert({
        id: newUser.id,
        full_name: fullName,
        onboarding_completed: false,
        updated_at: new Date().toISOString(),
      });

      // Send directly to onboarding
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Background radial violet glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/15 blur-[130px] opacity-70" />
      <div className="pointer-events-none absolute inset-0 scanline opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-graphite/60 to-background p-8 md:p-10 grain glow"
      >
        <div className="text-center mb-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-3">
            Gateway · Create Account
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-gradient">
            Nexus Registry
          </h2>
          <p className="mt-2.5 text-[13px] text-muted-foreground/80 leading-relaxed">
            Join the private ecosystem of sovereign builders and clients.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Alex Rivers"
              className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
              Email Identifier
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., designer@studio.co"
              className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
              Sovereign Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40"
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="font-mono text-[11px] text-destructive leading-normal border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center"
              >
                ⚡ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating account..." : "Begin →"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/6 text-center">
          <p className="text-[12px] text-muted-foreground/75">
            Already applied?{" "}
            <Link
              href="/auth/login"
              className="text-foreground hover:text-accent font-medium underline underline-offset-4 decoration-white/20 transition-all"
            >
              Sign in to studio
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
