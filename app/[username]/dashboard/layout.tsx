"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      
      const routeUsername = params?.username as string;
      if (profile && routeUsername && profile.username !== routeUsername) {
        // Prevent cross-user dashboard access by redirecting the user to their own dashboard
        const myDashboard = profile.role === "client" ? "client" : "freelancer";
        router.push(`/${profile.username}/dashboard/${myDashboard}`);
      }
    }
  }, [user, profile, loading, params, router]);

  // Loading state & safety guard while verifying authenticity
  if (loading || !user || (profile && params?.username && profile.username !== params.username)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
