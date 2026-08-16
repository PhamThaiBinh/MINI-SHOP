import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
      <body suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <main className="main-content">{children}</main>
              <Footer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

