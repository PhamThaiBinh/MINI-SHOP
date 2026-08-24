"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fetchAdminUsers, saveAdminUser, toggleAdminUserStatus, fetchAdminOrders, AdminUserItem as UserItem, UnifiedOrder } from "@/lib/supabaseAdmin";
import { validateVNPhoneNumber, formatVND } from "@/lib/utils";
import { getMembershipTierInfo } from "@/lib/userUtils";
import { Lock, Unlock, X, Users, UserCheck, ShieldCheck, UserX, Search, Plus, Filter, CheckCircle2, Calendar, DollarSign, ShoppingBag, Eye, TrendingUp } from "lucide-react";

// Helper: Extract YYYY-MM from various date formats
const parseOrderMonthYear = (dateStr: string): string => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      return `${yyyy}-${mm}`;
    }
  }
  const parts = dateStr.trim().split(" ");
  const datePart = parts.find((p) => p.includes("/")) || parts[0];
  if (datePart && datePart.includes("/")) {
    const sub = datePart.split("/");
    if (sub.length === 3) {
      const mm = sub[1].padStart(2, "0");
      const yyyy = sub[2];
      return `${yyyy}-${mm}`;
    }
  }
  return "";
};

// Helper: Check if an order belongs to a user
const isOrderMatchUser = (order: UnifiedOrder, user: UserItem): boolean => {
  const cleanOrderPhone = (order.recipientPhone || "").replace(/\D/g, "");
  const cleanUserPhone = (user.phone || "").replace(/\D/g, "");
  if (cleanUserPhone && cleanOrderPhone && cleanUserPhone === cleanOrderPhone) return true;

  const orderUser = (order.username || "").toLowerCase().replace(/^@/, "");
  const userUsername = (user.username || "").toLowerCase().replace(/^@/, "");
  if (userUsername && orderUser && userUsername === orderUser) return true;

  if (order.recipientName && user.name && order.recipientName.trim().toLowerCase() === user.name.trim().toLowerCase()) {
    return true;
  }

  return false;
};

export default function AdminUsersPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [toastMsg, setToastMsg] = useState("");

  // Monthly Spending Filter State
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);
  const [spendingModalUser, setSpendingModalUser] = useState<UserItem | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [userData, orderData] = await Promise.all([
      fetchAdminUsers(),
      fetchAdminOrders(),
    ]);
    setUsers(userData);
    setOrders(orderData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      const [latestUsers, latestOrders] = await Promise.all([
        fetchAdminUsers(),
        fetchAdminOrders(),
      ]);
      setUsers(latestUsers);
      setOrders(latestOrders);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Form State for Add Admin/Staff Modal
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffPassword, setStaffPassword] = useState("12345678");
  const [staffRole, setStaffRole] = useState("Administrator");

  const [roleFilter, setRoleFilter] = useState("all");

  // Calculate monthly stats for a user
  const getUserMonthlyStats = (user: UserItem, monthFilter: string) => {
    const userOrders = orders.filter((o) => isOrderMatchUser(o, user));
    const validOrders = userOrders.filter((o) => o.status !== "cancelled");

    const filteredByMonth = monthFilter === "all"
      ? validOrders
      : validOrders.filter((o) => parseOrderMonthYear(o.date) === monthFilter);

    const totalSpent = filteredByMonth.reduce((sum, o) => sum + (o.total || 0), 0);
    const allTimeSpent = validOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return {
      totalSpent,
      allTimeSpent,
      orderCount: filteredByMonth.length,
      allTimeCount: validOrders.length,
      ordersList: filteredByMonth,
    };
  };

  // Generate dynamic month list (past 12 months)
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    return { key, label };
  });

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

    const phoneCheck = validateVNPhoneNumber(staffPhone);
    if (!phoneCheck.isValid) {
      alert(phoneCheck.message || "Số điện thoại không đúng đầu số nhà mạng tại Việt Nam!");
      return;
    }

    const newUser: UserItem = {
      id: Date.now(),
      avatarText: staffName.charAt(0).toUpperCase() || "S",
      avatarBg: "#059669",
      name: staffName,
      username: `@${staffEmail.split("@")[0]}`,
      email: staffEmail,
      phone: phoneCheck.cleanPhone,
      role: staffRole,
      roleType: "admin",
      registeredDate: new Date().toLocaleDateString("vi-VN"),
      status: "Active",
    };

    setUsers((prev) => [newUser, ...prev]);
    await saveAdminUser(newUser);
    setShowAddModal(false);
    setToastMsg(`🎉 Đã thêm quản trị viên "${staffName}" thành công! (${phoneCheck.carrier})`);
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

              {/* Stat 2: Total Spending in Selected Month */}
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
                    Chi Tiêu {selectedMonth === "all" ? "Toàn Bộ" : `Tháng ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                    {formatVND(
                      orders
                        .filter((o) => o.status !== "cancelled" && (selectedMonth === "all" || parseOrderMonthYear(o.date) === selectedMonth))
                        .reduce((sum, o) => sum + (o.total || 0), 0)
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                    <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                      Doanh thu khách hàng
                    </span>
                  </div>
                </div>
                <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#166534", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(22, 101, 52, 0.2)" }}>
                  <TrendingUp className="w-6 h-6" />
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
                      Theo dõi chi tiêu theo từng tháng, quản lý phân quyền và kiểm soát tài khoản khách hàng.
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    {/* Month Filter Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{
                          padding: "10px 16px",
                          fontSize: "13px",
                          fontWeight: 800,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          borderRadius: "999px",
                          border: "1.5px solid #bbf7d0",
                          background: "#f0fdf4",
                          color: "#166534",
                          outline: "none",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(22, 101, 52, 0.08)",
                        }}
                      >
                        <option value="all">📅 Tất cả thời gian</option>
                        {monthOptions.map((m) => (
                          <option key={m.key} value={m.key}>
                            📅 {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

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
                          width: "200px",
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
                        padding: "10px 18px",
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
                        gap: "6px",
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
                      <th>LIÊN HỆ (EMAIL / SĐT)</th>
                      <th>VAI TRÒ & HẠNG VIP</th>
                      <th style={{ textAlign: "right" }}>
                        CHI TIÊU {selectedMonth === "all" ? "TỔNG" : `THÁNG ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
                      </th>
                      <th>TRẠNG THÁI</th>
                      <th style={{ textAlign: "center" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          Không tìm thấy người dùng nào khớp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => {
                        const stats = getUserMonthlyStats(u, selectedMonth);

                        return (
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
                                  <div style={{ fontSize: "11px", color: "#64748b" }}>
                                    {u.username ? (u.username.startsWith("@") ? u.username : `@${u.username}`) : "@user"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: "13px", color: "#334155" }}>{u.email}</div>
                              <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>{u.phone}</div>
                            </td>
                            <td>
                              {u.roleType === "admin" ? (
                                <span style={{ padding: "4px 10px", background: "#fef3c7", border: "1px solid #fde68a", color: "#b45309", borderRadius: "12px", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                  <i className="fa-solid fa-user-shield"></i> {u.role || "Administrator"}
                                </span>
                              ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                  <span style={{ padding: "4px 10px", background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1", borderRadius: "12px", fontSize: "11px", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "4px", width: "fit-content" }}>
                                    <i className="fa-solid fa-user"></i> Khách hàng
                                  </span>
                                  <span style={{ fontSize: "10.5px", fontWeight: 800, color: "#64748b", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                    {(() => {
                                      const tier = getMembershipTierInfo(stats.allTimeSpent || (u as any).totalSpent || 0);
                                      if (tier.tierKey === "diamond") return <><i className="fa-solid fa-gem text-blue-500"></i> VIP: Kim Cương</>;
                                      if (tier.tierKey === "gold") return <><i className="fa-solid fa-crown text-amber-500"></i> VIP: Vàng</>;
                                      if (tier.tierKey === "silver") return <><i className="fa-solid fa-award text-slate-400"></i> VIP: Bạc</>;
                                      if (tier.tierKey === "bronze") return <><i className="fa-solid fa-shield text-amber-700"></i> VIP: Đồng</>;
                                      return <>Thành viên</>;
                                    })()}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Monthly Spending & Order Count */}
                            <td style={{ textAlign: "right" }}>
                              {u.roleType === "admin" ? (
                                <span style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 600 }}>-</span>
                              ) : (
                                <div>
                                  <div style={{ fontSize: "14px", fontWeight: 900, color: stats.totalSpent > 0 ? "#166534" : "#64748b" }}>
                                    {formatVND(stats.totalSpent)}
                                  </div>
                                  <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 700, marginTop: "2px" }}>
                                    {stats.orderCount > 0 ? (
                                      <span style={{ padding: "1px 6px", background: "#f0fdf4", color: "#166534", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                                        {stats.orderCount} đơn hàng
                                      </span>
                                    ) : (
                                      <span>0 đơn hàng</span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </td>

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
                                <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                  <button
                                    type="button"
                                    onClick={() => setSpendingModalUser(u)}
                                    style={{
                                      padding: "6px 10px",
                                      borderRadius: "10px",
                                      border: "1px solid #bfdbfe",
                                      background: "#eff6ff",
                                      color: "#2563eb",
                                      fontSize: "12px",
                                      fontWeight: 800,
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                    title="Xem tổng chi tiêu và lịch sử đơn hàng theo tháng của khách hàng này"
                                  >
                                    <Eye className="w-3.5 h-3.5" /> Chi tiêu tháng
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleBlockUser(u.id)}
                                    style={{
                                      padding: "6px 10px",
                                      borderRadius: "10px",
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
                                        <Lock className="w-3.5 h-3.5 text-red-500" /> Khóa
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Mở
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* POPUP MODAL: CHI TIẾT CHI TIÊU & ĐƠN HÀNG TRONG THÁNG CỦA KHÁCH HÀNG */}
      {spendingModalUser && (
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
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "680px",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1px solid #e2e8f0",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                borderBottom: "1.5px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "#166534",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: "18px",
                    boxShadow: "0 4px 12px rgba(22, 101, 52, 0.2)",
                  }}
                >
                  {spendingModalUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#14532d", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Báo Cáo Chi Tiêu: {spendingModalUser.name}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                    {spendingModalUser.email} • SĐT: {spendingModalUser.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSpendingModalUser(null)}
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

            {/* Modal Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto" }}>
              {(() => {
                const userStats = getUserMonthlyStats(spendingModalUser, selectedMonth);

                return (
                  <>
                    {/* Month Picker Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px", background: "#f8fafc", padding: "12px 16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Calendar className="w-4 h-4 text-emerald-700" /> Chọn tháng xem chi tiêu:
                      </div>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{
                          padding: "8px 14px",
                          fontSize: "13px",
                          fontWeight: 800,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          borderRadius: "10px",
                          border: "1.5px solid #bbf7d0",
                          background: "#ffffff",
                          color: "#166534",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">📅 Tất cả thời gian</option>
                        {monthOptions.map((m) => (
                          <option key={m.key} value={m.key}>
                            📅 {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Summary Stat Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                      <div style={{ padding: "16px", borderRadius: "16px", background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", textTransform: "uppercase" }}>
                          Chi Tiêu {selectedMonth === "all" ? "Tất Cả" : `Tháng ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 900, color: "#14532d", marginTop: "4px" }}>
                          {formatVND(userStats.totalSpent)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#15803d", fontWeight: 700, marginTop: "4px" }}>
                          Đã phát sinh {userStats.orderCount} đơn hàng
                        </div>
                      </div>

                      <div style={{ padding: "16px", borderRadius: "16px", background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                        <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                          Tổng Chi Tiêu Toàn Thời Gian
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: 900, color: "#0f172a", marginTop: "4px" }}>
                          {formatVND(userStats.allTimeSpent)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, marginTop: "4px" }}>
                          Tổng {userStats.allTimeCount} đơn hàng đã đặt
                        </div>
                      </div>
                    </div>

                    {/* Orders in Month List */}
                    <h4 style={{ fontSize: "14px", fontWeight: 900, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <ShoppingBag className="w-4 h-4 text-emerald-700" /> Danh Sách Đơn Hàng Trong Kỳ ({userStats.ordersList.length})
                    </h4>

                    {userStats.ordersList.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "32px 16px", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1" }}>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#64748b", fontWeight: 700 }}>
                          Khách hàng không phát sinh đơn hàng nào trong {selectedMonth === "all" ? "khoảng thời gian này" : `Tháng ${selectedMonth.split("-")[1]}/${selectedMonth.split("-")[0]}`}.
                        </p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {userStats.ordersList.map((ord) => (
                          <div
                            key={ord.id}
                            style={{
                              padding: "14px 16px",
                              borderRadius: "14px",
                              border: "1px solid #e2e8f0",
                              background: "#ffffff",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "10px",
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 900, color: "#0f172a" }}>
                                  Đơn #{ord.id}
                                </span>
                                <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: ord.status === "completed" ? "#dcfce7" : "#e0f2fe", color: ord.status === "completed" ? "#166534" : "#0369a1", fontWeight: 800 }}>
                                  {ord.statusText || ord.status}
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
                                📅 Ngày đặt: {ord.date} • {ord.items?.length || 1} sản phẩm
                              </div>
                            </div>

                            <div style={{ textAlign: "right" }}>
                              <div style={{ fontSize: "15px", fontWeight: 900, color: "#166534" }}>
                                {formatVND(ord.total)}
                              </div>
                              <div style={{ fontSize: "11.5px", color: "#94a3b8", fontWeight: 600 }}>
                                {ord.paymentMethod}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

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
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#14532d", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Thêm Quản Trị Viên Mới
                  </h3>
                  <p style={{ fontSize: "12px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                    Cấp tài khoản có quyền truy cập trang Admin Suite
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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

            <div style={{ padding: "24px" }}>

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
