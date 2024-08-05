import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ApplyRoomEntity extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  roomNumber: number;

  @Prop({ required: true })
  bookingDate: Date;
}

// @Schema({ timestamps: true })
// export class ApplyRoomEntity extends Document {
//   @Prop({ type: Types.ObjectId, ref: 'RoomEntity', required: true })
//   roomNumber: Types.ObjectId;
  
//   @Prop({ required: true })
//   username: string;

//   @Prop({ required: true })
//   bookingDate: Date;
// }

const ApplyRoomEntitySchema = SchemaFactory.createForClass(ApplyRoomEntity);

ApplyRoomEntitySchema.pre('save', function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.bookingDate < today) {
    const error = new Error('Cannot book for past dates.');
    return next(error);
  }

  next();
});

export { ApplyRoomEntitySchema };
