import { createClient } from "@/utils/supabase/client";

// ==================== 1. CART SUPABASE INTEGRATION (UNIFIED USERS TABLE) ====================
export interface SupabaseCartItem {
  productId: number;
  quantity: number;
}

export const fetchUserCartFromSupabase = async (username: string): Promise<SupabaseCartItem[]> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("users")
      .select("cart")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`)
      .limit(1);

    if (error || !data || data.length === 0 || !Array.isArray(data[0].cart)) return [];

    return data[0].cart;
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

    const { error } = await supabase
      .from("users")
      .update({ cart: items })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`);

    return !error;
  } catch (err) {
    console.error("Error syncing cart to Supabase:", err);
    return false;
  }
};

// ==================== 2. WISHLIST SUPABASE INTEGRATION (UNIFIED USERS TABLE) ====================
export const fetchUserWishlistFromSupabase = async (username: string): Promise<number[]> => {
  try {
    const supabase = createClient();
    const cleanUser = username.trim().replace(/^@/, "");

    const { data, error } = await supabase
      .from("users")
      .select("wishlist")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`)
      .limit(1);

    if (error || !data || data.length === 0 || !Array.isArray(data[0].wishlist)) return [];

    return data[0].wishlist;
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

    const { error } = await supabase
      .from("users")
      .update({ wishlist: productIds })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`);

    return !error;
  } catch (err) {
    console.error("Error syncing wishlist to Supabase:", err);
    return false;
  }
};

// ==================== 3. REWARDS & POINTS SUPABASE INTEGRATION (UNIFIED USERS TABLE) ====================
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
      .from("users")
      .select("rewards")
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`)
      .limit(1);

    if (error || !data || data.length === 0 || !data[0].rewards) {
      return { points: 500, history: [], lastCheckin: undefined };
    }

    const rw = data[0].rewards;
    return {
      points: Number(rw.points || 500),
      history: Array.isArray(rw.history) ? rw.history : [],
      lastCheckin: rw.lastCheckin ? String(rw.lastCheckin) : undefined,
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

    const { error } = await supabase
      .from("users")
      .update({ rewards: rewardData })
      .or(`username.eq.${cleanUser},username.eq.@${cleanUser},email.eq.${cleanUser}`);

    return !error;
  } catch (err) {
    console.error("Error syncing rewards to Supabase:", err);
    return false;
  }
};
