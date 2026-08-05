import type { Metadata } from "next";
import { Archivo_Black, DM_Sans } from "next/font/google";
import { headers } from "next/headers";
import type { Viewport } from "next";
import "./globals.css";
import InstallPrompt from "./install-prompt";

const display = Archivo_Black({ weight: "400", variable: "--font-display", subsets: ["latin"] });
const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });

export const viewport: Viewport = { themeColor: "#17171d", width: "device-width", initialScale: 1, viewportFit: "cover" };

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const description = "Turn messages, photos, documents, and dates into one source-preserving evidence packet with PROVya, a Tek-Pak Inc. product.";
  return {
    metadataBase: base,
    title: "PROVya — Evidence, Organized",
    description,
    applicationName: "PROVya",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "PROVya", statusBarStyle: "black-translucent" },
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }, { url: "/brand/provya-logo-v2.png", type: "image/png" }], apple: [{ url: "/brand/provya-logo-v2.png", type: "image/png" }] },
    openGraph: { title: "PROVya — Evidence, Organized", description, type: "website", images: [{ url: new URL("/og.png", base).toString(), width: 1200, height: 630, alt: "PROVya — Evidence, organized" }] },
    twitter: { card: "summary_large_image", title: "PROVya — Evidence, Organized", description, images: [new URL("/og.png", base).toString()] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${display.variable} ${sans.variable}`}>{children}<InstallPrompt /></body></html>;
}
