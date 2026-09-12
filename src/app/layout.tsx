import type { Metadata, Viewport } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spectral = Spectral({ weight: ["400"], style: ["normal", "italic"], subsets: ["latin"], variable: "--font-spectral", display: "swap" });

const SITE_URL = "https://payup.uptopsearch.com";
const TITLE = "Pay Up — Compensation intelligence by Up Top Search";
const DESCRIPTION =
  "Employer-posted AI pay ranges with source links, Up Top's crypto compensation model, and package math that keeps base, bonus, sign-on, equity, and token value separate. For frontier and deep-tech hiring.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Pay Up",
  keywords: ["AI compensation", "crypto compensation", "salary benchmarks", "forward deployed engineer pay", "Up Top Search"],
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Up Top Search",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, site: "@UpTopSearch" },
};

export const viewport: Viewport = { themeColor: "#12110F", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${spectral.variable} antialiased`}>
      <body className="bg-bg text-fg">{children}</body>
    </html>
  );
}
