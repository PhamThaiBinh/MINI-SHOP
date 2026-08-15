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

    // Fetch order items for matched order
    const { data: itemRows } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", matched.id);

    const items = (itemRows || []).map((it: any) => ({
      name: String(it.product_name),
      image: String(it.image),
      qty: Number(it.qty),
      price: Number(it.price),
    }));

    return {
      id: String(matched.id),
      date: String(matched.date),
      status: matched.status as any,
      statusText: String(matched.status_text || "📋 Đang xử lý"),
      recipientName: String(matched.recipient_name),
      recipientPhone: String(matched.recipient_phone),
      address: String(matched.address),
      paymentMethod: String(matched.payment_method),
      items: items.length > 0 ? items : [],
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

export const createOrderInSupabase = async (orderData: UnifiedOrder): Promise<boolean> => {
  try {
    const supabase = createClient();

    // 1. Insert Order Record
    const { error: orderErr } = await supabase.from("orders").insert({
      id: orderData.id,
      date: orderData.date,
      status: orderData.status,
      status_text: orderData.statusText,
      recipient_name: orderData.recipientName,
      recipient_phone: orderData.recipientPhone,
      address: orderData.address,
      payment_method: orderData.paymentMethod,
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

    // 2. Insert Order Items
    if (orderData.items && orderData.items.length > 0) {
      const itemsToInsert = orderData.items.map((it) => ({
        order_id: orderData.id,
        product_name: it.name,
        image: it.image,
        qty: it.qty,
        price: it.price,
      }));

      const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);

      if (itemsErr) {
        console.error("Error inserting order items to Supabase:", itemsErr.message);
      }
    }

    return true;
  } catch (err) {
    console.error("Error creating order in Supabase:", err);
    return false;
  }
};
