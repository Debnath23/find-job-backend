import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/createUser.dto';
import { UsersService } from './users.service';
import { UsersResponseType } from '../types/usersResponse.type';
import { LoginDto } from '../dto/login.dto';
import { ExpressRequest } from '../middlewares/auth.middleware';
import { ApplyForDto, UsersResponseDto } from '../dto/usersResponse.dto';

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
  async applyFor(@Request() request: ExpressRequest, @Body() applyForDto: ApplyForDto): Promise<UsersResponseDto> {
    if (!request.user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.usersService.applyForJob(request.user.username, applyForDto);

    return this.usersService.buildUserResponse(user);
  }
}
