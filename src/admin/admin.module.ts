import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersEntity, UsersEntitySchema } from '../entities/users.entity';
import { JobEntity, JobEntitySchema } from '../entities/job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersEntity.name, schema: UsersEntitySchema },
      { name: JobEntity.name, schema: JobEntitySchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService]
})
export class AdminModule {}
