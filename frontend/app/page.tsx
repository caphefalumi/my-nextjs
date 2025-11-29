"use client";

import { useState, useCallback } from "react";
import { CyberpunkLayout } from "@/components/layout/cyberpunk-layout";
import { NetworkGraph } from "@/components/features/dashboard/network-graph";
import { EmployeeDetailCard } from "@/components/features/dashboard/employee-detail-card";
import { FileUpload, type ParsedData } from "@/components/features/dashboard/file-upload";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { Employee } from "@/components/features/dashboard/network-graph";
import type { EmployeeDetail } from "@/components/features/dashboard/employee-detail-card";

export default function HomePage() {
  const { 
    employees, 
    getEmployeeById, 
    importData, 
    getStats,
    importedData 
  } = useStore();
  
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDetail | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isUploadVisible, setIsUploadVisible] = useState(true);

  const stats = getStats();

  const handleNodeClick = useCallback((employee: Employee) => {
    const detail = getEmployeeById(employee.id);
    if (detail) {
      setSelectedEmployee(detail);
      setIsCardOpen(true);
    }
  }, [getEmployeeById]);

  const handleCardClose = useCallback(() => {
    setIsCardOpen(false);
  }, []);

  const handleDataParsed = useCallback((data: ParsedData) => {
    importData(data);
    setIsUploadVisible(false);
  }, [importData]);

  const handleUploadError = useCallback((error: string) => {
    console.error("Upload error:", error);
  }, []);

  const handleToggleUpload = useCallback(() => {
    setIsUploadVisible((prev) => !prev);
  }, []);

  const overviewStats = [
    { label: "Total Personnel", value: String(stats.total), trend: "+12%", isNegative: false },
    { label: "Avg Impact Score", value: String(stats.avgImpact), trend: "+5.2%", isNegative: false },
    { label: "High Performers", value: String(stats.highPerformers), trend: "+8%", isNegative: false },
    { label: "Burnout Alerts", value: String(stats.burnoutAlerts), trend: stats.burnoutAlerts > 0 ? "Alert" : "OK", isNegative: stats.burnoutAlerts > 0 },
  ];

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

        {/* Data Status */}
        {importedData && (
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
            <p className="text-teal-300 text-sm">
              <span className="font-semibold">Data loaded:</span> {importedData.fileName} ({importedData.totalRows} employees imported)
            </p>
          </div>
        )}

        {/* File Upload Section */}
        {isUploadVisible && (
          <FileUpload onDataParsed={handleDataParsed} onError={handleUploadError} />
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4">
          {overviewStats.map((stat) => (
            <div 
              key={stat.label} 
              className="p-6 rounded-2xl bg-gray-900/50 border border-white/10 hover:border-purple-500/30 transition-all"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              <p className={cn(
                "text-sm flex items-center gap-1 mt-1",
                stat.isNegative ? "text-red-400" : "text-teal-400"
              )}>
                {stat.isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {stat.trend}
              </p>
            </div>
          ))}
        </div>

        {/* Network Graph */}
        <NetworkGraph employees={employees} onNodeClick={handleNodeClick} />

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
