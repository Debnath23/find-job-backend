import { IsNotEmpty } from 'class-validator';

export class AppliedCandidatesDto {
  @IsNotEmpty()
  readonly roomName: string;
}
