export interface AddressItem {
  id: number;
  name: string;
  phone: string;
  province: string;
  ward: string;
  detail: string;
  isDefault: boolean;
}

export interface CustomerOrder {
  id: string;
  date: string;
  status: "completed" | "shipping" | "processing" | "cancelled";
  statusText: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  paymentMethod: string;
  items: {
    name: string;
    image: string;
    qty: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  total: number;
}

export interface SearchableDropdownProps {
  label: string;
  value: string;
  options: string[];
  placeholderSearch: string;
  onSelect: (val: string) => void;
}
