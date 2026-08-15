import { createClient } from "@/utils/supabase/client";

export interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_FAQS: FaqItem[] = [
  {
    q: "Tôi có thể kiểm tra hàng trước khi thanh toán không?",
    a: "Hoàn toàn ĐƯỢC! Tất cả đơn hàng của MINI-SHOP đều áp dụng chương trình Đồng Kiểm tận nhà. Quý khách được quyền mở hộp kiểm tra sản phẩm trước khi thanh toán tiền cho shipper.",
  },
  {
    q: "Thời gian giao hàng mất bao lâu?",
    a: "Nội thành TP.HCM và Hà Nội: Giao siêu tốc từ 1 - 2 ngày làm việc. Các tỉnh thành khác trên toàn quốc: Giao tận nơi từ 2 - 4 ngày làm việc.",
  },
  {
    q: "Quy trình đổi trả sản phẩm bị lỗi như thế nào?",
    a: "Nếu sản phẩm có lỗi từ nhà sản xuất hoặc bị bể vỡ trong quá trình vận chuyển, quý khách chỉ cần chụp ảnh/quay video và liên hệ Hotline 0987.654.321 trong vòng 7 ngày để được hỗ trợ đổi mới 100% hoàn toàn miễn phí.",
  },
  {
    q: "Tôi làm thế nào để tích điểm và nâng hạng thẻ thành viên?",
    a: "Quý khách đăng nhập tài khoản khi mua hàng. Tổng tiền các đơn hàng hoàn tất sẽ tự động tích lũy để thăng hạng Thẻ Bạc (từ 2trđ), Thẻ Vàng (từ 5trđ) và Thẻ Kim Cương (từ 15trđ) kèm các đặc quyền giảm giá độc quyền.",
  },
];

export const fetchFaqsFromSupabase = async (): Promise<FaqItem[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer")
      .order("id", { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_FAQS;
    }

    return data.map((f: any) => ({
      q: String(f.question),
      a: String(f.answer),
    }));
  } catch (err) {
    console.error("Error fetching FAQs from Supabase:", err);
    return DEFAULT_FAQS;
  }
};
