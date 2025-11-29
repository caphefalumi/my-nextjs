"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import aiService from "./ai-service";

interface AIInsight {
  type: "recognition" | "warning" | "growth" | "support";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  employeeId?: string;
  employeeName?: string;
}

interface DepartmentInsight {
  department: string;
  insight: string;
  trend: "up" | "down" | "stable";
}

interface AIContextType {
  isProcessing: boolean;
  aiReady: boolean;
  employeeSummaries: Record<string, string>;
  burnoutAnalysis: Record<string, { score: number; factors: string[]; recommendation: string }>;
  insights: AIInsight[];
  departmentInsights: DepartmentInsight[];
  overallHealth: string;
  hiddenGems: string[];
  atRiskEmployees: string[];
  generateSummary: (employeeId: string, data: any) => Promise<string>;
  analyzeBurnout: (employeeId: string, data: any) => Promise<{ score: number; factors: string[]; recommendation: string }>;
  generateAllInsights: (employees: any[]) => Promise<void>;
  analyzePerformance: (employees: any[]) => Promise<void>;
}

const AIContext = createContext<AIContextType | null>(null);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiReady] = useState(true);
  const [employeeSummaries, setEmployeeSummaries] = useState<Record<string, string>>({});
  const [burnoutAnalysis, setBurnoutAnalysis] = useState<Record<string, { score: number; factors: string[]; recommendation: string }>>({});
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [departmentInsights, setDepartmentInsights] = useState<DepartmentInsight[]>([]);
  const [overallHealth, setOverallHealth] = useState("");
  const [hiddenGems, setHiddenGems] = useState<string[]>([]);
  const [atRiskEmployees, setAtRiskEmployees] = useState<string[]>([]);

  const generateSummary = useCallback(async (employeeId: string, data: any): Promise<string> => {
    setIsProcessing(true);
    try {
      const summary = await aiService.generateEmployeeSummary({
        name: data.name,
        role: data.role,
        impactScore: data.impactScore || data.impact_score,
        burnoutRisk: data.burnoutRisk || data.burnout_risk,
        tasksCompleted: data.tasksCompleted || data.Tasks_Completed_Count || 0,
        lateNightCommits: data.lateNightCommits || data.Late_Night_Commits || 0,
        peerReviewScore: data.peerReviewScore || data.Peer_Review_Score || 3.5,
        achievements: data.achievements || (data.Raw_Achievement_Log?.split("|") || []),
      });
      
      setEmployeeSummaries((prev) => ({ ...prev, [employeeId]: summary }));
      return summary;
    } catch (error) {
      console.error("Failed to generate summary:", error);
      return `${data.name} is a ${data.role} with impact score ${data.impactScore || data.impact_score}%.`;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const analyzeBurnout = useCallback(async (employeeId: string, data: any): Promise<{ score: number; factors: string[]; recommendation: string }> => {
    setIsProcessing(true);
    try {
      const analysis = await aiService.analyzeBurnoutRisk({
        lateNightCommits: data.lateNightCommits || data.Late_Night_Commits || 0,
        weekendActivity: data.weekendActivity || data.Weekend_Activity_Log || 0,
        vacationDaysUnused: data.vacationDaysUnused || data.Vacation_Days_Unused || 0,
        sentimentTrend: data.sentimentTrend || data.Sentiment_Trend || 0,
        chatLogs: data.chatLogs || data.chat_logs || [],
      });
      
      setBurnoutAnalysis((prev) => ({ ...prev, [employeeId]: analysis }));
      return analysis;
    } catch (error) {
      console.error("Failed to analyze burnout:", error);
      return { score: 30, factors: [], recommendation: "Unable to analyze at this time." };
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const generateAllInsights = useCallback(async (employees: any[]) => {
    setIsProcessing(true);
    try {
      const employeeData = employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        impactScore: emp.impactScore || emp.impact_score,
        burnoutRisk: emp.burnoutRisk || emp.burnout_risk,
        peerReviewScore: emp.peerReviewScore || emp.Peer_Review_Score || 3.5,
        tasksCompleted: emp.tasksCompleted || emp.Tasks_Completed_Count || 0,
        lateNightCommits: emp.lateNightCommits || emp.Late_Night_Commits || 0,
        achievements: emp.achievements || (emp.Raw_Achievement_Log?.split("|") || []),
      }));

      const result = await aiService.generateInsights(employeeData);
      
      setInsights(result.recommendations);
      setHiddenGems(result.hiddenGems);
      setAtRiskEmployees(result.atRiskEmployees);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const analyzePerformance = useCallback(async (employees: any[]) => {
    setIsProcessing(true);
    try {
      const employeeData = employees.map((emp) => ({
        name: emp.name,
        department: emp.department || "Engineering",
        impactScore: emp.impactScore || emp.impact_score,
        tasksCompleted: emp.tasksCompleted || emp.Tasks_Completed_Count || 0,
        peerReviewScore: emp.peerReviewScore || emp.Peer_Review_Score || 3.5,
      }));

      const result = await aiService.analyzeTeamPerformance(employeeData);
      
      setDepartmentInsights(result.departmentInsights);
      setOverallHealth(result.overallHealth);
    } catch (error) {
      console.error("Failed to analyze performance:", error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return (
    <AIContext.Provider
      value={{
        isProcessing,
        aiReady,
        employeeSummaries,
        burnoutAnalysis,
        insights,
        departmentInsights,
        overallHealth,
        hiddenGems,
        atRiskEmployees,
        generateSummary,
        analyzeBurnout,
        generateAllInsights,
        analyzePerformance,
      }}
    >
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within AIProvider");
  }
  return context;
}
