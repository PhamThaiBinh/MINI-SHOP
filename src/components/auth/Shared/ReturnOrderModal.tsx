"use client";

import React, { useState } from "react";
import { RotateCcw, X, ShieldCheck, Camera } from "lucide-react";
import { CustomerOrder } from "@/components/auth/types";
import { formatVND, fixImagePath } from "@/lib/utils";

interface ReturnOrderModalProps {
  isOpen: boolean;
  order: CustomerOrder | null;
  onClose: () => void;
  onSubmitReturn: (orderId: string, reasonPreset: string, reasonDetail: string, images: string[]) => void;
}

const RETURN_REASONS = [
  "Không ưng ý sau khi sử dụng thử trong 7 ngày",
  "Sản phẩm không đúng như mô tả / hình ảnh trên website",
  "Sản phẩm bị lỗi kỹ thuật / hư hại trong quá trình vận chuyển",
  "Giao sai kích thước / màu sắc / thiếu phụ kiện",
  "Tìm được sản phẩm khác phù hợp hơn",
  "Lý do khác (Vui lòng ghi rõ chi tiết bên dưới)",
];

export const ReturnOrderModal: React.FC<ReturnOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmitReturn,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(RETURN_REASONS[0]);
  const [reasonDetail, setReasonDetail] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen || !order) return null;

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result && uploadedImages.length < 3) {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) {
      alert("Vui lòng chọn lý do trả hàng!");
      return;
    }
    setIsSubmitting(true);
    onSubmitReturn(order.id, selectedReason, reasonDetail, uploadedImages);
    setIsSubmitting(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#ffffff",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          borderRadius: "24px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.3)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "#fffaf5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "#ffedd5",
                color: "#c2410c",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RotateCcw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                Yêu Cầu Trả Hàng / Hoàn Tiền
              </h3>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
                Đơn hàng: <strong style={{ color: "#c2410c" }}>{order.id}</strong> • Ngày nhận: {order.date}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {/* Policy Banner */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "14px",
              padding: "12px 14px",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <ShieldCheck className="w-5 h-5 text-emerald-700" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div style={{ fontSize: "12.5px", color: "#166534", lineHeight: "1.5" }}>
              <strong>Đặc quyền đổi trả 7 ngày tại Mini Shop:</strong> Bạn được hoàn tiền 100% hoặc đổi mới sản phẩm nếu không ưng ý trong vòng 7 ngày kể từ ngày nhận đơn.
            </div>
          </div>

          {/* Product Items in Order */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>
              Sản phẩm yêu cầu trả ({order.items.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={fixImagePath(it.image)}
                    alt={it.name}
                    style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/products/nhan-thep-titan-xanh-lam.png";
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {it.name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#64748b" }}>
                      Số lượng: {it.qty} • {formatVND(it.price)}
                    </div>
                  </div>
                  <strong style={{ fontSize: "13px", color: "#0f172a" }}>
                    {formatVND(it.price * it.qty)}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          {/* Preset Reasons */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "8px" }}>
              Chọn lý do trả hàng:
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {RETURN_REASONS.map((r) => (
                <label
                  key={r}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "9px 12px",
                    borderRadius: "10px",
                    border: selectedReason === r ? "1.5px solid #ea580c" : "1px solid #e2e8f0",
                    background: selectedReason === r ? "#fff7ed" : "#ffffff",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    color: selectedReason === r ? "#9a3412" : "#334155",
                    fontWeight: selectedReason === r ? 700 : 500,
                    transition: "all 0.15s ease",
                  }}
                >
                  <input
                    type="radio"
                    name="return_reason"
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    style={{ accentColor: "#ea580c" }}
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Detailed Reason Textarea */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "6px" }}>
              Mô tả chi tiết tình trạng sản phẩm hoặc lý do trả:
            </label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Vui lòng chia sẻ thêm thông tin để Mini Shop hỗ trợ đổi trả hoặc hoàn tiền nhanh nhất cho bạn..."
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: "13px",
                lineHeight: "1.5",
                borderRadius: "12px",
                border: "1.5px solid #cbd5e1",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          {/* Upload Proof Images */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "8px" }}>
              Ảnh chụp hiện trạng sản phẩm (Tùy chọn, tối đa 3 ảnh):
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {uploadedImages.map((imgSrc, idx) => (
                <div key={idx} style={{ position: "relative", width: "64px", height: "64px" }}>
                  <img
                    src={imgSrc}
                    alt={`Return proof ${idx + 1}`}
                    style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    style={{
                      position: "absolute",
                      top: "-6px",
                      right: "-6px",
                      background: "#ef4444",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "10px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              {uploadedImages.length < 3 && (
                <label
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "10px",
                    border: "2px dashed #94a3b8",
                    background: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    gap: "2px",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  <Camera className="w-4 h-4 text-slate-500" />
                  <span>Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulateUpload}
                    style={{ display: "none" }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: "12px",
                background: "#f1f5f9",
                color: "#475569",
                border: "none",
                borderRadius: "12px",
                fontWeight: 800,
                fontSize: "13.5px",
                cursor: "pointer",
              }}
            >
              Hủy Bỏ
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: "12px 18px",
                background: "#ea580c",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontWeight: 900,
                fontSize: "13.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
              }}
            >
              <RotateCcw className="w-4 h-4 text-white" /> Gửi Yêu Cầu Trả Hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
