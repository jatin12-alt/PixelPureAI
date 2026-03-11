"use client";

import { useIntersectionObserver } from "@/hooks/use-landing-hooks";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";

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
  const { has } = useAuth();

  // Check if user has this specific plan
  const isCurrentPlan = id ? has?.({ plan: id }) : false;

  const handlePopup = async () => {
    if (isCurrentPlan) return;

    try {
      if (window.Clerk && window.Clerk.__internal_openCheckout) {
        await window.Clerk.__internal_openCheckout({
          planId: planId,
          planPeriod: "month",
          subscriberType: "user",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
    }
  };

  return (
    <><div
      ref={ref}
      className={`relative backdrop-blur-xl border rounded-[2.5rem] p-10 transition-all duration-1000 ${featured
          ? "bg-slate-900/60 border-indigo-500/50 shadow-2xl shadow-indigo-500/10 z-10"
          : "bg-slate-900/40 border-white/5"} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      {...featured && (
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-xl">
            Most Popular
          </div>
        </div>
      )} /><div className="text-center">
        <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">{plan}</h3>
        <div className="text-5xl font-bold text-white mb-8 tracking-tighter">
          {price === 0 ? "₹0" : `₹${price}`}
          {price > 0 && <span className="text-lg text-slate-500 font-medium ml-1">/mo</span>}
        </div>

        <ul className="space-y-4 mb-10 text-left">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-slate-400 text-sm font-medium">
              <div className="mr-4 bg-indigo-500/20 p-1 rounded-full">
                <span className="text-indigo-400 text-[10px]">✓</span>
              </div>
              {feature}
            </li>
          ))}
        </ul>

        <Button
          onClick={handlePopup}
          disabled={isCurrentPlan || (!planId && price > 0)}
          className={`w-full h-14 rounded-full font-bold text-sm transition-all duration-300 ${featured
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20"
              : "bg-white/5 hover:bg-white/10 text-white border border-white/10"}`}
        >
          {isCurrentPlan ? "Current Plan" : buttonText}
        </Button>
      </div></>
  );
};

// Pricing Section Component
const PricingSection = () => {
  const plans = [
    {
      id: "free_user",
      plan: "Free",
      price: 0,
      features: [
        "3 projects maximum",
        "20 exports per month",
        "Basic restoration",
        "HD Upscaling (2x)",
        "Cloud Storage",
      ],
      buttonText: "Try PixelPureAI",
    },
    {
      id: "pro",
      plan: "Pro",
      price: 499,
      features: [
        "Unlimited projects",
        "Unlimited exports",
        "Advanced AI Restoration",
        "AI Background Remover",
        "AI Image Extender",
        "4K Ultra-HD Exports",
      ],
      featured: true,
      planId: "cplan_2ywZwXjYQQipWYxjCmFZCgCgsTZ",
      buttonText: "Upgrade to Pro",
    },
    {
      id: "business",
      plan: "Business",
      price: 999,
      features: [
        "Everything in Pro",
        "Priority Support",
        "Batch Processing",
        "API Access",
        "Custom Watermarking",
      ],
      buttonText: "Contact Sales",
    },
  ];

  return (
    <section className="py-32 bg-slate-950" id="pricing">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Simple <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that's right for your restoration journey. No hidden fees.
          </p>
        </div>

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
