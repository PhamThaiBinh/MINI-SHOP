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
    keywords: ["bao hanh", "hu hong", "loi san pham", "bao hanh bao lau", "chinh sach bao hanh"],
    response:
      "Chính Sách Bảo Hành Tại MINI SHOP:\n- Tất cả sản phẩm nội thất gỗ, bàn ghế, sofa, giường tủ đều được bảo hành chính hãng từ 12 - 24 tháng.\n- Hỗ trợ 1 đổi 1 trong 7 ngày đầu nếu có lỗi từ nhà sản xuất.\n- Đội ngũ kỹ thuật viên hỗ trợ bảo hành tận nơi nhanh chóng!",
  },
  {
    keywords: ["giao hang", "van chuyen", "ship", "phi ship", "thoi gian giao", "bao lau nhan duoc", "freeship", "mien phi ship", "giao toan quoc"],
    response:
      "Chính Sách Vận Chuyển & Giao Hàng:\n- MIỄN PHÍ VẬN CHUYỂN toàn quốc cho đơn hàng từ 500.000đ trở lên.\n- Giao hỏa tốc trong 2 - 4 giờ tại khu vực nội thành.\n- Giao hàng tiêu chuẩn toàn quốc từ 2 - 3 ngày làm việc.",
  },
  {
    keywords: ["thanh toan", "chuyen khoan", "cod", "banking", "qr", "tra gop", "quet ma", "the tin dung"],
    response:
      "Phương Thức Thanh Toán Linh Hoạt:\n- Thanh toán khi nhận hàng (COD).\n- Chuyển khoản ngân hàng qua mã VietQR tự động xác nhận tức thì.\n- Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng.",
  },
  {
    keywords: ["doi tra", "tra hang", "hoan tien", "7 ngay", "khong ung y", "doi san pham"],
    response:
      "Chính Sách Đổi Trả & Trả Hàng (7 Ngày):\n- Quý khách có quyền yêu cầu Trả hàng / Hoàn tiền trong vòng 7 ngày kể từ khi nhận hàng nếu không ưng ý hoặc sản phẩm không đúng mô tả.\n- Thao tác trực tiếp tại mục 'Lịch sử đơn hàng' trong trang cá nhân!",
  },
  {
    keywords: ["dia chi", "showroom", "cua hang", "o dau", "vi tri", "map", "chi nhanh", "den xem truc tiep"],
    response:
      "Hệ Thống Showroom MINI SHOP:\n- Địa chỉ: 123 Nguyễn Văn Cừ, Phường 2, Quận 5, TP. Hồ Chí Minh.\n- Thời gian mở cửa: 8:00 - 21:00 (Tất cả các ngày trong tuần).\n- Hotline tư vấn: 0988.123.456",
  },
  {
    keywords: ["tich diem", "doi diem", "rewards", "xu", "tich luy", "hang thanh vien"],
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
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Check if text contains a specific token/phrase matching whole word boundaries
 */
export function hasWordToken(sourceText: string, token: string): boolean {
  if (!sourceText || !token) return false;
  const normSource = normalizeText(sourceText);
  const normToken = normalizeText(token);
  // Match as whole phrase or boundary
  const escaped = normToken.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
  return regex.test(normSource);
}

// Comprehensive Category & Product Keyword Dictionary
export interface CategoryDefinition {
  name: string;
  keywords: string[];
  exactTokens: string[];
}

export const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    name: "Ghế",
    keywords: ["ghế", "ghế xoay", "ghế ăn", "ghế gaming", "ghế lưới", "ghế tựa", "ghế đôn", "ghế thư giãn", "ghế bọc da", "ghế gỗ", "ghế eames", "ghe", "ghe xoay", "ghe an", "ghe gaming", "ghe luoi", "ghe tua", "ghe don", "ghe thu gian", "ghe eames"],
    exactTokens: ["ghe", "ghe xoay", "ghe an", "ghe tua", "ghe don", "ghe thu gian", "ghe eames"],
  },
  {
    name: "Giường",
    keywords: ["giường", "giường ngủ", "giường đơn", "giường đôi", "giường tầng", "giường gỗ", "giường gấp", "giường bọc nệm", "giuong", "giuong ngu", "giuong don", "giuong doi", "giuong tang", "giuong go", "giuong boc nem"],
    exactTokens: ["giuong", "giuong ngu", "giuong don", "giuong doi", "giuong tang", "giuong go", "giuong boc nem"],
  },
  {
    name: "Bàn",
    keywords: ["bàn", "bàn ăn", "bàn làm việc", "bàn trà", "bàn trang điểm", "bàn học", "bàn sofa", "bàn gỗ", "bàn cafe", "bàn tròn", "ban", "ban an", "ban lam viec", "ban tra", "ban trang diem", "ban hoc", "ban sofa", "ban go", "ban cafe", "ban tron"],
    exactTokens: ["ban", "ban an", "ban lam viec", "ban tra", "ban trang diem", "ban hoc", "ban sofa", "ban go", "ban cafe", "ban tron"],
  },
  {
    name: "Sofa",
    keywords: ["sofa", "salon", "sofa da", "sofa nỉ", "sofa vải", "sofa góc", "sofa phòng khách", "sofa đơn", "sofa giường", "sofa bed", "sofa ni", "sofa vai", "sofa goc", "sofa phong khach", "sofa don", "sofa giuong"],
    exactTokens: ["sofa", "salon", "sofa da", "sofa ni", "sofa vai", "sofa goc", "sofa don", "sofa giuong"],
  },
  {
    name: "Tủ kệ",
    keywords: ["tủ", "kệ", "tủ quần áo", "tủ giày", "tủ đầu giường", "tủ bếp", "kệ tivi", "kệ sách", "kệ trang trí", "kệ gỗ", "tu", "ke", "tu quan ao", "tu giay", "tu dau giuong", "tu bep", "ke tivi", "ke sach", "ke trang tri", "ke go"],
    exactTokens: ["tu", "ke", "tu quan ao", "tu giay", "tu dau giuong", "tu bep", "ke tivi", "ke sach", "ke trang tri", "ke go"],
  },
  {
    name: "Rèm cửa",
    keywords: ["rèm", "rèm cửa", "rèm cuốn", "màn cửa", "rèm vải", "rèm cầu vồng", "rèm roman", "rèm sáo", "rem", "rem cua", "rem cuon", "man cua", "rem vai", "rem cau vong", "rem roman"],
    exactTokens: ["rem", "rem cua", "rem cuon", "man cua", "rem vai", "rem cau vong", "rem roman"],
  },
  {
    name: "Đèn trang trí",
    keywords: ["đèn", "đèn ngủ", "đèn chùm", "đèn cây", "đèn bàn", "đèn trang trí", "đèn led", "đèn tre", "đèn lồng", "den", "den ngu", "den chum", "den cay", "den ban", "den trang tri", "den led", "den tre", "den long"],
    exactTokens: ["den", "den ngu", "den chum", "den cay", "den ban", "den trang tri", "den led", "den tre", "den long"],
  },
  {
    name: "Tủ lavabo & Phòng tắm",
    keywords: ["lavabo", "tủ lavabo", "bồn rửa", "chậu rửa", "gương phòng tắm", "phòng tắm", "tu lavabo", "bon rua", "chau rua", "guong phong tam", "phong tam", "bon cau"],
    exactTokens: ["lavabo", "tu lavabo", "bon rua", "chau rua", "guong phong tam", "phong tam", "bon cau"],
  },
  {
    name: "Nệm & Chăn ga",
    keywords: ["nệm", "đệm", "nệm cao su", "nệm bông ép", "nệm lò xo", "chăn ga", "gối", "nem", "dem", "nem cao su", "nem bong ep", "nem lo xo", "chan ga", "goi"],
    exactTokens: ["nem", "dem", "nem cao su", "nem bong ep", "nem lo xo", "chan ga", "goi"],
  },
  {
    name: "Đồ mỹ nghệ & Thủ công",
    keywords: ["tre", "mây", "gốm", "bình gốm", "khay gỗ", "tranh treo", "sơn mài", "khảm trai", "thủ công", "mỹ nghệ", "do tre", "may", "gom", "binh gom", "khay go", "tranh treo", "son mai", "kham trai", "thu cong", "my nghe"],
    exactTokens: ["tre", "may", "gom", "binh gom", "khay go", "tranh macrame", "son mai", "kham trai", "thu cong", "chau cay"],
  },
];

export interface ExtractedIntent {
  rawQuery: string;
  categories: string[];
  productKeywords: string[];
  minPrice?: number;
  maxPrice?: number;
  priceSort?: "asc" | "desc";
  isSale?: boolean;
  isHot?: boolean;
  isNew?: boolean;
  orderCode?: string;
  isVoucher?: boolean;
  isFaq?: boolean;
  faqResponse?: string;
}

/**
 * Helper to parse Vietnamese colloquial price expressions
 * Supports:
 * - 5 củ, 5 cu, 5 chai, 5 quả, 5 triệu, 5tr, 5m, 1.5 củ, 1 củ rưỡi
 * - 5 xị, 5 xi, 3 lít, 2 lốp, 2 xị rưỡi (1 xị = 100k)
 * - 500k, 500 ngàn, 500 nghìn, 500.000, 500000, 5.000.000, 5000000
 * - nửa củ, nửa triệu, nửa xị
 */
export function parseVietnamesePrice(numStr: string, unitStr?: string, hasHalf?: boolean): number {
  let raw = (numStr || "").trim();
  let unit = (unitStr || "").toLowerCase().trim();

  // Special words without explicit number
  if (raw === "nua" || raw === "nửa") {
    if (unit.includes("cu") || unit.includes("chai") || unit.includes("trieu") || unit.includes("tr") || unit.includes("m") || unit.includes("qua")) {
      return 500000;
    }
    if (unit.includes("xi") || unit.includes("lit") || unit.includes("lop")) {
      return 50000;
    }
    return 500000;
  }

  // Handle formats like "5.000.000", "500.000", "500000" (two or more groups of 3 digits)
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(raw)) {
    return parseInt(raw.replace(/[.,]/g, ""), 10);
  }

  let val = parseFloat(raw.replace(",", "."));
  if (isNaN(val)) val = 1;

  if (hasHalf) {
    val += 0.5;
  }

  // 1. Million units: củ, cu, chai, quả, triệu, trieu, tr, m
  if (
    unit.includes("cu") ||
    unit.includes("củ") ||
    unit.includes("chai") ||
    unit.includes("qua") ||
    unit.includes("quả") ||
    unit.includes("tr") ||
    unit.includes("m") ||
    unit.includes("trieu") ||
    unit.includes("triệu")
  ) {
    return Math.round(val * 1000000);
  }

  // 2. Hundred-thousand units: xị, xi, lít, lit, lốp, lop, lét (1 xị = 100,000đ)
  if (
    unit.includes("xi") ||
    unit.includes("xị") ||
    unit.includes("lit") ||
    unit.includes("lít") ||
    unit.includes("lop") ||
    unit.includes("lốp") ||
    unit.includes("let") ||
    unit.includes("lét")
  ) {
    return Math.round(val * 100000);
  }

  // 3. Thousand units: k, nghìn, nghin, ngàn, ngan
  if (
    unit.includes("k") ||
    unit.includes("nghin") ||
    unit.includes("nghìn") ||
    unit.includes("ngan") ||
    unit.includes("ngàn")
  ) {
    return Math.round(val * 1000);
  }

  if (val >= 1000) {
    return Math.round(val);
  } else if (val < 20) {
    return Math.round(val * 1000000);
  } else if (val < 1000) {
    return Math.round(val * 1000);
  }

  return Math.round(val);
}

/**
 * Intelligent Multi-Keyword & Natural Language Intent Parser
 */
export function parseUserIntent(query: string): ExtractedIntent {
  const normalized = normalizeText(query);
  const matchedCategories = new Set<string>();
  const productKeywords: string[] = [];

  // 1. Check Order Tracking (#MS-xxxx or Oxxxx)
  const orderRegex = /(?:MS-?|O)\d{4,8}/i;
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
    (normalized.includes("giam gia") && !normalized.includes("san pham giam gia"));

  // 3. Check FAQ Knowledge Base
  let faqResponse: string | undefined;
  for (const faq of FAQ_KNOWLEDGE) {
    if (faq.keywords.some((kw) => hasWordToken(normalized, kw))) {
      faqResponse = faq.response;
      break;
    }
  }

  // 4. Extract Price Range Constraints FIRST so price prepositions ('từ', 'đến') don't collide with 'tủ', 'đèn'
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let priceSort: "asc" | "desc" | undefined;


  const unitGroup = "k|nghin|ngan|trieu|tr|m|cu|chai|qua|xi|lit|lop|let";
  const numToken = "\\d+(?:[.,]\\d+)*|nua";

  // Pattern: từ X đến Y / X - Y (ví dụ: "từ 1 đến 3 củ", "từ 500k đến 2 triệu", "khoảng 2 - 5 chai", "từ 2 xị đến 5 xị")
  const rangeRegex = new RegExp(
    `(?:tu|khoang)?\\s*(${numToken})\\s*(${unitGroup})?\\s*(?:ruoi)?\\s*(?:den|-|toi|\\.\\.)\\s*(${numToken})\\s*(${unitGroup})?\\s*(ruoi)?`,
    "i"
  );
  const rangeMatch = normalized.match(rangeRegex);
  if (rangeMatch) {
    const rawUnit1 = rangeMatch[2];
    const rawUnit2 = rangeMatch[4] || rawUnit1;
    minPrice = parseVietnamesePrice(rangeMatch[1], rawUnit1 || rawUnit2, normalized.includes("ruoi"));
    maxPrice = parseVietnamesePrice(rangeMatch[3], rawUnit2, Boolean(rangeMatch[5]));
  } else {
    // Pattern: dưới 5 xị, dưới 5 củ, < 2tr, khong qua 3 chai, tam 500k, duoi 5.000.000
    const underRegex = new RegExp(
      `(?:duoi|nho hon|<|<=|khong qua|tam|toi da|duoi muc)\\s*(${numToken})\\s*(${unitGroup})?\\s*(ruoi)?`,
      "i"
    );
    const underMatch = normalized.match(underRegex);
    if (underMatch) {
      maxPrice = parseVietnamesePrice(underMatch[1], underMatch[2], Boolean(underMatch[3]) || normalized.includes("ruoi"));
    }

    // Pattern: trên 1 triệu, > 500k, tu 2 củ tro len, hon 1 chai
    const overRegex = new RegExp(
      `(?:tren|lon hon|>|>=|tu|hon)\\s*(${numToken})\\s*(${unitGroup})?\\s*(ruoi)?(?:\\s*tro len)?`,
      "i"
    );
    const overMatch = normalized.match(overRegex);
    if (overMatch && !underMatch) {
      minPrice = parseVietnamesePrice(overMatch[1], overMatch[2], Boolean(overMatch[3]) || normalized.includes("ruoi"));
    }
  }

  // Standalone colloquial price or pure number (e.g. user just asks "sofa 5 củ", "bàn 5 xị", "giường 5.000.000", "500000")
  if (minPrice === undefined && maxPrice === undefined) {
    const standaloneRegex = new RegExp(
      `\\b(${numToken})\\s*(${unitGroup})?\\b`,
      "i"
    );
    const standaloneMatch = normalized.match(standaloneRegex);
    if (standaloneMatch) {
      const parsed = parseVietnamesePrice(standaloneMatch[1], standaloneMatch[2], normalized.includes("ruoi"));
      if (parsed > 0) {
        maxPrice = parsed;
      }
    }
  }

  // Price adjectives: "giá rẻ", "bình dân", "tiết kiệm", "cao cấp", "sang trọng"
  if (normalized.includes("gia re") || normalized.includes("binh dan") || normalized.includes("tiet kiem")) {
    priceSort = "asc";
    if (!maxPrice) maxPrice = 1500000;
  } else if (normalized.includes("cao cap") || normalized.includes("sang trong") || normalized.includes("hang sang") || normalized.includes("dat tien")) {
    priceSort = "desc";
    if (!minPrice) minPrice = 3000000;
  }

  // 5. Clean query for category matching by removing price range numbers, colloquial slang, and prepositions
  let queryForCategory = normalized
    .replace(new RegExp(`(?:tu|khoang)?\\s*(${numToken})\\s*(${unitGroup})?\\s*(?:ruoi)?\\s*(?:den|-|toi|\\.\\.)\\s*(${numToken})\\s*(${unitGroup})?\\s*(ruoi)?`, "gi"), " ")
    .replace(new RegExp(`(?:duoi|nho hon|<|<=|khong qua|tam|tren|lon hon|>|>=|tu|den|hon)\\s*(${numToken})\\s*(${unitGroup})?\\s*(ruoi)?`, "gi"), " ")
    .replace(new RegExp(`\\b(${numToken})\\s*(${unitGroup})\\b`, "gi"), " ")
    .replace(/\b(?:tu|den)\s+\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Multi-Keyword & Category Parser (Supporting "hoặc", "và", "với", "hay", ",", "+")
  CATEGORY_DEFINITIONS.forEach((catDef) => {
    for (const token of catDef.exactTokens) {
      // If token is ambiguous short word like "tu" or "den", check accented presence in raw query
      if (token === "tu" || token === "den") {
        const rawLower = query.toLowerCase();
        if (token === "tu" && rawLower.includes("tủ")) {
          matchedCategories.add(catDef.name);
          break;
        }
        if (token === "den" && rawLower.includes("đèn")) {
          matchedCategories.add(catDef.name);
          break;
        }
        if (!hasWordToken(queryForCategory, token)) continue;
        if (rawLower.includes("từ") && !rawLower.includes("tủ")) continue;
        if (rawLower.includes("đến") && !rawLower.includes("đèn")) continue;
      }

      if (hasWordToken(queryForCategory, token)) {
        matchedCategories.add(catDef.name);
        if (!productKeywords.includes(token)) {
          productKeywords.push(token);
        }
        break;
      }
    }
  });


  // Special standalone keywords recognition (e.g. "tre", "go", "gom", "chau cay", "khay")
  const specificTerms = [
    { term: "tre", cat: "Đồ mỹ nghệ & Thủ công" },
    { term: "gom", cat: "Đồ mỹ nghệ & Thủ công" },
    { term: "khay", cat: "Đồ mỹ nghệ & Thủ công" },
    { term: "chau cay", cat: "Đồ mỹ nghệ & Thủ công" },
    { term: "bon cau", cat: "Tủ lavabo & Phòng tắm" },
    { term: "phong tam", cat: "Tủ lavabo & Phòng tắm" },
    { term: "phong khach", cat: "Sofa" },
    { term: "phong ngu", cat: "Giường" },
    { term: "nha bep", cat: "Bàn" },
  ];

  specificTerms.forEach(({ term, cat }) => {
    if (hasWordToken(queryForCategory, term)) {
      matchedCategories.add(cat);
      if (!productKeywords.includes(term)) {
        productKeywords.push(term);
      }
    }
  });


  // 6. Check Status: Sale, Hot, New
  const isSale =
    normalized.includes("flash sale") ||
    normalized.includes("giam gia") ||
    normalized.includes("sale") ||
    normalized.includes("khuyen mai") ||
    normalized.includes("uu dai");

  const isHot =
    normalized.includes("ban chay") ||
    normalized.includes("hot") ||
    normalized.includes("yeu thich") ||
    normalized.includes("mua nhieu");

  const isNew =
    normalized.includes("hang moi") ||
    normalized.includes("mau moi") ||
    normalized.includes("moi nhat") ||
    normalized.includes("new");

  return {
    rawQuery: query,
    categories: Array.from(matchedCategories),
    productKeywords,
    minPrice,
    maxPrice,
    priceSort,
    isSale,
    isHot,
    isNew,
    orderCode,
    isVoucher,
    isFaq: Boolean(faqResponse),
    faqResponse,
  };
}

/**
 * Format product list into a clean, well-spaced text summary
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
 * Filter product by intent criteria with safe token matching
 */
function isProductMatchingCategory(p: Product, categoryName: string): boolean {
  const normName = normalizeText(p.name);
  const normCat = normalizeText(p.category || "");
  const normCatName = normalizeText(p.categoryName || "");

  const catDef = CATEGORY_DEFINITIONS.find((c) => c.name === categoryName);
  if (!catDef) {
    const targetNorm = normalizeText(categoryName);
    return hasWordToken(normName, targetNorm) || hasWordToken(normCatName, targetNorm) || hasWordToken(normCat, targetNorm);
  }

  // Must match at least one token from category definition as whole word
  return catDef.exactTokens.some((token) => {
    return hasWordToken(normName, token) || hasWordToken(normCatName, token) || hasWordToken(normCat, token);
  });
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
          quickReplies: ["Tư vấn Bàn ghế", "Tư vấn Sofa & Giường", "Xem Flash Sale"],
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
      quickReplies: ["Tư vấn Bàn ghế", "Tư vấn Sofa & Giường", "Xem Flash Sale"],
    };
  }

  // 3. FAQ KNOWLEDGE BASE MATCH (Prioritize direct store policy questions)
  if (intent.isFaq && intent.faqResponse && intent.categories.length === 0 && !intent.minPrice && !intent.maxPrice) {
    return {
      id,
      sender: "bot",
      text: intent.faqResponse,
      timestamp,
      quickReplies: ["Tư vấn sản phẩm", "Kiểm tra voucher", "Gặp tư vấn viên"],
    };
  }

  // 4. HUMAN CONSULTANT ESCALATION
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

  // 5. REALTIME SUPABASE PRODUCT DATA RETRIEVAL
  // Only query active, in-stock products from Supabase
  const rawProducts = await fetchProductsFromSupabase(false);
  const allProducts = rawProducts.filter((p) => p.status !== "Hidden" && p.price > 0);

  // 5.1 MULTI-KEYWORD / MULTI-CATEGORY INTENT MATCHING
  // Example 1: "Ghế hoặc giường" -> intent.categories = ["Ghế", "Giường"]
  // Example 2: "Bàn ăn và sofa dưới 3 triệu" -> intent.categories = ["Bàn", "Sofa"], maxPrice = 3000000
  if (intent.categories.length > 0) {
    const matchedProducts: Product[] = [];
    const categoryLabels = intent.categories.join(" & ");

    // Gather products per matched category group
    intent.categories.forEach((catName) => {
      let filtered = allProducts.filter((p) => isProductMatchingCategory(p, catName));

      // Apply price range
      if (intent.maxPrice !== undefined) {
        filtered = filtered.filter((p) => p.price <= intent.maxPrice!);
      }
      if (intent.minPrice !== undefined) {
        filtered = filtered.filter((p) => p.price >= intent.minPrice!);
      }

      // Apply sale / hot / new filter if requested
      if (intent.isSale) {
        const saleOnly = filtered.filter((p) => Boolean(p.oldPrice) || (p.badge && p.badge.toLowerCase().includes("sale")));
        if (saleOnly.length > 0) filtered = saleOnly;
      }
      if (intent.isHot) {
        const hotOnly = filtered.filter((p) => p.badge?.toLowerCase() === "hot");
        if (hotOnly.length > 0) filtered = hotOnly;
      }
      if (intent.isNew) {
        const newOnly = filtered.filter((p) => p.badge?.toLowerCase() === "mới" || p.badge?.toLowerCase() === "new");
        if (newOnly.length > 0) filtered = newOnly;
      }

      // Sort if requested
      if (intent.priceSort === "asc") {
        filtered.sort((a, b) => a.price - b.price);
      } else if (intent.priceSort === "desc") {
        filtered.sort((a, b) => b.price - a.price);
      }

      // Take balanced items per category (up to 2 per category if multi, or up to 4 if single)
      const takeCount = intent.categories.length > 1 ? 2 : 4;
      matchedProducts.push(...filtered.slice(0, takeCount));
    });

    if (matchedProducts.length > 0) {
      let introTitle = `Dạ, em đã tìm thấy các mẫu ${categoryLabels} đẹp và bán chạy nhất tại MINI SHOP dành cho anh/chị:`;
      if (intent.minPrice && intent.maxPrice) {
        introTitle = `Dạ, dưới đây là các mẫu ${categoryLabels} có giá từ ${intent.minPrice.toLocaleString("vi-VN")}đ đến ${intent.maxPrice.toLocaleString("vi-VN")}đ phù hợp yêu cầu của anh/chị:`;
      } else if (intent.maxPrice) {
        introTitle = `Dạ, dưới đây là các mẫu ${categoryLabels} có giá dưới ${intent.maxPrice.toLocaleString("vi-VN")}đ phù hợp với yêu cầu của anh/chị:`;
      } else if (intent.minPrice) {
        introTitle = `Dạ, dưới đây là các mẫu ${categoryLabels} phân khúc trên ${intent.minPrice.toLocaleString("vi-VN")}đ phù hợp với yêu cầu của anh/chị:`;
      }

      return {
        id,
        sender: "bot",
        text: formatProductListToText(introTitle, matchedProducts),
        timestamp,
        products: matchedProducts,
        quickReplies: [
          `Xem thêm mẫu ${intent.categories[0]}`,
          "Kiểm tra mã giảm giá",
          "Tư vấn phí vận chuyển",
        ],
      };
    } else {
      // No products matched the specific criteria -> Graceful notification + Smart Suggestions
      const suggestions = allProducts
        .filter((p) => (intent.maxPrice ? p.price <= intent.maxPrice * 1.5 : true))
        .slice(0, 3);
      const fallbackList = suggestions.length > 0 ? suggestions : allProducts.slice(0, 3);

      const politeMessage = `Dạ, rất tiếc MINI SHOP hiện chưa có sản phẩm "${userQuery}" theo đúng khoảng giá hoặc tiêu chí này ạ.\n\nTuy nhiên, em xin gợi ý cho anh/chị một số mẫu nội thất bán chạy nổi bật cùng phân khúc dưới đây:`;

      return {
        id,
        sender: "bot",
        text: formatProductListToText(politeMessage, fallbackList),
        timestamp,
        products: fallbackList,
        quickReplies: ["Xem mẫu Ghế & Bàn", "Xem mẫu Giường ngủ", "Xem mã ưu đãi 50k", "Gặp tư vấn viên"],
      };
    }
  }

  // 5.2 KEYWORD TOKEN SEARCH ACROSS PRODUCT NAMES & DESCRIPTIONS
  if (normalized.length >= 2) {
    const tokens = normalized.split(/\s+/).filter((t) => t.length >= 2);
    let matched = allProducts.filter((p) => {
      const pName = normalizeText(p.name);
      const pDesc = normalizeText(p.description || "");
      const pCat = normalizeText(p.categoryName || p.category || "");
      return tokens.some((token) => hasWordToken(pName, token) || hasWordToken(pDesc, token) || hasWordToken(pCat, token));
    });

    if (intent.maxPrice) matched = matched.filter((p) => p.price <= intent.maxPrice!);
    if (intent.minPrice) matched = matched.filter((p) => p.price >= intent.minPrice!);

    if (matched.length > 0) {
      const finalProducts = matched.slice(0, 4);
      const titleText = `Dạ, em đã tìm thấy các sản phẩm phù hợp với từ khóa "${userQuery}" tại MINI SHOP:`;
      return {
        id,
        sender: "bot",
        text: formatProductListToText(titleText, finalProducts),
        timestamp,
        products: finalProducts,
        quickReplies: ["Kiểm tra mã giảm giá", "Tư vấn phí ship", "Gặp nhân viên hỗ trợ"],
      };
    }
  }

  // 5.3 FLASH SALE / SALE INTENT
  if (intent.isSale) {
    const saleProducts = allProducts
      .filter((p) => (p.badge && p.badge.toLowerCase().includes("sale")) || Boolean(p.oldPrice))
      .slice(0, 3);
    const finalSale = saleProducts.length > 0 ? saleProducts : allProducts.slice(0, 3);
    const titleText = "Sản phẩm Flash Sale & Giảm giá đặc biệt hôm nay tại MINI SHOP:";

    return {
      id,
      sender: "bot",
      text: formatProductListToText(titleText, finalSale),
      timestamp,
      products: finalSale,
      quickReplies: ["Xem sản phẩm Bàn", "Xem sản phẩm Sofa", "Lấy mã giảm giá"],
    };
  }

  // 5.4 DEFAULT POLITE ASSISTANT FALLBACK
  const defaultProducts = allProducts.slice(0, 3);
  const fallbackTitle = `Dạ, rất tiếc em chưa tìm thấy sản phẩm khớp với "${userQuery}" trên hệ thống.\nXin gửi anh/chị một số mẫu nội thất đẹp và bán chạy nhất tại MINI SHOP để tham khảo ạ:`;

  return {
    id,
    sender: "bot",
    text: formatProductListToText(fallbackTitle, defaultProducts),
    timestamp,
    products: defaultProducts,
    quickReplies: ["Gợi ý Ghế & Bàn", "Gợi ý Sofa & Giường", "Tra cứu đơn hàng", "Lấy mã giảm giá 50k"],
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

