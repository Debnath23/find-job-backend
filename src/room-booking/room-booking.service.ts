import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BookingEntity } from '../entities/booking.entity';
import { RoomEntity } from '../entities/rooms.entity';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { AppliedCandidatesDto } from '../dto/appliedCandidates.dto';
import { RoomBookingResponseDto } from '../dto/roomBookingResponse.dto';
import { RoomDetailsResponseDto } from 'src/dto/roomDetailsResponse.dto';
import { UsersEntity } from '../entities/users.entity';
import { ApiResponse } from '../responseTypes/ApiResponse';
import { UserBookingResponseDto } from '../dto/userBookingResponse.dto';
import { FetchRoomDetailsDto } from 'src/dto/fetchRoomDetails.dto';
@Injectable()
export class RoomBookingService {
  constructor(
    @InjectModel(UsersEntity.name) private userModel: Model<UsersEntity>,
    @InjectModel(RoomEntity.name) private roomModel: Model<RoomEntity>,
    @InjectModel(BookingEntity.name)
    private bookingModel: Model<BookingEntity>,
  ) {}

  async createRoom(usersType: number, createRoomDto: CreateRoomDto) {
    try {
      if (usersType === 1) {
        const existingRoom = await this.roomModel.findOne({
          $or: [
            {
              roomName: createRoomDto.roomName,
            },
            {
              roomNumber: createRoomDto.roomNumber,
            },
          ],
        });

        if (existingRoom) {
          return ApiResponse(null, 'Room is already created!');
        } else {
          const createdRoom = new this.roomModel(createRoomDto);
          createdRoom.save();
          return ApiResponse(createdRoom, 'Room is created successfully!');
        }
      } else {
        return ApiResponse(
          null,
          'Creating room service is not available for you!',
        );
      }
    } catch (error) {
      console.log('Error: ', error);
      throw new UnprocessableEntityException(
        'Something went wrong while creating room!',
      );
    }
  }

  async bookRoom(
    userId: Types.ObjectId,
    roomNumber: number,
    bookingDate: Date,
  ) {
    const availableSeats = await this.findCapacityOfARoom(
      roomNumber,
      bookingDate,
    );

    if (availableSeats > 0) {
      const room = await this.roomModel.findOne({ roomNumber }).exec();

      if (!room) {
        throw new NotFoundException('Room is not found!');
      }

      const booking = new this.bookingModel({
        userId: userId,
        roomName: room.roomName,
        roomNumber: roomNumber,
        bookingDate: bookingDate,
      });

      await booking.save();
      room.appliedCandidates.push(booking._id);
      await room.save();

      const user = await this.userModel.findById(userId).exec();

      user.bookings.push(booking._id);
      await user.save();

      return ApiResponse(booking, 'Room booked successfully!');
    } else {
      return ApiResponse(null, 'Room is fully booked for the day!');
    }
  }

  async hasUserAlreadyAppliedForDate(
    userId: Types.ObjectId,
    bookingDate: Date,
  ): Promise<boolean> {
    const booking = await this.bookingModel.findOne({
      $and: [
        {
          userId: userId,
        },
        {
          bookingDate: bookingDate,
        },
      ],
    });

    if (booking) {
      return true;
    }
  }

  async findCapacityOfARoom(roomNumber: number, date: Date) {
    const recordCounts = await this.bookingModel
      .countDocuments({
        $and: [
          { roomNumber: roomNumber },
          {
            bookingDate: date,
          },
        ],
      })
      .exec();

    const room = await this.roomModel.findOne({ roomNumber }).exec();

    const availableSeats = room.seatCapacity - recordCounts;

    return availableSeats;
  }

  async getBookingDetails(userId: Types.ObjectId) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found!');
      }

      const bookingEntities = await this.bookingModel
        .find({ userId: userId })
        .exec();
      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!');
      }

      const bookings = bookingEntities.map((booking) => ({
        roomName: booking.roomName,
        roomNumber: booking.roomNumber,
        bookingDate: booking.bookingDate,
        bookingId: booking._id,
      }));

      return bookings;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new HttpException(
        'Something went wrong while fetching user booking details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // async getRoomDetails(usersType: number, roomNumber: number, dateObj: Date) {
  //   try {
  //     if (usersType === 1) {
  //       const room = await this.roomModel.findOne({ roomNumber }).exec();

  //       if (!room) {
  //         return ApiResponse(null, 'Room is not found');
  //       } else {
  //         const bookings = await this.bookingModel
  //           .findOne({
  //             $and: [
  //               {
  //                 roomNumber: roomNumber,
  //               },
  //               {
  //                 bookingDate: dateObj,
  //               },
  //             ],
  //           })
  //           .exec();

  //         if (!bookings) {
  //           return ApiResponse(
  //             null,
  //             'No existing bookings of the room for the date.',
  //           );
  //         } else {
  //           const booking = bookings.map((booking) => ({
  //             const user = await this.userModel.findById(booking.userId).exec();

  //             userDetails: {
  //               username: user?.username,
  //               email: user?.email,
  //             }

  //             roomName: booking.roomName,
  //             roomNumber: booking.roomNumber,
  //             bookingDate: booking.bookingDate,
  //             bookingId: booking._id,
  //           }));
            
  //           return booking;
  //         }
  //       }
  //     } else {
  //       return ApiResponse(
  //         null,
  //         'Fetching room details service is not available for you!',
  //       );
  //     }
  //   } catch (error) {
  //     console.log('Error: ', error);
  //     throw new UnprocessableEntityException(
  //       'Something went wrong while fetch room details!',
  //     );
  //   }
  // }

  async getRoomDetails(usersType: number, roomNumber: number, dateObj: Date) {
    try {
      if (usersType === 1) {
        const room = await this.roomModel.findOne({ roomNumber }).exec();
  
        if (!room) {
          return ApiResponse(null, 'Room not found');
        }
  
        const bookings = await this.bookingModel.find({
          roomNumber: roomNumber,
          bookingDate: dateObj,
        }).exec();
  
        if (!bookings.length) {
          return ApiResponse(null, 'No existing bookings for the room on the specified date.');
        }
  
        const bookingDetails = await Promise.all(bookings.map(async (booking) => {
          const user = await this.userModel.findById(booking.userId).exec();
  
          return {
            userDetails: {
              username: user?.username,
              email: user?.email,
            },
            roomName: booking.roomName,
            roomNumber: booking.roomNumber,
            bookingDate: booking.bookingDate,
            bookingId: booking._id,
          };
        }));
  
        return bookingDetails;
  
      } else {
        return ApiResponse(null, 'Fetching room details service is not available for you!');
      }
    } catch (error) {
      console.error('Error: ', error);
      throw new UnprocessableEntityException(
        'Something went wrong while fetching room details!',
      );
    }
  }
  
}
