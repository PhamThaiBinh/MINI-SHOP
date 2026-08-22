import { createClient } from "@/utils/supabase/client";
import { Product } from "@/types/product";
import { PRODUCTS_DATA } from "@/data/products";
import { SystemVoucher, INITIAL_SYSTEM_VOUCHERS } from "@/utils/voucherStorage";
import { UnifiedOrder } from "@/utils/orderStorage";

// ==================== 1. VOUCHERS CRUD ====================
export const fetchAdminVouchers = async (): Promise<SystemVoucher[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("vouchers")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return INITIAL_SYSTEM_VOUCHERS;
    }

    return data.map((v: any) => ({
      code: String(v.code),
      desc: String(v.desc || ""),
      percent: v.percent ? Number(v.percent) : undefined,
      fixedDiscount: v.fixed_discount ? Number(v.fixed_discount) : undefined,
      minOrder: v.min_order ? Number(v.min_order) : 0,
      isActive: Boolean(v.is_active),
    }));
  } catch (err) {
    console.error("Error fetching admin vouchers:", err);
    return INITIAL_SYSTEM_VOUCHERS;
  }
};

export const saveAdminVoucher = async (voucher: SystemVoucher): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("vouchers").upsert({
      code: voucher.code,
      desc: voucher.desc,
      percent: voucher.percent || null,
      fixed_discount: voucher.fixedDiscount || null,
      min_order: voucher.minOrder || 0,
      is_active: voucher.isActive,
    }, { onConflict: "code" });

    if (error) {
      console.error("Error saving voucher:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error saving admin voucher:", err);
    return false;
  }
};

export const deleteAdminVoucher = async (code: string): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("vouchers").delete().eq("code", code);
    if (error) console.error("Error deleting voucher:", error.message);
    return !error;
  } catch (err) {
    console.error("Error deleting admin voucher:", err);
    return false;
  }
};

// ==================== 2. USERS CRUD ====================
export interface AdminUserItem {
  id: number;
  avatarText: string;
  avatarBg: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  roleType: "admin" | "customer";
  registeredDate: string;
  status: "Active" | "Blocked";
}

export const fetchAdminUsers = async (): Promise<AdminUserItem[]> => {
  let dbUsers: AdminUserItem[] = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (!error && data && data.length > 0) {
      dbUsers = data.map((u: any) => ({
        id: Number(u.id || Math.floor(Math.random() * 100000)),
        avatarText: String(u.avatar_text || u.name?.charAt(0).toUpperCase() || "U"),
        avatarBg: String(u.avatar_bg || "#2e7d32"),
        name: String(u.name),
        username: String(u.username),
        email: String(u.email || ""),
        phone: String(u.phone || ""),
        role: String(u.role || "Khách hàng"),
        roleType: (u.role_type === "admin" ? "admin" : "customer") as any,
        registeredDate: String(u.registered_date || new Date().toLocaleDateString("vi-VN")),
        status: (u.status === "Blocked" ? "Blocked" : "Active") as any,
      }));
    }
  } catch (err) {
    console.error("Error fetching admin users from Supabase:", err);
  }

  return dbUsers;
};

export const saveAdminUser = async (user: AdminUserItem): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("users").upsert({
      id: user.id,
      avatar_text: user.avatarText,
      avatar_bg: user.avatarBg,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      role_type: user.roleType,
      registered_date: user.registeredDate,
      status: user.status,
    }, { onConflict: "id" });

    return !error;
  } catch (err) {
    console.error("Error saving admin user:", err);
    return false;
  }
};

export const toggleAdminUserStatus = async (id: number, currentStatus: "Active" | "Blocked"): Promise<boolean> => {
  try {
    const supabase = createClient();
    const newStatus = currentStatus === "Active" ? "Blocked" : "Active";
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", id);
    return !error;
  } catch (err) {
    console.error("Error toggling user status:", err);
    return false;
  }
};

// ==================== 3. CATEGORIES CRUD ====================
export interface AdminCategoryItem {
  id: number;
  code: string;
  icon: string;
  name: string;
  slug: string;
  productCount: number;
  status: "Active" | "Hidden";
  desc?: string;
}

export const fetchAdminCategories = async (): Promise<AdminCategoryItem[]> => {
  try {
    const supabase = createClient();
    const { data: catRows, error } = await supabase
      .from("categories")
      .select("*")
      .order("id", { ascending: true });

    if (error || !catRows) return [];

    const { data: prodRows } = await supabase.from("products").select("category");

    return catRows.map((c: any) => {
      const pCount = (prodRows || []).filter(
        (p: any) => p.category === c.category_id || p.category === c.slug || p.category === c.name
      ).length;
      return {
        id: Number(c.id),
        code: String(c.category_id || `C${String(c.id).padStart(4, "0")}`),
        icon: String(c.icon || "Folder"),
        name: String(c.name),
        slug: String(c.slug || c.category_id),
        productCount: pCount,
        status: c.status === "Hidden" ? "Hidden" : "Active",
        desc: String(c.description || ""),
      };
    });
  } catch (err) {
    console.error("Error fetching admin categories:", err);
    return [];
  }
};

export const saveAdminCategory = async (cat: Partial<AdminCategoryItem>): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("categories").upsert({
      ...(cat.id ? { id: cat.id } : {}),
      category_id: cat.code || cat.slug || `C${Date.now().toString().slice(-4)}`,
      name: cat.name,
      slug: cat.slug || cat.code,
      icon: cat.icon,
      status: cat.status || "Active",
      description: cat.desc,
    });
    return !error;
  } catch (err) {
    console.error("Error saving category:", err);
    return false;
  }
};

export const deleteAdminCategory = async (id: number): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { data: cat } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
    if (cat) {
      const catCode = cat.category_id || `C${String(cat.id).padStart(4, "0")}`;
      await supabase.from("products").delete().or(
        `category.eq.${catCode},category.eq.${cat.slug},category.eq.${cat.name}`
      );
    }
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Error deleting category:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error deleting category:", err);
    return false;
  }
};

// ==================== 4. ORDERS CRUD ====================
export const fetchAdminOrders = async (): Promise<UnifiedOrder[]> => {
  try {
    const supabase = createClient();
    const { data: orderRows, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch orders error:", error.message);
      return [];
    }

    if (!orderRows || orderRows.length === 0) {
      return [];
    }

    const { data: itemRows } = await supabase.from("order_items").select("*");

    const dbOrders: UnifiedOrder[] = orderRows.map((o: any) => {
      // 1. Read items from JSONB column if present
      let items: any[] = Array.isArray(o.items) ? o.items : [];

      // 2. If empty, fallback to order_items table
      if (items.length === 0 && itemRows) {
        items = itemRows
          .filter((it: any) => it.order_id === o.id)
          .map((it: any) => ({
            name: String(it.product_name),
            image: String(it.image),
            qty: Number(it.qty),
            price: Number(it.price),
          }));
      }

      // 3. Fallback dummy if still empty
      if (items.length === 0) {
        items = [
          {
            name: "Sản phẩm Đơn Hàng " + String(o.id),
            image: "/assets/images/banner/banner-trang-chu-mini-shop.webp",
            qty: 1,
            price: Number(o.subtotal || o.total || 0),
          },
        ];
      }

      return {
        id: String(o.id),
        date: String(o.date),
        status: o.status as any,
        statusText: String(o.status_text || "Đang xử lý"),
        recipientName: String(o.recipient_name),
        recipientPhone: String(o.recipient_phone),
        address: String(o.address),
        paymentMethod: String(o.payment_method),
        items: items,
        subtotal: Number(o.subtotal || 0),
        discount: Number(o.discount || 0),
        total: Number(o.total || 0),
        username: o.username ? String(o.username) : undefined,
        cancelReason: o.cancel_reason ? String(o.cancel_reason) : undefined,
      };
    });

    return dbOrders;
  } catch (err) {
    console.error("Error fetching admin orders:", err);
    return [];
  }
};

export const updateAdminOrderStatus = async (
  orderId: string,
  newStatus: "pending" | "processing" | "shipping" | "completed" | "cancelled",
  cancelReason?: string
): Promise<boolean> => {
  try {
    const supabase = createClient();
    const statusMap = {
      pending: "Chờ xác nhận",
      processing: "Đang xử lý đơn hàng",
      shipping: "Đang vận chuyển",
      completed: "Đã giao hàng thành công",
      cancelled: `Đã hủy đơn${cancelReason ? `: ${cancelReason}` : ""}`,
    };

    const updateObj: any = {
      status: newStatus,
      status_text: statusMap[newStatus],
    };
    if (cancelReason) {
      updateObj.cancel_reason = cancelReason;
    }

    const { error } = await supabase
      .from("orders")
      .update(updateObj)
      .eq("id", orderId);

    return !error;
  } catch (err) {
    console.error("Error updating admin order status:", err);
    return false;
  }
};

// ==================== 5. PRODUCTS CRUD ====================
export const saveAdminProduct = async (product: Partial<Product>): Promise<boolean> => {
  try {
    const supabase = createClient();

    let nextProductId = "";
    if (!product.id) {
      const { data: maxRows } = await supabase
        .from("products")
        .select("id")
        .order("id", { ascending: false })
        .limit(1);

      const maxId = maxRows && maxRows.length > 0 ? Number(maxRows[0].id) : 47;
      nextProductId = `P${String(maxId + 1).padStart(4, "0")}`;
    }

    // Resolve valid category_id matching fk_products_categories foreign key
    const { data: catList } = await supabase.from("categories").select("category_id, name, slug");
    let validCategoryId = product.category || "C0001";
    let catDisplayName = product.categoryName || product.category || "Phòng khách";

    if (catList && catList.length > 0) {
      const match = catList.find(
        (c: any) =>
          c.category_id === product.category ||
          c.name === product.category ||
          c.slug === product.category
      );
      if (match) {
        validCategoryId = match.category_id;
        catDisplayName = match.name;
      } else {
        validCategoryId = catList[0].category_id;
        catDisplayName = catList[0].name;
      }
    }

    const payload: any = {
      name: product.name,
      category: validCategoryId,
      category_name: catDisplayName,
      price: product.price,
      stock: product.stock !== undefined ? Number(product.stock) : 15,
      status: product.status || "Active",
      image: product.image,
      description: product.description || "",
      full_desc: product.fullDesc || product.description || "",
    };

    if (product.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) {
        console.error("Error updating product:", error.message);
        return false;
      }
      return true;
    } else {
      const { error } = await supabase.from("products").insert({
        ...payload,
        product_id: nextProductId,
      });
      if (error) {
        console.error("Error inserting product:", error.message);
        return false;
      }
      return true;
    }
  } catch (err) {
    console.error("Error saving admin product:", err);
    return false;
  }
};

export const deleteAdminProduct = async (id: number): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.error("Error deleting product:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error deleting product:", err);
    return false;
  }
};
