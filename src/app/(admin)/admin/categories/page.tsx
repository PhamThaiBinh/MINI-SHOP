"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminCategories, saveAdminCategory, deleteAdminCategory, fetchAdminOrders } from "@/lib/supabaseAdmin";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { formatVND, fixImagePath } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Edit3, Trash2, Folder, Plus, X, Eye, Package, Layers, ExternalLink } from "lucide-react";

interface Category {
  id: number;
  icon?: string;
  name: string;
  slug: string;
  productCount: number;
  status: "Active" | "Hidden";
  desc?: string;
}

interface ProductDetail {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  stock?: number;
  status: string;
}

export default function AdminCategoriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // View Category Products Modal State
  const [viewProductsModal, setViewProductsModal] = useState<{
    isOpen: boolean;
    category: Category | null;
    products: ProductDetail[];
    loading: boolean;
  }>({
    isOpen: false,
    category: null,
    products: [],
    loading: false,
  });

  // Custom Delete Confirm Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    category: Category | null;
    relatedCount: number;
    deleting: boolean;
  }>({
    isOpen: false,
    category: null,
    relatedCount: 0,
    deleting: false,
  });

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form inputs state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");

  // Dynamic Top Category Info from Supabase Orders
  const [topCatInfo, setTopCatInfo] = useState<{ name: string; revenue: number }>({ name: "Chưa có doanh thu", revenue: 0 });

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchAdminCategories();
    const cleanData = data.filter((c) => c.name.trim() !== "Tất cả" && c.name.trim() !== "All");
    setCategories(cleanData);
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

      completedOrders.forEach((order) => {
        (order.items || []).forEach((item: any) => {
          const matchedProd = prods.find((p) => p.name.trim().toLowerCase() === item.name.trim().toLowerCase());
          if (matchedProd) {
            const catName = matchedProd.categoryName || matchedProd.category;
            const matchedCat = categories.find(
              (c) => c.name.toLowerCase() === catName.toLowerCase() || c.slug.toLowerCase() === catName.toLowerCase()
            );
            if (matchedCat) {
              catRevenueMap[matchedCat.name] = (catRevenueMap[matchedCat.name] || 0) + item.price * item.qty;
            }
          }
        });
      });

      let highestName = "Chưa có doanh thu";
      let highestRevenue = 0;
      Object.entries(catRevenueMap).forEach(([name, rev]) => {
        if (rev > highestRevenue) {
          highestRevenue = rev;
          highestName = name;
        }
      });

      setTopCatInfo({ name: highestName, revenue: highestRevenue });
    }

    calcTopCategory();
  }, [categories]);

  // View Category Products Handler
  const handleViewCategoryProducts = async (cat: Category) => {
    setViewProductsModal({
      isOpen: true,
      category: cat,
      products: [],
      loading: true,
    });

    try {
      const supabase = createClient();
      const catCode = `C${String(cat.id).padStart(4, "0")}`;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`category.eq.${cat.slug},category.eq.${catCode},category.eq.${cat.name},category_name.eq.${cat.name}`)
        .order("id", { ascending: true });

      if (error || !data) {
        const fallbackProds = await fetchProductsFromSupabase();
        const matched = fallbackProds.filter(
          (p) => p.category === cat.slug || p.category === catCode || p.category === cat.name || p.categoryName === cat.name
        );
        setViewProductsModal({
          isOpen: true,
          category: cat,
          products: matched as any,
          loading: false,
        });
      } else {
        setViewProductsModal({
          isOpen: true,
          category: cat,
          products: data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category_name || p.category,
            price: Number(p.price),
            image: p.image,
            stock: p.stock !== undefined ? Number(p.stock) : 50,
            status: p.status || "Active",
          })),
          loading: false,
        });
      }
    } catch (err) {
      console.error(err);
      setViewProductsModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.desc && c.desc.toLowerCase().includes(q)) ||
      `c${String(c.id).padStart(4, "0")}`.includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedCategories = filteredCategories.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const totalCategoriesCount = categories.length;
  const activeCategoriesCount = categories.filter((c) => c.status === "Active").length;
  const hiddenCategoriesCount = categories.filter((c) => c.status === "Hidden").length;
  const totalProductsCount = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormStatus("Active");
    setFormDesc("");
    setShowModal(true);
  };

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormStatus(cat.status);
    setFormDesc(cat.desc || "");
    setShowModal(true);
  };

  const handleDeleteClick = async (cat: Category) => {
    try {
      const supabase = createClient();
      const catCode = `C${String(cat.id).padStart(4, "0")}`;
      const { data, error } = await supabase
        .from("products")
        .select("id")
        .or(`category.eq.${cat.slug},category.eq.${catCode},category.eq.${cat.name}`);

      const relatedCount = data && !error ? data.length : cat.productCount || 0;

      setDeleteModalState({
        isOpen: true,
        category: cat,
        relatedCount: relatedCount,
        deleting: false,
      });
    } catch (err) {
      setDeleteModalState({
        isOpen: true,
        category: cat,
        relatedCount: cat.productCount || 0,
        deleting: false,
      });
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteModalState.category) return;
    const cat = deleteModalState.category;
    setDeleteModalState((prev) => ({ ...prev, deleting: true }));

    try {
      const success = await deleteAdminCategory(cat.id);
      if (success) {
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
        setDeleteModalState({
          isOpen: false,
          category: null,
          relatedCount: 0,
          deleting: false,
        });
      } else {
        alert("Lỗi khi xóa danh mục khỏi cơ sở dữ liệu!");
        setDeleteModalState((prev) => ({ ...prev, deleting: false }));
      }
    } catch (err) {
      console.error(err);
      alert("Đã xảy ra lỗi khi xóa danh mục.");
      setDeleteModalState((prev) => ({ ...prev, deleting: false }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const cleanSlug = formSlug.trim() || formName.trim().toLowerCase().replace(/\s+/g, "-");

    const supabase = createClient();
    if (editingCategory) {
      await supabase
        .from("categories")
        .update({
          name: formName.trim(),
          slug: cleanSlug,
          status: formStatus,
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
          status: formStatus,
          description: formDesc.trim(),
        })
        .select();

      const newId = data && data.length > 0 ? Number(data[0].id) : Date.now();

      const newCat: Category = {
        id: newId,
        name: formName.trim(),
        slug: cleanSlug,
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
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 20px rgba(46, 125, 50, 0.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#2e7d32",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 16px rgba(46, 125, 50, 0.25)",
                }}
              >
                <i className="fa-solid fa-folder-tree"></i>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tổng Số Danh Mục
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                  {totalCategoriesCount}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", marginTop: "2px" }}>
                  Đang hoạt động: {activeCategoriesCount} / Đã ẩn: {hiddenCategoriesCount}
                </div>
              </div>
            </div>

            {/* KPI 2: Total Products */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
                border: "1.5px solid #bfdbfe",
                borderRadius: "20px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
                }}
              >
                <i className="fa-solid fa-boxes-stacked"></i>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Sản Phẩm Đã Phân Loại
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                  {totalProductsCount}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", marginTop: "2px" }}>
                  Phân bố trên {activeCategoriesCount} nhóm hàng
                </div>
              </div>
            </div>

            {/* KPI 3: Top Revenue Category */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fefce8 100%)",
                border: "1.5px solid #fde047",
                borderRadius: "20px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 20px rgba(234, 179, 8, 0.08)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#eab308",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 16px rgba(234, 179, 8, 0.25)",
                }}
              >
                <i className="fa-solid fa-chart-pie"></i>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Danh Mục Doanh Thu Cao Nhất
                </div>
                <div style={{ fontSize: "16px", fontWeight: 900, color: "#854d0e", marginTop: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "180px" }}>
                  {topCatInfo.name}
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#a16207", marginTop: "2px" }}>
                  {topCatInfo.revenue > 0 ? formatVND(topCatInfo.revenue) : "Đang cập nhật"}
                </div>
              </div>
            </div>
          </div>

          {/* 2. CATEGORIES TABLE CARD */}
          <div className="admin-card-shell">
            <div className="admin-card-core">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Danh Sách Danh Mục Nhóm Hàng ({filteredCategories.length})
                  </h2>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
                    Quản lý danh mục, kiểm tra số lượng và xem chi tiết sản phẩm thuộc danh mục
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  style={{
                    padding: "9px 18px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                  }}
                >
                  <i className="fa-solid fa-plus"></i> Thêm Danh Mục Mới
                </button>
              </div>

              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Đang tải dữ liệu danh mục...
                </div>
              ) : (
                <>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>MÃ DANH MỤC</th>
                        <th>TÊN DANH MỤC</th>
                        <th>SẢN PHẨM TRỰC THUỘC</th>
                        <th>MÔ TẢ</th>
                        <th>TRẠNG THÁI</th>
                        <th style={{ textAlign: "center" }}>THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCategories.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
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
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <i className="fa-solid fa-folder text-emerald-700" style={{ fontSize: "15px" }}></i>
                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>{cat.name}</strong>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <button
                                  type="button"
                                  onClick={() => handleViewCategoryProducts(cat)}
                                  style={{
                                    padding: "4px 10px",
                                    borderRadius: "8px",
                                    border: "1px solid #bbf7d0",
                                    background: "#f0fdf4",
                                    color: "#166534",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    transition: "all 0.2s ease",
                                  }}
                                  title="Bấm để xem danh sách sản phẩm thuộc danh mục này"
                                >
                                  <i className="fa-solid fa-box text-emerald-700" style={{ fontSize: "12px" }}></i>
                                  {cat.productCount} sản phẩm
                                </button>
                              </div>
                            </td>
                            <td style={{ fontSize: "12.5px", color: "#64748b", maxWidth: "240px" }}>
                              {cat.desc || "Chưa có mô tả chi tiết"}
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "4px 10px",
                                  borderRadius: "999px",
                                  fontSize: "11.5px",
                                  fontWeight: 800,
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
                                  type="button"
                                  onClick={() => handleViewCategoryProducts(cat)}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#f0fdf4",
                                    color: "#166534",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                  title="Xem danh sách sản phẩm thuộc danh mục"
                                >
                                  <i className="fa-solid fa-eye text-emerald-700" style={{ fontSize: "11px" }}></i> Xem SP
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(cat)}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i className="fa-solid fa-pen-to-square" style={{ fontSize: "11px" }}></i> Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClick(cat)}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#fef2f2",
                                    color: "#dc2626",
                                    border: "1px solid #fca5a5",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i className="fa-solid fa-trash-can" style={{ fontSize: "11px" }}></i> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 0 4px 0",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>
                      <span>Hiển thị</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <option value={5}>5 dòng</option>
                        <option value={10}>10 dòng</option>
                        <option value={20}>20 dòng</option>
                      </select>
                      <span>trên tổng số {filteredCategories.length} danh mục</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: safeCurrentPage <= 1 ? "#f8fafc" : "#fff",
                          color: safeCurrentPage <= 1 ? "#94a3b8" : "#334155",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        Trang trước
                      </button>
                      <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", padding: "0 6px" }}>
                        Trang {safeCurrentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: safeCurrentPage >= totalPages ? "#f8fafc" : "#fff",
                          color: safeCurrentPage >= totalPages ? "#94a3b8" : "#334155",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                        }}
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. MODAL XEM SẢN PHẨM THUỘC DANH MỤC */}
      {viewProductsModal.isOpen && viewProductsModal.category && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "800px",
              maxHeight: "85vh",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                borderBottom: "1.5px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--primary-color, #2e7d32)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-boxes-stacked"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#14532d", margin: 0 }}>
                    Sản Phẩm Thuộc Danh Mục: {viewProductsModal.category.name}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                    Mã danh mục: C{String(viewProductsModal.category.id).padStart(4, "0")} • Tổng cộng: {viewProductsModal.products.length} sản phẩm
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewProductsModal({ isOpen: false, category: null, products: [], loading: false })}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {viewProductsModal.loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Đang tải danh sách sản phẩm...
                </div>
              ) : viewProductsModal.products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: "36px", marginBottom: "8px", color: "#cbd5e1", display: "block" }}></i>
                  <p style={{ fontSize: "14px", fontWeight: 700, margin: "4px 0 0" }}>Chưa có sản phẩm nào thuộc danh mục này</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8", margin: "2px 0 0" }}>Vào trang Quản Lý Sản Phẩm để gán sản phẩm vào danh mục này.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {viewProductsModal.products.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        border: "1px solid #e2e8f0",
                        background: "#ffffff",
                        gap: "12px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img
                          src={fixImagePath(p.image)}
                          alt={p.name}
                          style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover", border: "1px solid #e2e8f0" }}
                        />
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <code style={{ fontSize: "11px", fontWeight: 800, padding: "2px 6px", background: "#f1f5f9", borderRadius: "4px" }}>
                              P{String(p.id).padStart(4, "0")}
                            </code>
                            <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{p.name}</strong>
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px" }}>
                            Tồn kho: <strong>{p.stock !== undefined ? p.stock : 50}</strong> món • Trạng thái:{" "}
                            <span style={{ color: p.status === "Active" || p.status === "In stock" ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                              {p.status === "Active" || p.status === "In stock" ? "Đang bán" : "Đã ẩn"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                          {formatVND(p.price)}
                        </span>
                        <Link
                          href={`/products/${p.id}`}
                          target="_blank"
                          style={{
                            padding: "6px 10px",
                            borderRadius: "8px",
                            background: "#f1f5f9",
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            textDecoration: "none",
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Xem
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "14px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setViewProductsModal({ isOpen: false, category: null, products: [], loading: false })}
                style={{
                  padding: "8px 20px",
                  borderRadius: "10px",
                  background: "#e2e8f0",
                  color: "#334155",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL THÊM / SỬA DANH MỤC (BỎ Ô BIỂU TƯỢNG/EMOJI THEO YÊU CẦU) */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                borderBottom: "1.5px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--primary-color, #2e7d32)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-folder"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#14532d", margin: 0 }}>
                    {editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                    {editingCategory ? `Cập nhật thông tin danh mục C${String(editingCategory.id).padStart(4, "0")}` : "Tạo mới nhóm sản phẩm kinh doanh"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: "24px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Tên Danh Mục Nhóm Hàng *
                </label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: Nội Thất Phòng Khách, Rèm Cửa..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "14px" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Trạng Thái Hiển Thị *
                </label>
                <select
                  className="form-control admin-setting-input"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px" }}
                >
                  <option value="Active">● Hoạt động (Hiển thị cho khách hàng)</option>
                  <option value="Hidden">○ Đã ẩn (Ẩn khỏi menu & bộ lọc)</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                  Mô Tả Danh Mục
                </label>
                <textarea
                  rows={3}
                  className="form-control admin-setting-input"
                  placeholder="Mô tả nhóm sản phẩm phục vụ cho không gian nào..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: 800,
                    fontSize: "13px",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                  }}
                >
                  {editingCategory ? "Lưu Thay Đổi" : "Tạo Danh Mục Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. THẺ DIV THÔNG BÁO XÁC NHẬN XÓA GIỮA MÀN HÌNH */}
      {deleteModalState.isOpen && deleteModalState.category && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "460px",
              borderRadius: "20px",
              padding: "28px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              textAlign: "center",
              position: "relative",
              border: "1px solid #f1f5f9",
            }}
          >
            {/* Warning Icon Badge */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#fef2f2",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
                boxShadow: "0 8px 16px rgba(239, 68, 68, 0.15)",
                fontSize: "24px",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>

            {/* Title */}
            <h3
              style={{
                fontSize: "19px",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 10px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Xác Nhận Xóa Danh Mục
            </h3>

            {/* Message Body */}
            <div
              style={{
                fontSize: "14px",
                color: "#475569",
                lineHeight: 1.6,
                marginBottom: "24px",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {deleteModalState.relatedCount > 0 ? (
                <>
                  Danh mục <strong>&quot;{deleteModalState.category.name}&quot;</strong> hiện đang có{" "}
                  <span style={{ color: "#ef4444", fontWeight: 800 }}>
                    {deleteModalState.relatedCount} sản phẩm liên quan
                  </span>
                  .
                  <br />
                  <br />
                  Bạn có chắc chắn muốn xóa danh mục này cùng{" "}
                  <strong>TẤT CẢ {deleteModalState.relatedCount} sản phẩm liên quan</strong> không?
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "10px 14px",
                      background: "#fff1f2",
                      border: "1px solid #fecdd3",
                      borderRadius: "10px",
                      color: "#9f1239",
                      fontSize: "12.5px",
                      fontWeight: 600,
                      textAlign: "left",
                    }}
                  >
                    <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "6px" }}></i>
                    <strong>Lưu ý quan trọng:</strong> Thao tác này sẽ xóa vĩnh viễn danh mục và toàn bộ sản phẩm thuộc danh mục khỏi hệ thống!
                  </div>
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn xóa danh mục <strong>&quot;{deleteModalState.category.name}&quot;</strong> không?
                  <br />
                  Thao tác này không thể khôi phục.
                </>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                type="button"
                onClick={() => setDeleteModalState({ isOpen: false, category: null, relatedCount: 0, deleting: false })}
                disabled={deleteModalState.deleting}
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  borderRadius: "12px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCategory}
                disabled={deleteModalState.deleting}
                style={{
                  flex: 1,
                  padding: "11px 18px",
                  borderRadius: "12px",
                  border: "none",
                  background: deleteModalState.deleting ? "#94a3b8" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: deleteModalState.deleting ? "not-allowed" : "pointer",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
              >
                {deleteModalState.deleting ? "Đang Xóa..." : "Đồng Ý Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
