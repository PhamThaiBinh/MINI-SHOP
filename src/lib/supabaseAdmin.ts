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
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((u: any) => ({
      id: Number(u.id),
      avatarText: String(u.avatar_text || "U"),
      avatarBg: String(u.avatar_bg || "#2563eb"),
      name: String(u.name),
      username: String(u.username),
      email: String(u.email || ""),
      phone: String(u.phone || ""),
      role: String(u.role || "Khách hàng"),
      roleType: (u.role_type === "admin" ? "admin" : "customer") as any,
      registeredDate: String(u.registered_date || "01/01/2026"),
      status: (u.status === "Blocked" ? "Blocked" : "Active") as any,
    }));
  } catch (err) {
    console.error("Error fetching admin users:", err);
    return [];
  }
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
        status: "Active",
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
      slug: cat.slug,
      icon: cat.icon,
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
    const { error } = await supabase.from("categories").delete().eq("id", id);
    return !error;
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

    if (error || !orderRows) return [];

    const { data: itemRows } = await supabase.from("order_items").select("*");

    return orderRows.map((o: any) => {
      const items = (itemRows || [])
        .filter((it: any) => it.order_id === o.id)
        .map((it: any) => ({
          name: String(it.product_name),
          image: String(it.image),
          qty: Number(it.qty),
          price: Number(it.price),
        }));

      const finalItems =
        items.length > 0
          ? items
          : [
              {
                name: "Sản phẩm Đơn Hàng #" + String(o.id),
                image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
                qty: 1,
                price: Number(o.subtotal || o.total || 0),
              },
            ];

      return {
        id: String(o.id),
        date: String(o.date),
        status: o.status as any,
        statusText: String(o.status_text || "Đang xử lý"),
        recipientName: String(o.recipient_name),
        recipientPhone: String(o.recipient_phone),
        address: String(o.address),
        paymentMethod: String(o.payment_method),
        items: finalItems,
        subtotal: Number(o.subtotal || 0),
        discount: Number(o.discount || 0),
        total: Number(o.total || 0),
        username: o.username ? String(o.username) : undefined,
        cancelReason: o.cancel_reason ? String(o.cancel_reason) : undefined,
      };
    });
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
    const { error } = await supabase.from("products").upsert({
      original_id: product.id || Math.floor(1000 + Math.random() * 9000),
      name: product.name,
      category: product.category,
      category_name: product.categoryName || product.category,
      price: product.price,
      old_price: product.oldPrice || null,
      status: product.status || "Active",
      badge: product.badge || null,
      badge_type: product.badgeType || null,
      image: product.image,
      description: product.description || "",
      full_desc: product.fullDesc || product.description || "",
      specs: product.specs || {},
    }, { onConflict: "original_id" });

    return !error;
  } catch (err) {
    console.error("Error saving admin product:", err);
    return false;
  }
};

export const deleteAdminProduct = async (id: number): Promise<boolean> => {
  try {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().or(`original_id.eq.${id},id.eq.${id}`);
    return !error;
  } catch (err) {
    console.error("Error deleting product:", err);
    return false;
  }
};
