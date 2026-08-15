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
      .from("users")
      .select("addresses")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`)
      .limit(1);

    if (error || !data || data.length === 0 || !Array.isArray(data[0].addresses) || data[0].addresses.length === 0) {
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

    return data[0].addresses;
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
    const currentAddresses = await fetchUserAddressesFromSupabase(username);
    let updatedAddresses = [...currentAddresses];

    if (addr.isDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddressItem: UserAddressItem = {
      id: Date.now(),
      ...addr,
    };
    updatedAddresses.push(newAddressItem);

    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`);

    return !error;
  } catch (err) {
    console.error("Error adding address:", err);
    return false;
  }
};

export const setDefaultUserAddressInSupabase = async (
  id: number,
  username: string
): Promise<boolean> => {
  try {
    const currentAddresses = await fetchUserAddressesFromSupabase(username);
    const updatedAddresses = currentAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`);

    return !error;
  } catch (err) {
    console.error("Error setting default address:", err);
    return false;
  }
};

export const deleteUserAddressFromSupabase = async (
  id: number,
  username: string = "binh"
): Promise<boolean> => {
  try {
    const currentAddresses = await fetchUserAddressesFromSupabase(username);
    let updatedAddresses = currentAddresses.filter((a) => a.id !== id);

    if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`);

    return !error;
  } catch (err) {
    console.error("Error deleting address:", err);
    return false;
  }
};
