import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import DevThemeToggler from "./components/DevThemeToggler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "UniAGORA",
  description: "Verified student marketplace",
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-WGM6169SY8"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-WGM6169SY8');
        `}
      </Script>
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
        <DevThemeToggler />
      </body>
    </html>
  );
}
