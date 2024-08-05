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

const RoomEntitySchema = SchemaFactory.createForClass(RoomEntity);

// RoomEntitySchema.post('save', function (next) {
//   this.availableSeat = this.seatCapacity - this.appliedCandidates.length;

//   if (this.availableSeat <= 0) {
//     const error = new Error('There are no available seates.');
//     return next(error);
//   }

//   next();
// });

// RoomEntitySchema.post('save', async function (doc: RoomEntity) {
//   if (doc.isModified('appliedCandidates')) {
//     const updatedSeatCount = doc.seatCapacity - doc.appliedCandidates.length;
//     await doc.updateOne({ availableSeat: updatedSeatCount }).exec();
//   }
// });

// RoomEntitySchema.pre('save', function (next) {
//   console.log('seatCapacity:', this.seatCapacity);
//   console.log('appliedCandidates length:', this.appliedCandidates.length);

//   const appliedCandidatesLength = Array.isArray(this.appliedCandidates)
//     ? this.appliedCandidates.length
//     : 0;
//   const seatCapacity =
//     typeof this.seatCapacity === 'number' ? this.seatCapacity : 0;

//   this.availableSeat = seatCapacity - appliedCandidatesLength;

//   console.log('calculated availableSeat:', this.availableSeat);

//   if (this.availableSeat < 0 || isNaN(this.availableSeat)) {
//     const error = new Error(
//       'There are no available seats or seat calculation resulted in NaN.',
//     );
//     return next(error);
//   }

//   next();
// });

// RoomEntitySchema.post('save', async function (doc, next) {
//   try {
//     doc.availableSeat = doc.seatCapacity - doc.appliedCandidates.length;
//     await doc.save();
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

RoomEntitySchema.pre('save', function (next) {
  console.log('Pre-save middleware triggered.');

  // Log current state
  console.log('Current seatCapacity:', this.seatCapacity);
  console.log('Current appliedCandidates:', this.appliedCandidates);
  console.log('Current availableSeat:', this.availableSeat);

  // Ensure appliedCandidates is an array and seatCapacity is a number
  const appliedCandidatesLength = Array.isArray(this.appliedCandidates) ? this.appliedCandidates.length : 0;
  const seatCapacity = typeof this.seatCapacity === 'number' ? this.seatCapacity : 0;

  console.log('Calculated appliedCandidatesLength:', appliedCandidatesLength);
  console.log('Calculated seatCapacity:', seatCapacity);

  // Update availableSeat
  this.availableSeat = seatCapacity - appliedCandidatesLength;

  console.log('Updated availableSeat:', this.availableSeat);

  // Check for NaN or invalid availableSeat
  if (this.availableSeat < 0 || isNaN(this.availableSeat)) {
    const error = new Error('There are no available seats or seat calculation resulted in NaN.');
    return next(error);
  }

  next();
});

export { RoomEntitySchema };
