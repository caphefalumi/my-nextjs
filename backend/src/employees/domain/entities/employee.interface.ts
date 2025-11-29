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

export interface Employee {
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
  // CSV Fields - Identity & Role
  Employee_ID: string;
  Current_Role: string;
  Level: string;
  Tenure_Months: number;
  // CSV Fields - Shadow Leader Signals
  Unassigned_Tasks_Picked: number;
  Help_Request_Replies: number;
  Cross_Team_Collaborations: number;
  Critical_Incident_Ownership: number;
  // CSV Fields - Quality over Quantity
  Peer_Review_Score: number;
  Architectural_Changes: number;
  Avg_Task_Complexity: number;
  Tasks_Completed_Count: number;
  // CSV Fields - Burnout Indicators
  Late_Night_Commits: number;
  Weekend_Activity_Log: number;
  Vacation_Days_Unused: number;
  Sentiment_Trend: number;
  // CSV Fields - The Golden Column
  Raw_Achievement_Log: string;
}

export interface Relationship {
  source_id: string;
  target_id: string;
  strength: number;
  type: 'mentorship' | 'collaboration' | 'recognition' | 'support';
}

export interface MockData {
  employees: Employee[];
  relationships: Relationship[];
}

export interface NetworkNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  burnout_risk: string;
  impact_score: number;
  x?: number;
  y?: number;
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
  employee: Employee;
  ai_summary: string;
  calculated_burnout_score: number;
  calculated_impact_score: number;
}

// Analytics Interfaces
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

export interface LocationBreakdown {
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
  levelDistribution: LocationBreakdown[];
  trends: TrendData[];
}

// Insights Interfaces
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

// Performance Interfaces
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

// Employee List with filters
export interface EmployeeListParams {
  search?: string;
  department?: string;
  burnoutRisk?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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

