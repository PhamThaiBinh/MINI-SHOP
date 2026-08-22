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

const findUserRow = async (supabase: any, identifier: string) => {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase().replace(/^@/, "");
  const { data: users, error } = await supabase
    .from("users")
    .select("id, name, phone, email, username, addresses");

  if (error || !users || users.length === 0) return null;

  return users.find((u: any) => {
    const uEmail = String(u.email || "").toLowerCase().trim();
    const uUser = String(u.username || "").toLowerCase().replace(/^@/, "").trim();
    return (
      (uEmail && uEmail === clean) ||
      (uUser && uUser === clean) ||
      (uEmail && clean.includes(uEmail)) ||
      (clean && uEmail.includes(clean))
    );
  }) || null;
};

export const fetchUserAddressesFromSupabase = async (
  identifier: string
): Promise<UserAddressItem[]> => {
  try {
    const supabase = createClient();
    const matched = await findUserRow(supabase, identifier);

    if (matched) {
      if (Array.isArray(matched.addresses) && matched.addresses.length > 0) {
        return matched.addresses;
      }

      // If user has no address in Supabase yet, create and persist a default initial address
      const defaultInitialAddr: UserAddressItem = {
        id: 1,
        name: matched.name || "Phạm Thái Bình",
        phone: matched.phone || "0123456789",
        province: "Thành phố Hồ Chí Minh",
        ward: "Phường Bến Thành",
        detail: "123 Đường Nguyễn Trãi",
        isDefault: true,
      };

      const initialAddresses = [defaultInitialAddr];
      await supabase
        .from("users")
        .update({ addresses: initialAddresses })
        .eq("id", matched.id);

      return initialAddresses;
    }
  } catch (err) {
    console.warn("Supabase address fetch warning:", err);
  }

  return [];
};

export const addUserAddressToSupabase = async (
  addr: Omit<UserAddressItem, "id">,
  identifier: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const matched = await findUserRow(supabase, identifier);
    if (!matched) return false;

    const currentAddresses: UserAddressItem[] = Array.isArray(matched.addresses)
      ? matched.addresses
      : [];

    let updatedAddresses = [...currentAddresses];
    if (addr.isDefault || updatedAddresses.length === 0) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const newAddressItem: UserAddressItem = {
      id: Date.now(),
      ...addr,
      isDefault: addr.isDefault || updatedAddresses.length === 0,
    };
    updatedAddresses.push(newAddressItem);

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .eq("id", matched.id);

    return !error;
  } catch (err) {
    console.error("Error adding address:", err);
    return false;
  }
};

export const setDefaultUserAddressInSupabase = async (
  id: number,
  identifier: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const matched = await findUserRow(supabase, identifier);
    if (!matched) return false;

    const currentAddresses: UserAddressItem[] = Array.isArray(matched.addresses)
      ? matched.addresses
      : [];

    const updatedAddresses = currentAddresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .eq("id", matched.id);

    return !error;
  } catch (err) {
    console.error("Error setting default address:", err);
    return false;
  }
};

export const updateUserAddressInSupabase = async (
  updatedAddr: UserAddressItem,
  identifier: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const matched = await findUserRow(supabase, identifier);
    if (!matched) return false;

    const currentAddresses: UserAddressItem[] = Array.isArray(matched.addresses)
      ? matched.addresses
      : [];

    let updatedAddresses = currentAddresses.map((a) => {
      if (a.id === updatedAddr.id) {
        return updatedAddr;
      }
      if (updatedAddr.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .eq("id", matched.id);

    return !error;
  } catch (err) {
    console.error("Error updating address:", err);
    return false;
  }
};

export const deleteUserAddressFromSupabase = async (
  id: number,
  identifier: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const matched = await findUserRow(supabase, identifier);
    if (!matched) return false;

    const currentAddresses: UserAddressItem[] = Array.isArray(matched.addresses)
      ? matched.addresses
      : [];

    let updatedAddresses = currentAddresses.filter((a) => a.id !== id);

    if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
      updatedAddresses[0].isDefault = true;
    }

    const { error } = await supabase
      .from("users")
      .update({ addresses: updatedAddresses })
      .eq("id", matched.id);

    return !error;
  } catch (err) {
    console.error("Error deleting address:", err);
    return false;
  }
};
