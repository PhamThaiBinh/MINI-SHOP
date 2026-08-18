"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { fetchFaqsFromSupabase, FaqItem } from "@/lib/supabasePolicy";

function PolicyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") as
    | "returns"
    | "shipping"
    | "privacy"
    | "terms"
    | "faq"
    | null;

  const [activeTab, setActiveTab] = useState<
    "returns" | "shipping" | "privacy" | "terms" | "faq"
  >(tabParam || "returns");

  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    async function loadFaqs() {
      const data = await fetchFaqsFromSupabase();
      setFaqs(data);
    }
    loadFaqs();
  }, []);

  useEffect(() => {
    if (tabParam && ["returns", "shipping", "privacy", "terms", "faq"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (
    tabKey: "returns" | "shipping" | "privacy" | "terms" | "faq"
  ) => {
    setActiveTab(tabKey);
    router.push(`/policy?tab=${tabKey}`);
  };

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <main className="container" style={{ padding: "40px 15px", maxWidth: "980px" }}>
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "30px 24px",
          color: "#fff",
          marginBottom: "30px",
          textAlign: "center",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        }}
      >
        <h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0 }}>
          🛡️ TRUNG TÂM CHÍNH SÁCH & ĐIỀU KHOẢN DỊCH VỤ
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.85 }}>
          MINI-SHOP cam kết mang lại trải nghiệm mua sắm an tâm, minh bạch và bảo vệ tối đa quyền lợi khách hàng chuẩn Thương mại điện tử.
        </p>
      </div>

      {/* Subtabs Navigation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "30px",
        }}
      >
        <button
          onClick={() => handleTabChange("returns")}
          style={{
            padding: "12px 14px",
            background: activeTab === "returns" ? "var(--primary-color)" : "#fff",
            color: activeTab === "returns" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "13px",
            textAlign: "center",
            boxShadow: activeTab === "returns" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          🔄 Đổi Trả & Bảo Hành
        </button>

        <button
          onClick={() => handleTabChange("shipping")}
          style={{
            padding: "12px 14px",
            background: activeTab === "shipping" ? "var(--primary-color)" : "#fff",
            color: activeTab === "shipping" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "13px",
            textAlign: "center",
            boxShadow: activeTab === "shipping" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          🚚 Giao Hàng & Đồng Kiểm
        </button>

        <button
          onClick={() => handleTabChange("privacy")}
          style={{
            padding: "12px 14px",
            background: activeTab === "privacy" ? "var(--primary-color)" : "#fff",
            color: activeTab === "privacy" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "13px",
            textAlign: "center",
            boxShadow: activeTab === "privacy" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          🔒 Bảo Mật Thông Tin
        </button>

        <button
          onClick={() => handleTabChange("terms")}
          style={{
            padding: "12px 14px",
            background: activeTab === "terms" ? "var(--primary-color)" : "#fff",
            color: activeTab === "terms" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "13px",
            textAlign: "center",
            boxShadow: activeTab === "terms" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          📜 Điều Khoản Sử Dụng
        </button>

        <button
          onClick={() => handleTabChange("faq")}
          style={{
            padding: "12px 14px",
            background: activeTab === "faq" ? "var(--primary-color)" : "#fff",
            color: activeTab === "faq" ? "#fff" : "var(--text-main)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            fontWeight: 800,
            fontSize: "13px",
            textAlign: "center",
            boxShadow: activeTab === "faq" ? "0 4px 12px rgba(46, 125, 50, 0.3)" : "none",
          }}
        >
          ❓ Câu Hỏi Thường Gặp
        </button>
      </div>



      {/* Content Container */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius-lg)",
          padding: "36px 30px",
          border: "1px solid var(--border-color)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          lineHeight: "1.8",
          fontSize: "14px",
          color: "var(--text-main)",
        }}
      >
        {/* TAB 1: RETURNS & WARRANTY */}
        {activeTab === "returns" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: 0 }}>
              🔄 Chính Sách Đổi Trả & Bảo Hành 7 Ngày
            </h2>
            <p>
              Nhằm đảm bảo sự hài lòng tuyệt đối khi mua sắm tại MINI-SHOP, chúng tôi ban hành quy định Đổi trả & Bảo hành sản phẩm với tiêu chuẩn rõ ràng:
            </p>

            <h3 id="sec-dieu-kien" style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              1. Điều kiện đổi trả hàng miễn phí
            </h3>
            <ul style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Sản phẩm giao bị lỗi kỹ thuật, trầy xước, nứt vỡ trong quá trình vận chuyển.</li>
              <li>Sản phẩm bị giao sai mẫu mã, chủng loại hoặc thiếu số lượng so với đơn đặt hàng.</li>
              <li>Sản phẩm còn nguyên tem mác, nhãn niêm phong và đầy đủ phụ kiện đi kèm.</li>
              <li>Thời gian gửi yêu cầu đổi trả trong vòng <strong>7 ngày kể từ thời điểm nhận hàng</strong> thành công.</li>
            </ul>

            <h3 id="sec-quy-trinh" style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              2. Quy trình tiếp nhận & đổi trả 3 bước
            </h3>
            <ol style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Quý khách chụp ảnh hoặc quay video tình trạng thực tế của sản phẩm lỗi/bể vỡ.</li>
              <li>Liên hệ bộ phận CSKH qua Hotline/Zalo: <strong>0987.654.321</strong> hoặc gửi Email: <strong>support@minishop.vn</strong>.</li>
              <li>MINI-SHOP xác minh trong vòng 2 giờ làm việc và cử đơn vị vận chuyển đến thu hồi sản phẩm lỗi, đồng thời gửi sản phẩm mới đến tận tay quý khách hoàn toàn miễn phí.</li>
            </ol>

            <h3 id="sec-bao-hanh" style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              3. Chính sách hoàn tiền & Bảo hành
            </h3>
            <p>
              Trường hợp sản phẩm đổi trả đã hết hàng trong kho, quý khách sẽ được hoàn lại 100% số tiền thanh toán qua tài khoản ngân hàng trong vòng 24 - 48 giờ làm việc.
            </p>
          </div>
        )}

        {/* TAB 2: SHIPPING */}
        {activeTab === "shipping" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: 0 }}>
              🚚 Chính Sách Giao Hàng & Kiểm Hàng (Đồng Kiểm)
            </h2>
            <p>
              MINI-SHOP hợp tác cùng các đối tác vận chuyển uy tín toàn quốc để mang sản phẩm đến tay bạn nhanh chóng và an toàn nhất.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              1. Phạm vi & Thời gian giao hàng
            </h3>
            <ul style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li><strong>Khu vực Nội thành TP.HCM & Hà Nội:</strong> Thời gian giao hàng hỏa tốc trong <strong>24h - 48h</strong>.</li>
              <li><strong>Các Tỉnh/Thành phố khác:</strong> Thời gian giao hàng từ <strong>2 - 4 ngày làm việc</strong> tùy địa bàn.</li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              2. Quyền lợi Đồng Kiểm tận nhà
            </h3>
            <ol style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Tất cả đơn hàng xuất kho từ MINI-SHOP đều cho phép <strong>mở hộp đồng kiểm trước sự chứng kiến của nhân viên giao hàng</strong>.</li>
              <li>Nếu phát hiện hàng bể vỡ, sai màu sắc hoặc không đúng mô tả, quý khách có quyền <strong>từ chối nhận hàng</strong> mà không tốn bất kỳ chi phí phát sinh nào.</li>
            </ol>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              3. Cước phí vận chuyển
            </h3>
            <p>
              Miễn phí giao hàng toàn quốc đối với đơn hàng từ <strong>500.000đ trở lên</strong>. Với đơn hàng dưới 500.000đ, cước phí cố định là 20.000đ (Nội thành) và 30.000đ (Ngoại thành/Tỉnh).
            </p>
          </div>
        )}

        {/* TAB 3: PRIVACY */}
        {activeTab === "privacy" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: 0 }}>
              🔒 Chính Sách Bảo Mật Thông Tin Khách Hàng
            </h2>
            <p>
              MINI-SHOP tôn trọng tuyệt đối sự riêng tư và cam kết bảo vệ thông tin cá nhân của quý khách hàng tuân thủ Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              1. Mục đích thu thập thông tin
            </h3>
            <ul style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Xử lý, đóng gói và thực hiện việc vận chuyển đơn hàng.</li>
              <li>Thông báo lịch trình giao hàng và cung cấp dịch vụ chăm sóc khách hàng.</li>
              <li>Gửi ưu đãi voucher và mã giảm giá tích điểm thành viên.</li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              2. Cam kết an toàn dữ liệu
            </h3>
            <ol style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Dữ liệu cá nhân của quý khách được mã hóa chuẩn bảo mật SSL 256-bit cao cấp.</li>
              <li>Tuyệt đối <strong>không chia sẻ, bán hoặc trao đổi thông tin khách hàng</strong> cho bất kỳ bên thứ ba nào ngoại trừ đơn vị giao vận phụ trách đơn hàng.</li>
              <li>Quý khách có quyền kiểm tra, cập nhật hoặc yêu cầu xóa bỏ hoàn toàn dữ liệu tài khoản cá nhân bất kỳ lúc nào.</li>
            </ol>
          </div>
        )}

        {/* TAB 4: TERMS OF USE */}
        {activeTab === "terms" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: 0 }}>
              📜 Điều Khoản Sử Dụng Dịch Vụ
            </h2>
            <p>
              Chào mừng bạn đến với MINI-SHOP. Khi truy cập và thực hiện giao dịch mua sắm trên website, bạn mặc nhiên đồng ý với các điều khoản pháp lý dưới đây:
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              1. Trách nhiệm của Khách hàng
            </h3>
            <ul style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Cung cấp thông tin tên, số điện thoại, địa chỉ nhận hàng chính xác và hợp pháp.</li>
              <li>Bảo mật tài khoản cá nhân, mật khẩu và chịu trách nhiệm với các hoạt động phát sinh từ tài khoản của mình.</li>
              <li>Không thực hiện các hành vi can thiệp, gian lận mã ưu đãi hoặc gây gián đoạn hệ thống website.</li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary-color)", marginTop: "24px" }}>
              2. Bản quyền & Sở hữu trí tuệ
            </h3>
            <ol style={{ paddingLeft: "28px", margin: "10px 0 18px" }}>
              <li>Toàn bộ hình ảnh sản phẩm, nội dung mô tả, logo thương hiệu và mã nguồn website thuộc quyền sở hữu của MINI-SHOP.</li>
              <li>Nghiêm cấm sao chép hoặc trích dẫn nội dung vì mục đích thương mại khi chưa có sự đồng ý bằng văn bản.</li>
            </ol>
          </div>
        )}

        {/* TAB 5: FAQ */}
        {activeTab === "faq" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", marginTop: 0, marginBottom: "20px" }}>
              ❓ Câu Hỏi Thường Gặp (FAQ)
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: isOpen ? "#f8fafc" : "#fff",
                        border: "none",
                        textAlign: "left",
                        fontWeight: 800,
                        fontSize: "14px",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: isOpen ? "var(--primary-color)" : "var(--text-main)",
                      }}
                    >
                      <span>{faq.q}</span>
                      <span>{isOpen ? "▲" : "▼"}</span>
                    </button>
                    {isOpen && (
                      <div
                        style={{
                          padding: "14px 16px",
                          background: "#fff",
                          borderTop: "1px solid var(--border-color)",
                          color: "#475569",
                          fontSize: "13px",
                          lineHeight: "1.7",
                        }}
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function PolicyPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 15px" }}>⏳ Đang tải trung tâm chính sách...</div>}>
      <PolicyContent />
    </Suspense>
  );
}
