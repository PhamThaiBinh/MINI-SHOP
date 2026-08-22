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
  unitPrice?: number;
  totalAmount?: number;
  stockBefore: number;
  stockAfter: number;
  supplier: string;
  reason: string;
  createdAt: string;
}

export interface BatchRowItem {
  productId: number;
  qty: number;
  unitPrice: number;
  countedQty?: number;
  reason?: string;
}

export default function AdminProductsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Stock Inventory Ledger Modal States (Nhập Xuất Tồn Kho Workspace)
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [inventoryActiveTab, setInventoryActiveTab] = useState<"FORM" | "LEDGER">("FORM");
  const [inventoryMode, setInventoryMode] = useState<"IMPORT" | "EXPORT" | "AUDIT">("IMPORT");
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);

  // Single mode state
  const [selectedInventoryProdId, setSelectedInventoryProdId] = useState<number>(0);
  const [inventoryProdSearch, setInventoryProdSearch] = useState<string>("");
  const [isInventoryProdDropdownOpen, setIsInventoryProdDropdownOpen] = useState<boolean>(false);
  const [inventoryQty, setInventoryQty] = useState<string>("10");
  const [inventoryUnitPrice, setInventoryUnitPrice] = useState<string>("0");
  const [inventorySupplier, setInventorySupplier] = useState<string>("");
  const [inventoryReason, setInventoryReason] = useState<string>("");
  const [discrepancyPresetReason, setDiscrepancyPresetReason] = useState<string>("Mất hàng / Thất thoát kiểm kho");

  // Batch mode state
  const [batchRows, setBatchRows] = useState<BatchRowItem[]>([]);

  // Logs state
  const [stockLogs, setStockLogs] = useState<StockLogItem[]>([]);

  // History Log Filter States (Lọc theo Ngày, Tháng, Năm, Loại, Từ khóa)
  const [historyTypeFilter, setHistoryTypeFilter] = useState<string>("ALL");
  const [historyTimeFilterMode, setHistoryTimeFilterMode] = useState<"ALL" | "DAY" | "MONTH" | "YEAR">("ALL");
  const [historyFilterDate, setHistoryFilterDate] = useState<string>("");
  const [historyFilterMonth, setHistoryFilterMonth] = useState<string>("");
  const [historyFilterYear, setHistoryFilterYear] = useState<string>("2026");
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");

  // Product Form state
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStatus, setFormStatus] = useState<"Active" | "Hidden">("Active");
  const [formDesc, setFormDesc] = useState("");
  const [formStock, setFormStock] = useState<string>("15");

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

    // Set immediate local preview so the user instantly sees their selected image
    const localPreviewUrl = URL.createObjectURL(file);
    setFormImageUrl(localPreviewUrl);

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
      (!onlyLowStock || ((p as any).stock !== undefined && (p as any).stock <= 10))
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
      stock: Number(formStock) || 10,
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
    return `${prefix}-${year}${month}${day}-${randNum}`;
  };

  const handleOpenInventoryModal = (prodId?: number, mode: "IMPORT" | "EXPORT" | "AUDIT" = "IMPORT", initialTab: "FORM" | "LEDGER" = "FORM") => {
    setInventoryMode(mode);
    setInventoryActiveTab(initialTab);
    setIsBatchMode(false);

    const targetId = prodId || (products[0]?.id || 1);
    setSelectedInventoryProdId(targetId);
    const targetProd = products.find((p) => p.id === targetId);
    const currentStock = targetProd?.stock !== undefined ? targetProd.stock : 15;
    const defaultPrice = targetProd?.price || 0;

    setInventoryQty(mode === "AUDIT" ? String(currentStock) : "10");
    setInventoryUnitPrice(String(defaultPrice));
    setInventorySupplier(mode === "IMPORT" ? "Tổng Kho Gỗ An Cường" : mode === "EXPORT" ? "Showroom Chi Nhánh 1" : "Ban Kiểm Kê Nội Bộ");
    setInventoryReason(mode === "IMPORT" ? "Nhập bổ sung hàng định kỳ" : mode === "EXPORT" ? "Xuất kho bán hàng / trưng bày" : "");
    setDiscrepancyPresetReason("Mất hàng / Thất thoát kiểm kho");

    // Initialize 2 default batch rows
    if (products.length > 0) {
      setBatchRows([
        {
          productId: products[0].id,
          qty: 10,
          unitPrice: products[0].price || 0,
          countedQty: products[0].stock !== undefined ? products[0].stock : 15,
          reason: "",
        },
        ...(products.length > 1
          ? [
              {
                productId: products[1].id,
                qty: 5,
                unitPrice: products[1].price || 0,
                countedQty: products[1].stock !== undefined ? products[1].stock : 15,
                reason: "",
              },
            ]
          : []),
      ]);
    } else {
      setBatchRows([]);
    }

    setShowInventoryModal(true);
  };

  const handleAddBatchRow = () => {
    if (products.length === 0) return;
    const firstProd = products[0];
    setBatchRows((prev) => [
      ...prev,
      {
        productId: firstProd.id,
        qty: 5,
        unitPrice: firstProd.price || 0,
        countedQty: firstProd.stock !== undefined ? firstProd.stock : 15,
        reason: "",
      },
    ]);
  };

  const handleRemoveBatchRow = (index: number) => {
    if (batchRows.length <= 1) {
      alert("Phiếu hàng cần tối thiểu 1 dòng sản phẩm!");
      return;
    }
    setBatchRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchRowChange = (index: number, field: keyof BatchRowItem, value: any) => {
    setBatchRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const updated = { ...row, [field]: value };
        if (field === "productId") {
          const matchedP = products.find((p) => p.id === Number(value));
          if (matchedP) {
            updated.unitPrice = matchedP.price || 0;
            updated.countedQty = matchedP.stock !== undefined ? matchedP.stock : 15;
          }
        }
        return updated;
      })
    );
  };

  const handleSaveInventoryTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const codePrefix = inventoryMode === "IMPORT" ? "NK" : inventoryMode === "EXPORT" ? "XK" : "KK";
    const uniqueTicketCode = generateUniqueTicketCode(codePrefix);
    const nowStr = new Date().toLocaleString("vi-VN");

    if (!isBatchMode) {
      // 1. SINGLE PRODUCT MODE
      const qtyVal = parseInt(inventoryQty, 10);
      const unitPriceVal = parseFloat(inventoryUnitPrice) || 0;

      if (isNaN(qtyVal) || qtyVal < 0) {
        alert("Số lượng giao dịch phải là một số không âm (≥ 0)!");
        setLoading(false);
        return;
      }

      const targetProd = products.find((p) => p.id === selectedInventoryProdId);
      if (!targetProd) {
        alert("Chưa chọn sản phẩm!");
        setLoading(false);
        return;
      }

      const currentStock = targetProd.stock !== undefined ? targetProd.stock : 15;
      let newStock = currentStock;
      let finalReason = inventoryReason.trim();

      if (inventoryMode === "IMPORT") {
        if (qtyVal <= 0) {
          alert("Số lượng nhập kho phải lớn hơn 0!");
          setLoading(false);
          return;
        }
        newStock = currentStock + qtyVal;
        if (!finalReason) finalReason = "Nhập bổ sung hàng kho";
      } else if (inventoryMode === "EXPORT") {
        if (qtyVal <= 0) {
          alert("Số lượng xuất kho phải lớn hơn 0!");
          setLoading(false);
          return;
        }
        if (qtyVal > currentStock) {
          alert(`Số lượng xuất (${qtyVal}) vượt quá số tồn kho hiện tại (${currentStock})!`);
          setLoading(false);
          return;
        }
        newStock = currentStock - qtyVal;
        if (!finalReason) finalReason = "Xuất kho bán hàng / điều chuyển";
      } else if (inventoryMode === "AUDIT") {
        newStock = qtyVal;
        const discrepancy = newStock - currentStock;
        if (discrepancy !== 0) {
          finalReason = `[Chênh lệch: ${discrepancy > 0 ? `Thừa +${discrepancy}` : `Thiếu -${Math.abs(discrepancy)}`} món] ${discrepancyPresetReason} ${inventoryReason ? `- ${inventoryReason}` : ""}`;
        } else {
          finalReason = "Kiểm kê khớp 100% tồn kho hệ thống";
        }
      }

      const updatedProd = {
        ...targetProd,
        stock: newStock,
        status: newStock === 0 ? "Hidden" : targetProd.status,
      };

      const success = await saveAdminProduct(updatedProd as any);

      if (success) {
        const newLog: StockLogItem = {
          id: String(Date.now()),
          code: uniqueTicketCode,
          productId: targetProd.id,
          productName: targetProd.name,
          type: inventoryMode,
          qty: qtyVal,
          unitPrice: unitPriceVal,
          totalAmount: qtyVal * unitPriceVal,
          stockBefore: currentStock,
          stockAfter: newStock,
          supplier: inventorySupplier.trim() || (inventoryMode === "IMPORT" ? "Nhà Cung Cấp" : inventoryMode === "EXPORT" ? "Nơi Nhận Xuất" : "Ban Kiểm Kho"),
          reason: finalReason,
          createdAt: nowStr,
        };

        setStockLogs((prev) => [newLog, ...prev]);
        await loadData();
        setShowInventoryModal(false);
        alert(`Lập phiếu thành công!\nMã phiếu: ${uniqueTicketCode}\nSản phẩm: [P${String(targetProd.id).padStart(4, "0")}] ${targetProd.name}\nTồn mới: ${newStock} món.`);
      } else {
        alert("Cập nhật tồn kho thất bại! Vui lòng thử lại.");
      }
    } else {
      // 2. BATCH PRODUCTS MODE (NHIỀU SẢN PHẨM CÙNG LÚC)
      if (batchRows.length === 0) {
        alert("Danh sách sản phẩm trong phiếu đang trống!");
        setLoading(false);
        return;
      }

      const newLogs: StockLogItem[] = [];
      let allSuccess = true;

      for (let i = 0; i < batchRows.length; i++) {
        const row = batchRows[i];
        const targetProd = products.find((p) => p.id === row.productId);
        if (!targetProd) continue;

        const currentStock = targetProd.stock !== undefined ? targetProd.stock : 15;
        let newStock = currentStock;
        let lineQty = row.qty;
        let lineReason = (row.reason || inventoryReason).trim();

        if (inventoryMode === "IMPORT") {
          if (lineQty <= 0) continue;
          newStock = currentStock + lineQty;
          if (!lineReason) lineReason = "Nhập kho theo phiếu hàng loạt";
        } else if (inventoryMode === "EXPORT") {
          if (lineQty <= 0) continue;
          if (lineQty > currentStock) {
            alert(`Sản phẩm [P${String(targetProd.id).padStart(4, "0")}] ${targetProd.name} xuất ${lineQty} món vượt quá tồn hiện tại (${currentStock})!`);
            allSuccess = false;
            break;
          }
          newStock = currentStock - lineQty;
          if (!lineReason) lineReason = "Xuất kho theo phiếu hàng loạt";
        } else if (inventoryMode === "AUDIT") {
          const counted = row.countedQty !== undefined ? row.countedQty : currentStock;
          newStock = counted;
          lineQty = counted;
          const discrepancy = counted - currentStock;
          if (discrepancy !== 0) {
            lineReason = `[Lệch: ${discrepancy > 0 ? `+${discrepancy}` : `-${Math.abs(discrepancy)}`} món] ${discrepancyPresetReason}`;
          } else {
            lineReason = "Khớp 100% hệ thống";
          }
        }

        const updatedProd = {
          ...targetProd,
          stock: newStock,
          status: newStock === 0 ? "Hidden" : targetProd.status,
        };

        const success = await saveAdminProduct(updatedProd as any);
        if (!success) {
          allSuccess = false;
          break;
        }

        newLogs.push({
          id: `${Date.now()}_${i}`,
          code: `${uniqueTicketCode}-${i + 1}`,
          productId: targetProd.id,
          productName: targetProd.name,
          type: inventoryMode,
          qty: lineQty,
          unitPrice: row.unitPrice,
          totalAmount: lineQty * (row.unitPrice || 0),
          stockBefore: currentStock,
          stockAfter: newStock,
          supplier: inventorySupplier.trim() || (inventoryMode === "IMPORT" ? "Nhà Cung Cấp" : inventoryMode === "EXPORT" ? "Nơi Nhận Xuất" : "Ban Kiểm Kho"),
          reason: lineReason,
          createdAt: nowStr,
        });
      }

      if (allSuccess && newLogs.length > 0) {
        setStockLogs((prev) => [...newLogs, ...prev]);
        await loadData();
        setShowInventoryModal(false);
        alert(`Lập phiếu thành công!\nMã phiếu tổng: ${uniqueTicketCode}\nĐã cập nhật ${newLogs.length} mặt hàng.`);
      } else {
        alert("Có lỗi khi cập nhật phiếu hàng loạt. Vui lòng kiểm tra lại số liệu!");
      }
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
          searchPlaceholder="Tìm sản phẩm theo tên, danh mục..."
        />

        <div className="dashboard-content-body">
          {/* 1. TOP STATS CARDS */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "20px",
              marginBottom: "24px",
            }}
          >
            {/* Stat 1: Total Products */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)",
                border: "1.5px solid #bbf7d0",
                borderRadius: "20px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 20px rgba(46, 125, 50, 0.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "var(--primary-color, #2e7d32)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 16px rgba(46, 125, 50, 0.25)",
                }}
              >
                <i className="fa-solid fa-boxes-stacked"></i>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tổng Sản Phẩm
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                  {products.length}
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#166534", marginTop: "2px" }}>
                  Đang mở bán: {products.filter((p) => p.status === "Active").length} món
                </div>
              </div>
            </div>

            {/* Stat 2: Total Inventory Pieces */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)",
                border: "1.5px solid #bfdbfe",
                borderRadius: "20px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#2563eb",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 16px rgba(37, 99, 235, 0.25)",
                }}
              >
                <i className="fa-solid fa-warehouse"></i>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Tổng Tồn Kho Thực Tế
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#0f172a", marginTop: "2px" }}>
                  {products.reduce((sum, p) => sum + (p.stock !== undefined ? p.stock : 15), 0)} món
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1d4ed8", marginTop: "2px" }}>
                  Phân bố trên {dbCategories.length} nhóm ngành hàng
                </div>
              </div>
            </div>

            {/* Stat 3: Low Stock Warnings */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #fefce8 100%)",
                border: "1.5px solid #fde047",
                borderRadius: "20px",
                padding: "20px 24px",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                boxShadow: "0 4px 20px rgba(234, 179, 8, 0.08)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  background: "#eab308",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  boxShadow: "0 6px 16px rgba(234, 179, 8, 0.25)",
                }}
              >
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Cảnh Báo Tồn Thấp (&le;10)
                </div>
                <div style={{ fontSize: "24px", fontWeight: 900, color: "#854d0e", marginTop: "2px" }}>
                  {products.filter((p) => (p.stock !== undefined ? p.stock : 15) <= 10).length} món
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#a16207", marginTop: "2px" }}>
                  Cần lập phiếu nhập kho bổ sung
                </div>
              </div>
            </div>
          </div>

          {/* 2. PRODUCTS TABLE CARD */}
          <div className="admin-card-shell">
            <div className="admin-card-core">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h2 className="card-header-title text-xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Danh Sách Sản Phẩm Kinh Doanh ({filteredProducts.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "4px 0 0", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Quản lý giá bán, hình ảnh và tồn kho sản phẩm trực tuyến
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => setOnlyLowStock(!onlyLowStock)}
                    style={{
                      padding: "9px 16px",
                      fontSize: "13px",
                      fontWeight: 700,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      border: "1px solid #fde68a",
                      borderRadius: "12px",
                      background: onlyLowStock ? "#fffbeb" : "#fff",
                      color: onlyLowStock ? "#b45309" : "#64748b",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
                    {onlyLowStock ? "Đang lọc: Tồn kho thấp" : "Lọc tồn thấp"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenInventoryModal(undefined, "IMPORT", "FORM")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 18px",
                      borderRadius: "12px",
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
                    <i className="fa-solid fa-warehouse"></i> Nhập Xuất Tồn Kho
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenAddModal}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "9px 18px",
                      borderRadius: "12px",
                      fontWeight: 800,
                      fontSize: "13px",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      background: "var(--primary-color, #2e7d32)",
                      color: "#ffffff",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                    }}
                  >
                    <i className="fa-solid fa-plus"></i> Thêm Sản Phẩm Mới
                  </button>
                </div>
              </div>

              {loading ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                  Đang tải dữ liệu sản phẩm...
                </div>
              ) : (
                <>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>MÃ SẢN PHẨM</th>
                        <th>HÌNH ẢNH & TÊN SẢN PHẨM</th>
                        <th>DANH MỤC</th>
                        <th>GIÁ BÁN</th>
                        <th>TỒN KHO THỰC TẾ</th>
                        <th>TRẠNG THÁI</th>
                        <th style={{ textAlign: "center" }}>THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                            Không tìm thấy sản phẩm nào khớp với tìm kiếm.
                          </td>
                        </tr>
                      ) : (
                        paginatedProducts.map((p, index) => (
                          <tr key={p.id}>
                            <td>
                              <code style={{ padding: "3px 8px", background: "#f1f5f9", color: "#1e293b", borderRadius: "6px", fontWeight: 900, fontSize: "11.5px" }}>
                                P{String(p.id).padStart(4, "0")}
                              </code>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <img
                                  src={fixImagePath(p.image)}
                                  alt={p.name}
                                  style={{
                                    width: "44px",
                                    height: "44px",
                                    borderRadius: "10px",
                                    objectFit: "cover",
                                    border: "1px solid #e2e8f0",
                                  }}
                                />
                                <div>
                                  <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>{p.name}</strong>
                                  <span style={{ fontSize: "11px", color: "#64748b" }}>ID CSDL: #{p.id}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ padding: "3px 10px", borderRadius: "6px", background: "#f8fafc", color: "#475569", fontSize: "12px", fontWeight: 700, border: "1px solid #e2e8f0" }}>
                                {p.categoryName || p.category}
                              </span>
                            </td>
                            <td>
                              <strong style={{ color: "var(--primary-color, #2e7d32)", fontSize: "14px" }}>
                                {formatVND(p.price)}
                              </strong>
                            </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span
                                  style={{
                                    padding: "3px 8px",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: 900,
                                    background: (p.stock !== undefined ? p.stock : 15) <= 5 ? "#fee2e2" : (p.stock !== undefined ? p.stock : 15) <= 10 ? "#fef3c7" : "#dcfce7",
                                    color: (p.stock !== undefined ? p.stock : 15) <= 5 ? "#dc2626" : (p.stock !== undefined ? p.stock : 15) <= 10 ? "#d97706" : "#166534",
                                  }}
                                >
                                  {p.stock !== undefined ? p.stock : 15} món
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                style={{
                                  padding: "3px 10px",
                                  borderRadius: "999px",
                                  fontSize: "11px",
                                  fontWeight: 800,
                                  background: p.status === "Active" ? "#dcfce7" : "#f1f5f9",
                                  color: p.status === "Active" ? "#166534" : "#64748b",
                                }}
                              >
                                {p.status === "Active" ? "● Đang bán" : "○ Đã ẩn"}
                              </span>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenInventoryModal(p.id, "IMPORT", "FORM")}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#f0fdf4",
                                    color: "#166534",
                                    border: "1px solid #bbf7d0",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "11.5px",
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                  title="Lập phiếu kho cho sản phẩm này"
                                >
                                  <i className="fa-solid fa-arrow-down-up-across-line"></i> Kho
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditClick(p)}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#eff6ff",
                                    color: "#2563eb",
                                    border: "1px solid #bfdbfe",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "11.5px",
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i className="fa-solid fa-pen-to-square"></i> Sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(p.id)}
                                  style={{
                                    padding: "5px 10px",
                                    background: "#fef2f2",
                                    color: "#dc2626",
                                    border: "1px solid #fca5a5",
                                    borderRadius: "8px",
                                    cursor: "pointer",
                                    fontSize: "11.5px",
                                    fontWeight: 800,
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                  }}
                                >
                                  <i className="fa-solid fa-trash-can"></i> Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 0 4px 0",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#64748b", fontWeight: 600 }}>
                      <span>Hiển thị</span>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          fontSize: "12.5px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        <option value={5}>5 dòng</option>
                        <option value={10}>10 dòng</option>
                        <option value={20}>20 dòng</option>
                      </select>
                      <span>trên tổng số {filteredProducts.length} sản phẩm</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={safeCurrentPage <= 1}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: safeCurrentPage <= 1 ? "#f8fafc" : "#fff",
                          color: safeCurrentPage <= 1 ? "#94a3b8" : "#334155",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: safeCurrentPage <= 1 ? "not-allowed" : "pointer",
                        }}
                      >
                        Trang trước
                      </button>
                      <span style={{ fontSize: "12.5px", fontWeight: 800, color: "#0f172a", padding: "0 6px" }}>
                        Trang {safeCurrentPage} / {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safeCurrentPage >= totalPages}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "1px solid #cbd5e1",
                          background: safeCurrentPage >= totalPages ? "#f8fafc" : "#fff",
                          color: safeCurrentPage >= totalPages ? "#94a3b8" : "#334155",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: safeCurrentPage >= totalPages ? "not-allowed" : "pointer",
                        }}
                      >
                        Trang sau
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. MODAL THÊM / CHỈNH SỬA SẢN PHẨM */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
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
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              borderRadius: "24px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflowY: "auto",
              border: "1px solid #e2e8f0",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                borderBottom: "1.5px solid #bbf7d0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "var(--primary-color, #2e7d32)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-solid fa-box"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: "17px", fontWeight: 900, color: "#14532d", margin: 0 }}>
                    {editingProduct ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#166534", margin: "2px 0 0", fontWeight: 700 }}>
                    {editingProduct ? `Cập nhật thông tin mã P${String(editingProduct.id).padStart(4, "0")}` : "Tạo mới sản phẩm vào hệ thống bán hàng"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ padding: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "20px", marginBottom: "20px" }}>
                {/* Left: Image Upload & Live Preview */}
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                    Hình Ảnh Sản Phẩm *
                  </label>
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
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
                      />
                    ) : (
                      <div style={{ textAlign: "center", padding: "16px", color: "#94a3b8" }}>
                        <Package className="w-10 h-10 stroke-1 mb-2 text-slate-400 mx-auto" />
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>Chưa chọn ảnh</span>
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
                      marginTop: "8px",
                      padding: "8px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: 800,
                      fontSize: "12px",
                      cursor: isUploadingImage ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i> Tải Ảnh Từ Máy Tính
                  </button>
                  {uploadStatusMsg && (
                    <p style={{ fontSize: "11px", fontWeight: 700, color: uploadStatusMsg.includes("thành công") ? "#15803d" : "#b45309", marginTop: "4px", textAlign: "center" }}>
                      {uploadStatusMsg}
                    </p>
                  )}
                </div>

                {/* Right: Product Metadata */}
                <div>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                      Tên Sản Phẩm *
                    </label>
                    <input
                      type="text"
                      className="form-control admin-setting-input"
                      placeholder="Ví dụ: Bàn Ăn Gỗ Sồi Tự Nhiên"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13.5px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                        Danh Mục *
                      </label>
                      <select
                        className="form-control admin-setting-input"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        required
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                      >
                        {dbCategories.map((c) => (
                          <option key={c.id} value={(c as any).code || c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                        Giá Bán (VNĐ) *
                      </label>
                      <input
                        type="number"
                        className="form-control admin-setting-input"
                        placeholder="Ví dụ: 3500000"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        required
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                        {editingProduct ? "Số Lượng Tồn Hiện Tại (Khóa)" : "Số Lượng Tồn Kho Ban Đầu *"}
                      </label>
                      <input
                        type="number"
                        className="form-control admin-setting-input"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        readOnly={!!editingProduct}
                        style={{
                          borderRadius: "12px",
                          padding: "10px 14px",
                          fontSize: "13px",
                          background: editingProduct ? "#f1f5f9" : "#ffffff",
                          color: editingProduct ? "#64748b" : "#0f172a",
                          fontWeight: 800,
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                        Trạng Thái Hiển Thị *
                      </label>
                      <select
                        className="form-control admin-setting-input"
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as any)}
                        style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                      >
                        <option value="Active">● Đang bán (Hiển thị công khai)</option>
                        <option value="Hidden">○ Đã ẩn (Tạm ngừng kinh doanh)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                  Mô Tả Sản Phẩm
                </label>
                <textarea
                  rows={3}
                  className="form-control admin-setting-input"
                  placeholder="Nhập mô tả chi tiết chất liệu, kích thước..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontWeight: 800,
                    fontSize: "13px",
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 24px",
                    borderRadius: "12px",
                    border: "none",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    fontWeight: 900,
                    fontSize: "13px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                  }}
                >
                  {editingProduct ? "Lưu Thay Đổi" : "Tạo Sản Phẩm Mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. WORKSPACE MODAL: QUẢN LÝ NGHIỆP VỤ NHẬP XUẤT TỒN KHO & NHẬT KÝ (REDESIGNED) */}
      {showInventoryModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              maxWidth: "1040px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              overflow: "hidden",
              border: "1.5px solid #e2e8f0",
            }}
          >
            {/* Modal Header with View Tabs */}
            <div
              style={{
                padding: "18px 24px",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                borderBottom: "1.5px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "14px",
                    background: "var(--primary-color, #2e7d32)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
                  }}
                >
                  <i className="fa-solid fa-warehouse"></i>
                </div>
                <div>
                  <h3 style={{ fontSize: "17.5px", fontWeight: 900, color: "#0f172a", margin: 0 }}>
                    Quản Lý Nghiệp Vụ Nhập Xuất Tồn Kho
                  </h3>
                  <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0", fontWeight: 600 }}>
                    Lập phiếu điều chuyển hàng hóa, đối soát kiểm kê & tra cứu sổ nhật ký kho
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Switcher Tab Buttons */}
                <div style={{ display: "flex", background: "#e2e8f0", padding: "4px", borderRadius: "12px", gap: "4px" }}>
                  <button
                    type="button"
                    onClick={() => setInventoryActiveTab("FORM")}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "9px",
                      border: "none",
                      background: inventoryActiveTab === "FORM" ? "#ffffff" : "transparent",
                      color: inventoryActiveTab === "FORM" ? "#0f172a" : "#64748b",
                      fontWeight: 800,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: inventoryActiveTab === "FORM" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <i className="fa-solid fa-file-circle-plus"></i> Lập Phiếu Kho Mới
                  </button>

                  <button
                    type="button"
                    onClick={() => setInventoryActiveTab("LEDGER")}
                    style={{
                      padding: "7px 14px",
                      borderRadius: "9px",
                      border: "none",
                      background: inventoryActiveTab === "LEDGER" ? "#ffffff" : "transparent",
                      color: inventoryActiveTab === "LEDGER" ? "#0f172a" : "#64748b",
                      fontWeight: 800,
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: inventoryActiveTab === "LEDGER" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                    }}
                  >
                    <i className="fa-solid fa-book-bookmark"></i> Sổ Nhật Ký Giao Dịch ({stockLogs.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowInventoryModal(false)}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: "50%",
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
              {inventoryActiveTab === "FORM" ? (
                /* TAB 1: FORM LẬP PHIẾU KHO */
                <form onSubmit={handleSaveInventoryTransaction}>
                  {/* Top Bar: Dropdown Loại Thao Tác Kho & Chế Độ Batch */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      gap: "16px",
                      marginBottom: "20px",
                      alignItems: "end",
                    }}
                  >
                    {/* Dropdown Operation Selector */}
                    <div>
                      <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                        <i className="fa-solid fa-layer-group" style={{ marginRight: "6px", color: "var(--primary-color, #2e7d32)" }}></i>
                        Loại Thao Tác Nghiệp Vụ Kho *
                      </label>
                      <select
                        value={inventoryMode}
                        onChange={(e) => {
                          const mode = e.target.value as "IMPORT" | "EXPORT" | "AUDIT";
                          setInventoryMode(mode);
                          if (mode === "AUDIT") {
                            const targetProd = products.find((p) => p.id === selectedInventoryProdId);
                            if (targetProd) setInventoryQty(String(targetProd.stock !== undefined ? targetProd.stock : 15));
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "11px 16px",
                          borderRadius: "12px",
                          border: "2px solid #cbd5e1",
                          fontSize: "13.5px",
                          fontWeight: 800,
                          background: inventoryMode === "IMPORT" ? "#f0fdf4" : inventoryMode === "EXPORT" ? "#fef2f2" : "#fffbeb",
                          color: inventoryMode === "IMPORT" ? "#166534" : inventoryMode === "EXPORT" ? "#991b1b" : "#b45309",
                          cursor: "pointer",
                          outline: "none",
                        }}
                      >
                        <option value="IMPORT">📥 Phiếu Nhập Kho (Mã NK... - Bổ sung tồn kho từ xưởng / nhà cung cấp)</option>
                        <option value="EXPORT">📤 Phiếu Xuất Kho (Mã XK... - Xuất giao showroom, bán lẻ, điều chuyển)</option>
                        <option value="AUDIT">📋 Phiếu Kiểm Kê Kho (Mã KK... - Đối soát đếm thực tế vs Sổ sách hệ thống)</option>
                      </select>
                    </div>

                    {/* Batch Mode Checkbox Switch */}
                    <div
                      style={{
                        padding: "10px 16px",
                        borderRadius: "12px",
                        background: isBatchMode ? "#e0f2fe" : "#f8fafc",
                        border: isBatchMode ? "1.5px solid #7dd3fc" : "1.5px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => setIsBatchMode(!isBatchMode)}
                    >
                      <input
                        type="checkbox"
                        checked={isBatchMode}
                        onChange={(e) => setIsBatchMode(e.target.checked)}
                        style={{ width: "16px", height: "16px", cursor: "pointer" }}
                      />
                      <label style={{ fontSize: "13px", fontWeight: 800, color: isBatchMode ? "#0369a1" : "#475569", cursor: "pointer", margin: 0 }}>
                        Lập phiếu cho nhiều sản phẩm (Hàng loạt)
                      </label>
                    </div>
                  </div>

                  {/* Mode Banner Indicator */}
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      background: inventoryMode === "IMPORT" ? "#dcfce7" : inventoryMode === "EXPORT" ? "#fee2e2" : "#fef3c7",
                      border: inventoryMode === "IMPORT" ? "1px solid #bbf7d0" : inventoryMode === "EXPORT" ? "1px solid #fecaca" : "1px solid #fde68a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <i
                        className={
                          inventoryMode === "IMPORT"
                            ? "fa-solid fa-arrow-down text-emerald-700"
                            : inventoryMode === "EXPORT"
                            ? "fa-solid fa-arrow-up text-rose-700"
                            : "fa-solid fa-clipboard-check text-amber-700"
                        }
                        style={{ fontSize: "16px" }}
                      ></i>
                      <strong
                        style={{
                          fontSize: "13px",
                          color: inventoryMode === "IMPORT" ? "#14532d" : inventoryMode === "EXPORT" ? "#7f1d1d" : "#78350f",
                        }}
                      >
                        {inventoryMode === "IMPORT"
                          ? "Quy trình Nhập Kho Hàng Hóa (Tăng tồn thực tế)"
                          : inventoryMode === "EXPORT"
                          ? "Quy trình Xuất Kho Hàng Hóa (Giảm tồn thực tế)"
                          : "Quy trình Kiểm Kê & Cân Bằng Kho (Khớp số lượng thực tế đếm được)"}
                      </strong>
                    </div>
                    <code style={{ background: "#ffffff", padding: "3px 8px", borderRadius: "6px", fontSize: "11.5px", fontWeight: 800, color: "#1e293b" }}>
                      Mã phiếu tự sinh: {inventoryMode === "IMPORT" ? "NK" : inventoryMode === "EXPORT" ? "XK" : "KK"}-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, "0")}{String(new Date().getDate()).padStart(2, "0")}-AUTO
                    </code>
                  </div>

                  {/* FORM CONTENT: SINGLE MODE vs BATCH MODE */}
                  {!isBatchMode ? (
                    /* 1. SINGLE PRODUCT VIEW */
                    <div>
                      {/* Product Selector */}
                      <div style={{ marginBottom: "16px", position: "relative" }}>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                          Sản Phẩm Cần {inventoryMode === "IMPORT" ? "Nhập Kho" : inventoryMode === "EXPORT" ? "Xuất Kho" : "Kiểm Kê"} *
                        </label>

                        <div
                          onClick={() => setIsInventoryProdDropdownOpen(!isInventoryProdDropdownOpen)}
                          style={{
                            border: "1.5px solid #cbd5e1",
                            borderRadius: "12px",
                            padding: "10px 14px",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            minHeight: "44px",
                          }}
                        >
                          {(() => {
                            const sel = products.find((p) => p.id === selectedInventoryProdId);
                            if (!sel) return <span style={{ color: "#94a3b8", fontSize: "13px" }}>Chọn sản phẩm...</span>;
                            return (
                              <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a" }}>
                                <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", marginRight: "6px", color: "#1e293b", fontSize: "11.5px" }}>
                                  [P{String(sel.id).padStart(4, "0")}]
                                </code>
                                {sel.name} — <span style={{ color: "#166534", fontWeight: 800 }}>Tồn kho: {sel.stock !== undefined ? sel.stock : 15} món</span>
                              </span>
                            );
                          })()}
                          <span style={{ fontSize: "11px", color: "#64748b" }}>{isInventoryProdDropdownOpen ? "▲" : "▼"}</span>
                        </div>

                        {/* Searchable Dropdown Popup */}
                        {isInventoryProdDropdownOpen && (
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              left: 0,
                              right: 0,
                              marginTop: "6px",
                              background: "#ffffff",
                              border: "1.5px solid #cbd5e1",
                              borderRadius: "14px",
                              boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                              zIndex: 10000,
                              maxHeight: "240px",
                              overflowY: "auto",
                              padding: "8px",
                            }}
                          >
                            <input
                              type="text"
                              placeholder="Tìm nhanh theo mã [P000X] hoặc tên sản phẩm..."
                              value={inventoryProdSearch}
                              onChange={(e) => setInventoryProdSearch(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "12.5px",
                                marginBottom: "6px",
                                boxSizing: "border-box",
                                outline: "none",
                              }}
                            />

                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              {products
                                .filter((p) => {
                                  const q = inventoryProdSearch.toLowerCase().trim();
                                  if (!q) return true;
                                  const code = `p${String(p.id).padStart(4, "0")}`;
                                  return p.name.toLowerCase().includes(q) || code.includes(q);
                                })
                                .map((p) => {
                                  const isSelected = p.id === selectedInventoryProdId;
                                  return (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        setSelectedInventoryProdId(p.id);
                                        setInventoryUnitPrice(String(p.price || 0));
                                        if (inventoryMode === "AUDIT") {
                                          setInventoryQty(String(p.stock !== undefined ? p.stock : 15));
                                        }
                                        setIsInventoryProdDropdownOpen(false);
                                        setInventoryProdSearch("");
                                      }}
                                      style={{
                                        padding: "8px 10px",
                                        borderRadius: "8px",
                                        background: isSelected ? "#f0fdf4" : "transparent",
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span style={{ fontSize: "13px", fontWeight: isSelected ? 800 : 600, color: isSelected ? "#166534" : "#1e293b" }}>
                                        <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", marginRight: "6px", fontSize: "11.5px" }}>
                                          [P{String(p.id).padStart(4, "0")}]
                                        </code>
                                        {p.name}
                                      </span>
                                      <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
                                        Tồn: <strong>{p.stock !== undefined ? p.stock : 15}</strong> món
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Quantity & Unit Price & Total Grid */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr", gap: "16px", marginBottom: "16px" }}>
                        {/* Quantity Input */}
                        <div>
                          <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                            {inventoryMode === "IMPORT" ? "Số Lượng Nhập (Món)" : inventoryMode === "EXPORT" ? "Số Lượng Xuất (Món)" : "Số Lượng Đếm Thực Tế (Món)"} *
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control admin-setting-input"
                            value={inventoryQty}
                            onChange={(e) => setInventoryQty(e.target.value)}
                            required
                            style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "15px", fontWeight: 900 }}
                          />
                          {/* Quick Pills */}
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                            {["5", "10", "20", "50", "100"].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => setInventoryQty(num)}
                                style={{
                                  padding: "3px 8px",
                                  borderRadius: "6px",
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

                        {/* Unit Price Input */}
                        <div>
                          <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "6px" }}>
                            {inventoryMode === "IMPORT" ? "Đơn Giá Nhập (VNĐ)" : inventoryMode === "EXPORT" ? "Đơn Giá Xuất (VNĐ)" : "Giá Trị Định Mức (VNĐ)"}
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control admin-setting-input"
                            value={inventoryUnitPrice}
                            onChange={(e) => setInventoryUnitPrice(e.target.value)}
                            style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "14px", fontWeight: 800 }}
                          />
                          <span style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", display: "block" }}>
                            = {formatVND(Number(inventoryUnitPrice) || 0)}
                          </span>
                        </div>

                        {/* Total Forecast Box */}
                        {(() => {
                          const targetP = products.find((p) => p.id === selectedInventoryProdId);
                          const currentS = targetP?.stock !== undefined ? targetP.stock : 15;
                          const qtyVal = parseInt(inventoryQty, 10) || 0;
                          const uPrice = parseFloat(inventoryUnitPrice) || 0;
                          const totalVal = qtyVal * uPrice;
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
                                padding: "10px 14px",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <div style={{ fontSize: "11px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
                                {inventoryMode === "AUDIT" ? "Đối Soát Kiểm Kê Hệ Thống" : "Tổng Giá Trị & Tồn Mới"}
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                                <span style={{ fontSize: "13.5px", fontWeight: 700, color: "#64748b" }}>HT: {currentS}</span>
                                <span style={{ fontSize: "13px", color: "#94a3b8" }}>➔</span>
                                <span style={{ fontSize: "16px", fontWeight: 900, color: calcNewS <= 5 ? "#b45309" : "#047857" }}>
                                  {calcNewS} món
                                </span>
                              </div>
                              <div style={{ fontSize: "12px", fontWeight: 900, color: "var(--primary-color, #2e7d32)", marginTop: "2px" }}>
                                {inventoryMode === "AUDIT"
                                  ? discrepancy === 0
                                    ? "✓ Khớp 100% sổ sách"
                                    : discrepancy < 0
                                    ? `! Lệch thiếu: -${Math.abs(discrepancy)} món`
                                    : `! Lệch thừa: +${discrepancy} món`
                                  : `Tổng tiền: ${formatVND(totalVal)}`}
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Audit Discrepancy Reason Selector */}
                      {inventoryMode === "AUDIT" && (
                        <div style={{ marginBottom: "16px", background: "#fefce8", padding: "12px 14px", borderRadius: "12px", border: "1px solid #fef08a" }}>
                          <label style={{ fontSize: "12.5px", fontWeight: 800, color: "#854d0e", display: "block", marginBottom: "6px" }}>
                            Lý Do Lệch Kho / Thất Thoát Hàng Thực Tế *
                          </label>
                          <select
                            className="form-control admin-setting-input"
                            value={discrepancyPresetReason}
                            onChange={(e) => setDiscrepancyPresetReason(e.target.value)}
                            style={{ borderRadius: "10px", padding: "8px 12px", fontSize: "13px", fontWeight: 700 }}
                          >
                            <option value="Mất hàng / Thất thoát kiểm kho">Mất hàng / Thất thoát chưa rõ nguyên nhân</option>
                            <option value="Hư hỏng / Lỗi vận chuyển / Trầy xước">Hư hỏng / Lỗi vận chuyển / Trầy xước gỗ</option>
                            <option value="Sai lệch do đếm sót đợt kiểm trước">Sai lệch đếm sót đợt kiểm kê trước</option>
                            <option value="Xuất hàng dùng thử / Quà tặng mẫu">Xuất hàng dùng thử / Quà tặng trưng bày</option>
                            <option value="Hàng trả về chưa kịp ghi nhận">Hàng khách trả về chưa kịp nhập sổ</option>
                            <option value="Khác (Ghi rõ ở bên dưới)">Lý do khác (Nhập ghi chú chi tiết)</option>
                          </select>
                        </div>
                      )}

                      {/* Partner & Reason */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px", marginBottom: "20px" }}>
                        <div>
                          <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                            {inventoryMode === "IMPORT" ? "Nhà Cung Cấp / Xưởng" : inventoryMode === "EXPORT" ? "Nơi Nhận / Showroom Xuất Đến" : "Đơn Vị / Người Kiểm Kho"}
                          </label>
                          <input
                            type="text"
                            className="form-control admin-setting-input"
                            placeholder={inventoryMode === "IMPORT" ? "Tổng Kho Gỗ An Cường" : inventoryMode === "EXPORT" ? "Showroom Chi Nhánh 1" : "Ban Kiểm Kê Nội Bộ"}
                            value={inventorySupplier}
                            onChange={(e) => setInventorySupplier(e.target.value)}
                            style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                            Ghi Chú Diễn Giải Chi Tiết
                          </label>
                          <input
                            type="text"
                            className="form-control admin-setting-input"
                            placeholder="Ghi chú lý do lập phiếu nhập/xuất/kiểm kê..."
                            value={inventoryReason}
                            onChange={(e) => setInventoryReason(e.target.value)}
                            style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 2. BATCH MODE (NHIỀU SẢN PHẨM CÙNG LÚC TRONG 1 PHIẾU) */
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b" }}>
                          Danh Sách Các Mặt Hàng Trong Phiếu ({batchRows.length} mặt hàng)
                        </label>
                        <button
                          type="button"
                          onClick={handleAddBatchRow}
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: "var(--primary-color, #2e7d32)",
                            color: "#ffffff",
                            fontSize: "12px",
                            fontWeight: 800,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <i className="fa-solid fa-plus"></i> Thêm Dòng Sản Phẩm
                        </button>
                      </div>

                      {/* Batch Rows Table */}
                      <div style={{ maxHeight: "260px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "14px", marginBottom: "16px" }}>
                        <table className="admin-table" style={{ margin: 0 }}>
                          <thead>
                            <tr>
                              <th style={{ width: "40px" }}>STT</th>
                              <th>Sản Phẩm</th>
                              <th>Tồn Hiện Tại</th>
                              <th style={{ width: "120px" }}>
                                {inventoryMode === "IMPORT" ? "SL Nhập" : inventoryMode === "EXPORT" ? "SL Xuất" : "SL Đếm Thực"}
                              </th>
                              <th style={{ width: "140px" }}>Đơn Giá (VNĐ)</th>
                              <th>Thành Tiền / Chênh Lệch</th>
                              <th style={{ width: "50px", textAlign: "center" }}>Xóa</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batchRows.map((row, idx) => {
                              const targetP = products.find((p) => p.id === row.productId);
                              const curStock = targetP?.stock !== undefined ? targetP.stock : 15;
                              const lineTotal = (row.qty || 0) * (row.unitPrice || 0);
                              const discrepancy = (row.countedQty || 0) - curStock;

                              return (
                                <tr key={idx}>
                                  <td><strong>{idx + 1}</strong></td>
                                  <td>
                                    <select
                                      value={row.productId}
                                      onChange={(e) => handleBatchRowChange(idx, "productId", Number(e.target.value))}
                                      style={{
                                        padding: "6px 10px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "12.5px",
                                        fontWeight: 700,
                                        width: "100%",
                                        maxWidth: "240px",
                                      }}
                                    >
                                      {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                          [P{String(p.id).padStart(4, "0")}] {p.name}
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td>
                                    <span style={{ fontWeight: 800, color: "#64748b" }}>{curStock} món</span>
                                  </td>
                                  <td>
                                    {inventoryMode === "AUDIT" ? (
                                      <input
                                        type="number"
                                        min="0"
                                        value={row.countedQty !== undefined ? row.countedQty : curStock}
                                        onChange={(e) => handleBatchRowChange(idx, "countedQty", Number(e.target.value))}
                                        style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "90px", fontWeight: 800 }}
                                      />
                                    ) : (
                                      <input
                                        type="number"
                                        min="1"
                                        value={row.qty}
                                        onChange={(e) => handleBatchRowChange(idx, "qty", Number(e.target.value))}
                                        style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "90px", fontWeight: 800 }}
                                      />
                                    )}
                                  </td>
                                  <td>
                                    <input
                                      type="number"
                                      min="0"
                                      value={row.unitPrice}
                                      onChange={(e) => handleBatchRowChange(idx, "unitPrice", Number(e.target.value))}
                                      style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #cbd5e1", width: "120px", fontWeight: 800 }}
                                    />
                                  </td>
                                  <td>
                                    {inventoryMode === "AUDIT" ? (
                                      <span style={{ fontSize: "12px", fontWeight: 800, color: discrepancy === 0 ? "#166534" : discrepancy < 0 ? "#dc2626" : "#d97706" }}>
                                        {discrepancy === 0 ? "Khớp" : discrepancy < 0 ? `Thiếu -${Math.abs(discrepancy)}` : `Thừa +${discrepancy}`}
                                      </span>
                                    ) : (
                                      <span style={{ fontSize: "13px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                                        {formatVND(lineTotal)}
                                      </span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveBatchRow(idx)}
                                      style={{
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        border: "none",
                                        background: "#fee2e2",
                                        color: "#dc2626",
                                        cursor: "pointer",
                                      }}
                                    >
                                      <i className="fa-solid fa-trash-can"></i>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Batch Summary Bar */}
                      <div
                        style={{
                          padding: "12px 16px",
                          borderRadius: "12px",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                        }}
                      >
                        <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
                          Tổng số mặt hàng: <strong style={{ color: "#0f172a" }}>{batchRows.length}</strong> • Tổng số lượng:{" "}
                          <strong style={{ color: "#0f172a" }}>
                            {batchRows.reduce((sum, r) => sum + (inventoryMode === "AUDIT" ? (r.countedQty || 0) : (r.qty || 0)), 0)} món
                          </strong>
                        </div>
                        {inventoryMode !== "AUDIT" && (
                          <div style={{ fontSize: "14px", fontWeight: 900, color: "var(--primary-color, #2e7d32)" }}>
                            Tổng giá trị phiếu: {formatVND(batchRows.reduce((sum, r) => sum + (r.qty || 0) * (r.unitPrice || 0), 0))}
                          </div>
                        )}
                      </div>

                      {/* Partner & Notes for Batch */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px", marginBottom: "20px" }}>
                        <div>
                          <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                            {inventoryMode === "IMPORT" ? "Nhà Cung Cấp / Xưởng" : inventoryMode === "EXPORT" ? "Nơi Nhận / Showroom Xuất Đến" : "Đơn Vị / Người Kiểm Kho"}
                          </label>
                          <input
                            type="text"
                            className="form-control admin-setting-input"
                            placeholder={inventoryMode === "IMPORT" ? "Tổng Kho Gỗ An Cường" : inventoryMode === "EXPORT" ? "Showroom Chi Nhánh 1" : "Ban Kiểm Kê Nội Bộ"}
                            value={inventorySupplier}
                            onChange={(e) => setInventorySupplier(e.target.value)}
                            style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: "13px", fontWeight: 800, color: "#1e293b", display: "block", marginBottom: "4px" }}>
                            Ghi Chú Chung Cho Toàn Phiếu
                          </label>
                          <input
                            type="text"
                            className="form-control admin-setting-input"
                            placeholder="Ghi chú tổng hợp cho lô hàng..."
                            value={inventoryReason}
                            onChange={(e) => setInventoryReason(e.target.value)}
                            style={{ borderRadius: "12px", padding: "10px 14px", fontSize: "13px" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Form Action Buttons */}
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      onClick={() => setShowInventoryModal(false)}
                      style={{
                        padding: "11px 22px",
                        borderRadius: "12px",
                        border: "1px solid #cbd5e1",
                        background: "#ffffff",
                        fontWeight: 800,
                        fontSize: "13px",
                        cursor: "pointer",
                        color: "#475569",
                      }}
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      style={{
                        padding: "11px 28px",
                        borderRadius: "12px",
                        border: "none",
                        background:
                          inventoryMode === "IMPORT"
                            ? "linear-gradient(135deg, #065f46 0%, #047857 100%)"
                            : inventoryMode === "EXPORT"
                            ? "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)"
                            : "linear-gradient(135deg, #78350f 0%, #d97706 100%)",
                        color: "#ffffff",
                        fontWeight: 900,
                        fontSize: "13.5px",
                        cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(6, 95, 70, 0.25)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <i
                        className={
                          inventoryMode === "IMPORT"
                            ? "fa-solid fa-arrow-down"
                            : inventoryMode === "EXPORT"
                            ? "fa-solid fa-arrow-up"
                            : "fa-solid fa-clipboard-check"
                        }
                      ></i>
                      {inventoryMode === "IMPORT"
                        ? "Xác Nhận Lập Phiếu Nhập Kho"
                        : inventoryMode === "EXPORT"
                        ? "Xác Nhận Lập Phiếu Xuất Kho"
                        : "Xác Nhận Cân Bằng Tồn Kho"}
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: SỔ NHẬT KÝ GIAO DỊCH KHO (STOCK LEDGER) */
                <div>
                  {/* Ledger Filters */}
                  <div
                    style={{
                      padding: "14px 16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                      marginBottom: "16px",
                      display: "flex",
                      gap: "12px",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
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
                      }}
                    />

                    <select
                      value={historyTypeFilter}
                      onChange={(e) => setHistoryTypeFilter(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                        fontWeight: 700,
                      }}
                    >
                      <option value="ALL">Tất cả loại giao dịch</option>
                      <option value="IMPORT">Nhập Kho (Tăng tồn)</option>
                      <option value="EXPORT">Xuất Kho (Giảm tồn)</option>
                      <option value="AUDIT">Kiểm Kê & Cân Bằng</option>
                    </select>

                    <select
                      value={historyTimeFilterMode}
                      onChange={(e) => setHistoryTimeFilterMode(e.target.value as any)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        fontSize: "12.5px",
                        fontWeight: 700,
                      }}
                    >
                      <option value="ALL">Tất cả thời gian</option>
                      <option value="DAY">Lọc theo Ngày</option>
                      <option value="MONTH">Lọc theo Tháng</option>
                      <option value="YEAR">Lọc theo Năm</option>
                    </select>

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
                        }}
                      >
                        <option value="2026">Năm 2026</option>
                        <option value="2025">Năm 2025</option>
                        <option value="2024">Năm 2024</option>
                      </select>
                    )}
                  </div>

                  {/* Ledger Table */}
                  {(() => {
                    const filteredLogs = stockLogs.filter((log) => {
                      if (historyTypeFilter !== "ALL" && log.type !== historyTypeFilter) return false;
                      if (historySearchQuery.trim()) {
                        const q = historySearchQuery.toLowerCase();
                        const matchCode = log.code.toLowerCase().includes(q);
                        const matchName = log.productName.toLowerCase().includes(q);
                        const matchSupplier = log.supplier.toLowerCase().includes(q);
                        const matchReason = log.reason.toLowerCase().includes(q);
                        if (!matchCode && !matchName && !matchSupplier && !matchReason) return false;
                      }
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
                      <div style={{ maxHeight: "360px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "14px" }}>
                        {filteredLogs.length === 0 ? (
                          <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                            <Package className="w-12 h-12 stroke-1 text-slate-300 mx-auto mb-2" />
                            <p style={{ fontSize: "14px", fontWeight: 700, margin: "8px 0 4px" }}>Chưa có bản ghi giao dịch kho nào khớp bộ lọc</p>
                            <p style={{ fontSize: "12px", color: "#94a3b8" }}>Các giao dịch Nhập, Xuất, Kiểm kê kho sẽ tự động lưu lại vào sổ này.</p>
                          </div>
                        ) : (
                          <table className="admin-table" style={{ margin: 0 }}>
                            <thead>
                              <tr>
                                <th>Mã Phiếu Duy Nhất</th>
                                <th>Sản Phẩm</th>
                                <th>Loại Giao Dịch</th>
                                <th>Số Lượng</th>
                                <th>Đơn Giá & Thành Tiền</th>
                                <th>Tồn Sau GD</th>
                                <th>Đối Tác / Lý Do</th>
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
                                  <td>
                                    <strong style={{ fontSize: "13px", color: "#0f172a" }}>{log.productName}</strong>
                                  </td>
                                  <td>
                                    <span
                                      style={{
                                        padding: "4px 10px",
                                        borderRadius: "999px",
                                        fontSize: "11.5px",
                                        fontWeight: 800,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        background: log.type === "IMPORT" ? "#dcfce7" : log.type === "EXPORT" ? "#fee2e2" : "#fef3c7",
                                        color: log.type === "IMPORT" ? "#15803d" : log.type === "EXPORT" ? "#b91c1c" : "#b45309",
                                      }}
                                    >
                                      <i
                                        className={
                                          log.type === "IMPORT"
                                            ? "fa-solid fa-arrow-down"
                                            : log.type === "EXPORT"
                                            ? "fa-solid fa-arrow-up"
                                            : "fa-solid fa-clipboard-check"
                                        }
                                      ></i>
                                      {log.type === "IMPORT" ? "Nhập Kho" : log.type === "EXPORT" ? "Xuất Kho" : "Kiểm Kê"}
                                    </span>
                                  </td>
                                  <td style={{ fontWeight: 900, color: log.type === "IMPORT" ? "#15803d" : log.type === "EXPORT" ? "#b91c1c" : "#b45309" }}>
                                    {log.qty} món
                                  </td>
                                  <td>
                                    {log.totalAmount ? (
                                      <div>
                                        <strong style={{ fontSize: "12.5px", color: "var(--primary-color, #2e7d32)" }}>{formatVND(log.totalAmount)}</strong>
                                        <span style={{ fontSize: "11px", color: "#64748b", display: "block" }}>({formatVND(log.unitPrice || 0)}/món)</span>
                                      </div>
                                    ) : (
                                      <span style={{ color: "#94a3b8", fontSize: "12px" }}>-</span>
                                    )}
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
