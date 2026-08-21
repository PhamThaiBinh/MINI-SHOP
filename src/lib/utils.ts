const SUPABASE_STORAGE_URL = "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export function fixImagePath(path: string): string {
  if (!path) {
    return `${SUPABASE_STORAGE_URL}/products/noi-that-gia-dung/sofa-phong-khach.webp`;
  }

  // If already a full HTTP / HTTPS URL, return as-is without altering
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) {
    return path;
  }

  // Clean relative path prefixes
  let cleanPath = path
    .replace(/^\//, "")
    .replace(/^public\//, "")
    .replace(/^assets\/images\/products\//, "")
    .replace(/^assets\/images\//, "");

  return `${SUPABASE_STORAGE_URL}/${cleanPath}`;
}
