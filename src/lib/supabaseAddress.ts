import { createClient } from "@/utils/supabase/client";

export interface UserAddressItem {
  id: number;
  name: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export const fetchUserAddressesFromSupabase = async (
  username: string
): Promise<UserAddressItem[]> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("user_addresses")
      .select("*")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`)
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return [
        {
          id: 101,
          name: "Bình Nguyễn",
          phone: "0988.123.456",
          province: "TP. Hồ Chí Minh",
          ward: "Phường Bến Thành (Quận 1, TP.HCM)",
          detail: "123 Đường Nguyễn Trãi",
          isDefault: true,
        },
      ];
    }

    return data.map((a: any) => ({
      id: Number(a.id),
      name: String(a.name),
      phone: String(a.phone),
      province: String(a.province),
      ward: String(a.ward),
      detail: String(a.detail),
      isDefault: Boolean(a.is_default),
    }));
  } catch (err) {
    console.error("Error fetching user addresses:", err);
    return [];
  }
};

export const addUserAddressToSupabase = async (
  addr: Omit<UserAddressItem, "id">,
  username: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    if (addr.isDefault) {
      await supabase
        .from("user_addresses")
        .update({ is_default: false })
        .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`);
    }

    const { error } = await supabase.from("user_addresses").insert({
      username: cleanUser,
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      ward: addr.ward,
      detail: addr.detail,
      is_default: addr.isDefault,
    });

    if (error) {
      console.error("Error inserting address to Supabase:", error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error adding address to Supabase:", err);
    return false;
  }
};

export const setDefaultUserAddressInSupabase = async (
  id: number,
  username: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    // 1. Reset all addresses for user to non-default
    await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`);

    // 2. Set chosen address to default
    const { error } = await supabase
      .from("user_addresses")
      .update({ is_default: true })
      .eq("id", id);

    return !error;
  } catch (err) {
    console.error("Error setting default address:", err);
    return false;
  }
};

export const deleteUserAddressFromSupabase = async (
  id: number
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from("user_addresses")
      .delete()
      .eq("id", id);

    return !error;
  } catch (err) {
    console.error("Error deleting address:", err);
    return false;
  }
};
