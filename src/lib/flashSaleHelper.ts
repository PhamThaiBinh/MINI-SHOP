import { Product } from "@/types/product";
import { PRODUCTS_DATA } from "@/data/products";

export interface FlashSaleSlotInfo {
  key: "slot1" | "slot2" | "slot3" | "slot4";
  title: string;
  label: string;
  timeRange: string;
  startHour: number;
  endHour: number;
  status: "active" | "upcoming" | "ended";
}

export const FLASH_SALE_SLOTS: FlashSaleSlotInfo[] = [
  {
    key: "slot1",
    title: "00:00 - 09:00",
    label: "Săn Deal Đêm Khuya / Sáng Sớm",
    timeRange: "00:00 - 09:00",
    startHour: 0,
    endHour: 9,
    status: "upcoming",
  },
  {
    key: "slot2",
    title: "09:00 - 15:00",
    label: "Deal Vàng Buổi Trưa",
    timeRange: "09:00 - 15:00",
    startHour: 9,
    endHour: 15,
    status: "upcoming",
  },
  {
    key: "slot3",
    title: "15:00 - 21:00",
    label: "Giờ Vàng Tan Tầm",
    timeRange: "15:00 - 21:00",
    startHour: 15,
    endHour: 21,
    status: "upcoming",
  },
  {
    key: "slot4",
    title: "21:00 - 24:00",
    label: "Siêu Sale Đêm Muộn",
    timeRange: "21:00 - 24:00",
    startHour: 21,
    endHour: 24,
    status: "upcoming",
  },
];

// Helper: Convert string to 32-bit positive integer seed
export function stringToSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// Helper: Mulberry32 fast deterministic pseudo-random number generator
export function createPRNG(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getCurrentVnTimeInfo() {
  const now = new Date();
  const vnDateStr = now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const vnTime = new Date(vnDateStr);
  const currentHour = vnTime.getHours();

  const yyyy = vnTime.getFullYear();
  const mm = String(vnTime.getMonth() + 1).padStart(2, "0");
  const dd = String(vnTime.getDate()).padStart(2, "0");
  const dateKey = `${yyyy}-${mm}-${dd}`;

  let currentSlotKey: "slot1" | "slot2" | "slot3" | "slot4" = "slot1";
  if (currentHour >= 0 && currentHour < 9) {
    currentSlotKey = "slot1";
  } else if (currentHour >= 9 && currentHour < 15) {
    currentSlotKey = "slot2";
  } else if (currentHour >= 15 && currentHour < 21) {
    currentSlotKey = "slot3";
  } else {
    currentSlotKey = "slot4";
  }

  return {
    currentHour,
    dateKey,
    currentSlotKey,
    vnTime,
  };
}

export interface FlashSaleItem {
  product: Product;
  flashPrice: number;
  originalPrice: number;
  discountPercent: number;
  soldCount: number;
  totalStock: number;
}

/**
 * Generate deterministic Flash Sale products per slot and date
 */
export function getSlotProducts(
  productsList: Product[],
  slotKey: string,
  dateKey: string,
  soldMap: Record<string, number> = {}
): FlashSaleItem[] {
  const activeList =
    productsList.length > 0
      ? productsList.filter((p) => p.status !== "Hidden" && p.price > 0)
      : PRODUCTS_DATA;

  const pool = activeList.length >= 12 ? activeList : productsList.length > 0 ? productsList : PRODUCTS_DATA;

  // Deterministic seed based on Date + Time Slot
  const seed = stringToSeed(`MINI_SHOP_FS_${dateKey || "2026-08-24"}_${slotKey}`);
  const random = createPRNG(seed);

  // Fisher-Yates shuffle
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Exactly 12 items
  const selectedProducts: Product[] = [];
  for (let i = 0; i < 12; i++) {
    selectedProducts.push(shuffled[i % shuffled.length]);
  }

  // Tiered discount pattern: 50%, 45%, 42%, 40%, 38%, 35%, 35%, 30%, 30%, 28%, 25%, 25%
  const discountTiers = [50, 45, 42, 40, 38, 35, 35, 30, 30, 28, 25, 25];

  return selectedProducts.map((p, idx) => {
    const discountPercent = discountTiers[idx] || Math.floor(25 + random() * 25);
    const rawFlashPrice = Math.round((p.price * (1 - discountPercent / 100)) / 1000) * 1000;
    const flashPrice = Math.min(p.price - 10000, rawFlashPrice);

    const totalStock = p.stock && p.stock > 0 ? p.stock : 20;
    const realSold = soldMap[p.name.trim().toLowerCase()] || 0;
    const soldCount = Math.min(totalStock, realSold);

    return {
      product: p,
      flashPrice,
      originalPrice: p.price,
      discountPercent,
      soldCount,
      totalStock,
    };
  });
}

/**
 * Parses user query to detect if they requested a specific Flash Sale slot
 * Automatically maps:
 * - 10h, 10:00, 11h, 12h, 14h -> slot2 (09:00 - 15:00)
 * - 15h, 16h, 18h, 20h -> slot3 (15:00 - 21:00)
 * - 21h, 22h, 23h -> slot4 (21:00 - 24:00)
 * - 0h, 7h, 8h -> slot1 (00:00 - 09:00)
 */
export function detectRequestedSlot(query: string): "slot1" | "slot2" | "slot3" | "slot4" | null {
  const norm = query
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  // 1. Extract explicit hour number e.g. "10h", "10 giờ", "10:00", "14h30", "18h", "21h"
  const hourMatch = norm.match(/\b(\d{1,2})\s*(?:h|gio|:\d{2})/i);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1], 10);
    if (!isNaN(hour)) {
      if (hour >= 0 && hour < 9) return "slot1";
      if (hour >= 9 && hour < 15) return "slot2";
      if (hour >= 15 && hour < 21) return "slot3";
      if (hour >= 21 && hour <= 24) return "slot4";
    }
  }

  // 2. Check explicit slot numbers: "khung 1", "khung 2", "khung 3", "khung 4"
  if (/\b(khung 1|slot 1|slot1)\b/.test(norm)) return "slot1";
  if (/\b(khung 2|slot 2|slot2)\b/.test(norm)) return "slot2";
  if (/\b(khung 3|slot 3|slot3)\b/.test(norm)) return "slot3";
  if (/\b(khung 4|slot 4|slot4)\b/.test(norm)) return "slot4";

  // 3. Named periods
  if (/\b(buoi toi|dem muon|toi|khuya|toi nay)\b/.test(norm)) return "slot4";
  if (/\b(buoi chieu|tan tam|chieu|chieu nay)\b/.test(norm)) return "slot3";
  if (/\b(buoi trua|trua|trua nay)\b/.test(norm)) return "slot2";
  if (/\b(dem khuya|sang som|sang|sang nay)\b/.test(norm)) return "slot1";

  return null;
}



