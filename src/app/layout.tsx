import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallPrompt from "@/components/InstallPrompt";
import ChatWidget from "@/components/ChatWidget";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "Travesías AnSup — Descubre Chiloé navegando sobre sus aguas",
  description:
    "Travesías AnSup realiza recorridos y experiencias guiadas sobre tablas SUP en ríos, esteros y sectores naturales de la comuna de Ancud, Chiloé.",
  manifest: "/manifest.webmanifest",
  applicationName: "Travesías AnSup",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Travesías AnSup",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "Travesías AnSup",
    description: "Descubre Chiloé navegando sobre sus aguas.",
    images: ["/images/hero-proa-tabla.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0E3A4C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL">
      <body className="flex min-h-screen flex-col">
        <ServiceWorkerRegister />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallPrompt />
        <ChatWidget />
      </body>
    </html>
  );
}
