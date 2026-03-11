import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "../components/layout/ConditionalLayout";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "M. Sean Agnew | Speaker, Consultant, Veteran",
  description:
    "M. Sean Agnew is a speaker, consultant, and veteran helping leaders build clarity, confidence, and execution momentum.",
  metadataBase: new URL("https://seanagnew.com"),
  openGraph: {
    title: "M. Sean Agnew | Speaker, Consultant, Veteran",
    description:
      "Book M. Sean Agnew for keynotes, consulting, and leadership engagements. Download the media kit and explore The Right Fit? assessment.",
    url: "https://seanagnew.com",
    siteName: "M. Sean Agnew",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "M. Sean Agnew",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "M. Sean Agnew | Speaker, Consultant, Veteran",
    description:
      "Leadership clarity, confidence, and execution for modern organizations.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://seanagnew.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${outfit.variable}`} lang="en">
      <body>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
