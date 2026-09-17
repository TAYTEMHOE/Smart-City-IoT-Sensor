import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type QueryFilter } from 'mongoose';
import { Alert, type AlertDirection, type AlertDocument } from '../database/schemas/alert.schema.js';
import type { ReadingDocument } from '../database/schemas/reading.schema.js';
import { THRESHOLDS } from './config/thresholds.config.js';
import type { QueryAlertsDto } from './dto/query-alerts.schema.js';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(@InjectModel(Alert.name) private readonly alertModel: Model<AlertDocument>) {}

  /** Evaluates a persisted reading against its sensor type's threshold and, if
   *  crossed, persists an Alert and flags the reading. No-op otherwise. */
  async evaluate(reading: ReadingDocument): Promise<AlertDocument | null> {
    const threshold = THRESHOLDS[reading.sensorType];

    let direction: AlertDirection | undefined;
    let limit: number | undefined;
    if (threshold.max !== undefined && reading.value > threshold.max) {
      direction = 'above';
      limit = threshold.max;
    } else if (threshold.min !== undefined && reading.value < threshold.min) {
      direction = 'below';
      limit = threshold.min;
    }

    if (!direction || limit === undefined) {
      return null;
    }

    try {
      const alert = await this.alertModel.create({
        readingId: reading._id,
        sensorId: reading.sensorId,
        sensorType: reading.sensorType,
        value: reading.value,
        threshold: limit,
        direction,
        triggeredAt: reading.timestamp,
      });
      reading.isAlert = true;
      await reading.save();
      return alert;
    } catch (err) {
      this.logger.error(`Failed to create alert for reading ${reading._id}: ${(err as Error).message}`);
      throw err;
    }
  }

  async query(filters: QueryAlertsDto): Promise<AlertDocument[]> {
    const mongoFilter: QueryFilter<AlertDocument> = {};

    if (filters.sensorId) {
      mongoFilter.sensorId = filters.sensorId;
    }
    if (filters.acknowledged !== undefined) {
      mongoFilter.acknowledged = filters.acknowledged;
    }
    if (filters.from || filters.to) {
      mongoFilter.triggeredAt = {
        ...(filters.from && { $gte: new Date(filters.from) }),
        ...(filters.to && { $lte: new Date(filters.to) }),
      };
    }

    return this.alertModel.find(mongoFilter).sort({ triggeredAt: -1 }).exec();
  }
}
