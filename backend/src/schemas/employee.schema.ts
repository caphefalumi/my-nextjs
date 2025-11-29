import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmployeeDocument = Employee & Document;

// Sub-schemas for nested objects
@Schema({ _id: false })
class ChatLog {
  @Prop()
  timestamp: string;

  @Prop()
  message: string;

  @Prop()
  sentiment: string;
}

@Schema({ _id: false })
class JiraTicket {
  @Prop()
  id: string;

  @Prop()
  title: string;

  @Prop()
  complexity: string;

  @Prop()
  status: string;

  @Prop()
  created_at: string;

  @Prop()
  completed_at: string;
}

@Schema({ _id: false })
class CommitLog {
  @Prop()
  hash: string;

  @Prop()
  message: string;

  @Prop()
  timestamp: string;

  @Prop()
  files_changed: number;

  @Prop()
  lines_added: number;

  @Prop()
  lines_deleted: number;
}

@Schema({ _id: false })
class EmployeeStats {
  @Prop({ default: 70 })
  technical: number;

  @Prop({ default: 60 })
  leadership: number;

  @Prop({ default: 75 })
  empathy: number;

  @Prop({ default: 80 })
  velocity: number;

  @Prop({ default: 65 })
  creativity: number;

  @Prop({ default: 85 })
  reliability: number;
}

@Schema({ timestamps: true })
export class Employee {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @Prop({ required: true })
  employeeCode: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  email: string;

  @Prop({ required: true })
  role: string;

  @Prop()
  department: string;

  @Prop()
  team: string;

  @Prop()
  avatar: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop()
  managerId: string;

  @Prop()
  managerName: string;

  @Prop()
  joinDate: string;

  @Prop()
  location: string;

  @Prop({ default: 50 })
  impactScore: number;

  @Prop({ default: 'low' })
  burnoutRisk: string;

  @Prop({ type: [String], default: [] })
  collaborators: string[];

  @Prop({ type: EmployeeStats })
  stats: EmployeeStats;

  @Prop()
  projects: number;

  @Prop()
  tenure: string;

  @Prop()
  recentAchievement: string;

  // CSV fields matching mock data
  @Prop()
  level: string;

  @Prop()
  tenureMonths: number;

  @Prop()
  unassignedTasksPicked: number;

  @Prop()
  helpRequestReplies: number;

  @Prop()
  crossTeamCollaborations: number;

  @Prop()
  criticalIncidentOwnership: number;

  @Prop()
  peerReviewScore: number;

  @Prop()
  architecturalChanges: number;

  @Prop()
  avgTaskComplexity: number;

  @Prop()
  tasksCompletedCount: number;

  @Prop()
  lateNightCommits: number;

  @Prop()
  weekendActivityLog: number;

  @Prop()
  vacationDaysUnused: number;

  @Prop()
  sentimentTrend: number;

  @Prop()
  rawAchievementLog: string;

  // Activity logs
  @Prop({ type: [ChatLog], default: [] })
  chatLogs: ChatLog[];

  @Prop({ type: [JiraTicket], default: [] })
  jiraTickets: JiraTicket[];

  @Prop({ type: [CommitLog], default: [] })
  commitLogs: CommitLog[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Index for faster queries by admin
EmployeeSchema.index({ adminId: 1 });
EmployeeSchema.index({ adminId: 1, employeeCode: 1 }, { unique: true });


// Relationship Schema for galaxy view connections
export type RelationshipDocument = Relationship & Document;

@Schema({ timestamps: true })
export class Relationship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  adminId: Types.ObjectId;

  @Prop({ required: true })
  sourceId: string;

  @Prop({ required: true })
  targetId: string;

  @Prop({ default: 5, min: 1, max: 10 })
  strength: number;

  @Prop({ enum: ['mentorship', 'collaboration', 'recognition', 'support', 'reporting'], default: 'collaboration' })
  type: string;
}

export const RelationshipSchema = SchemaFactory.createForClass(Relationship);

// Index for faster queries
RelationshipSchema.index({ adminId: 1 });
RelationshipSchema.index({ adminId: 1, sourceId: 1, targetId: 1 }, { unique: true });
