import React, { useState, useMemo, useEffect, useRef } from "react";
import { Surface, Tabs } from "@heroui/react";
import { TbChartDonut } from "react-icons/tb";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import {
  CHART_COLORS,
  formatCurrency,
  type ProductViewMode,
  type ProductSortMode,
  type ChartDataItem,
  type Product,
} from "../shared";

interface Top5ProductsProps {
  products: Product[];
  productViewMode: ProductViewMode;
  productSortMode: ProductSortMode;
  onViewModeChange: (mode: ProductViewMode) => void;
}

const Top5Products: React.FC<Top5ProductsProps> = ({
  products,
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
    const sorted = [...products].sort((a, b) => {
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
    // Create rich text styles for each color (smaller on mobile via container)
    const richStyles: { [key: string]: any } = {};
    chartData.forEach((item, index) => {
      richStyles[`color${index}`] = {
        fontSize: 14,
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
            fontSize: 14,
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
              fontSize: 12,
              fontWeight: 600,
            },
          },
          data: echartsData,
        },
      ],
    };
  }, [chartData, productViewMode, products]);

  // Reset selection when chart data changes
  useEffect(() => {
    setSelectedChartProduct(null);
  }, [productViewMode, productSortMode, products]);

  // Auto-switch from profit to revenue if profit is selected (since profit option is removed)
  useEffect(() => {
    if (productViewMode === "profit") {
      onViewModeChange("revenue");
    }
  }, [productViewMode, onViewModeChange]);

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
    <div className="flex flex-col gap-2 md:gap-4 min-h-0 md:h-full md:pt-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 md:gap-2 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2 mb-2">
          <Surface className="p-1.5 md:p-2 rounded-lg bg-accent/10 shrink-0">
            <TbChartDonut className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
          </Surface>
          <h2 className="text-sm md:text-lg font-bold text-foreground">
            Top 5 Produk
          </h2>
        </div>
        <Tabs
          selectedKey={
            productViewMode === "profit" ? "revenue" : productViewMode
          }
          onSelectionChange={(key) => {
            const mode = key as ProductViewMode;
            if (mode !== "profit") {
              onViewModeChange(mode);
            }
          }}
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
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* Donut Chart with Product List - on mobile content scrolls with tab panel; on desktop split layout with inner scroll */}
      <div className="md:p-4 rounded-xl flex flex-col flex-none md:flex-1 md:min-h-0">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 flex-none md:flex-1 md:min-h-0">
          {/* Pie Chart - fixed height on mobile so it scrolls with content; flex on desktop */}
          <div className="h-[220px] md:h-auto md:flex-1 min-w-0 md:max-h-none shrink-0">
            <div className="h-full w-full min-h-0">
              <ReactECharts
                option={donutChartOption}
                style={{ height: "100%", width: "100%" }}
                opts={{ renderer: "svg" }}
                onEvents={{
                  click: (params: any) => {
                    // Find the product by name from the clicked segment
                    const clickedProduct = products.find(
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

          {/* Product List - Right Side; on mobile no inner scroll so tab panel scroll is full-width */}
          <div className="flex-1 min-w-0 min-h-0 md:min-h-0">
            <div
              ref={(el) => {
                scrollContainerRef.current = el;
              }}
              className="flex flex-col gap-2 md:gap-3 md:h-full md:overflow-y-auto"
            >
              {chartData.map((item) => {
                const product = products.find((p) => p.id === item.id);
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
                    className={`flex flex-col gap-1.5 md:gap-2 p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all ${
                      selectedChartProduct === item.id
                        ? "border-accent border-2 md:border-[3px]"
                        : "border-separator border"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="flex-1 min-w-0 flex flex-row items-center justify-between gap-2">
                        <p className="text-xs md:text-sm font-semibold text-foreground truncate">
                          {item.name}
                        </p>
                        <p
                          className="text-sm md:text-lg font-bold shrink-0 tabular-nums"
                          style={{ color: item.color }}
                        >
                          {item.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 md:gap-2 mt-0.5 md:mt-1 text-[10px] md:text-xs">
                      <div className="flex justify-between gap-1">
                        <span className="text-muted shrink-0">Harga:</span>
                        <span className="font-semibold text-foreground truncate text-right">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-muted shrink-0">Stok:</span>
                        <span className="font-semibold text-foreground text-right">
                          {product.stock} unit
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-muted shrink-0">Terjual:</span>
                        <span className="font-semibold text-foreground text-right">
                          {product.quantitySold} unit
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-muted shrink-0">Pendapatan:</span>
                        <span className="font-semibold text-foreground truncate text-right">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-muted shrink-0">Profit:</span>
                        <span className="font-semibold text-success truncate text-right">
                          {formatCurrency(product.profit)}
                        </span>
                      </div>
                      <div className="flex justify-between gap-1">
                        <span className="text-muted shrink-0">Margin:</span>
                        <span className="font-semibold text-foreground text-right">
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
