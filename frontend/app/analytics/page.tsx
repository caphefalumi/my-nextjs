"use client";

import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { RequireAuth } from "@/components/auth/require-auth";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Line, Area, AreaChart
} from "recharts";
import { useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Users, AlertTriangle, Zap, Loader2 } from "lucide-react";

const COLORS = ["#8b5cf6", "#2dd4bf", "#ec4899", "#22d3ee", "#f59e0b", "#10b981"];
const BURNOUT_COLORS = { High: "#ef4444", Medium: "#f59e0b", Low: "#10b981" };

export default function AnalyticsPage() {
  const { analytics, fetchAnalytics, loading } = useStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const departmentData = useMemo(() => {
    if (!analytics) return [];
    return analytics.departments.map((d) => ({ name: d.department, value: d.count }));
  }, [analytics]);

  const burnoutDistribution = useMemo(() => {
    if (!analytics) return [];
    return analytics.burnoutDistribution.map((b) => ({
      name: `${b.level} Risk`,
      value: b.count,
      color: BURNOUT_COLORS[b.level as keyof typeof BURNOUT_COLORS] || "#6b7280",
    }));
  }, [analytics]);

  const impactDistribution = useMemo(() => {
    if (!analytics) return [];
    return analytics.levelDistribution.map((l) => ({
      range: l.level,
      count: l.count,
    }));
  }, [analytics]);

  const monthlyTrend = useMemo(() => {
    if (!analytics) return [];
    return analytics.trends.map((t) => ({
      month: t.month,
      headcount: t.headcount,
      avgImpact: t.avgPerformance,
    }));
  }, [analytics]);

  if (loading || !analytics) {
    return (
      <RequireAuth>
        <CyberpunkLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading analytics from server...</span>
          </div>
        </CyberpunkLayout>
      </RequireAuth>
    );
  }

  const stats = analytics.overview;

  return (
    <RequireAuth>
      <CyberpunkLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Workforce insights and metrics</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Total Employees", value: stats.totalEmployees, trend: "+12%", up: true },
            { icon: Zap, label: "Avg Impact Score", value: stats.avgImpactScore, trend: "+5.2%", up: true },
            { icon: TrendingUp, label: "High Performers", value: stats.highPerformers, trend: "+8%", up: true },
            { icon: AlertTriangle, label: "Burnout Alerts", value: stats.burnoutAlerts, trend: "-3", up: false },
          ].map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl bg-gray-900/50 border border-white/10">
              <div className="flex items-center justify-between">
                <stat.icon className="w-5 h-5 text-purple-400" />
                <span className={cn(
                  "text-xs flex items-center gap-1",
                  stat.up ? "text-teal-400" : "text-red-400"
                )}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.trend}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-2 gap-6">
          {/* Headcount Trend */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Headcount & Performance Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Area type="monotone" dataKey="headcount" stroke="#8b5cf6" fill="url(#colorHeadcount)" strokeWidth={2} />
                <Line type="monotone" dataKey="avgImpact" stroke="#2dd4bf" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Department Distribution</h3>
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={250}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    stroke="none"
                  >
                    {departmentData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {departmentData.map((dept, index) => (
                  <div key={dept.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-gray-300 text-sm">{dept.name}</span>
                    <span className="text-gray-500 text-sm ml-auto">{dept.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-3 gap-6">
          {/* Burnout Risk Distribution */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Burnout Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={burnoutDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {burnoutDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {burnoutDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-400 text-xs">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Impact Score Distribution */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Impact Score Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={impactDistribution}>
                <XAxis dataKey="range" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Department Performance</h3>
            <div className="space-y-3">
              {analytics.departments.map((dept, index) => (
                <div key={dept.department}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">{dept.department}</span>
                    <span className="text-gray-500 text-sm">Avg: {dept.avgImpact}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${dept.avgImpact}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </CyberpunkLayout>
    </RequireAuth>
  );
}
