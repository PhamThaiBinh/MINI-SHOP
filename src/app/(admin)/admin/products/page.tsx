"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/admin.css";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { fixImagePath, formatVND } from "@/lib/utils";
import { fetchProductsFromSupabase } from "@/lib/supabaseProducts";
import { Edit, Trash2, Plus, X, Package, AlertTriangle, ArrowUpDown, PackageCheck, History, ArrowDownRight, ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { saveAdminProduct, deleteAdminProduct, fetchAdminCategories } from "@/lib/supabaseAdmin";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  image: string;
  status: "Active" | "Hidden";
  desc: string;
  stock?: number;
}

interface CategoryItem {
  id: number;
  icon: string;
  name: string;
}

export interface StockLogItem {
  id: string;
  code: string;
  productId: number;
  productName: string;
  type: "IMPORT" | "EXPORT" | "AUDIT";
  qty: number;
  stockBefore: number;
  stockAfter: number;
  supplier: string;
  reason: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Stock Inventory Ledger Modal States (Nhập Xuất Tồn Kho)
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [inventoryMode, setInventoryMode] = useState<"IMPORT" | "EXPORT" | "AUDIT">("IMPORT");
  const [selectedInventoryProdId, setSelectedInventoryProdId] = useState<number>(0);
  const [inventoryQty, setInventoryQty] = useState<string>("10");
  const [inventorySupplier, setInventorySupplier] = useState<string>("");
  const [inventoryReason, setInventoryReason] = useState<string>("");
  const [stockLogs, setStockLogs] = useState<StockLogItem[]>([]);

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");
  const [formStock, setFormStock] = useState<string>("15");
  const [formImportQty, setFormImportQty] = useState<string>("0");

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    const [list, cats] = await Promise.all([
      fetchProductsFromSupabase(),
      fetchAdminCategories(),
    ]);

    const mapped = list.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      categoryName: p.categoryName || p.category,
      price: p.price,
      image: p.image,
      status: (p.status === "Hidden" ? "Hidden" : "Active") as any,
      desc: p.description || "",
      stock: p.stock !== undefined ? p.stock : 10,
    }));

    setProducts(mapped);
    if (cats && cats.length > 0) {
      setDbCategories(cats.map((c) => ({ id: c.id, icon: c.icon, name: c.name })));
    } else {
      setDbCategories([
        { id: 1, icon: "", name: "Nội Thất Phòng Ngủ" },
        { id: 2, icon: "", name: "Nội Thất Phòng Khách" },
        { id: 3, icon: "", name: "Nội Thất Phòng Ăn" },
        { id: 4, icon: "", name: "Nội Thất Phòng Làm Việc" },
        { id: 5, icon: "", name: "Trang Trí & Decor" },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (!onlyLowStock || ((p as any).stock !== undefined && (p as any).stock <= 5))
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName("");
    setFormCategory(dbCategories[0]?.name || "Nội Thất Phòng Khách");
    setFormPrice("");
    setFormImageUrl("");
    setFormStatus("Active");
    setFormDesc("");
    setFormStock("15");
    setFormImportQty("0");
    setShowModal(true);
  };

  const handleEditClick = (prod: ProductItem) => {
    setEditingProduct(prod);
    setFormName(prod.name);
    setFormCategory(prod.categoryName || prod.category);
    setFormPrice(prod.price.toString());
    setFormImageUrl(prod.image);
    setFormStatus(prod.status);
    setFormDesc(prod.desc);
    setFormStock((prod.stock !== undefined ? prod.stock : 15).toString());
    setFormImportQty("0");
    setShowModal(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này không?")) {
      setLoading(true);
      const success = await deleteAdminProduct(id);
      if (success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Xóa sản phẩm thất bại!");
      }
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numericPrice = parseFloat(formPrice);
    if (isNaN(numericPrice) || numericPrice < 0) {
      alert("Giá bán không hợp lệ!");
      setLoading(false);
      return;
    }

    let finalImage = formImageUrl.trim();
    if (!finalImage || (!finalImage.startsWith("http://") && !finalImage.startsWith("https://") && !finalImage.startsWith("/assets/"))) {
      finalImage = "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp";
    }

    const selectedCategory = formCategory || (dbCategories[0]?.name || "Nội Thất Phòng Khách");

    const prodData = {
      id: editingProduct ? editingProduct.id : undefined,
      name: formName.trim(),
      category: selectedCategory,
      categoryName: selectedCategory,
      price: Number(formPrice),
      image: finalImage,
      status: formStatus,
      description: formDesc,
    };

    setLoading(true);
    const saved = await saveAdminProduct(prodData as any);
    if (saved) {
      await loadData();
      setShowModal(false);
    } else {
      alert("Lưu sản phẩm thất bại!");
    }
    setLoading(false);
  };

  const handleOpenInventoryModal = (prodId?: number, mode: "IMPORT" | "EXPORT" | "AUDIT" = "IMPORT") => {
    setInventoryMode(mode);
    const targetId = prodId || (products[0]?.id || 1);
    setSelectedInventoryProdId(targetId);
    setInventoryQty("10");
    setInventorySupplier(mode === "IMPORT" ? "Tổng Kho Gỗ An Cường" : mode === "EXPORT" ? "Xuất Cửa Hàng Showroom" : "Đột xuất");
    setInventoryReason(mode === "IMPORT" ? "Nhập bổ sung khi tồn kho hết" : mode === "EXPORT" ? "Xuất điều chuyển bán hàng" : "Kiểm kê cân bằng tồn");
    setShowInventoryModal(true);
  };

  const handleSaveInventoryTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseInt(inventoryQty, 10);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      alert("Số lượng giao dịch phải là một số dương lớn hơn 0!");
      return;
    }

    const targetProd = products.find((p) => p.id === selectedInventoryProdId);
    if (!targetProd) {
      alert("Chưa chọn sản phẩm!");
      return;
    }

    const currentStock = targetProd.stock !== undefined ? targetProd.stock : 15;
    let newStock = currentStock;

    if (inventoryMode === "IMPORT") {
      newStock = currentStock + qtyVal;
    } else if (inventoryMode === "EXPORT") {
      if (qtyVal > currentStock) {
        alert(`Số lượng xuất (${qtyVal}) vượt quá tồn kho hiện tại (${currentStock})!`);
        return;
      }
      newStock = currentStock - qtyVal;
    } else if (inventoryMode === "AUDIT") {
      newStock = qtyVal;
    }

    setLoading(true);

    const updatedProd = {
      ...targetProd,
      stock: newStock,
      status: newStock === 0 ? "Hidden" : targetProd.status,
    };

    const success = await saveAdminProduct(updatedProd as any);

    if (success) {
      const codePrefix = inventoryMode === "IMPORT" ? "NK" : inventoryMode === "EXPORT" ? "XK" : "KK";
      const newLog: StockLogItem = {
        id: String(Date.now()),
        code: `${codePrefix}-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 900 + 100))}`,
        productId: targetProd.id,
        productName: targetProd.name,
        type: inventoryMode,
        qty: qtyVal,
        stockBefore: currentStock,
        stockAfter: newStock,
        supplier: inventorySupplier.trim() || "Kho Tổng",
        reason: inventoryReason.trim() || "Nhập xuất tồn kho",
        createdAt: new Date().toLocaleString("vi-VN"),
      };

      setStockLogs((prev) => [newLog, ...prev]);
      await loadData();
      setShowInventoryModal(false);
      alert(`✅ Cập nhật kho thành công! Sản phẩm "${targetProd.name}" tồn mới: ${newStock} món.`);
    } else {
      alert("Cập nhật tồn kho thất bại! Vui lòng thử lại.");
    }
    setLoading(false);
  };

  return (
    <div className="admin-wrapper">
      <AdminSidebar activeMenu="products" sidebarCollapsed={sidebarCollapsed} />

      <main className="admin-main">
        <AdminHeader
          title="Sản phẩm"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          searchQuery={searchQuery}
          setSearchQuery={(q) => {
            setSearchQuery(q);
            setCurrentPage(1);
          }}
          searchPlaceholder="Tìm tên sản phẩm hoặc danh mục..."
        />

        <div className="dashboard-content-body">
          {/* 1. INVENTORY MATRIX STATUS BAR */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Matrix 1: Active Products */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                border: "1.5px solid #bbf7d0",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(22, 101, 52, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#166534", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Đang Kinh Doanh
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#14532d", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {products.filter((p) => p.status === "Active").length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#dcfce7", color: "#15803d", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Hiển thị công khai
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#166534", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(22, 101, 52, 0.2)" }}>
                <Package className="w-6 h-6" />
              </div>
            </div>

            {/* Matrix 2: Low Stock Warning */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)",
                border: "1.5px solid #fde68a",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(180, 83, 9, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#b45309", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Cảnh Báo Tồn Thấp (&le;10)
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#78350f", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {products.filter((p) => (p.stock !== undefined ? p.stock : 15) <= 10).length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#fef3c7", color: "#b45309", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Cần nhập thêm hàng
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#d97706", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(217, 119, 6, 0.2)" }}>
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>

            {/* Matrix 3: Hidden Products */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1.5px solid #cbd5e1",
                borderRadius: "20px",
                padding: "20px",
                boxShadow: "0 4px 20px rgba(100, 116, 139, 0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                  Tạm Ẩn / Hết Hàng
                </div>
                <div style={{ fontSize: "28px", fontWeight: 900, color: "#1e293b", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
                  {products.filter((p) => p.status === "Hidden").length} <span style={{ fontSize: "14px", fontWeight: 700 }}>mặt hàng</span>
                </div>
                <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, marginTop: "8px" }}>
                  <span style={{ padding: "2px 8px", background: "#f1f5f9", color: "#475569", borderRadius: "12px", fontWeight: 800, fontSize: "11px" }}>
                    Tạm ngừng hiển thị
                  </span>
                </div>
              </div>
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#64748b", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 16px rgba(100, 116, 139, 0.2)" }}>
                <Package className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="admin-card-shell">
            <div className="admin-card-core">
              <div className="card-header-row" style={{ marginBottom: "20px" }}>
                <div>
                  <h2 className="card-header-title text-xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Danh Sách Sản Phẩm Kinh Doanh ({filteredProducts.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Quản lý giá bán, hình ảnh và tồn kho sản phẩm trực tuyến
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setOnlyLowStock(!onlyLowStock)}
                    style={{
                      padding: "8px 16px",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      border: "1px solid #fde68a",
                      borderRadius: "999px",
                      background: onlyLowStock ? "#fffbeb" : "#fff",
                      color: onlyLowStock ? "#b45309" : "#64748b",
                      cursor: "pointer",
                    }}
                  >
                    {onlyLowStock ? "⚠️ Đang lọc: Tồn kho thấp" : "⚠️ Cảnh báo tồn thấp"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenInventoryModal(undefined, "IMPORT")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(6, 95, 70, 0.25)",
                    }}
                  >
                    <PackageCheck className="w-4 h-4" /> 📦 Nhập Xuất Tồn Kho
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowHistoryModal(true)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 16px",
                      borderRadius: "999px",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: "#ffffff",
                      color: "#0369a1",
                      border: "1.5px solid #bae6fd",
                      cursor: "pointer",
                    }}
                  >
                    <History className="w-4 h-4" /> Nhật Ký Kho ({stockLogs.length})
                  </button>

                  <button
                    className="btn-add-product-green"
                    onClick={handleOpenAddModal}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 18px",
                      borderRadius: "999px",
                      fontWeight: 800,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.2)",
                    }}
                  >
                    <Plus className="w-4 h-4" /> Thêm Sản Phẩm Mới
                  </button>
                </div>
              </div>

            {loading ? (
              <div style={{ padding: "30px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>
                Đang tải danh sách sản phẩm...
              </div>
            ) : (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>MÃ SỐ</th>
                      <th>HÌNH ẢNH HD</th>
                      <th>TÊN SẢN PHẨM</th>
                      <th>DANH MỤC</th>
                      <th>GIÁ BÁN</th>
                      <th>TỔN KHO</th>
                      <th>BẬT / TẮT BÁN</th>
                      <th style={{ textAlign: "center" }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                          Không có sản phẩm nào khớp với tìm kiếm.
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((prod, index) => (
                        <tr key={prod.id}>
                          <td>
                            <code style={{ padding: "3px 8px", background: "#f1f5f9", color: "#1e293b", borderRadius: "6px", fontWeight: 800, fontSize: "11px" }}>
                              P{String(prod.id || index + 1).padStart(4, "0")}
                            </code>
                          </td>
                          <td>
                            <div style={{ overflow: "hidden", borderRadius: "12px", width: "44px", height: "44px", border: "1px solid #e2e8f0" }}>
                              <img
                                src={fixImagePath(prod.image)}
                                alt={prod.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1.0)")}
                              />
                            </div>
                          </td>
                          <td><strong style={{ fontSize: "14px", color: "#0f172a" }}>{prod.name}</strong></td>
                          <td>
                            <span className="cat-badge cat-furniture" style={{ borderRadius: "8px", fontSize: "11px", fontWeight: 700 }}>
                              {prod.categoryName}
                            </span>
                          </td>
                          <td style={{ fontWeight: 900, color: "var(--primary-color, #2e7d32)", fontSize: "14px" }}>
                            {formatVND(prod.price)}
                          </td>
                          <td>
                            <span style={{ fontWeight: 800, fontSize: "13px", color: (prod.stock !== undefined ? prod.stock : 15) <= 10 ? "#b45309" : "#1e293b" }}>
                              {prod.stock !== undefined ? prod.stock : 15} món
                            </span>
                          </td>
                          <td>
                            {/* Inline Switch Toggle */}
                            <button
                              type="button"
                              onClick={async () => {
                                const newStatus = prod.status === "Active" ? "Hidden" : "Active";
                                await saveAdminProduct({ ...prod, status: newStatus });
                                await loadData();
                              }}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "999px",
                                border: prod.status === "Active" ? "1px solid #bbf7d0" : "1px solid #cbd5e1",
                                background: prod.status === "Active" ? "#f0fdf4" : "#f8fafc",
                                color: prod.status === "Active" ? "#16532d" : "#64748b",
                                fontSize: "11px",
                                fontWeight: 800,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {prod.status === "Active" ? "🟢 Đang bán" : "⚪ Đã ẩn"}
                            </button>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                              <button
                                onClick={() => handleOpenInventoryModal(prod.id, "IMPORT")}
                                style={{
                                  padding: "4px 8px",
                                  background: "#f0fdf4",
                                  color: "#166534",
                                  border: "1px solid #bbf7d0",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                title="Lập phiếu nhập/xuất tồn kho cho sản phẩm này"
                              >
                                <PackageCheck className="w-3.5 h-3.5" /> Nhập/Xuất
                              </button>
                              <button
                                onClick={() => handleEditClick(prod)}
                                style={{
                                  padding: "4px 8px",
                                  background: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" /> Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                style={{
                                  padding: "4px 8px",
                                  background: "#fef2f2",
                                  color: "#dc2626",
                                  border: "1px solid #fca5a5",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

                {/* Standardized Pagination Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 0 4px 0",
                    borderTop: "1px solid var(--border-color)",
                    marginTop: "16px",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "var(--text-muted)" }}>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        fontSize: "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      <option value={10}>10 sản phẩm</option>
                      <option value={25}>25 sản phẩm</option>
                      <option value={50}>50 sản phẩm</option>
                    </select>
                    <span style={{ fontWeight: 700, color: "#0f172a" }}>
                      Hiển thị {paginatedProducts.length}/{filteredProducts.length} sản phẩm
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <button
                      disabled={safeCurrentPage === 1}
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                        opacity: safeCurrentPage === 1 ? 0.5 : 1,
                      }}
                    >
                      &laquo; Trang trước
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "1px solid var(--border-color)",
                          background: p === safeCurrentPage ? "var(--primary-color)" : "#fff",
                          color: p === safeCurrentPage ? "#fff" : "var(--text-main)",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      disabled={safeCurrentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "1px solid var(--border-color)",
                        background: "#fff",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: safeCurrentPage === totalPages ? "not-allowed" : "pointer",
                        opacity: safeCurrentPage === totalPages ? 0.5 : 1,
                      }}
                    >
                      Trang sau &raquo;
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </main>

      {/* 2-COLUMN HIGH-END FORM MODAL SẢN PHẨM MỚI / CHỈNH SỬA */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(10px)",
            zIndex: 3000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            className="admin-card-shell"
            style={{
              width: "100%",
              maxWidth: "760px",
              borderRadius: "24px",
            }}
          >
            <div className="admin-card-core" style={{ padding: "28px", borderRadius: "calc(24px - 6px)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#0f172a", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Form Thêm Sản Phẩm Mới"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", marginBottom: "24px" }}>
                  {/* Left Column: Image Live Preview Box */}
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Xem Trước Hình Ảnh
                    </label>
                    <div
                      style={{
                        width: "100%",
                        height: "220px",
                        borderRadius: "16px",
                        border: "2px dashed #cbd5e1",
                        background: "#f8fafc",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {formImageUrl ? (
                        <img
                          src={fixImagePath(formImageUrl)}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => {
                            (e.currentTarget as any).src = "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp";
                          }}
                        />
                      ) : (
                        <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8" }}>
                          <Package className="w-10 h-10 stroke-1 mb-2 text-slate-400" />
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>Dán URL ảnh để xem trước</span>
                        </div>
                      )}
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <label style={{ fontSize: "12px", fontWeight: 700, color: "#475569", display: "block", marginBottom: "4px" }}>URL Hình Ảnh *</label>
                      <input
                        type="text"
                        className="form-control admin-setting-input"
                        placeholder="/assets/images/... hoặc https://..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        style={{ fontSize: "12px", borderRadius: "10px", padding: "8px 12px" }}
                      />
                    </div>
                  </div>

                  {/* Right Column: Product Metadata Fields */}
                  <div>
                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Tên Sản Phẩm *</label>
                      <input
                        type="text"
                        className="form-control admin-setting-input"
                        placeholder="Ví dụ: Bàn Ăn Gỗ Sồi Tự Nhiên"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        required
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "14px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Danh Mục *</label>
                        <select
                          className="form-control admin-setting-input"
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          required
                          style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {dbCategories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Giá Bán (VNĐ) *</label>
                        <input
                          type="number"
                          className="form-control admin-setting-input"
                          placeholder="Ví dụ: 3500000"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          required
                          style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Số Lượng Tồn Kho</label>
                        <input
                          type="number"
                          className="form-control admin-setting-input"
                          placeholder="15"
                          value={formStock}
                          onChange={(e) => setFormStock(e.target.value)}
                          style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>📦 Nhập Thêm Hàng (+Số lượng)</label>
                        <input
                          type="number"
                          className="form-control admin-setting-input"
                          placeholder="0"
                          value={formImportQty}
                          onChange={(e) => setFormImportQty(e.target.value)}
                          style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif", borderColor: "#86efac", background: "#f0fdf4" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Trạng Thái Hiển Thị</label>
                      <select
                        className="form-control admin-setting-input"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        <option value="Active">🟢 Đang bán (Hiển thị công khai)</option>
                        <option value="Hidden">⚪ Đã ẩn (Không hiển thị)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Mô Tả Sản Phẩm</label>
                      <textarea
                        rows={3}
                        className="form-control admin-setting-input"
                        placeholder="Nhập mô tả chi tiết chất liệu, kích thước..."
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "999px",
                      border: "1px solid #cbd5e1",
                      background: "#fff",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      color: "#475569",
                    }}
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "10px 24px",
                      borderRadius: "999px",
                      border: "none",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(46, 125, 50, 0.25)",
                    }}
                  >
                    {editingProduct ? "Lưu Cập Nhật" : "Tạo Sản Phẩm Mới"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. FORM NHẬP XUẤT TỒN KHO MODAL (INVENTORY LEDGER FORM) */}
      {showInventoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "680px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1.5px solid #e2e8f0",
              animation: "fadeIn 0.25s ease-out",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                background: inventoryMode === "IMPORT"
                  ? "linear-gradient(135deg, #064e3b 0%, #047857 100%)"
                  : inventoryMode === "EXPORT"
                  ? "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)"
                  : "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <PackageCheck className="w-6 h-6 text-emerald-200" />
                  <h3 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {inventoryMode === "IMPORT" ? "📦 Lập Phiếu Nhập Kho Hàng" : inventoryMode === "EXPORT" ? "📤 Lập Phiếu Xuất Kho Hàng" : "📋 Phiếu Kiểm Kê & Cân Bằng Kho"}
                  </h3>
                </div>
                <p style={{ fontSize: "12px", opacity: 0.9, margin: 0, fontWeight: 600 }}>
                  Mã Phiếu Tự Động: <span style={{ background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: "6px", fontWeight: 800 }}>
                    {inventoryMode === "IMPORT" ? "NK" : inventoryMode === "EXPORT" ? "XK" : "KK"}-{new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowInventoryModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInventoryTransaction} style={{ padding: "24px" }}>
              {/* Mode Selector */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "12px", fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>
                  Loại Thao Tác Nhập / Xuất Kho *
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <button
                    type="button"
                    onClick={() => setInventoryMode("IMPORT")}
                    style={{
                      padding: "12px",
                      borderRadius: "14px",
                      border: inventoryMode === "IMPORT" ? "2px solid #059669" : "1.5px solid #e2e8f0",
                      background: inventoryMode === "IMPORT" ? "#ecfdf5" : "#ffffff",
                      color: inventoryMode === "IMPORT" ? "#047857" : "#64748b",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>🟢 Nhập Kho (+Hàng)</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: 600 }}>Tăng số lượng tồn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInventoryMode("EXPORT")}
                    style={{
                      padding: "12px",
                      borderRadius: "14px",
                      border: inventoryMode === "EXPORT" ? "2px solid #dc2626" : "1.5px solid #e2e8f0",
                      background: inventoryMode === "EXPORT" ? "#fef2f2" : "#ffffff",
                      color: inventoryMode === "EXPORT" ? "#b91c1c" : "#64748b",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>🔴 Xuất Kho (-Hàng)</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: 600 }}>Giảm số lượng tồn</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInventoryMode("AUDIT")}
                    style={{
                      padding: "12px",
                      borderRadius: "14px",
                      border: inventoryMode === "AUDIT" ? "2px solid #d97706" : "1.5px solid #e2e8f0",
                      background: inventoryMode === "AUDIT" ? "#fffbeb" : "#ffffff",
                      color: inventoryMode === "AUDIT" ? "#b45309" : "#64748b",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>🟡 Kiểm Kê Kho</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: 600 }}>Đặt tồn thực tế</span>
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Sản Phẩm Cần {inventoryMode === "IMPORT" ? "Nhập Kho" : inventoryMode === "EXPORT" ? "Xuất Kho" : "Kiểm Kê"} *
                </label>
                <select
                  className="form-control admin-setting-input"
                  value={selectedInventoryProdId}
                  onChange={(e) => setSelectedInventoryProdId(Number(e.target.value))}
                  required
                  style={{ borderRadius: "12px", padding: "12px 14px", fontSize: "14px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (P{String(p.id).padStart(4, "0")}) — 📦 Tồn kho hiện tại: {p.stock !== undefined ? p.stock : 15} món
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Inputs & Quick Pills */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {inventoryMode === "IMPORT" ? "Số Lượng Nhập (+Món)" : inventoryMode === "EXPORT" ? "Số Lượng Xuất (-Món)" : "Số Lượng Tồn Kho Thực Mới"} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control admin-setting-input"
                    value={inventoryQty}
                    onChange={(e) => setInventoryQty(e.target.value)}
                    required
                    style={{ borderRadius: "12px", padding: "12px 14px", fontSize: "16px", fontWeight: 900, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  {/* Quick Pills */}
                  <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                    {["5", "10", "20", "50", "100"].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setInventoryQty(num)}
                        style={{
                          padding: "3px 10px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: inventoryQty === num ? "#047857" : "#f8fafc",
                          color: inventoryQty === num ? "#ffffff" : "#475569",
                          fontSize: "11px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Math Calculation Preview */}
                {(() => {
                  const targetP = products.find((p) => p.id === selectedInventoryProdId);
                  const currentS = targetP?.stock !== undefined ? targetP.stock : 15;
                  const qtyVal = parseInt(inventoryQty, 10) || 0;
                  let calcNewS = currentS;
                  if (inventoryMode === "IMPORT") calcNewS = currentS + qtyVal;
                  else if (inventoryMode === "EXPORT") calcNewS = Math.max(0, currentS - qtyVal);
                  else if (inventoryMode === "AUDIT") calcNewS = qtyVal;

                  return (
                    <div
                      style={{
                        background: "#f8fafc",
                        border: "1.5px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "12px 16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                        Dự Kiến Tồn Kho Sau Giao Dịch
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 700, color: "#64748b" }}>{currentS}</span>
                        <span style={{ fontSize: "14px", color: "#94a3b8" }}>➔</span>
                        <span style={{ fontSize: "22px", fontWeight: 900, color: calcNewS <= 5 ? "#b45309" : "#047857" }}>
                          {calcNewS} <span style={{ fontSize: "13px", fontWeight: 700 }}>món</span>
                        </span>
                      </div>
                      <div style={{ fontSize: "11.5px", fontWeight: 800, color: inventoryMode === "IMPORT" ? "#047857" : inventoryMode === "EXPORT" ? "#b91c1c" : "#b45309", marginTop: "2px" }}>
                        {inventoryMode === "IMPORT" ? `(+${qtyVal} món bổ sung kho)` : inventoryMode === "EXPORT" ? `(-${qtyVal} món điều chuyển/bán)` : `(Điều chỉnh tồn = ${qtyVal})`}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Supplier / Destination */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {inventoryMode === "IMPORT" ? "Nhà Cung Cấp / Xưởng Sản Xuất" : "Nơi Nhận / Showroom Xuất Đến"}
                </label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder={inventoryMode === "IMPORT" ? "Ví dụ: Tổng Kho Gỗ An Cường / Xưởng Đồng Nai" : "Ví dụ: Showroom Quận 1 / Kho Hàng Trưng Bày"}
                  value={inventorySupplier}
                  onChange={(e) => setInventorySupplier(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>

              {/* Reason & Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Lý Do Giao Dịch & Ghi Chú Chi Tiết
                </label>
                <textarea
                  rows={2}
                  className="form-control admin-setting-input"
                  placeholder="Ví dụ: Nhập bổ sung đợt mới khi sản phẩm cháy hàng / Điều chuyển giao đại lý..."
                  value={inventoryReason}
                  onChange={(e) => setInventoryReason(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>

              {/* Footer Buttons */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "999px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: 800,
                    fontSize: "13px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: "pointer",
                    color: "#475569",
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 28px",
                    borderRadius: "999px",
                    border: "none",
                    background: inventoryMode === "IMPORT"
                      ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                      : inventoryMode === "EXPORT"
                      ? "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)"
                      : "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "14px",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(6, 95, 70, 0.3)",
                  }}
                >
                  📦 Xác Nhận Lập Phiếu & Cập Nhật Tồn Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. HISTORICAL STOCK LEDGER LOGS MODAL (NHẬT KÝ NHẬP XUẤT TỒN KHO) */}
      {showHistoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "850px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1.5px solid #e2e8f0",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <History className="w-6 h-6 text-sky-400" />
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 900, margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    📜 Nhật Ký Lịch Sử Giao Dịch Nhập Xuất Tồn Kho
                  </h3>
                  <p style={{ fontSize: "12px", opacity: 0.8, margin: 0 }}>Theo dõi biến động kho hàng tự động theo thời gian thực</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Table */}
            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {stockLogs.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                  <p style={{ fontSize: "14px", fontWeight: 700, margin: "8px 0 4px" }}>Chưa có phiếu nhập xuất tồn nào được khởi tạo</p>
                  <p style={{ fontSize: "12px", color: "#94a3b8" }}>Hãy bấm nút "📦 Nhập Xuất Tồn Kho" để thử nghiệm tạo phiếu mới.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Mã Phiếu</th>
                      <th>Sản Phẩm</th>
                      <th>Loại</th>
                      <th>Số Lượng</th>
                      <th>Tồn Sau GD</th>
                      <th>Nhà Cung Cấp / Lý Do</th>
                      <th>Thời Gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLogs.map((log) => (
                      <tr key={log.id}>
                        <td>
                          <code style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontWeight: 800, fontSize: "11px", color: "#0f172a" }}>
                            {log.code}
                          </code>
                        </td>
                        <td><strong style={{ fontSize: "13px", color: "#0f172a" }}>{log.productName}</strong></td>
                        <td>
                          <span
                            style={{
                              padding: "3px 10px",
                              borderRadius: "999px",
                              fontSize: "11px",
                              fontWeight: 800,
                              background: log.type === "IMPORT" ? "#dcfce7" : log.type === "EXPORT" ? "#fee2e2" : "#fef3c7",
                              color: log.type === "IMPORT" ? "#15803d" : log.type === "EXPORT" ? "#b91c1c" : "#b45309",
                            }}
                          >
                            {log.type === "IMPORT" ? "🟢 Nhập Kho" : log.type === "EXPORT" ? "🔴 Xuất Kho" : "🟡 Kiểm Kê"}
                          </span>
                        </td>
                        <td style={{ fontWeight: 900, color: log.type === "IMPORT" ? "#15803d" : log.type === "EXPORT" ? "#b91c1c" : "#b45309" }}>
                          {log.type === "IMPORT" ? `+${log.qty}` : log.type === "EXPORT" ? `-${log.qty}` : log.qty}
                        </td>
                        <td style={{ fontWeight: 800, color: "#1e293b" }}>{log.stockAfter} món</td>
                        <td style={{ fontSize: "12px", color: "#475569" }}>
                          <div style={{ fontWeight: 700, color: "#0f172a" }}>{log.supplier}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{log.reason}</div>
                        </td>
                        <td style={{ fontSize: "11.5px", color: "#64748b", fontWeight: 600 }}>{log.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "16px 24px", background: "#f8fafc", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "999px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  fontWeight: 800,
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                Đóng Nhật Ký
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
