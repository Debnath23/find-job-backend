import { ApiProperty } from '@nestjs/swagger';

export class RoomBookingDto {
  @ApiProperty({required: true})
  readonly roomNumber: number;

  @ApiProperty({required: true})
  readonly bookingDate: string;
}
