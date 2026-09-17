import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Alert, AlertSchema } from '../database/schemas/alert.schema.js';
import { AlertsService } from './alerts.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Alert.name, schema: AlertSchema }])],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
