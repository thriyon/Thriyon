"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Camera, Save, Shield, Bell, CreditCard, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const generalSchema = z.object({
  full_name: z.string().min(2, "Le nom doit comporter au moins 2 caractères"),
  bio: z.string().max(500, "La bio doit faire moins de 500 caractères").optional(),
  rate: z.coerce.number().min(0).optional(),
});

type GeneralFormValues = z.infer<typeof generalSchema>;

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      full_name: "",
      bio: "",
      rate: 0,
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        rate: profile.rate || 0,
      });
      if (profile.avatar_url) {
        setAvatarPreview(profile.avatar_url);
      }
    }
  }, [profile, reset]);

  const onSubmitGeneral = async (data: GeneralFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          bio: data.bio,
          rate: data.rate,
        })
        .eq("id", user.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Profil mis à jour avec succès");
    } catch (err: any) {
      toast.error(err.message || "Échec de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      toast.info("Mode sélection - l'upload n'est pas encore connecté au stockage");
    }
  };

  return (
    <div className="w-full pb-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-slate-500 mt-2">
            Gérez la configuration de votre compte et vos préférences.
          </p>
        </motion.div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="flex flex-wrap h-auto w-full md:w-max bg-slate-100 border border-slate-200 rounded-xl p-1 mb-8 gap-1">
            <TabsTrigger value="general" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2">
              <UserIcon className="h-4 w-4 mr-2" /> Général
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2">
              <Shield className="h-4 w-4 mr-2" /> Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2">
              <Bell className="h-4 w-4 mr-2" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-4 py-2">
              <CreditCard className="h-4 w-4 mr-2" /> Facturation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <form onSubmit={handleSubmit(onSubmitGeneral)} className="space-y-8">
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border border-slate-200 shadow-sm">
                      <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 text-2xl font-medium text-slate-500">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Photo de profil</h3>
                    <p className="text-xs text-slate-500 mt-1">Recommandé 500x500px, max 2MB.</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Nom complet</Label>
                    <Input
                      {...register("full_name")}
                      className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 h-11"
                      placeholder="Entrez votre nom complet"
                    />
                    {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Bio</Label>
                    <textarea
                      {...register("bio")}
                      className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 transition-colors"
                      placeholder="Parlez-nous de vous..."
                    />
                    {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>}
                  </div>

                  {(!profile || profile?.role === "freelancer") && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-700">Taux horaire ($)</Label>
                      <Input
                        type="number"
                        {...register("rate")}
                        className="bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 h-11 max-w-[200px]"
                        placeholder="Ex: 150"
                      />
                      {errors.rate && <p className="text-xs text-red-500 mt-1">{errors.rate.message}</p>}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-full bg-blue-600 text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
                  </button>
                </div>
              </form>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Mot de passe et sécurité</h3>
              <p className="text-sm text-slate-500 mb-6">Gérez vos paramètres de sécurité et d'authentification.</p>
              
              <div className="space-y-4 max-w-2xl">
                <button className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <span>Changer de mot de passe</span>
                  <span className="text-slate-400 text-xs font-normal">Mis à jour il y a 2 mois</span>
                </button>
                <button className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                  <span>Authentification à deux facteurs (2FA)</span>
                  <span className="px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-slate-200 text-slate-600">Désactivé</span>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Préférences de notifications</h3>
              
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Alertes par email</h4>
                    <p className="text-sm text-slate-500 mt-1">Recevez des mises à jour sur vos contrats et messages.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Notifications Push</h4>
                    <p className="text-sm text-slate-500 mt-1">Alertes en temps réel dans votre navigateur.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Communications Marketing</h4>
                    <p className="text-sm text-slate-500 mt-1">Actualités et mises à jour de la plateforme.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <CreditCard className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Détails de facturation</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">
                La gestion de l'escrow et l'historique de facturation sont gérés de manière sécurisée via Stripe Connect.
              </p>
              <button className="mt-6 rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
                Gérer la facturation sur Stripe
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
