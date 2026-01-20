import React from "react";
import { Surface, Card, Button } from "@heroui/react";
import { LuChartBar } from "react-icons/lu";
import {
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
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
              variant={productViewMode === "revenue" ? "primary" : "ghost"}
              onPress={() => onViewModeChange("revenue")}
              className="h-7 px-3 text-xs"
            >
              Pendapatan
            </Button>
            <Button
              size="sm"
              variant={productViewMode === "quantity" ? "primary" : "ghost"}
              onPress={() => onViewModeChange("quantity")}
              className="h-7 px-3 text-xs"
            >
              Kuantitas
            </Button>
            <Button
              size="sm"
              variant={productViewMode === "profit" ? "primary" : "ghost"}
              onPress={() => onViewModeChange("profit")}
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
                  width={80}
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
  );
};

export default ProductComparison;
