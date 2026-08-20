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
  storeName: "Mini Shop - Trung Tâm Tin Học Văn Phòng Bình Dương",
  phone: "0987.654.321",
  email: "tinhocbinhduong@gmail.com",
  address: "Trung tâm Tin học Văn phòng Bình Dương - Số 59, Đường ĐT743, KDC Bình Đáng, P. Bình Hòa, TP. Thuận An, Bình Dương",
  workingHours: "7:30 AM - 21:00 PM (Tất cả các ngày trong tuần)",
  description: "Mini Shop cung cấp giải pháp nội thất hiện đại, gỗ tự nhiên cao cấp và đồ dùng trang trí góc làm việc thông minh cho ngôi nhà của bạn.",
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
