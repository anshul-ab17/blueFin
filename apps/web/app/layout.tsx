import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import AuthModal from "@/components/auth-modal";
import Toast from "@/components/toast";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Bluefin — Predict the Future. Trade with Confidence.",
  description:
    "Bluefin is a decentralized football prediction exchange powered by real-time TxLINE data and trustless Solana settlement.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-abyss text-fg">
        <Nav />
        <main className="flex-1">{children}</main>
        <AuthModal />
        <Toast />
      </body>
    </html>
  );
}
