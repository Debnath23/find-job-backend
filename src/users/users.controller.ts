import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  UploadedFile,
  UseGuards,
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
import { JwtAuthGuard } from '../guards/jwt.guard';
import { User } from '../decorators/user.decorator';
import { UsersEntity } from '../entities/users.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  // @UseGuards(JwtAuthGuard)
  async currentUser(
    @User() user: UsersEntity
  ): Promise<UsersResponseDto> {
    return this.usersService.buildUserResponse(user);
  }

  @Post('applyFor')
  // @UseGuards(JwtAuthGuard)
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
