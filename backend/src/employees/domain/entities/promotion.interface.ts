export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  role: string;
  department: string;
  team: string;
  managerId: string | null;
  joinDate: string;
  location: string;
  impactScore: number;
  burnoutRisk: number;
  collaborators: string[];
}

export interface EmployeeStats {
  technical: number;
  leadership: number;
  empathy: number;
  velocity: number;
  creativity: number;
  reliability: number;
}

export interface EmployeeDetail {
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
  impactScore: number;
  burnoutRisk: number;
  stats: EmployeeStats;
  projects: number;
  collaborators: number;
  tenure: string;
  recentAchievement?: string;
}

export interface PromotionParserResponse {
  employees: Employee[];
  employeeDetails: Record<string, EmployeeDetail>;
}
