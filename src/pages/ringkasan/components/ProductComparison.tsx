import React from "react";
import { Surface, Card, Tabs } from "@heroui/react";
import { LuChartBar } from "react-icons/lu";
import { Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/chart";
import {
  type ProductViewMode,
  type ChartDataItem,
  formatCurrency,
} from "../shared";

interface ProductComparisonProps {
  chartData: ChartDataItem[];
  productViewMode: ProductViewMode;
  onViewModeChange: (mode: ProductViewMode) => void;
}

const ProductComparison: React.FC<ProductComparisonProps> = ({
  chartData,
  productViewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex flex-col gap-4 h-full min-h-[420px] md:min-h-0">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 md:gap-2 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2 mb-2">
          <Surface className="p-1.5 md:p-2 rounded-lg bg-accent/10 shrink-0">
            <LuChartBar className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
          </Surface>
          <h2 className="text-sm md:text-lg font-bold text-foreground">
            Perbandingan Produk
          </h2>
        </div>
        <Tabs
          selectedKey={productViewMode}
          onSelectionChange={(key) => onViewModeChange(key as ProductViewMode)}
          className="w-full sm:w-fit min-w-0"
        >
          <Tabs.ListContainer className="w-full sm:w-auto min-w-0">
            <Tabs.List
              aria-label="View Mode"
              className="w-full sm:w-fit *:h-6 *:md:h-7 *:flex-1 *:sm:flex-initial *:min-w-0 *:w-fit *:px-2 *:md:px-2.5 *:text-[10px] *:md:text-[11px] *:font-normal *:leading-tight"
            >
              <Tabs.Tab id="revenue">
                Pendapatan
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="quantity">
                Kuantitas
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="profit">
                Profit
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>
      <Card className="p-4 flex-1 flex flex-col min-h-0">
        <Card.Content className="flex-1 min-h-0 flex flex-col">
          <div className="min-h-0 flex-1">
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
                  tickFormatter={(value: number) => {
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
                  width={100}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => {
                        const numValue =
                          typeof value === "number" ? value : Number(value);
                        return productViewMode === "revenue" ||
                          productViewMode === "profit"
                          ? formatCurrency(numValue)
                          : `${numValue} unit`;
                      }}
                    />
                  }
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barCategoryGap={4}>
                  {chartData.map((entry, index) => {
                    const fillColor =
                      entry.color.includes("hsl") &&
                      !entry.color.includes("hsla")
                        ? entry.color
                            .replace(")", ", 0.2)")
                            .replace("hsl", "hsla")
                        : entry.color;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={fillColor}
                        stroke={entry.color}
                        strokeWidth={2.5}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
};

export default ProductComparison;
