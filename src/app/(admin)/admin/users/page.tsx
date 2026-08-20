"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminUsers, saveAdminUser, toggleAdminUserStatus, AdminUserItem as UserItem } from "@/lib/supabaseAdmin";
import { Lock, Unlock, X, Users, UserCheck, ShieldCheck, UserX, Search, Plus, Filter, CheckCircle2 } from "lucide-react";

export default function AdminUsersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState("");

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
  const [staffRole, setStaffRole] = useState("Administrator");

  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q) ||
      u.username.toLowerCase().includes(q);
    const matchRole =
      roleFilter === "all"
        ? true
        : roleFilter === "admin"
        ? u.roleType === "admin"
        : u.roleType !== "admin";
    return matchSearch && matchRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  // Stat Counters
  const totalUsersCount = users.length;
  const activeUsersCount = users.filter((u) => u.status === "Active").length;
  const adminUsersCount = users.filter((u) => u.roleType === "admin").length;
  const blockedUsersCount = users.filter((u) => u.status === "Blocked").length;

  const handleToggleBlockUser = async (id: number) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    const newStatus = target.status === "Active" ? "Blocked" : "Active";

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u))
    );

    // Save blocked emails list to localStorage for instant cross-tab logout sync
    try {
      const blockedList = users
        .filter((u) => (u.id === id ? newStatus === "Blocked" : u.status === "Blocked"))
        .map((u) => u.email);
      localStorage.setItem("mini_shop_blocked_users", JSON.stringify(blockedList));
    } catch (err) {
      console.error(err);
    }

    setToastMsg(newStatus === "Blocked" ? `🚫 Đã khóa tài khoản "${target.name}"` : `✅ Đã mở khóa tài khoản "${target.name}"`);
    setTimeout(() => setToastMsg(""), 3000);

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
    setToastMsg(`🎉 Đã thêm quản trị viên "${staffName}" thành công!`);
    setTimeout(() => setToastMsg(""), 3500);

    setStaffName("");
    setStaffEmail("");
    setStaffPhone("");
    setStaffPassword("12345678");
    setStaffRole("Administrator");
  };

  return (
    <>
      <style jsx global>{`
        .user-avatar-lg {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .role-badge {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .role-admin {
          background-color: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        .role-customer {
          background-color: #e0f2fe;
          color: #0369a1;
          border: 1px solid #bae6fd;
        }
      `}</style>

      <div className="admin-wrapper" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {/* Left Sidebar Navigation */}
        <AdminSidebar
          activeMenu="users"
          sidebarCollapsed={sidebarCollapsed}
        />

        {/* 2. Main Content Area */}
        <main className="admin-main">
          {/* Top Header Bar */}
          <AdminHeader
            title="Quản Lý Khách Hàng & Quản Trị Viên"
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Tìm tên, email, sđt khách..."
          />

          <div className="dashboard-content-body" style={{ padding: "24px 20px 60px" }}>
            
            {/* Toast Notification */}
            {toastMsg && (
              <div
                style={{
                  padding: "12px 18px",
                  background: "#f0fdf4",
                  color: "#166534",
                  border: "1px solid #bbf7d0",
                  borderRadius: "1rem",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  marginBottom: "24px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  boxShadow: "0 4px 14px rgba(22, 101, 52, 0.1)",
                }}
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
                <span>{toastMsg}</span>
              </div>
            )}

            {/* 1. Doppelrand KPI Stats Summary Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              {/* Stat 1: Total Users */}
              <div className="doppelrand-outer">
                <div className="doppelrand-inner" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748b" }}>Tổng Thành Viên</span>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Users className="w-4.5 h-4.5 text-blue-600" />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#0f172a" }}>{totalUsersCount}</div>
                  <span style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700 }}>Tài khoản hệ thống</span>
                </div>
              </div>

              {/* Stat 2: Active Accounts */}
              <div className="doppelrand-outer">
                <div className="doppelrand-inner" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748b" }}>Đang Hoạt Động</span>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#166534" }}>{activeUsersCount}</div>
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>Trạng thái bình thường</span>
                </div>
              </div>

              {/* Stat 3: Admins & Staff */}
              <div className="doppelrand-outer">
                <div className="doppelrand-inner" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748b" }}>Quản Trị Viên</span>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ShieldCheck className="w-4.5 h-4.5 text-amber-600" />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#b45309" }}>{adminUsersCount}</div>
                  <span style={{ fontSize: "12px", color: "#d97706", fontWeight: 700 }}>Quyền quản trị hệ thống</span>
                </div>
              </div>

              {/* Stat 4: Blocked Users */}
              <div className="doppelrand-outer">
                <div className="doppelrand-inner" style={{ padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 800, color: "#64748b" }}>Tài Khoản Đã Khóa</span>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <UserX className="w-4.5 h-4.5 text-red-600" />
                    </div>
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#dc2626" }}>{blockedUsersCount}</div>
                  <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>Tạm dừng truy cập</span>
                </div>
              </div>
            </div>

            {/* 2. Doppelrand Filter & Data Table Shell */}
            <div className="doppelrand-outer">
              <div className="doppelrand-inner" style={{ padding: "24px" }}>
                
                {/* Header Filter Action Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px" }}>
                      Danh Sách Khách Hàng & Tài Khoản ({filteredUsers.length})
                    </h2>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                      Quản lý danh sách người dùng, phân quyền truy cập và khóa/mở khóa tài khoản.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    {/* Search Input */}
                    <div style={{ position: "relative" }}>
                      <Search className="w-4 h-4 text-slate-400" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
                      <input
                        type="text"
                        placeholder="Tìm tên, email, sđt..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: "10px 16px 10px 38px",
                          fontSize: "13px",
                          borderRadius: "999px",
                          border: "1px solid #cbd5e1",
                          width: "240px",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* Role Select */}
                    <select
                      value={roleFilter}
                      onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "10px 16px",
                        fontSize: "13px",
                        fontWeight: 800,
                        borderRadius: "999px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        color: "#334155",
                        outline: "none",
                        cursor: "pointer",
                      }}
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                      <option value="customer">Khách hàng (Customer)</option>
                    </select>

                    {/* Add Admin Button */}
                    <button
                      type="button"
                      onClick={() => setShowAddModal(true)}
                      style={{
                        padding: "10px 20px",
                        background: "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "999px",
                        fontSize: "13px",
                        fontWeight: 900,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Thêm Quản Trị Viên</span>
                    </button>
                  </div>
                </div>

                {/* Table Data */}
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table" style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Thành viên</th>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Email</th>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Số điện thoại</th>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Vai trò</th>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Ngày đăng ký</th>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left" }}>Trạng thái</th>
                        <th style={{ padding: "14px 16px", fontSize: "12px", fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center" }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Đang tải dữ liệu khách hàng...
                          </td>
                        </tr>
                      ) : paginatedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            Không tìm thấy tài khoản nào khớp với từ khóa tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        paginatedUsers.map((user) => (
                          <tr key={user.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div className="user-avatar-lg" style={{ backgroundColor: user.avatarBg }}>
                                  {user.avatarText}
                                </div>
                                <div>
                                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{user.name}</div>
                                  <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>{user.username}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: "13.5px", color: "#334155", fontWeight: 700 }}>{user.email}</td>
                            <td style={{ padding: "14px 16px", fontSize: "13.5px", color: "#334155", fontWeight: 700 }}>{user.phone}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <span className={`role-badge ${user.roleType === "admin" ? "role-admin" : "role-customer"}`}>
                                {user.roleType === "admin" ? <ShieldCheck className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                                {user.role}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748b", fontWeight: 700 }}>{user.registeredDate}</td>
                            <td style={{ padding: "14px 16px" }}>
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: "999px",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  background: user.status === "Active" ? "#dcfce7" : "#fee2e2",
                                  color: user.status === "Active" ? "#166534" : "#dc2626",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                {user.status === "Active" ? "● Hoạt động" : "○ Đã khóa"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 16px", textAlign: "center" }}>
                              {user.roleType === "admin" ? (
                                <span style={{ fontSize: "12px", fontWeight: 800, color: "#94a3b8" }}>Quản trị hệ thống</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleToggleBlockUser(user.id)}
                                  style={{
                                    padding: "6px 14px",
                                    borderRadius: "999px",
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    border: user.status === "Active" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                                    background: user.status === "Active" ? "#fef2f2" : "#f0fdf4",
                                    color: user.status === "Active" ? "#dc2626" : "#166534",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  {user.status === "Active" ? (
                                    <><Lock className="w-3.5 h-3.5" /> Khóa tài khoản</>
                                  ) : (
                                    <><Unlock className="w-3.5 h-3.5" /> Mở khóa</>
                                  )}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Row */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
                      Hiển thị Trang {safeCurrentPage} / {totalPages} ({filteredUsers.length} tài khoản)
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        disabled={safeCurrentPage === 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                      >
                        Trước
                      </button>
                      <button
                        disabled={safeCurrentPage === totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Admin Modal (Doppelrand Modal Architecture) */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div className="doppelrand-outer" style={{ maxWidth: "520px", width: "100%" }}>
            <div className="doppelrand-inner" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Thêm Quản Trị Viên Mới
                  </h3>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                    Tạo tài khoản phân quyền quản trị hệ thống MiniShop.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer" }}
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              <form onSubmit={handleSaveNewAdmin}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn Quản Lý"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@minishop.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912345678"
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                  />
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#334155", marginBottom: "6px" }}>
                    Chức Danh / Vai Trò
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#fff" }}
                  >
                    <option value="Administrator">Administrator (Quản trị cao cấp)</option>
                    <option value="Store Manager">Store Manager (Quản lý cửa hàng)</option>
                    <option value="Customer Support">Customer Support (Hỗ trợ khách hàng)</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{ padding: "10px 20px", borderRadius: "999px", border: "1px solid #cbd5e1", background: "#fff", fontWeight: 800, fontSize: "13px" }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    style={{ padding: "10px 24px", borderRadius: "999px", border: "none", background: "var(--primary-color, #2e7d32)", color: "#fff", fontWeight: 900, fontSize: "13px" }}
                  >
                    Lưu Quản Trị Viên
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
