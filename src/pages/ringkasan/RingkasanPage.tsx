"use client";

import React, { useState, useMemo } from "react";
import { Surface, Tabs, Button, Popover } from "@heroui/react";
import {
  LuTrendingUp,
  LuDollarSign,
  LuArrowUp,
  LuPercent,
  LuCoins,
} from "react-icons/lu";

// Components
import RevenueProfitChart from "./components/RevenueProfitChart";
import Top5Products from "./components/Top5Products";
import ProductComparison from "./components/ProductComparison";
import BestPerformingProducts from "./components/BestPerformingProducts";
import ProductsNeedingAttention from "./components/ProductsNeedingAttention";

// Shared utilities and types
import {
  financialData,
  timePeriodConfig,
  formatCurrency,
  type TimePeriod,
  type ProductViewMode,
  type ProductSortMode,
} from "./shared";
import { prepareChartData } from "./utils/chartData";
import { calculatePerformanceAnalysis } from "./utils/performanceAnalysis";

const RingkasanPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("harian");
  const [productViewMode, setProductViewMode] =
    useState<ProductViewMode>("revenue");
  const [productSortMode, setProductSortMode] =
    useState<ProductSortMode>("revenue");
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
  const chartData = useMemo(
    () => prepareChartData(productViewMode, productSortMode),
    [productViewMode, productSortMode]
  );

  // Performance analysis
  const performanceAnalysis = useMemo(() => calculatePerformanceAnalysis(), []);

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
            <RevenueProfitChart currentPeriodData={currentPeriodData} />
          </Tabs.Panel>

          {/* Top 5 Produk Tab */}
          <Tabs.Panel id="top5" className="flex-1 min-h-0 overflow-auto">
            <Top5Products
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
