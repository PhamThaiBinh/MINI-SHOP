"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fixImagePath, formatVND } from "@/lib/utils";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { Edit, Trash2, Plus, X, Package, AlertTriangle } from "lucide-react";
import { saveAdminProduct, deleteAdminProduct, fetchAdminCategories } from "@/lib/supabaseAdmin";

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

interface CategoryItem {
  id: number;
  icon: string;
  name: string;
}

export default function AdminProductsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const [list, cats] = await Promise.all([
      fetchProductsFromSupabase(),
      fetchAdminCategories(),
    ]);

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
    if (cats && cats.length > 0) {
      setDbCategories(cats.map((c) => ({ id: c.id, icon: c.icon, name: c.name })));
    } else {
      setDbCategories([
        { id: 1, icon: "", name: "Nội Thất Phòng Ngủ" },
        { id: 2, icon: "", name: "Nội Thất Phòng Khách" },
        { id: 3, icon: "", name: "Nội Thất Phòng Ăn" },
        { id: 4, icon: "", name: "Nội Thất Phòng Làm Việc" },
        { id: 5, icon: "", name: "Trang Trí & Decor" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
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
    setFormCategory(dbCategories[0]?.name || "Nội Thất Phòng Khách");
    setFormPrice("");
    setFormImageUrl("");
    setFormStatus("Active");
    setFormDesc("");
    setShowModal(true);
  };

  const handleEditClick = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.categoryName || prod.category);
    setFormPrice(prod.price.toString());
    setFormImageUrl(prod.image);
    setFormStatus(prod.status);
    setFormDesc(prod.desc);
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
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
      alert("Giá bán sản phẩm phải là một số dương lớn hơn 0!");
      return;
    }

    const selectedCategoryName = formCategory || (dbCategories[0]?.name || "Nội Thất Phòng Khách");

    let finalImage = formImageUrl.trim();
    if (!finalImage || (!finalImage.startsWith("http://") && !finalImage.startsWith("https://") && !finalImage.startsWith("/assets/"))) {
      finalImage = "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp";
    }

    const prodData = {
      id: editingProduct ? editingProduct.id : undefined,
      name: formName.trim(),
      category: selectedCategoryName,
      categoryName: selectedCategoryName,
      price: Number(formPrice),
      image: finalImage,
      status: formStatus,
      description: formDesc,
    };

    setLoading(true);
    const success = await saveAdminProduct(prodData);
    if (success) {
      await loadData();
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
          title="Sản phẩm"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm tên sản phẩm hoặc danh mục..."
        />

        <div className="dashboard-content-body">
          {/* 1. INVENTORY MATRIX STATUS BAR */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Matrix 1: Active Products */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                border: "1.5px solid #bbf7d0",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(22, 101, 52, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Đang Kinh Doanh
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {products.filter((p) => p.status === "Active").length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Hiển thị công khai
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#166534", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(22, 101, 52, 0.2)" }}>
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Matrix 2: Low Stock Warning */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
                border: "1.5px solid #fde68a",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(180, 83, 9, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Cảnh Báo Tồn Thấp (&le;10)
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#78350f", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {products.filter((p) => (p.stock !== undefined ? p.stock : 15) <= 10).length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Cần nhập thêm hàng
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#d97706", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.2)" }}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* Matrix 3: Hidden Products */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1.5px solid #cbd5e1",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(100, 116, 139, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Tạm Ẩn / Hết Hàng
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {products.filter((p) => p.status === "Hidden").length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Tạm ngừng hiển thị
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#64748b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(100, 116, 139, 0.2)" }}>
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="admin-card-shell">
            <div className="admin-card-core">
              <div className="card-header-row" style={{ marginBottom: "20px" }}>
                <div>
                  <h2 className="card-header-title text-xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Danh Sách Sản Phẩm Kinh Doanh ({filteredProducts.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Quản lý giá bán, hình ảnh và tồn kho sản phẩm trực tuyến
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setOnlyLowStock(!onlyLowStock)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      border: "1px solid #fde68a",
                      borderRadius: "999px",
                      background: onlyLowStock ? "#fffbeb" : "#fff",
                      color: onlyLowStock ? "#b45309" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {onlyLowStock ? "⚠️ Đang lọc: Tồn kho thấp" : "⚠️ Cảnh báo tồn thấp"}
                  </button>
                  <button
                    className="btn-add-product-green"
                    onClick={handleOpenAddModal}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      fontWeight: 800,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                    }}
                  >
                    <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
                  </button>
                </div>
              </div>

            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                Đang tải danh sách sản phẩm...
              </div>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>MÃ SỐ</th>
                      <th>HÌNH ẢNH HD</th>
                      <th>TÊN SẢN PHẨM</th>
                      <th>DANH MỤC</th>
                      <th>GIÁ BÁN</th>
                      <th>TỔN KHO</th>
                      <th>BẬT / TẮT BÁN</th>
                      <th style={{ textAlign: "center" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          Không có sản phẩm nào khớp với tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((prod, index) => (
                        <tr key={prod.id}>
                          <td>
                            <code style={{ padding: "3px 8px", background: "#f1f5f9", color: "#1e293b", borderRadius: "6px", fontWeight: 800, fontSize: "11px" }}>
                              P{String(prod.id || index + 1).padStart(4, "0")}
                            </code>
                          </td>
                          <td>
                            <div style={{ overflow: "hidden", borderRadius: "12px", width: "44px", height: "44px", border: "1px solid #e2e8f0" }}>
                              <img
                                src={fixImagePath(prod.image)}
                                alt={prod.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                              />
                            </div>
                          </td>
                          <td><strong style={{ fontSize: "14px", color: "#0f172a" }}>{prod.name}</strong></td>
                          <td>
                            <span className="cat-badge cat-furniture" style={{ borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                              {prod.categoryName}
                            </span>
                          </td>
                          <td style={{ fontWeight: 900, color: "var(--primary-color, #2e7d32)", fontSize: "14px" }}>
                            {formatVND(prod.price)}
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, fontSize: "13px", color: (prod.stock !== undefined ? prod.stock : 15) <= 10 ? "#b45309" : "#1e293b" }}>
                              {prod.stock !== undefined ? prod.stock : 15} món
                            </span>
                          </td>
                          <td>
                            {/* Inline Switch Toggle */}
                            <button
                              type="button"
                              onClick={async () => {
                                const newStatus = prod.status === "Active" ? "Hidden" : "Active";
                                await saveAdminProduct({ ...prod, status: newStatus });
                                await loadData();
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "999px",
                                border: prod.status === "Active" ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                                background: prod.status === "Active" ? "#f0fdf4" : "#f8fafc",
                                color: prod.status === "Active" ? "#16532d" : "#64748b",
                                fontSize: "11px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {prod.status === "Active" ? "🟢 Đang bán" : "⚪ Đã ẩn"}
                            </button>
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
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" /> Sửa
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
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Standardized Pagination Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 0 4px 0",
                    borderTop: "1px solid var(--border-color)",
                    marginTop: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <option value={10}>10 sản phẩm</option>
                      <option value={25}>25 sản phẩm</option>
                      <option value={50}>50 sản phẩm</option>
                    </select>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      Hiển thị {paginatedProducts.length}/{filteredProducts.length} sản phẩm
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                        opacity: safeCurrentPage === 1 ? 0.5 : 1,
                      }}
                    >
                      &laquo; Trang trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          background: p === safeCurrentPage ? "var(--primary-color)" : "#fff",
                          color: p === safeCurrentPage ? "#fff" : "var(--text-main)",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: safeCurrentPage === totalPages ? 0.5 : 1,
                      }}
                    >
                      Trang sau &raquo;
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </main>

      {/* 2-COLUMN HIGH-END FORM MODAL SẢN PHẨM MỚI / CHỈNH SỬA */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(10px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="admin-card-shell"
            style={{
              width: "100%",
              maxWidth: "760px",
              borderRadius: "24px",
            }}
          >
            <div className="admin-card-core" style={{ padding: "28px", borderRadius: "calc(24px - 6px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Form Thêm Sản Phẩm Mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", marginBottom: "24px" }}>
                  {/* Left Column: Image Live Preview Box */}
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Xem Trước Hình Ảnh
                    </label>
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        borderRadius: "16px",
                        border: "2px dashed #cbd5e1",
                        background: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {formImageUrl ? (
                        <img
                          src={fixImagePath(formImageUrl)}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.currentTarget as any).src = "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp";
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8" }}>
                          <Package className="w-10 h-10 stroke-1 mb-2 text-slate-400" />
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>Dán URL ảnh để xem trước</span>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>URL Hình Ảnh *</label>
                      <input
                        type="text"
                        className="form-control admin-setting-input"
                        placeholder="/assets/images/... hoặc https://..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        style={{ fontSize: "12px", borderRadius: "10px", padding: "8px 12px" }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Product Metadata Fields */}
                  <div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tên Sản Phẩm *</label>
                      <input
                        type="text"
                        className="form-control admin-setting-input"
                        placeholder="Ví dụ: Bàn Ăn Gỗ Sồi Tự Nhiên"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Danh Mục *</label>
                        <select
                          className="form-control admin-setting-input"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          required
                          style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {dbCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Giá Bán (VNĐ) *</label>
                        <input
                          type="number"
                          className="form-control admin-setting-input"
                          placeholder="Ví dụ: 3500000"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          required
                          style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trạng Thái Hiển Thị</label>
                      <select
                        className="form-control admin-setting-input"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <option value="Active">🟢 Đang bán (Hiển thị công khai)</option>
                        <option value="Hidden">⚪ Đã ẩn (Không hiển thị)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mô Tả Sản Phẩm</label>
                      <textarea
                        rows={3}
                        className="form-control admin-setting-input"
                        placeholder="Nhập mô tả chi tiết chất liệu, kích thước..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "999px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      color: "#475569",
                    }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 24px",
                      borderRadius: "999px",
                      border: "none",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
                    }}
                  >
                    {editingProduct ? "Lưu Cập Nhật" : "Tạo Sản Phẩm Mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
