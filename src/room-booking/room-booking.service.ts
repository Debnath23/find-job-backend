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
        return ApiResponse(null,
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

  async getBookingDetails(
    userId: Types.ObjectId,
  ) {
    try {
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found!');
      }
  
      const bookingEntities = await this.bookingModel.find({ userId: userId }).exec();
      if (!bookingEntities || bookingEntities.length === 0) {
        return ApiResponse(null, 'No bookings found for this user!');
      }

      // console.log("bookingEntities: ", bookingEntities);
      
      const bookings = bookingEntities.map((booking) => ({
        roomName: booking.roomName,
        roomNumber: booking.roomNumber,
        bookingDate: booking.bookingDate,
        bookingId: booking._id,
      }));

      console.log("Booking: ", bookings);
      
  
      return bookings;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      throw new HttpException(
        'Something went wrong while fetching user booking details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
  // async getBookingDetails(
  //   userId: Types.ObjectId,
  // ): Promise<UserBookingResponseDto> {
  //   try {
  //     const user = await this.userModel.findById(userId).exec();

  //     if (!user) {
  //       throw new NotFoundException('User is not found!');
  //     }


  //     const bookingEntity = await this.bookingModel.findById(userId).exec();

  //     bookingEntity.map

  //     // const bookings = user.bookings.map((booking) => {
  //     //   roomName: booking.roomName;
  //     //   roomNumber: booking.roomNumber;
  //     //   bookingDate: booking.bookingDate;
  //     //   bookingId: booking._id;
  //     // })
  //     // console.log(bookings);
      
  //     return bookings;
  //   } catch (error) {
  //     throw new HttpException(
  //       'Something went wrong while fetching user booking details',
  //       HttpStatus.PROCESSING,
  //     );
  //   }
  // }

  // async roomDetails(roomEntity: RoomEntity, date?: Date): Promise<RoomDetailsResponseDto> {
  //   const appliedCandidatesIds =
  //     roomEntity.appliedCandidates as Types.ObjectId[];

  //   let appliedCandidatesDtos: AppliedCandidatesDto[] = [];

  //   if (appliedCandidatesIds && appliedCandidatesIds.length > 0) {
  //     const appliedCandidatesEntities = await this.bookingModel
  //       .find({
  //         _id: { $in: appliedCandidatesIds },
  //       })
  //       .exec();

  //     if (appliedCandidatesEntities && appliedCandidatesEntities.length > 0) {
  //       appliedCandidatesDtos = appliedCandidatesEntities.map((candidate) => ({
  //         user: candidate.user,
  //         appliedDate: candidate.date,
  //       }));
  //     }
  //   }

  //   const dateKey = date ? date.toISOString().split('T')[0] : null;
  //   const availableSeat = dateKey ? roomEntity.availableSeatsByDate.get(dateKey) || roomEntity.seatCapacity : roomEntity.seatCapacity;

  //   return {
  //     roomName: roomEntity.roomName,
  //     roomNumber: roomEntity.roomNumber,
  //     seatCapacity: roomEntity.seatCapacity,
  //     availableSeat,
  //     appliedCandidates: appliedCandidatesDtos,
  //   };
  // }

  // async getApplyRoomById(id: string): Promise<ApplyRoomEntity> {
  //   return this.applyRoomModel.findById(id).exec();
  // }

  // async getRoomById(id: string): Promise<RoomEntity> {
  //   return this.roomModel.findById(id).exec();
  // }
}
