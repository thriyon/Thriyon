import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  username: string;
}

export function DashboardHeader({ username }: DashboardHeaderProps) {
  const router = useRouter();
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-white/10 bg-[#0A0A0A]">
      <div className="flex items-center gap-6">
        <Link
          href="/explore"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Explorer
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:outline-none">
            <Avatar className="h-9 w-9 border border-white/10 cursor-pointer">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-white/5 text-xs">
                {username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#0A0A0A] border border-white/10 text-foreground">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.full_name || username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  @{username}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
              <Link href={`/${username}/profile`}>
                <User className="mr-2 h-4 w-4" />
                <span>Mon Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
              <Link href={`/${username}/dashboard/${profile?.role === "client" ? "client" : "freelancer"}`}>
                <Search className="mr-2 h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/5 cursor-pointer">
              <Link href={`/${username}/dashboard/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleSignOut} className="focus:bg-white/5 text-red-500 focus:text-red-500 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Se déconnecter</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
