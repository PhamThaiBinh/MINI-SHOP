"use client";

import React, { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from "@/context/AuthContext";

export const DriverOnboardingTour: React.FC = () => {
  const { user, completeOnboarding } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkAndStartDriverTour = () => {
      const isNewReg = localStorage.getItem("minishop_onboarding_new_registered");
      const isDone = user ? localStorage.getItem(`minishop_onboarding_completed_${user.username}`) : null;

      if (isNewReg === "true" || (user && !user.hasCompletedOnboarding && !isDone)) {
        const driverObj = driver({
          showProgress: true,
          animate: true,
          doneBtnText: "Hoàn Thành & Nhận Quà 🎁",
          nextBtnText: "Tiếp theo →",
          prevBtnText: "← Quay lại",
          progressText: "Bước {{current}} / {{total}}",
          onDestroyed: () => {
            completeOnboarding();
          },
          steps: [
            {
              element: "#header-logo",
              popover: {
                title: "✨ Trang Chủ MINI SHOP",
                description: "Chào mừng bạn! Bấm vào Logo bất kỳ lúc nào để nhanh chóng quay lại Trang Chủ.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "#header-search-input",
              popover: {
                title: "🔍 Tìm Kiếm Sản Phẩm Tức Thì",
                description: "Gõ từ khóa bất kỳ (Sofa, Bàn ăn, Giường ngủ, Rèm cửa) để gợi ý sản phẩm tức thì.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#nav-flash-sale",
              popover: {
                title: "⚡ Flash Sale Giá Sập Sàn",
                description: "Săn hàng trăm deal nội thất giảm giá sốc đến 50% được cập nhật liên tục.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#nav-track-order",
              popover: {
                title: "🚚 Tra Cứu Vận Chuyển",
                description: "Theo dõi sát sao hành trình giao hàng bằng Số điện thoại hoặc Mã đơn.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#header-cart-icon",
              popover: {
                title: "🛒 Giỏ Hàng & Quà Tân Thủ WELCOME50",
                description: "Bạn đã hoàn thành Tour! Mã <strong>WELCOME50 (Giảm 50K)</strong> + <strong>500 Điểm thưởng</strong> đã được tự động trao vào tài khoản của bạn!",
                side: "bottom",
                align: "end",
              },
            },
          ],
        });

        driverObj.drive();
      }
    };

    const handleManualTrigger = () => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        doneBtnText: "Đóng Hướng Dẫn 🚀",
        nextBtnText: "Tiếp theo →",
        prevBtnText: "← Quay lại",
        progressText: "Bước {{current}} / {{total}}",
        steps: [
          {
            element: "#header-logo",
            popover: {
              title: "✨ Trang Chủ MINI SHOP",
              description: "Chào mừng bạn! Bấm vào Logo bất kỳ lúc nào để quay lại Trang Chủ.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#header-search-input",
            popover: {
              title: "🔍 Tìm Kiếm Sản Phẩm Tức Thì",
              description: "Gõ từ khóa bất kỳ (Sofa, Bàn ăn, Giường ngủ, Rèm cửa) để gợi ý sản phẩm tức thì.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#nav-flash-sale",
            popover: {
              title: "⚡ Flash Sale Giá Sập Sàn",
              description: "Săn hàng trăm deal nội thất giảm giá sốc đến 50% được cập nhật liên tục.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#nav-track-order",
            popover: {
              title: "🚚 Tra Cứu Vận Chuyển",
              description: "Theo dõi sát sao hành trình giao hàng bằng Số điện thoại hoặc Mã đơn.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#header-cart-icon",
            popover: {
              title: "🛒 Giỏ Hàng & Mua Sắm",
              description: "Xem giỏ hàng và tiến hành thanh toán cực kỳ tiện lợi.",
              side: "bottom",
              align: "end",
            },
          },
        ],
      });
      driverObj.drive();
    };

    const timer = setTimeout(checkAndStartDriverTour, 700);

    window.addEventListener("minishop_trigger_onboarding", handleManualTrigger);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("minishop_trigger_onboarding", handleManualTrigger);
    };
  }, [user, completeOnboarding]);

  return null;
};
