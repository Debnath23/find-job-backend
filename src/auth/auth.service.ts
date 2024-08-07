import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { Model } from 'mongoose';
import { LoginDto } from '../dto/login.dto';
import { UsersResponseDto } from '../dto/usersResponse.dto';
import { UsersEntity } from '../entities/users.entity';
import { CreateUserDto } from '../dto/createUser.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UsersEntity.name) private usersModel: Model<UsersEntity>,
    private jwtService: JwtService,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UsersEntity> {
    const user = await this.usersModel.findOne({
      $or: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ]
    });

    if (user) {
      throw new HttpException(
        'Username or Email is already taken',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const createdUser = new this.usersModel(createUserDto);
    return createdUser.save();
  }

  async login(@Body() loginDto: LoginDto): Promise<UsersEntity> {
    const user = await this.usersModel
      .findOne({ email: loginDto.email })
      .select('+password');

    if (!user) {
      throw new HttpException(
        'User is not found!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isPasswordCorrect = await compare(loginDto.password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(
        'Invalid Password!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    return user;
  }

  async buildAuthResponse(usersEntity: UsersEntity): Promise<UsersResponseDto> {
    return {
      username: usersEntity.username,
      email: usersEntity.email,
      usersType: usersEntity.usersType,
      applyFor: [],
      token: this.generateJwt(usersEntity),
    };
  }

  generateJwt(usersEntity: UsersEntity): string {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT Secret is not defined');
      }

      return this.jwtService.sign({ email: usersEntity.email }, { secret });
    } catch (error) {
      console.error('Error generating JWT:', error.message);
      throw new Error('Error generating JWT');
    }
  }

  async validateUserByEmail(email: string): Promise<UsersEntity | null> {
    return this.usersModel.findOne({ email });
  }

  async findByEmail(email: string): Promise<UsersEntity> {
    return this.usersModel.findOne({ email });
  }
}
