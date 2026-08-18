import { LOCATION_DATA, PROVINCES_LIST } from "@/data/locationData";

export interface ProvinceItem {
  code: number;
  name: string;
}

export interface WardItem {
  code: number;
  name: string;
}

export async function fetchProvincesApi(): Promise<string[]> {
  try {
    const res = await fetch("https://provinces.open-api.vn/api/?depth=1", {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("API network error");
    const data: ProvinceItem[] = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data.map((p) => p.name);
    }
  } catch (err) {
    console.warn("Using offline fallback provinces:", err);
  }
  return PROVINCES_LIST;
}

export async function fetchWardsForProvinceApi(provinceName: string): Promise<string[]> {
  try {
    // 1. Try finding province code from provinces API
    const pRes = await fetch("https://provinces.open-api.vn/api/?depth=1", {
      cache: "force-cache",
    });
    if (pRes.ok) {
      const pData: ProvinceItem[] = await pRes.json();
      const matched = pData.find(
        (p) => p.name.toLowerCase() === provinceName.toLowerCase()
      );

      if (matched) {
        const wRes = await fetch(
          `https://provinces.open-api.vn/api/p/${matched.code}?depth=3`,
          { cache: "force-cache" }
        );
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
            if (wardNames.length > 0) return wardNames;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Using offline fallback wards for", provinceName, err);
  }

  return LOCATION_DATA[provinceName] || LOCATION_DATA["Thành phố Hồ Chí Minh"] || [];
}
