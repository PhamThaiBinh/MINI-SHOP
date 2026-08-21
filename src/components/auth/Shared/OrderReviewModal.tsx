"use client";

import React, { useState } from "react";
import { Edit3, X, Star, Send } from "lucide-react";

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (rating: number, comment: string) => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(reviewRating, reviewComment);
    setReviewComment("");
    setReviewRating(5);
  };

  return (
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
          background: "#fff",
          width: "100%",
          maxWidth: "480px",
          borderRadius: "var(--radius-lg)",
          padding: "24px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
            <Edit3 className="w-4 h-4 text-emerald-700" /> Đánh Giá Sản Phẩm Đã Mua
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>
              Chọn mức độ hài lòng (Số sao):
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= reviewRating
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-300 fill-slate-100"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>
              Viết cảm nhận của bạn về sản phẩm:
            </label>
            <textarea
              rows={3}
              className="form-control auth-input"
              placeholder="Ví dụ: Sản phẩm gỗ sồi tự nhiên rất đẹp, đóng gói cẩn thận..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              style={{ width: "100%", padding: "10px", fontSize: "13px" }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              background: "var(--primary-color)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 800,
              fontSize: "14px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <Send className="w-4 h-4" /> Gửi Đánh Giá Hoàn Thành
          </button>
        </form>
      </div>
    </div>
  );
};
