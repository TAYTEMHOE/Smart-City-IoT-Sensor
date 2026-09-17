import { Module } from '@nestjs/common';
import { ReadingsModule } from '../readings/readings.module.js';
import { IngestionService } from './ingestion.service.js';

@Module({
  imports: [ReadingsModule],
  providers: [IngestionService],
})
export class IngestionModule {}
