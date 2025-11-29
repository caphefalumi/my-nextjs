import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DataService } from './data.service';
import type { NetworkGraph, EmployeeDetail } from './domain/entities/employee.interface';

@Controller('api')
export class EmployeesController {
  constructor(private readonly dataService: DataService) {}

  @Get('dashboard')
  getDashboard(): NetworkGraph {
    return this.dataService.getNetworkGraph();
  }

  @Get('employee/:id')
  getEmployee(@Param('id') id: string): EmployeeDetail {
    const employeeDetail = this.dataService.getEmployeeDetail(id);
    
    if (!employeeDetail) {
      throw new HttpException(
        `Employee with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return employeeDetail;
  }
}

