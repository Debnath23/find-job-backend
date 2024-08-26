import { Document, Types } from 'mongoose';
export declare class UsersEntity extends Document {
    username: string;
    email: string;
    password: string;
    applyFor: Types.ObjectId[];
    bookings: Types.ObjectId[];
    usersType: number;
    isActive: boolean;
    _id: Types.ObjectId;
}
export declare const UsersEntitySchema: import("mongoose").Schema<UsersEntity, import("mongoose").Model<UsersEntity, any, any, any, Document<unknown, any, UsersEntity> & UsersEntity & Required<{
    _id: Types.ObjectId;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UsersEntity, Document<unknown, {}, import("mongoose").FlatRecord<UsersEntity>> & import("mongoose").FlatRecord<UsersEntity> & Required<{
    _id: Types.ObjectId;
}>>;
//# sourceMappingURL=users.entity.d.ts.map