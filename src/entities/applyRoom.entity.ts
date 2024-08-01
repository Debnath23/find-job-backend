import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ApplyRoomEntity extends Document {
  @Prop({ required: true })
  username: string;
}

export const ApplyRoomEntitySchema =
  SchemaFactory.createForClass(ApplyRoomEntity);
