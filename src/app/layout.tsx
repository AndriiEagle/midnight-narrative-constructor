import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Inter, Cormorant_Garamond } from "next/font/google";

import { BleedingUIProvider } from "@/providers/bleeding-ui-provider";

import "@/styles/bleeding-ui.css";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Midnight Narrative Constructor",
  description: "A psychological visual novel engine. The UI bleeds with the story.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="bg-background text-foreground antialiased font-sans">
        <BleedingUIProvider>{children}</BleedingUIProvider>
      </body>
    </html>
  );
}
