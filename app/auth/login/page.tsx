"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profile?.role === "client") {
        router.push("/user/dashboard/client");
      } else {
        router.push("/user/dashboard/freelancer");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
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
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent mb-2">
            Gateway · Access
          </div>
          <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] text-gradient">
            Enter the Nexus
          </h2>
          <p className="mt-2.5 text-[13px] text-muted-foreground/80 leading-relaxed">
            Access your sovereign creative studio and active brief collaborations.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90 pl-1">
              Secret Identifier (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., curator@thriyon.co"
              className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40 focus:shadow-[0_0_20px_-5px_oklch(0.7_0.18_295/0.25)]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center pl-1 pr-1">
              <label className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/90">
                Sovereign Key (Password)
              </label>
              <Link
                href="/auth/reset"
                className="font-mono text-[9px] uppercase tracking-[0.2em] text-accent/80 hover:text-accent transition"
              >
                Lost Key?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white/5 border border-white/12 rounded-2xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 transition-all duration-300 focus:outline-none focus:border-accent/40 focus:bg-white/8 focus:ring-1 focus:ring-accent/40 focus:shadow-[0_0_20px_-5px_oklch(0.7_0.18_295/0.25)]"
            />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="font-mono text-[11px] text-destructive leading-normal border border-destructive/20 bg-destructive/5 rounded-2xl px-4 py-3.5 text-center mt-2"
              >
                ⚡ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative overflow-hidden rounded-full bg-white py-3.5 text-sm font-medium text-black transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Connecting...
              </span>
            ) : (
              "Establish Link →"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/8" />
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">Or continue with</span>
          <div className="h-px flex-1 bg-white/8" />
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 rounded-full border border-white/12 bg-white/3 py-3.5 text-sm font-medium text-foreground transition hover:bg-white/8 hover:border-white/20 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>Continuer avec Google</span>
        </button>

        <div className="mt-8 pt-6 border-t border-white/6 text-center">
          <p className="text-[12px] text-muted-foreground/75">
            New creative practitioner?{" "}
            <Link
              href="/auth/signup"
              className="text-foreground hover:text-accent font-medium underline underline-offset-4 decoration-white/20 transition-all"
            >
              Submit application
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
