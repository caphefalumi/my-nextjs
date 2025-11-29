"use client";

import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { RequireAuth } from "@/components/auth/require-auth";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Brain, AlertTriangle, TrendingUp, Users, Lightbulb, Target,
  ArrowRight, Sparkles, Shield, Heart, Loader2
} from "lucide-react";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function InsightsPage() {
  const { insights, fetchInsights, loading, analytics, fetchAnalytics } = useStore();

  useEffect(() => {
    fetchInsights();
    fetchAnalytics();
  }, [fetchInsights, fetchAnalytics]);

  const aiRecommendations = useMemo(() => {
    if (!insights) return [];
    
    const iconMap: Record<string, typeof Shield> = {
      warning: AlertTriangle,
      recognition: TrendingUp,
      growth: Users,
      support: Shield,
    };

    return insights.recommendations.map((rec) => ({
      icon: iconMap[rec.type] || Target,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      action: rec.actionUrl ? "View Details" : "View",
      link: rec.actionUrl || "/personnel",
    }));
  }, [insights]);

  if (loading || !insights) {
    return (
      <RequireAuth>
        <CyberpunkLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="ml-3 text-gray-400">Loading AI insights from server...</span>
          </div>
        </CyberpunkLayout>
      </RequireAuth>
    );
  }

  const stats = analytics?.overview || { totalEmployees: 0, avgImpactScore: 0, burnoutAlerts: 0, highPerformers: 0 };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-red-500/30 bg-red-500/5";
      case "medium": return "border-yellow-500/30 bg-yellow-500/5";
      case "low": return "border-teal-500/30 bg-teal-500/5";
      default: return "border-purple-500/30 bg-purple-500/5";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500/20 text-red-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      case "low": return "bg-teal-500/20 text-teal-400";
      default: return "bg-purple-500/20 text-purple-400";
    }
  };

  return (
    <RequireAuth>
      <CyberpunkLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/30">
              <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">AI Insights</h1>
            <p className="text-gray-400 mt-1">Intelligent workforce analysis and recommendations</p>
          </div>
        </div>

        {/* AI Summary Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-teal-500/10 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Workforce Health Summary</h2>
              <p className="text-gray-300 leading-relaxed">
                Your organization has <span className="text-purple-400 font-semibold">{stats.totalEmployees} employees</span> with an 
                average impact score of <span className="text-teal-400 font-semibold">{stats.avgImpactScore}</span>. 
                Currently, <span className="text-red-400 font-semibold">{stats.burnoutAlerts} employees</span> are 
                flagged for high burnout risk and require immediate attention. 
                <span className="text-purple-400 font-semibold"> {stats.highPerformers} high performers</span> have 
                been identified as potential candidates for leadership roles.
              </p>
            </div>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            AI Recommendations
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {aiRecommendations.map((rec, index) => (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "p-5 rounded-2xl border transition-all hover:scale-[1.02]",
                  getPriorityColor(rec.priority)
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <rec.icon className="w-6 h-6 text-purple-400" />
                  <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", getPriorityBadge(rec.priority))}>
                    {rec.priority.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{rec.title}</h4>
                <p className="text-gray-400 text-sm mb-4">{rec.description}</p>
                <Link href={rec.link}>
                  <button className="flex items-center gap-2 text-purple-400 text-sm hover:text-purple-300 transition-colors">
                    {rec.action}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* At-Risk Employees */}
        {insights.atRiskEmployees.length > 0 && (
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Employees Requiring Attention
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {insights.atRiskEmployees.slice(0, 6).map((emp) => (
                <Link key={emp.id} href={`/personnel/${emp.id}`}>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-white text-sm font-medium">
                        {emp.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-white font-medium">{emp.name}</p>
                        <p className="text-gray-500 text-sm">{emp.role}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-red-400 text-sm">Burnout Risk</span>
                      <span className="text-red-400 font-semibold">{emp.burnoutScore}%</span>
                    </div>
                    {emp.riskFactors.length > 0 && (
                      <p className="text-gray-500 text-xs mt-2 truncate">{emp.riskFactors[0]}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Heart, label: "Team Morale", value: "Good", color: "teal" },
            { icon: TrendingUp, label: "Productivity Trend", value: "+12%", color: "purple" },
            { icon: Users, label: "Collaboration Index", value: "8.4/10", color: "cyan" },
            { icon: Target, label: "Goal Completion", value: "87%", color: "pink" },
          ].map((metric) => (
            <div key={metric.label} className="p-4 rounded-xl bg-gray-900/50 border border-white/10 text-center">
              <metric.icon className={cn("w-6 h-6 mx-auto mb-2", `text-${metric.color}-400`)} />
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-gray-500 text-sm">{metric.label}</p>
            </div>
          ))}
          </div>
        </div>
      </CyberpunkLayout>
    </RequireAuth>
  );
}
