"use client";

import { useState } from "react";
import { Plus, Briefcase, MoreVertical, Edit2, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// This is a placeholder for the services data. 
// You'll eventually fetch this from your Supabase backend.
const mockServices: any[] = []; // Change to some mock data to preview it, e.g. [{ id: 1, title: "Web Design", price: "$50/hr", status: "Active" }]

export default function ServicesPage() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">My Services</h1>
          <p className="text-muted-foreground mt-1">Manage the services you offer to clients on Thriyon.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-white text-black px-4 py-2.5 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors">
          <Plus className="h-4 w-4" />
          Create Service
        </button>
      </div>

      {mockServices.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-3xl border border-white/10 border-dashed bg-white/5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-6">
            <Briefcase className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">No services yet</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            You haven't created any services yet. Create your first service to start offering your skills to clients on the marketplace.
          </p>
          <button className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-medium text-sm hover:bg-white/90 transition-colors">
            <Plus className="h-4 w-4" />
            Create Your First Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.map((service, index) => (
            <motion.div 
              key={service.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    service.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-white/10 text-muted-foreground"
                  }`}>
                    {service.status || "Draft"}
                  </span>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                {service.title || "Untitled Service"}
              </h3>
              
              <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                {service.description || "No description provided."}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <span className="font-medium text-foreground">
                  {service.price || "Contact for pricing"}
                </span>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-foreground">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
