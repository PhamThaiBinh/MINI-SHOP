/**
 * User & Membership Helper Utilities
 */

/**
 * Remove Vietnamese accents/diacritics and convert to ASCII
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  // Combining Diacritical Marks
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return str;
}

/**
 * Generates clean ASCII username without accents, e.g. "Phạm Thái Bình" -> "@pham_thai_binh"
 */
export function generateCleanUsername(nameOrEmail: string): string {
  if (!nameOrEmail) return "@user";
  const raw = nameOrEmail.includes("@") ? nameOrEmail.split("@")[0] : nameOrEmail;
  const noTones = removeVietnameseTones(raw).toLowerCase();
  const slug = noTones
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return slug ? (slug.startsWith("@") ? slug : `@${slug}`) : "@user";
}

/**
 * Dynamic Membership Tier based on Total Spending
 * - < 2.000.000đ: Thành viên Mới
 * - >= 2.000.000đ: Thành viên Đồng
 * - >= 5.000.000đ: Thành viên Bạc
 * - >= 10.000.000đ: Thành viên Vàng
 * - >= 20.000.000đ: Thành viên Kim Cương
 */
export interface MembershipTierInfo {
  tierKey: "new" | "bronze" | "silver" | "gold" | "diamond";
  name: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  iconColor: string;
  minSpend: number;
  nextTierName?: string;
  spendForNextTier?: number;
}

export function getMembershipTierInfo(totalSpent: number = 0): MembershipTierInfo {
  if (totalSpent >= 20_000_000) {
    return {
      tierKey: "diamond",
      name: "Thành viên Kim Cương",
      badgeBg: "#e0f2fe",
      badgeBorder: "#7dd3fc",
      badgeColor: "#0369a1",
      iconColor: "#0284c7",
      minSpend: 20_000_000,
    };
  }
  if (totalSpent >= 10_000_000) {
    return {
      tierKey: "gold",
      name: "Thành viên Vàng",
      badgeBg: "#fef9c3",
      badgeBorder: "#fde047",
      badgeColor: "#854d0e",
      iconColor: "#ca8a04",
      minSpend: 10_000_000,
      nextTierName: "Thành viên Kim Cương",
      spendForNextTier: 20_000_000 - totalSpent,
    };
  }
  if (totalSpent >= 5_000_000) {
    return {
      tierKey: "silver",
      name: "Thành viên Bạc",
      badgeBg: "#f1f5f9",
      badgeBorder: "#cbd5e1",
      badgeColor: "#334155",
      iconColor: "#64748b",
      minSpend: 5_000_000,
      nextTierName: "Thành viên Vàng",
      spendForNextTier: 10_000_000 - totalSpent,
    };
  }
  if (totalSpent >= 2_000_000) {
    return {
      tierKey: "bronze",
      name: "Thành viên Đồng",
      badgeBg: "#ffedd5",
      badgeBorder: "#fed7aa",
      badgeColor: "#9a3412",
      iconColor: "#c2410c",
      minSpend: 2_000_000,
      nextTierName: "Thành viên Bạc",
      spendForNextTier: 5_000_000 - totalSpent,
    };
  }
  return {
    tierKey: "new",
    name: "Thành viên",
    badgeBg: "#f1f5f9",
    badgeBorder: "#e2e8f0",
    badgeColor: "#64748b",
    iconColor: "#94a3b8",
    minSpend: 0,
    nextTierName: "Thành viên Đồng",
    spendForNextTier: 2_000_000 - totalSpent,
  };
}
