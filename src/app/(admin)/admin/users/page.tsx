"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminUsers, saveAdminUser, toggleAdminUserStatus, AdminUserItem as UserItem } from "@/lib/supabaseAdmin";

export default function AdminUsersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchAdminUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Form State for Add Admin/Staff Modal
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("12345678");
  const [staffRole, setStaffRole] = useState("👑 Administrator");

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleToggleBlockUser = async (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === "Active" ? "Blocked" : "Active";
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
    await toggleAdminUserStatus(id, target.status);
  };

  const handleSaveNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffPhone.trim()) return;

    const newUser: UserItem = {
      id: Date.now(),
      avatarText: staffName.charAt(0).toUpperCase() || "S",
      avatarBg: "#059669",
      name: staffName,
      username: `@${staffEmail.split("@")[0]}`,
      email: staffEmail,
      phone: staffPhone,
      role: staffRole,
      roleType: "admin",
      registeredDate: new Date().toLocaleDateString("vi-VN"),
      status: "Active",
    };

    setUsers((prev) => [newUser, ...prev]);
    await saveAdminUser(newUser);
    setShowAddModal(false);
    setStaffName("");
    setStaffEmail("");
    setStaffPhone("");
    setStaffPassword("12345678");
    setStaffRole("👑 Administrator");
  };

  return (
    <>
      <style jsx global>{`
        .user-avatar-lg {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .role-badge {
          padding: 3px 10px;
          border-radius: var(--radius-sm);
          font-size: 11px;
          font-weight: 700;
        }
        .role-admin {
          background-color: #fef3c7;
          color: #b45309;
        }
        .role-customer {
          background-color: #e0f2fe;
          color: #0369a1;
        }
      `}</style>

      <div className="admin-wrapper">
        {/* Left Sidebar Navigation */}
        <AdminSidebar
          activeMenu="users"
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* 2. Main Content Area */}
        <main className="admin-main">
          {/* Top Header Bar Đồng Bộ Chuẩn 3 Thông Báo & Menu Admin Interactive */}
          <AdminHeader
            title="Quản Lý Người Dùng & Tài Khoản"
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Tìm tên, email, sđt khách..."
          />

          <div className="dashboard-content-body">
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2 className="card-header-title">
                  Danh Sách Người Dùng Hệ Thống ({users.length})
                </h2>
                <button
                  className="btn-add-product-green"
                  onClick={() => setShowAddModal(true)}
                >
                  + Thêm Quản Trị Viên
                </button>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Thành viên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Vai trò</th>
                    <th>Ngày đăng ký</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            className="user-avatar-lg"
                            style={{ backgroundColor: user.avatarBg }}
                          >
                            {user.avatarText}
                          </div>
                          <div>
                            <strong>{user.name}</strong>
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--text-muted)",
                              }}
                            >
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span
                          className={`role-badge ${
                            user.roleType === "admin"
                              ? "role-admin"
                              : "role-customer"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td>{user.registeredDate}</td>
                      <td>
                        <span
                          className={
                            user.status === "Active"
                              ? "badge-visible"
                              : "badge-lowstock"
                          }
                        >
                          {user.status === "Active"
                            ? "● Đang hoạt động"
                            : "○ Đã khóa"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {user.roleType === "admin" ? (
                          <button
                            className="btn-action-edit"
                          >
                            📝 Phân quyền
                          </button>
                        ) : (
                          <button
                            className="btn-action-edit"
                            onClick={() => handleToggleBlockUser(user.id)}
                            style={{
                              borderColor:
                                user.status === "Active"
                                  ? "#ef4444"
                                  : "var(--primary-color)",
                              color:
                                user.status === "Active"
                                  ? "#ef4444"
                                  : "var(--primary-color)",
                            }}
                          >
                            📝{" "}
                            {user.status === "Active"
                              ? "Khóa TK"
                              : "Mở khóa TK"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

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
                    <option value={10}>10 người / trang</option>
                    <option value={25}>25 người / trang</option>
                    <option value={50}>50 người / trang</option>
                  </select>
                  <span>
                    Hiển thị {filteredUsers.length > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0} -{" "}
                    {Math.min(safeCurrentPage * pageSize, filteredUsers.length)} / tổng {filteredUsers.length} người dùng
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
        </main>
      </div>

      {/* Modal: Thêm Quản Trị Viên Mới */}
      {showAddModal && (
        <div
          style={{
            display: "flex",
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 2500,
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "var(--radius-lg)",
              width: "100%",
              maxWidth: "520px",
              padding: "24px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a" }}
              >
                ➕ Thêm Quản Trị Viên / Nhân Viên Mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveNewAdmin}>
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "4px",
                    display: "block",
                  }}
                >
                  Họ và tên nhân viên *
                </label>
                <input
                  type="text"
                  className="admin-setting-input"
                  style={{ height: "42px" }}
                  placeholder="Ví dụ: Nguyễn Văn Bình"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    className="admin-setting-input"
                    style={{ height: "42px" }}
                    placeholder="binh.nguyen@minishop.vn"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Số điện thoại *
                  </label>
                  <input
                    type="text"
                    className="admin-setting-input"
                    style={{ height: "42px" }}
                    placeholder="0988.123.456"
                    required
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Mật khẩu ban đầu *
                  </label>
                  <input
                    type="password"
                    className="admin-setting-input"
                    style={{ height: "42px" }}
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "4px",
                      display: "block",
                    }}
                  >
                    Vai trò quản trị *
                  </label>
                  <select
                    className="admin-setting-input"
                    style={{ height: "42px", fontSize: "13px" }}
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                  >
                    <option value="👑 Administrator">
                      👑 Administrator (Super Admin)
                    </option>
                    <option value="📦 Quản lý kho">
                      📦 Quản lý kho sản phẩm
                    </option>
                    <option value="🛍️ CSKH & Sales">
                      🛍️ Nhân viên CSKH & Sales
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-cancel-gray"
                  style={{ padding: "8px 16px" }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-save-green"
                  style={{ padding: "8px 20px" }}
                >
                  Lưu & Cấp Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
