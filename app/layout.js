import { Sora, DM_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import { FloatingShapes } from "@/components/floating-shapes";
import { Toaster } from "sonner";
import Script from "next/script";

const sora = Sora({ 
  subsets: ["latin"], 
  variable: "--font-sora",
  weight: ['400', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dm",
  weight: ['400', '500', '700'],
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL("https://pixelpureai.com"),
  title: "PixelPureAI | Professional AI Photo Restoration & Enhancement",
  description: "Transform blurry, old, or low-quality photos into stunning HD masterpieces with AI magic. PixelPureAI offers AI enhancement, upscaling, background removal, and more.",
  keywords: ["AI photo restoration", "image upscaler", "background removal", "AI image editor", "photo enhancement"],
  authors: [{ name: "PixelPureAI Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PixelPureAI",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "PixelPureAI | AI-Powered Photo Magic",
    description: "The most powerful photo restoration tool for everyone. Restore your memories in seconds.",
    url: "https://pixelpureai.com",
    siteName: "PixelPureAI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PixelPureAI Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixelPureAI | AI Photo Restoration",
    description: "Professional photo enhancement in one click.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-text.png" sizes="any" />
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} font-dm`}>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              baseTheme: shadesOfPurple,
            }}
          >
            <ConvexClientProvider>
              <Header />
              <main className="bg-bg-primary min-h-screen text-text-primary overflow-x-hidden">
                <Toaster richColors />

                {children}
                <Footer />
              </main>
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
