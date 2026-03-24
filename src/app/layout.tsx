import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navigation, Footer } from "./page";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vista | Complete Travel Platform",
  description: "Curated experiences for the modern explorer. From Zambia to the world. Book flights, tours, and explore amazing destinations.",
  keywords: ["Vista", "Travel", "Flights", "Tours", "Zambia", "Safari", "Vacation"],
  authors: [{ name: "Vista Travel" }],
  icons: {
    icon: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=32&q=80",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${playfair.variable} font-sans antialiased bg-stone-50 text-stone-800`}
      >
        <Navigation />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
