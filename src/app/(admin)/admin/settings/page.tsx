"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import "@/styles/auth.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  roleBadgeColor: string;
  roleBadgeBg: string;
  permissions: string;
  lastLogin: string;
  status: "Active" | "Blocked";
}

interface ShippingRate {
  id: number;
  region: string;
  minOrderFreeship: number;
  fixedFee: number;
  estimatedTime: string;
  isActive: boolean;
}

const INITIAL_STAFF_LIST: StaffUser[] = [
  {
    id: 1,
    name: "Nguyễn Văn An (Admin Root)",
    email: "admin@minishop.vn",
    role: "Super Admin",
    roleBadgeColor: "#1e40af",
    roleBadgeBg: "#dbeafe",
    permissions: "Toàn quyền hệ thống (Full Access)",
    lastLogin: "Vừa xong (127.0.0.1)",
    status: "Active",
  },
  {
    id: 2,
    name: "Trần Thị Mai",
    email: "mai.tran@minishop.vn",
    role: "Quản lý kho",
    roleBadgeColor: "#166534",
    roleBadgeBg: "#dcfce7",
    permissions: "Quản lý sản phẩm, tồn kho & danh mục",
    lastLogin: "10/08/2026 15:40",
    status: "Active",
  },
  {
    id: 3,
    name: "Lê Hoàng Nam",
    email: "nam.le@minishop.vn",
    role: "CSKH & Bán hàng",
    roleBadgeColor: "#854d0e",
    roleBadgeBg: "#fef9c3",
    permissions: "Xác nhận đơn hàng, xem danh sách khách",
    lastLogin: "09/08/2026 09:15",
    status: "Active",
  },
];

const INITIAL_SHIPPING_RATES: ShippingRate[] = [
  {
    id: 1,
    region: "Nội thành TP. Hồ Chí Minh",
    minOrderFreeship: 300000,
    fixedFee: 20000,
    estimatedTime: "Trong ngày (1 - 24h)",
    isActive: true,
  },
  {
    id: 2,
    region: "Nội thành Hà Nội",
    minOrderFreeship: 300000,
    fixedFee: 20000,
    estimatedTime: "24h - 48h",
    isActive: true,
  },
  {
    id: 3,
    region: "Các Tỉnh / Thành phố Miền Nam",
    minOrderFreeship: 500000,
    fixedFee: 30000,
    estimatedTime: "1 - 3 ngày làm việc",
    isActive: true,
  },
  {
    id: 4,
    region: "Các Tỉnh / Thành phố Miền Trung & Bắc",
    minOrderFreeship: 500000,
    fixedFee: 35000,
    estimatedTime: "2 - 4 ngày làm việc",
    isActive: true,
  },
  {
    id: 5,
    region: "Khu vực Huyện đảo / Vùng xa",
    minOrderFreeship: 800000,
    fixedFee: 45000,
    estimatedTime: "4 - 6 ngày làm việc",
    isActive: true,
  },
];

export default function AdminSettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "store" | "payment" | "shipping" | "security"
  >("store");

  const [notification, setNotification] = useState<string | null>(null);

  // Staff Management State
  const [staffList, setStaffList] = useState<StaffUser[]>(INITIAL_STAFF_LIST);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffEmail, setStaffEmail] = useState("");
  const [staffRole, setStaffRole] = useState("Quản lý kho");

  // Shipping Rates State
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>(INITIAL_SHIPPING_RATES);
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [editFeeVal, setEditFeeVal] = useState<string>("");
  const [editFreeshipVal, setEditFreeshipVal] = useState<string>("");

  // 2FA & Password state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const triggerNotify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) return;

    let roleColor = "#166534";
    let roleBg = "#dcfce7";
    let perms = "Quản lý sản phẩm & đơn hàng";

    if (staffRole === "Super Admin") {
      roleColor = "#1e40af";
      roleBg = "#dbeafe";
      perms = "Toàn quyền quản trị hệ thống";
    } else if (staffRole === "CSKH & Bán hàng") {
      roleColor = "#854d0e";
      roleBg = "#fef9c3";
      perms = "Xác nhận đơn hàng & hỗ trợ khách";
    }

    const newStaff: StaffUser = {
      id: Date.now(),
      name: staffName,
      email: staffEmail,
      role: staffRole,
      roleBadgeColor: roleColor,
      roleBadgeBg: roleBg,
      permissions: perms,
      lastLogin: "Chưa đăng nhập",
      status: "Active",
    };

    setStaffList([...staffList, newStaff]);
    setStaffName("");
    setStaffEmail("");
    setShowAddStaffModal(false);
    triggerNotify(`🎉 Đã tạo thành công tài khoản nhân viên ${staffName}!`);
  };

  const handleToggleLockStaff = (id: number) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextStatus = s.status === "Active" ? "Blocked" : "Active";
          triggerNotify(
            nextStatus === "Blocked"
              ? `🔒 Đã khóa tài khoản ${s.name}`
              : `🔓 Đã mở khóa tài khoản ${s.name}`
          );
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleDeleteStaff = (id: number) => {
    const target = staffList.find((s) => s.id === id);
    if (confirm(`Bạn có chắc muốn xóa nhân viên ${target?.name}?`)) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
      triggerNotify(`🗑️ Đã xóa nhân viên ${target?.name}!`);
    }
  };

  const handleToggleShippingRateStatus = (id: number) => {
    setShippingRates((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
    triggerNotify("🚚 Đã cập nhật trạng thái vùng vận chuyển!");
  };

  const handleSaveShippingRate = (id: number) => {
    const feeNum = Number(editFeeVal);
    const freeshipNum = Number(editFreeshipVal);
    const updatedRates = shippingRates.map((r) =>
      r.id === id
        ? {
            ...r,
            fixedFee: isNaN(feeNum) ? r.fixedFee : feeNum,
            minOrderFreeship: isNaN(freeshipNum) ? r.minOrderFreeship : freeshipNum,
          }
        : r
    );
    setShippingRates(updatedRates);
    try {
      localStorage.setItem("mini_shop_shipping_rates", JSON.stringify(updatedRates));
    } catch (err) {
      console.error(err);
    }
    setEditingRateId(null);
    triggerNotify("💾 Đã lưu cấu hình phí vận chuyển vùng thành công!");
  };

  const handleBackupJSON = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify({
          storeName: "Mini Shop Nội Thất & Gia Dụng",
          backupDate: new Date().toISOString(),
          staff: staffList,
          shippingRates: shippingRates,
        })
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `minishop_backup_${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerNotify("💾 Đã xuất file sao lưu dữ liệu hệ thống (JSON) thành công!");
  };

  return (
    <>
      <style jsx global>{`
        .settings-nav-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 24px;
          overflow-x: auto;
        }
        .settings-tab-item {
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 700;
          color: var(--text-muted);
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: var(--transition);
          white-space: nowrap;
        }

        .settings-tab-item.active {
          color: var(--primary-color);
          border-bottom-color: var(--primary-color);
        }
      `}</style>

      <div className="admin-wrapper">
        <AdminSidebar activeMenu="settings" sidebarCollapsed={sidebarCollapsed} />

        <main className="admin-main">
          {/* Header Đồng Bộ Chuẩn 3 Thông Báo & Dropdown Admin Profile */}
          <AdminHeader
            title="Cấu Hình Cửa Hàng & Hệ Thống"
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
          />

          <div className="dashboard-content-body">
            {/* Notification Banner */}
            {notification && (
              <div
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#15803d",
                  padding: "12px 18px",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700,
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  marginBottom: "20px",
                }}
              >
                <span>{notification}</span>
                <button
                  onClick={() => setNotification(null)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                    color: "#15803d",
                  }}
                >
                  &times;
                </button>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="settings-nav-tabs">
              <div
                className={`settings-tab-item ${
                  activeTab === "store" ? "active" : ""
                }`}
                onClick={() => setActiveTab("store")}
              >
                🏬 Thông tin cửa hàng
              </div>
              <div
                className={`settings-tab-item ${
                  activeTab === "payment" ? "active" : ""
                }`}
                onClick={() => setActiveTab("payment")}
              >
                💳 Cổng thanh toán (VietQR/Momo/9Pay)
              </div>
              <div
                className={`settings-tab-item ${
                  activeTab === "shipping" ? "active" : ""
                }`}
                onClick={() => setActiveTab("shipping")}
              >
                🚚 Cấu hình vận chuyển
              </div>
              <div
                className={`settings-tab-item ${
                  activeTab === "security" ? "active" : ""
                }`}
                onClick={() => setActiveTab("security")}
              >
                🔒 Bảo mật & Phân quyền
              </div>
            </div>

            {/* TAB 1: THÔNG TIN CỬA HÀNG */}
            {activeTab === "store" && (
              <div className="dashboard-card" style={{ maxWidth: "900px" }}>
                <h2 className="card-header-title" style={{ marginBottom: "8px" }}>
                  Cấu Hình Thông Tin Trụ Sở & Hotline
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  Thông tin hiển thị trên hóa đơn, chân trang web và email thông
                  báo đến khách hàng.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (typeof window !== "undefined") {
                      const form = e.currentTarget;
                      const formData = new FormData(form);
                      localStorage.setItem("mini_shop_store_settings", JSON.stringify({
                        savedAt: new Date().toISOString(),
                      }));
                    }
                    triggerNotify(
                      "💾 Đã lưu cấu hình thông tin cửa hàng thành công!"
                    );
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "6px",
                          display: "block",
                        }}
                      >
                        Tên thương hiệu *
                      </label>
                      <input
                        type="text"
                        className="admin-setting-input"
                        defaultValue="Mini Shop Nội Thất & Gia Dụng"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "6px",
                          display: "block",
                        }}
                      >
                        Hotline hỗ trợ khách hàng *
                      </label>
                      <input
                        type="text"
                        className="admin-setting-input"
                        defaultValue="0987.654.321"
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                      marginBottom: "16px",
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "6px",
                          display: "block",
                        }}
                      >
                        Email liên hệ & Nhận thông báo *
                      </label>
                      <input
                        type="email"
                        className="admin-setting-input"
                        defaultValue="support@minishop.vn"
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "6px",
                          display: "block",
                        }}
                      >
                        Giờ làm việc Showroom *
                      </label>
                      <input
                        type="text"
                        className="admin-setting-input"
                        defaultValue="8:00 AM - 21:30 PM (Tất cả các ngày)"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <label
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "6px",
                        display: "block",
                      }}
                    >
                      Địa chỉ Trụ sở chính & Showroom *
                    </label>
                    <input
                      type="text"
                      className="admin-setting-input"
                      defaultValue="123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh"
                      required
                    />
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-add-product-green"
                      style={{ padding: "10px 20px" }}
                    >
                      💾 Lưu Thay Đổi Cấu Hình
                    </button>
                    <button
                      type="button"
                      onClick={handleBackupJSON}
                      style={{
                        padding: "10px 16px",
                        background: "#f1f5f9",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      💾 Sao Lưu Dữ Liệu (JSON)
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: CỔNG THANH TOÁN (Danh sách đầy đủ Ngân hàng tại Việt Nam) */}
            {activeTab === "payment" && (
              <div className="dashboard-card" style={{ maxWidth: "900px" }}>
                <h2 className="card-header-title" style={{ marginBottom: "8px" }}>
                  Cấu Hình Các Phương Thức Thanh Toán
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  Quản lý cổng VietQR tự động, Ví MoMo, ZaloPay và phương thức
                  Thanh toán khi nhận hàng (COD).
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {/* Gateway 1: VietQR */}
                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      padding: "20px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>🏦</span>
                        <div>
                          <strong
                            style={{ fontSize: "15px", color: "#0f172a" }}
                          >
                            VietQR Ngân Hàng Tự Động
                          </strong>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Tự động tạo mã QR chính xác theo số tiền và mã đơn
                            hàng
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#166534",
                          background: "#dcfce7",
                          padding: "4px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        🟢 Hoạt động
                      </span>
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
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          Ngân hàng thụ hưởng (Danh sách đầy đủ tại Việt Nam) *
                        </label>
                        <select
                          className="admin-setting-input"
                          style={{ height: "42px", fontSize: "13px", fontWeight: 600 }}
                          defaultValue="VCB"
                        >
                          <option value="VCB">
                            VCB - Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)
                          </option>
                          <option value="CTG">
                            CTG - Ngân hàng TMCP Công Thương Việt Nam (VietinBank)
                          </option>
                          <option value="BIDV">
                            BIDV - Ngân hàng TMCP Đầu Tư và Phát Triển Việt Nam
                          </option>
                          <option value="MB">
                            MB - Ngân hàng TMCP Quân Đội (MBBank)
                          </option>
                          <option value="TCB">
                            TCB - Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)
                          </option>
                          <option value="AGR">
                            Agribank - Ngân hàng Nông nghiệp & Phát triển Nông thôn Việt Nam
                          </option>
                          <option value="ACB">
                            ACB - Ngân hàng TMCP Á Châu
                          </option>
                          <option value="VPB">
                            VPB - Ngân hàng TMCP Việt Nam Thịnh Vượng (VPBank)
                          </option>
                          <option value="TPB">
                            TPB - Ngân hàng TMCP Tiên Phong (TPBank)
                          </option>
                          <option value="STB">
                            STB - Ngân hàng TMCP Sài Gòn Thương Tín (Sacombank)
                          </option>
                          <option value="HDB">
                            HDB - Ngân hàng TMCP Phát triển TP.HCM (HDBank)
                          </option>
                          <option value="VIB">
                            VIB - Ngân hàng TMCP Quốc tế Việt Nam
                          </option>
                          <option value="MSB">
                            MSB - Ngân hàng TMCP Hàng Hải Việt Nam
                          </option>
                          <option value="SHB">
                            SHB - Ngân hàng TMCP Sài Gòn - Hà Nội
                          </option>
                          <option value="LPB">
                            LPB - Ngân hàng TMCP Lộc Phát Việt Nam (LPBank)
                          </option>
                          <option value="OCB">
                            OCB - Ngân hàng TMCP Phương Đông
                          </option>
                          <option value="ABB">
                            ABB - Ngân hàng TMCP An Bình (ABBANK)
                          </option>
                          <option value="NAB">
                            NAB - Ngân hàng TMCP Nam Á (Nam A Bank)
                          </option>
                          <option value="BAB">
                            BAB - Ngân hàng TMCP Bắc Á (Bac A Bank)
                          </option>
                          <option value="EIB">
                            EIB - Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam (Eximbank)
                          </option>
                          <option value="SEAB">
                            SeABank - Ngân hàng TMCP Đông Nam Á
                          </option>
                          <option value="PVC">
                            PVcomBank - Ngân hàng TMCP Đại Chúng Việt Nam
                          </option>
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          Số tài khoản nhận tiền *
                        </label>
                        <input
                          type="text"
                          className="admin-setting-input"
                          style={{ height: "42px", fontSize: "13px" }}
                          defaultValue="1029384756"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        triggerNotify(
                          "💳 Đã lưu và kiểm tra thành công kết nối VietQR Ngân Hàng!"
                        )
                      }
                      className="btn-add-product-green"
                      style={{ padding: "8px 16px", fontSize: "13px" }}
                    >
                      ✓ Lưu & Kiểm tra VietQR
                    </button>
                  </div>

                  {/* Gateway 2: COD */}
                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      padding: "20px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "24px" }}>💵</span>
                        <div>
                          <strong
                            style={{ fontSize: "15px", color: "#0f172a" }}
                          >
                            Thanh Toán Khi Nhận Hàng (COD)
                          </strong>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-muted)",
                            }}
                          >
                            Thu tiền mặt trực tiếp khi shiper giao hàng đến địa
                            chỉ
                          </div>
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 800,
                          color: "#166534",
                          background: "#dcfce7",
                          padding: "4px 10px",
                          borderRadius: "12px",
                        }}
                      >
                        🟢 Kích hoạt
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        triggerNotify("💵 Đã cập nhật cấu hình thanh toán COD!")
                      }
                      style={{
                        padding: "8px 16px",
                        background: "#0f172a",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Lưu Cấu Hình COD
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: VẬN CHUYỂN & BẢNG THIẾT LẬP PHÍ VẬN CHUYỂN CỐ ĐỊNH */}
            {activeTab === "shipping" && (
              <div className="dashboard-card" style={{ maxWidth: "950px" }}>
                <h2 className="card-header-title" style={{ marginBottom: "8px" }}>
                  Cấu Hình Đối Tác & Phí Vận Chuyển
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  Tích hợp tự động đẩy đơn sang Giao Hàng Nhanh (GHN), GHTK và
                  thiết lập bảng phí vận chuyển cố định theo vùng địa lý.
                </p>

                {/* Grid 2 Đơn vị vận chuyển */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                    marginBottom: "28px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "16px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                        🚚 Giao Hàng Nhanh (GHN)
                      </strong>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#166534",
                          background: "#dcfce7",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Active
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        triggerNotify(
                          "🚚 Đã lưu và kết nối API Giao Hàng Nhanh (GHN)!"
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "#f1f5f9",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Cấu hình Token API GHN
                    </button>
                  </div>

                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-md)",
                      padding: "16px",
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                        📦 Giao Hàng Tiết Kiệm (GHTK)
                      </strong>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#166534",
                          background: "#dcfce7",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Active
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        triggerNotify(
                          "📦 Đã lưu và kết nối API Giao Hàng Tiết Kiệm (GHTK)!"
                        )
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "#f1f5f9",
                        border: "1px solid var(--border-color)",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Cấu hình Token API GHTK
                    </button>
                  </div>
                </div>

                {/* BẢNG THIẾT LẬP PHÍ VẬN CHUYỂN CỐ ĐỊNH THEO VÙNG (THÊM MỚI NHƯ YÊU CẦU) */}
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "14px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      📋 Bảng Thiết Lập Phí Vận Chuyển Cố Định Theo Vùng Địa Lý
                    </h3>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--primary-color)",
                        background: "#f0fdf4",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      🎁 Đơn hàng đạt mức sẽ tự động Freeship
                    </span>
                  </div>

                  <div style={{ overflowX: "auto" }}>
                    <table className="admin-table" style={{ fontSize: "13px" }}>
                      <thead>
                        <tr>
                          <th>Khu Vực Giao Hàng</th>
                          <th>Phí Ship Cố Định</th>
                          <th>Miễn Phí Từ Đơn</th>
                          <th>Thời Gian Dự Kiến</th>
                          <th>Trạng Thái</th>
                          <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            Thao Tác
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {shippingRates.map((rate) => (
                          <tr key={rate.id}>
                            <td>
                              <strong>{rate.region}</strong>
                            </td>
                            <td>
                              {editingRateId === rate.id ? (
                                <input
                                  type="number"
                                  className="admin-setting-input"
                                  style={{ height: "32px", width: "100px", fontSize: "12px" }}
                                  value={editFeeVal}
                                  onChange={(e) => setEditFeeVal(e.target.value)}
                                />
                              ) : (
                                <strong style={{ color: "var(--primary-color)" }}>
                                  {rate.fixedFee.toLocaleString("vi-VN")}đ
                                </strong>
                              )}
                            </td>
                            <td>
                              {editingRateId === rate.id ? (
                                <input
                                  type="number"
                                  className="admin-setting-input"
                                  style={{ height: "32px", width: "110px", fontSize: "12px" }}
                                  value={editFreeshipVal}
                                  onChange={(e) => setEditFreeshipVal(e.target.value)}
                                />
                              ) : (
                                <span style={{ fontWeight: 700, color: "#15803d" }}>
                                  Từ {rate.minOrderFreeship.toLocaleString("vi-VN")}đ
                                </span>
                              )}
                            </td>
                            <td>{rate.estimatedTime}</td>
                            <td>
                              <span
                                className={
                                  rate.isActive ? "badge-visible" : "badge-lowstock"
                                }
                              >
                                {rate.isActive ? "● Áp dụng" : "○ Tạm tắt"}
                              </span>
                            </td>
                            <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                              <div
                                style={{
                                  display: "inline-flex",
                                  gap: "4px",
                                  alignItems: "center",
                                }}
                              >
                                {editingRateId === rate.id ? (
                                  <button
                                    type="button"
                                    className="btn-action-edit"
                                    onClick={() => handleSaveShippingRate(rate.id)}
                                    style={{ background: "var(--primary-color)", color: "#fff", border: "none" }}
                                  >
                                    💾 Lưu
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-action-edit"
                                    onClick={() => {
                                      setEditingRateId(rate.id);
                                      setEditFeeVal(rate.fixedFee.toString());
                                      setEditFreeshipVal(rate.minOrderFreeship.toString());
                                    }}
                                  >
                                    ✏️ Sửa
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn-action-edit"
                                  onClick={() => handleToggleShippingRateStatus(rate.id)}
                                  style={{
                                    borderColor: rate.isActive ? "#fdba74" : "#86efac",
                                    color: rate.isActive ? "#c2410c" : "#15803d",
                                  }}
                                >
                                  {rate.isActive ? "⏸️ Tắt" : "▶️ Bật"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BẢO MẬT & QUẢN LÝ NHÂN VIÊN */}
            {activeTab === "security" && (
              <div className="dashboard-card" style={{ maxWidth: "950px" }}>
                <h2 className="card-header-title" style={{ marginBottom: "8px" }}>
                  Bảo Mật Hệ Thống & Phân Quyền Quản Trị
                </h2>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    marginBottom: "24px",
                  }}
                >
                  Phân quyền tài khoản nhân viên, bật xác thực 2 lớp (2FA) và bảo
                  mật quản trị viên.
                </p>

                {/* Danh sách Nhân Viên Admin */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Danh Sách Tài Khoản Quản Trị
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffModal(true)}
                    style={{
                      padding: "5px 12px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: "var(--primary-color)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 2px 4px rgba(46, 125, 50, 0.15)",
                    }}
                  >
                    ➕ Thêm NV
                  </button>
                </div>

                <div style={{ overflowX: "auto", marginBottom: "24px" }}>
                  <table className="admin-table" style={{ fontSize: "13px" }}>
                    <thead>
                      <tr>
                        <th>Họ tên nhân viên</th>
                        <th>Email đăng nhập</th>
                        {/* CHO VAI TRÒ CĂN GIỮA THEO YÊU CẦU */}
                        <th style={{ textAlign: "center" }}>Vai trò</th>
                        <th>Quyền hạn</th>
                        <th style={{ textAlign: "center" }}>Trạng thái</th>
                        {/* THAO TÁC NẰM CỐ ĐỊNH TRÊN 1 DÒNG */}
                        <th style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <strong>{s.name}</strong>
                          </td>
                          <td>{s.email}</td>
                          {/* CHO VAI TRÒ CĂN GIỮA THEO YÊU CẦU */}
                          <td style={{ textAlign: "center" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                color: s.roleBadgeColor,
                                background: s.roleBadgeBg,
                                padding: "3px 10px",
                                borderRadius: "12px",
                                display: "inline-block",
                              }}
                            >
                              {s.role}
                            </span>
                          </td>
                          <td>{s.permissions}</td>
                          {/* TRẠNG THÁI NẰM CỐ ĐỊNH TRÊN 1 DÒNG */}
                          <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            <span
                              className={
                                s.status === "Active"
                                  ? "badge-visible"
                                  : "badge-lowstock"
                              }
                              style={{ whiteSpace: "nowrap", display: "inline-block" }}
                            >
                              {s.status === "Active"
                                ? "● Hoạt động"
                                : "○ Đã khóa"}
                            </span>
                          </td>
                          {/* THAO TÁC NẰM CỐ ĐỊNH TRÊN 1 DÒNG */}
                          <td style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                            <div
                              style={{
                                display: "inline-flex",
                                gap: "4px",
                                alignItems: "center",
                                whiteSpace: "nowrap",
                              }}
                            >
                              <button
                                type="button"
                                className="btn-action-edit"
                                onClick={() => handleToggleLockStaff(s.id)}
                                style={{ whiteSpace: "nowrap" }}
                              >
                                {s.status === "Active" ? "🔒 Khóa" : "🔓 Mở"}
                              </button>
                              {s.role !== "Super Admin" && (
                                <button
                                  type="button"
                                  className="btn-action-delete"
                                  onClick={() => handleDeleteStaff(s.id)}
                                  style={{ whiteSpace: "nowrap" }}
                                >
                                  🗑️ Xóa
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 2FA & Đổi Mật Khẩu */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      padding: "18px",
                      background: "#fff",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "8px",
                      }}
                    >
                      🔐 Xác Thực 2 Yếu Tố (2FA)
                    </h4>
                    <p
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginBottom: "14px",
                      }}
                    >
                      Bắt buộc nhập mã OTP từ ứng dụng Google Authenticator khi
                      đăng nhập từ thiết bị lạ.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIs2FAEnabled(!is2FAEnabled);
                        triggerNotify(
                          is2FAEnabled
                            ? "⚪ Đã tắt tính năng bảo mật 2FA!"
                            : "🟢 Đã bật tính năng bảo mật 2FA thành công!"
                        );
                      }}
                      style={{
                        padding: "8px 14px",
                        background: is2FAEnabled
                          ? "#dc2626"
                          : "var(--primary-color)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {is2FAEnabled
                        ? "Tắt Bảo Mặt 2FA"
                        : "Bật Bảo Mặt 2FA Ngay"}
                    </button>
                  </div>

                  <div
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "var(--radius-lg)",
                      padding: "18px",
                      background: "#fff",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "8px",
                      }}
                    >
                      🔑 Đổi Mật Khẩu Admin
                    </h4>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!oldPassword || !newPassword) return;
                        triggerNotify("🔑 Đã cập nhật mật khẩu Admin thành công!");
                        setOldPassword("");
                        setNewPassword("");
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                          marginBottom: "10px",
                        }}
                      >
                        <input
                          type="password"
                          className="admin-setting-input"
                          style={{ height: "38px", fontSize: "12px" }}
                          placeholder="Mật khẩu hiện tại"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                        />
                        <input
                          type="password"
                          className="admin-setting-input"
                          style={{ height: "38px", fontSize: "12px" }}
                          placeholder="Mật khẩu mới (Tối thiểu 8 ký tự)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          padding: "8px 16px",
                          background: "#0f172a",
                          color: "#fff",
                          border: "none",
                          borderRadius: "var(--radius-md)",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cập Nhật Mật Khẩu
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Thêm Nhân Viên Mới (Thiết kế giống chuẩn Form Đăng nhập / Đăng ký) */}
      {showAddStaffModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div className="auth-card" style={{ maxWidth: "480px", position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowAddStaffModal(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#f1f5f9",
                border: "none",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                fontSize: "20px",
                fontWeight: 700,
                cursor: "pointer",
                color: "#64748b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
              }}
            >
              &times;
            </button>

            <div
              style={{
                background: "#f8fafc",
                padding: "20px 24px 16px",
                borderBottom: "1px solid var(--border-color)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "32px", marginBottom: "6px" }}>👤</div>
              <h2 className="auth-form-title" style={{ fontSize: "20px", margin: 0 }}>
                Thêm Nhân Viên Quản Trị Mới
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  margin: "4px 0 0 0",
                }}
              >
                Cấp tài khoản đăng nhập & phân quyền nhân viên cho MINI-SHOP
              </p>
            </div>

            <form
              onSubmit={handleAddStaffSubmit}
              className="auth-card-body auth-form"
              style={{ padding: "24px" }}
            >
              <div>
                <label className="auth-label">Họ và tên nhân viên *</label>
                <input
                  type="text"
                  className="form-control auth-input"
                  placeholder="Ví dụ: Lê Thị Loan"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>

              <div>
                <label className="auth-label">Email đăng nhập *</label>
                <input
                  type="email"
                  className="form-control auth-input"
                  placeholder="loan.le@minishop.vn"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="auth-label">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  className="form-control auth-input"
                  defaultValue="12345678"
                  required
                />
              </div>

              <div>
                <label className="auth-label">Vai trò & Quyền hạn *</label>
                <select
                  className="form-control auth-input"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  style={{ height: "48px", fontSize: "14px", fontWeight: 600 }}
                >
                  <option value="Quản lý kho">
                    📦 Quản lý kho (Sản phẩm, tồn kho & danh mục)
                  </option>
                  <option value="CSKH & Bán hàng">
                    🛍️ CSKH & Bán hàng (Xác nhận & xử lý đơn)
                  </option>
                  <option value="Super Admin">
                    👑 Super Admin (Toàn quyền quản trị hệ thống)
                  </option>
                </select>
              </div>

              <div
                className="admin-hint-box"
                style={{ marginTop: "4px", marginBottom: "4px" }}
              >
                <strong>📌 Ghi chú khởi tạo:</strong>
                Mật khẩu mặc định là <code>12345678</code>. Nhân viên có thể tự
                thay đổi mật khẩu sau lần đăng nhập đầu tiên.
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  style={{
                    flex: "0 0 100px",
                    height: "48px",
                    background: "#f1f5f9",
                    border: "1px solid var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--text-main)",
                    cursor: "pointer",
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn-auth-submit"
                  style={{ flex: 1, marginTop: 0 }}
                >
                  ➕ Tạo Tài Khoản Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
