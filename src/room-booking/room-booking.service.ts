import { Injectable } from '@nestjs/common';
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
          return ApiResponse(null, 'Room is already created!', 200);
        } else {
          const createdRoom = new this.roomModel(createRoomDto);
          createdRoom.save();
          return ApiResponse(createdRoom, 'Room is created successfully!', 200);
        }
      } else {
        return ApiResponse(
          null,
          'Creating room service is not available for you!',
          503,
        );
      }
    } catch (error) {
      console.log('Error: ', error);
      return ApiResponse(
        null,
        'Something went wrong while creating room!',
        500,
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
          return ApiResponse(null, 'Room is not found!', 404);
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

        return ApiResponse(booking, 'Room booked successfully!', 200);
      } else {
        return ApiResponse(null, 'Room is fully booked for the day!', 409);
      }
    } catch (error) {
      return ApiResponse(
        null,
        'Something went wrong while booking a room!',
        500,
      );
    }
  }

  async hasUserAlreadyAppliedForDate(
    userId: Types.ObjectId,
    bookingDate: Date,
  ) {
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
        // return ApiResponse(true, 'You are already applied for the day!', 400);
        return true;
      }
    } catch (error) {
      return ApiResponse(
        null,
        'Something went wrong while checking the user is already booked any room for the day!',
        500,
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
      throw ApiResponse(
        null,
        'Something went wrong while fetching booking-availability of a room!',
        500,
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
        return ApiResponse(null, 'User not found!', 404);
      }

      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));

      const dateTodayUTC = new Date().toISOString();
      const bookingDateUTC = new Date(dateObj).toISOString();

      const userBooking = await this.bookingModel
        .findOne({
          userId: userId,
          roomNumber: roomNumber,
          bookingDate: { $gte: startOfDay, $lt: endOfDay },
        })
        .exec();

      if (!userBooking) {
        return ApiResponse(null, 'No bookings found for this user!', 404);
      }

      const bookingDetails = {
        roomName: userBooking.roomName,
        roomNumber: userBooking.roomNumber,
        bookingDate: userBooking.bookingDate,
        bookingId: userBooking._id,
      };

      return ApiResponse(
        {
          ...bookingDetails,
          bookingStatus: bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
        },
        'User booking retrieved successfully',
        200,
      );
    } catch (error) {
      console.error(
        'Error fetching booking details of the user for a particular room and a particular date:',
        error,
      );
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details for a particular room and a particular date.',
        500,
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
        return ApiResponse(null, 'User not found!', 404);
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
        return ApiResponse(null, 'No bookings found for this user!', 404);
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
        200,
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details',
        500,
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
        return ApiResponse(null, 'User not found!', 404);
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
        return ApiResponse(null, 'No bookings found for this user!', 404);
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
        200,
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details',
        500,
      );
    }
  }

  async getAllUserBookingDetailsForAParticularDateAndRoom(
    roomNumber: number,
    date: Date,
    limitVal: number,
    offsetVal: number,
  ) {
    try {
      const room = await this.roomModel.findOne({ roomNumber }).exec();
      if (!room) {
        return ApiResponse(null, 'No room exists!', 400);
      }

      const startOfDay = new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
      );
      const endOfDay = new Date(startOfDay);
      endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);

      const uniqueUserIds = await this.bookingModel
        .distinct('userId', {
          roomNumber: roomNumber,
          bookingDate: { $gte: startOfDay, $lt: endOfDay },
        })
        .exec();

      if (!uniqueUserIds || uniqueUserIds.length === 0) {
        return ApiResponse(
          null,
          'No bookings found for this date and room!',
          404,
        );
      }

      const totalUsers = uniqueUserIds.length;

      const paginatedUserIds = uniqueUserIds.slice(
        offsetVal,
        offsetVal + limitVal,
      );

      const users = await this.userModel
        .find({ _id: { $in: paginatedUserIds } })
        .select('username email')
        .exec();

      if (!users || users.length === 0) {
        return ApiResponse(null, 'No users found!', 404);
      }

      const allUserBookings = users.map((user) => ({
        username: user.username,
        email: user.email,
      }));

      const response = {
        roomName: room.roomName || 'Unknown Room',
        roomNumber: roomNumber.toString(),
        date: startOfDay.toISOString(),
        allUserBookings,
        totalUsers: totalUsers,
        limit: limitVal,
        offset: offsetVal,
      };

      return ApiResponse(response, 'User bookings retrieved successfully', 200);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details for a particular room and date.',
        500,
      );
    }
  }

  async getAllUserBookingDetailsForAParticularRoom(
    roomNumber: number,
    limitVal: number,
    offsetVal: number,
  ) {
    try {
      const room = await this.roomModel.findOne({ roomNumber }).exec();

      if (!room) {
        return ApiResponse(null, 'No room exist!', 400);
      }

      const uniqueUserIds = await this.bookingModel
        .distinct('userId', { roomNumber: roomNumber })
        .exec();

      // Get the total number of unique users
      const totalUsers = uniqueUserIds.length;

      // Paginate the unique user IDs
      const paginatedUserIds = uniqueUserIds.slice(
        offsetVal,
        offsetVal + limitVal,
      );

      // Fetch user details for the paginated user IDs
      const users = await this.userModel
        .find({ _id: { $in: paginatedUserIds } })
        .select('username email')
        .exec();

      if (!users || users.length === 0) {
        return ApiResponse(null, 'No users found!', 404);
      }

      // Ensure only unique users are added
      const allUserBookings = users.map((user) => ({
        username: user.username,
        email: user.email,
      }));

      const response = {
        roomName: room.roomName || 'Unknown Room',
        roomNumber: roomNumber.toString(),
        allUserBookings,
        totalBookings: totalUsers,
        limit: limitVal,
        offset: offsetVal,
      };

      return ApiResponse(response, 'User bookings retrieved successfully', 200);
    } catch (error) {
      console.error('Error fetching unique user booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching unique user booking details for the particular room.',
        500,
      );
    }
  }

  async getAllUserBookingDetails(limitVal: number, offsetVal: number) {
    try {
      const uniqueUserIds = await this.bookingModel.distinct('userId').exec();

      const totalUsers = uniqueUserIds.length;

      const paginatedUserEntities = await this.userModel
        .find({ _id: { $in: uniqueUserIds } })
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!paginatedUserEntities || paginatedUserEntities.length === 0) {
        return ApiResponse(null, 'No users with bookings found!', 404);
      }

      const allUserBookings = paginatedUserEntities.map((user) => ({
        username: user.username,
        email: user.email,
      }));

      return ApiResponse(
        {
          allUserBookings,
          totalUsers,
          limit: limitVal,
          offset: offsetVal,
        },
        'User bookings retrieved successfully',
        200,
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching all users booking details',
        500,
      );
    }
  }

  async getAUserBookingDetailsForAParticularDateAndRoom(
    username: string,
    roomNumber: number,
    dateObj: Date,
  ) {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        return ApiResponse(null, 'User not found!', 404);
      }

      const userBooking = await this.bookingModel
        .findOne({
          userId: user._id,
          roomNumber: roomNumber,
          bookingDate: dateObj,
        })
        .exec();

      if (!userBooking) {
        return ApiResponse(null, 'No bookings found for this user!', 404);
      }

      const dateTodayUTC = new Date().toISOString();

      const bookingDateUTC = new Date(userBooking.bookingDate).toISOString();

      const bookingDetails = {
        // roomName: userBooking.roomName,
        // roomNumber: userBooking.roomNumber,
        bookingDate: userBooking.bookingDate,
        bookingId: userBooking._id,
      };

      return ApiResponse(
        {
          ...bookingDetails,
          bookingStatus: bookingDateUTC < dateTodayUTC ? 'past' : 'upcoming',
        },
        'User booking retrieved successfully',
        200,
      );
    } catch (error) {
      console.error(
        'Error fetching booking details of the user for a particular room and a particular date:',
        error,
      );
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details for a particular room and a particular date.',
        500,
      );
    }
  }

  async getAUserBookingDetailsForAParticularRoom(
    username: string,
    roomNumber: number,
    limitVal: number,
    offsetVal: number,
  ) {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        return ApiResponse(null, 'User not found!', 404);
      }

      const totalCount = await this.bookingModel
        .countDocuments({ userId: user._id, roomNumber: roomNumber })
        .exec();

      const bookingEntities = await this.bookingModel
        .find({ userId: user._id, roomNumber: roomNumber })
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!', 404);
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
          // roomName: bookingEntities[0].roomName,
          // roomNumber: bookingEntities[0].roomNumber,
          bookings: bookingsWithStatus,
          totalBookings: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'User bookings retrieved successfully',
        200,
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details',
        500,
      );
    }
  }

  async getAUserBookingDetails(
    username: string,
    limitVal: number,
    offsetVal: number,
  ) {
    try {
      const user = await this.userModel.findOne({ username }).exec();
      if (!user) {
        return ApiResponse(null, 'User not found!', 404);
      }

      const totalCount = await this.bookingModel
        .countDocuments({ userId: user._id })
        .exec();

      const bookingEntities = await this.bookingModel
        .find({ userId: user._id })
        .limit(limitVal)
        .skip(offsetVal)
        .exec();

      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!', 404);
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
        200,
      );
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching user booking details',
        500,
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
          503,
        );
      }

      const room = await this.roomModel.findOne({ roomNumber }).exec();
      if (!room) {
        return ApiResponse(null, 'Room not found!', 404);
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
          404,
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
        200,
      );
    } catch (error) {
      console.error('Error: ', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details for the specified date!',
        500,
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
          503,
        );
      }

      const room = await this.roomModel.findOne({ roomNumber }).exec();

      if (!room) {
        return ApiResponse(null, 'Room not found!', 404);
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
        return ApiResponse(null, 'Bookings are not found!', 404);
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
          totalRooms: totalCount,
          limit: limitVal,
          offset: offsetVal,
        },
        'Room details retrieved successfully',
        200,
      );
    } catch (error) {
      console.error('Error fetching room details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details',
        500,
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
          503,
        );
      }

      const totalRooms = await this.roomModel.countDocuments().exec();

      const roomEntity = await this.roomModel
        .find()
        .skip(offsetVal)
        .limit(limitVal)
        .exec();

      if (!roomEntity || roomEntity.length === 0) {
        return ApiResponse(null, 'No room exists!', 404);
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
        200,
      );
    } catch (error) {
      console.error('Error fetching room details:', error);
      return ApiResponse(
        null,
        'Something went wrong while fetching room details',
        500,
      );
    }
  }

  async checkExistingRooms() {
    try {
      const roomEntity = await this.roomModel.find().exec();

      if (!roomEntity || roomEntity.length === 0) {
        return ApiResponse(null, 'No room exists!', 404);
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
        500,
      );
    }
  }
}
