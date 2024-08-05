import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplyRoomEntity } from '../entities/applyRoom.entity';
import { RoomEntity } from '../entities/rooms.entity';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { AppliedCandidatesDto } from '../dto/appliedCandidates.dto';
import { RoomBookingResponseDto } from '../dto/roomBookingResponse.dto';
import { RoomDetailsResponseDto } from 'src/dto/roomDetailsResponse.dto';

@Injectable()
export class RoomBookingService {
  constructor(
    @InjectModel(RoomEntity.name) private roomModel: Model<RoomEntity>,
    @InjectModel(ApplyRoomEntity.name)
    private applyRoomModel: Model<ApplyRoomEntity>,
  ) {}

  async createRoom(
    usersType: number,
    createRoomDto: CreateRoomDto,
  ): Promise<RoomEntity> {
    try {
        if (usersType === 1) {
          const existingRoom = await this.roomModel.findOne({
            roomName: createRoomDto.roomName,
          });
    
          if (existingRoom) {
            throw new HttpException(
              'Room is already created!',
              HttpStatus.UNPROCESSABLE_ENTITY,
            );
          }
    
          const createdRoom = new this.roomModel(createRoomDto);
          return createdRoom.save();
        } else {
          throw new HttpException(
            'Creating room service is not available for you!',
            HttpStatus.UNPROCESSABLE_ENTITY,
          );
        }
    } catch (error: any) {
        console.log(error);
    }
  }

  async bookRoom(
    username: string,
    roomNumber: number,
    bookingDate: any,
  ): Promise<ApplyRoomEntity> {
    const room = await this.roomModel.findOne({ roomNumber }).exec();

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.availableSeat <= 0) {
      throw new BadRequestException('No seats available');
    }

    const bookingDay = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDay < today) {
      throw new BadRequestException('Cannot book for past dates.');
    }

    const roomEntity = await this.roomModel.findOne({ roomNumber }).exec();

    if (!roomEntity) {
      throw new NotFoundException('Room not found');
    }

    const existingBooking = await this.applyRoomModel
      .findOne({
        username,
        roomId: roomEntity._id,
        bookingDate: bookingDay,
      })
      .exec();

    if (existingBooking) {
      throw new BadRequestException(
        'User has already booked this room for the selected date.',
      );
    }

    const booking = new this.applyRoomModel({
      username,
      roomNumber,
      bookingDate: bookingDay,
    });

    const savedBooking = await booking.save();

    roomEntity.appliedCandidates.push(savedBooking._id as Types.ObjectId);
    await roomEntity.save();

    return savedBooking;
  }

  //   async bookRoom(
  //     username: string,
  //     roomNumber: number,
  //     bookingDate: Date,
  //   ): Promise<ApplyRoomEntity> {
  //     const room = await this.roomModel.findOne({ roomNumber }).exec();

  //     if (!room) {
  //       throw new NotFoundException('Room not found');
  //     }

  //     const existingApplication = await this.applyRoomModel
  //       .findOne({
  //         username,
  //         roomNumber: room.roomNumber,
  //         bookingDate,
  //       })
  //       .exec();

  //     if (existingApplication) {
  //       throw new BadRequestException(
  //         'User has already booked this room for the selected date.',
  //       );
  //     }

  //     if (room.availableSeat <= 0) {
  //       throw new BadRequestException('No seats available');
  //     }

  //     const newApplication = new this.applyRoomModel({
  //       username,
  //       roomNumber: room.roomNumber,
  //       bookingDate,
  //     });

  //     await newApplication.save();

  //     room.appliedCandidates.push(newApplication._id as Types.ObjectId);
  //     room.availableSeat -= 1;
  //     await room.save();

  //     return newApplication;
  //   }

  async createRoomResponse(roomEntity: RoomEntity): Promise<CreateRoomDto> {
    return {
      roomName: roomEntity.roomName,
      roomNumber: roomEntity.roomNumber,
      seatCapacity: roomEntity.seatCapacity,
      availableSeat: roomEntity.availableSeat,
      roomId: roomEntity._id,
    };
  }

  async roomBookingResponse(
    applyRoomEntity: ApplyRoomEntity,
  ): Promise<RoomBookingResponseDto> {
    const roomEntity = await this.roomModel
      .findOne({ roomNumber: applyRoomEntity.roomNumber })
      .exec();

    if (!roomEntity) {
      throw new NotFoundException('Room not found');
    }

    return {
      roomName: roomEntity.roomName,
      roomNumber: roomEntity.roomNumber,
      seatCapacity: roomEntity.seatCapacity,
      availableSeat: roomEntity.availableSeat,
      bookedBy: applyRoomEntity.username,
      bookingDate: applyRoomEntity.bookingDate,
      bookingId: applyRoomEntity._id,
    };
  }

  async roomDetails(roomEntity: RoomEntity): Promise<RoomDetailsResponseDto> {
    const appliedCandidatesIds =
      roomEntity.appliedCandidates as Types.ObjectId[];

    let appliedCandidatesDtos: AppliedCandidatesDto[] = [];

    if (appliedCandidatesIds && appliedCandidatesIds.length > 0) {
      const appliedCandidatesEntities = await this.applyRoomModel
        .find({
          _id: { $in: appliedCandidatesIds },
        })
        .exec();

      if (appliedCandidatesEntities && appliedCandidatesEntities.length > 0) {
        appliedCandidatesDtos = appliedCandidatesEntities.map((candidate) => ({
          username: candidate.username,
          appliedDate: candidate.bookingDate,
        }));
      }
    }
    return {
      roomName: roomEntity.roomName,
      roomNumber: roomEntity.roomNumber,
      seatCapacity: roomEntity.seatCapacity,
      availableSeat: roomEntity.availableSeat,
      appliedCandidates: appliedCandidatesDtos,
    };
  }

  async getApplyRoomById(id: string): Promise<ApplyRoomEntity> {
    return this.applyRoomModel.findById(id).exec();
  }

  async getRoomById(id: string): Promise<RoomEntity> {
    return this.roomModel.findById(id).exec();
  }
}
