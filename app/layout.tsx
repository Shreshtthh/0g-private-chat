import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "0G Private Chat",
  description: "A decentralized, privacy-preserving AI chatbot. Your conversations are encrypted and stored on 0G's decentralized network.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[var(--color-bg-primary)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
