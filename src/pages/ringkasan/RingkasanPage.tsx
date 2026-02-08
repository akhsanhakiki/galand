"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Surface, Tabs, Button, Popover, Spinner } from "@heroui/react";

import {
  LuTrendingUp,
  LuDollarSign,
  LuPercent,
  LuCoins,
  LuReceipt,
  LuShoppingCart,
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
  const { organizationChangeKey, loading: organizationLoading } =
    useOrganization();
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
    // Wait for organization (and auth) to be ready before first fetch.
    // On mobile, the page can mount before session/active org is set, causing
    // the first request to fail; deferring until !organizationLoading avoids that.
    if (organizationLoading) {
      setLoading(true);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchSummary = async (retryCount = 0) => {
      if (isInitialLoad) {
        setLoading(true);
      }
      setError(null);

      try {
        const dateRange = getDateRangeForPeriod(
          selectedPeriod,
          customStartDate,
          customEndDate
        );

        if (!dateRange) {
          if (!cancelled) {
            setSummaryData(null);
            setLoading(false);
          }
          return;
        }

        const data = await getSummary(dateRange.startDate, dateRange.endDate);
        if (!cancelled) {
          setSummaryData(data);
          setIsInitialLoad(false);
        }
      } catch (err) {
        if (cancelled) return;
        const isFirstLoadFailure = isInitialLoad && retryCount === 0;
        if (isFirstLoadFailure) {
          // Retry once after a short delay (handles auth/session race on first load, e.g. mobile)
          await new Promise((r) => setTimeout(r, 1000));
          if (!cancelled) return fetchSummary(1);
        }
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch summary"
          );
          setSummaryData(null);
          setIsInitialLoad(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, [
    selectedPeriod,
    customStartDate,
    customEndDate,
    isInitialLoad,
    organizationChangeKey,
    organizationLoading,
  ]);

  // Handle scroll snapping when tabs are clicked
  useEffect(() => {
    if (!tabsScrollRef.current) return;

    const scrollContainer = tabsScrollRef.current;
    const tabElements = Array.from(
      scrollContainer.querySelectorAll('[role="tab"]')
    ) as HTMLElement[];

    if (tabElements.length === 0) return;

    const selectedTab = tabElements.find(
      (tab) => tab.getAttribute("aria-selected") === "true"
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
    chartData: SummaryResponse["chart_data"]
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

    const avgTx = summaryData.average_transaction;
    const transactionCount =
      avgTx > 0 ? Math.round(summaryData.total_revenue / avgTx) : 0;

    const profitMargin =
      summaryData.total_revenue > 0
        ? (summaryData.total_profit / summaryData.total_revenue) * 100
        : 0;

    return {
      totalRevenue: summaryData.total_revenue,
      totalProfit: summaryData.total_profit,
      totalExpenses: summaryData.total_expenses,
      profitMargin: profitMargin,
      averageTransactionValue: avgTx,
      transactionCount,
      revenueGrowth: 0, // Not in API
      profitGrowth: 0, // Not in API
      expenseGrowth: 0, // Not in API
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
        customEndDate
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
    [productViewMode, productSortMode, allProducts]
  );

  // Performance analysis
  const performanceAnalysis = useMemo(
    () => calculatePerformanceAnalysis(allProducts),
    [allProducts]
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
    <div className="flex flex-col w-full gap-3 md:gap-5 flex-1 min-h-min md:h-full md:min-h-0">
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
              className="rounded-2xl md:rounded-3xl p-1 md:p-1 w-full overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Tabs.List
                aria-label="Periode Waktu"
                className="bg-background-secondary flex *:h-6 *:md:h-6 *:flex-1 *:min-w-[56px] *:md:min-w-[60px] *:px-2 *:md:px-2 *:text-[11px] *:md:text-[11px] *:font-normal *:rounded-none *:bg-transparent *:data-[selected=true]:bg-transparent *:data-[selected=true]:text-foreground *:data-[hover=true]:bg-transparent"
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
            <p className="order-2 text-xs text-muted leading-tight md:order-1">
              Total Pendapatan
            </p>
            <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-accent/10">
              <LuDollarSign className="w-4 h-4 md:w-3.5 md:h-3.5 text-accent" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.totalRevenue)}
            </p>
            {financialData.revenueGrowth > 0 && (
              <div className="flex items-center gap-1 text-success">
                <span className="text-xs">
                  ↑ {financialData.revenueGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
            <p className="order-2 text-xs text-muted leading-tight md:order-1">
              Total Profit
            </p>
            <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-success/10">
              <LuCoins className="w-4 h-4 md:w-3.5 md:h-3.5 text-success" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.totalProfit)}
            </p>
            {financialData.profitGrowth > 0 && (
              <div className="flex items-center gap-1 text-success">
                <span className="text-xs">↑ {financialData.profitGrowth}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
            <p className="order-2 text-xs text-muted leading-tight md:order-1">
              Profit Margin
            </p>
            <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-warning/10">
              <LuPercent className="w-4 h-4 md:w-3.5 md:h-3.5 text-warning" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {financialData.profitMargin.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
            <p className="order-2 text-xs text-muted leading-tight md:order-1">
              Rata-rata Transaksi
            </p>
            <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-primary/10">
              <LuTrendingUp className="w-4 h-4 md:w-3.5 md:h-3.5 text-primary" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.averageTransactionValue)}
            </p>
            {financialData.transactionGrowth > 0 && (
              <div className="flex items-center gap-1 text-success">
                <span className="text-xs">
                  ↑ {financialData.transactionGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
            <p className="order-2 text-xs text-muted leading-tight md:order-1">
              Jumlah Transaksi
            </p>
            <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-primary/10">
              <LuShoppingCart className="w-4 h-4 md:w-3.5 md:h-3.5 text-primary" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {financialData.transactionCount.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-5 bg-surface rounded-2xl md:rounded-3xl">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-2.5 mb-2 md:mb-3">
            <p className="order-2 text-xs text-muted leading-tight md:order-1">
              Total Pengeluaran
            </p>
            <Surface className="order-1 w-fit p-2 md:order-2 md:p-1.5 rounded-lg bg-danger/10">
              <LuReceipt className="w-4 h-4 md:w-3.5 md:h-3.5 text-danger" />
            </Surface>
          </div>
          <div className="flex flex-col gap-1 md:gap-1.5">
            <p className="text-lg md:text-xl font-bold text-foreground leading-tight">
              {formatCurrency(financialData.totalExpenses)}
            </p>
            {financialData.expenseGrowth > 0 && (
              <div className="flex items-center gap-1 text-danger">
                <span className="text-xs">
                  ↑ {financialData.expenseGrowth}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs for Chart and Product Performance - on mobile grow with content so page scrolls; on desktop flex-1 and scroll inside */}
      <div className="md:flex-1 min-h-0 bg-surface rounded-2xl md:rounded-3xl p-3 md:p-4 overflow-visible md:overflow-auto flex flex-col">
        <Tabs
          defaultSelectedKey="chart"
          className="w-full min-h-0 flex flex-col md:h-full"
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
          <Tabs.Panel id="chart" className="flex-1 min-h-min md:min-h-0">
            <RevenueProfitChart currentPeriodData={currentPeriodData} />
          </Tabs.Panel>

          {/* Top 5 Produk Tab - on mobile grow with content so parent scrolls; on desktop panel scrolls */}
          <Tabs.Panel
            id="top5"
            className="p-0 flex-1 min-h-min md:min-h-0 overflow-visible md:overflow-auto"
          >
            <Top5Products
              products={top5Products}
              productViewMode={productViewMode}
              productSortMode={productSortMode}
              onViewModeChange={setProductViewMode}
            />
          </Tabs.Panel>

          {/* Perbandingan Produk Tab */}
          <Tabs.Panel
            id="comparison"
            className="flex-1 min-h-min md:min-h-0 overflow-visible md:overflow-auto"
          >
            <ProductComparison
              chartData={chartData}
              productViewMode={productViewMode}
              onViewModeChange={setProductViewMode}
            />
          </Tabs.Panel>

          {/* Produk Berkinerja Terbaik Tab */}
          <Tabs.Panel
            id="best"
            className="flex-1 min-h-min md:min-h-0 overflow-visible md:overflow-auto"
          >
            <BestPerformingProducts topPerformers={topPerformers} />
          </Tabs.Panel>

          {/* Produk Perlu Perhatian Tab */}
          <Tabs.Panel
            id="attention"
            className="flex-1 min-h-min md:min-h-0 overflow-visible md:overflow-auto"
          >
            <ProductsNeedingAttention poorPerformers={poorPerformers} />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default RingkasanPage;
