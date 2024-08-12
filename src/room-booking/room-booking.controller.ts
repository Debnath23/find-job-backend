import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import { RoomBookingService } from './room-booking.service';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { isValid, parse } from 'date-fns';
import { RoomBookingDto } from '../dto/roomBooking.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../responseTypes/ApiResponse';

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
      return ApiResponse(null, 'Unauthorized: token may be expired!');
    }

    const response = await this.roomBookingService.createRoom(
      request.user.usersType,
      createRoomDto,
    );

    return response;
  }

  // @Post('book')
  // async bookRoom(
  //   @Req() request: ExpressRequest,
  //   @Body() roomBookingDto: RoomBookingDto,
  // ) {
  //   if (!request.user) {
  //     return ApiResponse(null, 'Unauthorized: token may be expired!');
  //   }

  //   const userId = request.user._id;

  //   try {
  //     const bookingDateObj = parse(
  //       roomBookingDto.bookingDate,
  //       'yyyy-MM-dd',
  //       new Date(),
  //     );
  //     if (isNaN(bookingDateObj.getTime())) {
  //       throw new BadRequestException('Invalid booking date format.');
  //     }

  //     const hasAlreadyApplied =
  //       await this.roomBookingService.hasUserAlreadyAppliedForDate(
  //         userId,
  //         bookingDateObj,
  //       );

  //     if (hasAlreadyApplied) {
  //       return ApiResponse(
  //         null,
  //         'User cannot book the same or different rooms more than once on the same date.',
  //       );
  //     }

  //     const response = await this.roomBookingService.bookRoom(
  //       userId,
  //       roomBookingDto.roomNumber,
  //       bookingDateObj,
  //     );

  //     return response;
  //   } catch (error) {
  //     console.log('Error: ', error);
  //     throw new BadRequestException('There is no room for booking.');
  //   }
  // }

  @Post('book')
  async bookRoom(
    @Req() request: ExpressRequest,
    @Body() roomBookingDto: RoomBookingDto,
  ) {
    if (!request.user) {
      return ApiResponse(null, 'Unauthorized: token may be expired!');
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

      const bookingDateUTC = new Date(
        Date.UTC(
          bookingDateObj.getFullYear(),
          bookingDateObj.getMonth(),
          bookingDateObj.getDate(),
        ),
      );

      const hasAlreadyApplied =
        await this.roomBookingService.hasUserAlreadyAppliedForDate(
          userId,
          bookingDateUTC,
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
        bookingDateUTC,
      );

      return response;
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException('There is no room for booking.');
    }
  }

  @Get('getBookingDetails')
  async getBookingDetails(
    @Req() request: ExpressRequest,
    @Query('roomNumber') roomNumber?: number,
    @Query('date') date?: string,
  ) {
    try {
      if (!request.user) {
        return ApiResponse(null, 'Unauthorized');
      }

      const userId = request.user._id;

      let dateObj: Date | null = null;

      if (date) {
        dateObj = parse(date, 'yyyy-MM-dd', new Date());

        if (!isValid(dateObj)) {
          return ApiResponse(null, 'Invalid booking date format.');
        }
      }

      if (request.user.usersType === 1) {
        if (roomNumber && dateObj) {
          const response =
            await this.roomBookingService.getAllUserBookingDetailsForAParticularDateAndRoom(
              roomNumber,
              dateObj,
            );
          return response;
        } else if (roomNumber) {
          const response =
            await this.roomBookingService.geAlltUserBookingDetailsForAParticularRoom(
              roomNumber,
            );
          return response;
        } else {
          const response =
            await this.roomBookingService.getAllUserBookingDetails();
          return response;
        }
      } else {
        if (roomNumber && dateObj) {
          const response =
            await this.roomBookingService.getUserBookingDetailsForAParticularDateAndRoom(
              userId,
              roomNumber,
              dateObj,
            );
          return response;
        } else if (roomNumber) {
          const response =
            await this.roomBookingService.getUserBookingDetailsForAParticularRoom(
              userId,
              roomNumber,
            );
          return response;
        } else {
          const response =
            await this.roomBookingService.getUserBookingDetails(userId);
          return response;
        }
      }
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
    @Query('roomNumber') roomNumber?: number,
    @Query('date') date?: string,
  ) {
    try {
      if (!request.user) {
        return ApiResponse(null, 'Unauthorized: token may be expired!');
      }

      let dateObj: Date | null = null;

      if (date) {
        dateObj = parse(date, 'yyyy-MM-dd', new Date());

        if (!isValid(dateObj)) {
          return ApiResponse(null, 'Invalid booking date format.');
        }
      }

      if (roomNumber && dateObj) {
        const response = await this.roomBookingService.getRoomDetails(
          request.user.usersType,
          roomNumber,
          dateObj,
        );
        return response;
      } else if (roomNumber) {
        const response = await this.roomBookingService.getARoomDetails(
          request.user.usersType,
          roomNumber,
        );
        return response;
      } else {
        const response = await this.roomBookingService.getAllRoomDetails(
          request.user.usersType,
        );
        return response;
      }
    } catch (error) {
      console.error('Error:', error);
      throw new HttpException(
        'Something went wrong while fetching room details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('booking-availability/:roomNumber/:date')
  async bookingAvailability(
    @Param('roomNumber') roomNumber: number,
    @Param('date') date: string,
    @Req() request: ExpressRequest,
  ) {
    if (!request.user) {
      return ApiResponse(null, 'Unauthorized: token may be expired!');
    }

    try {
      if (!date) {
        return ApiResponse(null, 'Date is required.');
      }

      const dateObj = parse(date, 'yyyy-MM-dd', new Date());

      if (!isValid(dateObj)) {
        return ApiResponse(null, 'Invalid booking date format.');
      }

      const response = await this.roomBookingService.findAvailableSeatsOfARoom(
        roomNumber,
        dateObj,
      );

      return response;
    } catch (error) {
      console.log('Error: ', error);
      throw new BadRequestException(
        'Something went wrong while fetching booking-availability of a room, Please check input parameters.',
      );
    }
  }

  @Get('checkExistingRooms')
  async checkExistingRooms(@Req() request: ExpressRequest) {
    try {
      if (!request.user) {
        return ApiResponse(null, 'Unauthorized');
      }
      const response = await this.roomBookingService.checkExistingRooms();

      return response;
    } catch (error) {
      console.log('Error: ', error);
      throw new HttpException(
        'Something went wrong while checking existing rooms!',
        HttpStatus.PROCESSING,
      );
    }
  }
}
