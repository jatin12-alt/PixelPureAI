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

const sora = Sora({ 
  subsets: ["latin"], 
  variable: "--font-sora",
  weight: ['400', '600', '700', '800']
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dm",
  weight: ['400', '500', '700']
});

export const metadata = {
  title: "PixelPureAI",
  description: "Professional image editing powered by AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-text.png" sizes="any" />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} font-dm`}>
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
                <FloatingShapes />
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
