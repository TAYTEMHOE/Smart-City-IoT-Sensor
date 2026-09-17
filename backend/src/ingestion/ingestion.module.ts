import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service.js';

@Module({
  providers: [IngestionService],
})
export class IngestionModule {}
