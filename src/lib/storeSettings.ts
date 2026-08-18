export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  description?: string;
  facebookUrl?: string;
  zaloUrl?: string;
  tiktokUrl?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: "Mini Shop Nội Thất & Gia Dụng",
  phone: "0987.654.321",
  email: "support@minishop.vn",
  address: "123 Đường Nguyễn Trãi, Phường Bến Thành, Thành phố Hồ Chí Minh",
  workingHours: "8:00 AM - 21:30 PM (Tất cả các ngày)",
  description: "Mini Shop chuyên cung cấp giải pháp nội thất hiện đại, gỗ tự nhiên cao cấp và đồ gia dụng thông minh cho ngôi nhà của bạn.",
  facebookUrl: "https://facebook.com",
  zaloUrl: "https://zalo.me",
  tiktokUrl: "https://tiktok.com",
};

export const STORE_SETTINGS_KEY = "minishop_store_settings_v1";

export function getStoreSettings(): StoreSettings {
  if (typeof window === "undefined") return DEFAULT_STORE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORE_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_STORE_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.error("Error reading store settings:", err);
  }
  return DEFAULT_STORE_SETTINGS;
}

export function saveStoreSettings(settings: Partial<StoreSettings>): StoreSettings {
  const current = getStoreSettings();
  const updated = { ...current, ...settings };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("minishop_store_settings_updated", { detail: updated }));
    } catch (err) {
      console.error("Error saving store settings:", err);
    }
  }
  return updated;
}
