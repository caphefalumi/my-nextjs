"use client";

import { useState, useCallback } from "react";
import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { NetworkGraph, type Employee } from "@/components/features/dashboard/network-graph";
import {
  EmployeeDetailCard,
  type EmployeeDetail,
} from "@/components/features/dashboard/employee-detail-card";
import { FileUpload, type ParsedData } from "@/components/features/dashboard/file-upload";

// Interfaces
interface StatItem {
  label: string;
  value: string;
  trend: string;
  isNegative?: boolean;
}

// Constants
const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Sarah Chen", role: "Tech Lead", department: "Engineering", impactScore: 92, collaborators: ["2", "3", "5", "7"] },
  { id: "2", name: "Marcus Johnson", role: "Senior Developer", department: "Engineering", impactScore: 78, collaborators: ["1", "3", "4"] },
  { id: "3", name: "Elena Rodriguez", role: "UX Designer", department: "Design", impactScore: 85, collaborators: ["1", "2", "6"] },
  { id: "4", name: "David Kim", role: "Backend Engineer", department: "Engineering", impactScore: 65, collaborators: ["2", "5"] },
  { id: "5", name: "Aisha Patel", role: "Product Manager", department: "Product", impactScore: 88, collaborators: ["1", "4", "7"] },
  { id: "6", name: "James Wilson", role: "Junior Designer", department: "Design", impactScore: 45, collaborators: ["3"] },
  { id: "7", name: "Yuki Tanaka", role: "DevOps Engineer", department: "Operations", impactScore: 72, collaborators: ["1", "5"] },
  { id: "8", name: "Alex Rivera", role: "Data Analyst", department: "Analytics", impactScore: 58, collaborators: ["5"] },
] as const;

const MOCK_EMPLOYEE_DETAILS: Record<string, EmployeeDetail> = {
  "1": {
    id: "1",
    name: "Sarah Chen",
    role: "Tech Lead",
    department: "Engineering",
    impactScore: 92,
    burnoutRisk: 75,
    stats: { technical: 95, leadership: 88, empathy: 82, velocity: 90, creativity: 78, reliability: 92 },
    projects: 12,
    collaborators: 24,
    tenure: "3.5 yrs",
    recentAchievement: "Led successful migration to microservices architecture",
  },
  "2": {
    id: "2",
    name: "Marcus Johnson",
    role: "Senior Developer",
    department: "Engineering",
    impactScore: 78,
    burnoutRisk: 45,
    stats: { technical: 88, leadership: 65, empathy: 75, velocity: 82, creativity: 70, reliability: 85 },
    projects: 8,
    collaborators: 15,
    tenure: "2.1 yrs",
    recentAchievement: "Optimized API response time by 40%",
  },
  "3": {
    id: "3",
    name: "Elena Rodriguez",
    role: "UX Designer",
    department: "Design",
    impactScore: 85,
    burnoutRisk: 30,
    stats: { technical: 70, leadership: 72, empathy: 95, velocity: 78, creativity: 98, reliability: 88 },
    projects: 15,
    collaborators: 20,
    tenure: "4 yrs",
    recentAchievement: "Redesigned dashboard increased user engagement by 60%",
  },
  "4": {
    id: "4",
    name: "David Kim",
    role: "Backend Engineer",
    department: "Engineering",
    impactScore: 65,
    burnoutRisk: 55,
    stats: { technical: 82, leadership: 45, empathy: 60, velocity: 75, creativity: 55, reliability: 80 },
    projects: 5,
    collaborators: 8,
    tenure: "1.2 yrs",
  },
  "5": {
    id: "5",
    name: "Aisha Patel",
    role: "Product Manager",
    department: "Product",
    impactScore: 88,
    burnoutRisk: 82,
    stats: { technical: 65, leadership: 92, empathy: 90, velocity: 85, creativity: 88, reliability: 78 },
    projects: 18,
    collaborators: 35,
    tenure: "2.8 yrs",
    recentAchievement: "Launched flagship product with 10K+ users in first month",
  },
  "6": {
    id: "6",
    name: "James Wilson",
    role: "Junior Designer",
    department: "Design",
    impactScore: 45,
    burnoutRisk: 20,
    stats: { technical: 55, leadership: 35, empathy: 70, velocity: 60, creativity: 75, reliability: 65 },
    projects: 3,
    collaborators: 5,
    tenure: "6 mos",
  },
  "7": {
    id: "7",
    name: "Yuki Tanaka",
    role: "DevOps Engineer",
    department: "Operations",
    impactScore: 72,
    burnoutRisk: 40,
    stats: { technical: 90, leadership: 58, empathy: 62, velocity: 85, creativity: 60, reliability: 95 },
    projects: 7,
    collaborators: 12,
    tenure: "1.8 yrs",
    recentAchievement: "Reduced deployment time from 2 hours to 15 minutes",
  },
  "8": {
    id: "8",
    name: "Alex Rivera",
    role: "Data Analyst",
    department: "Analytics",
    impactScore: 58,
    burnoutRisk: 35,
    stats: { technical: 78, leadership: 42, empathy: 65, velocity: 70, creativity: 72, reliability: 75 },
    projects: 4,
    collaborators: 6,
    tenure: "10 mos",
  },
};

const OVERVIEW_STATS: StatItem[] = [
  { label: "Total Personnel", value: "127", trend: "+12%" },
  { label: "Avg Impact Score", value: "76.4", trend: "+5.2%" },
  { label: "High Performers", value: "34", trend: "+8%" },
  { label: "Burnout Alerts", value: "7", trend: "-3", isNegative: true },
];

// Subcomponents
function StatCard({ stat }: { stat: StatItem }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all">
      <p className="text-gray-400 text-sm">{stat.label}</p>
      <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
      <p className={stat.isNegative ? "text-red-400 text-sm" : "text-teal-400 text-sm"}>
        {stat.trend}
      </p>
    </div>
  );
}

// Main Component
export default function HomePage() {
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isUploadVisible, setIsUploadVisible] = useState(true);

  const handleNodeClick = useCallback((employee: Employee) => {
    const detail = MOCK_EMPLOYEE_DETAILS[employee.id];
    if (detail) {
      setSelectedEmployee(detail);
      setIsCardOpen(true);
    }
  }, []);

  const handleCardClose = useCallback(() => {
    setIsCardOpen(false);
  }, []);

  const handleDataParsed = useCallback((data: ParsedData) => {
    console.log("Parsed data:", data);
  }, []);

  const handleUploadError = useCallback((error: string) => {
    console.error("Upload error:", error);
  }, []);

  const handleToggleUpload = useCallback(() => {
    setIsUploadVisible((prev) => !prev);
  }, []);

  return (
    <CyberpunkLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-teal-400">
              Luminus.ai Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              AI-Powered Workforce Intelligence Platform
            </p>
          </div>
          <button
            onClick={handleToggleUpload}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-teal-500/20 border border-purple-500/30 text-purple-300 hover:border-purple-500/50 transition-all"
          >
            {isUploadVisible ? "Hide Upload" : "Import Data"}
          </button>
        </div>

        {/* File Upload Section */}
        {isUploadVisible && (
          <FileUpload onDataParsed={handleDataParsed} onError={handleUploadError} />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          {OVERVIEW_STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Network Graph */}
        <NetworkGraph employees={[...MOCK_EMPLOYEES]} onNodeClick={handleNodeClick} />

        {/* Employee Detail Card Modal */}
        <EmployeeDetailCard
          employee={selectedEmployee}
          isOpen={isCardOpen}
          onClose={handleCardClose}
        />
      </div>
    </CyberpunkLayout>
  );
}
