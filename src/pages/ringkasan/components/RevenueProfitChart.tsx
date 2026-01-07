import React, { useMemo } from "react";
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
    color: "var(--primary-400)",
  },
} satisfies ChartConfig;

interface RevenueProfitChartProps {
  currentPeriodData: {
    data: TrendData[];
    title: string;
    subtitle: string;
  };
}

const RevenueProfitChart: React.FC<RevenueProfitChartProps> = ({
  currentPeriodData,
}) => {
  // ECharts option for area chart
  const areaChartOption = useMemo<EChartsOption>(() => {
    const revenueColor = chartConfig.revenue.color;
    const profitColor = chartConfig.profit.color;

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

    return {
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
                : chartConfig.profit.label;
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
          color: "var(--muted-foreground)",
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
          color: "var(--muted-foreground)",
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
            color: "rgba(0, 0, 0, 0.1)",
            opacity: 0.5,
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
                  color: revenueRgb.replace("rgb", "rgba").replace(")", ", 0)"),
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
                  color: profitRgb.replace("rgb", "rgba").replace(")", ", 0)"),
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
      ],
    };
  }, [currentPeriodData]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-row items-center gap-2">
          <Surface className="p-2 rounded-lg bg-accent/10">
            <LuChartLine className="w-4 h-4 text-accent" />
          </Surface>
          <h2 className="text-lg font-bold text-foreground">
            {currentPeriodData.title}
          </h2>
          <p className="text-sm text-muted">
            {"( "}
            {currentPeriodData.subtitle}
            {" )"}
          </p>
        </div>
        {/* Custom Legend */}
        <div className="flex items-center justify-center gap-6 px-4 py-3 rounded-xl">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2.5">
              <div
                className="h-3.5 w-3.5 shrink-0 rounded-md"
                style={{
                  backgroundColor: config.color,
                }}
              />
              <span className="text-sm font-medium text-foreground">
                {config.label}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <div className="h-full w-full">
          <ReactECharts
            option={areaChartOption}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "svg" }}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueProfitChart;
