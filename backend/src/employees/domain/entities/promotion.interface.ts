// Match the structure from employee.interface.ts (mock-data.json)
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

export interface PromotionEmployee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  burnout_risk: 'low' | 'med' | 'medium' | 'high';
  impact_score: number;
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
  chat_logs: ChatLog[];
  jira_tickets: JiraTicket[];
  commit_logs: CommitLog[];
}

export interface Relationship {
  source_id: string;
  target_id: string;
  strength: number;
  type: 'mentorship' | 'collaboration' | 'recognition' | 'support';
}

export interface PromotionParserResponse {
  employees: PromotionEmployee[];
  relationships: Relationship[];
}
