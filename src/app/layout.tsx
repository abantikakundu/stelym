import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WalletButton } from "@/components/WalletButton";
import { AppProviders } from "@/providers/AppProviders";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stelym",
  description: "Tip project owners with XLM on Stellar Soroban",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        className={`${geistSans.variable} ${geistMono.variable} min-h-[100dvh] text-ink antialiased`}
      >
        <AppProviders>
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
            <header className="nb-card flex flex-col gap-4 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <Link href="/" className="group flex items-center gap-3">
                <span className="flex size-12 items-center justify-center overflow-hidden border-[3px] border-ink bg-white p-1 shadow-[3px_3px_0_0_#111111] transition-transform duration-150 group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0_0_#111111] dark:shadow-[3px_3px_0_0_#000000]">
                  <Image
                    src="/logo.png"
                    alt="Stelym logo"
                    width={44}
                    height={44}
                    priority
                    className="size-full object-contain"
                  />
                </span>
                <span>
                  <span className="nb-chip bg-mint text-white">On-chain tips</span>
                  <span className="mt-1 block text-2xl font-black uppercase tracking-tight">
                    Stelym
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <WalletButton />
              </div>
            </header>
            <main className="py-8">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
