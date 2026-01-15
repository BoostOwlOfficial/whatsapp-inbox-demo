import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/auth-context";
import { WhatsAppStatusProvider } from "@/lib/whatsapp-status-context";
import { MessagesProvider } from "@/lib/messages-context";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WhatsApp Business - Messaging Platform",
  description: "Send and receive WhatsApp messages for your business",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* Facebook SDK for WhatsApp Embedded Signup */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.fbAsyncInit = function() {
                FB.init({
                  appId: '2074250006740949',
                  autoLogAppEvents: true,
                  xfbml: true,
                  version: 'v24.0'
                });
              };

              // Load the JavaScript SDK asynchronously
              (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) return;
                js = d.createElement(s); js.id = id;
                js.src = "https://connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
              }(document, 'script', 'facebook-jssdk'));
            `,
          }}
        />

        <AuthProvider>
          <WhatsAppStatusProvider>
            <MessagesProvider>
              {children}
              <Analytics />
              <Toaster />
            </MessagesProvider>
          </WhatsAppStatusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
