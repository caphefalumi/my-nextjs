import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  HttpException, 
  HttpStatus, 
  UseInterceptors, 
  UploadedFile 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DataService } from './data.service';
import { PromotionParserService } from './promotion-parser.service';
import type { NetworkGraph, EmployeeDetail } from './domain/entities/employee.interface';
import type { PromotionParserResponse } from './domain/entities/promotion.interface';

@Controller('api')
export class EmployeesController {
  constructor(
    private readonly dataService: DataService,
    private readonly promotionParserService: PromotionParserService,
  ) {}

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

  @Post('promotion-parser')
  @UseInterceptors(FileInterceptor('file'))
  async parsePromotionCSV(
    @UploadedFile() file: Express.Multer.File,
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
      return await this.promotionParserService.parseCSV(file.buffer);
    } catch (error) {
      throw new HttpException(
        `Failed to parse CSV: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

