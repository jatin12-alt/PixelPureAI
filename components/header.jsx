"use client";

import React from "react";
import { LayoutDashboard, Sparkles, LogIn, Menu, Home, Image as ImageIcon, CreditCard, Info, PlayCircle } from "lucide-react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { useStoreUser } from "@/hooks/use-store-user";
import { BarLoader } from "react-spinners";
import { Authenticated, Unauthenticated } from "convex/react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "./ui/sheet";
import { useCredits } from "@/hooks/use-credits";
import { CreditDetailsModal } from "./credit-details-modal";

export default function Header() {
  const [isCreditsModalOpen, setIsCreditsModalOpen] = React.useState(false);
  const { isLoading: isUserLoading } = useStoreUser();
  const { balance: creditBalance, isLoading: isCreditsLoading } = useCredits();
  const path = usePathname();

  // Hide header on editor pages - logic preserved for cleanup later
  if (path.includes("/studio")) {
    return null; 
  }

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, authOnly: true },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "About", href: "/about", icon: Info },
    { label: "Demo", href: "/demo", icon: PlayCircle },
  ];

  const activeStyle = "text-accent font-semibold";
  const inactiveStyle = "text-text-muted hover:text-text-primary";

  // Logic preserved ✓ | UI updated ✓
  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080F]/80 backdrop-blur-[20px] border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group transition-all duration-300">
          <Sparkles className="h-5 w-5 text-accent group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-lg font-display font-bold text-text-primary tracking-tight">PixelPure</span>
        </Link>

        {/* Navigation Links - Desktop Only */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((link) => (
            <React.Fragment key={link.href}>
              <Authenticated key={`auth-${link.href}`}>
                <Link 
                  href={link.href} 
                  className={`text-[14px] transition-all ${path === link.href ? activeStyle : inactiveStyle}`}
                >
                  {link.label}
                </Link>
              </Authenticated>
              {!link.authOnly && (
                <Unauthenticated key={`unauth-${link.href}`}>
                  <Link 
                    href={link.href} 
                    className={`text-[14px] transition-all ${path === link.href ? activeStyle : inactiveStyle}`}
                  >
                    {link.label}
                  </Link>
                </Unauthenticated>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Auth Actions & Mobile Menu */}
        <div className="flex items-center gap-4">
          <Authenticated>
            <div 
              className="hidden sm:flex items-center gap-3 mr-2 cursor-pointer hover:scale-105 transition-all"
              onClick={() => setIsCreditsModalOpen(true)}
            >
              <div className="bg-bg-tertiary border border-border rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="text-lg leading-none">🪙</span>
                <span className="text-[13px] font-bold text-text-primary">
                  {isCreditsLoading ? "..." : creditBalance}
                </span>
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Credits</span>
              </div>
            </div>

            <CreditDetailsModal 
              isOpen={isCreditsModalOpen} 
              onClose={() => setIsCreditsModalOpen(false)} 
            />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-[34px] h-[34px] rounded-full border border-border hover:border-accent transition-all",
                  userButtonPopoverCard: "shadow-2xl bg-bg-secondary border border-border rounded-2xl",
                },
              }}
              afterSignOutUrl="/"
            />
          </Authenticated>

          <Unauthenticated>
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <Button variant="ghost" className="text-text-muted hover:text-text-primary text-xs font-bold uppercase tracking-widest">
                  Sign In
                </Button>
              </SignInButton>
              <Link href="/studio">
                <Button className="btn-primary h-10 px-6 text-xs font-bold uppercase tracking-widest rounded-full">
                  Try Free
                </Button>
              </Link>
            </div>
          </Unauthenticated>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-text-muted">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#0A0A14]/95 backdrop-blur-2xl border-r border-white/10 p-0 flex flex-col h-full w-[300px] shadow-2xl">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <div className="p-8 border-b border-white/5">
                  <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/20">
                      <Sparkles className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-xl font-display font-black text-white tracking-tighter">PixelPure</span>
                  </Link>
                </div>

                <nav className="flex-1 flex flex-col py-8 px-4 gap-2">
                  {navLinks.map((link) => (
                    <React.Fragment key={`mobile-${link.href}`}>
                      <Authenticated key={`mobile-auth-${link.href}`}>
                        <Link 
                          href={link.href} 
                          className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${path === link.href ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:bg-white/5 hover:text-white"}`}
                        >
                          <link.icon className={`h-5 w-5 ${path === link.href ? "text-white" : "text-accent/60"}`} />
                          {link.label}
                        </Link>
                      </Authenticated>
                      {!link.authOnly && (
                        <Unauthenticated key={`mobile-unauth-${link.href}`}>
                          <Link 
                            href={link.href} 
                            className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-base font-bold transition-all duration-300 ${path === link.href ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-text-muted hover:bg-white/5 hover:text-white"}`}
                          >
                            <link.icon className={`h-5 w-5 ${path === link.href ? "text-white" : "text-accent/60"}`} />
                            {link.label}
                          </Link>
                        </Unauthenticated>
                      )}
                    </React.Fragment>
                  ))}
                </nav>

                <div className="p-8 border-t border-white/5 bg-white/2">
                  <Unauthenticated>
                    <SignInButton mode="modal">
                      <Button className="w-full btn-primary h-14 font-bold uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-accent/20">
                        Sign In to Get Started
                      </Button>
                    </SignInButton>
                  </Unauthenticated>
                  <Authenticated>
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="flex items-center gap-4">
                        <UserButton 
                          appearance={{
                            elements: {
                              userButtonAvatarBox: "w-10 h-10"
                            }
                          }}
                          afterSignOutUrl="/" 
                        />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-white">My Account</span>
                          <span className="text-[10px] text-text-muted uppercase tracking-widest font-black">Pro Plan</span>
                        </div>
                      </div>
                      <div 
                        className="bg-accent/20 border border-accent/30 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-inner cursor-pointer"
                        onClick={() => {
                          setIsCreditsModalOpen(true);
                        }}
                      >
                        <span className="text-xs">🪙</span>
                        <span className="text-xs font-black text-white">{creditBalance}</span>
                      </div>
                    </div>
                  </Authenticated>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {isUserLoading && (
        <div className="absolute bottom-0 left-0 w-full">
          <BarLoader width="100%" color="var(--accent)" height={2} />
        </div>
      )}
    </header>
  );
}
