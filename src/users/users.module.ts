import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersEntity, UsersEntitySchema } from './users.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UsersEntity.name, schema: UsersEntitySchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
