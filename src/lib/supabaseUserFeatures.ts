import { createClient } from "@/utils/supabase/client";

// ==================== 1. CART SUPABASE INTEGRATION ====================
export interface SupabaseCartItem {
  productId: number;
  quantity: number;
}

export const fetchUserCartFromSupabase = async (username: string): Promise<SupabaseCartItem[]> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("user_carts")
      .select("product_id, quantity")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`);

    if (error || !data) return [];

    return data.map((item: any) => ({
      productId: Number(item.product_id),
      quantity: Number(item.quantity || 1),
    }));
  } catch (err) {
    console.error("Error fetching user cart from Supabase:", err);
    return [];
  }
};

export const syncUserCartToSupabase = async (
  username: string,
  items: SupabaseCartItem[]
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    // 1. Clear old cart items for user
    await supabase
      .from("user_carts")
      .delete()
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`);

    // 2. Insert new cart items if available
    if (items.length > 0) {
      const rowsToInsert = items.map((it) => ({
        username: cleanUser,
        product_id: it.productId,
        quantity: it.quantity,
      }));

      const { error } = await supabase.from("user_carts").insert(rowsToInsert);
      if (error) console.error("Error syncing cart items to Supabase:", error.message);
    }

    return true;
  } catch (err) {
    console.error("Error syncing cart to Supabase:", err);
    return false;
  }
};

// ==================== 2. WISHLIST SUPABASE INTEGRATION ====================
export const fetchUserWishlistFromSupabase = async (username: string): Promise<number[]> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("user_wishlists")
      .select("product_id")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`);

    if (error || !data) return [];

    return data.map((item: any) => Number(item.product_id));
  } catch (err) {
    console.error("Error fetching wishlist from Supabase:", err);
    return [];
  }
};

export const syncUserWishlistToSupabase = async (
  username: string,
  productIds: number[]
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    // 1. Clear old wishlist items for user
    await supabase
      .from("user_wishlists")
      .delete()
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`);

    // 2. Insert new wishlist items
    if (productIds.length > 0) {
      const rowsToInsert = productIds.map((pid) => ({
        username: cleanUser,
        product_id: pid,
      }));

      const { error } = await supabase.from("user_wishlists").insert(rowsToInsert);
      if (error) console.error("Error syncing wishlist to Supabase:", error.message);
    }

    return true;
  } catch (err) {
    console.error("Error syncing wishlist to Supabase:", err);
    return false;
  }
};

// ==================== 3. REWARDS & POINTS SUPABASE INTEGRATION ====================
export interface UserRewardData {
  points: number;
  history: any[];
  lastCheckin?: string;
}

export const fetchUserRewardsFromSupabase = async (username: string): Promise<UserRewardData> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("user_rewards")
      .select("*")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      return { points: 500, history: [], lastCheckin: undefined };
    }

    const row = data[0];
    return {
      points: Number(row.points || 500),
      history: Array.isArray(row.history) ? row.history : [],
      lastCheckin: row.last_checkin ? String(row.last_checkin) : undefined,
    };
  } catch (err) {
    console.error("Error fetching rewards from Supabase:", err);
    return { points: 500, history: [], lastCheckin: undefined };
  }
};

export const syncUserRewardsToSupabase = async (
  username: string,
  rewardData: UserRewardData
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { error } = await supabase.from("user_rewards").upsert({
      username: cleanUser,
      points: rewardData.points,
      history: rewardData.history,
      last_checkin: rewardData.lastCheckin || null,
    }, { onConflict: "username" });

    return !error;
  } catch (err) {
    console.error("Error syncing rewards to Supabase:", err);
    return false;
  }
};
