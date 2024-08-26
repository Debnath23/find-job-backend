import { Document, Types } from 'mongoose';
export declare class BookingEntity extends Document {
    userId: Types.ObjectId;
    roomName: string;
    roomNumber: number;
    bookingDate: Date;
    _id?: Types.ObjectId;
}
declare const BookingEntitySchema: import("mongoose").Schema<BookingEntity, import("mongoose").Model<BookingEntity, any, any, any, Document<unknown, any, BookingEntity> & BookingEntity & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, BookingEntity, Document<unknown, {}, import("mongoose").FlatRecord<BookingEntity>> & import("mongoose").FlatRecord<BookingEntity> & Required<{
    _id: Types.ObjectId;
}>>;
export { BookingEntitySchema };
//# sourceMappingURL=booking.entity.d.ts.map