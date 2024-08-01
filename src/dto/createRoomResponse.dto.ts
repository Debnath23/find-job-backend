import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';
import { AppliedCandidatesDto } from './appliedCandidates.dto';
import { Type } from 'class-transformer';

export class CreateRoomResponseDto {
  @IsNotEmpty()
  readonly roomName: string;

  @IsNumber()
  readonly roomNumber: number;

  @IsNumber()
  readonly seatCapacity: number;

  @IsNumber()
  readonly availableSeat: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AppliedCandidatesDto)
  readonly appliedCandidates: AppliedCandidatesDto[];
}

