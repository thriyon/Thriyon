"use client";

import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const initialised = useRef(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.warn("Could not fetch profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Safety timeout — never leave users stuck in loading state
    const safetyTimer = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn("Auth: loading timed out after 6s, forcing false.");
        }
        return false;
      });
    }, 6000);

    // onAuthStateChange fires INITIAL_SESSION immediately, handles PKCE + detectSessionInUrl
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!initialised.current) {
        initialised.current = true;
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
      clearTimeout(safetyTimer);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
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
