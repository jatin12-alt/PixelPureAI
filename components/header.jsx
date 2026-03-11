"use client";

import React from "react";
import { LayoutDashboard, Sparkles, LogIn, Menu } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useStoreUser } from "@/hooks/use-store-user";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export default function Header() {
  const { isLoading } = useStoreUser();
  const path = usePathname();

  if (path.includes("/editor") || path.includes("/studio")) {
    return null; // Hide header on editor and studio pages
  }

  return (
    <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-full px-6 md:px-10 py-4 flex items-center justify-between shadow-2xl shadow-indigo-500/10">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-all duration-300">
          <div className="flex items-center">
            <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent tracking-tight">PixelPureAI</span>
          </div>
          <Sparkles className="h-6 w-6 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
        </Link>

        {/* Navigation Links - Desktop Only */}
        <nav className="hidden lg:flex items-center space-x-10">
          <Link href="/demo" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-all">Watch Demo</Link>
          <Link href="#pricing" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-all">Pricing</Link>
          <Link href="#testimonials" className="text-sm font-bold text-slate-400 hover:text-white uppercase tracking-widest transition-all">Reviews</Link>
        </nav>

        {/* Auth Actions & Mobile Menu */}
        <div className="flex items-center gap-6">
          <Authenticated>
            <Link href="/studio">
              <Button variant="glass" className="hidden sm:flex rounded-full px-8 h-11 border-white/10 hover:bg-white/10 font-bold uppercase tracking-widest text-xs">
                Open Studio
              </Button>
            </Link>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-11 h-11 rounded-full border-2 border-indigo-500/30",
                  userButtonPopoverCard: "shadow-2xl bg-slate-950 border border-white/10 rounded-3xl",
                },
              }}
              afterSignOutUrl="/"
            />
          </Authenticated>

          <Unauthenticated>
            <div className="flex items-center gap-4">
              <Link href="/studio">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full px-10 h-12 shadow-xl shadow-indigo-600/20 border-none transition-all duration-300 hover:scale-105 font-bold uppercase tracking-widest text-xs">
                  Try PixelPureAI
                </Button>
              </Link>
            </div>
          </Unauthenticated>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="bg-slate-950/80 backdrop-blur-xl border-white/10">
                <nav className="flex flex-col items-center space-y-6 pt-12">
                  <Link href="/demo" className="text-lg font-bold text-slate-300 hover:text-white transition-all">Watch Demo</Link>
                  <Link href="#pricing" className="text-lg font-bold text-slate-300 hover:text-white transition-all">Pricing</Link>
                  <Link href="#testimonials" className="text-lg font-bold text-slate-300 hover:text-white transition-all">Reviews</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

        {isLoading && (
          <div className="fixed bottom-0 left-0 w-full z-40 flex justify-center">
            <BarLoader width={"95%"} color="#06b6d4" />
          </div>
        )}
      </header>
  );
}
