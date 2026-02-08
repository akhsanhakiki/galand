"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "../utils/cn";

// Type definitions for recharts payload
type TooltipPayloadItem = {
  value?: string | number | (string | number)[];
  name?: string | number;
  dataKey?: string | number;
  color?: string;
  payload?: {
    chartConfig?: ChartConfig;
    fill?: string;
    [key: string]: unknown;
  };
  graphicalItemId?: string;
  [key: string]: unknown;
};

// Chart container component
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig;
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"];
    className?: string;
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

  return (
    <div
      data-chart={chartId}
      ref={ref}
      className={cn(
        "w-full text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted dark:[&_.recharts-cartesian-axis-tick_text]:fill-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-surface [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-bar-rectangle]:hover:opacity-100 [&_.recharts-bar-rectangle]:hover:fill-inherit",
        className
      )}
      {...props}
    >
      <ChartStyle id={chartId} config={config} />
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  );
});
ChartContainer.displayName = "Chart";

// Chart style component for CSS variables
const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: [
          ...Object.entries(config)
            .filter(([_, config]) => config.theme || config.color)
            .map(([key, itemConfig]) => {
              const color = itemConfig.theme
                ? itemConfig.theme.light || itemConfig.theme.dark
                : itemConfig.color;
              return `[data-chart=${id}] { --color-${key}: ${color}; }`;
            }),
          `[data-chart=${id}] .recharts-bar-rectangle:hover { opacity: 1 !important; fill: inherit !important; }`,
          `[data-chart=${id}] .recharts-active-bar { opacity: 1 !important; fill: inherit !important; }`,
          `[data-chart=${id}] .recharts-tooltip-cursor { fill: var(--surface) !important; }`,
          `[data-chart=${id}] .recharts-rectangle.recharts-tooltip-cursor { fill: var(--surface) !important; }`,
        ].join("\n"),
      }}
    />
  );
};

// Chart tooltip component
const ChartTooltip = RechartsPrimitive.Tooltip;

// Chart tooltip content component
const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: "line" | "dot" | "dashed";
      nameKey?: string;
      labelKey?: string;
      active?: boolean;
      payload?: TooltipPayloadItem[];
      label?: string | number;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null;
      }

      const [item] = payload;
      const key = `${labelKey || item.dataKey || item.name || "value"}`;
      const itemConfig = item.payload?.chartConfig?.[key];
      const value =
        !labelKey && typeof label === "string"
          ? label
          : itemConfig?.label || item.name;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload as any)}
          </div>
        );
      }

      if (!value) {
        return null;
      }

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [label, labelFormatter, payload, hideLabel, labelClassName, labelKey]);

    if (!active || !payload?.length) {
      return null;
    }

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-surface px-2.5 py-1.5 text-xs shadow-md",
          className
        )}
      >
        {!nestLabel ? tooltipLabel : null}
        <div className="grid gap-1.5">
          {payload.map((item: TooltipPayloadItem, index: number) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`;
            const itemConfig = item.payload?.chartConfig?.[key] || {};
            const indicatorColor = color || item.payload?.fill || item.color;

            return (
              <div
                key={item.dataKey || index}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {(() => {
                  const itemValue =
                    typeof item.value === "object" && item.value !== null
                      ? (item.value as any)?.value ?? item.value
                      : item.value;

                  const displayValue =
                    formatter && itemValue !== undefined && item.name
                      ? (() => {
                          try {
                            const formatted = (formatter as any)(
                              itemValue,
                              [item],
                              index,
                              {
                                label: labelFormatter
                                  ? labelFormatter(label, payload as any)
                                  : typeof label === "string"
                                  ? label
                                  : tooltipLabel,
                                active,
                              },
                              item
                            );
                            // Handle array return from formatter
                            if (Array.isArray(formatted)) {
                              return formatted[0];
                            }
                            // Ensure we return a valid React child
                            if (
                              typeof formatted === "object" &&
                              formatted !== null
                            ) {
                              return String(formatted);
                            }
                            return formatted;
                          } catch (e) {
                            return typeof itemValue === "number"
                              ? itemValue.toLocaleString()
                              : String(itemValue ?? "");
                          }
                        })()
                      : itemValue !== undefined && itemValue !== null
                      ? typeof itemValue === "number"
                        ? itemValue.toLocaleString()
                        : typeof itemValue === "string"
                        ? itemValue
                        : String(itemValue)
                      : null;

                  return (
                    <div
                      className={cn(
                        "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                        indicator === "dot" && "items-center"
                      )}
                    >
                      {!hideIndicator ? (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            }
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      ) : null}
                      <div
                        className={cn(
                          "flex flex-1 items-center justify-between leading-none",
                          nestLabel ? "gap-2" : "gap-4"
                        )}
                      >
                        <div className="grid gap-1.5">
                          {nestLabel ? tooltipLabel : null}
                          <span className="text-muted-foreground">
                            {itemConfig?.label || item.name}
                          </span>
                        </div>
                        {displayValue !== null && (
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {displayValue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = "ChartTooltip";

// Chart legend component
const ChartLegend = RechartsPrimitive.Legend;

// Chart legend content component
const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> &
    Omit<React.ComponentProps<typeof RechartsPrimitive.Legend>, "content"> & {
      hideIcon?: boolean;
      nameKey?: string;
      payload?: TooltipPayloadItem[];
    }
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      ...props
    },
    ref
  ) => {
    if (!payload?.length) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className
        )}
        {...props}
      >
        {payload.map((item: TooltipPayloadItem, index: number) => {
          const key = `${nameKey || item.dataKey || "value"}`;
          const itemConfig = item.payload?.chartConfig?.[key] || {};
          const label =
            itemConfig?.label ||
            (typeof item.value === "string" ? item.value : key);

          return (
            <div
              key={`${item.dataKey || index}`}
              className={cn(
                "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
              )}
            >
              {!hideIcon ? (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              ) : null}
              <span className="text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
    );
  }
);
ChartLegendContent.displayName = "ChartLegend";

// Chart config type
export type ChartConfig = {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
    color?: string;
    theme?: {
      light: string;
      dark: string;
    };
  };
};

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
