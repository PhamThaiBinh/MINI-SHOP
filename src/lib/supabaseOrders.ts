import { createClient } from "@/utils/supabase/client";
import { UnifiedOrder, lookupOrder as lookupOrderLocal } from "@/utils/orderStorage";

export const lookupOrderFromSupabase = async (
  code: string,
  phone: string
): Promise<UnifiedOrder | null> => {
  const cleanCode = code.trim().toUpperCase().replace("#", "");
  const cleanPhone = phone.trim().replace(/\D/g, "");

  try {
    const supabase = createClient();

    // Query orders from Supabase
    const { data: orderRows, error: orderErr } = await supabase
      .from("orders")
      .select("*");

    if (orderErr || !orderRows || orderRows.length === 0) {
      console.warn("Supabase lookup order error/empty, falling back to local storage:", orderErr?.message);
      return lookupOrderLocal(code, phone);
    }

    // Match code and phone
    const matched = orderRows.find((o: any) => {
      const oCodeClean = String(o.id).toUpperCase().replace("#", "");
      const oPhoneClean = String(o.recipient_phone || "").replace(/\D/g, "");

      const matchCode = oCodeClean === cleanCode;
      const matchPhone =
        !cleanPhone || oPhoneClean.includes(cleanPhone) || cleanPhone.includes(oPhoneClean);

      return matchCode && matchPhone;
    });

    if (!matched) {
      return lookupOrderLocal(code, phone);
    }

    const items = Array.isArray(matched.items) ? matched.items : [];

    return {
      id: String(matched.id),
      date: String(matched.date),
      status: matched.status as any,
      statusText: String(matched.status_text || "Đang xử lý"),
      recipientName: String(matched.recipient_name),
      recipientPhone: String(matched.recipient_phone),
      address: String(matched.address),
      paymentMethod: String(matched.payment_method),
      items: items,
      subtotal: Number(matched.subtotal || 0),
      discount: Number(matched.discount || 0),
      total: Number(matched.total || 0),
      username: matched.username ? String(matched.username) : undefined,
      cancelReason: matched.cancel_reason ? String(matched.cancel_reason) : undefined,
    };
  } catch (err) {
    console.error("Error looking up order from Supabase:", err);
    return lookupOrderLocal(code, phone);
  }
};

export const fetchUserOrdersFromSupabase = async (
  phone?: string,
  email?: string,
  username?: string
): Promise<UnifiedOrder[]> => {
  const cleanPhone = phone ? phone.trim().replace(/\D/g, "") : "";
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const cleanUsername = username ? username.trim().toLowerCase() : "";

  // Get local user orders first
  const { getAllOrders, parseOrderDate } = await import("@/utils/orderStorage");
  const localAll = getAllOrders();
  const localUserOrders = localAll.filter((o) => {
    const oPhone = (o.recipientPhone || "").replace(/\D/g, "");
    const oUser = (o.username || "").toLowerCase();
    const matchPhone = cleanPhone && (oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone));
    const matchUser = cleanUsername && oUser === cleanUsername;
    return matchPhone || matchUser;
  });

  try {
    const supabase = createClient();
    const { data: orderRows, error } = await supabase
      .from("orders")
      .select("*");

    if (error || !orderRows || orderRows.length === 0) {
      return localUserOrders;
    }

    const matchedSupabaseOrders: UnifiedOrder[] = orderRows
      .filter((o: any) => {
        const oPhone = String(o.recipient_phone || "").replace(/\D/g, "");
        const oUser = String(o.username || "").toLowerCase();
        const matchPhone = cleanPhone && (oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone));
        const matchUser = cleanUsername && oUser === cleanUsername;
        return matchPhone || matchUser;
      })
      .map((o: any) => ({
        id: String(o.id),
        date: String(o.date),
        status: o.status as any,
        statusText: String(o.status_text || "Đang xử lý"),
        recipientName: String(o.recipient_name),
        recipientPhone: String(o.recipient_phone),
        address: String(o.address),
        paymentMethod: String(o.payment_method),
        items: Array.isArray(o.items) ? o.items : [],
        subtotal: Number(o.subtotal || 0),
        discount: Number(o.discount || 0),
        total: Number(o.total || 0),
        username: o.username ? String(o.username) : undefined,
        cancelReason: o.cancel_reason ? String(o.cancel_reason) : undefined,
      }));

    // Merge Supabase orders with local orders avoiding duplicates by ID
    const mergedMap = new Map<string, UnifiedOrder>();
    [...matchedSupabaseOrders, ...localUserOrders].forEach((ord) => {
      mergedMap.set(ord.id.toUpperCase(), ord);
    });

    const result = Array.from(mergedMap.values()).sort(
      (a, b) => parseOrderDate(b.date) - parseOrderDate(a.date)
    );
    return result;
  } catch (err) {
    console.error("Error fetching user orders from Supabase:", err);
    return localUserOrders;
  }
};

export const createOrderInSupabase = async (orderData: UnifiedOrder): Promise<boolean> => {
  try {
    const supabase = createClient();

    // Insert Order Record with items JSONB
    const { error: orderErr } = await supabase.from("orders").insert({
      id: orderData.id,
      date: orderData.date,
      status: orderData.status,
      status_text: orderData.statusText,
      recipient_name: orderData.recipientName,
      recipient_phone: orderData.recipientPhone,
      address: orderData.address,
      payment_method: orderData.paymentMethod,
      items: orderData.items || [],
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      username: orderData.username || null,
      cancel_reason: orderData.cancelReason || null,
    });

    if (orderErr) {
      console.error("Error inserting order to Supabase:", orderErr.message);
      return false;
    }

    // Insert relational items into order_items table
    if (orderData.items && orderData.items.length > 0) {
      try {
        const itemInserts = orderData.items.map((it) => ({
          order_id: orderData.id,
          product_name: it.name,
          image: it.image,
          qty: it.qty,
          price: it.price,
        }));
        await supabase.from("order_items").insert(itemInserts);
      } catch (e) {
        console.warn("Could not insert order_items rows:", e);
      }
    }

    // Deduct stock for ordered items
    if (orderData.items && orderData.items.length > 0) {
      for (const item of orderData.items) {
        try {
          const { data: prodRows } = await supabase
            .from("products")
            .select("id, stock")
            .ilike("name", item.name)
            .limit(1);

          if (prodRows && prodRows.length > 0) {
            const p = prodRows[0];
            const newStock = Math.max(0, (p.stock ?? 50) - item.qty);
            await supabase
              .from("products")
              .update({ stock: newStock, status: newStock === 0 ? "Out of stock" : "In stock" })
              .eq("id", p.id);
          }
        } catch (e) {
          console.error("Error deducting stock:", e);
        }
      }
    }

    return true;
  } catch (err) {
    console.error("Error creating order in Supabase:", err);
    return false;
  }
};
