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
      const bookingDateUTC = new Date(
        Date.UTC(
          bookingDate.getFullYear(),
          bookingDate.getMonth(),
          bookingDate.getDate(),
        ),
      );

      const availableSeatsResponse = await this.findAvailableSeatsOfARoom(
        roomNumber,
        bookingDateUTC,
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
          bookingDate: bookingDateUTC,
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
        'Something went wrong while booking a room!',
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

  async getUserBookingDetailsForAParticularDateAndRoom(
    userId: Types.ObjectId,
    roomNumber: number,
    dateObj: Date,
  ) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found!');
      }

      const userBooking = await this.bookingModel
        .findOne({
          userId: userId,
          roomNumber: roomNumber,
          bookingDate: dateObj,
        })
        .exec();

      if (!userBooking) {
        return ApiResponse(null, 'No bookings found for this user!');
      }

      const bookingDetails = {
        roomName: userBooking.roomName,
        roomNumber: userBooking.roomNumber,
        bookingDate: userBooking.bookingDate,
        bookingId: userBooking._id,
      };

      return bookingDetails;
    } catch (error) {
      console.error(
        'Error fetching booking details of the user for a particular room and a particular date:',
        error,
      );
      throw new HttpException(
        'Something went wrong while fetching user booking details for a particular room and a particular date.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserBookingDetailsForAParticularRoom(
    userId: Types.ObjectId,
    roomNumber: number,
    limitVal: number,
    offsetVal: number,
  ) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found!');
      }

      const totalCount = await this.bookingModel
        .countDocuments({ userId: userId, roomNumber: roomNumber })
        .exec();

      const bookingEntities = await this.bookingModel
        .find({ userId: userId, roomNumber: roomNumber })
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!');
      }

      const dateTodayUTC = new Date().toISOString();

      const bookingsWithStatus = bookingEntities.map((booking) => {
        const bookingDateUTC = new Date(booking.bookingDate).toISOString();

        const bookingDetails = {
          bookingDate: bookingDateUTC,
          bookingId: booking._id,
        };

        return {
          ...bookingDetails,
          bookingStatus: bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
        };
      });

      return ApiResponse(
        {
          roomName: bookingEntities[0].roomName,
          roomNumber: bookingEntities[0].roomNumber,
          bookings: bookingsWithStatus,
          totalBookings: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'User bookings retrieved successfully',
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new HttpException(
        'Something went wrong while fetching user booking details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserBookingDetails(
    userId: Types.ObjectId,
    limitVal: number,
    offsetVal: number,
  ) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found!');
      }

      const totalCount = await this.bookingModel
        .countDocuments({ userId: userId })
        .exec();

      const bookingEntities = await this.bookingModel
        .find({ userId: userId })
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!');
      }

      const dateTodayUTC = new Date().toISOString();

      const bookingsWithStatus = bookingEntities.map((booking) => {
        const bookingDateUTC = new Date(booking.bookingDate).toISOString();

        const bookingDetails = {
          roomName: booking.roomName,
          roomNumber: booking.roomNumber,
          bookingDate: bookingDateUTC,
          bookingId: booking._id,
        };

        return {
          ...bookingDetails,
          bookingStatus: bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
        };
      });

      return ApiResponse(
        {
          bookings: bookingsWithStatus,
          totalBookings: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'User bookings retrieved successfully',
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new HttpException(
        'Something went wrong while fetching user booking details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUserBookingDetailsForAParticularDateAndRoom(
    roomNumber: number,
    date: Date,
    limitVal: number,
    offsetVal: number,
    bookingLimitVal: number,
    bookingOffsetVal: number,
  ) {
    try {
      const totalCount = await this.userModel.countDocuments().exec();

      const userEntities = await this.userModel
        .find()
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const dateInUTC = new Date(date).toISOString();
      const dateTodayUTC = new Date().toISOString();

      const appliedCandidates = [];
      let roomName: string | null = null;

      await Promise.all(
        userEntities.map(async (user) => {
          const totalBookings = await this.bookingModel
            .countDocuments({
              roomNumber: roomNumber,
              bookingDate: dateInUTC,
            })
            .exec();

          const bookings = await this.bookingModel
            .find({
              // userId: user._id,
              roomNumber: roomNumber,
              bookingDate: dateInUTC,
            })
            .limit(bookingLimitVal)
            .skip(bookingOffsetVal)
            .exec();

          if (bookings.length > 0) {
            if (roomName === null) {
              roomName = bookings[0].roomName;
            }

            const bookingWithStatus = bookings.map((booking) => {
              const bookingDateUTC = new Date(
                booking.bookingDate,
              ).toISOString();

              const bookingDetails = {
                bookingId: booking._id,
              };

              return {
                ...bookingDetails,
                bookingStatus:
                  bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
              };
            });

            appliedCandidates.push({
              username: user.username,
              email: user.email,
              bookings: bookingWithStatus,
              totalBookings: totalBookings,
              bookingLimit: bookingLimitVal,
              bookingOffset: bookingOffsetVal,
            });
          }
        }),
      );

      const response = {
        roomName: roomName || 'Unknown Room',
        roomNumber: roomNumber.toString(),
        date: dateInUTC,
        appliedCandidates,
        totalUsers: totalCount,
        limit: limitVal,
        offset: offsetVal,
      };

      return ApiResponse(response, 'User bookings retrieved successfully');
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details for a particular room and particular date.',
      );
    }
  }

  async getAllUserBookingDetailsForAParticularRoom(
    roomNumber: number,
    limitVal: number,
    offsetVal: number,
    bookingLimitVal: number,
    bookingOffsetVal: number,
  ) {
    try {
      const totalCount = await this.userModel.countDocuments().exec();

      const userEntities = await this.userModel
        .find()
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const dateTodayUTC = new Date().toISOString();

      const appliedCandidates = [];
      let roomName: string | null = null;

      await Promise.all(
        userEntities.map(async (user) => {
          const totalBookings = await this.bookingModel
            .countDocuments({
              roomNumber: roomNumber,
            })
            .exec();

          const bookings = await this.bookingModel
            .find({
              roomNumber: roomNumber,
            })
            .limit(bookingLimitVal)
            .skip(bookingOffsetVal)
            .exec();

          if (bookings.length > 0) {
            if (roomName === null) {
              roomName = bookings[0].roomName;
            }

            const bookingWithStatus = bookings.map((booking) => {
              const bookingDateUTC = new Date(
                booking.bookingDate,
              ).toISOString();

              const bookingDetails = {
                bookingId: booking._id,
              };

              return {
                ...bookingDetails,
                bookingStatus:
                  bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
              };
            });

            appliedCandidates.push({
              username: user.username,
              email: user.email,
              bookings: bookingWithStatus,
              totalBookings: totalBookings,
              bookingLimit: bookingLimitVal,
              bookingOffset: bookingOffsetVal,
            });
          }
        }),
      );

      const response = {
        roomName: roomName || 'Unknown Room',
        roomNumber: roomNumber.toString(),
        appliedCandidates,
        totalUsers: totalCount,
        limit: limitVal,
        offset: offsetVal,
      };

      return ApiResponse(response, 'User bookings retrieved successfully');
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details for a particular room.',
      );
    }
  }

  async getAllUserBookingDetails(
    limitVal: number,
    offsetVal: number,
    bookingLimitVal: number,
    bookingOffsetVal: number,
  ) {
    try {
      const totalCount = await this.userModel.countDocuments().exec();

      const userEntities = await this.userModel
        .find()
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const dateTodayUTC = new Date().toISOString();

      const allUserBookings = await Promise.all(
        userEntities.map(async (user) => {
          const totalBookings = user.bookings.length;

          const paginatedBookings = user.bookings.slice(
            bookingOffsetVal,
            bookingOffsetVal + bookingLimitVal,
          );

          const bookingWithStatus = await Promise.all(
            paginatedBookings.map(async (bookingId) => {
              const booking = await this.bookingModel
                .findById(bookingId)
                .exec();

              if (booking) {
                const bookingDateUTC = new Date(
                  booking.bookingDate,
                ).toISOString();

                const bookingDetails = {
                  roomName: booking.roomName,
                  roomNumber: booking.roomNumber,
                  bookingDate: bookingDateUTC,
                  bookingId: booking._id,
                };

                return {
                  ...bookingDetails,
                  bookingStatus:
                    bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
                };
              }
              return null;
            }),
          );

          return {
            username: user.username,
            email: user.email,
            bookings: bookingWithStatus.filter(Boolean),
            totalBookings,
            bookingLimit: bookingLimitVal,
            bookingOffset: bookingOffsetVal,
          };
        }),
      );

      return ApiResponse(
        {
          allUserBookings,
          totalUsers: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'User bookings retrieved successfully',
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching all users booking details',
      );
    }
  }

  async getRoomDetails(
    usersType: number,
    roomNumber: number,
    dateObj: Date,
    limitVal: number,
    offsetVal: number,
  ) {
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

      const totalCount = await this.bookingModel
        .countDocuments({ roomNumber: roomNumber, bookingDate: dateObj })
        .exec();

      const bookings = await this.bookingModel
        .find({
          roomNumber: roomNumber,
          bookingDate: dateObj,
        })
        .skip(offsetVal)
        .limit(limitVal)
        .exec();

      if (!bookings.length) {
        return ApiResponse(
          null,
          'No existing bookings for the room on the specified date.',
        );
      }

      const availableSeatsOfTheRoom = await this.findAvailableSeatsOfARoom(
        roomNumber,
        dateObj,
      );

      const dateTodayUTC = new Date().toISOString();
      const appliedCandidates = [];

      await Promise.all(
        bookings.map(async (booking) => {
          const user = await this.userModel.findById(booking.userId).exec();
          const bookingDateUTC = new Date(booking.bookingDate).toISOString();

          const bookingDetails = {
            userDetails: {
              username: user?.username,
              email: user?.email,
            },
            bookingDate: booking.bookingDate,
            bookingId: booking._id,
          };

          if (bookingDateUTC < dateTodayUTC) {
            appliedCandidates.push({
              ...bookingDetails,
              bookingStatus: 'past',
            });
          } else {
            appliedCandidates.push({
              ...bookingDetails,
              bookingStatus: 'upcoming',
            });
          }
        }),
      );

      const response = {
        _id: room._id,
        roomName: room.roomName,
        roomNumber: room.roomNumber,
        seatCapacity: room.seatCapacity,
        availableSeats: availableSeatsOfTheRoom.availableSeats,
        appliedCandidates,
      };

      return ApiResponse(
        {
          rooms: response,
          totalBookings: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'Room details retrieved successfully',
      );
    } catch (error) {
      console.error('Error: ', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details for the specified date!',
      );
    }
  }

  async getARoomDetails(
    usersType: number,
    roomNumber: number,
    limitVal: number,
    offsetVal: number,
  ) {
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

      const totalCount = await this.bookingModel
        .countDocuments({ roomNumber: roomNumber })
        .exec();

      const bookings = await this.bookingModel
        .find({ roomNumber: roomNumber })
        .skip(offsetVal)
        .limit(limitVal)
        .exec();

      if (!bookings || bookings.length === 0) {
        return ApiResponse(null, 'Bookings are not found!');
      }

      const dateTodayUTC = new Date().toISOString();
      const appliedCandidates = [];

      await Promise.all(
        bookings.map(async (booking) => {
          const user = await this.userModel.findById(booking.userId).exec();
          const bookingDateUTC = new Date(booking.bookingDate).toISOString();

          const bookingDetails = {
            userDetails: {
              username: user?.username,
              email: user?.email,
            },
            bookingDate: booking.bookingDate,
            bookingId: booking._id,
          };

          if (bookingDateUTC < dateTodayUTC) {
            appliedCandidates.push({
              ...bookingDetails,
              bookingStatus: 'past',
            });
          } else {
            appliedCandidates.push({
              ...bookingDetails,
              bookingStatus: 'upcoming',
            });
          }
        }),
      );

      const response = {
        _id: room._id,
        roomName: room.roomName,
        roomNumber: room.roomNumber,
        seatCapacity: room.seatCapacity,
        appliedCandidates,
      };

      return ApiResponse(
        {
          rooms: response,
          totalBookings: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'Room details retrieved successfully',
      );
    } catch (error) {
      console.error('Error fetching room details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details',
      );
    }
  }

  async getAllRoomDetails(
    usersType: number,
    limitVal: number,
    offsetVal: number,
    bookingLimitVal: number,
    bookingOffsetVal: number,
  ) {
    try {
      if (usersType !== 1) {
        return ApiResponse(
          null,
          'Fetching room details service is not available for you!',
        );
      }

      const totalRooms = await this.roomModel.countDocuments().exec();

      const roomEntity = await this.roomModel
        .find()
        .skip(offsetVal)
        .limit(limitVal)
        .exec();

      if (!roomEntity || roomEntity.length === 0) {
        return ApiResponse(null, 'No room exists.');
      }

      const dateTodayUTC = new Date().toISOString();

      const roomDetails = await Promise.all(
        roomEntity.map(async (room) => {
          const totalBookings = await this.bookingModel
            .countDocuments({ _id: { $in: room.appliedCandidates } })
            .exec();

          const bookings = await this.bookingModel
            .find({ _id: { $in: room.appliedCandidates } })
            .skip(bookingOffsetVal)
            .limit(bookingLimitVal)
            .exec();

          const appliedCandidates = [];

          await Promise.all(
            bookings.map(async (booking) => {
              const user = await this.userModel.findById(booking.userId).exec();
              const bookingDateUTC = new Date(
                booking.bookingDate,
              ).toISOString();

              const bookingDetails = {
                userDetails: {
                  username: user?.username,
                  email: user?.email,
                },
                bookingDate: booking.bookingDate,
                bookingId: booking._id,
              };

              if (bookingDateUTC < dateTodayUTC) {
                appliedCandidates.push({
                  ...bookingDetails,
                  bookingStatus: 'past',
                });
              } else {
                appliedCandidates.push({
                  ...bookingDetails,
                  bookingStatus: 'upcoming',
                });
              }
            }),
          );

          return {
            _id: room._id,
            roomName: room.roomName,
            roomNumber: room.roomNumber,
            seatCapacity: room.seatCapacity,
            appliedCandidates,
            totalBookings,
            bookingLimit: bookingLimitVal,
            bookingOffset: bookingOffsetVal,
          };
        }),
      );

      return ApiResponse(
        {
          rooms: roomDetails,
          totalRooms: totalRooms,
          limit: limitVal,
          offset: offsetVal,
        },
        'Room details retrieved successfully',
      );
    } catch (error) {
      console.error('Error fetching room details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details',
      );
    }
  }

  async checkExistingRooms() {
    try {
      const roomEntity = await this.roomModel.find().exec();

      if (!roomEntity || roomEntity.length === 0) {
        return ApiResponse(null, 'No room exists.');
      }

      const existingRooms = roomEntity.map((room) => {
        return {
          roomNumber: room.roomNumber,
          roomName: room.roomName,
        };
      });

      return existingRooms;
    } catch (error) {
      console.error('Error while checking existing rooms:', error);
      return ApiResponse(
        null,
        'Something went wrong while checking existing rooms!',
      );
    }
  }
}
