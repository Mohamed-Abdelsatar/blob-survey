import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Blob Survey — Surveys that don't suck",
  description: "The anti-Google Forms. Memes, reactions, and funny quotes make your survey something people actually enjoy filling out.",
  openGraph: {
    title: "Blob Survey — Surveys that don't suck",
    description: "Memes. Reactions. Live results. Give your audience a survey they'll actually enjoy.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Blob Survey — Surveys that don't suck",
    description: "The anti-Google Forms. Memes, reactions, and funny quotes.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} min-h-screen bg-gray-50`}>{children}</body>
    </html>
  );
}
