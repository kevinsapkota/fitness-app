import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StreetViz",
  description: "Collaborative urban map platform",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="gai7vNpgeF_KrDeWOg9yU8YoB5XMe-aNRluR99Lkelw"
        />
      </head>

      <body>{children}</body>
    </html>
  );
}