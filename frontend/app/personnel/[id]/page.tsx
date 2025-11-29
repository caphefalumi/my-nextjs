"use client";

import { use, useEffect, useState } from "react";
import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Mail, MapPin, Calendar, Building, Users, Award,
  AlertTriangle, TrendingUp, Zap, Clock, Send, Loader2
} from "lucide-react";
import Link from "next/link";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip
} from "recharts";
import type { EmployeeDetail } from "@/components/features/dashboard/employee-detail-card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EmployeeProfilePage({ params }: PageProps) {
  const { id } = use(params);
  const { getEmployeeById, employees, fetchEmployeeDetail } = useStore();
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmployee = async () => {
      setLoading(true);
      // First try cache
      let emp: EmployeeDetail | null | undefined = getEmployeeById(id);
      
      // If not in cache, fetch from backend
      if (!emp) {
        emp = await fetchEmployeeDetail(id);
      }
      
      setEmployee(emp || null);
      setLoading(false);
    };
    
    loadEmployee();
  }, [id, getEmployeeById, fetchEmployeeDetail]);

  if (loading) {
    return (
      <CyberpunkLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          <span className="ml-3 text-gray-400">Loading employee data from server...</span>
        </div>
      </CyberpunkLayout>
    );
  }

  if (!employee) {
    return (
      <CyberpunkLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-gray-400 text-xl">Employee not found</p>
          <Link href="/personnel" className="mt-4 text-purple-400 hover:text-purple-300">
            Back to Personnel
          </Link>
        </div>
      </CyberpunkLayout>
    );
  }

  const radarData = [
    { stat: "Technical", value: employee.stats.technical },
    { stat: "Leadership", value: employee.stats.leadership },
    { stat: "Empathy", value: employee.stats.empathy },
    { stat: "Velocity", value: employee.stats.velocity },
    { stat: "Creativity", value: employee.stats.creativity },
    { stat: "Reliability", value: employee.stats.reliability },
  ];

  const performanceData = [
    { month: "Jan", score: 72 },
    { month: "Feb", score: 78 },
    { month: "Mar", score: 75 },
    { month: "Apr", score: 82 },
    { month: "May", score: 88 },
    { month: "Jun", score: employee.impactScore },
  ];

  const isBurnoutHigh = employee.burnoutRisk >= 70;
  const isBurnoutMedium = employee.burnoutRisk >= 40 && employee.burnoutRisk < 70;

  const directReports = employees.filter((e) => e.managerId === employee.id);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageSent(true);
      setMessageText("");
      setTimeout(() => setMessageSent(false), 3000);
    }
  };

  return (
    <CyberpunkLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link href="/personnel" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Personnel
        </Link>

        {/* Profile Header */}
        <div className="flex items-start gap-6 p-6 rounded-2xl bg-gray-900/50 border border-white/10">
          <div className={cn(
            "w-24 h-24 rounded-2xl flex items-center justify-center",
            "bg-gradient-to-br from-purple-500 to-teal-500",
            "text-white text-3xl font-bold",
            "shadow-lg shadow-purple-500/20"
          )}>
            {employee.name.split(" ").map((n) => n[0]).join("")}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{employee.name}</h1>
                <p className="text-purple-400 text-lg">{employee.role}</p>
                <p className="text-gray-500">{employee.employeeCode}</p>
              </div>
              
              <div className="flex gap-3">
                <a
                  href={`mailto:${employee.email}`}
                  className={cn(
                    "px-4 py-2 rounded-xl flex items-center gap-2",
                    "bg-purple-500/20 text-purple-300 border border-purple-500/30",
                    "hover:bg-purple-500/30 transition-colors"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                {employee.department} / {employee.team}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {employee.location}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Joined {new Date(employee.joinDate).toLocaleDateString()}
              </span>
              {employee.managerName && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  Reports to {employee.managerName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Burnout Alert */}
        {(isBurnoutHigh || isBurnoutMedium) && (
          <div className={cn(
            "p-4 rounded-xl flex items-center gap-4",
            isBurnoutHigh ? "bg-red-500/10 border border-red-500/30" : "bg-yellow-500/10 border border-yellow-500/30"
          )}>
            <AlertTriangle className={cn("w-6 h-6", isBurnoutHigh ? "text-red-400" : "text-yellow-400")} />
            <div>
              <p className={cn("font-semibold", isBurnoutHigh ? "text-red-300" : "text-yellow-300")}>
                {isBurnoutHigh ? "High Burnout Risk Detected" : "Elevated Burnout Risk"}
              </p>
              <p className="text-gray-400 text-sm">
                Current risk level: {employee.burnoutRisk}%. Consider adjusting workload or scheduling a check-in.
              </p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Zap, label: "Impact Score", value: employee.impactScore, color: "purple" },
            { icon: TrendingUp, label: "Projects", value: employee.projects, color: "teal" },
            { icon: Users, label: "Collaborators", value: employee.collaborators, color: "cyan" },
            { icon: Clock, label: "Tenure", value: employee.tenure, color: "pink" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-gray-900/50 border border-white/10">
              <stat.icon className={cn("w-5 h-5 mb-2", `text-${stat.color}-400`)} />
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Skills Radar */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Skill Matrix</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(139, 92, 246, 0.2)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6b7280", fontSize: 10 }} />
                <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Trend */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <XAxis dataKey="month" tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid rgba(139, 92, 246, 0.3)", borderRadius: "8px" }}
                  labelStyle={{ color: "#fff" }}
                />
                <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Achievement */}
          {employee.recentAchievement && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-teal-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-semibold text-yellow-300">Recent Achievement</h3>
              </div>
              <p className="text-gray-300">{employee.recentAchievement}</p>
            </div>
          )}

          {/* Direct Reports */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              Direct Reports ({directReports.length})
            </h3>
            {directReports.length > 0 ? (
              <div className="space-y-2">
                {directReports.map((report) => (
                  <Link key={report.id} href={`/personnel/${report.id}`}>
                    <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs text-white">
                        {report.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-white text-sm">{report.name}</p>
                        <p className="text-gray-500 text-xs">{report.role}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No direct reports</p>
            )}
          </div>

          {/* Quick Message */}
          <div className="p-6 rounded-2xl bg-gray-900/50 border border-white/10">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Message</h3>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className={cn(
                "w-full h-24 p-3 rounded-lg resize-none",
                "bg-black/30 border border-white/10",
                "text-white placeholder:text-gray-500",
                "focus:outline-none focus:border-purple-500/50"
              )}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim()}
              className={cn(
                "mt-3 w-full py-2 rounded-lg flex items-center justify-center gap-2",
                "bg-purple-500/20 text-purple-300",
                "hover:bg-purple-500/30 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              {messageSent ? "Message Sent!" : "Send Message"}
            </button>
          </div>
        </div>
      </div>
    </CyberpunkLayout>
  );
}
