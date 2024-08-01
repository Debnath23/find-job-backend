import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RoomEntity extends Document {
  @Prop({ unique: true, required: true })
  roomName: string;

  @Prop({ unique: true, required: true })
  roomNumber: number;

  @Prop({ required: true })
  seatCapacity: number;

  @Prop()
  availableSeat: number;

  @Prop([{ type: Types.ObjectId, ref: 'ApplyRoomEntity' }])
  appliedCandidates: Types.ObjectId[];
}

export const RoomEntitySchema = SchemaFactory.createForClass(RoomEntity);
