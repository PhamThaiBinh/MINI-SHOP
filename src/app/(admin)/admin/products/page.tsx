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
import { uploadProductImage } from "@/lib/supabaseStorage";

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
  const [discrepancyPresetReason, setDiscrepancyPresetReason] = useState<string>("Mất hàng / Thất thoát kiểm kho");
  const [stockLogs, setStockLogs] = useState<StockLogItem[]>([]);

  // History Log Filter States (Lọc theo Ngày, Tháng, Năm, Loại, Từ khóa)
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("ALL");
  const [historyTimeFilterMode, setHistoryTimeFilterMode] = useState<"ALL" | "DAY" | "MONTH" | "YEAR">("ALL");
  const [historyFilterDate, setHistoryFilterDate] = useState<string>("");
  const [historyFilterMonth, setHistoryFilterMonth] = useState<string>("");
  const [historyFilterYear, setHistoryFilterYear] = useState<string>("2026");
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");

  // Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");
  const [formStock, setFormStock] = useState<string>("15");
  const [formImportQty, setFormImportQty] = useState<string>("0");

  // Supabase Storage Image Upload States
  const [isUploadingImage, setIsUploadingImage] = useState<boolean>(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn 1 file định dạng hình ảnh (.png, .jpg, .jpeg, .webp)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Dung lượng file tối đa là 5MB");
      return;
    }

    try {
      setIsUploadingImage(true);
      setUploadStatusMsg("Đang tải ảnh lên Supabase Storage...");
      const publicUrl = await uploadProductImage(file);
      if (publicUrl) {
        setFormImageUrl(publicUrl);
        setUploadStatusMsg("Tải ảnh lên Supabase Storage thành công!");
      } else {
        alert("Có lỗi khi tải ảnh lên Supabase Storage. Vui lòng thử lại!");
        setUploadStatusMsg("");
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Tải ảnh thất bại!");
      setUploadStatusMsg("");
    } finally {
      setIsUploadingImage(false);
    }
  };

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

  const generateUniqueTicketCode = (prefix: "NK" | "XK" | "KK") => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const timeTag = Date.now().toString(36).toUpperCase().slice(-4);
    return `${prefix}-${year}${month}${day}-${timeTag}${randNum}`;
  };

  const handleOpenInventoryModal = (prodId?: number, mode: "IMPORT" | "EXPORT" | "AUDIT" = "IMPORT") => {
    setInventoryMode(mode);
    const targetId = prodId || (products[0]?.id || 1);
    setSelectedInventoryProdId(targetId);
    const targetProd = products.find((p) => p.id === targetId);
    const currentStock = targetProd?.stock !== undefined ? targetProd.stock : 15;

    setInventoryQty(mode === "AUDIT" ? String(currentStock) : "10");
    setInventorySupplier(mode === "IMPORT" ? "Tổng Kho Gỗ An Cường" : mode === "EXPORT" ? "Showroom Chi Nhánh 1" : "Bộ Phận Kiểm Kê Kho");
    setInventoryReason(mode === "IMPORT" ? "Nhập bổ sung hàng khi kho cạn" : mode === "EXPORT" ? "Xuất kho phục vụ bán hàng" : "");
    setDiscrepancyPresetReason("Mất hàng / Thất thoát kiểm kho");
    setShowInventoryModal(true);
  };

  const handleSaveInventoryTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyVal = parseInt(inventoryQty, 10);
    if (isNaN(qtyVal) || qtyVal < 0) {
      alert("Số lượng giao dịch phải là một số không âm (≥ 0)!");
      return;
    }

    const targetProd = products.find((p) => p.id === selectedInventoryProdId);
    if (!targetProd) {
      alert("Chưa chọn sản phẩm!");
      return;
    }

    const currentStock = targetProd.stock !== undefined ? targetProd.stock : 15;
    let newStock = currentStock;
    let finalReason = inventoryReason.trim();

    if (inventoryMode === "IMPORT") {
      if (qtyVal <= 0) {
        alert("Số lượng nhập kho phải lớn hơn 0!");
        return;
      }
      newStock = currentStock + qtyVal;
      if (!finalReason) finalReason = "Nhập bổ sung hàng kho";
    } else if (inventoryMode === "EXPORT") {
      if (qtyVal <= 0) {
        alert("Số lượng xuất kho phải lớn hơn 0!");
        return;
      }
      if (qtyVal > currentStock) {
        alert(`Số lượng xuất (${qtyVal}) vượt quá số tồn kho hiện tại (${currentStock})!`);
        return;
      }
      newStock = currentStock - qtyVal;
      if (!finalReason) finalReason = "Xuất kho bán hàng / điều chuyển";
    } else if (inventoryMode === "AUDIT") {
      newStock = qtyVal;
      const discrepancy = newStock - currentStock;

      if (discrepancy !== 0) {
        finalReason = `[Chênh lệch kho: ${discrepancy > 0 ? `Thừa ${discrepancy}` : `Thiếu ${Math.abs(discrepancy)}`} món] ${discrepancyPresetReason} ${inventoryReason ? `- ${inventoryReason}` : ""}`;
      } else {
        finalReason = "Kiểm kê khớp 100% tồn kho hệ thống";
      }
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
      const uniqueCode = generateUniqueTicketCode(codePrefix);

      const newLog: StockLogItem = {
        id: String(Date.now()),
        code: uniqueCode,
        productId: targetProd.id,
        productName: targetProd.name,
        type: inventoryMode,
        qty: qtyVal,
        stockBefore: currentStock,
        stockAfter: newStock,
        supplier: inventorySupplier.trim() || (inventoryMode === "IMPORT" ? "Nhà Cung Cấp" : inventoryMode === "EXPORT" ? "Nơi Nhận Xuất" : "Bộ Phận Kiểm Kho"),
        reason: finalReason,
        createdAt: new Date().toLocaleString("vi-VN"),
      };

      setStockLogs((prev) => [newLog, ...prev]);
      await loadData();
      setShowInventoryModal(false);
      alert(`✅ Cập nhật kho thành công! Mã phiếu duy nhất: ${uniqueCode}. Tồn mới: ${newStock} món.`);
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
                    {onlyLowStock ? (
                      <>
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-1"></i> Đang lọc: Tồn kho thấp
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 mr-1"></i> Cảnh báo tồn thấp
                      </>
                    )}
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
                    <i className="fa-solid fa-boxes-stacked"></i> Nhập Xuất Tồn Kho
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
                  {/* Left Column: Image Live Preview & Supabase Storage Upload Box */}
                  <div>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      Hình Ảnh Sản Phẩm *
                    </label>
                    <div
                      style={{
                        width: "100%",
                        height: "200px",
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
                          <span style={{ fontSize: "12px", fontWeight: 600 }}>Chưa chọn ảnh sản phẩm</span>
                        </div>
                      )}

                      {isUploadingImage && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(15, 23, 42, 0.7)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 800,
                            gap: "8px",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          <i className="fa-solid fa-spinner fa-spin text-emerald-400 text-xl"></i>
                          <span>Đang tải ảnh lên Cloud...</span>
                        </div>
                      )}
                    </div>

                    {/* Supabase Storage Upload Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: "none" }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      style={{
                        width: "100%",
                        marginTop: "10px",
                        padding: "10px 14px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
                        color: "#ffffff",
                        border: "none",
                        fontSize: "12.5px",
                        fontWeight: 800,
                        cursor: isUploadingImage ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(6, 95, 70, 0.25)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <i className="fa-solid fa-cloud-arrow-up text-emerald-300"></i>
                      <span>{isUploadingImage ? "Đang Tải Ảnh..." : "Tải Ảnh Từ Máy Tính"}</span>
                    </button>

                    {uploadStatusMsg && (
                      <p
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: uploadStatusMsg.includes("thành công") ? "#15803d" : "#b45309",
                          marginTop: "6px",
                          marginBottom: 0,
                          textAlign: "center",
                        }}
                      >
                        {uploadStatusMsg}
                      </p>
                    )}

                    <div style={{ marginTop: "10px" }}>
                      <label style={{ fontSize: "11.5px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "4px" }}>
                        Đường Dẫn URL (Tự Động Tạo Hoặc Nhập Thô):
                      </label>
                      <input
                        type="text"
                        className="form-control admin-setting-input"
                        placeholder="https://... hoặc /assets/images/..."
                        value={formImageUrl}
                        onChange={(e) => setFormImageUrl(e.target.value)}
                        style={{ fontSize: "11.5px", borderRadius: "10px", padding: "6px 10px", background: "#f8fafc" }}
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
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          <i className="fa-solid fa-box text-emerald-600"></i> Nhập Thêm Hàng (+Số lượng)
                        </label>
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
                        <option value="Active">Đang bán (Hiển thị công khai)</option>
                        <option value="Hidden">Đã ẩn (Không hiển thị)</option>
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
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1.5px solid #e2e8f0",
              animation: "fadeIn 0.25s ease-out",
            }}
          >
            {/* Modal Header (Bright Theme) */}
            <div
              style={{
                padding: "20px 24px",
                background: inventoryMode === "IMPORT"
                  ? "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)"
                  : inventoryMode === "EXPORT"
                  ? "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)"
                  : "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
                borderBottom: inventoryMode === "IMPORT"
                  ? "1.5px solid #bbf7d0"
                  : inventoryMode === "EXPORT"
                  ? "1.5px solid #fecdd3"
                  : "1.5px solid #fde68a",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <PackageCheck
                    className={`w-6 h-6 ${
                      inventoryMode === "IMPORT" ? "text-emerald-700" : inventoryMode === "EXPORT" ? "text-red-700" : "text-amber-700"
                    }`}
                  />
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 900,
                      margin: 0,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      color: inventoryMode === "IMPORT" ? "#14532d" : inventoryMode === "EXPORT" ? "#7f1d1d" : "#78350f",
                    }}
                  >
                    {inventoryMode === "IMPORT" ? (
                      <>
                        <i className="fa-solid fa-box-archive mr-2"></i> Lập Phiếu Nhập Kho Hàng
                      </>
                    ) : inventoryMode === "EXPORT" ? (
                      <>
                        <i className="fa-solid fa-truck-ramp-box mr-2"></i> Lập Phiếu Xuất Kho Hàng
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-clipboard-check mr-2"></i> Phiếu Kiểm Kê & Cân Bằng Kho
                      </>
                    )}
                  </h3>
                </div>
                <p
                  style={{
                    fontSize: "12.5px",
                    margin: 0,
                    fontWeight: 700,
                    color: inventoryMode === "IMPORT" ? "#166534" : inventoryMode === "EXPORT" ? "#991b1b" : "#b45309",
                  }}
                >
                  Mã Phiếu Duy Nhất: <span style={{ background: "#ffffff", padding: "2px 8px", borderRadius: "6px", fontWeight: 900, border: "1px solid rgba(0,0,0,0.1)", letterSpacing: "0.03em" }}>
                    {inventoryMode === "IMPORT" ? "NK" : inventoryMode === "EXPORT" ? "XK" : "KK"}-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, "0")}{String(new Date().getDate()).padStart(2, "0")}-AUTO
                  </span>
                </p>
              </div>
              <button
                onClick={() => setShowInventoryModal(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
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
                  Loại Thao Tác Nhập / Xuất / Kiểm Kê Kho *
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
                    <span><i className="fa-solid fa-box-archive text-emerald-400 mr-1"></i> Nhập Kho Hàng</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: 600 }}>Tăng tồn thực tế</span>
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
                    <span>🔴 Xuất Kho Hàng</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: 600 }}>Giảm tồn thực tế</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setInventoryMode("AUDIT");
                      const targetProd = products.find((p) => p.id === selectedInventoryProdId);
                      if (targetProd) setInventoryQty(String(targetProd.stock !== undefined ? targetProd.stock : 15));
                    }}
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
                    <span>🟡 Kiểm Kê Thực Tế</span>
                    <span style={{ fontSize: "11px", opacity: 0.8, fontWeight: 600 }}>Đếm số tồn thực</span>
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
                  onChange={(e) => {
                    const newProdId = Number(e.target.value);
                    setSelectedInventoryProdId(newProdId);
                    if (inventoryMode === "AUDIT") {
                      const p = products.find((prod) => prod.id === newProdId);
                      if (p) setInventoryQty(String(p.stock !== undefined ? p.stock : 15));
                    }
                  }}
                  required
                  style={{ borderRadius: "12px", padding: "12px 14px", fontSize: "14px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (P{String(p.id).padStart(4, "0")}) — 📦 Tồn kho hệ thống: {p.stock !== undefined ? p.stock : 15} món
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity Inputs & Quick Pills (Clean Numbers without + or -) */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {inventoryMode === "IMPORT" ? "Số Lượng Nhập (Món)" : inventoryMode === "EXPORT" ? "Số Lượng Xuất (Món)" : "Số Lượng Thực Tế Đếm Được (Món)"} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="form-control admin-setting-input"
                    value={inventoryQty}
                    onChange={(e) => setInventoryQty(e.target.value)}
                    required
                    style={{ borderRadius: "12px", padding: "12px 14px", fontSize: "16px", fontWeight: 900, color: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  {/* Quick Pills (Clean Numbers) */}
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
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stock Math & Audit Discrepancy Preview */}
                {(() => {
                  const targetP = products.find((p) => p.id === selectedInventoryProdId);
                  const currentS = targetP?.stock !== undefined ? targetP.stock : 15;
                  const qtyVal = parseInt(inventoryQty, 10) || 0;
                  let calcNewS = currentS;
                  let discrepancy = 0;

                  if (inventoryMode === "IMPORT") calcNewS = currentS + qtyVal;
                  else if (inventoryMode === "EXPORT") calcNewS = Math.max(0, currentS - qtyVal);
                  else if (inventoryMode === "AUDIT") {
                    calcNewS = qtyVal;
                    discrepancy = qtyVal - currentS;
                  }

                  return (
                    <div
                      style={{
                        background: inventoryMode === "AUDIT" && discrepancy !== 0 ? "#fffbeb" : "#f8fafc",
                        border: inventoryMode === "AUDIT" && discrepancy !== 0 ? "1.5px solid #fde68a" : "1.5px solid #e2e8f0",
                        borderRadius: "14px",
                        padding: "12px 16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                        {inventoryMode === "AUDIT" ? "Đối Soát Kiểm Kê Hệ Thống" : "Tồn Kho Sau Giao Dịch"}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "15px", fontWeight: 700, color: "#64748b" }}>HT: {currentS}</span>
                        <span style={{ fontSize: "14px", color: "#94a3b8" }}>➔</span>
                        <span style={{ fontSize: "20px", fontWeight: 900, color: calcNewS <= 5 ? "#b45309" : "#047857" }}>
                          {calcNewS} <span style={{ fontSize: "12px", fontWeight: 700 }}>món</span>
                        </span>
                      </div>

                      {inventoryMode === "AUDIT" ? (
                        <div style={{ fontSize: "11.5px", fontWeight: 800, color: discrepancy === 0 ? "#047857" : discrepancy < 0 ? "#b91c1c" : "#b45309", marginTop: "4px" }}>
                          {discrepancy === 0
                            ? "✅ Đếm thực tế khớp 100% hệ thống"
                            : discrepancy < 0
                            ? `⚠️ Thất thoát / Thiếu ${Math.abs(discrepancy)} món so với sổ sách`
                            : `ℹ️ Thừa ${discrepancy} món so với sổ sách`}
                        </div>
                      ) : (
                        <div style={{ fontSize: "11.5px", fontWeight: 800, color: inventoryMode === "IMPORT" ? "#047857" : "#b91c1c", marginTop: "4px" }}>
                          {inventoryMode === "IMPORT" ? `Bổ sung kho: ${qtyVal} món` : `Xuất bán / chuyển: ${qtyVal} món`}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* AUDIT DISCREPANCY REASON SELECTOR (Nghiệp vụ kiểm kê khớp hệ thống) */}
              {inventoryMode === "AUDIT" && (
                <div style={{ marginBottom: "16px", background: "#fefce8", padding: "14px", borderRadius: "14px", border: "1px solid #fef08a" }}>
                  <label style={{ fontSize: "12.5px", fontWeight: 800, color: "#854d0e", display: "block", marginBottom: "8px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Lý Do Lệch Kho / Thất Thoát Hàng Thực Tế *
                  </label>
                  <select
                    className="form-control admin-setting-input"
                    value={discrepancyPresetReason}
                    onChange={(e) => setDiscrepancyPresetReason(e.target.value)}
                    style={{ borderRadius: "10px", padding: "10px 12px", fontSize: "13px", fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: "8px" }}
                  >
                    <option value="Mất hàng / Thất thoát kiểm kho">❓ Mất hàng / Thất thoát chưa rõ nguyên nhân</option>
                    <option value="Hư hỏng / Lỗi vận chuyển / Trầy xước">📦 Hư hỏng / Lỗi vận chuyển / Trầy xước gỗ</option>
                    <option value="Sai lệch do đếm sót đợt kiểm trước">📋 Sai lệch đếm sót đợt kiểm kê trước</option>
                    <option value="Xuất hàng dùng thử / Quà tặng mẫu">🎁 Xuất hàng dùng thử / Quà tặng trưng bày</option>
                    <option value="Hàng trả về chưa kịp ghi nhận">🔄 Hàng khách trả về chưa kịp nhập sổ</option>
                    <option value="Khác (Ghi rõ ở bên dưới)">✍️ Lý do khác (Nhập ghi chú chi tiết bên dưới)</option>
                  </select>
                </div>
              )}

              {/* Supplier / Destination */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {inventoryMode === "IMPORT" ? "Nhà Cung Cấp / Xưởng Sản Xuất" : inventoryMode === "EXPORT" ? "Nơi Nhận / Showroom Xuất Đến" : "Đơn Vị / Cá Nhân Thực Hiện Kiểm Kho"}
                </label>
                <input
                  type="text"
                  className="form-control admin-setting-input"
                  placeholder={inventoryMode === "IMPORT" ? "Tổng Kho Gỗ An Cường / Xưởng Đồng Nai" : inventoryMode === "EXPORT" ? "Showroom Quận 1 / Kho Hàng Trưng Bày" : "Ban Kiểm Kê Nội Bộ Kho"}
                  value={inventorySupplier}
                  onChange={(e) => setInventorySupplier(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                />
              </div>

              {/* Reason & Notes */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Ghi Chú Bổ Sung & Diễn Giải Chi Tiết
                </label>
                <textarea
                  rows={2}
                  className="form-control admin-setting-input"
                  placeholder="Ghi chú chi tiết lý do lập phiếu nhập/xuất/kiểm kê..."
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

      {/* 5. HISTORICAL STOCK LEDGER LOGS MODAL (BỘ LỌC NGÀY, THÁNG, NĂM & TÌM KIẾM DỮ LIỆU) */}
      {showHistoryModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(8px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px 16px",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "24px",
              width: "100%",
              maxWidth: "920px",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1.5px solid #e2e8f0",
            }}
          >
            {/* Bright Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
                borderBottom: "1.5px solid #bae6fd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <History className="w-6 h-6 text-sky-600" />
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 900, margin: 0, color: "#0369a1", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    📜 Nhật Ký Lịch Sử Giao Dịch Nhập Xuất Tồn Kho
                  </h3>
                  <p style={{ fontSize: "12px", color: "#0284c7", margin: 0, fontWeight: 700 }}>Theo dõi biến động kho hàng tự động theo thời gian thực</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FILTER BAR FOR HISTORY LOGS (Lọc theo Ngày, Tháng, Năm) */}
            <div style={{ padding: "14px 24px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                {/* Search Bar */}
                <input
                  type="text"
                  placeholder="Tìm mã phiếu, tên SP, nhà cung cấp, lý do..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    minWidth: "240px",
                    flex: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                />

                {/* Filter Type Selector */}
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <option value="ALL">Tất cả loại giao dịch</option>
                  <option value="IMPORT">🟢 Nhập Kho</option>
                  <option value="EXPORT">🔴 Xuất Kho</option>
                  <option value="AUDIT">🟡 Kiểm Kê Kho</option>
                </select>

                {/* Filter Time Mode Selector */}
                <select
                  value={historyTimeFilterMode}
                  onChange={(e) => setHistoryTimeFilterMode(e.target.value as any)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    fontSize: "12.5px",
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  <option value="ALL">Tất cả thời gian</option>
                  <option value="DAY">📅 Lọc theo Ngày</option>
                  <option value="MONTH">🗓️ Lọc theo Tháng</option>
                  <option value="YEAR">📈 Lọc theo Năm</option>
                </select>

                {/* Dynamic Date/Month/Year Picker Input */}
                {historyTimeFilterMode === "DAY" && (
                  <input
                    type="date"
                    value={historyFilterDate}
                    onChange={(e) => setHistoryFilterDate(e.target.value)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid #0284c7",
                      fontSize: "12.5px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                )}

                {historyTimeFilterMode === "MONTH" && (
                  <input
                    type="month"
                    value={historyFilterMonth}
                    onChange={(e) => setHistoryFilterMonth(e.target.value)}
                    style={{
                      padding: "7px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid #0284c7",
                      fontSize: "12.5px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  />
                )}

                {historyTimeFilterMode === "YEAR" && (
                  <select
                    value={historyFilterYear}
                    onChange={(e) => setHistoryFilterYear(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1.5px solid #0284c7",
                      fontSize: "12.5px",
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    <option value="2026">Năm 2026</option>
                    <option value="2025">Năm 2025</option>
                    <option value="2024">Năm 2024</option>
                  </select>
                )}
              </div>
            </div>

            {/* Content Table */}
            {(() => {
              const filteredLogs = stockLogs.filter((log) => {
                // Type Filter
                if (historyTypeFilter !== "ALL" && log.type !== historyTypeFilter) return false;

                // Search Query Filter
                if (historySearchQuery.trim()) {
                  const q = historySearchQuery.toLowerCase();
                  const matchCode = log.code.toLowerCase().includes(q);
                  const matchName = log.productName.toLowerCase().includes(q);
                  const matchSupplier = log.supplier.toLowerCase().includes(q);
                  const matchReason = log.reason.toLowerCase().includes(q);
                  if (!matchCode && !matchName && !matchSupplier && !matchReason) return false;
                }

                // Time Filter Mode
                if (historyTimeFilterMode === "DAY" && historyFilterDate) {
                  const parts = historyFilterDate.split("-");
                  if (parts.length === 3) {
                    const formattedMatch = `${parts[2]}/${parts[1]}/${parts[0]}`;
                    if (!log.createdAt.includes(formattedMatch)) return false;
                  }
                } else if (historyTimeFilterMode === "MONTH" && historyFilterMonth) {
                  const parts = historyFilterMonth.split("-");
                  if (parts.length === 2) {
                    const formattedMatch = `/${parts[1]}/${parts[0]}`;
                    if (!log.createdAt.includes(formattedMatch)) return false;
                  }
                } else if (historyTimeFilterMode === "YEAR" && historyFilterYear) {
                  if (!log.createdAt.includes(historyFilterYear)) return false;
                }

                return true;
              });

              return (
                <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
                  {filteredLogs.length === 0 ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                      <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                      <p style={{ fontSize: "14px", fontWeight: 700, margin: "8px 0 4px" }}>Không tìm thấy phiếu kho nào khớp bộ lọc</p>
                      <p style={{ fontSize: "12px", color: "#94a3b8" }}>Thử thay đổi từ khóa hoặc bộ lọc thời gian.</p>
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Mã Phiếu Duy Nhất</th>
                          <th>Sản Phẩm</th>
                          <th>Loại</th>
                          <th>Số Lượng (Món)</th>
                          <th>Tồn Sau GD</th>
                          <th>Nhà Cung Cấp / Lý Do</th>
                          <th>Thời Gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log) => (
                          <tr key={log.id}>
                            <td>
                              <code style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px", fontWeight: 900, fontSize: "11.5px", color: "#0f172a" }}>
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
                            {/* Raw Clean Number Display without + or - */}
                            <td style={{ fontWeight: 900, color: log.type === "IMPORT" ? "#15803d" : log.type === "EXPORT" ? "#b91c1c" : "#b45309" }}>
                              {log.qty} món
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
              );
            })()}

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
