const SUPABASE_STORAGE_URL = "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function fixImagePath(path: string): string {
  if (!path) {
    return "/assets/images/banner/banner-trang-chu-mini-shop.webp";
  }

  // 1. If already a full HTTP / HTTPS URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
    return path;
  }

  const normalized = path.replace(/^\//, "");

  // 2. If it's a site static asset (banner, blog, users, avatars, ui, etc.) and NOT in assets/images/products/
  if (
    normalized.startsWith("assets/images/banner/") ||
    normalized.startsWith("assets/images/blog/") ||
    normalized.startsWith("assets/images/users/") ||
    normalized.startsWith("assets/images/avatars/") ||
    normalized.startsWith("assets/images/lookbook/") ||
    (normalized.startsWith("assets/") && !normalized.includes("assets/images/products/"))
  ) {
    return "/" + normalized;
  }

  // 3. For product images, route to Supabase Storage Bucket
  let cleanPath = normalized
    .replace(/^public\//, "")
    .replace(/^assets\/images\/products\//, "")
    .replace(/^assets\/images\//, "");

  return `${SUPABASE_STORAGE_URL}/${cleanPath}`;
}
