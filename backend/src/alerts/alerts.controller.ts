import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { AlertsService } from './alerts.service.js';
import { queryAlertsSchema, type QueryAlertsDto } from './dto/query-alerts.schema.js';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  async findAll(@Query(new ZodValidationPipe(queryAlertsSchema)) query: QueryAlertsDto) {
    const data = await this.alertsService.query(query);
    return { data };
  }
}
