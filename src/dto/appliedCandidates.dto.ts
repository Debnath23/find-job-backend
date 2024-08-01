import { IsNotEmpty } from 'class-validator';

export class AppliedCandidatesDto {
  @IsNotEmpty()
  readonly username: string;
}
