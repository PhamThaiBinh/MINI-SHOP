"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import "@/styles/auth.css";
import { useAuth } from "@/context/AuthContext";
import { fetchProvincesApi, fetchWardsForProvinceApi } from "@/lib/locationApi";
import { getOrdersForUser, cancelOrderWithReason } from "@/utils/orderStorage";
import {
  fetchUserAddressesFromSupabase,
  addUserAddressToSupabase,
  setDefaultUserAddressInSupabase,
  deleteUserAddressFromSupabase,
} from "@/lib/supabaseAddress";
import { OtpVerificationModal } from "@/components/common/OtpVerificationModal";
import { AddressItem, CustomerOrder } from "@/components/auth/types";
import { LoginForm } from "@/components/auth/AuthForms/LoginForm";
import { RegisterForm } from "@/components/auth/AuthForms/RegisterForm";
import { ProfileHeader } from "@/components/auth/ProfileTabs/ProfileHeader";
import { ProfileNavTabs, AuthProfileTab } from "@/components/auth/ProfileTabs/ProfileNavTabs";
import { AccountInfoTab } from "@/components/auth/ProfileTabs/AccountInfoTab";
import { OrderHistoryTab } from "@/components/auth/ProfileTabs/OrderHistoryTab";
import { AddressBookTab } from "@/components/auth/ProfileTabs/AddressBookTab";
import { RewardsPointsTab } from "@/components/auth/ProfileTabs/RewardsPointsTab";
import { SecuritySettingsTab } from "@/components/auth/ProfileTabs/SecuritySettingsTab";
import { OrderDetailModal } from "@/components/auth/Shared/OrderDetailModal";
import { OrderReviewModal } from "@/components/auth/Shared/OrderReviewModal";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signIn, signUp, loginUser, logout, redeemGift, addPointsAndHistory, addVoucherToUser } = useAuth();

  // Auth Guest Mode Tabs
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState<string>("");
  const [authSuccess, setAuthSuccess] = useState<string>("");

  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [sentOtpToken, setSentOtpToken] = useState<string>("");
  const [regName, setRegName] = useState<string>("");
  const [regEmail, setRegEmail] = useState<string>("");
  const [regPassword, setRegPassword] = useState<string>("");

  // Profile Tab State
  const [profileTab, setProfileTab] = useState<AuthProfileTab>("profile");

  // Orders State
  const [liveOrders, setLiveOrders] = useState<CustomerOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<CustomerOrder | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>("Đổi ý không muốn mua nữa");
  const [cancelReasonCustom, setCancelReasonCustom] = useState<string>("");

  // Addresses State
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [provincesList, setProvincesList] = useState<string[]>([]);
  const [wardsList, setWardsList] = useState<string[]>([]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [searchParams]);

  // Sync Orders & Addresses on login
  useEffect(() => {
    if (user) {
      const userOrders = getOrdersForUser(user.username || user.name);
      setLiveOrders(userOrders as CustomerOrder[]);

      fetchUserAddressesFromSupabase(user.email || user.username || "user").then((savedAddrs) => {
        if (savedAddrs.length > 0) {
          setAddresses(savedAddrs);
        } else {
          setAddresses([
            {
              id: 1,
              name: user.name,
              phone: user.phone || "0988.123.456",
              province: "Thành phố Hồ Chí Minh",
              ward: "Phường Bến Thành",
              detail: "123 Đường Nguyễn Trãi",
              isDefault: true,
            },
          ]);
        }
      });
    }
  }, [user]);

  // Load Provinces
  useEffect(() => {
    fetchProvincesApi().then((provs) => setProvincesList(provs));
  }, []);

  const handleSelectProvince = async (provName: string) => {
    const wards = await fetchWardsForProvinceApi(provName);
    setWardsList(wards);
  };

  // Login Submit
  const handleLoginSubmit = async (email: string, pass: string) => {
    setAuthError("");
    setAuthSuccess("");

    const res = await signIn(email, pass);
    if (!res.success) {
      setAuthError(res.error || "Tên đăng nhập hoặc mật khẩu không chính xác!");
    } else {
      setAuthSuccess("Đăng nhập thành công! Đang chuyển hướng...");
      setTimeout(() => {
        if (email.toLowerCase().includes("admin")) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 500);
    }
  };

  // Register Submit & OTP Trigger
  const handleRegisterSubmit = async (name: string, email: string, pass: string, confirmPass: string) => {
    setAuthError("");
    setAuthSuccess("");

    if (pass !== confirmPass) {
      setAuthError("Mật khẩu và xác nhận mật khẩu không trùng khớp!");
      return;
    }

    setRegName(name);
    setRegEmail(email);
    setRegPassword(pass);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpToken(generatedOtp);

    try {
      await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: generatedOtp, name }),
      });
    } catch (e) {
      console.warn("Error sending OTP email:", e);
    }

    setShowOtpModal(true);
  };

  const handleVerifyOtp = async (inputOtp: string): Promise<{ success: boolean; error?: string }> => {
    if (inputOtp !== sentOtpToken) {
      return { success: false, error: "Mã OTP không chính xác!" };
    }
    const res = await signUp(regEmail, regPassword, regName);
    if (!res.success) {
      setAuthError(res.error || "Đăng ký thất bại!");
      setShowOtpModal(false);
      return { success: false, error: res.error || "Đăng ký thất bại!" };
    }
    setAuthSuccess("Đăng ký thành công! Đang tự động đăng nhập...");
    setShowOtpModal(false);
    return { success: true };
  };

  const handleResendOtp = async () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentOtpToken(newOtp);
    await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail, otp: newOtp, name: regName }),
    });
  };

  // Address CRUD
  const handleAddAddress = async (
    name: string,
    phone: string,
    province: string,
    ward: string,
    detail: string,
    isDefault: boolean
  ) => {
    const newAddr: AddressItem = {
      id: Date.now(),
      name,
      phone,
      province,
      ward,
      detail,
      isDefault,
    };
    const updated = isDefault
      ? addresses.map((a) => ({ ...a, isDefault: false })).concat(newAddr)
      : [...addresses, newAddr];

    setAddresses(updated);
    if (user?.email) {
      await addUserAddressToSupabase(newAddr, user.email);
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    if (user?.email) {
      await setDefaultUserAddressInSupabase(id, user.email);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (user?.email) {
      await deleteUserAddressFromSupabase(id, user.email);
    }
  };

  // Order Cancel
  const handleConfirmCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTargetOrder) return;
    const finalReason = cancelReasonPreset.includes("Lý do khác")
      ? cancelReasonCustom || "Khách hàng không nêu rõ lý do"
      : cancelReasonPreset;

    // 1. Update local storage
    cancelOrderWithReason(cancelTargetOrder.id, finalReason);

    // 2. Update Supabase Orders Table so Admin Interface syncs immediately
    try {
      const supabase = createClient();
      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          status_text: "Đã hủy đơn",
          cancel_reason: finalReason,
        })
        .eq("id", cancelTargetOrder.id.replace("#", ""));
    } catch (err) {
      console.error("Error syncing cancelled status to Supabase:", err);
    }

    setLiveOrders((prev) =>
      prev.map((o) =>
        o.id === cancelTargetOrder.id
          ? { ...o, status: "cancelled" as const, statusText: `Đã hủy (${finalReason})` }
          : o
      )
    );
    setShowCancelModal(false);
    alert(`Đã hủy thành công đơn hàng ${cancelTargetOrder.id}!`);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
          <p style={{ fontWeight: 600 }}>Đang tải dữ liệu tài khoản...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="auth-page-wrapper" style={{ padding: "40px 16px", background: "#f8fafc", minHeight: "85vh" }}>
      {!user ? (
        /* GUEST AUTH FORM (LOGIN & REGISTER) */
        <div style={{ maxWidth: "440px", margin: "0 auto" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              padding: "32px 28px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div style={{ display: "flex", gap: "8px", background: "#f1f5f9", padding: "4px", borderRadius: "12px", marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "login" ? "#ffffff" : "transparent",
                  color: activeTab === "login" ? "var(--primary-color, #2e7d32)" : "#64748b",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: activeTab === "login" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                }}
              >
                Đăng Nhập
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  background: activeTab === "register" ? "#ffffff" : "transparent",
                  color: activeTab === "register" ? "var(--primary-color, #2e7d32)" : "#64748b",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: activeTab === "register" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
                }}
              >
                Đăng Ký
              </button>
            </div>

            {authError && (
              <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", color: "#dc2626", fontSize: "13px", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px", color: "#166534", fontSize: "13px", fontWeight: 800, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{authSuccess}</span>
              </div>
            )}

            {activeTab === "login" ? (
              <LoginForm
                onLoginSubmit={handleLoginSubmit}
                onQuickLoginAdmin={() => loginUser("admin@minishop.vn")}
                onQuickLoginCustomer={() => loginUser("binh.pham@minishop.vn")}
              />
            ) : (
              <RegisterForm onRegisterSubmit={handleRegisterSubmit} />
            )}
          </div>
        </div>
      ) : (
        /* LOGGED-IN CUSTOMER PROFILE DASHBOARD */
        <div style={{ width: "100%", maxWidth: "1300px", margin: "0 auto" }}>
          {/* Header Banner */}
          <ProfileHeader user={user} ordersCount={liveOrders.length} onLogout={logout} />

          {/* Main Grid: Left Nav + Right Active Tab Content */}
          <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "20px" }}>
            {/* Left Nav */}
            <ProfileNavTabs activeTab={profileTab} onChangeTab={setProfileTab} />

            {/* Right Card Container */}
            <div style={{ background: "#ffffff", borderRadius: "20px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
              {profileTab === "profile" && <AccountInfoTab user={user} />}
              {profileTab === "orders" && (
                <OrderHistoryTab
                  orders={liveOrders}
                  onSelectOrder={setSelectedOrder}
                  onOpenReviewModal={(ord) => setShowReviewModal(true)}
                  onOpenCancelModal={(ord) => {
                    setCancelTargetOrder(ord);
                    setShowCancelModal(true);
                  }}
                />
              )}
              {profileTab === "addresses" && (
                <AddressBookTab
                  addresses={addresses}
                  provincesList={provincesList}
                  wardsList={wardsList}
                  onSelectProvince={handleSelectProvince}
                  onAddAddress={handleAddAddress}
                  onSetDefaultAddress={handleSetDefaultAddress}
                  onDeleteAddress={handleDeleteAddress}
                />
              )}
              {profileTab === "rewards" && (
                <RewardsPointsTab
                  user={user}
                  onRedeemGift={redeemGift}
                  onConfirmShare={() => addPointsAndHistory("Chia sẻ Facebook/Zalo nhận điểm", 50)}
                  onAddVoucher={addVoucherToUser}
                  onAddPoints={addPointsAndHistory}
                />
              )}
              {profileTab === "security" && <SecuritySettingsTab />}
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <OrderDetailModal selectedOrder={selectedOrder} onClose={() => setSelectedOrder(null)} />

      <OrderReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmitReview={(rating, comment) => {
          setShowReviewModal(false);
          alert("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
        }}
      />

      {/* Cancel Order Modal */}
      {showCancelModal && cancelTargetOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 3000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: "480px", borderRadius: "16px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 20px", background: "#fef2f2", borderBottom: "1px solid #fee2e2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#991b1b", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertTriangle className="w-4 h-4 text-red-600" /> Lý Do Hủy Đơn Hàng {cancelTargetOrder.id}
              </h3>
              <button type="button" onClick={() => setShowCancelModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X className="w-5 h-5 text-red-700" />
              </button>
            </div>

            <form onSubmit={handleConfirmCancelOrder} style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "#64748b", marginTop: 0, marginBottom: "14px" }}>
                Xin vui lòng chọn lý do tại sao bạn muốn hủy đơn hàng này:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {["Đổi ý không muốn mua nữa", "Muốn đổi sản phẩm khác", "Thay đổi địa chỉ giao hàng", "Thời gian giao hàng lâu", "Lý do khác..."].map((r, idx) => (
                  <label key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", padding: "8px 12px", border: "1px solid #e2e8f0", borderRadius: "6px", cursor: "pointer", background: cancelReasonPreset === r ? "#f0fdf4" : "#fff", borderColor: cancelReasonPreset === r ? "var(--primary-color, #2e7d32)" : "#e2e8f0", fontWeight: cancelReasonPreset === r ? 700 : 400 }}>
                    <input type="radio" name="cancel_reason" value={r} checked={cancelReasonPreset === r} onChange={(e) => setCancelReasonPreset(e.target.value)} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {cancelReasonPreset.includes("Lý do khác") && (
                <div style={{ marginBottom: "16px" }}>
                  <label className="auth-label">Nhập lý do chi tiết của bạn:</label>
                  <textarea rows={3} className="form-control auth-input" placeholder="Ví dụ: Cần gấp..." value={cancelReasonCustom} onChange={(e) => setCancelReasonCustom(e.target.value)} style={{ width: "100%", padding: "10px", fontSize: "13px" }} />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button type="button" onClick={() => setShowCancelModal(false)} style={{ flex: 1, padding: "10px", background: "#f1f5f9", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                  Quay Lại
                </button>
                <button type="submit" style={{ flex: 1, padding: "10px", background: "#dc2626", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}>
                  Xác Nhận Hủy Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={regEmail}
        fallbackOtp={sentOtpToken}
        onVerify={handleVerifyOtp}
        onResendOtp={handleResendOtp}
        onClose={() => setShowOtpModal(false)}
      />
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mx-auto mb-3" />
          <p style={{ fontWeight: 600 }}>Đang tải trang xác thực...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
