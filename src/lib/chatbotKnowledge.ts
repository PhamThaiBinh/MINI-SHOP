import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { fetchAdminVouchers } from "@/lib/supabaseAdmin";
import { lookupOrderFromSupabase } from "@/lib/supabaseOrders";
import { PRODUCTS_DATA } from "@/data/products";
import { Product } from "@/types/product";
import { SystemVoucher } from "@/utils/voucherStorage";

export interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
  products?: Product[];
  orderInfo?: {
    code: string;
    status: string;
    customer_name: string;
    total_amount: number;
    created_at: string;
  };
  vouchers?: {
    code: string;
    discount: string;
    minOrder: string;
    desc: string;
  }[];
  quickReplies?: string[];
}

// System Knowledge Base (FAQs & Store Policies)
const FAQ_KNOWLEDGE = [
  {
    keywords: ["bao hanh", "bảo hành", "hu hong", "hư hỏng", "loi", "lỗi", "bao hanh bao lau"],
    response:
      "Chính Sách Bảo Hành Tại MINI SHOP:\n- Tất cả sản phẩm nội thất gỗ, bàn ghế, sofa, giường tủ đều được bảo hành chính hãng từ 12 - 24 tháng.\n- Hỗ trợ 1 đổi 1 trong 7 ngày đầu nếu có lỗi từ nhà sản xuất.\n- Đội ngũ kỹ thuật viên hỗ trợ bảo hành tận nơi nhanh chóng!",
  },
  {
    keywords: ["giao hang", "vận chuyển", "ship", "phi ship", "phí ship", "thoi gian giao", "bao lau", "freeship", "mien phi ship"],
    response:
      "Chính Sách Vận Chuyển & Giao Hàng:\n- MIỄN PHÍ VẬN CHUYỂN toàn quốc cho đơn hàng từ 500.000đ trở lên.\n- Giao hỏa tốc trong 2 - 4 giờ tại khu vực nội thành.\n- Giao hàng tiêu chuẩn toàn quốc từ 2 - 3 ngày làm việc.",
  },
  {
    keywords: ["thanh toan", "thanh toán", "chuyen khoan", "chuyển khoản", "cod", "banking", "qr", "tra gop"],
    response:
      "Phương Thức Thanh Toán Linh Hoạt:\n- Thanh toán khi nhận hàng (COD).\n- Chuyển khoản ngân hàng qua mã VietQR tự động xác nhận tức thì.\n- Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng.",
  },
  {
    keywords: ["doi tra", "đổi trả", "tra hang", "trả hàng", "hoan tien", "hoàn tiền", "7 ngay", "7 ngày"],
    response:
      "Chính Sách Đổi Trả & Trả Hàng (7 Ngày):\n- Quý khách có quyền yêu cầu Trả hàng / Hoàn tiền trong vòng 7 ngày kể từ khi nhận hàng nếu không ưng ý hoặc sản phẩm không đúng mô tả.\n- Thao tác trực tiếp tại mục 'Lịch sử đơn hàng' trong trang cá nhân!",
  },
  {
    keywords: ["dia chi", "địa chỉ", "showroom", "cua hang", "cửa hàng", "o dau", "ở đâu", "vi tri", "map"],
    response:
      "Hệ Thống Showroom MINI SHOP:\n- Địa chỉ: 123 Nguyễn Văn Cừ, Phường 2, Quận 5, TP. Hồ Chí Minh.\n- Thời gian mở cửa: 8:00 - 21:00 (Tất cả các ngày trong tuần).\n- Hotline tư vấn: 0988.123.456",
  },
  {
    keywords: ["tich diem", "tích điểm", "doi diem", "đổi điểm", "rewards", "xu"],
    response:
      "Chương Trình Điểm Thưởng Khách Hàng Thân Thiết:\n- Tích lũy 1 điểm cho mỗi 10.000đ giá trị đơn hàng.\n- Dùng điểm để đổi các mã Voucher giảm giá 50.000đ, 100.000đ hoặc Miễn phí vận chuyển tại mục 'Điểm thưởng'!",
  },
];

// Active Vouchers Fallback
export const VOUCHERS_DATA = [
  {
    code: "WELCOME50",
    discount: "Giảm 50.000đ",
    minOrder: "Đơn từ 200.000đ",
    desc: "Dành riêng cho khách hàng đăng ký tài khoản lần đầu.",
  },
  {
    code: "MINI10",
    discount: "Giảm 10%",
    minOrder: "Đơn từ 500.000đ",
    desc: "Ưu đãi mua sắm đồ nội thất phòng khách & phòng ngủ.",
  },
  {
    code: "FREESHIP",
    discount: "Miễn phí Vận Chuyển",
    minOrder: "Mọi đơn hàng",
    desc: "Áp dụng giao hàng tiêu chuẩn toàn quốc.",
  },
];

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Category keyword dictionary for intelligent classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Ghế": ["ghe", "ghe xoay", "ghe an", "ghe gaming", "ghe luoi", "ghe linh hoat", "ghe go", "ghe tua", "ghe bar"],
  "Giường": ["giuong", "giuong ngu", "giuong don", "giuong doi", "giuong tang", "giuong go", "giuong gap", "giuong pallet"],
  "Bàn": ["ban", "ban an", "ban lam viec", "ban tra", "ban trang diem", "ban hoc", "ban sofa", "ban go", "ban cafe"],
  "Sofa": ["sofa", "salon", "sofa da", "sofa ni", "sofa goc", "sofa phong khach", "sofa don", "sofa giuong", "sofa bed"],
  "Tủ kệ": ["tu", "ke", "tu quan ao", "tu giay", "tu dau giuong", "tu bep", "ke tivi", "ke sach", "ke trang tri", "ke giay", "tu go"],
  "Rèm cửa": ["rem", "rem cua", "rem cuon", "man cua", "rem vai"],
  "Đèn trang trí": ["den", "den ngu", "den chum", "den cay", "den ban", "den trang tri", "den led"],
  "Nệm & Chăn ga": ["nem", "dem", "nem cao su", "nem bong ep", "nem lo xo", "chan ga"],
};

export interface ExtractedIntent {
  categories: string[];
  productKeywords: string[];
  minPrice?: number;
  maxPrice?: number;
  isSale?: boolean;
  orderCode?: string;
  isVoucher?: boolean;
  isFaq?: boolean;
  faqResponse?: string;
}

/**
 * Intelligent Natural Language Keyword & Intent Parser
 */
export function parseUserIntent(query: string): ExtractedIntent {
  const normalized = normalizeText(query);
  const matchedCategories = new Set<string>();
  const productKeywords: string[] = [];

  // 1. Check Order Tracking (#MS-xxxx or Oxxxx)
  const orderRegex = /(?:MS-?|O)?\d{4,8}/i;
  const orderCodeMatch = query.match(orderRegex);
  let orderCode: string | undefined;
  if (
    orderCodeMatch &&
    (normalized.includes("don hang") ||
      normalized.includes("tra cuu") ||
      normalized.includes("kiem tra don") ||
      normalized.includes("ma don") ||
      query.toUpperCase().includes("MS-") ||
      query.toUpperCase().includes("O0"))
  ) {
    orderCode = orderCodeMatch[0].toUpperCase();
  }

  // 2. Check Voucher / Promotion
  const isVoucher =
    normalized.includes("voucher") ||
    normalized.includes("ma giam gia") ||
    normalized.includes("khuyen mai") ||
    normalized.includes("ma khuyen mai") ||
    normalized.includes("uu dai") ||
    normalized.includes("giam gia");

  // 3. Check FAQ Knowledge Base
  let faqResponse: string | undefined;
  for (const faq of FAQ_KNOWLEDGE) {
    if (faq.keywords.some((kw) => normalized.includes(kw))) {
      faqResponse = faq.response;
      break;
    }
  }

  // 4. Extract Category Tokens with conjunction support ("hoặc", "và", ",", "hay", "với")
  Object.entries(CATEGORY_KEYWORDS).forEach(([catName, keywords]) => {
    for (const kw of keywords) {
      // Use regex word boundary check
      const regex = new RegExp(`\\b${kw}\\b`, "i");
      if (regex.test(normalized)) {
        matchedCategories.add(catName);
        productKeywords.push(kw);
        break;
      }
    }
  });

  // 5. Extract Price Constraints
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  // Pattern: dưới 500k, dưới 1 triệu, < 2tr
  const underPriceMatch = normalized.match(/(?:duoi|nho hon|<|khong qua)\s*(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|trieu|tr|m)?/);
  if (underPriceMatch) {
    let val = parseFloat(underPriceMatch[1].replace(",", "."));
    const unit = underPriceMatch[2] || "";
    if (unit.includes("tr") || unit.includes("m") || unit.includes("trieu")) {
      val *= 1000000;
    } else if (unit.includes("k") || unit.includes("nghin") || unit.includes("ngan") || val < 1000) {
      val *= 1000;
    }
    maxPrice = val;
  }

  // Pattern: trên 1 triệu, > 500k
  const overPriceMatch = normalized.match(/(?:tren|lon hon|>|tu)\s*(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|trieu|tr|m)?/);
  if (overPriceMatch && !underPriceMatch) {
    let val = parseFloat(overPriceMatch[1].replace(",", "."));
    const unit = overPriceMatch[2] || "";
    if (unit.includes("tr") || unit.includes("m") || unit.includes("trieu")) {
      val *= 1000000;
    } else if (unit.includes("k") || unit.includes("nghin") || unit.includes("ngan") || val < 1000) {
      val *= 1000;
    }
    minPrice = val;
  }

  // 6. Check Sale / Flash Sale intent
  const isSale =
    normalized.includes("flash sale") ||
    normalized.includes("giam gia") ||
    normalized.includes("sale") ||
    normalized.includes("hot") ||
    normalized.includes("ban chay");

  return {
    categories: Array.from(matchedCategories),
    productKeywords,
    minPrice,
    maxPrice,
    isSale,
    orderCode,
    isVoucher,
    isFaq: Boolean(faqResponse),
    faqResponse,
  };
}

/**
 * Format product list into a readable clean text summary
 */
function formatProductListToText(title: string, products: Product[]): string {
  if (products.length === 0) return title;
  const productTextLines = products.map((p, idx) => {
    const formattedPrice = p.price.toLocaleString("vi-VN") + "đ";
    const oldPriceText = p.oldPrice ? ` (Giá gốc: ${p.oldPrice.toLocaleString("vi-VN")}đ)` : "";
    return `${idx + 1}. ${p.name}\n   - Giá bán: ${formattedPrice}${oldPriceText}\n   - Danh mục: ${p.categoryName || p.category}`;
  });
  return `${title}\n\n${productTextLines.join("\n\n")}`;
}

/**
 * MAIN AI QUERY PROCESSOR - Fetches real-time data from Supabase!
 */
export async function processUserQueryAsync(userQuery: string, currentUser?: any): Promise<ChatMessage> {
  const timestamp = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const id = `msg-${Date.now()}`;
  const normalized = normalizeText(userQuery);
  const intent = parseUserIntent(userQuery);

  // 1. ORDER TRACKING INTENT (Query Supabase Orders table)
  if (intent.orderCode) {
    try {
      const order = await lookupOrderFromSupabase(intent.orderCode, currentUser?.phone || "");
      if (order) {
        return {
          id,
          sender: "bot",
          text: `Em đã tìm thấy thông tin đơn hàng #${order.id} của anh/chị trên hệ thống:\n- Trạng thái: ${order.statusText || order.status}\n- Người nhận: ${order.recipientName} (${order.recipientPhone})\n- Tổng tiền: ${order.total.toLocaleString("vi-VN")}đ\n- Ngày đặt: ${order.date}`,
          timestamp,
          orderInfo: {
            code: order.id,
            status: order.statusText || order.status,
            customer_name: order.recipientName,
            total_amount: order.total,
            created_at: order.date,
          },
          quickReplies: ["Tra cứu đơn khác", "Chính sách giao hàng", "Gặp tư vấn viên"],
        };
      }
    } catch (e) {
      console.warn("Order lookup error:", e);
    }

    return {
      id,
      sender: "bot",
      text: `Dạ, em chưa tìm thấy đơn hàng với mã #${intent.orderCode} trên hệ thống. Anh/chị vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại đặt hàng giúp em nhé!`,
      timestamp,
      quickReplies: ["Tra cứu lại đơn hàng", "Gặp tư vấn viên", "Xem chính sách bảo hành"],
    };
  }

  // 2. VOUCHER & PROMOTION INTENT (Query Supabase Vouchers table)
  if (intent.isVoucher) {
    try {
      const systemVouchers = await fetchAdminVouchers();
      const activeVouchers = systemVouchers.filter((v) => v.isActive);

      if (activeVouchers.length > 0) {
        const formattedVouchers = activeVouchers.map((v) => ({
          code: v.code,
          discount: v.percent ? `Giảm ${v.percent}%` : `Giảm ${(v.fixedDiscount || 0).toLocaleString("vi-VN")}đ`,
          minOrder: v.minOrder ? `Đơn từ ${v.minOrder.toLocaleString("vi-VN")}đ` : "Mọi đơn hàng",
          desc: v.desc || "Áp dụng cho các sản phẩm tại MINI SHOP.",
        }));

        const voucherText = formattedVouchers
          .map((v, i) => `${i + 1}. Mã: ${v.code} - ${v.discount} (${v.minOrder})\n   ${v.desc}`)
          .join("\n\n");

        return {
          id,
          sender: "bot",
          text: `Dạ, MINI SHOP hiện đang có các mã giảm giá siêu ưu đãi dành cho anh/chị hôm nay:\n\n${voucherText}\n\nAnh/chị có thể nhấn nút "Sao chép" trực tiếp bên dưới để áp dụng khi thanh toán!`,
          timestamp,
          vouchers: formattedVouchers,
          quickReplies: ["Tư vấn bàn ghế", "Tư vấn sofa", "Xem Flash Sale"],
        };
      }
    } catch (e) {
      console.warn("Voucher fetch error:", e);
    }

    return {
      id,
      sender: "bot",
      text: "Dạ, hiện tại mã giảm giá WELCOME50 (giảm 50k) và FREESHIP đang sẵn sàng. Anh/chị có thể áp dụng ngay tại bước thanh toán!",
      timestamp,
      vouchers: VOUCHERS_DATA,
      quickReplies: ["Tư vấn bàn ghế", "Tư vấn sofa", "Xem Flash Sale"],
    };
  }

  // 3. PRODUCT INTENT: Match specific categories or keywords from Supabase!
  // Example: "Tôi muốn mua ghế hoặc giường?" -> intent.categories = ["Ghế", "Giường"]
  const allProducts = await fetchProductsFromSupabase(false);

  if (intent.categories.length > 0) {
    const matchedProducts: Product[] = [];
    const categoryLabels = intent.categories.join(" và ");

    // Gather best products per matched category
    intent.categories.forEach((cat) => {
      let filtered = allProducts.filter((p) => {
        const pCat = normalizeText(p.category || "");
        const pCatName = normalizeText(p.categoryName || "");
        const pName = normalizeText(p.name || "");
        const targetCat = normalizeText(cat);

        return pCat.includes(targetCat) || pCatName.includes(targetCat) || pName.includes(targetCat);
      });

      // Apply price filter if present
      if (intent.maxPrice) {
        filtered = filtered.filter((p) => p.price <= (intent.maxPrice || Infinity));
      }
      if (intent.minPrice) {
        filtered = filtered.filter((p) => p.price >= (intent.minPrice || 0));
      }

      // Pick top 2 items from each category
      matchedProducts.push(...filtered.slice(0, 2));
    });

    // If no direct category match, search broadly across product names
    let finalProducts = matchedProducts;
    if (finalProducts.length === 0) {
      finalProducts = allProducts
        .filter((p) => {
          const normName = normalizeText(p.name);
          return intent.productKeywords.some((kw) => normName.includes(kw));
        })
        .slice(0, 4);
    }

    // Fallback if still empty
    if (finalProducts.length === 0) {
      finalProducts = allProducts.slice(0, 3);
    }

    let introTitle = `Dạ, em đã tìm thấy các mẫu ${categoryLabels} đẹp và bán chạy nhất tại MINI SHOP dành cho anh/chị:`;
    if (intent.maxPrice) {
      introTitle = `Dạ, dưới đây là các mẫu ${categoryLabels} có giá dưới ${intent.maxPrice.toLocaleString("vi-VN")}đ phù hợp với yêu cầu của anh/chị:`;
    }

    return {
      id,
      sender: "bot",
      text: formatProductListToText(introTitle, finalProducts),
      timestamp,
      products: finalProducts,
      quickReplies: [
        `Xem thêm mẫu ${intent.categories[0]}`,
        "Kiểm tra mã giảm giá",
        "Tư vấn phí vận chuyển",
      ],
    };
  }

  // 4. GENERAL PRODUCT QUERY OR SEARCH BY KEYWORD (e.g. "san pham go", "do noi that", "phong khach")
  if (
    normalized.includes("san pham") ||
    normalized.includes("do noi that") ||
    normalized.includes("hinh anh") ||
    normalized.includes("tim kiem") ||
    normalized.includes("phong khach") ||
    normalized.includes("phong ngu") ||
    normalized.includes("go")
  ) {
    let matched = allProducts;
    if (normalized.includes("phong khach")) {
      matched = allProducts.filter((p) => normalizeText(p.name).includes("sofa") || normalizeText(p.name).includes("ban tra"));
    } else if (normalized.includes("phong ngu")) {
      matched = allProducts.filter((p) => normalizeText(p.name).includes("giuong") || normalizeText(p.name).includes("tu quan ao"));
    } else if (normalized.includes("go")) {
      matched = allProducts.filter((p) => normalizeText(p.name).includes("go") || normalizeText(p.description || "").includes("go"));
    }

    const finalProducts = matched.length > 0 ? matched.slice(0, 3) : allProducts.slice(0, 3);
    const titleText = "Dạ, dưới đây là danh sách sản phẩm nội thất nổi bật trên hệ thống MINI SHOP:";

    return {
      id,
      sender: "bot",
      text: formatProductListToText(titleText, finalProducts),
      timestamp,
      products: finalProducts,
      quickReplies: ["Tư vấn Bàn ghế", "Tư vấn Sofa", "Lấy mã giảm giá"],
    };
  }

  // 5. FLASH SALE / HOT DISCOUNT QUERY
  if (intent.isSale) {
    const saleProducts = allProducts
      .filter((p) => (p.badge && p.badge.toLowerCase().includes("sale")) || Boolean(p.oldPrice))
      .slice(0, 3);
    const finalSale = saleProducts.length > 0 ? saleProducts : allProducts.slice(0, 3);
    const titleText = "Sản phẩm Flash Sale & Giảm giá đặc biệt hôm nay:";

    return {
      id,
      sender: "bot",
      text: formatProductListToText(titleText, finalSale),
      timestamp,
      products: finalSale,
      quickReplies: ["Xem sản phẩm Bàn", "Xem sản phẩm Sofa", "Lấy mã giảm giá"],
    };
  }

  // 6. FAQ KNOWLEDGE BASE MATCH
  if (intent.isFaq && intent.faqResponse) {
    return {
      id,
      sender: "bot",
      text: intent.faqResponse,
      timestamp,
      quickReplies: ["Tư vấn sản phẩm", "Kiểm tra voucher", "Gặp tư vấn viên"],
    };
  }

  // 7. HUMAN CONSULTANT ESCALATION
  if (
    normalized.includes("tu van vien") ||
    normalized.includes("nguoi that") ||
    normalized.includes("hotline") ||
    normalized.includes("tong dai") ||
    normalized.includes("gap nhan vien")
  ) {
    return {
      id,
      sender: "bot",
      text: "Kết Nối Trực Tiếp Tư Vấn Viên MINI SHOP:\n- Hotline: 0988.123.456 (Hỗ trợ 24/7)\n- Zalo Official: 0988.123.456\n- Giờ làm việc showroom: 8:00 - 21:00 hàng ngày.\n\nNhân viên hỗ trợ sẽ phản hồi trực tiếp ngay trong khung chat này trong giây lát!",
      timestamp,
      quickReplies: ["Tư vấn sản phẩm", "Tra cứu đơn hàng", "Mã giảm giá"],
    };
  }

  // 8. DEFAULT FALLBACK ASSISTANT
  const defaultProducts = allProducts.slice(0, 3);
  const fallbackTitle = "Xin chào! Em là Trợ Lý AI của MINI SHOP.\nDưới đây là một số sản phẩm nổi bật anh/chị có thể tham khảo:";

  return {
    id,
    sender: "bot",
    text: formatProductListToText(fallbackTitle, defaultProducts),
    timestamp,
    products: defaultProducts,
    quickReplies: ["Gợi ý Ghế & Giường", "Gợi ý Sofa & Bàn", "Tra cứu đơn hàng", "Lấy mã giảm giá 50k"],
  };
}

/**
 * Synchronous backward-compatible fallback
 */
export function processUserQuery(userQuery: string): ChatMessage {
  const timestamp = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const id = `msg-${Date.now()}`;
  const defaultProducts = PRODUCTS_DATA.slice(0, 3);
  return {
    id,
    sender: "bot",
    text: formatProductListToText("Dạ, dưới đây là các sản phẩm nội thất nổi bật:", defaultProducts),
    timestamp,
    products: defaultProducts,
    quickReplies: ["Tư vấn bàn ghế", "Tra cứu đơn hàng", "Lấy mã giảm giá"],
  };
}
