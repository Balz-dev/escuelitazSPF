import type { Metadata } from "next";
import "@/components/ui/styles/globals.css";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "EscuelitaZ SPF - Gestión Sociedad de Padres",
  description: "Plataforma para la gestión profesional de Sociedades de Padres de Familia (SPF). Transparencia, comunicación y eficiencia.",
  keywords: ["SPF", "sociedad de padres", "gestión escolar", "educación", "SaaS"],
};

export const dynamic = "force-static";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta name="theme-color" content="#7C3AED" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EscuelitaZ SPF" />
      </head>
      <body suppressHydrationWarning className="antialiased font-sans">
        <AuthGuard>
          <main>{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}

