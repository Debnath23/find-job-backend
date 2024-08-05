import { Module } from '@nestjs/common';
import { RoomBookingController } from './room-booking.controller';
import { RoomBookingService } from './room-booking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomEntity, RoomEntitySchema } from '../entities/rooms.entity';
import {
  ApplyRoomEntity,
  ApplyRoomEntitySchema,
} from '../entities/applyRoom.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoomEntity.name, schema: RoomEntitySchema },
      { name: ApplyRoomEntity.name, schema: ApplyRoomEntitySchema },
    ]),
  ],
  controllers: [RoomBookingController],
  providers: [RoomBookingService],
  exports: [RoomBookingService],
})
export class RoomBookingModule {}
