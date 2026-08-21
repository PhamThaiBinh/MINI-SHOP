const SUPABASE_STORAGE_URL = "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function fixImagePath(path: string): string {
  if (!path) {
    return `${SUPABASE_STORAGE_URL}/noi-that-gia-dung/sofa-phong-khach.webp`;
  }

  // If already a full HTTP / HTTPS URL
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
    return path.replace("/products/products/", "/products/");
  }

  // Clean relative path prefixes
  let cleanPath = path
    .replace(/^\//, "")
    .replace(/^public\//, "")
    .replace(/^assets\/images\/products\//, "")
    .replace(/^assets\/images\//, "");

  // If cleanPath starts with products/, strip it to avoid duplication
  if (cleanPath.startsWith("products/")) {
    cleanPath = cleanPath.substring(9);
  }

  return `${SUPABASE_STORAGE_URL}/${cleanPath}`;
}
