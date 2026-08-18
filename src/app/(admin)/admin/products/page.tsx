"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fixImagePath, formatVND } from "@/lib/utils";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { saveAdminProduct, deleteAdminProduct } from "@/lib/supabaseAdmin";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  image: string;
  status: "Active" | "Hidden";
  desc: string;
  stock?: number;
}

export default function AdminProductsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Furniture");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const loadProductData = async () => {
    setLoading(true);
    const list = await fetchProductsFromSupabase();
    const mapped = list.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      categoryName: p.categoryName || p.category,
      price: p.price,
      image: p.image,
      status: (p.status === "Hidden" ? "Hidden" : "Active") as any,
      desc: p.description || "",
      stock: p.stock !== undefined ? p.stock : 10,
    }));
    setProducts(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadProductData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!onlyLowStock || ((p as any).stock !== undefined && (p as any).stock <= 5))
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory("Furniture");
    setFormPrice("");
    setFormImageUrl("");
    setFormStatus("Active");
    setFormDesc("");
    setShowModal(true);
  };

  const handleEditClick = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.category);
    setFormPrice(prod.price.toString());
    setFormImageUrl(prod.image);
    setFormStatus(prod.status);
    setFormDesc(prod.desc);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("⚠️ Bạn có chắc muốn xóa sản phẩm này không?")) {
      setLoading(true);
      const success = await deleteAdminProduct(id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Xóa sản phẩm thất bại!");
      }
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPrice) return;

    const numPrice = Number(formPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("⚠️ Giá bán sản phẩm phải là một số dương lớn hơn 0!");
      return;
    }

    const catMap: Record<string, string> = {
      Furniture: "Nội thất",
      Decor: "Trang trí",
      Lighting: "Đèn trang trí",
      Kitchen: "Nhà bếp",
      Storage: "Lưu trữ",
    };

    let finalImage = formImageUrl.trim();
    if (!finalImage || (!finalImage.startsWith("http://") && !finalImage.startsWith("https://") && !finalImage.startsWith("/assets/"))) {
      finalImage = "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp";
    }

    const prodData = {
      id: editingProduct ? editingProduct.id : undefined,
      name: formName.trim(),
      category: formCategory,
      categoryName: catMap[formCategory] || formCategory,
      price: Number(formPrice),
      image: finalImage,
      status: formStatus,
      description: formDesc,
    };

    setLoading(true);
    const success = await saveAdminProduct(prodData);
    if (success) {
      await loadProductData();
      setShowModal(false);
    } else {
      alert("Lưu sản phẩm thất bại!");
      setLoading(false);
    }
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar activeMenu="products" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Quản Lý Sản Phẩm"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Tìm tên sản phẩm hoặc danh mục..."
        />

        <div className="dashboard-content-body">
          <div className="dashboard-card">
            <div className="card-header-row" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="card-header-title">Danh Sách Sản Phẩm Kinh Doanh ({products.length})</h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Quản lý giá bán, hình ảnh và tồn kho sản phẩm trực tuyến
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 700,
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    background: onlyLowStock ? "#fee2e2" : "#f8fafc",
                    color: onlyLowStock ? "#b91c1c" : "inherit",
                    cursor: "pointer",
                  }}
                >
                  {onlyLowStock ? "🔥 Đang lọc: Sắp hết hàng" : "🔥 Sắp hết hàng"}
                </button>
                <button className="btn-add-product-green" onClick={handleOpenAddModal}>
                  + Thêm Sản Phẩm Mới
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                ⏳ Đang tải danh sách sản phẩm...
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hình ảnh</th>
                    <th>Tên Sản Phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá bán</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: "center" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                        Không có sản phẩm nào khớp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((prod, index) => (
                      <tr key={prod.id}>
                        <td>{(safeCurrentPage - 1) * pageSize + index + 1}</td>
                        <td>
                          <img
                            src={fixImagePath(prod.image)}
                            alt={prod.name}
                            style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }}
                          />
                        </td>
                        <td><strong>{prod.name}</strong></td>
                        <td>
                          <span className="cat-badge cat-furniture">{prod.categoryName}</span>
                        </td>
                        <td style={{ fontWeight: 800, color: "var(--primary-color)" }}>{formatVND(prod.price)}</td>
                        <td>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              fontSize: "11px",
                              fontWeight: 700,
                              background: prod.status === "Active" ? "#dcfce7" : "#fee2e2",
                              color: prod.status === "Active" ? "#166534" : "#991b1b",
                            }}
                          >
                            {prod.status === "Active" ? "● Đang bán" : "○ Đã ẩn"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                            <button
                              onClick={() => handleEditClick(prod)}
                              style={{
                                padding: "4px 8px",
                                background: "#eff6ff",
                                color: "#2563eb",
                                border: "1px solid #bfdbfe",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              style={{
                                padding: "4px 8px",
                                background: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "12px",
                                fontWeight: 700,
                              }}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* FORM MODAL SẢN PHẨM MỚI / CHỈNH SỬA */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {editingProduct ? "✏️ Chỉnh Sửa Sản Phẩm" : "🛍️ Form Sản Phẩm Mới"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Tên Sản Phẩm *</label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: Bàn Ăn Gỗ Sồi Tự Nhiên"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Danh Mục *</label>
                  <select
                    className="form-control admin-setting-input"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Furniture">Nội thất phòng khách/ngủ</option>
                    <option value="Decor">Trang trí & Decor</option>
                    <option value="Lighting">Đèn trang trí</option>
                    <option value="Kitchen">Nhà bếp & Phòng ăn</option>
                    <option value="Storage">Lưu trữ & Tủ quần áo</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Giá Bán (VNĐ) *</label>
                  <input
                    type="number"
                    className="form-control admin-setting-input"
                    placeholder="Ví dụ: 3500000"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Đường Dẫn Hình Ảnh (URL hoặc Assets)</label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="/assets/images/products/... hoặc https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Trạng Thái Bán</label>
                <select
                  className="form-control admin-setting-input"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <option value="Active">● Đang bán (Hiển thị công khai)</option>
                  <option value="Hidden">○ Đã ẩn (Không hiển thị)</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mô Tả Sản Phẩm</label>
                <textarea
                  rows={3}
                  className="form-control admin-setting-input"
                  placeholder="Nhập mô tả chi tiết chất liệu, kích thước..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "var(--primary-color)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {editingProduct ? "Lưu Cập Nhật" : "Tạo Sản Phẩm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
