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
  title: "Plandle | The Aircraft Guessing Game",
  description: "Identify aircraft from photos, earn miles, and master aviation. Play Daily, Endless, or Trivia modes to build your streak and become an aviation expert.",
  keywords: ["aviation", "aircraft", "plane", "game", "plandle", "wordle", "airline", "trivia"],
  authors: [{ name: "Plandle Team" }],
  openGraph: {
    title: "Plandle | The Aircraft Guessing Game",
    description: "Identify aircraft from photos, earn miles, and master aviation. Play Daily, Endless, or Trivia modes.",
    type: "website",
    siteName: "Plandle",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plandle | The Aircraft Guessing Game",
    description: "Identify aircraft from photos, earn miles, and master aviation.",
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
