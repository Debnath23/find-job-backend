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
      return ApiResponse(null, 'Unauthorized: token may be expired!', 401);
    }

    const response = await this.roomBookingService.createRoom(
      request.user.usersType,
      createRoomDto,
    );

    return ApiResponse(response, 'Room created successfully!', 200);
  }

  @Post('book-room')
  async bookRoom(
    @Req() request: ExpressRequest,
    @Body() roomBookingDto: RoomBookingDto,
  ) {
    if (!request.user) {
      return ApiResponse(null, 'Unauthorized: token may be expired!', 401);
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
          409
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
      return ApiResponse(null, 'There is no room for booking!', 404);
    }
  }

  // @Get('getBookingDetails')
  // async getBookingDetails(
  //   @Req() request: ExpressRequest,
  //   @Query('username') username?: string,
  //   @Query('roomNumber') roomNumber?: number,
  //   @Query('date') date?: string,
  //   @Query('limit') limit?: number,
  //   @Query('offset') offset?: number,
  //   @Query('bookingLimit') bookingLimit?: number,
  //   @Query('bookingOffset') bookingOffset?: number,
  // ) {
  //   try {
  //     const limitVal = limit ? parseInt(limit.toString(), 10) : 10;
  //     const offsetVal = offset ? parseInt(offset.toString(), 10) : 0;

  //     const bookingLimitVal = bookingLimit
  //       ? parseInt(bookingLimit.toString(), 10)
  //       : 10;
  //     const bookingOffsetVal = bookingOffset
  //       ? parseInt(bookingOffset.toString(), 10)
  //       : 0;

  //     if (!request.user) {
  //       return ApiResponse(null, 'Unauthorized');
  //     }

  //     const userId = request.user._id;

  //     let dateObj: Date | null = null;

  //     if (date) {
  //       dateObj = parse(date, 'yyyy-MM-dd', new Date());

  //       if (!isValid(dateObj)) {
  //         return ApiResponse(null, 'Invalid booking date format.');
  //       }
  //     }

  //     if (request.user.usersType === 1) {
  //       if (roomNumber && dateObj) {
  //         const response =
  //           await this.roomBookingService.getAllUserBookingDetailsForAParticularDateAndRoom(
  //             roomNumber,
  //             dateObj,
  //             limitVal,
  //             offsetVal,
  //             bookingLimitVal,
  //             bookingOffsetVal,
  //           );
  //         return response;
  //       } else if (roomNumber) {
  //         const response =
  //           await this.roomBookingService.getAllUserBookingDetailsForAParticularRoom(
  //             roomNumber,
  //             limitVal,
  //             offsetVal,
  //             bookingLimitVal,
  //             bookingOffsetVal,
  //           );
  //         return response;
  //       }
  //       else if (roomNumber && dateObj && username) {
  //         const response =
  //           await this.roomBookingService.getAUserBookingDetailsForAParticularDateAndRoom(
  //             username,
  //             roomNumber,
  //             dateObj,
  //           );
  //         return response;
  //       } else if (roomNumber && username) {
  //         const response =
  //           await this.roomBookingService.getAUserBookingDetailsForAParticularRoom(
  //             username,
  //             roomNumber,
  //             limitVal,
  //             offsetVal,
  //           );
  //         return response;
  //       } else if(username) {
  //         const response =
  //           await this.roomBookingService.getAUserBookingDetails(
  //             username,
  //             limitVal,
  //             offsetVal,
  //           );
  //         return response;
  //       }
  //       else {
  //         const response =
  //           await this.roomBookingService.getAllUserBookingDetails(
  //             limitVal,
  //             offsetVal,
  //             bookingLimitVal,
  //             bookingOffsetVal,
  //           );
  //         return response;
  //       }
  //     } else {
  //       if (roomNumber && dateObj) {
  //         const response =
  //           await this.roomBookingService.getUserBookingDetailsForAParticularDateAndRoom(
  //             userId,
  //             roomNumber,
  //             dateObj,
  //           );
  //         return response;
  //       } else if (roomNumber) {
  //         const response =
  //           await this.roomBookingService.getUserBookingDetailsForAParticularRoom(
  //             userId,
  //             roomNumber,
  //             limitVal,
  //             offsetVal,
  //           );
  //         return response;
  //       } else {
  //         const response = await this.roomBookingService.getUserBookingDetails(
  //           userId,
  //           limitVal,
  //           offsetVal,
  //         );
  //         return response;
  //       }
  //     }
  //   } catch (error) {
  //     console.log('Error: ', error);
  //     throw new HttpException(
  //       'Something went wrong while fetching user booking details',
  //       HttpStatus.PROCESSING,
  //     );
  //   }
  // }

  @Get('get-booking-details')
  async getBookingDetails(
    @Req() request: ExpressRequest,
    @Query('username') username?: string,
    @Query('roomNumber') roomNumber?: number,
    @Query('date') date?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    // @Query('bookingLimit') bookingLimit?: number,
    // @Query('bookingOffset') bookingOffset?: number,
  ) {
    try {
      const limitVal = limit ? parseInt(limit.toString(), 10) : 10;
      const offsetVal = offset ? parseInt(offset.toString(), 10) : 0;
      // const bookingLimitVal = bookingLimit
      //   ? parseInt(bookingLimit.toString(), 10)
      //   : 10;
      // const bookingOffsetVal = bookingOffset
      //   ? parseInt(bookingOffset.toString(), 10)
      //   : 0;

      if (!request.user) {
        return ApiResponse(null, 'Unauthorized', 401);
      }

      const userId = request.user._id;
      const userType = request.user.usersType;
      const isAdmin = userType === 1;

      let dateObj: Date | null = null;
      if (date) {
        dateObj = parse(date, 'yyyy-MM-dd', new Date());
        if (!isValid(dateObj)) {
          return ApiResponse(null, 'Invalid booking date format.', 400);
        }
      }

      if (roomNumber && dateObj && username) {
        return isAdmin
          ? await this.roomBookingService.getAUserBookingDetailsForAParticularDateAndRoom(
              username,
              roomNumber,
              dateObj,
            )
          : await this.roomBookingService.getUserBookingDetailsForAParticularDateAndRoom(
              userId,
              roomNumber,
              dateObj,
            );
      }

      if (roomNumber && dateObj) {
        return isAdmin
          ? await this.roomBookingService.getAllUserBookingDetailsForAParticularDateAndRoom(
              roomNumber,
              dateObj,
              limitVal,
              offsetVal,
              // bookingLimitVal,
              // bookingOffsetVal,
            )
          : await this.roomBookingService.getUserBookingDetailsForAParticularDateAndRoom(
              userId,
              roomNumber,
              dateObj,
            );
      }

      if (roomNumber && username) {
        return isAdmin
          ? await this.roomBookingService.getAUserBookingDetailsForAParticularRoom(
              username,
              roomNumber,
              limitVal,
              offsetVal,
            )
          : await this.roomBookingService.getUserBookingDetailsForAParticularRoom(
              userId,
              roomNumber,
              limitVal,
              offsetVal,
            );
      }

      if (roomNumber) {
        return isAdmin
          ? await this.roomBookingService.getAllUserBookingDetailsForAParticularRoom(
              roomNumber,
              limitVal,
              offsetVal,
              // bookingLimitVal,
              // bookingOffsetVal,
            )
          : await this.roomBookingService.getUserBookingDetailsForAParticularRoom(
              userId,
              roomNumber,
              limitVal,
              offsetVal,
            );
      }

      if (username && isAdmin) {
        return await this.roomBookingService.getAUserBookingDetails(
          username,
          limitVal,
          offsetVal,
        );
      }

      return isAdmin
        ? await this.roomBookingService.getAllUserBookingDetails(
            limitVal,
            offsetVal,
            // bookingLimitVal,
            // bookingOffsetVal,
          )
        : await this.roomBookingService.getUserBookingDetails(
            userId,
            limitVal,
            offsetVal,
          );
    } catch (error) {
      console.log('Error: ', error);
      return ApiResponse(null,
        'Something went wrong while fetching user booking details',
        500,
      );
    }
  }

  @Get('get-room-details')
  async getRoomDetails(
    @Request() request: ExpressRequest,
    @Query('roomNumber') roomNumber?: number,
    @Query('date') date?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('bookingLimit') bookingLimit?: number,
    @Query('bookingOffset') bookingOffset?: number,
  ) {
    try {
      const limitVal = limit ? parseInt(limit.toString(), 10) : 10;
      const offsetVal = offset ? parseInt(offset.toString(), 10) : 0;

      const bookingLimitVal = bookingLimit
        ? parseInt(bookingLimit.toString(), 10)
        : 10;
      const bookingOffsetVal = bookingOffset
        ? parseInt(bookingOffset.toString(), 10)
        : 0;

      if (!request.user) {
        return ApiResponse(null, 'Unauthorized: token may be expired!', 401);
      }

      let dateObj: Date | null = null;

      if (date) {
        dateObj = parse(date, 'yyyy-MM-dd', new Date());

        if (!isValid(dateObj)) {
          return ApiResponse(null, 'Invalid booking date format.', 400);
        }
      }

      if (roomNumber && dateObj) {
        const response = await this.roomBookingService.getRoomDetails(
          request.user.usersType,
          roomNumber,
          dateObj,
          limitVal,
          offsetVal,
        );
        return response;
      } else if (roomNumber) {
        const response = await this.roomBookingService.getARoomDetails(
          request.user.usersType,
          roomNumber,
          limitVal,
          offsetVal,
        );
        return response;
      } else {
        const response = await this.roomBookingService.getAllRoomDetails(
          request.user.usersType,
          limitVal,
          offsetVal,
          bookingLimitVal,
          bookingOffsetVal,
        );
        return response;
      }
    } catch (error) {
      console.error('Error:', error);
      return ApiResponse(null,
        'Something went wrong while fetching room details',
        500,
      );
    }
  }

  @Get('booking-availability')
  async bookingAvailability(
    @Query('roomNumber') roomNumber: number,
    @Query('date') date: string,
    @Req() request: ExpressRequest,
  ) {
    if (!request.user) {
      return ApiResponse(null, 'Unauthorized: token may be expired!', 401);
    }

    try {
      if (!date) {
        return ApiResponse(null, 'Date is required.', 400);
      }

      const dateObj = parse(date, 'yyyy-MM-dd', new Date());

      if (!isValid(dateObj)) {
        return ApiResponse(null, 'Invalid booking date format.', 400);
      }

      const response = await this.roomBookingService.findAvailableSeatsOfARoom(
        roomNumber,
        dateObj,
      );

      return ApiResponse(response, 'Bookings available for the room in the given date.', 200);
    } catch (error) {
      console.log('Error: ', error);
      return ApiResponse(null,
        'Something went wrong while fetching booking-availability of a room, Please check input parameters.',
        500
      );
    }
  }

  @Get('check-existing-rooms')
  async checkExistingRooms(@Req() request: ExpressRequest) {
    try {
      if (!request.user) {
        return ApiResponse(null, 'Unauthorized', 401);
      }
      const response = await this.roomBookingService.checkExistingRooms();

      return ApiResponse(response, 'Room exist.', 200);
    } catch (error) {
      console.log('Error: ', error);
      return ApiResponse(null,
        'Something went wrong while checking existing rooms!',
        500,
      );
    }
  }
}
