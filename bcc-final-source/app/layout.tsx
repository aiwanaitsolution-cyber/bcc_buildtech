import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCC Buildtech Limited | Paving Paths to Progress",
  description: "BCC Buildtech Limited delivers highways, bridges and strategic road infrastructure through EPC and HAM capabilities.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  metadataBase: new URL("https://bcc-buildtech-corporate.shankranandsarswati8.chatgpt.site"),
  openGraph: { title: "BCC Buildtech Limited", description: "Highways, bridges and strategic road infrastructure through EPC and HAM capabilities.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0b1315",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html: "try{if(sessionStorage.getItem('bcc-intro'))document.documentElement.setAttribute('data-intro-seen','')}catch(e){}"}} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Root layout covers every route, so the Pages-Router font rule does not apply. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@500;600;700&display=swap" />
        <link rel="preload" as="image" href="/bcc/acc.jpg" />
      </head>
      <body className="antialiased">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:"BCC Buildtech Limited",url:"https://bcc-buildtech.com",email:"info@bcc-buildtech.com",telephone:"0124-6571500",address:{"@type":"PostalAddress",streetAddress:"Unit No. 1146–1148, JMD Megapolis, Sector 48",addressLocality:"Gurugram",addressRegion:"Haryana",postalCode:"122018",addressCountry:"IN"},sameAs:["https://in.linkedin.com/company/bcc-buildtech-gurugram-haryana"]})}} /></body>
    </html>
  );
}
