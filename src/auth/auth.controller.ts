import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UsersResponseDto } from '../dto/usersResponse.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../dto/createUser.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // TODO: update loginResponse
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
