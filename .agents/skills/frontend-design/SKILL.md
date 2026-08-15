---
name: frontend-design
description: Cẩm nang thiết kế giao diện web chuyên nghiệp (Design Taste & Aesthetics), tạo UI/UX chuẩn chỉnh, phối màu hài hòa, khoảng cách thoáng đẹp, chống AI Slop và tự động mô-đun hóa CSS/JS.
---

# FRONTEND DESIGN & UI/UX QUALITY GUIDELINES (DESIGN TASTE)

Cẩm nang này quy định các tiêu chuẩn thẩm mỹ, phối màu, typography, bố cục và kiến trúc mã nguồn khi tạo hoặc chỉnh sửa giao diện trang web (Front-End).

---

## 1. DESIGN TASTE & AESTHETIC STANDARDS (TIÊU CHUẨN THẨM MỸ)

### 1.1. Color System (Hệ thống màu sắc)
* **Bảng màu tinh tế (Curated Palette)**: Không dùng màu mặc định thô ráp (như thuần `#ff0000`, `#0000ff`). Định nghĩa hệ thống màu nhất quán bằng CSS Variables trong `css/common.css`:
  ```css
  :root {
    --primary-color: #c85a32;       /* Màu nhấn chủ đạo (Warm terracotta / Ochre) */
    --primary-hover: #b04d28;       /* Trạng thái Hover */
    --bg-main: #fcfbf9;             /* Nền trang nhẹ nhàng, ấm áp */
    --bg-card: #ffffff;             /* Nền thẻ sản phẩm / container */
    --text-primary: #1c1917;        /* Màu chữ chính (Chữ tối tương phản cao) */
    --text-secondary: #78716c;      /* Màu chữ phụ / mô tả */
    --border-color: #e7e5e4;        /* Đường viền nhẹ */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  }
  ```

### 1.2. Typography (Kiểu chữ & Cấp bậc)
* Dùng font hệ thống sạch sẽ hoặc Google Fonts (Inter, Outfit, System UI).
* Cấp bậc chữ rõ ràng: `h1` (2.2rem - bold), `h2` (1.6rem - semi-bold), `h3` (1.25rem), `p` (1rem - line-height 1.6).
* Tránh chữ quá sát nhau (`letter-spacing` nhẹ nhàng cho tiêu đề).

### 1.3. Spacing Grid System (Khoảng cách thoáng & đều)
* Tuân thủ hệ thống lưới 8px: `--spacing-xs: 4px`, `--spacing-sm: 8px`, `--spacing-md: 16px`, `--spacing-lg: 24px`, `--spacing-xl: 40px`.
* Giữ khoảng trắng (White space) thoáng đãng giữa các section để giao diện dễ thở và sang trọng.

### 1.4. Micro-Interactions (Tương tác tinh tế)
* Mọi nút bấm, thẻ sản phẩm phải có phản hồi khi Hover (`transition: all 0.2s ease`).
* Nút bấm có hiệu ứng nổi nhẹ (`transform: translateY(-2px)`), viền bo tròn (`border-radius: 8px` hoặc `24px` cho pill shape).

---

## 2. QUY TẮC CHỐNG "AI SLOP" (ANTI-AI SLOP GUARDRAILS)

AI Agent **TUYỆT ĐỐI KHÔNG** vi phạm các lỗi giao diện "rập khuôn kiểu máy" sau:
1. **Cấm nền gradient tím mặc định**: Không sử dụng gradient tím-hồng (purple/violet glow) kiểu mặc định của AI ngoại trừ khi có yêu cầu đặc biệt.
2. **Cấm khung ảnh xám giả (Placeholder)**: Luôn trỏ đúng ảnh sản phẩm thật trong thư mục `assets/images/products/`.
3. **Cấm rải emoji bừa bãi**: Không dùng emoji bừa bãi để làm biểu tượng trang trí giao diện (dùng icon SVG/Lucide gọn gàng).
4. **Cấm CSS Monolithic & Inline**: Không viết tất cả vào 1 file `style.css` duy nhất và không gõ CSS trực tiếp trong thẻ HTML (`style="..."`).

---

## 3. QUY NGUYÊN TẮC ARCHITECTURE (MODULAR CSS & JS)

### 3.1. Phân rã CSS (Modular CSS)
* **`css/common.css`**: Chứa CSS Variables, Reset CSS, Typography, Header, Footer, Nút bấm dùng chung.
* **`css/[tên-trang].css`**: Style chuyên biệt cho từng trang HTML (`home.css`, `product-list.css`, `product-detail.css`, `cart.css`, `checkout.css`, `auth.css`, `admin.css`).
* Mỗi file HTML phải nhúng `css/common.css` trước, sau đó mới nhúng `css/[tên-trang].css`.

### 3.2. Phân rã JavaScript
* **`js/main.js`**: Tương tác dùng chung (Header, Navigation, Mobile Menu).
* **`js/products.js`**: Data mẫu, logic lọc & tìm kiếm sản phẩm.
* **`js/cart.js`**: Logic giỏ hàng, sản phẩm yêu thích (`localStorage`).
* **`js/admin.js`**: Logic dashboard quản trị giả lập.

---

## 4. RESPONSIVE DESIGN (TƯƠNG THÍCH MỌI MÀN HÌNH)

* Đảm bảo giao diện xem mượt mà trên điện thoại di động (`@media (max-width: 768px)`).
* Grid chuyển từ 3-4 cột sang 1-2 cột trên mobile.
* Menu chuyển thành dạng ô trượt (Drawer / Hamburger Menu) dễ bấm bằng ngón tay.
