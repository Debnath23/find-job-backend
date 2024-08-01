import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { AppliedCandidatesDto } from '../dto/appliedCandidates.dto';

@Schema({ timestamps: true })
export class RoomEntity extends Document {
  @Prop({ required: true })
  roomName: string;

  @Prop({ required: true })
  roomNumber: number;

  @Prop({ required: true })
  seatCapacity: number;

  @Prop()
  availableSeat: number;

  @Prop([{ type: Types.ObjectId, ref: 'ApplyRoomEntity' }])
  appliedCandidates: AppliedCandidatesDto[];
}

export const RoomEntitySchema = SchemaFactory.createForClass(RoomEntity);
