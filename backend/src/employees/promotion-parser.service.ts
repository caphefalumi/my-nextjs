import { Injectable } from '@nestjs/common';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import type {
  Relationship,
  PromotionParserResponse,
  PromotionEmployee,
  ChatLog,
  JiraTicket,
  CommitLog,
} from './domain/entities/promotion.interface';

interface CSVRow {
  Employee_ID: string;
  name: string;
  Current_Role: string;
  Level: string;
  Tenure_Months: string;
  Unassigned_Tasks_Picked: string;
  Help_Request_Replies: string;
  Cross_Team_Collaborations: string;
  Critical_Incident_Ownership: string;
  Peer_Review_Score: string;
  Architectural_Changes: string;
  Avg_Task_Complexity: string;
  Tasks_Completed_Count: string;
  Late_Night_Commits: string;
  Weekend_Activity_Log: string;
  Vacation_Days_Unused: string;
  Sentiment_Trend: string;
  Raw_Achievement_Log: string;
  burnout_risk?: string;
  impact_score?: string;
  avatar?: string;
  skills?: string;
  [key: string]: string | undefined;
}

@Injectable()
export class PromotionParserService {
  async parseCSV(buffer: Buffer): Promise<PromotionParserResponse> {
    const rows: CSVRow[] = await this.parseCSVBuffer(buffer);
    
    const employees: PromotionEmployee[] = [];
    const relationships: Relationship[] = [];

    rows.forEach((row, index) => {
      const id = (index + 1).toString();
      const employeeCode = row.Employee_ID || `EMP-${id.padStart(3, '0')}`;
      
      // Calculate impact score and burnout risk
      const impactScore = this.calculateImpactScore(row);
      const burnoutRisk = this.calculateBurnoutRisk(row);
      
      // Parse skills if available
      const skills = row.skills ? row.skills.split('|') : [];
      
      // Generate avatar
      const avatar = row.avatar || `https://i.pravatar.cc/150?img=${index + 10}`;
      
      // Convert burnout risk number to category
      const burnoutCategory = this.getBurnoutCategory(burnoutRisk);
      
      // Generate chat logs
      const chatLogs = this.generateChatLogs(row, burnoutCategory);
      
      // Generate jira tickets
      const jiraTickets = this.generateJiraTickets(row, employeeCode);
      
      // Generate commit logs
      const commitLogs = this.generateCommitLogs(row);
      
      // Create Employee object matching mock-data.json structure
      const employee = {
        id,
        name: row.name,
        role: row.Current_Role,
        avatar,
        skills,
        burnout_risk: burnoutCategory,
        impact_score: impactScore,
        Employee_ID: employeeCode,
        Current_Role: row.Current_Role,
        Level: row.Level,
        Tenure_Months: parseInt(row.Tenure_Months || '0'),
        Unassigned_Tasks_Picked: parseInt(row.Unassigned_Tasks_Picked || '0'),
        Help_Request_Replies: parseInt(row.Help_Request_Replies || '0'),
        Cross_Team_Collaborations: parseInt(row.Cross_Team_Collaborations || '0'),
        Critical_Incident_Ownership: parseInt(row.Critical_Incident_Ownership || '0'),
        Peer_Review_Score: parseFloat(row.Peer_Review_Score || '0'),
        Architectural_Changes: parseInt(row.Architectural_Changes || '0'),
        Avg_Task_Complexity: parseFloat(row.Avg_Task_Complexity || '0'),
        Tasks_Completed_Count: parseInt(row.Tasks_Completed_Count || '0'),
        Late_Night_Commits: parseInt(row.Late_Night_Commits || '0'),
        Weekend_Activity_Log: parseInt(row.Weekend_Activity_Log || '0'),
        Vacation_Days_Unused: parseInt(row.Vacation_Days_Unused || '0'),
        Sentiment_Trend: parseFloat(row.Sentiment_Trend || '0'),
        Raw_Achievement_Log: row.Raw_Achievement_Log || '',
        chat_logs: chatLogs,
        jira_tickets: jiraTickets,
        commit_logs: commitLogs,
      };
      
      employees.push(employee);
    });

    // Generate relationships based on cross-team collaborations
    relationships.push(...this.generateRelationships(employees));

    return { employees, relationships };
  }

  private parseCSVBuffer(buffer: Buffer): Promise<CSVRow[]> {
    return new Promise((resolve, reject) => {
      const results: CSVRow[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser())
        .on('data', (data: CSVRow) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  private calculateImpactScore(row: CSVRow): number {
    const unassignedTasks = parseFloat(row.Unassigned_Tasks_Picked || '0');
    const helpReplies = parseFloat(row.Help_Request_Replies || '0');
    const crossTeam = parseFloat(row.Cross_Team_Collaborations || '0');
    const criticalIncidents = parseFloat(row.Critical_Incident_Ownership || '0');
    const peerReview = parseFloat(row.Peer_Review_Score || '0');
    const archChanges = parseFloat(row.Architectural_Changes || '0');
    const taskComplexity = parseFloat(row.Avg_Task_Complexity || '0');
    const tasksCompleted = parseFloat(row.Tasks_Completed_Count || '0');

    // Weighted formula for impact score
    const score =
      unassignedTasks * 2 +
      helpReplies * 1.5 +
      crossTeam * 3 +
      criticalIncidents * 5 +
      peerReview * 10 +
      archChanges * 2.5 +
      taskComplexity * 3 +
      tasksCompleted * 1;

    return Math.min(100, Math.round(score));
  }

  private calculateBurnoutRisk(row: CSVRow): number {
    const lateNightCommits = parseFloat(row.Late_Night_Commits || '0');
    const weekendActivity = parseFloat(row.Weekend_Activity_Log || '0');
    const vacationUnused = parseFloat(row.Vacation_Days_Unused || '0');
    const sentimentTrend = parseFloat(row.Sentiment_Trend || '0');

    // Weighted formula for burnout risk (0-100)
    const score =
      lateNightCommits * 4 +
      weekendActivity * 5 +
      vacationUnused * 3 +
      (sentimentTrend < 0 ? Math.abs(sentimentTrend) * 50 : 0);

    return Math.min(100, Math.round(score));
  }

  private getBurnoutCategory(burnoutScore: number): 'low' | 'medium' | 'high' {
    if (burnoutScore >= 70) return 'high';
    if (burnoutScore >= 40) return 'medium';
    return 'low';
  }

  private generateChatLogs(row: CSVRow, burnoutCategory: string): ChatLog[] {
    const chatLogs: ChatLog[] = [];
    const sentimentTrend = parseFloat(row.Sentiment_Trend || '0');
    const lateNightCommits = parseInt(row.Late_Night_Commits || '0');
    
    // Generate chat logs based on sentiment and burnout
    const baseDate = new Date('2024-01-15');
    
    if (lateNightCommits > 5) {
      chatLogs.push({
        timestamp: new Date(baseDate.getTime() + Math.random() * 86400000).toISOString(),
        message: "I'll handle the deployment tonight, don't worry about it",
        sentiment: 'neutral',
      });
    }
    
    if (sentimentTrend > 0) {
      chatLogs.push({
        timestamp: new Date(baseDate.getTime() + 86400000 + Math.random() * 86400000).toISOString(),
        message: "Just finished the task, looks great!",
        sentiment: 'positive',
      });
    } else if (sentimentTrend < -0.1) {
      chatLogs.push({
        timestamp: new Date(baseDate.getTime() + 172800000).toISOString(),
        message: "Sure, I can take on that refactoring task",
        sentiment: 'neutral',
      });
    }
    
    if (parseInt(row.Help_Request_Replies || '0') > 20) {
      chatLogs.push({
        timestamp: new Date(baseDate.getTime() + 259200000).toISOString(),
        message: "Happy to help! Let me know if you need anything else",
        sentiment: 'positive',
      });
    }
    
    return chatLogs;
  }

  private generateJiraTickets(row: CSVRow, employeeCode: string): JiraTicket[] {
    const tickets: JiraTicket[] = [];
    const tasksCompleted = parseInt(row.Tasks_Completed_Count || '0');
    const taskComplexity = parseFloat(row.Avg_Task_Complexity || '0');
    const achievements = row.Raw_Achievement_Log?.split('|') || [];
    
    const baseDate = new Date('2024-01-10');
    let ticketCounter = Math.floor(Math.random() * 100) + 100;
    
    // Generate tickets from achievements
    achievements.slice(0, Math.min(3, achievements.length)).forEach((achievement, index) => {
      const complexity: 'low' | 'medium' | 'high' = 
        taskComplexity >= 3.5 ? 'high' : 
        taskComplexity >= 2.0 ? 'medium' : 'low';
      
      const createdAt = new Date(baseDate.getTime() + index * 172800000);
      const completedAt = new Date(createdAt.getTime() + (complexity === 'high' ? 432000000 : 259200000));
      
      tickets.push({
        id: `PROJ-${ticketCounter++}`,
        title: achievement.substring(0, 50),
        complexity,
        status: 'done',
        created_at: createdAt.toISOString(),
        completed_at: completedAt.toISOString(),
      });
    });
    
    // Add an in-progress ticket if there are incomplete tasks
    if (tasksCompleted < 20 || Math.random() > 0.5) {
      tickets.push({
        id: `PROJ-${ticketCounter++}`,
        title: `Ongoing ${row.Current_Role} task`,
        complexity: taskComplexity >= 3.0 ? 'high' : 'medium',
        status: 'in_progress',
        created_at: new Date(baseDate.getTime() + tickets.length * 172800000).toISOString(),
      });
    }
    
    return tickets;
  }

  private generateCommitLogs(row: CSVRow): CommitLog[] {
    const commits: CommitLog[] = [];
    const lateNightCommits = parseInt(row.Late_Night_Commits || '0');
    const weekendActivity = parseInt(row.Weekend_Activity_Log || '0');
    const archChanges = parseInt(row.Architectural_Changes || '0');
    const achievements = row.Raw_Achievement_Log?.split('|') || [];
    
    const baseDate = new Date('2024-01-15');
    const hashChars = 'abcdef0123456789';
    
    // Generate commits from achievements
    achievements.slice(0, Math.min(4, achievements.length)).forEach((achievement, index) => {
      const hash = Array.from({ length: 8 }, () => 
        hashChars[Math.floor(Math.random() * hashChars.length)]
      ).join('');
      
      let timestamp = new Date(baseDate.getTime() + index * 86400000);
      
      // Some commits are late night
      if (index < lateNightCommits && lateNightCommits > 0) {
        timestamp.setHours(22 + Math.floor(Math.random() * 4));
      } else {
        timestamp.setHours(9 + Math.floor(Math.random() * 9));
      }
      
      const isArchitectural = archChanges > 0 && index < archChanges;
      const filesChanged = isArchitectural ? 
        Math.floor(Math.random() * 10) + 5 : 
        Math.floor(Math.random() * 5) + 1;
      const linesAdded = isArchitectural ? 
        Math.floor(Math.random() * 400) + 200 : 
        Math.floor(Math.random() * 150) + 50;
      const linesDeleted = Math.floor(linesAdded * (Math.random() * 0.4 + 0.1));
      
      commits.push({
        hash,
        message: achievement.substring(0, 60),
        timestamp: timestamp.toISOString(),
        files_changed: filesChanged,
        lines_added: linesAdded,
        lines_deleted: linesDeleted,
      });
    });
    
    return commits;
  }

  private generateRelationships(employees: any): Relationship[] {
    const relationships: Relationship[] = [];
    
    employees.forEach((employee, index) => {
      const collaborations = employee.Cross_Team_Collaborations;
      const helpReplies = employee.Help_Request_Replies;
      const level = parseInt(employee.Level.replace('L', ''));
      
      // High-level employees mentor others
      if (level >= 5 && collaborations > 10) {
        // Find lower-level employee to mentor
        const mentees = employees.filter(e => {
          const eLevel = parseInt(e.Level.replace('L', ''));
          return eLevel < level && e.id !== employee.id;
        });
        
        if (mentees.length > 0) {
          const mentee = mentees[Math.floor(Math.random() * mentees.length)];
          relationships.push({
            source_id: employee.id,
            target_id: mentee.id,
            strength: Math.min(9, Math.floor(helpReplies / 10) + 5),
            type: 'mentorship',
          });
        }
      }
      
      // Collaborations based on cross-team work
      if (collaborations > 5) {
        const numCollaborations = Math.min(3, Math.floor(collaborations / 4));
        for (let i = 0; i < numCollaborations; i++) {
          const targetIndex = (index + i + 1) % employees.length;
          if (targetIndex !== index) {
            relationships.push({
              source_id: employee.id,
              target_id: employees[targetIndex].id,
              strength: Math.min(8, Math.floor(collaborations / 2) + 3),
              type: 'collaboration',
            });
          }
        }
      }
      
      // Recognition from high performers
      if (employee.impact_score >= 85 && employee.Peer_Review_Score >= 4.5) {
        // Find someone to recognize
        const highImpactPeers = employees.filter(e => 
          e.impact_score >= 80 && e.id !== employee.id
        );
        
        if (highImpactPeers.length > 0) {
          const recognized = highImpactPeers[Math.floor(Math.random() * highImpactPeers.length)];
          relationships.push({
            source_id: employee.id,
            target_id: recognized.id,
            strength: 9,
            type: 'recognition',
          });
        }
      }
      
      // Support relationships for high burnout employees
      if (employee.burnout_risk === 'high' && employee.impact_score >= 70) {
        const supporters = employees.filter(e => 
          e.burnout_risk === 'low' && e.id !== employee.id
        );
        
        if (supporters.length > 0) {
          const supporter = supporters[Math.floor(Math.random() * supporters.length)];
          relationships.push({
            source_id: supporter.id,
            target_id: employee.id,
            strength: 7,
            type: 'support',
          });
        }
      }
    });
    
    return relationships;
  }

  private generateEmail(name: string): string {
    const parts = name.toLowerCase().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1].charAt(0)}@luminus.ai`;
    }
    return `${parts[0]}@luminus.ai`;
  }
}
