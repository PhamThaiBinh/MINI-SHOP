"use client";

import React, { useState } from "react";
import { UserProfile } from "@/context/AuthContext";
import { Sparkles, Ticket, Gift, Truck, Sofa, Disc, Check, Copy } from "lucide-react";

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
  const [rewardSubTab, setRewardSubTab] = useState<"catalog" | "myvouchers" | "history" | "tasks" | "wheel">("catalog");
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
      alert(`Bạn cần tối thiểu ${pointsRequired} điểm để đổi quà tặng này!`);
      return;
    }
    const success = onRedeemGift(giftName, pointsRequired, discount, code);
    if (success) {
      alert(`Chúc mừng bạn đã đổi thành công "${giftName}"! Mã voucher [${code}] đã được thêm vào Kho Voucher của bạn.`);
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
    alert("🎉 Chúc mừng bạn đã hoàn thành nhiệm vụ và nhận thành công +50 Điểm Thưởng VIP!");
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
      if (typeof window !== "undefined") {
        localStorage.setItem(wheelStorageKey, "completed");
      }
      setHasSpunWheelToday(true);

      const rewards = [
        { type: "voucher", label: "Voucher Giảm 50.000đ", discount: 50000, code: "MSWHEEL50K", msg: "🎉 Chúc mừng! Bạn trúng Voucher Giảm 50K (Mã: MSWHEEL50K)! Đã thêm vào Kho Voucher." },
        { type: "points", amount: 100, msg: "🎉 Bạn nhận được +100 Điểm Thưởng VIP vào tài khoản!" },
        { type: "voucher", label: "Voucher Miễn Phí Vận Chuyển 30.000đ", discount: 30000, code: "MSFREESHIP30K", msg: "🎉 Chúc mừng! Bạn nhận Mã Miễn Phí Vận Chuyển 30K! Đã thêm vào Kho Voucher." },
        { type: "points", amount: 50, msg: "🎉 Chúc mừng! Bạn nhận được +50 Điểm Thưởng VIP!" },
        { type: "voucher", label: "Mã Độc Quyền Giảm 10% đơn hàng", discount: 50000, code: "MSVIP10PERCENT", msg: "🎉 Bạn nhận Mã Độc Quyền Giảm 10% đơn hàng (Mã: MSVIP10PERCENT)! Đã thêm vào Kho Voucher." },
        { type: "none", msg: "😊 Chúc bạn may mắn lần sau!" },
      ];

      const chosen = rewards[Math.floor(Math.random() * rewards.length)];
      setSpinResultMsg(chosen.msg);

      if (chosen.type === "voucher" && onAddVoucher) {
        onAddVoucher(chosen.label!, chosen.discount!, chosen.code!);
      } else if (chosen.type === "points" && onAddPoints) {
        onAddPoints("Trúng thưởng Vòng Quay May Mắn", chosen.amount!);
      }
    }, 3500);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
          <Sparkles className="w-5 h-5 text-emerald-700" /> Quản Lý Điểm Thưởng VIP & Đổi Quà
        </h3>
        <div style={{ background: "#e8f5e9", border: "1px solid #bbf7d0", padding: "6px 14px", borderRadius: "999px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", fontSize: "13px" }}>
          Điểm khả dụng: {userPoints.toLocaleString("vi-VN")} PTS
        </div>
      </div>

      {/* Sub tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        {[
          { id: "catalog", label: "Catalog Đổi Quà" },
          { id: "myvouchers", label: `Kho Voucher Của Tôi (${userVouchers.length})` },
          { id: "tasks", label: "Nhiệm Vụ Nhận Điểm" },
          { id: "wheel", label: "Vòng Quay May Mắn" },
          { id: "history", label: "Lịch Sử Đổi Điểm" },
        ].map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setRewardSubTab(sub.id as any)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              background: rewardSubTab === sub.id ? "var(--primary-color, #2e7d32)" : "#f1f5f9",
              color: rewardSubTab === sub.id ? "#ffffff" : "#475569",
              fontSize: "12.5px",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* SUBTAB 1: CATALOG ĐỔI QUÀ */}
      {rewardSubTab === "catalog" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {GIFTS_CATALOG.map((g) => (
            <div
              key={g.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "14px",
                background: "#ffffff",
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Gift className="w-6 h-6 text-emerald-700" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ fontSize: "13.5px", fontWeight: 800, margin: "0 0 4px 0", color: "#0f172a" }}>{g.name}</h4>
                <div style={{ fontSize: "12px", color: "var(--primary-color, #2e7d32)", fontWeight: 800 }}>
                  Yêu cầu: {g.points} PTS
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRedeem(g.name, g.points, g.discount, g.code)}
                disabled={userPoints < g.points}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: userPoints >= g.points ? "var(--primary-color, #2e7d32)" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 800,
                  cursor: userPoints >= g.points ? "pointer" : "not-allowed",
                  whiteSpace: "nowrap",
                }}
              >
                Đổi Ngay
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 2: KHO VOUCHER CỦA TÔI */}
      {rewardSubTab === "myvouchers" && (
        <div>
          {userVouchers.length === 0 ? (
            <p style={{ fontSize: "13px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
              Bạn chưa có mã giảm giá nào. Hãy đổi điểm thưởng để nhận voucher!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {userVouchers.map((v, idx) => (
                <div
                  key={idx}
                  style={{
                    border: "1px dashed var(--primary-color, #2e7d32)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    background: "#f0fdf4",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>{v.label}</div>
                    <div style={{ fontSize: "12px", color: "var(--primary-color, #2e7d32)", fontWeight: 800, marginTop: "2px" }}>
                      Mã: <code>{v.code}</code>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(v.code);
                      alert(`Đã sao chép mã [${v.code}] vào bộ nhớ tạm!`);
                    }}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "12px",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Sao chép
                  </button>
                </div>
              ))}
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
