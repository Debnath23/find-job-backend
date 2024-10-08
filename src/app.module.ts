import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { envOptions } from './config/envOptions';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { RoomBookingModule } from './room-booking/room-booking.module';

@Module({
  imports: [
    ConfigModule.forRoot(envOptions),
    UsersModule,
    MongooseModule.forRoot(process.env.MONGODB_URI),
    AuthModule,
    AdminModule,
    RoomBookingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '*',
      method: RequestMethod.ALL,
    });
  }
}
