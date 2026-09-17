import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type QueryFilter } from 'mongoose';
import { Reading, type ReadingDocument } from '../database/schemas/reading.schema.js';
import type { QueryReadingsDto } from './dto/query-readings.schema.js';
import type { CreateReadingInput } from './interfaces/reading.interface.js';

export interface ReadingsQueryResult {
  data: ReadingDocument[];
  total: number;
}

@Injectable()
export class ReadingsService {
  private readonly logger = new Logger(ReadingsService.name);

  constructor(@InjectModel(Reading.name) private readonly readingModel: Model<ReadingDocument>) {}

  async create(input: CreateReadingInput): Promise<ReadingDocument> {
    try {
      return await this.readingModel.create({
        sensorId: input.sensorId,
        sensorType: input.sensorType,
        value: input.value,
        unit: input.unit,
        timestamp: new Date(input.timestamp),
        receivedAt: new Date(),
        isAlert: false,
      });
    } catch (err) {
      this.logger.error(`Failed to persist reading for sensor ${input.sensorId}: ${(err as Error).message}`);
      throw err;
    }
  }

  async query(filters: QueryReadingsDto): Promise<ReadingsQueryResult> {
    const mongoFilter: QueryFilter<ReadingDocument> = {};

    if (filters.sensorId) {
      mongoFilter.sensorId = filters.sensorId;
    }
    if (filters.sensorType) {
      mongoFilter.sensorType = filters.sensorType;
    }
    if (filters.onlyAlerts) {
      mongoFilter.isAlert = true;
    }
    if (filters.from || filters.to) {
      mongoFilter.timestamp = {
        ...(filters.from && { $gte: new Date(filters.from) }),
        ...(filters.to && { $lte: new Date(filters.to) }),
      };
    }

    const skip = (filters.page - 1) * filters.limit;

    const [data, total] = await Promise.all([
      this.readingModel.find(mongoFilter).sort({ timestamp: -1 }).skip(skip).limit(filters.limit).exec(),
      this.readingModel.countDocuments(mongoFilter).exec(),
    ]);

    return { data, total };
  }
}
