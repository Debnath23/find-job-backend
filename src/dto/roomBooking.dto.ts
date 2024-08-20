import { ApiProperty } from '@nestjs/swagger';

export class RoomBookingDto {
  @ApiProperty()
  readonly roomNumber: number;

  @ApiProperty()
  readonly bookingDate: string;
}
