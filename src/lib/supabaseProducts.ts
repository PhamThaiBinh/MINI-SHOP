import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { PRODUCTS_DATA } from "@/data/products";

export interface SupabaseCategory {
  id: string;
  label: string;
  icon: string;
}

export const fetchProductsFromSupabase = async (): Promise<Product[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn("Supabase fetch error or empty, using fallback data:", error?.message);
      return PRODUCTS_DATA;
    }

    return data.map((row: any) => ({
      id: Number(row.id),
      name: String(row.name),
      category: String(row.category),
      categoryName: String(row.category_name || row.category),
      price: Number(row.price),
      oldPrice: row.old_price ? Number(row.old_price) : undefined,
      stock: row.stock !== undefined && row.stock !== null ? Number(row.stock) : 50,
      status: Number(row.stock) === 0 ? "Out of stock" : String(row.status || "In stock"),
      badge: row.badge ? String(row.badge) : null,
      badgeType: row.badge_type ? String(row.badge_type) : null,
      image: String(row.image),
      description: String(row.description || ""),
      fullDesc: String(row.full_desc || row.description || ""),
      specs: typeof row.specs === "object" && row.specs ? row.specs : {},
    }));
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return PRODUCTS_DATA;
  }
};

export const fetchCategoriesFromSupabase = async (): Promise<SupabaseCategory[]> => {
  const defaultCategories: SupabaseCategory[] = [
    { id: "All", label: "Tất cả", icon: "📁" },
    { id: "Living Room", label: "Phòng khách", icon: "🛋️" },
    { id: "Bedroom", label: "Phòng ngủ", icon: "🛏️" },
    { id: "Kitchen", label: "Nhà bếp", icon: "🍳" },
    { id: "Lighting", label: "Đèn", icon: "💡" },
    { id: "Decor", label: "Trang trí", icon: "🖼️" },
    { id: "Storage", label: "Lưu trữ", icon: "📦" },
  ];

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return defaultCategories;
    }

    return data.map((row: any) => ({
      id: String(row.category_id),
      label: String(row.name),
      icon: String(row.icon || "📁"),
    }));
  } catch (err) {
    console.error("Error fetching categories from Supabase:", err);
    return defaultCategories;
  }
};

export const fetchProductByIdFromSupabase = async (id: number): Promise<Product | null> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`original_id.eq.${id},id.eq.${id}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      const fallback = PRODUCTS_DATA.find((p) => p.id === id) || null;
      return fallback;
    }

    const row = data[0];
    return {
      id: Number(row.original_id || row.id),
      name: String(row.name),
      category: String(row.category),
      categoryName: String(row.category_name || row.category),
      price: Number(row.price),
      oldPrice: row.old_price ? Number(row.old_price) : undefined,
      stock: row.stock !== undefined && row.stock !== null ? Number(row.stock) : 50,
      status: Number(row.stock) === 0 ? "Out of stock" : String(row.status || "In stock"),
      badge: row.badge ? String(row.badge) : null,
      badgeType: row.badge_type ? String(row.badge_type) : null,
      image: String(row.image),
      description: String(row.description || ""),
      fullDesc: String(row.full_desc || row.description || ""),
      specs: typeof row.specs === "object" && row.specs ? row.specs : {},
    };
  } catch (err) {
    console.error(`Error fetching product ${id} from Supabase:`, err);
    return PRODUCTS_DATA.find((p) => p.id === id) || null;
  }
};

