import type { Metadata } from "next";
import BottomNav from "./components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Velvet Society",
  description: "Barter-Deals zwischen lokalen Marken und Creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,900;1,9..144,600&family=JetBrains+Mono:wght@400;600&family=Geist:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <BottomNav />
      </body>
    </html>
  );
}