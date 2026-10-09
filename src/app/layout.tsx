import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";
import { PwaRegistrar } from "@/components/common/PwaRegistrar";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const serifFont = Lora({
  subsets: ["latin", "vietnamese"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f1115",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://hoithanhvn.com"),
  title: {
    default: "Hội Thánh Tin Lành Việt Nam — Thờ Phượng Trực Tuyến & Cổng Kết Nối Mục Vụ",
    template: "%s | Hội Thánh Tin Lành Việt Nam",
  },
  description:
    "Cổng kết nối các Hội Thánh Tin Lành Việt Nam. Thờ phượng Chúa Nhật trực tuyến, bài giảng bồi linh, thánh ca tôn vinh, học Lời Chúa và hiệp ý cầu nguyện khắp mọi miền.",
  keywords: [
    "hội thánh tin lành việt nam",
    "thờ phượng trực tuyến",
    "bài giảng tin lành",
    "trực tiếp chúa nhật",
    "tin lành việt nam",
    "thánh ca tin lành",
    "kinh thánh lời chúa",
    "hội thánh online",
    "cầu nguyện trực tuyến",
    "tin lành lam sơn",
    "hoithanhvn",
    "hoithanhvn.com",
  ],
  authors: [{ name: "Hội Thánh Tin Lành Việt Nam", url: "https://hoithanhvn.com" }],
  creator: "Hội Thánh Tin Lành Việt Nam",
  publisher: "Hội Thánh Tin Lành Việt Nam",
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "https://hoithanhvn.com",
  },
  verification: {
    google: "89DFUjWeaqNRLW9XEm3BPidr3bGwm-KWETr2kF2a4lQ",
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://hoithanhvn.com",
    siteName: "Hội Thánh Tin Lành Việt Nam",
    title: "Hội Thánh Tin Lành Việt Nam — Thờ Phượng Trực Tuyến & Cổng Kết Nối Mục Vụ",
    description:
      "Phòng thờ phượng trực tuyến Chúa Nhật. Đồng lòng tôn vinh Chúa, hiệp ý cầu nguyện và lắng nghe Lời Chúa.",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Biểu trưng Hội Thánh Tin Lành Việt Nam",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hội Thánh Tin Lành Việt Nam — Thờ Phượng Trực Tuyến",
    description:
      "Phòng thờ phượng trực tuyến Chúa Nhật. Đồng lòng tôn vinh Chúa, hiệp ý cầu nguyện và lắng nghe Lời Chúa.",
    images: ["/icon-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Hội Thánh VN",
  },
  icons: {
    icon: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Hội Thánh Tin Lành Việt Nam Online",
  url: "https://hoithanhvn.com",
  description:
    "Cổng kết nối các Hội Thánh Tin Lành Việt Nam. Thờ phượng Chúa Nhật trực tuyến, bài giảng bồi linh, thánh ca tôn vinh và hiệp ý cầu nguyện.",
  inLanguage: "vi-VN",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://hoithanhvn.com/?search={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark ${sansFont.variable} ${serifFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className="bg-sanctuary-900 text-sanctuary-100 font-sans selection:bg-gold-400/20 selection:text-gold-300">
        {children}
        <PwaRegistrar />
      </body>
    </html>
  );
}
