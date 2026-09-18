import { Module } from '@nestjs/common';
import { AlertsModule } from '../alerts/alerts.module.js';
import { ReadingsModule } from '../readings/readings.module.js';
import { IngestionService } from './ingestion.service.js';

@Module({
  imports: [ReadingsModule, AlertsModule],
  providers: [IngestionService],
})
export class IngestionModule {}
