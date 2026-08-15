"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fixImagePath } from "@/lib/utils";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  image: string;
  status: "Active" | "Hidden";
  desc: string;
}

const INITIAL_ADMIN_PRODUCTS: ProductItem[] = [
  {
    id: 1,
    name: "Sofa 2 chỗ Nordic",
    category: "Furniture",
    categoryName: "Nội thất",
    price: 2990000,
    image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
    status: "Active",
    desc: "Sofa khung gỗ sồi bọc vải nỉ cao cấp phong cách Bắc Âu.",
  },
  {
    id: 2,
    name: "Bàn ăn gỗ Sồi",
    category: "Furniture",
    categoryName: "Nội thất",
    price: 3490000,
    image: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
    status: "Active",
    desc: "Bàn ăn gỗ sồi tự nhiên 4 ghế tiện lợi.",
  },
  {
    id: 3,
    name: "Đèn thả trần Minimal",
    category: "Lighting",
    categoryName: "Đèn trang trí",
    price: 599000,
    image: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
    status: "Active",
    desc: "Đèn chao tre đan thủ công ấm cúng.",
  },
  {
    id: 4,
    name: "Bình gốm Decor",
    category: "Decor",
    categoryName: "Trang trí",
    price: 290000,
    image: "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
    status: "Active",
    desc: "Bộ bình gốm mờ nghệ thuật trang trí bàn làm việc.",
  },
  {
    id: 5,
    name: "Kệ gỗ đa năng",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 1293000,
    image: "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
    status: "Active",
    desc: "Kệ gỗ nhiều tầng lắp ráp linh hoạt.",
  },
  {
    id: 6,
    name: "Giỏ mây lưu trữ",
    category: "Storage",
    categoryName: "Lưu trữ",
    price: 199000,
    image: "/assets/images/products/do-thu-cong/gio-may-dan.webp",
    status: "Active",
    desc: "Giỏ đan mây tre đựng đồ đạc ngăn nắp.",
  },
];

export default function AdminProductsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>(
    INITIAL_ADMIN_PRODUCTS
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
    null
  );

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Furniture");
  const [formPrice, setFormPrice] = useState("");
  const [formImageMode, setFormImageMode] = useState<"file" | "url">("file");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleEditClick = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormImageUrl(prod.image);
    setFormStatus(prod.status);
    setFormDesc(prod.desc);
  };

  const handleDeleteClick = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleResetForm = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("Furniture");
    setFormPrice("");
    setFormImageUrl("");
    setFormStatus("Active");
    setFormDesc("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const catMap: Record<string, string> = {
      Furniture: "Nội thất",
      Decor: "Trang trí",
      Lighting: "Đèn trang trí",
      Kitchen: "Nhà bếp",
      Storage: "Lưu trữ",
    };

    if (editingProduct) {
      // Update product
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                name: formName,
                category: formCategory,
                categoryName: catMap[formCategory] || formCategory,
                price: Number(formPrice),
                image:
                  formImageUrl ||
                  p.image,
                status: formStatus,
                desc: formDesc,
              }
            : p
        )
      );
    } else {
      // Add product
      const newProd: ProductItem = {
        id: Date.now(),
        name: formName,
        category: formCategory,
        categoryName: catMap[formCategory] || formCategory,
        price: Number(formPrice),
        image:
          formImageUrl ||
          "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
        status: formStatus,
        desc: formDesc,
      };
      setProducts((prev) => [...prev, newProd]);
    }
    handleResetForm();
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "Furniture":
        return "cat-badge cat-furniture";
      case "Lighting":
        return "cat-badge cat-lighting";
      case "Decor":
        return "cat-badge cat-decor";
      case "Storage":
        return "cat-badge cat-storage";
      case "Kitchen":
        return "cat-badge cat-kitchen";
      default:
        return "cat-badge cat-furniture";
    }
  };

  return (
    <div className="admin-wrapper">
      {/* Left Sidebar Navigation */}
      <AdminSidebar activeMenu="products" sidebarCollapsed={sidebarCollapsed} />

      {/* 2. Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar Đồng Bộ Chuẩn 3 Thông Báo & Menu Admin Interactive */}
        <AdminHeader
          title="Quản Lý Sản Phẩm"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Tìm tên sản phẩm hoặc danh mục..."
        />

        {/* Dashboard Workspace 3-Column Grid Layout */}
        <div className="dashboard-content-body">
          <div className="admin-workspace-grid">
            {/* Center Column: Products Table */}
            <div className="tables-column">
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2 className="card-header-title">Quản Lý Sản Phẩm</h2>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      className="select-filter-sm"
                      style={{ cursor: "pointer" }}
                    >
                      🔍 Bộ lọc
                    </button>
                    <button
                      className="btn-add-product-green"
                      onClick={handleResetForm}
                    >
                      + Thêm Sản Phẩm
                    </button>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Hình ảnh</th>
                      <th>Tên Sản Phẩm</th>
                      <th>Danh mục</th>
                      <th>Giá bán</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: "center" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((prod, index) => (
                      <tr key={prod.id}>
                        <td>{(safeCurrentPage - 1) * pageSize + index + 1}</td>
                        <td>
                          <div className="admin-product-cell">
                            <img src={fixImagePath(prod.image)} alt={prod.name} />
                          </div>
                        </td>
                        <td>
                          <strong>{prod.name}</strong>
                        </td>
                        <td>
                          <span className={getCategoryBadgeClass(prod.category)}>
                            {prod.categoryName}
                          </span>
                        </td>
                        <td>{prod.price.toLocaleString("vi-VN")}đ</td>
                        <td>
                          <span
                            className={
                              prod.status === "Active"
                                ? "badge-visible"
                                : "badge-lowstock"
                            }
                          >
                            {prod.status === "Active" ? "● Hoạt động" : "○ Ẩn"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn-action-edit"
                            onClick={() => handleEditClick(prod)}
                          >
                            📝 Sửa
                          </button>
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteClick(prod.id)}
                          >
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Table Footer Pagination */}
                <div className="table-footer-row">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span>Hiển thị:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      <option value={10}>10 SP / trang</option>
                      <option value={25}>25 SP / trang</option>
                      <option value={50}>50 SP / trang</option>
                    </select>
                    <span>
                      Hiển thị {filteredProducts.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} -{" "}
                      {Math.min(safeCurrentPage * pageSize, filteredProducts.length)} / tổng {filteredProducts.length} sản phẩm
                    </span>
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      style={{ opacity: safeCurrentPage <= 1 ? 0.5 : 1, cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer" }}
                    >
                      &lt; Trang trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        className={`page-btn ${p === safeCurrentPage ? "active" : ""}`}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      className="page-btn"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      style={{ opacity: safeCurrentPage >= totalPages ? 0.5 : 1, cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer" }}
                    >
                      Trang sau &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Form Panel */}
            <aside className="product-form-panel">
              <h2
                className="card-header-title"
                style={{ marginBottom: "16px" }}
              >
                {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Form Sản Phẩm Mới"}
              </h2>

              <form
                style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                onSubmit={handleFormSubmit}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-p-name">Tên sản phẩm *</label>
                  <input
                    type="text"
                    id="form-p-name"
                    className="form-control"
                    placeholder="Nhập tên sản phẩm..."
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-p-category">Danh mục</label>
                  <select
                    id="form-p-category"
                    className="form-control"
                    style={{ background: "#fff" }}
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Furniture">Nội thất</option>
                    <option value="Decor">Trang trí</option>
                    <option value="Lighting">Đèn trang trí</option>
                    <option value="Kitchen">Nhà bếp</option>
                    <option value="Storage">Lưu trữ</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-p-price">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    id="form-p-price"
                    className="form-control"
                    placeholder="Nhập giá bán..."
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>

                {/* Chế độ Tải ảnh: Tệp máy tính OR URL Online */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>Hình ảnh sản phẩm</span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: "normal",
                      }}
                    >
                      File máy tính hoặc URL
                    </span>
                  </label>

                  {/* Tab Chuyển Đổi Nguồn Ảnh */}
                  <div
                    className="image-source-tabs"
                    style={{ display: "flex", gap: "6px", marginBottom: "8px" }}
                  >
                    <button
                      type="button"
                      className={`img-tab-btn ${
                        formImageMode === "file" ? "active" : ""
                      }`}
                      onClick={() => setFormImageMode("file")}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        background:
                          formImageMode === "file"
                            ? "#e8f5e9"
                            : "#f8fafc",
                        color:
                          formImageMode === "file"
                            ? "var(--primary-color)"
                            : "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      📁 Tải từ máy tính
                    </button>
                    <button
                      type="button"
                      className={`img-tab-btn ${
                        formImageMode === "url" ? "active" : ""
                      }`}
                      onClick={() => setFormImageMode("url")}
                      style={{
                        flex: 1,
                        padding: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-sm)",
                        background:
                          formImageMode === "url" ? "#e8f5e9" : "#f8fafc",
                        color:
                          formImageMode === "url"
                            ? "var(--primary-color)"
                            : "var(--text-muted)",
                        cursor: "pointer",
                      }}
                    >
                      🌐 Nhập URL Online
                    </button>
                  </div>

                  {/* Mode 1: Upload File từ Máy tính */}
                  {formImageMode === "file" ? (
                    <div
                      className="upload-image-box"
                      onClick={() => {
                        const fileInput = document.getElementById(
                          "input-file-image-app"
                        );
                        if (fileInput) fileInput.click();
                      }}
                    >
                      <input
                        type="file"
                        id="input-file-image-app"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                setFormImageUrl(
                                  event.target.result as string
                                );
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div
                        style={{
                          fontSize: "24px",
                          color: "var(--primary-color)",
                        }}
                      >
                        💻
                      </div>
                      <div className="upload-icon-text">
                        Nhấp để chọn tệp từ máy tính
                      </div>
                      <div className="upload-hint">
                        Hỗ trợ .jpg, .png, .webp, .gif (Tối đa 5MB)
                      </div>
                    </div>
                  ) : (
                    /* Mode 2: Nhập Link URL Online */
                    <div>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com/hinh-anh.jpg"
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                      />
                      <div
                        className="upload-hint"
                        style={{ marginTop: "4px" }}
                      >
                        Dán đường dẫn ảnh trực tiếp từ website
                      </div>
                    </div>
                  )}

                  {/* Khung Xem Trước Ảnh (Preview Box) */}
                  {formImageUrl && (
                    <div
                      style={{
                        marginTop: "10px",
                        position: "relative",
                        textAlign: "center",
                      }}
                    >
                      <img
                        src={formImageUrl}
                        alt="Preview"
                        style={{
                          maxHeight: "120px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--border-color)",
                          objectFit: "cover",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormImageUrl("")}
                        style={{
                          position: "absolute",
                          top: "-6px",
                          right: "calc(50% - 65px)",
                          background: "#ef4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "11px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        title="Xóa ảnh"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-p-status">Trạng thái kinh doanh</label>
                  <select
                    id="form-p-status"
                    className="form-control"
                    style={{ background: "#fff" }}
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Active" | "Hidden")
                    }
                  >
                    <option value="Active">● Hoạt động</option>
                    <option value="Hidden">○ Ẩn sản phẩm</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-p-desc">Mô tả sản phẩm</label>
                  <textarea
                    id="form-p-desc"
                    className="form-control"
                    placeholder="Nhập mô tả chi tiết sản phẩm..."
                    style={{ minHeight: "75px" }}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-footer-btns">
                  <button
                    type="submit"
                    className="btn-save-green"
                    style={{ backgroundColor: "var(--primary-color)" }}
                  >
                    💾 {editingProduct ? "Cập Nhật" : "Lưu Sản Phẩm"}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-gray"
                    onClick={handleResetForm}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
