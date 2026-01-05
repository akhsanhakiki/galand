"use client";

import React, { useState, useMemo } from "react";
import { Surface, Tabs, Card, Button, Popover } from "@heroui/react";
import {
  LuTrendingUp,
  LuDollarSign,
  LuShoppingCart,
  LuArrowUp,
  LuPercent,
  LuChartBar,
  LuCoins,
  LuArrowDown,
  LuEye,
  LuFilter,
} from "react-icons/lu";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../components/chart";

// Dummy data for financial metrics
const financialData = {
  totalRevenue: 12450000,
  totalProfit: 3750000,
  profitMargin: 30.1,
  averageTransactionValue: 50816,
  revenueGrowth: 12.5,
  profitGrowth: 15.2,
  transactionCount: 245,
  transactionGrowth: 5.3,
};

// Data for different time periods
const dailyTrendData = [
  { label: "Sen", revenue: 1200000, profit: 360000 },
  { label: "Sel", revenue: 1800000, profit: 540000 },
  { label: "Rab", revenue: 1500000, profit: 450000 },
  { label: "Kam", revenue: 2200000, profit: 660000 },
  { label: "Jum", revenue: 1900000, profit: 570000 },
  { label: "Sab", revenue: 2500000, profit: 750000 },
  { label: "Min", revenue: 1350000, profit: 405000 },
];

const weeklyTrendData = [
  { label: "Minggu 1", revenue: 8500000, profit: 2550000 },
  { label: "Minggu 2", revenue: 9200000, profit: 2760000 },
  { label: "Minggu 3", revenue: 7800000, profit: 2340000 },
  { label: "Minggu 4", revenue: 10500000, profit: 3150000 },
];

const monthlyTrendData = [
  { label: "Jan", revenue: 35000000, profit: 10500000 },
  { label: "Feb", revenue: 32000000, profit: 9600000 },
  { label: "Mar", revenue: 38000000, profit: 11400000 },
  { label: "Apr", revenue: 40000000, profit: 12000000 },
  { label: "Mei", revenue: 36000000, profit: 10800000 },
  { label: "Jun", revenue: 42000000, profit: 12600000 },
  { label: "Jul", revenue: 45000000, profit: 13500000 },
  { label: "Agu", revenue: 43000000, profit: 12900000 },
  { label: "Sep", revenue: 39000000, profit: 11700000 },
  { label: "Okt", revenue: 41000000, profit: 12300000 },
  { label: "Nov", revenue: 44000000, profit: 13200000 },
  { label: "Des", revenue: 48000000, profit: 14400000 },
];

const yearlyTrendData = [
  { label: "2020", revenue: 350000000, profit: 105000000 },
  { label: "2021", revenue: 420000000, profit: 126000000 },
  { label: "2022", revenue: 480000000, profit: 144000000 },
  { label: "2023", revenue: 520000000, profit: 156000000 },
  { label: "2024", revenue: 580000000, profit: 174000000 },
];

const threeYearTrendData = [
  { label: "Q1 2022", revenue: 115000000, profit: 34500000 },
  { label: "Q2 2022", revenue: 118000000, profit: 35400000 },
  { label: "Q3 2022", revenue: 122000000, profit: 36600000 },
  { label: "Q4 2022", revenue: 125000000, profit: 37500000 },
  { label: "Q1 2023", revenue: 128000000, profit: 38400000 },
  { label: "Q2 2023", revenue: 130000000, profit: 39000000 },
  { label: "Q3 2023", revenue: 131000000, profit: 39300000 },
  { label: "Q4 2023", revenue: 131000000, profit: 39300000 },
  { label: "Q1 2024", revenue: 140000000, profit: 42000000 },
  { label: "Q2 2024", revenue: 143000000, profit: 42900000 },
  { label: "Q3 2024", revenue: 147000000, profit: 44100000 },
  { label: "Q4 2024", revenue: 150000000, profit: 45000000 },
];

const fiveYearTrendData = [
  { label: "2020 S1", revenue: 165000000, profit: 49500000 },
  { label: "2020 S2", revenue: 185000000, profit: 55500000 },
  { label: "2021 S1", revenue: 200000000, profit: 60000000 },
  { label: "2021 S2", revenue: 220000000, profit: 66000000 },
  { label: "2022 S1", revenue: 233000000, profit: 69900000 },
  { label: "2022 S2", revenue: 247000000, profit: 74100000 },
  { label: "2023 S1", revenue: 258000000, profit: 77400000 },
  { label: "2023 S2", revenue: 262000000, profit: 78600000 },
  { label: "2024 S1", revenue: 283000000, profit: 84900000 },
  { label: "2024 S2", revenue: 297000000, profit: 89100000 },
];

type TimePeriod =
  | "harian"
  | "mingguan"
  | "bulanan"
  | "tahunan"
  | "3tahun"
  | "5tahun"
  | "custom";

const timePeriodConfig: Record<
  TimePeriod,
  { data: typeof dailyTrendData; title: string; subtitle: string }
> = {
  harian: {
    data: dailyTrendData,
    title: "Tren Pendapatan & Profit Harian",
    subtitle: "7 Hari Terakhir",
  },
  mingguan: {
    data: weeklyTrendData,
    title: "Tren Pendapatan & Profit Mingguan",
    subtitle: "4 Minggu Terakhir",
  },
  bulanan: {
    data: monthlyTrendData,
    title: "Tren Pendapatan & Profit Bulanan",
    subtitle: "12 Bulan Terakhir",
  },
  tahunan: {
    data: yearlyTrendData,
    title: "Tren Pendapatan & Profit Tahunan",
    subtitle: "5 Tahun Terakhir",
  },
  "3tahun": {
    data: threeYearTrendData,
    title: "Tren Pendapatan & Profit",
    subtitle: "3 Tahun Terakhir (Per Kuartal)",
  },
  "5tahun": {
    data: fiveYearTrendData,
    title: "Tren Pendapatan & Profit",
    subtitle: "5 Tahun Terakhir (Per Semester)",
  },
  custom: {
    data: dailyTrendData, // Placeholder, will be replaced with custom data
    title: "Tren Pendapatan & Profit",
    subtitle: "Periode Kustom",
  },
};

// Chart config for revenue and profit
const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "hsl(210, 70%, 55%)",
  },
  profit: {
    label: "Profit",
    color: "var(--primary-400)",
  },
} satisfies ChartConfig;

// Extended product data with more details for analysis
const allProducts = [
  {
    id: 1,
    name: "Produk A",
    quantitySold: 245,
    revenue: 12250000,
    profit: 3675000,
    profitMargin: 30,
    stock: 50,
    price: 50000,
    cost: 35000,
    trend: "up",
    trendValue: 15.2,
  },
  {
    id: 2,
    name: "Produk B",
    quantitySold: 189,
    revenue: 9450000,
    profit: 2835000,
    profitMargin: 30,
    stock: 120,
    price: 50000,
    cost: 35000,
    trend: "up",
    trendValue: 8.5,
  },
  {
    id: 3,
    name: "Produk C",
    quantitySold: 156,
    revenue: 7800000,
    profit: 2340000,
    profitMargin: 30,
    stock: 45,
    price: 50000,
    cost: 35000,
    trend: "down",
    trendValue: -5.3,
  },
  {
    id: 4,
    name: "Produk D",
    quantitySold: 134,
    revenue: 6700000,
    profit: 2010000,
    profitMargin: 30,
    stock: 200,
    price: 50000,
    cost: 35000,
    trend: "up",
    trendValue: 12.1,
  },
  {
    id: 5,
    name: "Produk E",
    quantitySold: 98,
    revenue: 4900000,
    profit: 1470000,
    profitMargin: 30,
    stock: 15,
    price: 50000,
    cost: 35000,
    trend: "down",
    trendValue: -8.7,
  },
  {
    id: 6,
    name: "Produk F",
    quantitySold: 67,
    revenue: 3350000,
    profit: 1005000,
    profitMargin: 30,
    stock: 300,
    price: 50000,
    cost: 35000,
    trend: "down",
    trendValue: -15.2,
  },
  {
    id: 7,
    name: "Produk G",
    quantitySold: 45,
    revenue: 2250000,
    profit: 675000,
    profitMargin: 30,
    stock: 80,
    price: 50000,
    cost: 35000,
    trend: "up",
    trendValue: 3.2,
  },
  {
    id: 8,
    name: "Produk H",
    quantitySold: 32,
    revenue: 1600000,
    profit: 480000,
    profitMargin: 30,
    stock: 150,
    price: 50000,
    cost: 35000,
    trend: "down",
    trendValue: -20.5,
  },
];

// Color palette for charts
const CHART_COLORS = [
  "hsl(210, 70%, 55%)",
  "var(--primary-400)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(280, 67%, 50%)",
  "hsl(200, 100%, 50%)",
  "hsl(30, 100%, 50%)",
];

// Helper function to format currency
const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

type ProductViewMode = "revenue" | "quantity" | "profit";
type ProductSortMode = "revenue" | "quantity" | "profit" | "margin";

const RingkasanPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("harian");
  const [productViewMode, setProductViewMode] =
    useState<ProductViewMode>("revenue");
  const [productSortMode, setProductSortMode] =
    useState<ProductSortMode>("revenue");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Generate custom period data based on selected dates
  const customPeriodData = useMemo(() => {
    if (selectedPeriod !== "custom" || !customStartDate || !customEndDate) {
      return timePeriodConfig.custom;
    }

    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate data based on date range
    // For now, we'll use a simplified approach - in production, you'd fetch real data
    const data = [];
    const days = Math.min(daysDiff + 1, 30); // Limit to 30 days for display, +1 to include end date

    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });
      data.push({
        label: `${dayName} ${date.getDate()}/${date.getMonth() + 1}`,
        revenue: 1200000 + Math.random() * 1000000,
        profit: 360000 + Math.random() * 300000,
      });
    }

    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    return {
      data,
      title: "Tren Pendapatan & Profit",
      subtitle: `${formatDate(customStartDate)} - ${formatDate(customEndDate)}`,
    };
  }, [customStartDate, customEndDate, selectedPeriod]);

  const currentPeriodData =
    selectedPeriod === "custom"
      ? customPeriodData
      : timePeriodConfig[selectedPeriod];

  // Prepare chart data based on view mode
  const chartData = useMemo(() => {
    const sorted = [...allProducts].sort((a, b) => {
      switch (productSortMode) {
        case "revenue":
          return b.revenue - a.revenue;
        case "quantity":
          return b.quantitySold - a.quantitySold;
        case "profit":
          return b.profit - a.profit;
        case "margin":
          return b.profitMargin - a.profitMargin;
        default:
          return 0;
      }
    });

    const top5 = sorted.slice(0, 5);
    const total = sorted.reduce((sum, p) => {
      switch (productViewMode) {
        case "revenue":
          return sum + p.revenue;
        case "quantity":
          return sum + p.quantitySold;
        case "profit":
          return sum + p.profit;
        default:
          return sum;
      }
    }, 0);

    return top5.map((product, index) => {
      const value =
        productViewMode === "revenue"
          ? product.revenue
          : productViewMode === "quantity"
          ? product.quantitySold
          : product.profit;
      const percentage =
        productViewMode === "revenue"
          ? (product.revenue / total) * 100
          : productViewMode === "quantity"
          ? (product.quantitySold / total) * 100
          : (product.profit / total) * 100;
      return {
        ...product,
        name: product.name,
        value,
        percentage,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });
  }, [productViewMode, productSortMode]);

  // Performance analysis
  const performanceAnalysis = useMemo(() => {
    const avgRevenue =
      allProducts.reduce((sum, p) => sum + p.revenue, 0) / allProducts.length;
    const avgQuantity =
      allProducts.reduce((sum, p) => sum + p.quantitySold, 0) /
      allProducts.length;
    const avgProfit =
      allProducts.reduce((sum, p) => sum + p.profit, 0) / allProducts.length;

    return allProducts.map((product) => {
      const revenueScore =
        product.revenue >= avgRevenue * 1.2
          ? "excellent"
          : product.revenue >= avgRevenue
          ? "good"
          : product.revenue >= avgRevenue * 0.7
          ? "average"
          : "poor";
      const quantityScore =
        product.quantitySold >= avgQuantity * 1.2
          ? "excellent"
          : product.quantitySold >= avgQuantity
          ? "good"
          : product.quantitySold >= avgQuantity * 0.7
          ? "average"
          : "poor";
      const profitScore =
        product.profit >= avgProfit * 1.2
          ? "excellent"
          : product.profit >= avgProfit
          ? "good"
          : product.profit >= avgProfit * 0.7
          ? "average"
          : "poor";

      const overallScore =
        revenueScore === "excellent" &&
        quantityScore === "excellent" &&
        profitScore === "excellent"
          ? "excellent"
          : revenueScore === "poor" ||
            quantityScore === "poor" ||
            profitScore === "poor"
          ? "poor"
          : "good";

      return {
        ...product,
        revenueScore,
        quantityScore,
        profitScore,
        overallScore,
      };
    });
  }, []);

  const topPerformers = performanceAnalysis
    .filter((p) => p.overallScore === "excellent")
    .slice(0, 3);
  const poorPerformers = performanceAnalysis
    .filter((p) => p.overallScore === "poor")
    .slice(0, 3);

  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-foreground">Ringkasan</h1>
          <p className="text-muted text-sm">
            Pantau ringkasan penjualan dan inventori Anda
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Tabs
              selectedKey={selectedPeriod}
              onSelectionChange={(key) => {
                setSelectedPeriod(key as TimePeriod);
                if (key !== "custom") {
                  setCustomStartDate("");
                  setCustomEndDate("");
                  setIsPopoverOpen(false);
                } else {
                  setIsPopoverOpen(true);
                }
              }}
              className="w-fit"
            >
              <Tabs.ListContainer>
                <Tabs.List
                  aria-label="Periode Waktu"
                  className="w-fit *:h-8 *:w-fit *:px-3 *:text-xs *:font-normal *:rounded-none *:bg-transparent *:data-[selected=true]:bg-transparent *:data-[selected=true]:text-foreground *:data-[hover=true]:bg-transparent"
                >
                  <Tabs.Tab id="harian">
                    Harian
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="mingguan">
                    Mingguan
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="bulanan">
                    Bulanan
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="tahunan">
                    Tahunan
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="3tahun">
                    3 Tahun
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="5tahun">
                    5 Tahun
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab id="custom">
                    Kustom
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
            {selectedPeriod === "custom" && (
              <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <Popover.Trigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs"
                  >
                    {customStartDate && customEndDate
                      ? (() => {
                          const formatDate = (dateString: string) => {
                            const date = new Date(dateString);
                            return date.toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                            });
                          };
                          return `${formatDate(customStartDate)} - ${formatDate(
                            customEndDate
                          )}`;
                        })()
                      : "Pilih Tanggal"}
                  </Button>
                </Popover.Trigger>
                <Popover.Content className="w-auto">
                  <Popover.Dialog>
                    <Popover.Heading className="text-sm font-semibold mb-3">
                      Pilih Periode Kustom
                    </Popover.Heading>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="start-date"
                          className="text-xs text-muted"
                        >
                          Dari Tanggal
                        </label>
                        <input
                          id="start-date"
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          max={customEndDate || undefined}
                          className="h-8 px-3 text-xs rounded-lg border border-separator bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label
                          htmlFor="end-date"
                          className="text-xs text-muted"
                        >
                          Sampai Tanggal
                        </label>
                        <input
                          id="end-date"
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          min={customStartDate || undefined}
                          className="h-8 px-3 text-xs rounded-lg border border-separator bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                      </div>
                    </div>
                  </Popover.Dialog>
                </Popover.Content>
              </Popover>
            )}
          </div>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-surface rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">Total Pendapatan</p>
            <Surface className="p-2 rounded-lg bg-accent/10">
              <LuDollarSign className="w-4 h-4 text-accent" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(financialData.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 text-success">
              <LuArrowUp className="w-3 h-3" />
              <span className="text-xs">↑ {financialData.revenueGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">Total Profit</p>
            <Surface className="p-2 rounded-lg bg-success/10">
              <LuCoins className="w-4 h-4 text-success" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(financialData.totalProfit)}
            </p>
            <div className="flex items-center gap-1 text-success">
              <LuArrowUp className="w-3 h-3" />
              <span className="text-xs">↑ {financialData.profitGrowth}%</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">Profit Margin</p>
            <Surface className="p-2 rounded-lg bg-warning/10">
              <LuPercent className="w-4 h-4 text-warning" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold text-foreground">
              {financialData.profitMargin}%
            </p>
            <div className="flex items-center gap-1 text-success">
              <LuArrowUp className="w-3 h-3" />
              <span className="text-xs">↑ 2.1%</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">Rata-rata Transaksi</p>
            <Surface className="p-2 rounded-lg bg-primary/10">
              <LuTrendingUp className="w-4 h-4 text-primary" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(financialData.averageTransactionValue)}
            </p>
            <div className="flex items-center gap-1 text-success">
              <LuArrowUp className="w-3 h-3" />
              <span className="text-xs">
                ↑ {financialData.transactionGrowth}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Chart and Product Performance */}
      <div className="flex-1 min-h-0 bg-surface rounded-xl p-4">
        <Tabs
          defaultSelectedKey="chart"
          className="w-full h-full flex flex-col"
        >
          <div className="flex flex-row items-center w-full justify-between gap-4">
            <Tabs.ListContainer>
              <Tabs.List
                aria-label="Ringkasan"
                className="w-fit *:h-8 *:w-fit *:px-4 *:text-xs *:font-normal"
              >
                <Tabs.Tab id="chart">
                  Pendapatan & Profit
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="top5">
                  Top 5 Produk
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="comparison">
                  Perbandingan Produk
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="best">
                  Produk Berkinerja Terbaik
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="attention">
                  Produk Perlu Perhatian
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </div>

          {/* Chart Tab */}
          <Tabs.Panel id="chart" className="flex-1 min-h-0">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">
                    {currentPeriodData.title}
                  </h2>
                  <p className="text-sm text-muted">
                    {"( "}
                    {currentPeriodData.subtitle}
                    {" )"}
                  </p>
                </div>
                {/* Custom Legend */}
                <div className="flex items-center justify-center gap-6 px-4 py-3 rounded-xl">
                  {Object.entries(chartConfig).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-2.5">
                      <div
                        className="h-3.5 w-3.5 shrink-0 rounded-md"
                        style={{
                          backgroundColor: config.color,
                        }}
                      />
                      <span className="text-sm font-medium text-foreground">
                        {config.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full"
                  key={selectedPeriod}
                >
                  <AreaChart
                    accessibilityLayer
                    data={currentPeriodData.data}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-revenue)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="profitGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--color-profit)"
                          stopOpacity={0.4}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--color-profit)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => {
                        if (value >= 1000000) {
                          return `Rp ${(value / 1000000).toFixed(0)} J`;
                        } else if (value >= 1000) {
                          return `Rp ${(value / 1000).toFixed(0)} K`;
                        }
                        return `Rp ${value}`;
                      }}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => {
                            const numValue =
                              typeof value === "number" ? value : Number(value);
                            const label =
                              chartConfig[name as keyof typeof chartConfig]
                                ?.label || name;
                            return formatCurrency(numValue);
                          }}
                        />
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      fill="url(#revenueGradient)"
                      stroke="var(--color-revenue)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="profit"
                      fill="url(#profitGradient)"
                      stroke="var(--color-profit)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            </div>
          </Tabs.Panel>

          {/* Top 5 Produk Tab */}
          <Tabs.Panel id="top5" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-4 h-full">
              {/* Header with filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Surface className="p-2 rounded-lg bg-accent/10">
                    <LuChartBar className="w-4 h-4 text-accent" />
                  </Surface>
                  <h2 className="text-lg font-bold text-foreground">
                    Top 5 Produk
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={
                        productViewMode === "revenue" ? "primary" : "ghost"
                      }
                      onPress={() => setProductViewMode("revenue")}
                      className="h-7 px-3 text-xs"
                    >
                      Pendapatan
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        productViewMode === "quantity" ? "primary" : "ghost"
                      }
                      onPress={() => setProductViewMode("quantity")}
                      className="h-7 px-3 text-xs"
                    >
                      Kuantitas
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        productViewMode === "profit" ? "primary" : "ghost"
                      }
                      onPress={() => setProductViewMode("profit")}
                      className="h-7 px-3 text-xs"
                    >
                      Profit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Donut Chart with Product List */}
              <div className="p-4 border border-separator rounded-xl flex-1 min-h-0 flex flex-col">
                <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
                  {/* Pie Chart - Left Side */}
                  <div className="flex-1 min-w-0">
                    <div className="h-full">
                      <ChartContainer
                        config={chartData.reduce(
                          (acc, item, idx) => ({
                            ...acc,
                            [item.name]: {
                              label: item.name,
                              color: item.color,
                            },
                          }),
                          {}
                        )}
                        className="h-full w-full"
                      >
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ percent }: any) =>
                              `${(percent * 100).toFixed(1)}%`
                            }
                            labelLine={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip
                            content={
                              <ChartTooltipContent
                                formatter={(value, name) => {
                                  const numValue =
                                    typeof value === "number"
                                      ? value
                                      : Number(value);
                                  return productViewMode === "revenue" ||
                                    productViewMode === "profit"
                                    ? formatCurrency(numValue)
                                    : `${numValue} unit`;
                                }}
                              />
                            }
                          />
                        </PieChart>
                      </ChartContainer>
                    </div>
                  </div>

                  {/* Product List - Right Side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-3 h-full overflow-y-auto">
                      {chartData.map((item) => {
                        const product = allProducts.find(
                          (p) => p.id === item.id
                        );
                        if (!product) return null;

                        return (
                          <div
                            key={item.id}
                            className="flex flex-col gap-2 p-3 rounded-lg border border-separator hover:bg-foreground/5 cursor-pointer transition-colors"
                            onClick={() =>
                              setSelectedProduct(
                                selectedProduct === item.id ? null : item.id
                              )
                            }
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-muted">
                                  {item.percentage.toFixed(1)}%
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                              <div className="flex justify-between">
                                <span className="text-muted">Harga:</span>
                                <span className="font-semibold text-foreground">
                                  {formatCurrency(product.price)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">Stok:</span>
                                <span className="font-semibold text-foreground">
                                  {product.stock} unit
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">Terjual:</span>
                                <span className="font-semibold text-foreground">
                                  {product.quantitySold} unit
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">Pendapatan:</span>
                                <span className="font-semibold text-foreground">
                                  {formatCurrency(product.revenue)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">Profit:</span>
                                <span className="font-semibold text-success">
                                  {formatCurrency(product.profit)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted">Margin:</span>
                                <span className="font-semibold text-foreground">
                                  {product.profitMargin}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Product Detail View */}
              {selectedProduct && (
                <Card className="p-4">
                  <Card.Header>
                    <div className="flex items-center justify-between w-full">
                      <Card.Title className="text-base font-bold">
                        Detail Produk
                      </Card.Title>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => setSelectedProduct(null)}
                        className="h-7 px-2"
                      >
                        Tutup
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Content>
                    {(() => {
                      const product = allProducts.find(
                        (p) => p.id === selectedProduct
                      );
                      const analysis = performanceAnalysis.find(
                        (p) => p.id === selectedProduct
                      );
                      if (!product || !analysis) return null;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-2">
                                Informasi Produk
                              </h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Nama
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {product.name}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Harga
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {formatCurrency(product.price)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Biaya
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {formatCurrency(product.cost)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Stok
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {product.stock} unit
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-2">
                                Kinerja Penjualan
                              </h3>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Unit Terjual
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {product.quantitySold} unit
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Total Pendapatan
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {formatCurrency(product.revenue)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Total Profit
                                  </span>
                                  <span className="text-xs font-semibold text-success">
                                    {formatCurrency(product.profit)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-muted">
                                    Profit Margin
                                  </span>
                                  <span className="text-xs font-semibold text-foreground">
                                    {product.profitMargin}%
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-2">
                                Skor Kinerja
                              </h3>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted">
                                    Pendapatan
                                  </span>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${
                                      analysis.revenueScore === "excellent"
                                        ? "bg-success-soft-hover text-success"
                                        : analysis.revenueScore === "good"
                                        ? "bg-accent-soft-hover text-primary"
                                        : analysis.revenueScore === "average"
                                        ? "bg-warning-soft-hover text-warning"
                                        : "bg-danger-soft-hover text-danger"
                                    }`}
                                  >
                                    {analysis.revenueScore === "excellent"
                                      ? "Excellent"
                                      : analysis.revenueScore === "good"
                                      ? "Good"
                                      : analysis.revenueScore === "average"
                                      ? "Average"
                                      : "Poor"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted">
                                    Kuantitas
                                  </span>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${
                                      analysis.quantityScore === "excellent"
                                        ? "bg-success-soft-hover text-success"
                                        : analysis.quantityScore === "good"
                                        ? "bg-accent-soft-hover text-primary"
                                        : analysis.quantityScore === "average"
                                        ? "bg-warning-soft-hover text-warning"
                                        : "bg-danger-soft-hover text-danger"
                                    }`}
                                  >
                                    {analysis.quantityScore === "excellent"
                                      ? "Excellent"
                                      : analysis.quantityScore === "good"
                                      ? "Good"
                                      : analysis.quantityScore === "average"
                                      ? "Average"
                                      : "Poor"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted">
                                    Profit
                                  </span>
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${
                                      analysis.profitScore === "excellent"
                                        ? "bg-success-soft-hover text-success"
                                        : analysis.profitScore === "good"
                                        ? "bg-accent-soft-hover text-primary"
                                        : analysis.profitScore === "average"
                                        ? "bg-warning-soft-hover text-warning"
                                        : "bg-danger-soft-hover text-danger"
                                    }`}
                                  >
                                    {analysis.profitScore === "excellent"
                                      ? "Excellent"
                                      : analysis.profitScore === "good"
                                      ? "Good"
                                      : analysis.profitScore === "average"
                                      ? "Average"
                                      : "Poor"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </Card.Content>
                </Card>
              )}
            </div>
          </Tabs.Panel>

          {/* Perbandingan Produk Tab */}
          <Tabs.Panel id="comparison" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-4 h-full">
              {/* Header with filters */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Surface className="p-2 rounded-lg bg-accent/10">
                    <LuChartBar className="w-4 h-4 text-accent" />
                  </Surface>
                  <h2 className="text-lg font-bold text-foreground">
                    Perbandingan Produk
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-surface rounded-lg p-1">
                    <Button
                      size="sm"
                      variant={
                        productViewMode === "revenue" ? "primary" : "ghost"
                      }
                      onPress={() => setProductViewMode("revenue")}
                      className="h-7 px-3 text-xs"
                    >
                      Pendapatan
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        productViewMode === "quantity" ? "primary" : "ghost"
                      }
                      onPress={() => setProductViewMode("quantity")}
                      className="h-7 px-3 text-xs"
                    >
                      Kuantitas
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        productViewMode === "profit" ? "primary" : "ghost"
                      }
                      onPress={() => setProductViewMode("profit")}
                      className="h-7 px-3 text-xs"
                    >
                      Profit
                    </Button>
                  </div>
                </div>
              </div>
              <Card className="p-4">
                <Card.Header>
                  <Card.Title className="text-base font-bold">
                    Perbandingan Produk
                  </Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="h-64">
                    <ChartContainer
                      config={chartData.reduce(
                        (acc, item, idx) => ({
                          ...acc,
                          [item.name]: {
                            label: item.name,
                            color: item.color,
                          },
                        }),
                        {}
                      )}
                      className="h-full w-full"
                    >
                      <BarChart data={chartData} layout="vertical">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          horizontal={true}
                          vertical={false}
                        />
                        <XAxis
                          type="number"
                          tickFormatter={(value) => {
                            if (
                              productViewMode === "revenue" ||
                              productViewMode === "profit"
                            ) {
                              if (value >= 1000000) {
                                return `Rp ${(value / 1000000).toFixed(1)}J`;
                              } else if (value >= 1000) {
                                return `Rp ${(value / 1000).toFixed(0)}K`;
                              }
                              return `Rp ${value}`;
                            }
                            return `${value}`;
                          }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={80}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => {
                                const numValue =
                                  typeof value === "number"
                                    ? value
                                    : Number(value);
                                return productViewMode === "revenue" ||
                                  productViewMode === "profit"
                                  ? formatCurrency(numValue)
                                  : `${numValue} unit`;
                              }}
                            />
                          }
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  </div>
                </Card.Content>
              </Card>
            </div>
          </Tabs.Panel>

          {/* Produk Berkinerja Terbaik Tab */}
          <Tabs.Panel id="best" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-4 h-full">
              <Card className="p-4">
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <Surface className="p-2 rounded-lg bg-success/10">
                      <LuTrendingUp className="w-4 h-4 text-success" />
                    </Surface>
                    <Card.Title className="text-base font-bold">
                      Produk Berkinerja Terbaik
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="flex flex-col gap-3">
                    {topPerformers.map((product, index) => (
                      <div
                        key={product.id}
                        className="p-3 rounded-xl bg-success/5 border border-success-soft-hover hover:bg-success/10 transition-colors cursor-pointer"
                        onClick={() =>
                          setSelectedProduct(
                            selectedProduct === product.id ? null : product.id
                          )
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-success-soft-hover flex items-center justify-center">
                              <span className="text-xs font-bold text-success">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted">
                                {product.quantitySold} unit terjual
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-success">
                            {product.trend === "up" ? (
                              <LuArrowUp className="w-3 h-3" />
                            ) : (
                              <LuArrowDown className="w-3 h-3" />
                            )}
                            <span className="text-xs font-semibold">
                              {Math.abs(product.trendValue).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-separator">
                          <div>
                            <p className="text-xs text-muted">Pendapatan</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(product.revenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Profit</p>
                            <p className="text-sm font-semibold text-success">
                              {formatCurrency(product.profit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Margin</p>
                            <p className="text-sm font-semibold text-foreground">
                              {product.profitMargin}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {topPerformers.length === 0 && (
                      <p className="text-sm text-muted text-center py-4">
                        Tidak ada produk dengan kinerja excellent
                      </p>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          </Tabs.Panel>

          {/* Produk Perlu Perhatian Tab */}
          <Tabs.Panel id="attention" className="flex-1 min-h-0 overflow-auto">
            <div className="flex flex-col gap-4 h-full">
              <Card className="p-4">
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <Surface className="p-2 rounded-lg bg-danger/10">
                      <LuArrowDown className="w-4 h-4 text-danger" />
                    </Surface>
                    <Card.Title className="text-base font-bold">
                      Produk Perlu Perhatian
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Content>
                  <div className="flex flex-col gap-3">
                    {poorPerformers.map((product, index) => (
                      <div
                        key={product.id}
                        className="p-3 rounded-xl bg-danger/5 border border-danger-soft-hover hover:bg-danger/10 transition-colors cursor-pointer"
                        onClick={() =>
                          setSelectedProduct(
                            selectedProduct === product.id ? null : product.id
                          )
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-danger-soft-hover flex items-center justify-center">
                              <span className="text-xs font-bold text-danger">
                                !
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted">
                                {product.quantitySold} unit terjual
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-danger">
                            {product.trend === "up" ? (
                              <LuArrowUp className="w-3 h-3" />
                            ) : (
                              <LuArrowDown className="w-3 h-3" />
                            )}
                            <span className="text-xs font-semibold">
                              {Math.abs(product.trendValue).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-separator">
                          <div>
                            <p className="text-xs text-muted">Pendapatan</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(product.revenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Profit</p>
                            <p className="text-sm font-semibold text-danger">
                              {formatCurrency(product.profit)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted">Margin</p>
                            <p className="text-sm font-semibold text-foreground">
                              {product.profitMargin}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {poorPerformers.length === 0 && (
                      <p className="text-sm text-muted text-center py-4">
                        Semua produk berkinerja baik
                      </p>
                    )}
                  </div>
                </Card.Content>
              </Card>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default RingkasanPage;
