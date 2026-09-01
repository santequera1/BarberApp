import type { Metadata, Viewport } from "next";
import { Archivo, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://barber.wailus.co"),
  title: "BarberApp — App de Barberías & Agendamiento Express",
  description:
    "Agenda tu corte en segundos sin filas ni esperas. Pases QR digitales, fotos de cortes y gestión completa de barberías.",
  manifest: "/manifest.json",
  applicationName: "BarberApp",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BarberApp",
  },
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "BarberApp — App de Barberías & Agendamiento Express",
    description:
      "Agenda tu corte en segundos sin filas ni esperas. Pases QR digitales, fotos de cortes y gestión completa de barberías.",
    url: "https://barber.wailus.co",
    siteName: "BarberApp",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 1200,
        alt: "BarberApp Logo",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BarberApp — App de Barberías & Agendamiento Express",
    description:
      "Agenda tu corte en segundos sin filas ni esperas. Pases QR digitales, fotos de cortes y gestión de barberías.",
    images: ["/logo.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

const swScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').catch(function() {});
  });
}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-CO" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: swScript }} />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'){document.documentElement.classList.add('light');document.documentElement.classList.remove('dark');}else{document.documentElement.classList.add('dark');document.documentElement.classList.remove('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${archivo.variable} ${interTight.variable} ${jetbrains.variable} min-h-dvh antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
