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
 * Fetch 34 post-merger Vietnam Provinces from https://api.openadmindata.org/api/v1/vn/province.json
 */
export async function fetchProvincesApi(): Promise<string[]> {
  const cacheKey = "minishop_openadmindata_org_provinces";

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
          (p: OpenAdminProvinceEntity) => p.name_local
        );
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(provinceNames));
        }
        return provinceNames;
      }
    }
  } catch (err) {
    console.error("Error fetching provinces from api.openadmindata.org:", err);
  }

  return [
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Hải Phòng",
    "Cần Thơ",
    "Đồng Nai",
    "Bắc Ninh",
    "Khánh Hòa",
    "Thái Nguyên",
    "Huế",
    "Lâm Đồng",
    "Tây Ninh",
    "Đồng Tháp",
    "An Giang",
    "Cà Mau",
  ];
}

/**
 * Fetch Wards for a specific Province from https://api.openadmindata.org/api/v1/vn/ward.json
 */
export async function fetchWardsForProvinceApi(provinceName: string): Promise<string[]> {
  const cleanProv = provinceName.trim();
  const cacheKey = `minishop_openadmindata_org_wards_${encodeURIComponent(cleanProv)}`;

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
        const cleanTarget = cleanProv.toLowerCase().replace(/^(tỉnh|thành phố|tp\.)\s*/i, "");
        
        const matchedWards: string[] = data.entities
          .filter((w: OpenAdminWardEntity) => {
            const parentName = (w.parent_name_local || "").toLowerCase().replace(/^(tỉnh|thành phố|tp\.)\s*/i, "");
            return parentName === cleanTarget || (w.parent_name_local || "").toLowerCase() === cleanProv.toLowerCase();
          })
          .map((w: OpenAdminWardEntity) => w.name_local);

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
    `Phường Tân Định (${cleanProv})`,
    `Phường Võ Thị Sáu (${cleanProv})`,
    `Phường Phạm Ngũ Lão (${cleanProv})`,
  ];
}
