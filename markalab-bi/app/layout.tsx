import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Proveedor } from "@/lib/store";
import { Shell } from "@/components/shell";

export const metadata: Metadata = {
  title: "MarkaLab BI · Planeación y ejecución de canal",
  description:
    "Plataforma de inteligencia comercial y planeación integrada para marcas que venden a través de canal departamental.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
      </head>
      <body>
        <Proveedor>
          <Shell>{children}</Shell>
        </Proveedor>
      </body>
    </html>
  );
}
