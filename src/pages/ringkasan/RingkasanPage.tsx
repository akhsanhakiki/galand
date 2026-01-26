"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Surface, Tabs, Button, Popover, Spinner } from "@heroui/react";

import {
  LuTrendingUp,
  LuDollarSign,
  LuPercent,
  LuCoins,
  LuReceipt,
} from "react-icons/lu";

// Components
import RevenueProfitChart from "./components/RevenueProfitChart";
import Top5Products from "./components/Top5Products";
import ProductComparison from "./components/ProductComparison";
import BestPerformingProducts from "./components/BestPerformingProducts";
import ProductsNeedingAttention from "./components/ProductsNeedingAttention";

// Shared utilities and types
import {
  timePeriodConfig,
  formatCurrency,
  getDateRangeForPeriod,
  type TimePeriod,
  type ProductViewMode,
  type ProductSortMode,
  type TrendData,
  type Product,
} from "./shared";
import { prepareChartData } from "./utils/chartData";
import { calculatePerformanceAnalysis } from "./utils/performanceAnalysis";
import { getSummary } from "../../utils/api";
import type { SummaryResponse, SummaryProduct } from "../../utils/api";
import { useOrganization } from "../../contexts/OrganizationContext";

const RingkasanPage = () => {
  const { organizationChangeKey } = useOrganization();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("semua");
  const [productViewMode, setProductViewMode] =
    useState<ProductViewMode>("revenue");
  const [productSortMode, setProductSortMode] =
    useState<ProductSortMode>("revenue");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const tabsScrollRef = useRef<HTMLDivElement>(null);

  // Fetch summary data from API
  useEffect(() => {
    const fetchSummary = async () => {
      // Only show loading spinner on initial load, not on period changes
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      try {
        const dateRange = getDateRangeForPeriod(
          selectedPeriod,
          customStartDate,
          customEndDate,
        );

        if (!dateRange) {
          setSummaryData(null);
          setLoading(false);
          return;
        }

        const data = await getSummary(dateRange.startDate, dateRange.endDate);
        setSummaryData(data);
        setIsInitialLoad(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch summary",
        );
        setSummaryData(null);
        setIsInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [
    selectedPeriod,
    customStartDate,
    customEndDate,
    isInitialLoad,
    organizationChangeKey,
  ]);

  // Handle scroll snapping when tabs are clicked
  useEffect(() => {
    if (!tabsScrollRef.current) return;

    const scrollContainer = tabsScrollRef.current;
    const tabElements = Array.from(
      scrollContainer.querySelectorAll('[role="tab"]'),
    ) as HTMLElement[];

    if (tabElements.length === 0) return;

    const selectedTab = tabElements.find(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    if (!selectedTab) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const selectedTabRect = selectedTab.getBoundingClientRect();
    const selectedTabIndex = tabElements.indexOf(selectedTab);

    // Check if selected tab is partially visible (first or last visible)
    const isPartiallyVisible =
      selectedTabRect.left < containerRect.right &&
      selectedTabRect.right > containerRect.left;

    if (!isPartiallyVisible) {
      // Tab is not visible, scroll it into view
      selectedTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
      return;
    }

    // Check if it's the first or last tab overall
    const isFirstTab = selectedTabIndex === 0;
    const isLastTab = selectedTabIndex === tabElements.length - 1;

    // Check if it's the first or last visible tab
    const visibleTabs = tabElements.filter((tab) => {
      const rect = tab.getBoundingClientRect();
      return rect.left < containerRect.right && rect.right > containerRect.left;
    });

    const isFirstVisibleTab = visibleTabs[0] === selectedTab;
    const isLastVisibleTab =
      visibleTabs[visibleTabs.length - 1] === selectedTab;

    // Scroll if it's the first/last visible tab or first/last overall tab
    if (isFirstVisibleTab || isLastVisibleTab || isFirstTab || isLastTab) {
      selectedTab.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline:
          selectedTabIndex === 0
            ? "start"
            : selectedTabIndex === tabElements.length - 1
              ? "end"
              : "center",
      });
    }
  }, [selectedPeriod]);

  // Transform API product data to Product type
  const transformProduct = (apiProduct: SummaryProduct): Product => {
    // Calculate profit - if not available, estimate from revenue (assume 30% margin)
    const estimatedProfit = apiProduct.total_revenue * 0.3;
    const profit = estimatedProfit;
    const profitMargin =
      apiProduct.total_revenue > 0
        ? (profit / apiProduct.total_revenue) * 100
        : 0;

    return {
      id: apiProduct.product_id,
      name: apiProduct.product_name,
      quantitySold: apiProduct.quantity_sold,
      revenue: apiProduct.total_revenue,
      profit: profit,
      profitMargin: profitMargin,
      stock: 0, // Not available from API
      price: 0, // Not available from API
      cost: 0, // Not available from API
      trend: "up", // Default
      trendValue: 0, // Default
    };
  };

  // Transform API chart data to TrendData format
  const transformChartData = (
    chartData: SummaryResponse["chart_data"],
  ): TrendData[] => {
    return chartData.map((item) => {
      const date = new Date(item.date);
      const dayName = date.toLocaleDateString("id-ID", { weekday: "short" });
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const label = `${dayName} ${day}/${month}`;

      return {
        label,
        revenue: item.revenue,
        profit: item.profit,
        expense: item.expenses,
      };
    });
  };

  // Calculate financial data from API response
  const financialData = useMemo(() => {
    if (!summaryData) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        totalExpenses: 0,
        profitMargin: 0,
        averageTransactionValue: 0,
        revenueGrowth: 0,
        profitGrowth: 0,
        expenseGrowth: 0,
        transactionCount: 0,
        transactionGrowth: 0,
      };
    }

    const profitMargin =
      summaryData.total_revenue > 0
        ? (summaryData.total_profit / summaryData.total_revenue) * 100
        : 0;

    return {
      totalRevenue: summaryData.total_revenue,
      totalProfit: summaryData.total_profit,
      totalExpenses: summaryData.total_expenses,
      profitMargin: profitMargin,
      averageTransactionValue: summaryData.average_transaction,
      revenueGrowth: 0, // Not in API
      profitGrowth: 0, // Not in API
      expenseGrowth: 0, // Not in API
      transactionCount: 0, // Not in API
      transactionGrowth: 0, // Not in API
    };
  }, [summaryData]);

  // Generate period data from API response
  const currentPeriodData = useMemo(() => {
    if (!summaryData) {
      return timePeriodConfig[selectedPeriod];
    }

    const chartData = transformChartData(summaryData.chart_data);

    // Format dates for subtitle
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    };

    let subtitle = "";
    if (selectedPeriod === "custom" && customStartDate && customEndDate) {
      subtitle = `${formatDate(customStartDate)} - ${formatDate(
        customEndDate,
      )}`;
    } else {
      subtitle = timePeriodConfig[selectedPeriod].subtitle;
    }

    return {
      data: chartData,
      title: timePeriodConfig[selectedPeriod].title,
      subtitle,
    };
  }, [summaryData, selectedPeriod, customStartDate, customEndDate]);

  // Transform API products to Product array
  const allProducts = useMemo(() => {
    if (!summaryData) return [];
    return [
      ...summaryData.top_5_products.map(transformProduct),
      ...summaryData.underperforming_products.map(transformProduct),
    ];
  }, [summaryData]);

  // Prepare chart data based on view mode
  const chartData = useMemo(
    () => prepareChartData(productViewMode, productSortMode, allProducts),
    [productViewMode, productSortMode, allProducts],
  );

  // Performance analysis
  const performanceAnalysis = useMemo(
    () => calculatePerformanceAnalysis(allProducts),
    [allProducts],
  );

  const topPerformers = performanceAnalysis
    .filter((p) => p.overallScore === "excellent")
    .slice(0, 3);
  const poorPerformers = performanceAnalysis
    .filter((p) => p.overallScore === "poor")
    .slice(0, 3);

  // Transform top 5 products for Top5Products component
  const top5Products = useMemo(() => {
    if (!summaryData) return [];
    return summaryData.top_5_products.map(transformProduct);
  }, [summaryData]);

  // Transform underperforming products
  const underperformingProducts = useMemo(() => {
    if (!summaryData) return [];
    return summaryData.underperforming_products.map(transformProduct);
  }, [summaryData]);

  // Only show loading spinner on initial load
  if (loading && isInitialLoad) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <p className="text-danger text-lg font-semibold">Error</p>
        <p className="text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-3 md:gap-5 h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
        <div className="flex flex-col gap-0.5 md:gap-1">
          <h1 className="text-lg md:text-xl font-bold text-foreground">
            Ringkasan
          </h1>
          <p className="text-muted text-xs md:text-sm">
            Pantau ringkasan penjualan dan inventori Anda
          </p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <Tabs
            selectedKey={selectedPeriod}
            onSelectionChange={(key) => {
              setSelectedPeriod(key as TimePeriod);
              if (key === "custom") {
                setIsPopoverOpen(true);
              } else if (key !== "semua") {
                setCustomStartDate("");
                setCustomEndDate("");
                setIsPopoverOpen(false);
              } else {
                setCustomStartDate("");
                setCustomEndDate("");
                setIsPopoverOpen(false);
              }
            }}
          >
            <Tabs.ListContainer
              ref={tabsScrollRef}
              className="rounded-3xl p-1.5 md:p-1 w-full overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Tabs.List
                aria-label="Periode Waktu"
                className="bg-background-secondary flex *:h-8 *:md:h-6 *:flex-1 *:min-w-[80px] *:md:min-w-[60px] *:px-3 *:md:px-2 *:text-xs *:md:text-[11px] *:font-normal *:rounded-none *:bg-transparent *:data-[selected=true]:bg-transparent *:data-[selected=true]:text-foreground *:data-[hover=true]:bg-transparent"
                style={{ minWidth: "100%", width: "max-content" }}
              >
                <Tabs.Tab id="semua" style={{ scrollSnapAlign: "start" }}>
                  Semua
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="harian" style={{ scrollSnapAlign: "start" }}>
                  Harian
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="mingguan" style={{ scrollSnapAlign: "start" }}>
                  Mingguan
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="bulanan" style={{ scrollSnapAlign: "start" }}>
                  Bulanan
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="tahunan" style={{ scrollSnapAlign: "start" }}>
                  Tahunan
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="3tahun" style={{ scrollSnapAlign: "start" }}>
                  3 Tahun
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="5tahun" style={{ scrollSnapAlign: "start" }}>
                  5 Tahun
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="custom" style={{ scrollSnapAlign: "end" }}>
                  Kustom
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          {selectedPeriod === "custom" && (
            <Popover isOpen={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <Popover.Trigger>
                <Button size="sm" variant="ghost" className="h-8 px-3 text-xs">
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
                          customEndDate,
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
                      <label htmlFor="end-date" className="text-xs text-muted">
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

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
        <div className="p-3 md:p-4 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <p className="text-[10px] md:text-xs text-muted leading-tight">
              Total Pendapatan
            </p>
            <Surface className="p-1.5 md:p-2 rounded-lg bg-accent/10">
              <LuDollarSign className="w-3 h-3 md:w-4 md:h-4 text-accent" />
            </Surface>
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.totalRevenue)}
            </p>
            {financialData.revenueGrowth > 0 && (
              <div className="flex items-center gap-1 text-success">
                <span className="text-[10px] md:text-xs">
                  ↑ {financialData.revenueGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 md:p-4 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <p className="text-[10px] md:text-xs text-muted leading-tight">
              Total Profit
            </p>
            <Surface className="p-1.5 md:p-2 rounded-lg bg-success/10">
              <LuCoins className="w-3 h-3 md:w-4 md:h-4 text-success" />
            </Surface>
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.totalProfit)}
            </p>
            {financialData.profitGrowth > 0 && (
              <div className="flex items-center gap-1 text-success">
                <span className="text-[10px] md:text-xs">
                  ↑ {financialData.profitGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 md:p-4 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <p className="text-[10px] md:text-xs text-muted leading-tight">
              Profit Margin
            </p>
            <Surface className="p-1.5 md:p-2 rounded-lg bg-warning/10">
              <LuPercent className="w-3 h-3 md:w-4 md:h-4 text-warning" />
            </Surface>
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {financialData.profitMargin.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="p-3 md:p-4 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <p className="text-[10px] md:text-xs text-muted leading-tight">
              Rata-rata Transaksi
            </p>
            <Surface className="p-1.5 md:p-2 rounded-lg bg-primary/10">
              <LuTrendingUp className="w-3 h-3 md:w-4 md:h-4 text-primary" />
            </Surface>
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.averageTransactionValue)}
            </p>
            {financialData.transactionGrowth > 0 && (
              <div className="flex items-center gap-1 text-success">
                <span className="text-[10px] md:text-xs">
                  ↑ {financialData.transactionGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 md:p-4 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex items-center justify-between mb-1.5 md:mb-2">
            <p className="text-[10px] md:text-xs text-muted leading-tight">
              Total Pengeluaran
            </p>
            <Surface className="p-1.5 md:p-2 rounded-lg bg-danger/10">
              <LuReceipt className="w-3 h-3 md:w-4 md:h-4 text-danger" />
            </Surface>
          </div>
          <div className="flex flex-col gap-0.5 md:gap-1">
            <p className="text-base md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.totalExpenses)}
            </p>
            {financialData.expenseGrowth > 0 && (
              <div className="flex items-center gap-1 text-danger">
                <span className="text-[10px] md:text-xs">
                  ↑ {financialData.expenseGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Chart and Product Performance */}
      <div className="flex-1 min-h-0 bg-surface rounded-2xl md:rounded-3xl p-3 md:p-4 overflow-auto">
        <Tabs
          defaultSelectedKey="chart"
          className="w-full h-full flex flex-col"
        >
          <div className="flex flex-row items-center w-full justify-between gap-2 md:gap-4 mb-2 md:mb-0">
            <Tabs.ListContainer className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
              <Tabs.List
                aria-label="Ringkasan"
                className="w-fit *:h-7 md:*:h-8 *:w-fit *:px-2 md:*:px-4 *:text-[10px] md:*:text-xs *:font-normal"
              >
                <Tabs.Tab id="chart">
                  <span className="whitespace-nowrap">Grafik</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="top5">
                  <span className="whitespace-nowrap">Top 5</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="comparison">
                  <span className="whitespace-nowrap">Perbandingan</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="best">
                  <span className="whitespace-nowrap">Terbaik</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
                <Tabs.Tab id="attention">
                  <span className="whitespace-nowrap">Perhatian</span>
                  <Tabs.Indicator />
                </Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </div>

          {/* Chart Tab */}
          <Tabs.Panel id="chart" className="flex-1 min-h-0">
            <RevenueProfitChart currentPeriodData={currentPeriodData} />
          </Tabs.Panel>

          {/* Top 5 Produk Tab */}
          <Tabs.Panel id="top5" className="flex-1 min-h-0 overflow-auto">
            <Top5Products
              products={top5Products}
              productViewMode={productViewMode}
              productSortMode={productSortMode}
              onViewModeChange={setProductViewMode}
            />
          </Tabs.Panel>

          {/* Perbandingan Produk Tab */}
          <Tabs.Panel id="comparison" className="flex-1 min-h-0 overflow-auto">
            <ProductComparison
              chartData={chartData}
              productViewMode={productViewMode}
              onViewModeChange={setProductViewMode}
            />
          </Tabs.Panel>

          {/* Produk Berkinerja Terbaik Tab */}
          <Tabs.Panel id="best" className="flex-1 min-h-0 overflow-auto">
            <BestPerformingProducts topPerformers={topPerformers} />
          </Tabs.Panel>

          {/* Produk Perlu Perhatian Tab */}
          <Tabs.Panel id="attention" className="flex-1 min-h-0 overflow-auto">
            <ProductsNeedingAttention poorPerformers={poorPerformers} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default RingkasanPage;
