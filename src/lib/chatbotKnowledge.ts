import { PRODUCTS_DATA } from "@/data/products";
import { Product } from "@/types/product";

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

// System FAQs Knowledge Base
const FAQ_KNOWLEDGE = [
  {
    keywords: ["bao hanh", "bảo hành", "hu hong", "hư hỏng", "loi", "lỗi"],
    response:
      "🛡️ **Chính Sách Bảo Hành Tại MINI SHOP:**\n- Tất cả sản phẩm nội thất gỗ, bàn ghế, giường tủ đều được **bảo hành chính hãng 12 - 24 tháng**.\n- Hỗ trợ 1 đổi 1 trong **7 ngày đầu** nếu có lỗi từ nhà sản xuất.\n- Kỹ thuật viên hỗ trợ bảo hành tận nhà hoàn toàn miễn phí!",
  },
  {
    keywords: ["giao hang", "vận chuyển", "ship", "phi ship", "phí ship", "thoi gian giao", "bao lau"],
    response:
      "🚚 **Chính Sách Vận Chuyển & Giao Hàng:**\n- **MIỄN PHÍ VẬN CHUYỂN** toàn quốc cho đơn hàng từ **500.000đ** trở lên.\n- Giao hàng hỏa tốc trong **2 - 4 giờ** tại khu vực nội thành.\n- Giao hàng tiêu chuẩn toàn quốc trong 2 - 3 ngày làm việc.",
  },
  {
    keywords: ["thanh toan", "thanh toán", "chuyen khoản", "chuyển khoản", "cod", "banking", "qr"],
    response:
      "💳 **Phương Thức Thanh Toán Linh Hoạt:**\n- Thanh toán khi nhận hàng (**COD**).\n- Chuyển khoản ngân hàng qua mã **VietQR** tự động gạch nợ tức thì.\n- Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng.",
  },
  {
    keywords: ["doi tra", "đổi trả", "tra hang", "trả hàng", "hoan tien", "hoàn tiền"],
    response:
      "🔄 **Chính Sách Đổi Trả Dễ Dàng:**\n- Đổi mới miễn phí trong **7 ngày** nếu sản phẩm không đúng mô tả hoặc bị xước móp do vận chuyển.\n- Hoàn tiền 100% nếu không đúng cam kết chất lượng.",
  },
  {
    keywords: ["dia chi", "địa chỉ", "showroom", "cua hang", "cửa hàng", "o dau", "ở đâu"],
    response:
      "📍 **Hệ Thống Showroom MINI SHOP:**\n- **Địa chỉ:** 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh.\n- **Thời gian mở cửa:** 8:00 - 21:00 (Tất cả các ngày trong tuần).\n- **Hotline tư vấn:** `0988.123.456`",
  },
];

// Active Vouchers Data
const VOUCHERS_DATA = [
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

// Normalize text for Vietnamese regex matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

export function processUserQuery(userQuery: string): ChatMessage {
  const normalized = normalizeText(userQuery);
  const timestamp = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const id = `msg-${Date.now()}`;

  // 1. Check Order Tracking Intent (e.g. O0001 or 6 digits/order code pattern)
  const orderMatch = userQuery.match(/O\d{4}/i) || normalized.match(/don hang|tra cuu|ma don|don gop/i);
  if (orderMatch) {
    const matchedCode = userQuery.match(/O\d{4}/i)?.[0]?.toUpperCase() || "O0001";
    return {
      id,
      sender: "bot",
      text: `🔍 **Kết quả tra cứu đơn hàng #${matchedCode}:**`,
      timestamp,
      orderInfo: {
        code: matchedCode,
        status: "Đang vận chuyển 🚚",
        customer_name: "Khách hàng MINI SHOP",
        total_amount: 1450000,
        created_at: "21/08/2026",
      },
      quickReplies: ["Tra cứu đơn khác", "Gặp tư vấn viên", "Xem chính sách giao hàng"],
    };
  }

  // 2. Check Voucher Intent
  if (normalized.includes("voucher") || normalized.includes("khuyen mai") || normalized.includes("giam gia") || normalized.includes("uu dai") || normalized.includes("ma giam")) {
    return {
      id,
      sender: "bot",
      text: "🎟️ **Danh Sách Mã Giảm Giá Đang Khả Dụng Hôm Nay:**\nBạn có thể sao chép và áp dụng ngay tại bước Thanh toán!",
      timestamp,
      vouchers: VOUCHERS_DATA,
      quickReplies: ["Tư vấn bàn ghế", "Tư vấn sofa", "Xem Flash Sale"],
    };
  }

  // 3. Check Product Category Intent (Sofa, Bàn, Ghế, Giường, Rèm, Tủ)
  let matchedCategory = "";
  if (normalized.includes("ban") || normalized.includes("ban an") || normalized.includes("ban lam viec")) {
    matchedCategory = "Bàn";
  } else if (normalized.includes("ghe") || normalized.includes("sofa") || normalized.includes("ghe xoay")) {
    matchedCategory = "Ghế";
  } else if (normalized.includes("giuong") || normalized.includes("giuong ngu")) {
    matchedCategory = "Giường";
  } else if (normalized.includes("rem") || normalized.includes("rem cua")) {
    matchedCategory = "Rèm cửa";
  } else if (normalized.includes("tu") || normalized.includes("tu ke") || normalized.includes("lavabo")) {
    matchedCategory = "Tủ kệ";
  }

  if (matchedCategory) {
    const recommendedProducts = PRODUCTS_DATA.filter((p) => p.category === matchedCategory).slice(0, 3);

    return {
      id,
      sender: "bot",
      text: `🛋️ **Dưới đây là các mẫu ${matchedCategory} nổi bật được chọn mua nhiều nhất:**`,
      timestamp,
      products: recommendedProducts.length > 0 ? recommendedProducts : PRODUCTS_DATA.slice(0, 3),
      quickReplies: ["Xem thêm mẫu khác", "Kiểm tra mã giảm giá", "Tư vấn phí ship"],
    };
  }

  // 4. Check FAQ Knowledge Base
  for (const faq of FAQ_KNOWLEDGE) {
    if (faq.keywords.some((kw) => normalized.includes(kw))) {
      return {
        id,
        sender: "bot",
        text: faq.response,
        timestamp,
        quickReplies: ["Tư vấn sản phẩm", "Kiểm tra voucher", "Gặp tư vấn viên"],
      };
    }
  }

  // 5. Check Flash Sale / Discount Product Intent
  if (normalized.includes("flash sale") || normalized.includes("hot") || normalized.includes("ban chay") || normalized.includes("giam nhieu")) {
    const saleProducts = PRODUCTS_DATA.filter((p) => p.badge?.toLowerCase().includes("sale") || Boolean(p.oldPrice)).slice(0, 3);
    return {
      id,
      sender: "bot",
      text: "⚡ **Sản Phẩm Flash Sale Đang Giảm Giá Sốc Hôm Nay:**",
      timestamp,
      products: saleProducts.length > 0 ? saleProducts : PRODUCTS_DATA.slice(0, 3),
      quickReplies: ["Xem sản phẩm Bàn", "Xem sản phẩm Sofa", "Lấy mã giảm giá"],
    };
  }

  // 6. Check Human Escalation Intent
  if (normalized.includes("tu van vien") || normalized.includes("nguoi that") || normalized.includes("hotline") || normalized.includes("tong dai")) {
    return {
      id,
      sender: "bot",
      text: "🧑‍💼 **Kết Nối Tư Vấn Viên Showroom MINI SHOP:**\n- **Hotline trực tiếp:** `0988.123.456` (Miễn phí cuộc gọi)\n- **Zalo Official:** `0988.123.456` (Hỗ trợ gửi hình ảnh trực tiếp)\n- **Thời gian làm việc:** 8:00 - 21:00 hàng ngày.",
      timestamp,
      quickReplies: ["Tư vấn sản phẩm", "Tra cứu đơn hàng", "Mã giảm giá"],
    };
  }

  // 7. Default Fallback Assistance
  return {
    id,
    sender: "bot",
    text: "✨ **Em có thể giúp gì cho anh/chị ạ?**\nAnh/chị có thể nhập tên sản phẩm cần tìm (Sofa, Bàn ăn, Giường ngủ, Rèm cửa), mã đơn hàng hoặc chọn một trong các gợi ý bên dưới:",
    timestamp,
    quickReplies: ["🛍️ Gợi ý Sofa & Bàn ghế", "🚚 Tra cứu đơn hàng", "🎟️ Lấy mã giảm giá 50k", "🛡️ Chính sách bảo hành"],
  };
}
