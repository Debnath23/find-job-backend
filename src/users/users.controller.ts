import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { UsersService } from './users.service';
import { LoginDto } from '../dto/login.dto';
import { ExpressRequest } from '../middlewares/auth.middleware';
import {
  ApplyForDto,
  ScheduledMeetingDto,
  UsersResponseDto,
} from '../dto/usersResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersEntity } from './users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // TODO: Get user applyJobId, Update applicationStatus

  @Post()
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UsersResponseDto> {
    const user = await this.usersService.createUser(createUserDto);

    return this.usersService.buildUserResponse(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<UsersResponseDto> {
    const user = await this.usersService.loginUser(loginDto);

    return this.usersService.buildUserResponse(user);
  }

  @Get()
  async currentUser(
    @Request() request: ExpressRequest,
  ): Promise<UsersResponseDto> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return this.usersService.buildUserResponse(request.user);
  }

  @Post('applyFor')
  @UseInterceptors(
    FileInterceptor('attachments', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async applyFor(
    @Request() request: ExpressRequest,
    @Body() applyForDto: ApplyForDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UsersResponseDto> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!file) {
      throw new HttpException(
        'Attachment file is required.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    applyForDto.attachments = file.path;

    const user = await this.usersService.applyForJob(
      request.user.username,
      applyForDto,
    );

    return this.usersService.buildUserResponse(user);
  }

  @Post('schedule-meeting/:username/:jobId')
  async scheduleMeeting(
    @Param('jobId') jobId: string,
    @Param('username') username: string,
    @Body() scheduleMeetingDto: ScheduledMeetingDto,
  ): Promise<UsersResponseDto> {
    try {
      const updatedUser: UsersEntity = await this.usersService.scheduledMeeting(
        jobId,
        username,
        scheduleMeetingDto,
      );

      return this.usersService.buildUserResponse(updatedUser);
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
  ): Promise<UsersResponseDto> {
    try {
      const updatedUser: UsersEntity = await this.usersService.updateApplicationStatus(
        username,
        role,
        applyForDto,
      );

      return this.usersService.buildUserResponse(updatedUser);
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

    const users = await this.usersService.getAllUsersDetails();

    return users;
  }
}
