"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "primary" | "success" | "warning" | "error" | "info";
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  color = "primary",
}: MetricCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
    info: "bg-info/10 text-info",
  };

  return (
    <div className="flex h-30 w-80 items-center gap-4 rounded-lg border border-neutral-200 bg-surface p-4 shadow-sm transition-shadow hover:shadow-md">
      {/* Icon Section (Left) */}
      <div
        className={cn(
          "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg",
          colorClasses[color]
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Metrics Section (Center) */}
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-xs font-medium text-neutral-600">{label}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>

      {/* Trend Section (Right) */}
      {trend && (
        <div className="flex flex-shrink-0 items-center gap-1">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-error" />
          )}
          <span
            className={cn(
              "text-sm font-medium",
              trend.isPositive ? "text-success" : "text-error"
            )}
          >
            {trend.value}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for MetricCard
 */
export function MetricCardSkeleton() {
  return (
    <div className="flex h-30 w-80 items-center gap-4 rounded-lg border border-neutral-200 bg-surface p-4">
      <div className="h-12 w-12 animate-pulse rounded-lg bg-neutral-200"></div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3 w-16 animate-pulse rounded bg-neutral-200"></div>
        <div className="h-6 w-20 animate-pulse rounded bg-neutral-200"></div>
      </div>
    </div>
  );
}
