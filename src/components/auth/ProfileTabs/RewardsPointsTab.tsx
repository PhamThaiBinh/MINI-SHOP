"use client";

import React, { useState } from "react";
import { UserProfile } from "@/context/AuthContext";
import { useToastAndConfirm } from "@/context/ToastAndConfirmContext";
import { Sparkles, Ticket, Gift, Truck, Sofa, Disc, Check, Copy, Crown, Shield } from "lucide-react";

interface RewardsPointsTabProps {
  user: UserProfile;
  onRedeemGift: (giftName: string, points: number, discount: number, code: string) => boolean;
  onConfirmShare: () => void;
  onAddVoucher?: (label: string, discount: number, code: string) => void;
  onAddPoints?: (title: string, amount: number) => void;
}

const GIFTS_CATALOG = [
  { id: "g1", name: "Voucher Giảm 50K cho Đơn Từ 300K", points: 200, discount: 50000, code: "MSVIP50K", icon: "Ticket" },
  { id: "g2", name: "Voucher Giảm 100K cho Đơn Từ 600K", points: 350, discount: 100000, code: "MSVIP100K", icon: "Gift" },
  { id: "g3", name: "Miễn Phí Vận Chuyển Toàn Quốc (Tối đa 40K)", points: 150, discount: 40000, code: "MSFREESHIP", icon: "Truck" },
  { id: "g4", name: "Voucher Đặc Quyền Nội Thất Giảm 200K", points: 600, discount: 200000, code: "MSNOITHAT200K", icon: "Sofa" },
];

export const RewardsPointsTab: React.FC<RewardsPointsTabProps> = ({
  user,
  onRedeemGift,
  onConfirmShare,
  onAddVoucher,
  onAddPoints,
}) => {
  const { showToast } = useToastAndConfirm();
  const [rewardSubTab, setRewardSubTab] = useState<"catalog" | "myvouchers" | "history" | "tasks" | "wheel" | "tiers">("catalog");
  const [spinDeg, setSpinDeg] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResultMsg, setSpinResultMsg] = useState("");

  // Share Task Flow States
  const [showShareModal, setShowShareModal] = useState(false);
  const [isVerifyingShare, setIsVerifyingShare] = useState(false);
  const [isClaimReady, setIsClaimReady] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const shareStorageKey = user ? `minishop_share_task_${user.username}_${todayStr}` : `minishop_share_task_guest_${todayStr}`;
  const wheelStorageKey = user ? `minishop_wheel_task_${user.username}_${todayStr}` : `minishop_wheel_task_guest_${todayStr}`;

  const [hasCompletedShareToday, setHasCompletedShareToday] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(shareStorageKey) === "completed";
  });

  const [hasSpunWheelToday, setHasSpunWheelToday] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(wheelStorageKey) === "completed";
  });

  const userPoints = user.points || 0;
  const userHistory = user.history || [];
  const userVouchers = user.vouchers || [];

  const handleRedeem = (giftName: string, pointsRequired: number, discount: number, code: string) => {
    if (userPoints < pointsRequired) {
      showToast(`Bạn cần tối thiểu ${pointsRequired} điểm để đổi quà tặng này!`, "warning");
      return;
    }
    const success = onRedeemGift(giftName, pointsRequired, discount, code);
    if (success) {
      showToast(`Chúc mừng bạn đã đổi thành công "${giftName}"! Mã voucher [${code}] đã được thêm vào Kho Voucher của bạn.`, "success");
    }
  };

  const handleExecuteShare = (platform: "facebook" | "zalo") => {
    const shareUrl = encodeURIComponent("https://mini-shop.vercel.app");
    const shareTitle = encodeURIComponent("Khám phá Nội Thất Sang Trọng MINI SHOP - Ưu Đãi Độc Quyền!");

    if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank", "width=600,height=500");
    } else {
      window.open(`https://sp.zalo.me/share_inline?link=${shareUrl}&title=${shareTitle}`, "_blank", "width=600,height=500");
    }

    setShowShareModal(false);
    setIsVerifyingShare(true);

    // Chờ 3 giây để mô phỏng theo dõi từng bước chia sẻ của khách hàng
    setTimeout(() => {
      setIsVerifyingShare(false);
      setIsClaimReady(true);
    }, 3000);
  };

  const handleClaimReward = () => {
    onConfirmShare();
    if (typeof window !== "undefined") {
      localStorage.setItem(shareStorageKey, "completed");
    }
    setHasCompletedShareToday(true);
    setIsClaimReady(false);
    showToast("🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ và nhận thành công +50 Điểm Thưởng VIP!", "success");
  };

  const handleSpinWheel = () => {
    if (isSpinning || hasSpunWheelToday) return;
    setIsSpinning(true);
    setSpinResultMsg("");

    const extraSpin = 360 * 5;
    const randomDegrees = Math.floor(Math.random() * 360);
    const totalDeg = spinDeg + extraSpin + randomDegrees;

    setSpinDeg(totalDeg);

    setTimeout(() => {
      setIsSpinning(false);
      const rewards = [
        { type: "voucher", label: "Voucher Giảm 50.000đ", discount: 50000, code: "MSWHEEL50K", msg: "Chúc mừng! Bạn trúng Voucher Giảm 50K (Mã: MSWHEEL50K)! Đã thêm vào Kho Voucher." },
        { type: "points", amount: 100, msg: "Bạn nhận được +100 Điểm Thưởng VIP vào tài khoản!" },
        { type: "voucher", label: "Voucher Miễn Phí Vận Chuyển 30.000đ", discount: 30000, code: "MSFREESHIP30K", msg: "Chúc mừng! Bạn nhận Mã Miễn Phí Vận Chuyển 30K! Đã thêm vào Kho Voucher." },
        { type: "points", amount: 50, msg: "Chúc mừng! Bạn nhận được +50 Điểm Thưởng VIP!" },
        { type: "voucher", label: "Mã Độc Quyền Giảm 10% đơn hàng", discount: 50000, code: "MSVIP10PERCENT", msg: "Bạn nhận Mã Độc Quyền Giảm 10% đơn hàng (Mã: MSVIP10PERCENT)! Đã thêm vào Kho Voucher." },
        { type: "none", msg: "Chúc bạn may mắn lần sau!" },
      ];

      const chosen = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResultMsg(chosen.msg);

      if (chosen.type === "voucher" && onAddVoucher) {
        onAddVoucher(chosen.label!, chosen.discount!, chosen.code!);
      } else if (chosen.type === "points" && onAddPoints) {
        onAddPoints("Vòng Quay May Mắn VIP", chosen.amount!);
      }
    }, 4000);
  };

  return (
    <div>
      <div
        style={{
          background: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
          borderRadius: "20px",
          padding: "28px",
          color: "#ffffff",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 10px 25px -5px rgba(46, 125, 50, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "18px",
              background: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              color: "#fef08a",
            }}
          >
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, letterSpacing: "-0.02em" }}>
                {userPoints.toLocaleString("vi-VN")} Điểm Thưởng
              </h2>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  fontSize: "11.5px",
                  fontWeight: 800,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                Hạng VIP Thân Thiết
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "13.5px", opacity: 0.9, fontWeight: 500 }}>
              Tích điểm không giới hạn khi mua sắm & đổi các voucher giá trị lớn
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={() => setRewardSubTab("wheel")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "#ffffff",
              color: "#166534",
              border: "none",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
          >
            <i className="fa-solid fa-dharmachakra"></i> Vòng Quay May Mắn
          </button>
          <button
            type="button"
            onClick={() => setRewardSubTab("tasks")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.3)",
              fontWeight: 800,
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease",
            }}
          >
            <i className="fa-solid fa-list-check"></i> Nhiệm Vụ Tích Điểm
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "24px",
          overflowX: "auto",
          paddingBottom: "4px",
        }}
      >
        {[
          { key: "catalog", label: "Đổi Quà Tặng", icon: "fa-solid fa-gift" },
          { key: "myvouchers", label: `Kho Voucher Của Tôi (${userVouchers.length})`, icon: "fa-solid fa-ticket" },
          { key: "tasks", label: "Nhiệm Vụ Nhận Điểm", icon: "fa-solid fa-list-check" },
          { key: "wheel", label: "Vòng Quay May Mắn", icon: "fa-solid fa-dharmachakra" },
          { key: "tiers", label: "Quyền Lợi Hạng VIP", icon: "fa-solid fa-crown" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setRewardSubTab(tab.key as any)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px 10px 0 0",
              border: "none",
              background: rewardSubTab === tab.key ? "var(--primary-color, #2e7d32)" : "transparent",
              color: rewardSubTab === tab.key ? "#ffffff" : "#64748b",
              fontWeight: 800,
              fontSize: "13.5px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
              whiteSpace: "nowrap",
            }}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {rewardSubTab === "catalog" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {GIFTS_CATALOG.map((gift) => {
            const canAfford = userPoints >= gift.points;
            return (
              <div
                key={gift.id}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: "#dcfce7",
                        color: "#166534",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fa-solid fa-ticket text-emerald-700"></i>
                    </div>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "999px",
                        background: canAfford ? "#dcfce7" : "#f1f5f9",
                        color: canAfford ? "#166534" : "#94a3b8",
                        fontSize: "12px",
                        fontWeight: 800,
                      }}
                    >
                      <i className="fa-solid fa-coins mr-1"></i> {gift.points} Điểm
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", fontWeight: 800, color: "#0f172a", lineHeight: 1.4 }}>
                    {gift.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
                    Mã ưu đãi: <strong style={{ color: "#0f172a" }}>{gift.code}</strong>
                  </p>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(gift.name, gift.points, gift.discount, gift.code)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: canAfford ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
                      color: canAfford ? "#ffffff" : "#94a3b8",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "13px",
                      cursor: canAfford ? "pointer" : "not-allowed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <i className="fa-solid fa-gift"></i> {canAfford ? "Đổi Quà Ngay" : `Cần Thêm ${gift.points - userPoints} Điểm`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rewardSubTab === "myvouchers" && (
        <div>
          {userVouchers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", background: "#f8fafc", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
              <i className="fa-solid fa-ticket" style={{ fontSize: "36px", color: "#94a3b8", marginBottom: "12px", display: "block" }}></i>
              <h4 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 800, color: "#334155" }}>
                Kho voucher của bạn đang trống
              </h4>
              <p style={{ margin: "0 0 16px 0", fontSize: "13px", color: "#64748b" }}>
                Hãy tích điểm từ các đơn hàng hoặc hoàn thành nhiệm vụ để đổi các mã giảm giá hấp dẫn!
              </p>
              <button
                type="button"
                onClick={() => setRewardSubTab("catalog")}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Khám phá kho quà tặng
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
              {userVouchers.map((v, idx) => {
                const qty = v.quantity || 1;
                const totalDiscount = (v.discount || 0) * qty;
                return (
                  <div
                    key={idx}
                    style={{
                      background: "#ffffff",
                      border: "1.5px solid #dcfce7",
                      borderRadius: "16px",
                      padding: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "14px",
                      boxShadow: "0 4px 12px rgba(22, 101, 52, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "42px",
                          height: "42px",
                          borderRadius: "10px",
                          background: "#dcfce7",
                          color: "#166534",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        <i className="fa-solid fa-ticket"></i>
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                          <span style={{ fontSize: "14.5px", fontWeight: 900, color: "#166534", letterSpacing: "0.02em" }}>
                            {v.code}
                          </span>
                          {qty > 1 && (
                            <span
                              style={{
                                background: "#fef3c7",
                                border: "1px solid #fde68a",
                                color: "#b45309",
                                fontSize: "11px",
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: "999px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                              }}
                            >
                              <i className="fa-solid fa-star text-amber-500"></i> Số lượng: x{qty}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                          {v.label || "Voucher giảm giá"}
                        </p>
                        <div style={{ marginTop: "4px", fontSize: "12px", color: "#16a34a", fontWeight: 700 }}>
                          Giảm {totalDiscount > 0 ? totalDiscount.toLocaleString("vi-VN") + "đ" : "Ưu đãi trực tiếp"}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(v.code);
                        showToast(`Đã sao chép mã [${v.code}] vào bộ nhớ tạm!`, "success");
                      }}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        background: "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "12px",
                        fontWeight: 800,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0,
                      }}
                    >
                      <i className="fa-regular fa-copy"></i> Dùng mã
                    </button>
                  </div>
                );
              })}
            </div>

          )}
        </div>
      )}

      {/* SUBTAB 3: NHIỆM VỤ NHẬN ĐIỂM */}
      {rewardSubTab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Đăng nhập hàng ngày</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>+10 điểm thưởng mỗi ngày đăng nhập ghé thăm trang web (1 lần/ngày)</p>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "6px 14px", borderRadius: "999px", border: "1px solid #bbf7d0" }}>
              ✓ Đã nhận
            </span>
          </div>

          <div style={{ border: "1px solid #e2e8f0", borderRadius: "14px", padding: "16px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Chia sẻ lên Facebook / Zalo</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>+50 điểm thưởng khi chia sẻ trang web (1 lần/ngày, reset 00:00)</p>
            </div>
            <div>
              {hasCompletedShareToday ? (
                <span style={{ fontSize: "12px", fontWeight: 800, color: "#166534", background: "#dcfce7", padding: "6px 14px", borderRadius: "999px", border: "1px solid #bbf7d0" }}>
                  ✓ Đã nhận hôm nay
                </span>
              ) : isClaimReady ? (
                <button
                  type="button"
                  onClick={handleClaimReward}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "999px",
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#fff",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.35)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    animation: "pulse 2s infinite"
                  }}
                >
                  <Sparkles className="w-4 h-4" /> Nhận +50 Điểm Thưởng
                </button>
              ) : isVerifyingShare ? (
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#d97706", background: "#fef3c7", padding: "6px 14px", borderRadius: "999px", border: "1px solid #fde68a" }}>
                  ⏳ Đang xác minh chia sẻ...
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "999px",
                    background: "#2e7d32",
                    color: "#fff",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: "0 2px 8px rgba(46, 125, 50, 0.2)"
                  }}
                >
                  Thực hiện
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: VÒNG QUAY MAY MẮN */}
      {rewardSubTab === "wheel" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 900, marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <Disc className="w-5 h-5 text-red-600" /> VÒNG QUAY MAY MẮN TRÚNG VOUCHER & ĐIỂM THƯỞNG
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
            Mỗi ngày khách hàng có 1 lượt quay miễn phí để săn quà tặng hấp dẫn!
          </p>

          <div style={{ position: "relative", width: "220px", height: "220px", margin: "0 auto 20px" }}>
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "8px solid #dc2626",
                background: "conic-gradient(#ef4444 0deg 60deg, #f59e0b 60deg 120deg, #10b981 120deg 180deg, #06b6d4 180deg 240deg, #8b5cf6 240deg 300deg, #ec4899 300deg 360deg)",
                transform: `rotate(${spinDeg}deg)`,
                transition: isSpinning ? "transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)" : "none",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "64px",
                height: "64px",
                background: "#fff",
                borderRadius: "50%",
                border: "4px solid #dc2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "12px",
                color: "#dc2626",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              START
            </div>
          </div>

          <button
            type="button"
            onClick={handleSpinWheel}
            disabled={isSpinning || hasSpunWheelToday}
            style={{
              padding: "12px 28px",
              background: (isSpinning || hasSpunWheelToday) ? "#cbd5e1" : "linear-gradient(135deg, #dc2626, #ef4444)",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              fontSize: "15px",
              fontWeight: 900,
              cursor: (isSpinning || hasSpunWheelToday) ? "not-allowed" : "pointer",
              boxShadow: (isSpinning || hasSpunWheelToday) ? "none" : "0 6px 16px rgba(220, 38, 38, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            {hasSpunWheelToday ? "Đã Quay Hôm Nay (Reset 00:00)" : isSpinning ? "Đang quay may mắn..." : <><Disc className="w-5 h-5" /> QUAY VÒNG MAY MẮN</>}
          </button>

          {spinResultMsg && (
            <div style={{ marginTop: "16px", padding: "12px", background: "#dcfce7", color: "#15803d", borderRadius: "8px", fontWeight: 800, fontSize: "14px" }}>
              {spinResultMsg}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: LỊCH SỬ ĐỔI ĐIỂM */}
      {rewardSubTab === "history" && (
        <div>
          {userHistory.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
              Chưa có lịch sử đổi điểm thưởng nào.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {userHistory.map((h: any, idx: number) => {
                const pts = h.pointsSpent !== undefined ? h.pointsSpent : h.points;
                const isEarn = pts < 0; // Negative pointsSpent means points were added to balance
                const displayPts = Math.abs(pts);

                return (
                  <div key={idx} style={{ padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: "13.5px", fontWeight: 800, color: "#0f172a" }}>{h.giftName || h.title}</div>
                      <div style={{ fontSize: "11.5px", color: "#94a3b8", marginTop: "2px" }}>{h.date}</div>
                    </div>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: isEarn ? "#16a34a" : "#dc2626", background: isEarn ? "#f0fdf4" : "#fef2f2", padding: "4px 10px", borderRadius: "999px", border: `1px solid ${isEarn ? "#bbf7d0" : "#fecaca"}` }}>
                      {isEarn ? `+${displayPts} PTS` : `-${displayPts} PTS`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 6: QUY TẮC THĂNG HẠNG THÀNH VIÊN */}
      {rewardSubTab === "tiers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px 20px" }}>
            <h4 style={{ fontSize: "16px", fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: "8px" }}>
              <Crown className="w-5 h-5 text-amber-500" /> Bảng Quy Tắc Thăng Hạng Thành Viên MINI SHOP
            </h4>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
              Hạng thành viên được hệ thống tự động xét duyệt dựa trên tổng chi tiêu thanh toán thành công của bạn.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
            {/* Tier 1: Thành viên */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "16px", padding: "18px", background: "#ffffff", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#f1f5f9", color: "#64748b", fontSize: "12px", fontWeight: 800 }}>
                  Thành viên
                </span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>Dưới 2.000.000đ</span>
              </div>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "18px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                <li>Tặng ngay <strong>500 điểm</strong> khi đăng ký</li>
                <li>Tặng <strong>Voucher WELCOME50</strong> giảm 50K</li>
                <li>Tích lũy điểm khi hoàn thành nhiệm vụ</li>
              </ul>
            </div>

            {/* Tier 2: Thành viên Đồng */}
            <div style={{ border: "1px solid #fed7aa", borderRadius: "16px", padding: "18px", background: "#fffaf5", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#ffedd5", color: "#9a3412", fontSize: "12px", fontWeight: 800 }}>
                  Thành viên Đồng
                </span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#c2410c" }}>Từ 2.000.000đ</span>
              </div>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "18px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                <li>Tích lũy <strong>1%</strong> giá trị đơn hàng thành điểm</li>
                <li>Tặng voucher sinh nhật trị giá <strong>50.000đ</strong></li>
                <li>Mở khóa quyền đổi quà VIP</li>
              </ul>
            </div>

            {/* Tier 3: Thành viên Bạc */}
            <div style={{ border: "1px solid #cbd5e1", borderRadius: "16px", padding: "18px", background: "#ffffff", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#f1f5f9", color: "#334155", fontSize: "12px", fontWeight: 800 }}>
                  Thành viên Bạc
                </span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#334155" }}>Từ 5.000.000đ</span>
              </div>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "18px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                <li>Tích lũy <strong>2%</strong> giá trị đơn hàng thành điểm</li>
                <li>Miễn phí vận chuyển <strong>2 lần/tháng</strong></li>
                <li>Tặng voucher sinh nhật trị giá <strong>100.000đ</strong></li>
              </ul>
            </div>

            {/* Tier 4: Thành viên Vàng */}
            <div style={{ border: "1px solid #fde047", borderRadius: "16px", padding: "18px", background: "#fefce8", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#fef9c3", color: "#854d0e", fontSize: "12px", fontWeight: 800 }}>
                  Thành viên Vàng
                </span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#854d0e" }}>Từ 10.000.000đ</span>
              </div>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "18px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                <li>Tích lũy <strong>3%</strong> giá trị đơn hàng thành điểm</li>
                <li>Miễn phí vận chuyển <strong>4 lần/tháng</strong></li>
                <li>Ưu tiên chuẩn bị và giao hàng hỏa tốc</li>
                <li>Hỗ trợ CSKH VIP 24/7</li>
              </ul>
            </div>

            {/* Tier 5: Thành viên Kim Cương */}
            <div style={{ border: "1px solid #7dd3fc", borderRadius: "16px", padding: "18px", background: "#f0f9ff", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ padding: "4px 10px", borderRadius: "999px", background: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: 800 }}>
                  Thành viên Kim Cương
                </span>
                <span style={{ fontSize: "13px", fontWeight: 800, color: "#0369a1" }}>Từ 20.000.000đ</span>
              </div>
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "18px", fontSize: "13px", color: "#475569", lineHeight: "1.6" }}>
                <li>Tích lũy <strong>5%</strong> giá trị đơn hàng thành điểm</li>
                <li><strong>Miễn phí vận chuyển không giới hạn</strong></li>
                <li>Tặng Voucher độc quyền <strong>500.000đ</strong> mỗi quý</li>
                <li>Đặc quyền trải nghiệm sản phẩm mới đầu tiên</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỌN NỀN TẢNG CHIA SẺ */}
      {showShareModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#ffffff", borderRadius: "20px", width: "100%", maxWidth: "440px", padding: "24px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowShareModal(false)}
              style={{ position: "absolute", top: "16px", right: "16px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "16px", color: "#64748b" }}
            >
              ✕
            </button>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              Nhiệm Vụ: Chia Sẻ Nhận Điểm
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 20px 0", lineHeight: 1.5 }}>
              Chọn nền tảng bạn muốn chia sẻ bài viết Mini Shop. Sau khi hoàn thành đăng bài, hệ thống sẽ mở nút nhận <strong>+50 Điểm Thưởng VIP</strong>!
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button
                type="button"
                onClick={() => handleExecuteShare("facebook")}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "#1877f2",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(24, 119, 242, 0.25)"
                }}
              >
                <i className="fa-brands fa-facebook-f" style={{ fontSize: "16px" }}></i>
                Chia sẻ lên Facebook
              </button>

              <button
                type="button"
                onClick={() => handleExecuteShare("zalo")}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "#0068ff",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  boxShadow: "0 4px 12px rgba(0, 104, 255, 0.25)"
                }}
              >
                <i className="fa-solid fa-comment-dots" style={{ fontSize: "16px" }}></i>
                Chia sẻ qua Zalo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
