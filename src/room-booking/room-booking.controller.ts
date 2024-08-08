import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Request,
} from '@nestjs/common';
import { RoomBookingService } from './room-booking.service';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { parse } from 'date-fns';
import { RoomBookingDto } from '../dto/roomBooking.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../responseTypes/ApiResponse';
import { FetchRoomDetailsDto } from '../dto/fetchRoomDetails.dto';

@Controller('room-booking')
@ApiTags('Room Booking')
export class RoomBookingController {
  constructor(private readonly roomBookingService: RoomBookingService) {}

  @Post('create-room')
  async createRoom(
    @Request() request: ExpressRequest,
    @Body() createRoomDto: CreateRoomDto,
  ) {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const response = await this.roomBookingService.createRoom(
      request.user.usersType,
      createRoomDto,
    );

    return response;
  }

  @Post('book')
  async bookRoom(
    @Req() request: ExpressRequest,
    @Body() roomBookingDto: RoomBookingDto,
  ) {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userId = request.user._id;

    try {
      const bookingDateObj = parse(
        roomBookingDto.bookingDate,
        'yyyy-MM-dd',
        new Date(),
      );
      if (isNaN(bookingDateObj.getTime())) {
        throw new BadRequestException('Invalid booking date format.');
      }

      const hasAlreadyApplied =
        await this.roomBookingService.hasUserAlreadyAppliedForDate(
          userId,
          bookingDateObj,
        );

      if (hasAlreadyApplied) {
        return ApiResponse(
          null,
          'User cannot book the same or different rooms more than once on the same date.',
        );
      }

      const response = await this.roomBookingService.bookRoom(
        userId,
        roomBookingDto.roomNumber,
        bookingDateObj,
      );

      return response;
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('There is no room for booking.');
    }
  }

  @Get('getBookingDetails')
  async getBookingDetails(@Req() request: ExpressRequest) {
    try {
      if (!request.user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }
      const userId = request.user._id;

      const response = await this.roomBookingService.getBookingDetails(userId);

      return response;
    } catch (error) {
      console.log('Error: ', error);
      throw new HttpException(
        'Something went wrong while fetching user booking details',
        HttpStatus.PROCESSING,
      );
    }
  }

  @Get('getRoomDetails')
  async getRoomDetails(
    @Request() request: ExpressRequest,
    @Body() fetchRoomDetailsDto: FetchRoomDetailsDto,
  ) {
    try {
      if (!request.user) {
        throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      }

      const dateObj = parse(
        fetchRoomDetailsDto.date,
        'yyyy-MM-dd',
        new Date(),
      );
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException('Invalid booking date format.');
      }

      const response = await this.roomBookingService.getRoomDetails(
        request.user.usersType,
        fetchRoomDetailsDto.roomNumber,
        dateObj
      );

      return response;
    } catch (error) {
      console.log('Error: ', error);
      throw new HttpException(
        'Something went wrong while fetching room details',
        HttpStatus.PROCESSING,
      );
    }
  }
}
