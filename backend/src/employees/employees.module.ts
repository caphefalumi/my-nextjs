import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { DataService } from './data.service';

@Module({
  controllers: [EmployeesController],
  providers: [DataService],
  exports: [DataService],
})
export class EmployeesModule {}

