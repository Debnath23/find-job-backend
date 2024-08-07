import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RoomEntity extends Document {
  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true })
  roomNumber: number;

  @Prop({ required: true })
  seatCapacity: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Booking' }], default: [] })
  appliedCandidates: Types.ObjectId[];

  _id?: Types.ObjectId;
}

export const RoomEntitySchema = SchemaFactory.createForClass(RoomEntity);
