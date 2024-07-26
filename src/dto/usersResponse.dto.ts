import { IsString } from 'class-validator';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersResponseDto {
  @IsString()
  readonly username: string;

  @IsString()
  readonly email: string;

  @IsString()
  readonly token: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplyForDto)
  readonly applyFor: ApplyForDto[];
}

export class ApplyForDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;

  @IsString()
  role: string;

  @IsString()
  attachments: string;

  @IsString()
  applicationStatus: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScheduledMeetingDto)
  readonly scheduledMeeting: ScheduledMeetingDto[];
}

export class ScheduledMeetingDto {
  @IsString()
  scheduledTime: string;

  @IsString()
  meetingLink: string;
}