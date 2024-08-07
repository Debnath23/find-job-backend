import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class BookingEntity extends Document {
  @Prop()
  userId: Types.ObjectId;

  @Prop()
  roomName: string;

  @Prop()
  roomNumber: number;

  @Prop({ required: true })
  bookingDate: Date;

  _id?: Types.ObjectId;
}

const BookingEntitySchema = SchemaFactory.createForClass(BookingEntity);

BookingEntitySchema.pre('save', function (next) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (this.bookingDate < today) {
    const error = new Error('Cannot book for past dates.');
    return next(error);
  }

  next();
});

export { BookingEntitySchema };
