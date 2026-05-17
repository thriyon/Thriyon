"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, BadgeCheck, Globe, Star, Mail, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileSection } from "@/modules/user/ProfileSection";

const mockServices = [
  { id: "1", title: "Brand Identity Design & Strategy", price: 1500, rating: 4.9, reviews: 12, image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80" },
  { id: "2", title: "Full-stack Web Development in React", price: 3000, rating: 5.0, reviews: 8, image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" },
  { id: "3", title: "UI/UX App Redesign & Prototyping", price: 2000, rating: 4.8, reviews: 24, image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80" },
];

export default function ProfilePage() {
  const { profile, loading } = useAuth();
  
  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "US";

  return (
    <div className="w-full pb-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 p-32 bg-blue-50 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-slate-100 text-3xl font-medium text-slate-600">{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl font-bold text-slate-900">
                  {profile?.full_name || "Anonymous User"}
                </h1>
                <BadgeCheck className="h-6 w-6 text-blue-600" />
              </div>
              
              <div className="text-sm text-slate-600 font-medium">
                {profile?.role === "freelancer" ? "Senior Creative Practitioner" : "Enterprise Client"}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> Paris, France
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-4 w-4" /> Anglais, Français
                </div>
                {profile?.rate && (
                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                    ${profile.rate}/hr
                  </div>
                )}
              </div>
            </div>
            
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button className="flex items-center justify-center gap-2 rounded-full bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                <Mail className="h-4 w-4" /> Me Contacter
              </button>
              <button className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                <Share2 className="h-4 w-4" /> Partager
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-[1fr_320px] gap-6">
          {/* Main Column */}
          <div className="space-y-6">
            
            {/* Bio */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ProfileSection title="À propos de moi" loading={loading}>
                <p className="text-slate-600 leading-relaxed">
                  {profile?.bio || 
                    "Je suis un créatif passionné par les expériences digitales. Fort de plus de 5 ans d'expérience dans l'industrie, j'allie expertise technique et précision esthétique pour livrer des solutions souveraines qui résistent à l'épreuve du temps."}
                </p>
              </ProfileSection>
            </motion.div>

            {/* Portfolio / Gigs */}
            {(!profile || profile?.role === "freelancer") && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <ProfileSection title="Mes Services" description="Projets et prestations disponibles" loading={loading}>
                  <div className="grid sm:grid-cols-2 gap-5 mt-4">
                    {mockServices.map((service) => (
                      <div key={service.id} className="group flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                          <img 
                            src={service.image} 
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {service.title}
                          </h3>
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span>{service.rating}</span>
                              <span className="text-slate-400 font-normal">({service.reviews})</span>
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                              <span className="text-slate-500 font-normal text-xs mr-1">À partir de</span>
                              ${service.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ProfileSection>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Skills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <ProfileSection title="Compétences" loading={loading}>
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills?.length ? profile.skills : ["Figma", "React", "Next.js", "UI/UX", "Tailwind"]).map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent px-3 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </ProfileSection>
            </motion.div>

            {/* Performance */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ProfileSection title="Performance" loading={loading}>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Missions terminées</span>
                    <span className="text-sm font-semibold text-slate-900">42</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-sm text-slate-500">Livraison dans les temps</span>
                    <span className="text-sm font-semibold text-emerald-600">100%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500">Temps de réponse</span>
                    <span className="text-sm font-semibold text-slate-900">&lt; 1 h</span>
                  </div>
                </div>
              </ProfileSection>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
