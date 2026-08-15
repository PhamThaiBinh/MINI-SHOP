# 📚 HƯỚNG DẪN CHI TIẾT BỘ SKILLS THIẾT KẾ GIAO DIỆN & QUY TRÌNH (.AGENTS/SKILLS)

Tài liệu này tổng hợp chi tiết các bộ Skill chuyên sâu được lưu trữ và đăng ký trong hệ thống. Các skill này định hướng cho AI Assistant cách thiết kế UI/UX, nề nếp làm việc nâng cao và refactor giao diện theo tiêu chuẩn cao nhất.

---

## 📋 DANH SÁCH & TỔNG QUAN CÁC SKILLS ĐÃ CÓ

| STT | Tên Skill | Phân Loại | Mục Tiêu & Ứng Dụng Chính |
| :---: | :--- | :--- | :--- |
| **1** | [`frontend-design`](#1-frontend-design) *(Mới cài)* | Thẩm mỹ Frontend | Cẩm nang thiết kế UI/UX tinh tế, phối màu chuẩn, chống AI Slop. |
| **2** | [`superpowers`](#2-superpowers) *(Mới cài)* | Nề nếp Làm việc | Lập kế hoạch trước khi code lớn, Audit First, kiểm kê nghiệm thu theo Checklist. |
| **3** | [`high-end-visual-design`](#3-high-end-visual-design) | Thẩm mỹ UI/UX | Kiến tạo giao diện chuẩn $150k+ Agency (Double-Bezel, Island Buttons, Spring Motion). |
| **4** | [`design-taste-frontend`](#4-design-taste-frontend) | Thẩm mỹ UI/UX | Chống "AI Slop" (Anti-Slop), ngăn chặn giao diện rẻ tiền, chuẩn hóa font chữ & khoảng cách. |
| **5** | [`redesign-existing-projects`](#5-redesign-existing-projects) | Nâng cấp Giao diện | Audit mã nguồn cũ và nâng cấp Visual lên chuẩn Agency mà KHÔNG làm gãy chức năng. |
| **6** | [`minimalist-ui`](#6-minimalist-ui) | Thẩm mỹ UI/UX | Thiết kế Tối giản Tạp chí (Editorial Minimalist) với tông Monochrome ấm áp & Bento Grid phẳng. |
| **7** | [`gpt-taste`](#7-gpt-taste) | Motion & Layout | Thiết kế giao diện động kết hợp hiệu ứng cuộn trang GSAP ScrollTrigger & Typography rộng. |
| **8** | [`industrial-brutalist-ui`](#8-industrial-brutalist-ui) | Thẩm mỹ UI/UX | Phong cách Công nghiệp Cơ khí / Terminal quân sự với lưới thép & font Monospace. |
| **9** | [`image-to-code`](#9-image-to-code) | AI Image-First | Quy tắc "Ảnh trước - Code sau": Dùng AI vẽ ảnh comps trước, phân tích Design System rồi mới code. |
| **10** | [`imagegen-frontend-web`](#10-imagegen-frontend-web) | AI Image Generation | Định hướng tạo ảnh comps thiết kế riêng cho từng Section trên website. |
| **11** | [`imagegen-frontend-mobile`](#11-imagegen-frontend-mobile) | AI Image Generation | Định hướng tạo mockup ảnh giao diện ứng dụng di động (iOS / Android). |
| **12** | [`brandkit`](#12-brandkit) | Nhận diện Thương hiệu | Thiết kế bộ Brand Guidelines, Logo System, Identity Board & Art-directed presentations. |
| **13** | [`stitch-design-taste`](#13-stitch-design-taste) | Design Tokens | Tự động khởi tạo file `DESIGN.md` lưu trữ hệ thống màu sắc, typography & perpetual micro-motion. |
| **14** | [`full-output-enforcement`](#14-full-output-enforcement) | Quy chuẩn Mã nguồn | Ép AI xuất 100% đầy đủ mã nguồn, cấm viết tắt `...` hay bỏ dở code. |
| **15** | [`bao-cao-du-lieu`](#15-bao-cao-du-lieu) | Xuất Báo Cáo | Trợ lý xuất báo cáo chuyên nghiệp DOCX/XLSX từ dữ liệu có cấu trúc. |
| **16** | [`tao-bao-gia`](#16-tao-bao-gia) | Thương mại | Soạn báo giá doanh nghiệp chuyên nghiệp dạng XLSX & DOCX. |
| **17** | [`tao-slide`](#17-tao-slide) | Thuyết trình | Dựng bộ slide thuyết trình PPTX chuyên nghiệp bằng python-pptx. |
| **18** | [`chuyen-doi-tai-lieu`](#18-chuyen-doi-tai-lieu) | Chuyển đổi | Chuyển đổi tài liệu giữa PDF, DOCX, Markdown giữ bảo mật. |
| **19** | [`format-docs-excel`](#19-format-docs-excel) | Chuẩn hóa | Cổng chuẩn hóa định dạng Word, Excel trước khi xuất file cuối. |

---

## 🔍 CHI TIẾT TỪNG THƯ MỤC SKILL MỚI CÀI

### 1. `frontend-design`
* **Mô tả**: Cẩm nang thiết kế giao diện web chuyên nghiệp (Design Taste & Aesthetics), tạo UI/UX chuẩn chỉnh, phối màu tinh tế HSL tailored, khoảng cách thoáng đẹp (8px grid), chống AI Slop và tự động mô-đun hóa CSS/JS.
* **Quy chuẩn cốt lõi**:
  - Bảng màu Curated Palette nhất quán via CSS Variables.
  - Quy tắc chống "AI Slop" (cấm gradient tím mặc định, cấm khung xám placeholder, cấm emoji rải bừa bãi).
  - Tương tác Micro-Interactions mượt mà khi hover.

### 2. `superpowers`
* **Mô tả**: Cẩm nang nề nếp làm việc nâng cao (Work Methodology), lập kế hoạch rà soát trước khi code lớn, kiểm kê sản phẩm, nghiệm thu theo checklist và tự động hóa quy trình.
* **Quy chuẩn cốt lõi**:
  - Lập kế hoạch từng bước cụ thể trước khi thực thi tác vụ lớn.
  - Kiểm kê mã nguồn (Audit First) để không làm gãy chức năng cũ.
  - Cấu trúc Prompt 4 phần chuẩn: **VIỆC - NGUỒN - KẾT QUẢ - LƯU Ý**.
