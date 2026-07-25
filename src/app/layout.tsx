import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Outfit } from "next/font/google";
import { ThemeBootstrap } from "@/components/shell/ThemeBootstrap";
import { sharePreviewMetadata } from "@/lib/seo/share-preview";
import "./globals.css";

const normaSans = DM_Sans({
  variable: "--font-norma-sans",
  subsets: ["latin"],
  display: "swap",
});

const normaDisplay = Outfit({
  variable: "--font-norma-display",
  subsets: ["latin"],
  display: "swap",
});

const normaMono = IBM_Plex_Mono({
  variable: "--font-norma-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const baseShare = sharePreviewMetadata({
  title: "Acme Org Chart",
  description:
    "Explore Acme reporting lines, people, and data health in one workspace connected to Remote.",
});

export const metadata: Metadata = {
  ...baseShare,
  title: {
    default: "Acme Org Chart",
    template: "%s · Acme",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${normaSans.variable} ${normaDisplay.variable} ${normaMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-norma-canvas text-norma-ink">
        <ThemeBootstrap />
        {children}
      </body>
    </html>
  );
}
