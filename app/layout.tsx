import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ChatProvider } from "@/lib/chat-store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "0G Private Chat",
  description: "A decentralized, privacy-preserving AI chatbot powered by 0G.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[var(--color-bg-primary)] antialiased">
        <ChatProvider>{children}</ChatProvider>
      </body>
    </html>
  );
}
