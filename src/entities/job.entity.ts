import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ScheduledMeetingDto } from '../dto/usersResponse.dto';

@Schema({ _id: false })
export class scheduledMeetingEntity {
  @Prop({required: true})
  scheduledTime: string;

  @Prop({required: true})
  meetingLink: string;
}

export const scheduledMeetingSchema = SchemaFactory.createForClass(
  scheduledMeetingEntity,
);

@Schema({ timestamps: true })
export class JobEntity extends Document {
  @Prop({required: true})
  phoneNumber: string;

  @Prop({required: true})
  address: string;

  @Prop({required: true})
  role: string;

  @Prop({required: true})
  attachments: string;

  @Prop({ enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' })
  applicationStatus: string;

  @Prop([{ type: Types.ObjectId, ref: 'scheduledMeetingEntity' }])
  scheduledMeeting: ScheduledMeetingDto[];

}

export const JobEntitySchema = SchemaFactory.createForClass(JobEntity);
