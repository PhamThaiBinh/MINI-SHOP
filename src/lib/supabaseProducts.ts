import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { PRODUCTS_DATA } from "@/data/products";

export interface SupabaseCategory {
  id: string;
  label: string;
  icon: string;
}

export const fetchProductsFromSupabase = async (includeHidden: boolean = false): Promise<Product[]> => {
  try {
    const supabase = createClient();

    let query = supabase.from("products").select("*").order("id", { ascending: true });

    if (!includeHidden) {
      // Fetch hidden categories to also exclude products under hidden categories
      const { data: hiddenCats } = await supabase
        .from("categories")
        .select("category_id, name, slug")
        .eq("status", "Hidden");

      const hiddenCatKeys = new Set<string>();
      if (hiddenCats) {
        hiddenCats.forEach((c: any) => {
          if (c.category_id) hiddenCatKeys.add(c.category_id.toLowerCase());
          if (c.name) hiddenCatKeys.add(c.name.toLowerCase());
          if (c.slug) hiddenCatKeys.add(c.slug.toLowerCase());
        });
      }

      query = query.neq("status", "Hidden");

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        console.warn("Supabase fetch error or empty, using fallback data:", error?.message);
        return PRODUCTS_DATA.filter((p) => p.status !== "Hidden");
      }

      return data
        .filter((row: any) => {
          const cat = (row.category || "").toLowerCase();
          const catName = (row.category_name || "").toLowerCase();
          return !hiddenCatKeys.has(cat) && !hiddenCatKeys.has(catName);
        })
        .map((row: any) => ({
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
    }

    // For Admin: include ALL products including status='Hidden' and hidden categories
    const { data, error } = await query;

    if (error || !data || data.length === 0) {
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
      status: row.status === "Hidden" ? "Hidden" : Number(row.stock) === 0 ? "Out of stock" : String(row.status || "In stock"),
      badge: row.badge ? String(row.badge) : null,
      badgeType: row.badge_type ? String(row.badge_type) : null,
      image: String(row.image),
      description: String(row.description || ""),
      fullDesc: String(row.full_desc || row.description || ""),
      specs: typeof row.specs === "object" && row.specs ? row.specs : {},
    }));
  } catch (err) {
    console.error("Error fetching products from Supabase:", err);
    return includeHidden ? PRODUCTS_DATA : PRODUCTS_DATA.filter((p) => p.status !== "Hidden");
  }
};

export const fetchCategoriesFromSupabase = async (): Promise<SupabaseCategory[]> => {
  const allCategoryItem: SupabaseCategory = {
    id: "All",
    label: "Tất cả sản phẩm",
    icon: "fa-solid fa-boxes-stacked",
  };

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .neq("status", "Hidden")
      .order("id", { ascending: true });

    if (error || !data) {
      return [allCategoryItem];
    }

    const dynamicCats: SupabaseCategory[] = [
      allCategoryItem,
      ...data.map((row: any) => ({
        id: String(row.category_id || `C${String(row.id).padStart(4, "0")}`),
        label: String(row.name),
        icon: String(row.icon || "fa-solid fa-folder"),
      })),
    ];

    return dynamicCats;
  } catch (err) {
    console.error("Error fetching categories from Supabase:", err);
    return [allCategoryItem];
  }
};

export const fetchProductByIdFromSupabase = async (id: number): Promise<Product | null> => {
  try {
    const supabase = createClient();

    // Fetch hidden categories to check if this product belongs to a hidden category
    const { data: hiddenCats } = await supabase
      .from("categories")
      .select("category_id, name, slug")
      .eq("status", "Hidden");

    const hiddenCatKeys = new Set<string>();
    if (hiddenCats) {
      hiddenCats.forEach((c: any) => {
        if (c.category_id) hiddenCatKeys.add(c.category_id.toLowerCase());
        if (c.name) hiddenCatKeys.add(c.name.toLowerCase());
        if (c.slug) hiddenCatKeys.add(c.slug.toLowerCase());
      });
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`original_id.eq.${id},id.eq.${id}`)
      .limit(1);

    if (error || !data || data.length === 0) {
      const fallback = PRODUCTS_DATA.find((p) => p.id === id);
      if (fallback && fallback.status !== "Hidden") {
        return fallback;
      }
      return null;
    }

    const row = data[0];

    // If the product status is explicitly 'Hidden', do NOT return it for customer view
    if (row.status === "Hidden") {
      return null;
    }

    // If product belongs to a hidden category, do NOT return it for customer view
    const cat = (row.category || "").toLowerCase();
    const catName = (row.category_name || "").toLowerCase();
    if (hiddenCatKeys.has(cat) || hiddenCatKeys.has(catName)) {
      return null;
    }

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
    const fallback = PRODUCTS_DATA.find((p) => p.id === id);
    if (fallback && fallback.status !== "Hidden") {
      return fallback;
    }
    return null;
  }
};

