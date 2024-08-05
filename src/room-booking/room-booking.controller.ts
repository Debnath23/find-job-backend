import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { RoomBookingService } from './room-booking.service';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { CreateRoomResponseDto } from '../dto/createRoomResponse.dto';
import { RoomBookingResponseDto } from '../dto/roomBookingResponse.dto';
import { parse } from 'date-fns';
import { RoomDetailsResponseDto } from '../dto/roomDetailsResponse.dto';

@Controller('room-booking')
export class RoomBookingController {
  constructor(private readonly roomBookingService: RoomBookingService) {}

  @Post('create-room')
  async createRoom(
    @Request() request: ExpressRequest,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<CreateRoomResponseDto> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const room = await this.roomBookingService.createRoom(
      request.user.usersType,
      createRoomDto,
    );

    return this.roomBookingService.createRoomResponse(room);
  }

  @Post('book')
  async bookRoom(
    @Body('username') username: string,
    @Body('roomNumber') roomNumber: number,
    @Body('bookingDate') bookingDate: string,
  ): Promise<RoomBookingResponseDto> {
    const bookingDateObj = parse(bookingDate, 'yyyy-MM-dd', new Date());

    if (isNaN(bookingDateObj.getTime())) {
      throw new BadRequestException('Invalid booking date format.');
    }

    const applyRoomEntity = await this.roomBookingService.bookRoom(
      username,
      roomNumber,
      bookingDateObj,
    );

    return this.roomBookingService.roomBookingResponse(applyRoomEntity);
  }

  @Get(':id')
  async getBooking(
    @Param('id') bookingId: string,
  ): Promise<RoomBookingResponseDto> {
    const applyRoomEntity =
      await this.roomBookingService.getApplyRoomById(bookingId);

    if (!applyRoomEntity) {
      throw new NotFoundException('Booking not found');
    }

    return this.roomBookingService.roomBookingResponse(applyRoomEntity);
  }

  @Get('/room_details/:id')
  async getRoomDetails(
    @Param('id') roomId: string,
  ): Promise<RoomDetailsResponseDto> {
    const RoomEntity =
      await this.roomBookingService.getRoomById(roomId);

    if (!RoomEntity) {
      throw new NotFoundException('Room is not found');
    }

    return this.roomBookingService.roomDetails(RoomEntity);
  }
}
