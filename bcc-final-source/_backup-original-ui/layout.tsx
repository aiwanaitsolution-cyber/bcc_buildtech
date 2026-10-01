import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCC Buildtech Limited | Paving Paths to Progress",
  description: "BCC Buildtech Limited delivers highways, bridges and strategic road infrastructure through EPC and HAM capabilities.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  metadataBase: new URL("https://bcc-buildtech-corporate.shankranandsarswati8.chatgpt.site"),
  openGraph: { title: "BCC Buildtech Limited", description: "Highways, bridges and strategic road infrastructure through EPC and HAM capabilities.", type: "website" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased">{children}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:"BCC Buildtech Limited",url:"https://bcc-buildtech.com",email:"info@bcc-buildtech.com",telephone:"0124-6571500",address:{"@type":"PostalAddress",streetAddress:"Unit No. 1146–1148, JMD Megapolis, Sector 48",addressLocality:"Gurugram",addressRegion:"Haryana",postalCode:"122018",addressCountry:"IN"},sameAs:["https://in.linkedin.com/company/bcc-buildtech-gurugram-haryana"]})}} /></body>
    </html>
  );
}
