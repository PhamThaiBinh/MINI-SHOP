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
    const interval = setInterval(async () => {
      const latest = await fetchAdminUsers();
      setUsers(latest);
    }, 2000);
    return () => clearInterval(interval);
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

    // Save blocked identifiers (email, username) to localStorage for instant cross-tab logout sync
    try {
      const blockedList = users
        .filter(
          (u) =>
            (u.id === id ? newStatus === "Blocked" : u.status === "Blocked") &&
            u.roleType !== "admin" &&
            u.email !== "admin@minishop.vn"
        )
        .flatMap((u) => [u.email, u.username, u.username?.replace(/^@/, "")])
        .filter(Boolean);
      localStorage.setItem("mini_shop_blocked_users", JSON.stringify(blockedList));
      window.dispatchEvent(new Event("userStatusChanged"));
    } catch (err) {
      console.error(err);
    }

    setToastMsg(newStatus === "Blocked" ? `🚫 Đã khóa tài khoản "${target.name}"` : `✅ Đã mở khóa tài khoản "${target.name}"`);
    setTimeout(() => setToastMsg(""), 3000);

    await toggleAdminUserStatus(id, target.status);
    window.dispatchEvent(new Event("userStatusChanged"));
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
            title="Tài khoản"
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

            {/* 1. HIGH-CONTRAST EXECUTIVE KPI SUMMARY CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
                marginBottom: "28px",
              }}
            >
              {/* Stat 1: Total Users */}
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
                    Tổng Thành Viên
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#0c4a6e", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    {totalUsersCount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                    <span style={{ padding: "2px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                      Tài khoản hệ thống
                    </span>
                  </div>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(2, 132, 199, 0.2)" }}>
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 2: Active Accounts */}
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
                    Đang Hoạt Động
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    {activeUsersCount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                    <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                      Bình thường
                    </span>
                  </div>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#166534", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(22, 101, 52, 0.2)" }}>
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 3: Admins & Staff */}
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
                    Quản Trị Viên
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#78350f", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    {adminUsersCount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                    <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                      Quyền admin
                    </span>
                  </div>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#d97706", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.2)" }}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>

              {/* Stat 4: Blocked Users */}
              <div
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)",
                  border: "1.5px solid #fca5a5",
                  borderRadius: "20px",
                  padding: "20px",
                  boxShadow: "0 4px 20px rgba(225, 29, 72, 0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#be123c", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                    Tài Khoản Khóa
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 900, color: "#881337", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    {blockedUsersCount}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                    <span style={{ padding: "2px 8px", background: "#ffe4e6", color: "#be123c", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                      Tạm khóa
                    </span>
                  </div>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#e11d48", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(225, 29, 72, 0.2)" }}>
                  <UserX className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* 2. Double-Bezel Filter & Data Table Shell */}
            <div className="admin-card-shell">
              <div className="admin-card-core">
                
                {/* Header Filter Action Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: "0 0 4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Danh Sách Khách Hàng & Tài Khoản ({filteredUsers.length})
                    </h2>
                    <p style={{ fontSize: "13px", color: "#64748b", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                        padding: "10px 18px",
                        fontSize: "13px",
                        fontWeight: 700,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                        fontWeight: 800,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                      }}
                    >
                      <Plus className="w-4 h-4 text-white" /> Thêm Quản trị viên
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>THÀNH VIÊN</th>
                      <th>EMAIL</th>
                      <th>SỐ ĐIỆN THOẠI</th>
                      <th>VAI TRÒ</th>
                      <th>NGÀY ĐĂNG KÝ</th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: "center" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Không tìm thấy người dùng nào khớp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  background: u.roleType === "admin" ? "#166534" : "#e11d48",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontWeight: 800,
                                  fontSize: "14px",
                                }}
                              >
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "13.5px" }}>{u.name}</div>
                                <div style={{ fontSize: "11px", color: "#64748b" }}>@{u.username}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: "13px", color: "#334155" }}>{u.email}</td>
                          <td style={{ fontSize: "13px", color: "#334155", fontWeight: 600 }}>{u.phone}</td>
                          <td>
                            {u.roleType === "admin" ? (
                              <span style={{ padding: "4px 10px", background: "#fef3c7", border: "1px solid #fde68a", color: "#b45309", borderRadius: "12px", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                <i className="fa-solid fa-user-shield"></i> {u.role || "Administrator"}
                              </span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span style={{ padding: "4px 10px", background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1", borderRadius: "12px", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                  <i className="fa-solid fa-user"></i> Khách hàng
                                </span>
                                <span style={{ fontSize: "10px", fontWeight: 800, color: "#64748b", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                  VIP: {u.name.toLowerCase().includes("binh") ? <><i className="fa-solid fa-gem text-blue-500"></i> Kim Cương</> : <><i className="fa-solid fa-award text-slate-400"></i> Bạc</>}
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ fontSize: "12px", color: "#64748b" }}>{u.registeredDate}</td>
                          <td>
                            {u.status === "Active" ? (
                              <span style={{ padding: "4px 10px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>
                                • Hoạt động
                              </span>
                            ) : (
                              <span style={{ padding: "4px 10px", background: "#ffe4e6", color: "#be123c", borderRadius: "12px", fontSize: "11px", fontWeight: 800 }}>
                                • Đã khóa
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: "center" }}>
                            {u.roleType === "admin" ? (
                              <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>Quản trị hệ thống</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleBlockUser(u.id)}
                                style={{
                                  padding: "6px 12px",
                                  borderRadius: "12px",
                                  border: u.status === "Active" ? "1px solid #fecaca" : "1px solid #bbf7d0",
                                  background: u.status === "Active" ? "#fef2f2" : "#f0fdf4",
                                  color: u.status === "Active" ? "#ef4444" : "#166534",
                                  fontSize: "12px",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                {u.status === "Active" ? (
                                  <>
                                    <Lock className="w-3.5 h-3.5 text-red-500" /> Khóa tài khoản
                                  </>
                                ) : (
                                  <>
                                    <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Mở khóa tài khoản
                                  </>
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
            </div>
          </div>
        </main>
      </div>

      {/* HIGH-END DOUBLE-BEZEL REDESIGNED MODAL: THÊM QUẢN TRỊ VIÊN MỚI */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 3000,
            padding: "20px",
          }}
        >
          <div className="admin-card-shell" style={{ maxWidth: "540px", width: "100%", borderRadius: "24px" }}>
            <div className="admin-card-core" style={{ padding: "28px", borderRadius: "calc(24px - 6px)" }}>
              {/* Modal Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Thêm Quản Trị Viên Mới
                    </h3>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Cấp tài khoản có quyền truy cập trang Admin Suite
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                    borderRadius: "50%",
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveNewAdmin}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Họ và Tên Quản Trị Viên *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn Quản Lý"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      border: "1px solid #cbd5e1",
                      fontSize: "14px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      outline: "none",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Địa chỉ Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="admin@minishop.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Số Điện Thoại *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={staffPhone}
                      onChange={(e) => setStaffPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: "14px",
                        border: "1px solid #cbd5e1",
                        fontSize: "13.5px",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "24px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 800, color: "#1e293b", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Phân Quyền / Vai Trò *
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      border: "1px solid #cbd5e1",
                      fontSize: "13.5px",
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: "#ffffff",
                      color: "#0f172a",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Administrator">Administrator (Toàn quyền quản trị cao cấp)</option>
                    <option value="Store Manager">Store Manager (Quản lý đơn hàng & sản phẩm)</option>
                    <option value="Customer Support">Customer Support (Chăm sóc khách hàng & xử lý đơn)</option>
                  </select>
                </div>

                {/* Form Buttons */}
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "999px",
                      border: "1px solid #cbd5e1",
                      background: "#ffffff",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
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
                      borderRadius: "999px",
                      border: "none",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
                    }}
                  >
                    <Plus className="w-4 h-4 text-white" /> Lưu Quản Trị Viên
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
