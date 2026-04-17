import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { PWAInstaller } from "@/components/pwa-installer";

const AppShell = dynamic(() => import("@/components/layout/app-shell").then(m => m.AppShell), {
  ssr: false,
});

const dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Family Life OS",
  description: "Your family's life management super app",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: [
      { url: "/favicon.svg" },
      { url: "/app-icon-1.png", sizes: "441x447" },
      { url: "/app-icon-2.png", sizes: "183x192" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FamilyOS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#5B8A72",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={dmSans.className} suppressHydrationWarning>
        <AppShell>{children}</AppShell>
        <PWAInstaller />
      </body>
    </html>
  );
}
