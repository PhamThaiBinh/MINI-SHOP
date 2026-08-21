export interface UnifiedOrderItem {
  name: string;
  image: string;
  qty: number;
  price: number;
}

export interface UnifiedOrder {
  id: string; // e.g. "#MS-9824"
  date: string; // e.g. "15/08/2026 17:30:50"
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  statusText: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: string;
  items: UnifiedOrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  username?: string;
  cancelReason?: string;
}

export const formatFullTimestamp = (d?: Date): string => {
  const date = d || new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};

export const parseOrderDate = (dateStr: string): number => {
  if (!dateStr) return 0;
  try {
    const parts = dateStr.trim().split(" ");
    const dateParts = parts[0].split("/");
    const day = parseInt(dateParts[0] || "1", 10);
    const month = parseInt(dateParts[1] || "1", 10) - 1;
    const year = parseInt(dateParts[2] || "2026", 10);
    let hours = 0, minutes = 0, seconds = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(":");
      hours = parseInt(timeParts[0] || "0", 10);
      minutes = parseInt(timeParts[1] || "0", 10);
      seconds = parseInt(timeParts[2] || "0", 10);
    }
    return new Date(year, month, day, hours, minutes, seconds).getTime();
  } catch (e) {
    return 0;
  }
};

export const DEFAULT_UNIFIED_ORDERS: UnifiedOrder[] = [];

const STORAGE_KEY = "minishop_all_orders";

export const getStatusText = (status: UnifiedOrder["status"]): string => {
  switch (status) {
    case "pending":
      return "Đã tiếp nhận đơn";
    case "processing":
      return "Đang chuẩn bị hàng";
    case "shipping":
      return "Đang vận chuyển";
    case "completed":
      return "Giao hàng thành công";
    case "cancelled":
      return "Đã hủy đơn";
    default:
      return "Đang xử lý";
  }
};

export const getAllOrders = (): UnifiedOrder[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let list: UnifiedOrder[] = [];
    if (raw) {
      list = JSON.parse(raw);
    }

    // Extract orders stored inside mini_shop_users / mini_shop_user_v2
    const extraOrders: UnifiedOrder[] = [];
    try {
      const usersRaw = localStorage.getItem("mini_shop_users");
      if (usersRaw) {
        const users = JSON.parse(usersRaw);
        if (Array.isArray(users)) {
          users.forEach((u: any) => {
            if (u.placedOrders && Array.isArray(u.placedOrders)) {
              u.placedOrders.forEach((po: any) => {
                extraOrders.push({
                  id: po.id,
                  date: po.date,
                  status: po.status || "pending",
                  statusText: po.statusText || "Đang xử lý",
                  recipientName: po.recipientName || u.name || u.username,
                  recipientPhone: po.recipientPhone || u.phone || "",
                  address: po.address || "",
                  paymentMethod: po.paymentMethod || "COD",
                  items: po.items || [],
                  subtotal: po.subtotal || po.total || 0,
                  discount: po.discount || 0,
                  total: po.total || 0,
                  username: u.username,
                });
              });
            }
          });
        }
      }
      const currentUserRaw = localStorage.getItem("mini_shop_user_v2");
      if (currentUserRaw) {
        const cu = JSON.parse(currentUserRaw);
        if (cu && cu.placedOrders && Array.isArray(cu.placedOrders)) {
          cu.placedOrders.forEach((po: any) => {
            extraOrders.push({
              id: po.id,
              date: po.date,
              status: po.status || "pending",
              statusText: po.statusText || "Đang xử lý",
              recipientName: po.recipientName || cu.name || cu.username,
              recipientPhone: po.recipientPhone || cu.phone || "",
              address: po.address || "",
              paymentMethod: po.paymentMethod || "COD",
              items: po.items || [],
              subtotal: po.subtotal || po.total || 0,
              discount: po.discount || 0,
              total: po.total || 0,
              username: cu.username,
            });
          });
        }
      }
    } catch (err) {
      console.error("Error reading extra user orders:", err);
    }

    // Merge orders avoiding duplicates by ID
    const mergedMap = new Map<string, UnifiedOrder>();
    [...list, ...extraOrders].forEach((o) => {
      if (o && o.id && o.id !== "#MS-1024" && o.id !== "#MS-9824" && o.id !== "#MS-7102") {
        mergedMap.set(o.id.toUpperCase(), o);
      }
    });

    const result = Array.from(mergedMap.values()).sort(
      (a, b) => parseOrderDate(b.date) - parseOrderDate(a.date)
    );
    return result;
  } catch (e) {
    console.error("Error reading orders:", e);
    return [];
  }
};

export const clearAllLocalOrders = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    const usersRaw = localStorage.getItem("mini_shop_users");
    if (usersRaw) {
      const users = JSON.parse(usersRaw);
      if (Array.isArray(users)) {
        users.forEach((u: any) => {
          u.placedOrders = [];
        });
        localStorage.setItem("mini_shop_users", JSON.stringify(users));
      }
    }
    const currentUserRaw = localStorage.getItem("mini_shop_user_v2");
    if (currentUserRaw) {
      const cu = JSON.parse(currentUserRaw);
      if (cu) {
        cu.placedOrders = [];
        localStorage.setItem("mini_shop_user_v2", JSON.stringify(cu));
      }
    }
    window.dispatchEvent(new Event("ordersUpdated"));
  } catch (e) {
    console.error("Error clearing local orders:", e);
  }
};

export const saveAllOrders = (orders: UnifiedOrder[]) => {
  if (typeof window === "undefined") return;
  try {
    const sorted = [...orders].sort((a, b) => parseOrderDate(b.date) - parseOrderDate(a.date));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new Event("ordersUpdated"));
  } catch (e) {
    console.error("Error saving orders:", e);
  }
};

export const addPlacedOrder = (newOrder: UnifiedOrder) => {
  const current = getAllOrders();
  const exists = current.some((o) => o.id === newOrder.id);
  let updated: UnifiedOrder[];
  if (exists) {
    updated = current.map((o) => (o.id === newOrder.id ? newOrder : o));
  } else {
    updated = [newOrder, ...current];
  }
  saveAllOrders(updated);
};

export const updateOrderStatus = (orderId: string, newStatus: UnifiedOrder["status"]) => {
  const current = getAllOrders();
  const updated = current.map((o) => {
    if (o.id.toUpperCase() === orderId.toUpperCase() || o.id.replace("#", "") === orderId.replace("#", "")) {
      return {
        ...o,
        status: newStatus,
        statusText: getStatusText(newStatus),
      };
    }
    return o;
  });
  saveAllOrders(updated);
};

export const cancelOrderWithReason = (orderId: string, reason: string) => {
  const current = getAllOrders();
  const updated = current.map((o) => {
    if (o.id.toUpperCase() === orderId.toUpperCase() || o.id.replace("#", "") === orderId.replace("#", "")) {
      return {
        ...o,
        status: "cancelled" as const,
        statusText: "Đã hủy đơn",
        cancelReason: reason,
      };
    }
    return o;
  });
  saveAllOrders(updated);
};

export const getOrdersForUser = (phoneOrUsername: string): UnifiedOrder[] => {
  const all = getAllOrders();
  const cleanKey = phoneOrUsername.trim().toLowerCase().replace(/\D/g, "");
  return all.filter((o) => {
    const phoneClean = o.recipientPhone.replace(/\D/g, "");
    return (
      (o.username && o.username.toLowerCase() === phoneOrUsername.toLowerCase()) ||
      (cleanKey && phoneClean.includes(cleanKey))
    );
  });
};

export const lookupOrder = (code: string, phone: string): UnifiedOrder | null => {
  const all = getAllOrders();
  const codeClean = code.trim().toUpperCase().replace("#", "");
  const phoneClean = phone.trim().replace(/\D/g, "");

  return (
    all.find((o) => {
      const oCodeClean = o.id.toUpperCase().replace("#", "");
      const oPhoneClean = o.recipientPhone.replace(/\D/g, "");
      const matchCode = oCodeClean === codeClean;
      const matchPhone = !phoneClean || oPhoneClean.includes(phoneClean) || phoneClean.includes(oPhoneClean);
      return matchCode && matchPhone;
    }) || null
  );
};
