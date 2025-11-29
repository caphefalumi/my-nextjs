import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesController } from './employees.controller';
import { DataService } from './data.service';
import { PromotionParserService } from './promotion-parser.service';
import { Employee, EmployeeSchema, Relationship, RelationshipSchema } from '../schemas/employee.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Employee.name, schema: EmployeeSchema },
      { name: Relationship.name, schema: RelationshipSchema },
    ]),
  ],
  controllers: [EmployeesController],
  providers: [DataService, PromotionParserService],
  exports: [DataService],
})
export class EmployeesModule {}

