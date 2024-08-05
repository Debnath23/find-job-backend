import { IsNotEmpty, IsString } from 'class-validator';

export class AppliedCandidatesDto {
  @IsNotEmpty()
  readonly username: string;

  readonly appliedDate: any;
}
