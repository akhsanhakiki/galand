import React, { useMemo, useEffect, useRef, useState } from "react";
import { Surface } from "@heroui/react";
import { LuChartLine } from "react-icons/lu";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import {
  type TrendData,
  formatCurrency,
  timePeriodConfig,
  type TimePeriod,
} from "../shared";
import type { ChartConfig } from "../../../components/chart";

const chartConfig = {
  revenue: {
    label: "Pendapatan",
    color: "hsl(210, 70%, 55%)",
  },
  profit: {
    label: "Profit",
    color: "hsl(142, 71%, 45%)",
  },
  expense: {
    label: "Pengeluaran",
    color: "hsl(0, 70%, 55%)",
  },
} satisfies ChartConfig;

interface RevenueProfitChartProps {
  currentPeriodData: {
    data: TrendData[];
    title: string;
    subtitle: string;
  };
}

const RevenueProfitChart: React.FC<RevenueProfitChartProps> = React.memo(
  ({ currentPeriodData }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const echartsInstanceRef = useRef<any>(null);
    const previousDataKeyRef = useRef<string>("");
    const previousThemeColorsRef = useRef<string>("");
    const [themeColors, setThemeColors] = useState({
      mutedForeground: "#808080",
      border: "#e5e5e5",
    });

    // Get computed CSS variable values for theme-aware colors
    useEffect(() => {
      const updateThemeColors = () => {
        // Create temporary elements to get computed color values
        const mutedEl = document.createElement("div");
        mutedEl.className = "text-muted";
        mutedEl.style.position = "absolute";
        mutedEl.style.visibility = "hidden";
        mutedEl.style.pointerEvents = "none";
        document.body.appendChild(mutedEl);
        const mutedForeground = getComputedStyle(mutedEl).color || "#808080";
        document.body.removeChild(mutedEl);

        const borderEl = document.createElement("div");
        borderEl.style.borderColor = "var(--border)";
        borderEl.style.position = "absolute";
        borderEl.style.visibility = "hidden";
        borderEl.style.pointerEvents = "none";
        borderEl.style.borderWidth = "1px";
        borderEl.style.borderStyle = "solid";
        document.body.appendChild(borderEl);
        let border = getComputedStyle(borderEl).borderColor || "#e5e5e5";
        document.body.removeChild(borderEl);

        // Fallback to separator if border didn't work
        if (border === "rgba(0, 0, 0, 0)" || !border) {
          const separatorEl = document.createElement("div");
          separatorEl.style.borderColor = "var(--separator)";
          separatorEl.style.position = "absolute";
          separatorEl.style.visibility = "hidden";
          separatorEl.style.pointerEvents = "none";
          separatorEl.style.borderWidth = "1px";
          separatorEl.style.borderStyle = "solid";
          document.body.appendChild(separatorEl);
          border = getComputedStyle(separatorEl).borderColor || "#e5e5e5";
          document.body.removeChild(separatorEl);
        }

        setThemeColors({
          mutedForeground: mutedForeground || "#808080",
          border: border || "#e5e5e5",
        });
      };

      updateThemeColors();

      // Watch for theme changes
      const observer = new MutationObserver(updateThemeColors);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });

      // Also listen to theme changes via media query
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleThemeChange = () => updateThemeColors();
      darkModeQuery.addEventListener("change", handleThemeChange);

      return () => {
        observer.disconnect();
        darkModeQuery.removeEventListener("change", handleThemeChange);
      };
    }, []);

    // Helper to convert hex/rgb to rgba with opacity
    const getRgbaColor = (color: string, opacity: number): string => {
      // If it's already rgba/rgb, extract the RGB values
      const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        return `rgba(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]}, ${opacity})`;
      }

      // If it's hex
      const hexMatch = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
      if (hexMatch) {
        const hex = hexMatch[1];
        const r = parseInt(
          hex.length === 3 ? hex[0] + hex[0] : hex.substring(0, 2),
          16
        );
        const g = parseInt(
          hex.length === 3 ? hex[1] + hex[1] : hex.substring(2, 4),
          16
        );
        const b = parseInt(
          hex.length === 3 ? hex[2] + hex[2] : hex.substring(4, 6),
          16
        );
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }

      // Fallback
      return `rgba(0, 0, 0, ${opacity})`;
    };

    // Track data and theme changes separately to control animation
    const dataKey = useMemo(
      () => JSON.stringify(currentPeriodData.data),
      [currentPeriodData.data]
    );
    const themeKey = useMemo(() => JSON.stringify(themeColors), [themeColors]);

    // Determine if data changed (should animate) or only theme changed (should not animate)
    // Check BEFORE updating refs to get correct comparison
    const isFirstRender = previousDataKeyRef.current === "";
    const isDataChange =
      !isFirstRender && previousDataKeyRef.current !== dataKey;
    const isThemeChangeOnly =
      !isDataChange &&
      previousThemeColorsRef.current !== themeKey &&
      previousThemeColorsRef.current !== "";

    // Only animate when data changes (including first render), not when only theme colors change
    const shouldAnimate = (isDataChange || isFirstRender) && !isThemeChangeOnly;

    // Update refs after determining animation state
    useEffect(() => {
      if (isDataChange || isFirstRender) {
        previousDataKeyRef.current = dataKey;
      }
      if (previousThemeColorsRef.current !== themeKey) {
        previousThemeColorsRef.current = themeKey;
      }
    }, [dataKey, themeKey, isDataChange, isFirstRender]);

    // ECharts option for area chart
    const areaChartOption = useMemo<EChartsOption>(() => {
      const revenueColor = chartConfig.revenue.color;
      const profitColor = chartConfig.profit.color;
      const expenseColor = chartConfig.expense.color;

      // Helper to get RGB color for gradients (ECharts needs RGB for gradients)
      const getRgbColor = (color: string): string => {
        if (color.includes("var(")) {
          return "rgb(59, 130, 246)";
        }
        if (color.includes("hsl")) {
          const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
          if (match) {
            const h = parseInt(match[1]) / 360;
            const s = parseInt(match[2]) / 100;
            const l = parseInt(match[3]) / 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
            const m = l - c / 2;
            let r = 0,
              g = 0,
              b = 0;
            if (h * 6 < 1) {
              r = c;
              g = x;
              b = 0;
            } else if (h * 6 < 2) {
              r = x;
              g = c;
              b = 0;
            } else if (h * 6 < 3) {
              r = 0;
              g = c;
              b = x;
            } else if (h * 6 < 4) {
              r = 0;
              g = x;
              b = c;
            } else if (h * 6 < 5) {
              r = x;
              g = 0;
              b = c;
            } else {
              r = c;
              g = 0;
              b = x;
            }
            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            return `rgb(${r}, ${g}, ${b})`;
          }
        }
        return color;
      };

      const revenueRgb = getRgbColor(revenueColor);
      const profitRgb = getRgbColor(profitColor);
      const expenseRgb = getRgbColor(expenseColor);

      return {
        animation: shouldAnimate,
        animationDuration: shouldAnimate ? 800 : 0,
        animationEasing: shouldAnimate ? "cubicOut" : "linear",
        animationDelay: shouldAnimate ? 0 : undefined,
        tooltip: {
          trigger: "axis",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "transparent",
          textStyle: {
            color: "#fff",
          },
          formatter: (params: any) => {
            if (!Array.isArray(params)) return "";
            let result = params[0].axisValue + "<br/>";
            params.forEach((param: any) => {
              const numValue =
                typeof param.value === "number"
                  ? param.value
                  : Number(param.value);
              const label =
                param.seriesName === "revenue"
                  ? chartConfig.revenue.label
                  : param.seriesName === "profit"
                  ? chartConfig.profit.label
                  : chartConfig.expense.label;
              result += `${param.marker} ${label}: ${formatCurrency(
                numValue
              )}<br/>`;
            });
            return result;
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: currentPeriodData.data.map((item) => item.label),
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            margin: 8,
            color: themeColors.mutedForeground,
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            margin: 8,
            color: themeColors.mutedForeground,
            formatter: (value: number) => {
              if (value >= 1000000) {
                return `Rp ${(value / 1000000).toFixed(0)} J`;
              } else if (value >= 1000) {
                return `Rp ${(value / 1000).toFixed(0)} K`;
              }
              return `Rp ${value}`;
            },
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: "dashed",
              color: getRgbaColor(themeColors.border, 0.5),
              opacity: 1,
            },
          },
        },
        series: [
          {
            name: "revenue",
            type: "line",
            smooth: true,
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: revenueRgb
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.4)"),
                  },
                  {
                    offset: 1,
                    color: revenueRgb
                      .replace("rgb", "rgba")
                      .replace(")", ", 0)"),
                  },
                ],
              },
            },
            lineStyle: {
              color: revenueRgb,
              width: 2,
            },
            itemStyle: {
              color: revenueRgb,
            },
            data: currentPeriodData.data.map((item) => item.revenue),
          },
          {
            name: "profit",
            type: "line",
            smooth: true,
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: profitRgb
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.4)"),
                  },
                  {
                    offset: 1,
                    color: profitRgb
                      .replace("rgb", "rgba")
                      .replace(")", ", 0)"),
                  },
                ],
              },
            },
            lineStyle: {
              color: profitRgb,
              width: 2,
            },
            itemStyle: {
              color: profitRgb,
            },
            data: currentPeriodData.data.map((item) => item.profit),
          },
          {
            name: "expense",
            type: "line",
            smooth: true,
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: expenseRgb
                      .replace("rgb", "rgba")
                      .replace(")", ", 0.4)"),
                  },
                  {
                    offset: 1,
                    color: expenseRgb
                      .replace("rgb", "rgba")
                      .replace(")", ", 0)"),
                  },
                ],
              },
            },
            lineStyle: {
              color: expenseRgb,
              width: 2,
            },
            itemStyle: {
              color: expenseRgb,
            },
            data: currentPeriodData.data.map((item) => item.expense),
          },
        ],
      };
    }, [currentPeriodData, themeColors, shouldAnimate]);

    return (
      <div className="flex flex-col gap-2 md:gap-4 h-full min-h-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 shrink-0">
          <div className="flex flex-row items-center gap-2 min-w-0">
            <Surface className="p-1.5 md:p-2 rounded-lg bg-accent/10 shrink-0">
              <LuChartLine className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
            </Surface>
            <div className="flex flex-col min-w-0">
              <h2 className="text-sm md:text-lg font-bold text-foreground truncate">
                {currentPeriodData.title}
              </h2>
              <p className="text-xs md:text-sm text-muted truncate">
                {"( "}
                {currentPeriodData.subtitle}
                {" )"}
              </p>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="flex items-center justify-start md:justify-center gap-3 md:gap-6 px-2 py-2 md:px-4 md:py-3 rounded-xl shrink-0 flex-wrap">
            {Object.entries(chartConfig).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5 md:gap-2.5">
                <div
                  className="h-2.5 w-2.5 md:h-3.5 md:w-3.5 shrink-0 rounded-md"
                  style={{
                    backgroundColor: config.color,
                  }}
                />
                <span className="text-xs md:text-sm font-medium text-foreground">
                  {config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-[320px] md:min-h-0" ref={chartRef}>
          <div className="h-full w-full min-h-[320px] md:min-h-0">
            <ReactECharts
              option={areaChartOption}
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "svg" }}
              notMerge={!shouldAnimate}
              lazyUpdate={false}
              onChartReady={(chart) => {
                echartsInstanceRef.current = chart;
              }}
            />
          </div>
        </div>
      </div>
    );
  }
);

RevenueProfitChart.displayName = "RevenueProfitChart";

export default RevenueProfitChart;
