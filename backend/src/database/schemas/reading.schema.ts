import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { SENSOR_TYPES, type SensorType } from '../../common/constants/sensor-types.constant.js';

export type ReadingDocument = HydratedDocument<Reading>;

@Schema({ collection: 'readings' })
export class Reading {
  @Prop({ required: true, index: true })
  sensorId: string;

  @Prop({ required: true, enum: SENSOR_TYPES, index: true })
  sensorType: SensorType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  unit: string;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ required: true })
  receivedAt: Date;

  @Prop({ required: true, default: false, index: true })
  isAlert: boolean;
}

export const ReadingSchema = SchemaFactory.createForClass(Reading);
