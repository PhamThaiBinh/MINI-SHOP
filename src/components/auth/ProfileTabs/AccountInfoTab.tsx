"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, useAuth } from "@/context/AuthContext";
import { Save, AlertCircle, CheckCircle2, PhoneCall } from "lucide-react";
import { validateVNPhoneNumber } from "@/lib/utils";

interface AccountInfoTabProps {
  user: UserProfile;
}

export const AccountInfoTab: React.FC<AccountInfoTabProps> = ({ user }) => {
  const { updateUserProfile } = useAuth();
  const [profileName, setProfileName] = useState(user.name || "");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setProfileName(user.name || "");
    setProfilePhone(user.phone || "");
  }, [user]);

  const phoneValidation = validateVNPhoneNumber(profilePhone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setStatusMsg({ type: "error", text: "Vui lòng nhập họ và tên!" });
      return;
    }

    if (!profilePhone.trim()) {
      setStatusMsg({ type: "error", text: "Vui lòng nhập số điện thoại!" });
      return;
    }

    const phoneCheck = validateVNPhoneNumber(profilePhone);
    if (!phoneCheck.isValid) {
      setStatusMsg({ type: "error", text: phoneCheck.message || "Số điện thoại không hợp lệ!" });
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);

    const res = await updateUserProfile(profileName, phoneCheck.cleanPhone);
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({
        type: "success",
        text: `Đã lưu cập nhật thông tin thành công! (Số điện thoại ${phoneCheck.carrier})`,
      });
      setTimeout(() => setStatusMsg(null), 4000);
    } else {
      setStatusMsg({ type: "error", text: res.error || "Không thể cập nhật thông tin!" });
    }
  };

  return (
    <div id="account-info-tab-wrapper">
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", margin: "0 0 16px 0" }}>
        Thông Tin Tài Khoản
      </h3>

      {!user.phone && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "12px",
            color: "#92400e",
            fontSize: "13.5px",
            fontWeight: 600,
            marginBottom: "18px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Lưu ý:</strong> Bạn chưa cập nhật Số điện thoại. Vui lòng nhập số điện thoại bên dưới để nhân viên giao hàng liên hệ khi nhận hàng nhé!
          </span>
        </div>
      )}

      {statusMsg && (
        <div
          style={{
            padding: "10px 14px",
            background: statusMsg.type === "success" ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${statusMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: "10px",
            color: statusMsg.type === "success" ? "#166534" : "#dc2626",
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "560px" }}>
        <div>
          <label className="auth-label">Họ và tên *</label>
          <input
            type="text"
            className="form-control auth-input"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
            style={{ borderRadius: "10px", height: "44px" }}
          />
        </div>

        <div>
          <label className="auth-label">Tên đăng nhập (Username)</label>
          <input
            type="text"
            className="form-control auth-input"
            value={`@${user.username ? user.username.replace(/^@/, "") : "user"}`}
            disabled
            style={{ borderRadius: "10px", height: "44px", background: "#f8fafc", color: "#64748b" }}
          />
        </div>

        <div>
          <label className="auth-label">Địa chỉ Email</label>
          <input
            type="email"
            className="form-control auth-input"
            value={user.email}
            disabled
            style={{ borderRadius: "10px", height: "44px", background: "#f8fafc", color: "#64748b" }}
          />
        </div>

        <div id="tour-phone-field">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="auth-label" style={{ margin: 0 }}>Số điện thoại *</label>
            {profilePhone && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: phoneValidation.isValid ? "#15803d" : "#b91c1c",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {phoneValidation.isValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Nhà mạng: {phoneValidation.carrier}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Đầu số không hợp lệ</span>
                  </>
                )}
              </span>
            )}
          </div>
          <input
            type="tel"
            className="form-control auth-input"
            value={profilePhone}
            onChange={(e) => setProfilePhone(e.target.value)}
            placeholder="Ví dụ: 0912345678 (10 chữ số)"
            required
            style={{
              borderRadius: "10px",
              height: "44px",
              marginTop: "6px",
              borderColor: profilePhone
                ? phoneValidation.isValid
                  ? "#22c55e"
                  : "#ef4444"
                : undefined,
            }}
          />
          <span style={{ fontSize: "11.5px", color: "#64748b", display: "block", marginTop: "4px" }}>
            Hỗ trợ tất cả đầu số các nhà mạng Việt Nam: Viettel, VinaPhone, MobiFone, Vietnamobile, Gmobile, Wintel, I-Telecom.
          </span>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          style={{
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: "10px",
            background: "var(--primary-color, #2e7d32)",
            color: "#ffffff",
            border: "none",
            fontSize: "14px",
            fontWeight: 800,
            cursor: isSaving ? "not-allowed" : "pointer",
            opacity: isSaving ? 0.7 : 1,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(46, 125, 50, 0.2)",
            marginTop: "8px",
          }}
        >
          <Save className="w-4 h-4" /> {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
        </button>
      </form>
    </div>
  );
};

