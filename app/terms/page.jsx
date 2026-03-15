"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-dm pb-20 pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Go Back</span>
        </button>

        <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-4">
          Terms of Service
        </h1>
        <p className="text-text-muted text-sm font-bold mb-12 uppercase tracking-widest">
          Last updated: March 2026
        </p>

        <div className="space-y-12 leading-relaxed text-text-muted">
          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using PixelPureAI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              PixelPureAI provides AI-powered photo enhancement and restoration tools. We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and any activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">4. Content & Ownership</h2>
            <p>
              You retain all ownership rights to the images you upload. By using our service, you grant PixelPureAI a limited license to process your images for the purpose of providing the service. We do not use your images for AI training without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">5. Prohibited Conduct</h2>
            <p>
              You agree not to use the service for any illegal or unauthorized purpose, including uploading harmful, offensive, or infringing content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">6. Payment & Refunds</h2>
            <p>
              Credits are purchased through Razorpay. All sales are final, but we may offer refunds in exceptional cases at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">7. Limitation of Liability</h2>
            <p>
              PixelPureAI is provided "as is" without any warranties. We are not liable for any damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which PixelPureAI operates.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
