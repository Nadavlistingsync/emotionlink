import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmotionLink",
  description: "An emotion-aware chatbot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>EmotionLink</title>
      </head>
      <body className={inter.className}>
        <Toaster position="top-center" />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
