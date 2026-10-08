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
  title: "Thờ Phượng Trực Tuyến | Hội Thánh Tin Lành Việt Nam",
  description:
    "Phòng thờ phượng trực tuyến Chúa Nhật. Đồng lòng tôn vinh Chúa, hiệp ý cầu nguyện và lắng nghe Lời Chúa.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`dark ${sansFont.variable} ${serifFont.variable}`}>
      <body className="bg-sanctuary-900 text-sanctuary-100 font-sans selection:bg-gold-400/20 selection:text-gold-300">
        {children}
        <PwaRegistrar />
      </body>
    </html>
  );
}
