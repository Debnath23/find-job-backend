import { Document, Types } from 'mongoose';
export declare class RoomEntity extends Document {
    roomName: string;
    roomNumber: number;
    seatCapacity: number;
    appliedCandidates: Types.ObjectId[];
    _id?: Types.ObjectId;
}
export declare const RoomEntitySchema: import("mongoose").Schema<RoomEntity, import("mongoose").Model<RoomEntity, any, any, any, Document<unknown, any, RoomEntity> & RoomEntity & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, RoomEntity, Document<unknown, {}, import("mongoose").FlatRecord<RoomEntity>> & import("mongoose").FlatRecord<RoomEntity> & Required<{
    _id: Types.ObjectId;
}>>;
//# sourceMappingURL=rooms.entity.d.ts.map