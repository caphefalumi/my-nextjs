import { Injectable } from '@nestjs/common';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import type {
  Employee,
  EmployeeDetail,
  EmployeeStats,
  PromotionParserResponse,
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
    
    const employees: Employee[] = [];
    const employeeDetails: Record<string, EmployeeDetail> = {};

    rows.forEach((row, index) => {
      const id = (index + 1).toString();
      const employeeCode = row.Employee_ID || `EMP-${id.padStart(3, '0')}`;
      
      // Calculate impact score and burnout risk
      const impactScore = this.calculateImpactScore(row);
      const burnoutRisk = this.calculateBurnoutRisk(row);
      
      // Generate email from name
      const email = this.generateEmail(row.name);
      
      // Parse skills if available
      const skills = row.skills ? row.skills.split('|') : [];
      
      // Determine department and team from role
      const { department, team } = this.getDepartmentAndTeam(row.Current_Role);
      
      // Calculate collaborators (based on cross-team collaborations)
      const collaboratorCount = parseInt(row.Cross_Team_Collaborations || '0');
      const collaborators = this.generateCollaboratorIds(id, collaboratorCount, rows.length);
      
      // Create Employee object
      const employee: Employee = {
        id,
        employeeCode,
        name: row.name,
        email,
        role: row.Current_Role,
        department,
        team,
        managerId: this.determineManagerId(id, row.Level, rows.length),
        joinDate: this.calculateJoinDate(parseInt(row.Tenure_Months || '0')),
        location: this.assignLocation(index),
        impactScore,
        burnoutRisk,
        collaborators,
      };
      
      employees.push(employee);
      
      // Create EmployeeDetail object
      const stats = this.calculateStats(row);
      const tenure = this.formatTenure(parseInt(row.Tenure_Months || '0'));
      const achievements = row.Raw_Achievement_Log?.split('|') || [];
      const recentAchievement = achievements.length > 0 ? achievements[0] : undefined;
      
      const managerName = employee.managerId 
        ? this.getManagerName(employee.managerId, rows) 
        : null;
      
      const employeeDetail: EmployeeDetail = {
        id,
        employeeCode,
        name: row.name,
        email,
        role: row.Current_Role,
        department,
        team,
        managerId: employee.managerId,
        managerName,
        joinDate: employee.joinDate,
        location: employee.location,
        impactScore,
        burnoutRisk,
        stats,
        projects: Math.max(1, Math.floor(impactScore / 10)),
        collaborators: collaborators.length,
        tenure,
        recentAchievement,
      };
      
      employeeDetails[id] = employeeDetail;
    });

    return { employees, employeeDetails };
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

  private calculateStats(row: CSVRow): EmployeeStats {
    const peerReview = parseFloat(row.Peer_Review_Score || '0');
    const archChanges = parseFloat(row.Architectural_Changes || '0');
    const taskComplexity = parseFloat(row.Avg_Task_Complexity || '0');
    const helpReplies = parseFloat(row.Help_Request_Replies || '0');
    const crossTeam = parseFloat(row.Cross_Team_Collaborations || '0');
    const tasksCompleted = parseFloat(row.Tasks_Completed_Count || '0');
    const sentimentTrend = parseFloat(row.Sentiment_Trend || '0');

    return {
      technical: Math.min(100, Math.round(taskComplexity * 20 + archChanges * 2)),
      leadership: Math.min(100, Math.round(crossTeam * 5 + helpReplies)),
      empathy: Math.min(100, Math.round((sentimentTrend + 1) * 40 + peerReview * 10)),
      velocity: Math.min(100, Math.round(tasksCompleted * 4)),
      creativity: Math.min(100, Math.round(archChanges * 3 + taskComplexity * 15)),
      reliability: Math.min(100, Math.round(peerReview * 18)),
    };
  }

  private generateEmail(name: string): string {
    const parts = name.toLowerCase().split(' ');
    if (parts.length >= 2) {
      return `${parts[0]}.${parts[1].charAt(0)}@luminus.ai`;
    }
    return `${parts[0]}@luminus.ai`;
  }

  private getDepartmentAndTeam(role: string): { department: string; team: string } {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('backend') || roleLower.includes('engineer') || roleLower.includes('developer')) {
      return { department: 'Engineering', team: 'Platform' };
    } else if (roleLower.includes('frontend')) {
      return { department: 'Engineering', team: 'Frontend' };
    } else if (roleLower.includes('devops')) {
      return { department: 'Operations', team: 'Infrastructure' };
    } else if (roleLower.includes('designer') || roleLower.includes('ux')) {
      return { department: 'Design', team: 'Product Design' };
    } else if (roleLower.includes('product') || roleLower.includes('manager')) {
      return { department: 'Product', team: 'Core Product' };
    } else if (roleLower.includes('qa') || roleLower.includes('quality')) {
      return { department: 'Engineering', team: 'Quality Assurance' };
    } else if (roleLower.includes('lead')) {
      return { department: 'Engineering', team: 'Platform' };
    }
    
    return { department: 'Engineering', team: 'General' };
  }

  private determineManagerId(currentId: string, level: string, totalEmployees: number): string | null {
    const levelNum = parseInt(level.replace('L', '')) || 0;
    
    // L6 and above typically don't have managers in the system
    if (levelNum >= 6) {
      return null;
    }
    
    // Junior levels (L3 and below) report to someone
    if (levelNum <= 3 && parseInt(currentId) > 1) {
      // Find a higher-level employee to report to (simplified logic)
      const managerId = Math.max(1, parseInt(currentId) - Math.floor(Math.random() * 3 + 1));
      return managerId.toString();
    }
    
    // L4-L5 might report to tech leads
    if (levelNum <= 5 && totalEmployees > 3) {
      return '1'; // Assume first employee is a lead
    }
    
    return null;
  }

  private getManagerName(managerId: string, rows: CSVRow[]): string | null {
    const managerIndex = parseInt(managerId) - 1;
    if (managerIndex >= 0 && managerIndex < rows.length) {
      return rows[managerIndex].name;
    }
    return null;
  }

  private calculateJoinDate(tenureMonths: number): string {
    const today = new Date();
    const joinDate = new Date(today);
    joinDate.setMonth(joinDate.getMonth() - tenureMonths);
    return joinDate.toISOString().split('T')[0];
  }

  private formatTenure(tenureMonths: number): string {
    if (tenureMonths < 12) {
      return `${tenureMonths} mos`;
    }
    const years = Math.floor(tenureMonths / 12);
    const months = tenureMonths % 12;
    if (months === 0) {
      return `${years} yr${years > 1 ? 's' : ''}`;
    }
    return `${years}.${Math.floor(months / 12 * 10)} yrs`;
  }

  private assignLocation(index: number): string {
    const locations = ['San Francisco', 'New York', 'Austin', 'Seattle', 'Boston'];
    return locations[index % locations.length];
  }

  private generateCollaboratorIds(currentId: string, count: number, maxEmployees: number): string[] {
    const collaborators: string[] = [];
    const current = parseInt(currentId);
    
    for (let i = 0; i < count && collaborators.length < count; i++) {
      let collaboratorId = Math.floor(Math.random() * maxEmployees) + 1;
      
      // Don't include self
      if (collaboratorId === current) {
        collaboratorId = (collaboratorId % maxEmployees) + 1;
      }
      
      const id = collaboratorId.toString();
      if (!collaborators.includes(id)) {
        collaborators.push(id);
      }
    }
    
    return collaborators;
  }
}
