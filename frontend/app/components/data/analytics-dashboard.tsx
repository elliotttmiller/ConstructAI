"use client";

import * as React from "react";
import { Card } from "../ui/card";
import {
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  MultiLineChartComponent,
  StackedBarChartComponent,
} from "./charts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";

interface AnalyticsDashboardProps {
  projectId: string;
  analysisData?: any;
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatCard({ title, value, change, icon, trend = "neutral" }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-green-600"
      : trend === "down"
      ? "text-red-600"
      : "text-gray-600";

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
              {TrendIcon && <TrendIcon className="h-4 w-4" />}
              <span>{Math.abs(change)}%</span>
              <span className="text-muted-foreground">
                vs. average
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function AnalyticsDashboard({ projectId, analysisData }: AnalyticsDashboardProps) {
  // Sample data - in production, this would come from API
  const budgetData = [
    { name: "Labor", value: 450000 },
    { name: "Materials", value: 320000 },
    { name: "Equipment", value: 180000 },
    { name: "Overhead", value: 95000 },
    { name: "Contingency", value: 75000 },
  ];

  const scheduleData = [
    { name: "Jan", planned: 85, actual: 82 },
    { name: "Feb", planned: 90, actual: 88 },
    { name: "Mar", planned: 95, actual: 92 },
    { name: "Apr", planned: 88, actual: 90 },
    { name: "May", planned: 92, actual: 89 },
    { name: "Jun", planned: 96, actual: 94 },
  ];

  const riskDistribution = [
    { name: "Critical", value: 2 },
    { name: "High", value: 5 },
    { name: "Medium", value: 12 },
    { name: "Low", value: 8 },
  ];

  const resourceUtilization = [
    {
      name: "Week 1",
      labor: 85,
      equipment: 70,
      materials: 90,
    },
    {
      name: "Week 2",
      labor: 90,
      equipment: 75,
      materials: 85,
    },
    {
      name: "Week 3",
      labor: 95,
      equipment: 85,
      materials: 95,
    },
    {
      name: "Week 4",
      labor: 88,
      equipment: 80,
      materials: 88,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-foreground">Project Analytics</h2>
        <p className="text-muted-foreground mt-1">
          Comprehensive analysis and insights for your construction project
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget"
          value="$1.2M"
          change={-3.2}
          trend="up"
          icon={<DollarSign className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Days Remaining"
          value="127"
          change={5.1}
          trend="down"
          icon={<Calendar className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Active Risks"
          value="19"
          change={-12}
          trend="up"
          icon={<AlertTriangle className="h-6 w-6 text-primary" />}
        />
        <StatCard
          title="Completion Rate"
          value="67%"
          change={8.5}
          trend="up"
          icon={<CheckCircle className="h-6 w-6 text-primary" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartComponent
          data={budgetData}
          title="Budget Allocation"
          description="Distribution of project costs across categories"
        />
        <BarChartComponent
          data={riskDistribution}
          title="Risk Distribution"
          description="Number of risks by severity level"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        <MultiLineChartComponent
          data={scheduleData}
          dataKeys={[
            { key: "planned", color: "#4f46e5", name: "Planned Progress" },
            { key: "actual", color: "#10b981", name: "Actual Progress" },
          ]}
          title="Schedule Performance"
          description="Comparing planned vs. actual progress over time"
        />
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 gap-6">
        <StackedBarChartComponent
          data={resourceUtilization}
          dataKeys={[
            { key: "labor", color: "#4f46e5", name: "Labor" },
            { key: "equipment", color: "#10b981", name: "Equipment" },
            { key: "materials", color: "#f59e0b", name: "Materials" },
          ]}
          title="Resource Utilization"
          description="Weekly resource usage across categories (% capacity)"
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">Schedule Health</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">On Schedule</span>
              <span className="font-medium text-foreground">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: "78%" }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">Budget Health</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium text-foreground">42%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: "42%" }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-foreground">Team Efficiency</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Productivity</span>
              <span className="font-medium text-foreground">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: "92%" }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          AI-Powered Insights
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="p-1 bg-blue-100 rounded">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Schedule Optimization Opportunity
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Fast-tracking activities could reduce timeline by 12 days
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <div className="p-1 bg-green-100 rounded">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Cost Savings Identified
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Value engineering could save $45,000 without quality impact
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
            <div className="p-1 bg-amber-100 rounded">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Risk Mitigation Required
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Resource shortage predicted in Week 12 - recommend early procurement
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
