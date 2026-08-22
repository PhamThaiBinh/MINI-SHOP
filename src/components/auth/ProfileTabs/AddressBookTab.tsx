"use client";

import React, { useState } from "react";
import { AddressItem } from "../types";
import { SearchableDropdown } from "../Shared/SearchableDropdown";
import { MapPin, Trash2, Plus, Save, X, Edit3 } from "lucide-react";

interface AddressBookTabProps {
  addresses: AddressItem[];
  provincesList: string[];
  wardsList: string[];
  onSelectProvince: (prov: string) => void;
  onAddAddress: (name: string, phone: string, province: string, ward: string, detail: string, isDefault: boolean) => void;
  onUpdateAddress?: (addr: AddressItem) => void;
  onSetDefaultAddress: (id: number) => void;
  onDeleteAddress: (id: number) => void;
}

export const AddressBookTab: React.FC<AddressBookTabProps> = ({
  addresses,
  provincesList,
  wardsList,
  onSelectProvince,
  onAddAddress,
  onUpdateAddress,
  onSetDefaultAddress,
  onDeleteAddress,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);

  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrWard, setAddrWard] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  const [addrSetDefault, setAddrSetDefault] = useState(false);

  // Address sorting: Default address is ALWAYS pinned to the top row (dòng đầu tiên)
  const sortedAddresses = [...addresses].sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setAddrName("");
    setAddrPhone("");
    setAddrProvince("");
    setAddrWard("");
    setAddrDetail("");
    setAddrSetDefault(addresses.length === 0);
    setShowModal(true);
  };

  const handleOpenEditModal = (addr: AddressItem) => {
    setEditingAddress(addr);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrProvince(addr.province);
    onSelectProvince(addr.province);
    setAddrWard(addr.ward);
    setAddrDetail(addr.detail);
    setAddrSetDefault(addr.isDefault);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrProvince || !addrWard) {
      alert("Vui lòng chọn Tỉnh/Thành phố và Xã/Phường!");
      return;
    }

    if (editingAddress) {
      if (onUpdateAddress) {
        onUpdateAddress({
          ...editingAddress,
          name: addrName,
          phone: addrPhone,
          province: addrProvince,
          ward: addrWard,
          detail: addrDetail,
          isDefault: addrSetDefault,
        });
      }
    } else {
      onAddAddress(addrName, addrPhone, addrProvince, addrWard, addrDetail, addrSetDefault);
    }

    setShowModal(false);
    setEditingAddress(null);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Sổ Địa Chỉ Nhận Hàng ({addresses.length})
        </h3>
        <button
          type="button"
          onClick={handleOpenAddModal}
          style={{
            padding: "8px 16px",
            background: "var(--primary-color, #2e7d32)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(46, 125, 50, 0.2)",
          }}
        >
          <Plus className="w-4 h-4" /> Thêm Địa Chỉ Mới
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {sortedAddresses.map((a) => {
          const isCannotDelete = a.isDefault || addresses.length <= 1;

          return (
            <div
              key={a.id}
              style={{
                border: a.isDefault ? "2px solid var(--primary-color, #2e7d32)" : "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "16px",
                background: a.isDefault ? "#f0fdf4" : "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                boxShadow: a.isDefault ? "0 4px 12px rgba(46, 125, 50, 0.08)" : "0 2px 6px rgba(0,0,0,0.02)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "14.5px", color: "#0f172a" }}>{a.name}</strong>
                  <span style={{ fontSize: "13px", color: "#64748b" }}>({a.phone})</span>
                  {a.isDefault && (
                    <span
                      style={{
                        background: "var(--primary-color, #2e7d32)",
                        color: "#ffffff",
                        fontSize: "11px",
                        fontWeight: 800,
                        padding: "2px 10px",
                        borderRadius: "999px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <MapPin className="w-3 h-3" /> Mặc định
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "#334155", marginTop: "6px", margin: "6px 0 0 0", lineHeight: "1.5" }}>
                  {a.detail}, {a.ward}, {a.province}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                {!a.isDefault && (
                  <button
                    type="button"
                    onClick={() => onSetDefaultAddress(a.id)}
                    style={{
                      padding: "6px 12px",
                      background: "#ffffff",
                      border: "1px solid var(--primary-color, #2e7d32)",
                      color: "var(--primary-color, #2e7d32)",
                      borderRadius: "8px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Đặt mặc định
                  </button>
                )}

                {/* Sửa Button */}
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(a)}
                  style={{
                    padding: "6px 12px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    color: "#334155",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-600" /> Sửa
                </button>

                {/* Xóa Button */}
                <button
                  type="button"
                  disabled={isCannotDelete}
                  onClick={() => !isCannotDelete && onDeleteAddress(a.id)}
                  title={isCannotDelete ? "Không thể xóa địa chỉ mặc định hoặc địa chỉ duy nhất" : "Xóa địa chỉ này"}
                  style={{
                    padding: "6px 12px",
                    background: isCannotDelete ? "#f8fafc" : "#fef2f2",
                    border: `1px solid ${isCannotDelete ? "#e2e8f0" : "#fecaca"}`,
                    color: isCannotDelete ? "#94a3b8" : "#ef4444",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: isCannotDelete ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    opacity: isCannotDelete ? 0.6 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit Address */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#fff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#f8fafc",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin className="w-4 h-4 text-emerald-700" /> {editingAddress ? "Chỉnh Sửa Địa Chỉ Nhận Hàng" : "Thêm Địa Chỉ Nhận Hàng Mới"}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <label className="auth-label">Họ và tên người nhận *</label>
                  <input
                    type="text"
                    className="form-control auth-input"
                    placeholder="Ví dụ: Bình Nguyễn"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="auth-label">Số điện thoại *</label>
                  <input
                    type="tel"
                    className="form-control auth-input"
                    placeholder="Ví dụ: 0988123456"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                  />
                </div>
              </div>

              <SearchableDropdown
                label="Tỉnh / Thành phố *"
                value={addrProvince}
                options={provincesList}
                placeholderSearch="Nhập từ khóa tìm nhanh Tỉnh / Thành phố..."
                onSelect={(prov) => {
                  setAddrProvince(prov);
                  onSelectProvince(prov);
                }}
              />

              <SearchableDropdown
                label="Xã / Phường *"
                value={addrWard}
                options={wardsList}
                placeholderSearch="Nhập từ khóa tìm nhanh Xã / Phường..."
                onSelect={(selectedWard) => setAddrWard(selectedWard)}
              />

              <div style={{ marginBottom: "16px" }}>
                <label className="auth-label">Tên đường, tòa nhà, số nhà *</label>
                <input
                  type="text"
                  className="form-control auth-input"
                  placeholder="Ví dụ: 123 Đường Nguyễn Trãi, Tòa nhà Bitexco"
                  required
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                />
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", marginBottom: "20px" }}>
                <input
                  type="checkbox"
                  checked={addrSetDefault}
                  onChange={(e) => setAddrSetDefault(e.target.checked)}
                />
                <span>Đặt làm địa chỉ nhận hàng mặc định</span>
              </label>

              <button
                type="submit"
                className="btn-auth-submit"
                style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
              >
                <Save className="w-4 h-4" /> {editingAddress ? "Lưu Thay Đổi" : "Lưu Địa Chỉ Mới"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
