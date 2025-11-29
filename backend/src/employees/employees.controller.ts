import { 
  Controller, 
  Get, 
  Post, 
  Delete,
  Param, 
  Query,
  Body,
  HttpException, 
  HttpStatus, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DataService } from './data.service';
import { PromotionParserService } from './promotion-parser.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Employee, EmployeeDocument, Relationship, RelationshipDocument } from '../schemas/employee.schema';
import type { NetworkGraph, EmployeeDetail } from './domain/entities/employee.interface';
import type { PromotionParserResponse } from './domain/entities/promotion.interface';

@Controller('api')
export class EmployeesController {
  constructor(
    private readonly dataService: DataService,
    private readonly promotionParserService: PromotionParserService,
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
    @InjectModel(Relationship.name) private relationshipModel: Model<RelationshipDocument>,
  ) {}

  // Dashboard - Network Graph (uses DB data for authenticated users)
  @Get('dashboard')
  async getDashboard(@CurrentUser('sub') adminId: string): Promise<NetworkGraph> {
    if (!adminId) {
      return this.dataService.getNetworkGraph();
    }

    const employees = await this.employeeModel.find({ adminId: new Types.ObjectId(adminId) });
    
    if (employees.length === 0) {
      return this.dataService.getNetworkGraph();
    }

    // Build network graph from DB employees (matching NetworkNode interface)
    const nodes = employees.map(emp => ({
      id: emp._id.toString(),
      name: emp.name,
      role: emp.role,
      avatar: emp.avatar || `https://i.pravatar.cc/150?u=${emp._id}`,
      burnout_risk: emp.burnoutRisk || 'low',
      impact_score: emp.impactScore || 50,
    }));

    // Fetch relationships from DB
    const relationships = await this.relationshipModel.find({ adminId: new Types.ObjectId(adminId) });
    
    // Build links from relationships (matching NetworkLink interface)
    const links = relationships.map(rel => ({
      source: rel.sourceId,
      target: rel.targetId,
      strength: rel.strength,
      type: rel.type,
    }));

    return { nodes, links };
  }

  // Employee Detail (from DB)
  @Get('employee/:id')
  async getEmployee(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ): Promise<EmployeeDetail> {
    // Try to find in MongoDB first
    if (adminId) {
      try {
        const employee = await this.employeeModel.findOne({
          _id: new Types.ObjectId(id),
          adminId: new Types.ObjectId(adminId),
        });

        if (employee) {
          // Map to Employee interface format
          const emp = {
            id: employee._id.toString(),
            name: employee.name,
            role: employee.role,
            avatar: employee.avatar || `https://i.pravatar.cc/150?u=${employee._id}`,
            skills: employee.skills || [],
            burnout_risk: (employee.burnoutRisk || 'low') as 'low' | 'medium' | 'high',
            impact_score: employee.impactScore || 50,
            chat_logs: employee.chatLogs || [],
            jira_tickets: employee.jiraTickets || [],
            commit_logs: employee.commitLogs || [],
            Employee_ID: employee.employeeCode,
            Current_Role: employee.role,
            Level: employee.level || 'L3',
            Tenure_Months: employee.tenureMonths || 0,
            Unassigned_Tasks_Picked: employee.unassignedTasksPicked || 0,
            Help_Request_Replies: employee.helpRequestReplies || 0,
            Cross_Team_Collaborations: employee.crossTeamCollaborations || 0,
            Critical_Incident_Ownership: employee.criticalIncidentOwnership || 0,
            Peer_Review_Score: employee.peerReviewScore || 3.5,
            Architectural_Changes: employee.architecturalChanges || 0,
            Avg_Task_Complexity: employee.avgTaskComplexity || 2.0,
            Tasks_Completed_Count: employee.tasksCompletedCount || 0,
            Late_Night_Commits: employee.lateNightCommits || 0,
            Weekend_Activity_Log: employee.weekendActivityLog || 0,
            Vacation_Days_Unused: employee.vacationDaysUnused || 0,
            Sentiment_Trend: employee.sentimentTrend || 0,
            Raw_Achievement_Log: employee.rawAchievementLog || '',
          };

          return {
            employee: emp as any,
            ai_summary: `${employee.name} is a ${employee.role} with ${employee.tenureMonths || 0} months of tenure.`,
            calculated_burnout_score: employee.burnoutRisk === 'high' ? 80 : employee.burnoutRisk === 'medium' ? 50 : 20,
            calculated_impact_score: employee.impactScore || 50,
          };
        }
      } catch {
        // Invalid ObjectId, fall through to mock data
      }
    }

    // Fallback to mock data
    const employeeDetail = this.dataService.getEmployeeDetail(id);
    
    if (!employeeDetail) {
      throw new HttpException(
        `Employee with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return employeeDetail;
  }

  // Get all employees for current admin
  @Get('employees')
  async getEmployees(
    @CurrentUser('sub') adminId: string,
    @Query('search') search?: string,
    @Query('department') department?: string,
  ) {
    const query: any = { adminId: new Types.ObjectId(adminId) };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeCode: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) {
      query.department = department;
    }

    const employees = await this.employeeModel.find(query);

    return {
      employees: employees.map(emp => ({
        id: emp._id.toString(),
        employeeCode: emp.employeeCode,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        department: emp.department,
        team: emp.team,
        impactScore: emp.impactScore,
        burnoutRisk: emp.burnoutRisk,
      })),
      total: employees.length,
    };
  }

  // Upload and parse CSV, save to MongoDB
  @Post('promotion-parser')
  @UseInterceptors(FileInterceptor('file'))
  async parsePromotionCSV(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser('sub') adminId: string,
  ): Promise<PromotionParserResponse> {
    if (!file) {
      throw new HttpException(
        'CSV file is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!file.originalname.endsWith('.csv')) {
      throw new HttpException(
        'File must be a CSV',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const parsed = await this.promotionParserService.parseCSV(file.buffer);

      // Save employees to MongoDB with admin reference
      if (adminId) {
        const adminObjectId = new Types.ObjectId(adminId);

        // Delete existing employees for this admin (replace mode)
        await this.employeeModel.deleteMany({ adminId: adminObjectId });

        // Create new employees
        const employeeDocs = parsed.employees.map(emp => ({
          adminId: adminObjectId,
          employeeCode: emp.employeeCode,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          department: emp.department,
          team: emp.team,
          managerId: emp.managerId,
          joinDate: emp.joinDate,
          location: emp.location,
          impactScore: emp.impactScore,
          burnoutRisk: emp.burnoutRisk,
          collaborators: emp.collaborators,
          stats: parsed.employeeDetails[emp.id]?.stats,
          projects: parsed.employeeDetails[emp.id]?.projects,
          tenure: parsed.employeeDetails[emp.id]?.tenure,
          recentAchievement: parsed.employeeDetails[emp.id]?.recentAchievement,
        }));

        const savedEmployees = await this.employeeModel.insertMany(employeeDocs);

        // Return with MongoDB IDs
        return {
          employees: savedEmployees.map(emp => ({
            id: emp._id.toString(),
            employeeCode: emp.employeeCode,
            name: emp.name,
            email: emp.email,
            role: emp.role,
            department: emp.department,
            team: emp.team || '',
            managerId: emp.managerId || null,
            joinDate: emp.joinDate || '',
            location: emp.location || '',
            impactScore: emp.impactScore,
            burnoutRisk: emp.burnoutRisk,
            collaborators: emp.collaborators || [],
          })),
          employeeDetails: savedEmployees.reduce((acc, emp) => {
            acc[emp._id.toString()] = {
              id: emp._id.toString(),
              employeeCode: emp.employeeCode,
              name: emp.name,
              email: emp.email,
              role: emp.role,
              department: emp.department,
              team: emp.team || '',
              managerId: emp.managerId || null,
              managerName: null,
              joinDate: emp.joinDate || '',
              location: emp.location || '',
              impactScore: emp.impactScore,
              burnoutRisk: emp.burnoutRisk,
              stats: emp.stats || {
                technical: 70,
                leadership: 60,
                empathy: 75,
                velocity: 80,
                creativity: 65,
                reliability: 85,
              },
              projects: emp.projects || 0,
              collaborators: emp.collaborators?.length || 0,
              tenure: emp.tenure || '0 months',
              recentAchievement: emp.recentAchievement,
            };
            return acc;
          }, {}),
        };
      }

      return parsed;
    } catch (error) {
      throw new HttpException(
        `Failed to parse CSV: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete an employee
  @Delete('employee/:id')
  async deleteEmployee(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    const result = await this.employeeModel.deleteOne({
      _id: new Types.ObjectId(id),
      adminId: new Types.ObjectId(adminId),
    });

    if (result.deletedCount === 0) {
      throw new HttpException('Employee not found', HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }

  // ============== RELATIONSHIPS ==============

  // Get all relationships for current admin
  @Get('relationships')
  async getRelationships(@CurrentUser('sub') adminId: string) {
    const relationships = await this.relationshipModel.find({
      adminId: new Types.ObjectId(adminId),
    });

    return relationships.map(rel => ({
      id: rel._id.toString(),
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      strength: rel.strength,
      type: rel.type,
    }));
  }

  // Create a new relationship
  @Post('relationships')
  async createRelationship(
    @CurrentUser('sub') adminId: string,
    @Body() body: { sourceId: string; targetId: string; strength?: number; type?: string },
  ) {
    const { sourceId, targetId, strength = 5, type = 'collaboration' } = body;

    if (!sourceId || !targetId) {
      throw new HttpException('sourceId and targetId are required', HttpStatus.BAD_REQUEST);
    }

    // Verify both employees exist and belong to admin
    const adminObjectId = new Types.ObjectId(adminId);
    const [source, target] = await Promise.all([
      this.employeeModel.findOne({ _id: new Types.ObjectId(sourceId), adminId: adminObjectId }),
      this.employeeModel.findOne({ _id: new Types.ObjectId(targetId), adminId: adminObjectId }),
    ]);

    if (!source || !target) {
      throw new HttpException('One or both employees not found', HttpStatus.NOT_FOUND);
    }

    // Check if relationship already exists
    const existing = await this.relationshipModel.findOne({
      adminId: adminObjectId,
      sourceId,
      targetId,
    });

    if (existing) {
      // Update existing
      existing.strength = strength;
      existing.type = type;
      await existing.save();
      return {
        id: existing._id.toString(),
        sourceId: existing.sourceId,
        targetId: existing.targetId,
        strength: existing.strength,
        type: existing.type,
      };
    }

    // Create new relationship
    const relationship = await this.relationshipModel.create({
      adminId: adminObjectId,
      sourceId,
      targetId,
      strength,
      type,
    });

    return {
      id: relationship._id.toString(),
      sourceId: relationship.sourceId,
      targetId: relationship.targetId,
      strength: relationship.strength,
      type: relationship.type,
    };
  }

  // Delete a relationship
  @Delete('relationships/:id')
  async deleteRelationship(
    @Param('id') id: string,
    @CurrentUser('sub') adminId: string,
  ) {
    const result = await this.relationshipModel.deleteOne({
      _id: new Types.ObjectId(id),
      adminId: new Types.ObjectId(adminId),
    });

    if (result.deletedCount === 0) {
      throw new HttpException('Relationship not found', HttpStatus.NOT_FOUND);
    }

    return { success: true };
  }

  // Bulk create relationships (for import)
  @Post('relationships/bulk')
  async bulkCreateRelationships(
    @CurrentUser('sub') adminId: string,
    @Body() body: { relationships: Array<{ sourceId: string; targetId: string; strength?: number; type?: string }> },
  ) {
    const adminObjectId = new Types.ObjectId(adminId);

    // Delete existing relationships for this admin
    await this.relationshipModel.deleteMany({ adminId: adminObjectId });

    // Create new relationships
    const docs = body.relationships.map(rel => ({
      adminId: adminObjectId,
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      strength: rel.strength || 5,
      type: rel.type || 'collaboration',
    }));

    const created = await this.relationshipModel.insertMany(docs);

    return created.map(rel => ({
      id: rel._id.toString(),
      sourceId: rel.sourceId,
      targetId: rel.targetId,
      strength: rel.strength,
      type: rel.type,
    }));
  }
}

