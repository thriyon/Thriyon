"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

export type Profile = {
  id: string;
  full_name: string | null;
  username: string | null;
  bio: string | null;
  skills: string[] | null;
  role: "freelancer" | "client" | null;
  avatar_url: string | null;
  rate: number | null;
  updated_at: string | null;
  // Company-specific fields
  company_name: string | null;
  industry: string | null;
  company_size: string | null;
  website: string | null;
  budget_range: string | null;
  onboarding_completed: boolean;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

function createPendingProfile(user: User): Profile {
  return {
    id: user.id,
    full_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      null,
    username: null,
    bio: null,
    skills: null,
    role: "client",
    avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
    rate: null,
    updated_at: null,
    company_name: null,
    industry: null,
    company_size: null,
    website: null,
    budget_range: null,
    onboarding_completed: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUser = authData.user;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
        setProfile(currentUser ? createPendingProfile(currentUser) : null);
      } else if (data) {
        setProfile(data as Profile);
      } else {
        setProfile(currentUser ? createPendingProfile(currentUser) : null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // 1. Immediately read the cookie-based session on mount.
    //    This is critical for createBrowserClient which stores session in cookies.
    //    onAuthStateChange alone may not fire INITIAL_SESSION reliably.
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).finally(() => setLoading(false));
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // 2. Listen for subsequent auth changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
