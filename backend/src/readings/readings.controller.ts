import { Controller, Get, Query } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { queryReadingsSchema, type QueryReadingsDto } from './dto/query-readings.schema.js';
import { ReadingsService } from './readings.service.js';

@Controller('readings')
export class ReadingsController {
  constructor(private readonly readingsService: ReadingsService) {}

  @Get()
  async findAll(@Query(new ZodValidationPipe(queryReadingsSchema)) query: QueryReadingsDto) {
    const { data, total } = await this.readingsService.query(query);
    return {
      data,
      meta: { total, page: query.page, limit: query.limit },
    };
  }
}
