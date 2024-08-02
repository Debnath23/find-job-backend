import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApplyForDto,
  ScheduledMeetingDto,
} from '../dto/usersResponse.dto';
import { UsersEntity } from '../entities/users.entity';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { CreateRoomDto } from '../dto/createRoom.dto';
import { CreateRoomResponseDto } from '../dto/createRoomResponse.dto';
import { AdminResponseDto } from '../dto/adminResponse.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('schedule-meeting/:username/:role')
  async scheduleMeeting(
    @Param('username') username: string,
    @Param('role') role: string,
    @Body() scheduleMeetingDto: ScheduledMeetingDto,
  ): Promise<AdminResponseDto> {
    try {
      const updatedUser: UsersEntity = await this.adminService.scheduledMeeting(
        username,
        role,
        scheduleMeetingDto,
      );

    //   return this.adminService.buildAdminResponse(updatedUser);
      return this.adminService.getAllUsersDetails();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('update-application-status/:username/:role')
  async updateApplicationStatus(
    @Param('username') username: string,
    @Param('role') role: string,
    @Body() applyForDto: ApplyForDto,
  ): Promise<AdminResponseDto> {
    try {
      const updatedUser: UsersEntity =
        await this.adminService.updateApplicationStatus(
          username,
          role,
          applyForDto,
        );

      return this.adminService.getAllUsersDetails();
    } catch (error) {
      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-users')
  async getAllUsers(@Request() request: ExpressRequest) {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const users = await this.adminService.getAllUsersDetails();

    return users;
  }

  @Post('create-room')
  async createRoom(
    @Request() request: ExpressRequest,
    @Body() createRoomDto: CreateRoomDto,
  ): Promise<CreateRoomResponseDto> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const room = await this.adminService.createRoom(
      request.user.usersType,
      createRoomDto,
    );

    return this.adminService.createRoomResponse(room);
  }
}
