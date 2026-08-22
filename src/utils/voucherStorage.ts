export interface SystemVoucher {
  code: string;
  desc: string;
  percent?: number;
  fixedDiscount?: number;
  minOrder?: number;
  expiryDate?: string;
  isActive: boolean;
}

export const INITIAL_SYSTEM_VOUCHERS: SystemVoucher[] = [
  {
    code: "DISCOUNT30",
    desc: "Giảm 30% cho đơn tối thiểu từ 2000000",
    percent: 30,
    minOrder: 2000000,
    isActive: true,
  },
  {
    code: "DISCOUNT10",
    desc: "Giảm 10% cho tất cả đơn hàng",
    percent: 10,
    minOrder: 100000,
    isActive: true,
  },
  {
    code: "MINISHOP20",
    desc: "Giảm 20% cho đơn hàng đầu tiên",
    percent: 20,
    minOrder: 200000,
    isActive: true,
  },
  {
    code: "HE2026",
    desc: "Ưu đãi chào hè giảm 15%",
    percent: 15,
    minOrder: 150000,
    isActive: true,
  },
];

const STORAGE_KEY = "mini_shop_system_vouchers";

export const getSystemVouchers = (): SystemVoucher[] => {
  if (typeof window === "undefined") return INITIAL_SYSTEM_VOUCHERS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SYSTEM_VOUCHERS;
};

export const saveSystemVouchers = (vouchers: SystemVoucher[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vouchers));
  } catch (e) {
    console.error(e);
  }
};
