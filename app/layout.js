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

// THIS IS THE PART WE UPDATED
export const metadata = {
  title: "Our Secret Space",
  description: "A private connection for Majd and Maram",
  manifest: "/manifest.json", 
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* These tags help with the PWA "standalone" look on iPhones */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Secret Space" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}