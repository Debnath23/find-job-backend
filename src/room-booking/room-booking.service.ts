import {
  Injectable,
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
import { UsersEntity } from '../entities/users.entity';
import { ApiResponse } from '../responseTypes/ApiResponse';

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
    try {
      const availableSeatsResponse = await this.findAvailableSeatsOfARoom(
        roomNumber,
        bookingDate,
      );

      if (availableSeatsResponse.availableSeats > 0) {
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
    } catch (error) {
      throw new UnprocessableEntityException(
        'Something went wrong while book a room!',
      );
    }
  }

  async hasUserAlreadyAppliedForDate(
    userId: Types.ObjectId,
    bookingDate: Date,
  ): Promise<boolean> {
    try {
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
    } catch (error) {
      throw new UnprocessableEntityException(
        'Something went wrong while checking the user is already booked any room for the day!',
      );
    }
  }

  async findAvailableSeatsOfARoom(roomNumber: number, date: Date) {
    try {
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

      return {
        seatCapacity: room.seatCapacity,
        numberOfBookings: recordCounts,
        availableSeats: availableSeats,
      };
    } catch (error) {
      throw new UnprocessableEntityException(
        'Something went wrong while fetching booking-availability of a room!',
      );
    }
  }

  async getUserBookingDetails(userId: Types.ObjectId) {
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

  async getAllUserBookingDetails() {
    try {
      const userEntities = await this.userModel.find().exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const bookings = await Promise.all(
        userEntities.map(async (user) => {
          const userBookings = await Promise.all(
            user.bookings.map(async (bookingId) => {
              const booking = await this.bookingModel
                .findById(bookingId)
                .exec();
              return {
                bookingId: booking._id,
                roomName: booking.roomName,
                roomNumber: booking.roomNumber,
                bookingDate: booking.bookingDate,
              };
            }),
          );

          return {
            username: user.username,
            email: user.email,
            bookings: userBookings,
          };
        }),
      );

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
  //         return ApiResponse(null, 'Room not found');
  //       }

  //       const bookings = await this.bookingModel
  //         .find({
  //           roomNumber: roomNumber,
  //           bookingDate: dateObj,
  //         })
  //         .exec();

  //       if (!bookings.length) {
  //         return ApiResponse(
  //           null,
  //           'No existing bookings for the room on the specified date.',
  //         );
  //       }

  //       const bookingDetails = await Promise.all(
  //         bookings.map(async (booking) => {
  //           const user = await this.userModel.findById(booking.userId).exec();

  //           const availableSeatsOfTheRoom =
  //             await this.findAvailableSeatsOfARoom(roomNumber, dateObj);

  //           return {
  //             roomName: booking.roomName,
  //             roomNumber: booking.roomNumber,
  //             availableSeats: availableSeatsOfTheRoom.availableSeats,
  //             booking: [
  //               {
  //                 userDetails: {
  //                   username: user?.username,
  //                   email: user?.email,
  //                 },
  //                 bookingDate: booking.bookingDate,
  //                 bookingId: booking._id,
  //               },
  //             ],
  //           };
  //         }),
  //       );

  //       return bookingDetails;
  //     } else {
  //       return ApiResponse(
  //         null,
  //         'Fetching room details service is not available for you!',
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error: ', error);
  //     throw new UnprocessableEntityException(
  //       'Something went wrong while fetching room details!',
  //     );
  //   }
  // }

  async getRoomDetails(usersType: number, roomNumber: number, dateObj: Date) {
    try {
      if (usersType !== 1) {
        return ApiResponse(
          null,
          'Fetching room details service is not available for you!',
        );
      }
  
      const room = await this.roomModel.findOne({ roomNumber }).exec();
      if (!room) {
        return ApiResponse(null, 'Room not found');
      }
  
      const bookings = await this.bookingModel
        .find({
          roomNumber: roomNumber,
          bookingDate: dateObj,
        })
        .exec();
  
      if (!bookings.length) {
        return ApiResponse(
          null,
          'No existing bookings for the room on the specified date.',
        );
      }
  
      const availableSeatsOfTheRoom = await this.findAvailableSeatsOfARoom(roomNumber, dateObj);
  
      const bookingDetails = {
        roomName: room.roomName,
        roomNumber: room.roomNumber,
        availableSeats: availableSeatsOfTheRoom.availableSeats,
        booking: await Promise.all(
          bookings.map(async (booking) => {
            const user = await this.userModel.findById(booking.userId).exec();
            return {
              userDetails: {
                username: user?.username,
                email: user?.email,
              },
              bookingDate: booking.bookingDate,
              bookingId: booking._id,
            };
          })
        ),
      };
  
      return bookingDetails;
    } catch (error) {
      console.error('Error: ', error);
      throw new UnprocessableEntityException(
        'Something went wrong while fetching room details!',
      );
    }
  }
  
}
