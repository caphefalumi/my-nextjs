"use client";

import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Trophy, Medal, Award, Star, TrendingUp, Target, ArrowUp, ArrowDown } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function PerformancePage() {
  const { employees } = useStore();

  const rankings = useMemo(() => {
    return [...employees]
      .sort((a, b) => b.impactScore - a.impactScore)
      .map((emp, index) => ({ ...emp, rank: index + 1 }));
  }, [employees]);

  const topPerformers = rankings.slice(0, 3);
  const restOfTeam = rankings.slice(3);

  const departmentScores = useMemo(() => {
    const deptData: Record<string, { sum: number; count: number; employees: typeof employees }> = {};
    employees.forEach((e) => {
      if (!deptData[e.department]) {
        deptData[e.department] = { sum: 0, count: 0, employees: [] };
      }
      deptData[e.department].sum += e.impactScore;
      deptData[e.department].count++;
      deptData[e.department].employees.push(e);
    });
    return Object.entries(deptData)
      .map(([dept, data]) => ({
        department: dept,
        avgScore: Math.round(data.sum / data.count),
        count: data.count,
        topPerformer: data.employees.sort((a, b) => b.impactScore - a.impactScore)[0],
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [employees]);

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
      case 2: return "bg-gradient-to-br from-gray-400/20 to-gray-500/20 border-gray-400/30";
      case 3: return "bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-600/30";
      default: return "bg-gray-900/50 border-white/10";
    }
  };

  return (
    <CyberpunkLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Performance Leaderboard</h1>
          <p className="text-gray-400 mt-1">Track and celebrate top performers</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-6 items-end">
          {/* 2nd Place */}
          {topPerformers[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link href={`/personnel/${topPerformers[1].id}`}>
                <div className={cn(
                  "p-6 rounded-2xl border text-center h-[220px] flex flex-col justify-end",
                  "hover:scale-105 transition-transform",
                  getRankBg(2)
                )}>
                  <Medal className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gray-400/20 flex items-center justify-center text-white text-xl font-bold mb-3">
                    {topPerformers[1].name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="text-white font-semibold">{topPerformers[1].name}</p>
                  <p className="text-gray-400 text-sm">{topPerformers[1].role}</p>
                  <p className="text-2xl font-bold text-gray-300 mt-2">{topPerformers[1].impactScore}</p>
                </div>
              </Link>
            </motion.div>
          )}

          {/* 1st Place */}
          {topPerformers[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Link href={`/personnel/${topPerformers[0].id}`}>
                <div className={cn(
                  "p-6 rounded-2xl border text-center h-[260px] flex flex-col justify-end",
                  "hover:scale-105 transition-transform",
                  getRankBg(1)
                )}>
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <div className="w-20 h-20 mx-auto rounded-xl bg-yellow-500/20 flex items-center justify-center text-white text-2xl font-bold mb-3 ring-2 ring-yellow-500/50">
                    {topPerformers[0].name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="text-white font-semibold text-lg">{topPerformers[0].name}</p>
                  <p className="text-gray-400 text-sm">{topPerformers[0].role}</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-2">{topPerformers[0].impactScore}</p>
                  <span className="text-yellow-400 text-xs mt-1">TOP PERFORMER</span>
                </div>
              </Link>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topPerformers[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Link href={`/personnel/${topPerformers[2].id}`}>
                <div className={cn(
                  "p-6 rounded-2xl border text-center h-[200px] flex flex-col justify-end",
                  "hover:scale-105 transition-transform",
                  getRankBg(3)
                )}>
                  <Award className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <div className="w-14 h-14 mx-auto rounded-xl bg-amber-600/20 flex items-center justify-center text-white text-lg font-bold mb-3">
                    {topPerformers[2].name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <p className="text-white font-semibold">{topPerformers[2].name}</p>
                  <p className="text-gray-400 text-sm">{topPerformers[2].role}</p>
                  <p className="text-xl font-bold text-amber-500 mt-2">{topPerformers[2].impactScore}</p>
                </div>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Department Rankings */}
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Department Rankings
            </h3>
            <div className="space-y-3">
              {departmentScores.map((dept, index) => (
                <div key={dept.department} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                    index === 0 ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-800 text-gray-400"
                  )}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-medium">{dept.department}</p>
                    <p className="text-gray-500 text-sm">{dept.count} employees</p>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-400 font-semibold">{dept.avgScore}</p>
                    <p className="text-gray-500 text-xs">avg score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Full Leaderboard
            </h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {restOfTeam.map((emp) => (
                <Link key={emp.id} href={`/personnel/${emp.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                    <span className="w-8 text-gray-500 font-mono text-sm">#{emp.rank}</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-white text-xs font-medium">
                      {emp.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{emp.name}</p>
                      <p className="text-gray-500 text-xs">{emp.department}</p>
                    </div>
                    <span className="text-purple-400 font-semibold">{emp.impactScore}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Average Score", value: Math.round(employees.reduce((a, b) => a + b.impactScore, 0) / employees.length), icon: TrendingUp, change: "+5.2%", up: true },
            { label: "Top Performers", value: employees.filter((e) => e.impactScore >= 80).length, icon: Trophy, change: "+3", up: true },
            { label: "Needs Improvement", value: employees.filter((e) => e.impactScore < 50).length, icon: Target, change: "-2", up: false },
            { label: "Rising Stars", value: employees.filter((e) => e.impactScore >= 60 && e.impactScore < 80).length, icon: Star, change: "+4", up: true },
          ].map((metric) => (
            <div key={metric.label} className="p-4 rounded-xl bg-gray-900/50 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className="w-5 h-5 text-purple-400" />
                <span className={cn(
                  "text-xs flex items-center gap-1",
                  metric.up ? "text-teal-400" : "text-red-400"
                )}>
                  {metric.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-gray-500 text-sm">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
    </CyberpunkLayout>
  );
}
