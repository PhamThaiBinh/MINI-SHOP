"use client";

import React, { useState } from "react";
import { Key, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useToastAndConfirm } from "@/context/ToastAndConfirmContext";

export const SecuritySettingsTab: React.FC = () => {
  const { showToast } = useToastAndConfirm();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự!", "warning");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Mật khẩu mới và xác nhận mật khẩu không khớp!", "warning");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        showToast(`Lỗi cập nhật mật khẩu: ${error.message}`, "error");
      } else {
        showToast("Đã cập nhật mật khẩu mới thành công!", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      showToast("Có lỗi xảy ra khi đổi mật khẩu!", "error");
    }
  };


  return (
    <div>
      <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", marginBottom: "16px", margin: "0 0 16px 0" }}>
        Đổi Mật Khẩu
      </h3>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "480px" }}>
        <div>
          <label className="auth-label">Mật khẩu hiện tại *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showCurrent ? "text" : "password"}
              className="form-control auth-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              style={{ borderRadius: "10px", height: "44px", paddingRight: "40px" }}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
            >
              {showCurrent ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        <div>
          <label className="auth-label">Mật khẩu mới *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showNew ? "text" : "password"}
              className="form-control auth-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ borderRadius: "10px", height: "44px", paddingRight: "40px" }}
              placeholder="Tối thiểu 6 ký tự..."
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
            >
              {showNew ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>

        <div>
          <label className="auth-label">Xác nhận mật khẩu mới *</label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="form-control auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ borderRadius: "10px", height: "44px", paddingRight: "40px" }}
              placeholder="Nhập lại mật khẩu mới..."
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            </button>

          </div>
        </div>

        <button
          type="submit"
          style={{
            alignSelf: "flex-start",
            padding: "10px 24px",
            borderRadius: "10px",
            background: "var(--primary-color, #2e7d32)",
            color: "#ffffff",
            border: "none",
            fontSize: "14px",
            fontWeight: 800,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 14px rgba(46, 125, 50, 0.2)",
            marginTop: "8px",
          }}
        >
          <Key className="w-4 h-4" /> Cập Nhật Mật Khẩu
        </button>
      </form>
    </div>
  );
};
