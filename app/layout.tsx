import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "ЄС 12/18 — Читання Біблії",
  description: "Щоденний план читання Біблії для підлітків",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ЄС Біблія",
    startupImage: "/icon-512.png",
  },
  icons: {
    apple: "/icon-192.png",
    icon: "/icon-512.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a1f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
