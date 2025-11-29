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
  AnalyticsResponse,
  AnalyticsOverview,
  DepartmentStats,
  BurnoutDistribution,
  LocationBreakdown,
  TrendData,
  InsightsResponse,
  Recommendation,
  AtRiskEmployee,
  PerformanceResponse,
  LeaderboardEntry,
  DepartmentRanking,
  EmployeeListItem,
  EmployeeListResponse,
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

  // Get department from role
  private getDepartment(role: string): string {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('backend') || roleLower.includes('frontend') || roleLower.includes('full stack')) {
      return 'Engineering';
    }
    if (roleLower.includes('devops') || roleLower.includes('sre')) {
      return 'DevOps';
    }
    if (roleLower.includes('qa') || roleLower.includes('test')) {
      return 'QA';
    }
    if (roleLower.includes('lead') || roleLower.includes('manager')) {
      return 'Leadership';
    }
    if (roleLower.includes('design') || roleLower.includes('ux')) {
      return 'Design';
    }
    return 'Engineering';
  }

  // Analytics API
  getAnalytics(): AnalyticsResponse {
    const employees = this.mockData.employees;
    
    // Overview
    const overview: AnalyticsOverview = {
      totalEmployees: employees.length,
      avgImpactScore: Math.round(employees.reduce((sum, e) => sum + e.impact_score, 0) / employees.length),
      highPerformers: employees.filter(e => e.impact_score >= 80).length,
      burnoutAlerts: employees.filter(e => e.burnout_risk === 'high').length,
      avgTenure: Math.round(employees.reduce((sum, e) => sum + e.Tenure_Months, 0) / employees.length),
      totalTasksCompleted: employees.reduce((sum, e) => sum + e.Tasks_Completed_Count, 0),
    };

    // Department stats
    const deptMap = new Map<string, Employee[]>();
    employees.forEach(e => {
      const dept = this.getDepartment(e.role);
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(e);
    });

    const departments: DepartmentStats[] = Array.from(deptMap.entries()).map(([dept, emps]) => ({
      department: dept,
      count: emps.length,
      avgImpact: Math.round(emps.reduce((sum, e) => sum + e.impact_score, 0) / emps.length),
      avgBurnout: Math.round(emps.filter(e => e.burnout_risk === 'high').length / emps.length * 100),
    }));

    // Burnout distribution
    const burnoutCounts = { low: 0, medium: 0, high: 0 };
    employees.forEach(e => {
      const risk = e.burnout_risk === 'med' ? 'medium' : e.burnout_risk;
      burnoutCounts[risk as keyof typeof burnoutCounts]++;
    });
    
    const burnoutDistribution: BurnoutDistribution[] = [
      { level: 'Low', count: burnoutCounts.low, percentage: Math.round(burnoutCounts.low / employees.length * 100) },
      { level: 'Medium', count: burnoutCounts.medium, percentage: Math.round(burnoutCounts.medium / employees.length * 100) },
      { level: 'High', count: burnoutCounts.high, percentage: Math.round(burnoutCounts.high / employees.length * 100) },
    ];

    // Level distribution
    const levelMap = new Map<string, number>();
    employees.forEach(e => {
      const level = e.Level || 'Unknown';
      levelMap.set(level, (levelMap.get(level) || 0) + 1);
    });
    
    const levelDistribution: LocationBreakdown[] = Array.from(levelMap.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => a.level.localeCompare(b.level));

    // Trends (mock monthly data)
    const trends: TrendData[] = [
      { month: 'Jan', headcount: employees.length - 2, avgPerformance: 72 },
      { month: 'Feb', headcount: employees.length - 1, avgPerformance: 74 },
      { month: 'Mar', headcount: employees.length, avgPerformance: 75 },
      { month: 'Apr', headcount: employees.length, avgPerformance: overview.avgImpactScore },
    ];

    return { overview, departments, burnoutDistribution, levelDistribution, trends };
  }

  // Insights API
  getInsights(): InsightsResponse {
    const employees = this.mockData.employees;
    const recommendations: Recommendation[] = [];

    // Find hidden gems (high impact, low recognition)
    const hiddenGems = employees
      .filter(e => e.impact_score >= 80 && e.burnout_risk === 'high')
      .map(e => this.getEmployeeDetail(e.id)!)
      .filter(Boolean);

    // Generate recommendations
    employees.forEach(e => {
      const burnoutScore = this.calculateBurnoutScore(e);
      
      // High burnout risk warning
      if (e.burnout_risk === 'high' || burnoutScore >= 70) {
        recommendations.push({
          id: `rec-burnout-${e.id}`,
          type: 'warning',
          priority: 'high',
          title: `Burnout Risk Alert: ${e.name}`,
          description: `${e.name} shows signs of burnout with ${e.Late_Night_Commits} late night commits and ${e.Vacation_Days_Unused} unused vacation days. Consider workload redistribution.`,
          employeeId: e.id,
          employeeName: e.name,
          actionUrl: `/personnel/${e.id}`,
        });
      }

      // Recognition for high performers
      if (e.impact_score >= 85 && e.Peer_Review_Score >= 4.5) {
        recommendations.push({
          id: `rec-recognition-${e.id}`,
          type: 'recognition',
          priority: 'medium',
          title: `Recognize ${e.name}'s Contributions`,
          description: `${e.name} has an impact score of ${e.impact_score}% and peer review score of ${e.Peer_Review_Score}. Consider public recognition or promotion discussion.`,
          employeeId: e.id,
          employeeName: e.name,
          actionUrl: `/personnel/${e.id}`,
        });
      }

      // Growth opportunity for lower performers
      if (e.impact_score < 50 && e.Avg_Task_Complexity < 2.5) {
        recommendations.push({
          id: `rec-growth-${e.id}`,
          type: 'growth',
          priority: 'medium',
          title: `Growth Opportunity: ${e.name}`,
          description: `${e.name} primarily handles low-complexity tasks. Consider assigning mentorship or stretch assignments to accelerate growth.`,
          employeeId: e.id,
          employeeName: e.name,
          actionUrl: `/personnel/${e.id}`,
        });
      }
    });

    // Support recommendations for team-wide issues
    const highBurnoutCount = employees.filter(e => e.burnout_risk === 'high').length;
    if (highBurnoutCount >= 2) {
      recommendations.push({
        id: 'rec-team-burnout',
        type: 'support',
        priority: 'high',
        title: 'Team-Wide Burnout Concern',
        description: `${highBurnoutCount} team members show high burnout risk. Consider team wellness initiatives, workload review, or hiring additional resources.`,
        actionUrl: '/analytics',
      });
    }

    // At-risk employees
    const atRiskEmployees: AtRiskEmployee[] = employees
      .filter(e => e.burnout_risk === 'high' || this.calculateBurnoutScore(e) >= 60)
      .map(e => {
        const riskFactors: string[] = [];
        if (e.Late_Night_Commits > 5) riskFactors.push(`${e.Late_Night_Commits} late night commits`);
        if (e.Weekend_Activity_Log > 3) riskFactors.push(`${e.Weekend_Activity_Log} weekend activities`);
        if (e.Vacation_Days_Unused > 8) riskFactors.push(`${e.Vacation_Days_Unused} unused vacation days`);
        if (e.Sentiment_Trend < 0) riskFactors.push('Declining sentiment trend');

        return {
          id: e.id,
          name: e.name,
          role: e.role,
          avatar: e.avatar,
          burnoutScore: this.calculateBurnoutScore(e),
          riskFactors,
          recommendation: riskFactors.length > 2 
            ? 'Immediate intervention recommended' 
            : 'Monitor closely and offer support',
        };
      })
      .sort((a, b) => b.burnoutScore - a.burnoutScore);

    return { 
      recommendations: recommendations.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }), 
      atRiskEmployees, 
      hiddenGems 
    };
  }

  // Performance API
  getPerformance(): PerformanceResponse {
    const employees = this.mockData.employees;

    // Leaderboard sorted by impact score
    const leaderboard: LeaderboardEntry[] = employees
      .map((e, index) => ({
        rank: index + 1,
        id: e.id,
        name: e.name,
        role: e.role,
        avatar: e.avatar,
        impactScore: this.calculateImpactScore(e),
        tasksCompleted: e.Tasks_Completed_Count,
        peerReviewScore: e.Peer_Review_Score,
      }))
      .sort((a, b) => b.impactScore - a.impactScore)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    // Department rankings
    const deptMap = new Map<string, Employee[]>();
    employees.forEach(e => {
      const dept = this.getDepartment(e.role);
      if (!deptMap.has(dept)) deptMap.set(dept, []);
      deptMap.get(dept)!.push(e);
    });

    const departmentRankings: DepartmentRanking[] = Array.from(deptMap.entries())
      .map(([dept, emps]) => {
        const topPerformer = emps.sort((a, b) => b.impact_score - a.impact_score)[0];
        return {
          department: dept,
          avgScore: Math.round(emps.reduce((sum, e) => sum + e.impact_score, 0) / emps.length),
          topPerformer: topPerformer.name,
          employeeCount: emps.length,
        };
      })
      .sort((a, b) => b.avgScore - a.avgScore);

    return { leaderboard, departmentRankings };
  }

  // Employee list with filtering
  getEmployeeList(
    search?: string,
    department?: string,
    burnoutRisk?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ): EmployeeListResponse {
    let employees = this.mockData.employees;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      employees = employees.filter(e => 
        e.name.toLowerCase().includes(searchLower) ||
        e.role.toLowerCase().includes(searchLower) ||
        e.Employee_ID.toLowerCase().includes(searchLower)
      );
    }

    // Filter by department
    if (department && department !== 'all') {
      employees = employees.filter(e => this.getDepartment(e.role) === department);
    }

    // Filter by burnout risk
    if (burnoutRisk && burnoutRisk !== 'all') {
      employees = employees.filter(e => {
        const risk = e.burnout_risk === 'med' ? 'medium' : e.burnout_risk;
        return risk === burnoutRisk;
      });
    }

    // Sort
    if (sortBy) {
      employees = [...employees].sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;

        switch (sortBy) {
          case 'name':
            aVal = a.name;
            bVal = b.name;
            break;
          case 'impact':
          case 'impactScore':
            aVal = a.impact_score;
            bVal = b.impact_score;
            break;
          case 'burnout':
            const riskOrder = { low: 1, med: 2, medium: 2, high: 3 };
            aVal = riskOrder[a.burnout_risk as keyof typeof riskOrder] || 0;
            bVal = riskOrder[b.burnout_risk as keyof typeof riskOrder] || 0;
            break;
          case 'tenure':
            aVal = a.Tenure_Months;
            bVal = b.Tenure_Months;
            break;
        }

        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortOrder === 'desc' ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
        }
        return sortOrder === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
      });
    }

    // Map to list items
    const employeeList: EmployeeListItem[] = employees.map(e => ({
      id: e.id,
      name: e.name,
      email: `${e.name.toLowerCase().replace(' ', '.')}@company.com`,
      role: e.role,
      department: this.getDepartment(e.role),
      avatar: e.avatar,
      impactScore: e.impact_score,
      burnoutRisk: e.burnout_risk === 'med' ? 'medium' : e.burnout_risk,
      level: e.Level,
      location: 'San Francisco',
      joinDate: new Date(Date.now() - e.Tenure_Months * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }));

    return { employees: employeeList, total: employeeList.length };
  }
}

