import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/site-url";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { AccentCycle } from "@/components/accent-cycle";
import { SmoothScroll } from "@/components/smooth-scroll";
import { CustomCursor } from "@/components/ui/custom-cursor";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400"],
});

const description =
  "Machine learning engineer in Karachi. Final-year CS (AI) at NED University. Retrieval systems, supervised learning pipelines and the APIs around them, with live demos and the numbers.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Shaikh Muhammad Zain, machine learning engineer",
  description,
  keywords: ["Shaikh Muhammad Zain", "machine learning engineer", "RAG", "FAISS", "Karachi", "NED University", "portfolio"],
  authors: [{ name: "Shaikh Muhammad Zain", url: "https://github.com/ZainDev04" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: "Shaikh Muhammad Zain",
    title: "Shaikh Muhammad Zain, machine learning engineer",
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shaikh Muhammad Zain, machine learning engineer",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#101010",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <body>
        <SmoothScroll />
        <AccentCycle />
        <CustomCursor />
        {children}
      </body>
    </html>
  );
}
