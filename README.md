# 🛒 MINI SHOP NEXT.JS - VẬN HÀNH THỜI GIAN THỰC VỚI KHO SUPABASE

Cửa hàng thương mại điện tử **MINI SHOP** được xây dựng trên nền tảng **Next.js App Router** và kết nối 100% cơ sở dữ liệu thời gian thực với **Supabase (PostgreSQL + Supabase Auth)**.

---

## 🌟 Mốc Hoàn Thành (Milestone)
> **Mốc Lưu**: Cửa hàng vận hành thật với kho Supabase.
> **Trạng thái**: 100% 19/19 trang giao diện đã loại bỏ dữ liệu ghi cứng, vận hành thời gian thực 100% qua Supabase.

---

## 🛍️ Danh Sách Các Trang Giao Diện & Tính Năng Vận Hành

### 1. Khu Vực Khách Hàng (Customer Shop)
- **Trang Chủ (`/`)**: Tải danh mục & sản phẩm nổi bật thời gian thực từ Supabase (`products`, `categories`).
- **Trang Sản Phẩm (`/products`)**: Lọc giá VND, phân loại, tìm kiếm, phân trang từ Supabase.
- **Trang Chi Tiết Sản Phẩm (`/products/[id]`)**: Đọc sản phẩm theo ID + thông số kỹ thuật JSON `specs` từ Supabase.
- **Trang Flash Sale (`/flash-sale`)**: Đồng bộ sản phẩm Supabase vào 4 khung giờ vàng đếm ngược.
- **Trang Cẩm Nang / Bài Viết (`/blog`)**: Đọc danh sách bài viết từ bảng `blogs` trên Supabase.
- **Trang Chi Tiết Bài Viết (`/blog/[id]`)**: Đọc chi tiết bài viết theo ID từ Supabase.
- **Trang Giỏ Hàng (`/cart`)**: Đồng bộ danh mục sản phẩm từ Supabase.
- **Trang Yêu Thích (`/wishlist`)**: Đồng bộ sản phẩm yêu thích từ Supabase.
- **Trang Thanh Toán (`/checkout`)**: **Tạo & Ghi đơn hàng mới** đồng bộ trực tiếp vào bảng `orders` & `order_items` trên Supabase.
- **Trang Tra Cứu Đơn Hàng (`/track-order`)**: Đọc tình trạng đơn hàng & lộ trình giao hàng thời gian thực từ Supabase.
- **Trang Liên Hệ (`/contact`)**: **Lưu tin nhắn góp ý** trực tiếp vào bảng `contact_messages` trên Supabase.
- **Trang Điều Khoản & Chính Sách (`/policy`)**: Đọc danh sách câu hỏi FAQ trực tiếp từ bảng `faqs` trên Supabase.
- **Trang Đăng Nhập / Đăng Ký (`/auth`)**: **Xác thực tài khoản thật 100% qua Supabase Auth** (`signUp`, `signIn`, `signOut`, duy trì phiên `onAuthStateChange`).

### 2. Khu Vực Quản Trị Viên (Admin Dashboard)
- **Trang Admin Tổng Quan (`/admin`)**: Thống kê tổng doanh thu, số lượng đơn hàng, sản phẩm, thành viên thời gian thực từ Supabase.
- **Trang Admin Sản Phẩm (`/admin/products`)**: **Full CRUD**: Thêm (chọn ảnh từ `assets/images/products/...`), Sửa, Xóa (có hộp thoại hỏi xác nhận `confirm`) trên bảng `products` của Supabase.
- **Trang Admin Đơn Hàng (`/admin/orders`)**: **Read & Update**: Đọc đơn thật; cập nhật trạng thái đơn (Duyệt đơn, Đang giao, Đã hoàn thành, Hủy đơn) thời gian thực trên bảng `orders` của Supabase.
- **Trang Admin Danh Mục (`/admin/categories`)**: **Full CRUD**: Thêm, Sửa, Xóa danh mục trên bảng `categories` của Supabase.
- **Trang Admin Mã Giảm Giá (`/admin/vouchers`)**: **Full CRUD**: Đọc, Thêm, Sửa, Xóa voucher trên bảng `vouchers` của Supabase.
- **Trang Admin Người Dùng (`/admin/users`)**: **Full CRUD**: Đọc, Thêm Admin/Staff, Khóa/Mở khóa tài khoản trên bảng `users` của Supabase.

---

## 🛠️ Hướng Dẫn Chạy Dự Án Cục Bộ

```bash
cd mini-shop-next
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm cửa hàng.
