export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function fixImagePath(path: string): string {
  if (!path) return "/assets/images/banner/banner-trang-chu-mini-shop.webp";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
    return path;
  }
  if (path.startsWith("/")) return path;
  return "/" + path;
}
