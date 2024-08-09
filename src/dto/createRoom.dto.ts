import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty()
  readonly roomName: string;

  @ApiProperty()
  readonly roomNumber: number;

  @ApiProperty()
  readonly seatCapacity: number;
}
