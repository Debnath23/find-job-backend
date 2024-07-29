import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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

  // @Post('schedule-meeting')
  // async scheduleMeeting(
  //   @Request() request: ExpressRequest,
  //   @Body() scheduleMeetingDto: ScheduledMeetingDto,
  // ): Promise<UsersResponseDto> {
  //   if (
  //     !request.user ||
  //     !Array.isArray(request.user.applyFor) ||
  //     request.user.applyFor.length === 0
  //   ) {
  //     throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  //   }

  //   const userId = request.user.applyFor[0]._id.toString();

  //   try {
  //     const user = await this.usersService.scheduledMeeting(
  //       userId,
  //       scheduleMeetingDto,
  //     );

  //     return this.usersService.buildUserResponse(user);
  //   } catch (error) {
  //     throw new HttpException(
  //       'Internal Server Error',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
}
