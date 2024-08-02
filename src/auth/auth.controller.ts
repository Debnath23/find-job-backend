import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from 'src/dto/login.dto';
import { UsersResponseDto } from 'src/dto/usersResponse.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/createUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UsersResponseDto> {
    const user = await this.authService.createUser(createUserDto);

    return this.authService.buildAuthResponse(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<UsersResponseDto> {
    const user = await this.authService.login(loginDto);

    return this.authService.buildAuthResponse(user);
  }
}
