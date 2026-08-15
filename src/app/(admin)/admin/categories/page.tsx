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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form inputs state
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");

  const handleEditClick = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormIcon(cat.icon);
    setFormStatus(cat.status);
    setFormDesc(cat.desc || "");
  };

  const handleDeleteClick = async (id: number) => {
    if (confirm("⚠️ Bạn có chắc chắn muốn xóa danh mục này khỏi kho Supabase không?")) {
      const supabase = createClient();
      await supabase.from("categories").delete().eq("id", id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleResetForm = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormIcon("");
    setFormStatus("Active");
    setFormDesc("");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const supabase = createClient();
    const cleanSlug = formSlug || formName.toLowerCase().replace(/\s+/g, "-");
    const cleanIcon = formIcon || "📁";

    if (editingCategory) {
      // Update Supabase
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
      // Add new to Supabase
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
    handleResetForm();
  };

  return (
    <div className="admin-wrapper">
      {/* Left Sidebar Navigation */}
      <AdminSidebar
        activeMenu="categories"
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* 2. Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar Đồng Bộ Chuẩn 3 Thông Báo & Menu Admin Interactive */}
        <AdminHeader
          title="Quản Lý Danh Mục Sản Phẩm"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchPlaceholder="Tìm danh mục sản phẩm..."
        />

        <div className="dashboard-content-body">
          <div className="admin-workspace-grid">
            {/* Left: Categories Table */}
            <div className="tables-column">
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2 className="card-header-title">
                    Danh Sách Danh Mục Hiện Có ({categories.length})
                  </h2>
                  <button
                    className="btn-add-product-green"
                    onClick={handleResetForm}
                  >
                    + Thêm Danh Mục Mới
                  </button>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Biểu tượng</th>
                      <th>Tên Danh Mục</th>
                      <th>Mã Slug</th>
                      <th>Số Sản Phẩm</th>
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
                        <td>
                          <strong>{cat.name}</strong>
                        </td>
                        <td>
                          <code>{cat.slug}</code>
                        </td>
                        <td>
                          <strong style={{ color: "var(--primary-color)" }}>
                            {cat.productCount} Sản phẩm
                          </strong>
                        </td>
                        <td>
                          <span
                            className={
                              cat.status === "Active"
                                ? "badge-visible"
                                : "badge-lowstock"
                            }
                          >
                            {cat.status === "Active" ? "● Hiển thị" : "○ Ẩn"}
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <button
                            className="btn-action-edit"
                            onClick={() => handleEditClick(cat)}
                          >
                            📝 Sửa
                          </button>
                          <button
                            className="btn-action-delete"
                            onClick={() => handleDeleteClick(cat.id)}
                          >
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Form Category Panel */}
            <aside className="product-form-panel">
              <h2 className="card-header-title" style={{ marginBottom: "16px" }}>
                {editingCategory ? "Chỉnh Sửa Danh Mục" : "Form Danh Mục Mới"}
              </h2>

              <form
                style={{ display: "flex", flexDirection: "column", gap: "14px" }}
                onSubmit={handleFormSubmit}
              >
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-c-name">Tên danh mục *</label>
                  <input
                    type="text"
                    id="form-c-name"
                    className="form-control"
                    placeholder="Nhập tên danh mục..."
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-c-slug">Mã Slug URL</label>
                  <input
                    type="text"
                    id="form-c-slug"
                    className="form-control"
                    placeholder="vd: phong-khach-decor"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-c-icon">Biểu tượng Emoji</label>
                  <input
                    type="text"
                    id="form-c-icon"
                    className="form-control"
                    placeholder="vd: 🛋️, 🪴, 💡"
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-c-status">Trạng thái hiển thị</label>
                  <select
                    id="form-c-status"
                    className="form-control"
                    style={{ background: "#fff" }}
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "Active" | "Hidden")
                    }
                  >
                    <option value="Active">● Hiển thị trên Menu</option>
                    <option value="Hidden">○ Ẩn danh mục</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="form-c-desc">Mô tả danh mục</label>
                  <textarea
                    id="form-c-desc"
                    className="form-control"
                    placeholder="Nhập mô tả ngắn cho danh mục..."
                    style={{ minHeight: "80px" }}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-footer-btns">
                  <button type="submit" className="btn-save-green">
                    💾 {editingCategory ? "Cập Nhật" : "Lưu Danh Mục"}
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
