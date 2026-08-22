const SUPABASE_STORAGE_URL = "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function fixImagePath(path: string): string {
  if (!path) {
    return "/assets/images/banner/banner-trang-chu-mini-shop.webp";
  }

  // 1. If blob URL (local preview), base64 data URL or full HTTP/HTTPS URL, return as-is
  if (
    path.startsWith("blob:") ||
    path.startsWith("data:") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return path;
  }

  const normalized = path.replace(/^\//, "");

  // 2. If it's a site static banner asset in public/
  if (normalized.startsWith("assets/images/banner/") || normalized.startsWith("banner/")) {
    return "/" + (normalized.startsWith("assets/") ? normalized : "assets/images/" + normalized);
  }

  // 3. For all product, blog, lookbook and shop images, route to Supabase Storage Bucket
  let cleanPath = normalized
    .replace(/^public\//, "")
    .replace(/^assets\/images\//, "")
    .replace(/đồ mỹ nghệ/g, "do-my-nghe");

  if (!cleanPath.startsWith("products/")) {
    cleanPath = "products/" + cleanPath;
  }

  return `${SUPABASE_STORAGE_URL}/${cleanPath}`;
}
