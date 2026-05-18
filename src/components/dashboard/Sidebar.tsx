import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Heart,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  role: "client" | "freelancer";
  username: string;
}

export function Sidebar({ isExpanded, setIsExpanded, role, username }: SidebarProps) {
  const pathname = usePathname();

  const clientLinks = [
    { name: "Dashboard", href: `/${username}/dashboard/client`, icon: LayoutDashboard },
    { name: "Mes Commandes", href: `/${username}/dashboard/client/orders`, icon: Briefcase },
    { name: "Mes Briefs", href: `/${username}/dashboard/client/briefs`, icon: FileText },
    { name: "Favoris", href: `/${username}/dashboard/client/favorites`, icon: Heart },
    { name: "Messages", href: `/${username}/dashboard/messages`, icon: MessageSquare },
  ];

  const freelancerLinks = [
    { name: "Dashboard", href: `/${username}/dashboard/freelancer`, icon: LayoutDashboard },
    { name: "Mes Services", href: `/${username}/dashboard/freelancer/services`, icon: FileText },
    { name: "Mes Tâches", href: `/${username}/dashboard/freelancer/tasks`, icon: Briefcase },
    { name: "Messages", href: `/${username}/dashboard/messages`, icon: MessageSquare },
  ];

  const links = role === "client" ? clientLinks : freelancerLinks;

  return (
    <aside
      className={cn(
        "relative flex flex-col h-screen border-r border-white/10 bg-[#0A0A0A] transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        {isExpanded ? (
          <Link href="/" className="font-display text-xl tracking-widest text-foreground font-bold">
            THRIYON
          </Link>
        ) : (
          <Link href="/" className="font-display text-xl tracking-widest text-foreground font-bold mx-auto">
            T
          </Link>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#0A0A0A] text-muted-foreground hover:text-foreground transition-colors z-10"
      >
        {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              title={!isExpanded ? link.name : undefined}
              className={cn(
                "flex items-center px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-white/10 text-accent"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              <Icon size={20} className={cn("min-w-[20px]", isActive ? "text-accent" : "")} />
              {isExpanded && (
                <span className="ml-3 text-sm font-medium whitespace-nowrap">{link.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Settings Link */}
      <div className="p-3 border-t border-white/10">
        <Link
          href={`/${username}/dashboard/settings`}
          title={!isExpanded ? "Paramètres" : undefined}
          className={cn(
            "flex items-center px-3 py-3 rounded-xl transition-all duration-200",
            pathname.includes("/settings")
              ? "bg-white/10 text-accent"
              : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
          )}
        >
          <Settings size={20} className="min-w-[20px]" />
          {isExpanded && <span className="ml-3 text-sm font-medium whitespace-nowrap">Paramètres</span>}
        </Link>
      </div>
    </aside>
  );
}
