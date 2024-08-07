import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  readonly roomName: string;

  @IsNumber()
  readonly roomNumber: number;

  @IsNumber()
  readonly seatCapacity: number;
}
