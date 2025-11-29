"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { Employee } from "@/components/features/dashboard/network-graph";
import type { EmployeeDetail } from "@/components/features/dashboard/employee-detail-card";
import type { ParsedData } from "@/components/features/dashboard/file-upload";

// Default mock data
const DEFAULT_EMPLOYEES: Employee[] = [
  { id: "1", employeeCode: "EMP-001", name: "Sarah Chen", email: "sarah.chen@luminus.ai", role: "Tech Lead", department: "Engineering", team: "Platform", managerId: null, joinDate: "2021-03-15", location: "San Francisco", impactScore: 92, burnoutRisk: 75, collaborators: ["2", "3", "5", "7"] },
  { id: "2", employeeCode: "EMP-002", name: "Marcus Johnson", email: "marcus.j@luminus.ai", role: "Senior Developer", department: "Engineering", team: "Platform", managerId: "1", joinDate: "2022-08-01", location: "San Francisco", impactScore: 78, burnoutRisk: 45, collaborators: ["1", "3", "4"] },
  { id: "3", employeeCode: "EMP-003", name: "Elena Rodriguez", email: "elena.r@luminus.ai", role: "UX Designer", department: "Design", team: "Product Design", managerId: null, joinDate: "2020-11-20", location: "New York", impactScore: 85, burnoutRisk: 30, collaborators: ["1", "2", "6"] },
  { id: "4", employeeCode: "EMP-004", name: "David Kim", email: "david.kim@luminus.ai", role: "Backend Engineer", department: "Engineering", team: "API", managerId: "1", joinDate: "2023-06-12", location: "Austin", impactScore: 65, burnoutRisk: 55, collaborators: ["2", "5"] },
  { id: "5", employeeCode: "EMP-005", name: "Aisha Patel", email: "aisha.p@luminus.ai", role: "Product Manager", department: "Product", team: "Core Product", managerId: null, joinDate: "2022-01-10", location: "San Francisco", impactScore: 88, burnoutRisk: 82, collaborators: ["1", "4", "7"] },
  { id: "6", employeeCode: "EMP-006", name: "James Wilson", email: "james.w@luminus.ai", role: "Junior Designer", department: "Design", team: "Product Design", managerId: "3", joinDate: "2024-02-05", location: "New York", impactScore: 45, burnoutRisk: 20, collaborators: ["3"] },
  { id: "7", employeeCode: "EMP-007", name: "Yuki Tanaka", email: "yuki.t@luminus.ai", role: "DevOps Engineer", department: "Operations", team: "Infrastructure", managerId: null, joinDate: "2023-01-18", location: "Seattle", impactScore: 72, burnoutRisk: 40, collaborators: ["1", "5"] },
  { id: "8", employeeCode: "EMP-008", name: "Alex Rivera", email: "alex.r@luminus.ai", role: "Data Analyst", department: "Analytics", team: "Business Intelligence", managerId: "5", joinDate: "2024-01-22", location: "Austin", impactScore: 58, burnoutRisk: 35, collaborators: ["5"] },
];

const DEFAULT_EMPLOYEE_DETAILS: Record<string, EmployeeDetail> = {
  "1": { id: "1", employeeCode: "EMP-001", name: "Sarah Chen", email: "sarah.chen@luminus.ai", role: "Tech Lead", department: "Engineering", team: "Platform", managerId: null, managerName: null, joinDate: "2021-03-15", location: "San Francisco", impactScore: 92, burnoutRisk: 75, stats: { technical: 95, leadership: 88, empathy: 82, velocity: 90, creativity: 78, reliability: 92 }, projects: 12, collaborators: 24, tenure: "3.5 yrs", recentAchievement: "Led successful migration to microservices architecture" },
  "2": { id: "2", employeeCode: "EMP-002", name: "Marcus Johnson", email: "marcus.j@luminus.ai", role: "Senior Developer", department: "Engineering", team: "Platform", managerId: "1", managerName: "Sarah Chen", joinDate: "2022-08-01", location: "San Francisco", impactScore: 78, burnoutRisk: 45, stats: { technical: 88, leadership: 65, empathy: 75, velocity: 82, creativity: 70, reliability: 85 }, projects: 8, collaborators: 15, tenure: "2.1 yrs", recentAchievement: "Optimized API response time by 40%" },
  "3": { id: "3", employeeCode: "EMP-003", name: "Elena Rodriguez", email: "elena.r@luminus.ai", role: "UX Designer", department: "Design", team: "Product Design", managerId: null, managerName: null, joinDate: "2020-11-20", location: "New York", impactScore: 85, burnoutRisk: 30, stats: { technical: 70, leadership: 72, empathy: 95, velocity: 78, creativity: 98, reliability: 88 }, projects: 15, collaborators: 20, tenure: "4 yrs", recentAchievement: "Redesigned dashboard increased user engagement by 60%" },
  "4": { id: "4", employeeCode: "EMP-004", name: "David Kim", email: "david.kim@luminus.ai", role: "Backend Engineer", department: "Engineering", team: "API", managerId: "1", managerName: "Sarah Chen", joinDate: "2023-06-12", location: "Austin", impactScore: 65, burnoutRisk: 55, stats: { technical: 82, leadership: 45, empathy: 60, velocity: 75, creativity: 55, reliability: 80 }, projects: 5, collaborators: 8, tenure: "1.2 yrs" },
  "5": { id: "5", employeeCode: "EMP-005", name: "Aisha Patel", email: "aisha.p@luminus.ai", role: "Product Manager", department: "Product", team: "Core Product", managerId: null, managerName: null, joinDate: "2022-01-10", location: "San Francisco", impactScore: 88, burnoutRisk: 82, stats: { technical: 65, leadership: 92, empathy: 90, velocity: 85, creativity: 88, reliability: 78 }, projects: 18, collaborators: 35, tenure: "2.8 yrs", recentAchievement: "Launched flagship product with 10K+ users in first month" },
  "6": { id: "6", employeeCode: "EMP-006", name: "James Wilson", email: "james.w@luminus.ai", role: "Junior Designer", department: "Design", team: "Product Design", managerId: "3", managerName: "Elena Rodriguez", joinDate: "2024-02-05", location: "New York", impactScore: 45, burnoutRisk: 20, stats: { technical: 55, leadership: 35, empathy: 70, velocity: 60, creativity: 75, reliability: 65 }, projects: 3, collaborators: 5, tenure: "6 mos" },
  "7": { id: "7", employeeCode: "EMP-007", name: "Yuki Tanaka", email: "yuki.t@luminus.ai", role: "DevOps Engineer", department: "Operations", team: "Infrastructure", managerId: null, managerName: null, joinDate: "2023-01-18", location: "Seattle", impactScore: 72, burnoutRisk: 40, stats: { technical: 90, leadership: 58, empathy: 62, velocity: 85, creativity: 60, reliability: 95 }, projects: 7, collaborators: 12, tenure: "1.8 yrs", recentAchievement: "Reduced deployment time from 2 hours to 15 minutes" },
  "8": { id: "8", employeeCode: "EMP-008", name: "Alex Rivera", email: "alex.r@luminus.ai", role: "Data Analyst", department: "Analytics", team: "Business Intelligence", managerId: "5", managerName: "Aisha Patel", joinDate: "2024-01-22", location: "Austin", impactScore: 58, burnoutRisk: 35, stats: { technical: 78, leadership: 42, empathy: 65, velocity: 70, creativity: 72, reliability: 75 }, projects: 4, collaborators: 6, tenure: "10 mos" },
};

interface StoreContextType {
  employees: Employee[];
  employeeDetails: Record<string, EmployeeDetail>;
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
  getFilteredEmployees: () => Employee[];
  getEmployeeById: (id: string) => EmployeeDetail | undefined;
  getDepartments: () => string[];
  getStats: () => { total: number; avgImpact: number; highPerformers: number; burnoutAlerts: number };
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>(DEFAULT_EMPLOYEES);
  const [employeeDetails, setEmployeeDetails] = useState<Record<string, EmployeeDetail>>(DEFAULT_EMPLOYEE_DETAILS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterBurnoutRisk, setFilterBurnoutRisk] = useState("all");
  const [importedData, setImportedData] = useState<ParsedData | null>(null);

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
        getFilteredEmployees,
        getEmployeeById,
        getDepartments,
        getStats,
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
