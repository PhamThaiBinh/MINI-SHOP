"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminCategories, saveAdminCategory, deleteAdminCategory } from "@/lib/supabaseAdmin";
import { createClient } from "@/utils/supabase/client";

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
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form inputs state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchAdminCategories();
    if (data.length > 0) {
      setCategories(data);
    } else {
      // Fallback default categories
      setCategories([
        { id: 1, icon: "🛏️", name: "Nội Thất Phòng Ngủ", slug: "phong-ngu", productCount: 4, status: "Active", desc: "Giường ngủ, tủ quần áo, bàn trang điểm" },
        { id: 2, icon: "🛋️", name: "Nội Thất Phòng Khách", slug: "phong-khach", productCount: 5, status: "Active", desc: "Sofa, bàn trà, kệ TV" },
        { id: 3, icon: "🍽️", name: "Nội Thất Phòng Ăn", slug: "phong-an", productCount: 4, status: "Active", desc: "Bàn ăn, ghế ăn, tủ bếp" },
        { id: 4, icon: "💼", name: "Nội Thất Phòng Làm Việc", slug: "phong-lam-viec", productCount: 3, status: "Active", desc: "Bàn làm việc, ghế công thái học" },
        { id: 5, icon: "🪴", name: "Trang Trí & Decor", slug: "trang-tri", productCount: 2, status: "Active", desc: "Đèn trang trí, thảm, tranh treo tường" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormIcon("📁");
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
    if (confirm("⚠️ Bạn có chắc chắn muốn xóa danh mục này khỏi kho Supabase không?")) {
      const supabase = createClient();
      await supabase.from("categories").delete().eq("id", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isDuplicate = categories.some(
      (c) =>
        c.name.trim().toLowerCase() === formName.trim().toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (isDuplicate) {
      alert(`⚠️ Danh mục tên "${formName.trim()}" đã tồn tại trong hệ thống! Vui lòng chọn tên khác.`);
      return;
    }

    const cleanSlug = formSlug || formName.toLowerCase().replace(/\s+/g, "-");
    const cleanIcon = formIcon || "📁";

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
      const { data } = await supabase
        .from("categories")
        .insert({
          category_id: formName.trim(),
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
          title="Quản Lý Danh Mục Sản Phẩm (Supabase Live)"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchPlaceholder="Tìm danh mục sản phẩm..."
        />

        <div className="dashboard-content-body">
          <div className="dashboard-card">
            <div className="card-header-row" style={{ marginBottom: "16px" }}>
              <div>
                <h2 className="card-header-title">Danh Sách Danh Mục Supabase ({categories.length})</h2>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Quản lý hiển thị các nhóm sản phẩm kinh doanh trên website
                </p>
              </div>
              <button className="btn-add-product-green" onClick={handleOpenAddModal}>
                + Thêm Danh Mục Mới
              </button>
            </div>

            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                ⏳ Đang tải dữ liệu danh mục thực tế từ Supabase...
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Biểu tượng</th>
                    <th>Tên Danh Mục</th>
                    <th>Mã Slug</th>
                    <th>Số Sản Phẩm</th>
                    <th>Mô Tả</th>
                    <th>Trạng Thái</th>
                    <th style={{ textAlign: "center" }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "#e8f5e9",
                            color: "var(--primary-color)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                          }}
                        >
                          {cat.icon}
                        </div>
                      </td>
                      <td><strong>{cat.name}</strong></td>
                      <td><code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{cat.slug}</code></td>
                      <td><strong>{cat.productCount}</strong> sản phẩm</td>
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
                            }}
                          >
                            ✏️ Sửa
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
                            }}
                          >
                            🗑️ Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                {editingCategory ? "✏️ Chỉnh Sửa Danh Mục" : "➕ Form Danh Mục Mới"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "4px" }}>Biểu Tượng (Icon Emoji) *</label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: 🛏️, 🛋️, 🍽️"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  required
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
