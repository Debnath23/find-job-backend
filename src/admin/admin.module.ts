import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersEntity, UsersEntitySchema } from 'src/entities/users.entity';
import { JobEntity, JobEntitySchema } from 'src/entities/job.entity';
import { RoomEntity, RoomEntitySchema } from 'src/entities/rooms.entity';
import { ApplyRoomEntity, ApplyRoomEntitySchema } from 'src/entities/applyRoom.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersEntity.name, schema: UsersEntitySchema },
      { name: JobEntity.name, schema: JobEntitySchema },
      { name: RoomEntity.name, schema: RoomEntitySchema },
      { name: ApplyRoomEntity.name, schema: ApplyRoomEntitySchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
