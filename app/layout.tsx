import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export const metadata: Metadata = {
  title: "THRIYON — An operating system for elite creative work",
  description:
    "Invite-only freelance platform for the world's most ambitious creative practitioners. Cinematic. Sovereign. Quietly powerful.",
  authors: [{ name: "Thriyon Systems" }],
  openGraph: {
    title: "THRIYON — Sovereign creative work",
    description:
      "An operating system for elite freelancers, studios and clients.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <SmoothScroll />
          <div className="relative min-h-screen overflow-x-clip">
            <Header />
            <main className="relative">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
