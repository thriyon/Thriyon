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
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
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
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      toast.info("Avatar selection mode - image upload not yet connected to storage");
    }
  };

  return (
    <div className="relative min-h-full w-full px-6 pt-8 pb-24 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px] opacity-50" />

      <div className="mx-auto max-w-3xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Manage your account configurations and preferences.
          </p>
        </motion.div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-12 bg-white/5 border border-white/10 rounded-xl p-1 mb-8">
            <TabsTrigger value="general" className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              <UserIcon className="h-3.5 w-3.5 mr-2" /> General
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              <Shield className="h-3.5 w-3.5 mr-2" /> Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              <Bell className="h-3.5 w-3.5 mr-2" /> Alerts
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg text-xs font-mono uppercase tracking-wider data-[state=active]:bg-white/10 data-[state=active]:text-foreground">
              <CreditCard className="h-3.5 w-3.5 mr-2" /> Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1">
              <form onSubmit={handleSubmit(onSubmitGeneral)} className="space-y-8">
                
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 border border-white/10">
                      <AvatarImage src={avatarPreview || undefined} className="object-cover" />
                      <AvatarFallback className="bg-graphite text-2xl text-muted-foreground">
                        {profile?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer">
                      <Camera className="h-6 w-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-medium text-foreground">Profile Picture</h3>
                    <p className="text-xs text-muted-foreground/60 mt-1">Recommended 500x500px, max 2MB.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2 relative group">
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-focus-within:text-accent transition-colors">
                      Full Name
                    </Label>
                    <Input
                      {...register("full_name")}
                      className="bg-white/3 border-white/10 focus-visible:border-accent/50 focus-visible:ring-accent/20 h-11"
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && <p className="text-[10px] text-destructive mt-1">{errors.full_name.message}</p>}
                  </div>

                  <div className="space-y-2 relative group">
                    <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-focus-within:text-accent transition-colors">
                      Bio
                    </Label>
                    <textarea
                      {...register("bio")}
                      className="flex min-h-[100px] w-full rounded-md border border-white/10 bg-white/3 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-accent/50 focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      placeholder="Tell us about your practice..."
                    />
                    {errors.bio && <p className="text-[10px] text-destructive mt-1">{errors.bio.message}</p>}
                  </div>

                  {profile?.role === "freelancer" && (
                    <div className="space-y-2 relative group">
                      <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground group-focus-within:text-accent transition-colors">
                        Hourly Rate ($)
                      </Label>
                      <Input
                        type="number"
                        {...register("rate")}
                        className="bg-white/3 border-white/10 focus-visible:border-accent/50 focus-visible:ring-accent/20 h-11"
                        placeholder="e.g. 150"
                      />
                      {errors.rate && <p className="text-[10px] text-destructive mt-1">{errors.rate.message}</p>}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-xs font-semibold hover:bg-foreground/90 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </TabsContent>

          <TabsContent value="security">
            <div className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1">
              <h3 className="font-display text-base font-medium text-foreground mb-4">Password & Security</h3>
              <p className="text-sm text-muted-foreground mb-6">Manage your password and security preferences.</p>
              
              <div className="space-y-4">
                <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 transition w-full text-left flex justify-between items-center cursor-pointer">
                  Change Password
                  <span className="text-muted-foreground text-xs">Updated 2 months ago</span>
                </button>
                <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium hover:bg-white/10 transition w-full text-left flex justify-between items-center cursor-pointer">
                  Two-Factor Authentication (2FA)
                  <Badge variant="outline" className="border-accent/30 text-accent bg-accent/10">Disabled</Badge>
                </button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1">
              <h3 className="font-display text-base font-medium text-foreground mb-4">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Email Alerts</h4>
                    <p className="text-xs text-muted-foreground mt-1">Receive contract updates and messages via email.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Push Notifications</h4>
                    <p className="text-xs text-muted-foreground mt-1">Real-time alerts in the browser.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-foreground">Marketing Communications</h4>
                    <p className="text-xs text-muted-foreground mt-1">News and platform updates.</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <div className="glass rounded-3xl p-8 hairline border border-white/6 bg-white/1 flex flex-col items-center justify-center py-16 text-center">
              <CreditCard className="h-10 w-10 text-muted-foreground/30 mb-4" />
              <h3 className="font-display text-base font-medium text-foreground">Billing details</h3>
              <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm">
                Escrow management and billing history is handled securely via Stripe Connect.
              </p>
              <button className="mt-6 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-xs font-semibold hover:bg-white/10 transition cursor-pointer">
                Manage Billing in Stripe
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
