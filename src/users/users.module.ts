import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersEntity, UsersEntitySchema } from '../entities/users.entity';
import { JobEntity, JobEntitySchema } from '../entities/job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersEntity.name, schema: UsersEntitySchema },
    ]),
    MongooseModule.forFeature([{ name: JobEntity.name, schema: JobEntitySchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
