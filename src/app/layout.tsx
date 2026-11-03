import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sudoku Oyunu",
  description: "Modern, mobil uyumlu Sudoku — kolay, orta, zor, günlük bulmaca.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Sudoku",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0d9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0f766e" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${nunito.variable} ${fredoka.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full font-sans">
        <ThemeProvider>
          <RegisterSW />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
