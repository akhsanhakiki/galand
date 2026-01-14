import {
  CHART_COLORS,
  type ProductViewMode,
  type ProductSortMode,
  type ChartDataItem,
  type Product,
} from "../shared";

export const prepareChartData = (
  productViewMode: ProductViewMode,
  productSortMode: ProductSortMode,
  products: Product[] = []
): ChartDataItem[] => {
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
};
