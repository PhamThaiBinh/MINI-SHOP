"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { SystemVoucher } from "@/utils/voucherStorage";
import { fetchAdminVouchers, saveAdminVoucher, deleteAdminVoucher } from "@/lib/supabaseAdmin";
import { Ticket, Edit3, Trash2, X } from "lucide-react";

export default function AdminVouchersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [vouchers, setVouchers] = useState<SystemVoucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVoucher, setEditingVoucher] = useState<SystemVoucher | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdminVouchers();
    setVouchers(data);
    setLoading(false);
  };

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Form states
  const [formCode, setFormCode] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percent" | "fixed">("fixed");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVoucher(null);
    setFormCode("");
    setFormDesc("");
    setFormDiscountType("fixed");
    setFormDiscountValue("");
    setFormMinOrder("");
    setFormIsActive(true);
    setShowModal(true);
  };

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
    setShowModal(true);
  };

  const handleToggleStatus = async (targetCode: string) => {
    const target = vouchers.find((v) => v.code === targetCode);
    if (!target) return;
    const updatedV = { ...target, isActive: !target.isActive };
    const updated = vouchers.map((v) => (v.code === targetCode ? updatedV : v));
    setVouchers(updated);
    await saveAdminVoucher(updatedV);
  };

  const handleDeleteVoucher = async (targetCode: string) => {
    if (confirm(`Bạn có chắc muốn xóa mã voucher ${targetCode}?`)) {
      const updated = vouchers.filter((v) => v.code !== targetCode);
      setVouchers(updated);
      await deleteAdminVoucher(targetCode);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedCode = formCode.trim().toUpperCase();
    if (!formattedCode) return;

    const valNum = Number(formDiscountValue) || 0;
    const minOrderNum = Number(formMinOrder) || 0;

    if (minOrderNum < 0 || valNum < 0) {
      alert("Số tiền giảm giá và giá trị đơn tối thiểu phải lớn hoặc bằng 0!");
      return;
    }

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
      updated = [newVoucherItem, ...vouchers];
    }

    setVouchers(updated);
    await saveAdminVoucher(newVoucherItem);
    setShowModal(false);
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
      <AdminSidebar activeMenu="vouchers" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Mã giảm giá"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm mã hoặc mô tả voucher..."
        />

        <div className="dashboard-content-body">
          {/* 1. TICKET CARD STUDIO (VISUAL COUPON CARDS GRID) */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
              <Ticket className="w-5 h-5 text-emerald-700" />
              <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Kho Vé Khuyến Mãi (Ticket Studio)
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "16px",
              }}
            >
              {vouchers.slice(0, 3).map((v) => (
                <div
                  key={v.code}
                  style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                    border: "1.5px dashed #2e7d32",
                    borderRadius: "16px",
                    padding: "16px 20px",
                    boxShadow: "0 4px 14px rgba(46, 125, 50, 0.08)",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: "#166534", letterSpacing: "0.05em", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <i className="fa-solid fa-ticket"></i> {v.code}
                    </span>
                    <span style={{ padding: "2px 8px", background: v.isActive ? "#dcfce7" : "#ffe4e6", color: v.isActive ? "#15803d" : "#be123c", borderRadius: "10px", fontSize: "10px", fontWeight: 800 }}>
                      {v.isActive ? "ĐANG ÁP DỤNG" : "ĐÃ TẠM TẮT"}
                    </span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>
                    {v.desc}
                  </div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                    Đơn tối thiểu: <strong>{(v.minOrder || 0).toLocaleString()}đ</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-card-shell">
            <div className="admin-card-core">
              <div className="card-header-row" style={{ marginBottom: "20px" }}>
                <div>
                  <h2 className="card-header-title text-xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Danh Sách Mã Voucher ({filteredVouchers.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Tạo và điều chỉnh chính sách ưu đãi chiết khấu khuyến mãi cho cửa hàng
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
                  <Ticket className="w-4 h-4" /> Tạo Mã Voucher Mới
                </button>
              </div>

            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                Đang tải mã voucher...
              </div>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>MÃ SỐ</th>
                      <th>MÃ VOUCHER</th>
                      <th>MÔ TẢ CHƯƠNG TRÌNH</th>
                      <th>MỨC GIẢM GIÁ</th>
                      <th>ĐƠN TỐI THIỂU</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: "center" }}>THAO TÁC</th>
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
                          <td>
                            <code style={{ padding: "3px 8px", background: "#f1f5f9", color: "#1e293b", borderRadius: "6px", fontWeight: 800, fontSize: "11px" }}>
                              V{String(index + 1).padStart(4, "0")}
                            </code>
                          </td>
                          <td>
                            <span
                              style={{
                                background: "#f0fdf4",
                                border: "1.5px dashed #2e7d32",
                                color: "#166534",
                                padding: "4px 10px",
                                borderRadius: "8px",
                                fontWeight: 900,
                                fontSize: "13px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              <Ticket className="w-3.5 h-3.5" /> {v.code}
                            </span>
                          </td>
                          <td><strong>{v.desc}</strong></td>
                          <td style={{ fontWeight: 800, color: "#16a34a" }}>
                            {v.percent
                              ? `Giảm ${v.percent}%`
                              : `Giảm ${v.fixedDiscount ? v.fixedDiscount.toLocaleString() : 0}đ`}
                          </td>
                          <td>Đơn từ {(v.minOrder || 0).toLocaleString()}đ</td>
                          <td>
                            <span
                              onClick={() => handleToggleStatus(v.code)}
                              style={{
                                padding: "4px 8px",
                                borderRadius: "6px",
                                fontSize: "11px",
                                fontWeight: 700,
                                cursor: "pointer",
                                background: v.isActive ? "#dcfce7" : "#fee2e2",
                                color: v.isActive ? "#166534" : "#991b1b",
                              }}
                            >
                              {v.isActive ? "● Đang kích hoạt" : "○ Tạm tắt"}
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleEditClick(v)}
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
                                onClick={() => handleDeleteVoucher(v.code)}
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
                      <option value={10}>10 voucher</option>
                      <option value={25}>25 voucher</option>
                      <option value={50}>50 voucher</option>
                    </select>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      Hiển thị {paginatedVouchers.length}/{filteredVouchers.length} mã voucher
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

      {/* FORM MODAL MÃ VOUCHER MỚI / CHỈNH SỬA */}
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
              background: "#ffffff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header Banner */}
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
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#14532d", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {editingVoucher ? "Chỉnh Sửa Mã Voucher" : "Tạo Mã Voucher Mới"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                    {editingVoucher ? `Cập nhật điều kiện áp dụng cho mã ${formCode}` : "Thiết lập mã khuyến mãi kích cầu mua sắm"}
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
              {/* Group 1: Thông tin mã */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Mã Ưu Đãi (Voucher Code) *
                  </label>
                  {!editingVoucher && (
                    <button
                      type="button"
                      onClick={() => {
                        const prefixes = ["MINISHOP", "HE2026", "KM", "DEAL", "SUMMER"];
                        const randomNum = Math.floor(10 + Math.random() * 90);
                        const randomPref = prefixes[Math.floor(Math.random() * prefixes.length)];
                        setFormCode(`${randomPref}${randomNum}`);
                      }}
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        border: "none",
                        borderRadius: "8px",
                        padding: "4px 10px",
                        fontSize: "11.5px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <i className="fa-solid fa-wand-magic-sparkles"></i> Random Mã Nhanh
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: MINISHOP50, FREESHIP"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  disabled={Boolean(editingVoucher)}
                  required
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "14px", fontWeight: 800, letterSpacing: "0.05em", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Mô Tả Chương Trình Khuyến Mãi *
                </label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: Giảm 50.000đ cho đơn hàng từ 300.000đ"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  required
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>

              {/* Group 2: Cấu hình giảm giá */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Loại Giảm Giá *
                  </label>
                  <select
                    className="form-control admin-setting-input"
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <option value="fixed">Số tiền cố định (đ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {formDiscountType === "fixed" ? "Giá Trị Giảm (VNĐ) *" : "Mức Giảm (%) *"}
                  </label>
                  <input
                    type="number"
                    className="form-control admin-setting-input"
                    placeholder={formDiscountType === "fixed" ? "50000" : "10"}
                    value={formDiscountValue}
                    onChange={(e) => setFormDiscountValue(e.target.value)}
                    required
                    style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Đơn Tối Thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    className="form-control admin-setting-input"
                    placeholder="0"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Trạng Thái Áp Dụng *
                  </label>
                  <select
                    className="form-control admin-setting-input"
                    value={formIsActive ? "active" : "inactive"}
                    onChange={(e) => setFormIsActive(e.target.value === "active")}
                    style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    <option value="active">● Kích hoạt (Cho phép dùng)</option>
                    <option value="inactive">○ Tạm tắt (Không khả dụng)</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
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
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {editingVoucher ? "Lưu Thay Đổi" : "Tạo Mã Voucher Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
