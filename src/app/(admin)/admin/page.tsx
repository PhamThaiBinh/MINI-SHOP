"use client";

import React, { useState } from "react";
import Link from "next/link";
import "@/styles/admin.css";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminDashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [salesPeriod, setSalesPeriod] = useState("7days");
  const [hoverPointIndex, setHoverPointIndex] = useState<number | null>(null);

  const SALES_DATA: Record<
    string,
    {
      total: string;
      totalGrowth: string;
      orders: string;
      ordersGrowth: string;
      avg: string;
      avgGrowth: string;
      conv: string;
      convGrowth: string;
      pathLine: string;
      pathArea: string;
      points: { x: number; y: number; label: string; value: string; date: string }[];
    }
  > = {
    "7days": {
      total: "42.580.000đ",
      totalGrowth: "↑ 18.6%",
      orders: "128",
      ordersGrowth: "↑ 12.4%",
      avg: "332.656đ",
      avgGrowth: "↑ 5.7%",
      conv: "2.35%",
      convGrowth: "↑ 8.1%",
      pathLine: "M 15,130 L 130,100 L 250,40 L 370,90 L 485,30",
      pathArea:
        "M 15,130 L 130,100 L 250,40 L 370,90 L 485,30 L 485,160 L 15,160 Z",
      points: [
        { x: 15, y: 130, label: "4.2M", value: "4.250.000đ", date: "09/08" },
        { x: 130, y: 100, label: "6.8M", value: "6.800.000đ", date: "10/08" },
        { x: 250, y: 40, label: "14.5M", value: "14.500.000đ", date: "11/08" },
        { x: 370, y: 90, label: "8.1M", value: "8.100.000đ", date: "12/08" },
        { x: 485, y: 30, label: "16.8M", value: "16.800.000đ", date: "13/08" },
      ],
    },
    "30days": {
      total: "186.400.000đ",
      totalGrowth: "↑ 24.2%",
      orders: "540",
      ordersGrowth: "↑ 15.8%",
      avg: "345.185đ",
      avgGrowth: "↑ 6.2%",
      conv: "2.80%",
      convGrowth: "↑ 9.4%",
      pathLine: "M 15,150 L 130,80 L 250,110 L 370,50 L 485,20",
      pathArea:
        "M 15,150 L 130,80 L 250,110 L 370,50 L 485,20 L 485,160 L 15,160 Z",
      points: [
        { x: 15, y: 150, label: "18.2M", value: "18.200.000đ", date: "Tuần 1" },
        { x: 130, y: 80, label: "42.0M", value: "42.000.000đ", date: "Tuần 2" },
        { x: 250, y: 110, label: "31.5M", value: "31.500.000đ", date: "Tuần 3" },
        { x: 370, y: 50, label: "58.2M", value: "58.200.000đ", date: "Tuần 4" },
        { x: 485, y: 20, label: "72.4M", value: "72.400.000đ", date: "Hôm nay" },
      ],
    },
    "90days": {
      total: "512.900.000đ",
      totalGrowth: "↑ 31.0%",
      orders: "1.490",
      ordersGrowth: "↑ 19.5%",
      avg: "344.228đ",
      avgGrowth: "↑ 7.8%",
      conv: "3.10%",
      convGrowth: "↑ 11.2%",
      pathLine: "M 15,120 L 130,140 L 250,60 L 370,30 L 485,40",
      pathArea:
        "M 15,120 L 130,140 L 250,60 L 370,30 L 485,40 L 485,160 L 15,160 Z",
      points: [
        { x: 15, y: 120, label: "85.0M", value: "85.000.000đ", date: "Tháng 5" },
        { x: 130, y: 140, label: "62.4M", value: "62.400.000đ", date: "Tháng 6" },
        { x: 250, y: 60, label: "145.0M", value: "145.000.000đ", date: "Tháng 7" },
        { x: 370, y: 30, label: "182.5M", value: "182.500.000đ", date: "Tháng 8" },
        { x: 485, y: 40, label: "168.0M", value: "168.000.000đ", date: "Dự kiến" },
      ],
    },
    "1year": {
      total: "1.980.000.000đ",
      totalGrowth: "↑ 45.3%",
      orders: "5.820",
      ordersGrowth: "↑ 28.1%",
      avg: "340.206đ",
      avgGrowth: "↑ 8.9%",
      conv: "3.45%",
      convGrowth: "↑ 14.5%",
      pathLine: "M 15,160 L 130,110 L 250,80 L 370,40 L 485,15",
      pathArea:
        "M 15,160 L 130,110 L 250,80 L 370,40 L 485,15 L 485,160 L 15,160 Z",
      points: [
        { x: 15, y: 160, label: "240M", value: "240.000.000đ", date: "Q1" },
        { x: 130, y: 110, label: "410M", value: "410.000.000đ", date: "Q2" },
        { x: 250, y: 80, label: "580M", value: "580.000.000đ", date: "Q3" },
        { x: 370, y: 40, label: "750M", value: "750.000.000đ", date: "Q4" },
        { x: 485, y: 15, label: "920M", value: "920.000.000đ", date: "Tổng" },
      ],
    },
  };

  const currentChart = SALES_DATA[salesPeriod] || SALES_DATA["7days"];

  return (
    <div className="admin-wrapper">
      {/* Left Sidebar Navigation */}
      <AdminSidebar activeMenu="overview" sidebarCollapsed={sidebarCollapsed} />

      {/* 2. Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar Đồng Bộ Chuẩn 3 Thông Báo & Menu Admin Interactive */}
        <AdminHeader
          title="Dashboard Tổng Quan"
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
        />

        {/* Dashboard Content Body */}
        <div className="dashboard-content-body">
          {/* 3. Hàng 4 Thẻ KPI Stat Cards */}
          <div className="kpi-cards-grid">
            {/* Card 1 */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Tổng sản phẩm</div>
                <div className="kpi-value">320</div>
                <div className="kpi-subtext">Tất cả sản phẩm trong kho</div>
              </div>
              <div className="kpi-icon-wrapper icon-green">🛍️</div>
            </div>

            {/* Card 2 */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Danh mục</div>
                <div className="kpi-value">16</div>
                <div className="kpi-subtext">Danh mục sản phẩm</div>
              </div>
              <div className="kpi-icon-wrapper icon-blue">📁</div>
            </div>

            {/* Card 3 */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Đang hiển thị</div>
                <div className="kpi-value">278</div>
                <div className="kpi-subtext">Sản phẩm đang kinh doanh</div>
              </div>
              <div className="kpi-icon-wrapper icon-teal">👁️</div>
            </div>

            {/* Card 4 */}
            <div className="kpi-card">
              <div>
                <div className="kpi-title">Cảnh báo tồn kho</div>
                <div className="kpi-value" style={{ color: "#f97316" }}>
                  14
                </div>
                <div className="kpi-subtext">Sản phẩm sắp hết hàng</div>
              </div>
              <div className="kpi-icon-wrapper icon-orange">⚠️</div>
            </div>
          </div>

          {/* 4. Hàng Giữa: Biểu Đồ Doanh Thu & Bảng Sản Phẩm Mới (50/50 Grid) */}
          <div className="middle-row-grid">
            {/* Cột Trái: Sales Overview Chart */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2 className="card-header-title">Biểu đồ doanh số</h2>
                <select
                  className="select-filter-sm"
                  value={salesPeriod}
                  onChange={(e) => setSalesPeriod(e.target.value)}
                >
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="90days">90 ngày qua</option>
                  <option value="1year">1 năm qua</option>
                </select>
              </div>

              {/* SVG Dynamic Line Chart với Data Labels & Snapping Hover */}
              <div className="sales-chart-wrapper" style={{ position: "relative" }}>
                <svg
                  className="sales-chart-svg"
                  viewBox="0 0 500 180"
                  preserveAspectRatio="none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const mouseX = ((e.clientX - rect.left) / rect.width) * 500;
                    let closestIdx = 0;
                    let minDiff = Infinity;
                    currentChart.points.forEach((pt, idx) => {
                      const diff = Math.abs(pt.x - mouseX);
                      if (diff < minDiff) {
                        minDiff = diff;
                        closestIdx = idx;
                      }
                    });
                    setHoverPointIndex(closestIdx);
                  }}
                  onMouseLeave={() => setHoverPointIndex(null)}
                  style={{ cursor: "crosshair", overflow: "visible" }}
                >
                  <defs>
                    <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="#2e7d32"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor="#2e7d32"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                  <line x1="0" y1="130" x2="500" y2="130" stroke="#f1f5f9" strokeWidth="1" />

                  <path
                    d={currentChart.pathArea}
                    fill="url(#greenGrad)"
                    style={{ transition: "all 0.4s ease" }}
                  />
                  <path
                    d={currentChart.pathLine}
                    fill="none"
                    stroke="#2e7d32"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transition: "all 0.4s ease" }}
                  />

                  {/* DATA LABELS TĨNH MÀU XANH LÁ CÂY HỆ THỐNG (#2e7d32) CỐ ĐỊNH */}
                  {currentChart.points.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#2e7d32" stroke="#ffffff" strokeWidth="2.5" />
                      <rect x={pt.x - 24} y={pt.y - 26} width="48" height="20" rx="5" fill="#2e7d32" />
                      <text x={pt.x} y={pt.y - 12} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="800">
                        {pt.label}
                      </text>
                      <text x={pt.x} y="172" textAnchor="middle" fill="#2e7d32" fontSize="11" fontWeight="800">
                        {pt.date}
                      </text>
                    </g>
                  ))}

                  {/* HOVER SNAPPING DOT & FLOATING TOOLTIP */}
                  {hoverPointIndex !== null && currentChart.points[hoverPointIndex] && (
                    <g style={{ transition: "all 0.1s ease" }}>
                      <line
                        x1={currentChart.points[hoverPointIndex].x}
                        y1="10"
                        x2={currentChart.points[hoverPointIndex].x}
                        y2="160"
                        stroke="#2e7d32"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                      <circle
                        cx={currentChart.points[hoverPointIndex].x}
                        cy={currentChart.points[hoverPointIndex].y}
                        r="7"
                        fill="#ffffff"
                        stroke="#2e7d32"
                        strokeWidth="3.5"
                      />
                      <g transform={`translate(${Math.min(370, Math.max(10, currentChart.points[hoverPointIndex].x - 60))}, ${Math.max(5, currentChart.points[hoverPointIndex].y - 50)})`}>
                        <rect x="0" y="0" width="120" height="38" rx="6" fill="#0f172a" />
                        <text x="60" y="15" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="600">
                          {currentChart.points[hoverPointIndex].date}
                        </text>
                        <text x="60" y="30" textAnchor="middle" fill="#4ade80" fontSize="12" fontWeight="800">
                          {currentChart.points[hoverPointIndex].value}
                        </text>
                      </g>
                    </g>
                  )}
                </svg>
              </div>

              <div className="chart-metrics-footer">
                <div>
                  <div className="metric-item-label">Tổng doanh số</div>
                  <div className="metric-item-val">
                    {currentChart.total}{" "}
                    <span className="metric-growth">
                      {currentChart.totalGrowth}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="metric-item-label">Đơn hàng</div>
                  <div className="metric-item-val">
                    {currentChart.orders}{" "}
                    <span className="metric-growth">
                      {currentChart.ordersGrowth}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="metric-item-label">Giá trị trung bình</div>
                  <div className="metric-item-val">
                    {currentChart.avg}{" "}
                    <span className="metric-growth">
                      {currentChart.avgGrowth}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="metric-item-label">Tỷ lệ chuyển đổi</div>
                  <div className="metric-item-val">
                    {currentChart.conv}{" "}
                    <span className="metric-growth">
                      {currentChart.convGrowth}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột Phải: Recent Products Table */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2 className="card-header-title">Sản phẩm mới</h2>
                <Link
                  href="/admin/products"
                  className="btn-add-product-green"
                >
                  + Thêm sản phẩm
                </Link>
              </div>

              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Tồn kho</th>
                    <th>Trạng thái</th>
                    <th style={{ textAlign: "right" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src="/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp"
                          alt="Nordic Sofa"
                        />
                        <strong>Sofa 2 chỗ Nordic</strong>
                      </div>
                    </td>
                    <td>Nội thất</td>
                    <td>2.990.000đ</td>
                    <td>18</td>
                    <td>
                      <span className="badge-visible">Hiển thị</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", cursor: "pointer" }}>
                      •••
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src="/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp"
                          alt="Wooden Dining Table"
                        />
                        <strong>Bàn ăn gỗ Sồi</strong>
                      </div>
                    </td>
                    <td>Nội thất</td>
                    <td>3.490.000đ</td>
                    <td>12</td>
                    <td>
                      <span className="badge-visible">Hiển thị</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", cursor: "pointer" }}>
                      •••
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src="/assets/images/products/do-my-nghe/den-tre-thu-cong.webp"
                          alt="Minimal Ceiling Lamp"
                        />
                        <strong>Đèn thả trần Minimal</strong>
                      </div>
                    </td>
                    <td>Đèn trang trí</td>
                    <td>599.000đ</td>
                    <td>25</td>
                    <td>
                      <span className="badge-visible">Hiển thị</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", cursor: "pointer" }}>
                      •••
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src="/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp"
                          alt="Ceramic Vase"
                        />
                        <strong>Bình gốm Decor</strong>
                      </div>
                    </td>
                    <td>Trang trí</td>
                    <td>290.000đ</td>
                    <td>40</td>
                    <td>
                      <span className="badge-visible">Hiển thị</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", cursor: "pointer" }}>
                      •••
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src="/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp"
                          alt="Storage Shelf"
                        />
                        <strong>Kệ gỗ đa năng</strong>
                      </div>
                    </td>
                    <td>Lưu trữ</td>
                    <td>1.293.000đ</td>
                    <td>9</td>
                    <td>
                      <span className="badge-lowstock">Sắp hết</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", cursor: "pointer" }}>
                      •••
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="admin-product-cell">
                        <img
                          src="/assets/images/products/do-thu-cong/gio-may-dan.webp"
                          alt="Wicker Basket"
                        />
                        <strong>Giỏ mây lưu trữ</strong>
                      </div>
                    </td>
                    <td>Lưu trữ</td>
                    <td>199.000đ</td>
                    <td>7</td>
                    <td>
                      <span className="badge-lowstock">Sắp hết</span>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--text-muted)", cursor: "pointer" }}>
                      •••
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Hàng Đáy: 3 Khối Thống Kê Chi Tiết (3 Columns Grid) */}
          <div className="bottom-row-grid">
            {/* Cột 1: Orders Overview (Donut Chart) */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2 className="card-header-title">Trạng thái đơn hàng</h2>
                <select className="select-filter-sm">
                  <option value="7days">7 ngày qua</option>
                  <option value="30days">30 ngày qua</option>
                  <option value="all">Tất cả thời gian</option>
                </select>
              </div>

              <div className="donut-chart-box">
                <svg
                  width="130"
                  height="130"
                  viewBox="0 0 42 42"
                  id="donut-chart-svg"
                >
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#e2e8f0"
                    strokeWidth="5"
                  ></circle>
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#2e7d32"
                    strokeWidth="5"
                    strokeDasharray="35.2 64.8"
                    strokeDashoffset="25"
                  ></circle>
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth="5"
                    strokeDasharray="29.7 70.3"
                    strokeDashoffset="-10.2"
                  ></circle>
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="5"
                    strokeDasharray="17.2 82.8"
                    strokeDashoffset="-39.9"
                  ></circle>
                  <circle
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="5"
                    strokeDasharray="7.8 92.2"
                    strokeDashoffset="-57.1"
                  ></circle>
                </svg>

                <ul className="donut-legend-list">
                  <li className="legend-item">
                    <span
                      className="dot-indicator"
                      style={{ background: "#2e7d32" }}
                    ></span>{" "}
                    <span>Hoàn thành: 45 (35.2%)</span>
                  </li>
                  <li className="legend-item">
                    <span
                      className="dot-indicator"
                      style={{ background: "#2563eb" }}
                    ></span>{" "}
                    <span>Đang xử lý: 38 (29.7%)</span>
                  </li>
                  <li className="legend-item">
                    <span
                      className="dot-indicator"
                      style={{ background: "#f59e0b" }}
                    ></span>{" "}
                    <span>Đang giao: 22 (17.2%)</span>
                  </li>
                  <li className="legend-item">
                    <span
                      className="dot-indicator"
                      style={{ background: "#8b5cf6" }}
                    ></span>{" "}
                    <span>Đã hủy: 10 (7.8%)</span>
                  </li>
                  <li className="legend-item">
                    <span
                      className="dot-indicator"
                      style={{ background: "#cbd5e1" }}
                    ></span>{" "}
                    <span>Trả hàng: 13 (10.1%)</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cột 2: Top Categories Progress Bars */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2 className="card-header-title">Danh mục bán chạy</h2>
                <select className="select-filter-sm">
                  <option>Theo doanh số</option>
                </select>
              </div>

              <div className="progress-list">
                <div>
                  <div className="progress-item-header">
                    <span>📁 Nội thất</span>
                    <strong>18.450.000đ</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "85%", background: "#10b981" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="progress-item-header">
                    <span>🪴 Trang trí</span>
                    <strong>9.200.000đ</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "50%", background: "#2563eb" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="progress-item-header">
                    <span>💡 Đèn trang trí</span>
                    <strong>6.780.000đ</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "38%", background: "#f97316" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="progress-item-header">
                    <span>🧺 Lưu trữ</span>
                    <strong>4.360.000đ</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "25%", background: "#8b5cf6" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="progress-item-header">
                    <span>🍳 Nhà bếp</span>
                    <strong>3.790.000đ</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: "20%", background: "#94a3b8" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cột 3: Stock Alert List */}
            <div className="dashboard-card">
              <div className="card-header-row">
                <h2 className="card-header-title">Cảnh báo tồn kho</h2>
                <select className="select-filter-sm">
                  <option>Tất cả</option>
                </select>
              </div>

              <div className="stock-alert-list">
                <div className="stock-alert-item">
                  <div className="alert-item-left">
                    <img
                      src="/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp"
                      alt="Storage Shelf"
                    />
                    <span className="alert-item-name">Kệ gỗ đa năng</span>
                  </div>
                  <span className="alert-count-red">Còn 9 sản phẩm</span>
                </div>
                <div className="stock-alert-item">
                  <div className="alert-item-left">
                    <img
                      src="/assets/images/products/do-thu-cong/gio-may-dan.webp"
                      alt="Wicker Basket"
                    />
                    <span className="alert-item-name">Giỏ mây lưu trữ</span>
                  </div>
                  <span className="alert-count-red">Còn 7 sản phẩm</span>
                </div>
                <div className="stock-alert-item">
                  <div className="alert-item-left">
                    <img
                      src="/assets/images/products/do-my-nghe/den-tre-thu-cong.webp"
                      alt="Minimal Ceiling Lamp"
                    />
                    <span className="alert-item-name">
                      Đèn thả trần Minimal
                    </span>
                  </div>
                  <span className="alert-count-red">Còn 5 sản phẩm</span>
                </div>
                <div className="stock-alert-item">
                  <div className="alert-item-left">
                    <img
                      src="/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp"
                      alt="Nordic Sofa"
                    />
                    <span className="alert-item-name">Sofa 2 chỗ Nordic</span>
                  </div>
                  <span className="alert-count-red">Còn 3 sản phẩm</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
