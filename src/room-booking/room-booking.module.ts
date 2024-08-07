import { Module } from '@nestjs/common';
import { RoomBookingController } from './room-booking.controller';
import { RoomBookingService } from './room-booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomEntity, RoomEntitySchema } from '../entities/rooms.entity';
import {
  BookingEntity,
  BookingEntitySchema,
} from '../entities/booking.entity';
import { UsersEntity, UsersEntitySchema } from '../entities/users.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersEntity.name, schema: UsersEntitySchema },
      { name: RoomEntity.name, schema: RoomEntitySchema },
      { name: BookingEntity.name, schema: BookingEntitySchema },
    ]),
  ],
  controllers: [RoomBookingController],
  providers: [RoomBookingService],
  exports: [RoomBookingService],
})
export class RoomBookingModule {}
