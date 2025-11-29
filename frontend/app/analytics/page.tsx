"use client";

import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Line, Area, AreaChart
} from "recharts";
import { useMemo } from "react";
import { TrendingUp, TrendingDown, Users, AlertTriangle, Zap } from "lucide-react";

const COLORS = ["#8b5cf6", "#2dd4bf", "#ec4899", "#22d3ee", "#f59e0b", "#10b981"];

export default function AnalyticsPage() {
  const { employees, getStats } = useStore();
  const stats = getStats();

  const departmentData = useMemo(() => {
    const deptCounts: Record<string, number> = {};
    employees.forEach((e) => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });
    return Object.entries(deptCounts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const burnoutDistribution = useMemo(() => {
    const high = employees.filter((e) => e.burnoutRisk >= 70).length;
    const medium = employees.filter((e) => e.burnoutRisk >= 40 && e.burnoutRisk < 70).length;
    const low = employees.filter((e) => e.burnoutRisk < 40).length;
    return [
      { name: "High Risk", value: high, color: "#ef4444" },
      { name: "Medium Risk", value: medium, color: "#f59e0b" },
      { name: "Low Risk", value: low, color: "#10b981" },
    ];
  }, [employees]);

  const impactDistribution = useMemo(() => {
    const ranges = [
      { range: "0-20", min: 0, max: 20 },
      { range: "21-40", min: 21, max: 40 },
      { range: "41-60", min: 41, max: 60 },
      { range: "61-80", min: 61, max: 80 },
      { range: "81-100", min: 81, max: 100 },
    ];
    return ranges.map(({ range, min, max }) => ({
      range,
      count: employees.filter((e) => e.impactScore >= min && e.impactScore <= max).length,
    }));
  }, [employees]);

  const locationData = useMemo(() => {
    const locCounts: Record<string, number> = {};
    employees.forEach((e) => {
      if (e.location) {
        locCounts[e.location] = (locCounts[e.location] || 0) + 1;
      }
    });
    return Object.entries(locCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [employees]);

  const monthlyTrend = [
    { month: "Jul", headcount: 98, avgImpact: 68 },
    { month: "Aug", headcount: 105, avgImpact: 70 },
    { month: "Sep", headcount: 112, avgImpact: 72 },
    { month: "Oct", headcount: 118, avgImpact: 74 },
    { month: "Nov", headcount: 124, avgImpact: 75 },
    { month: "Dec", headcount: employees.length, avgImpact: stats.avgImpact },
  ];

  return (
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
            { icon: Users, label: "Total Employees", value: stats.total, trend: "+12%", up: true },
            { icon: Zap, label: "Avg Impact Score", value: stats.avgImpact, trend: "+5.2%", up: true },
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

          {/* Location Breakdown */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Employees by Location</h3>
            <div className="space-y-3">
              {locationData.map((loc, index) => (
                <div key={loc.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">{loc.name}</span>
                    <span className="text-gray-500 text-sm">{loc.value}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(loc.value / employees.length) * 100}%`,
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
  );
}
