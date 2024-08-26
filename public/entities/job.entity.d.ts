import { Document, Types } from 'mongoose';
import { ScheduledMeetingDto } from '../dto/usersResponse.dto';
export declare class scheduledMeetingEntity {
    scheduledTime: string;
    meetingLink: string;
}
export declare const scheduledMeetingSchema: import("mongoose").Schema<scheduledMeetingEntity, import("mongoose").Model<scheduledMeetingEntity, any, any, any, Document<unknown, any, scheduledMeetingEntity> & scheduledMeetingEntity & {
    _id: Types.ObjectId;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, scheduledMeetingEntity, Document<unknown, {}, import("mongoose").FlatRecord<scheduledMeetingEntity>> & import("mongoose").FlatRecord<scheduledMeetingEntity> & {
    _id: Types.ObjectId;
}>;
export declare class JobEntity extends Document {
    phoneNumber: string;
    address: string;
    role: string;
    attachments: string;
    applicationStatus: string;
    scheduledMeeting: ScheduledMeetingDto[];
}
export declare const JobEntitySchema: import("mongoose").Schema<JobEntity, import("mongoose").Model<JobEntity, any, any, any, Document<unknown, any, JobEntity> & JobEntity & Required<{
    _id: unknown;
}>, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, JobEntity, Document<unknown, {}, import("mongoose").FlatRecord<JobEntity>> & import("mongoose").FlatRecord<JobEntity> & Required<{
    _id: unknown;
}>>;
//# sourceMappingURL=job.entity.d.ts.map