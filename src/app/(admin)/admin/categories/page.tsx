"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminCategories, saveAdminCategory, deleteAdminCategory, fetchAdminOrders } from "@/lib/supabaseAdmin";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { formatVND } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Edit3, Trash2, Folder, Plus, X } from "lucide-react";

interface Category {
  id: number;
  icon: string;
  name: string;
  slug: string;
  productCount: number;
  status: "Active" | "Hidden";
  desc?: string;
}

export default function AdminCategoriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form inputs state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");

  // Dynamic Top Category Info from Supabase Orders
  const [topCatInfo, setTopCatInfo] = useState<{ name: string; revenue: number }>({ name: "Chưa có doanh thu", revenue: 0 });

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchAdminCategories();
    const cleanData = data.filter((c) => c.name.trim() !== "Tất cả" && c.name.trim() !== "All");

    if (cleanData.length > 0) {
      setCategories(cleanData);
    } else {
      // Fallback clean default categories
      setCategories([
        { id: 1, icon: "Bed", name: "Nội Thất Phòng Ngủ", slug: "phong-ngu", productCount: 4, status: "Active", desc: "Giường ngủ, tủ quần áo, bàn trang điểm" },
        { id: 2, icon: "Sofa", name: "Nội Thất Phòng Khách", slug: "phong-khach", productCount: 5, status: "Active", desc: "Sofa, bàn trà, kệ TV" },
        { id: 3, icon: "Utensils", name: "Nội Thất Phòng Ăn", slug: "phong-an", productCount: 4, status: "Active", desc: "Bàn ăn, ghế ăn, tủ bếp" },
        { id: 4, icon: "Briefcase", name: "Nội Thất Phòng Làm Việc", slug: "phong-lam-viec", productCount: 3, status: "Active", desc: "Bàn làm việc, ghế công thái học" },
        { id: 5, icon: "Sparkles", name: "Trang Trí & Decor", slug: "trang-tri", productCount: 2, status: "Active", desc: "Đèn trang trí, thảm, tranh treo tường" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    async function calcTopCategory() {
      if (categories.length === 0) return;
      const [prods, orders] = await Promise.all([
        fetchProductsFromSupabase(),
        fetchAdminOrders(),
      ]);

      const completedOrders = (orders || []).filter((o) => o.status === "completed" || o.status !== "cancelled");
      if (completedOrders.length === 0) {
        setTopCatInfo({ name: "Chưa có doanh thu", revenue: 0 });
        return;
      }

      const catRevenueMap: Record<string, number> = {};
      categories.forEach((c) => {
        catRevenueMap[c.name] = 0;
      });

      completedOrders.forEach((ord) => {
        (ord.items || []).forEach((it) => {
          const matchedProd = prods.find((p) => p.name.trim().toLowerCase() === it.name.trim().toLowerCase());
          if (matchedProd) {
            const catName = matchedProd.categoryName || matchedProd.category;
            const matchedCat = categories.find(
              (c) => c.name.toLowerCase() === (catName || "").toLowerCase() || c.slug === catName
            );
            const key = matchedCat ? matchedCat.name : catName;
            if (key) {
              catRevenueMap[key] = (catRevenueMap[key] || 0) + ((it.price || 0) * (it.qty || 1));
            }
          }
        });
      });

      let maxCat = "Chưa có doanh thu";
      let maxRev = 0;
      Object.entries(catRevenueMap).forEach(([cName, rev]) => {
        if (rev > maxRev) {
          maxRev = rev;
          maxCat = cName;
        }
      });

      setTopCatInfo({ name: maxCat, revenue: maxRev });
    }

    calcTopCategory();
  }, [categories]);

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.desc && c.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = filteredCategories.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormIcon("");
    setFormStatus("Active");
    setFormDesc("");
    setShowModal(true);
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIcon(cat.icon);
    setFormStatus(cat.status);
    setFormDesc(cat.desc || "");
    setShowModal(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      const supabase = createClient();
      await supabase.from("categories").delete().eq("id", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formName.trim() === "Tất cả") {
      alert("Không thể đặt tên danh mục là 'Tất cả'!");
      return;
    }

    const isDuplicate = categories.some(
      (c) =>
        c.name.trim().toLowerCase() === formName.trim().toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (isDuplicate) {
      alert(`Danh mục tên "${formName.trim()}" đã tồn tại trong hệ thống! Vui lòng chọn tên khác.`);
      return;
    }

    const cleanSlug = formSlug || formName.toLowerCase().replace(/\s+/g, "-");
    const cleanIcon = formIcon || "";

    const supabase = createClient();
    if (editingCategory) {
      await supabase
        .from("categories")
        .update({
          name: formName.trim(),
          slug: cleanSlug,
          icon: cleanIcon,
          description: formDesc.trim(),
        })
        .eq("id", editingCategory.id);

      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName.trim(),
                slug: cleanSlug,
                icon: cleanIcon,
                status: formStatus,
                desc: formDesc.trim(),
              }
            : c
        )
      );
    } else {
      const generatedCategoryId = `C${String(categories.length + 1).padStart(4, "0")}`;
      const { data } = await supabase
        .from("categories")
        .insert({
          category_id: generatedCategoryId,
          name: formName.trim(),
          slug: cleanSlug,
          icon: cleanIcon,
          description: formDesc.trim(),
        })
        .select();

      const newId = data && data.length > 0 ? Number(data[0].id) : Date.now();

      const newCat: Category = {
        id: newId,
        name: formName.trim(),
        slug: cleanSlug,
        icon: cleanIcon,
        productCount: 0,
        status: formStatus,
        desc: formDesc.trim(),
      };
      setCategories((prev) => [...prev, newCat]);
    }

    setShowModal(false);
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar activeMenu="categories" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Danh mục"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm danh mục sản phẩm..."
        />

        <div className="dashboard-content-body">
          {/* 1. CATEGORY KPI SUMMARY CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* KPI 1: Total Categories */}
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
                  Tổng Nhóm Hàng
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {categories.length} <span style={{ fontSize: "14px", fontWeight: 700 }}>danh mục</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    {categories.filter((c) => c.status === "Active").length} đang hoạt động
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#166534", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(22, 101, 52, 0.2)" }}>
                <Folder className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 2: Top Revenue Category */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                border: "1.5px solid #bae6fd",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(3, 105, 161, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#0369a1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Nhóm Bán Chạy Nhất
                </div>
                <div style={{ fontSize: "20px", fontWeight: 900, color: "#0c4a6e", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {topCatInfo.name}
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    {topCatInfo.revenue > 0 ? `Doanh thu: ${formatVND(topCatInfo.revenue)}` : "Chưa có doanh thu từ đơn hàng"}
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(2, 132, 199, 0.2)" }}>
                <Edit3 className="w-6 h-6" />
              </div>
            </div>

            {/* KPI 3: Empty Categories */}
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
                  Chưa Có Sản Phẩm
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#78350f", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {categories.filter((c) => c.productCount === 0).length} <span style={{ fontSize: "14px", fontWeight: 700 }}>nhóm</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Cần bổ sung hàng
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#d97706", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.2)" }}>
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="admin-card-shell">
            <div className="admin-card-core">
              <div className="card-header-row" style={{ marginBottom: "20px" }}>
                <div>
                  <h2 className="card-header-title text-xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Danh Sách Danh Mục ({filteredCategories.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Quản lý hiển thị các nhóm sản phẩm kinh doanh trên website
                  </p>
                </div>
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
                  <Plus className="w-4 h-4" /> Thêm Danh Mục Mới
                </button>
              </div>

            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                Đang tải dữ liệu danh mục...
              </div>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>MÃ SỐ</th>
                      <th>BIỂU TƯỢNG</th>
                      <th>TÊN DANH MỤC</th>
                      <th>SLUG</th>
                      <th>SỐ SẢN PHẨM & TỶ TRỌNG</th>
                      <th>MÔ TẢ</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: "center" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          Không có danh mục nào khớp với tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      paginatedCategories.map((cat, index) => (
                        <tr key={cat.id}>
                          <td>
                            <code style={{ padding: "3px 8px", background: "#f1f5f9", color: "#1e293b", borderRadius: "6px", fontWeight: 800, fontSize: "11px" }}>
                              C{String(cat.id || index + 1).padStart(4, "0")}
                            </code>
                          </td>
                          <td>
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "12px",
                                backgroundColor: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                color: "#166534",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "18px",
                              }}
                            >
                              {cat.icon || "📁"}
                            </div>
                          </td>
                          <td><strong style={{ fontSize: "14px", color: "#0f172a" }}>{cat.name}</strong></td>
                          <td><code style={{ background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", fontSize: "12px", color: "#475569" }}>{cat.slug}</code></td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "140px" }}>
                              <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>
                                {cat.productCount} sản phẩm ({cat.productCount > 0 ? Math.min(100, cat.productCount * 10) : 0}%)
                              </span>
                              <div style={{ background: "#f1f5f9", height: "6px", borderRadius: "3px", overflow: "hidden" }}>
                                <div style={{ background: "var(--primary-color, #2e7d32)", height: "100%", width: `${Math.min(100, cat.productCount * 10)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: "12px", color: "var(--text-muted)" }}>{cat.desc || "Chưa có mô tả"}</td>
                          <td>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                background: cat.status === "Active" ? "#dcfce7" : "#f1f5f9",
                                color: cat.status === "Active" ? "#166534" : "#64748b",
                              }}
                            >
                              {cat.status === "Active" ? "● Hoạt động" : "○ Đã ẩn"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleEditClick(cat)}
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
                                <Edit3 className="w-3.5 h-3.5" /> Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteClick(cat.id)}
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
                      <option value={10}>10 danh mục</option>
                      <option value={25}>25 danh mục</option>
                      <option value={50}>50 danh mục</option>
                    </select>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      Hiển thị {paginatedCategories.length}/{filteredCategories.length} danh mục
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

      {/* FORM MODAL DANH MỤC MỚI / CHỈNH SỬA */}
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
              maxWidth: "500px",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                {editingCategory ? <><Edit3 className="w-4 h-4 text-blue-600" /> Chỉnh Sửa Danh Mục</> : <><Plus className="w-4 h-4 text-emerald-700" /> Form Danh Mục Mới</>}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Chọn Biểu Tượng Nhóm Hàng *
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {["🛋️", "🛏️", "🍳", "💡", "🖼️", "🌿", "📚", "🪴", "🚿", "🪑"].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setFormIcon(ic)}
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "12px",
                        border: formIcon === ic ? "2px solid #2e7d32" : "1px solid #cbd5e1",
                        background: formIcon === ic ? "#f0fdf4" : "#ffffff",
                        fontSize: "20px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Hoặc nhập biểu tượng tự chọn"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Tên Danh Mục *</label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: Nội Thất Phòng Khách"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mã Đường Dẫn (Slug)</label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: phong-khach"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                />
              </div>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Trạng Thái Hiển Thị *</label>
                <select
                  className="form-control admin-setting-input"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <option value="Active">● Hoạt động (Cho phép chọn)</option>
                  <option value="Hidden">○ Đã ẩn (Ẩn khỏi menu)</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Mô Tả Danh Mục</label>
                <textarea
                  rows={3}
                  className="form-control admin-setting-input"
                  placeholder="Mô tả ngắn nhóm sản phẩm..."
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
                  {editingCategory ? "Lưu Cập Nhật" : "Tạo Danh Mục Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
