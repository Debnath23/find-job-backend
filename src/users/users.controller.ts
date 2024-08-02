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
import { UsersService } from './users.service';
import { ExpressRequest } from '../middlewares/auth.middleware';
import {
  ApplyForDto,
  UsersResponseDto,
} from '../dto/usersResponse.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
