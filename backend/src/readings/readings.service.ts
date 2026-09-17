import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reading, type ReadingDocument } from '../database/schemas/reading.schema.js';
import type { CreateReadingInput } from './interfaces/reading.interface.js';

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
}
