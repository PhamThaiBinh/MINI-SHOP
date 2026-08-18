"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "@/styles/auth.css";
import { useAuth } from "@/context/AuthContext";
import { LOCATION_DATA, PROVINCES_LIST } from "@/data/locationData";
import { fetchProvincesApi, fetchWardsForProvinceApi } from "@/lib/locationApi";
import { fixImagePath } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { getAllOrders, getOrdersForUser, cancelOrderWithReason, UnifiedOrder } from "@/utils/orderStorage";
import {
  fetchUserAddressesFromSupabase,
  addUserAddressToSupabase,
  setDefaultUserAddressInSupabase,
  deleteUserAddressFromSupabase,
} from "@/lib/supabaseAddress";
import {
  fetchUserRewardsFromSupabase,
  syncUserRewardsToSupabase,
} from "@/lib/supabaseUserFeatures";

interface AddressItem {
  id: number;
  name: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

interface SearchableDropdownProps {
  label: string;
  value: string;
  options: string[];
  placeholderSearch: string;
  onSelect: (val: string) => void;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  value,
  options,
  placeholderSearch,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ marginBottom: "12px", position: "relative" }}>
      <label className="auth-label">{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="form-control auth-input"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          background: "#fff",
          userSelect: "none",
        }}
      >
        <span style={{ fontWeight: 600, color: value ? "var(--text-main)" : "var(--text-muted)" }}>
          {value || "Vui lòng chọn..."}
        </span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 999,
            background: "#fff",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            marginTop: "4px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "8px", background: "#f8fafc", borderBottom: "1px solid var(--border-color)" }}>
            <input
              type="text"
              autoFocus
              className="form-control auth-input"
              style={{ fontSize: "13px", height: "36px", margin: 0 }}
              placeholder={placeholderSearch}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt}
                  onClick={() => {
                    onSelect(opt);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    padding: "8px 12px",
                    fontSize: "13px",
                    cursor: "pointer",
                    background: opt === value ? "#e8f5e9" : "#fff",
                    fontWeight: opt === value ? 700 : 400,
                    color: opt === value ? "var(--primary-color)" : "var(--text-main)",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                  onMouseEnter={(e) => {
                    if (opt !== value) e.currentTarget.style.background = "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    if (opt !== value) e.currentTarget.style.background = "#fff";
                  }}
                >
                  {opt}
                </div>
              ))
            ) : (
              <div style={{ padding: "12px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                Không tìm thấy kết quả phù hợp
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CustomerOrder {
  id: string;
  date: string;
  status: "completed" | "shipping" | "processing";
  statusText: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: string;
  items: {
    name: string;
    image: string;
    qty: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
}

const PROVINCES_34 = [
  "TP. Hồ Chí Minh",
  "TP. Hà Nội",
  "TP. Đà Nẵng",
  "TP. Hải Phòng",
  "TP. Cần Thơ",
  "TP. Thủ Đức (TP. Hồ Chí Minh)",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bạc Liêu",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Định",
  "Bình Dương",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Tĩnh",
  "Hải Dương",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const WARDS_2026 = [
  "Phường Bến Thành (Quận 1, TP.HCM)",
  "Phường Tân Định (Quận 1, TP.HCM)",
  "Phường Phạm Ngũ Lão (Quận 1, TP.HCM)",
  "Phường Võ Thị Sáu (Quận 3, TP.HCM)",
  "Phường An Khánh (TP. Thủ Đức, TP.HCM)",
  "Phường Thảo Điền (TP. Thủ Đức, TP.HCM)",
  "Phường Hàng Bạc (Q. Hoàn Kiếm, Hà Nội)",
  "Phường Tràng Tiền (Q. Hoàn Kiếm, Hà Nội)",
  "Phường Quán Thánh (Q. Ba Đình, Hà Nội)",
  "Phường Hải Châu 1 (Q. Hải Châu, Đà Nẵng)",
  "Phường Minh Khai (Q. Hồng Bàng, Hải Phòng)",
  "Phường Tân An (Q. Ninh Kiều, Cần Thơ)",
  "Xã Bình Chánh (H. Bình Chánh, TP.HCM)",
  "Xã Hóc Môn (H. Hóc Môn, TP.HCM)",
  "Xã Củ Chi (H. Củ Chi, TP.HCM)",
];

const MOCK_ORDERS: CustomerOrder[] = [
  {
    id: "#MS-9824",
    date: "12/08/2026",
    status: "shipping",
    statusText: "🚚 Đang giao hàng",
    recipientName: "Bình Nguyễn",
    recipientPhone: "0988.123.456",
    address: "123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    paymentMethod: "COD (Thanh toán khi nhận hàng)",
    items: [
      {
        name: "Sofa Vải Hiện Đại Nordic",
        image: "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
        qty: 1,
        price: 2990000,
      },
      {
        name: "Đèn Thả Trần Decor",
        image: "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
        qty: 1,
        price: 599000,
      },
    ],
    subtotal: 3589000,
    discount: 50000,
    total: 3539000,
  },
  {
    id: "#MS-7102",
    date: "01/08/2026",
    status: "completed",
    statusText: "✅ Đã hoàn thành",
    recipientName: "Bình Nguyễn",
    recipientPhone: "0988.123.456",
    address: "123 Đường Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh",
    paymentMethod: "Chuyển khoản VietQR",
    items: [
      {
        name: "Bàn Ăn Gỗ Sồi Tự Nhiên",
        image: "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
        qty: 1,
        price: 3490000,
      },
    ],
    subtotal: 3490000,
    discount: 0,
    total: 3490000,
  },
];

export default function AuthPage() {
  const router = useRouter();
  const { user, signUp, signIn, logout, redeemGift, addPointsAndHistory } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user && user.role === "admin") {
      router.push("/admin");
    }
  }, [user, router]);

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Dashboard Subtabs
  const [dashboardTab, setDashboardTab] = useState<
    "profile" | "rewards" | "orders" | "address"
  >("profile");

  const [rewardSubTab, setRewardSubTab] = useState<
    "tiers" | "tasks" | "wheel" | "catalog" | "manage" | "history"
  >("tiers");

  const getVnTodayStr = () => {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  };

  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  // 3-Stage Task States: "not_started" | "performed" | "claimed"
  const [shareTaskStatus, setShareTaskStatus] = useState<"not_started" | "performed" | "claimed">("not_started");
  const [reviewTaskStatus, setReviewTaskStatus] = useState<"not_started" | "performed" | "claimed">("not_started");

  // Task Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const [hasSpunWheelToday, setHasSpunWheelToday] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinDeg, setSpinDeg] = useState(0);
  const [spinResultMsg, setSpinResultMsg] = useState("");
  const [redeemFeedback, setRedeemFeedback] = useState("");
  const [liveOrders, setLiveOrders] = useState<UnifiedOrder[]>([]);

  // OpenAdminData API location state
  const [provincesList, setProvincesList] = useState<string[]>(PROVINCES_LIST);
  const [wardsList, setWardsList] = useState<string[]>([]);

  useEffect(() => {
    async function initLocations() {
      const provs = await fetchProvincesApi();
      setProvincesList(provs);
      const firstProv = provs[0] || "Thành phố Hồ Chí Minh";
      setAddrProvince(firstProv);
      const wards = await fetchWardsForProvinceApi(firstProv);
      setWardsList(wards);
      if (wards.length > 0) setAddrWard(wards[0]);
    }
    initLocations();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    const updateOrders = () => {
      const userOrds = getOrdersForUser(user?.username || user?.phone || "binh");
      setLiveOrders(userOrds.length > 0 ? userOrds : getAllOrders());
    };
    updateOrders();
    window.addEventListener("ordersUpdated", updateOrders);

    const channel = supabase
      .channel("orders_realtime_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          updateOrders();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener("ordersUpdated", updateOrders);
      supabase.removeChannel(channel);
    };
  }, [user]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const todayStr = getVnTodayStr();
      setHasCheckedIn(localStorage.getItem("minishop_task_checkin") === todayStr);

      const shareClaimed = localStorage.getItem("minishop_task_share_claimed") === todayStr;
      const sharePerformed = localStorage.getItem("minishop_task_share_performed") === todayStr;
      setShareTaskStatus(shareClaimed ? "claimed" : sharePerformed ? "performed" : "not_started");

      const reviewClaimed = localStorage.getItem("minishop_task_review_claimed") === todayStr;
      const reviewPerformed = localStorage.getItem("minishop_task_review_performed") === todayStr;
      setReviewTaskStatus(reviewClaimed ? "claimed" : reviewPerformed ? "performed" : "not_started");

      setHasSpunWheelToday(localStorage.getItem("minishop_wheel_spin") === todayStr);
    }
  }, []);

  const handleCheckIn = async () => {
    const todayStr = getVnTodayStr();
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    localStorage.setItem("minishop_task_checkin", todayStr);
    addPointsAndHistory("Điểm danh hàng ngày", 50, "CHECKIN");
  };

  const handlePerformShare = () => {
    const todayStr = getVnTodayStr();
    setShowShareModal(true);
    setShareTaskStatus("performed");
    localStorage.setItem("minishop_task_share_performed", todayStr);
  };

  const handleClaimShare = () => {
    const todayStr = getVnTodayStr();
    setShareTaskStatus("claimed");
    localStorage.setItem("minishop_task_share_claimed", todayStr);
    addPointsAndHistory("Chia sẻ Mini Shop lên MXH", 100, "SHARE");
  };

  const handlePerformReview = () => {
    const todayStr = getVnTodayStr();
    setShowReviewModal(true);
    setReviewTaskStatus("performed");
    localStorage.setItem("minishop_task_review_performed", todayStr);
  };

  const handleClaimReview = () => {
    const todayStr = getVnTodayStr();
    setReviewTaskStatus("claimed");
    localStorage.setItem("minishop_task_review_claimed", todayStr);
    addPointsAndHistory("Đánh giá sản phẩm đã mua", 80, "REVIEW");
  };

  const handleSpinWheel = () => {
    const todayStr = getVnTodayStr();
    if (isSpinning || hasSpunWheelToday) return;
    setIsSpinning(true);
    setSpinResultMsg("");

    const extraRounds = 5 * 360;
    const randomAngle = Math.floor(Math.random() * 360);
    const newDeg = spinDeg + extraRounds + randomAngle;
    setSpinDeg(newDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setHasSpunWheelToday(true);
      localStorage.setItem("minishop_wheel_spin", todayStr);

      let pts = 50;
      if (randomAngle % 3 === 0) pts = 100;
      else if (randomAngle % 2 === 0) pts = 150;

      addPointsAndHistory("Vòng quay may mắn", pts, "WHEEL");
      setSpinResultMsg(`🎉 Chúc mừng! Bạn quay trúng +${pts} Điểm Thưởng! (Đã cộng vào Lịch sử)`);
    }, 3500);
  };

  // Orders State & Modal
  const [selectedOrder, setSelectedOrder] = useState<UnifiedOrder | null>(
    null
  );
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelTargetOrder, setCancelTargetOrder] = useState<UnifiedOrder | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState("📍 Thay đổi địa chỉ / Số điện thoại nhận hàng");
  const [cancelReasonCustom, setCancelReasonCustom] = useState("");

  const CANCELLATION_REASONS = [
    "📍 Thay đổi địa chỉ / Số điện thoại nhận hàng",
    "🛒 Muốn đổi / thêm bớt sản phẩm trong đơn hàng",
    "🎟️ Quên áp dụng mã giảm giá / Voucher ưu đãi",
    "⏱️ Thời gian giao hàng không phù hợp",
    "💵 Tìm được sản phẩm khác giá tốt hơn",
    "❓ Lý do khác (Cho phép nhập ghi chú bên dưới)",
  ];

  const handleConfirmCancelOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelTargetOrder) return;
    const finalReason = cancelReasonPreset.includes("Lý do khác")
      ? cancelReasonCustom.trim() || "Lý do cá nhân"
      : cancelReasonPreset;

    cancelOrderWithReason(cancelTargetOrder.id, finalReason);
    setShowCancelModal(false);
    setCancelTargetOrder(null);
    setCancelReasonCustom("");

    const userOrds = getOrdersForUser(user?.username || user?.phone || "binh");
    setLiveOrders(userOrds.length > 0 ? userOrds : getAllOrders());
  };

  const [addresses, setAddresses] = useState<AddressItem[]>([]);

  const loadAddresses = async () => {
    if (user) {
      const data = await fetchUserAddressesFromSupabase(user.username || user.email || "binh");
      setAddresses(data);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const initialProvince = PROVINCES_LIST[0] || "Thành phố Hồ Chí Minh";
  const [addrProvince, setAddrProvince] = useState(initialProvince);
  const [addrWard, setAddrWard] = useState((LOCATION_DATA[initialProvince] || [])[0] || "");
  const [addrDetail, setAddrDetail] = useState("");
  const [addrSetDefault, setAddrSetDefault] = useState(false);

  const handleSelectProvince = (selected: string) => {
    setAddrProvince(selected);
    const wards = LOCATION_DATA[selected] || [];
    setAddrWard(wards[0] || "");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsSubmitting(true);

    const res = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setAuthError(`⚠️ Đăng nhập thất bại: ${res.error || "Sai email hoặc mật khẩu!"}`);
    } else {
      setAuthSuccess("✅ Đăng nhập thành công!");
      setTimeout(() => {
        if (loginEmail.trim().toLowerCase().includes("admin")) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }, 500);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (!regEmail || !regPassword || !regName) {
      setAuthError("⚠️ Vui lòng điền đầy đủ Tên, Email và Mật khẩu!");
      return;
    }

    if (regPassword.length < 6) {
      setAuthError("⚠️ Mật khẩu phải có tối thiểu 6 ký tự!");
      return;
    }

    setIsSubmitting(true);
    const res = await signUp(regEmail, regPassword, regName);
    setIsSubmitting(false);

    if (!res.success) {
      setAuthError(`⚠️ Đăng ký thất bại: ${res.error}`);
    } else {
      setAuthSuccess("✅ Đăng ký tài khoản Supabase thành công! Hệ thống đang tự động đăng nhập...");
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
  };

  const handleLogoutClick = async () => {
    await logout();
    router.push("/auth");
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setRedeemFeedback("✅ Cập nhật hồ sơ thành công!");
    setTimeout(() => setRedeemFeedback(""), 3000);
  };

  const GIFTS_CATALOG = [
    {
      id: 1,
      name: "Voucher Giảm 50.000đ",
      points: 100,
      discount: 50000,
      code: "MINISHOP50",
      icon: "🎟️",
    },
    {
      id: 2,
      name: "Voucher Giảm 100.000đ",
      points: 200,
      discount: 100000,
      code: "MINISHOP100",
      icon: "🎁",
    },
    {
      id: 3,
      name: "Voucher Freeship 30.000đ",
      points: 50,
      discount: 30000,
      code: "FREESHIP30",
      icon: "🚚",
    },
    {
      id: 4,
      name: "Gối Ôm Sofa Cao Cấp",
      points: 500,
      discount: 150000,
      code: "GOISOFAPREMIUM",
      icon: "🛋️",
    },
  ];

  const handleRedeemGiftClick = (gift: typeof GIFTS_CATALOG[0]) => {
    const success = redeemGift(
      gift.name,
      gift.points,
      gift.discount,
      gift.code
    );
    if (success) {
      setRewardSubTab("manage");
    }
  };

  // Address Handlers
  const handleSetDefaultAddress = async (id: number) => {
    if (!user) return;
    await setDefaultUserAddressInSupabase(id, user.username || user.email || "binh");
    await loadAddresses();
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm("⚠️ Bạn có chắc chắn muốn xóa địa chỉ này không?")) {
      await deleteUserAddressFromSupabase(id);
      await loadAddresses();
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName.trim() || !addrPhone.trim() || !addrDetail.trim() || !user) return;

    const cleanPhone = addrPhone.trim().replace(/\s+/g, "").replace(/\./g, "");
    const isValidVnPhone = /^(03|05|07|08|09)\d{8}$/.test(cleanPhone);
    if (!isValidVnPhone) {
      alert("⚠️ Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại Việt Nam chuẩn 10 chữ số (đầu 03, 05, 07, 08, 09).");
      return;
    }

    const shouldDefault = addresses.length === 0 || addrSetDefault;

    await addUserAddressToSupabase(
      {
        name: addrName.trim(),
        phone: addrPhone.trim(),
        province: addrProvince,
        ward: addrWard,
        detail: addrDetail.trim(),
        isDefault: shouldDefault,
      },
      user.username || user.email || "binh"
    );

    await loadAddresses();
    setShowAddAddressModal(false);
    setAddrName("");
    setAddrPhone("");
    setAddrDetail("");
    setAddrSetDefault(false);
  };

  const totalVouchersCount =
    user?.vouchers.reduce((sum, v) => sum + (v.quantity || 1), 0) || 0;

  return (
    <main className="main-content">
      <div className="container">
        <div className="auth-page-section">
          {!user ? (
            /* KHI CHƯA ĐĂNG NHẬP */
            <div
              className="auth-card"
              id="auth-guest-card"
              style={{ maxWidth: "560px" }}
            >
              <div className="auth-tabs">
                <button
                  className={`auth-tab-btn ${
                    activeTab === "login" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Đăng Nhập
                </button>
                <button
                  className={`auth-tab-btn ${
                    activeTab === "register" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Đăng Ký
                </button>
              </div>

              <div className="auth-card-body">
                {authError && (
                  <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
                    {authError}
                  </div>
                )}
                {authSuccess && (
                  <div style={{ padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#166534", fontSize: "13px", fontWeight: 700, marginBottom: "16px" }}>
                    {authSuccess}
                  </div>
                )}

                {activeTab === "login" ? (
                  <form className="auth-form" onSubmit={handleLoginSubmit}>
                    <h1 className="auth-form-title">Đăng Nhập Hệ Thống</h1>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="login-email" className="auth-label">
                        Tên đăng nhập hoặc Email
                      </label>
                      <input
                        type="text"
                        id="login-email"
                        className="form-control auth-input"
                        placeholder="Nhập tên đăng nhập hoặc email..."
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="login-password" className="auth-label">
                        Mật khẩu
                      </label>
                      <input
                        type="password"
                        id="login-password"
                        className="form-control auth-input"
                        placeholder="••••••••"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                      <div style={{ textAlign: "right", marginTop: "6px" }}>
                        <button
                          type="button"
                          onClick={async () => {
                            const emailPrompt = prompt("📧 Nhập Email đăng ký của bạn để nhận liên kết khôi phục mật khẩu:", loginEmail || "");
                            if (!emailPrompt) return;
                            const email = emailPrompt.trim();
                            if (!email.includes("@")) {
                              alert("⚠️ Vui lòng nhập địa chỉ Email hợp lệ!");
                              return;
                            }
                            const supabase = createClient();
                            const { error } = await supabase.auth.resetPasswordForEmail(email);
                            if (error) {
                              alert(`❌ Lỗi: ${error.message}`);
                            } else {
                              alert(`📩 Hệ thống đã gửi hướng dẫn khôi phục mật khẩu tới Email "${email}". Vui lòng kiểm tra hộp thư!`);
                            }
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--primary-color)",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                        >
                          🔑 Quên mật khẩu?
                        </button>
                      </div>
                    </div>

                    <button type="submit" className="btn-auth-submit">
                      Đăng Nhập Ngay
                    </button>
                  </form>
                ) : (
                  <form className="auth-form" onSubmit={handleRegisterSubmit}>
                    <h1 className="auth-form-title">Tạo Tài Khoản Mới</h1>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="reg-name" className="auth-label">
                        Họ và tên
                      </label>
                      <input
                        type="text"
                        id="reg-name"
                        className="form-control auth-input"
                        placeholder="Nhập họ và tên..."
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="reg-email" className="auth-label">
                        Email
                      </label>
                      <input
                        type="email"
                        id="reg-email"
                        className="form-control auth-input"
                        placeholder="email@example.com"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="reg-password" className="auth-label">
                        Mật khẩu
                      </label>
                      <input
                        type="password"
                        id="reg-password"
                        className="form-control auth-input"
                        placeholder="••••••••"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                      />
                    </div>

                    <button type="submit" className="btn-auth-submit">
                      Đăng Ký Tài Khoản
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            /* KHI ĐÃ ĐĂNG NHẬP (USER DASHBOARD) */
            <div className="user-dashboard-container" style={{ width: "100%" }}>
              <div
                className="user-dashboard-card"
                style={{
                  background: "#ffffff",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-color)",
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: "260px 1fr",
                  minHeight: "560px",
                }}
              >
                {/* Left Navigation Sidebar */}
                <aside
                  style={{
                    background: "#f8fafc",
                    borderRight: "1px solid var(--border-color)",
                    padding: "24px 16px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      paddingBottom: "20px",
                      borderBottom: "1px solid var(--border-color)",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        background: "var(--primary-color)",
                        color: "#fff",
                        fontSize: "24px",
                        fontWeight: 800,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {user.name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        marginTop: "2px",
                      }}
                    >
                      @{user.username} •{" "}
                      <span
                        style={{
                          color: "var(--primary-color)",
                          fontWeight: 700,
                        }}
                      >
                        {user.points} Điểm
                      </span>
                    </div>
                  </div>

                  <ul
                    style={{
                      listStyle: "none",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <li>
                      <button
                        className={`user-menu-btn ${
                          dashboardTab === "profile" ? "active" : ""
                        }`}
                        onClick={() => setDashboardTab("profile")}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          background:
                            dashboardTab === "profile"
                              ? "#e8f5e9"
                              : "transparent",
                          color:
                            dashboardTab === "profile"
                              ? "var(--primary-color)"
                              : "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>👤 Hồ sơ cá nhân</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`user-menu-btn ${
                          dashboardTab === "rewards" ? "active" : ""
                        }`}
                        onClick={() => setDashboardTab("rewards")}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          background:
                            dashboardTab === "rewards"
                              ? "#e8f5e9"
                              : "transparent",
                          color:
                            dashboardTab === "rewards"
                              ? "var(--primary-color)"
                              : "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>🎁 Tích điểm & Đổi quà</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`user-menu-btn ${
                          dashboardTab === "orders" ? "active" : ""
                        }`}
                        onClick={() => setDashboardTab("orders")}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          background:
                            dashboardTab === "orders"
                              ? "#e8f5e9"
                              : "transparent",
                          color:
                            dashboardTab === "orders"
                              ? "var(--primary-color)"
                              : "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>📦 Quản lý đơn hàng</span>
                      </button>
                    </li>
                    <li>
                      <button
                        className={`user-menu-btn ${
                          dashboardTab === "address" ? "active" : ""
                        }`}
                        onClick={() => setDashboardTab("address")}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "12px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "none",
                          fontSize: "14px",
                          fontWeight: 700,
                          cursor: "pointer",
                          background:
                            dashboardTab === "address"
                              ? "#e8f5e9"
                              : "transparent",
                          color:
                            dashboardTab === "address"
                              ? "var(--primary-color)"
                              : "var(--text-main)",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span>📍 Sổ địa chỉ nhận hàng</span>
                      </button>
                    </li>
                    <li
                      style={{
                        marginTop: "16px",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "16px",
                      }}
                    >
                      <button
                        onClick={handleLogoutClick}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 14px",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid #fecaca",
                          background: "#fef2f2",
                          color: "#ef4444",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span>🚪 Đăng xuất tài khoản</span>
                      </button>
                    </li>
                  </ul>
                </aside>

                {/* Main Content Body */}
                <div style={{ padding: "28px", overflowY: "auto" }}>
                  {/* Feedback Notification */}
                  {redeemFeedback && (
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "var(--radius-md)",
                        background: redeemFeedback.startsWith("🎉") || redeemFeedback.startsWith("✅")
                          ? "var(--primary-light)"
                          : "#fef2f2",
                        color: redeemFeedback.startsWith("🎉") || redeemFeedback.startsWith("✅")
                          ? "#166534"
                          : "#dc2626",
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "16px",
                        border: redeemFeedback.startsWith("🎉") || redeemFeedback.startsWith("✅")
                          ? "1px solid var(--primary-color)"
                          : "1px solid #fca5a5",
                      }}
                    >
                      {redeemFeedback}
                    </div>
                  )}

                  {/* TAB 1: HỒ SƠ CÁ NHÂN */}
                  {dashboardTab === "profile" && (
                    <div>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: "4px",
                        }}
                      >
                        Hồ Sơ Cá Nhân ({user.name})
                      </h2>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          marginBottom: "20px",
                        }}
                      >
                        Quản lý thông tin tài khoản: <strong>{user.username}</strong> ({user.role.toUpperCase()})
                      </p>

                      <form
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "16px",
                          maxWidth: "600px",
                        }}
                        onSubmit={handleSaveProfile}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                          }}
                        >
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="auth-label">Họ và tên *</label>
                            <input
                              type="text"
                              className="form-control auth-input"
                              value={user.name}
                              readOnly
                            />
                          </div>

                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="auth-label">Số điện thoại *</label>
                            <input
                              type="tel"
                              className="form-control auth-input"
                              defaultValue={user.phone}
                            />
                          </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="auth-label">Địa chỉ Email *</label>
                          <input
                            type="email"
                            className="form-control auth-input"
                            value={user.email}
                            readOnly
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn-auth-submit"
                          style={{
                            width: "fit-content",
                            padding: "0 28px",
                            marginTop: "4px",
                          }}
                        >
                          💾 Cập Nhật Hồ Sơ
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TAB 2: TÍCH ĐIỂM & ĐỔI QUÀ */}
                  {dashboardTab === "rewards" && (
                    <div>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: "4px",
                        }}
                      >
                        Tích Điểm & Đổi Quà Thưởng
                      </h2>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--text-muted)",
                          marginBottom: "20px",
                        }}
                      >
                        Tích lũy điểm khi mua sắm để đổi các voucher giảm giá và
                        quà tặng độc quyền.
                      </p>

                      {/* Card Điểm Số */}
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #15803d, #2e7d32)",
                          borderRadius: "var(--radius-lg)",
                          padding: "20px 24px",
                          color: "#fff",
                          marginBottom: "24px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", opacity: 0.9 }}>
                            Điểm khả dụng hiện tại
                          </div>
                          <div
                            style={{
                              fontSize: "32px",
                              fontWeight: 800,
                              marginTop: "2px",
                            }}
                          >
                            {user.points.toLocaleString("vi-VN")}{" "}
                            <span style={{ fontSize: "16px", fontWeight: 600 }}>
                              Điểm
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={handleCheckIn}
                          disabled={hasCheckedIn}
                          style={{
                            background: hasCheckedIn
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.4)",
                            color: "#fff",
                            padding: "10px 16px",
                            borderRadius: "20px",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: hasCheckedIn ? "not-allowed" : "pointer",
                            opacity: hasCheckedIn ? 0.5 : 1,
                          }}
                        >
                          {hasCheckedIn
                            ? "✅ Đã điểm danh (+50 điểm)"
                            : "🎁 Điểm danh hàng ngày (+50 điểm)"}
                        </button>
                      </div>

                      {/* Subtab Rewards Bar */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          borderBottom: "1px solid var(--border-color)",
                          marginBottom: "20px",
                          overflowX: "auto",
                          paddingBottom: "4px",
                        }}
                      >
                        <button
                          className={`reward-subtab ${
                            rewardSubTab === "tiers" ? "active" : ""
                          }`}
                          onClick={() => setRewardSubTab("tiers")}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                              rewardSubTab === "tiers"
                                ? "var(--primary-color)"
                                : "var(--text-muted)",
                            border: "none",
                            borderBottom:
                              rewardSubTab === "tiers"
                                ? "2px solid var(--primary-color)"
                                : "2px solid transparent",
                            background: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          👑 Hạng Thành Viên
                        </button>
                        <button
                          className={`reward-subtab ${
                            rewardSubTab === "tasks" ? "active" : ""
                          }`}
                          onClick={() => setRewardSubTab("tasks")}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                              rewardSubTab === "tasks"
                                ? "var(--primary-color)"
                                : "var(--text-muted)",
                            border: "none",
                            borderBottom:
                              rewardSubTab === "tasks"
                                ? "2px solid var(--primary-color)"
                                : "2px solid transparent",
                            background: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          📋 Nhiệm Vụ Hàng Ngày
                        </button>
                        <button
                          className={`reward-subtab ${
                            rewardSubTab === "wheel" ? "active" : ""
                          }`}
                          onClick={() => setRewardSubTab("wheel")}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                              rewardSubTab === "wheel"
                                ? "var(--primary-color)"
                                : "var(--text-muted)",
                            border: "none",
                            borderBottom:
                              rewardSubTab === "wheel"
                                ? "2px solid var(--primary-color)"
                                : "2px solid transparent",
                            background: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          🎰 Vòng Quay May Mắn
                        </button>
                        <button
                          className={`reward-subtab ${
                            rewardSubTab === "catalog" ? "active" : ""
                          }`}
                          onClick={() => setRewardSubTab("catalog")}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                              rewardSubTab === "catalog"
                                ? "var(--primary-color)"
                                : "var(--text-muted)",
                            border: "none",
                            borderBottom:
                              rewardSubTab === "catalog"
                                ? "2px solid var(--primary-color)"
                                : "2px solid transparent",
                            background: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          🎁 Đổi Quà Tặng
                        </button>
                        <button
                          className={`reward-subtab ${
                            rewardSubTab === "manage" ? "active" : ""
                          }`}
                          onClick={() => setRewardSubTab("manage")}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                              rewardSubTab === "manage"
                                ? "var(--primary-color)"
                                : "var(--text-muted)",
                            border: "none",
                            borderBottom:
                              rewardSubTab === "manage"
                                ? "2px solid var(--primary-color)"
                                : "2px solid transparent",
                            background: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          📋 Quản Lý Quà ({totalVouchersCount})
                        </button>
                        <button
                          className={`reward-subtab ${
                            rewardSubTab === "history" ? "active" : ""
                          }`}
                          onClick={() => setRewardSubTab("history")}
                          style={{
                            padding: "8px 14px",
                            fontSize: "13px",
                            fontWeight: 700,
                            color:
                              rewardSubTab === "history"
                                ? "var(--primary-color)"
                                : "var(--text-muted)",
                            border: "none",
                            borderBottom:
                              rewardSubTab === "history"
                                ? "2px solid var(--primary-color)"
                                : "2px solid transparent",
                            background: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          📜 Lịch Sử Đổi Quà
                        </button>
                      </div>

                      {/* SUBTAB 0: HẠNG THÀNH VIÊN */}
                      {rewardSubTab === "tiers" && (() => {
                        const totalSpent = (user.placedOrders || []).reduce(
                          (sum, o) => sum + (o.total || 0),
                          0
                        );
                        const tierInfo =
                          totalSpent >= 15000000
                            ? { name: "💎 HẠNG KIM CƯƠNG", icon: "💎", bg: "linear-gradient(135deg, #0284c7, #0369a1)", target: 15000000, nextName: "Tối Đa" }
                            : totalSpent >= 5000000
                            ? { name: "🥇 HẠNG VÀNG", icon: "🥇", bg: "linear-gradient(135deg, #f59e0b, #d97706)", target: 15000000, nextName: "Kim Cương" }
                            : totalSpent >= 2000000
                            ? { name: "🥈 HẠNG BẠC", icon: "🥈", bg: "linear-gradient(135deg, #94a3b8, #64748b)", target: 5000000, nextName: "Vàng" }
                            : { name: "🥉 HẠNG ĐỒNG", icon: "🥉", bg: "linear-gradient(135deg, #78716c, #44403c)", target: 2000000, nextName: "Bạc" };

                        const progressPercent = Math.min(100, Math.round((totalSpent / tierInfo.target) * 100));

                        return (
                          <div>
                            {/* Rank Card */}
                            <div
                              style={{
                                background: tierInfo.bg,
                                borderRadius: "var(--radius-lg)",
                                padding: "24px",
                                color: "#fff",
                                marginBottom: "24px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      letterSpacing: "1px",
                                      textTransform: "uppercase",
                                      opacity: 0.9,
                                    }}
                                  >
                                    THẺ THÀNH VIÊN VIP (XÉT THEO TỔNG CHI TIÊU MUA HÀNG)
                                  </div>
                                  <h3
                                    style={{
                                      fontSize: "24px",
                                      fontWeight: 900,
                                      margin: "4px 0 0",
                                    }}
                                  >
                                    {tierInfo.name}
                                  </h3>
                                </div>
                                <div style={{ fontSize: "36px" }}>{tierInfo.icon}</div>
                              </div>

                              {/* Rank progress */}
                              <div style={{ marginTop: "20px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: "12px",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <span>Tích lũy chi tiêu: {totalSpent.toLocaleString("vi-VN")}đ</span>
                                  <span>Mục tiêu thăng hạng {tierInfo.nextName}: {tierInfo.target.toLocaleString("vi-VN")}đ ({progressPercent}%)</span>
                                </div>
                                <div
                                  style={{
                                    height: "10px",
                                    background: "rgba(255,255,255,0.3)",
                                    borderRadius: "5px",
                                    overflow: "hidden",
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      background: "#fff",
                                      width: `${progressPercent}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Privileges Table */}
                            <h4
                              style={{
                                fontSize: "16px",
                                fontWeight: 800,
                                marginBottom: "12px",
                              }}
                            >
                              🌟 Điều Kiện Thăng Hạng & Đặc Quyền Chi Tiêu:
                            </h4>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "12px",
                              }}
                            >
                              <div
                                style={{
                                  border: "1px solid var(--border-color)",
                                  padding: "14px",
                                  borderRadius: "var(--radius-md)",
                                  background: "#fff",
                                }}
                              >
                                <div style={{ fontWeight: 800, color: "#64748b" }}>
                                  🥈 Hạng Bạc (Từ 2.000.000đ mua hàng)
                                </div>
                                <ul
                                  style={{
                                    fontSize: "12px",
                                    margin: "8px 0 0",
                                    paddingLeft: "16px",
                                    color: "var(--text-muted)",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  <li>Voucher ship 10.000đ mỗi tháng</li>
                                  <li>Chiết khấu 2% trực tiếp đơn hàng</li>
                                </ul>
                              </div>
                              <div
                                style={{
                                  border: "1px solid var(--border-color)",
                                  padding: "14px",
                                  borderRadius: "var(--radius-md)",
                                  background: "#fff",
                                }}
                              >
                                <div style={{ fontWeight: 800, color: "#d97706" }}>
                                  🥇 Hạng Vàng (Từ 5.000.000đ mua hàng)
                                </div>
                                <ul
                                  style={{
                                    fontSize: "12px",
                                    margin: "8px 0 0",
                                    paddingLeft: "16px",
                                    color: "var(--text-muted)",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  <li>Voucher ship 20.000đ mỗi tháng</li>
                                  <li>Chiết khấu 5% trực tiếp đơn hàng</li>
                                  <li>Quà tặng sinh nhật tháng đặc quyền</li>
                                </ul>
                              </div>
                              <div
                                style={{
                                  border: "1px solid var(--border-color)",
                                  padding: "14px",
                                  borderRadius: "var(--radius-md)",
                                  background: "#fff",
                                }}
                              >
                                <div style={{ fontWeight: 800, color: "#0284c7" }}>
                                  💎 Hạng Kim Cương (Từ 15.000.000đ mua hàng)
                                </div>
                                <ul
                                  style={{
                                    fontSize: "12px",
                                    margin: "8px 0 0",
                                    paddingLeft: "16px",
                                    color: "var(--text-muted)",
                                    lineHeight: "1.6",
                                  }}
                                >
                                  <li>Voucher ship 50.000đ mỗi tháng</li>
                                  <li>Chiết khấu 10% trực tiếp đơn hàng</li>
                                  <li>Hỗ trợ ưu tiên CSKH VIP 24/7</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* SUBTAB TASKS: NHIỆM VỤ HÀNG NGÀY */}
                      {rewardSubTab === "tasks" && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              padding: "16px",
                              background: "#fff",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "14px" }}>
                                📅 Điểm danh hàng ngày
                              </strong>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                Nhận ngay +50 điểm khi đăng nhập mỗi ngày
                              </div>
                            </div>
                            <button
                              onClick={handleCheckIn}
                              disabled={hasCheckedIn}
                              style={{
                                padding: "8px 16px",
                                background: hasCheckedIn
                                  ? "#cbd5e1"
                                  : "var(--primary-color)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "var(--radius-md)",
                                fontWeight: 700,
                                cursor: hasCheckedIn
                                  ? "not-allowed"
                                  : "pointer",
                              }}
                            >
                              {hasCheckedIn ? "✅ Đã nhận" : "+50 Điểm"}
                            </button>
                          </div>

                          <div
                            style={{
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              padding: "16px",
                              background: "#fff",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "14px" }}>
                                🔗 Chia sẻ Mini Shop lên MXH
                              </strong>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                Chia sẻ liên kết cửa hàng lên Facebook / Zalo (+100 điểm)
                              </div>
                            </div>
                            {shareTaskStatus === "not_started" && (
                              <button
                                onClick={handlePerformShare}
                                style={{
                                  padding: "8px 16px",
                                  background: "#2563eb",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                🔗 Thực hiện
                              </button>
                            )}
                            {shareTaskStatus === "performed" && (
                              <button
                                onClick={handleClaimShare}
                                style={{
                                  padding: "8px 16px",
                                  background: "#16a34a",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 0 10px rgba(22, 163, 74, 0.4)",
                                }}
                              >
                                🎁 Nhận quà (+100 điểm)
                              </button>
                            )}
                            {shareTaskStatus === "claimed" && (
                              <button
                                disabled
                                style={{
                                  padding: "8px 16px",
                                  background: "#cbd5e1",
                                  color: "#64748b",
                                  border: "none",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 700,
                                  cursor: "not-allowed",
                                }}
                              >
                                ✅ Đã nhận quà
                              </button>
                            )}
                          </div>

                          <div
                            style={{
                              border: "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              padding: "16px",
                              background: "#fff",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "14px" }}>
                                ✍️ Đánh giá sản phẩm đã mua
                              </strong>
                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-muted)",
                                  marginTop: "2px",
                                }}
                              >
                                Đánh giá 5 sao cho sản phẩm vừa trải nghiệm (+80 điểm)
                              </div>
                            </div>
                            {reviewTaskStatus === "not_started" && (
                              <button
                                onClick={handlePerformReview}
                                style={{
                                  padding: "8px 16px",
                                  background: "#2563eb",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                ✍️ Thực hiện
                              </button>
                            )}
                            {reviewTaskStatus === "performed" && (
                              <button
                                onClick={handleClaimReview}
                                style={{
                                  padding: "8px 16px",
                                  background: "#16a34a",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  boxShadow: "0 0 10px rgba(22, 163, 74, 0.4)",
                                }}
                              >
                                🎁 Nhận quà (+80 điểm)
                              </button>
                            )}
                            {reviewTaskStatus === "claimed" && (
                              <button
                                disabled
                                style={{
                                  padding: "8px 16px",
                                  background: "#cbd5e1",
                                  color: "#64748b",
                                  border: "none",
                                  borderRadius: "var(--radius-md)",
                                  fontWeight: 700,
                                  cursor: "not-allowed",
                                }}
                              >
                                ✅ Đã nhận quà
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB WHEEL: VÒNG QUAY MAY MẮN */}
                      {rewardSubTab === "wheel" && (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                          <h3
                            style={{
                              fontSize: "18px",
                              fontWeight: 900,
                              marginBottom: "8px",
                            }}
                          >
                            🎰 VÒNG QUAY MAY MẮN TRÚNG VOUCHER & ĐIỂM THƯỞNG
                          </h3>
                          <p
                            style={{
                              fontSize: "13px",
                              color: "var(--text-muted)",
                              marginBottom: "20px",
                            }}
                          >
                            Mỗi ngày khách hàng có 1 lượt quay miễn phí để săn
                            quà tặng hấp dẫn!
                          </p>

                          {/* Animated Wheel graphic */}
                          <div
                            style={{
                              position: "relative",
                              width: "220px",
                              height: "220px",
                              margin: "0 auto 20px",
                            }}
                          >
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: "50%",
                                border: "8px solid #dc2626",
                                background:
                                  "conic-gradient(#ef4444 0deg 60deg, #f59e0b 60deg 120deg, #10b981 120deg 180deg, #06b6d4 180deg 240deg, #8b5cf6 240deg 300deg, #ec4899 300deg 360deg)",
                                transform: `rotate(${spinDeg}deg)`,
                                transition: isSpinning
                                  ? "transform 3.5s cubic-bezier(0.15, 0.9, 0.25, 1)"
                                  : "none",
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
                            onClick={handleSpinWheel}
                            disabled={isSpinning}
                            style={{
                              padding: "12px 28px",
                              background: isSpinning
                                ? "#cbd5e1"
                                : "linear-gradient(135deg, #dc2626, #ef4444)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "30px",
                              fontSize: "15px",
                              fontWeight: 900,
                              cursor: isSpinning ? "not-allowed" : "pointer",
                              boxShadow: "0 6px 16px rgba(220, 38, 38, 0.3)",
                            }}
                          >
                            {isSpinning
                              ? "⏳ Đang quay may mắn..."
                              : "🎰 QUAY VÒNG MAY MẮN"}
                          </button>

                          {spinResultMsg && (
                            <div
                              style={{
                                marginTop: "16px",
                                padding: "12px",
                                background: "#dcfce7",
                                color: "#15803d",
                                borderRadius: "8px",
                                fontWeight: 800,
                                fontSize: "14px",
                              }}
                            >
                              {spinResultMsg}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUBTAB 1: CATALOG ĐỔI QUÀ */}
                      {rewardSubTab === "catalog" && (
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "16px",
                          }}
                        >
                          {GIFTS_CATALOG.map((gift) => (
                            <div
                              key={gift.id}
                              style={{
                                border: "1px solid var(--border-color)",
                                borderRadius: "var(--radius-md)",
                                padding: "14px",
                                display: "flex",
                                gap: "12px",
                                alignItems: "center",
                                background: "#fff",
                              }}
                            >
                              <div style={{ fontSize: "32px" }}>{gift.icon}</div>
                              <div style={{ flex: 1 }}>
                                <strong
                                  style={{ fontSize: "14px", color: "#0f172a" }}
                                >
                                  {gift.name}
                                </strong>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  Cần {gift.points} điểm | Mã: {gift.code}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRedeemGiftClick(gift)}
                                style={{
                                  background: "var(--primary-color)",
                                  color: "#fff",
                                  border: "none",
                                  padding: "6px 14px",
                                  borderRadius: "var(--radius-md)",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Đổi Ngay
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SUBTAB 2: QUẢN LÝ QUÀ ĐÃ ĐỔI (KHO QUÀ) */}
                      {rewardSubTab === "manage" && (
                        <div>
                          {user.vouchers.length === 0 ? (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "36px 0",
                                color: "var(--text-muted)",
                                border: "1px dashed var(--border-color)",
                                borderRadius: "var(--radius-md)",
                                background: "#f8fafc",
                              }}
                            >
                              <div style={{ fontSize: "36px" }}>🎁</div>
                              <p style={{ fontWeight: 700, marginTop: "8px", color: "#0f172a" }}>
                                Kho quà của bạn đang trống!
                              </p>
                              <p style={{ fontSize: "12px" }}>
                                Hãy nhấn vào tab &quot;🎁 Đổi Quà Tặng&quot; để quy đổi điểm tích lũy của bạn nhé.
                              </p>
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                              }}
                            >
                              {user.vouchers.map((v) => (
                                <div
                                  key={v.code}
                                  style={{
                                    border: "1px dashed var(--primary-color)",
                                    borderRadius: "var(--radius-md)",
                                    padding: "16px",
                                    background: "var(--primary-light)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    position: "relative",
                                  }}
                                >
                                  <div>
                                    <div
                                      style={{
                                        fontSize: "16px",
                                        fontWeight: 800,
                                        color: "var(--primary-color)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                      }}
                                    >
                                      <span>🎟️ {v.code} - {v.label}</span>
                                      {v.quantity > 1 && (
                                        <sup className="badge-superscript count-green" style={{ fontSize: "11px" }}>
                                          x{v.quantity}
                                        </sup>
                                      )}
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "12px",
                                        color: "var(--text-muted)",
                                        marginTop: "4px",
                                      }}
                                    >
                                      Trị giá giảm:{" "}
                                      <strong>
                                        {v.discount.toLocaleString("vi-VN")}đ
                                      </strong>{" "}
                                      | Đã đổi trong kho: {v.quantity} cái
                                    </div>
                                  </div>
                                  <Link
                                    href="/cart"
                                    style={{
                                      padding: "6px 14px",
                                      background: "var(--primary-color)",
                                      color: "#fff",
                                      borderRadius: "var(--radius-sm)",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      textDecoration: "none",
                                    }}
                                  >
                                    Dùng Ngay trong Giỏ
                                  </Link>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUBTAB 3: LỊCH SỬ ĐỔI QUÀ */}
                      {rewardSubTab === "history" && (
                        <div>
                          {user.history.length === 0 ? (
                            <div
                              style={{
                                textAlign: "center",
                                padding: "24px 0",
                                color: "var(--text-muted)",
                              }}
                            >
                              Chưa có lịch sử đổi quà.
                            </div>
                          ) : (
                            <table
                              style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                fontSize: "13px",
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    borderBottom: "2px solid var(--border-color)",
                                    textAlign: "left",
                                  }}
                                >
                                  <th style={{ padding: "8px" }}>Mã GD</th>
                                  <th style={{ padding: "8px" }}>Ngày GD</th>
                                  <th style={{ padding: "8px" }}>Nội dung / Phần quà</th>
                                  <th style={{ padding: "8px" }}>Mã Voucher</th>
                                  <th style={{ padding: "8px" }}>Thay đổi điểm</th>
                                </tr>
                              </thead>
                              <tbody>
                                {user.history.map((h) => (
                                  <tr
                                    key={h.id}
                                    style={{
                                      borderBottom: "1px solid var(--border-color)",
                                    }}
                                  >
                                    <td style={{ padding: "8px" }}>
                                      <strong>{h.id}</strong>
                                    </td>
                                    <td style={{ padding: "8px" }}>{h.date}</td>
                                    <td style={{ padding: "8px" }}>
                                      <strong>{h.giftName}</strong>
                                    </td>
                                    <td style={{ padding: "8px" }}>
                                      <code
                                        style={{
                                          background: "#f1f5f9",
                                          padding: "2px 6px",
                                          borderRadius: "4px",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {h.code}
                                      </code>
                                    </td>
                                    <td
                                      style={{
                                        padding: "8px",
                                        color: h.pointsSpent < 0 ? "#16a34a" : "#ef4444",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {h.pointsSpent < 0 ? `+${Math.abs(h.pointsSpent)}` : `-${h.pointsSpent}`} Điểm
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ĐƠN HÀNG */}
                  {dashboardTab === "orders" && (
                    <div>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "#0f172a",
                          marginBottom: "16px",
                        }}
                      >
                        Quản Lý Đơn Hàng Của Tôi
                      </h2>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {liveOrders.map((ord) => (
                          <div
                            key={ord.id}
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
                                borderBottom: "1px solid #f1f5f9",
                                paddingBottom: "10px",
                                marginBottom: "12px",
                              }}
                            >
                              <div>
                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                                  Đơn hàng {ord.id}
                                </strong>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                  }}
                                >
                                  Ngày đặt: {ord.date}
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "var(--primary-color)",
                                  background: "var(--primary-light)",
                                  padding: "4px 12px",
                                  borderRadius: "var(--radius-full)",
                                  height: "fit-content",
                                }}
                              >
                                {ord.statusText}
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <div style={{ fontSize: "13px", color: "var(--text-main)" }}>
                                  Sản phẩm: <strong>{ord.items[0].name}</strong> {ord.items.length > 1 && `(+${ord.items.length - 1} sản phẩm khác)`}
                                </div>
                                <div style={{ fontSize: "14px", fontWeight: 800, color: "var(--primary-color)", marginTop: "2px" }}>
                                  Tổng tiền: {ord.total.toLocaleString("vi-VN")}đ
                                </div>
                              </div>

                              <div style={{ display: "flex", gap: "8px" }}>
                                {(ord.status === "pending" || ord.status === "processing") && (
                                  <button
                                    onClick={() => {
                                      setCancelTargetOrder(ord);
                                      setShowCancelModal(true);
                                    }}
                                    style={{
                                      padding: "6px 14px",
                                      background: "#fee2e2",
                                      border: "1px solid #fca5a5",
                                      borderRadius: "var(--radius-sm)",
                                      fontSize: "12px",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      color: "#dc2626",
                                    }}
                                  >
                                    ❌ Hủy đơn
                                  </button>
                                )}
                                <button
                                  onClick={() => setSelectedOrder(ord)}
                                  style={{
                                    padding: "6px 14px",
                                    background: "#ffffff",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "var(--radius-sm)",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    color: "var(--text-main)",
                                  }}
                                >
                                  🔍 Xem chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: ĐỊA CHỈ NHẬN HÀNG */}
                  {dashboardTab === "address" && (
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                        }}
                      >
                        <h2
                          style={{
                            fontSize: "20px",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          Sổ Địa Chỉ Nhận Hàng
                        </h2>
                        <button
                          onClick={() => setShowAddAddressModal(true)}
                          style={{
                            padding: "8px 16px",
                            background: "var(--primary-color)",
                            color: "#fff",
                            border: "none",
                            borderRadius: "var(--radius-md)",
                            fontSize: "13px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          + Thêm Địa Chỉ Mới
                        </button>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {addresses.map((a) => (
                          <div
                            key={a.id}
                            style={{
                              border: a.isDefault
                                ? "2px solid var(--primary-color)"
                                : "1px solid var(--border-color)",
                              borderRadius: "var(--radius-md)",
                              padding: "16px",
                              background: a.isDefault ? "#f0fdf4" : "#ffffff",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <strong style={{ fontSize: "14px", color: "#0f172a" }}>
                                  {a.name}
                                </strong>
                                <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                  ({a.phone})
                                </span>
                                {a.isDefault && (
                                  <span
                                    style={{
                                      background: "var(--primary-color)",
                                      color: "#ffffff",
                                      fontSize: "10px",
                                      fontWeight: 800,
                                      padding: "2px 8px",
                                      borderRadius: "var(--radius-full)",
                                    }}
                                  >
                                    📌 Mặc định
                                  </span>
                                )}
                              </div>
                              <p
                                style={{
                                  fontSize: "13px",
                                  color: "var(--text-main)",
                                  marginTop: "4px",
                                  margin: "4px 0 0 0",
                                }}
                              >
                                {a.detail}, {a.ward}, {a.province}
                              </p>
                            </div>

                            <div style={{ display: "flex", gap: "8px" }}>
                              {!a.isDefault && addresses.length >= 2 && (
                                <button
                                  onClick={() => handleSetDefaultAddress(a.id)}
                                  style={{
                                    padding: "6px 12px",
                                    background: "#ffffff",
                                    border: "1px solid var(--primary-color)",
                                    color: "var(--primary-color)",
                                    borderRadius: "var(--radius-sm)",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                  }}
                                >
                                  📌 Đặt làm mặc định
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(a.id)}
                                style={{
                                  padding: "6px 10px",
                                  background: "#fef2f2",
                                  border: "1px solid #fecaca",
                                  color: "#ef4444",
                                  borderRadius: "var(--radius-sm)",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
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
              maxWidth: "600px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                📋 Chi Tiết Đơn Hàng {selectedOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "20px", maxHeight: "480px", overflowY: "auto" }}>
              <div
                style={{
                  marginBottom: "16px",
                  fontSize: "14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  color: "var(--text-main)",
                }}
              >
                <div>Ngày đặt: <span style={{ fontWeight: 600 }}>{selectedOrder.date}</span></div>
                <div>Trạng thái: <span style={{ fontWeight: 600 }}>{selectedOrder.statusText}</span></div>
                {selectedOrder.cancelReason && (
                  <div style={{ color: "#dc2626", fontWeight: 600 }}>⚠️ Lý do hủy: {selectedOrder.cancelReason}</div>
                )}
                <div>Người nhận: <span style={{ fontWeight: 600 }}>{selectedOrder.recipientName} ({selectedOrder.recipientPhone})</span></div>
                <div>Địa chỉ: <span style={{ fontWeight: 600 }}>{selectedOrder.address}</span></div>
                <div>Thanh toán: <span style={{ fontWeight: 600 }}>{selectedOrder.paymentMethod}</span></div>
              </div>

              <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "16px 0" }} />

              <h4 style={{ fontSize: "14px", fontWeight: 800, marginBottom: "10px" }}>Sản phẩm trong đơn:</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <img src={fixImagePath(it.image)} alt={it.name} style={{ width: "48px", height: "48px", borderRadius: "6px", objectFit: "cover" }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", fontWeight: 700 }}>{it.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Số lượng: {it.qty} x {it.price.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                    <strong style={{ fontSize: "14px" }}>
                      {(it.qty * it.price).toLocaleString("vi-VN")}đ
                    </strong>
                  </div>
                ))}
              </div>

              <hr style={{ border: 0, borderTop: "1px solid var(--border-color)", margin: "16px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                <span>Tạm tính:</span>
                <strong>{selectedOrder.subtotal.toLocaleString("vi-VN")}đ</strong>
              </div>
              {selectedOrder.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#ef4444" }}>
                  <span>Giảm giá:</span>
                  <strong>-{selectedOrder.discount.toLocaleString("vi-VN")}đ</strong>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 900, color: "var(--primary-color)", marginTop: "8px" }}>
                <span>TỔNG CỘNG:</span>
                <span>{selectedOrder.total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL THÊM ĐỊA CHỈ MỚI */}
      {showAddAddressModal && (
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
              maxWidth: "520px",
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                📍 Thêm Địa Chỉ Nhận Hàng Mới
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAddressModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddAddressSubmit} style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label className="auth-label">Họ và tên *</label>
                  <input
                    type="text"
                    className="form-control auth-input"
                    placeholder="Ví dụ: Bình Nguyễn"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control auth-input"
                    placeholder="Ví dụ: 0988123456"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                  />
                </div>
              </div>

              <SearchableDropdown
                label="Tỉnh / Thành phố *"
                value={addrProvince}
                options={PROVINCES_LIST}
                placeholderSearch="🔍 Nhập từ khóa tìm nhanh Tỉnh / Thành phố..."
                onSelect={handleSelectProvince}
              />

              <SearchableDropdown
                label="Xã / Phường (Phụ thuộc Tỉnh thành) *"
                value={addrWard}
                options={LOCATION_DATA[addrProvince] || []}
                placeholderSearch="🔍 Nhập từ khóa tìm nhanh Xã / Phường..."
                onSelect={(selectedWard) => setAddrWard(selectedWard)}
              />

              <div style={{ marginBottom: "16px" }}>
                <label className="auth-label">Tên đường, tòa nhà, số nhà *</label>
                <input
                  type="text"
                  className="form-control auth-input"
                  placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Tòa nhà Bitexco"
                  required
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "20px" }}>
                <input
                  type="checkbox"
                  checked={addrSetDefault}
                  onChange={(e) => setAddrSetDefault(e.target.checked)}
                />
                <span>Đặt làm địa chỉ nhận hàng mặc định</span>
              </label>

              <button
                type="submit"
                className="btn-auth-submit"
                style={{ width: "100%" }}
              >
                💾 Lưu Địa Chỉ Mới
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HỦY ĐƠN HÀNG KÈM LÝ DO */}
      {showCancelModal && cancelTargetOrder && (
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
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#fef2f2",
                borderBottom: "1px solid #fee2e2",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#991b1b", margin: 0 }}>
                ⚠️ Lý Do Hủy Đơn Hàng {cancelTargetOrder.id}
              </h3>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "22px",
                  cursor: "pointer",
                  color: "#991b1b",
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleConfirmCancelOrder} style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: 0, marginBottom: "14px" }}>
                Xin vui lòng chọn lý do tại sao bạn muốn hủy đơn hàng này để MINI-SHOP nâng cao chất lượng phục vụ:
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {CANCELLATION_REASONS.map((r, idx) => (
                  <label
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: "13px",
                      padding: "8px 12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      background: cancelReasonPreset === r ? "#f0fdf4" : "#fff",
                      borderColor: cancelReasonPreset === r ? "var(--primary-color)" : "var(--border-color)",
                      fontWeight: cancelReasonPreset === r ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="cancel_reason"
                      value={r}
                      checked={cancelReasonPreset === r}
                      onChange={(e) => setCancelReasonPreset(e.target.value)}
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {cancelReasonPreset.includes("Lý do khác") && (
                <div style={{ marginBottom: "16px" }}>
                  <label className="auth-label">Nhập lý do chi tiết của bạn:</label>
                  <textarea
                    rows={3}
                    className="form-control auth-input"
                    placeholder="Ví dụ: Đổi ý không muốn mua nữa..."
                    value={cancelReasonCustom}
                    onChange={(e) => setCancelReasonCustom(e.target.value)}
                    style={{ width: "100%", padding: "10px", fontSize: "13px" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#f1f5f9",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Quay Lại
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Xác Nhận Hủy Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THỰC HIỆN CHIA SẺ */}
      {showShareModal && (
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
              maxWidth: "460px",
              borderRadius: "var(--radius-lg)",
              padding: "24px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔗</div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: "0 0 8px 0" }}>
              Chia Sẻ MINI-SHOP Lên Mạng Xã Hội
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Hãy chia sẻ đường link cửa hàng Mini Shop đến bạn bè qua Facebook hoặc Zalo để được ghi nhận thực hiện nhiệm vụ nhé!
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
              <a
                href="https://www.facebook.com/sharer/sharer.php"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "8px 16px", background: "#1877f2", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}
              >
                Facebook
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                style={{ padding: "8px 16px", background: "#0068ff", color: "#fff", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "13px" }}
              >
                Zalo
              </a>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.origin);
                    alert("📋 Đã chép liên kết Mini Shop vào bộ nhớ tạm!");
                  }
                }}
                style={{ padding: "8px 16px", background: "#334155", color: "#fff", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}
              >
                📋 Sao chép Link
              </button>
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--primary-color)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              ✅ Đã Chia Sẻ Xong (Sẵn Sàng Nhận +100 Điểm)
            </button>
          </div>
        </div>
      )}

      {/* MODAL THỰC HIỆN ĐÁNH GIÁ SẢN PHẨM */}
      {showReviewModal && (
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
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                ✍️ Đánh Giá Sản Phẩm Đã Mua
              </h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>&times;</button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Chọn mức độ hài lòng (Số sao):</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ fontSize: "28px", cursor: "pointer", filter: star <= reviewRating ? "none" : "grayscale(100%) opacity(0.3)" }}
                  >
                    ⭐
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px" }}>Viết cảm nhận của bạn về sản phẩm:</label>
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
              onClick={() => {
                setShowReviewModal(false);
                setReviewComment("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "var(--primary-color)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontWeight: 800,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              🚀 Gửi Đánh Giá (Sẵn Sàng Nhận +80 Điểm)
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
