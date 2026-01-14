import { type ProductWithScore, type Product } from "../shared";

export const calculatePerformanceAnalysis = (
  products: Product[] = []
): ProductWithScore[] => {
  if (products.length === 0) return [];

  const avgRevenue =
    products.reduce((sum, p) => sum + p.revenue, 0) / products.length;
  const avgQuantity =
    products.reduce((sum, p) => sum + p.quantitySold, 0) / products.length;
  const avgProfit =
    products.reduce((sum, p) => sum + p.profit, 0) / products.length;

  return products.map((product) => {
    const revenueScore =
      product.revenue >= avgRevenue * 1.2
        ? "excellent"
        : product.revenue >= avgRevenue
        ? "good"
        : product.revenue >= avgRevenue * 0.7
        ? "average"
        : "poor";
    const quantityScore =
      product.quantitySold >= avgQuantity * 1.2
        ? "excellent"
        : product.quantitySold >= avgQuantity
        ? "good"
        : product.quantitySold >= avgQuantity * 0.7
        ? "average"
        : "poor";
    const profitScore =
      product.profit >= avgProfit * 1.2
        ? "excellent"
        : product.profit >= avgProfit
        ? "good"
        : product.profit >= avgProfit * 0.7
        ? "average"
        : "poor";

    const overallScore =
      revenueScore === "excellent" &&
      quantityScore === "excellent" &&
      profitScore === "excellent"
        ? "excellent"
        : revenueScore === "poor" ||
          quantityScore === "poor" ||
          profitScore === "poor"
        ? "poor"
        : "good";

    return {
      ...product,
      revenueScore,
      quantityScore,
      profitScore,
      overallScore,
    };
  });
};
