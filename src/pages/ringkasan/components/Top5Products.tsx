import React, { useState, useMemo, useEffect, useRef } from "react";
import { Surface, Button } from "@heroui/react";
import { TbChartDonut } from "react-icons/tb";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import {
  allProducts,
  CHART_COLORS,
  formatCurrency,
  type ProductViewMode,
  type ProductSortMode,
  type ChartDataItem,
} from "../shared";

interface Top5ProductsProps {
  productViewMode: ProductViewMode;
  productSortMode: ProductSortMode;
  onViewModeChange: (mode: ProductViewMode) => void;
}

const Top5Products: React.FC<Top5ProductsProps> = ({
  productViewMode,
  productSortMode,
  onViewModeChange,
}) => {
  const [selectedChartProduct, setSelectedChartProduct] = useState<
    number | null
  >(null);
  const productCardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Prepare chart data based on view mode
  const chartData = useMemo<ChartDataItem[]>(() => {
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

  // ECharts option for donut chart
  const donutChartOption = useMemo<EChartsOption>(() => {
    // Create rich text styles for each color
    const richStyles: { [key: string]: any } = {};
    chartData.forEach((item, index) => {
      richStyles[`color${index}`] = {
        fontSize: 20,
        fontWeight: 500,
        color: item.color,
      };
    });

    // Convert chartData to ECharts format with thin fill and border
    const echartsData = chartData.map((item, index) => {
      // Convert color to thin fill (low opacity) - use 0.2 opacity for better visibility
      let fillColor = item.color;
      if (item.color.includes("hsl") && !item.color.includes("hsla")) {
        // Convert HSL to HSLA with opacity for thin fill
        fillColor = item.color.replace(")", ", 0.2)").replace("hsl", "hsla");
      } else if (item.color.includes("var")) {
        // For CSS variables, we'll use the color with opacity
        fillColor = item.color;
      }

      return {
        value: item.value,
        name: item.name,
        itemStyle: {
          color: fillColor,
          borderColor: item.color,
          borderWidth: 2.5,
          opacity: item.color.includes("var") ? 0.2 : undefined,
        },
        labelColor: item.color, // Store color for formatter access
        labelIndex: index, // Store index for rich style reference
      };
    });

    return {
      tooltip: {
        trigger: "item",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        borderColor: "transparent",
        textStyle: {
          color: "#fff",
        },
        formatter: (params: any) => {
          const numValue =
            typeof params.value === "number"
              ? params.value
              : Number(params.value);
          const formattedValue =
            productViewMode === "revenue" || productViewMode === "profit"
              ? formatCurrency(numValue)
              : `${numValue} unit`;
          return `${params.name}<br/>${formattedValue} (${params.percent}%)`;
        },
      },
      legend: {
        show: false,
      },
      series: [
        {
          name:
            productViewMode === "revenue"
              ? "Pendapatan"
              : productViewMode === "quantity"
              ? "Kuantitas"
              : "Profit",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderWidth: 2.5,
          },
          label: {
            show: true,
            position: "outside",
            formatter: (params: any) => {
              const index = params.dataIndex;
              const styleName = `color${index}`;
              return `{${styleName}|${params.percent}%}`;
            },
            fontSize: 20,
            fontWeight: 500,
            rich: richStyles,
          },
          labelLine: {
            show: false,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.3)",
              borderWidth: 3,
            },
            label: {
              fontSize: 14,
              fontWeight: 600,
            },
          },
          data: echartsData,
        },
      ],
    };
  }, [chartData, productViewMode]);

  // Reset selection when chart data changes
  useEffect(() => {
    setSelectedChartProduct(null);
  }, [productViewMode, productSortMode]);

  // Auto-scroll to highlighted card
  useEffect(() => {
    if (selectedChartProduct !== null) {
      const cardElement = productCardRefs.current[selectedChartProduct];
      if (cardElement) {
        // Use scrollIntoView with smooth behavior
        cardElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [selectedChartProduct]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Surface className="p-2 rounded-lg bg-accent/10">
            <TbChartDonut className="w-4 h-4 text-accent" />
          </Surface>
          <h2 className="text-lg font-bold text-foreground">Top 5 Produk</h2>
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

      {/* Donut Chart with Product List */}
      <div className="p-4 border border-separator rounded-xl flex-1 min-h-0 flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 flex-1 min-h-0">
          {/* Pie Chart - Left Side */}
          <div className="flex-1 min-w-0">
            <div className="h-full w-full">
              <ReactECharts
                option={donutChartOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "svg" }}
                onEvents={{
                  click: (params: any) => {
                    // Find the product by name from the clicked segment
                    const clickedProduct = allProducts.find(
                      (p) => p.name === params.name
                    );
                    if (clickedProduct) {
                      setSelectedChartProduct(
                        selectedChartProduct === clickedProduct.id
                          ? null
                          : clickedProduct.id
                      );
                    }
                  },
                }}
              />
            </div>
          </div>

          {/* Product List - Right Side */}
          <div className="flex-1 min-w-0">
            <div
              ref={(el) => {
                scrollContainerRef.current = el;
              }}
              className="flex flex-col gap-3 h-full overflow-y-auto"
            >
              {chartData.map((item) => {
                const product = allProducts.find((p) => p.id === item.id);
                if (!product) return null;

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      if (el) {
                        productCardRefs.current[item.id] = el;
                      } else {
                        delete productCardRefs.current[item.id];
                      }
                      return undefined;
                    }}
                    className={`flex flex-col gap-2 p-3 rounded-2xl border transition-all ${
                      selectedChartProduct === item.id
                        ? "border-accent border-[3px]"
                        : "border-separator border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0 flex flex-row items-center justify-between">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: item.color }}
                        >
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
    </div>
  );
};

export default Top5Products;
