import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SENSOR_TYPES, type SensorType } from '../../common/constants/sensor-types.constant.js';

export type AlertDocument = HydratedDocument<Alert>;

export const ALERT_DIRECTIONS = ['above', 'below'] as const;
export type AlertDirection = (typeof ALERT_DIRECTIONS)[number];

@Schema({ collection: 'alerts' })
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'Reading', required: true, index: true })
  readingId: Types.ObjectId;

  @Prop({ required: true, index: true })
  sensorId: string;

  @Prop({ required: true, enum: SENSOR_TYPES })
  sensorType: SensorType;

  @Prop({ required: true })
  value: number;

  @Prop({ required: true })
  threshold: number;

  @Prop({ required: true, enum: ALERT_DIRECTIONS })
  direction: AlertDirection;

  @Prop({ required: true, index: true })
  triggeredAt: Date;

  @Prop({ required: true, default: false })
  acknowledged: boolean;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);
