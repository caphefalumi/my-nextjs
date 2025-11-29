import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { DataService } from './data.service';
import { PromotionParserService } from './promotion-parser.service';

@Module({
  controllers: [EmployeesController],
  providers: [DataService, PromotionParserService],
  exports: [DataService],
})
export class EmployeesModule {}
