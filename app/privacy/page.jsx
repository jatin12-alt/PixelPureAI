import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Privacy Policy | PixelPureAI",
  description: "Learn how PixelPureAI collects, uses, and protects your personal information and image data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-dm pb-20 pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Home</span>
        </Link>

        <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-text-muted text-sm font-bold mb-12 uppercase tracking-widest">
          Last updated: March 2026
        </p>

        <div className="space-y-12 leading-relaxed text-text-muted">
          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">1. Introduction</h2>
            <p>
              PixelPureAI is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered photo enhancement platform. By accessing or using our services, you agree to the practices described in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">2. Information We Collect</h2>
            <p>
              We collect information necessary to provide and improve our services. This includes your account information such as your name and email address provided through Clerk, our authentication partner. We also store uploaded images temporarily on ImageKit CDN to perform AI transformations. Additionally, we track your usage data, including credits and project history, using Convex to ensure a personalized experience. Payment information is processed securely by Razorpay, and we do not store your credit card or banking details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p>
              Your information is used primarily to provide AI enhancement services and manage your account balance. We use your data to process payments via Razorpay, maintain your project library, and offer customer support. PixelPureAI does not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">4. Image Data & Privacy</h2>
            <p>
              Images you upload are stored on ImageKit CDN and are used solely for the purpose of applying AI transformations you request. You maintain full ownership of your images and can delete your projects at any time, which will remove them from our active storage. We do not use your private images to train our AI models or for any purpose other than providing the enhancement service to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">5. Third-Party Services</h2>
            <p>
              To provide a seamless experience, we integrate with trusted third-party services. These include Clerk for secure authentication, ImageKit for high-speed image delivery and CDN services, Convex for real-time database management, and Razorpay for secure payment processing. Each of these services has its own privacy policy governing the data they handle.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">6. Data Retention</h2>
            <p>
              For free accounts, we retain data for up to 90 days of inactivity, after which your projects and associated data may be deleted. For Pro accounts, your data is retained as long as your subscription remains active, allowing you to access your project history at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">7. Your Rights</h2>
            <p>
              You have the right to access the personal data we hold about you and request its deletion. You can delete your account and all associated data through your profile settings. Additionally, you have the right to export your projects and data at any time before deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-display font-bold text-white mb-4">8. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please reach out to the PixelPureAI team at <a href="mailto:PixelPureAI@image.com" className="text-accent hover:underline">PixelPureAI@image.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
