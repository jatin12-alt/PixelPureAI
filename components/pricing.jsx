"use client";

import React from "react";
import { useIntersectionObserver } from "@/hooks/use-landing-hooks";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PricingCard = ({
  id,
  plan,
  price,
  features,
  featured = false,
  planId,
  buttonText,
}) => {
  const [ref, isVisible] = useIntersectionObserver();
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleAction = () => {
    if (price === 0) {
      router.push("/studio");
      return;
    }
    
    toast.info("Coming soon! Razorpay integration in progress.");
  };

  return (
    <div
      ref={ref}
      className={`relative backdrop-blur-xl border rounded-[2.5rem] p-10 transition-all duration-1000 ${
        featured
          ? "bg-bg-secondary/60 border-accent shadow-2xl shadow-accent/10 z-10"
          : "bg-bg-secondary/40 border-border"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {featured && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <div className="bg-linear-to-r from-accent to-accent2 text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
            Most Popular
          </div>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-3xl font-bold text-text-primary mb-4 tracking-tight">
          {plan}
        </h3>
        <div className="text-5xl font-bold text-text-primary mb-8 tracking-tighter">
          {price === 0 ? "₹0" : `₹${price}`}
          {price > 0 && (
            <span className="text-lg text-text-muted font-medium ml-1">/mo</span>
          )}
        </div>

        <ul className="space-y-4 mb-10 text-left">
          {features.map((feature, index) => (
            <li
              key={index}
              className="flex items-center text-text-muted text-sm font-medium"
            >
              <div className="mr-4 bg-accent/20 p-1 rounded-full">
                <span className="text-accent text-[10px]">✓</span>
              </div>
              {feature}
            </li>
          ))}
        </ul>

        <Button
          onClick={handleAction}
          className={`w-full h-14 rounded-full font-bold text-sm transition-all duration-300 ${
            featured
              ? "bg-linear-to-r from-accent to-accent2 hover:scale-[1.02] text-white shadow-lg shadow-accent/20"
              : "bg-white/5 hover:bg-white/10 text-text-primary border border-border"
          }`}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

// Pricing Section Component
const PricingSection = () => {
  const plans = [
    {
      id: "free",
      plan: "Free",
      price: 0,
      features: [
        "20 Credits included",
        "Basic AI Tools",
        "Standard Export",
        "Community Support",
        "Watermark on Download",
      ],
      buttonText: "Get Started Free",
    },
    {
      id: "pro",
      plan: "Pro",
      price: 299,
      features: [
        "200 Credits per month",
        "All AI Power Tools",
        "Priority Processing",
        "No Watermark",
        "4K HD Upscaling",
        "Email Support",
      ],
      featured: true,
      buttonText: "Upgrade to Pro",
    },
    {
      id: "business",
      plan: "Business",
      price: 799,
      features: [
        "1000 Credits per month",
        "API Access",
        "Batch Processing",
        "Everything in Pro",
        "Priority API access",
        "24/7 Dedicated Support",
      ],
      buttonText: "Upgrade to Business",
    },
  ];

  return (
    <section className="py-24 bg-bg-primary" id="pricing">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto items-center">
          {plans.map((plan, index) => (
            <PricingCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
