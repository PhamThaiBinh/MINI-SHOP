const SUPABASE_STORAGE_URL = "https://sngmpumzlhomtvfvlbdn.supabase.co/storage/v1/object/public/products";

export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(Math.round(amount || 0)) + "đ";
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

/**
 * Validate Vietnamese phone number format
 * Valid prefixes for VN mobile carriers:
 * - Viettel: 086, 096, 097, 098, 032, 033, 034, 035, 036, 037, 038, 039
 * - VinaPhone: 088, 091, 094, 081, 082, 083, 084, 085
 * - MobiFone: 089, 090, 093, 070, 076, 077, 078, 079
 * - Vietnamobile: 092, 052, 056, 058
 * - Gmobile: 099, 059
 * - I-Telecom / Wintel: 087, 055
 */
export function validateVNPhoneNumber(phone: string): {
  isValid: boolean;
  message?: string;
  cleanPhone: string;
  carrier?: string;
} {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, message: "Vui lòng nhập số điện thoại!", cleanPhone: "" };
  }

  // Remove spaces, dots, dashes, parentheses
  let clean = phone.trim().replace(/[\s.\-()]/g, "");

  // Normalize +84 or 84 to 0
  if (clean.startsWith("+84")) {
    clean = "0" + clean.slice(3);
  } else if (clean.startsWith("84") && clean.length === 11) {
    clean = "0" + clean.slice(2);
  }

  // Check digits only
  if (!/^\d+$/.test(clean)) {
    return {
      isValid: false,
      message: "Số điện thoại chỉ được chứa các chữ số!",
      cleanPhone: clean,
    };
  }

  // Check length (exact 10 digits)
  if (clean.length !== 10) {
    return {
      isValid: false,
      message: `Số điện thoại phải bao gồm đúng 10 chữ số (hiện có ${clean.length} số)!`,
      cleanPhone: clean,
    };
  }

  // Validate carrier prefixes
  const prefix2 = clean.slice(0, 2);
  const prefix3 = clean.slice(0, 3);

  // Viettel: 086, 096, 097, 098, 032-039
  const isViettel =
    ["086", "096", "097", "098"].includes(prefix3) ||
    (prefix2 === "03" && ["032", "033", "034", "035", "036", "037", "038", "039"].includes(prefix3));

  // VinaPhone: 088, 091, 094, 081-085
  const isVinaPhone =
    ["088", "091", "094", "081", "082", "083", "084", "085"].includes(prefix3);

  // MobiFone: 089, 090, 093, 070, 076-079
  const isMobiFone =
    ["089", "090", "093", "070", "076", "077", "078", "079"].includes(prefix3);

  // Vietnamobile: 092, 052, 056, 058
  const isVietnamobile = ["092", "052", "056", "058"].includes(prefix3);

  // Gmobile: 099, 059
  const isGmobile = ["099", "059"].includes(prefix3);

  // I-Telecom / Wintel: 087, 055
  const isMVNO = ["087", "055"].includes(prefix3);

  let carrier = "";
  if (isViettel) carrier = "Viettel";
  else if (isVinaPhone) carrier = "VinaPhone";
  else if (isMobiFone) carrier = "MobiFone";
  else if (isVietnamobile) carrier = "Vietnamobile";
  else if (isGmobile) carrier = "Gmobile";
  else if (isMVNO) carrier = prefix3 === "087" ? "I-Telecom" : "Wintel";

  if (!carrier) {
    return {
      isValid: false,
      message: `Đầu số "${prefix3}" không thuộc bất kỳ nhà mạng nào tại Việt Nam! Vui lòng nhập đầu số hợp lệ (Viettel: 03x, 086, 096-098; VinaPhone: 081-085, 088, 091, 094; MobiFone: 070, 076-079, 089, 090, 093; Vietnamobile: 052, 056, 058, 092; Gmobile: 059, 099; Wintel/I-Telecom: 055, 087).`,
      cleanPhone: clean,
    };
  }

  return {
    isValid: true,
    cleanPhone: clean,
    carrier,
  };
}
