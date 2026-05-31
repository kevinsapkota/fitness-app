import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import NavigationLoader from "@/app/dashboard/components/NavigationLoader";

export const metadata: Metadata = {
  title: "StreetViz | Reportar problemas na rua em Portugal",
  description:
    "Plataforma colaborativa para reportar buracos na estrada, passeios danificados e problemas urbanos em Portugal. Vê e adiciona ocorrências em tempo real.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "StreetViz",
    description: "Reporta buracos na estrada e problemas urbanos em Portugal.",
    url: "https://streetviz.vercel.app",
    siteName: "StreetViz",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <Suspense fallback={null}>
          <NavigationLoader>
            {children}
          </NavigationLoader>
        </Suspense>

        {/* Google Search Console Verification */}
        <meta
          name="google-site-verification"
          content="gai7vNpgeF_KrDeWOg9yU8YoB5XMe-aNRluR99Lkelw"
        />
      </body>
    </html>
  );
}