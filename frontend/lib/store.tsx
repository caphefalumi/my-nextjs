"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Employee } from "@/components/features/dashboard/network-graph";
import type { EmployeeDetail } from "@/components/features/dashboard/employee-detail-card";
import type { ParsedData } from "@/components/features/dashboard/file-upload";
import { api, NetworkGraph, AnalyticsResponse, InsightsResponse, PerformanceResponse, PromotionParserResponse, FileUploadResponse } from "./api";

// Default empty data (will be populated from API)
const DEFAULT_EMPLOYEES: Employee[] = [];
const DEFAULT_EMPLOYEE_DETAILS: Record<string, EmployeeDetail> = {};

interface StoreContextType {
  employees: Employee[];
  employeeDetails: Record<string, EmployeeDetail>;
  networkGraph: NetworkGraph | null;
  analytics: AnalyticsResponse | null;
  insights: InsightsResponse | null;
  performance: PerformanceResponse | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filterDepartment: string;
  filterBurnoutRisk: string;
  importedData: ParsedData | null;
  setEmployees: (employees: Employee[]) => void;
  setEmployeeDetails: (details: Record<string, EmployeeDetail>) => void;
  setSearchQuery: (query: string) => void;
  setFilterDepartment: (dept: string) => void;
  setFilterBurnoutRisk: (risk: string) => void;
  importData: (data: ParsedData) => void;
  importFromBackend: (file: File) => Promise<void>;
  getFilteredEmployees: () => Employee[];
  getEmployeeById: (id: string) => EmployeeDetail | undefined;
  getDepartments: () => string[];
  getStats: () => { total: number; avgImpact: number; highPerformers: number; burnoutAlerts: number };
  fetchDashboard: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchPerformance: () => Promise<void>;
  fetchEmployeeDetail: (id: string) => Promise<EmployeeDetail | null>;
  uploadFile: (file: File) => Promise<FileUploadResponse | null>;
}

const StoreContext = createContext<StoreContextType | null>(null);

// Helper to get department from role
function getDepartmentFromRole(role: string): string {
  const roleLower = role.toLowerCase();
  if (roleLower.includes('backend') || roleLower.includes('frontend') || roleLower.includes('full stack')) return 'Engineering';
  if (roleLower.includes('devops') || roleLower.includes('sre')) return 'DevOps';
  if (roleLower.includes('qa') || roleLower.includes('test')) return 'QA';
  if (roleLower.includes('lead') || roleLower.includes('manager')) return 'Leadership';
  if (roleLower.includes('design') || roleLower.includes('ux')) return 'Design';
  return 'Engineering';
}

// Helper to convert burnout risk to number
function burnoutRiskToNumber(risk: string): number {
  switch (risk) {
    case 'high': return 80;
    case 'medium': case 'med': return 50;
    case 'low': return 20;
    default: return 30;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [employeeDetails, setEmployeeDetails] = useState<Record<string, EmployeeDetail>>(DEFAULT_EMPLOYEE_DETAILS);
  const [networkGraph, setNetworkGraph] = useState<NetworkGraph | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [performance, setPerformance] = useState<PerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterBurnoutRisk, setFilterBurnoutRisk] = useState("all");
  const [importedData, setImportedData] = useState<ParsedData | null>(null);

  // Fetch dashboard data from backend
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard();
      setNetworkGraph(data);
      
      // Transform network nodes to employees
      const newEmployees: Employee[] = data.nodes.map((node) => ({
        id: node.id,
        employeeCode: `EMP-${node.id.padStart(3, '0')}`,
        name: node.name,
        email: `${node.name.toLowerCase().replace(' ', '.')}@company.com`,
        role: node.role,
        department: getDepartmentFromRole(node.role),
        team: getDepartmentFromRole(node.role),
        managerId: null,
        joinDate: new Date().toISOString().split('T')[0],
        location: 'San Francisco',
        impactScore: node.impact_score,
        burnoutRisk: burnoutRiskToNumber(node.burnout_risk),
        collaborators: data.links
          .filter(l => l.source === node.id || l.target === node.id)
          .map(l => l.source === node.id ? l.target : l.source),
      }));
      setEmployees(newEmployees);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  // Fetch insights data
  const fetchInsights = useCallback(async () => {
    try {
      const data = await api.getInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    }
  }, []);

  // Fetch performance data
  const fetchPerformance = useCallback(async () => {
    try {
      const data = await api.getPerformance();
      setPerformance(data);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
    }
  }, []);

  // Fetch employee detail
  const fetchEmployeeDetail = useCallback(async (id: string): Promise<EmployeeDetail | null> => {
    try {
      const data = await api.getEmployee(id);
      const emp = data.employee;
      
      // Transform to EmployeeDetail
      const detail: EmployeeDetail = {
        id: emp.id,
        employeeCode: emp.Employee_ID,
        name: emp.name,
        email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
        role: emp.role,
        department: getDepartmentFromRole(emp.role),
        team: getDepartmentFromRole(emp.role),
        managerId: null,
        managerName: null,
        joinDate: new Date(Date.now() - emp.Tenure_Months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'San Francisco',
        impactScore: data.calculated_impact_score,
        burnoutRisk: data.calculated_burnout_score,
        stats: {
          technical: Math.min(100, emp.Avg_Task_Complexity * 20 + 40),
          leadership: Math.min(100, emp.Help_Request_Replies * 2 + 30),
          empathy: Math.min(100, emp.Cross_Team_Collaborations * 5 + 40),
          velocity: Math.min(100, emp.Tasks_Completed_Count * 3 + 30),
          creativity: Math.min(100, emp.Architectural_Changes * 4 + 40),
          reliability: Math.min(100, emp.Peer_Review_Score * 20),
        },
        projects: emp.jira_tickets.length,
        collaborators: emp.Cross_Team_Collaborations + emp.Help_Request_Replies,
        tenure: `${Math.round(emp.Tenure_Months / 12 * 10) / 10} yrs`,
        recentAchievement: emp.Raw_Achievement_Log.split('|')[0] || undefined,
        aiSummary: data.ai_summary,
        chatLogs: emp.chat_logs,
        jiraTickets: emp.jira_tickets,
        commitLogs: emp.commit_logs,
      };
      
      setEmployeeDetails(prev => ({ ...prev, [id]: detail }));
      return detail;
    } catch (err) {
      console.error('Failed to fetch employee detail:', err);
      return null;
    }
  }, []);

  // Upload file to backend
  const uploadFile = useCallback(async (file: File): Promise<FileUploadResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.uploadFile(file);
      
      // Build collaborators map from relationships
      const collaboratorsMap: Record<string, string[]> = {};
      response.relationships.forEach((rel) => {
        // Add bidirectional connections
        if (!collaboratorsMap[rel.source_id]) {
          collaboratorsMap[rel.source_id] = [];
        }
        if (!collaboratorsMap[rel.target_id]) {
          collaboratorsMap[rel.target_id] = [];
        }
        if (!collaboratorsMap[rel.source_id].includes(rel.target_id)) {
          collaboratorsMap[rel.source_id].push(rel.target_id);
        }
        if (!collaboratorsMap[rel.target_id].includes(rel.source_id)) {
          collaboratorsMap[rel.target_id].push(rel.source_id);
        }
      });

      // Transform uploaded employees to store format (BackendEmployee -> Employee)
      const newEmployees: Employee[] = response.employees.map((emp, idx) => ({
        id: emp.id || (idx + 1).toString(),
        employeeCode: emp.Employee_ID,
        name: emp.name,
        email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
        role: emp.role,
        department: getDepartmentFromRole(emp.role),
        team: getDepartmentFromRole(emp.role),
        managerId: null,
        joinDate: new Date().toISOString().split('T')[0],
        location: 'Remote',
        impactScore: emp.impact_score,
        burnoutRisk: burnoutRiskToNumber(emp.burnout_risk),
        collaborators: collaboratorsMap[emp.id || (idx + 1).toString()] || [],
        avatar: emp.avatar,
      }));
      
      // Transform employee details from API format to component format
      const newDetails: Record<string, EmployeeDetail> = {};
      Object.entries(response.employeeDetails).forEach(([id, apiDetail]) => {
        const emp = apiDetail.employee;
        newDetails[id] = {
          id: emp.id,
          employeeCode: emp.Employee_ID,
          name: emp.name,
          email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
          role: emp.role,
          department: getDepartmentFromRole(emp.role),
          team: getDepartmentFromRole(emp.role),
          managerId: null,
          managerName: null,
          joinDate: new Date().toISOString().split('T')[0],
          location: 'Remote',
          impactScore: emp.impact_score,
          burnoutRisk: apiDetail.calculated_burnout_score,
          stats: {
            technical: emp.Architectural_Changes * 10,
            leadership: emp.Critical_Incident_Ownership * 15,
            empathy: emp.Help_Request_Replies * 5,
            velocity: emp.Tasks_Completed_Count / 10,
            creativity: emp.Unassigned_Tasks_Picked * 10,
            reliability: emp.Peer_Review_Score * 10,
          },
          projects: emp.jira_tickets?.length || 0,
          collaborators: emp.Help_Request_Replies,
          tenure: `${emp.Tenure_Months} months`,
          recentAchievement: emp.Raw_Achievement_Log?.split('|')[0],
          avatar: emp.avatar,
          aiSummary: apiDetail.ai_summary,
          chatLogs: emp.chat_logs,
          jiraTickets: emp.jira_tickets,
          commitLogs: emp.commit_logs,
        };
      });
      
      // Set imported data for display
      setImportedData({
        headers: ['name', 'role', 'impactScore', 'burnoutRisk'],
        rows: response.employees.map(emp => ({
          id: emp.id,
          name: emp.name,
          role: emp.role,
          impactScore: emp.impact_score,
          burnoutRisk: emp.burnout_risk,
        })),
        fileName: file.name,
        fileType: 'csv',
        totalRows: response.employees.length,
      });
      
      setEmployees(newEmployees);
      setEmployeeDetails(newDetails);
      setLoading(false);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMsg);
      setLoading(false);
      return null;
    }
  }, []);

  // Fetch initial data on mount
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const importData = useCallback((data: ParsedData) => {
    setImportedData(data);
    
    // Transform parsed data to employees
    const newEmployees: Employee[] = data.rows.map((row, index) => ({
      id: String(row.id || row.ID || index + 1),
      employeeCode: String(row.employeeCode || row.employee_code || `EMP-${String(index + 1).padStart(3, "0")}`),
      name: String(row.name || row.Name || "Unknown"),
      email: String(row.email || row.Email || ""),
      role: String(row.role || row.Role || row.title || row.Title || "Employee"),
      department: String(row.department || row.Department || "General"),
      team: String(row.team || row.Team || ""),
      managerId: row.managerId ? String(row.managerId) : (row.manager_id ? String(row.manager_id) : null),
      joinDate: String(row.joinDate || row.join_date || row.hireDate || new Date().toISOString().split("T")[0]),
      location: String(row.location || row.Location || ""),
      impactScore: Number(row.impactScore || row.impact_score || row.performance || 50),
      burnoutRisk: Number(row.burnoutRisk || row.burnout_risk || 30),
      collaborators: [],
    }));

    if (newEmployees.length > 0) {
      setEmployees(newEmployees);
      
      // Create employee details
      const newDetails: Record<string, EmployeeDetail> = {};
      newEmployees.forEach((emp) => {
        newDetails[emp.id] = {
          ...emp,
          managerName: null,
          stats: {
            technical: Math.floor(Math.random() * 40) + 60,
            leadership: Math.floor(Math.random() * 40) + 40,
            empathy: Math.floor(Math.random() * 40) + 50,
            velocity: Math.floor(Math.random() * 40) + 50,
            creativity: Math.floor(Math.random() * 40) + 50,
            reliability: Math.floor(Math.random() * 40) + 60,
          },
          projects: Math.floor(Math.random() * 15) + 1,
          collaborators: Math.floor(Math.random() * 20) + 5,
          tenure: "N/A",
        };
      });
      setEmployeeDetails(newDetails);
    }
  }, []);

  // Import data from backend (CSV upload)
  const importFromBackend = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const response: PromotionParserResponse = await api.uploadCSV(file);
      
      // Create a network graph from the response
      const nodes = response.employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        burnout_risk: emp.burnout_risk,
        impact_score: emp.impact_score,
      }));
      
      const links = response.relationships.map(rel => ({
        source: rel.source_id,
        target: rel.target_id,
        strength: rel.strength,
        type: rel.type,
      }));
      
      setNetworkGraph({ nodes, links });
      
      // Transform backend employees to frontend Employee type
      const newEmployees: Employee[] = response.employees.map((emp) => ({
        id: emp.id,
        employeeCode: emp.Employee_ID,
        name: emp.name,
        email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
        role: emp.role,
        department: getDepartmentFromRole(emp.role),
        team: getDepartmentFromRole(emp.role),
        managerId: null,
        joinDate: new Date(Date.now() - emp.Tenure_Months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        location: 'San Francisco',
        impactScore: emp.impact_score,
        burnoutRisk: burnoutRiskToNumber(emp.burnout_risk),
        collaborators: links
          .filter(l => l.source === emp.id || l.target === emp.id)
          .map(l => l.source === emp.id ? l.target : l.source),
      }));
      
      setEmployees(newEmployees);
      
      // Create employee details from backend data
      const newDetails: Record<string, EmployeeDetail> = {};
      response.employees.forEach((emp) => {
        newDetails[emp.id] = {
          id: emp.id,
          employeeCode: emp.Employee_ID,
          name: emp.name,
          email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
          role: emp.role,
          department: getDepartmentFromRole(emp.role),
          team: getDepartmentFromRole(emp.role),
          managerId: null,
          managerName: null,
          joinDate: new Date(Date.now() - emp.Tenure_Months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: 'San Francisco',
          impactScore: emp.impact_score,
          burnoutRisk: burnoutRiskToNumber(emp.burnout_risk),
          stats: {
            technical: Math.min(100, emp.Avg_Task_Complexity * 20 + 40),
            leadership: Math.min(100, emp.Help_Request_Replies * 2 + 30),
            empathy: Math.min(100, emp.Cross_Team_Collaborations * 5 + 40),
            velocity: Math.min(100, emp.Tasks_Completed_Count * 3 + 30),
            creativity: Math.min(100, emp.Architectural_Changes * 4 + 40),
            reliability: Math.min(100, emp.Peer_Review_Score * 20),
          },
          projects: emp.jira_tickets.length,
          collaborators: emp.Cross_Team_Collaborations + emp.Help_Request_Replies,
          tenure: `${Math.round(emp.Tenure_Months / 12 * 10) / 10} yrs`,
          recentAchievement: emp.Raw_Achievement_Log.split('|')[0] || undefined,
          chatLogs: emp.chat_logs,
          jiraTickets: emp.jira_tickets,
          commitLogs: emp.commit_logs,
        };
      });
      
      setEmployeeDetails(newDetails);
      
      // Set imported data info
      setImportedData({
        headers: Object.keys(response.employees[0] || {}),
        rows: response.employees as unknown as Record<string, string | number | boolean | null>[],
        fileName: file.name,
        fileType: 'csv',
        totalRows: response.employees.length,
      });
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to upload CSV';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFilteredEmployees = useCallback(() => {
    return employees.filter((emp) => {
      const matchesSearch = searchQuery === "" || 
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = filterDepartment === "all" || emp.department === filterDepartment;
      
      const matchesBurnout = filterBurnoutRisk === "all" ||
        (filterBurnoutRisk === "high" && emp.burnoutRisk >= 70) ||
        (filterBurnoutRisk === "medium" && emp.burnoutRisk >= 40 && emp.burnoutRisk < 70) ||
        (filterBurnoutRisk === "low" && emp.burnoutRisk < 40);
      
      return matchesSearch && matchesDept && matchesBurnout;
    });
  }, [employees, searchQuery, filterDepartment, filterBurnoutRisk]);

  const getEmployeeById = useCallback((id: string) => {
    return employeeDetails[id];
  }, [employeeDetails]);

  const getDepartments = useCallback(() => {
    const depts = new Set(employees.map((e) => e.department));
    return Array.from(depts).sort();
  }, [employees]);

  const getStats = useCallback(() => {
    const total = employees.length;
    const avgImpact = employees.reduce((sum, e) => sum + e.impactScore, 0) / total || 0;
    const highPerformers = employees.filter((e) => e.impactScore >= 80).length;
    const burnoutAlerts = employees.filter((e) => e.burnoutRisk >= 70).length;
    return { total, avgImpact: Math.round(avgImpact * 10) / 10, highPerformers, burnoutAlerts };
  }, [employees]);

  return (
    <StoreContext.Provider
      value={{
        employees,
        employeeDetails,
        networkGraph,
        analytics,
        insights,
        performance,
        loading,
        error,
        searchQuery,
        filterDepartment,
        filterBurnoutRisk,
        importedData,
        setEmployees,
        setEmployeeDetails,
        setSearchQuery,
        setFilterDepartment,
        setFilterBurnoutRisk,
        importData,
        importFromBackend,
        getFilteredEmployees,
        getEmployeeById,
        getDepartments,
        getStats,
        fetchDashboard,
        fetchAnalytics,
        fetchInsights,
        fetchPerformance,
        fetchEmployeeDetail,
        uploadFile,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
