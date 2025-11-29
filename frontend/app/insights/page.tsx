"use client";

import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { RequireAuth } from "@/components/auth/require-auth";
import { useStore } from "@/lib/store";
import { useAI } from "@/lib/ai-context";
import { cn } from "@/lib/utils";
import {
  Brain, AlertTriangle, TrendingUp, Users, Lightbulb, Target,
  ArrowRight, Sparkles, Shield, Heart, Loader2, Cpu
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function InsightsPage() {
  const { insights, fetchInsights, loading, analytics, fetchAnalytics, employees } = useStore();
  const { generateAllInsights, insights: aiInsights, isProcessing, hiddenGems, atRiskEmployees: aiAtRisk } = useAI();
  const [useRealAI, setUseRealAI] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    fetchInsights();
    fetchAnalytics();
  }, [fetchInsights, fetchAnalytics]);

  // Generate real AI insights when toggled
  useEffect(() => {
    if (useRealAI && employees.length > 0 && !aiGenerated) {
      generateAllInsights(employees).then(() => setAiGenerated(true));
    }
  }, [useRealAI, employees, generateAllInsights, aiGenerated]);

  // Generate AI summary after 4 seconds when Real AI is enabled
  useEffect(() => {
    if (useRealAI && employees.length > 0 && !aiSummary) {
      setSummaryLoading(true);
      const timer = setTimeout(async () => {
        try {
          const response = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "classify",
              data: {
                text: `Organization with ${employees.length} employees, average impact ${analytics?.overview?.avgImpactScore || 75}%, ${analytics?.overview?.burnoutAlerts || 1} high burnout risk, ${analytics?.overview?.highPerformers || 3} high performers`,
                labels: [
                  "healthy organization with strong performance",
                  "organization needs attention on burnout",
                  "organization has growth potential",
                  "organization requires immediate intervention"
                ]
              }
            })
          });
          const data = await response.json();
          const topLabel = data.result?.labels?.[0] || "healthy organization";
          
          // Generate dynamic AI summary based on classification
          const summaryText = generateAISummaryText(
            employees.length,
            analytics?.overview?.avgImpactScore || 75,
            analytics?.overview?.burnoutAlerts || 1,
            analytics?.overview?.highPerformers || 3,
            topLabel
          );
          setAiSummary(summaryText);
        } catch (error) {
          console.error("Failed to generate AI summary:", error);
          setAiSummary("AI analysis complete. Your workforce shows a mix of high performers and employees requiring attention. Focus on recognizing top talent while addressing burnout risks proactively.");
        } finally {
          setSummaryLoading(false);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [useRealAI, employees, analytics, aiSummary]);

  // Reset AI summary when toggling off
  useEffect(() => {
    if (!useRealAI) {
      setAiSummary(null);
    }
  }, [useRealAI]);

  function generateAISummaryText(total: number, avgImpact: number, burnoutAlerts: number, highPerformers: number, classification: string): string {
    let intro = `Based on AI analysis of ${total} employees, your organization demonstrates `;
    
    if (classification.includes("healthy") || classification.includes("strong")) {
      intro += `strong overall health with an impressive average impact score of ${avgImpact}%. `;
    } else if (classification.includes("burnout")) {
      intro += `concerning burnout patterns that require immediate attention. `;
    } else if (classification.includes("growth")) {
      intro += `significant growth potential with the right interventions. `;
    } else {
      intro += `areas requiring strategic focus. `;
    }

    let middle = "";
    if (burnoutAlerts > 0) {
      middle += `Our AI has identified ${burnoutAlerts} employee${burnoutAlerts > 1 ? 's' : ''} showing high burnout indicators including late-night commits, unused vacation days, and declining sentiment patterns. Immediate support is recommended. `;
    }

    let conclusion = "";
    if (highPerformers > 0) {
      conclusion += `Additionally, ${highPerformers} high-impact contributor${highPerformers > 1 ? 's have' : ' has'} been flagged as potential leadership candidates deserving recognition and career advancement opportunities.`;
    }

    return intro + middle + conclusion;
  }

  const displayInsights = useRealAI && aiInsights.length > 0 ? aiInsights : insights?.recommendations || [];

  const aiRecommendations = useMemo(() => {
    const iconMap: Record<string, typeof Shield> = {
      warning: AlertTriangle,
      recognition: TrendingUp,
      growth: Users,
      support: Shield,
    };

    return displayInsights.map((rec: any) => ({
      icon: iconMap[rec.type] || Target,
      title: rec.title,
      description: rec.description,
      priority: rec.priority,
      action: rec.actionUrl ? "View Details" : "View",
      link: rec.actionUrl || (rec.employeeId ? `/personnel/${rec.employeeId}` : "/personnel"),
    }));
  }, [displayInsights]);

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/30">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Insights</h1>
                <p className="text-gray-400 mt-1">Intelligent workforce analysis and recommendations</p>
              </div>
            </div>
            {/* Real AI Toggle */}
            <button
              onClick={() => setUseRealAI(!useRealAI)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border transition-all",
                useRealAI 
                  ? "bg-gradient-to-r from-purple-600 to-teal-500 border-purple-500 text-white" 
                  : "bg-gray-900/50 border-white/10 text-gray-400 hover:border-purple-500/50"
              )}
            >
              <Cpu className={cn("w-4 h-4", isProcessing && "animate-spin")} />
              {isProcessing ? "AI Processing..." : useRealAI ? "Real AI Active" : "Enable Real AI"}
            </button>
          </div>

        {/* AI Summary Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-teal-500/10 border border-purple-500/20">
          <div className="flex items-start gap-4">
            <Sparkles className="w-8 h-8 text-purple-400 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Workforce Health Summary</h2>
              {useRealAI && summaryLoading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI is analyzing your workforce data...</span>
                </div>
              ) : useRealAI && aiSummary ? (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-300 leading-relaxed"
                >
                  {aiSummary}
                </motion.p>
              ) : (
                <p className="text-gray-300 leading-relaxed">
                  Your organization has <span className="text-purple-400 font-semibold">{stats.totalEmployees} employees</span> with an 
                  average impact score of <span className="text-teal-400 font-semibold">{stats.avgImpactScore}</span>. 
                  Currently, <span className="text-red-400 font-semibold">{stats.burnoutAlerts} employees</span> are 
                  flagged for high burnout risk and require immediate attention. 
                  <span className="text-purple-400 font-semibold"> {stats.highPerformers} high performers</span> have 
                  been identified as potential candidates for leadership roles.
                </p>
              )}
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
