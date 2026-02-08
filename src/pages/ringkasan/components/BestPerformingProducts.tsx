import React from "react";
import { Surface } from "@heroui/react";
import { LuTrendingUp, LuArrowUp, LuArrowDown } from "react-icons/lu";
import { type ProductWithScore, formatCurrency } from "../shared";

interface BestPerformingProductsProps {
  topPerformers: ProductWithScore[];
}

const BestPerformingProducts: React.FC<BestPerformingProductsProps> = ({
  topPerformers,
}) => {
  return (
    <div className="flex flex-col gap-2 md:gap-4 h-full p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 md:gap-2 shrink-0">
        <div className="flex items-center gap-1.5 md:gap-2 mb-2">
          <Surface className="p-1.5 md:p-2 rounded-lg bg-success/10 shrink-0">
            <LuTrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-success" />
          </Surface>
          <h2 className="text-sm md:text-lg font-bold text-foreground">
            Produk Berkinerja Terbaik
          </h2>
        </div>
      </div>
      <div>
        <div className="flex flex-col gap-3">
          {topPerformers.map((product, index) => (
            <div
              key={product.id}
              className="p-3 rounded-xl bg-success/5 border border-success-soft-hover"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-success-soft-hover flex items-center justify-center">
                    <span className="text-xs font-bold text-success">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted">
                      {product.quantitySold} unit terjual
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-success">
                  {product.trend === "up" ? (
                    <LuArrowUp className="w-3 h-3" />
                  ) : (
                    <LuArrowDown className="w-3 h-3" />
                  )}
                  <span className="text-xs font-semibold">
                    {Math.abs(product.trendValue).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-separator">
                <div>
                  <p className="text-xs text-muted">Pendapatan</p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Profit</p>
                  <p className="text-sm font-semibold text-success">
                    {formatCurrency(product.profit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted">Margin</p>
                  <p className="text-sm font-semibold text-foreground">
                    {product.profitMargin}%
                  </p>
                </div>
              </div>
            </div>
          ))}
          {topPerformers.length === 0 && (
            <p className="text-sm text-muted text-center py-4">
              Tidak ada produk dengan kinerja excellent
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BestPerformingProducts;
