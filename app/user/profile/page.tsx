"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, Globe, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/components/user/ProfileSection";

// Mock data for services/portfolio since it might not be fully in the profile type
const mockServices = [
  { id: "1", title: "Brand Identity Design", price: 1500, rating: 4.9, reviews: 12, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80" },
  { id: "2", title: "Full-stack Web Development", price: 3000, rating: 5.0, reviews: 8, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" },
  { id: "3", title: "UI/UX App Redesign", price: 2000, rating: 4.8, reviews: 24, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" },
];

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "PR";

  return (
    <div className="relative min-h-full w-full px-6 pt-8 pb-16 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px] opacity-50" />
      
      <div className="mx-auto max-w-5xl space-y-6 relative z-10">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1 relative overflow-hidden"
        >
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <Avatar className="h-28 w-28 border-2 border-white/10 shadow-xl">
              <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-graphite text-3xl text-muted-foreground">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-semibold text-foreground">
                  {profile?.full_name || "Anonymous Practitioner"}
                </h1>
                <BadgeCheck className="h-6 w-6 text-accent" />
              </div>
              
              <div className="text-sm text-muted-foreground/80 font-medium">
                {profile?.role === "freelancer" ? "Senior Creative Practitioner" : "Enterprise Client"}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/60 font-mono uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Paris, France
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  English, French
                </div>
                {profile?.rate && (
                  <div className="flex items-center gap-1.5 text-accent/80">
                    ${profile.rate}/hr
                  </div>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col gap-3 w-full md:w-auto">
              <button className="rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-semibold hover:bg-foreground/90 transition shadow-lg cursor-pointer">
                Contact Me
              </button>
              <button className="rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-semibold hover:bg-white/10 transition cursor-pointer">
                Share Profile
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            {/* Bio */}
            <ProfileSection title="About Me" loading={loading}>
              <p className="text-muted-foreground/80 leading-relaxed text-sm">
                {profile?.bio || 
                  "I am a passionate creative practitioner specializing in digital experiences. With over 5 years of industry experience, I blend technical expertise with aesthetic precision to deliver sovereign solutions that stand the test of time."}
              </p>
            </ProfileSection>

            {/* Portfolio / Services (Fiverr-like Gigs) */}
            {profile?.role === "freelancer" && (
              <ProfileSection title="My Services" description="Available for new engagements" loading={loading}>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                  {mockServices.map((service) => (
                    <div key={service.id} className="group flex flex-col rounded-2xl border border-white/6 bg-white/2 overflow-hidden hover:border-white/15 transition cursor-pointer">
                      <div className="aspect-video w-full overflow-hidden bg-white/5 relative">
                        <img 
                          src={service.image} 
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="font-display text-sm font-medium text-foreground group-hover:text-accent transition line-clamp-2">
                          {service.title}
                        </h3>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="font-medium">{service.rating}</span>
                            <span className="text-muted-foreground/50">({service.reviews})</span>
                          </div>
                          <div className="font-mono text-xs text-foreground">
                            <span className="text-muted-foreground/50 text-[10px] uppercase mr-1">From</span>
                            ${service.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ProfileSection>
            )}
          </div>

          <div className="space-y-6">
            {/* Skills */}
            <ProfileSection title="Skills" loading={loading}>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills?.length ? profile.skills : ["Figma", "React", "Next.js", "UI/UX", "Tailwind"]).map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-mono text-[10px] uppercase tracking-wider bg-white/5 hover:bg-white/10 border-white/5">
                    {skill}
                  </Badge>
                ))}
              </div>
            </ProfileSection>

            {/* Stats Summary */}
            <ProfileSection title="Performance" loading={loading}>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Jobs Completed</span>
                  <span className="font-mono text-xs text-foreground font-medium">42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">On-time Delivery</span>
                  <span className="font-mono text-xs text-emerald-400 font-medium">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Response Time</span>
                  <span className="font-mono text-xs text-foreground font-medium">&lt; 1 hr</span>
                </div>
              </div>
            </ProfileSection>
          </div>
        </div>
      </div>
    </div>
  );
}
