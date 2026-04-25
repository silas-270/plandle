import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://plandle.vercel.app"),
  title: {
    default: "Plandle | The Aircraft Guessing Game",
    template: "%s | Plandle",
  },
  description: "The ultimate daily aircraft guessing game. Identify planes from photos, earn miles, and master aviation. Play Daily, Endless, or Trivia modes.",
  keywords: [
    "aviation game",
    "aircraft guessing game",
    "planespotting game",
    "avgeek trivia",
    "wordle for planes",
    "airline quiz",
    "aircraft identification",
    "plandle",
    "flight game"
  ],
  authors: [{ name: "Plandle Team" }],
  creator: "Silas",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Plandle | The Aircraft Guessing Game",
    description: "How well do you know your planes? Guess the aircraft from photos, build your streak, and earn miles.",
    type: "website",
    siteName: "Plandle",
    locale: "en_US",
    url: "https://plandle.vercel.app",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Plandle - The Aircraft Guessing Game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plandle | The Aircraft Guessing Game",
    description: "The ultimate daily game for aviation enthusiasts. Identify aircraft and build your streak!",
    creator: "@plandle_app",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    title: "Plandle",
    statusBarStyle: "default",
    capable: true,
  },
};

export const viewport = {
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
