import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinanceAI - AI Personal Finance Assistant",
  description: "Conversational personal finance tracker backed by deep intelligence. Record income, expenses, and splits by talking naturally to our AI assistant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090B] text-[#FAFAFA] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
