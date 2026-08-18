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

// 7 Thành phố trực thuộc Trung ương cập nhật mới nhất (đến 18/08/2026)
export const CENTRAL_CITIES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Hải Phòng",
  "Đà Nẵng",
  "Cần Thơ",
  "Huế",
  "Đồng Nai",
];

export function formatProvinceName(rawName: string): string {
  const clean = rawName.replace(/^(tỉnh|thành phố|tp\.)\s*/i, "").trim();
  const isCentralCity = CENTRAL_CITIES.some(
    (c) => c.toLowerCase() === clean.toLowerCase()
  );
  if (isCentralCity) {
    return `Thành phố ${clean}`;
  }
  return clean;
}

/**
 * Fetch 34 post-merger Vietnam Provinces, prefixed with "Thành phố" for central cities and sorted A-Z
 */
export async function fetchProvincesApi(): Promise<string[]> {
  const cacheKey = "minishop_openadmindata_org_provinces_v3";

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
        const provinceNames: string[] = data.entities.map(
          (p: OpenAdminProvinceEntity) => formatProvinceName(p.name_local)
        );

        // Sort A-Z in Vietnamese
        provinceNames.sort((a, b) => a.localeCompare(b, "vi"));

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
    "Thành phố Hà Nội",
    "Thành phố Hồ Chí Minh",
    "Thành phố Hải Phòng",
    "Thành phố Đà Nẵng",
    "Thành phố Cần Thơ",
    "Thành phố Huế",
    "Thành phố Đồng Nai",
    "An Giang",
    "Bắc Ninh",
    "Cà Mau",
    "Đồng Tháp",
    "Gia Lai",
    "Khánh Hòa",
    "Lâm Đồng",
    "Tây Ninh",
    "Thái Nguyên",
  ];
  fallback.sort((a, b) => a.localeCompare(b, "vi"));
  return fallback;
}

/**
 * Fetch Wards for a specific Province, sorted A-Z
 */
export async function fetchWardsForProvinceApi(provinceName: string): Promise<string[]> {
  const cleanProv = provinceName.replace(/^(tỉnh|thành phố|tp\.)\s*/i, "").trim();
  const cacheKey = `minishop_openadmindata_org_wards_v2_${encodeURIComponent(cleanProv)}`;

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
        const cleanTarget = cleanProv.toLowerCase();

        const matchedWards: string[] = data.entities
          .filter((w: OpenAdminWardEntity) => {
            const parentName = (w.parent_name_local || "")
              .toLowerCase()
              .replace(/^(tỉnh|thành phố|tp\.)\s*/i, "")
              .trim();
            return (
              parentName === cleanTarget ||
              (w.parent_name_local || "").toLowerCase() === provinceName.toLowerCase()
            );
          })
          .map((w: OpenAdminWardEntity) => w.name_local);

        // Sort A-Z in Vietnamese
        matchedWards.sort((a, b) => a.localeCompare(b, "vi"));

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

  const defaultWards = [
    "Phường Bến Thành",
    "Phường Phạm Ngũ Lão",
    "Phường Tân Định",
    "Phường Võ Thị Sáu",
  ];
  defaultWards.sort((a, b) => a.localeCompare(b, "vi"));
  return defaultWards;
}
