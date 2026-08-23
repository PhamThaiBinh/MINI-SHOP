export interface ProductSpecs {
  [key: string]: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  originalName?: string;
  isCombo?: boolean;
  comboPrice?: number;
  stock?: number;
  status: string;
  badge?: string | null;
  badgeType?: string | null;
  image: string;
  description: string;
  fullDesc: string;
  specs: ProductSpecs;
  reviews?: number;
}
