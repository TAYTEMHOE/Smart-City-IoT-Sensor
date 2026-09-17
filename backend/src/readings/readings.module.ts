import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reading, ReadingSchema } from '../database/schemas/reading.schema.js';
import { ReadingsService } from './readings.service.js';

@Module({
  imports: [MongooseModule.forFeature([{ name: Reading.name, schema: ReadingSchema }])],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
