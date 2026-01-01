"use client";

import React, { useState } from "react";
import { Surface, Tabs } from "@heroui/react";
import {
  LuTrendingUp,
  LuDollarSign,
  LuShoppingCart,
  LuArrowUp,
  LuPercent,
  LuChartBar,
  LuCoins,
} from "react-icons/lu";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "../../components/ui/chart";

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

// Dummy data for daily revenue trend (last 7 days)
const dailyTrendData = [
  { day: "Sen", revenue: 1200000, profit: 360000 },
  { day: "Sel", revenue: 1800000, profit: 540000 },
  { day: "Rab", revenue: 1500000, profit: 450000 },
  { day: "Kam", revenue: 2200000, profit: 660000 },
  { day: "Jum", revenue: 1900000, profit: 570000 },
  { day: "Sab", revenue: 2500000, profit: 750000 },
  { day: "Min", revenue: 1350000, profit: 405000 },
];

// Chart config for revenue and profit
const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "var(--primary-300)",
  },
  profit: {
    label: "Profit",
    color: "var(--primary-400)",
  },
} satisfies ChartConfig;

// Dummy data for top selling products
const topSellingProducts = [
  {
    id: 1,
    name: "Produk A",
    quantitySold: 245,
    revenue: 12250000,
    profit: 3675000,
  },
  {
    id: 2,
    name: "Produk B",
    quantitySold: 189,
    revenue: 9450000,
    profit: 2835000,
  },
  {
    id: 3,
    name: "Produk C",
    quantitySold: 156,
    revenue: 7800000,
    profit: 2340000,
  },
  {
    id: 4,
    name: "Produk D",
    quantitySold: 134,
    revenue: 6700000,
    profit: 2010000,
  },
  {
    id: 5,
    name: "Produk E",
    quantitySold: 98,
    revenue: 4900000,
    profit: 1470000,
  },
];

// Dummy data for top revenue products
const topRevenueProducts = [
  {
    id: 1,
    name: "Produk A",
    revenue: 12250000,
    quantitySold: 245,
    profitMargin: 30,
  },
  {
    id: 2,
    name: "Produk B",
    revenue: 9450000,
    quantitySold: 189,
    profitMargin: 30,
  },
  {
    id: 3,
    name: "Produk C",
    revenue: 7800000,
    quantitySold: 156,
    profitMargin: 30,
  },
  {
    id: 4,
    name: "Produk D",
    revenue: 6700000,
    quantitySold: 134,
    profitMargin: 30,
  },
  {
    id: 5,
    name: "Produk E",
    revenue: 4900000,
    quantitySold: 98,
    profitMargin: 30,
  },
];

// Helper function to format currency
const formatCurrency = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

const RingkasanPage = () => {
  return (
    <div className="flex flex-col w-full h-full gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Ringkasan</h1>
        <p className="text-muted text-sm">
          Pantau ringkasan penjualan dan inventori Anda
        </p>
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
          <Tabs.ListContainer>
            <Tabs.List
              aria-label="Ringkasan"
              className="w-fit *:h-8 *:w-fit *:px-4 *:text-xs *:font-normal"
            >
              <Tabs.Tab id="chart">
                Grafik
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="products">
                Produk
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>

          {/* Chart Tab */}
          <Tabs.Panel id="chart" className="flex-1 min-h-0">
            <div className="flex flex-col gap-4 h-full">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-foreground">
                  Tren Pendapatan & Profit
                </h2>
                <p className="text-sm text-muted">7 Hari Terakhir</p>
              </div>
              <div className="flex-1 min-h-0">
                <ChartContainer config={chartConfig} className="h-full w-full">
                  <BarChart
                    accessibilityLayer
                    data={dailyTrendData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      tickMargin={8}
                      axisLine={false}
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
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      fill="var(--color-profit)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </Tabs.Panel>

          {/* Products Tab */}
          <Tabs.Panel id="products" className="flex-1 min-h-0 overflow-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Selling Products */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Surface className="p-2 rounded-lg bg-accent/10">
                    <LuShoppingCart className="w-4 h-4 text-accent" />
                  </Surface>
                  <h2 className="text-lg font-bold text-foreground">
                    Produk Terlaris
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {topSellingProducts.slice(0, 5).map((product, index) => (
                    <div
                      key={product.id}
                      className="p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-accent">
                              #{index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-muted">
                              {product.quantitySold} unit
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-separator">
                        <div>
                          <p className="text-xs text-muted">Pendapatan</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted">Profit</p>
                          <p className="text-sm font-semibold text-success">
                            {formatCurrency(product.profit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Revenue Products */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Surface className="p-2 rounded-lg bg-success/10">
                    <LuChartBar className="w-4 h-4 text-success" />
                  </Surface>
                  <h2 className="text-lg font-bold text-foreground">
                    Pendapatan Tertinggi
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {topRevenueProducts.slice(0, 5).map((product, index) => {
                    const revenuePercentage =
                      (product.revenue / financialData.totalRevenue) * 100;
                    return (
                      <div
                        key={product.id}
                        className="p-3 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-success/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-success">
                                #{index + 1}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted">
                                {product.quantitySold} unit
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs text-muted">Kontribusi</p>
                            <p className="text-xs font-semibold text-foreground">
                              {revenuePercentage.toFixed(1)}%
                            </p>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                            <div
                              className="h-full bg-success rounded-full transition-all"
                              style={{ width: `${revenuePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-separator">
                          <div>
                            <p className="text-xs text-muted">Pendapatan</p>
                            <p className="text-sm font-semibold text-foreground">
                              {formatCurrency(product.revenue)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted">Margin</p>
                            <p className="text-sm font-semibold text-success">
                              {product.profitMargin}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default RingkasanPage;
