import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersEntity, UsersEntitySchema } from '../entities/users.entity';
import { JobEntity, JobEntitySchema } from '../entities/job.entity';
import { ApplyRoomEntity, ApplyRoomEntitySchema } from '../entities/applyRoom.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersEntity.name, schema: UsersEntitySchema },
      { name: JobEntity.name, schema: JobEntitySchema },
      { name: ApplyRoomEntity.name, schema: ApplyRoomEntitySchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
