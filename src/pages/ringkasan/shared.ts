// Shared types, constants, and utilities for RingkasanPage

export type TimePeriod =
  | "semua"
  | "harian"
  | "mingguan"
  | "bulanan"
  | "tahunan"
  | "3tahun"
  | "5tahun"
  | "custom";

export type ProductViewMode = "revenue" | "quantity" | "profit";
export type ProductSortMode = "revenue" | "quantity" | "profit" | "margin";

export type TrendData = {
  label: string;
  revenue: number;
  profit: number;
  expense: number;
};

export type Product = {
  id: number;
  name: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  profitMargin: number;
  stock: number;
  price: number;
  cost: number;
  trend: "up" | "down";
  trendValue: number;
};

export type ProductWithScore = Product & {
  revenueScore: "excellent" | "good" | "average" | "poor";
  quantityScore: "excellent" | "good" | "average" | "poor";
  profitScore: "excellent" | "good" | "average" | "poor";
  overallScore: "excellent" | "good" | "poor";
};

export type ChartDataItem = Product & {
  value: number;
  percentage: number;
  color: string;
};

// Dummy data for financial metrics
export const financialData = {
  totalRevenue: 12450000,
  totalProfit: 3750000,
  totalExpenses: 8700000,
  profitMargin: 30.1,
  averageTransactionValue: 50816,
  revenueGrowth: 12.5,
  profitGrowth: 15.2,
  expenseGrowth: 8.3,
  transactionCount: 245,
  transactionGrowth: 5.3,
};

// Data for different time periods
export const dailyTrendData: TrendData[] = [
  { label: "Sen", revenue: 1200000, profit: 360000, expense: 200000 },
  { label: "Sel", revenue: 1800000, profit: 540000, expense: 250000 },
  { label: "Rab", revenue: 1500000, profit: 450000, expense: 220000 },
  { label: "Kam", revenue: 2200000, profit: 660000, expense: 300000 },
  { label: "Jum", revenue: 1900000, profit: 570000, expense: 280000 },
  { label: "Sab", revenue: 2500000, profit: 750000, expense: 350000 },
  { label: "Min", revenue: 1350000, profit: 405000, expense: 180000 },
];

export const weeklyTrendData: TrendData[] = [
  { label: "Minggu 1", revenue: 8500000, profit: 2550000, expense: 1500000 },
  { label: "Minggu 2", revenue: 9200000, profit: 2760000, expense: 1600000 },
  { label: "Minggu 3", revenue: 7800000, profit: 2340000, expense: 1400000 },
  { label: "Minggu 4", revenue: 10500000, profit: 3150000, expense: 1800000 },
];

export const monthlyTrendData: TrendData[] = [
  { label: "Jan", revenue: 35000000, profit: 10500000, expense: 6000000 },
  { label: "Feb", revenue: 32000000, profit: 9600000, expense: 5500000 },
  { label: "Mar", revenue: 38000000, profit: 11400000, expense: 6500000 },
  { label: "Apr", revenue: 40000000, profit: 12000000, expense: 6800000 },
  { label: "Mei", revenue: 36000000, profit: 10800000, expense: 6200000 },
  { label: "Jun", revenue: 42000000, profit: 12600000, expense: 7200000 },
  { label: "Jul", revenue: 45000000, profit: 13500000, expense: 7500000 },
  { label: "Agu", revenue: 43000000, profit: 12900000, expense: 7300000 },
  { label: "Sep", revenue: 39000000, profit: 11700000, expense: 6700000 },
  { label: "Okt", revenue: 41000000, profit: 12300000, expense: 7000000 },
  { label: "Nov", revenue: 44000000, profit: 13200000, expense: 7500000 },
  { label: "Des", revenue: 48000000, profit: 14400000, expense: 8200000 },
];

export const yearlyTrendData: TrendData[] = [
  { label: "2020", revenue: 350000000, profit: 105000000, expense: 70000000 },
  { label: "2021", revenue: 420000000, profit: 126000000, expense: 84000000 },
  { label: "2022", revenue: 480000000, profit: 144000000, expense: 96000000 },
  { label: "2023", revenue: 520000000, profit: 156000000, expense: 104000000 },
  { label: "2024", revenue: 580000000, profit: 174000000, expense: 116000000 },
];

export const threeYearTrendData: TrendData[] = [
  { label: "Q1 2022", revenue: 115000000, profit: 34500000, expense: 23000000 },
  { label: "Q2 2022", revenue: 118000000, profit: 35400000, expense: 23600000 },
  { label: "Q3 2022", revenue: 122000000, profit: 36600000, expense: 24400000 },
  { label: "Q4 2022", revenue: 125000000, profit: 37500000, expense: 25000000 },
  { label: "Q1 2023", revenue: 128000000, profit: 38400000, expense: 25600000 },
  { label: "Q2 2023", revenue: 130000000, profit: 39000000, expense: 26000000 },
  { label: "Q3 2023", revenue: 131000000, profit: 39300000, expense: 26200000 },
  { label: "Q4 2023", revenue: 131000000, profit: 39300000, expense: 26200000 },
  { label: "Q1 2024", revenue: 140000000, profit: 42000000, expense: 28000000 },
  { label: "Q2 2024", revenue: 143000000, profit: 42900000, expense: 28600000 },
  { label: "Q3 2024", revenue: 147000000, profit: 44100000, expense: 29400000 },
  { label: "Q4 2024", revenue: 150000000, profit: 45000000, expense: 30000000 },
];

export const fiveYearTrendData: TrendData[] = [
  { label: "2020 S1", revenue: 165000000, profit: 49500000, expense: 33000000 },
  { label: "2020 S2", revenue: 185000000, profit: 55500000, expense: 37000000 },
  { label: "2021 S1", revenue: 200000000, profit: 60000000, expense: 40000000 },
  { label: "2021 S2", revenue: 220000000, profit: 66000000, expense: 44000000 },
  { label: "2022 S1", revenue: 233000000, profit: 69900000, expense: 46600000 },
  { label: "2022 S2", revenue: 247000000, profit: 74100000, expense: 49400000 },
  { label: "2023 S1", revenue: 258000000, profit: 77400000, expense: 51600000 },
  { label: "2023 S2", revenue: 262000000, profit: 78600000, expense: 52400000 },
  { label: "2024 S1", revenue: 283000000, profit: 84900000, expense: 56600000 },
  { label: "2024 S2", revenue: 297000000, profit: 89100000, expense: 59400000 },
];

export const timePeriodConfig: Record<
  TimePeriod,
  { data: TrendData[]; title: string; subtitle: string }
> = {
  semua: {
    data: dailyTrendData, // Placeholder, will be replaced with API data
    title: "Grafik Pendapatan & Pengeluaran",
    subtitle: "Semua Data",
  },
  harian: {
    data: dailyTrendData,
    title: "Grafik Pendapatan & Pengeluaran Harian",
    subtitle: "7 Hari Terakhir",
  },
  mingguan: {
    data: weeklyTrendData,
    title: "Grafik Pendapatan & Pengeluaran Mingguan",
    subtitle: "4 Minggu Terakhir",
  },
  bulanan: {
    data: monthlyTrendData,
    title: "Grafik Pendapatan & Pengeluaran Bulanan",
    subtitle: "12 Bulan Terakhir",
  },
  tahunan: {
    data: yearlyTrendData,
    title: "Grafik Pendapatan & Pengeluaran Tahunan",
    subtitle: "5 Tahun Terakhir",
  },
  "3tahun": {
    data: threeYearTrendData,
    title: "Grafik Pendapatan & Pengeluaran",
    subtitle: "3 Tahun Terakhir (Per Kuartal)",
  },
  "5tahun": {
    data: fiveYearTrendData,
    title: "Grafik Pendapatan & Pengeluaran",
    subtitle: "5 Tahun Terakhir (Per Semester)",
  },
  custom: {
    data: dailyTrendData, // Placeholder, will be replaced with custom data
    title: "Grafik Pendapatan & Pengeluaran",
    subtitle: "Periode Kustom",
  },
};

// Extended product data with more details for analysis
export const allProducts: Product[] = [
  {
    id: 1,
    name: "Produk A",
    quantitySold: 245,
    revenue: 18375000,
    profit: 5512500,
    profitMargin: 30,
    stock: 50,
    price: 75000,
    cost: 52500,
    trend: "up",
    trendValue: 15.2,
  },
  {
    id: 2,
    name: "Produk B",
    quantitySold: 189,
    revenue: 8505000,
    profit: 2551500,
    profitMargin: 30,
    stock: 120,
    price: 45000,
    cost: 31500,
    trend: "up",
    trendValue: 8.5,
  },
  {
    id: 3,
    name: "Produk C",
    quantitySold: 156,
    revenue: 5460000,
    profit: 1638000,
    profitMargin: 30,
    stock: 45,
    price: 35000,
    cost: 24500,
    trend: "down",
    trendValue: -5.3,
  },
  {
    id: 4,
    name: "Produk D",
    quantitySold: 134,
    revenue: 8040000,
    profit: 2412000,
    profitMargin: 30,
    stock: 200,
    price: 60000,
    cost: 42000,
    trend: "up",
    trendValue: 12.1,
  },
  {
    id: 5,
    name: "Produk E",
    quantitySold: 98,
    revenue: 2450000,
    profit: 735000,
    profitMargin: 30,
    stock: 15,
    price: 25000,
    cost: 17500,
    trend: "down",
    trendValue: -8.7,
  },
  {
    id: 6,
    name: "Produk F",
    quantitySold: 67,
    revenue: 5695000,
    profit: 1708500,
    profitMargin: 30,
    stock: 300,
    price: 85000,
    cost: 59500,
    trend: "down",
    trendValue: -15.2,
  },
  {
    id: 7,
    name: "Produk G",
    quantitySold: 45,
    revenue: 1800000,
    profit: 540000,
    profitMargin: 30,
    stock: 80,
    price: 40000,
    cost: 28000,
    trend: "up",
    trendValue: 3.2,
  },
  {
    id: 8,
    name: "Produk H",
    quantitySold: 32,
    revenue: 1760000,
    profit: 528000,
    profitMargin: 30,
    stock: 150,
    price: 55000,
    cost: 38500,
    trend: "down",
    trendValue: -20.5,
  },
];

// Color palette for charts
export const CHART_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(330, 75%, 60%)",
  "hsl(280, 67%, 50%)",
  "hsl(200, 100%, 50%)",
  "hsl(30, 100%, 50%)",
  "hsl(160, 100%, 40%)",
];

// Helper function to format currency
export const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

// Helper function to get date range for a given period
export const getDateRangeForPeriod = (
  period: TimePeriod,
  customStart?: string,
  customEnd?: string
): { startDate?: string; endDate?: string } | null => {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now);

  switch (period) {
    case "semua": {
      return { startDate: undefined, endDate: undefined };
    }
    case "harian": {
      // Last 7 days
      start = new Date(now);
      start.setDate(start.getDate() - 6); // Include today, so 6 days ago
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "mingguan": {
      // Last 4 weeks (28 days)
      start = new Date(now);
      start.setDate(start.getDate() - 27); // Include today
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "bulanan": {
      // Last 12 months
      start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "tahunan": {
      // Last 5 years
      start = new Date(now.getFullYear() - 4, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "3tahun": {
      // Last 3 years
      start = new Date(now.getFullYear() - 2, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "5tahun": {
      // Last 5 years
      start = new Date(now.getFullYear() - 4, 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "custom": {
      if (customStart && customEnd) {
        start = new Date(customStart);
        end = new Date(customEnd);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
      } else {
        return null;
      }
      break;
    }
    default:
      return null;
  }

  // Format as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};
