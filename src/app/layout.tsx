import type { Metadata } from "next";
import { DM_Sans, IBM_Plex_Mono, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Acme Org Chart",
  description:
    "Headless HRIS org chart for Acme Sandbox Corp via the Remote sandbox API.",
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
    >
      <body className="flex min-h-full flex-col bg-norma-canvas text-norma-ink">
        {children}
      </body>
    </html>
  );
}
