"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  icon?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface ToastAndConfirmContextType {
  showConfirm: (options: ConfirmDialogOptions) => void;
  showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

const ToastAndConfirmContext = createContext<ToastAndConfirmContextType | undefined>(undefined);

export const ToastAndConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogOptions | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);

  const showConfirm = (options: ConfirmDialogOptions) => {
    setConfirmDialog(options);
  };

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    try {
      setIsConfirmLoading(true);
      await confirmDialog.onConfirm();
    } finally {
      setIsConfirmLoading(false);
      setConfirmDialog(null);
    }
  };

  const handleCancelAction = () => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  };

  return (
    <ToastAndConfirmContext.Provider value={{ showConfirm, showToast }}>
      {children}

      {/* 1. Custom Confirmation Dialog (Replaces native browser window.confirm) */}
      {confirmDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 999999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            animation: "fadeIn 0.2s ease",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onClick={handleCancelAction}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "20px",
              maxWidth: "440px",
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              animation: "scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "28px 24px 20px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    background:
                      confirmDialog.type === "danger"
                        ? "#fee2e2"
                        : confirmDialog.type === "warning"
                        ? "#fef3c7"
                        : "#dcfce7",
                    color:
                      confirmDialog.type === "danger"
                        ? "#dc2626"
                        : confirmDialog.type === "warning"
                        ? "#d97706"
                        : "#166534",
                  }}
                >
                  {confirmDialog.icon ? (
                    <i className={confirmDialog.icon}></i>
                  ) : confirmDialog.type === "danger" ? (
                    <i className="fa-solid fa-trash-can"></i>
                  ) : confirmDialog.type === "warning" ? (
                    <i className="fa-solid fa-triangle-exclamation"></i>
                  ) : (
                    <i className="fa-solid fa-circle-question"></i>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "17px", fontWeight: 800, color: "#0f172a" }}>
                    {confirmDialog.title || "Xác nhận hành động"}
                  </h3>
                  <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: 1.55 }}>
                    {confirmDialog.message}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "16px 24px",
                background: "#f8fafc",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={handleCancelAction}
                disabled={isConfirmLoading}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  background: "#ffffff",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  fontSize: "13.5px",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {confirmDialog.cancelText || "Hủy bỏ"}
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isConfirmLoading}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background:
                    confirmDialog.type === "danger"
                      ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)"
                      : "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "13.5px",
                  fontWeight: 800,
                  cursor: "pointer",
                  boxShadow:
                    confirmDialog.type === "danger"
                      ? "0 4px 12px rgba(220, 38, 38, 0.25)"
                      : "0 4px 12px rgba(46, 125, 50, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                {isConfirmLoading ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-check"></i>
                )}
                {confirmDialog.confirmText || "Đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Custom Toast Notifications (Replaces native browser alert) */}
      <div
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 999999,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          pointerEvents: "none",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              pointerEvents: "auto",
              background:
                toast.type === "success"
                  ? "#f0fdf4"
                  : toast.type === "error"
                  ? "#fef2f2"
                  : toast.type === "warning"
                  ? "#fffbeb"
                  : "#f0f9ff",
              border: `1.5px solid ${
                toast.type === "success"
                  ? "#86efac"
                  : toast.type === "error"
                  ? "#fca5a5"
                  : toast.type === "warning"
                  ? "#fde68a"
                  : "#7dd3fc"
              }`,
              color:
                toast.type === "success"
                  ? "#166534"
                  : toast.type === "error"
                  ? "#991b1b"
                  : toast.type === "warning"
                  ? "#92400e"
                  : "#0369a1",
              borderRadius: "14px",
              padding: "12px 18px",
              maxWidth: "380px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: "13.5px",
              fontWeight: 700,
              lineHeight: 1.45,
              animation: "slideInRight 0.25s ease",
            }}
          >
            <span style={{ fontSize: "16px", flexShrink: 0 }}>
              {toast.type === "success" ? (
                <i className="fa-solid fa-circle-check text-emerald-600"></i>
              ) : toast.type === "error" ? (
                <i className="fa-solid fa-circle-xmark text-red-600"></i>
              ) : toast.type === "warning" ? (
                <i className="fa-solid fa-triangle-exclamation text-amber-600"></i>
              ) : (
                <i className="fa-solid fa-circle-info text-sky-600"></i>
              )}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastAndConfirmContext.Provider>
  );
};

export const useToastAndConfirm = () => {
  const context = useContext(ToastAndConfirmContext);
  if (!context) {
    throw new Error("useToastAndConfirm must be used within a ToastAndConfirmProvider");
  }
  return context;
};
