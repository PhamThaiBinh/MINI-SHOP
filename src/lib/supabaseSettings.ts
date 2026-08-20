import { createClient } from "@/utils/supabase/client";

export interface StoreSettings {
  siteName: string;
  hotline: string;
  email: string;
  address: string;
  shippingFee: number;
  freeShipThreshold: number;
  openingHours: string;
}

export const DEFAULT_SETTINGS: StoreSettings = {
  siteName: "Mini Shop - Nội Thất & Gia Dụng Cao Cấp",
  hotline: "0988.123.456",
  email: "support@minishop.vn",
  address: "123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
  shippingFee: 30000,
  freeShipThreshold: 500000,
  openingHours: "08:00 - 21:00 (Tất cả các ngày trong tuần)",
};

export const fetchSettingsFromSupabase = async (): Promise<StoreSettings> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .limit(1);

    if (error || !data || data.length === 0) {
      return DEFAULT_SETTINGS;
    }

    const row = data[0];
    return {
      siteName: row.site_name || DEFAULT_SETTINGS.siteName,
      hotline: row.hotline || DEFAULT_SETTINGS.hotline,
      email: row.email || DEFAULT_SETTINGS.email,
      address: row.address || DEFAULT_SETTINGS.address,
      shippingFee: row.shipping_fee !== undefined ? Number(row.shipping_fee) : DEFAULT_SETTINGS.shippingFee,
      freeShipThreshold: row.freeship_threshold !== undefined ? Number(row.freeship_threshold) : DEFAULT_SETTINGS.freeShipThreshold,
      openingHours: row.opening_hours || DEFAULT_SETTINGS.openingHours,
    };
  } catch (err) {
    console.error("Error fetching settings from Supabase:", err);
    return DEFAULT_SETTINGS;
  }
};

export const saveSettingsToSupabase = async (settings: StoreSettings): Promise<boolean> => {
  try {
    const supabase = createClient();
    const payload = {
      site_name: settings.siteName,
      hotline: settings.hotline,
      email: settings.email,
      address: settings.address,
      shipping_fee: settings.shippingFee,
      freeship_threshold: settings.freeShipThreshold,
      opening_hours: settings.openingHours,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await supabase.from("settings").select("id").limit(1);

    if (existing && existing.length > 0) {
      const { error } = await supabase.from("settings").update(payload).eq("id", existing[0].id);
      return !error;
    } else {
      const { error } = await supabase.from("settings").insert(payload);
      return !error;
    }
  } catch (err) {
    console.error("Error saving settings to Supabase:", err);
    return false;
  }
};
