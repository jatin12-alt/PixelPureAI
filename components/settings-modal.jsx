"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser, SignOutButton, useClerk } from "@clerk/nextjs";
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  LogOut, 
  Zap, 
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronRight,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";
import { toast } from "sonner";

export function SettingsModal({ isOpen, onClose }) {
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const convexUser = useQuery(api.users.getCurrentUser);
  const updateNotifications = useMutation(api.users.updateNotificationSettings);
  const [activeTab, setActiveTab] = React.useState("profile");
  const [isSaving, setIsSaving] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    updates: true,
    credits: true,
    marketing: false,
  });

  // Sync notifications from Convex when modal opens or user data changes
  React.useEffect(() => {
    if (convexUser?.notificationSettings) {
      setNotifications(convexUser.notificationSettings);
    }
  }, [convexUser, isOpen]);

  const toggleNotification = async (key) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);
    
    try {
      await updateNotifications({ settings: newSettings });
      toast.success("Preferences updated");
    } catch (err) {
      toast.error("Failed to save settings");
      // Revert UI on failure
      setNotifications(notifications);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Alerts", icon: Bell },
    { id: "billing", label: "Plan", icon: CreditCard },
  ];

  const currentPlan = convexUser?.plan || "free";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-200 max-h-[90vh] bg-slate-950 border-white/10 p-0 overflow-hidden rounded-3xl flex flex-col sm:flex-row">
        <DialogHeader className="sr-only">
          <DialogTitle>User Settings</DialogTitle>
          <DialogDescription>
            Manage your account profile, security, notifications, and subscription plan.
          </DialogDescription>
        </DialogHeader>
        {/* Sidebar */}
        <div className="w-full sm:w-64 border-b sm:border-b-0 sm:border-r border-white/5 bg-white/2 p-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center shadow-lg shadow-accent/10">
              <Settings className="h-4 w-4 text-accent" />
            </div>
            <h2 className="text-lg font-black text-white tracking-tight">Settings</h2>
          </div>

          <nav className="flex-1 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-accent text-white shadow-lg shadow-accent/20"
                    : "text-text-muted hover:bg-white/5 hover:text-text-primary"
                }`}
              >
                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-white" : "text-accent/60"}`} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-white/5">
            <SignOutButton>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-400/10 transition-all">
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </SignOutButton>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-bg-primary">
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Account Profile</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest font-black">Manage your public information</p>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-3xl bg-white/3 border border-white/5">
                <div className="relative">
                  <img 
                    src={user?.imageUrl} 
                    alt="Profile" 
                    className="w-20 h-20 rounded-full border-2 border-accent/20"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent flex items-center justify-center border-2 border-slate-950 shadow-lg">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{user?.fullName || user?.username || "Pixel User"}</h4>
                  <p className="text-sm text-text-muted mb-3">{user?.primaryEmailAddress?.emailAddress}</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[10px] font-black uppercase tracking-tighter border border-accent/20">
                      {currentPlan} Member
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 text-text-muted text-[10px] font-black uppercase tracking-tighter border border-white/10">
                      ID: {user?.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Display Name</label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 text-sm text-white/60">
                      {user?.fullName || "Not set"}
                    </div>
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-bold text-xs" onClick={() => openUserProfile()}>
                      Edit
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Username</label>
                  <div className="flex gap-2">
                    <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center px-4 text-sm text-white/60">
                      @{user?.username || "user_" + user?.id.slice(-4)}
                    </div>
                    <Button variant="outline" className="h-12 px-6 rounded-xl font-bold text-xs" onClick={() => openUserProfile()}>
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Security & Access</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest font-black">Protect your PixelPureAI account</p>
              </div>

              <div className="space-y-4">
                <div className="p-6 rounded-3xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Password</h4>
                      <p className="text-xs text-text-muted">Secure your account access</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full px-6 font-bold text-xs" onClick={() => openUserProfile()}>Update</Button>
                </div>

                <div className="p-6 rounded-3xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Two-Factor Auth</h4>
                      <p className="text-xs text-text-muted">Enhance your account security</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full px-6 font-bold text-xs" onClick={() => openUserProfile()}>Enable</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Notifications</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest font-black">How we keep you updated</p>
              </div>

              <div className="space-y-2">
                {[
                  { id: "updates", label: "Product Updates", desc: "News about new AI features and tools" },
                  { id: "credits", label: "Credit Alerts", desc: "Notify when balance is running low" },
                  { id: "marketing", label: "Marketing", desc: "Special offers and restoration tips" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/3 border border-white/5">
                    <div>
                      <h4 className="text-sm font-bold text-white">{item.label}</h4>
                      <p className="text-[11px] text-text-muted">{item.desc}</p>
                    </div>
                    <div 
                      onClick={() => toggleNotification(item.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${notifications[item.id] ? 'bg-accent' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${notifications[item.id] ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="text-xl font-black text-white mb-1">Subscription & Plan</h3>
                <p className="text-xs text-text-muted uppercase tracking-widest font-black">Manage your membership</p>
              </div>

              <div className="p-8 rounded-4xl bg-linear-to-br from-accent/20 to-indigo-500/10 border border-accent/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Zap className="h-24 w-24 text-accent" />
                </div>
                <div className="relative z-10">
                  <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-black uppercase tracking-widest mb-4 inline-block">
                    Current Plan
                  </span>
                  <h4 className="text-3xl font-black text-white mb-2 capitalize">{currentPlan} Plan</h4>
                  <p className="text-sm text-text-muted mb-8 max-w-xs">
                    {currentPlan === 'free' 
                      ? "Get more power with a Pro plan including unlimited 4K exports and priority processing."
                      : "You're enjoying full access to all AI features and priority servers."}
                  </p>
                  
                  {currentPlan === 'free' ? (
                    <Link href="/pricing">
                      <Button className="btn-primary h-12 px-8 rounded-full font-bold uppercase tracking-widest text-xs shadow-xl shadow-accent/20">
                        Upgrade to Pro
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="h-12 px-8 rounded-full font-bold uppercase tracking-widest text-xs bg-white/5">
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
