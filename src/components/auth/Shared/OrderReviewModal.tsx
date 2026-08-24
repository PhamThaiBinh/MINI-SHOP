"use client";

import React, { useState, useEffect } from "react";
import { Edit3, X, Star, Send, Sparkles, Image as ImageIcon, CheckCircle2, Shield, ThumbsUp, Camera } from "lucide-react";
import { CustomerOrder, OrderReviewData } from "@/components/auth/types";
import { formatVND, fixImagePath } from "@/lib/utils";

interface OrderReviewModalProps {
  isOpen: boolean;
  order: CustomerOrder | null;
  onClose: () => void;
  onSubmitReview: (
    orderId: string,
    rating: number,
    comment: string,
    tags: string[],
    isAnonymous: boolean,
    images: string[]
  ) => void;
  existingReview?: OrderReviewData | null;
  isReadOnly?: boolean;
}

const REVIEW_TAGS = [
  "Sản phẩm đẹp như hình",
  "Chất gỗ sồi tự nhiên cao cấp",
  "Đóng gói rất cẩn thận",
  "Giao hàng siêu nhanh",
  "Nhân viên tư vấn nhiệt tình",
  "Rất đáng tiền mua",
  "Màu sắc trang nhã",
  "Hoàn thiện tỉ mỉ sắc nét",
];

const RATING_LABELS: Record<number, { text: string; color: string; desc: string }> = {
  5: { text: "Tuyệt vời", color: "#16a34a", desc: "Rất hài lòng với sản phẩm và dịch vụ" },
  4: { text: "Hài lòng", color: "#0d9488", desc: "Sản phẩm chất lượng tốt, đúng mô tả" },
  3: { text: "Bình thường", color: "#d97706", desc: "Sản phẩm tạm ổn, chấp nhận được" },
  2: { text: "Chưa hài lòng", color: "#ea580c", desc: "Sản phẩm cần cải thiện thêm" },
  1: { text: "Thất vọng", color: "#dc2626", desc: "Sản phẩm không đúng như kỳ vọng" },
};

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  order,
  onClose,
  onSubmitReview,
  existingReview,
  isReadOnly = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || "");
      setSelectedTags(existingReview.tags || []);
      setIsAnonymous(Boolean(existingReview.isAnonymous));
      setUploadedImages(existingReview.images || []);
    } else {
      setRating(5);
      setHoverRating(0);
      setComment("");
      setSelectedTags(["Sản phẩm đẹp như hình", "Đóng gói rất cẩn thận"]);
      setIsAnonymous(false);
      setUploadedImages([]);
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !order) return null;

  const toggleTag = (tag: string) => {
    if (isReadOnly) return;
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
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
    if (isReadOnly) return;
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      onClose();
      return;
    }
    onSubmitReview(order.id, rating, comment, selectedTags, isAnonymous, uploadedImages);
  };

  const activeStarCount = hoverRating || rating;
  const currentRatingInfo = RATING_LABELS[activeStarCount] || RATING_LABELS[5];

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
          maxWidth: "560px",
          maxHeight: "92vh",
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
            padding: "20px 24px",
            borderBottom: "1px solid #f1f5f9",
            background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#fef3c7",
                  color: "#b45309",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Edit3 className="w-4 h-4 text-amber-600" />
              </div>
              <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                {isReadOnly ? "Chi Tiết Đánh Giá Đơn Hàng" : "Đánh Giá Sản Phẩm Đã Mua"}
              </h3>
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>Đơn hàng: <strong style={{ color: "var(--primary-color, #2e7d32)" }}>{order.id}</strong></span>
              <span>•</span>
              <span>{order.date}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!isReadOnly && (
              <span
                style={{
                  background: "#dcfce7",
                  border: "1px solid #86efac",
                  color: "#15803d",
                  fontSize: "11px",
                  fontWeight: 800,
                  padding: "4px 8px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> +50 Điểm
              </span>
            )}
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
                transition: "all 0.2s ease",
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Order Items Preview */}
          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "12px 14px",
            }}
          >
            <div style={{ fontSize: "11.5px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "8px", letterSpacing: "0.03em" }}>
              Sản phẩm trong đơn ({order.items.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {order.items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img
                    src={fixImagePath(it.image)}
                    alt={it.name}
                    style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/banner/banner-trang-chu-mini-shop.webp";
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
                </div>
              ))}
            </div>
          </div>

          {/* Star Rating Section */}
          <div
            style={{
              textAlign: "center",
              padding: "16px",
              background: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "18px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#78350f", marginBottom: "8px" }}>
              Chất lượng sản phẩm tổng thể:
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "6px" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isReadOnly}
                  onMouseEnter={() => !isReadOnly && setHoverRating(star)}
                  onMouseLeave={() => !isReadOnly && setHoverRating(0)}
                  onClick={() => !isReadOnly && setRating(star)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "4px",
                    cursor: isReadOnly ? "default" : "pointer",
                    transform: star <= activeStarCount ? "scale(1.1)" : "scale(1)",
                    transition: "transform 0.15s ease",
                  }}
                >
                  <i
                    className={star <= activeStarCount ? "fa-solid fa-star" : "fa-regular fa-star"}
                    style={{
                      fontSize: "32px",
                      color: star <= activeStarCount ? "#f59e0b" : "#cbd5e1",
                      filter: star <= activeStarCount ? "drop-shadow(0 2px 6px rgba(245, 158, 11, 0.4))" : "none",
                      transition: "all 0.15s ease",
                    }}
                  />
                </button>
              ))}
            </div>

            <div style={{ fontSize: "14px", fontWeight: 900, color: currentRatingInfo.color }}>
              {currentRatingInfo.text}
            </div>
            <div style={{ fontSize: "12px", color: "#78350f", marginTop: "2px" }}>
              {currentRatingInfo.desc}
            </div>
          </div>

          {/* Quick Tags Section */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "8px" }}>
              Tiêu chí đánh giá nhanh:
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {REVIEW_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: isReadOnly ? "default" : "pointer",
                      border: isSelected ? "1.5px solid #2e7d32" : "1px solid #cbd5e1",
                      background: isSelected ? "#f0fdf4" : "#ffffff",
                      color: isSelected ? "#15803d" : "#475569",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Comment Input */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>
                Viết cảm nhận chi tiết của bạn:
              </label>
              <span style={{ fontSize: "11.5px", color: "#94a3b8" }}>
                {comment.length}/500 ký tự
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              readOnly={isReadOnly}
              className="form-control"
              placeholder="Hãy chia sẻ thêm về chất lượng hoàn thiện, kiểu dáng, chất gỗ, màu sắc hoặc sự hài lòng của bạn khi sử dụng sản phẩm..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "13px",
                lineHeight: "1.5",
                borderRadius: "14px",
                border: "1.5px solid #cbd5e1",
                backgroundColor: isReadOnly ? "#f8fafc" : "#ffffff",
                boxSizing: "border-box",
                resize: "vertical",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
          </div>

          {/* Photo Upload Simulation */}
          <div>
            <label style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", display: "block", marginBottom: "8px" }}>
              Hình ảnh thực tế (Tùy chọn, tối đa 3 ảnh):
            </label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              {uploadedImages.map((imgSrc, idx) => (
                <div key={idx} style={{ position: "relative", width: "72px", height: "72px" }}>
                  <img
                    src={imgSrc}
                    alt={`Review photo ${idx + 1}`}
                    style={{ width: "100%", height: "100%", borderRadius: "10px", objectFit: "cover", border: "1px solid #cbd5e1" }}
                  />
                  {!isReadOnly && (
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
                        width: "20px",
                        height: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              {!isReadOnly && uploadedImages.length < 3 && (
                <label
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "10px",
                    border: "2px dashed #94a3b8",
                    background: "#f8fafc",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    gap: "4px",
                    color: "#64748b",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  <Camera className="w-5 h-5 text-slate-500" />
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

          {/* Anonymous Option */}
          {!isReadOnly && (
            <div
              onClick={() => setIsAnonymous(!isAnonymous)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#f8fafc",
                padding: "10px 14px",
                borderRadius: "12px",
                cursor: "pointer",
                userSelect: "none",
              }}
            >
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={() => {}}
                style={{ width: "16px", height: "16px", accentColor: "var(--primary-color, #2e7d32)", cursor: "pointer" }}
              />
              <div style={{ fontSize: "12.5px", color: "#334155" }}>
                <strong>Đánh giá ẩn danh</strong> (Ẩn tên tài khoản và chỉ hiển thị tên viết tắt khi đăng tải công khai)
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div style={{ display: "flex", gap: "10px", marginTop: "6px" }}>
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
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {isReadOnly ? "Đóng" : "Hủy Bỏ"}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                style={{
                  flex: 2,
                  padding: "12px 20px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 900,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 6px 18px rgba(46, 125, 50, 0.25)",
                }}
              >
                <Send className="w-4 h-4 text-white" /> Gửi Đánh Giá (+50 Điểm)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
