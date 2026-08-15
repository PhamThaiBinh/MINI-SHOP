"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SystemVoucher, getSystemVouchers, saveSystemVouchers } from "@/utils/voucherStorage";
import { fetchAdminVouchers, saveAdminVoucher, deleteAdminVoucher } from "@/lib/supabaseAdmin";

export default function AdminVouchersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vouchers, setVouchers] = useState<SystemVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVoucher, setEditingVoucher] = useState<SystemVoucher | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdminVouchers();
    setVouchers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (v: SystemVoucher) => {
    setEditingVoucher(v);
    setFormCode(v.code);
    setFormDesc(v.desc);
    setFormDiscountType(v.percent ? "percent" : "fixed");
    setFormDiscountValue(
      v.percent ? v.percent.toString() : (v.fixedDiscount || 0).toString()
    );
    setFormMinOrder((v.minOrder || 0).toString());
    setFormIsActive(v.isActive);
  };

  const handleResetForm = () => {
    setEditingVoucher(null);
    setFormCode("");
    setFormDesc("");
    setFormDiscountType("fixed");
    setFormDiscountValue("");
    setFormMinOrder("");
    setFormIsActive(true);
  };

  const handleToggleStatus = async (targetCode: string) => {
    const target = vouchers.find((v) => v.code === targetCode);
    if (!target) return;
    const updatedV = { ...target, isActive: !target.isActive };
    const updated = vouchers.map((v) => (v.code === targetCode ? updatedV : v));
    setVouchers(updated);
    saveSystemVouchers(updated);
    await saveAdminVoucher(updatedV);
  };

  const handleDeleteVoucher = async (targetCode: string) => {
    if (confirm(`Bạn có chắc muốn xóa mã voucher ${targetCode}?`)) {
      const updated = vouchers.filter((v) => v.code !== targetCode);
      setVouchers(updated);
      saveSystemVouchers(updated);
      await deleteAdminVoucher(targetCode);
      if (editingVoucher?.code === targetCode) {
        handleResetForm();
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = formCode.trim().toUpperCase();
    if (!formattedCode) return;

    const valNum = Number(formDiscountValue) || 0;
    const minOrderNum = Number(formMinOrder) || 0;

    const newVoucherItem: SystemVoucher = {
      code: formattedCode,
      desc: formDesc || `Ưu đãi ${formattedCode}`,
      percent: formDiscountType === "percent" ? valNum : undefined,
      fixedDiscount: formDiscountType === "fixed" ? valNum : undefined,
      minOrder: minOrderNum,
      isActive: formIsActive,
    };

    let updated: SystemVoucher[];
    if (editingVoucher) {
      updated = vouchers.map((v) =>
        v.code === editingVoucher.code ? newVoucherItem : v
      );
    } else {
      if (vouchers.some((v) => v.code === formattedCode)) {
        alert("Mã Voucher này đã tồn tại trong hệ thống!");
        return;
      }
      updated = [newVoucherItem, ...vouchers];
    }

    setVouchers(updated);
    saveSystemVouchers(updated);
    await saveAdminVoucher(newVoucherItem);
    handleResetForm();
  };

  const filteredVouchers = vouchers.filter((v) => {
    const q = searchQuery.toLowerCase();
    return (
      v.code.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredVouchers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedVouchers = filteredVouchers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <div className="admin-wrapper">
      {/* Left Sidebar Navigation */}
      <AdminSidebar activeMenu="vouchers" sidebarCollapsed={sidebarCollapsed} />

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar Đồng Bộ Chuẩn 3 Thông Báo & Menu Admin Interactive */}
        <AdminHeader
          title="Quản Lý Mã Voucher Ưu Đãi"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm mã hoặc mô tả voucher..."
        />

        {/* Dashboard Workspace 2-Column Grid Layout (Giống hệt trang Sản phẩm Admin) */}
        <div className="dashboard-content-body">
          <div className="admin-workspace-grid">
            {/* Center Column: Vouchers Table */}
            <div className="tables-column">
              <div className="dashboard-card">
                <div className="card-header-row">
                  <h2 className="card-header-title">Quản Lý Mã Voucher System</h2>
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
                      + Tạo Mã Voucher
                    </button>
                  </div>
                </div>

                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Mã Voucher</th>
                      <th>Mô Tả Chương Trình</th>
                      <th>Mức Giảm Giá</th>
                      <th>Đơn Tối Thiểu</th>
                      <th>Trạng Thái</th>
                      <th style={{ textAlign: "center" }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVouchers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          Chưa có mã voucher nào phù hợp.
                        </td>
                      </tr>
                    ) : (
                      paginatedVouchers.map((v, index) => (
                        <tr key={v.code}>
                          <td>{(safeCurrentPage - 1) * pageSize + index + 1}</td>
                          <td>
                            <span
                              style={{
                                background: "#f0fdf4",
                                border: "1px dashed var(--primary-color)",
                                color: "var(--primary-color)",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontWeight: 800,
                                fontSize: "13px",
                                display: "inline-block",
                              }}
                            >
                              🎟️ {v.code}
                            </span>
                          </td>
                          <td>
                            <strong>{v.desc}</strong>
                          </td>
                          <td>
                            <strong style={{ color: "#2e7d32" }}>
                              {v.percent
                                ? `Giảm ${v.percent}%`
                                : `Giảm ${v.fixedDiscount?.toLocaleString("vi-VN")}đ`}
                            </strong>
                          </td>
                          <td>
                            {v.minOrder && v.minOrder > 0
                              ? `${v.minOrder.toLocaleString("vi-VN")}đ`
                              : "Không giới hạn"}
                          </td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            <span
                              className={
                                v.isActive ? "badge-visible" : "badge-lowstock"
                              }
                              style={{ whiteSpace: "nowrap", display: "inline-block" }}
                            >
                              {v.isActive ? "● Hoạt động" : "○ Tạm dừng"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            <div style={{ display: "inline-flex", gap: "4px", alignItems: "center", whiteSpace: "nowrap" }}>
                              <button
                                className="btn-action-edit"
                                onClick={() => handleEditClick(v)}
                                style={{ whiteSpace: "nowrap" }}
                              >
                                📝 Sửa
                              </button>
                              <button
                                className="btn-action-edit"
                                onClick={() => handleToggleStatus(v.code)}
                                style={{
                                  borderColor: v.isActive ? "#fdba74" : "#86efac",
                                  color: v.isActive ? "#c2410c" : "#15803d",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {v.isActive ? "⏸️ Tạm dừng" : "▶️ Bật"}
                              </button>
                              <button
                                className="btn-action-delete"
                                onClick={() => handleDeleteVoucher(v.code)}
                                style={{ whiteSpace: "nowrap" }}
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
                      <option value={10}>10 mã / trang</option>
                      <option value={25}>25 mã / trang</option>
                      <option value={50}>50 mã / trang</option>
                    </select>
                    <span>
                      Hiển thị {filteredVouchers.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} -{" "}
                      {Math.min(safeCurrentPage * pageSize, filteredVouchers.length)} / tổng {filteredVouchers.length} voucher
                    </span>
                  </div>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                    >
                      Trang sau &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Voucher Form Panel (Đồng bộ chuẩn Form Sản phẩm Admin) */}
            <aside className="product-form-panel">
              <h2
                className="card-header-title"
                style={{ marginBottom: "16px" }}
              >
                {editingVoucher ? "Chỉnh Sửa Mã Voucher" : "Form Mã Voucher Mới"}
              </h2>

              <form onSubmit={handleFormSubmit}>
                <div style={{ marginBottom: "16px" }}>
                  <label className="auth-label">Mã Voucher (Viết hoa không dấu) *</label>
                  <input
                    type="text"
                    className="form-control auth-input"
                    placeholder="Ví dụ: HE2026, SALEOFF50K"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    readOnly={!!editingVoucher}
                    style={editingVoucher ? { background: "#f1f5f9", cursor: "not-allowed" } : {}}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="auth-label">Mô tả chương trình ưu đãi *</label>
                  <input
                    type="text"
                    className="form-control auth-input"
                    placeholder="Ví dụ: Giảm 50.000đ cho đơn hàng từ 300.000đ"
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <label className="auth-label">Loại giảm giá *</label>
                    <select
                      className="form-control auth-input"
                      value={formDiscountType}
                      onChange={(e) => setFormDiscountType(e.target.value as any)}
                    >
                      <option value="fixed">Tiền cố định (VNĐ)</option>
                      <option value="percent">Phần trăm (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="auth-label">Mức giảm *</label>
                    <input
                      type="number"
                      className="form-control auth-input"
                      placeholder={formDiscountType === "fixed" ? "50000" : "15"}
                      required
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label className="auth-label">Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    className="form-control auth-input"
                    placeholder="Ví dụ: 200000 (Nhập 0 nếu không áp đặt)"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label className="auth-label">Trạng thái phát hành *</label>
                  <select
                    className="form-control auth-input"
                    value={formIsActive ? "Active" : "Hidden"}
                    onChange={(e) => setFormIsActive(e.target.value === "Active")}
                  >
                    <option value="Active">● Hoạt động (Khách hàng sử dụng được)</option>
                    <option value="Hidden">○ Tạm dừng phát hành</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="submit"
                    className="btn-add-product-green"
                    style={{ flex: 1, justifyContent: "center", height: "42px" }}
                  >
                    {editingVoucher ? "💾 Lưu Cập Nhật" : "➕ Tạo Mã Voucher"}
                  </button>

                  {editingVoucher && (
                    <button
                      type="button"
                      onClick={handleResetForm}
                      style={{
                        padding: "0 16px",
                        background: "#f1f5f9",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        fontWeight: 700,
                        fontSize: "13px",
                        cursor: "pointer",
                      }}
                    >
                      Hủy bỏ
                    </button>
                  )}
                </div>
              </form>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
