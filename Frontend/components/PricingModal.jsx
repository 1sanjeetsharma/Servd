"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PricingSection from "./PricingSection";
import { Sparkles } from "lucide-react";

export default function PricingModal({ subscriptionTier = "free", children }) {
  const [isOpen, setIsOpen] = useState(false);

  // Only allow opening if user is on free plan
  const canOpen = subscriptionTier === "free";

  return (
    <Dialog open={isOpen} onOpenChange={canOpen ? setIsOpen : undefined}>
      <DialogTrigger asChild disabled={!canOpen}>
        <div className={`flex h-8 px-3 gap-1.5 rounded-full text-xs align-baseline items-center font-semibold transition-all ${subscriptionTier==='pro'? "bg-gradient-to-r from-orange-600 to-amber-500 text-white border-none shadow-sm": "bg-stone-200/50 text-stone-600 border-stone-200 cursor-pointer hover:bg-stone-300/50 hover:border-stone-300"}`}>
          <Sparkles
            className={`h-3 w-3 ${
              subscriptionTier === "pro"  
                ? "text-white fill-white/20"
                : "text-stone-500"
            }`}
          />
          <span>{subscriptionTier === "pro" ? "Pro Chef" : "Free Plan"}</span>
        </div>
      </DialogTrigger>

      <DialogContent className="p-8 pt-4 sm:max-w-4xl">
        <DialogTitle />
        <div>
          <PricingSection
            subscriptionTier={subscriptionTier}
            isModal={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
