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
  ) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found!');
      }

      const bookingEntities = await this.bookingModel
        .find({ userId: userId, roomNumber: roomNumber })
        .exec();
      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!');
      }

      const dateTodayUTC = new Date().toISOString();

      const pastBookings = [];
      const upcomingBookings = [];

      bookingEntities.forEach((booking) => {
        const bookingDateUTC = new Date(booking.bookingDate).toISOString();

        const bookingDetails = {
          bookingDate: bookingDateUTC,
          bookingId: booking._id,
        };

        if (bookingDateUTC < dateTodayUTC) {
          pastBookings.push(bookingDetails);
        } else {
          upcomingBookings.push(bookingDetails);
        }
      });

      return {
        roomName: bookingEntities[0].roomName,
        roomNumber: bookingEntities[0].roomNumber,
        pastBookings,
        upcomingBookings,
      };
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new HttpException(
        'Something went wrong while fetching user booking details',
        HttpStatus.INTERNAL_SERVER_ERROR,
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

      const dateTodayUTC = new Date().toISOString();

      const pastBookings = [];
      const upcomingBookings = [];

      bookingEntities.forEach((booking) => {
        const bookingDateUTC = new Date(booking.bookingDate).toISOString();

        const bookingDetails = {
          roomName: booking.roomName,
          roomNumber: booking.roomNumber,
          bookingDate: bookingDateUTC,
          bookingId: booking._id,
        };

        if (bookingDateUTC < dateTodayUTC) {
          pastBookings.push(bookingDetails);
        } else {
          upcomingBookings.push(bookingDetails);
        }
      });

      return {
        pastBookings,
        upcomingBookings,
      };
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
  ) {
    try {
      const userEntities = await this.userModel.find().exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const dateInUTC = new Date(date).toISOString();
      const dateTodayUTC = new Date().toISOString();

      const appliedCandidates = [];
      let roomName: string | null = null;

      await Promise.all(
        userEntities.map(async (user) => {
          const pastBookings = [];
          const upcomingBookings = [];

          const bookings = await this.bookingModel
            .find({
              userId: user._id,
              roomNumber: roomNumber,
              bookingDate: dateInUTC,
            })
            .exec();

          if (bookings.length > 0) {
            if (roomName === null) {
              roomName = bookings[0].roomName;
            }

            bookings.forEach((booking) => {
              const bookingDateUTC = new Date(
                booking.bookingDate,
              ).toISOString();

              const bookingDetails = {
                bookingId: booking._id,
              };

              if (bookingDateUTC < dateTodayUTC) {
                pastBookings.push(bookingDetails);
              } else {
                upcomingBookings.push(bookingDetails);
              }
            });

            appliedCandidates.push({
              username: user.username,
              email: user.email,
              pastBookings,
              upcomingBookings,
            });
          }
        }),
      );

      const response = {
        roomName: roomName || 'Unknown Room',
        roomNumber: roomNumber.toString(),
        date: dateInUTC,
        appliedCandidates,
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

  async geAlltUserBookingDetailsForAParticularRoom(roomNumber: number) {
    try {
      const userEntities = await this.userModel.find().exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const dateTodayUTC = new Date().toISOString();

      const appliedCandidates = [];
      let roomName: string | null = null;

      await Promise.all(
        userEntities.map(async (user) => {
          const pastBookings = [];
          const upcomingBookings = [];

          const bookings = await this.bookingModel
            .find({
              userId: user._id,
              roomNumber: roomNumber,
            })
            .exec();

          if (bookings.length > 0) {
            if (roomName === null) {
              roomName = bookings[0].roomName;
            }

            bookings.forEach((booking) => {
              const bookingDateUTC = new Date(
                booking.bookingDate,
              ).toISOString();

              const bookingDetails = {
                bookingId: booking._id,
              };

              if (bookingDateUTC < dateTodayUTC) {
                pastBookings.push(bookingDetails);
              } else {
                upcomingBookings.push(bookingDetails);
              }
            });

            appliedCandidates.push({
              username: user.username,
              email: user.email,
              pastBookings,
              upcomingBookings,
            });
          }
        }),
      );

      const response = {
        roomName: roomName || 'Unknown Room',
        roomNumber: roomNumber.toString(),
        appliedCandidates,
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

  async getAllUserBookingDetails() {
    try {
      const userEntities = await this.userModel.find().exec();

      if (!userEntities || userEntities.length === 0) {
        return ApiResponse(null, 'No bookings found!');
      }

      const dateTodayUTC = new Date().toISOString();

      const allUserBookings = await Promise.all(
        userEntities.map(async (user) => {
          const pastBookings = [];
          const upcomingBookings = [];

          await Promise.all(
            user.bookings.map(async (bookingId) => {
              const booking = await this.bookingModel
                .findById(bookingId)
                .exec();
              const bookingDateUTC = new Date(
                booking.bookingDate,
              ).toISOString();

              const bookingDetails = {
                roomName: booking.roomName,
                roomNumber: booking.roomNumber,
                bookingDate: bookingDateUTC,
                bookingId: booking._id,
              };

              if (bookingDateUTC < dateTodayUTC) {
                pastBookings.push(bookingDetails);
              } else {
                upcomingBookings.push(bookingDetails);
              }
            }),
          );

          return {
            username: user.username,
            email: user.email,
            bookings: {
              pastBookings,
              upcomingBookings,
            },
          };
        }),
      );

      return ApiResponse(
        allUserBookings,
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

      const availableSeatsOfTheRoom = await this.findAvailableSeatsOfARoom(
        roomNumber,
        dateObj,
      );

      const bookingDetails = {
        _id: room._id,
        roomName: room.roomName,
        roomNumber: room.roomNumber,
        seatCapacity: room.seatCapacity,
        availableSeats: availableSeatsOfTheRoom.availableSeats,
        appliedCandidates: await Promise.all(
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
          }),
        ),
      };

      return bookingDetails;
    } catch (error) {
      console.error('Error: ', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details for the specified date!',
      );
    }
  }

  async getARoomDetails(usersType: number, roomNumber: number) {
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
        .find({ roomNumber: roomNumber })
        .exec();

      if (!bookings || bookings.length === 0) {
        return ApiResponse(null, 'Bookings are not found!');
      }

      const bookingDetails = {
        _id: room._id,
        roomName: room.roomName,
        roomNumber: room.roomNumber,
        seatCapacity: room.seatCapacity,
        appliedCandidates: await Promise.all(
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
          }),
        ),
      };

      return bookingDetails;
    } catch (error) {
      console.error('Error fetching room details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details',
      );
    }
  }

  async getAllRoomDetails(usersType: number) {
    try {
      if (usersType !== 1) {
        return ApiResponse(
          null,
          'Fetching room details service is not available for you!',
        );
      }

      const roomEntity = await this.roomModel.find().exec();

      if (!roomEntity || roomEntity.length === 0) {
        return ApiResponse(null, 'No room exists.');
      }

      const roomDetails = await Promise.all(
        roomEntity.map(async (room) => {
          const bookings = await this.bookingModel
            .find({ _id: { $in: room.appliedCandidates } })
            .exec();

          const appliedCandidates = await Promise.all(
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
            }),
          );

          return {
            _id: room._id,
            roomName: room.roomName,
            roomNumber: room.roomNumber,
            seatCapacity: room.seatCapacity,
            appliedCandidates,
          };
        }),
      );

      return roomDetails;
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
