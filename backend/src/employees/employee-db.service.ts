import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee, EmployeeDocument, Relationship, RelationshipDocument } from '../schemas/employee.schema';
import type { PromotionEmployee, Relationship as RelationshipInterface } from './domain/entities/promotion.interface';

@Injectable()
export class EmployeeDbService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Relationship.name) private relationshipModel: Model<RelationshipDocument>,
  ) {}

  // Save employees from CSV upload
  async saveEmployees(adminId: string, employees: PromotionEmployee[]): Promise<void> {
    const adminObjectId = new Types.ObjectId(adminId);
    
    // Clear existing employees for this admin
    await this.employeeModel.deleteMany({ adminId: adminObjectId });
    
    // Map promotion employees to DB schema
    const employeeDocs = employees.map((emp) => ({
      adminId: adminObjectId,
      employeeCode: emp.Employee_ID,
      name: emp.name,
      email: `${emp.name.toLowerCase().replace(' ', '.')}@company.com`,
      role: emp.role || emp.Current_Role,
      department: this.getDepartment(emp.role || emp.Current_Role),
      team: this.getDepartment(emp.role || emp.Current_Role),
      avatar: emp.avatar,
      skills: emp.skills || [],
      impactScore: emp.impact_score,
      burnoutRisk: emp.burnout_risk,
      level: emp.Level,
      tenureMonths: emp.Tenure_Months,
      unassignedTasksPicked: emp.Unassigned_Tasks_Picked,
      helpRequestReplies: emp.Help_Request_Replies,
      crossTeamCollaborations: emp.Cross_Team_Collaborations,
      criticalIncidentOwnership: emp.Critical_Incident_Ownership,
      peerReviewScore: emp.Peer_Review_Score,
      architecturalChanges: emp.Architectural_Changes,
      avgTaskComplexity: emp.Avg_Task_Complexity,
      tasksCompletedCount: emp.Tasks_Completed_Count,
      lateNightCommits: emp.Late_Night_Commits,
      weekendActivityLog: emp.Weekend_Activity_Log,
      vacationDaysUnused: emp.Vacation_Days_Unused,
      sentimentTrend: emp.Sentiment_Trend,
      rawAchievementLog: emp.Raw_Achievement_Log,
      chatLogs: emp.chat_logs || [],
      jiraTickets: emp.jira_tickets || [],
      commitLogs: emp.commit_logs || [],
    }));
    
    await this.employeeModel.insertMany(employeeDocs);
  }

  // Save relationships
  async saveRelationships(adminId: string, relationships: RelationshipInterface[]): Promise<void> {
    const adminObjectId = new Types.ObjectId(adminId);
    
    // Clear existing relationships for this admin
    await this.relationshipModel.deleteMany({ adminId: adminObjectId });
    
    const relationshipDocs = relationships.map((rel) => ({
      adminId: adminObjectId,
      sourceId: rel.source_id,
      targetId: rel.target_id,
      strength: rel.strength,
      type: rel.type,
    }));
    
    await this.relationshipModel.insertMany(relationshipDocs);
  }

  // Get all employees for admin
  async getEmployees(adminId: string): Promise<PromotionEmployee[]> {
    const adminObjectId = new Types.ObjectId(adminId);
    const employees = await this.employeeModel.find({ adminId: adminObjectId }).exec();
    
    return employees.map((emp, idx) => ({
      id: (idx + 1).toString(),
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar,
      skills: emp.skills,
      burnout_risk: emp.burnoutRisk as 'low' | 'medium' | 'high',
      impact_score: emp.impactScore,
      Employee_ID: emp.employeeCode,
      Current_Role: emp.role,
      Level: emp.level,
      Tenure_Months: emp.tenureMonths,
      Unassigned_Tasks_Picked: emp.unassignedTasksPicked,
      Help_Request_Replies: emp.helpRequestReplies,
      Cross_Team_Collaborations: emp.crossTeamCollaborations,
      Critical_Incident_Ownership: emp.criticalIncidentOwnership,
      Peer_Review_Score: emp.peerReviewScore,
      Architectural_Changes: emp.architecturalChanges,
      Avg_Task_Complexity: emp.avgTaskComplexity,
      Tasks_Completed_Count: emp.tasksCompletedCount,
      Late_Night_Commits: emp.lateNightCommits,
      Weekend_Activity_Log: emp.weekendActivityLog,
      Vacation_Days_Unused: emp.vacationDaysUnused,
      Sentiment_Trend: emp.sentimentTrend,
      Raw_Achievement_Log: emp.rawAchievementLog,
      chat_logs: emp.chatLogs as any[],
      jira_tickets: emp.jiraTickets as any[],
      commit_logs: emp.commitLogs as any[],
    }));
  }

  // Get relationships for admin
  async getRelationships(adminId: string): Promise<RelationshipInterface[]> {
    const adminObjectId = new Types.ObjectId(adminId);
    const relationships = await this.relationshipModel.find({ adminId: adminObjectId }).exec();
    
    return relationships.map((rel) => ({
      source_id: rel.sourceId,
      target_id: rel.targetId,
      strength: rel.strength,
      type: rel.type as 'mentorship' | 'collaboration' | 'recognition' | 'support',
    }));
  }

  // Check if admin has uploaded data
  async hasData(adminId: string): Promise<boolean> {
    const adminObjectId = new Types.ObjectId(adminId);
    const count = await this.employeeModel.countDocuments({ adminId: adminObjectId });
    return count > 0;
  }

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
}
