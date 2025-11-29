import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  Employee,
  MockData,
  NetworkGraph,
  NetworkNode,
  NetworkLink,
  EmployeeDetail,
} from './domain/entities/employee.interface';

@Injectable()
export class DataService {
  private mockData: MockData;

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    // Try multiple paths to handle both dev and production builds
    const possiblePaths = [
      path.join(__dirname, '../data/mock-data.json'), // Production (dist folder)
      path.join(process.cwd(), 'src/data/mock-data.json'), // Development
      path.join(__dirname, '../../src/data/mock-data.json'), // Alternative
    ];

    let dataPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        dataPath = possiblePath;
        break;
      }
    }

    if (!dataPath) {
      throw new Error(
        `Could not find mock-data.json. Tried: ${possiblePaths.join(', ')}`,
      );
    }

    const rawData = fs.readFileSync(dataPath, 'utf-8');
    this.mockData = JSON.parse(rawData) as MockData;
  }

  getAllEmployees(): Employee[] {
    return this.mockData.employees;
  }

  getEmployeeById(id: string): Employee | undefined {
    return this.mockData.employees.find((emp) => emp.id === id);
  }

  getNetworkGraph(): NetworkGraph {
    const nodes: NetworkNode[] = this.mockData.employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar,
      burnout_risk: emp.burnout_risk,
      impact_score: emp.impact_score,
    }));

    const links: NetworkLink[] = this.mockData.relationships.map((rel) => ({
      source: rel.source_id,
      target: rel.target_id,
      strength: rel.strength,
      type: rel.type,
    }));

    return { nodes, links };
  }

  getEmployeeDetail(id: string): EmployeeDetail | null {
    const employee = this.getEmployeeById(id);
    if (!employee) {
      return null;
    }

    const burnoutScore = this.calculateBurnoutScore(employee);
    const impactScore = this.calculateImpactScore(employee);
    const aiSummary = this.generateAISummary(employee, burnoutScore, impactScore);

    return {
      employee,
      ai_summary: aiSummary,
      calculated_burnout_score: burnoutScore,
      calculated_impact_score: impactScore,
    };
  }

  private calculateBurnoutScore(employee: Employee): number {
    let score = 0;
    const baseRisk = employee.burnout_risk;

    // Base score from risk level
    if (baseRisk === 'high') {
      score += 40;
    } else if (baseRisk === 'medium' || baseRisk === 'med') {
      score += 25;
    } else {
      score += 10;
    }

    // Analyze commit timestamps (late night commits = higher burnout)
    const lateNightCommits = employee.commit_logs.filter((commit) => {
      const hour = new Date(commit.timestamp).getUTCHours();
      return hour >= 22 || hour <= 3; // 10 PM - 3 AM
    }).length;

    score += Math.min(lateNightCommits * 8, 30); // Max 30 points for late commits

    // Analyze chat sentiment (negative sentiment = higher burnout)
    const negativeChats = employee.chat_logs.filter(
      (log) => log.sentiment === 'negative',
    ).length;
    score += negativeChats * 5;

    // High number of commits in short time = potential overwork
    if (employee.commit_logs.length > 10) {
      score += 10;
    }

    return Math.min(Math.round(score), 100);
  }

  private calculateImpactScore(employee: Employee): number {
    let score = employee.impact_score; // Start with base score

    // High complexity tasks boost impact
    const highComplexityTasks = employee.jira_tickets.filter(
      (ticket) => ticket.complexity === 'high' && ticket.status === 'done',
    ).length;
    score += highComplexityTasks * 5;

    // Code volume and quality indicators
    const totalLinesAdded = employee.commit_logs.reduce(
      (sum, commit) => sum + commit.lines_added,
      0,
    );
    const totalFilesChanged = employee.commit_logs.reduce(
      (sum, commit) => sum + commit.files_changed,
      0,
    );

    // Significant code contributions
    if (totalLinesAdded > 1000) {
      score += 5;
    }
    if (totalFilesChanged > 20) {
      score += 5;
    }

    // Positive sentiment in chats suggests good collaboration
    const positiveChats = employee.chat_logs.filter(
      (log) => log.sentiment === 'positive',
    ).length;
    score += Math.min(positiveChats * 2, 10);

    // Completion rate
    const completedTasks = employee.jira_tickets.filter(
      (ticket) => ticket.status === 'done',
    ).length;
    const totalTasks = employee.jira_tickets.length;
    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100;
      score += Math.round(completionRate * 0.1);
    }

    return Math.min(Math.round(score), 100);
  }

  private generateAISummary(
    employee: Employee,
    burnoutScore: number,
    impactScore: number,
  ): string {
    const name = employee.name;
    const role = employee.role;
    const skills = employee.skills.slice(0, 3).join(', ');

    // Special handling for Sarah (Hidden Gem)
    if (name === 'Sarah Chen') {
      return `${name} is a hidden gem in the engineering team. Despite working quietly in the background, ${name} consistently delivers high-impact work with ${impactScore}% impact score. ${name} tackles complex ${role} challenges, particularly excelling in ${skills}. However, with a burnout risk of ${burnoutScore}%, ${name} frequently works late nights (${employee.commit_logs.filter((c) => {
        const hour = new Date(c.timestamp).getUTCHours();
        return hour >= 22 || hour <= 3;
      }).length} late-night commits detected), taking on critical tasks that others avoid. ${name} deserves recognition and support to prevent potential burnout.`;
    }

    // Special handling for Kevin (Low Impact)
    if (name === 'Kevin Martinez') {
      return `${name} is an active team member who communicates frequently and maintains positive team morale. However, ${name}'s impact score of ${impactScore}% reflects a focus on lower-complexity tasks (${employee.jira_tickets.filter((t) => t.complexity === 'low').length} low-complexity tickets completed). While ${name} contributes to the team's ${role} work, there's potential for growth by taking on more challenging assignments. Burnout risk is low at ${burnoutScore}%, indicating good work-life balance.`;
    }

    // Generic summaries based on scores
    let summary = `${name} is a ${role} with strong skills in ${skills}. `;

    if (impactScore >= 80) {
      summary += `${name} demonstrates exceptional impact (${impactScore}%) through high-complexity work and significant code contributions. `;
    } else if (impactScore >= 60) {
      summary += `${name} shows solid performance with an impact score of ${impactScore}%. `;
    } else {
      summary += `${name} has an impact score of ${impactScore}% and could benefit from more challenging assignments. `;
    }

    if (burnoutScore >= 70) {
      summary += `⚠️ High burnout risk (${burnoutScore}%) detected - ${name} frequently works late hours and may need support to maintain sustainable productivity.`;
    } else if (burnoutScore >= 40) {
      summary += `Moderate burnout risk (${burnoutScore}%) - ${name} should monitor work-life balance.`;
    } else {
      summary += `Low burnout risk (${burnoutScore}%) indicates good work-life balance.`;
    }

    return summary;
  }
}

