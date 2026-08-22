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
          doneBtnText: 'Hoàn Thành & Nhận Quà <i class="fa-solid fa-gift" style="margin-left: 4px;"></i>',
          nextBtnText: 'Tiếp theo <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>',
          prevBtnText: '<i class="fa-solid fa-arrow-left" style="margin-right: 4px;"></i> Quay lại',
          progressText: "Bước {{current}} / {{total}}",
          onDestroyed: () => {
            completeOnboarding();
          },
          steps: [
            {
              element: "#header-logo",
              popover: {
                title: '<i class="fa-solid fa-compass" style="color: #2e7d32; margin-right: 6px;"></i> Trang Chủ MINI SHOP',
                description: "Chào mừng bạn! Bấm vào Logo bất kỳ lúc nào để nhanh chóng quay lại Trang Chủ.",
                side: "bottom",
                align: "start",
              },
            },
            {
              element: "#header-search-input",
              popover: {
                title: '<i class="fa-solid fa-magnifying-glass" style="color: #2e7d32; margin-right: 6px;"></i> Tìm Kiếm Sản Phẩm Tức Thì',
                description: "Gõ từ khóa bất kỳ (Sofa, Bàn ăn, Giường ngủ, Rèm cửa) để gợi ý sản phẩm tức thì.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#nav-flash-sale",
              popover: {
                title: '<i class="fa-solid fa-bolt" style="color: #d97706; margin-right: 6px;"></i> Flash Sale Giá Sập Sàn',
                description: "Săn hàng trăm deal nội thất giảm giá sốc đến 50% được cập nhật liên tục.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#nav-track-order",
              popover: {
                title: '<i class="fa-solid fa-truck-fast" style="color: #2563eb; margin-right: 6px;"></i> Tra Cứu Vận Chuyển',
                description: "Theo dõi sát sao hành trình giao hàng bằng Số điện thoại hoặc Mã đơn.",
                side: "bottom",
                align: "center",
              },
            },
            {
              element: "#header-cart-icon",
              popover: {
                title: '<i class="fa-solid fa-gift" style="color: #2e7d32; margin-right: 6px;"></i> Quà Tân Thủ WELCOME50 & Cập Nhật SĐT',
                description: "Mã <strong>WELCOME50 (Giảm 50K)</strong> + <strong>500 Điểm thưởng</strong> đã sẵn sàng trong ví của bạn! Đừng quên vào mục <strong>Tài Khoản</strong> để cập nhật Số điện thoại chính xác giúp việc nhận hàng thuận tiện nhé!",
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
        doneBtnText: 'Đóng Hướng Dẫn <i class="fa-solid fa-circle-check" style="margin-left: 4px;"></i>',
        nextBtnText: 'Tiếp theo <i class="fa-solid fa-arrow-right" style="margin-left: 4px;"></i>',
        prevBtnText: '<i class="fa-solid fa-arrow-left" style="margin-right: 4px;"></i> Quay lại',
        progressText: "Bước {{current}} / {{total}}",
        steps: [
          {
            element: "#header-logo",
            popover: {
              title: '<i class="fa-solid fa-compass" style="color: #2e7d32; margin-right: 6px;"></i> Trang Chủ MINI SHOP',
              description: "Chào mừng bạn! Bấm vào Logo bất kỳ lúc nào để quay lại Trang Chủ.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#header-search-input",
            popover: {
              title: '<i class="fa-solid fa-magnifying-glass" style="color: #2e7d32; margin-right: 6px;"></i> Tìm Kiếm Sản Phẩm Tức Thì',
              description: "Gõ từ khóa bất kỳ (Sofa, Bàn ăn, Giường ngủ, Rèm cửa) để gợi ý sản phẩm tức thì.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#nav-flash-sale",
            popover: {
              title: '<i class="fa-solid fa-bolt" style="color: #d97706; margin-right: 6px;"></i> Flash Sale Giá Sập Sàn',
              description: "Săn hàng trăm deal nội thất giảm giá sốc đến 50% được cập nhật liên tục.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#nav-track-order",
            popover: {
              title: '<i class="fa-solid fa-truck-fast" style="color: #2563eb; margin-right: 6px;"></i> Tra Cứu Vận Chuyển',
              description: "Theo dõi sát sao hành trình giao hàng bằng Số điện thoại hoặc Mã đơn.",
              side: "bottom",
              align: "center",
            },
          },
          {
            element: "#header-cart-icon",
            popover: {
              title: '<i class="fa-solid fa-cart-shopping" style="color: #2e7d32; margin-right: 6px;"></i> Giỏ Hàng & Mua Sắm',
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
