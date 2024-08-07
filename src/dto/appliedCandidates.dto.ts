import { IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class AppliedCandidatesDto {
  @IsNotEmpty()
  readonly user: Types.ObjectId;

  readonly appliedDate: any;
}
