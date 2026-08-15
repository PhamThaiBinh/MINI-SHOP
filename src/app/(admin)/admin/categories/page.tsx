"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface Category {
  id: number;
  icon: string;
  name: string;
  slug: string;
  productCount: number;
  status: "Active" | "Hidden";
  desc?: string;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    icon: "🛋️",
    name: "Nội thất & Phòng khách",
    slug: "living-room",
    productCount: 1,
    status: "Active",
    desc: "Các sản phẩm bàn ghế, sofa cho phòng khách.",
  },
  {
    id: 2,
    icon: "🛏️",
    name: "Phòng ngủ",
    slug: "bedroom",
    productCount: 2,
    status: "Active",
    desc: "Giường ngủ, nệm, tủ quần áo.",
  },
  {
    id: 3,
    icon: "🍳",
    name: "Nhà bếp & Bàn ăn",
    slug: "kitchen",
    productCount: 6,
    status: "Active",
    desc: "Bàn ăn, dụng cụ nhà bếp cao cấp.",
  },
  {
    id: 4,
    icon: "🪴",
    name: "Trang trí & Décor",
    slug: "decor",
    productCount: 6,
    status: "Active",
    desc: "Bình gốm, tranh treo tường, đồ trang trí.",
  },
  {
    id: 5,
    icon: "🧺",
    name: "Lưu trữ & Tủ kệ",
    slug: "storage",
    productCount: 2,
    status: "Active",
    desc: "Kệ gỗ, giỏ mây đan.",
  },
  {
    id: 6,
    icon: "💡",
    name: "Đèn trang trí & chiếu sáng",
    slug: "lighting",
    productCount: 2,
    status: "Active",
    desc: "Đèn thả trần, đèn bàn.",
  },
];

export default function AdminCategoriesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
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

  const handleDeleteClick = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (editingCategory) {
      // Update
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName,
                slug: formSlug || formName.toLowerCase().replace(/\s+/g, "-"),
                icon: formIcon || "📁",
                status: formStatus,
                desc: formDesc,
              }
            : c
        )
      );
    } else {
      // Add new
      const newCat: Category = {
        id: Date.now(),
        name: formName,
        slug: formSlug || formName.toLowerCase().replace(/\s+/g, "-"),
        icon: formIcon || "📁",
        productCount: 0,
        status: formStatus,
        desc: formDesc,
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
