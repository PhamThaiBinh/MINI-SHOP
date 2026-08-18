export interface OpenAdminProvinceEntity {
  id: string;
  name_local: string;
  name_en: string;
  slug: string;
}

export interface OpenAdminWardEntity {
  id: string;
  name_local: string;
  name_en: string;
  slug: string;
  parent_id: string;
  parent_name_local: string;
}

/**
 * Format province name to include "Thành phố" prefix if not present
 */
export function formatProvinceName(rawName: string): string {
  const clean = rawName.trim();
  if (/^(thành phố|tỉnh|tp\.)/i.test(clean)) return clean;
  return `Thành phố ${clean}`;
}

/**
 * Fetch post-merger Vietnam Provinces from https://api.openadmindata.org/api/v1/vn/province.json
 * Sorted A-Z with "Thành phố" prefix (Updated to 18/08/2026)
 */
export async function fetchProvincesApi(): Promise<string[]> {
  const cacheKey = "minishop_openadmindata_org_provinces_v2026_az";

  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  try {
    const res = await fetch("https://api.openadmindata.org/api/v1/vn/province.json", {
      cache: "force-cache",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.entities) && data.entities.length > 0) {
        const provinceNames: string[] = data.entities
          .map((p: OpenAdminProvinceEntity) => formatProvinceName(p.name_local))
          .sort((a: string, b: string) => a.localeCompare(b, "vi"));

        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(provinceNames));
        }
        return provinceNames;
      }
    }
  } catch (err) {
    console.error("Error fetching provinces from api.openadmindata.org:", err);
  }

  const fallback = [
    "Thành phố An Giang",
    "Thành phố Bắc Ninh",
    "Thành phố Cần Thơ",
    "Thành phố Cà Mau",
    "Thành phố Cao Bằng",
    "Thành phố Đà Nẵng",
    "Thành phố Điện Biên",
    "Thành phố Đồng Nai",
    "Thành phố Đồng Tháp",
    "Thành phố Gia Lai",
    "Thành phố Hà Nội",
    "Thành phố Hải Phòng",
    "Thành phố Hồ Chí Minh",
    "Thành phố Huế",
    "Thành phố Khánh Hòa",
    "Thành phố Lai Châu",
    "Thành phố Lâm Đồng",
    "Thành phố Lạng Sơn",
    "Thành phố Lào Cai",
    "Thành phố Nghệ An",
    "Thành phố Ninh Bình",
    "Thành phố Phú Thọ",
    "Thành phố Quảng Ngãi",
    "Thành phố Quảng Ninh",
    "Thành phố Quảng Trị",
    "Thành phố Sơn La",
    "Thành phố Tây Ninh",
    "Thành phố Thái Nguyên",
    "Thành phố Thanh Hóa",
    "Thành phố Tuyên Quang",
    "Thành phố Vĩnh Long",
  ].sort((a: string, b: string) => a.localeCompare(b, "vi"));

  return fallback;
}

/**
 * Fetch Wards for a specific Province from https://api.openadmindata.org/api/v1/vn/ward.json
 * Sorted A-Z
 */
export async function fetchWardsForProvinceApi(provinceName: string): Promise<string[]> {
  const cleanProv = provinceName.trim();
  const cacheKey = `minishop_openadmindata_org_wards_v2026_${encodeURIComponent(cleanProv)}`;

  if (typeof window !== "undefined") {
    const cached = sessionStorage.getItem(cacheKey) || localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
  }

  try {
    const res = await fetch("https://api.openadmindata.org/api/v1/vn/ward.json", {
      cache: "force-cache",
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.entities)) {
        const cleanTarget = cleanProv.toLowerCase().replace(/^(thành phố|tỉnh|tp\.)\s*/i, "");
        
        const matchedWards: string[] = data.entities
          .filter((w: OpenAdminWardEntity) => {
            const parentName = (w.parent_name_local || "").toLowerCase().replace(/^(thành phố|tỉnh|tp\.)\s*/i, "");
            return parentName === cleanTarget || (w.parent_name_local || "").toLowerCase() === cleanProv.toLowerCase();
          })
          .map((w: OpenAdminWardEntity) => w.name_local)
          .sort((a: string, b: string) => a.localeCompare(b, "vi"));

        if (matchedWards.length > 0) {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(cacheKey, JSON.stringify(matchedWards));
          }
          return matchedWards;
        }
      }
    }
  } catch (err) {
    console.error("Error fetching wards from api.openadmindata.org for", provinceName, err);
  }

  return [
    `Phường Bến Thành (${cleanProv})`,
    `Phường Phạm Ngũ Lão (${cleanProv})`,
    `Phường Tân Định (${cleanProv})`,
    `Phường Võ Thị Sáu (${cleanProv})`,
  ].sort((a: string, b: string) => a.localeCompare(b, "vi"));
}
