"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  X,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  Award,
  Zap,
  Mail,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import Link from "next/link";

// Interfaces
export interface EmployeeStats {
  technical: number;
  leadership: number;
  empathy: number;
  velocity: number;
  creativity: number;
  reliability: number;
}

export interface ChatLog {
  timestamp: string;
  message: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface JiraTicket {
  id: string;
  title: string;
  complexity: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  created_at: string;
  completed_at?: string;
}

export interface CommitLog {
  hash: string;
  message: string;
  timestamp: string;
  files_changed: number;
  lines_added: number;
  lines_deleted: number;
}

export interface EmployeeDetail {
  // Identity & Role
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: string;
  department: string;
  team: string;
  managerId: string | null;
  managerName: string | null;
  joinDate: string;
  location: string;
  // Performance
  impactScore: number;
  burnoutRisk: number;
  stats: EmployeeStats;
  // Work Info
  projects: number;
  collaborators: number;
  tenure: string;
  recentAchievement?: string;
  avatar?: string;
  // Rich data from backend
  aiSummary?: string;
  chatLogs?: ChatLog[];
  jiraTickets?: JiraTicket[];
  commitLogs?: CommitLog[];
}

interface EmployeeDetailCardProps {
  employee: EmployeeDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StatItemConfig {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  isText?: boolean;
}

// Helpers
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("");
}

function formatRadarData(stats: EmployeeStats) {
  return [
    { stat: "Technical", value: stats.technical, fullMark: 100 },
    { stat: "Leadership", value: stats.leadership, fullMark: 100 },
    { stat: "Empathy", value: stats.empathy, fullMark: 100 },
    { stat: "Velocity", value: stats.velocity, fullMark: 100 },
    { stat: "Creativity", value: stats.creativity, fullMark: 100 },
    { stat: "Reliability", value: stats.reliability, fullMark: 100 },
  ];
}

// Subcomponents
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

function BurnoutWarning({
  burnoutRisk,
  isHigh,
  isMedium,
}: {
  burnoutRisk: number;
  isHigh: boolean;
  isMedium: boolean;
}) {
  if (!isHigh && !isMedium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "mb-6 p-4 rounded-xl",
        isHigh
          ? "bg-red-500/10 border border-red-500/30"
          : "bg-yellow-500/10 border border-yellow-500/30"
      )}
    >
      <div className="flex items-center gap-3">
        <motion.div
          animate={isHigh ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <AlertTriangle
            className={cn("w-6 h-6", isHigh ? "text-red-400" : "text-yellow-400")}
          />
        </motion.div>
        <div>
          <p
            className={cn(
              "font-semibold",
              isHigh ? "text-red-300" : "text-yellow-300"
            )}
          >
            {isHigh ? "High Burnout Risk" : "Elevated Burnout Risk"}
          </p>
          <p className="text-gray-400 text-sm">
            Risk Level: {burnoutRisk}% - Consider workload adjustment
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ config, index }: { config: StatItemConfig; index: number }) {
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-white/5 border border-white/10",
        "hover:border-purple-500/30 transition-colors"
      )}
    >
      <Icon className={cn("w-5 h-5 mb-2", `text-${config.color}-400`)} />
      <p className="text-2xl font-bold text-white">
        {config.isText ? (
          config.value
        ) : (
          <AnimatedNumber value={config.value as number} />
        )}
      </p>
      <p className="text-xs text-gray-500">{config.label}</p>
    </motion.div>
  );
}

function SkillRadarChart({ stats }: { stats: EmployeeStats }) {
  const radarData = formatRadarData(stats);

  return (
    <div className={cn("p-4 rounded-xl", "bg-white/5 border border-white/10")}>
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Skill Matrix</h3>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
          <PolarAngleAxis dataKey="stat" tick={{ fill: "#9ca3af", fontSize: 10 }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 8 }}
          />
          <Radar
            name="Skills"
            dataKey="value"
            stroke="#8b5cf6"
            fill="#8b5cf6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function AchievementBadge({ achievement }: { achievement: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-gradient-to-r from-purple-500/10 to-teal-500/10",
        "border border-purple-500/30"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <Award className="w-5 h-5 text-yellow-400" />
        <span className="text-sm font-semibold text-yellow-300">
          Recent Achievement
        </span>
      </div>
      <p className="text-gray-300 text-sm">{achievement}</p>
    </motion.div>
  );
}

function AIInsights() {
  const insights = [
    { label: "Productivity Trend", value: "+12% this month", color: "teal" },
    { label: "Team Synergy", value: "Excellent", color: "purple" },
    { label: "Growth Potential", value: "High", color: "pink" },
  ];

  return (
    <div className={cn("p-4 rounded-xl", "bg-white/5 border border-white/10")}>
      <h4 className="text-sm font-semibold text-gray-300 mb-3">AI Insights</h4>
      <div className="space-y-2">
        {insights.map((insight) => (
          <div key={insight.label} className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{insight.label}</span>
            <span className={cn("text-xs", `text-${insight.color}-400`)}>
              {insight.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Component
export function EmployeeDetailCard({
  employee,
  isOpen,
  onClose,
}: EmployeeDetailCardProps) {
  if (!employee) return null;

  const isBurnoutHigh = employee.burnoutRisk >= 70;
  const isBurnoutMedium = employee.burnoutRisk >= 40 && employee.burnoutRisk < 70;

  const statConfigs: StatItemConfig[] = [
    { icon: Zap, label: "Impact", value: employee.impactScore, color: "purple" },
    { icon: TrendingUp, label: "Projects", value: employee.projects, color: "teal" },
    { icon: Users, label: "Collaborators", value: employee.collaborators, color: "cyan" },
    { icon: Clock, label: "Tenure", value: employee.tenure, color: "pink", isText: true },
  ];

  const handleClose = () => onClose();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 z-50"
          />

          {/* Card Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={cn(
                "relative w-full max-w-2xl pointer-events-auto",
                "bg-gray-900 rounded-3xl overflow-hidden",
                "border border-purple-500/30",
                "shadow-2xl shadow-purple-500/20"
              )}
            >
              {/* Content */}
              <div className="relative z-10 p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-2xl",
                        "bg-gradient-to-br from-purple-500 to-teal-500",
                        "flex items-center justify-center",
                        "text-white text-2xl font-bold",
                        "shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                      )}
                    >
                      {getInitials(employee.name)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                      <p className="text-purple-300">{employee.role}</p>
                      <p className="text-gray-500 text-sm">{employee.department}</p>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-10 h-10 rounded-xl",
                      "bg-white/5 hover:bg-white/10",
                      "border border-white/10",
                      "flex items-center justify-center",
                      "text-gray-400 hover:text-white",
                      "transition-colors"
                    )}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <BurnoutWarning
                  burnoutRisk={employee.burnoutRisk}
                  isHigh={isBurnoutHigh}
                  isMedium={isBurnoutMedium}
                />

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {statConfigs.map((config, index) => (
                    <StatCard key={config.label} config={config} index={index} />
                  ))}
                </div>

                {/* Charts & Insights */}
                <div className="grid grid-cols-2 gap-6">
                  <SkillRadarChart stats={employee.stats} />
                  <div className="space-y-4">
                    {employee.recentAchievement && (
                      <AchievementBadge achievement={employee.recentAchievement} />
                    )}
                    <AIInsights />
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 mt-6">
                  <Link href={`/personnel/${employee.id}`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleClose}
                      className={cn(
                        "w-full py-3 px-4 rounded-xl",
                        "bg-gradient-to-r from-purple-500 to-teal-500",
                        "text-white font-semibold",
                        "hover:opacity-90",
                        "transition-opacity"
                      )}
                    >
                      View Full Profile
                    </motion.button>
                  </Link>
                  <a href={`mailto:${employee.email}`}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "py-3 px-6 rounded-xl flex items-center gap-2",
                        "bg-white/5 border border-white/10",
                        "text-gray-300 font-semibold",
                        "hover:bg-white/10 hover:border-purple-500/30",
                        "transition-all"
                      )}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </motion.button>
                  </a>
                </div>
              </div>


            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EmployeeDetailCard;
