const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002') + '/api';

// Types matching backend interfaces
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

export interface BackendEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  burnout_risk: 'low' | 'med' | 'medium' | 'high';
  impact_score: number;
  chat_logs: ChatLog[];
  jira_tickets: JiraTicket[];
  commit_logs: CommitLog[];
  Employee_ID: string;
  Current_Role: string;
  Level: string;
  Tenure_Months: number;
  Unassigned_Tasks_Picked: number;
  Help_Request_Replies: number;
  Cross_Team_Collaborations: number;
  Critical_Incident_Ownership: number;
  Peer_Review_Score: number;
  Architectural_Changes: number;
  Avg_Task_Complexity: number;
  Tasks_Completed_Count: number;
  Late_Night_Commits: number;
  Weekend_Activity_Log: number;
  Vacation_Days_Unused: number;
  Sentiment_Trend: number;
  Raw_Achievement_Log: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  burnout_risk: string;
  impact_score: number;
}

export interface NetworkLink {
  source: string;
  target: string;
  strength: number;
  type: string;
}

export interface NetworkGraph {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface EmployeeDetail {
  employee: BackendEmployee;
  ai_summary: string;
  calculated_burnout_score: number;
  calculated_impact_score: number;
}

export interface AnalyticsOverview {
  totalEmployees: number;
  avgImpactScore: number;
  highPerformers: number;
  burnoutAlerts: number;
  avgTenure: number;
  totalTasksCompleted: number;
}

export interface DepartmentStats {
  department: string;
  count: number;
  avgImpact: number;
  avgBurnout: number;
}

export interface BurnoutDistribution {
  level: string;
  count: number;
  percentage: number;
}

export interface LevelDistribution {
  level: string;
  count: number;
}

export interface TrendData {
  month: string;
  headcount: number;
  avgPerformance: number;
}

export interface AnalyticsResponse {
  overview: AnalyticsOverview;
  departments: DepartmentStats[];
  burnoutDistribution: BurnoutDistribution[];
  levelDistribution: LevelDistribution[];
  trends: TrendData[];
}

export interface Recommendation {
  id: string;
  type: 'recognition' | 'support' | 'growth' | 'warning';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  employeeId?: string;
  employeeName?: string;
  actionUrl?: string;
}

export interface AtRiskEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  burnoutScore: number;
  riskFactors: string[];
  recommendation: string;
}

export interface InsightsResponse {
  recommendations: Recommendation[];
  atRiskEmployees: AtRiskEmployee[];
  hiddenGems: EmployeeDetail[];
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  role: string;
  avatar: string;
  impactScore: number;
  tasksCompleted: number;
  peerReviewScore: number;
}

export interface DepartmentRanking {
  department: string;
  avgScore: number;
  topPerformer: string;
  employeeCount: number;
}

export interface PerformanceResponse {
  leaderboard: LeaderboardEntry[];
  departmentRankings: DepartmentRanking[];
}

export interface EmployeeListItem {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  impactScore: number;
  burnoutRisk: string;
  level: string;
  location: string;
  joinDate: string;
}

export interface EmployeeListResponse {
  employees: EmployeeListItem[];
  total: number;
}

export interface Relationship {
  source_id: string;
  target_id: string;
  strength: number;
  type: string;
}

export interface PromotionParserResponse {
  employees: BackendEmployee[];
  relationships: Relationship[];
}

export interface FileUploadResponse {
  employees: BackendEmployee[];
  employeeDetails: Record<string, EmployeeDetail>;
  relationships: Relationship[];
}

// API Error type
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('luminus_auth_token');
}

// Fetch wrapper with error handling and auth
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// API Functions
export const api = {
  // Dashboard - Network Graph
  getDashboard: () => fetchApi<NetworkGraph>('/dashboard'),

  // Employee Detail
  getEmployee: (id: string) => fetchApi<EmployeeDetail>(`/employee/${id}`),

  // Employee List with filtering
  getEmployees: (params?: {
    search?: string;
    department?: string;
    burnoutRisk?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.department) searchParams.set('department', params.department);
    if (params?.burnoutRisk) searchParams.set('burnoutRisk', params.burnoutRisk);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    
    const query = searchParams.toString();
    return fetchApi<EmployeeListResponse>(`/employees${query ? `?${query}` : ''}`);
  },

  // Analytics
  getAnalytics: () => fetchApi<AnalyticsResponse>('/analytics'),

  // Insights
  getInsights: () => fetchApi<InsightsResponse>('/insights'),

  // Performance
  getPerformance: () => fetchApi<PerformanceResponse>('/performance'),

  // Upload file to backend for parsing
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const url = `${API_BASE_URL}/promotion-parser`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApiError(response.status, `API Error: ${response.statusText}`);
      }

      const data: PromotionParserResponse = await response.json();
      
      // Transform to FileUploadResponse format
      const employeeDetails: Record<string, EmployeeDetail> = {};
      data.employees.forEach((emp) => {
        employeeDetails[emp.id] = {
          employee: emp,
          ai_summary: `AI-generated summary for ${emp.name}`,
          calculated_burnout_score: emp.burnout_risk === 'high' ? 80 : emp.burnout_risk === 'medium' || emp.burnout_risk === 'med' ? 50 : 20,
          calculated_impact_score: emp.impact_score,
        };
      });

      return {
        employees: data.employees,
        employeeDetails,
        relationships: data.relationships,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Upload CSV to backend for parsing
  uploadCSV: async (file: File): Promise<PromotionParserResponse> => {
    const url = `${API_BASE_URL}/promotion-parser`;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new ApiError(response.status, `API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};

export default api;
