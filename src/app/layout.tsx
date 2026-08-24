import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastAndConfirmProvider } from "@/context/ToastAndConfirmContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatbotWidget } from "@/components/common/ChatbotWidget";

export const metadata: Metadata = {
  title: "Mini Shop - Sống đẹp mỗi ngày | Đồ dùng & Trang trí nhà cửa",
  description:
    "Mini Shop cung cấp các sản phẩm nội thất, đồ trang trí, gia dụng thủ công cao cấp cho tổ ấm của bạn.",
  openGraph: {
    title: "Mini Shop - Sống đẹp mỗi ngày",
    description:
      "Nội thất, trang trí & đồ dùng nhà cửa thủ công tinh tế, hiện đại.",
    type: "website",
    locale: "vi_VN",
    siteName: "Mini Shop",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mini Shop - Sống đẹp mỗi ngày",
    description:
      "Nội thất, trang trí & đồ dùng nhà cửa thủ công tinh tế, hiện đại.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body suppressHydrationWarning>
        <ToastAndConfirmProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <Header />
                <main className="main-content">{children}</main>
                <Footer />
                <ChatbotWidget />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastAndConfirmProvider>
      </body>
    </html>
  );
}


