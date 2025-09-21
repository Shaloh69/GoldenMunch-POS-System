import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { siteConfig } from "@/config/site";
import { fontVariables } from "@/config/fonts";
import { KioskNavbar } from "@/components/kiosk-navbar";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "kiosk",
    "bakery", 
    "golden munch",
    "ordering system",
    "touch screen",
    "cakes",
    "pastries",
    "coffee"
  ],
  authors: [
    {
      name: "Golden Munch Team",
      url: "https://goldenmunch.com",
    },
  ],
  creator: "Golden Munch",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://goldenmunch.com",
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@goldenmunch",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF8F0" },
    { media: "(prefers-color-scheme: dark)", color: "#4B2E2E" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Disable zoom for kiosk use
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className={fontVariables}>
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/poppins-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* Disable pull-to-refresh on mobile */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Prevent context menu and text selection for kiosk */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Allow selection for specific elements */
            .selectable,
            input,
            textarea {
              -webkit-user-select: text;
              -moz-user-select: text;
              -ms-user-select: text;
              user-select: text;
            }
          `
        }} />
      </head>
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background antialiased",
          "bg-gradient-to-br from-cream-white to-caramel-beige",
          "font-sans font-display", // Use display font for better kiosk readability
          "overflow-x-hidden", // Prevent horizontal scroll
          "touch-manipulation" // Optimize touch interactions
        )}
      >
        <Providers themeProps={{ 
          attribute: "class", 
          defaultTheme: "light",
          enableSystem: false, // Disable system theme switching for kiosk
          themes: ["light", "dark"]
        }}>
          <div className="relative flex flex-col min-h-screen">
            {/* Navigation */}
            <KioskNavbar />
            
            {/* Main Content */}
            <main className="flex-grow relative">
              {/* Content container with touch-friendly spacing */}
              <div className="min-h-full">
                {children}
              </div>
            </main>
            
            {/* Footer */}
            <footer className="bg-chocolate-brown text-cream-white py-6 mt-auto">
              <div className="container mx-auto max-w-7xl px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Brand */}
                  <div className="flex items-center gap-3">
                    <span className="text-golden-orange text-3xl">🍰</span>
                    <div>
                      <span className="font-bold text-lg">Golden Munch Kiosk</span>
                      <p className="text-cream-white/80 text-sm">
                        Touch Screen Ordering System
                      </p>
                    </div>
                  </div>
                  
                  {/* Tagline */}
                  <div className="text-center md:text-left">
                    <p className="text-cream-white/90 font-medium">
                      Fresh • Delicious • Made with Love
                    </p>
                    <p className="text-cream-white/70 text-sm">
                      Serving the community since 2020
                    </p>
                  </div>
                  
                  {/* Icons */}
                  <div className="flex gap-4 text-2xl">
                    <span className="animate-float" style={{ animationDelay: '0s' }}>🥐</span>
                    <span className="animate-float" style={{ animationDelay: '0.5s' }}>☕</span>
                    <span className="animate-float" style={{ animationDelay: '1s' }}>🍪</span>
                    <span className="animate-float" style={{ animationDelay: '1.5s' }}>🧁</span>
                  </div>
                </div>
                
                {/* Copyright and Links */}
                <div className="mt-6 pt-4 border-t border-cream-white/20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-cream-white/70">
                    <p>
                      © 2024 Golden Munch. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                      <Link
                        href="/about"
                        className="text-cream-white/70 hover:text-golden-orange transition-colors"
                      >
                        About Us
                      </Link>
                      <span>•</span>
                      <Link
                        href="/help"
                        className="text-cream-white/70 hover:text-golden-orange transition-colors"
                      >
                        Help
                      </Link>
                      <span>•</span>
                      <Link
                        href="/contact"
                        className="text-cream-white/70 hover:text-golden-orange transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          
          {/* Loading indicator for page transitions */}
          <div id="loading-indicator" className="fixed top-0 left-0 w-full h-1 bg-golden-orange/20 z-50 hidden">
            <div className="h-full bg-golden-orange animate-pulse"></div>
          </div>
          
          {/* Touch feedback overlay (invisible but handles touch events) */}
          <div 
            id="touch-feedback"
            className="fixed inset-0 pointer-events-none z-40"
            aria-hidden="true"
          />
        </Providers>
        
        {/* Prevent context menu on right-click/long-press */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
              });
              
              // Prevent drag on images and other elements
              document.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
              });
              
              // Add touch feedback
              document.addEventListener('touchstart', function(e) {
                const overlay = document.getElementById('touch-feedback');
                if (overlay) {
                  const touch = e.touches[0];
                  const ripple = document.createElement('div');
                  ripple.className = 'absolute w-4 h-4 bg-golden-orange/30 rounded-full animate-ping pointer-events-none';
                  ripple.style.left = (touch.clientX - 8) + 'px';
                  ripple.style.top = (touch.clientY - 8) + 'px';
                  overlay.appendChild(ripple);
                  
                  setTimeout(() => {
                    if (ripple.parentNode) {
                      ripple.parentNode.removeChild(ripple);
                    }
                  }, 1000);
                }
              });
            `
          }}
        />
      </body>
    </html>
  );
}