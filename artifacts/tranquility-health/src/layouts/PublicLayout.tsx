/**
 * PublicLayout — wraps all public-facing marketing pages.
 *
 * Renders the public Navbar at the top and Footer at the bottom.
 * Content is rendered between these two elements.
 *
 * Future phases may add announcement banners, cookie consent, etc.
 */

import { ReactNode } from "react";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
