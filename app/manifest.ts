import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PROVya — Evidence, Organized",
    short_name: "PROVya",
    description: "Organize messages, photos, documents, dates, and reviewed transcriptions into a clear private record.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f8f5ed",
    theme_color: "#17171d",
    categories: ["productivity", "utilities", "business"],
    icons: [
      { src: "/brand/provya-logo-v2.png", sizes: "any", type: "image/png", purpose: "any" },
      { src: "/brand/provya-logo-v2.png", sizes: "any", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Open my records", short_name: "My records", url: "/demo?source=pwa-shortcut", icons: [{ src: "/brand/provya-logo-v2.png", sizes: "any", type: "image/png" }] },
      { name: "Start a record", short_name: "New record", url: "/demo?new=matter&source=pwa-shortcut", icons: [{ src: "/brand/provya-logo-v2.png", sizes: "any", type: "image/png" }] },
    ],
  };
}
