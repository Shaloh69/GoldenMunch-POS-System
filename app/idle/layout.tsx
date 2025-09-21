import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "../providers";
import { fontVariables } from "@/config/fonts";

export const metadata: Metadata = {
  title: "Golden Munch - Interactive Kiosk",
  description: "Touch anywhere to start your Golden Munch order",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0B1426" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1426" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function IdleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en" className={fontVariables}>
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              -webkit-touch-callout: none;
              -webkit-user-select: none;
              -khtml-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              height: 100vh;
              overflow: hidden;
              background: #0B1426;
            }
          `
        }} />
      </head>
      <body
        className={clsx(
          "h-screen w-screen bg-gray-900 overflow-hidden font-sans antialiased",
          fontVariables
        )}
      >
        <Providers themeProps={{ 
          attribute: "class", 
          defaultTheme: "dark",
          enableSystem: false,
          themes: ["dark"]
        }}>
          {children}
        </Providers>
        
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
              });
              
              document.addEventListener('dragstart', function(e) {
                e.preventDefault();
                return false;
              });
              
              // Prevent any scrolling
              document.addEventListener('touchmove', function(e) {
                e.preventDefault();
              }, { passive: false });
              
              document.addEventListener('wheel', function(e) {
                e.preventDefault();
              }, { passive: false });
            `
          }}
        />
      </body>
    </html>
  );
}