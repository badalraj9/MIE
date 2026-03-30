import type { Metadata } from "next";
import { Tenor_Sans, DM_Serif_Display, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const tenorSans = Tenor_Sans({
  variable: "--font-century",
  weight: "400",
  subsets: ["latin"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIE - Wharton Case Studies",
  description: "Case-based learning and strategic analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${tenorSans.variable} ${sourceSans.variable} ${dmSerif.variable}`}
    >
      <body className="min-h-full bg-surface font-sans text-foreground antialiased selection:bg-primary/15 selection:text-primary">
        <div className="noise-overlay" aria-hidden="true" />
        <div className="vignette" aria-hidden="true" />
        <div className="relative min-h-screen">
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/3 blur-[120px]" />
            <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-chart-2/5 blur-[100px]" />
            <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-chart-1/4 blur-[80px]" />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}