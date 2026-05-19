"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { user, profile, loading } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const routeUsername = params?.username as string;
      if (profile && routeUsername && profile.username && profile.username !== routeUsername) {
        // Prevent cross-user dashboard access
        const myDashboard = profile.role === "client" ? "client" : "freelancer";
        router.push(`/${profile.username}/dashboard/${myDashboard}`);
      }
    }
  }, [user, profile, loading, params, router]);

  // Only show spinner while auth is loading or user is not yet confirmed
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <div className="h-8 w-8 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  // Once authenticated and authorized, render the dashboard shell
  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0A0A] text-foreground">
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        setIsExpanded={setIsSidebarExpanded} 
        role={profile?.role as "client" | "freelancer"}
        username={profile?.username || ""}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader username={profile?.username || ""} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
