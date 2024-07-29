import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ScheduledMeetingDto } from 'src/dto/usersResponse.dto';

@Schema({ _id: false })
export class scheduledMeetingEntity {
  @Prop()
  scheduledTime: string;

  @Prop()
  meetingLink: string;
}

export const scheduledMeetingSchema = SchemaFactory.createForClass(
  scheduledMeetingEntity,
);

@Schema({ timestamps: true })
export class JobEntity extends Document {
  @Prop()
  phoneNumber: string;

  @Prop()
  address: string;

  @Prop()
  role: string;

  @Prop()
  attachments: string;

  @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  applicationStatus: string;

  @Prop([{ type: Types.ObjectId, ref: 'scheduledMeetingEntity' }])
  scheduledMeeting: ScheduledMeetingDto[];

  // scheduledMeeting: Types.Array<scheduledMeetingEntity>;
}

export const JobEntitySchema = SchemaFactory.createForClass(JobEntity);
