export interface ProvinceItem {
  code: number;
  name: string;
}

export async function fetchProvincesApi(): Promise<string[]> {
  const cacheKey = "minishop_openadmindata_provinces";
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
    const res = await fetch("https://provinces.open-api.vn/api/?depth=1");
    if (res.ok) {
      const data: ProvinceItem[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const provinceNames = data.map((p) => p.name);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(cacheKey, JSON.stringify(provinceNames));
        }
        return provinceNames;
      }
    }
  } catch (err) {
    console.error("OpenAdminData API Provinces Error:", err);
  }

  return ["Thành phố Hồ Chí Minh", "Thành phố Hà Nội", "Thành phố Đà Nẵng", "Thành phố Hải Phòng", "Thành phố Cần Thơ"];
}

export async function fetchWardsForProvinceApi(provinceName: string): Promise<string[]> {
  const cacheKey = `minishop_openadmindata_wards_${encodeURIComponent(provinceName)}`;
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
    const pRes = await fetch("https://provinces.open-api.vn/api/?depth=1");
    if (pRes.ok) {
      const pData: ProvinceItem[] = await pRes.json();
      const matched = pData.find(
        (p) => p.name.toLowerCase() === provinceName.toLowerCase()
      );

      if (matched) {
        const wRes = await fetch(`https://provinces.open-api.vn/api/p/${matched.code}?depth=3`);
        if (wRes.ok) {
          const wData = await wRes.json();
          if (wData && Array.isArray(wData.districts)) {
            const wardNames: string[] = [];
            wData.districts.forEach((d: any) => {
              if (Array.isArray(d.wards)) {
                d.wards.forEach((w: any) => {
                  wardNames.push(`${w.name} (${d.name})`);
                });
              }
            });
            if (wardNames.length > 0) {
              if (typeof window !== "undefined") {
                sessionStorage.setItem(cacheKey, JSON.stringify(wardNames));
              }
              return wardNames;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("OpenAdminData API Wards Error for", provinceName, err);
  }

  return [
    `Phường Bến Thành (Quận 1, ${provinceName})`,
    `Phường Tân Định (Quận 1, ${provinceName})`,
    `Phường Võ Thị Sáu (Quận 3, ${provinceName})`,
  ];
}
