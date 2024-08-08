import { ApiProperty } from "@nestjs/swagger";

export class FetchRoomDetailsDto {
    @ApiProperty({required: true})
    roomNumber: number;

    @ApiProperty({required: true})
    date: string;
}